<?php

header('Content-Type: application/json; charset=utf-8');
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// Error handling configuration
ini_set('display_errors', 0);
ini_set('log_errors', 1);
$errorLog = __DIR__ . '/../../error.log';
if (!is_dir(dirname($errorLog)) || !is_writable(dirname($errorLog))) {
    $errorLog = sys_get_temp_dir() . '/php_error_obat.log';
}
ini_set('error_log', $errorLog);

// Start session for id_dokter fallback
session_start();

// ═══════════════════════════════════════════════════════════════════════════
// 🔌 LOAD SUPABASE CONNECTION
// ═══════════════════════════════════════════════════════════════════════════

try {
    $supabasePaths = [
        __DIR__ . '/config/supabase.php',
        __DIR__ . '/../config/supabase.php',
        __DIR__ . '/../../config/supabase.php'
    ];
    
    $supabaseLoaded = false;
    foreach ($supabasePaths as $path) {
        if (file_exists($path)) {
            require_once $path;
            $supabaseLoaded = true;
            error_log("✅ Loaded supabase.php from: $path");
            break;
        }
    }
    
    if (!$supabaseLoaded) {
        throw new Exception('supabase.php tidak ditemukan. Cek path: ' . implode(', ', $supabasePaths));
    }

    if (!function_exists('supabase')) {
        throw new Exception('Function supabase() tidak tersedia di supabase.php');
    }

    // ═══════════════════════════════════════════════════════════════════════
    // 🚦 REQUEST ROUTING
    // ═══════════════════════════════════════════════════════════════════════

    $method = $_SERVER['REQUEST_METHOD'];
    error_log("═══════════════════════════════════════════════════════════");
    error_log("📥 Request: $method " . ($_SERVER['REQUEST_URI'] ?? ''));
    error_log("═══════════════════════════════════════════════════════════");

    // ═══════════════════════════════════════════════════════════════════════
    // 📖 GET REQUESTS HANDLER
    // ═══════════════════════════════════════════════════════════════════════

    if ($method === 'GET') {
        $action = $_GET['action'] ?? 'list';
        error_log("🎯 GET Action: $action");
        
        switch ($action) {
            
            // ═══════════════════════════════════════════════════════════════
            // 📋 GET JENIS OBAT (Medicine Types)
            // ═══════════════════════════════════════════════════════════════
            case 'getJenisObat':
            case 'get_jenis':
                error_log("🔄 Fetching jenis obat...");
                
                try {
                    $result = supabase(
                        'GET',
                        'jenis_obat',
                        'select=id_jenis_obat,nama_jenis_obat'
                    );
                    
                    if (!is_array($result)) {
                        throw new Exception('Gagal mengambil data jenis obat');
                    }
                    
                    error_log("✅ Found " . count($result) . " jenis obat");
                    
                    echo json_encode([
                        'success' => true,
                        'data' => $result,
                        'message' => 'Data jenis obat berhasil diambil'
                    ], JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
                    
                } catch (Exception $e) {
                    error_log("❌ Error getAllJenisObat: " . $e->getMessage());
                    throw $e;
                }
                break;

            // ═══════════════════════════════════════════════════════════════
            // 💊 GET BENTUK OBAT (Medicine Forms - Enum)
            // ═══════════════════════════════════════════════════════════════
            case 'getBentukObat':
            case 'get_bentuk':
                error_log("🔄 Fetching bentuk obat...");
                
                $data = [];

                // METHOD 1: Try RPC function get_bentuk_obat_enum
                try {
                    error_log("🔄 Trying RPC: get_bentuk_obat_enum");
                    $rpcRows = supabase('POST', 'rpc/get_bentuk_obat_enum');

                    $enumVals = [];
                    if (is_array($rpcRows)) {
                        foreach ($rpcRows as $row) {
                            if (isset($row['get_bentuk_obat_enum'])) {
                                $enumVals[] = $row['get_bentuk_obat_enum'];
                            } elseif (isset($row['bentuk'])) {
                                $enumVals[] = $row['bentuk'];
                            } else {
                                $vals = array_values($row);
                                if (isset($vals[0])) $enumVals[] = $vals[0];
                            }
                        }
                    }

                    // Clean and unique
                    $enumVals = array_values(array_filter(array_map('trim', $enumVals), function($v){ 
                        return $v !== ''; 
                    }));
                    $enumVals = array_values(array_unique($enumVals));

                    if (!empty($enumVals)) {
                        $data = $enumVals;
                        error_log("✅ RPC returned " . count($data) . " bentuk");
                    }
                } catch (Exception $e) {
                    error_log("⚠️ RPC failed: " . $e->getMessage());
                }

                // METHOD 2: Fallback - Direct query from obat.bentuk_obat
                if (empty($data)) {
                    try {
                        error_log("🔄 Fallback: Direct query obat.bentuk_obat");
                        $rows = supabase('GET', 'obat', 'select=bentuk_obat');

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
                        if (!empty($vals)) {
                            $data = $vals;
                            error_log("✅ Direct query returned " . count($data) . " bentuk");
                        }
                    } catch (Exception $e) {
                        error_log("⚠️ Direct query failed: " . $e->getMessage());
                    }
                }

                // METHOD 3: Ultimate fallback - Hardcoded common forms
                if (empty($data)) {
                    error_log("⚠️ Using hardcoded fallback");
                    $data = ['Tablet', 'Kapsul', 'Sirup', 'Salep', 'Krim', 'Injeksi', 'Tetes', 'Bubuk'];
                }

                echo json_encode([
                    'success' => true,
                    'data' => $data,
                    'message' => empty($data) ? 'Menggunakan bentuk obat default' : 'Data bentuk obat berhasil diambil'
                ], JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
                break;

            // ═══════════════════════════════════════════════════════════════
            // 🔍 GET MEDICINE DETAIL BY ID (Using RPC Function)
            // ═══════════════════════════════════════════════════════════════
            case 'getDetail':
            case 'get_detail':
                $id_obat = $_GET['id'] ?? $_GET['id_obat'] ?? null;
                
                if (!$id_obat) {
                    throw new Exception('ID obat tidak ditemukan');
                }
                
                error_log("🔍 Getting detail for medicine ID: $id_obat");
                
                try {
                    // Call RPC function
                    $params = ['p_id_obat' => $id_obat];
                    
                    error_log("📤 Calling RPC: get_obat_detail");
                    $result = supabase('POST', 'rpc/get_obat_detail', '', $params);
                    
                    if (!is_array($result) || empty($result)) {
                        error_log("❌ Medicine not found");
                        throw new Exception('Data obat tidak ditemukan');
                    }
                    
                    $medicine = $result[0];
                    error_log("✅ Medicine detail retrieved via RPC");
                    error_log("📦 Data: " . json_encode($medicine));
                    
                    // Get detailed batch info (optional, for the details array)
                    $detailQuery = "detail_obat?id_obat=eq.$id_obat&or=(is_deleted.eq.0,is_deleted.is.null)&order=created_at.desc";
                    $detailResult = supabase('GET', $detailQuery, 'select=id_detail_obat,stock,harga_jual,harga_beli,tanggal_expired');
                    
                    $details = [];
                    if (is_array($detailResult)) {
                        foreach ($detailResult as $d) {
                            $details[] = [
                                'id_detail_obat' => $d['id_detail_obat'] ?? null,
                                'stock' => isset($d['stock']) ? (int)$d['stock'] : 0,
                                'harga_jual' => $d['harga_jual'] ?? null,
                                'harga_beli' => $d['harga_beli'] ?? null,
                                'tanggal_expired' => $d['tanggal_expired'] ?? null
                            ];
                        }
                    }
                    
                    // Add details array to response
                    $medicine['details'] = $details;
                    
                    echo json_encode([
                        'success' => true,
                        'data' => $medicine,
                        'message' => 'Detail obat berhasil diambil'
                    ], JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
                    
                } catch (Exception $e) {
                    error_log("❌ Error in getDetail: " . $e->getMessage());
                    throw $e;
                }
                break;
                
            // ═══════════════════════════════════════════════════════════════
            // 📦 GET BATCH DETAILS (Detail Obat Masuk per Medicine)
            // ═══════════════════════════════════════════════════════════════
            case 'getBatchDetails':
            case 'get_batch_details':
                $id_obat = $_GET['id'] ?? $_GET['id_obat'] ?? null;
                
                if (!$id_obat) {
                    error_log("❌ No id_obat provided in request");
                    http_response_code(400);
                    echo json_encode([
                        'success' => false,
                        'message' => 'ID obat tidak ditemukan',
                        'error' => 'Missing id_obat parameter'
                    ], JSON_UNESCAPED_UNICODE);
                    exit;
                }
                
                error_log("📦 Getting batch details for medicine ID: $id_obat");
                
                try {
                    // Try with RPC function first (if you created it)
                    error_log("🔄 Trying RPC: get_batch_details");
                    
                    $params = ['p_id_obat' => $id_obat];
                    $result = supabase('POST', 'rpc/get_batch_details', '', $params);
                    
                    if (is_array($result) && !empty($result)) {
                        error_log("✅ RPC returned " . count($result) . " batches");
                        
                        echo json_encode([
                            'success' => true,
                            'data' => $result,
                            'total' => count($result),
                            'message' => 'Detail batch berhasil diambil (via RPC)'
                        ], JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
                        break;
                    }
                    
                    // If RPC fails, fall through to direct query
                    error_log("⚠️ RPC returned empty or failed, trying direct query");
                    
                } catch (Exception $rpcError) {
                    error_log("⚠️ RPC failed: " . $rpcError->getMessage());
                }
                
                // FALLBACK: Direct Supabase query
                try {
                    // Query detail_obat directly with proper filters
                    // Note: is_deleted might be integer (0) or boolean (false)
                    $query = "detail_obat?id_obat=eq.$id_obat&or=(is_deleted.eq.0,is_deleted.is.null)&order=created_at.desc";
                    
                    error_log("📤 Direct query: $query");
                    
                    $result = supabase('GET', $query, 'select=id_detail_obat,id_obat,tanggal_expired,stock,harga_beli,harga_jual,status_batch,created_at');
                    
                    if (!is_array($result)) {
                        error_log("❌ Result not array: " . var_export($result, true));
                        throw new Exception('Invalid response format from database');
                    }
                    
                    error_log("✅ Got " . count($result) . " batches from direct query");
                    
                    // Get nama_obat separately
                    $namaObat = '-';
                    if (!empty($result)) {
                        $obatQuery = "obat?id_obat=eq.$id_obat";
                        error_log("📤 Getting nama_obat: $obatQuery");
                        
                        $obatResult = supabase('GET', $obatQuery, 'select=nama_obat');
                        
                        if (is_array($obatResult) && !empty($obatResult)) {
                            $namaObat = $obatResult[0]['nama_obat'] ?? '-';
                            error_log("✅ Found nama_obat: $namaObat");
                        }
                        
                        // Add nama_obat to each batch
                        foreach ($result as &$batch) {
                            $batch['nama_obat'] = $namaObat;
                        }
                        unset($batch); // Break reference
                    }
                    
                    error_log("📦 Returning " . count($result) . " batches with nama_obat");
                    
                    echo json_encode([
                        'success' => true,
                        'data' => $result,
                        'total' => count($result),
                        'message' => 'Detail batch berhasil diambil (direct query)'
                    ], JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
                    
                } catch (Exception $e) {
                    error_log("❌ Error in getBatchDetails: " . $e->getMessage());
                    error_log("❌ Stack trace: " . $e->getTraceAsString());
                    
                    http_response_code(500);
                    echo json_encode([
                        'success' => false,
                        'message' => 'Gagal mengambil detail batch: ' . $e->getMessage(),
                        'error' => $e->getMessage(),
                        'query_attempted' => $query ?? 'N/A'
                    ], JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
                }
                break;

            case 'getBatchUsage':
            case 'get_batch_usage':
                $batch_id = $_GET['batch_id'] ?? $_GET['id_detail_obat'] ?? null;
                
                if (!$batch_id) {
                    throw new Exception('ID batch tidak ditemukan');
                }

                // ✅ SANITIZE
                $batch_id = trim($batch_id);
                $batch_id = trim($batch_id, '"\'');
                
                error_log("═══════════════════════════════════════════════");
                error_log("📊 GET BATCH USAGE");
                error_log("═══════════════════════════════════════════════");
                error_log("Batch ID: '$batch_id'");
                error_log("Length: " . strlen($batch_id));
                
                // ✅ VALIDATE UUID
                if (!preg_match('/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i', $batch_id)) {
                    error_log("❌ Invalid UUID format");
                    
                    echo json_encode([
                        'success' => false,
                        'data' => [],
                        'error' => 'Format ID batch tidak valid',
                        'message' => 'Format ID batch tidak valid'
                    ], JSON_UNESCAPED_UNICODE);
                    exit;
                }
                
                error_log("✅ UUID validated");
                
                try {
                    // ✅ STEP 1: Check if batch exists (FIXED)
                    error_log("🔍 STEP 1: Checking if detail_obat exists");
                    
                    $batchCheck = supabase('GET', 'detail_obat', "id_detail_obat=eq.$batch_id&select=id_detail_obat,id_obat");
                    
                    error_log("Batch check result: " . json_encode($batchCheck));
                    
                    if (isset($batchCheck['error'])) {
                        throw new Exception("Batch check failed: " . json_encode($batchCheck['error']));
                    }
                    
                    if (empty($batchCheck) || !is_array($batchCheck)) {
                        throw new Exception("Batch not found: $batch_id");
                    }
                    
                    error_log("✅ Batch exists");
                    
                    // ✅ STEP 2: Query pemeriksaan_obat (FIXED)
                    error_log("🔍 STEP 2: Querying pemeriksaan_obat");
                    
                    $result = supabase('GET', 'pemeriksaan_obat', "id_detail_obat=eq.$batch_id&select=id_pemeriksaan_obat,jumlah,signa,created_at&order=created_at.desc");
                    
                    error_log("Result: " . json_encode($result));
                    
                    if (isset($result['error'])) {
                        $errorMsg = is_string($result['error']) ? $result['error'] : json_encode($result['error']);
                        throw new Exception("Supabase error: $errorMsg");
                    }
                    
                    if (!is_array($result)) {
                        error_log("⚠️ Result is not array");
                        $result = [];
                    }
                    
                    error_log("✅ Found " . count($result) . " usage records");
                    
                    echo json_encode([
                        'success' => true,
                        'data' => $result,
                        'total' => count($result),
                        'message' => 'Detail penggunaan berhasil diambil'
                    ], JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
                    
                } catch (Exception $e) {
                    error_log("❌ Exception: " . $e->getMessage());
                    
                    echo json_encode([
                        'success' => false,
                        'data' => [],
                        'error' => $e->getMessage(),
                        'message' => 'Gagal memuat penggunaan: ' . $e->getMessage()
                    ], JSON_UNESCAPED_UNICODE);
                }
                break;

            // ═══════════════════════════════════════════════════════════════
            // 📊 LIST ALL MEDICINES - AGGREGATED WITH MASTER PRICE
            // ✅ UPDATED: Returns harga_jual from obat table (not FIFO)
            // ═══════════════════════════════════════════════════════════════
            case 'get_all':
            case 'list':
            case 'getAll':
                error_log("🔄 Listing all medicines (aggregated)...");
                
                // Get id_dokter from query parameter
                $id_dokter_filter = $_GET['id_dokter'] ?? null;
                if ($id_dokter_filter) {
                    error_log("🔍 Filtering by id_dokter: $id_dokter_filter");
                }
                
                try {
                    // Call the RPC function
                    $params = [];
                    
                    // Optional: Filter by doctor
                    if ($id_dokter_filter) {
                        $params['p_id_dokter'] = $id_dokter_filter;
                    }
                    
                    error_log("📤 Calling RPC: get_all_obat with params: " . json_encode($params));
                    $result = supabase('POST', 'rpc/get_all_obat', '', $params);
                    
                    if (!is_array($result)) {
                        error_log("⚠️ RPC returned non-array, falling back to direct query");
                        throw new Exception('RPC failed');
                    }
                    
                    error_log("✅ Got " . count($result) . " aggregated medicine records from RPC");
                    
                    // ✅ UPDATED: Use obat.harga_jual (master price) instead of FIFO
                    $medicines = [];
                    foreach ($result as $row) {
                        $idObat = $row['id_obat'] ?? null;
                        
                        // ✅ Use master price from obat table
                        $hargaJual = isset($row['harga_jual']) ? (float)$row['harga_jual'] : 0;
                        
                        error_log("💰 Medicine: {$row['nama_obat']} - Master Price: Rp " . number_format($hargaJual, 0, ',', '.'));
                        
                        $medicines[] = [
                            'id_obat' => $idObat,
                            'barcode' => $row['barcode'] ?? '',
                            'nama_obat' => $row['nama_obat'] ?? '',
                            'bentuk_obat' => $row['bentuk_obat'] ?? '-',
                            'jenis_obat' => $row['nama_jenis_obat'] ?? '-',
                            'id_jenis_obat' => $row['id_jenis_obat'] ?? null,
                            'harga_jual' => $hargaJual,  // ✅ Master price from obat table
                            'stock' => isset($row['total_stock']) ? (int)$row['total_stock'] : 0,
                            'expired_date' => $row['nearest_expired'] ?? null,
                            'batch_count' => isset($row['batch_count']) ? (int)$row['batch_count'] : 0
                        ];
                    }
                    
                    error_log("✅ Transformed " . count($medicines) . " medicine records with master pricing");
                    
                    echo json_encode([
                        'success' => true,
                        'data' => $medicines,
                        'total' => count($medicines),
                        'message' => 'Data obat berhasil diambil'
                    ], JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
                    
                } catch (Exception $e) {
                    // Fallback to direct query if RPC fails
                    error_log("⚠️ Falling back to direct query method: " . $e->getMessage());
                    
                    $query = 'obat?or=(is_deleted.eq.0,is_deleted.is.null)';
                    if ($id_dokter_filter) {
                        $query .= "&id_dokter=eq.$id_dokter_filter";
                    }
                    
                    $select = "id_obat,nama_obat,bentuk_obat,barcode,harga_jual,id_jenis_obat,jenis_obat(nama_jenis_obat)";
                    
                    error_log("📤 Fallback query: $query");
                    $rows = supabase('GET', $query, $select);
                    
                    if (!is_array($rows)) {
                        throw new Exception('Gagal mengambil data obat dari database');
                    }
                    
                    error_log("✅ Got " . count($rows) . " rows from fallback");
                    
                    // Aggregate manually
                    $medicines = [];
                    foreach ($rows as $r) {
                        $idObat = $r['id_obat'];
                        
                        $jenisNama = '-';
                        if (!empty($r['jenis_obat']) && is_array($r['jenis_obat'])) {
                            $jenisNama = $r['jenis_obat'][0]['nama_jenis_obat'] ?? '-';
                        }
                        
                        // ✅ Get master price from obat table (already in $r)
                        $hargaJual = isset($r['harga_jual']) ? (float)$r['harga_jual'] : 0;
                        
                        error_log("💰 Medicine: {$r['nama_obat']} - Master Price: Rp " . number_format($hargaJual, 0, ',', '.'));
                        
                        // Get stock info from detail_obat
                        $batchQuery = "detail_obat?id_obat=eq.$idObat&or=(is_deleted.eq.0,is_deleted.is.null)&order=created_at.asc";
                        $batchResult = supabase('GET', $batchQuery, 'select=stock,tanggal_expired,status_batch');
                        
                        $totalStock = 0;
                        $nearestExpired = null;
                        $batchCount = 0;
                        
                        if (is_array($batchResult)) {
                            foreach ($batchResult as $batch) {
                                // Skip deleted or inactive batches
                                if (($batch['status_batch'] ?? 'aktif') !== 'aktif') {
                                    continue;
                                }
                                
                                $batchStock = (int)($batch['stock'] ?? 0);
                                $batchCount++;
                                $totalStock += $batchStock;
                                
                                // Track nearest expiry
                                if ($batch['tanggal_expired'] ?? null) {
                                    if (!$nearestExpired || $batch['tanggal_expired'] < $nearestExpired) {
                                        $nearestExpired = $batch['tanggal_expired'];
                                    }
                                }
                            }
                        }
                        
                        $medicines[] = [
                            'id_obat' => $idObat,
                            'barcode' => $r['barcode'] ?? '',
                            'nama_obat' => $r['nama_obat'] ?? '',
                            'bentuk_obat' => $r['bentuk_obat'] ?? '-',
                            'jenis_obat' => $jenisNama,
                            'id_jenis_obat' => $r['id_jenis_obat'],
                            'harga_jual' => $hargaJual,  // ✅ Master price from obat table
                            'stock' => $totalStock,
                            'expired_date' => $nearestExpired,
                            'batch_count' => $batchCount
                        ];
                    }
                    
                    error_log("✅ Fallback processed " . count($medicines) . " medicines with master pricing");
                    
                    echo json_encode([
                        'success' => true,
                        'data' => $medicines,
                        'total' => count($medicines),
                        'message' => 'Data obat berhasil diambil (fallback method)'
                    ], JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
                }
                break;
        }
        
    // ═══════════════════════════════════════════════════════════════════════
    // 📝 POST REQUESTS HANDLER
    // ═══════════════════════════════════════════════════════════════════════
    
    } elseif ($method === 'POST') {
        
        // Parse JSON payload
        $payload = json_decode(file_get_contents('php://input'), true);
        if (!$payload) {
            throw new Exception('Input JSON tidak valid');
        }

        error_log("📥 POST payload: " . json_encode($payload));

        $action = $payload['action'] ?? $_GET['action'] ?? 'addObat';
        error_log("🎯 POST Action: $action");

        // ═══════════════════════════════════════════════════════════════════
        // 🔐 AUTO ID_DOKTER HANDLING (Priority: Payload > Session)
        // ═══════════════════════════════════════════════════════════════════
        
        $id_dokter = $payload['id_dokter'] ?? null;
        
        // Fallback to session if not in payload
        if (!$id_dokter) {
            error_log("⚠️ No id_dokter in payload, checking session...");
            
            if (isset($_SESSION['dokter']['id_dokter'])) {
                $id_dokter = $_SESSION['dokter']['id_dokter'];
                error_log("✅ Found in session: dokter.id_dokter");
            } elseif (isset($_SESSION['user_id'])) {
                $id_dokter = $_SESSION['user_id'];
                error_log("✅ Found in session: user_id");
            } elseif (isset($_SESSION['dokter']['id'])) {
                $id_dokter = $_SESSION['dokter']['id'];
                error_log("✅ Found in session: dokter.id");
            }
        } else {
            error_log("✅ id_dokter from payload: $id_dokter");
        }

        // Inject id_dokter into payload
        if ($id_dokter) {
            $payload['id_dokter'] = $id_dokter;
        } else {
            error_log("❌ No id_dokter found!");
            throw new Exception('ID Dokter tidak ditemukan. Silakan login ulang.');
        }

        // ═══════════════════════════════════════════════════════════════════
        // 🎯 POST ACTION ROUTING
        // ═══════════════════════════════════════════════════════════════════
        
        switch ($action) {
            
            // ═══════════════════════════════════════════════════════════════
            // ➕ ADD JENIS OBAT (Medicine Type)
            // ═══════════════════════════════════════════════════════════════
            case 'addJenisObat':
            case 'add_jenis':
                $namaJenis = trim($payload['nama_jenis'] ?? '');
                if (empty($namaJenis)) {
                    throw new Exception('Nama jenis obat tidak boleh kosong');
                }
                
                error_log("➕ Adding jenis obat: $namaJenis");
                
                $data = ['nama_jenis_obat' => $namaJenis];
                $result = supabase('POST', 'jenis_obat', '', $data);
                
                error_log("✅ Jenis obat added successfully");
                
                echo json_encode([
                    'success' => true,
                    'data' => $result,
                    'message' => 'Jenis obat berhasil ditambahkan'
                ], JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
                break;

            // ═══════════════════════════════════════════════════════════════
            // 💊 ADD OBAT (Medicine + Detail via RPC)
            // ═══════════════════════════════════════════════════════════════
            case 'addObat':
            case 'add_obat':
                error_log("➕ Adding new medicine...");
                
                // Validate required fields
                $required = [
                    'nama_obat', 'id_jenis_obat', 'bentuk_obat',
                    'harga_jual', 'harga_beli', 'stok',
                    'tanggal_expired', 'id_dokter'
                ];

                foreach ($required as $field) {
                    if (!isset($payload[$field]) || $payload[$field] === '') {
                        throw new Exception("Field $field wajib diisi");
                    }
                }

                // Prepare RPC parameters
                $params = [
                    'p_nama_obat'       => trim($payload['nama_obat']),
                    'p_id_jenis_obat'   => $payload['id_jenis_obat'],
                    'p_bentuk_obat'     => $payload['bentuk_obat'],
                    'p_harga_jual'      => (float)$payload['harga_jual'],
                    'p_harga_beli'      => (float)$payload['harga_beli'],
                    'p_stok'            => (int)$payload['stok'],
                    'p_tanggal_expired' => $payload['tanggal_expired'],
                    'p_id_dokter'       => $payload['id_dokter']
                ];

                error_log("📤 Calling RPC tambah_obat with params: " . json_encode($params));

                // Call Supabase RPC function
                $result = supabase('POST', 'rpc/tambah_obat', '', $params);

                error_log("✅ Medicine added successfully via RPC");
                error_log("📦 RPC result: " . json_encode($result));

                // 🆕 CREATE PENGELUARAN AFTER SUCCESSFUL MEDICINE ADDITION
                $pengeluaranInfo = null;
                
                if (is_array($result) && !empty($result)) {
                    // Get id_obat from result
                    $idObat = $result[0]['id_obat'] ?? null;
                    
                    // If RPC doesn't return id_obat, query for it
                    if (!$idObat) {
                        error_log("⚠️ id_obat not in RPC result, querying...");
                        $queryResult = supabase(
                            'GET',
                            'obat?nama_obat=eq.' . urlencode($params['p_nama_obat']) . '&id_dokter=eq.' . $params['p_id_dokter'] . '&order=created_at.desc&limit=1',
                            'select=id_obat'
                        );
                        
                        if (is_array($queryResult) && !empty($queryResult)) {
                            $idObat = $queryResult[0]['id_obat'];
                            error_log("✅ Found id_obat: $idObat");
                        }
                    }
                    
                    // Create pengeluaran if we have id_obat
                    if ($idObat) {
                        $pengeluaranInfo = createPengeluaranObat(
                            $idObat,
                            $params['p_nama_obat'],
                            $params['p_stok'],
                            $params['p_harga_beli'],
                            $params['p_id_dokter']
                        );
                        
                        if ($pengeluaranInfo) {
                            error_log("✅ Pengeluaran created: " . json_encode($pengeluaranInfo));
                        }
                    }
                }

                echo json_encode([
                    'success' => true,
                    'data' => $result,
                    'pengeluaran' => $pengeluaranInfo,
                    'message' => 'Obat dan detail berhasil ditambahkan' . ($pengeluaranInfo ? ' (pengeluaran tercatat)' : '')
                ], JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
                break;

            // ═══════════════════════════════════════════════════════════════
            // ✏️ UPDATE OBAT (Medicine Update)
            // ═══════════════════════════════════════════════════════════════
            case 'updateObat':
            case 'update_obat':
                error_log("✏️ Updating medicine...");
                
                // Validate required fields
                $required = ['id_obat', 'nama_obat', 'id_jenis_obat', 'bentuk_obat'];
                foreach ($required as $field) {
                    if (!isset($payload[$field]) || $payload[$field] === '') {
                        throw new Exception("Field $field wajib diisi");
                    }
                }
                
                $idObat = $payload['id_obat'];
                $namaObat = trim($payload['nama_obat']);
                $idJenisObat = $payload['id_jenis_obat'];
                $bentukObat = $payload['bentuk_obat'];
                $barcode = $payload['barcode'] ?? null;
                
                error_log("📝 Updating medicine ID: $idObat");
                
                $updateData = [
                    'nama_obat' => $namaObat,
                    'id_jenis_obat' => $idJenisObat,
                    'bentuk_obat' => $bentukObat
                ];
                
                if ($barcode !== null) {
                    $updateData['barcode'] = $barcode;
                }
                
                $result = supabase('PATCH', "obat?id_obat=eq.$idObat", '', $updateData);
                
                error_log("✅ Medicine updated successfully");
                
                echo json_encode([
                    'success' => true,
                    'data' => $result,
                    'message' => 'Data obat berhasil diperbarui'
                ], JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
                break;

            // ═══════════════════════════════════════════════════════════════
            // 🔄 RESTOCK HANDLER (Compare old/new stock and route accordingly)
            // ═══════════════════════════════════════════════════════════════
            case 'restockObat':
            case 'restock':
                error_log("🔄 Processing restock - Trigger will auto-update master price...");
                
                // Validate required fields
                $required = ['id_obat', 'stok_baru', 'tanggal_expired'];
                foreach ($required as $field) {
                    if (!isset($payload[$field]) || $payload[$field] === '') {
                        throw new Exception("Field $field wajib diisi");
                    }
                }
                
                $idObat = $payload['id_obat'];
                $stokMasuk = (int)$payload['stok_baru'];
                $tanggalExpired = $payload['tanggal_expired'];
                $hargaBeli = isset($payload['harga_beli']) ? (float)$payload['harga_beli'] : 0;
                $hargaJual = isset($payload['harga_jual']) ? (float)$payload['harga_jual'] : 0;
                $idDokter = $payload['id_dokter'];
                
                // Validate stock amount
                if ($stokMasuk <= 0) {
                    throw new Exception('Jumlah stok harus lebih dari 0');
                }
                
                // Get medicine name for pengeluaran
                $obatQuery = "obat?id_obat=eq.$idObat";
                $obatResult = supabase('GET', $obatQuery, 'select=nama_obat');
                $namaObat = 'Unknown';
                
                if (is_array($obatResult) && !empty($obatResult)) {
                    $namaObat = $obatResult[0]['nama_obat'];
                }
                
                error_log("📦 Adding new batch: $stokMasuk units");
                error_log("💰 New batch price: Rp " . number_format($hargaJual, 0, ',', '.'));
                
                // ✅ INSERT NEW BATCH (trigger will auto-update obat.harga_jual)
                $insertData = [
                    'id_obat' => $idObat,
                    'tanggal_expired' => $tanggalExpired,
                    'stock' => $stokMasuk,
                    'harga_beli' => $hargaBeli,
                    'harga_jual' => $hargaJual,
                    'is_deleted' => 0,
                    'status_batch' => 'aktif'
                ];
                
                $insertResult = supabase('POST', 'detail_obat', '', $insertData);
                
                if (!is_array($insertResult) || empty($insertResult)) {
                    throw new Exception('Gagal menambahkan batch baru');
                }
                
                error_log("✅ New batch created (trigger updated master price automatically)");
                
                // CREATE PENGELUARAN
                $pengeluaranInfo = createPengeluaranObat(
                    $idObat,
                    $namaObat,
                    $stokMasuk,
                    $hargaBeli,
                    $idDokter
                );
                
                // Calculate new total stock
                $totalStockQuery = "detail_obat?id_obat=eq.$idObat&or=(is_deleted.eq.0,is_deleted.is.null)";
                $totalStockResult = supabase('GET', $totalStockQuery, 'select=stock');
                
                $totalStock = 0;
                if (is_array($totalStockResult)) {
                    foreach ($totalStockResult as $batch) {
                        $totalStock += (int)($batch['stock'] ?? 0);
                    }
                }
                
                error_log("✅ Restock completed. Total stock now: $totalStock");
                
                $response = [
                    'success' => true,
                    'message' => 'Stok berhasil ditambahkan (harga master diperbarui otomatis)' . ($pengeluaranInfo ? ' (pengeluaran tercatat)' : ''),
                    'data' => [
                        'batch_created' => $insertResult[0] ?? null,
                        'stock_added' => $stokMasuk,
                        'total_stock_now' => $totalStock,
                        'new_price' => $hargaJual,
                        'pengeluaran' => $pengeluaranInfo
                    ]
                ];
                
                echo json_encode($response, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
                break;
            // ═══════════════════════════════════════════════════════════════
            // ❌ UNKNOWN ACTION
            // ═══════════════════════════════════════════════════════════════
            default:
                throw new Exception('Action tidak dikenal: ' . $action);
        }
        
    // ═══════════════════════════════════════════════════════════════════════
    // 🚫 METHOD NOT ALLOWED
    // ═══════════════════════════════════════════════════════════════════════
    
    } else {
        http_response_code(405);
        echo json_encode([
            'success' => false,
            'message' => 'Method tidak diizinkan: ' . $method
        ], JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
    }

// ═══════════════════════════════════════════════════════════════════════════
// 💥 GLOBAL ERROR HANDLER
// ═══════════════════════════════════════════════════════════════════════════

} catch (Exception $e) {
    error_log("════════════════════════════════════════════════════════════");
    error_log("❌ ERROR OCCURRED");
    error_log("════════════════════════════════════════════════════════════");
    error_log("Message: " . $e->getMessage());
    error_log("File: " . $e->getFile());
    error_log("Line: " . $e->getLine());
    error_log("Stack trace: " . $e->getTraceAsString());
    error_log("════════════════════════════════════════════════════════════");
    
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage(),
        'error' => $e->getMessage()
    ], JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
}

function createPengeluaranObat($idObat, $namaObat, $jumlah, $hargaBeli, $idDokter) {
    try {
        $totalHarga = $hargaBeli * $jumlah;
        
        $pengeluaranData = [
            'keterangan' => "Beli Obat: $namaObat ($jumlah unit)",
            'id_dokter' => $idDokter,
            'tanggal' => date('Y-m-d'),
            'id_antrian' => null
        ];
        
        error_log("💰 Creating pengeluaran: " . json_encode($pengeluaranData));
        
        // Insert into pengeluaran
        $pengeluaranResult = supabase('POST', 'pengeluaran', '', $pengeluaranData);
        
        // 🔍 DEBUG: Log the exact response
        error_log("📦 PENGELUARAN RESULT TYPE: " . gettype($pengeluaranResult));
        error_log("📦 PENGELUARAN RESULT: " . json_encode($pengeluaranResult));
        error_log("📦 IS ARRAY: " . (is_array($pengeluaranResult) ? 'YES' : 'NO'));
        error_log("📦 IS EMPTY: " . (empty($pengeluaranResult) ? 'YES' : 'NO'));
        
        // Check if error
        if (isset($pengeluaranResult['error'])) {
            throw new Exception('Pengeluaran insert failed: ' . $pengeluaranResult['error']);
        }
        
        // Check if result is empty array (RLS issue)
        if (empty($pengeluaranResult)) {
            error_log("❌ CRITICAL: Empty response - likely RLS blocking SELECT after INSERT");
            throw new Exception('RLS blocking: pengeluaran inserted but cannot be retrieved. Check RLS policies.');
        }
        
        // Check if array but malformed
        if (!is_array($pengeluaranResult)) {
            error_log("❌ CRITICAL: Response is not an array");
            throw new Exception('Invalid response type from pengeluaran insert');
        }
        
        // Get the ID
        $idPengeluaran = $pengeluaranResult[0]['id_pengeluaran'] ?? null;
        
        if (!$idPengeluaran) {
            error_log("❌ CRITICAL: No id_pengeluaran in result");
            error_log("❌ Available keys: " . implode(', ', array_keys($pengeluaranResult[0] ?? [])));
            throw new Exception('id_pengeluaran not returned from insert');
        }
        
        error_log("✅ Pengeluaran created with ID: $idPengeluaran");
        
        // Create pengeluaran_detail
        $detailData = [
            'id_pengeluaran' => $idPengeluaran,
            'id_obat' => $idObat,
            'jumlah' => $jumlah,
            'harga' => $hargaBeli
        ];
        
        error_log("💰 Creating pengeluaran_detail: " . json_encode($detailData));
        $detailResult = supabase('POST', 'pengeluaran_detail', '', $detailData);
        
        error_log("✅ Pengeluaran detail created");
        
        return [
            'id_pengeluaran' => $idPengeluaran,
            'total' => $totalHarga,
            'keterangan' => $pengeluaranData['keterangan']
        ];
        
    } catch (Exception $e) {
        error_log("❌ Error creating pengeluaran: " . $e->getMessage());
        error_log("❌ Stack: " . $e->getTraceAsString());
        throw $e;
    }
}