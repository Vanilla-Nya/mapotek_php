<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

require_once __DIR__ . '/../config/supabase.php';

/* ======================================================
   UNIVERSAL INPUT HANDLING (JSON + x-www-form-urlencoded)
   ====================================================== */

// Read raw body once
$raw = file_get_contents('php://input');

// Try to decode JSON
$input = json_decode($raw, true);

// Merge JSON body into $_POST if valid
if (is_array($input)) {
    $_POST = array_merge($_POST, $input);
}
// If JSON failed but data looks like a query string, parse it too
elseif (!empty($raw) && strpos($raw, '=') !== false) {
    parse_str($raw, $formData);
    $_POST = array_merge($_POST, $formData);
}

// Detect HTTP method and parameters
$method = $_SERVER['REQUEST_METHOD'];
$action = $_GET['action'] ?? ($_POST['action'] ?? '');
$id     = $_GET['id'] ?? ($_POST['id'] ?? '');

// Debug logs (optional)
error_log("🧩 METHOD = $method");
error_log("🧩 ACTION = $action");
error_log("🧩 GET = " . json_encode($_GET));
error_log("🧩 POST = " . json_encode($_POST));
error_log("🧩 RAW = $raw");

/* ======================================================
   ROUTING
   ====================================================== */
switch ($method) {
    case 'GET':
        if ($action === 'list_by_doctor') {
            getAntrianByDoctor();
        } elseif ($action === 'filter_by_hour') {
            filterByHour();
        } elseif ($action === 'generate_number') {
            generateQueueNumber();
        } elseif ($action === 'search_pasien') {
            searchPasien();
        } elseif ($action === 'history') {
            getAntrianHistory();
        } else {
            echo json_encode(['error' => 'Invalid action for GET: ' . $action]);
        }
        break;

    case 'POST':
        if ($action === 'create') {
            createAntrian();
        } elseif ($action === 'accept') {
            acceptAntrian();
        } elseif ($action === 'delete') {
            deleteAntrian();
        } else {
            echo json_encode(['error' => 'Invalid action for POST: ' . $action]);
        }
        break;

    default:
        echo json_encode(['error' => 'Method not allowed: ' . $method]);
        break;
}

// ============================================
// BLOCKCHAIN HELPER FUNCTIONS
// ============================================

function generateHash($data, $prevHash = '') {
    $dataString = json_encode($data) . time() . rand(1000, 9999);
    return hash('sha256', $prevHash . $dataString);
}

function getLastHash() {
    // Get the absolute last hash in the chain (don't filter by is_deleted!)
    $params = "select=current_hash&order=id_antrian.desc&limit=1";
    $result = supabase('GET', 'antrian', $params);
    
    if (!empty($result) && isset($result[0]['current_hash'])) {
        return $result[0]['current_hash'];
    }
    
    return 'GENESIS';
}

// ============================================
// GET FUNCTIONS
// ============================================

function getAntrianByDoctor() {
    $dokterId = $_GET['dokter_id'] ?? '';
    
    if (!$dokterId) {
        echo json_encode(['error' => 'Doctor ID required']);
        return;
    }
    
    // Get all records, ordered by no_antrian, then newest first
    $params = "select=*&id_dokter=eq.$dokterId&order=no_antrian,id_antrian.desc";
    $result = supabase('GET', 'antrian', $params);
    
    // NEW LOGIC: Get ONLY the absolute latest for each no_antrian
    $latest = [];
    $seen = [];
    
    foreach ($result as $row) {
        // If we haven't seen this no_antrian yet, this is the LATEST
        if (!isset($seen[$row['no_antrian']])) {
            $seen[$row['no_antrian']] = true;
            
            // ONLY add if the LATEST record is NOT deleted
            if ($row['is_deleted'] == 0) {
                // Get patient data
                if ($row['id_pasien']) {
                    $pasienParams = "select=nama,nik,no_telp&id_pasien=eq." . $row['id_pasien'];
                    $pasienData = supabase('GET', 'pasien', $pasienParams);
                    $row['pasien'] = !empty($pasienData) ? $pasienData[0] : null;
                }
                
                $latest[] = $row;
            }
            // If latest is deleted, skip this no_antrian completely
        }
    }
    
    echo json_encode($latest);
}

function filterByHour() {
    $jamMulai = $_GET['jam_mulai'] ?? '00:00';
    $jamAkhir = $_GET['jam_akhir'] ?? '23:59';
    $tanggal = $_GET['tanggal'] ?? date('Y-m-d');
    $dokterId = $_GET['dokter_id'] ?? '';
    
    $params = "select=*&tanggal_antrian=eq.$tanggal&jam_antrian=gte.$jamMulai&jam_antrian=lte.$jamAkhir&order=no_antrian,id_antrian.desc";
    
    if ($dokterId) {
        $params .= "&id_dokter=eq.$dokterId";
    }
    
    $result = supabase('GET', 'antrian', $params);
    
    // Same logic as above
    $latest = [];
    $seen = [];
    
    foreach ($result as $row) {
        if (!isset($seen[$row['no_antrian']])) {
            $seen[$row['no_antrian']] = true;
            
            // ONLY add if latest is NOT deleted
            if ($row['is_deleted'] == 0) {
                if ($row['id_pasien']) {
                    $pasienParams = "select=nama,nik,no_telp&id_pasien=eq." . $row['id_pasien'];
                    $pasienData = supabase('GET', 'pasien', $pasienParams);
                    $row['pasien'] = !empty($pasienData) ? $pasienData[0] : null;
                }
                
                $latest[] = $row;
            }
        }
    }
    
    echo json_encode($latest);
}

function getAntrianHistory() {
    $noAntrian = $_GET['no_antrian'] ?? '';
    
    if (!$noAntrian) {
        echo json_encode(['error' => 'Queue number required']);
        return;
    }
    
    $params = "select=*&no_antrian=eq.$noAntrian&order=id_antrian.asc";
    $result = supabase('GET', 'antrian', $params);
    
    echo json_encode($result);
}

function generateQueueNumber() {
    $today = date('dmy');
    
    // Get latest queue for today
    $params = "select=no_antrian&tanggal_antrian=eq." . date('Y-m-d') . "&order=id_antrian.desc&limit=100";
    $result = supabase('GET', 'antrian', $params);
    
    $maxNumber = 0;
    foreach ($result as $row) {
        $numberPart = (int)substr($row['no_antrian'], 0, -6);
        if ($numberPart > $maxNumber) {
            $maxNumber = $numberPart;
        }
    }
    
    $nextNumber = $maxNumber + 1;
    $queueNumber = $nextNumber . $today;
    
    echo json_encode(['no_antrian' => $queueNumber]);
}

function searchPasien() {
    $keyword = $_GET['keyword'] ?? '';
    
    if (strlen($keyword) < 3) {
        echo json_encode(['error' => 'Keyword must be at least 3 characters']);
        return;
    }
    
    $params = "select=*&or=(nama.ilike.*$keyword*,nik.ilike.*$keyword*)&limit=20";
    $result = supabase('GET', 'pasien', $params);
    echo json_encode($result);
}

// ============================================
// POST FUNCTIONS (INSERT ONLY!)
// ============================================

function createAntrian() {
    $input = json_decode(file_get_contents('php://input'), true);
    
    error_log("🧪 Input received: " . json_encode($input));
    
    // Validate required fields
    if (!isset($input['no_antrian']) || !isset($input['tanggal_antrian']) || 
        !isset($input['jam_antrian']) || !isset($input['id_pasien']) || 
        !isset($input['id_dokter'])) {
        echo json_encode([
            'error' => 'Missing required fields',
            'required' => ['no_antrian', 'tanggal_antrian', 'jam_antrian', 'id_pasien', 'id_dokter'],
            'received' => array_keys($input)
        ]);
        return;
    }
    
    // STEP 1: Verify patient exists
    error_log("🔍 Checking if patient exists: " . $input['id_pasien']);
    $patientCheck = supabase('GET', 'pasien', "select=id_pasien&id_pasien=eq." . $input['id_pasien']);
    
    if (empty($patientCheck)) {
        echo json_encode([
            'error' => 'Patient not found',
            'id_pasien' => $input['id_pasien'],
            'hint' => 'This patient ID does not exist in the database'
        ]);
        return;
    }
    
    // STEP 2: Verify doctor exists
    error_log("🔍 Checking if doctor exists: " . $input['id_dokter']);
    $doctorCheck = supabase('GET', 'dokter', "select=id_dokter&id_dokter=eq." . $input['id_dokter']);
    
    if (empty($doctorCheck)) {
        echo json_encode([
            'error' => 'Doctor not found',
            'id_dokter' => $input['id_dokter'],
            'hint' => 'This doctor ID does not exist in the database'
        ]);
        return;
    }
    
    // STEP 3: Get blockchain data
    $prevHash = getLastHash();
    error_log("🔗 Previous hash: " . $prevHash);
    
    // STEP 4: Prepare data
    $data = [
        'no_antrian' => $input['no_antrian'],
        'tanggal_antrian' => $input['tanggal_antrian'],
        'jam_antrian' => $input['jam_antrian'],
        'status_antrian' => 'Belum Periksa',
        'id_pasien' => $input['id_pasien'],
        'id_dokter' => $input['id_dokter'],
        'is_deleted' => 0,
        'prev_hash' => $prevHash
    ];
    
    // Generate hash
    $currentHash = generateHash($data, $prevHash);
    $data['current_hash'] = $currentHash;
    
    error_log("🧪 Data to insert: " . json_encode($data));
    
    // STEP 5: Insert
    $result = supabase('POST', 'antrian', '', $data);
    
    error_log("🧪 Supabase response: " . json_encode($result));
    
    // STEP 6: Check result
    if (isset($result['error'])) {
        echo json_encode([
            'success' => false,
            'error' => 'Supabase error',
            'message' => $result['message'] ?? 'Unknown error',
            'details' => $result['details'] ?? 'No details',
            'hint' => $result['hint'] ?? 'No hint',
            'code' => $result['code'] ?? 'No code',
            'full_response' => $result,
            'data_sent' => $data
        ]);
        return;
    }
    
    if (is_array($result) && !empty($result)) {
        echo json_encode([
            'success' => true,
            'message' => 'Queue created successfully',
            'data' => $result,
            'hash' => $currentHash
        ]);
    } else {
        echo json_encode([
            'success' => false,
            'error' => 'Unexpected response format',
            'response' => $result,
            'data_sent' => $data
        ]);
    }
}

function acceptAntrian() {
    $id = $_GET['id'] ?? null;
    
    if (!$id) {
        echo json_encode(['error' => 'ID required']);
        return;
    }
    
    // Get the current record
    $params = "id_antrian=eq.$id&select=*";
    $current = supabase('GET', 'antrian', $params);
    
    if (empty($current)) {
        echo json_encode(['error' => 'Record not found']);
        return;
    }
    
    $currentRecord = $current[0];
    $prevHash = getLastHash();
    
    // CREATE NEW RECORD - just copy everything and change status
    $newData = [
        'no_antrian' => $currentRecord['no_antrian'],
        'tanggal_antrian' => $currentRecord['tanggal_antrian'],
        'jam_antrian' => $currentRecord['jam_antrian'],
        'status_antrian' => 'Di Terima',
        'id_pasien' => $currentRecord['id_pasien'],
        'id_dokter' => $currentRecord['id_dokter'],
        'is_deleted' => 0,
        'prev_hash' => $prevHash
    ];
    
    $currentHash = generateHash($newData, $prevHash);
    $newData['current_hash'] = $currentHash;
    
    error_log("🔍 Accept - Inserting data: " . json_encode($newData));
    
    $result = supabase('POST', 'antrian', '', $newData);
    
    error_log("🔍 Accept - Supabase result: " . json_encode($result));
    
    if (isset($result['error'])) {
        echo json_encode([
            'success' => false,
            'error' => 'Failed to accept antrian',
            'details' => $result
        ]);
        return;
    }
    
    if (is_array($result) && !empty($result)) {
        echo json_encode([
            'success' => true,
            'message' => 'Queue accepted successfully',
            'data' => $result,
            'hash' => $currentHash
        ]);
    } else {
        echo json_encode([
            'error' => 'Failed to accept antrian',
            'debug' => $result
        ]);
    }
}

function deleteAntrian() {
    $id = $_GET['id'] ?? ($_POST['id'] ?? null);
    
    if (!$id) {
        echo json_encode(['error' => 'ID required']);
        return;
    }
    
    // Get the current record
    $params = "id_antrian=eq.$id&select=*";
    $current = supabase('GET', 'antrian', $params);
    
    if (empty($current)) {
        echo json_encode(['error' => 'Record not found']);
        return;
    }
    
    $currentRecord = $current[0];
    $prevHash = getLastHash();
    
    // CREATE NEW RECORD - just copy everything and set is_deleted = 1
    $newData = [
        'no_antrian' => $currentRecord['no_antrian'],
        'tanggal_antrian' => $currentRecord['tanggal_antrian'],
        'jam_antrian' => $currentRecord['jam_antrian'],
        'status_antrian' => $currentRecord['status_antrian'],
        'id_pasien' => $currentRecord['id_pasien'],
        'id_dokter' => $currentRecord['id_dokter'],
        'is_deleted' => 1,
        'prev_hash' => $prevHash
    ];
    
    $currentHash = generateHash($newData, $prevHash);
    $newData['current_hash'] = $currentHash;
    
    error_log("🔍 Delete - Inserting data: " . json_encode($newData));
    
    $result = supabase('POST', 'antrian', '', $newData);
    
    error_log("🔍 Delete - Supabase result: " . json_encode($result));
    
    if (isset($result['error'])) {
        echo json_encode([
            'success' => false,
            'error' => 'Failed to insert delete record',
            'details' => $result
        ]);
        return;
    }
    
    if (is_array($result) && !empty($result)) {
        echo json_encode([
            'success' => true,
            'message' => 'Queue deleted successfully',
            'data' => $result,
            'hash' => $currentHash
        ]);
    } else {
        echo json_encode([
            'error' => 'Failed to insert delete record',
            'supabase_response' => $result,
            'data_attempted' => $newData
        ]);
    }
}
?>