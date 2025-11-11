<?php
// API/satusehat/search_practitioner.php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');

require_once '../database.php';

// Try multiple paths for satusehat_api.php
$possiblePaths = [
    __DIR__ . '/../config/satusehat_api.php',         // WEB/API/config/ ← YOUR LOCATION!
    __DIR__ . '/../../config/satusehat_api.php',      // WEB/config/
    __DIR__ . '/../../../config/satusehat_api.php',   // project root config/
    __DIR__ . '/../satusehat_api.php',                // WEB/API/
];

$loaded = false;
foreach ($possiblePaths as $path) {
    if (file_exists($path)) {
        require_once $path;
        $loaded = true;
        error_log("✅ Loaded satusehat_api.php from: $path");
        break;
    }
}

if (!$loaded) {
    error_log("❌ Could not find satusehat_api.php in any expected location");
    echo json_encode([
        'success' => false,
        'message' => 'Configuration file not found. Please ensure satusehat_api.php is in the config directory.',
        'searched_paths' => $possiblePaths
    ]);
    exit;
}

$input = json_decode(file_get_contents('php://input'), true);

$dokterId = $input['id_dokter'] ?? '';
$nikSearch = $input['nik'] ?? ''; // Optional: doctor can provide their NIK

if (empty($dokterId)) {
    echo json_encode([
        'success' => false,
        'message' => 'Doctor ID is required'
    ]);
    exit;
}

try {
    // Get doctor info from database
    $dokterResult = supabase('GET', 'dokter', "id_dokter=eq.$dokterId");
    
    if (empty($dokterResult) || isset($dokterResult['code'])) {
        throw new Exception('Doctor not found');
    }
    
    $dokter = $dokterResult[0];
    
    // Check if SatuSehat is enabled
    if (!($dokter['satusehat_enabled'] ?? false)) {
        echo json_encode([
            'success' => false,
            'message' => 'SatuSehat API belum diaktifkan. Silakan aktifkan terlebih dahulu di konfigurasi.',
            'action_required' => 'enable_satusehat'
        ]);
        exit;
    }
    
    // Initialize SatuSehat API with doctor's credentials
    $satusehat = SatuSehatAPI::forDoctor($dokterId);
    
    // Get search data from doctor profile
    $searchNik = $nikSearch ?: ($dokter['nik'] ?? '');
    $searchName = $dokter['nama_lengkap'] ?? '';
    $searchBirthdate = $dokter['tanggal_lahir'] ?? '';
    $searchGender = $dokter['jenis_kelamin'] ?? '';
    
    // Pre-validation: Check if we have minimum required data
    $canSearchByNik = !empty($searchNik);
    $canSearchByNikCombo = !empty($searchNik) && !empty($searchName) && !empty($searchBirthdate);
    $canSearchByNameCombo = !empty($searchName) && !empty($searchGender) && !empty($searchBirthdate);
    
    if (!$canSearchByNik && !$canSearchByNikCombo && !$canSearchByNameCombo) {
        // Not enough data to search
        $missingData = [];
        if (empty($searchNik)) $missingData[] = 'NIK';
        if (empty($searchName)) $missingData[] = 'Nama Lengkap';
        if (empty($searchBirthdate)) $missingData[] = 'Tanggal Lahir';
        if (empty($searchGender)) $missingData[] = 'Jenis Kelamin';
        
        echo json_encode([
            'success' => false,
            'message' => 'Data profil tidak lengkap untuk pencarian SatuSehat',
            'missing_data' => $missingData,
            'requirement' => 'Minimal harus ada: 1) NIK, atau 2) NIK + Nama + Tanggal Lahir, atau 3) Nama + Jenis Kelamin + Tanggal Lahir',
            'action' => 'Silakan lengkapi data profil Anda terlebih dahulu'
        ]);
        exit;
    }
    
    error_log("=== PRACTITIONER SEARCH VALIDATION ===");
    error_log("✓ Can search by NIK only: " . ($canSearchByNik ? 'YES' : 'NO'));
    error_log("✓ Can search by NIK combo: " . ($canSearchByNikCombo ? 'YES' : 'NO'));
    error_log("✓ Can search by Name combo: " . ($canSearchByNameCombo ? 'YES' : 'NO'));
    error_log("📋 NIK: " . ($searchNik ?: 'EMPTY'));
    error_log("📋 Name: " . ($searchName ?: 'EMPTY'));
    error_log("📋 Birthdate: " . ($searchBirthdate ?: 'EMPTY'));
    error_log("📋 Gender: " . ($searchGender ?: 'EMPTY'));
    
    $practitioners = [];
    $searchMethod = '';
    
    // Strategy 1: Search by NIK only (simplest and most accurate)
    if (!empty($searchNik)) {
        $searchMethod = 'NIK';
        // SatuSehat accepts just 'nik' parameter
        $url = "/Practitioner?identifier=https://fhir.kemkes.go.id/id/nik|$searchNik";
        
        error_log("=== PRACTITIONER SEARCH START ===");
        error_log("🔍 Search Method: NIK only");
        error_log("📋 NIK: $searchNik");
        error_log("🔗 Full URL: $url");
        error_log("🏥 Doctor ID: $dokterId");
        
        try {
            $result = $satusehat->get($url);
            error_log("📥 Response Status: " . ($result['resourceType'] ?? 'Unknown'));
            error_log("📊 Full Response: " . json_encode($result, JSON_PRETTY_PRINT));
            
            if (isset($result['entry']) && count($result['entry']) > 0) {
                $practitioners = $result['entry'];
                error_log("✅ Found " . count($practitioners) . " practitioners by NIK");
            } elseif (isset($result['issue'])) {
                // FHIR OperationOutcome error
                $errorMsg = $result['issue'][0]['diagnostics'] ?? json_encode($result);
                error_log("⚠️ FHIR Error: $errorMsg");
                throw new Exception($errorMsg);
            } else {
                error_log("⚠️ No practitioners found by NIK");
                error_log("📄 Response details: " . json_encode($result));
            }
        } catch (Exception $e) {
            error_log("❌ NIK search exception: " . $e->getMessage());
            error_log("🔍 Exception type: " . get_class($e));
            
            // If this is a 400 error, it means the query format is wrong
            if (strpos($e->getMessage(), '400') !== false) {
                error_log("⚠️ 400 Bad Request - Query format may be incorrect");
                error_log("💡 Will try alternative search methods...");
            }
        }
        error_log("=== PRACTITIONER SEARCH END ===");
    }
    
    // Strategy 2: Search by NIK + Name + Birthdate (if NIK alone failed)
    if (empty($practitioners) && !empty($searchNik) && !empty($searchName) && !empty($searchBirthdate)) {
        $searchMethod = 'NIK+Name+Birthdate';
        $cleanName = urlencode($searchName);
        $url = "/Practitioner?identifier=https://fhir.kemkes.go.id/id/nik|$searchNik&name=$cleanName&birthdate=$searchBirthdate";
        
        error_log("🔍 Searching by NIK + Name + Birthdate");
        error_log("🔗 URL: $url");
        
        try {
            $result = $satusehat->get($url);
            
            if (isset($result['entry']) && count($result['entry']) > 0) {
                $practitioners = $result['entry'];
                error_log("✅ Found " . count($practitioners) . " practitioners by NIK+Name+Birthdate");
            }
        } catch (Exception $e) {
            error_log("❌ NIK+Name+Birthdate search error: " . $e->getMessage());
        }
    }
    
    // Strategy 3: Search by Name + Gender + Birthdate (last resort)
    if (empty($practitioners) && !empty($searchName) && !empty($searchGender) && !empty($searchBirthdate)) {
        $searchMethod = 'Name+Gender+Birthdate';
        $cleanName = urlencode($searchName);
        
        // Convert jenis_kelamin to FHIR gender format
        $genderMap = [
            'Laki-Laki' => 'male',
            'Perempuan' => 'female',
            'laki-laki' => 'male',
            'perempuan' => 'female'
        ];
        $fhirGender = $genderMap[$searchGender] ?? $searchGender;
        
        $url = "/Practitioner?name=$cleanName&gender=$fhirGender&birthdate=$searchBirthdate";
        
        error_log("🔍 Searching by Name + Gender + Birthdate");
        error_log("🔗 URL: $url");
        
        try {
            $result = $satusehat->get($url);
            
            if (isset($result['entry']) && count($result['entry']) > 0) {
                $practitioners = $result['entry'];
                error_log("✅ Found " . count($practitioners) . " practitioners by Name+Gender+Birthdate");
            }
        } catch (Exception $e) {
            error_log("❌ Name+Gender+Birthdate search error: " . $e->getMessage());
        }
    }
    
    // Process results
    if (empty($practitioners)) {
        $missingData = [];
        if (empty($searchNik)) $missingData[] = 'NIK';
        if (empty($searchName)) $missingData[] = 'Nama Lengkap';
        if (empty($searchBirthdate)) $missingData[] = 'Tanggal Lahir';
        if (empty($searchGender)) $missingData[] = 'Jenis Kelamin';
        
        $suggestion = '';
        if (!empty($missingData)) {
            $suggestion = 'Data yang belum lengkap: ' . implode(', ', $missingData) . '. ';
            $suggestion .= 'Silakan lengkapi data profil Anda dan coba lagi.';
        } else {
            $suggestion = 'Hubungi administrator SatuSehat untuk memastikan data Anda terdaftar dengan NIK: ' . $searchNik;
        }
        
        echo json_encode([
            'success' => false,
            'message' => 'Practitioner tidak ditemukan di SatuSehat.',
            'search_method' => $searchMethod,
            'searched_nik' => $searchNik ?: null,
            'searched_name' => $searchName ?: null,
            'searched_birthdate' => $searchBirthdate ?: null,
            'missing_data' => $missingData,
            'suggestion' => $suggestion,
            'note' => 'SatuSehat memerlukan: 1) NIK saja, atau 2) NIK + Nama + Tanggal Lahir, atau 3) Nama + Jenis Kelamin + Tanggal Lahir'
        ]);
        exit;
    }
    
    // Get the first practitioner (or let user choose if multiple)
    if (count($practitioners) > 1) {
        // Multiple practitioners found - return all for user to choose
        $practitionerList = [];
        foreach ($practitioners as $entry) {
            $resource = $entry['resource'];
            $practitionerList[] = [
                'id' => $resource['id'],
                'name' => $resource['name'][0]['text'] ?? 'Unknown',
                'identifier' => $resource['identifier'][0]['value'] ?? null
            ];
        }
        
        echo json_encode([
            'success' => true,
            'multiple_found' => true,
            'count' => count($practitioners),
            'practitioners' => $practitionerList,
            'message' => 'Ditemukan ' . count($practitioners) . ' practitioner. Silakan pilih yang sesuai.'
        ]);
        exit;
    }
    
    // Single practitioner found
    $practitioner = $practitioners[0]['resource'];
    $practitionerId = $practitioner['id'];
    $practitionerName = $practitioner['name'][0]['text'] ?? $searchName;
    
    // Get NIK from identifier
    $practitionerNik = null;
    if (isset($practitioner['identifier'])) {
        foreach ($practitioner['identifier'] as $identifier) {
            if (strpos($identifier['system'] ?? '', 'nik') !== false) {
                $practitionerNik = $identifier['value'] ?? null;
                break;
            }
        }
    }
    
    // Save to database - using existing fields
    $updateData = [
        'id_satusehat' => $practitionerId,  // Use existing field
        'updated_at' => date('Y-m-d H:i:s')
    ];
    
    $updateResult = supabase('PATCH', 'dokter', "id_dokter=eq.$dokterId", $updateData);
    
    if (isset($updateResult['error'])) {
        throw new Exception('Failed to save Practitioner ID to database');
    }
    
    error_log("✅ Practitioner ID saved: $practitionerId for doctor: $dokterId");
    
    echo json_encode([
        'success' => true,
        'message' => 'ID SatuSehat berhasil ditemukan dan disimpan!',
        'data' => [
            'id_satusehat' => $practitionerId,
            'practitioner_name' => $practitionerName,
            'practitioner_nik' => $practitionerNik,
            'search_method' => $searchMethod
        ]
    ]);
    
} catch (Exception $e) {
    error_log("❌ Error searching practitioner: " . $e->getMessage());
    
    echo json_encode([
        'success' => false,
        'message' => 'Terjadi kesalahan: ' . $e->getMessage(),
        'error_type' => get_class($e)
    ]);
}
?>