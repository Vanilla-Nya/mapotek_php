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

// Test connection by getting token
try {
    $authUrl = "https://api-satusehat-stg.dto.kemkes.go.id/oauth2/v1/accesstoken?grant_type=client_credentials";
    
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $authUrl);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_POST, true);
    
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
        throw new Exception("cURL Error: " . curl_error($ch));
    }
    
    curl_close($ch);
    
    $json = json_decode($response, true);
    
    if ($httpCode === 200 && isset($json["access_token"])) {
        // Token received successfully
        echo json_encode([
            'success' => true,
            'message' => 'Koneksi berhasil!',
            'token' => $json["access_token"],
            'expires_in' => $json["expires_in"] ?? null
        ]);
    } else {
        // Authentication failed
        echo json_encode([
            'success' => false,
            'message' => $json['error_description'] ?? 'Authentication failed',
            'error' => $json['error'] ?? 'unknown_error',
            'http_code' => $httpCode
        ]);
    }
    
} catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'message' => 'Terjadi kesalahan: ' . $e->getMessage()
    ]);
}
?>