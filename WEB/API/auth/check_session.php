<?php
// API/auth/check_session.php
session_start();
header('Content-Type: application/json');

// Check if user is logged in
if (isset($_SESSION['username'])) {
    // Session valid, return user data
    echo json_encode([
        'success' => true,
        'message' => 'Session valid',
        'data' => [
            'user_id' => $_SESSION['user_id'] ?? null,
            'username' => $_SESSION['username'],
            'nama_lengkap' => $_SESSION['nama_lengkap'],
            'email' => $_SESSION['email'],
            'nama_faskes' => $_SESSION['nama_faskes'] ?? null,
            'jenis_kelamin' => $_SESSION['jenis_kelamin'] ?? null,
            'alamat' => $_SESSION['alamat'] ?? null,
            'no_telp' => $_SESSION['no_telp'] ?? null,
            'access_token' => $_SESSION['access_token'] ?? null
        ]
    ]);
} else {
    // Session tidak valid
    http_response_code(401);
    echo json_encode([
        'success' => false,
        'message' => 'Session tidak valid atau sudah expired'
    ]);
}