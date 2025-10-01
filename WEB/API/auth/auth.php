<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');

require_once '../database.php';

$requestMethod = $_SERVER['REQUEST_METHOD'];
$input = json_decode(file_get_contents('php://input'), true);

if ($requestMethod === 'POST') {
    $action = $input['action'] ?? '';

    switch ($action) {
        case 'register':
        $authData = [
            'email' => $input['email'],
            'password' => $input['password']
        ];
        
        $authResult = supabaseAuthRegister($authData);
        error_log("1. Auth Register: " . json_encode($authResult));
        
        if ($authResult['success']) {
            $loginResult = supabaseAuthLogin($authData);
            error_log("2. Login Result: " . json_encode($loginResult));
            
            if ($loginResult['success']) {
                $dokterData = [
                    'nama_faskes' => $input['nama_faskes'],
                    'nama_lengkap' => $input['nama_lengkap'],
                    'username' => $input['username'],
                    'jenis_kelamin' => $input['jenis_kelamin'],
                    'alamat' => $input['alamat'],
                    'no_telp' => $input['no_telp'],
                    'email' => $input['email']
                ];
                
                error_log("3. Data to insert: " . json_encode($dokterData));
                
                $insertResult = supabase('POST', 'dokter', '', $dokterData, $loginResult['access_token']);
                
                error_log("4. Insert Result: " . json_encode($insertResult));
                
                // Check for errors in response
                if (isset($insertResult['code'])) {
                    error_log("ERROR CODE: " . $insertResult['code']);
                    error_log("ERROR MESSAGE: " . $insertResult['message']);
                    echo json_encode(['success' => false, 'message' => $insertResult['message']]);
                } else if (!empty($insertResult)) {
                    echo json_encode([
                        'success' => true,
                        'message' => 'Registrasi berhasil',
                        'access_token' => $loginResult['access_token'],
                        'user' => $insertResult[0] // Return actual inserted data
                    ]);
                } else {
                    echo json_encode(['success' => false, 'message' => 'Insert returned empty']);
                }
            }
        }
        break;

        case 'login':
            $authData = [
                'email' => $input['email'],
                'password' => $input['password']
            ];
            
            $loginResult = supabaseAuthLogin($authData);
            
            if ($loginResult['success']) {
                $dokterData = supabase('GET', 'dokter', "email=eq." . $input['email']);
                
                if (!empty($dokterData)) {
                    echo json_encode([
                        'success' => true,
                        'message' => 'Login berhasil',
                        'access_token' => $loginResult['access_token'],
                        'user' => $dokterData[0]
                    ]);
                } else {
                    echo json_encode(['success' => false, 'message' => 'Data dokter tidak ditemukan']);
                }
            } else {
                echo json_encode(['success' => false, 'message' => $loginResult['message']]);
            }
            break;

        default:
            echo json_encode(['success' => false, 'message' => 'Action tidak valid']);
    }
}

function supabaseAuthRegister($data) {
    global $SUPABASE_URL, $SUPABASE_KEY;
    
    $url = $SUPABASE_URL . "/auth/v1/signup";
    
    $ch = curl_init($url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
    curl_setopt($ch, CURLOPT_HTTPHEADER, [
        "apikey: $SUPABASE_KEY",
        "Content-Type: application/json"
    ]);
    
    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);
    
    $result = json_decode($response, true);
    
    if ($httpCode === 200 || $httpCode === 201) {
        return ['success' => true, 'data' => $result];
    } else {
        $errorMsg = $result['msg'] ?? $result['error_description'] ?? 'Registration failed';
        return ['success' => false, 'message' => $errorMsg];
    }
}

function supabaseAuthLogin($data) {
    global $SUPABASE_URL, $SUPABASE_KEY;
    
    $url = $SUPABASE_URL . "/auth/v1/token?grant_type=password";
    
    $ch = curl_init($url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
    curl_setopt($ch, CURLOPT_HTTPHEADER, [
        "apikey: $SUPABASE_KEY",
        "Content-Type: application/json"
    ]);
    
    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);
    
    $result = json_decode($response, true);
    
    if ($httpCode === 200 && isset($result['access_token'])) {
        return [
            'success' => true,
            'access_token' => $result['access_token'],
            'user_id' => $result['user']['id']
        ];
    } else {
        $errorMsg = $result['error_description'] ?? 'Login failed';
        return ['success' => false, 'message' => $errorMsg];
    }
}
?>