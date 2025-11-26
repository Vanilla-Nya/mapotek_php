<?php
// API/satusehat/get_locations.php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');

require_once __DIR__ . '/../database.php';
require_once __DIR__ . '/../config/satusehat_api.php';

$requestMethod = $_SERVER['REQUEST_METHOD'];

if ($requestMethod !== 'POST') {
    echo json_encode(['success' => false, 'error' => 'Method not allowed']);
    exit;
}

$input = json_decode(file_get_contents('php://input'), true);

try {
    $idDokter = $input['id_dokter'] ?? null;
    $searchName = $input['search_name'] ?? '';
    
    if (!$idDokter) {
        throw new Exception('Doctor ID is required');
    }
    
    error_log("🏥 ===== FETCHING LOCATIONS =====");
    error_log("👨‍⚕️ Doctor ID: $idDokter");
    error_log("🔍 Search: $searchName");
    
    // Initialize API with doctor's credentials
    $api = SatuSehatAPI::forDoctor($idDokter);
    
    if (!$api->isConfigured()) {
        throw new Exception('SatuSehat API not configured for this doctor. Please configure in Profile settings.');
    }
    
    error_log("✅ API client initialized");
    
    // Get organization ID
    $orgId = $api->getOrganizationId();
    
    if (!$orgId) {
        throw new Exception('Organization ID not found');
    }
    
    error_log("🏢 Organization ID: $orgId");
    
    // Build search parameters
    $params = [
        'organization' => $orgId
    ];
    
    // Add name search if provided
    if (!empty($searchName)) {
        $params['name'] = $searchName;
    }
    
    error_log("📤 Fetching locations with params: " . json_encode($params));
    
    // Fetch locations from SatuSehat
    $response = $api->get('/Location', $params);
    
    error_log("📥 SatuSehat Response:");
    error_log(json_encode($response, JSON_PRETTY_PRINT));
    
    // Check for errors
    if (isset($response['resourceType']) && $response['resourceType'] === 'OperationOutcome') {
        $errorMessage = 'Failed to fetch locations';
        if (isset($response['issue'][0]['diagnostics'])) {
            $errorMessage .= ': ' . $response['issue'][0]['diagnostics'];
        }
        throw new Exception($errorMessage);
    }
    
    // Parse locations
    $locations = [];
    
    if (isset($response['entry']) && is_array($response['entry'])) {
        foreach ($response['entry'] as $entry) {
            if (isset($entry['resource'])) {
                $resource = $entry['resource'];
                
                // Extract location info
                $locationId = $resource['id'] ?? null;
                $locationName = $resource['name'] ?? 'Unnamed Location';
                $locationStatus = $resource['status'] ?? 'unknown';
                
                // Get description if available
                $description = $resource['description'] ?? '';
                
                // Get physical type if available
                $physicalType = '';
                if (isset($resource['physicalType']['coding'][0]['display'])) {
                    $physicalType = $resource['physicalType']['coding'][0]['display'];
                }
                
                // Get address if available
                $address = '';
                if (isset($resource['address']['line'])) {
                    $address = implode(', ', $resource['address']['line']);
                }
                
                if ($locationId) {
                    $locations[] = [
                        'id' => $locationId,
                        'name' => $locationName,
                        'status' => $locationStatus,
                        'description' => $description,
                        'physical_type' => $physicalType,
                        'address' => $address,
                        'full_display' => $locationName . ($description ? ' - ' . $description : '')
                    ];
                }
            }
        }
        
        error_log("✅ Found " . count($locations) . " locations");
    } else {
        error_log("⚠️ No locations found in response");
    }
    
    // Sort by name
    usort($locations, function($a, $b) {
        return strcmp($a['name'], $b['name']);
    });
    
    error_log("=" . str_repeat("=", 50));
    
    echo json_encode([
        'success' => true,
        'data' => [
            'locations' => $locations,
            'count' => count($locations),
            'organization_id' => $orgId
        ]
    ]);
    
} catch (Exception $ex) {
    error_log("❌ EXCEPTION in get_locations: " . $ex->getMessage());
    error_log("   Stack trace: " . $ex->getTraceAsString());
    
    echo json_encode([
        'success' => false,
        'error' => $ex->getMessage()
    ]);
}