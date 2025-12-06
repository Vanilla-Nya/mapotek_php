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
            // Read pasien data
            $params = '';
            if (!empty($_GET)) {
                $queryParts = [];
                foreach ($_GET as $key => $value) {
                    $queryParts[] = "$key=$value";
                }
                $params = implode('&', $queryParts);
            }

            $result = supabase('GET', 'pasien', $params, null, $userToken);
            
            if (isset($result['error'])) {
                echo json_encode(['success' => false, 'error' => $result['error']]);
            } else {
                echo json_encode(['success' => true, 'data' => $result]);
            }
            break;

        case 'POST':
            // Create new pasien
            $rawInput = file_get_contents('php://input');
            $data = json_decode($rawInput, true);

            // Debug logging (remove in production)
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

            // Validate required fields
            $required = ['nama', 'alamat'];
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

            // Clean and prepare data
            $cleanData = [
                'nama' => trim($data['nama']),
                'alamat' => trim($data['alamat']),
                'nik' => isset($data['nik']) ? trim($data['nik']) : null,
                'jenis_kelamin' => isset($data['jenis_kelamin']) ? trim($data['jenis_kelamin']) : null,
                'tanggal_lahir' => isset($data['tanggal_lahir']) ? $data['tanggal_lahir'] : null,
                'no_telp' => isset($data['no_telp']) ? trim($data['no_telp']) : null,
                'password' => isset($data['password']) ? $data['password'] : null
            ];

            // Remove null values
            $cleanData = array_filter($cleanData, function($value) {
                return $value !== null;
            });

            // Insert using service role (bypasses RLS for testing)
            // TODO: Enable proper RLS policies and use user token
            $result = supabase('POST', 'pasien', '', $cleanData, $userToken);

            if (isset($result['error'])) {
                echo json_encode([
                    'success' => false, 
                    'error' => $result['error'],
                    'details' => $result
                ]);
            } else {
                echo json_encode([
                    'success' => true, 
                    'data' => $result
                ]);
            }
            break;

        case 'PATCH':
        case 'PUT':
            // Update pasien
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

            $result = supabase('PATCH', 'pasien', $params, $data, $userToken);
            
            if (isset($result['error'])) {
                echo json_encode(['success' => false, 'error' => $result['error']]);
            } else {
                echo json_encode(['success' => true, 'data' => $result]);
            }
            break;

        case 'DELETE':
            // Delete pasien
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

            $result = supabase('DELETE', 'pasien', $params, null, $userToken);
            
            if (isset($result['error'])) {
                echo json_encode(['success' => false, 'error' => $result['error']]);
            } else {
                echo json_encode([
                    'success' => true, 
                    'message' => 'Pasien deleted successfully'
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
    echo json_encode([
        'success' => false, 
        'error' => $e->getMessage(),
        'trace' => $e->getTraceAsString()
    ]);
}
?>