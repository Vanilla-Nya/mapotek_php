<?php
// API/config/satusehat_api.php - With Auto Environment Detection

class SatuSehatAPI {
    private $baseUrl;
    private $authUrl;
    private $org_id;
    private $client_id;
    private $client_secret;
    private $token = null;
    private $dokterId;
    private $isSandbox;

    /**
     * Constructor - Initialize with doctor credentials from database
     */
    public function __construct($dokterId = null) {
        $this->dokterId = $dokterId;
        
        if ($dokterId) {
            $this->loadCredentialsFromDatabase($dokterId);
            // Auto-detect environment after loading credentials
            $this->detectAndSetEnvironment();
        }
    }

    /**
     * Load credentials from database for specific doctor
     */
    private function loadCredentialsFromDatabase($dokterId) {
        require_once __DIR__ . '/../database.php';
        
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
     * 🔍 Auto-detect and set environment (Sandbox vs Production)
     */
    private function detectAndSetEnvironment() {
        // ⭐ FORCE PRODUCTION for specific known Organization IDs
        $knownProductionOrgIds = [
            '100062510',  // Your production org ID
            '7b4db35e-ea4e-4b46-b389-095472942d34', // Example UUID format
            // Add more production org IDs here as needed
        ];
        
        // Check if this is a known production organization
        if (in_array($this->org_id, $knownProductionOrgIds)) {
            error_log("🎯 Recognized as PRODUCTION Organization ID: {$this->org_id}");
            $this->setProductionEnvironment();
            
            try {
                $this->getToken();
                error_log("✅ Production authentication successful");
                return;
            } catch (Exception $e) {
                error_log("❌ Production auth failed: " . $e->getMessage());
                throw $e;
            }
        }
        
        // Method 1: Check Organization ID patterns for sandbox
        $orgIdLower = strtolower($this->org_id);
        if (stripos($orgIdLower, 'test') !== false || 
            stripos($orgIdLower, 'sandbox') !== false ||
            stripos($orgIdLower, 'demo') !== false ||
            stripos($orgIdLower, 'dev') !== false) {
            $this->setSandboxEnvironment();
            return;
        }
        
        // Method 2: Try production first (for unknown orgs)
        $this->setProductionEnvironment();
        
        try {
            // Try to get token with production endpoint
            $this->getToken();
            error_log("✅ Production authentication successful - Using PRODUCTION");
        } catch (Exception $e) {
            // If production fails, try sandbox
            error_log("⚠️ Production auth failed: " . $e->getMessage());
            error_log("🔄 Trying SANDBOX environment...");
            
            $this->setSandboxEnvironment();
            
            try {
                $this->getToken();
                error_log("✅ Sandbox authentication successful - Using SANDBOX");
            } catch (Exception $e2) {
                // Both failed - throw error
                error_log("❌ Both Production and Sandbox authentication failed");
                throw new Exception("Failed to authenticate with both Production and Sandbox: " . $e2->getMessage());
            }
        }
    }

    /**
     * Set Sandbox environment URLs
     */
    private function setSandboxEnvironment() {
        $this->isSandbox = true;
        $this->baseUrl = "https://api-satusehat-stg.dto.kemkes.go.id/fhir-r4/v1";
        $this->authUrl = "https://api-satusehat-stg.dto.kemkes.go.id/oauth2/v1/accesstoken?grant_type=client_credentials";
        error_log("🧪 Environment set to: SANDBOX");
    }

    /**
     * Set Production environment URLs
     */
    private function setProductionEnvironment() {
        $this->isSandbox = false;
        $this->baseUrl = "https://api-satusehat.kemkes.go.id/fhir-r4/v1";
        $this->authUrl = "https://api-satusehat.kemkes.go.id/oauth2/v1/accesstoken?grant_type=client_credentials";
        error_log("🏥 Environment set to: PRODUCTION");
    }

    /**
     * Set credentials manually (useful for testing)
     */
    public function setCredentials($org_id, $client_id, $client_secret) {
        $this->org_id = $org_id;
        $this->client_id = $client_id;
        $this->client_secret = $client_secret;
        $this->detectAndSetEnvironment();
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
        curl_setopt($ch, CURLOPT_TIMEOUT, 10);

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
            $error = curl_error($ch);
            curl_close($ch);
            throw new Exception("cURL Error: " . $error);
        }
        curl_close($ch);

        $json = json_decode($response, true);
        
        if ($httpCode !== 200 || !isset($json["access_token"])) {
            $errorMsg = $json['error_description'] ?? 'Failed to get access token';
            throw new Exception("Authentication failed: $errorMsg");
        }
        
        $this->token = $json["access_token"];
        error_log("🔐 Access token obtained successfully");

        return $this->token;
    }

    /**
     * Generic request method
     */
    public function request($method, $url, $data = null) {
        if (!$this->token) {
            $this->getToken();
        }

        $ch = curl_init();
        curl_setopt($ch, CURLOPT_URL, $this->baseUrl . $url);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_TIMEOUT, 30);

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
            $error = curl_error($ch);
            curl_close($ch);
            throw new Exception("cURL Error: " . $error);
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
     * Get organization ID
     */
    public function getOrgId() {
        if (!$this->org_id) {
            throw new Exception("Organization ID tidak tersedia");
        }
        return $this->org_id;
    }

    /**
     * Alias for getOrgId() to match usage in get_locations.php
     */
    public function getOrganizationId() {
        return $this->getOrgId();
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
     * Get current environment
     */
    public function getEnvironment() {
        return $this->isSandbox ? 'sandbox' : 'production';
    }

    /**
     * Check if using sandbox
     */
    public function isSandbox() {
        return $this->isSandbox;
    }

    /**
     * Static factory method - Create instance for specific doctor
     */
    public static function forDoctor($dokterId) {
        return new self($dokterId);
    }

    /**
     * Static factory method - Create instance with manual credentials
     */
    public static function withCredentials($org_id, $client_id, $client_secret) {
        $instance = new self();
        $instance->setCredentials($org_id, $client_id, $client_secret);
        return $instance;
    }

    /**
     * Encode URL with path
     */
    public static function encodeUrl($regularPath, $encodedPath) {
        return $regularPath . urlencode($encodedPath);
    }
}
?>