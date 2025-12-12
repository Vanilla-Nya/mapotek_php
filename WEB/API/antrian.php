<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);

// API/auth/antrian.php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, PATCH');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

// ✅ FIXED: Remove satusehat_config.php - we don't need it!
require_once __DIR__ . '/../config/supabase.php';
require_once __DIR__ . '/encounter_satusehat_api.php';

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
    default:
        echo json_encode(['error' => 'Invalid action']);
        break;
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
        // Get patient data including id_satusehat
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
    $tanggal = date('Y-m-d');
    $datePrefix = date('dm'); // DDMM format (e.g., "1212" for Dec 12)

    try {
        // Get ALL queue numbers for today
        $params = "select=no_antrian&tanggal_antrian=eq.$tanggal&order=no_antrian.desc&limit=100";
        $result = supabase('GET', 'antrian', $params);

        $lastNumber = 0;
        
        if (!empty($result) && is_array($result)) {
            foreach ($result as $queue) {
                if (isset($queue['no_antrian'])) {
                    $queueNum = $queue['no_antrian'];
                    
                    // Try to extract number from ANY format
                    // Format 1: DDMM-NNN (e.g., "1212-001")
                    if (preg_match('/^' . $datePrefix . '-(\d+)$/', $queueNum, $matches)) {
                        $num = intval($matches[1]);
                        if ($num > $lastNumber) {
                            $lastNumber = $num;
                        }
                    }
                    // Format 2: Old format DDMMYYNNN or DDMMNNN (e.g., "121225002")
                    else if (preg_match('/^' . $datePrefix . '\d*(\d{3})$/', $queueNum, $matches)) {
                        $num = intval($matches[1]);
                        if ($num > $lastNumber) {
                            $lastNumber = $num;
                        }
                    }
                }
            }
        }

        $newNumber = $lastNumber + 1;
        
        // ✅ ALWAYS use new format: DDMM-NNN
        $queueNumber = $datePrefix . '-' . str_pad($newNumber, 3, '0', STR_PAD_LEFT);

        echo json_encode([
            'success' => true,
            'no_antrian' => $queueNumber,
            'tanggal' => $tanggal,
            'debug' => [
                'date_prefix' => $datePrefix,
                'last_number' => $lastNumber,
                'new_number' => $newNumber,
                'found_queues' => count($result ?? [])
            ]
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
    
    $params = "select=*,pasien:id_pasien(nama,nik,no_telp,id_satusehat)&id_dokter=eq.$dokterId&tanggal_antrian=eq.$tanggal&jam_antrian=gte.$jamMulai&jam_antrian=lte.$jamAkhir&order=jam_antrian.asc";
    
    $result = supabase('GET', 'antrian', $params);
    echo json_encode($result);
}

/**
 * Create new queue entry
 * POST: ?action=create
 */
function createAntrian() {
    $input = json_decode(file_get_contents('php://input'), true);
    
    if (!isset($input['no_antrian']) || !isset($input['tanggal_antrian']) || 
        !isset($input['jam_antrian']) || !isset($input['id_pasien']) || 
        !isset($input['id_dokter'])) {
        echo json_encode([
            'error' => 'Missing required fields',
            'required' => ['no_antrian', 'tanggal_antrian', 'jam_antrian', 'id_pasien', 'id_dokter']
        ]);
        return;
    }
    
    $checkParams = "select=id_antrian&no_antrian=eq." . $input['no_antrian'];
    $existing = supabase('GET', 'antrian', $checkParams);
    
    if (!empty($existing)) {
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
        'waktu_dibuat' => date('Y-m-d H:i:s')
    ];
    
    $result = supabase('POST', 'antrian', '', $data);
    
    if (isset($result['error'])) {
        echo json_encode([
            'error' => 'Failed to create queue',
            'details' => $result
        ]);
    } else {
        echo json_encode([
            'success' => true,
            'message' => 'Queue created successfully',
            'data' => $result
        ]);
    }
}

/**
 * 🔥 ACCEPT QUEUE + CREATE SATUSEHAT ENCOUNTER
 */
function acceptQueue() {
    $id = $_GET['id'] ?? null;
    
    if (!$id) {
        echo json_encode(['error' => 'ID required']);
        return;
    }
    
    try {
        $params = "select=*,pasien:id_pasien(nama,id_satusehat),dokter:id_dokter(nama_lengkap,id_satusehat)&id_antrian=eq.$id&limit=1";
        $queue = supabase('GET', 'antrian', $params);
        
        if (empty($queue)) {
            echo json_encode([
                'error' => 'Queue not found',
                'message' => 'Antrian tidak ditemukan'
            ]);
            return;
        }
        
        $queueData = $queue[0];
        
        if ($queueData['status_antrian'] !== 'Belum Periksa') {
            echo json_encode([
                'error' => 'Queue already processed',
                'message' => 'Antrian sudah diproses sebelumnya',
                'current_status' => $queueData['status_antrian']
            ]);
            return;
        }
        
        $patientSatusehatId = $queueData['pasien']['id_satusehat'] ?? null;
        $doctorSatusehatId = $queueData['dokter']['id_satusehat'] ?? null;
        
        if (!$patientSatusehatId) {
            echo json_encode([
                'error' => 'Patient missing SatuSehat ID',
                'message' => 'Pasien belum memiliki ID SatuSehat. Harap daftarkan pasien ke SatuSehat terlebih dahulu.',
                'patient_name' => $queueData['pasien']['nama']
            ]);
            return;
        }
        
        if (!$doctorSatusehatId) {
            echo json_encode([
                'error' => 'Doctor missing SatuSehat ID',
                'message' => 'Dokter belum memiliki ID SatuSehat. Harap daftarkan dokter ke SatuSehat terlebih dahulu.',
                'doctor_name' => $queueData['dokter']['nama_lengkap']
            ]);
            return;
        }
        
        $encounterId = EncounterSatusehatApi::createEncounter(
            $patientSatusehatId,
            $queueData['pasien']['nama'],
            $doctorSatusehatId,
            $queueData['dokter']['nama_lengkap']
        );
        
        if (!$encounterId) {
            echo json_encode([
                'error' => 'SatuSehat API Error',
                'message' => 'Gagal membuat encounter di SatuSehat. Silakan coba lagi.',
                'details' => 'Check server logs for more information'
            ]);
            return;
        }
        
        $updateData = [
            'status_antrian' => 'Di Terima',
            'id_encounter_satusehat' => $encounterId,
            'waktu_diterima' => date('Y-m-d H:i:s')
        ];
        
        $updateParams = "id_antrian=eq.$id";
        $updateResult = supabase('PATCH', 'antrian', $updateParams, $updateData);
        
        echo json_encode([
            'success' => true,
            'message' => 'Queue accepted and SatuSehat encounter created successfully',
            'encounter_id' => $encounterId,
            'queue_number' => $queueData['no_antrian'],
            'patient_name' => $queueData['pasien']['nama'],
            'hash' => substr(md5($encounterId . time()), 0, 32)
        ]);
        
    } catch (Exception $e) {
        echo json_encode([
            'error' => 'Exception occurred',
            'message' => $e->getMessage(),
            'trace' => $e->getTraceAsString()
        ]);
    }
}

/**
 * Delete queue (soft delete)
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
        
        if (empty($queue)) {
            echo json_encode([
                'error' => 'Queue not found',
                'message' => 'Antrian tidak ditemukan'
            ]);
            return;
        }
        
        $updateData = [
            'status_antrian' => 'Batal',
            'waktu_dibatalkan' => date('Y-m-d H:i:s')
        ];
        
        $updateParams = "id_antrian=eq.$id";
        $result = supabase('PATCH', 'antrian', $updateParams, $updateData);
        
        echo json_encode([
            'success' => true,
            'message' => 'Queue cancelled successfully',
            'hash' => substr(md5($id . time()), 0, 32)
        ]);
        
    } catch (Exception $e) {
        echo json_encode([
            'error' => 'Exception occurred',
            'message' => $e->getMessage()
        ]);
    }
}
?>