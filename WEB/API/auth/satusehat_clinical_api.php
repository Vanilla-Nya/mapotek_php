<?php
// auth/satusehat_clinical_api.php

require_once __DIR__ . '/../database.php';
require_once __DIR__ . '/../config/satusehat_api.php';

class SatuSehatClinicalAPI {
    
    /**
     * Send Condition (ICDX Diagnosis) to SatuSehat
     * 
     * @param string $encounterId Encounter ID
     * @param string $patientId Patient SatuSehat ID
     * @param string $practitionerId Practitioner SatuSehat ID
     * @param string $icdCode ICD-10 code (e.g., "A00.0")
     * @param string $icdDisplay ICD-10 display name
     * @param int|null $doctorId Doctor database ID for API credentials
     * @return string|null Condition ID if successful
     */
    public static function sendCondition(
        $encounterId,
        $patientId,
        $practitionerId,
        $icdCode,
        $icdDisplay,
        $doctorId = null
    ) {
        try {
            error_log("🔬 ===== SENDING CONDITION (ICDX) =====");
            error_log("📋 Encounter: $encounterId");
            error_log("👤 Patient: $patientId");
            error_log("👨‍⚕️ Practitioner: $practitionerId");
            error_log("🏷️ ICD Code: $icdCode - $icdDisplay");
            
            // Get API client
            $api = $doctorId ? SatuSehatAPI::forDoctor($doctorId) : new SatuSehatAPI();
            
            if (!$api->isConfigured()) {
                error_log("❌ SatuSehat API not configured");
                return null;
            }
            
            $now = new DateTime('now', new DateTimeZone('Asia/Jakarta'));
            $recordedDate = $now->format(DateTime::ATOM);
            
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
                        "system" => "http://terminology.hl7.org/CodeSystem/condition-category",
                        "code" => "encounter-diagnosis",
                        "display" => "Encounter Diagnosis"
                    ]]
                ]],
                "code" => [
                    "coding" => [[
                        "system" => "http://hl7.org/fhir/sid/icd-10",
                        "code" => $icdCode,
                        "display" => $icdDisplay
                    ]]
                ],
                "subject" => [
                    "reference" => "Patient/" . $patientId
                ],
                "encounter" => [
                    "reference" => "Encounter/" . $encounterId
                ],
                "recordedDate" => $recordedDate
            ];
            
            // Add practitioner who made the diagnosis
            if ($practitionerId) {
                $condition["recorder"] = [
                    "reference" => "Practitioner/" . $practitionerId
                ];
            }
            
            error_log("📤 Condition Payload:");
            error_log(json_encode($condition, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES));
            
            // Send to SatuSehat
            $response = $api->post('/Condition', $condition);
            
            error_log("📥 SatuSehat Response:");
            error_log(json_encode($response, JSON_PRETTY_PRINT));
            
            // Check for errors
            if (isset($response['resourceType']) && $response['resourceType'] === 'OperationOutcome') {
                error_log("❌ Failed to send Condition");
                if (isset($response['issue'])) {
                    foreach ($response['issue'] as $issue) {
                        error_log("   - " . ($issue['severity'] ?? '') . ": " . ($issue['diagnostics'] ?? ''));
                    }
                }
                return null;
            }
            
            if (isset($response['id'])) {
                $conditionId = $response['id'];
                error_log("✅ Condition created: $conditionId");
                return $conditionId;
            }
            
            error_log("❌ No ID in response");
            return null;
            
        } catch (Exception $e) {
            error_log("❌ EXCEPTION in sendCondition: " . $e->getMessage());
            return null;
        }
    }
    
    /**
     * Send Procedure (ICDIX) to SatuSehat
     * 
     * @param string $encounterId Encounter ID
     * @param string $patientId Patient SatuSehat ID
     * @param string $practitionerId Practitioner SatuSehat ID
     * @param string $icd9Code ICD-9-CM code
     * @param string $icd9Display ICD-9 display name
     * @param int|null $doctorId Doctor database ID
     * @return string|null Procedure ID if successful
     */
    public static function sendProcedure(
        $encounterId,
        $patientId,
        $practitionerId,
        $icd9Code,
        $icd9Display,
        $doctorId = null
    ) {
        try {
            error_log("⚕️ ===== SENDING PROCEDURE (ICDIX) =====");
            error_log("📋 Encounter: $encounterId");
            error_log("👤 Patient: $patientId");
            error_log("👨‍⚕️ Practitioner: $practitionerId");
            error_log("🏷️ ICD-9 Code: $icd9Code - $icd9Display");
            
            $api = $doctorId ? SatuSehatAPI::forDoctor($doctorId) : new SatuSehatAPI();
            
            if (!$api->isConfigured()) {
                error_log("❌ SatuSehat API not configured");
                return null;
            }
            
            $now = new DateTime('now', new DateTimeZone('Asia/Jakarta'));
            $performedDateTime = $now->format(DateTime::ATOM);
            
            // Build Procedure resource
            $procedure = [
                "resourceType" => "Procedure",
                "status" => "completed",
                "category" => [
                    "coding" => [[
                        "system" => "http://snomed.info/sct",
                        "code" => "103693007",
                        "display" => "Diagnostic procedure"
                    ]]
                ],
                "code" => [
                    "coding" => [[
                        "system" => "http://hl7.org/fhir/sid/icd-9-cm",
                        "code" => $icd9Code,
                        "display" => $icd9Display
                    ]]
                ],
                "subject" => [
                    "reference" => "Patient/" . $patientId
                ],
                "encounter" => [
                    "reference" => "Encounter/" . $encounterId
                ],
                "performedDateTime" => $performedDateTime
            ];
            
            // Add performer (practitioner)
            if ($practitionerId) {
                $procedure["performer"] = [[
                    "actor" => [
                        "reference" => "Practitioner/" . $practitionerId
                    ]
                ]];
            }
            
            error_log("📤 Procedure Payload:");
            error_log(json_encode($procedure, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES));
            
            $response = $api->post('/Procedure', $procedure);
            
            error_log("📥 SatuSehat Response:");
            error_log(json_encode($response, JSON_PRETTY_PRINT));
            
            if (isset($response['resourceType']) && $response['resourceType'] === 'OperationOutcome') {
                error_log("❌ Failed to send Procedure");
                if (isset($response['issue'])) {
                    foreach ($response['issue'] as $issue) {
                        error_log("   - " . ($issue['severity'] ?? '') . ": " . ($issue['diagnostics'] ?? ''));
                    }
                }
                return null;
            }
            
            if (isset($response['id'])) {
                $procedureId = $response['id'];
                error_log("✅ Procedure created: $procedureId");
                return $procedureId;
            }
            
            error_log("❌ No ID in response");
            return null;
            
        } catch (Exception $e) {
            error_log("❌ EXCEPTION in sendProcedure: " . $e->getMessage());
            return null;
        }
    }
    
    /**
     * Send Observation (Vital Signs) to SatuSehat
     * 
     * @param string $encounterId Encounter ID
     * @param string $patientId Patient SatuSehat ID
     * @param string $practitionerId Practitioner SatuSehat ID
     * @param string $loincCode LOINC code (e.g., "29463-7" for body weight)
     * @param string $loincDisplay LOINC display name
     * @param mixed $value Numeric value
     * @param string $unit Unit of measurement
     * @param int|null $doctorId Doctor database ID
     * @return string|null Observation ID if successful
     */
    public static function sendObservation(
        $encounterId,
        $patientId,
        $practitionerId,
        $loincCode,
        $loincDisplay,
        $value,
        $unit,
        $doctorId = null
    ) {
        try {
            error_log("💓 ===== SENDING OBSERVATION (VITAL SIGN) =====");
            error_log("📋 Encounter: $encounterId");
            error_log("🏷️ LOINC: $loincCode - $loincDisplay");
            error_log("📊 Value: $value $unit");
            
            $api = $doctorId ? SatuSehatAPI::forDoctor($doctorId) : new SatuSehatAPI();
            
            if (!$api->isConfigured()) {
                error_log("❌ SatuSehat API not configured");
                return null;
            }
            
            $now = new DateTime('now', new DateTimeZone('Asia/Jakarta'));
            $effectiveDateTime = $now->format(DateTime::ATOM);
            
            // Build Observation resource
            $observation = [
                "resourceType" => "Observation",
                "status" => "final",
                "category" => [[
                    "coding" => [[
                        "system" => "http://terminology.hl7.org/CodeSystem/observation-category",
                        "code" => "vital-signs",
                        "display" => "Vital Signs"
                    ]]
                ]],
                "code" => [
                    "coding" => [[
                        "system" => "http://loinc.org",
                        "code" => $loincCode,
                        "display" => $loincDisplay
                    ]]
                ],
                "subject" => [
                    "reference" => "Patient/" . $patientId
                ],
                "encounter" => [
                    "reference" => "Encounter/" . $encounterId
                ],
                "effectiveDateTime" => $effectiveDateTime,
                "issued" => $effectiveDateTime
            ];
            
            // Add value with unit
            if (is_numeric($value)) {
                $observation["valueQuantity"] = [
                    "value" => floatval($value),
                    "unit" => $unit,
                    "system" => "http://unitsofmeasure.org",
                    "code" => $unit
                ];
            } else {
                // For non-numeric values like blood pressure "120/80"
                $observation["valueString"] = strval($value);
            }
            
            // Add performer
            if ($practitionerId) {
                $observation["performer"] = [[
                    "reference" => "Practitioner/" . $practitionerId
                ]];
            }
            
            error_log("📤 Observation Payload:");
            error_log(json_encode($observation, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES));
            
            $response = $api->post('/Observation', $observation);
            
            error_log("📥 SatuSehat Response:");
            error_log(json_encode($response, JSON_PRETTY_PRINT));
            
            if (isset($response['resourceType']) && $response['resourceType'] === 'OperationOutcome') {
                error_log("❌ Failed to send Observation");
                if (isset($response['issue'])) {
                    foreach ($response['issue'] as $issue) {
                        error_log("   - " . ($issue['severity'] ?? '') . ": " . ($issue['diagnostics'] ?? ''));
                    }
                }
                return null;
            }
            
            if (isset($response['id'])) {
                $observationId = $response['id'];
                error_log("✅ Observation created: $observationId");
                return $observationId;
            }
            
            error_log("❌ No ID in response");
            return null;
            
        } catch (Exception $e) {
            error_log("❌ EXCEPTION in sendObservation: " . $e->getMessage());
            return null;
        }
    }
    
    /**
     * Send AllergyIntolerance to SatuSehat
     * 
     * @param string $patientId Patient SatuSehat ID
     * @param string $category Category: food, medication, environment, biologic
     * @param string $substance Substance description
     * @param int|null $doctorId Doctor database ID
     * @return string|null AllergyIntolerance ID if successful
     */
    public static function sendAllergy(
        $patientId,
        $category,
        $substance,
        $doctorId = null
    ) {
        try {
            error_log("🔔 ===== SENDING ALLERGY =====");
            error_log("👤 Patient: $patientId");
            error_log("📋 Category: $category");
            error_log("🏷️ Substance: $substance");
            
            $api = $doctorId ? SatuSehatAPI::forDoctor($doctorId) : new SatuSehatAPI();
            
            if (!$api->isConfigured()) {
                error_log("❌ SatuSehat API not configured");
                return null;
            }
            
            $now = new DateTime('now', new DateTimeZone('Asia/Jakarta'));
            $recordedDate = $now->format(DateTime::ATOM);
            
            // Build AllergyIntolerance resource
            $allergy = [
                "resourceType" => "AllergyIntolerance",
                "clinicalStatus" => [
                    "coding" => [[
                        "system" => "http://terminology.hl7.org/CodeSystem/allergyintolerance-clinical",
                        "code" => "active",
                        "display" => "Active"
                    ]]
                ],
                "category" => [$category],
                "code" => [
                    "text" => $substance
                ],
                "patient" => [
                    "reference" => "Patient/" . $patientId
                ],
                "recordedDate" => $recordedDate
            ];
            
            error_log("📤 AllergyIntolerance Payload:");
            error_log(json_encode($allergy, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES));
            
            $response = $api->post('/AllergyIntolerance', $allergy);
            
            error_log("📥 SatuSehat Response:");
            error_log(json_encode($response, JSON_PRETTY_PRINT));
            
            if (isset($response['resourceType']) && $response['resourceType'] === 'OperationOutcome') {
                error_log("❌ Failed to send AllergyIntolerance");
                return null;
            }
            
            if (isset($response['id'])) {
                error_log("✅ AllergyIntolerance created: " . $response['id']);
                return $response['id'];
            }
            
            return null;
            
        } catch (Exception $e) {
            error_log("❌ EXCEPTION in sendAllergy: " . $e->getMessage());
            return null;
        }
    }
}
?>