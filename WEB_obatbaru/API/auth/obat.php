<?php
// JANGAN ADA APAPUN DI ATAS BARIS INI

header('Content-Type: application/json; charset=utf-8');
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET");
header("Access-Control-Allow-Headers: Content-Type");

ini_set('display_errors', 0); // ubah ke 1 untuk debugging lokal (sementara)
ini_set('display_startup_errors', 0);
error_reporting(E_ALL);

ini_set('log_errors', 1);
$errorLog = __DIR__ . '/../../error.log';
if (!is_dir(dirname($errorLog)) || !is_writable(dirname($errorLog))) {
    $errorLog = sys_get_temp_dir() . '/php_error_obat.log';
}
ini_set('error_log', $errorLog);

try {
    // -------------- sesuaikan path supabase.php di sini --------------
    $supabaseCandidates = [
        __DIR__ . '/../config/supabase.php',
    ];
    $supabaseFile = null;
    foreach ($supabaseCandidates as $f) {
        if (file_exists($f)) { $supabaseFile = $f; break; }
    }
    if (!$supabaseFile) {
        throw new Exception('supabase.php tidak ditemukan. Cek path: ' . implode(', ', $supabaseCandidates));
    }
    require_once $supabaseFile;

    if (!function_exists('supabase')) {
        throw new Exception('Function supabase() tidak tersedia di supabase.php');
    }

    // --- SELECT semua field utama + relasi detail_obat ---
    $select = "id_obat,nama_obat,bentuk_obat,harga_jual,id_jenis_obat,jenis_obat(nama_jenis),detail_obat(id_detail_obat,tanggal_expired,stock,harga_jual,is_deleted)";

    $rows = supabase('GET', 'obat', $select);

    if (!is_array($rows)) {
        // jika supabase mengembalikan error atau string, catat dan lempar
        error_log('supabase returned non-array: ' . json_encode($rows));
        throw new Exception('Gagal mengambil data dari Supabase. Cek log server.');
    }

    // flatten: satu entry per detail_obat
    $medicines = [];
    foreach ($rows as $r) {
        $idObat = $r['id_obat'] ?? ($r['id'] ?? null);
        $nama = $r['nama_obat'] ?? ($r['nama'] ?? '');
        $bentuk = $r['bentuk_obat'] ?? $r['bentuk'] ?? '-';

        // nama jenis (ambil elemen pertama dari relasi)
        $jenisNama = '-';
        if (!empty($r['jenis_obat']) && is_array($r['jenis_obat'])) {
            $firstJenis = $r['jenis_obat'][0] ?? null;
            if ($firstJenis) {
                $jenisNama = $firstJenis['nama_jenis'] ?? $firstJenis['name'] ?? $firstJenis['nama'] ?? '-';
            }
        }

        // jika ada detail_obat, buat satu row per detail
        if (!empty($r['detail_obat']) && is_array($r['detail_obat'])) {
            foreach ($r['detail_obat'] as $d) {
                // abaikan yang dihapus
                $isDeleted = null;
                if (isset($d['is_deleted'])) {
                    $isDeleted = filter_var($d['is_deleted'], FILTER_VALIDATE_BOOLEAN, FILTER_NULL_ON_FAILURE);
                }
                if ($isDeleted === true) continue;

                $expired = $d['tanggal_expired'] ?? null;
                $stock = isset($d['stock']) ? (int)$d['stock'] : 0;

                // harga: prioritas detail_obat.harga_jual, kalau nggak ada pakai obat.harga_jual
                $harga = null;
                if (isset($d['harga_jual'])) {
                    $harga = is_numeric($d['harga_jual']) ? (float)$d['harga_jual'] : $d['harga_jual'];
                } elseif (isset($r['harga_jual'])) {
                    $harga = is_numeric($r['harga_jual']) ? (float)$r['harga_jual'] : $r['harga_jual'];
                }

                $medicines[] = [
                    'id_obat' => (string)$idObat,
                    'id_detail' => $d['id_detail_obat'] ?? null,
                    'nama_obat' => $nama,
                    'bentuk_obat' => $bentuk,
                    'jenis' => $jenisNama,
                    'harga' => $harga,
                    'stock' => $stock,
                    'expired_date' => $expired
                ];
            }
        } else {
            // opsional: jika obat tidak punya detail_obat (masih muncul di UI),
            // kita bisa memasukkan baris dengan stock 0 / expired null
            $hargaFallback = isset($r['harga_jual']) ? (is_numeric($r['harga_jual']) ? (float)$r['harga_jual'] : $r['harga_jual']) : null;
            $medicines[] = [
                'id_obat' => (string)$idObat,
                'id_detail' => null,
                'nama_obat' => $nama,
                'bentuk_obat' => $bentuk,
                'jenis' => $jenisNama,
                'harga' => $hargaFallback,
                'stock' => 0,
                'expired_date' => null
            ];
        }
    }

    // Sukses: keluarkan JSON hasil
    http_response_code(200);
    echo json_encode([
        'success' => true,
        'data' => $medicines,
        'total' => count($medicines),
        'message' => 'Data obat-detail berhasil (satu baris per detail_obat).'
    ], JSON_UNESCAPED_UNICODE);

    exit(0);

} catch (Exception $e) {
    
    error_log('obat.php (supabase) error: ' . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'data' => [],
        'message' => 'Error: ' . $e->getMessage()
    ], JSON_UNESCAPED_UNICODE);
    exit(1);
}
