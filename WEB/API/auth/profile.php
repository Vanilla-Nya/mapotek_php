<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');

require_once '../database.php';         // Regular operations
require_once '../database_service.php'; // Admin operations

$requestMethod = $_SERVER['REQUEST_METHOD'];
$input = json_decode(file_get_contents('php://input'), true);

if ($requestMethod === 'POST') {
    $action = $input['action'] ?? '';

    switch ($action) {
        case 'get':
            // Use regular supabase() for reading
            $email = $input['email'];
            $result = supabase('GET', 'dokter', "email=ilike." . $email);
            
            if (!empty($result) && !isset($result['code'])) {
                echo json_encode([
                    'success' => true,
                    'data' => $result[0]
                ]);
            } else {
                echo json_encode(['success' => false, 'message' => 'Profil tidak ditemukan']);
            }
            break;

        case 'update':
            // Use regular supabase() for updates
            $email = $input['email'];
            $updateData = [
                'nama_faskes' => $input['nama_faskes'] ?? '',
                'nama_lengkap' => $input['nama_lengkap'] ?? '',
                'username' => $input['username'] ?? '',
                'jenis_kelamin' => $input['jenis_kelamin'] ?? '',
                'no_telp' => $input['no_telp'] ?? '',
                'nik' => $input['nik'] ?? null,
                'rfid' => $input['rfid'] ?? null,
                'jam_kerja' => $input['jam_kerja'] ?? null,
                'alamat' => $input['alamat'] ?? '',
                'updated_at' => date('Y-m-d H:i:s')
            ];
            
            $result = supabase('PATCH', 'dokter', "email=ilike.$email", $updateData);
            
            if (is_array($result) && !isset($result['code']) && !isset($result['error'])) {
                echo json_encode([
                    'success' => true,
                    'message' => 'Profil berhasil diupdate',
                    'data' => $result
                ]);
            } else {
                echo json_encode([
                    'success' => false, 
                    'message' => 'Gagal mengupdate profil',
                    'error' => $result
                ]);
            }
            break;

        case 'update_avatar':
            $email = $input['email'];
            $avatar_url = $input['avatar_url'] ?? '';
            
            if (empty($avatar_url)) {
                echo json_encode([
                    'success' => false,
                    'message' => 'Avatar URL is required'
                ]);
                break;
            }
            
            error_log("=== AVATAR UPDATE DEBUG ===");
            error_log("Email: $email");
            error_log("Avatar URL: $avatar_url");
            
            $updateData = [
                'avatar_url' => $avatar_url,
                'updated_at' => date('Y-m-d H:i:s')
            ];
            
            // Use regular supabase() function
            $result = supabase('PATCH', 'dokter', "email=ilike.$email", $updateData);
            
            error_log("Update result: " . json_encode($result));
            
            // Check if update actually worked
            if (!isset($result['error']) && !isset($result['code'])) {
                // Verify the update by reading it back
                $verify = supabase('GET', 'dokter', "email=ilike.$email&select=avatar_url");
                error_log("Verify result: " . json_encode($verify));
                
                echo json_encode([
                    'success' => true,
                    'message' => 'Avatar berhasil diupdate',
                    'avatar_url' => $avatar_url,
                    'verify' => $verify
                ]);
            } else {
                echo json_encode([
                    'success' => false, 
                    'message' => 'Gagal mengupdate avatar',
                    'error' => $result
                ]);
            }
            break;

        case 'update_satusehat':
            $email = $input['email'];
            $org_id = $input['satusehat_org_id'] ?? '';
            $client_id = $input['satusehat_client_id'] ?? '';
            $client_secret = $input['satusehat_client_secret'] ?? '';
            $enabled = $input['satusehat_enabled'] ?? false;

            // Validation
            if ($enabled && (empty($org_id) || empty($client_id) || empty($client_secret))) {
                echo json_encode([
                    'success' => false,
                    'message' => 'Semua field API harus diisi jika SatuSehat diaktifkan'
                ]);
                break;
            }

            // Encrypt client_secret for security (optional but recommended)
            // For now, storing as-is. In production, consider encryption.
            
            $updateData = [
                'satusehat_org_id' => $org_id,
                'satusehat_client_id' => $client_id,
                'satusehat_client_secret' => $client_secret,
                'satusehat_enabled' => $enabled,
                'updated_at' => date('Y-m-d H:i:s')
            ];

            error_log("=== SATUSEHAT UPDATE ===");
            error_log("Email: $email");
            error_log("Enabled: " . ($enabled ? 'true' : 'false'));

            $result = supabase('PATCH', 'dokter', "email=ilike.$email", $updateData);

            if (is_array($result) && !isset($result['code']) && !isset($result['error'])) {
                echo json_encode([
                    'success' => true,
                    'message' => 'Konfigurasi SatuSehat berhasil disimpan',
                    'data' => [
                        'org_id' => $org_id,
                        'client_id' => $client_id,
                        'enabled' => $enabled
                    ]
                ]);
            } else {
                echo json_encode([
                    'success' => false,
                    'message' => 'Gagal menyimpan konfigurasi SatuSehat',
                    'error' => $result
                ]);
            }
            break;

        case 'update_id_satusehat':
            $email = $input['email'];
            $id_satusehat = $input['id_satusehat'] ?? '';

            if (empty($id_satusehat)) {
                echo json_encode([
                    'success' => false,
                    'message' => 'ID SatuSehat is required'
                ]);
                break;
            }

            $updateData = [
                'id_satusehat' => $id_satusehat,
                'updated_at' => date('Y-m-d H:i:s')
            ];

            error_log("=== ID SATUSEHAT UPDATE ===");
            error_log("Email: $email");
            error_log("ID SatuSehat: $id_satusehat");

            $result = supabase('PATCH', 'dokter', "email=ilike.$email", $updateData);

            if (is_array($result) && !isset($result['code']) && !isset($result['error'])) {
                echo json_encode([
                    'success' => true,
                    'message' => 'ID SatuSehat berhasil disimpan',
                    'data' => [
                        'id_satusehat' => $id_satusehat
                    ]
                ]);
            } else {
                echo json_encode([
                    'success' => false,
                    'message' => 'Gagal menyimpan ID SatuSehat',
                    'error' => $result
                ]);
            }
            break;

        default:
            echo json_encode([
                'success' => false,
                'message' => 'Invalid action'
            ]);
            break;
    }
}
?>