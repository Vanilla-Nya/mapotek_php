<?php
// ============================================
// FILE: API/subscription/get_status.php
// ============================================

// Turn off all error output to prevent HTML in JSON response
error_reporting(0);
ini_set('display_errors', 0);

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');

try {
    // Check if supabase.php exists
    if (!file_exists('../config/supabase.php')) {
        throw new Exception('supabase.php not found! Path: ' . realpath('../config/'));
    }
    
    require_once '../config/supabase.php';
    
    // Check if supabase function exists
    if (!function_exists('supabase')) {
        throw new Exception('supabase() function not found!');
    }

    // Get input
    $input = json_decode(file_get_contents('php://input'), true);
    
    if (!isset($input['id_dokter']) || empty($input['id_dokter'])) {
        throw new Exception('id_dokter is required');
    }

    $id_dokter = $input['id_dokter'];

    // Query subscription
    $params = "id_dokter=eq.$id_dokter&status=eq.aktif&is_expired=eq.0&order=tanggal_berakhir.desc&limit=1";
    $result = supabase('GET', 'langganan', $params);
    
    if (!empty($result) && isset($result[0])) {
        $subscription = $result[0];
        
        // Calculate remaining days
        $today = new DateTime();
        $endDate = new DateTime($subscription['tanggal_berakhir']);
        $interval = $today->diff($endDate);
        $sisaHari = $interval->days;
        
        if ($endDate < $today) {
            $sisaHari = 0;
        }
        
        echo json_encode([
            'success' => true,
            'data' => [
                'tanggal_mulai' => $subscription['tanggal_mulai'],
                'tanggal_berakhir' => $subscription['tanggal_berakhir'],
                'sisa_hari' => $sisaHari
            ]
        ]);
    } else {
        // No subscription found
        echo json_encode([
            'success' => true,
            'data' => [
                'tanggal_mulai' => '-',
                'tanggal_berakhir' => '-',
                'sisa_hari' => 0
            ]
        ]);
    }
} catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage(),
        'file' => basename(__FILE__)
    ]);
}
?>