<?php
// API/satusehat/ObservationSatusehatApi.php
require_once __DIR__ . '/../config/satusehat_api.php';

class ObservationSatusehatApi {
    /**
     * Create a single vital sign observation
     * 
     * @param string $idDokter - Doctor ID to get credentials
     * @param string $idSatusehatPasien - Patient ID
     * @param string $idEncounterSatusehat - Encounter ID
     * @param string $idSatusehatDokter - Practitioner ID in SatuSehat
     * @param string $loincCode - LOINC code for the observation
     * @param string $display - Display name
     * @param float $value - Measured value
     * @param string $unit - Unit of measurement
     * @param string $ucumCode - UCUM code for unit (e.g., "Cel" for Celsius)
     * @return array Response from SatuSehat
     */
    public static function createObservation($idDokter, $idSatusehatPasien, $idEncounterSatusehat, $idSatusehatDokter, $loincCode, $display, $value, $unit, $ucumCode = null) {
        try {
            error_log("=== CREATE OBSERVATION ===");
            error_log("$display: $value $unit");
            
            // Initialize API with doctor's credentials
            $api = SatuSehatAPI::forDoctor($idDokter);
            
            // Default UCUM code if not provided
            if ($ucumCode === null) {
                $ucumCode = $unit;
            }
            
            $observation = [
                "resourceType" => "Observation",
                "status" => "final",
                "category" => [[
                    "coding" => [[
                        "system" => "http://terminology.hl7.org/CodeSystem/observation-category",
                        "code"   => "vital-signs",
                        "display"=> "Vital Signs"
                    ]]
                ]],
                "code" => [
                    "coding" => [[
                        "system" => "http://loinc.org",
                        "code"   => $loincCode,
                        "display"=> $display
                    ]]
                ],
                "subject" => [
                    "reference" => "Patient/" . $idSatusehatPasien
                ],
                "encounter" => [
                    "reference" => "Encounter/" . $idEncounterSatusehat
                ],
                "performer" => [[
                    "reference" => "Practitioner/" . $idSatusehatDokter
                ]],
                "effectiveDateTime" => gmdate("c"),
                "issued" => gmdate("c"),
                "valueQuantity" => [
                    "value" => (float)$value,
                    "unit"  => $unit,
                    "system"=> "http://unitsofmeasure.org",
                    "code"  => $ucumCode
                ]
            ];

            $response = $api->post("/Observation", $observation);
            
            error_log("✅ Observation created: " . ($response['id'] ?? 'unknown'));

            return [
                'success' => isset($response['id']),
                'data' => $response,
                'observation_id' => $response['id'] ?? null
            ];

        } catch (Exception $ex) {
            error_log("❌ Error creating Observation: " . $ex->getMessage());
            
            return [
                'success' => false,
                'error' => $ex->getMessage()
            ];
        }
    }

    /**
     * Create blood pressure observation (systolic + diastolic)
     * 
     * @param string $idDokter - Doctor ID
     * @param string $idSatusehatPasien - Patient ID
     * @param string $idEncounterSatusehat - Encounter ID
     * @param string $idSatusehatDokter - Practitioner ID
     * @param float $systolicValue - Systolic BP value
     * @param float $diastolicValue - Diastolic BP value
     * @return array Response from SatuSehat
     */
    public static function createBloodPressureObservation($idDokter, $idSatusehatPasien, $idEncounterSatusehat, $idSatusehatDokter, $systolicValue, $diastolicValue) {
        try {
            error_log("=== CREATE BLOOD PRESSURE OBSERVATION ===");
            error_log("BP: $systolicValue/$diastolicValue mmHg");
            
            // Initialize API
            $api = SatuSehatAPI::forDoctor($idDokter);
            
            $bpObservation = [
                "resourceType" => "Observation",
                "status" => "final",
                "category" => [[
                    "coding" => [[
                        "system" => "http://terminology.hl7.org/CodeSystem/observation-category",
                        "code"   => "vital-signs",
                        "display"=> "Vital Signs"
                    ]]
                ]],
                "code" => [
                    "coding" => [[
                        "system" => "http://loinc.org",
                        "code"   => "85354-9",
                        "display"=> "Blood pressure panel"
                    ]]
                ],
                "subject" => [
                    "reference" => "Patient/" . $idSatusehatPasien
                ],
                "encounter" => [
                    "reference" => "Encounter/" . $idEncounterSatusehat
                ],
                "performer" => [[
                    "reference" => "Practitioner/" . $idSatusehatDokter
                ]],
                "effectiveDateTime" => gmdate("c"),
                "component" => [
                    [
                        "code" => [
                            "coding" => [[
                                "system" => "http://loinc.org",
                                "code"   => "8480-6",
                                "display"=> "Systolic blood pressure"
                            ]]
                        ],
                        "valueQuantity" => [
                            "value" => (float)$systolicValue,
                            "unit"  => "mmHg",
                            "system"=> "http://unitsofmeasure.org",
                            "code"  => "mm[Hg]"
                        ]
                    ],
                    [
                        "code" => [
                            "coding" => [[
                                "system" => "http://loinc.org",
                                "code"   => "8462-4",
                                "display"=> "Diastolic blood pressure"
                            ]]
                        ],
                        "valueQuantity" => [
                            "value" => (float)$diastolicValue,
                            "unit"  => "mmHg",
                            "system"=> "http://unitsofmeasure.org",
                            "code"  => "mm[Hg]"
                        ]
                    ]
                ]
            ];

            $response = $api->post("/Observation", $bpObservation);
            
            error_log("✅ Blood Pressure Observation created: " . ($response['id'] ?? 'unknown'));

            return [
                'success' => isset($response['id']),
                'data' => $response,
                'observation_id' => $response['id'] ?? null
            ];

        } catch (Exception $ex) {
            error_log("❌ Error creating BP Observation: " . $ex->getMessage());
            
            return [
                'success' => false,
                'error' => $ex->getMessage()
            ];
        }
    }
}
?>