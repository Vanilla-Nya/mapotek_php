<?php
// Supabase Config
$SUPABASE_URL = "https://brhaksondhloibpwtrdo.supabase.co";
$SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJyaGFrc29uZGhsb2licHd0cmRvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY1NDIxNDksImV4cCI6MjA3MjExODE0OX0.sHs9TbfPP38A5ikNFoZlOBJ67T1wtDiFMepEJn9ctfg";

function supabase($method, $table, $params = "", $data = null, $token = null) {
    global $SUPABASE_URL, $SUPABASE_KEY;

    $url = $SUPABASE_URL . "/rest/v1/" . $table;
    if ($params) {
        $url .= "?" . $params;
    }

    $ch = curl_init($url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);

    $headers = [
        "apikey: $SUPABASE_KEY",
        "Content-Type: application/json"
    ];
    
    // Use access token if provided, otherwise use API key
    if ($token) {
        $headers[] = "Authorization: Bearer $token";
    } else {
        $headers[] = "Authorization: Bearer $SUPABASE_KEY";
    }

    curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);

    // Method
    switch (strtoupper($method)) {
        case "POST":
            curl_setopt($ch, CURLOPT_POST, true);
            if ($data) curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
            curl_setopt($ch, CURLOPT_HTTPHEADER, array_merge($headers, ["Prefer: return=representation"]));
            break;
        case "PATCH":
        case "PUT":
        case "DELETE":
            curl_setopt($ch, CURLOPT_CUSTOMREQUEST, $method);
            if ($data) curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
            break;
        default: // GET
            break;
    }

    $response = curl_exec($ch);
    curl_close($ch);

    return json_decode($response, true);
}

function console_log($data) {
    $json = json_encode($data, JSON_PRETTY_PRINT);
    echo "<script>console.log($json);</script>";
}
?>