<?php
   if (!function_exists('getallheaders')) {
    function getallheaders() {
        $headers = [];
        foreach ($_SERVER as $name => $value) {
            if (substr($name, 0, 5) == 'HTTP_') {
                $key = str_replace(' ', '-', ucwords(strtolower(str_replace('_', ' ', substr($name, 5)))));
                $headers[$key] = $value;
            }
        }
        return $headers;
    }
}
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
            // Read table_pemeriksaan_loinc data with loinc join
            $params = '';
            if (!empty($_GET)) {
                $queryParts = [];
                foreach ($_GET as $key => $value) {
                    $queryParts[] = "$key=$value";
                }
                $params = implode('&', $queryParts);
            }

            $result = supabase('GET', 'table_pemeriksaan_loinc', $params, null, $userToken);
            
            if (isset($result['error'])) {
                echo json_encode(['success' => false, 'error' => $result['error']]);
            } else {
                echo json_encode(['success' => true, 'data' => $result]);
            }
            break;

        case 'POST':
            // Create new table_pemeriksaan_loinc (vital signs)
            $data = json_decode(file_get_contents('php://input'), true);
            
            if (!$data) {
                echo json_encode(['success' => false, 'error' => 'Invalid data']);
                break;
            }

            // Validate required fields
            $required = ['id_pemeriksaan', 'id_ioinc', 'nilai', 'satuan'];
            $missingFields = [];
            
            foreach ($required as $field) {
                if (!isset($data[$field])) {
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

            $result = supabase('POST', 'table_pemeriksaan_loinc', '', $data, $userToken);
            
            if (isset($result['error'])) {
                echo json_encode(['success' => false, 'error' => $result['error']]);
            } else {
                echo json_encode(['success' => true, 'data' => $result]);
            }
            break;

        case 'PATCH':
        case 'PUT':
            // Update table_pemeriksaan_loinc
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

            $result = supabase('PATCH', 'table_pemeriksaan_loinc', $params, $data, $userToken);
            
            if (isset($result['error'])) {
                echo json_encode(['success' => false, 'error' => $result['error']]);
            } else {
                echo json_encode(['success' => true, 'data' => $result]);
            }
            break;

        case 'DELETE':
            // Delete table_pemeriksaan_loinc
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

            $result = supabase('DELETE', 'table_pemeriksaan_loinc', $params, null, $userToken);
            
            if (isset($result['error'])) {
                echo json_encode(['success' => false, 'error' => $result['error']]);
            } else {
                echo json_encode([
                    'success' => true, 
                    'message' => 'Vital sign deleted successfully'
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
```

## 📍 Save these files in:
```
/MAPOTEK_PHP/WEB/API/diagnosis_icdix.php
/MAPOTEK_PHP/WEB/API/table_pemeriksaan_loinc.php