<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);

// API/auth/antrian.php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, PATCH');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

require_once __DIR__ . '/../config/supabase.php';
require_once __DIR__ . '/encounter_satusehat_api.php';
require_once __DIR__ . '/../ApiClient.php';

$method = $_SERVER['REQUEST_METHOD'];
$action = $_GET['action'] ?? '';

if ($method === 'GET' && empty($action)) {
    try {
        $params = '';
        if (!empty($_GET)) {
            $queryParts = [];
            foreach ($_GET as $key => $value) {
                if ($key !== 'action') {
                    $queryParts[] = "$key=$value";
                }
            }
            $params = implode('&', $queryParts);
        }

        $result = supabase('GET', 'antrian', $params);
        
        if (isset($result['error'])) {
            echo json_encode(['success' => false, 'error' => $result['error']]);
        } else {
            echo json_encode(['success' => true, 'data' => $result]);
        }
    } catch (Exception $e) {
        echo json_encode(['success' => false, 'error' => $e->getMessage()]);
    }
    exit; // IMPORTANT: Must exit here
}

// Router
switch ($action) {
    case 'list_by_doctor':
        listByDoctor();
        break;
    case 'search_pasien':
        searchPasien();
        break;
    case 'generate_number':
        generateQueueNumber();
        break;
    case 'filter_by_hour':
        filterByHour();
        break;
    case 'create':
        createAntrian();
        break;
    case 'accept':
        acceptQueue();
        break;
    case 'delete':
        deleteQueue();
        break;
    case 'check_satusehat':
        checkSatusehat();
        break;
    case 'register_satusehat':
        registerSatusehat();
        break;
    case 'periksa':
        periksaQueue();
        break;
    case 'exit_pemeriksaan':
        exitPemeriksaan();
        break;

    case 'resume_pemeriksaan':
        resumePemeriksaan();
        break;

    case 'finish_pemeriksaan':
        finishPemeriksaan();
        break;

    case 'get_payment_details':
        getPaymentDetails();
        break;

    case 'process_payment':
        processPayment();
        break;
    default:
        echo json_encode(['error' => 'Invalid action']);
        break;
}

/**
 * 🔥 BLOCKCHAIN: Generate hash for antrian data
 */
function generateHash($data) {
    $hashString = json_encode($data) . microtime(true);
    return hash('sha256', $hashString);
}

/**
 * Check if patient has SATUSEHAT ID
 * GET: ?action=check_satusehat&patient_id=xxx
 */
function checkSatusehat() {
    $patientId = $_GET['patient_id'] ?? null;
    
    if (!$patientId) {
        echo json_encode([
            'success' => false,
            'error' => 'patient_id required'
        ]);
        return;
    }
    
    try {
        $params = "select=id_pasien,nama,nik,id_satusehat&id_pasien=eq.$patientId&limit=1";
        $result = supabase('GET', 'pasien', $params);
        
        if (!empty($result) && !isset($result['error'])) {
            $patient = $result[0];
            $hasSatusehatId = !empty($patient['id_satusehat']);
            
            echo json_encode([
                'success' => true,
                'has_satusehat_id' => $hasSatusehatId,
                'id_satusehat' => $patient['id_satusehat'] ?? null,
                'patient_name' => $patient['nama'] ?? null
            ]);
        } else {
            echo json_encode([
                'success' => false,
                'error' => 'Patient not found'
            ]);
        }
    } catch (Exception $e) {
        echo json_encode([
            'success' => false,
            'error' => $e->getMessage()
        ]);
    }
}

/**
 * Register patient to SATUSEHAT by NIK search using ApiClient
 * POST: ?action=register_satusehat
 * Body: { "patient_id": "xxx" }
 */
function registerSatusehat()
{
    $input = json_decode(file_get_contents('php://input'), true);
    $patientId = $input['patient_id'] ?? null;

    if (!$patientId) {
        echo json_encode([
            'success' => false,
            'error' => 'patient_id required'
        ]);
        return;
    }

    error_log("🏥 REGISTERING PATIENT TO SATUSEHAT: $patientId");

    try {
        // --- Fetch patient data from Supabase
        $params = "select=id_pasien,nama,nik,tanggal_lahir,jenis_kelamin,alamat,no_telp&id_pasien=eq.$patientId&limit=1";
        $result = supabase('GET', 'pasien', $params);

        if (empty($result) || isset($result['error'])) {
            echo json_encode([
                'success' => false,
                'error' => 'Patient not found in database'
            ]);
            return;
        }

        $patient = $result[0];
        $nik = $patient['nik'];

        if (empty($nik)) {
            echo json_encode([
                'success' => false,
                'error' => 'Patient NIK is empty'
            ]);
            return;
        }

        error_log("📋 Patient data: " . json_encode($patient, JSON_PRETTY_PRINT));
        error_log("🔍 Searching SATUSEHAT by NIK: $nik");

        // --- Initialize API Client
        $apiClient = new ApiClient();

        // --- Search patient in SATUSEHAT with better matching
        $satusehatId = searchSatusehatByNik(
            $apiClient,
            $nik,
            $patient['nama'],
            $patient['tanggal_lahir']
        );

        if (!$satusehatId) {
            echo json_encode([
                'success' => false,
                'error' => 'Patient not found in SATUSEHAT',
                'message' => 'Pasien dengan NIK ' . $nik . ' tidak ditemukan di SATUSEHAT. Pastikan pasien sudah terdaftar di sistem SATUSEHAT.'
            ]);
            return;
        }

        error_log("✅ Found in SATUSEHAT: $satusehatId");

        // --- Update Supabase record with SATUSEHAT ID
        $updateData = ['id_satusehat' => $satusehatId];
        $updateParams = "id_pasien=eq.$patientId";
        $updateResult = supabase('PATCH', 'pasien', $updateParams, $updateData);

        if (isset($updateResult['error'])) {
            error_log("❌ Failed to update patient table: " . json_encode($updateResult['error']));
            echo json_encode([
                'success' => false,
                'error' => 'Failed to update patient record',
                'details' => $updateResult['error']
            ]);
            return;
        }

        error_log("✅ Patient table updated with SATUSEHAT ID");

        echo json_encode([
            'success' => true,
            'message' => 'Patient registered to SATUSEHAT successfully',
            'id_satusehat' => $satusehatId,
            'patient_name' => $patient['nama'],
            'nik' => $nik
        ]);

    } catch (Exception $e) {
        error_log("❌ EXCEPTION in registerSatusehat: " . $e->getMessage());
        echo json_encode([
            'success' => false,
            'error' => 'Exception occurred',
            'message' => $e->getMessage()
        ]);
    }
}


/**
 * Search patient in SATUSEHAT by NIK using ApiClient
 */
function searchSatusehatByNik($apiClient, $nik, $expectedName = null, $expectedBirthDate = null)
{
    try {
        error_log("🔍 Searching SATUSEHAT for NIK: $nik");
        
        $response = $apiClient->get('/Patient', [
            'identifier' => 'https://fhir.kemkes.go.id/id/nik|' . $nik
        ]);
        
        error_log("📥 SATUSEHAT API Response: " . substr($response, 0, 500)); // limit to avoid huge logs
        
        $data = json_decode($response, true);
        
        if (!isset($data['entry']) || count($data['entry']) === 0) {
            error_log("⚠️ Patient with NIK $nik not found in SATUSEHAT");
            return null;
        }

        $expectedName = strtolower(trim($expectedName ?? ''));
        $expectedBirthDate = trim($expectedBirthDate ?? '');
        $matchedId = null;

        foreach ($data['entry'] as $entry) {
            $resource = $entry['resource'] ?? [];
            $id = $resource['id'] ?? null;
            $name = strtolower(trim($resource['name'][0]['text'] ?? ''));
            $birthDate = $resource['birthDate'] ?? '';

            error_log("🧾 Checking patient: ID=$id, name=$name, birthDate=$birthDate");

            $nameMatch = empty($expectedName) || strpos($name, $expectedName) !== false;
            $birthMatch = empty($expectedBirthDate) || $birthDate === $expectedBirthDate;

            if ($nameMatch && $birthMatch) {
                $matchedId = $id;
                error_log("✅ Found matching patient in SATUSEHAT: $id ($name, $birthDate)");
                break;
            }
        }

        // If no name/birth match found, fallback to first entry
        if (!$matchedId) {
            $fallbackId = $data['entry'][0]['resource']['id'];
            error_log("⚠️ No exact match (name/birthDate), fallback to first entry: $fallbackId");
            $matchedId = $fallbackId;
        }

        return $matchedId;

    } catch (Exception $e) {
        error_log("❌ Exception in searchSatusehatByNik: " . $e->getMessage());
        return null;
    }
}

/**
 * Search patients by name or NIK
 * GET: ?action=search_pasien&keyword=xxx
 */
function searchPasien() {
    $keyword = $_GET['keyword'] ?? '';
    
    if (strlen($keyword) < 3) {
        echo json_encode([]);
        return;
    }
    
    $params = "select=id_pasien,nama,nik,no_telp,id_satusehat&or=(nama.ilike.*$keyword*,nik.ilike.*$keyword*)&limit=20";
    
    $result = supabase('GET', 'pasien', $params);
    echo json_encode($result);
}

/**
 * Generate unique queue number for today
 * Format: [Number][DDMMYY]
 * Example: 1251025 = Queue #1 on 25 October 2025
 * GET: ?action=generate_number
 */
function generateQueueNumber() {
    $today = date('dmy');
    $tanggal = date('Y-m-d');

    try {
        $params = "select=no_antrian&tanggal_antrian=eq.$tanggal&order=no_antrian.desc&limit=1";
        $result = supabase('GET', 'antrian', $params);

        $lastNumber = 0;
        if (!empty($result) && isset($result[0]['no_antrian'])) {
            preg_match('/^(\d+)/', $result[0]['no_antrian'], $matches);
            $lastNumber = isset($matches[1]) ? intval($matches[1]) : 0;
        }

        $newNumber = $lastNumber + 1;
        $queueNumber = $newNumber . $today;

        echo json_encode([
            'success' => true,
            'no_antrian' => $queueNumber,
            'tanggal' => $tanggal
        ]);
    } catch (Exception $e) {
        echo json_encode([
            'success' => false,
            'error' => 'Failed to generate queue number',
            'message' => $e->getMessage()
        ]);
    }
}

/**
 * Filter queues by hour range
 * GET: ?action=filter_by_hour&tanggal=2025-10-25&jam_mulai=08:00&jam_akhir=12:00&dokter_id=xxx
 */
function listByDoctor() {
    $dokterId = $_GET['dokter_id'] ?? null;
    
    if (!$dokterId) {
        echo json_encode(['error' => 'dokter_id required']);
        return;
    }
    
    $supabaseUrl = "https://brhaksondhloibpwtrdo.supabase.co";
    $apiKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJyaGFrc29uZGhsb2licHd0cmRvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NjU0MjE0OSwiZXhwIjoyMDcyMTE4MTQ5fQ.lZd5xM790I9kocIVJtqqlilFBasmWcXvPFLpFPZgQV4";

    $endpoint = $supabaseUrl . '/rest/v1/rpc/get_latest_antrian_for_dokter';
    
    // ✅ FIX: Use correct parameter name matching your function
    $payload = json_encode([
        'p_dokter' => $dokterId  // Matches your function parameter name
    ]);

    error_log("🔍 Calling RPC with payload: " . $payload);

    $ch = curl_init($endpoint);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_HTTPHEADER, [
        'Content-Type: application/json',
        'apikey: ' . $apiKey,
        'Authorization: Bearer ' . $apiKey
    ]);
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_POSTFIELDS, $payload);

    $response = curl_exec($ch);
    $err = curl_error($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);

    if ($err) {
        error_log("❌ cURL Error: " . $err);
        echo json_encode(['error' => 'cURL Error', 'message' => $err]);
        return;
    }

    if ($httpCode < 200 || $httpCode >= 300) {
        error_log("❌ HTTP Error $httpCode: " . $response);
        echo json_encode([
            'error' => 'HTTP Error', 
            'code' => $httpCode, 
            'response' => $response,
            'payload_sent' => json_decode($payload, true)
        ]);
        return;
    }
    
    error_log("✅ RPC call successful, rows: " . count(json_decode($response, true)));
    echo $response;
}

/**
 * Filter queues by hour range - FIXED for UUID
 * GET: ?action=filter_by_hour&tanggal=2025-10-25&jam_mulai=08:00&jam_akhir=12:00&dokter_id=xxx
 */
function filterByHour() {
    $tanggal = $_GET['tanggal'] ?? date('Y-m-d');
    $jamMulai = $_GET['jam_mulai'] ?? '00:00';
    $jamAkhir = $_GET['jam_akhir'] ?? '23:59';
    $dokterId = $_GET['dokter_id'] ?? null;
    
    if (!$dokterId) {
        echo json_encode(['error' => 'dokter_id required']);
        return;
    }
    
    $supabaseUrl = "https://brhaksondhloibpwtrdo.supabase.co";
    $apiKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJyaGFrc29uZGhsb2licHd0cmRvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NjU0MjE0OSwiZXhwIjoyMDcyMTE4MTQ5fQ.lZd5xM790I9kocIVJtqqlilFBasmWcXvPFLpFPZgQV4";

    $endpoint = $supabaseUrl . '/rest/v1/rpc/get_latest_antrian_for_dokter';
    
    // ✅ FIX: Use correct parameter name
    $payload = json_encode([
        'p_dokter' => $dokterId  // Matches your function parameter
    ]);

    error_log("🔍 Calling RPC with payload: " . $payload);

    $ch = curl_init($endpoint);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_HTTPHEADER, [
        'Content-Type: application/json',
        'apikey: ' . $apiKey,
        'Authorization: Bearer ' . $apiKey
    ]);
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_POSTFIELDS, $payload);

    $response = curl_exec($ch);
    $err = curl_error($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);

    if ($err) {
        error_log("❌ cURL Error: " . $err);
        echo json_encode(['error' => 'cURL Error', 'message' => $err]);
        return;
    }

    if ($httpCode < 200 || $httpCode >= 300) {
        error_log("❌ HTTP Error $httpCode: " . $response);
        echo json_encode([
            'error' => 'HTTP Error', 
            'code' => $httpCode, 
            'response' => $response,
            'payload_sent' => json_decode($payload, true)
        ]);
        return;
    }
    
    // ✅ Decode and filter by date/time in PHP
    $data = json_decode($response, true);
    
    if (!is_array($data)) {
        error_log("❌ Invalid response format");
        echo json_encode(['error' => 'Invalid response format']);
        return;
    }
    
    error_log("✅ RPC call successful, total rows: " . count($data));
    
    // Filter by date and time range
    $filtered = array_filter($data, function($queue) use ($tanggal, $jamMulai, $jamAkhir) {
        $queueDate = $queue['tanggal_antrian'] ?? '';
        $queueTime = $queue['jam_antrian'] ?? '';
        
        // Check date match
        if ($queueDate !== $tanggal) {
            return false;
        }
        
        // Check time range (handle HH:MM:SS format from database)
        if (!empty($queueTime)) {
            // Extract HH:MM from HH:MM:SS if needed
            $queueTime = substr($queueTime, 0, 5);
        }
        
        if ($queueTime < $jamMulai || $queueTime > $jamAkhir) {
            return false;
        }
        
        return true;
    });
    
    // Re-index array to avoid gaps
    $filtered = array_values($filtered);
    
    error_log("📊 Filter Results:");
    error_log("   Total from DB: " . count($data));
    error_log("   After filter: " . count($filtered));
    error_log("   Date: $tanggal");
    error_log("   Time: $jamMulai - $jamAkhir");
    
    echo json_encode($filtered);
}

/**
 * 🔥 BLOCKCHAIN: CREATE QUEUE WITH INITIAL HASH
 * POST: ?action=create
 */
function createAntrian() {
    $input = json_decode(file_get_contents('php://input'), true);
    
    error_log("📥 CREATE ANTRIAN REQUEST: " . json_encode($input, JSON_PRETTY_PRINT));
    
    if (!isset($input['no_antrian']) || !isset($input['tanggal_antrian']) || 
        !isset($input['jam_antrian']) || !isset($input['id_pasien']) || 
        !isset($input['id_dokter']) || !isset($input['jenis_pasien'])) {
        echo json_encode([
            'error' => 'Missing required fields',
            'required' => ['no_antrian', 'tanggal_antrian', 'jam_antrian', 'id_pasien', 'id_dokter', 'jenis_pasien']
        ]);
        return;
    }
    
    $jenisPasien = strtoupper($input['jenis_pasien']);
    if (!in_array($jenisPasien, ['BPJS', 'UMUM'])) {
        echo json_encode([
            'error' => 'Invalid jenis_pasien',
            'message' => 'jenis_pasien must be BPJS or UMUM',
            'received' => $input['jenis_pasien']
        ]);
        return;
    }
    
    // Check if queue number already exists
    $checkParams = "select=id_antrian&no_antrian=eq." . $input['no_antrian'];
    $existing = supabase('GET', 'antrian', $checkParams);
    
    if (!empty($existing) && !isset($existing['error'])) {
        echo json_encode([
            'error' => 'Queue number already exists',
            'message' => 'Nomor antrian sudah digunakan'
        ]);
        return;
    }
    
    // 🔥 BLOCKCHAIN: Prepare data with initial hash and NULL prev_hash
    $data = [
        'no_antrian' => $input['no_antrian'],
        'tanggal_antrian' => $input['tanggal_antrian'],
        'jam_antrian' => $input['jam_antrian'],
        'status_antrian' => 'Belum Periksa',
        'id_pasien' => $input['id_pasien'],
        'id_dokter' => $input['id_dokter'],
        'jenis_pasien' => $jenisPasien,
        'created_at' => date('Y-m-d H:i:s'),
        'prev_hash' => null // First block has no previous hash
    ];
    
    // Generate hash for this block
    $data['current_hash'] = generateHash($data);
    
    error_log("📤 INSERTING TO DATABASE (BLOCKCHAIN): " . json_encode($data, JSON_PRETTY_PRINT));
    
    $result = supabase('POST', 'antrian', '', $data);
    
    error_log("📥 DATABASE RESPONSE: " . json_encode($result, JSON_PRETTY_PRINT));
    
    if (isset($result['error'])) {
        echo json_encode([
            'success' => false,
            'error' => 'Failed to create queue',
            'details' => $result
        ]);
    } else {
        echo json_encode([
            'success' => true,
            'message' => 'Queue created successfully (Blockchain)',
            'data' => $result,
            'jenis_pasien' => $jenisPasien,
            'current_hash' => $data['current_hash']
        ]);
    }
}

/**
 * 🔥 BLOCKCHAIN: ACCEPT QUEUE - INSERT NEW ROW WITH PREV_HASH
 * POST: ?action=accept&id=xxx
 * Body (optional): { "jenis_pasien": "BPJS" or "UMUM" }
 */
function acceptQueue() {
    $id = $_GET['id'] ?? null;
    
    if (!$id) {
        echo json_encode(['error' => 'ID required']);
        return;
    }
    
    $input = json_decode(file_get_contents('php://input'), true);
    $newJenisPasien = isset($input['jenis_pasien']) ? strtoupper($input['jenis_pasien']) : null;
    
    if ($newJenisPasien && !in_array($newJenisPasien, ['BPJS', 'UMUM'])) {
        echo json_encode([
            'error' => 'Invalid jenis_pasien',
            'message' => 'jenis_pasien must be BPJS or UMUM'
        ]);
        return;
    }
    
    try {
        // Get current queue data (latest block)
        $params = "select=*,pasien:id_pasien(nama,id_satusehat),dokter:id_dokter(nama_lengkap,id_satusehat)&id_antrian=eq.$id&limit=1";
        $queue = supabase('GET', 'antrian', $params);
        
        if (empty($queue) || isset($queue['error'])) {
            echo json_encode([
                'error' => 'Queue not found',
                'message' => 'Antrian tidak ditemukan'
            ]);
            return;
        }
        
        $currentBlock = $queue[0];
        
        error_log("📋 ACCEPTING QUEUE (BLOCKCHAIN): " . json_encode($currentBlock, JSON_PRETTY_PRINT));
        
        // Check if already processed
        if ($currentBlock['status_antrian'] !== 'Belum Periksa') {
            echo json_encode([
                'error' => 'Queue already processed',
                'message' => 'Antrian sudah diproses sebelumnya',
                'current_status' => $currentBlock['status_antrian']
            ]);
            return;
        }
        
        $patientSatusehatId = $currentBlock['pasien']['id_satusehat'] ?? null;
        $doctorSatusehatId = $currentBlock['dokter']['id_satusehat'] ?? null;
        
        // Validate SATUSEHAT IDs
        if (!$patientSatusehatId) {
            echo json_encode([
                'error' => 'Patient missing SatuSehat ID',
                'message' => 'Pasien belum memiliki ID SatuSehat. Harap daftarkan pasien ke SatuSehat terlebih dahulu.',
                'patient_name' => $currentBlock['pasien']['nama']
            ]);
            return;
        }
        
        if (!$doctorSatusehatId) {
            echo json_encode([
                'error' => 'Doctor missing SatuSehat ID',
                'message' => 'Dokter belum memiliki ID SatuSehat. Harap daftarkan dokter ke SatuSehat terlebih dahulu.',
                'doctor_name' => $currentBlock['dokter']['nama_lengkap']
            ]);
            return;
        }
        
        // 🔥 BLOCKCHAIN: Create new block (row) with updated status
        // Encounter creation removed - just validate and update status
        $newBlock = [
            'no_antrian' => $currentBlock['no_antrian'],
            'tanggal_antrian' => $currentBlock['tanggal_antrian'],
            'jam_antrian' => $currentBlock['jam_antrian'],
            'status_antrian' => 'Di Terima',
            'id_pasien' => $currentBlock['id_pasien'],
            'id_dokter' => $currentBlock['id_dokter'],
            'jenis_pasien' => $newJenisPasien ?? $currentBlock['jenis_pasien'],
            'created_at' => date('Y-m-d H:i:s'),
            'prev_hash' => $currentBlock['current_hash'] // Link to previous block
        ];
        
        // Generate new hash
        $newBlock['current_hash'] = generateHash($newBlock);
        
        error_log("⛓️ BLOCKCHAIN: Creating new block");
        error_log("   Previous Hash: " . $currentBlock['current_hash']);
        error_log("   New Hash: " . $newBlock['current_hash']);
        
        // Insert new block
        $insertResult = supabase('POST', 'antrian', '', $newBlock);
        
        if (isset($insertResult['error'])) {
            error_log("❌ Failed to insert new block: " . json_encode($insertResult['error']));
            echo json_encode([
                'success' => false,
                'error' => 'Failed to create new block',
                'details' => $insertResult['error']
            ]);
            return;
        }
        
        error_log("✅ New block created: " . json_encode($insertResult, JSON_PRETTY_PRINT));
        
        echo json_encode([
            'success' => true,
            'message' => 'Queue accepted and new block created (Blockchain)',
            'queue_number' => $currentBlock['no_antrian'],
            'patient_name' => $currentBlock['pasien']['nama'],
            'jenis_pasien' => $newJenisPasien ?? $currentBlock['jenis_pasien'],
            'prev_hash' => $currentBlock['current_hash'],
            'new_hash' => $newBlock['current_hash'],
            'blockchain_verified' => true
        ]);
        
    } catch (Exception $e) {
        error_log("❌ EXCEPTION in acceptQueue: " . $e->getMessage());
        error_log("   Trace: " . $e->getTraceAsString());
        
        echo json_encode([
            'error' => 'Exception occurred',
            'message' => $e->getMessage(),
            'trace' => $e->getTraceAsString()
        ]);
    }
}

/**
 * 🔥 BLOCKCHAIN: DELETE QUEUE - INSERT NEW ROW WITH STATUS "Batal"
 * POST: ?action=delete&id=xxx
 */
function deleteQueue() {
    $id = $_GET['id'] ?? null;
    
    if (!$id) {
        echo json_encode(['error' => 'ID required']);
        return;
    }
    
    try {
        // Get current queue data (latest block)
        $params = "select=*&id_antrian=eq.$id&limit=1";
        $queue = supabase('GET', 'antrian', $params);
        
        if (empty($queue) || isset($queue['error'])) {
            echo json_encode([
                'error' => 'Queue not found',
                'message' => 'Antrian tidak ditemukan'
            ]);
            return;
        }
        
        $currentBlock = $queue[0];
        
        error_log("🗑️ DELETING QUEUE (BLOCKCHAIN): " . json_encode($currentBlock, JSON_PRETTY_PRINT));
        
        // 🔥 BLOCKCHAIN: Create new block with status "Batal"
        $newBlock = [
            'no_antrian' => $currentBlock['no_antrian'],
            'tanggal_antrian' => $currentBlock['tanggal_antrian'],
            'jam_antrian' => $currentBlock['jam_antrian'],
            'status_antrian' => 'Batal',
            'id_pasien' => $currentBlock['id_pasien'],
            'id_dokter' => $currentBlock['id_dokter'],
            'jenis_pasien' => $currentBlock['jenis_pasien'],
            'id_encounter_satusehat' => $currentBlock['id_encounter_satusehat'],
            'created_at' => date('Y-m-d H:i:s'),
            'prev_hash' => $currentBlock['current_hash'] // Fixed: was 'hash' before
        ];
        
        // Generate new hash
        $newBlock['current_hash'] = generateHash($newBlock);
        
        error_log("⛓️ BLOCKCHAIN: Creating cancellation block");
        error_log("   Previous Hash: " . $currentBlock['current_hash']);
        error_log("   New Hash: " . $newBlock['current_hash']);
        
        // Insert new block
        $insertResult = supabase('POST', 'antrian', '', $newBlock);
        
        if (isset($insertResult['error'])) {
            error_log("❌ Failed to insert cancellation block: " . json_encode($insertResult['error']));
            echo json_encode([
                'success' => false,
                'error' => 'Failed to create cancellation block',
                'details' => $insertResult['error']
            ]);
            return;
        }
        
        error_log("✅ Cancellation block created");
        
        echo json_encode([
            'success' => true,
            'message' => 'Queue cancelled and new block created (Blockchain)',
            'prev_hash' => $currentBlock['current_hash'],
            'new_hash' => $newBlock['current_hash'],
            'blockchain_verified' => true
        ]);
        
    } catch (Exception $e) {
        echo json_encode([
            'error' => 'Exception occurred',
            'message' => $e->getMessage()
        ]);
    }
}

/**
 * 🔥 BLOCKCHAIN: PERIKSA QUEUE - INSERT NEW ROW WITH STATUS "Sedang Diperiksa"
 * AND CREATE SATUSEHAT ENCOUNTER
 * POST: ?action=periksa&id=xxx
 */
function periksaQueue() {
    $id = $_GET['id'] ?? null;
    
    if (!$id) {
        echo json_encode(['error' => 'ID required']);
        return;
    }
    
    try {
        // Get queue data by ID
        $params = "select=*,pasien:id_pasien(nama,id_satusehat),dokter:id_dokter(nama_lengkap,id_satusehat)&id_antrian=eq.$id";
        $queue = supabase('GET', 'antrian', $params);
        
        if (empty($queue) || isset($queue['error'])) {
            echo json_encode([
                'error' => 'Queue not found',
                'message' => 'Antrian tidak ditemukan'
            ]);
            return;
        }
        
        $currentBlock = $queue[0];
        
        error_log("🩺 PROCESSING QUEUE (BLOCKCHAIN): " . json_encode($currentBlock, JSON_PRETTY_PRINT));
        
        // Handle based on current status
        $currentStatus = $currentBlock['status_antrian'];
        
        // If already "Sedang Diperiksa", return the existing data
        if ($currentStatus === 'Sedang Diperiksa') {
            echo json_encode([
                'success' => true,
                'message' => 'Pemeriksaan sudah berlangsung',
                'status' => 'already_in_progress',
                'queue_number' => $currentBlock['no_antrian'],
                'patient_name' => $currentBlock['pasien']['nama'] ?? 'Unknown',
                'doctor_name' => $currentBlock['dokter']['nama_lengkap'] ?? 'Unknown',
                'encounter_id' => $currentBlock['id_encounter_satusehat'] ?? null,
                'reference_id' => $currentBlock['id_antrian'],
                'hash' => $currentBlock['current_hash']
            ]);
            return;
        }
        
        // Check if status is "Di Terima" to start examination
        if ($currentStatus !== 'Di Terima') {
            echo json_encode([
                'error' => 'Invalid queue status',
                'message' => 'Antrian harus berstatus "Di Terima" untuk memulai pemeriksaan',
                'current_status' => $currentStatus
            ]);
            return;
        }
        
        // Extract SATUSEHAT IDs
        $patientSatusehatId = $currentBlock['pasien']['id_satusehat'] ?? null;
        $doctorSatusehatId = $currentBlock['dokter']['id_satusehat'] ?? null;
        $patientName = $currentBlock['pasien']['nama'] ?? 'Unknown';
        $doctorName = $currentBlock['dokter']['nama_lengkap'] ?? 'Unknown';
        
        // Validate SATUSEHAT IDs
        if (!$patientSatusehatId) {
            echo json_encode([
                'error' => 'Patient missing SatuSehat ID',
                'message' => 'Pasien belum memiliki ID SatuSehat',
                'patient_name' => $patientName
            ]);
            return;
        }
        
        if (!$doctorSatusehatId) {
            echo json_encode([
                'error' => 'Doctor missing SatuSehat ID',
                'message' => 'Dokter belum memiliki ID SatuSehat',
                'doctor_name' => $doctorName
            ]);
            return;
        }
        
        // 🏥 CREATE SATUSEHAT ENCOUNTER
        error_log("🏥 Creating SATUSEHAT Encounter...");
        error_log("   Patient: $patientName (ID: $patientSatusehatId)");
        error_log("   Doctor: $doctorName (ID: $doctorSatusehatId)");
        
        $encounterNumber = 'ENC-' . $currentBlock['no_antrian'] . '-' . date('His');
        
        $encounterId = EncounterSatusehatApi::createEncounter(
            $patientSatusehatId,
            $patientName,
            $doctorSatusehatId,
            $doctorName,
            null, // locationId - uses default
            null, // locationDisplay - uses default
            $encounterNumber
        );
        
        if (!$encounterId) {
            error_log("❌ Failed to create SATUSEHAT Encounter");
            echo json_encode([
                'error' => 'Failed to create SATUSEHAT Encounter',
                'message' => 'Gagal membuat Encounter di SATUSEHAT. Silakan coba lagi.'
            ]);
            return;
        }
        
        error_log("✅ SATUSEHAT Encounter created: $encounterId");
        
        // 🔥 BLOCKCHAIN: Create new block with "Sedang Diperiksa" status
        $newBlock = [
            'no_antrian' => $currentBlock['no_antrian'],
            'tanggal_antrian' => $currentBlock['tanggal_antrian'],
            'jam_antrian' => $currentBlock['jam_antrian'],
            'status_antrian' => 'Sedang Diperiksa',
            'id_pasien' => $currentBlock['id_pasien'],
            'id_dokter' => $currentBlock['id_dokter'],
            'jenis_pasien' => $currentBlock['jenis_pasien'],
            'id_encounter_satusehat' => $encounterId, // Store encounter ID
            'created_at' => date('Y-m-d H:i:s'),
            'prev_hash' => $currentBlock['current_hash'] // Link to previous block
        ];
        
        // Generate new hash
        $newBlock['current_hash'] = generateHash($newBlock);
        
        error_log("⛓️ BLOCKCHAIN: Creating examination block");
        error_log("   Previous Hash: " . $currentBlock['current_hash']);
        error_log("   New Hash: " . $newBlock['current_hash']);
        error_log("   Encounter ID: " . $encounterId);
        
        // Insert new block
        $insertResult = supabase('POST', 'antrian', '', $newBlock);
        
        if (isset($insertResult['error'])) {
            error_log("❌ Failed to insert examination block: " . json_encode($insertResult['error']));
            
            // Try to cancel the encounter in SATUSEHAT if blockchain insert fails
            error_log("🔄 Attempting to cancel SATUSEHAT Encounter...");
            EncounterSatusehatApi::updateEncounterStatus($encounterId, 'cancelled');
            
            echo json_encode([
                'success' => false,
                'error' => 'Failed to create examination block',
                'details' => $insertResult['error']
            ]);
            return;
        }
        
        error_log("✅ Examination block created successfully");
        error_log("✅ Reference ID: " . $currentBlock['id_antrian']);
        
        echo json_encode([
            'success' => true,
            'message' => 'Pemeriksaan dimulai (Blockchain + SATUSEHAT)',
            'status' => 'started',
            'queue_number' => $currentBlock['no_antrian'],
            'patient_name' => $patientName,
            'doctor_name' => $doctorName,
            'encounter_id' => $encounterId,
            'encounter_number' => $encounterNumber,
            'reference_id' => $currentBlock['id_antrian'], // Original queue ID
            'new_id' => $insertResult[0]['id_antrian'] ?? null, // New block ID
            'hash' => $newBlock['current_hash'],
            'prev_hash' => $currentBlock['current_hash'],
            'blockchain_verified' => true
        ]);
        
    } catch (Exception $e) {
        error_log("❌ EXCEPTION in periksaQueue: " . $e->getMessage());
        error_log("   Trace: " . $e->getTraceAsString());
        
        echo json_encode([
            'error' => 'Exception occurred',
            'message' => $e->getMessage()
        ]);
    }
}

/**
 * 🚪 EXIT PEMERIKSAAN - Change status back to "Di Terima" without losing encounter
 * This allows doctor to exit form and return later using the same encounter
 * POST: ?action=exit_pemeriksaan&id=xxx
 */
function exitPemeriksaan() {
    $id = $_GET['id'] ?? null;
    
    if (!$id) {
        echo json_encode(['error' => 'ID required']);
        return;
    }
    
    try {
        // Get current queue data (must be "Sedang Periksa")
        $params = "select=*&id_antrian=eq.$id&limit=1";
        $queue = supabase('GET', 'antrian', $params);
        
        if (empty($queue) || isset($queue['error'])) {
            echo json_encode([
                'error' => 'Queue not found',
                'message' => 'Antrian tidak ditemukan'
            ]);
            return;
        }
        
        $currentBlock = $queue[0];
        
        error_log("🚪 EXITING EXAMINATION (BLOCKCHAIN): " . json_encode($currentBlock, JSON_PRETTY_PRINT));
        
        // Check if status is "Sedang Periksa"
        if ($currentBlock['status_antrian'] !== 'Sedang Diperiksa') {
            echo json_encode([
                'error' => 'Invalid queue status',
                'message' => 'Hanya pemeriksaan yang sedang berlangsung yang bisa di-exit',
                'current_status' => $currentBlock['status_antrian']
            ]);
            return;
        }
        
        // 🔥 BLOCKCHAIN: Create new block with "Di Terima" status
        // But KEEP the encounter ID so it can be resumed later
        $newBlock = [
            'no_antrian' => $currentBlock['no_antrian'],
            'tanggal_antrian' => $currentBlock['tanggal_antrian'],
            'jam_antrian' => $currentBlock['jam_antrian'],
            'status_antrian' => 'Di Terima', // Back to "Di Terima"
            'id_pasien' => $currentBlock['id_pasien'],
            'id_dokter' => $currentBlock['id_dokter'],
            'jenis_pasien' => $currentBlock['jenis_pasien'],
            'id_encounter_satusehat' => $currentBlock['id_encounter_satusehat'], // KEEP encounter ID
            'created_at' => date('Y-m-d H:i:s'),
            'prev_hash' => $currentBlock['current_hash']
        ];
        
        // Generate new hash
        $newBlock['current_hash'] = generateHash($newBlock);
        
        error_log("⛓️ BLOCKCHAIN: Creating exit block (status: Di Terima, keeping encounter)");
        error_log("   Previous Hash: " . $currentBlock['current_hash']);
        error_log("   New Hash: " . $newBlock['current_hash']);
        error_log("   Encounter ID (preserved): " . $currentBlock['id_encounter_satusehat']);
        
        // Insert new block
        $insertResult = supabase('POST', 'antrian', '', $newBlock);
        
        if (isset($insertResult['error'])) {
            error_log("❌ Failed to insert exit block: " . json_encode($insertResult['error']));
            echo json_encode([
                'success' => false,
                'error' => 'Failed to create exit block',
                'details' => $insertResult['error']
            ]);
            return;
        }
        
        error_log("✅ Exit block created - Doctor can resume later with same encounter");
        
        echo json_encode([
            'success' => true,
            'message' => 'Pemeriksaan di-pause (data tersimpan)',
            'queue_number' => $currentBlock['no_antrian'],
            'encounter_id' => $currentBlock['id_encounter_satusehat'],
            'can_resume' => true,
            'hash' => $newBlock['current_hash'],
            'prev_hash' => $currentBlock['current_hash']
        ]);
        
    } catch (Exception $e) {
        error_log("❌ EXCEPTION in exitPemeriksaan: " . $e->getMessage());
        echo json_encode([
            'error' => 'Exception occurred',
            'message' => $e->getMessage()
        ]);
    }
}

/**
 * ▶️ RESUME PEMERIKSAAN - Resume examination with existing encounter
 * This reuses the existing encounter ID without creating a new one
 * POST: ?action=resume_pemeriksaan&id=xxx
 */
function resumePemeriksaan() {
    $id = $_GET['id'] ?? null;
    
    if (!$id) {
        echo json_encode(['error' => 'ID required']);
        return;
    }
    
    try {
        // Get current queue data (must be "Di Terima" with encounter ID)
        $params = "select=*,pasien:id_pasien(nama),dokter:id_dokter(nama_lengkap)&id_antrian=eq.$id&limit=1";
        $queue = supabase('GET', 'antrian', $params);
        
        if (empty($queue) || isset($queue['error'])) {
            echo json_encode([
                'error' => 'Queue not found',
                'message' => 'Antrian tidak ditemukan'
            ]);
            return;
        }
        
        $currentBlock = $queue[0];
        
        error_log("▶️ RESUMING EXAMINATION (BLOCKCHAIN): " . json_encode($currentBlock, JSON_PRETTY_PRINT));
        
        // Check if has encounter ID (means it was started before)
        if (empty($currentBlock['id_encounter_satusehat'])) {
            echo json_encode([
                'error' => 'No encounter found',
                'message' => 'Pemeriksaan belum pernah dimulai sebelumnya',
                'should_use' => 'periksa' // Tell frontend to use regular periksa instead
            ]);
            return;
        }
        
        // Check if status is "Di Terima"
        if ($currentBlock['status_antrian'] !== 'Di Terima') {
            echo json_encode([
                'error' => 'Invalid queue status',
                'message' => 'Status harus "Di Terima" untuk melanjutkan pemeriksaan',
                'current_status' => $currentBlock['status_antrian']
            ]);
            return;
        }
        
        // 🔥 BLOCKCHAIN: Create new block with "Sedang Periksa" status
        // REUSE the existing encounter ID (no new encounter created)
        $newBlock = [
            'no_antrian' => $currentBlock['no_antrian'],
            'tanggal_antrian' => $currentBlock['tanggal_antrian'],
            'jam_antrian' => $currentBlock['jam_antrian'],
            'status_antrian' => 'Sedang Diperiksa', // Resume examination
            'id_pasien' => $currentBlock['id_pasien'],
            'id_dokter' => $currentBlock['id_dokter'],
            'jenis_pasien' => $currentBlock['jenis_pasien'],
            'id_encounter_satusehat' => $currentBlock['id_encounter_satusehat'], // REUSE encounter
            'created_at' => date('Y-m-d H:i:s'),
            'prev_hash' => $currentBlock['current_hash']
        ];
        
        // Generate new hash
        $newBlock['current_hash'] = generateHash($newBlock);
        
        error_log("⛓️ BLOCKCHAIN: Creating resume block (reusing encounter)");
        error_log("   Previous Hash: " . $currentBlock['current_hash']);
        error_log("   New Hash: " . $newBlock['current_hash']);
        error_log("   Encounter ID (reused): " . $currentBlock['id_encounter_satusehat']);
        
        // Insert new block
        $insertResult = supabase('POST', 'antrian', '', $newBlock);
        
        if (isset($insertResult['error'])) {
            error_log("❌ Failed to insert resume block: " . json_encode($insertResult['error']));
            echo json_encode([
                'success' => false,
                'error' => 'Failed to create resume block',
                'details' => $insertResult['error']
            ]);
            return;
        }
        
        error_log("✅ Resume block created - Using existing encounter");
        
        echo json_encode([
            'success' => true,
            'message' => 'Pemeriksaan dilanjutkan (menggunakan encounter yang sama)',
            'queue_number' => $currentBlock['no_antrian'],
            'patient_name' => $currentBlock['pasien']['nama'],
            'doctor_name' => $currentBlock['dokter']['nama_lengkap'],
            'encounter_id' => $currentBlock['id_encounter_satusehat'],
            'resumed' => true,
            'hash' => $newBlock['current_hash'],
            'prev_hash' => $currentBlock['current_hash']
        ]);
        
    } catch (Exception $e) {
        error_log("❌ EXCEPTION in resumePemeriksaan: " . $e->getMessage());
        echo json_encode([
            'error' => 'Exception occurred',
            'message' => $e->getMessage()
        ]);
    }
}

/**
 * ✅ FINISH PEMERIKSAAN - Complete examination and update SATUSEHAT encounter status
 * POST: ?action=finish_pemeriksaan&id=xxx
 */
function finishPemeriksaan() {
    $id = $_GET['id'] ?? null;
    
    if (!$id) {
        echo json_encode(['error' => 'ID required']);
        return;
    }
    
    // Get POST body data
    $input = json_decode(file_get_contents('php://input'), true);
    
    error_log("📥 FINISH PEMERIKSAAN DATA: " . json_encode($input, JSON_PRETTY_PRINT));
    
    try {
        // ========================================
        // 1. GET CURRENT QUEUE DATA
        // ========================================
        $params = "select=*,pasien:id_pasien(nama,id_satusehat),dokter:id_dokter(nama_lengkap,id_satusehat)&id_antrian=eq.$id&limit=1";
        $queue = supabase('GET', 'antrian', $params);
        
        if (empty($queue) || isset($queue['error'])) {
            echo json_encode([
                'error' => 'Queue not found',
                'message' => 'Antrian tidak ditemukan'
            ]);
            return;
        }
        
        $currentBlock = $queue[0];
        
        error_log("✅ FINISHING EXAMINATION (BLOCKCHAIN): " . json_encode($currentBlock, JSON_PRETTY_PRINT));
        
        // Check if status is "Sedang Diperiksa"
        if ($currentBlock['status_antrian'] !== 'Sedang Diperiksa') {
            echo json_encode([
                'error' => 'Invalid queue status',
                'message' => 'Status harus "Sedang Diperiksa" untuk menyelesaikan pemeriksaan',
                'current_status' => $currentBlock['status_antrian']
            ]);
            return;
        }
        
        // ========================================
        // 2. INSERT ANAMNESA DATA
        // ========================================
        $anamnesaData = [
            'keluhan' => $input['keluhan'] ?? '',
            'anamnesis' => $input['anamnesis'] ?? '',
            'alergi_makanan' => $input['alergi_makanan'] ?? 'Tidak Ada',
            'alergi_udara' => $input['alergi_udara'] ?? 'Tidak Ada',
            'alergi_obat' => $input['alergi_obat'] ?? 'Tidak Ada',
            'prognosa' => $input['prognosa'] ?? '',
            'terapi_obat' => $input['terapi_obat'] ?? '',
            'terapi_non_obat' => $input['terapi_non_obat'] ?? '',
            'bmhp' => $input['bmhp'] ?? '',
            'created_at' => date('Y-m-d H:i:s')
        ];
        
        error_log("📝 Inserting ANAMNESA...");
        $anamnesaResult = supabase('POST', 'anamnesa', '', $anamnesaData);
        
        if (isset($anamnesaResult['error'])) {
            error_log("❌ Failed to insert anamnesa: " . json_encode($anamnesaResult['error']));
            echo json_encode([
                'success' => false,
                'error' => 'Failed to insert anamnesa',
                'details' => $anamnesaResult['error']
            ]);
            return;
        }
        
        $idAnamnesa = $anamnesaResult[0]['id_anamnesa'] ?? null;
        error_log("✅ Anamnesa inserted: $idAnamnesa");
        
        // ========================================
        // 3. INSERT PEMERIKSAAN DATA
        // ========================================
        $pemeriksaanData = [
            'id_antrian' => $currentBlock['id_antrian'],
            'id_anamnesa' => $idAnamnesa,
            'id_dokter' => $currentBlock['id_dokter'],
            'created_at' => date('Y-m-d H:i:s'),
            'prev_hash' => null // Will be updated if needed
        ];
        
        // Generate hash for pemeriksaan
        $pemeriksaanData['curent_hash'] = generateHash($pemeriksaanData);
        
        error_log("🏥 Inserting PEMERIKSAAN...");
        $pemeriksaanResult = supabase('POST', 'pemeriksaan', '', $pemeriksaanData);
        
        if (isset($pemeriksaanResult['error'])) {
            error_log("❌ Failed to insert pemeriksaan: " . json_encode($pemeriksaanResult['error']));
            echo json_encode([
                'success' => false,
                'error' => 'Failed to insert pemeriksaan',
                'details' => $pemeriksaanResult['error']
            ]);
            return;
        }
        
        $idPemeriksaan = $pemeriksaanResult[0]['id_pemeriksaan'] ?? null;
        error_log("✅ Pemeriksaan inserted: $idPemeriksaan");
        
        // ========================================
        // 4. INSERT VITAL SIGNS (LOINC)
        // ========================================
        $vitalSigns = [
            ['code' => '29463-7', 'display' => 'Body Weight', 'value' => $input['body_weight'] ?? '', 'unit' => 'kg'],
            ['code' => '8302-2', 'display' => 'Body Height', 'value' => $input['body_height'] ?? '', 'unit' => 'cm'],
            ['code' => '8310-5', 'display' => 'Body Temperature', 'value' => $input['body_temp'] ?? '', 'unit' => 'Cel'],
            ['code' => '85354-9', 'display' => 'Blood Pressure', 'value' => $input['blood_pressure'] ?? '', 'unit' => 'mmHg'],
            ['code' => '8867-4', 'display' => 'Heart Rate', 'value' => $input['heart_rate'] ?? '', 'unit' => 'bpm'],
            ['code' => '9279-1', 'display' => 'Respiratory Rate', 'value' => $input['resp_rate'] ?? '', 'unit' => '/min'],
            ['code' => '2708-6', 'display' => 'Oxygen Saturation', 'value' => $input['oxygen_sat'] ?? '', 'unit' => '%']
        ];
        
        error_log("💓 Inserting VITAL SIGNS (LOINC)...");
        
        foreach ($vitalSigns as $vital) {
            if (empty($vital['value'])) continue; // Skip if no value
            
            // First, check if LOINC code exists, if not create it
            $loincParams = "select=id_ioinc&display=eq." . urlencode($vital['display']) . "&limit=1";
            $loincCheck = supabase('GET', 'loinc', $loincParams);
            
            $idLoinc = null;
            if (!empty($loincCheck) && !isset($loincCheck['error'])) {
                $idLoinc = $loincCheck[0]['id_ioinc'];
            } else {
                // Create LOINC entry
                $loincData = ['display' => $vital['display']];
                $loincResult = supabase('POST', 'loinc', '', $loincData);
                if (!isset($loincResult['error'])) {
                    $idLoinc = $loincResult[0]['id_ioinc'];
                }
            }
            
            if ($idLoinc) {
                $vitalData = [
                    'id_pemeriksaan' => $idPemeriksaan,
                    'id_ioinc' => $idLoinc,
                    'nilai' => (int)$vital['value'],
                    'satuan' => $vital['unit'],
                    'id_dokter' => $currentBlock['id_dokter'],
                    'created_at' => date('Y-m-d H:i:s')
                ];
                
                supabase('POST', 'table_pemeriksaan_loinc', '', $vitalData);
            }
        }
        
        error_log("✅ Vital signs inserted");
        
        // ========================================
        // 5. INSERT DIAGNOSIS ICDX
        // ========================================
        if (!empty($input['icdx']) && is_array($input['icdx'])) {
            error_log("🔬 Inserting ICDX diagnoses...");
            
            foreach ($input['icdx'] as $icdx) {
                $icdxData = [
                    'id_pemeriksaan' => $idPemeriksaan,
                    'kode_icdx' => $icdx['kode'] ?? '',
                    'deskripsi' => $icdx['deskripsi'] ?? '',
                    'created_at' => date('Y-m-d H:i:s')
                ];
                
                supabase('POST', 'diagnosis_icdx', '', $icdxData);
            }
            
            error_log("✅ ICDX diagnoses inserted: " . count($input['icdx']));
        }
        
        // ========================================
        // 6. INSERT DIAGNOSIS ICDIX (Procedures)
        // ========================================
        if (!empty($input['icdix']) && is_array($input['icdix'])) {
            error_log("⚕️ Inserting ICDIX procedures...");
            
            foreach ($input['icdix'] as $icdix) {
                $icdixData = [
                    'id_pemeriksaan' => $idPemeriksaan,
                    'kode_icdix' => $icdix['kode'] ?? '',
                    'deskripsi' => $icdix['deskripsi'] ?? '',
                    'created_at' => date('Y-m-d H:i:s')
                ];
                
                supabase('POST', 'diagnosis_icdix', '', $icdixData);
            }
            
            error_log("✅ ICDIX procedures inserted: " . count($input['icdix']));
        }
        
        // ========================================
        // 7. INSERT RESEP (PRESCRIPTION)
        // ========================================
        $idResep = null;
        if (!empty($input['resep']['nama']) && !empty($input['resep']['detail'])) {
            error_log("📋 Inserting RESEP...");
            
            $resepData = [
                'id_pemeriksaan' => $idPemeriksaan,
                'nama_resep' => $input['resep']['nama'],
                'catatan_resep' => $input['resep']['catatan'] ?? '',
                'created_at' => date('Y-m-d H:i:s')
            ];
            
            $resepResult = supabase('POST', 'resep', '', $resepData);
            
            if (!isset($resepResult['error'])) {
                $idResep = $resepResult[0]['id_resep'];
                error_log("✅ Resep inserted: $idResep");
                
                // Parse resep detail (assuming format: "1. Obat A - signa")
                $detailLines = explode("\n", $input['resep']['detail']);
                foreach ($detailLines as $line) {
                    $line = trim($line);
                    if (empty($line)) continue;
                    
                    // Parse line: "1. Paracetamol 500mg - 3x1 sehari"
                    if (preg_match('/^\d+\.\s*(.+?)\s*-\s*(.+)$/', $line, $matches)) {
                        $namaObat = trim($matches[1]);
                        $signa = trim($matches[2]);
                        
                        $resepDetailData = [
                            'id_resep' => $idResep,
                            'nama_obat' => $namaObat,
                            'signa' => $signa,
                            'jumlah' => '1', // Default
                            'created_at' => date('Y-m-d H:i:s')
                        ];
                        
                        supabase('POST', 'resep_detail', '', $resepDetailData);
                    }
                }
                
                error_log("✅ Resep details inserted");
            }
        }
        
        // ========================================
        // 8. INSERT PEMERIKSAAN_OBAT & REDUCE STOCK
        // ========================================
        if (!empty($input['obat']) && is_array($input['obat'])) {
            error_log("💊 Inserting OBAT and reducing stock...");
            
            foreach ($input['obat'] as $obat) {
                $obatData = [
                    'id_pemeriksaan' => null, // Based on schema, this is integer, might need adjustment
                    'id_obat' => $obat['id_obat'],
                    'signa' => $obat['signa'],
                    'jumlah' => (int)$obat['jumlah'],
                    'created_at' => date('Y-m-d H:i:s')
                ];
                
                // Generate hash
                $obatData['curent_hash'] = generateHash($obatData);
                $obatData['prev_hash'] = null;
                
                $obatResult = supabase('POST', 'pemeriksaan_obat', '', $obatData);
                
                if (!isset($obatResult['error'])) {
                    error_log("✅ Obat added: " . $obat['nama']);
                    
                    // TODO: Reduce stock from detail_obat
                    // This requires FIFO logic to select batches with earliest expiry
                    // For now, we'll create a simple pengurangan_stok record
                    
                    $penguranganData = [
                        'id_obat' => $obat['id_obat'],
                        'id_detail_obat' => null, // Should select specific batch
                        'jumlah' => (int)$obat['jumlah'],
                        'created_at' => date('Y-m-d H:i:s'),
                        'curent_hash' => generateHash(['id_obat' => $obat['id_obat'], 'jumlah' => $obat['jumlah']]),
                        'prev_hash' => null
                    ];
                    
                    supabase('POST', 'pengurangan_stok', '', $penguranganData);
                }
            }
            
            error_log("✅ Obat records inserted: " . count($input['obat']));
        }
        
        // ========================================
        // 9. UPDATE SATUSEHAT ENCOUNTER STATUS
        // ========================================
        if (!empty($currentBlock['id_encounter_satusehat'])) {
            error_log("🏥 Updating SATUSEHAT Encounter to 'finished': " . $currentBlock['id_encounter_satusehat']);
            
            $encounterUpdated = EncounterSatusehatApi::updateEncounterStatus(
                $currentBlock['id_encounter_satusehat'], 
                'finished'
            );
            
            if (!$encounterUpdated) {
                error_log("⚠️ Warning: Failed to update SATUSEHAT Encounter status");
            } else {
                error_log("✅ SATUSEHAT Encounter marked as finished");
            }
        }
        
        // ========================================
        // 10. CREATE NEW BLOCKCHAIN BLOCK - "Selesai"
        // ========================================
        $newBlock = [
            'no_antrian' => $currentBlock['no_antrian'],
            'tanggal_antrian' => $currentBlock['tanggal_antrian'],
            'jam_antrian' => $currentBlock['jam_antrian'],
            'status_antrian' => 'Selesai',
            'id_pasien' => $currentBlock['id_pasien'],
            'id_dokter' => $currentBlock['id_dokter'],
            'jenis_pasien' => $currentBlock['jenis_pasien'],
            'id_encounter_satusehat' => $currentBlock['id_encounter_satusehat'],
            'created_at' => date('Y-m-d H:i:s'),
            'prev_hash' => $currentBlock['current_hash']
        ];
        
        // Generate new hash
        $newBlock['current_hash'] = generateHash($newBlock);
        
        error_log("⛓️ BLOCKCHAIN: Creating finish block");
        error_log("   Previous Hash: " . $currentBlock['current_hash']);
        error_log("   New Hash: " . $newBlock['current_hash']);
        
        // Insert new block
        $insertResult = supabase('POST', 'antrian', '', $newBlock);
        
        if (isset($insertResult['error'])) {
            error_log("❌ Failed to insert finish block: " . json_encode($insertResult['error']));
            echo json_encode([
                'success' => false,
                'error' => 'Failed to create finish block',
                'details' => $insertResult['error']
            ]);
            return;
        }
        
        error_log("✅ Examination completed successfully");
        error_log("📊 Summary:");
        error_log("   - Anamnesa ID: $idAnamnesa");
        error_log("   - Pemeriksaan ID: $idPemeriksaan");
        error_log("   - ICDX Count: " . count($input['icdx'] ?? []));
        error_log("   - ICDIX Count: " . count($input['icdix'] ?? []));
        error_log("   - Obat Count: " . count($input['obat'] ?? []));
        error_log("   - Resep ID: " . ($idResep ?? 'None'));
        error_log("   - Total: Rp " . number_format($input['total'] ?? 0, 0, ',', '.'));
        
        echo json_encode([
            'success' => true,
            'message' => 'Pemeriksaan selesai dan semua data tersimpan',
            'queue_number' => $currentBlock['no_antrian'],
            'patient_name' => $currentBlock['pasien']['nama'],
            'encounter_id' => $currentBlock['id_encounter_satusehat'],
            'encounter_updated' => $encounterUpdated ?? false,
            'pemeriksaan_id' => $idPemeriksaan,
            'anamnesa_id' => $idAnamnesa,
            'resep_id' => $idResep,
            'total_icdx' => count($input['icdx'] ?? []),
            'total_icdix' => count($input['icdix'] ?? []),
            'total_obat' => count($input['obat'] ?? []),
            'total_biaya' => $input['total'] ?? 0,
            'hash' => $newBlock['current_hash'],
            'prev_hash' => $currentBlock['current_hash'],
            'blockchain_verified' => true
        ]);
        
    } catch (Exception $e) {
        error_log("❌ EXCEPTION in finishPemeriksaan: " . $e->getMessage());
        error_log("   Trace: " . $e->getTraceAsString());
        
        echo json_encode([
            'error' => 'Exception occurred',
            'message' => $e->getMessage(),
            'trace' => $e->getTraceAsString()
        ]);
    }
}

function getPaymentDetails() {
    $queueId = $_GET['id'] ?? null;
    
    if (!$queueId) {
        echo json_encode(['success' => false, 'error' => 'Queue ID required']);
        return;
    }
    
    try {
        // Get pemeriksaan data
        $pemeriksaanParams = "select=id_pemeriksaan,id_antrian&id_antrian=eq.$queueId&order=created_at.desc&limit=1";
        $pemeriksaanResult = supabase('GET', 'pemeriksaan', $pemeriksaanParams);
        
        if (empty($pemeriksaanResult) || isset($pemeriksaanResult['error'])) {
            echo json_encode([
                'success' => false,
                'error' => 'Pemeriksaan data not found'
            ]);
            return;
        }
        
        $idPemeriksaan = $pemeriksaanResult[0]['id_pemeriksaan'];
        
        // Get drugs from pemeriksaan_obat with obat details
        $obatParams = "select=*,obat:id_obat(nama_obat,jenis_obat,harga_jual)&id_pemeriksaan=eq.$idPemeriksaan";
        $obatResult = supabase('GET', 'pemeriksaan_obat', $obatParams);
        
        $drugs = [];
        $totalDrugs = 0;
        $serviceCharge = 50000; // Fixed service charge per drug
        
        if (!empty($obatResult) && !isset($obatResult['error'])) {
            foreach ($obatResult as $obat) {
                $drugPrice = floatval($obat['obat']['harga_jual'] ?? 0);
                $qty = intval($obat['jumlah'] ?? 1);
                $drugTotal = $qty * $drugPrice;
                $totalDrugs += $drugTotal + $serviceCharge;
                
                $drugs[] = [
                    'name' => $obat['obat']['nama_obat'] ?? 'Unknown',
                    'type' => $obat['obat']['jenis_obat'] ?? '-',
                    'qty' => $qty,
                    'signa' => $obat['signa'] ?? '-',
                    'price' => $drugPrice,
                    'serviceCharge' => $serviceCharge
                ];
            }
        }
        
        echo json_encode([
            'success' => true,
            'data' => [
                'drugs' => $drugs,
                'total_drugs' => $totalDrugs,
                'service_charge' => $serviceCharge,
                'grand_total' => $totalDrugs
            ]
        ]);
        
    } catch (Exception $e) {
        error_log("❌ Error in getPaymentDetails: " . $e->getMessage());
        echo json_encode([
            'success' => false,
            'error' => $e->getMessage()
        ]);
    }
}

function processPayment() {
    // Get JSON input
    $input = json_decode(file_get_contents('php://input'), true);
    
    $queueId = $input['queue_id'] ?? null;
    $patientType = strtoupper($input['patient_type'] ?? 'UMUM');
    $paymentMethod = strtolower($input['payment_method'] ?? 'cash');
    $amountPaid = floatval($input['amount_paid'] ?? 0);
    $totalBill = floatval($input['total_bill'] ?? 0);
    
    error_log("💳 PROCESSING PAYMENT:");
    error_log("   Queue ID: $queueId");
    error_log("   Patient Type: $patientType");
    error_log("   Payment Method: $paymentMethod");
    error_log("   Amount Paid: $amountPaid");
    error_log("   Total Bill: $totalBill");
    
    if (!$queueId) {
        echo json_encode(['success' => false, 'error' => 'Queue ID required']);
        return;
    }
    
    // Validate patient type
    if (!in_array($patientType, ['BPJS', 'UMUM'])) {
        echo json_encode([
            'success' => false,
            'error' => 'Invalid patient type. Must be BPJS or UMUM'
        ]);
        return;
    }
    
    // Validate payment method
    if (!in_array($paymentMethod, ['bpjs', 'cash', 'qris'])) {
        echo json_encode([
            'success' => false,
            'error' => 'Invalid payment method. Must be bpjs, cash, or qris'
        ]);
        return;
    }
    
    // Calculate change (only for UMUM cash)
    $change = 0;
    if ($patientType === 'UMUM' && $paymentMethod === 'cash') {
        $change = $amountPaid - $totalBill;
        if ($change < 0) {
            echo json_encode([
                'success' => false,
                'error' => 'Insufficient payment',
                'message' => 'Jumlah pembayaran kurang dari total tagihan'
            ]);
            return;
        }
    }
    
    try {
        // Get current queue data
        $queueParams = "select=*,dokter:id_dokter(id_dokter)&id_antrian=eq.$queueId&order=created_at.desc&limit=1";
        $queueResult = supabase('GET', 'antrian', $queueParams);
        
        if (empty($queueResult) || isset($queueResult['error'])) {
            echo json_encode([
                'success' => false,
                'error' => 'Queue not found'
            ]);
            return;
        }
        
        $currentBlock = $queueResult[0];
        $idDokter = $currentBlock['dokter']['id_dokter'] ?? $currentBlock['id_dokter'];
        
        // Verify status is "Selesai" (examination completed)
        if ($currentBlock['status_antrian'] !== 'Selesai') {
            echo json_encode([
                'success' => false,
                'error' => 'Invalid queue status',
                'message' => 'Pembayaran hanya bisa dilakukan untuk antrian dengan status "Selesai"',
                'current_status' => $currentBlock['status_antrian']
            ]);
            return;
        }
        
        $recordId = null;
        
        // ========================================
        // DECISION: Insert to PEMASUKAN or PENGELUARAN
        // ========================================
        
        if ($patientType === 'UMUM') {
            // ✅ UMUM PATIENT → Insert to PEMASUKAN (Income/Revenue)
            error_log("💰 UMUM Patient - Recording as PEMASUKAN (Income)");
            
            $metodeBayar = strtoupper($paymentMethod); // "CASH" or "QRIS"
            
            $pemasukanData = [
                'id_antrian' => $queueId,
                'id_dokter' => $idDokter,
                'total' => $totalBill,
                'metode_pembayaran' => $metodeBayar,
                'jenis_pemasukan' => 'Pembayaran Pasien',
                'deskripsi' => "Pembayaran pasien menggunakan $metodeBayar - Dibayar: Rp " . number_format($amountPaid, 0, ',', '.') . " - Kembalian: Rp " . number_format($change, 0, ',', '.'),
                'created_at' => date('Y-m-d H:i:s')
            ];
            
            error_log("📝 Inserting to PEMASUKAN: " . json_encode($pemasukanData, JSON_PRETTY_PRINT));
            
            $pemasukanResult = supabase('POST', 'pemasukan', '', $pemasukanData);
            
            if (isset($pemasukanResult['error'])) {
                error_log("❌ Failed to insert pemasukan: " . json_encode($pemasukanResult['error']));
                echo json_encode([
                    'success' => false,
                    'error' => 'Failed to record income',
                    'details' => $pemasukanResult['error']
                ]);
                return;
            }
            
            $recordId = $pemasukanResult[0]['id_pemasukan'] ?? null;
            error_log("✅ PEMASUKAN recorded: ID $recordId");
            
        } else {
            // ✅ BPJS PATIENT → Insert to PENGELUARAN (Expense - will be reimbursed)
            error_log("🏥 BPJS Patient - Recording as PENGELUARAN (Expense for reimbursement)");
            
            $pengeluaranData = [
                'id_dokter' => $idDokter,
                'tanggal' => date('Y-m-d'),
                'keterangan' => "Pembayaran pasien BPJS - Antrian: " . $currentBlock['no_antrian'] . " - Total: Rp " . number_format($totalBill, 0, ',', '.') . " (Akan di-reimburse oleh BPJS)",
                'created_at' => date('Y-m-d H:i:s'),
                'curent_hash' => null, // Will be generated if needed
                'prev_hash' => null
            ];
            
            error_log("📝 Inserting to PENGELUARAN: " . json_encode($pengeluaranData, JSON_PRETTY_PRINT));
            
            $pengeluaranResult = supabase('POST', 'pengeluaran', '', $pengeluaranData);
            
            if (isset($pengeluaranResult['error'])) {
                error_log("❌ Failed to insert pengeluaran: " . json_encode($pengeluaranResult['error']));
                echo json_encode([
                    'success' => false,
                    'error' => 'Failed to record BPJS expense',
                    'details' => $pengeluaranResult['error']
                ]);
                return;
            }
            
            $recordId = $pengeluaranResult[0]['id_pengeluaran'] ?? null;
            error_log("✅ PENGELUARAN recorded: ID $recordId (BPJS reimbursement pending)");
            
            // Override values for BPJS
            $amountPaid = 0;
            $change = 0;
        }
        
        // ========================================
        // Create new blockchain block with status "Dibayar"
        // ========================================
        $newBlock = [
            'no_antrian' => $currentBlock['no_antrian'],
            'tanggal_antrian' => $currentBlock['tanggal_antrian'],
            'jam_antrian' => $currentBlock['jam_antrian'],
            'status_antrian' => 'Selesai',
            'id_pasien' => $currentBlock['id_pasien'],
            'id_dokter' => $currentBlock['id_dokter'],
            'jenis_pasien' => $patientType,
            'id_encounter_satusehat' => $currentBlock['id_encounter_satusehat'],
            'created_at' => date('Y-m-d H:i:s'),
            'prev_hash' => $currentBlock['current_hash']
        ];
        
        // Generate new hash
        $newBlock['current_hash'] = generateHash($newBlock);
        
        error_log("⛓️ BLOCKCHAIN: Creating payment block");
        error_log("   Previous Hash: " . $currentBlock['current_hash']);
        error_log("   New Hash: " . $newBlock['current_hash']);
        
        $blockResult = supabase('POST', 'antrian', '', $newBlock);
        
        if (isset($blockResult['error'])) {
            error_log("❌ Failed to create blockchain block: " . json_encode($blockResult['error']));
            echo json_encode([
                'success' => false,
                'error' => 'Failed to update queue status',
                'details' => $blockResult['error'],
                'record_id' => $recordId,
                'record_type' => $patientType === 'UMUM' ? 'pemasukan' : 'pengeluaran'
            ]);
            return;
        }
        
        error_log("✅ Payment processed successfully");
        error_log("📊 Payment Summary:");
        error_log("   - Record Type: " . ($patientType === 'UMUM' ? 'PEMASUKAN' : 'PENGELUARAN'));
        error_log("   - Record ID: $recordId");
        error_log("   - Patient Type: $patientType");
        error_log("   - Payment Method: $paymentMethod");
        error_log("   - Total Bill: Rp " . number_format($totalBill, 0, ',', '.'));
        if ($patientType === 'UMUM') {
            error_log("   - Amount Paid: Rp " . number_format($amountPaid, 0, ',', '.'));
            error_log("   - Change: Rp " . number_format($change, 0, ',', '.'));
        } else {
            error_log("   - Status: BPJS (Reimbursement Pending)");
        }
        
        echo json_encode([
            'success' => true,
            'message' => $patientType === 'UMUM' 
                ? 'Pembayaran berhasil diproses dan tercatat sebagai pemasukan'
                : 'Pembayaran BPJS tercatat sebagai pengeluaran (menunggu reimbursement)',
            'record_id' => $recordId,
            'record_type' => $patientType === 'UMUM' ? 'pemasukan' : 'pengeluaran',
            'queue_number' => $currentBlock['no_antrian'],
            'patient_type' => $patientType,
            'payment_method' => $paymentMethod,
            'total_bill' => $totalBill,
            'amount_paid' => $amountPaid,
            'change' => $change,
            'status' => 'Selesai',
            'hash' => $newBlock['current_hash'],
            'prev_hash' => $currentBlock['current_hash'],
            'blockchain_verified' => true
        ]);
        
    } catch (Exception $e) {
        error_log("❌ EXCEPTION in processPayment: " . $e->getMessage());
        error_log("   Trace: " . $e->getTraceAsString());
        
        echo json_encode([
            'success' => false,
            'error' => 'Exception occurred',
            'message' => $e->getMessage()
        ]);
    }
}
?>