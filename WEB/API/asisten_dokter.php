<?php
header('Content-Type: application/json');
require_once(__DIR__ . '/config/supabase.php');

$method = $_SERVER['REQUEST_METHOD'];

// Get Authorization header (user token)
$headers = getallheaders();
$userToken = $headers['Authorization'] ?? null;

try {
    switch ($method) {
        case 'GET':
            // Read asisten dokter data
            $params = '';
            if (!empty($_GET)) {
                $queryParts = [];
                foreach ($_GET as $key => $value) {
                    $queryParts[] = "$key=$value";
                }
                $params = implode('&', $queryParts);
            }

            $result = supabase('GET', 'asisten_dokter', $params, null, $userToken);
            
            if (isset($result['error'])) {
                echo json_encode(['success' => false, 'error' => $result['error']]);
            } else {
                echo json_encode(['success' => true, 'data' => $result]);
            }
            break;

        case 'POST':
            // Create new asisten dokter
            $rawInput = file_get_contents('php://input');
            $data = json_decode($rawInput, true);

            // Debug logging
            error_log("=== ASISTEN_DOKTER POST ===");
            error_log("Raw input: " . $rawInput);
            error_log("Parsed data: " . print_r($data, true));

            if (!$data) {
                echo json_encode([
                    'success' => false, 
                    'error' => 'Invalid JSON data',
                    'raw_input' => $rawInput
                ]);
                break;
            }

            // ⭐ CRITICAL: Check for id_asisten_dokter (from auth)
            if (!isset($data['id_asisten_dokter']) || empty($data['id_asisten_dokter'])) {
                echo json_encode([
                    'success' => false,
                    'error' => 'id_asisten_dokter is required (must match auth user ID)',
                    'received_data' => array_keys($data)
                ]);
                exit;
            }

            // Validate required fields
            $required = ['id_asisten_dokter', 'email', 'nama_lengkap', 'no_telp', 'alamat', 'id_dokter'];
            $missingFields = [];
            
            foreach ($required as $field) {
                if (!isset($data[$field]) || trim($data[$field]) === '') {
                    $missingFields[] = $field;
                }
            }

            if (!empty($missingFields)) {
                echo json_encode([
                    'success' => false,
                    'error' => 'Required fields missing: ' . implode(', ', $missingFields),
                    'received_data' => array_keys($data)
                ]);
                exit;
            }

            // ⭐ FIXED: Include id_asisten_dokter in cleanData!
            $cleanData = [
                'id_asisten_dokter' => trim($data['id_asisten_dokter']),  // ⭐ THIS IS THE FIX!
                'email' => trim($data['email']),
                'nama_lengkap' => trim($data['nama_lengkap']),
                'no_telp' => trim($data['no_telp']),
                'alamat' => trim($data['alamat']),
                'id_dokter' => $data['id_dokter'],
                'username' => isset($data['username']) ? trim($data['username']) : null,
                'jenis_kelamin' => isset($data['jenis_kelamin']) ? trim($data['jenis_kelamin']) : null,
                'nik' => isset($data['nik']) ? trim($data['nik']) : null,
                'rfid' => isset($data['rfid']) ? trim($data['rfid']) : null
            ];

            // Remove null values
            $cleanData = array_filter($cleanData, function($value) {
                return $value !== null && $value !== '';
            });

            error_log("📝 Clean data to insert: " . json_encode($cleanData));
            error_log("📝 id_asisten_dokter: " . $cleanData['id_asisten_dokter']);

            // Insert using provided token
            $result = supabase('POST', 'asisten_dokter', '', $cleanData, $userToken);

            error_log("📡 Supabase result: " . json_encode($result));

            if (isset($result['error'])) {
                echo json_encode([
                    'success' => false, 
                    'error' => $result['error'],
                    'details' => $result
                ]);
            } else {
                echo json_encode([
                    'success' => true, 
                    'data' => $result,
                    'message' => 'Asisten dokter created with ID: ' . $cleanData['id_asisten_dokter']
                ]);
            }
            break;

        case 'PATCH':
        case 'PUT':
            // Update asisten dokter
            $data = json_decode(file_get_contents('php://input'), true);
            
            if (!$data) {
                echo json_encode(['success' => false, 'error' => 'Invalid data']);
                break;
            }

            $params = '';
            if (!empty($_GET)) {
                $queryParts = [];
                foreach ($_GET as $key => $value) {
                    $queryParts[] = "$key=$value";
                }
                $params = implode('&', $queryParts);
            }

            $result = supabase('PATCH', 'asisten_dokter', $params, $data, $userToken);
            
            if (isset($result['error'])) {
                echo json_encode(['success' => false, 'error' => $result['error']]);
            } else {
                echo json_encode(['success' => true, 'data' => $result]);
            }
            break;

        case 'DELETE':
            // Delete asisten dokter
            $params = '';
            if (!empty($_GET)) {
                $queryParts = [];
                foreach ($_GET as $key => $value) {
                    $queryParts[] = "$key=$value";
                }
                $params = implode('&', $queryParts);
            }

            if (empty($params)) {
                echo json_encode([
                    'success' => false, 
                    'error' => 'ID is required for deletion'
                ]);
                break;
            }

            $result = supabase('DELETE', 'asisten_dokter', $params, null, $userToken);
            
            if (isset($result['error'])) {
                echo json_encode(['success' => false, 'error' => $result['error']]);
            } else {
                echo json_encode([
                    'success' => true, 
                    'message' => 'Asisten dokter deleted successfully'
                ]);
            }
            break;

        default:
            echo json_encode([
                'success' => false, 
                'error' => 'Method not allowed'
            ]);
            break;
    }
} catch (Exception $e) {
    error_log("❌ Exception: " . $e->getMessage());
    echo json_encode([
        'success' => false, 
        'error' => $e->getMessage(),
        'trace' => $e->getTraceAsString()
    ]);
}
?>