<?php
require_once __DIR__ . '/ApiClient.php';

$api = new ApiClient();

echo "🧪 Testing Create Encounter\n";
echo "━━━━━━━━━━━━━━━━━━━━━━━━\n\n";

// Get fresh token
$token = $api->getToken();
echo "✅ Token obtained: " . substr($token, 0, 20) . "...\n\n";

// Simple encounter payload
$encounter = [
    "resourceType" => "Encounter",
    "status" => "arrived",
    "class" => [
        "system" => "http://terminology.hl7.org/CodeSystem/v3-ActCode",
        "code" => "AMB",
        "display" => "ambulatory"
    ],
    "subject" => [
        "reference" => "Patient/P03647103112",
        "display" => "Test Patient"
    ],
    "participant" => [[
        "individual" => [
            "reference" => "Practitioner/10009880728",
            "display" => "Test Doctor"
        ]
    ]],
    "period" => [
        "start" => date('c')
    ],
    "serviceProvider" => [
        "reference" => "Organization/7b4db35e-ea4e-4b46-b389-095472942d34"
    ],
    "identifier" => [[
        "system" => "http://sys-ids.kemkes.go.id/encounter/7b4db35e-ea4e-4b46-b389-095472942d34",
        "value" => "TEST-" . time()
    ]]
];

echo "📤 Creating encounter...\n";
$response = $api->post("/Encounter", $encounter);

echo "📥 Response:\n";
echo $response . "\n\n";

$data = json_decode($response, true);

if (isset($data['id'])) {
    echo "✅ SUCCESS! Encounter ID: " . $data['id'] . "\n";
} else if (isset($data['issue'])) {
    echo "❌ ERROR:\n";
    foreach ($data['issue'] as $issue) {
        echo "   - " . ($issue['diagnostics'] ?? 'Unknown') . "\n";
    }
} else {
    echo "⚠️ Unexpected response\n";
}
?>