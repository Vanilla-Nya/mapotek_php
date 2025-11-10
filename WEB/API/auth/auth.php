<?php
// ========================================
// BACKEND: Direct Doctor Registration (NO SATUSEHAT)
// File: register_practitioner.php
// ========================================

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');

// Include your Supabase client
require_once __DIR__ . '/../config/supabase.php';

// Get JSON input
$input = file_get_contents('php://input');
$data = json_decode($input, true);

if (!$data || !isset($data['action'])) {
    echo json_encode([
        'success' => false,
        'message' => 'Invalid request'
    ]);
    exit;
}

// ========================================
// DIRECT DOCTOR REGISTRATION (NO SATUSEHAT)
// ========================================
if ($data['action'] === 'register_doctor_direct') {
    
    $doctorData = $data['data'];
    
    // Validate required fields
    $required = ['nik', 'nama', 'tanggal_lahir', 'gender', 'email', 'username', 'alamat', 'no_telp', 'password'];
    foreach ($required as $field) {
        if (empty($doctorData[$field])) {
            echo json_encode([
                'success' => false,
                'message' => "Field '$field' harus diisi"
            ]);
            exit;
        }
    }
    
    // Validate NIK (16 digits)
    if (!preg_match('/^\d{16}$/', $doctorData['nik'])) {
        echo json_encode([
            'success' => false,
            'message' => 'NIK harus 16 digit angka'
        ]);
        exit;
    }
    
    // Validate email format
    if (!filter_var($doctorData['email'], FILTER_VALIDATE_EMAIL)) {
        echo json_encode([
            'success' => false,
            'message' => 'Format email tidak valid'
        ]);
        exit;
    }
    
    // Validate password length
    if (strlen($doctorData['password']) < 6) {
        echo json_encode([
            'success' => false,
            'message' => 'Password minimal 6 karakter'
        ]);
        exit;
    }
    
    // Validate username (alphanumeric only)
    if (!preg_match('/^[a-z0-9]+$/', $doctorData['username'])) {
        echo json_encode([
            'success' => false,
            'message' => 'Username hanya boleh huruf kecil dan angka'
        ]);
        exit;
    }

    // ========================================
    // Normalize gender to Indonesian format
    // ========================================
    $gender = strtolower(trim($doctorData['gender']));
    if (in_array($gender, ['male', 'laki-laki', 'laki laki', 'l', 'pria'])) {
        $normalizedGender = 'Laki-Laki';
    } elseif (in_array($gender, ['female', 'perempuan', 'p', 'wanita'])) {
        $normalizedGender = 'Perempuan';
    } else {
        echo json_encode([
            'success' => false,
            'message' => 'Gender harus Male atau Female'
        ]);
        exit;
    }
    
    try {
        // ========================================
        // STEP 1: Check if NIK already exists
        // ========================================
        $checkNIK = supabase('GET', 'dokter', 'nik=eq.' . $doctorData['nik'] . '&select=nik');
        
        if (isset($checkNIK['error'])) {
            echo json_encode([
                'success' => false,
                'message' => 'Error checking NIK: ' . $checkNIK['error']
            ]);
            exit;
        }
        
        if (!empty($checkNIK) && count($checkNIK) > 0) {
            echo json_encode([
                'success' => false,
                'message' => 'NIK sudah terdaftar'
            ]);
            exit;
        }
        
        // ========================================
        // STEP 2: Check if email already exists
        // ========================================
        $checkEmail = supabase('GET', 'dokter', 'email=eq.' . $doctorData['email'] . '&select=email');
        
        if (isset($checkEmail['error'])) {
            echo json_encode([
                'success' => false,
                'message' => 'Error checking email: ' . $checkEmail['error']
            ]);
            exit;
        }
        
        if (!empty($checkEmail) && count($checkEmail) > 0) {
            echo json_encode([
                'success' => false,
                'message' => 'Email sudah terdaftar'
            ]);
            exit;
        }
        
        // ========================================
        // STEP 3: Check if username already exists
        // ========================================
        $checkUsername = supabase('GET', 'dokter', 'username=eq.' . $doctorData['username'] . '&select=username');
        
        if (isset($checkUsername['error'])) {
            echo json_encode([
                'success' => false,
                'message' => 'Error checking username: ' . $checkUsername['error']
            ]);
            exit;
        }
        
        if (!empty($checkUsername) && count($checkUsername) > 0) {
            echo json_encode([
                'success' => false,
                'message' => 'Username sudah digunakan'
            ]);
            exit;
        }
        
        // ========================================
        // STEP 4: Create Supabase Auth User
        // ========================================
        $authResponse = supabaseAuthSignUp(
            $doctorData['email'],
            $doctorData['password'],
            [
                'nama_lengkap' => $doctorData['nama'],
                'role' => 'dokter'
            ]
        );
        
        if (!$authResponse['success']) {
            echo json_encode([
                'success' => false,
                'message' => 'Gagal membuat akun: ' . ($authResponse['error']['message'] ?? 'Unknown error'),
                'error_details' => $authResponse['error']
            ]);
            exit;
        }
        
        $user = $authResponse['user'];
        $user_id = $user['id'];
        
        error_log("✅ Auth user created: $user_id");
        
        // ========================================
        // STEP 5: Insert into dokter table
        // ========================================
        $insertData = [
            'id_dokter' => $user_id,
            'nik' => $doctorData['nik'],
            'nama_lengkap' => $doctorData['nama'],
            'jenis_kelamin' => $normalizedGender,
            'username' => $doctorData['username'],
            'email' => $doctorData['email'],
            'alamat' => $doctorData['alamat'],
            'no_telp' => $doctorData['no_telp'],
            'tanggal_lahir' => $doctorData['tanggal_lahir']
        ];
        
        $insertResponse = supabase('POST', 'dokter', '', $insertData);
        
        error_log("📋 Insert response: " . json_encode($insertResponse));
        
        if (isset($insertResponse['error'])) {
            echo json_encode([
                'success' => false,
                'message' => 'User created but failed to save doctor data',
                'error_details' => $insertResponse['error'],
                'data' => [
                    'user_id' => $user_id,
                    'email' => $doctorData['email']
                ],
                'debug' => [
                    'insert_data' => $insertData,
                    'insert_response' => $insertResponse
                ]
            ]);
            exit;
        }
        
        // ========================================
        // STEP 6: Get the inserted doctor record
        // ========================================
        $selectResponse = supabase('GET', 'dokter', 'id_dokter=eq.' . $user_id . '&select=id_dokter,nama_lengkap,email,username,nik');
        
        error_log("🔍 Select response: " . json_encode($selectResponse));
        
        if (isset($selectResponse['error']) || empty($selectResponse) || count($selectResponse) === 0) {
            echo json_encode([
                'success' => false,
                'message' => 'Doctor registered but failed to retrieve record',
                'error_details' => $selectResponse['error'] ?? 'No data returned',
                'data' => [
                    'user_id' => $user_id,
                    'email' => $doctorData['email']
                ]
            ]);
            exit;
        }
        
        $doctorRecord = $selectResponse[0]; // Get first item from array
        
        // ========================================
        // SUCCESS!
        // ========================================
        echo json_encode([
            'success' => true,
            'message' => 'Registrasi berhasil!',
            'data' => [
                'user_id' => $user_id,
                'id_dokter' => $doctorRecord['id_dokter'],
                'nama_lengkap' => $doctorRecord['nama_lengkap'],
                'email' => $doctorRecord['email'],
                'username' => $doctorRecord['username'],
                'nik' => $doctorRecord['nik']
            ]
        ]);
        
    } catch (Exception $e) {
        error_log("❌ Exception: " . $e->getMessage());
        echo json_encode([
            'success' => false,
            'message' => 'Error: ' . $e->getMessage(),
            'error_details' => [
                'code' => $e->getCode(),
                'message' => $e->getMessage(),
                'file' => $e->getFile(),
                'line' => $e->getLine()
            ]
        ]);
    }
    exit;
}

// ========================================
// OTHER ACTIONS (if you have any)
// ========================================
if ($data['action'] === 'login') {
    // Handle login if needed
    echo json_encode([
        'success' => false,
        'message' => 'Login handled by Supabase client-side'
    ]);
    exit;
}

// Unknown action
echo json_encode([
    'success' => false,
    'message' => 'Unknown action: ' . $data['action']
]);
exit;
?>