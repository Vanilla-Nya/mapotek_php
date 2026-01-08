<?php
header('Content-Type: application/json');
require_once(__DIR__ . '/config/supabase.php');

$method = $_SERVER['REQUEST_METHOD'];

try {
    if ($method === 'POST') {
        $data = json_decode(file_get_contents('php://input'), true);

        if (!$data) {
            echo json_encode(['success' => false, 'error' => 'Invalid data']);
            exit;
        }

        // Validate required fields for signup
        if (empty($data['email']) || empty($data['password'])) {
            echo json_encode([
                'success' => false,
                'error' => 'Email and password are required'
            ]);
            exit;
        }

        // Call Supabase Auth API for signup
        $authData = [
            'email' => $data['email'],
            'password' => $data['password']
        ];

        // If nama and alamat are provided, add them to user metadata
        if (!empty($data['nama']) || !empty($data['alamat'])) {
            $authData['data'] = [];
            if (!empty($data['nama'])) {
                $authData['data']['nama'] = $data['nama'];
            }
            if (!empty($data['alamat'])) {
                $authData['data']['alamat'] = $data['alamat'];
            }
        }

        // Check if email already exists in relevant tables to prevent double signup
        $email = $data['email'];
        
        // Check in pasien table
        if (emailExists($email)) {
            echo json_encode([
                'success' => false,
                'error' => 'Email sudah terdaftar sebagai pasien'
            ]);
            exit;
        }

        // Check in dokter table
        $checkDokter = supabase('GET', 'dokter', 'email=eq.' . urlencode($email) . '&select=email');
        if (!empty($checkDokter) && !isset($checkDokter['error'])) {
            echo json_encode([
                'success' => false,
                'error' => 'Email sudah terdaftar sebagai dokter'
            ]);
            exit;
        }
        
        // Optional: Check if NIK already exists (if provided)
        if (!empty($data['nik'])) {
            $nik = $data['nik'];
            $checkNikPasien = nikExists($nik);
            $checkNikDokter = supabase('GET', 'dokter', 'nik=eq.' . urlencode($nik) . '&select=nik');
            
            if ($checkNikPasien || (!empty($checkNikDokter) && !isset($checkNikDokter['error']))) {
                echo json_encode([
                    'success' => false,
                    'error' => 'NIK sudah terdaftar'
                ]);
                exit;
            }
        }

        // Call Supabase auth signup endpoint
        $result = supabaseAuth('POST', 'signup', $authData);

        if (isset($result['error'])) {
            echo json_encode([
                'success' => false,
                'error' => $result['error']['message'] ?? $result['error']
            ]);
        } else {
            echo json_encode([
                'success' => true,
                'data' => [
                    'user' => $result['user'] ?? null,
                    'session' => $result['session'] ?? null,
                    'access_token' => $result['session']['access_token'] ?? $result['access_token'] ?? null
                ]
            ]);
        }

    } elseif ($method === 'GET') {
        // Login endpoint
        $email = $_GET['email'] ?? '';
        $password = $_GET['password'] ?? '';

        if (empty($email) || empty($password)) {
            echo json_encode([
                'success' => false,
                'error' => 'Email and password are required'
            ]);
            exit;
        }

        $authData = [
            'email' => $email,
            'password' => $password
        ];

        $result = supabaseAuth('POST', 'token?grant_type=password', $authData);

        if (isset($result['error'])) {
            echo json_encode([
                'success' => false,
                'error' => $result['error']['message'] ?? $result['error']
            ]);
        } else {
            echo json_encode([
                'success' => true,
                'data' => $result
            ]);
        }

    } else {
        echo json_encode([
            'success' => false,
            'error' => 'Method not allowed'
        ]);
    }

} catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage()
    ]);
}
?>