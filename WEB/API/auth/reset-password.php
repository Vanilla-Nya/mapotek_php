<?php
// reset-password.php - Server-side password reset with OTP validation
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// ✅ Use your existing supabase.php configuration
// Path goes: auth/ → API/ → WEB/ → MAPOTEK_PHP/ → config/
require_once __DIR__ . '/../config/supabase.php';

try {
    $input = json_decode(file_get_contents('php://input'), true);
    
    if (!$input || !isset($input['action'])) {
        throw new Exception('Invalid request');
    }
    
    if ($input['action'] === 'reset_password') {
        $email = $input['email'] ?? '';
        $newPassword = $input['new_password'] ?? '';
        $otpId = $input['otp_id'] ?? '';
        
        if (empty($email) || empty($newPassword) || empty($otpId)) {
            throw new Exception('Data tidak lengkap');
        }
        
        // Validate password length
        if (strlen($newPassword) < 6) {
            throw new Exception('Password minimal 6 karakter');
        }
        
        // ⭐ STEP 1: Get OTP record from database
        error_log("🔍 Checking OTP ID: $otpId for email: $email");
        
        $otpRecord = supabase('GET', 'password_reset_otp', "id=eq.$otpId&email=eq.$email");
        
        if (isset($otpRecord['error'])) {
            error_log("❌ OTP fetch error: " . print_r($otpRecord['error'], true));
            throw new Exception('Gagal memverifikasi OTP');
        }
        
        if (empty($otpRecord) || !is_array($otpRecord) || count($otpRecord) === 0) {
            error_log("❌ OTP not found for ID: $otpId, Email: $email");
            throw new Exception('OTP tidak ditemukan');
        }
        
        $otp = $otpRecord[0]; // Supabase returns array of results
        
        error_log("✅ OTP record found: " . print_r($otp, true));
        
        // ⭐ STEP 2: Check if OTP is already used
        if ($otp['is_used']) {
            error_log("❌ OTP already used");
            throw new Exception('Kode OTP sudah digunakan');
        }
        
        // ⭐ STEP 3: Check expiration (SERVER-SIDE - NO TIMEZONE ISSUES)
        $expiresAt = new DateTime($otp['expires_at'], new DateTimeZone('UTC'));
        $now = new DateTime('now', new DateTimeZone('UTC'));
        
        error_log("⏰ Current time (UTC): " . $now->format('Y-m-d H:i:s'));
        error_log("⏰ Expires at (UTC): " . $expiresAt->format('Y-m-d H:i:s'));
        
        if ($now > $expiresAt) {
            $interval = $now->diff($expiresAt);
            $minutesExpired = ($interval->days * 24 * 60) + ($interval->h * 60) + $interval->i;
            
            error_log("❌ OTP expired: $minutesExpired minutes ago");
            throw new Exception('Kode OTP sudah kadaluarsa! Silakan minta kode baru.');
        }
        
        $secondsRemaining = $expiresAt->getTimestamp() - $now->getTimestamp();
        $minutesRemaining = floor($secondsRemaining / 60);
        error_log("✅ OTP valid: $minutesRemaining minutes remaining");
        
        // ⭐ STEP 4: Update password in auth.users using Admin API
        error_log("🔐 Updating password for email: $email");
        
        // Get all users and find by email
        $authUrl = SUPABASE_URL . "/auth/v1/admin/users";
        
        $ch = curl_init($authUrl);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_HTTPHEADER, [
            'apikey: ' . SUPABASE_KEY,
            'Authorization: Bearer ' . SUPABASE_KEY,
            'Content-Type: application/json'
        ]);
        
        $response = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        $curlError = curl_error($ch);
        curl_close($ch);
        
        if ($curlError) {
            error_log("❌ cURL error: $curlError");
            throw new Exception('Gagal terhubung ke server auth');
        }
        
        if ($httpCode !== 200) {
            error_log("❌ Failed to fetch users: HTTP $httpCode");
            error_log("Response: $response");
            throw new Exception('Gagal mengambil data user');
        }
        
        $usersResponse = json_decode($response, true);
        
        error_log("👥 Users response: " . print_r($usersResponse, true));
        
        if (!isset($usersResponse['users'])) {
            error_log("❌ Invalid response structure");
            throw new Exception('Format respons tidak valid');
        }
        
        if (empty($usersResponse['users'])) {
            error_log("⚠️ No users found in auth system");
            error_log("📧 Looking for email: $email");
            throw new Exception('User tidak ditemukan di sistem auth. Pastikan email sudah terdaftar.');
        }
        
        // Find user by email
        $userId = null;
        foreach ($usersResponse['users'] as $user) {
            error_log("🔍 Checking user: " . ($user['email'] ?? 'no-email'));
            if (isset($user['email']) && strtolower($user['email']) === strtolower($email)) {
                $userId = $user['id'];
                error_log("✅ Found matching user ID: $userId");
                break;
            }
        }
        
        if (!$userId) {
            error_log("❌ User not found with email: $email");
            error_log("📋 Available users: " . implode(', ', array_map(function($u) { 
                return $u['email'] ?? 'no-email'; 
            }, $usersResponse['users'])));
            throw new Exception('User dengan email tersebut tidak ditemukan di sistem auth');
        }
        
        error_log("✅ Found user ID: $userId");
        
        // ⭐ STEP 5: Update the password
        $updateUrl = SUPABASE_URL . "/auth/v1/admin/users/$userId";
        
        $updateData = json_encode([
            'password' => $newPassword
        ]);
        
        $ch = curl_init($updateUrl);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_CUSTOMREQUEST, 'PUT');
        curl_setopt($ch, CURLOPT_POSTFIELDS, $updateData);
        curl_setopt($ch, CURLOPT_HTTPHEADER, [
            'apikey: ' . SUPABASE_KEY,
            'Authorization: Bearer ' . SUPABASE_KEY,
            'Content-Type: application/json'
        ]);
        
        $response = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);
        
        if ($httpCode !== 200) {
            error_log("❌ Password update failed: HTTP $httpCode");
            error_log("Response: $response");
            throw new Exception('Gagal mengupdate password');
        }
        
        error_log("✅ Password updated successfully");
        
        // ⭐ STEP 6: Mark OTP as used
        $markUsed = supabase('PATCH', 'password_reset_otp', "id=eq.$otpId", [
            'is_used' => true
        ]);
        
        if (isset($markUsed['error'])) {
            error_log("⚠️ Warning: Failed to mark OTP as used: " . print_r($markUsed['error'], true));
            // Don't throw error - password was already updated successfully
        } else {
            error_log("✅ OTP marked as used");
        }
        
        // ⭐ Log success
        $logFile = __DIR__ . '/password_reset_log.txt';
        $logMessage = date('Y-m-d H:i:s') . " - SUCCESS - Email: $email, OTP ID: $otpId\n";
        file_put_contents($logFile, $logMessage, FILE_APPEND);
        
        echo json_encode([
            'success' => true,
            'message' => 'Password berhasil direset'
        ]);
        
    } else {
        throw new Exception('Action tidak valid');
    }
    
} catch (Exception $e) {
    error_log("❌ Reset password error: " . $e->getMessage());
    
    // Log error
    $logFile = __DIR__ . '/password_reset_log.txt';
    $logMessage = date('Y-m-d H:i:s') . " - ERROR - " . $e->getMessage() . "\n";
    file_put_contents($logFile, $logMessage, FILE_APPEND);
    
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage()
    ]);
}
?>