<?php
class ProcedureSatusehatApi {
    private static function post($endpoint, $data) {
        $url = "https://api-satusehat.kemkes.go.id/fhir-r4/v1" . $endpoint;

        $token = ApiClient::getAccessToken(); // ambil token dari ApiClient.php

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

    public static function createProcedure($idSatusehatPasien, $idEncounterSatusehat, $kode, $deskripsi) {
        $procedure = [
            "resourceType" => "Procedure",
            "status" => "completed",
            "subject" => [
                "reference" => "Patient/" . $idSatusehatPasien
            ],
            "encounter" => [
                "reference" => "Encounter/" . $idEncounterSatusehat
            ],
            "code" => [
                "coding" => [[
                    "system" => "http://hl7.org/fhir/sid/icd-9-cm",
                    "code"   => $kode,
                    "display"=> $deskripsi
                ]]
            ]
        ];

        // kirim request
        $json = self::post("/Procedure", $procedure);

        // print response biar gampang debug
        echo "Response Procedure: " . json_encode($json, JSON_PRETTY_PRINT) . PHP_EOL;

        // return true kalau ada id di responsenya
        return isset($json["id"]);
    }
}
