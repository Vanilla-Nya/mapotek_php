<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');

require_once '../database.php';
require_once '../database_service.php';

$requestMethod = $_SERVER['REQUEST_METHOD'];
$input = json_decode(file_get_contents('php://input'), true);

if ($requestMethod === 'POST') {
    $action = $input['action'] ?? '';

    switch ($action) {
        case 'get':
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

        // ⭐ NEW: Get asisten profile
        case 'get_asisten':
            $email = $input['email'];
            $result = supabase('GET', 'asisten_dokter', "email=ilike." . $email);
            
            if (!empty($result) && !isset($result['code'])) {
                echo json_encode([
                    'success' => true,
                    'data' => $result[0]
                ]);
            } else {
                echo json_encode(['success' => false, 'message' => 'Profil asisten tidak ditemukan']);
            }
            break;

        // ⭐ NEW: Get doctor's shared data (API, location, QR, subscription)
        case 'get_doctor_shared_data':
            $id_dokter = $input['id_dokter'];
            $result = supabase('GET', 'dokter', "id_dokter=eq." . $id_dokter . "&select=nama_faskes,satusehat_org_id,satusehat_client_id,satusehat_client_secret,satusehat_enabled,satusehat_location_id,satusehat_location_name,qr_code_data,qris_url");
            
            if (!empty($result) && !isset($result['code'])) {
                echo json_encode([
                    'success' => true,
                    'data' => $result[0]
                ]);
            } else {
                echo json_encode(['success' => false, 'message' => 'Data dokter tidak ditemukan']);
            }
            break;

        case 'update':
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

        // ⭐ NEW: Update asisten profile
        case 'update_asisten':
            $email = $input['email'];
            $updateData = [
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
            
            $result = supabase('PATCH', 'asisten_dokter', "email=ilike.$email", $updateData);
            
            if (is_array($result) && !isset($result['code']) && !isset($result['error'])) {
                echo json_encode([
                    'success' => true,
                    'message' => 'Profil asisten berhasil diupdate',
                    'data' => $result
                ]);
            } else {
                echo json_encode([
                    'success' => false, 
                    'message' => 'Gagal mengupdate profil asisten',
                    'error' => $result
                ]);
            }
            break;

        case 'update_avatar':
            $email = $input['email'];
            $avatar_url = $input['avatar_url'] ?? '';
            
            if (empty($avatar_url)) {
                echo json_encode(['success' => false, 'message' => 'Avatar URL is required']);
                break;
            }
            
            $updateData = [
                'avatar_url' => $avatar_url,
                'updated_at' => date('Y-m-d H:i:s')
            ];
            
            $result = supabase('PATCH', 'dokter', "email=ilike.$email", $updateData);
            
            if (!isset($result['error']) && !isset($result['code'])) {
                echo json_encode([
                    'success' => true,
                    'message' => 'Avatar berhasil diupdate',
                    'avatar_url' => $avatar_url
                ]);
            } else {
                echo json_encode([
                    'success' => false, 
                    'message' => 'Gagal mengupdate avatar',
                    'error' => $result
                ]);
            }
            break;

        // ⭐ NEW: Update asisten avatar
        case 'update_asisten_avatar':
            $email = $input['email'];
            $avatar_url = $input['avatar_url'] ?? '';
            
            if (empty($avatar_url)) {
                echo json_encode(['success' => false, 'message' => 'Avatar URL is required']);
                break;
            }
            
            $updateData = [
                'avatar_url' => $avatar_url,
                'updated_at' => date('Y-m-d H:i:s')
            ];
            
            $result = supabase('PATCH', 'asisten_dokter', "email=ilike.$email", $updateData);
            
            if (!isset($result['error']) && !isset($result['code'])) {
                echo json_encode([
                    'success' => true,
                    'message' => 'Avatar asisten berhasil diupdate',
                    'avatar_url' => $avatar_url
                ]);
            } else {
                echo json_encode([
                    'success' => false, 
                    'message' => 'Gagal mengupdate avatar asisten',
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

            if ($enabled && (empty($org_id) || empty($client_id) || empty($client_secret))) {
                echo json_encode([
                    'success' => false,
                    'message' => 'Semua field API harus diisi jika SatuSehat diaktifkan'
                ]);
                break;
            }
            
            $updateData = [
                'satusehat_org_id' => $org_id,
                'satusehat_client_id' => $client_id,
                'satusehat_client_secret' => $client_secret,
                'satusehat_enabled' => $enabled,
                'updated_at' => date('Y-m-d H:i:s')
            ];

            $result = supabase('PATCH', 'dokter', "email=ilike.$email", $updateData);

            if (is_array($result) && !isset($result['code']) && !isset($result['error'])) {
                echo json_encode([
                    'success' => true,
                    'message' => 'Konfigurasi SatuSehat berhasil disimpan'
                ]);
            } else {
                echo json_encode([
                    'success' => false,
                    'message' => 'Gagal menyimpan konfigurasi SatuSehat',
                    'error' => $result
                ]);
            }
            break;

        // ⭐ NEW: Asisten updates doctor's SatuSehat config
        case 'update_doctor_satusehat':
            $id_dokter = $input['id_dokter'];
            $org_id = $input['satusehat_org_id'] ?? '';
            $client_id = $input['satusehat_client_id'] ?? '';
            $client_secret = $input['satusehat_client_secret'] ?? '';
            $enabled = $input['satusehat_enabled'] ?? false;

            if ($enabled && (empty($org_id) || empty($client_id) || empty($client_secret))) {
                echo json_encode([
                    'success' => false,
                    'message' => 'Semua field API harus diisi jika SatuSehat diaktifkan'
                ]);
                break;
            }
            
            $updateData = [
                'satusehat_org_id' => $org_id,
                'satusehat_client_id' => $client_id,
                'satusehat_client_secret' => $client_secret,
                'satusehat_enabled' => $enabled,
                'updated_at' => date('Y-m-d H:i:s')
            ];

            $result = supabase('PATCH', 'dokter', "id_dokter=eq.$id_dokter", $updateData);

            if (is_array($result) && !isset($result['code']) && !isset($result['error'])) {
                echo json_encode([
                    'success' => true,
                    'message' => 'Konfigurasi SatuSehat berhasil disimpan'
                ]);
            } else {
                echo json_encode([
                    'success' => false,
                    'message' => 'Gagal menyimpan konfigurasi SatuSehat',
                    'error' => $result
                ]);
            }
            break;

        case 'update_location':
            $email = $input['email'];
            $location_id = $input['satusehat_location_id'] ?? '';
            $location_name = $input['satusehat_location_name'] ?? '';

            if (empty($location_id) || empty($location_name)) {
                echo json_encode([
                    'success' => false,
                    'message' => 'Location ID and name are required'
                ]);
                break;
            }

            $updateData = [
                'satusehat_location_id' => $location_id,
                'satusehat_location_name' => $location_name,
                'updated_at' => date('Y-m-d H:i:s')
            ];

            $result = supabase('PATCH', 'dokter', "email=ilike.$email", $updateData);

            if (is_array($result) && !isset($result['code']) && !isset($result['error'])) {
                echo json_encode([
                    'success' => true,
                    'message' => 'Location berhasil disimpan'
                ]);
            } else {
                echo json_encode([
                    'success' => false,
                    'message' => 'Gagal menyimpan location',
                    'error' => $result
                ]);
            }
            break;

        // ⭐ NEW: Asisten updates doctor's location
        case 'update_doctor_location':
            $id_dokter = $input['id_dokter'];
            $location_id = $input['satusehat_location_id'] ?? '';
            $location_name = $input['satusehat_location_name'] ?? '';

            if (empty($location_id) || empty($location_name)) {
                echo json_encode([
                    'success' => false,
                    'message' => 'Location ID and name are required'
                ]);
                break;
            }

            $updateData = [
                'satusehat_location_id' => $location_id,
                'satusehat_location_name' => $location_name,
                'updated_at' => date('Y-m-d H:i:s')
            ];

            $result = supabase('PATCH', 'dokter', "id_dokter=eq.$id_dokter", $updateData);

            if (is_array($result) && !isset($result['code']) && !isset($result['error'])) {
                echo json_encode([
                    'success' => true,
                    'message' => 'Location berhasil disimpan'
                ]);
            } else {
                echo json_encode([
                    'success' => false,
                    'message' => 'Gagal menyimpan location',
                    'error' => $result
                ]);
            }
            break;

        case 'update_qris':
            $email = $input['email'];
            $qris_url = $input['qris_url'] ?? '';
            
            if (empty($qris_url)) {
                echo json_encode(['success' => false, 'message' => 'QRIS URL is required']);
                break;
            }
            
            $updateData = [
                'qris_url' => $qris_url,
                'updated_at' => date('Y-m-d H:i:s')
            ];
            
            $result = supabase('PATCH', 'dokter', "email=ilike.$email", $updateData);
            
            if (!isset($result['error']) && !isset($result['code'])) {
                echo json_encode([
                    'success' => true,
                    'message' => 'QRIS berhasil diupdate',
                    'qris_url' => $qris_url
                ]);
            } else {
                echo json_encode([
                    'success' => false, 
                    'message' => 'Gagal mengupdate QRIS',
                    'error' => $result
                ]);
            }
            break;

        case 'update_id_satusehat':
            $email = $input['email'];
            $id_satusehat = $input['id_satusehat'] ?? '';

            if (empty($id_satusehat)) {
                echo json_encode(['success' => false, 'message' => 'ID SatuSehat is required']);
                break;
            }

            $updateData = [
                'id_satusehat' => $id_satusehat,
                'updated_at' => date('Y-m-d H:i:s')
            ];

            $result = supabase('PATCH', 'dokter', "email=ilike.$email", $updateData);

            if (is_array($result) && !isset($result['code']) && !isset($result['error'])) {
                echo json_encode([
                    'success' => true,
                    'message' => 'ID SatuSehat berhasil disimpan'
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
            echo json_encode(['success' => false, 'message' => 'Invalid action']);
            break;
    }
}
?>