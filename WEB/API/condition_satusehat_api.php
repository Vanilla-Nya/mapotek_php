<?php
// API/satusehat/ConditionSatusehatApi.php
require_once __DIR__ . '/../config/satusehat_api.php';

class ConditionSatusehatApi {
    /**
     * Create Condition resource in SatuSehat
     * 
     * @param string $idDokter - Doctor ID to get credentials
     * @param string $idSatusehatPasien - Patient ID in SatuSehat
     * @param string $idEncounterSatusehat - Encounter ID in SatuSehat
     * @param string $kode - ICD-10 code
     * @param string $deskripsi - Condition description
     * @return array Response from SatuSehat
     */
    public static function createCondition($idDokter, $idSatusehatPasien, $idEncounterSatusehat, $kode, $deskripsi) {
        try {
            error_log("=== CREATE CONDITION ===");
            error_log("Doctor ID: $idDokter");
            error_log("Patient: $idSatusehatPasien");
            error_log("Encounter: $idEncounterSatusehat");
            error_log("ICD-10: $kode - $deskripsi");
            
            // Initialize SatuSehat API with doctor's credentials
            $api = SatuSehatAPI::forDoctor($idDokter);
            
            error_log("Environment: " . $api->getEnvironment());
            
            // Build Condition resource
            $condition = [
                "resourceType" => "Condition",
                "clinicalStatus" => [
                    "coding" => [[
                        "system" => "http://terminology.hl7.org/CodeSystem/condition-clinical",
                        "code" => "active",
                        "display" => "Active"
                    ]]
                ],
                "category" => [[
                    "coding" => [[
                        "system"  => "http://terminology.hl7.org/CodeSystem/condition-category",
                        "code"    => "encounter-diagnosis",
                        "display" => "Encounter Diagnosis"
                    ]]
                ]],
                "code" => [
                    "coding" => [[
                        "system" => "http://hl7.org/fhir/sid/icd-10",
                        "code"   => $kode,
                        "display"=> $deskripsi
                    ]]
                ],
                "subject" => [
                    "reference" => "Patient/" . $idSatusehatPasien
                ],
                "encounter" => [
                    "reference" => "Encounter/" . $idEncounterSatusehat
                ]
            ];

            // Send to SatuSehat
            $response = $api->post("/Condition", $condition);

            error_log("✅ Condition created: " . ($response['id'] ?? 'unknown'));
            error_log("Response: " . json_encode($response, JSON_PRETTY_PRINT));

            return [
                'success' => isset($response['id']),
                'data' => $response,
                'condition_id' => $response['id'] ?? null
            ];

        } catch (Exception $ex) {
            error_log("❌ Error creating Condition: " . $ex->getMessage());
            
            return [
                'success' => false,
                'error' => $ex->getMessage()
            ];
        }
    }
}
?>