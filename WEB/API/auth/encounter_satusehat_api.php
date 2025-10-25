<?php
// auth/encounter_satusehat_api.php

// Adjust this path to where your SatuSehatAPI class is located
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
            $api = new SatuSehatAPI();
            
            // Generate timestamps
            $now = new DateTime('now', new DateTimeZone('Asia/Jakarta'));
            $periodStart = $now->format(DateTime::ATOM);
            $endTime = (clone $now)->modify("+15 minutes");
            $periodEnd = $endTime->format(DateTime::ATOM);
            
            // Generate unique encounter number if not provided
            if (!$encounterNumber) {
                $encounterNumber = 'ENC-' . date('YmdHis') . '-' . substr(uniqid(), -6);
            }
            
            // Use default location if not provided
            if (!$locationId) {
                $locationId = 'b017aa54-f1df-4ec2-9d84-8823815d7228';
                $locationDisplay = 'Ruang 1A, Poliklinik Bedah Rawat Jalan Terpadu, Lantai 2, Gedung G';
            }
            
            $orgId = SatuSehatAPI::getOrgId();
            
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
                    "individual" => [
                        "reference" => "Practitioner/" . $idSatusehatDokter,
                        "display" => $namaDokter
                    ]
                ]],
                "period" => [
                    "start" => $periodStart,
                    "end" => $periodEnd
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
            
            error_log("🏥 Creating SATUSEHAT Encounter:");
            error_log("   Patient: $namaPasien (ID: $idSatusehatPasien)");
            error_log("   Doctor: $namaDokter (ID: $idSatusehatDokter)");
            error_log("   Encounter #: $encounterNumber");
            error_log("   Payload: " . json_encode($encounter, JSON_PRETTY_PRINT));
            
            // Create encounter using your SatuSehatAPI class
            $response = $api->post("/Encounter", $encounter);
            
            error_log("✅ SATUSEHAT Response: " . json_encode($response, JSON_PRETTY_PRINT));
            
            if (isset($response['id'])) {
                error_log("✅ Encounter created successfully: " . $response['id']);
                return $response['id'];
            }
            
            // Check if response is an error
            if (isset($response['issue']) || isset($response['error'])) {
                error_log("❌ SATUSEHAT Error: " . json_encode($response, JSON_PRETTY_PRINT));
                return null;
            }
            
            error_log("⚠️ Unexpected response format: " . json_encode($response, JSON_PRETTY_PRINT));
            return null;
            
        } catch (Exception $ex) {
            error_log("❌ Exception in createEncounter: " . $ex->getMessage());
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
            $api = new SatuSehatAPI();
            
            // First, get the existing encounter
            $encounter = $api->get("/Encounter/" . $encounterId);
            
            if (!$encounter || isset($encounter['issue'])) {
                error_log("❌ Failed to fetch encounter: " . json_encode($encounter, JSON_PRETTY_PRINT));
                return false;
            }
            
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
            if ($newStatus === 'finished') {
                $encounter['period']['end'] = $now->format(DateTime::ATOM);
            }
            
            error_log("🔄 Updating Encounter $encounterId to status: $newStatus");
            
            // Use PUT method to update
            $response = $api->request("PUT", "/Encounter/" . $encounterId, $encounter);
            
            error_log("🔄 Update Response: " . json_encode($response, JSON_PRETTY_PRINT));
            
            if (isset($response['id'])) {
                error_log("✅ Encounter status updated successfully");
                return true;
            }
            
            error_log("❌ Failed to update encounter status");
            return false;
            
        } catch (Exception $ex) {
            error_log("❌ Exception in updateEncounterStatus: " . $ex->getMessage());
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
            $api = new SatuSehatAPI();
            
            $url = "/Patient?identifier=" . urlencode("https://fhir.kemkes.go.id/id/nik|" . $nik);
            
            error_log("🔍 Searching patient by NIK: $nik");
            
            $response = $api->get($url);
            
            error_log("🔍 Patient Search Response: " . json_encode($response, JSON_PRETTY_PRINT));
            
            // Check if patient found
            if (isset($response['entry']) && count($response['entry']) > 0) {
                $patient = $response['entry'][0]['resource'];
                $satusehatId = $patient['id'] ?? null;
                
                return [
                    'success' => true,
                    'found' => true,
                    'satusehat_id' => $satusehatId,
                    'data' => $patient
                ];
            }
            
            return [
                'success' => true,
                'found' => false,
                'message' => 'Patient not found in SATUSEHAT'
            ];
            
        } catch (Exception $ex) {
            error_log("❌ Exception in searchPatientByNIK: " . $ex->getMessage());
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
            $api = new SatuSehatAPI();
            
            $encounter = $api->get("/Encounter/" . $encounterId);
            
            if ($encounter && !isset($encounter['issue'])) {
                return $encounter;
            }
            
            error_log("❌ Failed to fetch encounter: " . json_encode($encounter, JSON_PRETTY_PRINT));
            return null;
            
        } catch (Exception $ex) {
            error_log("❌ Exception in getEncounter: " . $ex->getMessage());
            return null;
        }
    }
}
?>