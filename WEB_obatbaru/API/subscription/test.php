<?php
header('Content-Type: application/json');
require_once '../config/supabase.php';

// Get your last merchant order ID
$merchantOrderId = $_GET['order_id'] ?? '';
$id_dokter = $_GET['dokter_id'] ?? '';

if (empty($merchantOrderId) || empty($id_dokter)) {
    die(json_encode(['error' => 'Need: ?order_id=XXX&dokter_id=YYY']));
}

// Calculate dates
$today = new DateTime();
$startDate = clone $today;
$endDate = (clone $today)->add(new DateInterval('P30D'));

// Insert subscription
$subscriptionData = [
    'order_id' => $merchantOrderId,
    'tanggal_mulai' => $startDate->format('Y-m-d'),
    'tanggal_berakhir' => $endDate->format('Y-m-d'),
    'status' => 'aktif',
    'is_expired' => 0,
    'id_dokter' => $id_dokter
];

$result = supabase('POST', 'langganan', '', $subscriptionData);

echo json_encode([
    'success' => !empty($result),
    'message' => !empty($result) ? 'Subscription created!' : 'Failed to create',
    'data' => $result
]);
?>