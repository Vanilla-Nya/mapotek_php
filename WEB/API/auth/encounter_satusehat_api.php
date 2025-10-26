<?php
// auth/encounter_satusehat_api.php

require_once __DIR__ . '/../ApiClient.php';

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
            
            $api = new ApiClient();
            
            // Generate timestamps
            $now = new DateTime('now', new DateTimeZone('Asia/Jakarta'));
            $periodStart = $now->format(DateTime::ATOM);
            
            // Generate unique encounter number if not provided
            if (!$encounterNumber) {
                $encounterNumber = 'ENC-' . date('YmdHis') . '-' . substr(uniqid(), -6);
            }
            
            // Use default location if not provided
            if (!$locationId) {
                $locationId = 'b017aa54-f1df-4ec2-9d84-8823815d7228';
                $locationDisplay = 'Ruang 1A, Poliklinik Bedah Rawat Jalan Terpadu, Lantai 2, Gedung G';
            }
            
            $orgId = ApiClient::getOrgId();
            
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
            
            error_log("📤 Encounter Payload: " . json_encode($encounter, JSON_PRETTY_PRINT));
            
            // Create encounter using ApiClient
            $response = $api->post("/Encounter", $encounter);
            
            error_log("📥 SATUSEHAT Raw Response: " . $response);
            
            // Parse response
            $responseData = json_decode($response, true);
            
            if (!$responseData) {
                error_log("❌ Failed to parse JSON response");
                error_log("   Raw response: " . $response);
                return null;
            }
            
            error_log("📥 SATUSEHAT Parsed Response: " . json_encode($responseData, JSON_PRETTY_PRINT));
            
            // Check for errors
            if (isset($responseData['resourceType']) && $responseData['resourceType'] === 'OperationOutcome') {
                error_log("❌ SATUSEHAT returned OperationOutcome (error)");
                if (isset($responseData['issue'])) {
                    foreach ($responseData['issue'] as $issue) {
                        error_log("   - " . ($issue['severity'] ?? 'unknown') . ": " . ($issue['diagnostics'] ?? 'no message'));
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
                return $encounterId;
            }
            
            error_log("❌ No 'id' field in response");
            error_log("   Response keys: " . implode(', ', array_keys($responseData)));
            return null;
            
        } catch (Exception $ex) {
            error_log("❌ EXCEPTION in createEncounter: " . $ex->getMessage());
            error_log("   File: " . $ex->getFile() . " Line: " . $ex->getLine());
            error_log("   Stack trace: " . $ex->getTraceAsString());
            return null;
        }
    }
    
    /**
     * Update Encounter Status
     * 
     * @param string $encounterId Encounter ID from SATUSEHAT
     * @param string $newStatus New status (arrived, in-progress, finished, cancelled)
     * @return bool True if successful, false if failed
     */
    public static function updateEncounterStatus($encounterId, $newStatus = 'finished') {
        try {
            error_log("🔄 ===== UPDATING ENCOUNTER STATUS =====");
            error_log("🆔 Encounter ID: " . $encounterId);
            error_log("📊 New Status: " . $newStatus);
            
            $api = new ApiClient();
            
            // First, get the existing encounter
            $response = $api->get("/Encounter/" . $encounterId);
            $encounter = json_decode($response, true);
            
            if (!$encounter || isset($encounter['issue'])) {
                error_log("❌ Failed to fetch encounter");
                error_log("   Response: " . json_encode($encounter, JSON_PRETTY_PRINT));
                return false;
            }
            
            error_log("📥 Current Encounter: " . json_encode($encounter, JSON_PRETTY_PRINT));
            
            // Update status
            $encounter['status'] = $newStatus;
            
            // Add status history
            if (!isset($encounter['statusHistory'])) {
                $encounter['statusHistory'] = [];
            }
            
            $now = new DateTime('now', new DateTimeZone('Asia/Jakarta'));
            $encounter['statusHistory'][] = [
                'status' => $newStatus,
                'period' => ['start' => $now->format(DateTime::ATOM)]
            ];
            
            // Update period end time if finishing
            if ($newStatus === 'finished' && isset($encounter['period'])) {
                $encounter['period']['end'] = $now->format(DateTime::ATOM);
            }
            
            error_log("📤 Updated Encounter Payload: " . json_encode($encounter, JSON_PRETTY_PRINT));
            
            // Use PUT method to update (need to implement in ApiClient)
            $updateResponse = $api->post("/Encounter/" . $encounterId, $encounter);
            $responseData = json_decode($updateResponse, true);
            
            error_log("📥 Update Response: " . json_encode($responseData, JSON_PRETTY_PRINT));
            
            if (isset($responseData['id'])) {
                error_log("✅ Encounter status updated successfully");
                return true;
            }
            
            error_log("❌ Failed to update encounter status");
            return false;
            
        } catch (Exception $ex) {
            error_log("❌ EXCEPTION in updateEncounterStatus: " . $ex->getMessage());
            error_log("   Stack trace: " . $ex->getTraceAsString());
            return false;
        }
    }
    
    /**
     * Search Patient by NIK in SATUSEHAT
     * 
     * @param string $nik Patient's NIK (National ID)
     * @return array Result with patient info or error
     */
    public static function searchPatientByNIK($nik) {
        try {
            error_log("🔍 Searching patient by NIK: " . $nik);
            
            $api = new ApiClient();
            
            $response = $api->get("/Patient", [
                'identifier' => 'https://fhir.kemkes.go.id/id/nik|' . $nik
            ]);
            
            error_log("📥 Patient Search Response: " . $response);
            
            $responseData = json_decode($response, true);
            
            if (!$responseData) {
                error_log("❌ Failed to parse JSON response");
                return [
                    'success' => false,
                    'error' => 'Invalid JSON response'
                ];
            }
            
            // Check if patient found
            if (isset($responseData['entry']) && count($responseData['entry']) > 0) {
                $patient = $responseData['entry'][0]['resource'];
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
     * @return array|null Encounter data or null if not found
     */
    public static function getEncounter($encounterId) {
        try {
            error_log("📋 Getting encounter: " . $encounterId);
            
            $api = new ApiClient();
            
            $response = $api->get("/Encounter/" . $encounterId);
            $encounter = json_decode($response, true);
            
            if ($encounter && !isset($encounter['issue'])) {
                error_log("✅ Encounter retrieved successfully");
                return $encounter;
            }
            
            error_log("❌ Failed to fetch encounter");
            error_log("   Response: " . json_encode($encounter, JSON_PRETTY_PRINT));
            return null;
            
        } catch (Exception $ex) {
            error_log("❌ EXCEPTION in getEncounter: " . $ex->getMessage());
            return null;
        }
    }
}
?>