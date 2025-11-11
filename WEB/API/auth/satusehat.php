<?php
// ../API/auth/satusehat.php

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

require_once __DIR__ . '/../config/satusehat_api.php';

class SatuSehatHandler {
    private $api;
    private $terminologyUrl = 'https://api-satusehat-stg.dto.kemkes.go.id/terminology/v1';
    
    public function __construct() {
        $this->api = new SatuSehatAPI();
    }
    
    public function searchICD10($keyword, $count = 20) {
        try {
            $token = $this->api->getToken();
            
            if (!$token) {
                return ['success' => false, 'message' => 'Failed to get access token'];
            }
            
            // Method 1: Try CodeSystem lookup instead of ValueSet
            $url = $this->terminologyUrl . '/CodeSystem/$lookup?' . http_build_query([
                'system' => 'http://hl7.org/fhir/sid/icd-10',
                'code' => $keyword
            ]);
            
            error_log("🔍 Method 1 - CodeSystem Lookup: " . $url);
            $result = $this->makeTerminologyRequest($url, $token);
            
            if ($result['success']) {
                return $result;
            }
            
            // Method 2: Try different ValueSet URL format
            $url2 = $this->terminologyUrl . '/ValueSet/$expand?' . http_build_query([
                'identifier' => 'http://hl7.org/fhir/sid/icd-10',
                'filter' => $keyword,
                'count' => $count
            ]);
            
            error_log("🔍 Method 2 - ValueSet with identifier: " . $url2);
            $result2 = $this->makeTerminologyRequest($url2, $token);
            
            if ($result2['success']) {
                return $result2;
            }
            
            // Method 3: Direct search on CodeSystem
            $url3 = $this->terminologyUrl . '/CodeSystem/icd-10?' . http_build_query([
                '_filter' => $keyword,
                '_count' => $count
            ]);
            
            error_log("🔍 Method 3 - Direct CodeSystem search: " . $url3);
            
            return $this->makeTerminologyRequest($url3, $token);
            
        } catch (Exception $e) {
            error_log("❌ ICD-10 Search Error: " . $e->getMessage());
            return ['success' => false, 'message' => $e->getMessage()];
        }
    }
    
    public function searchICD9CM($keyword, $count = 20) {
        try {
            $token = $this->api->getToken();
            
            if (!$token) {
                return ['success' => false, 'message' => 'Failed to get access token'];
            }
            
            // Try multiple methods for ICD-9
            $url = $this->terminologyUrl . '/ValueSet/$expand?' . http_build_query([
                'url' => 'http://hl7.org/fhir/sid/icd-9-cm',
                'filter' => $keyword,
                'count' => $count
            ]);
            
            error_log("🔍 ICD-9 Search URL: " . $url);
            
            return $this->makeTerminologyRequest($url, $token);
            
        } catch (Exception $e) {
            error_log("❌ ICD-9 Search Error: " . $e->getMessage());
            return ['success' => false, 'message' => $e->getMessage()];
        }
    }
    
    private function makeTerminologyRequest($url, $token) {
        $ch = curl_init($url);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_HTTPHEADER, [
            'Authorization: Bearer ' . $token,
            'Content-Type: application/json',
            'Accept: application/json'
        ]);
        
        curl_setopt($ch, CURLOPT_TIMEOUT, 30);
        curl_setopt($ch, CURLOPT_CONNECTTIMEOUT, 10);
        curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false); // For staging environment
        
        $response = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        
        if (curl_errno($ch)) {
            $error = curl_error($ch);
            curl_close($ch);
            error_log("❌ cURL Error: " . $error);
            return ['success' => false, 'message' => 'cURL Error: ' . $error];
        }
        
        curl_close($ch);
        
        error_log("📥 API Response Code: " . $httpCode);
        error_log("📥 API Response: " . $response);
        
        if ($httpCode == 200) {
            $data = json_decode($response, true);
            
            if (json_last_error() !== JSON_ERROR_NONE) {
                return ['success' => false, 'message' => 'JSON Parse Error: ' . json_last_error_msg()];
            }
            
            // Parse different response formats
            
            // Format 1: ValueSet expansion
            if (isset($data['expansion']['contains'])) {
                $results = [];
                foreach ($data['expansion']['contains'] as $item) {
                    $results[] = [
                        'code' => $item['code'] ?? '',
                        'display' => $item['display'] ?? ''
                    ];
                }
                return ['success' => true, 'data' => $results, 'total' => count($results)];
            }
            
            // Format 2: CodeSystem concepts
            if (isset($data['concept'])) {
                $results = [];
                foreach ($data['concept'] as $item) {
                    $results[] = [
                        'code' => $item['code'] ?? '',
                        'display' => $item['display'] ?? $item['definition'] ?? ''
                    ];
                }
                return ['success' => true, 'data' => $results, 'total' => count($results)];
            }
            
            // Format 3: Bundle entries
            if (isset($data['entry'])) {
                $results = [];
                foreach ($data['entry'] as $entry) {
                    $resource = $entry['resource'] ?? [];
                    $results[] = [
                        'code' => $resource['code'] ?? '',
                        'display' => $resource['display'] ?? $resource['name'] ?? ''
                    ];
                }
                return ['success' => true, 'data' => $results, 'total' => count($results)];
            }
            
            return ['success' => false, 'message' => 'Unknown response format', 'raw' => $data];
        }
        
        return [
            'success' => false, 
            'message' => 'API Error: ' . $httpCode,
            'response' => $response,
            'url' => $url
        ];
    }
}

// Main Handler
try {
    $action = $_GET['action'] ?? '';
    
    if (empty($action)) {
        echo json_encode(['success' => false, 'message' => 'No action specified']);
        exit;
    }
    
    $handler = new SatuSehatHandler();
    
    switch ($action) {
        case 'search_icd10':
            $keyword = $_GET['keyword'] ?? '';
            
            if (empty($keyword)) {
                echo json_encode(['success' => false, 'message' => 'Keyword tidak boleh kosong']);
                exit;
            }
            
            if (strlen($keyword) < 3) {
                echo json_encode(['success' => false, 'message' => 'Minimal 3 karakter untuk pencarian']);
                exit;
            }
            
            error_log("🔍 Searching ICD-10 with keyword: " . $keyword);
            $result = $handler->searchICD10($keyword);
            echo json_encode($result);
            break;
            
        case 'search_icd9':
            $keyword = $_GET['keyword'] ?? '';
            
            if (empty($keyword)) {
                echo json_encode(['success' => false, 'message' => 'Keyword tidak boleh kosong']);
                exit;
            }
            
            if (strlen($keyword) < 3) {
                echo json_encode(['success' => false, 'message' => 'Minimal 3 karakter untuk pencarian']);
                exit;
            }
            
            error_log("🔍 Searching ICD-9 with keyword: " . $keyword);
            $result = $handler->searchICD9CM($keyword);
            echo json_encode($result);
            break;
            
        default:
            echo json_encode(['success' => false, 'message' => 'Invalid action: ' . $action]);
            break;
    }
    
} catch (Exception $e) {
    error_log("❌ Fatal Error: " . $e->getMessage());
    echo json_encode([
        'success' => false, 
        'message' => 'Server Error: ' . $e->getMessage()
    ]);
}
?>