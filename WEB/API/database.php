<?php
// Supabase Config
$SUPABASE_URL = "https://brhaksondhloibpwtrdo.supabase.co";
$SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJyaGFrc29uZGhsb2licHd0cmRvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NjU0MjE0OSwiZXhwIjoyMDcyMTE4MTQ5fQ.lZd5xM790I9kocIVJtqqlilFBasmWcXvPFLpFPZgQV4";

// Make globals accessible
define('SUPABASE_URL', $SUPABASE_URL);
define('SUPABASE_KEY', $SUPABASE_KEY);


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
    
    // ✅ IMPORTANT: Always use service role key for Authorization
    // This bypasses RLS and allows all operations
    // Remove "Bearer " prefix if token contains it
    if ($token) {
        $cleanToken = str_replace('Bearer ', '', trim($token));
        $headers[] = "Authorization: Bearer $cleanToken";
    } else {
        // Use service role key - this has full access
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
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    $err = curl_error($ch);
    curl_close($ch);

    // ✅ Enhanced logging for debugging
    error_log("=== SUPABASE REQUEST ===");
    error_log("Method: $method");
    error_log("URL: $url");
    error_log("HTTP Code: $httpCode");
    error_log("Response: $response");
    error_log("=======================");

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

    // ✅ Check for Supabase error codes
    if (isset($decoded['code']) && isset($decoded['message'])) {
        error_log("SUPABASE API ERROR: " . $decoded['message']);
        return ['error' => $decoded['message'], 'code' => $decoded['code']];
    }

    return $decoded;
}


/**
 * ✅ FIXED: Create user in Supabase Auth with proper metadata structure
 */
function supabaseAuthSignUp($email, $password, $metadata = []) {
    global $SUPABASE_URL, $SUPABASE_KEY;
    
    $url = $SUPABASE_URL . '/auth/v1/admin/users';
    
    // ✅ FIX: Ensure metadata is an object, not an array
    // If metadata is empty or an indexed array, convert to empty object
    if (empty($metadata) || array_values($metadata) === $metadata) {
        $metadata = new stdClass(); // This will encode as {}
    }
    
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

/**
 * ✅ NEW: Helper function for authentication API
 */
function supabaseAuth($method, $endpoint, $data = null) {
    global $SUPABASE_URL, $SUPABASE_KEY;
    
    $url = $SUPABASE_URL . '/auth/v1/' . $endpoint;
    
    $headers = [
        'apikey: ' . $SUPABASE_KEY,
        'Content-Type: application/json'
    ];

    $ch = curl_init($url);
    curl_setopt($ch, CURLOPT_CUSTOMREQUEST, $method);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
    
    if ($data !== null) {
        curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
    }

    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    
    if (curl_errno($ch)) {
        $error = curl_error($ch);
        curl_close($ch);
        return ['error' => ['message' => $error]];
    }
    
    curl_close($ch);

    $result = json_decode($response, true);

    // Handle errors
    if ($httpCode >= 400) {
        return [
            'error' => [
                'message' => $result['msg'] ?? $result['error_description'] ?? $result['message'] ?? 'Unknown error',
                'code' => $httpCode
            ]
        ];
    }

    return $result;
}

/**
 * ✅ NEW: Helper function to insert data with authentication
 */
function supabaseInsertAuth($table, $data, $accessToken) {
    global $SUPABASE_URL, $SUPABASE_KEY;
    
    $url = $SUPABASE_URL . '/rest/v1/' . $table;

    $headers = [
        'apikey: ' . $SUPABASE_KEY,
        'Authorization: Bearer ' . $accessToken,
        'Content-Type: application/json',
        'Prefer: return=representation'
    ];

    $ch = curl_init($url);
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
    curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));

    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    
    if (curl_errno($ch)) {
        $error = curl_error($ch);
        curl_close($ch);
        return ['error' => $error];
    }
    
    curl_close($ch);

    $result = json_decode($response, true);

    if ($httpCode >= 400) {
        return [
            'error' => $result['message'] ?? $result['error'] ?? 'Unknown error',
            'code' => $httpCode
        ];
    }

    return $result;
}

/**
 * ✅ NEW: Helper function to query with filters
 */
function supabaseQuery($table, $filters = [], $select = '*') {
    $params = "select=$select";
    
    foreach ($filters as $key => $value) {
        $params .= "&$key=$value";
    }
    
    return supabase('GET', $table, $params);
}

/**
 * ✅ NEW: Calculate age from birth date
 */
function calculateAge($birthDate) {
    if (!$birthDate) return 0;
    
    $birth = new DateTime($birthDate);
    $today = new DateTime('today');
    $age = $birth->diff($today)->y;
    return $age;
}

/**
 * ✅ NEW: Normalize gender format
 */
function normalizeGender($gender) {
    if (empty($gender)) return null;
    
    $gender = strtolower(trim($gender));
    
    if (in_array($gender, ['laki-laki', 'laki laki', 'l', 'male', 'pria'])) {
        return 'Laki-Laki';
    }
    
    if (in_array($gender, ['perempuan', 'p', 'female', 'wanita'])) {
        return 'Perempuan';
    }
    
    // Return original if it doesn't match common patterns
    return ucfirst(strtolower($gender));
}

/**
 * ✅ NEW: Check if email exists
 */
function emailExists($email) {
    $result = supabaseQuery('pasien', [
        'email' => "eq.$email",
        'select' => 'email'
    ]);
    
    return !empty($result) && !isset($result['error']);
}

/**
 * ✅ NEW: Check if NIK exists
 */
function nikExists($nik) {
    $result = supabaseQuery('pasien', [
        'nik' => "eq.$nik",
        'select' => 'nik'
    ]);
    
    return !empty($result) && !isset($result['error']);
}
?>