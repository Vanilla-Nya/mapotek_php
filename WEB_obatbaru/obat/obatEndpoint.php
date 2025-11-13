<?php
header('Content-Type: application/json; charset=utf-8');
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

// Handle preflight OPTIONS
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

ini_set('display_errors', 0);
ini_set('log_errors', 1);
ini_set('error_log', __DIR__ . '/../../error.log');

require_once __DIR__ . '/../API/config/supabase.php';
require_once __DIR__ . '/../API/auth/obatService.php';

// Manual: Mulai session untuk mengakses data login dokter (sebagai fallback)
session_start();

try {
    $service = new ObatService('supabase');
    $method = $_SERVER['REQUEST_METHOD'];

    switch ($method) {
        // === 🟢 GET: Ambil data ===
        case 'GET':
            $action = $_GET['action'] ?? 'get_obat';
            
            switch ($action) {
                case 'get_jenis':
                    $result = [
                        'success' => true,
                        'data' => $service->getAllJenisObat(),
                        'message' => 'Data jenis obat berhasil diambil'
                    ];
                    break;

                case 'get_bentuk':
                    // ====== PENANGANAN KHUSUS UNTUK BENTUK_OBAT (ENUM / DISTINCT) ======
                    $data = [];

                    // 1) Coba via service jika method ada dan bekerja
                    try {
                        if (method_exists($service, 'getAllBentukObat')) {
                            $data = $service->getAllBentukObat();
                            // pastikan array
                            if (!is_array($data)) $data = [];
                        }
                    } catch (Exception $e) {
                        // ignore, akan coba fallback
                        error_log('getAllBentukObat service error: ' . $e->getMessage());
                        $data = [];
                    }

                    // 2) Jika kosong, coba panggil RPC get_bentuk_obat_enum di Supabase (ENUM)
                    if (empty($data)) {
                        try {
                            // Asumsi wrapper supabase: call_user_func('supabase', $method, $path, $bodyOrSelect?)
                            $rpcRows = call_user_func('supabase', 'POST', 'rpc/get_bentuk_obat_enum');

                            // Normalisasi hasil RPC ke array string
                            $enumVals = [];
                            if (is_array($rpcRows)) {
                                foreach ($rpcRows as $row) {
                                    // Beberapa bentuk return: { "get_bentuk_obat_enum":"Tablet" } 
                                    // atau { "bentuk":"Tablet" } atau plain value index 0
                                    if (isset($row['get_bentuk_obat_enum'])) {
                                        $enumVals[] = $row['get_bentuk_obat_enum'];
                                    } elseif (isset($row['bentuk'])) {
                                        $enumVals[] = $row['bentuk'];
                                    } else {
                                        // ambil value pertama
                                        $vals = array_values($row);
                                        if (isset($vals[0])) $enumVals[] = $vals[0];
                                    }
                                }
                            }

                            // filter dan unique
                            $enumVals = array_values(array_filter(array_map('trim', $enumVals), function($v){ return $v !== ''; }));
                            $enumVals = array_values(array_unique($enumVals));

                            if (!empty($enumVals)) $data = $enumVals;
                        } catch (Exception $e) {
                            error_log('RPC get_bentuk_obat_enum error: ' . $e->getMessage());
                        }
                    }

                    // 3) Jika masih kosong, fallback: ambil distinct bentuk_obat dari tabel obat
                    if (empty($data)) {
                        try {
                            // Ambil semua baris bentuk_obat (akan kita jadikan unique di PHP)
                            // Perhatikan: supabase GET 'obat?select=bentuk_obat' mengembalikan array rows
                            $rows = call_user_func('supabase', 'GET', 'obat?select=bentuk_obat');

                            $vals = [];
                            if (is_array($rows)) {
                                foreach ($rows as $r) {
                                    if (isset($r['bentuk_obat'])) {
                                        $v = trim($r['bentuk_obat']);
                                        if ($v !== '') $vals[] = $v;
                                    }
                                }
                            }
                            $vals = array_values(array_unique($vals));
                            if (!empty($vals)) $data = $vals;
                        } catch (Exception $e) {
                            error_log('Fallback distinct obat.bentuk_obat error: ' . $e->getMessage());
                        }
                    }

                    // Final: jika tetap kosong, kembalikan array kosong dengan pesan
                    $result = [
                        'success' => true,
                        'data' => $data,
                        'message' => empty($data) ? 'Tidak terdapat daftar bentuk obat (kosong).' : 'Data bentuk obat berhasil diambil'
                    ];
                    break;

                default:
                    $data = $service->getAllObatData();
                    $result = [
                        'success' => true,
                        'data' => $data,
                        'total' => count($data),
                        'message' => 'Data obat berhasil diambil'
                    ];
                    break;
            }
            break;

        // === 🟠 POST: Tambah data ===
        case 'POST':
            $payload = json_decode(file_get_contents('php://input'), true);
            if (!$payload) {
                throw new Exception('Input JSON tidak valid');
            }

            error_log('📥 Received payload: ' . json_encode($payload));

            // ✅ PRIORITAS 1: Ambil id_dokter dari payload (dikirim dari frontend)
            $id_dokter = $payload['id_dokter'] ?? null;
            
            error_log('🔍 ID Dokter from payload: ' . ($id_dokter ?? 'NULL'));
            
            // ✅ PRIORITAS 2: Jika tidak ada, coba dari session (fallback)
            if (!$id_dokter) {
                error_log('⚠️ No id_dokter in payload, checking session...');
                
                if (isset($_SESSION['dokter']) && isset($_SESSION['dokter']['id_dokter'])) {
                    // Dari login.php pertama
                    $id_dokter = $_SESSION['dokter']['id_dokter'];
                    error_log('✅ Found in $_SESSION[dokter][id_dokter]');
                } elseif (isset($_SESSION['user_id'])) {
                    // Dari login.php kedua
                    $id_dokter = $_SESSION['user_id'];
                    error_log('✅ Found in $_SESSION[user_id]');
                } elseif (isset($_SESSION['dokter']) && isset($_SESSION['dokter']['id'])) {
                    // Dari auth.php
                    $id_dokter = $_SESSION['dokter']['id'];
                    error_log('✅ Found in $_SESSION[dokter][id]');
                }
            }

            // ✅ Tambahkan id_dokter ke payload
            if ($id_dokter) {
                $payload['id_dokter'] = $id_dokter;
                error_log("✅ Final ID Dokter: " . $id_dokter);
            } else {
                // Jika tidak ada sama sekali, kembalikan error
                error_log('❌ No id_dokter found anywhere!');
                throw new Exception('ID Dokter tidak ditemukan. Silakan login ulang.');
            }

            $action = $payload['action'] ?? 'add_obat';
            
            error_log('🎯 Action: ' . $action);
            
            switch ($action) {
                case 'add_jenis':
                    $namaJenis = trim($payload['nama_jenis'] ?? '');
                    $result = $service->addJenisObat($namaJenis);
                    break;

                case 'add_obat':
                    error_log('📤 Calling addObat with payload: ' . json_encode($payload));
                    $result = $service->addObat($payload);
                    error_log('📥 addObat result: ' . json_encode($result));
                    break;

                default:
                    throw new Exception('Action tidak dikenal: ' . $action);
            }
            break;

        // === 🔴 Method lain tidak diizinkan ===
        default:
            http_response_code(405);
            $result = [
                'success' => false,
                'message' => 'Method tidak diizinkan: ' . $method
            ];
            break;
    }

    echo json_encode($result, JSON_UNESCAPED_UNICODE);

} catch (Exception $e) {
    error_log('❌ obatEndpoint error: ' . $e->getMessage());
    error_log('❌ Stack trace: ' . $e->getTraceAsString());
    
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage(),
        'error' => $e->getMessage()
    ], JSON_UNESCAPED_UNICODE);
}