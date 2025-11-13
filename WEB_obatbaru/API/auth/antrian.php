<?php
// API/auth/antrian.php - Complete Version
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

require_once '../database.php';         // Regular operations
require_once '../database_service.php'; // Admin operations

$method = $_SERVER['REQUEST_METHOD'];
$action = $_GET['action'] ?? '';

error_log("=== ANTRIAN API ===");
error_log("Method: $method, Action: '$action'");

switch ($method) {
    case 'GET':
        if ($action === 'list') {
            getAntrian();
        } elseif ($action === 'filter_by_hour') {
            filterByHour();
        } elseif ($action === 'search_pasien') {
            searchPasien();
        } elseif ($action === 'generate_number') {
            generateQueueNumber();
        } elseif ($action === 'get_doctors') {
            getDoctors();
        } elseif ($action === 'list_by_doctor') {
            getAntrianByDoctor();
        } else {
            echo json_encode([
                'error' => 'Invalid action',
                'available_actions' => ['list', 'filter_by_hour', 'search_pasien', 'generate_number', 'get_doctors', 'list_by_doctor']
            ]);
        }
        break;
    
    case 'POST':
        if ($action === 'create') {
            createAntrian();
        } else {
            echo json_encode(['error' => 'Invalid action for POST']);
        }
        break;
    
    case 'DELETE':
        if ($action === 'delete') {
            deleteAntrian();
        } else {
            echo json_encode(['error' => 'Invalid action for DELETE']);
        }
        break;
    
    default:
        echo json_encode(['error' => 'Method not allowed']);
        break;
}

// Generate simple queue number (counter + date)
function generateQueueNumber() {
    $today = date('Y-m-d');
    $dateFormat = date('dmy'); // DDMMYY format
    
    error_log("Generating queue number for date: $today");
    
    // Get last queue number for today
    $params = "select=no_antrian&tanggal_antrian=eq.$today&order=created_at.desc&limit=1";
    $result = supabase('GET', 'antrian', $params);
    
    error_log("Last queue result: " . json_encode($result));
    
    $counter = 1;
    
    if (is_array($result) && count($result) > 0 && !isset($result['error'])) {
        $lastNumber = $result[0]['no_antrian'];
        error_log("Last queue number: $lastNumber");
        
        // Extract counter: format is [counter][DDMMYY]
        // Example: 5081025 -> extract "5"
        if (preg_match('/^(\d+)' . $dateFormat . '$/', $lastNumber, $matches)) {
            $counter = intval($matches[1]) + 1;
            error_log("Extracted counter: {$matches[1]}, Next: $counter");
        }
    }
    
    $queueNumber = $counter . $dateFormat;
    error_log("Generated: $queueNumber");
    
    echo json_encode(['no_antrian' => $queueNumber]);
}

// Get all doctors
function getDoctors() {
    try {
        $params = "select=id_dokter,nama_lengkap,nama_faskes&order=nama_lengkap.asc";
        $result = supabase('GET', 'dokter', $params);
        
        if (is_array($result) && !isset($result['error'])) {
            error_log("Found " . count($result) . " doctors");
            echo json_encode($result);
        } else {
            error_log("Error getting doctors: " . json_encode($result));
            echo json_encode([]);
        }
    } catch (Exception $e) {
        error_log("Exception in getDoctors: " . $e->getMessage());
        echo json_encode(['error' => $e->getMessage()]);
    }
}

// Search patients
function searchPasien() {
    try {
        $keyword = $_GET['keyword'] ?? '';
        
        error_log("searchPasien() keyword: '$keyword'");
        
        if (empty($keyword)) {
            $params = "select=id_pasien,nama,nik,no_telp&order=nama.asc&limit=50";
        } else {
            $params = "select=id_pasien,nama,nik,no_telp&nama=ilike.*$keyword*&order=nama.asc";
        }
        
        $result = supabase('GET', 'pasien', $params);
        
        if (is_array($result) && !isset($result['error'])) {
            error_log("Found " . count($result) . " patients");
            echo json_encode($result);
        } else {
            error_log("Error searching patients: " . json_encode($result));
            echo json_encode([]);
        }
    } catch (Exception $e) {
        error_log("Exception in searchPasien: " . $e->getMessage());
        echo json_encode(['error' => $e->getMessage()]);
    }
}

// Get all antrian (with patient and doctor info)
function getAntrian() {
    try {
        $tanggal = $_GET['tanggal'] ?? '';
        $status = $_GET['status'] ?? '';
        
        // Join with pasien and dokter tables
        $params = "select=*,pasien(nama,nik),dokter(nama_lengkap,nama_faskes)&order=tanggal_antrian.desc,jam_antrian.desc";
        
        if ($tanggal) {
            $params .= "&tanggal_antrian=eq.$tanggal";
        }
        
        if ($status && $status !== 'all') {
            $params .= "&status_antrian=eq.$status";
        }
        
        error_log("getAntrian params: $params");
        $result = supabase('GET', 'antrian', $params);
        
        if (isset($result['error']) || isset($result['code'])) {
            error_log("Supabase error: " . json_encode($result));
            echo json_encode([]);
        } else if (is_array($result)) {
            error_log("Fetched " . count($result) . " records");
            echo json_encode($result);
        } else {
            echo json_encode([]);
        }
    } catch (Exception $e) {
        error_log("Exception in getAntrian: " . $e->getMessage());
        echo json_encode(['error' => $e->getMessage()]);
    }
}

// Get antrian by specific doctor
function getAntrianByDoctor() {
    try {
        $dokterId = $_GET['dokter_id'] ?? '';
        $tanggal = $_GET['tanggal'] ?? '';
        $status = $_GET['status'] ?? '';
        
        if (empty($dokterId)) {
            echo json_encode(['error' => 'Doctor ID required']);
            return;
        }
        
        error_log("getAntrianByDoctor - Doctor ID: $dokterId");
        
        // Join with pasien table, filter by doctor
        $params = "select=*,pasien(nama,nik)&id_dokter=eq.$dokterId&order=tanggal_antrian.desc,jam_antrian.desc";
        
        if ($tanggal) {
            $params .= "&tanggal_antrian=eq.$tanggal";
        }
        
        if ($status && $status !== 'all') {
            $params .= "&status_antrian=eq.$status";
        }
        
        error_log("getAntrianByDoctor params: $params");
        $result = supabase('GET', 'antrian', $params);
        
        if (isset($result['error']) || isset($result['code'])) {
            error_log("Supabase error: " . json_encode($result));
            echo json_encode([]);
        } else if (is_array($result)) {
            error_log("Fetched " . count($result) . " records for doctor: $dokterId");
            echo json_encode($result);
        } else {
            echo json_encode([]);
        }
    } catch (Exception $e) {
        error_log("Exception in getAntrianByDoctor: " . $e->getMessage());
        echo json_encode(['error' => $e->getMessage()]);
    }
}

// Filter by hour range
function filterByHour() {
    try {
        $jamMulai = $_GET['jam_mulai'] ?? '00:00';
        $jamAkhir = $_GET['jam_akhir'] ?? '23:59';
        $tanggal = $_GET['tanggal'] ?? date('Y-m-d');
        $dokterId = $_GET['dokter_id'] ?? '';
        
        $params = "select=*,pasien(nama,nik),dokter(nama_lengkap)&tanggal_antrian=eq.$tanggal&jam_antrian=gte.$jamMulai&jam_antrian=lte.$jamAkhir&order=jam_antrian.asc";
        
        // Optional: filter by doctor
        if ($dokterId) {
            $params .= "&id_dokter=eq.$dokterId";
            error_log("filterByHour - filtering by doctor: $dokterId");
        }
        
        error_log("filterByHour params: $params");
        $result = supabase('GET', 'antrian', $params);
        
        if (isset($result['error']) || isset($result['code'])) {
            error_log("Supabase error: " . json_encode($result));
            echo json_encode([]);
        } else if (is_array($result)) {
            error_log("Filter found " . count($result) . " records");
            echo json_encode($result);
        } else {
            echo json_encode([]);
        }
    } catch (Exception $e) {
        error_log("Exception in filterByHour: " . $e->getMessage());
        echo json_encode(['error' => $e->getMessage()]);
    }
}

// Create new antrian
function createAntrian() {
    try {
        $input = json_decode(file_get_contents('php://input'), true);
        
        error_log("Create antrian input: " . json_encode($input));
        
        if (!isset($input['no_antrian']) || !isset($input['id_pasien']) || 
            !isset($input['tanggal_antrian']) || !isset($input['jam_antrian']) ||
            !isset($input['id_dokter'])) {
            echo json_encode(['error' => 'Missing required fields']);
            return;
        }
        
        $data = [
            'no_antrian' => $input['no_antrian'],
            'id_pasien' => $input['id_pasien'],
            'id_dokter' => $input['id_dokter'],
            'tanggal_antrian' => $input['tanggal_antrian'],
            'jam_antrian' => $input['jam_antrian'],
            'jenis_pasien' => 'Umum',
            'status_antrian' => 'Belum Periksa'
        ];
        
        error_log("Creating antrian: " . json_encode($data));
        $result = supabase('POST', 'antrian', '', $data);
        
        if (isset($result['error']) || isset($result['code'])) {
            error_log("Supabase error: " . json_encode($result));
            echo json_encode(['error' => 'Failed to create', 'details' => $result]);
        } else if (is_array($result) && count($result) > 0) {
            error_log("Antrian created successfully");
            echo json_encode($result[0]);
        } else {
            error_log("Unexpected result: " . json_encode($result));
            echo json_encode(['error' => 'Unexpected response']);
        }
    } catch (Exception $e) {
        error_log("Exception in createAntrian: " . $e->getMessage());
        echo json_encode(['error' => $e->getMessage()]);
    }
}

// Delete antrian
function deleteAntrian() {
    try {
        $id = $_GET['id'] ?? null;
        
        if (!$id) {
            echo json_encode(['success' => false, 'error' => 'ID required']);
            return;
        }
        
        error_log("Deleting antrian ID: $id");
        $params = "id_antrian=eq.$id";
        $result = supabase('DELETE', 'antrian', $params);
        
        // DELETE usually returns empty array on success
        if (!isset($result['error']) && !isset($result['code'])) {
            error_log("Deleted successfully");
            echo json_encode(['success' => true]);
        } else {
            error_log("Delete error: " . json_encode($result));
            echo json_encode(['success' => false, 'error' => 'Failed to delete', 'details' => $result]);
        }
    } catch (Exception $e) {
        error_log("Exception in deleteAntrian: " . $e->getMessage());
        echo json_encode(['success' => false, 'error' => $e->getMessage()]);
    }
}
?>