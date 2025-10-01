<?php
class ObservationSatusehatApi {
    private static function post($endpoint, $data) {
        $url = "https://api-satusehat.kemkes.go.id/fhir-r4/v1" . $endpoint;

        // ambil token akses, misal dari class ApiClient
        $token = ApiClient::getAccessToken();

        $ch = curl_init($url);
        curl_setopt($ch, CURLOPT_HTTPHEADER, [
            "Authorization: Bearer " . $token,
            "Content-Type: application/json"
        ]);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_POST, true);
        curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));

        $response = curl_exec($ch);
        if (curl_errno($ch)) {
            throw new Exception(curl_error($ch));
        }
        curl_close($ch);

        return json_decode($response, true);
    }

    public static function createObservation($idSatusehatPasien, $idEncounterSatusehat, $loincCode, $display, $value, $unit, $idSatusehatDokter) {
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
            "subject" => ["reference" => "Patient/" . $idSatusehatPasien],
            "encounter" => ["reference" => "Encounter/" . $idEncounterSatusehat],
            "performer" => [["reference" => "Practitioner/" . $idSatusehatDokter]],
            "effectiveDateTime" => gmdate("c"), // ISO 8601
            "issued" => gmdate("c"),
            "valueQuantity" => [
                "value" => (float)$value,
                "unit"  => $unit,
                "system"=> "http://unitsofmeasure.org",
                "code"  => "Cel" // contoh: untuk suhu
            ]
        ];

        $json = self::post("/Observation", $observation);
        print_r($json);
        return isset($json["id"]);
    }

    public static function createBloodPressureObservation($idSatusehatPasien, $idEncounterSatusehat, $idSatusehatDokter, $systolicValue, $diastolicValue) {
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
            "subject" => ["reference" => "Patient/" . $idSatusehatPasien],
            "encounter" => ["reference" => "Encounter/" . $idEncounterSatusehat],
            "performer" => [["reference" => "Practitioner/" . $idSatusehatDokter]],
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
                        "code"  => "mmHg"
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
                        "code"  => "mmHg"
                    ]
                ]
            ]
        ];

        $json = self::post("/Observation", $bpObservation);
        print_r($json);
        return isset($json["id"]);
    }
}
