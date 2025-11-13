<?php
// api/antrian.php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE');
header('Access-Control-Allow-Headers: Content-Type');

// Include your supabase config
require_once '../config/supabase.php';

$method = $_SERVER['REQUEST_METHOD'];
$action = $_GET['action'] ?? '';

switch ($method) {
    case 'GET':
        if ($action === 'list') {
            getAntrian();
        } elseif ($action === 'filter_by_hour') {
            filterByHour();
        }
        break;
    
    case 'POST':
        if ($action === 'create') {
            createAntrian();
        }
        break;
    
    case 'PUT':
        if ($action === 'update') {
            updateAntrian();
        }
        break;
    
    case 'DELETE':
        if ($action === 'delete') {
            deleteAntrian();
        }
        break;
    
    default:
        echo json_encode(['error' => 'Method not allowed']);
        break;
}

// Get all antrian or filter by date
function getAntrian() {
    $tanggal = $_GET['tanggal'] ?? '';
    $status = $_GET['status'] ?? '';
    
    $params = "select=*&order=tanggal_antrian.desc,jam_antrian.desc";
    
    // Filter by date if provided
    if ($tanggal) {
        $params .= "&tanggal_antrian=eq.$tanggal";
    }
    
    // Filter by status if provided and not 'all'
    if ($status && $status !== 'all') {
        $params .= "&status_antrian=eq.$status";
    }
    
    $result = supabase('GET', 'antrian', $params);
    echo json_encode($result);
}

// Filter antrian by hour range
function filterByHour() {
    $jamMulai = $_GET['jam_mulai'] ?? '00:00';
    $jamAkhir = $_GET['jam_akhir'] ?? '23:59';
    $tanggal = $_GET['tanggal'] ?? date('Y-m-d');
    
    // Supabase filter: get records where jam_antrian is between jamMulai and jamAkhir
    $params = "select=*&tanggal_antrian=eq.$tanggal&jam_antrian=gte.$jamMulai&jam_antrian=lte.$jamAkhir&order=jam_antrian.asc";
    
    $result = supabase('GET', 'antrian', $params);
    echo json_encode($result);
}

// Create new antrian
function createAntrian() {
    $input = json_decode(file_get_contents('php://input'), true);
    
    // Validate required fields
    if (!isset($input['no_antrian']) || !isset($input['jenis_pasien']) || 
        !isset($input['tanggal_antrian']) || !isset($input['jam_antrian'])) {
        echo json_encode(['error' => 'Missing required fields']);
        return;
    }
    
    $data = [
        'no_antrian' => $input['no_antrian'],
        'jenis_pasien' => $input['jenis_pasien'],
        'tanggal_antrian' => $input['tanggal_antrian'],
        'jam_antrian' => $input['jam_antrian'],
        'status_antrian' => $input['status_antrian'] ?? 'Menunggu',
        'id_pasien' => $input['id_pasien'] ?? null
    ];
    
    $result = supabase('POST', 'antrian', '', $data);
    echo json_encode($result);
}

// Update antrian
function updateAntrian() {
    $input = json_decode(file_get_contents('php://input'), true);
    $id = $_GET['id'] ?? null;
    
    if (!$id) {
        echo json_encode(['error' => 'ID required']);
        return;
    }
    
    $data = [];
    if (isset($input['no_antrian'])) $data['no_antrian'] = $input['no_antrian'];
    if (isset($input['status_antrian'])) $data['status_antrian'] = $input['status_antrian'];
    if (isset($input['jam_antrian'])) $data['jam_antrian'] = $input['jam_antrian'];
    
    $params = "id_antrian=eq.$id";
    $result = supabase('PATCH', 'antrian', $params, $data);
    echo json_encode($result);
}

// Delete antrian
function deleteAntrian() {
    $id = $_GET['id'] ?? null;
    
    if (!$id) {
        echo json_encode(['error' => 'ID required']);
        return;
    }
    
    $params = "id_antrian=eq.$id";
    $result = supabase('DELETE', 'antrian', $params);
    echo json_encode(['success' => true]);
}
?>