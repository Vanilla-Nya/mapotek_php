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
        case 'get':
            $email = $input['email'];
            $result = supabase('GET', 'dokter', "email=ilike." . $email);
            
            if (!empty($result) && !isset($result['code'])) {
                echo json_encode([
                    'success' => true,
                    'data' => $result[0]
                ]);
            } else {
                echo json_encode(['success' => false, 'message' => 'Profil tidak ditemukan']);
            }
            break;

    case 'update':
    $email = $input['email'];
    error_log("Updating profile for: $email");
    
    $updateData = [
        'nama_faskes' => $input['nama_faskes'] ?? '',
        'nama_lengkap' => $input['nama_lengkap'] ?? '',
        'username' => $input['username'] ?? '',
        'jenis_kelamin' => $input['jenis_kelamin'] ?? '',
        'no_telp' => $input['no_telp'] ?? '',
        'rfid' => $input['rfid'] ?? null,
        'jam_kerja' => $input['jam_kerja'] ?? null,
        'alamat' => $input['alamat'] ?? '',
        'updated_at' => date('Y-m-d H:i:s')
    ];
    
    $result = supabase('PATCH', 'dokter', "email=ilike.$email", $updateData);
    
    error_log("Update result: " . json_encode($result));
    error_log("Result type: " . gettype($result));
    
    // Better success check
    // If result is an array (even empty), it's success
    // If result has 'code' or 'error', it failed
    if (is_array($result) && !isset($result['code']) && !isset($result['error'])) {
        echo json_encode([
            'success' => true,
            'message' => 'Profil berhasil diupdate',
            'data' => $result
        ]);
    } else {
        echo json_encode([
            'success' => false, 
            'message' => 'Gagal mengupdate profil',
            'error' => $result,
            'email_used' => $email
        ]);
    }
    break;
}
}
?>