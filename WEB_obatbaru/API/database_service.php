<?php
// Supabase Config
$SUPABASE_URL = "https://brhaksondhloibpwtrdo.supabase.co";
$SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJyaGFrc29uZGhsb2licHd0cmRvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NjU0MjE0OSwiZXhwIjoyMDcyMTE4MTQ5fQ.lZd5xM790I9kocIVJtqqlilFBasmWcXvPFLpFPZgQV4";

function supabaseService($method, $table, $filter = '', $data = null) {
    global $supabaseUrl, $supabaseServiceKey;
    
    $url = "$supabaseUrl/rest/v1/$table";
    if ($filter) {
        $url .= "?$filter";
    }
    
    $ch = curl_init($url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_HTTPHEADER, [
        "apikey: $supabaseServiceKey",
        "Authorization: Bearer $supabaseServiceKey",
        "Content-Type: application/json",
        "Prefer: return=representation"
    ]);
    
    if ($method === 'POST') {
        curl_setopt($ch, CURLOPT_POST, true);
        curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
    } elseif ($method === 'PATCH') {
        curl_setopt($ch, CURLOPT_CUSTOMREQUEST, 'PATCH');
        curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
    } elseif ($method === 'DELETE') {
        curl_setopt($ch, CURLOPT_CUSTOMREQUEST, 'DELETE');
    }
    
    $response = curl_exec($ch);
    curl_close($ch);
    
    return json_decode($response, true);
}
?>