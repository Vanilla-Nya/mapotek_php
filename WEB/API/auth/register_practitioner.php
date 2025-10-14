<?php
ini_set('display_errors', 1);
error_reporting(E_ALL);
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');

require_once '../config/supabase.php';
require_once __DIR__ . '/../ApiClient.php';

// ✅ Read incoming data
$raw = file_get_contents('php://input');
$input = json_decode($raw, true);

if (!$input) {
    $input = $_POST;
}

// ✅ Normalize structure
if (!isset($input['data']) && is_array($input)) {
    $input = [
        'action' => $input['action'] ?? '',
        'data'   => $input
    ];
}

error_log("📥 REGISTER_PRACTITIONER INPUT: " . print_r($input, true));

$action = $input['action'] ?? '';

// ✅ Route the request
if ($action === 'search_practitioner') {
    searchPractitioner($input);
} elseif ($action === 'save_practitioner') {
    savePractitioner($input);
} else {
    echo json_encode(['success' => false, 'message' => 'Invalid action']);
}

// ========================================
// 🔍 SEARCH PRACTITIONER FROM SATUSEHAT
// ========================================
function searchPractitioner($input) {
    $data = $input['data'] ?? $input;
    $method = strtolower(trim($data['method'] ?? ''));

    try {
        $api = new ApiClient();
        $url = '/Practitioner';
        $params = [];

        // Search by NIK
        if ($method === 'nik') {
            $nik = trim($data['nik'] ?? '');
            if (empty($nik)) {
                echo json_encode(['success' => false, 'message' => 'NIK required']);
                return;
            }
            $params['identifier'] = 'https://fhir.kemkes.go.id/id/nik|' . $nik;
        }
        // Search by detail (name, birthdate, gender)
        elseif ($method === 'detail') {
            $nama = trim($data['nama'] ?? '');
            $tanggalLahir = trim($data['tanggal_lahir'] ?? '');
            $gender = trim($data['gender'] ?? '');

            if (empty($nama) || empty($tanggalLahir) || empty($gender)) {
                echo json_encode(['success' => false, 'message' => 'All fields required']);
                return;
            }

            $params['name'] = $nama;
            $params['birthdate'] = $tanggalLahir;
            $params['gender'] = strtolower($gender);
        }
        else {
            echo json_encode(['success' => false, 'message' => 'Invalid method']);
            return;
        }

        // ✅ Call SatuSehat API
        $response = $api->get($url, $params);
        $result = json_decode($response, true);

        if (isset($result['entry']) && count($result['entry']) > 0) {
            $resource = $result['entry'][0]['resource'] ?? [];

            $idSatusehat = $resource['id'] ?? null;
            $nama = $resource['name'][0]['text'] ?? '';
            $genderApi = $resource['gender'] ?? '';
            $alamat = $resource['address'][0]['line'][0] ?? '';

            $gender = match($genderApi) {
                'male' => 'Laki-Laki',
                'female' => 'Perempuan',
                default => 'Tidak Bisa Dijelaskan'
            };

            echo json_encode([
                'success' => true,
                'data' => [
                    'id_satusehat' => $idSatusehat,
                    'nama' => $nama,
                    'gender' => $gender,
                    'alamat' => $alamat
                ]
            ]);
        } else {
            echo json_encode([
                'success' => false,
                'message' => 'Data tidak ditemukan di SatuSehat'
            ]);
        }

    } catch (Exception $e) {
        echo json_encode([
            'success' => false,
            'message' => 'API Error: ' . $e->getMessage()
        ]);
    }
}

// ========================================
// 💾 SAVE PRACTITIONER TO DATABASE
// ========================================
function savePractitioner($input) {
    $data = $input['data'] ?? [];

    error_log("💾 SAVE PRACTITIONER DATA: " . print_r($data, true));

    // ✅ Step 1: Validate required fields
    if (
        empty($data['nama']) ||
        empty($data['email']) ||
        empty($data['password']) ||
        empty($data['id_satusehat'])
    ) {
        echo json_encode([
            'success' => false,
            'message' => 'Data tidak lengkap. Pastikan semua field terisi.'
        ]);
        return;
    }

    // ✅ Step 2: Validate email format
    if (!filter_var($data['email'], FILTER_VALIDATE_EMAIL)) {
        echo json_encode([
            'success' => false,
            'message' => 'Format email tidak valid'
        ]);
        return;
    }

    try {
        // ✅ Step 3: Check if doctor already exists
        error_log("🔍 Checking for existing doctor...");
        $checkQuery = "select=id_dokter,email,id_satusehat&or=(email.eq." . urlencode($data['email']) . ",id_satusehat.eq." . urlencode($data['id_satusehat']) . ")";
        $existingDokter = supabase('GET', 'dokter', $checkQuery);
        
        error_log("📋 EXISTING CHECK RESULT: " . print_r($existingDokter, true));

        if (!empty($existingDokter) && is_array($existingDokter) && !isset($existingDokter['error'])) {
            if (count($existingDokter) > 0) {
                $existing = $existingDokter[0];
                if ($existing['email'] === $data['email']) {
                    echo json_encode([
                        'success' => false,
                        'message' => 'Email "' . $data['email'] . '" sudah terdaftar. Silakan gunakan email lain atau login.'
                    ]);
                    return;
                }
                if ($existing['id_satusehat'] === $data['id_satusehat']) {
                    echo json_encode([
                        'success' => false,
                        'message' => 'Dokter dengan ID SatuSehat ini sudah terdaftar di sistem.'
                    ]);
                    return;
                }
            }
        }

        // ✅ Step 4: Normalize gender to match EXACT enum values
        $genderInput = strtolower(trim($data['gender'] ?? ''));
        
        if (in_array($genderInput, ['laki-laki', 'laki', 'male', 'l'])) {
            $gender = 'Laki-Laki';
        } elseif (in_array($genderInput, ['perempuan', 'female', 'p'])) {
            $gender = 'Perempuan';
        } else {
            $gender = 'Tidak Bisa Dijelaskan';
        }
        
        error_log("🔄 Gender converted: '{$genderInput}' → '{$gender}'");

        // ✅ Step 5: Generate username
        $username = $data['username'] ?? strtolower(preg_replace('/\s+/', '', $data['nama']));
        $username = preg_replace('/[^a-z0-9_]/', '', $username);

        // ========================================
        // ✅ STEP 6: Create user in Supabase Auth
        // ========================================
        error_log("👤 Creating Supabase Auth user for: " . $data['email']);
        
        $authResult = supabaseAuthSignUp(
            $data['email'],
            $data['password'],
            [
                'nama_lengkap' => $data['nama'],
                'role' => 'dokter',
                'username' => $username
            ]
        );

        error_log("📋 AUTH SIGNUP RESULT: " . print_r($authResult, true));

        // ✅ IMPROVED: Better error handling
        if (!$authResult['success']) {
            $errorObj = $authResult['error'] ?? [];
            $errorMsg = $errorObj['message'] ?? 'Unknown error';
            $errorCode = $errorObj['code'] ?? 'unknown';
            
            error_log("❌ AUTH SIGNUP FAILED");
            error_log("   Message: $errorMsg");
            error_log("   Code: $errorCode");
            
            // Check if user already exists
            if (
                strpos(strtolower($errorMsg), 'already') !== false || 
                strpos(strtolower($errorMsg), 'registered') !== false ||
                strpos(strtolower($errorMsg), 'exist') !== false ||
                $errorCode === 'user_already_exists'
            ) {
                error_log("⚠️ User already exists, will attempt login...");
                // Continue to login step
            } else {
                // Return detailed error to frontend
                echo json_encode([
                    'success' => false,
                    'message' => 'Gagal membuat akun: ' . $errorMsg,
                    'error_details' => [
                        'code' => $errorCode,
                        'full_error' => $errorObj
                    ],
                    'debug_hint' => 'Check PHP error logs for full details'
                ]);
                return;
            }
        } else {
            $userId = $authResult['user']['id'] ?? null;
            if ($userId) {
                error_log("✅ Auth user created with ID: $userId");
            } else {
                error_log("⚠️ Auth user created but no ID returned");
            }
        }

        // ========================================
        // ✅ STEP 7: LOGIN to get access token
        // ========================================
        error_log("🔑 Logging in to get access token...");
        
        $loginResult = supabaseAuthLogin($data['email'], $data['password']);
        
        error_log("📋 LOGIN RESULT: " . print_r($loginResult, true));

        if (!$loginResult['success']) {
            $loginError = $loginResult['error']['message'] ?? 'Login failed';
            error_log("❌ LOGIN FAILED: $loginError");
            
            echo json_encode([
                'success' => false,
                'message' => 'Akun dibuat tapi gagal login: ' . $loginError,
                'error_details' => $loginResult['error'] ?? []
            ]);
            return;
        }

        // ✅ Extract access token and user ID
        $accessToken = $loginResult['data']['access_token'] ?? null;
        $userId = $loginResult['data']['user']['id'] ?? null;
        
        if (!$accessToken || !$userId) {
            echo json_encode([
                'success' => false,
                'message' => 'Login berhasil tapi token/ID tidak ditemukan',
                'debug' => [
                    'has_token' => !empty($accessToken),
                    'has_user_id' => !empty($userId)
                ]
            ]);
            return;
        }

        error_log("✅ Got access token for user ID: $userId");

        // ========================================
        // ✅ STEP 8: Check if doctor record already exists
        // ========================================
        error_log("🔍 Checking if doctor record exists for user: $userId");
        $existingQuery = "select=id_dokter,email&id_dokter=eq.$userId";
        $existingRecord = supabase('GET', 'dokter', $existingQuery, null, $accessToken);
        
        error_log("📋 EXISTING RECORD CHECK: " . print_r($existingRecord, true));
        
        if (!empty($existingRecord) && is_array($existingRecord) && isset($existingRecord[0]['id_dokter'])) {
            $idDokter = $existingRecord[0]['id_dokter'];
            error_log("✅ Doctor record already exists with id_dokter: $idDokter");
            
            echo json_encode([
                'success' => true,
                'message' => 'Akun sudah ada. Silakan login.',
                'data' => [
                    'user_id' => $userId,
                    'id_dokter' => $idDokter,
                    'email' => $data['email'],
                    'username' => $username,
                    'nama' => $data['nama']
                ]
            ]);
            return;
        }

        // ========================================
        // ✅ STEP 9: Insert doctor using ACCESS TOKEN
        // ========================================
        error_log("📝 Inserting new doctor into database...");
        
        // id_dokter will be auto-filled by auth.uid() default value
        $dokterData = [
            'id_satusehat' => $data['id_satusehat'],
            'nama_lengkap' => $data['nama'],
            'username' => $username,
            'jenis_kelamin' => $gender,
            'email' => $data['email'],
            'password' => password_hash($data['password'], PASSWORD_BCRYPT)
        ];
        
        // Add optional fields
        if (!empty($data['alamat'])) {
            $dokterData['alamat'] = $data['alamat'];
        }
        if (!empty($data['no_telp'])) {
            $dokterData['no_telp'] = $data['no_telp'];
        }

        error_log("📤 Data to insert: " . json_encode($dokterData, JSON_PRETTY_PRINT));

        // 🔥 USE ACCESS TOKEN
        $dokterResult = supabase('POST', 'dokter', 'select=id_dokter,nama_lengkap,email', $dokterData, $accessToken);
        
        error_log("📥 INSERT RESULT: " . json_encode($dokterResult, JSON_PRETTY_PRINT));

        // ✅ Check for errors
        if (isset($dokterResult['error'])) {
            $errorDetails = $dokterResult['error'];
            
            error_log("❌ SUPABASE INSERT ERROR:");
            error_log("   Code: " . ($errorDetails['code'] ?? 'N/A'));
            error_log("   Message: " . ($errorDetails['message'] ?? 'N/A'));
            error_log("   Details: " . ($errorDetails['details'] ?? 'N/A'));
            error_log("   Hint: " . ($errorDetails['hint'] ?? 'N/A'));
            
            echo json_encode([
                'success' => false,
                'message' => 'Gagal menyimpan data dokter ke database',
                'error_details' => $errorDetails,
                'debug_hint' => 'This might be an RLS policy issue. Check that "Allow doctor insert own record" policy is enabled.'
            ]);
            return;
        }

        // ✅ Get id_dokter from response
        $idDokter = null;

        if (empty($dokterResult) || !is_array($dokterResult)) {
            error_log("⚠️ EMPTY INSERT RESULT - Verifying insertion...");

            usleep(500000); // Wait 0.5s for consistency

            // Verify the insert
            $verifyQuery = "select=id_dokter,nama_lengkap,email&email=eq." . urlencode($data['email']);
            $verifyResult = supabase('GET', 'dokter', $verifyQuery, null, $accessToken);

            error_log("🔍 VERIFY RESULT: " . print_r($verifyResult, true));

            if (!empty($verifyResult) && isset($verifyResult[0]['id_dokter'])) {
                $idDokter = $verifyResult[0]['id_dokter'];
                error_log("✅ Data was inserted! Found id_dokter: $idDokter");
            } else {
                echo json_encode([
                    'success' => false,
                    'message' => 'Akun dibuat tapi data dokter tidak tersimpan. Kemungkinan masalah RLS policy.',
                    'debug' => [
                        'user_id' => $userId,
                        'email' => $data['email'],
                        'hint' => 'Check Supabase Table Editor > dokter table > Policies'
                    ]
                ]);
                return;
            }
        } else {
            $idDokter = $dokterResult[0]['id_dokter'] ?? null;
            error_log("✅ id_dokter from insert response: $idDokter");
        }

        // ✅ Final verification
        if (!$idDokter) {
            error_log("⚠️ id_dokter still not found, final query...");
            $findQuery = "select=id_dokter&id_dokter=eq.$userId";
            $foundDokter = supabase('GET', 'dokter', $findQuery, null, $accessToken);
            
            if (!empty($foundDokter) && isset($foundDokter[0]['id_dokter'])) {
                $idDokter = $foundDokter[0]['id_dokter'];
                error_log("✅ Found id_dokter: $idDokter");
            }
        }

        // ✅ Success response
        if ($idDokter) {
            echo json_encode([
                'success' => true,
                'message' => 'Registrasi berhasil! Silakan login untuk melanjutkan.',
                'data' => [
                    'user_id' => $userId,
                    'id_dokter' => $idDokter,
                    'email' => $data['email'],
                    'username' => $username,
                    'nama' => $data['nama']
                ]
            ]);
            error_log("🎉 Registration complete - id_dokter: $idDokter");
        } else {
            echo json_encode([
                'success' => false,
                'message' => 'Akun dibuat tapi verifikasi gagal. Coba login untuk memastikan.',
                'data' => [
                    'user_id' => $userId,
                    'email' => $data['email'],
                    'username' => $username
                ]
            ]);
        }

    } catch (Exception $e) {
        error_log("❌ EXCEPTION: " . $e->getMessage());
        error_log("   Stack trace: " . $e->getTraceAsString());
        echo json_encode([
            'success' => false,
            'message' => 'Terjadi kesalahan sistem: ' . $e->getMessage()
        ]);
    }
}
?>