<?php
// config/satusehat_api.php - Updated with dynamic credentials

class SatuSehatAPI {
    private $baseUrl = "https://api-satusehat-stg.dto.kemkes.go.id/fhir-r4/v1";
    private $authUrl = "https://api-satusehat-stg.dto.kemkes.go.id/oauth2/v1/accesstoken?grant_type=client_credentials";

    private $org_id;
    private $client_id;
    private $client_secret;
    private $token = null;
    private $dokterId;

    /**
     * Constructor - Initialize with doctor credentials from database
     * @param string $dokterId - Doctor ID to fetch credentials
     */
    public function __construct($dokterId = null) {
        $this->dokterId = $dokterId;
        
        if ($dokterId) {
            $this->loadCredentialsFromDatabase($dokterId);
        }
    }

    /**
     * Load credentials from database for specific doctor
     */
    private function loadCredentialsFromDatabase($dokterId) {
        require_once __DIR__ . '/../config/supabase.php';
        
        $result = supabase('GET', 'dokter', "id_dokter=eq.$dokterId&select=satusehat_org_id,satusehat_client_id,satusehat_client_secret,satusehat_enabled");
        
        if (!empty($result) && !isset($result['code'])) {
            $doctor = $result[0];
            
            // Check if SatuSehat is enabled
            if (!($doctor['satusehat_enabled'] ?? false)) {
                throw new Exception("SatuSehat API tidak diaktifkan untuk dokter ini");
            }
            
            // Validate credentials exist
            if (empty($doctor['satusehat_org_id']) || 
                empty($doctor['satusehat_client_id']) || 
                empty($doctor['satusehat_client_secret'])) {
                throw new Exception("Konfigurasi SatuSehat tidak lengkap. Silakan lengkapi di halaman profil.");
            }
            
            $this->org_id = $doctor['satusehat_org_id'];
            $this->client_id = $doctor['satusehat_client_id'];
            $this->client_secret = $doctor['satusehat_client_secret'];
        } else {
            throw new Exception("Gagal mengambil konfigurasi SatuSehat dari database");
        }
    }

    /**
     * Set credentials manually (useful for testing or admin operations)
     */
    public function setCredentials($org_id, $client_id, $client_secret) {
        $this->org_id = $org_id;
        $this->client_id = $client_id;
        $this->client_secret = $client_secret;
    }

    /**
     * Generic request method (public so it can be used for PUT requests)
     */
    public function request($method, $url, $data = null) {
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
            default: // GET
                break;
        }

        $response = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        
        if (curl_errno($ch)) {
            throw new Exception("cURL Error: " . curl_error($ch));
        }
        curl_close($ch);

        $result = json_decode($response, true);
        
        // Check for API errors
        if ($httpCode >= 400) {
            $errorMsg = $result['issue'][0]['diagnostics'] ?? $result['error_description'] ?? 'Unknown error';
            throw new Exception("SatuSehat API Error ($httpCode): $errorMsg");
        }

        return $result;
    }

    public function get($url) {
        return $this->request("GET", $url);
    }

    public function post($url, $data) {
        return $this->request("POST", $url, $data);
    }

    public function delete($url) {
        return $this->request("DELETE", $url);
    }

    public function put($url, $data) {
        return $this->request("PUT", $url, $data);
    }

    public function patch($url, $data) {
        return $this->request("PATCH", $url, $data);
    }

    /**
     * Get access token from SatuSehat
     */
    public function getToken() {
        if (!$this->client_id || !$this->client_secret) {
            throw new Exception("Client credentials tidak tersedia. Silakan konfigurasi di halaman profil.");
        }

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
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        
        if (curl_errno($ch)) {
            throw new Exception("cURL Error: " . curl_error($ch));
        }
        curl_close($ch);

        $json = json_decode($response, true);
        
        if ($httpCode !== 200 || !isset($json["access_token"])) {
            $errorMsg = $json['error_description'] ?? 'Failed to get access token';
            throw new Exception("Authentication failed: $errorMsg");
        }
        
        $this->token = $json["access_token"];

        return $this->token;
    }

    /**
     * Encode URL with path
     */
    public static function encodeUrl($regularPath, $encodedPath) {
        return $regularPath . urlencode($encodedPath);
    }

    /**
     * Get organization ID for this instance
     */
    public function getOrgId() {
        if (!$this->org_id) {
            throw new Exception("Organization ID tidak tersedia");
        }
        return $this->org_id;
    }

    /**
     * Check if credentials are configured
     */
    public function isConfigured() {
        return !empty($this->org_id) && 
               !empty($this->client_id) && 
               !empty($this->client_secret);
    }

    /**
     * Static factory method - Create instance for specific doctor
     */
    public static function forDoctor($dokterId) {
        return new self($dokterId);
    }

    /**
     * Static factory method - Create instance with manual credentials (for testing)
     */
    public static function withCredentials($org_id, $client_id, $client_secret) {
        $instance = new self();
        $instance->setCredentials($org_id, $client_id, $client_secret);
        return $instance;
    }
}
?>