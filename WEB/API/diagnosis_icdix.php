<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, PATCH');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

require_once(__DIR__ . '/config/supabase.php');

$method = $_SERVER['REQUEST_METHOD'];

// Get Authorization header (user token)
$headers = getallheaders();
$userToken = $headers['Authorization'] ?? null;

try {
    switch ($method) {
        case 'GET':
            // Read diagnosis_icdix data
            $params = '';
            if (!empty($_GET)) {
                $queryParts = [];
                foreach ($_GET as $key => $value) {
                    $queryParts[] = "$key=$value";
                }
                $params = implode('&', $queryParts);
            }

            $result = supabase('GET', 'diagnosis_icdix', $params, null, $userToken);
            
            if (isset($result['error'])) {
                echo json_encode(['success' => false, 'error' => $result['error']]);
            } else {
                echo json_encode(['success' => true, 'data' => $result]);
            }
            break;

        case 'POST':
            // Create new diagnosis_icdix
            $data = json_decode(file_get_contents('php://input'), true);
            
            if (!$data) {
                echo json_encode(['success' => false, 'error' => 'Invalid data']);
                break;
            }

            // Validate required fields
            $required = ['id_pemeriksaan', 'kode_icdix', 'deskripsi'];
            $missingFields = [];
            
            foreach ($required as $field) {
                if (!isset($data[$field]) || trim($data[$field]) === '') {
                    $missingFields[] = $field;
                }
            }

            if (!empty($missingFields)) {
                echo json_encode([
                    'success' => false,
                    'error' => 'Required fields missing: ' . implode(', ', $missingFields)
                ]);
                exit;
            }

            $result = supabase('POST', 'diagnosis_icdix', '', $data, $userToken);
            
            if (isset($result['error'])) {
                echo json_encode(['success' => false, 'error' => $result['error']]);
            } else {
                echo json_encode(['success' => true, 'data' => $result]);
            }
            break;

        case 'PATCH':
        case 'PUT':
            // Update diagnosis_icdix
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

            $result = supabase('PATCH', 'diagnosis_icdix', $params, $data, $userToken);
            
            if (isset($result['error'])) {
                echo json_encode(['success' => false, 'error' => $result['error']]);
            } else {
                echo json_encode(['success' => true, 'data' => $result]);
            }
            break;

        case 'DELETE':
            // Delete diagnosis_icdix
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

            $result = supabase('DELETE', 'diagnosis_icdix', $params, null, $userToken);
            
            if (isset($result['error'])) {
                echo json_encode(['success' => false, 'error' => $result['error']]);
            } else {
                echo json_encode([
                    'success' => true, 
                    'message' => 'Diagnosis ICDIX deleted successfully'
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
        'error' => $e->getMessage()
    ]);
}
?>