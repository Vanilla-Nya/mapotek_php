<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');

require_once '../database.php';

$input = json_decode(file_get_contents('php://input'), true);

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $qr_token = $input['qr_token'] ?? '';
    
    if (empty($qr_token)) {
        echo json_encode([
            'success' => false,
            'message' => 'QR token is required'
        ]);
        exit;
    }
    
    // Look up doctor by token
    $result = supabase('GET', 'dokter', "qr_token=eq.$qr_token&select=id_dokter,nama_lengkap,nama_faskes");
    
    if (!empty($result) && !isset($result['code'])) {
        echo json_encode([
            'success' => true,
            'data' => $result[0]
        ]);
    } else {
        echo json_encode([
            'success' => false,
            'message' => 'Invalid QR code'
        ]);
    }
}
?>