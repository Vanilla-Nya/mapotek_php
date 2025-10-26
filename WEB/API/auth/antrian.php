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
 * List all queues for a specific doctor
 * GET: ?action=list_by_doctor&dokter_id=xxx
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
    $payload = json_encode([$dokterId]);

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
        echo json_encode(['error' => 'cURL Error', 'message' => $err]);
        return;
    }

    if ($httpCode < 200 || $httpCode >= 300) {
        echo json_encode(['error' => 'HTTP Error', 'code' => $httpCode, 'response' => $response]);
        return;
    }
    
    echo $response;
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
function filterByHour() {
    $tanggal = $_GET['tanggal'] ?? date('Y-m-d');
    $jamMulai = $_GET['jam_mulai'] ?? '00:00';
    $jamAkhir = $_GET['jam_akhir'] ?? '23:59';
    $dokterId = $_GET['dokter_id'] ?? null;
    
    if (!$dokterId) {
        echo json_encode(['error' => 'dokter_id required']);
        return;
    }
    
    $params = "select=*,pasien:id_pasien(nama,nik,no_telp,id_satusehat,tanggal_lahir)&id_dokter=eq.$dokterId&tanggal_antrian=eq.$tanggal&jam_antrian=gte.$jamMulai&jam_antrian=lte.$jamAkhir&order=jam_antrian.asc";
    
    $result = supabase('GET', 'antrian', $params);
    echo json_encode($result);
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
        
        error_log("✅ FINISHING EXAMINATION (BLOCKCHAIN): " . json_encode($currentBlock, JSON_PRETTY_PRINT));
        
        // Check if status is "Sedang Periksa"
        if ($currentBlock['status_antrian'] !== 'Sedang Diperiksa') {
            echo json_encode([
                'error' => 'Invalid queue status',
                'message' => 'Status harus "Sedang Periksa" untuk menyelesaikan pemeriksaan',
                'current_status' => $currentBlock['status_antrian']
            ]);
            return;
        }
        
        // 🏥 UPDATE SATUSEHAT ENCOUNTER STATUS TO "FINISHED"
        if (!empty($currentBlock['id_encounter_satusehat'])) {
            error_log("🏥 Updating SATUSEHAT Encounter to 'finished': " . $currentBlock['id_encounter_satusehat']);
            
            $encounterUpdated = EncounterSatusehatApi::updateEncounterStatus(
                $currentBlock['id_encounter_satusehat'], 
                'finished'
            );
            
            if (!$encounterUpdated) {
                error_log("⚠️ Warning: Failed to update SATUSEHAT Encounter status");
                // Continue anyway - blockchain record is more important
            } else {
                error_log("✅ SATUSEHAT Encounter marked as finished");
            }
        }
        
        // 🔥 BLOCKCHAIN: Create new block with "Selesai" status
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
        
        echo json_encode([
            'success' => true,
            'message' => 'Pemeriksaan selesai',
            'queue_number' => $currentBlock['no_antrian'],
            'encounter_id' => $currentBlock['id_encounter_satusehat'],
            'encounter_updated' => $encounterUpdated ?? false,
            'hash' => $newBlock['current_hash'],
            'prev_hash' => $currentBlock['current_hash']
        ]);
        
    } catch (Exception $e) {
        error_log("❌ EXCEPTION in finishPemeriksaan: " . $e->getMessage());
        echo json_encode([
            'error' => 'Exception occurred',
            'message' => $e->getMessage()
        ]);
    }
}
?>