<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);

// API/auth/antrian.php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, PATCH');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

require_once __DIR__ . '/encounter_satusehat_api.php';
require_once __DIR__ . '/../ApiClient.php';
require_once __DIR__ . '/satusehat_clinical_api.php';

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
    exit;
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
 */
function checkSatusehat() {
    $patientId = $_GET['id_pasien'] ?? null;
    
    if (!$patientId) {
        echo json_encode([
            'success' => false,
            'error' => 'id_pasien required'
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
 * Register patient to SATUSEHAT
 */
function registerSatusehat()
{
    $input = json_decode(file_get_contents('php://input'), true);
    $patientId = $input['id_pasien'] ?? null;
    $dokterId = $input['id_dokter'] ?? null;

    if (!$patientId) {
        echo json_encode([
            'success' => false,
            'error' => 'id_pasien required'
        ]);
        return;
    }

    if (!$dokterId) {
        echo json_encode([
            'success' => false,
            'error' => 'doctor_id required'
        ]);
        return;
    }

    error_log("🏥 REGISTERING PATIENT TO SATUSEHAT: $patientId");
    error_log("👨‍⚕️ Doctor ID: $dokterId");

    try {
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

        require_once __DIR__ . '/../config/satusehat_api.php';
        $satusehatApi = SatuSehatAPI::forDoctor($dokterId);

        if (!$satusehatApi->isConfigured()) {
            echo json_encode([
                'success' => false,
                'error' => 'SatuSehat belum dikonfigurasi. Silakan lengkapi di halaman Profil.'
            ]);
            return;
        }

        $satusehatId = searchSatusehatByNik(
            $satusehatApi,
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
        error_log("   Trace: " . $e->getTraceAsString());
        echo json_encode([
            'success' => false,
            'error' => 'Exception occurred',
            'message' => $e->getMessage()
        ]);
    }
}

/**
 * Search patient in SATUSEHAT by NIK
 */
function searchSatusehatByNik($satusehatApi, $nik, $expectedName = null, $expectedBirthDate = null)
{
    try {
        error_log("🔍 Searching SATUSEHAT for NIK: $nik");
        
        $data = $satusehatApi->get('/Patient?identifier=https://fhir.kemkes.go.id/id/nik|' . urlencode($nik));
        
        error_log("📥 SATUSEHAT API Response: " . substr(json_encode($data), 0, 500));
        
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
            
            $patientName = '';
            if (isset($resource['name'][0]['text'])) {
                $patientName = $resource['name'][0]['text'];
            } elseif (isset($resource['name'][0])) {
                $nameParts = [];
                if (isset($resource['name'][0]['given'])) {
                    $nameParts = array_merge($nameParts, $resource['name'][0]['given']);
                }
                if (isset($resource['name'][0]['family'])) {
                    $nameParts[] = $resource['name'][0]['family'];
                }
                $patientName = implode(' ', $nameParts);
            }
            $patientName = strtolower(trim($patientName));
            
            $birthDate = $resource['birthDate'] ?? '';

            error_log("🧾 Checking patient: ID=$id, name=$patientName, birthDate=$birthDate");

            $nameMatch = empty($expectedName) || 
                         strpos($patientName, $expectedName) !== false || 
                         strpos($expectedName, $patientName) !== false;
            
            $birthMatch = empty($expectedBirthDate) || 
                          $birthDate === $expectedBirthDate;

            if ($nameMatch && $birthMatch) {
                $matchedId = $id;
                error_log("✅ Found matching patient in SATUSEHAT: $id (name: $patientName, dob: $birthDate)");
                break;
            }
        }

        if (!$matchedId && count($data['entry']) > 0) {
            $fallbackId = $data['entry'][0]['resource']['id'] ?? null;
            if ($fallbackId) {
                error_log("⚠️ No exact match (name/birthDate), using first entry as fallback: $fallbackId");
                $matchedId = $fallbackId;
            }
        }

        return $matchedId;

    } catch (Exception $e) {
        error_log("❌ Exception in searchSatusehatByNik: " . $e->getMessage());
        error_log("   Stack trace: " . $e->getTraceAsString());
        return null;
    }
}

/**
 * Search patients by name or NIK
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
 * Generate unique queue number
 */
function generateQueueNumber() {
    $today = date('dmy');
    $tanggal = date('Y-m-d');

    try {
        $params = "select=no_antrian&tanggal_antrian=eq.$tanggal&order=no_antrian.desc&limit=1";
        $result = supabase('GET', 'antrian', $params);

        $lastCounter = 0;
        
        if (!empty($result) && isset($result[0]['no_antrian'])) {
            $lastNumber = $result[0]['no_antrian'];
            
            if (strlen($lastNumber) >= 9) {
                $counterPart = substr($lastNumber, 6, 3);
                $lastCounter = intval($counterPart);
                
                error_log("🔍 Last queue number: $lastNumber");
                error_log("🔍 Extracted counter: $counterPart → $lastCounter");
            }
        } else {
            error_log("📋 No previous queue for today - starting from 001");
        }

        $newCounter = $lastCounter + 1;
        $queueNumber = $today . str_pad($newCounter, 3, '0', STR_PAD_LEFT);

        error_log("✅ Generated queue number: $queueNumber (counter: $newCounter)");

        echo json_encode([
            'success' => true,
            'no_antrian' => $queueNumber,
            'tanggal' => $tanggal,
            'counter' => $newCounter
        ]);
        
    } catch (Exception $e) {
        error_log("❌ Error in generateQueueNumber: " . $e->getMessage());
        echo json_encode([
            'success' => false,
            'error' => 'Failed to generate queue number',
            'message' => $e->getMessage()
        ]);
    }
}

/**
 * List queues by doctor
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
    
    $payload = json_encode([
        'p_dokter' => $dokterId
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
 * Filter queues by hour range
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
    
    $payload = json_encode([
        'p_dokter' => $dokterId
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
    
    $data = json_decode($response, true);
    
    if (!is_array($data)) {
        error_log("❌ Invalid response format");
        echo json_encode(['error' => 'Invalid response format']);
        return;
    }
    
    error_log("✅ RPC call successful, total rows: " . count($data));
    
    $filtered = array_filter($data, function($queue) use ($tanggal, $jamMulai, $jamAkhir) {
        $queueDate = $queue['tanggal_antrian'] ?? '';
        $queueTime = $queue['jam_antrian'] ?? '';
        
        if ($queueDate !== $tanggal) {
            return false;
        }
        
        if (!empty($queueTime)) {
            $queueTime = substr($queueTime, 0, 5);
        }
        
        if ($queueTime < $jamMulai || $queueTime > $jamAkhir) {
            return false;
        }
        
        return true;
    });
    
    $filtered = array_values($filtered);
    
    error_log("📊 Filter Results:");
    error_log("   Total from DB: " . count($data));
    error_log("   After filter: " . count($filtered));
    error_log("   Date: $tanggal");
    error_log("   Time: $jamMulai - $jamAkhir");
    
    echo json_encode($filtered);
}

/**
 * 🔥 BLOCKCHAIN: CREATE QUEUE
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
    
    $checkParams = "select=id_antrian&no_antrian=eq." . $input['no_antrian'];
    $existing = supabase('GET', 'antrian', $checkParams);
    
    if (!empty($existing) && !isset($existing['error'])) {
        echo json_encode([
            'error' => 'Queue number already exists',
            'message' => 'Nomor antrian sudah digunakan'
        ]);
        return;
    }
    
    $data = [
        'no_antrian' => $input['no_antrian'],
        'tanggal_antrian' => $input['tanggal_antrian'],
        'jam_antrian' => $input['jam_antrian'],
        'status_antrian' => 'Belum Periksa',
        'id_pasien' => $input['id_pasien'],
        'id_dokter' => $input['id_dokter'],
        'jenis_pasien' => $jenisPasien,
        'created_at' => date('Y-m-d H:i:s'),
        'prev_hash' => null
    ];
    
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
 * 🔥 BLOCKCHAIN: ACCEPT QUEUE
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
        
        $newBlock = [
            'no_antrian' => $currentBlock['no_antrian'],
            'tanggal_antrian' => $currentBlock['tanggal_antrian'],
            'jam_antrian' => $currentBlock['jam_antrian'],
            'status_antrian' => 'Di Terima',
            'id_pasien' => $currentBlock['id_pasien'],
            'id_dokter' => $currentBlock['id_dokter'],
            'jenis_pasien' => $newJenisPasien ?? $currentBlock['jenis_pasien'],
            'created_at' => date('Y-m-d H:i:s'),
            'prev_hash' => $currentBlock['current_hash']
        ];
        
        $newBlock['current_hash'] = generateHash($newBlock);
        
        error_log("⛓️ BLOCKCHAIN: Creating new block");
        error_log("   Previous Hash: " . $currentBlock['current_hash']);
        error_log("   New Hash: " . $newBlock['current_hash']);
        
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
 * 🔥 BLOCKCHAIN: DELETE QUEUE
 */
function deleteQueue() {
    $id = $_GET['id'] ?? null;
    
    if (!$id) {
        echo json_encode(['error' => 'ID required']);
        return;
    }
    
    try {
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
            'prev_hash' => $currentBlock['current_hash']
        ];
        
        $newBlock['current_hash'] = generateHash($newBlock);
        
        error_log("⛓️ BLOCKCHAIN: Creating cancellation block");
        error_log("   Previous Hash: " . $currentBlock['current_hash']);
        error_log("   New Hash: " . $newBlock['current_hash']);
        
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
 * 🔥 BLOCKCHAIN: PERIKSA QUEUE - START EXAMINATION
 * ⚠️ CRITICAL: Returns NEW id_antrian that MUST be used for all subsequent operations
 */
function periksaQueue() {
    $id = $_GET['id'] ?? null;
    
    if (!$id) {
        echo json_encode(['error' => 'ID required']);
        return;
    }
    
    try {
        // ========================================
        // STEP 1: Get current queue data
        // ========================================
        $params = "select=*,pasien:id_pasien(nama,id_satusehat),dokter:id_dokter(id_dokter,nama_lengkap,id_satusehat)&id_antrian=eq.$id";
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
        
        $currentStatus = $currentBlock['status_antrian'];
        
        // ✅ If already "Sedang Diperiksa", return existing data
        if ($currentStatus === 'Sedang Diperiksa') {
            echo json_encode([
                'success' => true,
                'message' => 'Pemeriksaan sudah berlangsung',
                'status' => 'already_in_progress',
                'id_antrian' => $currentBlock['id_antrian'],
                'queue_number' => $currentBlock['no_antrian'],
                'patient_name' => $currentBlock['pasien']['nama'] ?? 'Unknown',
                'doctor_name' => $currentBlock['dokter']['nama_lengkap'] ?? 'Unknown',
                'id_encounter_satusehat' => $currentBlock['id_encounter_satusehat'] ?? null,
                'hash' => $currentBlock['current_hash']
            ]);
            return;
        }
        
        // ✅ Verify status is "Di Terima"
        if ($currentStatus !== 'Di Terima') {
            echo json_encode([
                'error' => 'Invalid queue status',
                'message' => 'Antrian harus berstatus "Di Terima" untuk memulai pemeriksaan',
                'current_status' => $currentStatus
            ]);
            return;
        }
        
        // ========================================
        // STEP 2: Verify patient has SatuSehat ID
        // ========================================
        $patientSatusehatId = $currentBlock['pasien']['id_satusehat'] ?? null;
        $patientName = $currentBlock['pasien']['nama'] ?? 'Unknown';
        
        if (!$patientSatusehatId) {
            echo json_encode([
                'error' => 'Patient missing SatuSehat ID',
                'message' => 'Pasien belum memiliki ID SatuSehat. Harap daftarkan pasien ke SatuSehat terlebih dahulu.',
                'patient_name' => $patientName
            ]);
            return;
        }
        
        // ========================================
        // STEP 3: Get FULL doctor ID and verify credentials
        // ========================================
        
        // ⚠️ FIX: Get the full doctor ID from nested relation
        $idDokter = null;
        
        // Try nested relation first (most reliable)
        if (isset($currentBlock['dokter']['id_dokter'])) {
            $idDokter = $currentBlock['dokter']['id_dokter'];
            error_log("✅ Got doctor ID from nested relation: $idDokter");
        } 
        // Fallback to direct field
        else if (isset($currentBlock['id_dokter'])) {
            $idDokter = $currentBlock['id_dokter'];
            error_log("⚠️ Got doctor ID from direct field: $idDokter");
        }
        
        if (!$idDokter) {
            error_log("❌ No doctor ID found in queue data");
            echo json_encode([
                'success' => false,
                'error' => 'Doctor ID missing',
                'message' => 'ID dokter tidak ditemukan di data antrian'
            ]);
            return;
        }
        
        // Verify UUID format
        $uuidPattern = '/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i';
        if (!preg_match($uuidPattern, $idDokter)) {
            error_log("❌ Invalid UUID format: $idDokter");
            echo json_encode([
                'success' => false,
                'error' => 'Invalid doctor ID format',
                'message' => 'Format ID dokter tidak valid (bukan UUID)',
                'doctor_id' => $idDokter
            ]);
            return;
        }
        
        error_log("👨‍⚕️ Fetching doctor credentials for ID: $idDokter");
        
        // ✅ FIX: Query with CORRECT column names from database
        $doctorParams = "select=id_dokter,nama_lengkap,id_satusehat,satusehat_client_id,satusehat_client_secret,satusehat_org_id,satusehat_enabled&id_dokter=eq.$idDokter&limit=1";
        $doctorCheck = supabase('GET', 'dokter', $doctorParams);
        
        error_log("🔍 Doctor query: GET dokter?$doctorParams");
        error_log("📥 Doctor query result: " . json_encode($doctorCheck));
        
        // Check if doctor record exists
        if (empty($doctorCheck) || isset($doctorCheck['error'])) {
            error_log("❌ Failed to fetch doctor record");
            error_log("   Doctor ID used in query: $idDokter");
            error_log("   Error: " . json_encode($doctorCheck['error'] ?? 'No error details'));
            
            echo json_encode([
                'success' => false,
                'error' => 'Doctor not found in database',
                'message' => 'Data dokter tidak ditemukan di sistem.\n\nPastikan akun dokter sudah terdaftar dan memiliki akses ke sistem.',
                'doctor_id' => $idDokter,
                'hint' => 'Periksa apakah ID dokter di tabel antrian sesuai dengan tabel dokter'
            ]);
            return;
        }
        
        $doctorCreds = $doctorCheck[0];
        $doctorName = $doctorCreds['nama_lengkap'] ?? 'Unknown';
        $doctorSatusehatId = $doctorCreds['id_satusehat'] ?? null;
        
        // ✅ FIX: Use correct field names for checking credentials
        error_log("✅ Doctor record found: " . $doctorName);
        error_log("📋 Checking credentials...");
        error_log("   Client ID: " . (empty($doctorCreds['satusehat_client_id']) ? '❌ MISSING' : '✅ OK'));
        error_log("   Client Secret: " . (empty($doctorCreds['satusehat_client_secret']) ? '❌ MISSING' : '✅ OK'));
        error_log("   Organization ID: " . (empty($doctorCreds['satusehat_org_id']) ? '❌ MISSING' : '✅ OK'));
        error_log("   Practitioner ID: " . (empty($doctorSatusehatId) ? '❌ MISSING' : '✅ OK'));
        error_log("   SatuSehat Enabled: " . (($doctorCreds['satusehat_enabled'] ?? false) ? '✅ YES' : '❌ NO'));
        
        // ⚠️ Check if SatuSehat is enabled
        if (!($doctorCreds['satusehat_enabled'] ?? false)) {
            error_log("⚠️ SatuSehat is disabled for this doctor");
            echo json_encode([
                'success' => false,
                'error' => 'SatuSehat not enabled',
                'message' => "⚠️ SATUSEHAT BELUM DIAKTIFKAN\n\n" .
                            "SatuSehat belum diaktifkan untuk Dr. " . $doctorName . "\n\n" .
                            "Silakan:\n" .
                            "1. Buka halaman Profil\n" .
                            "2. Scroll ke 'Konfigurasi SatuSehat API'\n" .
                            "3. Aktifkan toggle 'Aktif'\n" .
                            "4. Klik Simpan",
                'action_required' => 'Enable SatuSehat in Profile',
                'doctor_name' => $doctorName
            ]);
            return;
        }
        
        // ⚠️ Check if credentials are configured
        if (empty($doctorCreds['satusehat_client_id']) || empty($doctorCreds['satusehat_client_secret'])) {
            error_log("⚠️ Doctor has no SatuSehat credentials configured");
            
            $missingFields = [];
            if (empty($doctorCreds['satusehat_client_id'])) $missingFields[] = 'Client ID';
            if (empty($doctorCreds['satusehat_client_secret'])) $missingFields[] = 'Client Secret';
            
            echo json_encode([
                'success' => false,
                'error' => 'SatuSehat not configured',
                'message' => "⚠️ KONFIGURASI SATUSEHAT DIPERLUKAN\n\n" .
                            "Kredensial SatuSehat belum lengkap untuk Dr. " . $doctorName . "\n\n" .
                            "Yang belum dikonfigurasi:\n" .
                            "✗ " . implode("\n✗ ", $missingFields) . "\n\n" .
                            "Silakan lengkapi di halaman Profil > Konfigurasi SatuSehat API",
                'action_required' => 'Configure SatuSehat in Profile',
                'doctor_name' => $doctorName,
                'missing_fields' => $missingFields
            ]);
            return;
        }
        
        if (empty($doctorCreds['satusehat_org_id'])) {
            error_log("⚠️ Doctor has no Organization ID configured");
            echo json_encode([
                'success' => false,
                'error' => 'Organization ID missing',
                'message' => "⚠️ ORGANIZATION ID BELUM DIKONFIGURASI\n\n" .
                            "Organization ID diperlukan untuk membuat Encounter.\n\n" .
                            "Silakan lengkapi di halaman Profil > Konfigurasi SatuSehat API",
                'action_required' => 'Add Organization ID in Profile'
            ]);
            return;
        }
        
        if (!$doctorSatusehatId) {
            error_log("⚠️ Doctor has no Practitioner ID configured");
            echo json_encode([
                'success' => false,
                'error' => 'Practitioner ID missing',
                'message' => "⚠️ PRACTITIONER ID BELUM DIKONFIGURASI\n\n" .
                            "Practitioner ID (IHS Number) diperlukan untuk membuat Encounter.\n\n" .
                            "Silakan:\n" .
                            "1. Buka halaman Profil\n" .
                            "2. Scroll ke field 'ID SatuSehat (Practitioner)'\n" .
                            "3. Klik tombol 'Cari' (🔍)\n" .
                            "4. Sistem akan mencari ID Anda otomatis",
                'action_required' => 'Search Practitioner ID in Profile',
                'hint' => 'Gunakan fitur pencarian otomatis di halaman Profil'
            ]);
            return;
        }
        
        error_log("✅ All SatuSehat credentials are configured and valid");
        
        // ========================================
        // STEP 4: Create SATUSEHAT Encounter
        // ========================================
        error_log("🏥 Creating SATUSEHAT Encounter...");
        error_log("   Patient: $patientName (ID: $patientSatusehatId)");
        error_log("   Doctor: $doctorName (ID: $doctorSatusehatId)");
        error_log("   Doctor DB ID: $idDokter");
        error_log("   Organization ID: " . $doctorCreds['satusehat_org_id']);
        
        $encounterNumber = 'ENC-' . $currentBlock['no_antrian'] . '-' . date('His');
        
        try {
            $encounterId = EncounterSatusehatApi::createEncounter(
                $patientSatusehatId,
                $patientName,
                $doctorSatusehatId,
                $doctorName,
                null,  // locationId - will use default
                null,  // locationDisplay - will use default
                $encounterNumber
            );
            
            if (!$encounterId) {
                error_log("❌ Failed to create SATUSEHAT Encounter - Check error logs above");
                
                echo json_encode([
                    'success' => false,
                    'error' => 'Failed to create SATUSEHAT Encounter',
                    'message' => "❌ GAGAL MEMBUAT ENCOUNTER DI SATUSEHAT\n\n" .
                                "Kemungkinan penyebab:\n" .
                                "1. Kredensial SatuSehat tidak valid\n" .
                                "2. Organization ID tidak sesuai\n" .
                                "3. Practitioner ID tidak terdaftar\n" .
                                "4. Koneksi internet bermasalah\n" .
                                "5. Server SatuSehat sedang maintenance\n\n" .
                                "Solusi:\n" .
                                "• Test koneksi di halaman Profil\n" .
                                "• Cek konfigurasi SatuSehat API\n" .
                                "• Hubungi administrator jika masalah berlanjut",
                    'hint' => 'Cek PHP error logs untuk detail lengkap'
                ]);
                return;
            }
            
            error_log("✅ SATUSEHAT Encounter created successfully: $encounterId");
            
        } catch (Exception $e) {
            error_log("❌ EXCEPTION creating Encounter: " . $e->getMessage());
            error_log("   File: " . $e->getFile() . " Line: " . $e->getLine());
            error_log("   Trace: " . $e->getTraceAsString());
            
            echo json_encode([
                'success' => false,
                'error' => 'Exception occurred',
                'message' => "❌ TERJADI ERROR SAAT MEMBUAT ENCOUNTER\n\n" .
                            "Error: " . $e->getMessage() . "\n\n" .
                            "Silakan coba lagi atau hubungi administrator.",
                'technical_details' => [
                    'file' => $e->getFile(),
                    'line' => $e->getLine()
                ]
            ]);
            return;
        }
        
        // ========================================
        // STEP 5: Create new blockchain block
        // ========================================
        $newBlock = [
            'no_antrian' => $currentBlock['no_antrian'],
            'tanggal_antrian' => $currentBlock['tanggal_antrian'],
            'jam_antrian' => $currentBlock['jam_antrian'],
            'status_antrian' => 'Sedang Diperiksa',
            'id_pasien' => $currentBlock['id_pasien'],
            'id_dokter' => $idDokter, // ⚠️ Use the verified full ID
            'jenis_pasien' => $currentBlock['jenis_pasien'],
            'id_encounter_satusehat' => $encounterId,
            'created_at' => date('Y-m-d H:i:s'),
            'prev_hash' => $currentBlock['current_hash']
        ];
        
        $newBlock['current_hash'] = generateHash($newBlock);
        
        error_log("⛓️ BLOCKCHAIN: Creating examination block");
        error_log("   Previous Hash: " . $currentBlock['current_hash']);
        error_log("   New Hash: " . $newBlock['current_hash']);
        error_log("   Encounter ID: " . $encounterId);
        
        $insertResult = supabase('POST', 'antrian', '', $newBlock);
        
        if (isset($insertResult['error'])) {
            error_log("❌ Failed to insert examination block: " . json_encode($insertResult['error']));
            
            // Rollback: Cancel the encounter
            error_log("🔄 Attempting to cancel SATUSEHAT Encounter...");
            try {
                EncounterSatusehatApi::updateEncounterStatus($encounterId, 'cancelled');
                error_log("✅ Encounter cancelled successfully");
            } catch (Exception $e) {
                error_log("⚠️ Failed to cancel encounter: " . $e->getMessage());
            }
            
            echo json_encode([
                'success' => false,
                'error' => 'Failed to create examination block',
                'message' => '❌ Gagal membuat record pemeriksaan di database.\n\nEncounter SatuSehat telah dibatalkan.\n\nSilakan coba lagi.',
                'details' => $insertResult['error']
            ]);
            return;
        }
        
        $newIdAntrian = $insertResult[0]['id_antrian'] ?? null;
        
        error_log("✅ Examination block created successfully");
        error_log("⚠️ CRITICAL: NEW id_antrian created: $newIdAntrian");
        error_log("   Old ID: $id");
        error_log("   New ID: $newIdAntrian");
        
        // ========================================
        // SUCCESS RESPONSE
        // ========================================
        echo json_encode([
            'success' => true,
            'message' => '✅ Pemeriksaan berhasil dimulai!\n\nData telah tersinkronisasi dengan SatuSehat.',
            'status' => 'started',
            'id_antrian' => $newIdAntrian,
            'queue_number' => $currentBlock['no_antrian'],
            'patient_name' => $patientName,
            'doctor_name' => $doctorName,
            'id_encounter_satusehat' => $encounterId,
            'encounter_number' => $encounterNumber,
            'hash' => $newBlock['current_hash'],
            'prev_hash' => $currentBlock['current_hash'],
            'blockchain_verified' => true
        ]);
        
    } catch (Exception $e) {
        error_log("❌ EXCEPTION in periksaQueue: " . $e->getMessage());
        error_log("   File: " . $e->getFile() . " Line: " . $e->getLine());
        error_log("   Trace: " . $e->getTraceAsString());
        
        echo json_encode([
            'error' => 'Exception occurred',
            'message' => '❌ Terjadi kesalahan sistem:\n\n' . $e->getMessage() . '\n\nSilakan coba lagi atau hubungi administrator.',
            'hint' => 'Cek PHP error logs untuk informasi lengkap'
        ]);
    }
}

/**
 * 🚪 EXIT PEMERIKSAAN
 */
function exitPemeriksaan() {
    $id = $_GET['id'] ?? null;
    
    if (!$id) {
        echo json_encode(['error' => 'ID required']);
        return;
    }
    
    try {
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
        
        if ($currentBlock['status_antrian'] !== 'Sedang Diperiksa') {
            echo json_encode([
                'error' => 'Invalid queue status',
                'message' => 'Hanya pemeriksaan yang sedang berlangsung yang bisa di-exit',
                'current_status' => $currentBlock['status_antrian']
            ]);
            return;
        }
        
        $newBlock = [
            'no_antrian' => $currentBlock['no_antrian'],
            'tanggal_antrian' => $currentBlock['tanggal_antrian'],
            'jam_antrian' => $currentBlock['jam_antrian'],
            'status_antrian' => 'Di Terima',
            'id_pasien' => $currentBlock['id_pasien'],
            'id_dokter' => $currentBlock['id_dokter'],
            'jenis_pasien' => $currentBlock['jenis_pasien'],
            'id_encounter_satusehat' => $currentBlock['id_encounter_satusehat'],
            'created_at' => date('Y-m-d H:i:s'),
            'prev_hash' => $currentBlock['current_hash']
        ];
        
        $newBlock['current_hash'] = generateHash($newBlock);
        
        error_log("⛓️ BLOCKCHAIN: Creating exit block (status: Di Terima, keeping encounter)");
        error_log("   Previous Hash: " . $currentBlock['current_hash']);
        error_log("   New Hash: " . $newBlock['current_hash']);
        error_log("   Encounter ID (preserved): " . $currentBlock['id_encounter_satusehat']);
        
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
        
        $newIdAntrian = $insertResult[0]['id_antrian'] ?? null;
        
        error_log("✅ Exit block created - Doctor can resume later with same encounter");
        
        echo json_encode([
            'success' => true,
            'message' => 'Pemeriksaan di-pause (data tersimpan)',
            'id_antrian' => $newIdAntrian, // ⚠️ Return NEW ID
            'queue_number' => $currentBlock['no_antrian'],
            'id_encounter_satusehat' => $currentBlock['id_encounter_satusehat'],
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
 * ▶️ RESUME PEMERIKSAAN
 * ⚠️ CRITICAL: Returns NEW id_antrian that MUST be used for finish
 */
function resumePemeriksaan() {
    $id = $_GET['id'] ?? null;
    
    if (!$id) {
        echo json_encode(['error' => 'ID required']);
        return;
    }
    
    try {
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
        
        if (empty($currentBlock['id_encounter_satusehat'])) {
            echo json_encode([
                'error' => 'No encounter found',
                'message' => 'Pemeriksaan belum pernah dimulai sebelumnya',
                'should_use' => 'periksa'
            ]);
            return;
        }
        
        if ($currentBlock['status_antrian'] !== 'Di Terima') {
            echo json_encode([
                'error' => 'Invalid queue status',
                'message' => 'Status harus "Di Terima" untuk melanjutkan pemeriksaan',
                'current_status' => $currentBlock['status_antrian']
            ]);
            return;
        }
        
        $newBlock = [
            'no_antrian' => $currentBlock['no_antrian'],
            'tanggal_antrian' => $currentBlock['tanggal_antrian'],
            'jam_antrian' => $currentBlock['jam_antrian'],
            'status_antrian' => 'Sedang Diperiksa', // ⚠️ Resume examination
            'id_pasien' => $currentBlock['id_pasien'],
            'id_dokter' => $currentBlock['id_dokter'],
            'jenis_pasien' => $currentBlock['jenis_pasien'],
            'id_encounter_satusehat' => $currentBlock['id_encounter_satusehat'],
            'created_at' => date('Y-m-d H:i:s'),
            'prev_hash' => $currentBlock['current_hash']
        ];
        
        $newBlock['current_hash'] = generateHash($newBlock);
        
        error_log("⛓️ BLOCKCHAIN: Creating resume block (reusing encounter)");
        error_log("   Previous Hash: " . $currentBlock['current_hash']);
        error_log("   New Hash: " . $newBlock['current_hash']);
        error_log("   Encounter ID (reused): " . $currentBlock['id_encounter_satusehat']);
        
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
        
        $newIdAntrian = $insertResult[0]['id_antrian'] ?? null; // ⚠️ NEW ID!
        
        error_log("✅ Resume block created - Using existing encounter");
        error_log("⚠️ CRITICAL: NEW id_antrian created: $newIdAntrian");
        
        echo json_encode([
            'success' => true,
            'message' => 'Pemeriksaan dilanjutkan (menggunakan encounter yang sama)',
            'id_antrian' => $newIdAntrian, // ⚠️ CRITICAL: Return NEW ID!
            'queue_number' => $currentBlock['no_antrian'],
            'patient_name' => $currentBlock['pasien']['nama'],
            'doctor_name' => $currentBlock['dokter']['nama_lengkap'],
            'id_encounter_satusehat' => $currentBlock['id_encounter_satusehat'],
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

function processDrugStock($idObat, $jumlah, $signa, $idPemeriksaan, $harga = 0, $idDetailObat = null) {
    try {
        error_log("💊 Processing drug stock: ID=$idObat, Qty=$jumlah, Batch ID=$idDetailObat");
        
        // ✅ If frontend provided specific batch ID, use it
        if ($idDetailObat) {
            error_log("🎯 Using specific batch from frontend: $idDetailObat");
            
            // Get the specific batch
            $stockParams = "select=*&id_detail_obat=eq.$idDetailObat&status_batch=eq.aktif&is_deleted=eq.0&limit=1";
            $stockResult = supabase('GET', 'detail_obat', $stockParams);
            
            if (empty($stockResult) || isset($stockResult['error'])) {
                error_log("❌ Specified batch not found: $idDetailObat");
                return [
                    'success' => false,
                    'error' => 'Specified batch not found or inactive'
                ];
            }
            
            $batch = $stockResult[0];
            $batchStock = intval($batch['stock']);
            $batchPrice = floatval($batch['harga_jual']);
            
            error_log("📦 Batch details: Stock=$batchStock, Price=Rp " . number_format($batchPrice, 0, ',', '.'));
            
            // Check if batch has enough stock
            if ($batchStock < $jumlah) {
                error_log("❌ Insufficient stock in specified batch. Available: $batchStock, Requested: $jumlah");
                return [
                    'success' => false,
                    'error' => "Insufficient stock in batch. Available: $batchStock, Requested: $jumlah"
                ];
            }
            
            $actualPrice = $batchPrice;
            $totalCost = $actualPrice * $jumlah;
            
        } else {
            // ✅ No batch specified - do FIFO automatically (backward compatibility)
            error_log("🔄 No batch specified, using FIFO");
            
            $stockParams = "select=*&id_obat=eq.$idObat&stock=gt.0&status_batch=eq.aktif&is_deleted=eq.0&order=created_at.asc";
            $stockResult = supabase('GET', 'detail_obat', $stockParams);
            
            if (empty($stockResult) || isset($stockResult['error'])) {
                error_log("❌ No stock batches found for obat ID: $idObat");
                return [
                    'success' => false,
                    'error' => 'Stock not found or insufficient'
                ];
            }
            
            // Calculate actual price using FIFO (weighted average)
            $actualPrice = 0;
            $remainingQty = $jumlah;
            $totalCost = 0;
            
            foreach ($stockResult as $batch) {
                if ($remainingQty <= 0) break;
                
                $batchStock = intval($batch['stock']);
                $batchPrice = floatval($batch['harga_jual']);
                $qtyFromBatch = min($batchStock, $remainingQty);
                
                $totalCost += ($qtyFromBatch * $batchPrice);
                $remainingQty -= $qtyFromBatch;
            }
            
            if ($jumlah > 0) {
                $actualPrice = $totalCost / $jumlah;
            }
            
            error_log("💰 Calculated FIFO price: Rp " . number_format($actualPrice, 0, ',', '.'));
            
            // Use first batch for id_detail_obat (for backward compatibility)
            $idDetailObat = $stockResult[0]['id_detail_obat'];
            
            // Calculate total available stock
            $availableStock = 0;
            foreach ($stockResult as $batch) {
                $availableStock += intval($batch['stock']);
            }
            
            error_log("📦 Available stock: $availableStock, Requested: $jumlah");
            
            if ($availableStock < $jumlah) {
                return [
                    'success' => false,
                    'error' => "Insufficient stock. Available: $availableStock, Requested: $jumlah"
                ];
            }
        }
        
        // ✅ Record in pemeriksaan_obat table WITH id_detail_obat
        $pemeriksaanObatData = [
            'id_pemeriksaan' => $idPemeriksaan,
            'id_obat' => $idObat,
            'id_detail_obat' => $idDetailObat,  // ✅ CRITICAL: Track which batch was used
            'jumlah' => $jumlah,
            'signa' => $signa,
            'harga' => $actualPrice,
            'created_at' => date('Y-m-d H:i:s')
        ];
        
        error_log("📝 Recording in pemeriksaan_obat with batch tracking:");
        error_log("   id_obat: $idObat");
        error_log("   id_detail_obat: $idDetailObat ← BATCH TRACKED");
        error_log("   jumlah: $jumlah");
        error_log("   harga: Rp " . number_format($actualPrice, 0, ',', '.'));
        
        $insertResult = supabase('POST', 'pemeriksaan_obat', '', $pemeriksaanObatData);
        
        if (isset($insertResult['error'])) {
            error_log("❌ Failed to insert pemeriksaan_obat: " . json_encode($insertResult['error']));
            return [
                'success' => false,
                'error' => 'Failed to record drug usage',
                'details' => $insertResult['error']
            ];
        }
        
        error_log("✅ Recorded in pemeriksaan_obat with batch ID: $idDetailObat");
        
        // ✅ Deduct stock from the batch(es)
        if ($idDetailObat) {
            // Specific batch - deduct from this batch only
            $batch = $stockResult[0];
            $batchStock = intval($batch['stock']);
            $newStock = $batchStock - $jumlah;
            
            error_log("📦 Deducting from batch $idDetailObat: $batchStock → $newStock");
            
            $updateData = ['stock' => $newStock];
            
            if ($newStock <= 0) {
                $updateData['status_batch'] = 'habis';
                error_log("   ⚠️ Batch now empty, marking as 'habis'");
            }
            
            $updateParams = "id_detail_obat=eq.$idDetailObat";
            $updateResult = supabase('PATCH', 'detail_obat', $updateParams, $updateData);
            
            if (isset($updateResult['error'])) {
                error_log("⚠️ Failed to update batch stock: " . json_encode($updateResult['error']));
                return [
                    'success' => false,
                    'error' => 'Failed to update batch stock'
                ];
            }
            
            $deductions = [[
                'batch_id' => $idDetailObat,
                'deducted' => $jumlah,
                'remaining' => $newStock,
                'price' => $actualPrice
            ]];
            
            error_log("✅ Stock deducted successfully from batch $idDetailObat");
            
        } else {
            // FIFO - deduct from multiple batches
            $remainingToDeduct = $jumlah;
            $deductions = [];
            
            foreach ($stockResult as $batch) {
                if ($remainingToDeduct <= 0) break;
                
                $batchStock = intval($batch['stock']);
                $deductFromBatch = min($batchStock, $remainingToDeduct);
                $newStock = $batchStock - $deductFromBatch;
                
                error_log("📦 Batch {$batch['id_detail_obat']}: Deducting $deductFromBatch (Stock: $batchStock → $newStock)");
                
                $updateData = ['stock' => $newStock];
                
                if ($newStock <= 0) {
                    $updateData['status_batch'] = 'habis';
                }
                
                $updateParams = "id_detail_obat=eq." . $batch['id_detail_obat'];
                $updateResult = supabase('PATCH', 'detail_obat', $updateParams, $updateData);
                
                if (isset($updateResult['error'])) {
                    error_log("⚠️ Failed to update batch stock: " . json_encode($updateResult['error']));
                } else {
                    $deductions[] = [
                        'batch_id' => $batch['id_detail_obat'],
                        'deducted' => $deductFromBatch,
                        'remaining' => $newStock,
                        'price' => floatval($batch['harga_jual'])
                    ];
                    $remainingToDeduct -= $deductFromBatch;
                    error_log("✅ Updated batch {$batch['id_detail_obat']} stock to $newStock");
                }
            }
        }
        
        error_log("✅ Successfully processed medicine with " . count($deductions) . " batch deduction(s)");
        error_log("💰 Total cost: Rp " . number_format($totalCost, 0, ',', '.') . " | Avg price: Rp " . number_format($actualPrice, 0, ',', '.'));
        
        return [
            'success' => true,
            'deductions' => $deductions,
            'actual_price' => $actualPrice,
            'total_cost' => $totalCost,
            'batch_used' => $idDetailObat  // ✅ Return which batch was used
        ];
        
    } catch (Exception $e) {
        error_log("❌ Exception in processDrugStock: " . $e->getMessage());
        return [
            'success' => false,
            'error' => $e->getMessage()
        ];
    }
}
/**
 * ✅ FINISH PEMERIKSAAN - Complete examination
 * ⚠️ MUST receive the LATEST id_antrian with status "Sedang Diperiksa"
 */
function finishPemeriksaan() {
    $id = $_GET['id'] ?? null;
    
    if (!$id) {
        echo json_encode(['error' => 'ID required']);
        return;
    }
    
    $input = json_decode(file_get_contents('php://input'), true);
    
    error_log("📥 FINISH PEMERIKSAAN DATA: " . json_encode($input, JSON_PRETTY_PRINT));
    error_log("📍 Using id_antrian: $id");
    
    try {
        // Get current queue data
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
        
        error_log("✅ Current queue data retrieved");
        error_log("📊 Current status: " . $currentBlock['status_antrian']);
        error_log("🔗 Current hash: " . $currentBlock['current_hash']);
        
        // ⚠️ CRITICAL: Verify status is "Sedang Diperiksa"
        if ($currentBlock['status_antrian'] !== 'Sedang Diperiksa') {
            error_log("❌ Invalid status for finish: " . $currentBlock['status_antrian']);
            echo json_encode([
                'error' => 'Invalid queue status',
                'message' => 'Status harus "Sedang Diperiksa" untuk menyelesaikan pemeriksaan',
                'current_status' => $currentBlock['status_antrian'],
                'hint' => 'Pastikan Anda menggunakan id_antrian yang terbaru setelah klik "PERIKSA" atau "LANJUTKAN"'
            ]);
            return;
        }
        
        // ✅ Extract harga_jasa from input
        $hargaJasa = floatval($input['harga_jasa'] ?? 0);
        $totalBiaya = floatval($input['total'] ?? 0);
        
        error_log("💰 Financial Data:");
        error_log("   Harga Jasa: Rp " . number_format($hargaJasa, 0, ',', '.'));
        error_log("   Total Biaya: Rp " . number_format($totalBiaya, 0, ',', '.'));
        
        // Insert anamnesa
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
        
        // ✅ Insert pemeriksaan WITH HARGA_JASA
        $pemeriksaanData = [
            'id_antrian' => $currentBlock['id_antrian'],
            'id_anamnesa' => $idAnamnesa,
            'id_dokter' => $currentBlock['id_dokter'],
            'harga_jasa' => (string)$hargaJasa, // ✅ CRITICAL: Store as string to match schema
            'created_at' => date('Y-m-d H:i:s'),
            'prev_hash' => null
        ];
        
        $pemeriksaanData['curent_hash'] = generateHash($pemeriksaanData);
        
        error_log("🏥 Inserting PEMERIKSAAN with HARGA_JASA...");
        error_log("   Harga Jasa being saved: Rp " . number_format($hargaJasa, 0, ',', '.'));
        
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
        error_log("✅ Harga Jasa successfully saved to database");
        
        // Insert vital signs
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
            if (empty($vital['value'])) continue;
            
            // Check if LOINC code exists
            $loincParams = "select=id_ioinc&display=eq." . urlencode($vital['display']) . "&limit=1";
            $loincCheck = supabase('GET', 'loinc', $loincParams);
            
            $idLoinc = null;
            if (!empty($loincCheck) && !isset($loincCheck['error'])) {
                $idLoinc = $loincCheck[0]['id_ioinc'];
            } else {
                // Create LOINC entry if doesn't exist
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
        
        // Insert ICDX diagnoses
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
        
        // Insert ICDIX procedures
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
        
        // Insert resep
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
                
                // Parse and insert resep details
                $detailLines = explode("\n", $input['resep']['detail']);
                foreach ($detailLines as $line) {
                    $line = trim($line);
                    if (empty($line)) continue;
                    
                    // Try to parse format: "1. Paracetamol 500mg - 3x1 sehari"
                    if (preg_match('/^\d+\.\s*(.+?)\s*-\s*(.+)$/', $line, $matches)) {
                        $namaObat = trim($matches[1]);
                        $signa = trim($matches[2]);
                        
                        $resepDetailData = [
                            'id_resep' => $idResep,
                            'nama_obat' => $namaObat,
                            'signa' => $signa,
                            'jumlah' => '1',
                            'created_at' => date('Y-m-d H:i:s')
                        ];
                        
                        supabase('POST', 'resep_detail', '', $resepDetailData);
                    }
                }
                
                error_log("✅ Resep details inserted");
            }
        }
        
        // ========================================
        // 🔥 PROCESS MEDICINES WITH STOCK REDUCTION (FIFO)
        // ========================================

        if (!empty($input['obat']) && is_array($input['obat'])) {
            error_log("💊 Processing " . count($input['obat']) . " medicines with FIFO stock reduction...");
            
            $obatErrors = [];
            $obatSuccess = [];
            
            foreach ($input['obat'] as $obat) {

                $idDetailObat = $obat['id_detail_obat'] ?? null;
        
                if ($idDetailObat) {
                    error_log("   🎯 Medicine '{$obat['nama']}' has specific batch: $idDetailObat");
                } else {
                    error_log("   ⚠️ Medicine '{$obat['nama']}' has no batch ID, will use FIFO");
                }

                $stockResult = processDrugStock(
                    $obat['id_obat'],
                    $obat['jumlah'],
                    $obat['signa'],
                    $idPemeriksaan,
                    $obat['harga'] ?? 0,
                    $idDetailObat
                );
                
                if (!$stockResult['success']) {
                    $obatErrors[] = [
                        'nama' => $obat['nama'],
                        'jumlah_diminta' => $obat['jumlah'],
                        'error' => $stockResult['error']
                    ];
                    error_log("❌ Failed to process: " . $obat['nama'] . " - " . $stockResult['error']);
                } else {
                    $obatSuccess[] = [
                        'nama' => $obat['nama'],
                        'jumlah' => $obat['jumlah'],
                        'deductions' => $stockResult['deductions']
                    ];
                    error_log("✅ Successfully processed: " . $obat['nama'] . " (" . $obat['jumlah'] . " units)");
                }
            }
            
            error_log("📊 Medicine Processing Summary:");
            error_log("   ✅ Success: " . count($obatSuccess));
            error_log("   ❌ Failed: " . count($obatErrors));
            
            // If ALL medicines failed, rollback the entire examination
            if (count($obatErrors) === count($input['obat']) && !empty($obatErrors)) {
                error_log("❌ CRITICAL: All medicines failed to process. Rolling back examination.");
                
                // Delete the pemeriksaan we just created
                supabase('DELETE', "pemeriksaan?id_pemeriksaan=eq.$idPemeriksaan", '');
                supabase('DELETE', "anamnesa?id_anamnesa=eq.$idAnamnesa", '');
                
                echo json_encode([
                    'success' => false,
                    'error' => 'Gagal memproses obat',
                    'message' => 'Semua obat gagal diproses. Pemeriksaan dibatalkan.',
                    'failed_medicines' => $obatErrors
                ]);
                return;
            }
        }
        
        // ========================================
        // 🏥 UPDATE SATUSEHAT ENCOUNTER TO FINISHED
        // ========================================
        
        $encounterUpdated = false;
        
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
            
            // ========================================
            // ✅ NEW: SEND CLINICAL DATA TO SATUSEHAT
            // ========================================
            error_log("📤 ===== SENDING CLINICAL DATA TO SATUSEHAT =====");
            
            $encounterId = $currentBlock['id_encounter_satusehat'];
            $patientId = $currentBlock['pasien']['id_satusehat'] ?? null;
            $doctorId = $currentBlock['dokter']['id_satusehat'] ?? null;
            $doctorDbId = $currentBlock['id_dokter']; // Database ID for API credentials
            
            if (!$patientId || !$doctorId) {
                error_log("⚠️ Missing patient or doctor SatuSehat ID - skipping clinical data upload");
            } else {
                
                // 1️⃣ Send Conditions (ICDX Diagnoses)
                if (!empty($input['icdx']) && is_array($input['icdx'])) {
                    error_log("🔬 Sending " . count($input['icdx']) . " ICDX diagnoses...");
                    
                    foreach ($input['icdx'] as $icdx) {
                        $conditionId = SatuSehatClinicalAPI::sendCondition(
                            $encounterId,
                            $patientId,
                            $doctorId,
                            $icdx['kode'] ?? '',
                            $icdx['deskripsi'] ?? '',
                            $doctorDbId
                        );
                        
                        if ($conditionId) {
                            error_log("   ✅ Condition sent: " . $icdx['kode']);
                        } else {
                            error_log("   ⚠️ Failed to send: " . $icdx['kode']);
                        }
                    }
                }
                
                // 2️⃣ Send Procedures (ICDIX)
                if (!empty($input['icdix']) && is_array($input['icdix'])) {
                    error_log("⚕️ Sending " . count($input['icdix']) . " ICDIX procedures...");
                    
                    foreach ($input['icdix'] as $icdix) {
                        $procedureId = SatuSehatClinicalAPI::sendProcedure(
                            $encounterId,
                            $patientId,
                            $doctorId,
                            $icdix['kode'] ?? '',
                            $icdix['deskripsi'] ?? '',
                            $doctorDbId
                        );
                        
                        if ($procedureId) {
                            error_log("   ✅ Procedure sent: " . $icdix['kode']);
                        } else {
                            error_log("   ⚠️ Failed to send: " . $icdix['kode']);
                        }
                    }
                }
                
                // 3️⃣ Send Vital Signs (Observations)
                error_log("💓 Sending vital signs...");
                
                $vitalSignsToSend = [
                    ['code' => '29463-7', 'display' => 'Body weight', 'field' => 'body_weight', 'unit' => 'kg'],
                    ['code' => '8302-2', 'display' => 'Body height', 'field' => 'body_height', 'unit' => 'cm'],
                    ['code' => '8310-5', 'display' => 'Body temperature', 'field' => 'body_temp', 'unit' => 'Cel'],
                    ['code' => '85354-9', 'display' => 'Blood pressure', 'field' => 'blood_pressure', 'unit' => 'mm[Hg]'],
                    ['code' => '8867-4', 'display' => 'Heart rate', 'field' => 'heart_rate', 'unit' => '/min'],
                    ['code' => '9279-1', 'display' => 'Respiratory rate', 'field' => 'resp_rate', 'unit' => '/min'],
                    ['code' => '2708-6', 'display' => 'Oxygen saturation', 'field' => 'oxygen_sat', 'unit' => '%']
                ];
                
                foreach ($vitalSignsToSend as $vital) {
                    $value = $input[$vital['field']] ?? '';
                    
                    if (!empty($value)) {
                        $observationId = SatuSehatClinicalAPI::sendObservation(
                            $encounterId,
                            $patientId,
                            $doctorId,
                            $vital['code'],
                            $vital['display'],
                            $value,
                            $vital['unit'],
                            $doctorDbId
                        );
                        
                        if ($observationId) {
                            error_log("   ✅ Vital sign sent: " . $vital['display']);
                        } else {
                            error_log("   ⚠️ Failed to send: " . $vital['display']);
                        }
                    }
                }
                
                // 4️⃣ Send Allergies
                error_log("🔔 Sending allergies...");
                
                $allergies = [];
                
                if (($input['alergi_makanan'] ?? '') === 'Ada') {
                    $allergies[] = ['category' => 'food', 'substance' => 'Food allergy'];
                }
                if (($input['alergi_udara'] ?? '') === 'Ada') {
                    $allergies[] = ['category' => 'environment', 'substance' => 'Environmental allergy'];
                }
                if (($input['alergi_obat'] ?? '') === 'Ada') {
                    $allergies[] = ['category' => 'medication', 'substance' => 'Medication allergy'];
                }
                
                foreach ($allergies as $allergy) {
                    $allergyId = SatuSehatClinicalAPI::sendAllergy(
                        $patientId,
                        $allergy['category'],
                        $allergy['substance'],
                        $doctorDbId
                    );
                    
                    if ($allergyId) {
                        error_log("   ✅ Allergy sent: " . $allergy['substance']);
                    } else {
                        error_log("   ⚠️ Failed to send: " . $allergy['substance']);
                    }
                }
                
                error_log("✅ Clinical data upload completed");
            }
        }
        
        // ========================================
        // ⛓️ CREATE NEW BLOCKCHAIN BLOCK
        // ========================================
        
        // Create new blockchain block - "Selesai Periksa"
        $newBlock = [
            'no_antrian' => $currentBlock['no_antrian'],
            'tanggal_antrian' => $currentBlock['tanggal_antrian'],
            'jam_antrian' => $currentBlock['jam_antrian'],
            'status_antrian' => 'Selesai Periksa',
            'id_pasien' => $currentBlock['id_pasien'],
            'id_dokter' => $currentBlock['id_dokter'],
            'jenis_pasien' => $currentBlock['jenis_pasien'],
            'id_encounter_satusehat' => $currentBlock['id_encounter_satusehat'],
            'created_at' => date('Y-m-d H:i:s'),
            'prev_hash' => $currentBlock['current_hash']
        ];
        
        $newBlock['current_hash'] = generateHash($newBlock);
        
        error_log("⛓️ BLOCKCHAIN: Creating finish block");
        error_log("   Previous Hash: " . $currentBlock['current_hash']);
        error_log("   New Hash: " . $newBlock['current_hash']);
        
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
        
        $newIdAntrian = $insertResult[0]['id_antrian'] ?? null;
        
        error_log("✅ Examination completed successfully");
        error_log("⚠️ NEW id_antrian for payment: $newIdAntrian");
        error_log("📊 Summary:");
        error_log("   - Anamnesa ID: $idAnamnesa");
        error_log("   - Pemeriksaan ID: $idPemeriksaan");
        error_log("   - Harga Jasa: Rp " . number_format($hargaJasa, 0, ',', '.'));
        error_log("   - ICDX Count: " . count($input['icdx'] ?? []));
        error_log("   - ICDIX Count: " . count($input['icdix'] ?? []));
        error_log("   - Obat Count: " . count($input['obat'] ?? []));
        error_log("   - Resep ID: " . ($idResep ?? 'None'));
        error_log("   - Total Biaya: Rp " . number_format($totalBiaya, 0, ',', '.'));
        
        echo json_encode([
            'success' => true,
            'message' => 'Pemeriksaan selesai dan semua data tersimpan',
            'id_antrian' => $newIdAntrian, // ⚠️ For payment processing
            'queue_number' => $currentBlock['no_antrian'],
            'patient_name' => $currentBlock['pasien']['nama'],
            'id_encounter_satusehat' => $currentBlock['id_encounter_satusehat'],
            'encounter_updated' => $encounterUpdated,
            'pemeriksaan_id' => $idPemeriksaan,
            'anamnesa_id' => $idAnamnesa,
            'resep_id' => $idResep,
            'harga_jasa' => $hargaJasa, // ✅ Include in response
            'total_icdx' => count($input['icdx'] ?? []),
            'total_icdix' => count($input['icdix'] ?? []),
            'total_obat' => count($input['obat'] ?? []),
            'total_biaya' => $totalBiaya,
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
    
    error_log("💳 GET PAYMENT DETAILS (DIRECT) - Queue ID: $queueId");
    
    try {
        // ========================================
        // STEP 1: Get no_antrian from the clicked queue
        // ========================================
        $antrianParams = "select=no_antrian,jenis_pasien&id_antrian=eq.$queueId&limit=1";
        $antrianResult = supabase('GET', 'antrian', $antrianParams);
        
        if (empty($antrianResult) || isset($antrianResult['error'])) {
            error_log("❌ Antrian not found: $queueId");
            echo json_encode(['success' => false, 'error' => 'Antrian not found']);
            return;
        }
        
        $noAntrian = $antrianResult[0]['no_antrian'];
        $jenisPasien = $antrianResult[0]['jenis_pasien'] ?? 'UMUM';
        
        error_log("📋 Found no_antrian: $noAntrian");
        
        // ========================================
        // STEP 2: Get ALL antrian versions with this no_antrian
        // ========================================
        $allVersionsParams = "select=id_antrian,status_antrian,created_at&no_antrian=eq.$noAntrian&order=created_at.asc";
        $allVersions = supabase('GET', 'antrian', $allVersionsParams);
        
        if (empty($allVersions) || isset($allVersions['error'])) {
            error_log("❌ No antrian versions found");
            echo json_encode(['success' => false, 'error' => 'No antrian versions found']);
            return;
        }
        
        error_log("🔍 Found " . count($allVersions) . " antrian versions");
        
        // ========================================
        // STEP 3: Search for pemeriksaan in ANY version
        // ========================================
        $pemeriksaanFound = null;
        $linkedAntrianId = null;
        
        foreach ($allVersions as $version) {
            $versionId = $version['id_antrian'];
            $versionStatus = $version['status_antrian'];
            
            error_log("   Checking version: $versionId (status: $versionStatus)");
            
            // Try to find pemeriksaan for this version
            $pemParams = "select=id_pemeriksaan,harga_jasa&id_antrian=eq.$versionId&limit=1";
            $pemResult = supabase('GET', 'pemeriksaan', $pemParams);
            
            if (!empty($pemResult) && !isset($pemResult['error'])) {
                $pemeriksaanFound = $pemResult[0];
                $linkedAntrianId = $versionId;
                error_log("✅ Found pemeriksaan linked to version: $versionId");
                break;
            }
        }
        
        if (!$pemeriksaanFound) {
            error_log("❌ No pemeriksaan found in any version");
            echo json_encode([
                'success' => false,
                'error' => 'Pemeriksaan not found',
                'debug' => [
                    'no_antrian' => $noAntrian,
                    'versions_checked' => count($allVersions),
                    'message' => 'Patient may not have been examined yet'
                ]
            ]);
            return;
        }
        
        $idPemeriksaan = $pemeriksaanFound['id_pemeriksaan'];
        $hargaJasa = floatval($pemeriksaanFound['harga_jasa'] ?? 0);
        
        error_log("💰 Retrieved Harga Jasa: Rp " . number_format($hargaJasa, 0, ',', '.'));
        error_log("🏥 Pemeriksaan ID: $idPemeriksaan");
        
        // ========================================
        // STEP 4: Get drugs for this pemeriksaan
        // ========================================
        $obatParams = "select=jumlah,signa,id_obat&id_pemeriksaan=eq.$idPemeriksaan";
        $obatResult = supabase('GET', 'pemeriksaan_obat', $obatParams);
        
        $drugs = [];
        $totalDrugs = 0;
        
        if (!empty($obatResult) && !isset($obatResult['error'])) {
            error_log("💊 Found " . count($obatResult) . " drug records");
            
            foreach ($obatResult as $obat) {
                // Get obat details separately
                $obatId = $obat['id_obat'];
                $obatDetailParams = "select=nama_obat,bentuk_obat,harga_jual&id_obat=eq.$obatId&limit=1";
                $obatDetail = supabase('GET', 'obat', $obatDetailParams);
                
                if (!empty($obatDetail) && !isset($obatDetail['error'])) {
                    $detail = $obatDetail[0];
                    $drugPrice = floatval($detail['harga_jual'] ?? 0);
                    $qty = intval($obat['jumlah'] ?? 1);
                    $drugTotal = $qty * $drugPrice;
                    $totalDrugs += $drugTotal;
                    
                    $drugs[] = [
                        'name' => $detail['nama_obat'] ?? 'Unknown',
                        'type' => $detail['bentuk_obat'] ?? '-',
                        'qty' => $qty,
                        'signa' => $obat['signa'] ?? '-',
                        'price' => $drugPrice,
                        'serviceCharge' => 0,
                        'subtotal' => $drugTotal
                    ];
                    
                    error_log("   - " . $detail['nama_obat'] . " (x$qty @ Rp " . number_format($drugPrice, 0, ',', '.') . ")");
                }
            }
        } else {
            error_log("ℹ️ No drugs found for this pemeriksaan");
        }
        
        // ========================================
        // STEP 5: Calculate grand total
        // ========================================
        $grandTotal = $totalDrugs + $hargaJasa;
        
        error_log("📊 Payment Calculation:");
        error_log("   Total Drugs: Rp " . number_format($totalDrugs, 0, ',', '.'));
        error_log("   Harga Jasa: Rp " . number_format($hargaJasa, 0, ',', '.'));
        error_log("   Grand Total: Rp " . number_format($grandTotal, 0, ',', '.'));
        
        echo json_encode([
            'success' => true,
            'data' => [
                'drugs' => $drugs,
                'total_drugs' => $totalDrugs,
                'harga_jasa' => $hargaJasa,
                'grand_total' => $grandTotal,
                'jenis_pasien' => $jenisPasien
            ],
            'debug' => [
                'no_antrian' => $noAntrian,
                'requested_id' => $queueId,
                'linked_antrian_id' => $linkedAntrianId,
                'pemeriksaan_id' => $idPemeriksaan,
                'versions_found' => count($allVersions)
            ]
        ]);
        
    } catch (Exception $e) {
        error_log("❌ EXCEPTION: " . $e->getMessage());
        error_log("   Trace: " . $e->getTraceAsString());
        
        echo json_encode([
            'success' => false,
            'error' => 'Exception occurred',
            'message' => $e->getMessage()
        ]);
    }
}

function processPayment() {
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
    
    if (!in_array($patientType, ['BPJS', 'UMUM'])) {
        echo json_encode([
            'success' => false,
            'error' => 'Invalid patient type. Must be BPJS or UMUM'
        ]);
        return;
    }
    
    if (!in_array($paymentMethod, ['bpjs', 'cash', 'qris'])) {
        echo json_encode([
            'success' => false,
            'error' => 'Invalid payment method. Must be bpjs, cash, or qris'
        ]);
        return;
    }
    
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
        
        if ($currentBlock['status_antrian'] !== 'Selesai Periksa') {
            echo json_encode([
                'success' => false,
                'error' => 'Invalid queue status',
                'message' => 'Pembayaran hanya bisa dilakukan untuk antrian dengan status "Selesai Periksa"',
                'current_status' => $currentBlock['status_antrian']
            ]);
            return;
        }
        
        $recordId = null;
        
        if ($patientType === 'UMUM') {
            error_log("💰 UMUM Patient - Recording as PEMASUKAN (Income)");
            
            $metodeBayar = strtoupper($paymentMethod);
            
            $pemasukanData = [
                'id_antrian' => $queueId,
                'id_dokter' => $idDokter,
                'total' => $totalBill,
                'metode_pembayaran' => $metodeBayar,
                'jenis_pemasukan' => 'Pembayaran Pasien UMUM',
                'deskripsi' => "Pembayaran pasien UMUM menggunakan $metodeBayar - Antrian: " . $currentBlock['no_antrian'] . " - Dibayar: Rp " . number_format($amountPaid, 0, ',', '.') . " - Kembalian: Rp " . number_format($change, 0, ',', '.'),
                'created_at' => date('Y-m-d\TH:i:s\Z')
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
            error_log("✅ PEMASUKAN recorded: ID $recordId (Linked to antrian: $queueId)");
            
        } else {
            // ========================================
            // 🔥 BPJS PATIENT - RECORD AS PENGELUARAN WITH TOTAL
            // ========================================
            error_log("🏥 BPJS Patient - Recording as PENGELUARAN (Clinic's expense)");
            error_log("💰 Total Bill (Medicine + Service): Rp " . number_format($totalBill, 0, ',', '.'));
            
            // ✅ NOW INCLUDING 'total' FIELD
            $pengeluaranData = [
                'id_antrian' => $queueId,
                'id_dokter' => $idDokter,
                'tanggal' => date('Y-m-d'),
                'total' => $totalBill,  // ✅ CRITICAL: Store total cost
                'keterangan' => "Biaya Obat + Jasa BPJS - Antrian: " . $currentBlock['no_antrian'],
                'created_at' => date('Y-m-d\TH:i:s\Z'),
                'updated_at' => date('Y-m-d\TH:i:s\Z')
            ];
            
            $pengeluaranData['prev_hash'] = null;
            $pengeluaranData['curent_hash'] = generateHash($pengeluaranData);
            
            error_log("📝 Inserting to PENGELUARAN with TOTAL: " . json_encode($pengeluaranData, JSON_PRETTY_PRINT));
            
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
            error_log("✅ PENGELUARAN recorded: ID $recordId (Total: Rp $totalBill)");
            
            // ✅ NO NEED for pengeluaran_detail since we're using 'total' column directly
            // The 'total' column replaces the need to calculate from detail
            
            $amountPaid = 0;
            $change = 0;
        }
        
        // Create new blockchain block with status "Selesai"
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
            error_log("   - Status: BPJS (Clinic cost recorded in pengeluaran.total)");
        }
        
        echo json_encode([
            'success' => true,
            'message' => $patientType === 'UMUM' 
                ? 'Pembayaran berhasil diproses dan tercatat sebagai pemasukan'
                : 'Pembayaran BPJS tercatat sebagai pengeluaran klinik (total: Rp ' . number_format($totalBill, 0, ',', '.') . ')',
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