<?php
// ============================================
// FILE: API/subscription/create_transaction.php
// ============================================

error_reporting(0);
ini_set('display_errors', 0);

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');

try {
    // Get input
    $input = json_decode(file_get_contents('php://input'), true);
    
    if (!isset($input['action']) || $input['action'] !== 'create') {
        throw new Exception('Invalid action');
    }
    
    if (!isset($input['id_dokter']) || empty($input['id_dokter'])) {
        throw new Exception('id_dokter is required');
    }
    
    if (!isset($input['customer_name']) || empty($input['customer_name'])) {
        throw new Exception('customer_name is required');
    }
    
    if (!isset($input['customer_email']) || empty($input['customer_email'])) {
        throw new Exception('customer_email is required');
    }

    $id_dokter = $input['id_dokter'];
    $customer_name = $input['customer_name'];
    $customer_email = $input['customer_email'];

    // Duitku credentials
    $merchantCode = "DS24853";
    $apiKey = "605d62af77cf1f18830c961b80cdbe9f";
    $amount = 150000;
    $paymentMethod = "A1";

    // Generate unique order ID
    $merchantOrderId = "ORDER-" . substr($id_dokter, 0, 8) . "-" . time();

    // Generate signature
    $signature = md5($merchantCode . $merchantOrderId . $amount . $apiKey);

    // Prepare request
    $requestData = [
        'merchantCode' => $merchantCode,
        'paymentAmount' => $amount,
        'paymentMethod' => $paymentMethod,
        'merchantOrderId' => $merchantOrderId,
        'productDetails' => 'Perpanjang Langganan 30 Hari',
        'customerName' => $customer_name,
        'email' => $customer_email,
        'callbackUrl' => 'https://your-domain.com/callback',
        'returnUrl' => 'https://your-domain.com/return',
        'signature' => $signature
    ];

    // Call Duitku API
    $ch = curl_init('https://sandbox.duitku.com/webapi/api/merchant/v2/inquiry');
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($requestData));
    curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/json']);
    
    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);
    
    if ($response === false) {
        throw new Exception('Failed to connect to Duitku');
    }
    
    $result = json_decode($response, true);
    
    if ($httpCode === 200 && isset($result['statusCode']) && $result['statusCode'] === '00') {
        echo json_encode([
            'success' => true,
            'data' => [
                'merchantOrderId' => $merchantOrderId,
                'reference' => $result['reference'] ?? '',
                'vaNumber' => $result['vaNumber'] ?? '',
                'amount' => $amount,
                'paymentMethod' => $result['paymentMethod'] ?? $paymentMethod
            ]
        ]);
    } else {
        echo json_encode([
            'success' => false,
            'message' => $result['statusMessage'] ?? 'Failed to create transaction',
            'duitku_response' => $result
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