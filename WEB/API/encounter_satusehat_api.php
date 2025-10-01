<?php
require_once "ApiClient.php";

class EncounterSatusehatApi {
    public static function createEncounter($idSatusehatPasien, $namaPasien, $idSatusehatDokter, $namaDokter) {
        try {
            // Sekarang waktu di WIB (+07:00)
            $now = new DateTime("now", new DateTimeZone("Asia/Jakarta"));
            $periodStart = $now->format(DateTime::ATOM); // ISO 8601
            $endTime = (clone $now)->modify("+15 minutes");
            $periodEnd = $endTime->format(DateTime::ATOM);

            $orgId = ApiClient::getOrgId();

            $encounter = [
                "resourceType" => "Encounter",
                "status" => "arrived",
                "class" => [
                    "system" => "http://terminology.hl7.org/CodeSystem/v3-ActCode",
                    "code"   => "AMB",
                    "display"=> "ambulatory"
                ],
                "subject" => [
                    "reference" => "Patient/" . $idSatusehatPasien,
                    "display"   => $namaPasien
                ],
                "participant" => [[
                    "individual" => [
                        "reference" => "Practitioner/" . $idSatusehatDokter,
                        "display"   => $namaDokter
                    ]
                ]],
                "period" => [
                    "start" => $periodStart,
                    "end"   => $periodEnd
                ],
                "location" => [[
                    "location" => [
                        "reference" => "Location/b017aa54-f1df-4ec2-9d84-8823815d7228",
                        "display"   => "Ruang 1A, Poliklinik Bedah Rawat Jalan Terpadu, Lantai 2, Gedung G"
                    ]
                ]],
                "identifier" => [[
                    "system" => "http://sys-ids.kemkes.go.id/encounter/" . $orgId,
                    "value"  => "P20240001" // TODO: ganti dengan nomor encounter unik
                ]],
                "statusHistory" => [[
                    "status" => "arrived",
                    "period" => ["start" => $periodStart]
                ]],
                "serviceProvider" => [
                    "reference" => "Organization/" . $orgId
                ]
            ];

            echo "Creating Encounter: " . json_encode($encounter, JSON_PRETTY_PRINT) . "\n";

            $api = new ApiClient();
            $response = $api->post("/Encounter", $encounter);

            if (is_array($response)) {
                echo "Response Encounter: " . json_encode($response, JSON_PRETTY_PRINT) . "\n";
                return $response["id"] ?? null;
            }

            $json = json_decode($response, true);
            echo "Response Encounter: " . json_encode($json, JSON_PRETTY_PRINT) . "\n";

            return $json["id"] ?? null;
        } catch (Exception $ex) {
            echo "Error: " . $ex->getMessage();
            return null;
        }
    }
}
