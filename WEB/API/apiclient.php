<?php
class ApiClient {
    private $baseUrl = "https://api-satusehat-stg.dto.kemkes.go.id/fhir-r4/v1";
    private $authUrl = "https://api-satusehat-stg.dto.kemkes.go.id/oauth2/v1/accesstoken?grant_type=client_credentials";

    private $org_id = "7b4db35e-ea4e-4b46-b389-095472942d34";
    private $client_id = "rsqvpGQYeTGqbgpLHgWSVsbfcCADWJzsTVnUBMxlTXLYgAyt";
    private $client_secret = "w5m5AM61EIzJuSwlhSS8OOyuE1EaTrQXuFxp0uAKf02pcWAReXyTb96Ze2NTGNQ1";

    private $token = null;

    private function request($method, $url, $data = null) {
        if (!$this->token) {
            $this->getToken();
        }

        $ch = curl_init();
        curl_setopt($ch, CURLOPT_URL, $this->baseUrl . $url);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);

        $headers = [
            "Authorization: Bearer " . $this->token,
            "Content-Type: application/json"
        ];

        curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);

        switch (strtoupper($method)) {
            case "POST":
                curl_setopt($ch, CURLOPT_POST, true);
                if ($data) curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
                break;
            case "DELETE":
                curl_setopt($ch, CURLOPT_CUSTOMREQUEST, "DELETE");
                break;
            case "PATCH":
            case "PUT":
                curl_setopt($ch, CURLOPT_CUSTOMREQUEST, strtoupper($method));
                if ($data) curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
                break;
            default:
                break;
        }

        error_log("DEBUG URL: " . $this->baseUrl . $url);
        error_log("DEBUG METHOD: " . strtoupper($method));
        error_log("DEBUG HEADERS: " . json_encode($headers));
        if ($data) error_log("DEBUG BODY: " . json_encode($data));

        $response = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        
        if (curl_errno($ch)) {
            throw new Exception("cURL Error: " . curl_error($ch));
        }
        curl_close($ch);

        // ⭐ TAMBAHAN: Retry dengan token baru jika 401/403
        if ($httpCode == 401 || $httpCode == 403) {
            error_log("⚠️ Got HTTP $httpCode, refreshing token and retrying...");
            $this->token = null; // Reset token
            $this->getToken(); // Get new token
            
            // Retry request dengan token baru
            return $this->request($method, $url, $data);
        }

        return $response;
    }

    public function get($url, $params = []) {
        if (!empty($params)) {
            $queryParts = [];
            foreach ($params as $key => $value) {
                // Do NOT encode the pipe character (|)
                $queryParts[] = $key . '=' . str_replace('%7C', '|', urlencode($value));
            }
            $url .= '?' . implode('&', $queryParts);
        }
        return $this->request("GET", $url);
    }

    public function post($url, $data) {
        return $this->request("POST", $url, $data);
    }

    public function delete($url) {
        return $this->request("DELETE", $url);
    }

    public function getToken() {
        $ch = curl_init();

        curl_setopt($ch, CURLOPT_URL, $this->authUrl);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_POST, true);

        $postFields = http_build_query([
            "client_id" => $this->client_id,
            "client_secret" => $this->client_secret
        ]);

        curl_setopt($ch, CURLOPT_POSTFIELDS, $postFields);
        curl_setopt($ch, CURLOPT_HTTPHEADER, [
            "Content-Type: application/x-www-form-urlencoded"
        ]);

        $response = curl_exec($ch);
        if (curl_errno($ch)) {
            throw new Exception("cURL Error: " . curl_error($ch));
        }
        curl_close($ch);

        $json = json_decode($response, true);
        $this->token = $json["access_token"] ?? null;

        return $this->token;
    }

    public static function encodeUrl($regularPath, $encodedPath) {
        return $regularPath . urlencode($encodedPath);
    }

    public static function getOrgId() {
        return "7b4db35e-ea4e-4b46-b389-095472942d34";
    }
}
?>