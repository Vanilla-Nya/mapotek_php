<?php
// ========================================
// BACKEND: Authentication Handler
// File: /MAPOTEK_PHP/WEB/API/auth.php
// Handles: Doctor Registration & Asisten Auth Creation
// ========================================

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');

// Include Supabase config
require_once __DIR__ . '/../config/supabase.php';

// Get JSON input
$input = file_get_contents('php://input');
$data = json_decode($input, true);

// Log request for debugging
error_log("=== AUTH.PHP REQUEST ===");
error_log("Raw Input: " . substr($input, 0, 500));
error_log("Parsed Data: " . json_encode($data, JSON_PRETTY_PRINT));
error_log("=======================");

if (!$data) {
    echo json_encode([
        'success' => false,
        'message' => 'Invalid request - no data received',
        'raw_input' => substr($input, 0, 200)
    ]);
    exit;
}

// ========================================
// ACTION 1: CREATE ASISTEN DOKTER AUTH ACCOUNT
// Simple auth account creation (for asisten)
// ========================================
if (!isset($data['action']) && isset($data['email']) && isset($data['password'])) {
    
    $email = trim($data['email']);
    $password = $data['password'];
    $nama = isset($data['nama']) ? trim($data['nama']) : null;
    $alamat = isset($data['alamat']) ? trim($data['alamat']) : null;
    
    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        echo json_encode(['success' => false, 'error' => 'Format email tidak valid']);
        exit;
    }
    
    if (strlen($password) < 6) {
        echo json_encode(['success' => false, 'error' => 'Password minimal 6 karakter']);
        exit;
    }
    
    try {
        $metadata = ['role' => 'asisten_dokter'];
        if ($nama) $metadata['nama_lengkap'] = $nama;
        if ($alamat) $metadata['alamat'] = $alamat;
        
        error_log("🔐 Creating asisten auth for: $email");
        
        $authResponse = supabaseAuthSignUp($email, $password, $metadata);
        
        error_log("🔍 Auth response: " . json_encode($authResponse));
        
        if (!$authResponse['success']) {
            $errorMsg = $authResponse['error']['message'] ?? 'Failed to create auth account';
            if (strpos($errorMsg, 'already registered') !== false) {
                $errorMsg = 'Email sudah terdaftar';
            }
            echo json_encode(['success' => false, 'error' => $errorMsg]);
            exit;
        }
        
        // ⭐ Extract user object
        if (!isset($authResponse['user']) || !is_array($authResponse['user'])) {
            error_log("❌ Missing user in auth response!");
            echo json_encode(['success' => false, 'error' => 'Invalid auth response']);
            exit;
        }
        
        $user = $authResponse['user'];
        
        // ⭐ Extract the UUID STRING (not the whole object!)
        if (!isset($user['id']) || empty($user['id'])) {
            error_log("❌ Missing user ID!");
            error_log("❌ User keys: " . implode(', ', array_keys($user)));
            echo json_encode(['success' => false, 'error' => 'Auth response missing user ID']);
            exit;
        }
        
        $userId = $user['id'];  // ⭐ This should be a STRING like "abc-123-def"
        
        error_log("✅ Auth created! UUID: $userId");
        
        // ⭐ Return ONLY the UUID string, not the whole user object!
        echo json_encode([
            'success' => true,
            'data' => [
                'user_id' => $userId,  // ⭐ STRING UUID
                'id' => $userId,        // ⭐ STRING UUID  
                'email' => $user['email'] ?? $email,
                'created_at' => $user['created_at'] ?? date('Y-m-d H:i:s')
            ],
            'message' => 'Auth account created successfully'
        ]);
        
    } catch (Exception $e) {
        error_log("❌ Exception: " . $e->getMessage());
        echo json_encode(['success' => false, 'error' => $e->getMessage()]);
    }
    
    exit;
}

// ========================================
// ACTION 2: DIRECT DOCTOR REGISTRATION
// Full doctor registration with validation
// ========================================
if (isset($data['action']) && $data['action'] === 'register_doctor_direct') {
    
    $doctorData = $data['data'];
    
    // Validate required fields
    $required = ['nik', 'nama', 'tanggal_lahir', 'gender', 'email', 'username', 'alamat', 'no_telp', 'password'];
    $missing = [];
    
    foreach ($required as $field) {
        if (empty($doctorData[$field])) {
            $missing[] = $field;
        }
    }
    
    if (!empty($missing)) {
        echo json_encode([
            'success' => false,
            'message' => 'Field berikut harus diisi: ' . implode(', ', $missing)
        ]);
        exit;
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

    // Normalize gender
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
        // Check if NIK already exists
        $checkNIK = supabase('GET', 'dokter', 'nik=eq.' . urlencode($doctorData['nik']) . '&select=nik');
        
        if (isset($checkNIK['error'])) {
            throw new Exception('Error checking NIK: ' . ($checkNIK['error']['message'] ?? 'Unknown error'));
        }
        
        if (!empty($checkNIK) && count($checkNIK) > 0) {
            echo json_encode([
                'success' => false,
                'message' => 'NIK sudah terdaftar'
            ]);
            exit;
        }
        
        // Check if email already exists
        $checkEmail = supabase('GET', 'dokter', 'email=eq.' . urlencode($doctorData['email']) . '&select=email');
        
        if (isset($checkEmail['error'])) {
            throw new Exception('Error checking email: ' . ($checkEmail['error']['message'] ?? 'Unknown error'));
        }
        
        if (!empty($checkEmail) && count($checkEmail) > 0) {
            echo json_encode([
                'success' => false,
                'message' => 'Email sudah terdaftar'
            ]);
            exit;
        }
        
        // Check if username already exists
        $checkUsername = supabase('GET', 'dokter', 'username=eq.' . urlencode($doctorData['username']) . '&select=username');
        
        if (isset($checkUsername['error'])) {
            throw new Exception('Error checking username: ' . ($checkUsername['error']['message'] ?? 'Unknown error'));
        }
        
        if (!empty($checkUsername) && count($checkUsername) > 0) {
            echo json_encode([
                'success' => false,
                'message' => 'Username sudah digunakan'
            ]);
            exit;
        }
        
        // Create Supabase Auth User
        error_log("🔐 Creating doctor auth account for: " . $doctorData['email']);
        
        $authResponse = supabaseAuthSignUp(
            $doctorData['email'],
            $doctorData['password'],
            [
                'nama_lengkap' => $doctorData['nama'],
                'role' => 'dokter'
            ]
        );
        
        if (!$authResponse['success']) {
            $errorMsg = $authResponse['error']['message'] ?? 'Unknown error';
            throw new Exception('Gagal membuat akun: ' . $errorMsg);
        }
        
        $user = $authResponse['user'];
        $user_id = $user['id'];
        
        error_log("✅ Doctor auth user created: $user_id");
        
        // Insert into dokter table
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
            throw new Exception('Failed to save doctor data: ' . ($insertResponse['error']['message'] ?? 'Unknown error'));
        }
        
        // Verify insertion by querying back
        $selectResponse = supabase('GET', 'dokter', 'id_dokter=eq.' . $user_id . '&select=id_dokter,nama_lengkap,email,username,nik');
        
        if (isset($selectResponse['error']) || empty($selectResponse)) {
            throw new Exception('Doctor registered but failed to retrieve record');
        }
        
        $doctorRecord = $selectResponse[0];
        
        error_log("✅ Doctor registration complete!");
        
        // Return success
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
        error_log("❌ Doctor registration failed: " . $e->getMessage());
        error_log("   Stack trace: " . $e->getTraceAsString());
        
        echo json_encode([
            'success' => false,
            'message' => $e->getMessage(),
            'error_details' => [
                'code' => $e->getCode(),
                'message' => $e->getMessage(),
                'file' => basename($e->getFile()),
                'line' => $e->getLine()
            ]
        ]);
    }
    exit;
}

// ========================================
// UNKNOWN REQUEST
// ========================================
error_log("⚠️ Unknown request to auth.php");
echo json_encode([
    'success' => false,
    'message' => 'Unknown request type',
    'received_data' => array_keys($data)
]);
exit;
?>