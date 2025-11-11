<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once __DIR__ . '/config/supabase.php';

// Get the action from query parameter
$action = $_GET['action'] ?? '';

// Get id_dokter from session or query parameter
session_start();

// Try to get from session first
$id_dokter = $_SESSION['id_dokter'] ?? null;

// If not in session, try from query parameter
if (!$id_dokter && isset($_GET['dokter_id'])) {
    $id_dokter = $_GET['dokter_id'];
}

// If still not found, try from POST body
if (!$id_dokter) {
    $input = json_decode(file_get_contents('php://input'), true);
    $id_dokter = $input['id_dokter'] ?? null;
}

if (!$id_dokter) {
    error_log("❌ PEMBUKUAN API: No doctor ID found");
    
    echo json_encode([
        'success' => false,
        'message' => 'Unauthorized - No dokter ID found'
    ]);
    exit();
}

error_log("✅ PEMBUKUAN API: Doctor ID found: $id_dokter, Action: $action");

switch ($action) {
    case 'get_pembukuan':
        getPembukuan($id_dokter);
        break;
    
    case 'add_transaksi':
        addTransaksi($id_dokter);
        break;
    
    case 'get_summary':
        getSummary($id_dokter);
        break;
    
    case 'filter_pembukuan':
        filterPembukuan($id_dokter);
        break;
    
    case 'delete_transaksi':
        deleteTransaksi($id_dokter);
        break;
    
    case 'get_detail_transaksi':
        getDetailTransaksi($id_dokter);
        break;
    
    default:
        echo json_encode([
            'success' => false,
            'message' => 'Invalid action'
        ]);
}

/**
 * Get all pembukuan data (pemasukan + pengeluaran) - GROUPED BY DATE
 */
function getPembukuan($id_dokter) {
    try {
        // Get pemasukan
        $pemasukan = supabase('GET', 'pemasukan', 
            "id_dokter=eq.$id_dokter&select=*&order=created_at.desc"
        );
        
        // Get pengeluaran with detail
        $pengeluaran = supabase('GET', 'pengeluaran', 
            "id_dokter=eq.$id_dokter&select=*,pengeluaran_detail(*)&order=created_at.desc"
        );
        
        // Group by date
        $groupedByDate = [];
        
        // Process pemasukan - group by date
        if (!isset($pemasukan['error']) && is_array($pemasukan)) {
            foreach ($pemasukan as $item) {
                $tanggal = $item['created_at'] ? date('Y-m-d', strtotime($item['created_at'])) : date('Y-m-d');
                
                if (!isset($groupedByDate[$tanggal])) {
                    $groupedByDate[$tanggal] = [
                        'tanggal' => $tanggal,
                        'pemasukan' => 0,
                        'pengeluaran' => 0,
                        'created_at' => $item['created_at']
                    ];
                }
                
                $groupedByDate[$tanggal]['pemasukan'] += floatval($item['total'] ?? 0);
            }
        }
        
        // Process pengeluaran - group by date
        if (!isset($pengeluaran['error']) && is_array($pengeluaran)) {
            foreach ($pengeluaran as $item) {
                $tanggal = $item['tanggal'] ?? date('Y-m-d');
                
                if (!isset($groupedByDate[$tanggal])) {
                    $groupedByDate[$tanggal] = [
                        'tanggal' => $tanggal,
                        'pemasukan' => 0,
                        'pengeluaran' => 0,
                        'created_at' => $item['created_at'] ?? ($tanggal . 'T00:00:00Z')
                    ];
                }
                
                // Calculate total from detail if exists
                $total = 0;
                if (isset($item['pengeluaran_detail']) && is_array($item['pengeluaran_detail'])) {
                    foreach ($item['pengeluaran_detail'] as $detail) {
                        $total += floatval($detail['jumlah'] ?? 0) * floatval($detail['harga'] ?? 0);
                    }
                }
                
                $groupedByDate[$tanggal]['pengeluaran'] += $total;
            }
        }
        
        // Convert to array and sort by date
        $dailySummary = array_values($groupedByDate);
        usort($dailySummary, function($a, $b) {
            return strtotime($a['tanggal']) - strtotime($b['tanggal']);
        });
        
        // Calculate running balance
        $saldo = 0;
        foreach ($dailySummary as &$day) {
            $saldo += $day['pemasukan'] - $day['pengeluaran'];
            $day['saldo'] = $saldo;
        }
        
        echo json_encode([
            'success' => true,
            'data' => $dailySummary
        ]);
        
    } catch (Exception $e) {
        echo json_encode([
            'success' => false,
            'message' => $e->getMessage()
        ]);
    }
}

/**
 * Add new transaction
 */
function addTransaksi($id_dokter) {
    try {
        $input = json_decode(file_get_contents('php://input'), true);
        
        $tipe = $input['tipe'] ?? '';
        $tanggal = $input['tanggal'] ?? date('Y-m-d');
        $judul = $input['judul'] ?? '';
        $deskripsi = $input['deskripsi'] ?? '';
        $total = floatval($input['total'] ?? 0);
        
        error_log("📝 Adding transaction: type=$tipe, total=$total, dokter=$id_dokter");
        
        if (empty($tipe) || empty($judul) || $total <= 0) {
            echo json_encode([
                'success' => false,
                'message' => 'Data tidak lengkap'
            ]);
            return;
        }
        
        if ($tipe === 'pemasukan') {
            // For manual entries, we DON'T set id_antrian at all
            $data = [
                'id_dokter' => $id_dokter,
                'total' => $total,
                'metode_pembayaran' => 'MANUAL',
                'jenis_pemasukan' => $judul,
                'deskripsi' => $deskripsi,
                'created_at' => $tanggal . 'T' . date('H:i:s') . 'Z'  // ISO 8601 format
            ];
            
            error_log("💰 Inserting pemasukan (manual): " . json_encode($data));
            
            $result = supabase('POST', 'pemasukan', '', $data);
            
        } else {
            // Insert to pengeluaran table
            $data = [
                'id_dokter' => $id_dokter,
                'keterangan' => $judul,
                'tanggal' => $tanggal,
                'created_at' => $tanggal . 'T' . date('H:i:s') . 'Z',  // ISO 8601 format
                'updated_at' => date('Y-m-d\TH:i:s\Z')  // ISO 8601 format
            ];
            
            error_log("💸 Inserting pengeluaran: " . json_encode($data));
            
            $result = supabase('POST', 'pengeluaran', '', $data);
            
            // If pengeluaran created successfully, add detail
            if (!isset($result['error']) && isset($result[0]['id_pengeluaran'])) {
                $id_pengeluaran = $result[0]['id_pengeluaran'];
                
                // Insert detail
                $detailData = [
                    'id_pengeluaran' => $id_pengeluaran,
                    'jumlah' => 1,
                    'harga' => $total
                ];
                
                error_log("📋 Inserting pengeluaran detail: " . json_encode($detailData));
                
                supabase('POST', 'pengeluaran_detail', '', $detailData);
            }
        }
        
        if (isset($result['error'])) {
            error_log("❌ Supabase error: " . json_encode($result));
            echo json_encode([
                'success' => false,
                'message' => 'Database error: ' . ($result['message'] ?? 'Unknown error'),
                'details' => $result['error']
            ]);
        } else {
            error_log("✅ Transaction saved successfully");
            echo json_encode([
                'success' => true,
                'message' => 'Transaksi berhasil disimpan',
                'data' => $result
            ]);
        }
        
    } catch (Exception $e) {
        error_log("❌ Exception in addTransaksi: " . $e->getMessage());
        echo json_encode([
            'success' => false,
            'message' => $e->getMessage()
        ]);
    }
}

/**
 * Get summary (total pemasukan, pengeluaran, profit)
 */
function getSummary($id_dokter) {
    try {
        $startDate = $_GET['start_date'] ?? null;
        $endDate = $_GET['end_date'] ?? null;
        
        $dateFilter = '';
        if ($startDate && $endDate) {
            $dateFilter = "&created_at=gte.$startDate&created_at=lte.$endDate";
        }
        
        // Get total pemasukan
        $pemasukan = supabase('GET', 'pemasukan', 
            "id_dokter=eq.$id_dokter&select=total$dateFilter"
        );
        
        $totalPemasukan = 0;
        if (!isset($pemasukan['error']) && is_array($pemasukan)) {
            foreach ($pemasukan as $item) {
                $totalPemasukan += floatval($item['total'] ?? 0);
            }
        }
        
        // Get total pengeluaran
        $pengeluaran = supabase('GET', 'pengeluaran', 
            "id_dokter=eq.$id_dokter&select=pengeluaran_detail(jumlah,harga)$dateFilter"
        );
        
        $totalPengeluaran = 0;
        if (!isset($pengeluaran['error']) && is_array($pengeluaran)) {
            foreach ($pengeluaran as $item) {
                if (isset($item['pengeluaran_detail']) && is_array($item['pengeluaran_detail'])) {
                    foreach ($item['pengeluaran_detail'] as $detail) {
                        $totalPengeluaran += floatval($detail['jumlah'] ?? 0) * floatval($detail['harga'] ?? 0);
                    }
                }
            }
        }
        
        $totalProfit = $totalPemasukan - $totalPengeluaran;
        
        echo json_encode([
            'success' => true,
            'data' => [
                'total_pemasukan' => $totalPemasukan,
                'total_pengeluaran' => $totalPengeluaran,
                'total_profit' => $totalProfit
            ]
        ]);
        
    } catch (Exception $e) {
        echo json_encode([
            'success' => false,
            'message' => $e->getMessage()
        ]);
    }
}

/**
 * ⭐ FIXED VERSION - Filter pembukuan by date range - GROUPED BY DATE
 * Uses ISO 8601 datetime format for Supabase compatibility
 */
function filterPembukuan($id_dokter) {
    try {
        $startDate = $_GET['start_date'] ?? null;
        $endDate = $_GET['end_date'] ?? null;
        
        error_log("🔍 FILTER: start=$startDate, end=$endDate, dokter=$id_dokter");
        
        if (!$startDate || !$endDate) {
            echo json_encode([
                'success' => false,
                'message' => 'Tanggal tidak lengkap'
            ]);
            return;
        }
        
        // ⭐ FIX: Use ISO 8601 format (YYYY-MM-DDTHH:MM:SSZ) for Supabase
        $startDateTime = $startDate . 'T00:00:00Z';
        $endDateTime = $endDate . 'T23:59:59Z';
        
        error_log("📅 Using ISO format: start=$startDateTime, end=$endDateTime");
        
        // Get filtered pemasukan
        $pemasukanQuery = "id_dokter=eq.$id_dokter&created_at=gte.$startDateTime&created_at=lte.$endDateTime&select=*&order=created_at.desc";
        $pemasukan = supabase('GET', 'pemasukan', $pemasukanQuery);
        
        // Get filtered pengeluaran
        $pengeluaranQuery = "id_dokter=eq.$id_dokter&tanggal=gte.$startDate&tanggal=lte.$endDate&select=*,pengeluaran_detail(*)&order=tanggal.desc";
        $pengeluaran = supabase('GET', 'pengeluaran', $pengeluaranQuery);
        
        // Group by date
        $groupedByDate = [];
        
        // Process pemasukan - group by date
        if (!isset($pemasukan['error']) && is_array($pemasukan)) {
            foreach ($pemasukan as $item) {
                $tanggal = $item['created_at'] ? date('Y-m-d', strtotime($item['created_at'])) : date('Y-m-d');
                
                if (!isset($groupedByDate[$tanggal])) {
                    $groupedByDate[$tanggal] = [
                        'tanggal' => $tanggal,
                        'pemasukan' => 0,
                        'pengeluaran' => 0,
                        'created_at' => $item['created_at']
                    ];
                }
                
                $groupedByDate[$tanggal]['pemasukan'] += floatval($item['total'] ?? 0);
            }
        }
        
        // Process pengeluaran - group by date
        if (!isset($pengeluaran['error']) && is_array($pengeluaran)) {
            foreach ($pengeluaran as $item) {
                $tanggal = $item['tanggal'] ?? date('Y-m-d');
                
                if (!isset($groupedByDate[$tanggal])) {
                    $groupedByDate[$tanggal] = [
                        'tanggal' => $tanggal,
                        'pemasukan' => 0,
                        'pengeluaran' => 0,
                        'created_at' => $item['created_at'] ?? ($tanggal . 'T00:00:00Z')
                    ];
                }
                
                // Calculate total from detail
                $total = 0;
                if (isset($item['pengeluaran_detail']) && is_array($item['pengeluaran_detail'])) {
                    foreach ($item['pengeluaran_detail'] as $detail) {
                        $total += floatval($detail['jumlah'] ?? 0) * floatval($detail['harga'] ?? 0);
                    }
                }
                
                $groupedByDate[$tanggal]['pengeluaran'] += $total;
            }
        }
        
        // Convert to array and sort by date
        $dailySummary = array_values($groupedByDate);
        usort($dailySummary, function($a, $b) {
            return strtotime($a['tanggal']) - strtotime($b['tanggal']);
        });
        
        // Calculate running balance
        $saldo = 0;
        foreach ($dailySummary as &$day) {
            $saldo += $day['pemasukan'] - $day['pengeluaran'];
            $day['saldo'] = $saldo;
        }
        
        error_log("✅ Filter completed. Total days: " . count($dailySummary));
        
        echo json_encode([
            'success' => true,
            'data' => $dailySummary,
            'debug' => [
                'start_date' => $startDate,
                'end_date' => $endDate,
                'pemasukan_count' => is_array($pemasukan) && !isset($pemasukan['error']) ? count($pemasukan) : 0,
                'pengeluaran_count' => is_array($pengeluaran) && !isset($pengeluaran['error']) ? count($pengeluaran) : 0,
                'total_days' => count($dailySummary)
            ]
        ]);
        
    } catch (Exception $e) {
        error_log("❌ Filter error: " . $e->getMessage());
        echo json_encode([
            'success' => false,
            'message' => $e->getMessage()
        ]);
    }
}

/**
 * Delete transaction
 */
function deleteTransaksi($id_dokter) {
    try {
        $input = json_decode(file_get_contents('php://input'), true);
        
        $id = $input['id'] ?? '';
        $jenis = $input['jenis'] ?? '';
        
        if (empty($id) || empty($jenis)) {
            echo json_encode([
                'success' => false,
                'message' => 'Data tidak lengkap'
            ]);
            return;
        }
        
        if ($jenis === 'Pemasukan') {
            $result = supabase('DELETE', 'pemasukan', 
                "id_pemasukan=eq.$id&id_dokter=eq.$id_dokter"
            );
        } else {
            // Delete detail first
            supabase('DELETE', 'pengeluaran_detail', 
                "id_pengeluaran=eq.$id"
            );
            
            // Then delete pengeluaran
            $result = supabase('DELETE', 'pengeluaran', 
                "id_pengeluaran=eq.$id&id_dokter=eq.$id_dokter"
            );
        }
        
        echo json_encode([
            'success' => true,
            'message' => 'Transaksi berhasil dihapus'
        ]);
        
    } catch (Exception $e) {
        echo json_encode([
            'success' => false,
            'message' => $e->getMessage()
        ]);
    }
}

/**
 * Get transaction details for a specific date
 */
function getDetailTransaksi($id_dokter) {
    try {
        $tanggal = $_GET['tanggal'] ?? null;
        
        if (!$tanggal) {
            echo json_encode([
                'success' => false,
                'message' => 'Tanggal tidak ditemukan'
            ]);
            return;
        }
        
        error_log("📋 Getting details for date: $tanggal, dokter: $id_dokter");
        
        $allDetails = [];
        
        // Get pemasukan details for this date
        $pemasukanQuery = "id_dokter=eq.$id_dokter&select=*&created_at=gte.{$tanggal}T00:00:00Z&created_at=lte.{$tanggal}T23:59:59Z&order=created_at.desc";
        $pemasukan = supabase('GET', 'pemasukan', $pemasukanQuery);
        
        if (!isset($pemasukan['error']) && is_array($pemasukan)) {
            foreach ($pemasukan as $item) {
                $allDetails[] = [
                    'deskripsi' => $item['jenis_pemasukan'] ?? 'Pemasukan',
                    'detail' => $item['deskripsi'] ?? '-',
                    'total' => floatval($item['total'] ?? 0),
                    'jenis' => 'Pemasukan',
                    'created_at' => $item['created_at']
                ];
            }
        }
        
        // Get pengeluaran details for this date
        $pengeluaranQuery = "id_dokter=eq.$id_dokter&tanggal=eq.$tanggal&select=*,pengeluaran_detail(*)&order=created_at.desc";
        $pengeluaran = supabase('GET', 'pengeluaran', $pengeluaranQuery);
        
        if (!isset($pengeluaran['error']) && is_array($pengeluaran)) {
            foreach ($pengeluaran as $item) {
                // Calculate total from detail
                $total = 0;
                if (isset($item['pengeluaran_detail']) && is_array($item['pengeluaran_detail'])) {
                    foreach ($item['pengeluaran_detail'] as $detail) {
                        $total += floatval($detail['jumlah'] ?? 0) * floatval($detail['harga'] ?? 0);
                    }
                }
                
                $allDetails[] = [
                    'deskripsi' => $item['keterangan'] ?? 'Pengeluaran',
                    'detail' => $item['keterangan'] ?? '-',
                    'total' => $total,
                    'jenis' => 'Pengeluaran',
                    'created_at' => $item['created_at']
                ];
            }
        }
        
        // Sort by created_at
        usort($allDetails, function($a, $b) {
            return strtotime($b['created_at']) - strtotime($a['created_at']);
        });
        
        echo json_encode([
            'success' => true,
            'data' => $allDetails,
            'tanggal' => $tanggal
        ]);
        
    } catch (Exception $e) {
        error_log("❌ Error getting detail: " . $e->getMessage());
        echo json_encode([
            'success' => false,
            'message' => $e->getMessage()
        ]);
    }
}
?>