<?php
// API/satusehat/test_connection.php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');

$input = json_decode(file_get_contents('php://input'), true);

$org_id = $input['org_id'] ?? '';
$client_id = $input['client_id'] ?? '';
$client_secret = $input['client_secret'] ?? '';

if (empty($org_id) || empty($client_id) || empty($client_secret)) {
    echo json_encode([
        'success' => false,
        'message' => 'Semua field API harus diisi'
    ]);
    exit;
}

/**
 * Auto-detect environment based on credentials
 */
function detectEnvironment($org_id, $client_id) {
    // Check Organization ID patterns
    $orgIdLower = strtolower($org_id);
    if (stripos($orgIdLower, 'test') !== false || 
        stripos($orgIdLower, 'sandbox') !== false ||
        stripos($orgIdLower, 'demo') !== false ||
        stripos($orgIdLower, 'dev') !== false) {
        return 'sandbox';
    }
    
    // Default to production
    return 'production';
}

/**
 * Try to authenticate with given environment
 */
function tryAuthentication($authUrl, $client_id, $client_secret) {
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $authUrl);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_TIMEOUT, 10);
    
    $postFields = http_build_query([
        "client_id" => $client_id,
        "client_secret" => $client_secret
    ]);
    
    curl_setopt($ch, CURLOPT_POSTFIELDS, $postFields);
    curl_setopt($ch, CURLOPT_HTTPHEADER, [
        "Content-Type: application/x-www-form-urlencoded"
    ]);
    
    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    
    if (curl_errno($ch)) {
        $error = curl_error($ch);
        curl_close($ch);
        return [
            'success' => false,
            'error' => $error
        ];
    }
    
    curl_close($ch);
    
    $json = json_decode($response, true);
    
    return [
        'success' => ($httpCode === 200 && isset($json["access_token"])),
        'http_code' => $httpCode,
        'response' => $json
    ];
}

// Test connection with auto-detection
try {
    // Try production first
    $productionAuthUrl = "https://api-satusehat.kemkes.go.id/oauth2/v1/accesstoken?grant_type=client_credentials";
    $sandboxAuthUrl = "https://api-satusehat-stg.dto.kemkes.go.id/oauth2/v1/accesstoken?grant_type=client_credentials";
    
    error_log("🧪 Testing connection...");
    error_log("📋 Org ID: $org_id");
    
    // Try production
    error_log("🏥 Trying PRODUCTION authentication...");
    $productionResult = tryAuthentication($productionAuthUrl, $client_id, $client_secret);
    
    if ($productionResult['success']) {
        // Production successful
        $token = $productionResult['response']['access_token'];
        $expiresIn = $productionResult['response']['expires_in'] ?? null;
        
        error_log("✅ PRODUCTION authentication successful");
        
        echo json_encode([
            'success' => true,
            'message' => '✅ Koneksi berhasil!',
            'environment' => 'production',
            'base_url' => 'https://api-satusehat.kemkes.go.id/fhir-r4/v1',
            'token' => substr($token, 0, 20) . '...',
            'expires_in' => $expiresIn
        ]);
        exit;
    }
    
    // Production failed, try sandbox
    error_log("⚠️ Production failed, trying SANDBOX...");
    $sandboxResult = tryAuthentication($sandboxAuthUrl, $client_id, $client_secret);
    
    if ($sandboxResult['success']) {
        // Sandbox successful
        $token = $sandboxResult['response']['access_token'];
        $expiresIn = $sandboxResult['response']['expires_in'] ?? null;
        
        error_log("✅ SANDBOX authentication successful");
        
        echo json_encode([
            'success' => true,
            'message' => '✅ Koneksi berhasil (Sandbox/Testing)',
            'environment' => 'sandbox',
            'base_url' => 'https://api-satusehat-stg.dto.kemkes.go.id/fhir-r4/v1',
            'token' => substr($token, 0, 20) . '...',
            'expires_in' => $expiresIn,
            'note' => 'Menggunakan environment Sandbox untuk testing'
        ]);
        exit;
    }
    
    // Both failed
    error_log("❌ Both Production and Sandbox authentication failed");
    
    $errorMsg = $sandboxResult['response']['error_description'] ?? 
                $productionResult['response']['error_description'] ?? 
                'Authentication gagal di kedua environment';
    
    echo json_encode([
        'success' => false,
        'message' => $errorMsg,
        'production_http_code' => $productionResult['http_code'] ?? null,
        'sandbox_http_code' => $sandboxResult['http_code'] ?? null,
        'suggestion' => 'Periksa kembali Client ID dan Client Secret Anda'
    ]);
    
} catch (Exception $e) {
    error_log("❌ Exception: " . $e->getMessage());
    
    echo json_encode([
        'success' => false,
        'message' => 'Terjadi kesalahan: ' . $e->getMessage()
    ]);
}
?>