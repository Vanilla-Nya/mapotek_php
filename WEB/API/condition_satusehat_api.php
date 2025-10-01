<?php
require_once "ApiClient.php";

class ConditionSatusehatApi {
    public static function createCondition($idSatusehatPasien, $idEncounterSatusehat, $kode, $deskripsi) {
        try {
            $condition = [
                "resourceType" => "Condition",
                "subject" => [
                    "reference" => "Patient/" . $idSatusehatPasien
                ],
                "encounter" => [
                    "reference" => "Encounter/" . $idEncounterSatusehat
                ],
                "code" => [
                    "coding" => [[
                        "system" => "http://hl7.org/fhir/sid/icd-10",
                        "code"   => $kode,
                        "display"=> $deskripsi
                    ]]
                ],
                "category" => [[
                    "coding" => [[
                        "system"  => "http://terminology.hl7.org/CodeSystem/condition-category",
                        "code"    => "encounter-diagnosis",
                        "display" => "Encounter Diagnosis"
                    ]]
                ]]
            ];

            $api = new ApiClient();
            $response = $api->post("/Condition", $condition);

            // Jika response dalam bentuk array (karena sudah json_decode di ApiClient)
            if (is_array($response)) {
                echo "Response Condition: " . json_encode($response, JSON_PRETTY_PRINT) . "\n";
                return isset($response["id"]);
            }

            // Jika ApiClient mengembalikan string JSON
            $json = json_decode($response, true);
            echo "Response Condition: " . json_encode($json, JSON_PRETTY_PRINT) . "\n";
            return isset($json["id"]);

        } catch (Exception $ex) {
            echo "Error: " . $ex->getMessage();
            return false;
        }
    }
}
