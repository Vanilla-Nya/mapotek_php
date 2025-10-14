<?php
// API/queue/antrian.php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, PATCH');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

require_once '../config/supabase.php';
require_once '../auth/encounter_satusehat_api.php';

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
    default:
        echo json_encode(['error' => 'Invalid action']);
        break;
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
    
    // Join with pasien table to get patient details
    $params = "select=*,pasien:id_pasien(nama,nik,no_telp,id_satusehat)&id_dokter=eq.$dokterId&order=tanggal_antrian.desc,jam_antrian.desc";
    
    $result = supabase('GET', 'antrian', $params);
    echo json_encode($result);
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
    
    // Search in nama or nik fields, return patients with their SatuSehat ID
    $params = "select=id_pasien,nama,nik,no_telp,id_satusehat&or=(nama.ilike.*$keyword*,nik.ilike.*$keyword*)&limit=20";
    
    $result = supabase('GET', 'pasien', $params);
    echo json_encode($result);
}

/**
 * Generate unique queue number for today
 * Format: [Number][DDMMYY]
 * Example: 1131025 = Queue #1 on 13 October 2025
 * GET: ?action=generate_number
 */
function generateQueueNumber() {
    $today = date('dmy'); // Format: DDMMYY (e.g., 131025)
    $tanggal = date('Y-m-d');
    
    // Get the highest queue number for today
    $params = "select=no_antrian&tanggal_antrian=eq.$tanggal&order=no_antrian.desc&limit=1";
    
    $result = supabase('GET', 'antrian', $params);
    
    $lastNumber = 0;
    if (!empty($result) && isset($result[0]['no_antrian'])) {
        // Extract the number part (digits before the date)
        $lastNo = $result[0]['no_antrian'];
        preg_match('/^(\d+)/', $lastNo, $matches);
        $lastNumber = isset($matches[1]) ? intval($matches[1]) : 0;
    }
    
    $newNumber = $lastNumber + 1;
    $queueNumber = $newNumber . $today;
    
    echo json_encode([
        'no_antrian' => $queueNumber,
        'tanggal' => $tanggal
    ]);
}

/**
 * Filter queues by hour range
 * GET: ?action=filter_by_hour&tanggal=2025-10-13&jam_mulai=08:00&jam_akhir=12:00&dokter_id=xxx
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
    
    // Filter by date, time range, and doctor
    $params = "select=*,pasien:id_pasien(nama,nik,no_telp,id_satusehat)&id_dokter=eq.$dokterId&tanggal_antrian=eq.$tanggal&jam_antrian=gte.$jamMulai&jam_antrian=lte.$jamAkhir&order=jam_antrian.asc";
    
    $result = supabase('GET', 'antrian', $params);
    echo json_encode($result);
}

/**
 * Create new queue entry
 * POST: ?action=create
 * Body: {
 *   "no_antrian": "1131025",
 *   "tanggal_antrian": "2025-10-13",
 *   "jam_antrian": "09:00",
 *   "id_pasien": "xxx",
 *   "id_dokter": "xxx"
 * }
 */
function createAntrian() {
    $input = json_decode(file_get_contents('php://input'), true);
    
    // Validate required fields
    if (!isset($input['no_antrian']) || !isset($input['tanggal_antrian']) || 
        !isset($input['jam_antrian']) || !isset($input['id_pasien']) || 
        !isset($input['id_dokter'])) {
        echo json_encode([
            'error' => 'Missing required fields',
            'required' => ['no_antrian', 'tanggal_antrian', 'jam_antrian', 'id_pasien', 'id_dokter']
        ]);
        return;
    }
    
    // Check if queue number already exists
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
        'status_antrian' => 'Belum Periksa', // Initial status
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
 * This is the KEY function that connects to SatuSehat API
 * POST: ?action=accept&id=xxx
 */
function acceptQueue() {
    $id = $_GET['id'] ?? null;
    
    if (!$id) {
        echo json_encode(['error' => 'ID required']);
        return;
    }
    
    try {
        // 1️⃣ Get queue with patient and doctor details (including SatuSehat IDs)
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
        
        // 2️⃣ Check if already accepted
        if ($queueData['status_antrian'] !== 'Belum Periksa') {
            echo json_encode([
                'error' => 'Queue already processed',
                'message' => 'Antrian sudah diproses sebelumnya',
                'current_status' => $queueData['status_antrian']
            ]);
            return;
        }
        
        // 3️⃣ Validate SatuSehat IDs exist
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
        
        // 4️⃣ Create Encounter in SatuSehat
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
        
        // 5️⃣ Update queue status + save encounter ID
        $updateData = [
            'status_antrian' => 'Di Terima',
            'id_encounter_satusehat' => $encounterId,
            'waktu_diterima' => date('Y-m-d H:i:s')
        ];
        
        $updateParams = "id_antrian=eq.$id";
        $updateResult = supabase('PATCH', 'antrian', $updateParams, $updateData);
        
        // 6️⃣ Success response
        echo json_encode([
            'success' => true,
            'message' => 'Queue accepted and SatuSehat encounter created successfully',
            'encounter_id' => $encounterId,
            'queue_number' => $queueData['no_antrian'],
            'patient_name' => $queueData['pasien']['nama'],
            'hash' => substr(md5($encounterId . time()), 0, 32) // Blockchain-style hash for your UI
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
 * Delete queue (soft delete - change status to "Batal")
 * POST: ?action=delete&id=xxx
 */
function deleteQueue() {
    $id = $_GET['id'] ?? null;
    
    if (!$id) {
        echo json_encode(['error' => 'ID required']);
        return;
    }
    
    try {
        // Get current queue data
        $params = "select=*&id_antrian=eq.$id&limit=1";
        $queue = supabase('GET', 'antrian', $params);
        
        if (empty($queue)) {
            echo json_encode([
                'error' => 'Queue not found',
                'message' => 'Antrian tidak ditemukan'
            ]);
            return;
        }
        
        // Soft delete: Update status to "Batal"
        $updateData = [
            'status_antrian' => 'Batal',
            'waktu_dibatalkan' => date('Y-m-d H:i:s')
        ];
        
        $updateParams = "id_antrian=eq.$id";
        $result = supabase('PATCH', 'antrian', $updateParams, $updateData);
        
        echo json_encode([
            'success' => true,
            'message' => 'Queue cancelled successfully',
            'hash' => substr(md5($id . time()), 0, 32) // Blockchain-style hash
        ]);
        
    } catch (Exception $e) {
        echo json_encode([
            'error' => 'Exception occurred',
            'message' => $e->getMessage()
        ]);
    }
}
?>