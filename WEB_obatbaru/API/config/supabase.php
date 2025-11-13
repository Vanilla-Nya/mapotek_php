<?php
// Supabase Config
$SUPABASE_URL = "https://brhaksondhloibpwtrdo.supabase.co";
$SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJyaGFrc29uZGhsb2licHd0cmRvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NjU0MjE0OSwiZXhwIjoyMDcyMTE4MTQ5fQ.lZd5xM790I9kocIVJtqqlilFBasmWcXvPFLpFPZgQV4";

function supabase($method, $table, $params = "", $data = null, $token = null) {
    global $SUPABASE_URL, $SUPABASE_KEY;

    $url = rtrim($SUPABASE_URL, "/") . "/rest/v1/" . $table;
    if ($params) {
        $url .= "?" . $params;
    }

    $ch = curl_init($url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);

    // ✅ Correct headers for Supabase REST API
    $headers = [
        "apikey: $SUPABASE_KEY",
        "Content-Type: application/json",
        "Accept: application/json"
    ];
    
    // ✅ Use proper token or fallback to service key
    if ($token) {
        $headers[] = "Authorization: Bearer $token";
    } else {
        $headers[] = "Authorization: Bearer $SUPABASE_KEY";
    }

    switch (strtoupper($method)) {
        case "POST":
            curl_setopt($ch, CURLOPT_POST, true);
            if ($data) {
                curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
            }
            // ✅ This header ensures Supabase returns the inserted data
            $headers[] = "Prefer: return=representation";
            break;
            
        case "PATCH":
        case "PUT":
            curl_setopt($ch, CURLOPT_CUSTOMREQUEST, $method);
            if ($data) {
                curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
            }
            $headers[] = "Prefer: return=representation";
            break;
            
        case "DELETE":
            curl_setopt($ch, CURLOPT_CUSTOMREQUEST, "DELETE");
            if ($data) {
                curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
            }
            break;
            
        default: // GET
            // nothing extra
            break;
    }

    curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);

    $response = curl_exec($ch);
    $err = curl_error($ch);
    curl_close($ch);

    // ✅ Log if cURL fails
    if ($err) {
        error_log("SUPABASE CURL ERROR: $err");
        return ['error' => $err];
    }

    // ✅ Decode JSON safely
    $decoded = json_decode($response, true);
    if ($decoded === null && json_last_error() !== JSON_ERROR_NONE) {
        error_log("SUPABASE JSON DECODE ERROR: " . json_last_error_msg());
        error_log("RAW RESPONSE: " . $response);
        return ['error' => 'Invalid JSON from Supabase'];
    }

    return $decoded;
}


/**
 * ✅ IMPROVED: Create user in Supabase Auth with better error handling
 */
function supabaseAuthSignUp($email, $password, $metadata = []) {
    global $SUPABASE_URL, $SUPABASE_KEY;
    
    $url = $SUPABASE_URL . '/auth/v1/admin/users';
    
    $data = [
        'email' => $email,
        'password' => $password,
        'email_confirm' => true,
        'user_metadata' => $metadata
    ];
    
    error_log("🔐 AUTH SIGNUP REQUEST: " . json_encode($data, JSON_PRETTY_PRINT));
    
    $ch = curl_init($url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
    curl_setopt($ch, CURLOPT_HTTPHEADER, [
        'Content-Type: application/json',
        'apikey: ' . $SUPABASE_KEY,
        'Authorization: Bearer ' . $SUPABASE_KEY
    ]);
    
    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    $curlError = curl_error($ch);
    curl_close($ch);
    
    error_log("🔐 AUTH SIGNUP RESPONSE CODE: $httpCode");
    error_log("🔐 AUTH SIGNUP RESPONSE BODY: " . $response);
    
    // ✅ Handle cURL errors
    if ($curlError) {
        error_log("❌ CURL ERROR: $curlError");
        return [
            'success' => false,
            'error' => [
                'message' => 'Connection error: ' . $curlError,
                'code' => 'curl_error'
            ]
        ];
    }
    
    $result = json_decode($response, true);
    
    // ✅ Handle JSON decode errors
    if ($result === null && json_last_error() !== JSON_ERROR_NONE) {
        error_log("❌ JSON DECODE ERROR: " . json_last_error_msg());
        return [
            'success' => false,
            'error' => [
                'message' => 'Invalid response from auth server',
                'code' => 'json_error',
                'raw_response' => $response
            ]
        ];
    }
    
    // ✅ Success
    if ($httpCode >= 200 && $httpCode < 300) {
        return [
            'success' => true,
            'user' => $result
        ];
    }
    
    // ✅ IMPROVED: Better error extraction
    // Supabase auth errors can have different structures
    $errorMessage = 'Unknown error';
    $errorCode = 'unknown';
    
    if (isset($result['error'])) {
        $errorMessage = $result['error'];
        $errorCode = $result['error_code'] ?? 'api_error';
    } elseif (isset($result['msg'])) {
        $errorMessage = $result['msg'];
        $errorCode = $result['code'] ?? 'api_error';
    } elseif (isset($result['message'])) {
        $errorMessage = $result['message'];
        $errorCode = $result['code'] ?? 'api_error';
    } elseif (is_string($result)) {
        $errorMessage = $result;
    }
    
    error_log("❌ AUTH SIGNUP FAILED: $errorMessage (Code: $errorCode)");
    
    return [
        'success' => false,
        'error' => [
            'message' => $errorMessage,
            'code' => $errorCode,
            'http_code' => $httpCode,
            'full_response' => $result
        ]
    ];
}

/**
 * ✅ IMPROVED: Login user with better error handling
 */
function supabaseAuthLogin($email, $password) {
    global $SUPABASE_URL, $SUPABASE_KEY;
    
    $url = $SUPABASE_URL . '/auth/v1/token?grant_type=password';
    
    $data = [
        'email' => $email,
        'password' => $password
    ];
    
    error_log("🔑 AUTH LOGIN REQUEST for: $email");
    
    $ch = curl_init($url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
    curl_setopt($ch, CURLOPT_HTTPHEADER, [
        'Content-Type: application/json',
        'apikey: ' . $SUPABASE_KEY
    ]);
    
    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    $curlError = curl_error($ch);
    curl_close($ch);
    
    error_log("🔑 AUTH LOGIN RESPONSE CODE: $httpCode");
    
    // ✅ Handle cURL errors
    if ($curlError) {
        error_log("❌ CURL ERROR: $curlError");
        return [
            'success' => false,
            'error' => [
                'message' => 'Connection error: ' . $curlError
            ]
        ];
    }
    
    $result = json_decode($response, true);
    
    // ✅ Handle JSON decode errors
    if ($result === null && json_last_error() !== JSON_ERROR_NONE) {
        error_log("❌ JSON DECODE ERROR: " . json_last_error_msg());
        return [
            'success' => false,
            'error' => [
                'message' => 'Invalid response from auth server'
            ]
        ];
    }
    
    // ✅ Success
    if ($httpCode >= 200 && $httpCode < 300) {
        error_log("✅ LOGIN SUCCESS for: $email");
        return [
            'success' => true,
            'data' => $result
        ];
    }
    
    // ✅ Better error extraction
    $errorMessage = 'Login failed';
    
    if (isset($result['error_description'])) {
        $errorMessage = $result['error_description'];
    } elseif (isset($result['error'])) {
        $errorMessage = $result['error'];
    } elseif (isset($result['message'])) {
        $errorMessage = $result['message'];
    }
    
    error_log("❌ LOGIN FAILED: $errorMessage");
    
    return [
        'success' => false,
        'error' => [
            'message' => $errorMessage,
            'http_code' => $httpCode,
            'full_response' => $result
        ]
    ];
}
?>