<?php
// auth/encounter_satusehat_api.php

require_once __DIR__ . '/../database.php';
require_once __DIR__ . '/../config/satusehat_api.php';

class EncounterSatusehatApi {
    
    /**
     * Create Encounter in SATUSEHAT
     * 
     * @param string $idSatusehatPasien Patient ID from SATUSEHAT
     * @param string $namaPasien Patient name
     * @param string $idSatusehatDokter Practitioner ID from SATUSEHAT
     * @param string $namaDokter Practitioner name
     * @param string|null $locationId Location ID (optional)
     * @param string|null $locationDisplay Location display name (optional)
     * @param string|null $encounterNumber Unique encounter number (will auto-generate if not provided)
     * @return string|null Encounter ID if successful, null if failed
     */
    public static function createEncounter(
        $idSatusehatPasien,
        $namaPasien,
        $idSatusehatDokter,
        $namaDokter,
        $locationId = null,
        $locationDisplay = null,
        $encounterNumber = null
    ) {
        try {
            error_log("🏥 ===== CREATING SATUSEHAT ENCOUNTER =====");
            error_log("📋 Patient: $namaPasien (ID: $idSatusehatPasien)");
            error_log("👨‍⚕️ Doctor: $namaDokter (ID: $idSatusehatDokter)");
            
            // Validate required parameters
            if (empty($idSatusehatPasien)) {
                error_log("❌ Patient SATUSEHAT ID is empty!");
                return null;
            }
            
            if (empty($idSatusehatDokter)) {
                error_log("❌ Doctor SATUSEHAT ID is empty!");
                return null;
            }
            
            // ✅ Get doctor's database ID and credentials
            $doctorParams = "select=id_dokter,nama_lengkap,satusehat_client_id,satusehat_client_secret,satusehat_org_id,satusehat_location_id,satusehat_location_name&id_satusehat=eq.$idSatusehatDokter&limit=1";
            $doctorResult = supabase('GET', 'dokter', $doctorParams);
            
            if (empty($doctorResult) || isset($doctorResult['error'])) {
                error_log("❌ Failed to get doctor credentials from database");
                error_log("   Query: $doctorParams");
                error_log("   Result: " . json_encode($doctorResult));
                return null;
            }
            
            $doctor = $doctorResult[0];
            $idDokter = $doctor['id_dokter'];
            
            error_log("✅ Doctor found in database: ID=$idDokter");
            
            // Check credentials
            if (empty($doctor['satusehat_client_id']) || empty($doctor['satusehat_client_secret'])) {
                error_log("❌ Doctor has no SatuSehat credentials configured!");
                error_log("   Doctor: {$doctor['nama_lengkap']}");
                error_log("   Please configure in Profile settings");
                return null;
            }
            
            error_log("✅ Doctor has valid SatuSehat credentials");
            
            // Initialize API client
            $api = SatuSehatAPI::forDoctor($idDokter);
            
            if (!$api->isConfigured()) {
                error_log("❌ SatuSehat API not properly configured for this doctor");
                return null;
            }
            
            error_log("✅ API client initialized with doctor credentials");
            
            // Get organization ID
            $orgId = $api->getOrganizationId();
            
            if (empty($orgId)) {
                error_log("❌ Organization ID not found");
                return null;
            }
            
            error_log("🏢 Organization ID: $orgId");
            
            // ========================================
            // ✅ NEW: Get Location from Doctor's Profile
            // ========================================
            if (!$locationId) {
                error_log("📍 Fetching doctor's configured location...");
                
                // Use location from the doctor record we already fetched
                $locationId = $doctor['satusehat_location_id'] ?? null;
                $locationDisplay = $doctor['satusehat_location_name'] ?? null;
                
                if ($locationId && $locationDisplay) {
                    error_log("✅ Using doctor's configured location:");
                    error_log("   ID: $locationId");
                    error_log("   Name: $locationDisplay");
                } else {
                    error_log("❌ Doctor has no location configured in profile!");
                    error_log("   Location ID: " . ($locationId ?: 'MISSING'));
                    error_log("   Location Name: " . ($locationDisplay ?: 'MISSING'));
                    error_log("");
                    error_log("⚠️ SOLUTION: Configure location in Profile:");
                    error_log("   1. Go to Profile page");
                    error_log("   2. Find 'Lokasi Praktik' section");
                    error_log("   3. Click 'Edit Lokasi'");
                    error_log("   4. Search and select your practice location");
                    error_log("");
                    
                    // Return null - location is REQUIRED
                    return null;
                }
            }
            
            // Generate timestamps
            $now = new DateTime('now', new DateTimeZone('Asia/Jakarta'));
            $periodStart = $now->format(DateTime::ATOM);
            
            error_log("⏰ Timestamp: $periodStart");
            
            // Generate unique encounter number if not provided
            if (!$encounterNumber) {
                $encounterNumber = 'ENC-' . date('YmdHis') . '-' . substr(uniqid(), -6);
            }
            
            error_log("🔢 Encounter Number: $encounterNumber");
            
            // Build encounter with proper structure
            $encounter = [
                "resourceType" => "Encounter",
                "status" => "arrived",
                "class" => [
                    "system" => "http://terminology.hl7.org/CodeSystem/v3-ActCode",
                    "code" => "AMB",
                    "display" => "ambulatory"
                ],
                "subject" => [
                    "reference" => "Patient/" . $idSatusehatPasien,
                    "display" => $namaPasien
                ],
                "participant" => [[
                    "type" => [[
                        "coding" => [[
                            "system" => "http://terminology.hl7.org/CodeSystem/v3-ParticipationType",
                            "code" => "ATND",
                            "display" => "attender"
                        ]]
                    ]],
                    "individual" => [
                        "reference" => "Practitioner/" . $idSatusehatDokter,
                        "display" => $namaDokter
                    ]
                ]],
                "period" => [
                    "start" => $periodStart
                ],
                "location" => [[
                    "location" => [
                        "reference" => "Location/" . $locationId,
                        "display" => $locationDisplay
                    ]
                ]],
                "identifier" => [[
                    "system" => "http://sys-ids.kemkes.go.id/encounter/" . $orgId,
                    "value" => $encounterNumber
                ]],
                "statusHistory" => [[
                    "status" => "arrived",
                    "period" => ["start" => $periodStart]
                ]],
                "serviceProvider" => [
                    "reference" => "Organization/" . $orgId
                ]
            ];
            
            error_log("📤 Encounter Payload:");
            error_log(json_encode($encounter, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES));
            
            // Create encounter
            $responseData = $api->post('/Encounter', $encounter);
            
            error_log("📥 SATUSEHAT Response:");
            error_log(json_encode($responseData, JSON_PRETTY_PRINT));
            
            // Check for errors
            if (isset($responseData['resourceType']) && $responseData['resourceType'] === 'OperationOutcome') {
                error_log("❌ SATUSEHAT returned OperationOutcome (error)");
                if (isset($responseData['issue'])) {
                    foreach ($responseData['issue'] as $issue) {
                        $severity = $issue['severity'] ?? 'unknown';
                        $diagnostics = $issue['diagnostics'] ?? 'no message';
                        $code = $issue['code'] ?? 'unknown';
                        error_log("   - [$severity] $code: $diagnostics");
                    }
                }
                return null;
            }
            
            // Check if we got an encounter ID
            if (isset($responseData['id'])) {
                $encounterId = $responseData['id'];
                error_log("✅ Encounter created successfully!");
                error_log("🆔 Encounter ID: " . $encounterId);
                error_log("🔢 Encounter Number: " . $encounterNumber);
                error_log("📍 Location: " . $locationDisplay);
                error_log("=".str_repeat("=", 50));
                return $encounterId;
            }
            
            error_log("❌ No 'id' field in response");
            return null;
            
        } catch (Exception $ex) {
            error_log("❌ EXCEPTION in createEncounter: " . $ex->getMessage());
            error_log("   File: " . $ex->getFile() . " Line: " . $ex->getLine());
            error_log("   Stack trace:");
            error_log($ex->getTraceAsString());
            return null;
        }
    }
    
    /**
     * Update Encounter Status
     * 
     * @param string $encounterId Encounter ID from SATUSEHAT
     * @param string $newStatus New status (arrived, in-progress, finished, cancelled)
     * @param int|null $doctorId Doctor ID from database (to get API credentials)
     * @return bool True if successful, false if failed
     */
    public static function updateEncounterStatus($encounterId, $newStatus = 'finished', $doctorId = null) {
        try {
            error_log("🔄 ===== UPDATING ENCOUNTER STATUS =====");
            error_log("🆔 Encounter ID: " . $encounterId);
            error_log("📊 New Status: " . $newStatus);
            
            // ✅ Validate status
            $validStatuses = ['arrived', 'in-progress', 'finished', 'cancelled'];
            if (!in_array($newStatus, $validStatuses)) {
                error_log("❌ Invalid status: $newStatus");
                error_log("   Valid statuses: " . implode(', ', $validStatuses));
                return false;
            }
            
            // ✅ Get API client - prefer doctor-specific if ID provided
            if ($doctorId) {
                error_log("👨‍⚕️ Using doctor-specific credentials (ID: $doctorId)");
                $api = SatuSehatAPI::forDoctor($doctorId);
            } else {
                error_log("⚠️ No doctor ID provided, using default API client");
                $api = new SatuSehatAPI();
            }
            
            if (!$api->isConfigured()) {
                error_log("❌ SatuSehat API not configured");
                return false;
            }
            
            error_log("✅ API client initialized");
            
            // First, get the existing encounter
            error_log("📥 Fetching current encounter...");
            $encounter = $api->get("/Encounter/" . $encounterId);
            
            if (!$encounter || isset($encounter['issue'])) {
                error_log("❌ Failed to fetch encounter");
                if (isset($encounter['issue'])) {
                    error_log("   Issues: " . json_encode($encounter['issue'], JSON_PRETTY_PRINT));
                }
                return false;
            }
            
            error_log("✅ Current encounter fetched");
            error_log("   Current status: " . ($encounter['status'] ?? 'unknown'));
            
            // Check if status is already the same
            if (isset($encounter['status']) && $encounter['status'] === $newStatus) {
                error_log("ℹ️ Encounter already has status: $newStatus");
                return true;
            }
            
            // Update status
            $encounter['status'] = $newStatus;
            
            // Add status history
            if (!isset($encounter['statusHistory'])) {
                $encounter['statusHistory'] = [];
            }
            
            $now = new DateTime('now', new DateTimeZone('Asia/Jakarta'));
            $timestamp = $now->format(DateTime::ATOM);
            
            $encounter['statusHistory'][] = [
                'status' => $newStatus,
                'period' => ['start' => $timestamp]
            ];
            
            // Update period end time if finishing
            if ($newStatus === 'finished' && isset($encounter['period'])) {
                $encounter['period']['end'] = $timestamp;
                error_log("⏰ Setting end time: $timestamp");
            }
            
            error_log("📤 Updated Encounter Payload:");
            error_log(json_encode($encounter, JSON_PRETTY_PRINT));
            
            // ✅ Use PUT method to update
            $responseData = $api->put("/Encounter/" . $encounterId, $encounter);
            
            error_log("📥 Update Response:");
            error_log(json_encode($responseData, JSON_PRETTY_PRINT));
            
            // Check for errors
            if (isset($responseData['resourceType']) && $responseData['resourceType'] === 'OperationOutcome') {
                error_log("❌ SATUSEHAT returned OperationOutcome (error)");
                if (isset($responseData['issue'])) {
                    foreach ($responseData['issue'] as $issue) {
                        $severity = $issue['severity'] ?? 'unknown';
                        $diagnostics = $issue['diagnostics'] ?? 'no message';
                        error_log("   - [$severity]: $diagnostics");
                    }
                }
                return false;
            }
            
            if (isset($responseData['id'])) {
                error_log("✅ Encounter status updated successfully");
                error_log("=".str_repeat("=", 50));
                return true;
            }
            
            error_log("❌ Failed to update encounter status");
            error_log("   No 'id' field in response");
            return false;
            
        } catch (Exception $ex) {
            error_log("❌ EXCEPTION in updateEncounterStatus: " . $ex->getMessage());
            error_log("   File: " . $ex->getFile() . " Line: " . $ex->getLine());
            error_log("   Stack trace:");
            error_log($ex->getTraceAsString());
            return false;
        }
    }
    
    /**
     * Search Patient by NIK in SATUSEHAT
     * 
     * @param string $nik Patient's NIK (National ID)
     * @param int|null $doctorId Doctor ID for credentials (optional)
     * @return array Result with patient info or error
     */
    public static function searchPatientByNIK($nik, $doctorId = null) {
        try {
            error_log("🔍 ===== SEARCHING PATIENT BY NIK =====");
            error_log("🆔 NIK: " . $nik);
            
            // Get API client
            if ($doctorId) {
                $api = SatuSehatAPI::forDoctor($doctorId);
            } else {
                $api = new SatuSehatAPI();
            }
            
            if (!$api->isConfigured()) {
                error_log("❌ SatuSehat API not configured");
                return [
                    'success' => false,
                    'error' => 'API not configured'
                ];
            }
            
            $response = $api->get("/Patient", [
                'identifier' => 'https://fhir.kemkes.go.id/id/nik|' . $nik
            ]);
            
            error_log("📥 Patient Search Response:");
            error_log(json_encode($response, JSON_PRETTY_PRINT));
            
            // Check for errors
            if (isset($response['resourceType']) && $response['resourceType'] === 'OperationOutcome') {
                error_log("❌ Search failed");
                return [
                    'success' => false,
                    'error' => 'Search failed',
                    'details' => $response['issue'] ?? []
                ];
            }
            
            // Check if patient found
            if (isset($response['entry']) && count($response['entry']) > 0) {
                $patient = $response['entry'][0]['resource'];
                $satusehatId = $patient['id'] ?? null;
                
                error_log("✅ Patient found: " . $satusehatId);
                
                return [
                    'success' => true,
                    'found' => true,
                    'satusehat_id' => $satusehatId,
                    'data' => $patient
                ];
            }
            
            error_log("⚠️ Patient not found in SATUSEHAT");
            
            return [
                'success' => true,
                'found' => false,
                'message' => 'Patient not found in SATUSEHAT'
            ];
            
        } catch (Exception $ex) {
            error_log("❌ EXCEPTION in searchPatientByNIK: " . $ex->getMessage());
            return [
                'success' => false,
                'error' => $ex->getMessage()
            ];
        }
    }
    
    /**
     * Get Encounter by ID
     * 
     * @param string $encounterId Encounter ID from SATUSEHAT
     * @param int|null $doctorId Doctor ID for credentials (optional)
     * @return array|null Encounter data or null if not found
     */
    public static function getEncounter($encounterId, $doctorId = null) {
        try {
            error_log("📋 ===== GETTING ENCOUNTER =====");
            error_log("🆔 Encounter ID: " . $encounterId);
            
            // Get API client
            if ($doctorId) {
                $api = SatuSehatAPI::forDoctor($doctorId);
            } else {
                $api = new SatuSehatAPI();
            }
            
            if (!$api->isConfigured()) {
                error_log("❌ SatuSehat API not configured");
                return null;
            }
            
            $encounter = $api->get("/Encounter/" . $encounterId);
            
            if ($encounter && !isset($encounter['issue'])) {
                error_log("✅ Encounter retrieved successfully");
                error_log("   Status: " . ($encounter['status'] ?? 'unknown'));
                return $encounter;
            }
            
            error_log("❌ Failed to fetch encounter");
            if (isset($encounter['issue'])) {
                error_log("   Issues: " . json_encode($encounter['issue'], JSON_PRETTY_PRINT));
            }
            return null;
            
        } catch (Exception $ex) {
            error_log("❌ EXCEPTION in getEncounter: " . $ex->getMessage());
            return null;
        }
    }
    
    /**
     * Cancel Encounter
     * Convenience method to cancel an encounter
     * 
     * @param string $encounterId Encounter ID from SATUSEHAT
     * @param int|null $doctorId Doctor ID for credentials (optional)
     * @return bool True if successful, false if failed
     */
    public static function cancelEncounter($encounterId, $doctorId = null) {
        error_log("🚫 Cancelling encounter: $encounterId");
        return self::updateEncounterStatus($encounterId, 'cancelled', $doctorId);
    }
    
    /**
     * Finish Encounter
     * Convenience method to finish an encounter
     * 
     * @param string $encounterId Encounter ID from SATUSEHAT
     * @param int|null $doctorId Doctor ID for credentials (optional)
     * @return bool True if successful, false if failed
     */
    public static function finishEncounter($encounterId, $doctorId = null) {
        error_log("✅ Finishing encounter: $encounterId");
        return self::updateEncounterStatus($encounterId, 'finished', $doctorId);
    }
    
    /**
     * Start In-Progress Status
     * Convenience method to set encounter to in-progress
     * 
     * @param string $encounterId Encounter ID from SATUSEHAT
     * @param int|null $doctorId Doctor ID for credentials (optional)
     * @return bool True if successful, false if failed
     */
    public static function startInProgress($encounterId, $doctorId = null) {
        error_log("▶️ Setting encounter to in-progress: $encounterId");
        return self::updateEncounterStatus($encounterId, 'in-progress', $doctorId);
    }
}
?>