<?php
// ============================================
// FILE: API/subscription/check_status.php
// Fixed version with better error handling
// ============================================

// Start output buffering to catch any errors
ob_start();

// Set headers
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');

// Function to send JSON response and exit
function sendResponse($data) {
    ob_clean(); // Clear any previous output
    echo json_encode($data);
    exit;
}

try {
    // Check if supabase.php exists
    $configPath = __DIR__ . '/../config/supabase.php';
    if (!file_exists($configPath)) {
        sendResponse([
            'success' => false,
            'message' => 'Config file not found at: ' . $configPath,
            'hint' => 'Make sure API/config/supabase.php exists'
        ]);
    }
    
    require_once $configPath;
    
    // Check if function exists
    if (!function_exists('supabase')) {
        sendResponse([
            'success' => false,
            'message' => 'supabase() function not found',
            'hint' => 'Check if supabase.php defines the supabase() function'
        ]);
    }

    // Get input
    $rawInput = file_get_contents('php://input');
    $input = json_decode($rawInput, true);
    
    if (json_last_error() !== JSON_ERROR_NONE) {
        sendResponse([
            'success' => false,
            'message' => 'Invalid JSON input',
            'raw_input' => $rawInput
        ]);
    }
    
    // Validate input
    if (!isset($input['action']) || $input['action'] !== 'check_status') {
        sendResponse([
            'success' => false,
            'message' => 'Invalid action. Expected: check_status',
            'received' => $input['action'] ?? 'null'
        ]);
    }
    
    if (!isset($input['merchant_order_id']) || empty($input['merchant_order_id'])) {
        sendResponse([
            'success' => false,
            'message' => 'merchant_order_id is required'
        ]);
    }
    
    if (!isset($input['id_dokter']) || empty($input['id_dokter'])) {
        sendResponse([
            'success' => false,
            'message' => 'id_dokter is required'
        ]);
    }

    $merchantOrderId = $input['merchant_order_id'];
    $id_dokter = $input['id_dokter'];

    // Duitku credentials
    $merchantCode = "DS24853";
    $apiKey = "605d62af77cf1f18830c961b80cdbe9f";

    // Generate signature
    $signature = md5($merchantCode . $merchantOrderId . $apiKey);

    $requestData = [
        'merchantCode' => $merchantCode,
        'merchantOrderId' => $merchantOrderId,
        'signature' => $signature
    ];

    // Call Duitku status API
    $ch = curl_init('https://sandbox.duitku.com/webapi/api/merchant/transactionStatus');
    
    if ($ch === false) {
        sendResponse([
            'success' => false,
            'message' => 'Failed to initialize cURL'
        ]);
    }
    
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($requestData));
    curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/json']);
    curl_setopt($ch, CURLOPT_TIMEOUT, 30);
    
    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    $curlError = curl_error($ch);
    curl_close($ch);
    
    if ($response === false) {
        sendResponse([
            'success' => false,
            'message' => 'Failed to connect to Duitku',
            'curl_error' => $curlError
        ]);
    }
    
    $result = json_decode($response, true);
    
    if (json_last_error() !== JSON_ERROR_NONE) {
        sendResponse([
            'success' => false,
            'message' => 'Invalid JSON from Duitku',
            'duitku_response' => $response
        ]);
    }
    
    // Check if payment is successful
    if ($httpCode === 200 && 
        isset($result['statusCode']) && 
        $result['statusCode'] === '00' && 
        isset($result['statusMessage']) && 
        $result['statusMessage'] === 'SUCCESS') {
        
        // Payment successful! Now save to database
        
        // Step 1: Check if already processed
        $checkParams = "order_id=eq.$merchantOrderId";
        $checkResult = supabase('GET', 'langganan', $checkParams);
        
        if (!empty($checkResult)) {
            sendResponse([
                'success' => false,
                'message' => 'Transaksi ini sudah pernah diproses'
            ]);
        }
        
        // Step 2: Get last subscription
        $lastParams = "id_dokter=eq.$id_dokter&status=eq.aktif&is_expired=eq.0&order=tanggal_berakhir.desc&limit=1";
        $lastSubscription = supabase('GET', 'langganan', $lastParams);
        
        // Step 3: Calculate dates
        $today = new DateTime();
        
        if (!empty($lastSubscription) && isset($lastSubscription[0]['tanggal_berakhir'])) {
            $lastEnd = new DateTime($lastSubscription[0]['tanggal_berakhir']);
            
            if ($today > $lastEnd) {
                // Expired, start from today
                $startDate = clone $today;
                $endDate = (clone $today)->add(new DateInterval('P30D'));
            } else {
                // Still active, extend from last end
                $startDate = clone $lastEnd;
                $endDate = (clone $lastEnd)->add(new DateInterval('P30D'));
            }
        } else {
            // First subscription
            $startDate = clone $today;
            $endDate = (clone $today)->add(new DateInterval('P30D'));
        }
        
        // Step 4: Insert subscription
        $subscriptionData = [
            'order_id' => $merchantOrderId,
            'tanggal_mulai' => $startDate->format('Y-m-d'),
            'tanggal_berakhir' => $endDate->format('Y-m-d'),
            'status' => 'aktif',
            'is_expired' => 0,
            'id_dokter' => $id_dokter
        ];
        
        $insertResult = supabase('POST', 'langganan', '', $subscriptionData);
        
        if (!empty($insertResult)) {
            sendResponse([
                'success' => true,
                'data' => [
                    'status' => 'SUCCESS',
                    'message' => 'Langganan berhasil diperpanjang!',
                    'tanggal_mulai' => $startDate->format('Y-m-d'),
                    'tanggal_berakhir' => $endDate->format('Y-m-d')
                ]
            ]);
        } else {
            sendResponse([
                'success' => false,
                'message' => 'Gagal menyimpan langganan ke database',
                'hint' => 'Check Supabase RLS policies or table structure'
            ]);
        }
    } else {
        // Payment not yet complete
        sendResponse([
            'success' => true,
            'data' => [
                'status' => 'PENDING',
                'message' => $result['statusMessage'] ?? 'Pembayaran belum selesai',
                'duitku_status_code' => $result['statusCode'] ?? 'unknown'
            ]
        ]);
    }
    
} catch (Exception $e) {
    sendResponse([
        'success' => false,
        'message' => $e->getMessage(),
        'file' => basename(__FILE__),
        'line' => $e->getLine(),
        'trace' => $e->getTraceAsString()
    ]);
} catch (Error $e) {
    sendResponse([
        'success' => false,
        'message' => 'PHP Error: ' . $e->getMessage(),
        'file' => basename(__FILE__),
        'line' => $e->getLine()
    ]);
}

// If we get here, something went wrong
sendResponse([
    'success' => false,
    'message' => 'Unexpected end of script'
]);
?>