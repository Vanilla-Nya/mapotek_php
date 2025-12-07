<?php
// send-otp.php - GMAIL SMTP VERSION
// Prerequisites:
// 1. Enable 2-Step Verification in Google Account
// 2. Generate App Password: https://myaccount.google.com/apppasswords
// 3. Replace EMAIL and APP_PASSWORD below

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');

ini_set('display_errors', 1);
error_reporting(E_ALL);

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

require __DIR__ . '/../vendor/autoload.php';

try {
    $input = json_decode(file_get_contents('php://input'), true);
    
    if (!$input || !isset($input['action']) || $input['action'] !== 'send_otp') {
        throw new Exception('Invalid request');
    }
    
    $email = $input['email'] ?? '';
    $otp = $input['otp'] ?? '';
    
    if (empty($email) || empty($otp)) {
        throw new Exception('Email dan OTP harus diisi');
    }
    
    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        throw new Exception('Format email tidak valid');
    }
    
    $mail = new PHPMailer(true);
    
    // ⚠️ GMAIL CONFIGURATION - REPLACE THESE ⚠️
    $gmailEmail = 'vanillanyan990@gmail.com';    // ← Your Gmail address
    $gmailAppPassword = 'llgbiuuidtxlekyb';   // ← PASTE App Password here (no spaces)
    
    // Check if credentials are still placeholders
    if ($gmailEmail === 'your-email@gmail.com' || $gmailAppPassword === 'your-16-char-app-password-here') {
        throw new Exception('⚠️ Gmail credentials belum diisi! Generate App Password di: https://myaccount.google.com/apppasswords');
    }
    
    // GMAIL SMTP Configuration
    $mail->isSMTP();
    $mail->Host       = 'smtp.gmail.com';
    $mail->SMTPAuth   = true;
    $mail->Username   = $gmailEmail;
    $mail->Password   = $gmailAppPassword;
    $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
    $mail->Port       = 587;
    $mail->CharSet    = 'UTF-8';
    
    // ⭐ ENABLE DEBUG MODE (set to 0 after testing)
    $mail->SMTPDebug = 2;  // Shows detailed SMTP errors
    $mail->Debugoutput = function($str, $level) {
        error_log("SMTP Debug ($level): $str");
    };
    
    // Recipients
    $mail->setFrom($gmailEmail, 'MAPOTEK System');
    $mail->addAddress($email);
    $mail->addReplyTo($gmailEmail, 'MAPOTEK Support');
    
    // Content
    $mail->isHTML(true);
    $mail->Subject = '🔐 Kode OTP Reset Password - MAPOTEK';
    
    // Beautiful HTML Email (same as before)
    $mail->Body = "
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset='UTF-8'>
        <meta name='viewport' content='width=device-width, initial-scale=1.0'>
        <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { 
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                background-color: #f5f7fa;
                padding: 20px;
            }
            .email-wrapper {
                max-width: 600px;
                margin: 0 auto;
                background: white;
                border-radius: 16px;
                overflow: hidden;
                box-shadow: 0 4px 20px rgba(0,0,0,0.1);
            }
            .header {
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                padding: 40px 30px;
                text-align: center;
                color: white;
            }
            .header h1 { font-size: 32px; margin-bottom: 10px; font-weight: 700; }
            .header p { font-size: 14px; opacity: 0.9; }
            .content { padding: 40px 30px; }
            .greeting { font-size: 18px; color: #333; margin-bottom: 20px; }
            .otp-container {
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                border-radius: 12px;
                padding: 30px;
                text-align: center;
                margin: 30px 0;
            }
            .otp-label { color: white; font-size: 14px; margin-bottom: 10px; opacity: 0.9; }
            .otp-code {
                font-size: 48px;
                font-weight: bold;
                color: white;
                letter-spacing: 12px;
                font-family: 'Courier New', monospace;
            }
            .warning-box {
                background: #fff3cd;
                border-left: 4px solid #ffc107;
                padding: 20px;
                margin: 20px 0;
                border-radius: 8px;
            }
            .warning-box h3 { color: #856404; font-size: 16px; margin-bottom: 10px; }
            .warning-box ul { color: #856404; margin-left: 20px; }
            .warning-box li { margin: 8px 0; }
            .info-text { color: #666; line-height: 1.6; margin: 15px 0; }
            .footer {
                background: #f8f9fa;
                padding: 30px;
                text-align: center;
                border-top: 1px solid #e9ecef;
            }
            .footer-title { color: #333; font-size: 16px; font-weight: 600; margin-bottom: 10px; }
            .footer-text { color: #6c757d; font-size: 13px; margin: 5px 0; }
        </style>
    </head>
    <body>
        <div class='email-wrapper'>
            <div class='header'>
                <h1>🔐 MAPOTEK</h1>
                <p>Medical Assistant & Patient-Oriented Treatment Evaluation Kit</p>
            </div>
            
            <div class='content'>
                <div class='greeting'>Halo, <strong>" . htmlspecialchars($email) . "</strong></div>
                
                <p class='info-text'>
                    Anda telah meminta untuk mereset password akun MAPOTEK Anda. 
                    Gunakan kode OTP berikut untuk melanjutkan proses reset password:
                </p>
                
                <div class='otp-container'>
                    <div class='otp-label'>KODE OTP ANDA</div>
                    <div class='otp-code'>$otp</div>
                </div>
                
                <div class='warning-box'>
                    <h3>⚠️ PENTING - Mohon Diperhatikan:</h3>
                    <ul>
                        <li><strong>Kode berlaku selama 10 menit</strong></li>
                        <li>Jangan bagikan kode ini kepada siapapun</li>
                        <li>MAPOTEK tidak akan pernah meminta kode OTP Anda</li>
                    </ul>
                </div>
                
                <p class='info-text'>
                    <strong>Jika Anda tidak meminta reset password:</strong><br>
                    Abaikan email ini. Akun Anda tetap aman.
                </p>
            </div>
            
            <div class='footer'>
                <div class='footer-title'>MAPOTEK System</div>
                <p class='footer-text'>Email otomatis - Mohon tidak membalas email ini</p>
                <p class='footer-text'>© 2024 MAPOTEK. All rights reserved.</p>
            </div>
        </div>
    </body>
    </html>
    ";
    
    $mail->AltBody = "MAPOTEK - Reset Password\n\nKode OTP Anda: $otp\n\nKode berlaku selama 10 menit.\n\nJika Anda tidak meminta reset password, abaikan email ini.";
    
    // Send email
    if (!$mail->send()) {
        throw new Exception('Email gagal dikirim: ' . $mail->ErrorInfo);
    }
    
    // Log success
    $logFile = __DIR__ . '/otp_log.txt';
    $logMessage = date('Y-m-d H:i:s') . " - SUCCESS (Gmail) - Email: $email, OTP: $otp\n";
    file_put_contents($logFile, $logMessage, FILE_APPEND);
    
    echo json_encode([
        'success' => true,
        'message' => 'OTP berhasil dikirim ke email Anda'
    ]);
    
} catch (Exception $e) {
    // Log error
    $logFile = __DIR__ . '/otp_log.txt';
    $errorMsg = $e->getMessage();
    $logMessage = date('Y-m-d H:i:s') . " - ERROR - Email: " . ($email ?? 'unknown') 
                . ", Error: $errorMsg\n";
    file_put_contents($logFile, $logMessage, FILE_APPEND);
    
    echo json_encode([
        'success' => false,
        'message' => $errorMsg
    ]);
}
?>