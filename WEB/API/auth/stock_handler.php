<?php
header('Content-Type: application/json; charset=utf-8');
header("Access-Control-Allow-Origin: *");

require_once(__DIR__ . '/config/supabase.php');

/**
 * Process drug stock deduction with FIFO (First In First Out) strategy
 * Similar to Java's processDrugStockWithLogging method
 */
function processDrugStock($id_obat, $jumlah, $signa, $id_pemeriksaan) {
    try {
        error_log("🔄 Processing stock for obat: $id_obat, qty: $jumlah");
        
        // 1. Check total available stock
        $totalStock = getTotalStock($id_obat);
        
        if ($totalStock < $jumlah) {
            throw new Exception("Stok tidak mencukupi. Tersedia: $totalStock, Dibutuhkan: $jumlah");
        }
        
        // 2. Get batch details ordered by expiration date (FIFO)
        $batchDetails = getBatchDetails($id_obat);
        
        if (empty($batchDetails)) {
            throw new Exception("Tidak ada batch tersedia untuk obat ID: $id_obat");
        }
        
        // 3. Deduct stock from batches
        $remaining = $jumlah;
        $deductionRecords = [];
        
        foreach ($batchDetails as $batch) {
            if ($remaining <= 0) break;
            
            $batchStock = (int)$batch['stock'];
            $idDetailObat = $batch['id_detail_obat'];
            
            // Calculate how much to deduct from this batch
            $toDeduct = min($batchStock, $remaining);
            
            if ($toDeduct > 0) {
                // 3a. Insert to pemeriksaan_obat
                $insertObatData = [
                    'id_pemeriksaan' => $id_pemeriksaan,
                    'id_obat' => $id_obat,
                    'signa' => $signa,
                    'jumlah' => $toDeduct,
                    'created_at' => date('Y-m-d H:i:s')
                ];
                
                $obatResult = supabase('POST', 'pemeriksaan_obat', '', $insertObatData);
                
                if (!$obatResult || isset($obatResult['error'])) {
                    throw new Exception("Gagal insert pemeriksaan_obat: " . ($obatResult['error'] ?? 'Unknown error'));
                }
                
                error_log("✅ Inserted pemeriksaan_obat: $toDeduct units from batch $idDetailObat");
                
                // 3b. Update stock in detail_obat
                $newStock = $batchStock - $toDeduct;
                $updateStock = supabase(
                    'PATCH',
                    "detail_obat?id_detail_obat=eq.$idDetailObat",
                    '',
                    ['stock' => $newStock]
                );
                
                if (isset($updateStock['error'])) {
                    throw new Exception("Gagal update stock: " . $updateStock['error']);
                }
                
                error_log("✅ Updated batch $idDetailObat stock: $batchStock -> $newStock");
                
                // 3c. Insert to pengurangan_stok (similar to Java trigger)
                $penguranganData = [
                    'id_obat' => $id_obat,
                    'id_detail_obat' => $idDetailObat,
                    'jumlah' => $toDeduct,
                    'created_at' => date('Y-m-d H:i:s')
                ];
                
                $penguranganResult = supabase('POST', 'pengurangan_stok', '', $penguranganData);
                
                if (!$penguranganResult || isset($penguranganResult['error'])) {
                    error_log("⚠️ Warning: Failed to insert pengurangan_stok: " . ($penguranganResult['error'] ?? 'Unknown'));
                }
                
                error_log("✅ Inserted pengurangan_stok: $toDeduct units");
                
                // 3d. Update batch status if stock becomes zero
                if ($newStock <= 0) {
                    supabase(
                        'PATCH',
                        "detail_obat?id_detail_obat=eq.$idDetailObat",
                        '',
                        ['status_batch' => 'habis']
                    );
                    error_log("✅ Batch $idDetailObat marked as 'habis'");
                }
                
                $remaining -= $toDeduct;
                
                $deductionRecords[] = [
                    'id_detail_obat' => $idDetailObat,
                    'deducted' => $toDeduct,
                    'batch_remaining' => $newStock
                ];
            }
        }
        
        if ($remaining > 0) {
            throw new Exception("Gagal mengurangi semua stock. Sisa: $remaining");
        }
        
        error_log("✅ Stock processing completed successfully");
        
        return [
            'success' => true,
            'message' => "Stock berhasil dikurangi: $jumlah units",
            'deductions' => $deductionRecords
        ];
        
    } catch (Exception $e) {
        error_log("❌ Error in processDrugStock: " . $e->getMessage());
        return [
            'success' => false,
            'error' => $e->getMessage()
        ];
    }
}

/**
 * Get total available stock for a medicine
 */
function getTotalStock($id_obat) {
    $query = "detail_obat?id_obat=eq.$id_obat&or=(is_deleted.eq.0,is_deleted.is.null)&tanggal_expired=gt." . date('Y-m-d');
    $result = supabase('GET', $query, 'select=stock');
    
    $total = 0;
    if (is_array($result)) {
        foreach ($result as $batch) {
            $total += (int)($batch['stock'] ?? 0);
        }
    }
    
    return $total;
}

/**
 * Get batch details ordered by expiration date (FIFO)
 */
function getBatchDetails($id_obat) {
    $query = "detail_obat?id_obat=eq.$id_obat&or=(is_deleted.eq.0,is_deleted.is.null)&tanggal_expired=gt." . date('Y-m-d') . "&order=tanggal_expired.asc";
    $result = supabase('GET', $query, 'select=id_detail_obat,stock,tanggal_expired');
    
    return is_array($result) ? $result : [];
}

// ═══════════════════════════════════════════════════════════════════════════
// API ENDPOINT (if called directly)
// ═══════════════════════════════════════════════════════════════════════════

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $data = json_decode(file_get_contents('php://input'), true);
    $action = $data['action'] ?? $_GET['action'] ?? null;
    
    if ($action === 'process_stock') {
        $id_obat = $data['id_obat'] ?? null;
        $jumlah = (int)($data['jumlah'] ?? 0);
        $signa = $data['signa'] ?? '';
        $id_pemeriksaan = $data['id_pemeriksaan'] ?? null;
        
        if (!$id_obat || !$jumlah || !$id_pemeriksaan) {
            echo json_encode([
                'success' => false,
                'error' => 'Missing required fields'
            ]);
            exit;
        }
        
        $result = processDrugStock($id_obat, $jumlah, $signa, $id_pemeriksaan);
        echo json_encode($result);
    }
}
?>