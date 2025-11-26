<?php
// ========================================
// FIX ORPHANED ASISTEN ACCOUNTS
// Use this to insert missing asisten_dokter records
// ========================================

header('Content-Type: application/json');
require_once(__DIR__ . '/config/supabase.php');

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    // Show form
    ?>
    <!DOCTYPE html>
    <html>
    <head>
        <title>Fix Orphan Asisten</title>
        <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
    </head>
    <body class="bg-light">
        <div class="container py-5">
            <div class="row justify-content-center">
                <div class="col-md-8">
                    <div class="card shadow">
                        <div class="card-header bg-warning text-dark">
                            <h4 class="mb-0">🔧 Fix Orphaned Asisten Account</h4>
                        </div>
                        <div class="card-body">
                            <div class="alert alert-info">
                                <strong>ℹ️ When to use this:</strong><br>
                                Use this tool when an asisten was created in Supabase Auth but NOT inserted into the asisten_dokter table.
                            </div>
                            
                            <form method="POST" id="fixForm">
                                <div class="mb-3">
                                    <label class="form-label">Auth User UUID <span class="text-danger">*</span></label>
                                    <input type="text" class="form-control" name="auth_uuid" 
                                           placeholder="e.g., fdce4887-4f66-4640-9ef7-60571055ee4e" required>
                                    <small class="text-muted">Get this from Supabase Auth dashboard or browser console</small>
                                </div>
                                
                                <div class="mb-3">
                                    <label class="form-label">Email <span class="text-danger">*</span></label>
                                    <input type="email" class="form-control" name="email" required>
                                </div>
                                
                                <div class="mb-3">
                                    <label class="form-label">Nama Lengkap <span class="text-danger">*</span></label>
                                    <input type="text" class="form-control" name="nama_lengkap" required>
                                </div>
                                
                                <div class="mb-3">
                                    <label class="form-label">Username</label>
                                    <input type="text" class="form-control" name="username">
                                </div>
                                
                                <div class="mb-3">
                                    <label class="form-label">No. Telepon <span class="text-danger">*</span></label>
                                    <input type="text" class="form-control" name="no_telp" required>
                                </div>
                                
                                <div class="mb-3">
                                    <label class="form-label">Alamat <span class="text-danger">*</span></label>
                                    <textarea class="form-control" name="alamat" rows="2" required></textarea>
                                </div>
                                
                                <div class="mb-3">
                                    <label class="form-label">Jenis Kelamin</label>
                                    <select class="form-select" name="jenis_kelamin">
                                        <option value="">-- Pilih --</option>
                                        <option value="L">Laki-laki</option>
                                        <option value="P">Perempuan</option>
                                    </select>
                                </div>
                                
                                <div class="mb-3">
                                    <label class="form-label">ID Dokter (Parent) <span class="text-danger">*</span></label>
                                    <input type="text" class="form-control" name="id_dokter" 
                                           placeholder="UUID of the doctor this asisten belongs to" required>
                                    <small class="text-muted">The UUID of the doctor who created this asisten</small>
                                </div>
                                
                                <div class="mb-3">
                                    <label class="form-label">NIK (Optional)</label>
                                    <input type="text" class="form-control" name="nik" maxlength="16">
                                </div>
                                
                                <button type="submit" class="btn btn-primary w-100">
                                    <i class="bi bi-tools"></i> Fix & Insert Record
                                </button>
                            </form>
                        </div>
                    </div>
                    
                    <div class="card mt-4 shadow">
                        <div class="card-header bg-secondary text-white">
                            <h5 class="mb-0">📋 How to find the Auth UUID</h5>
                        </div>
                        <div class="card-body">
                            <ol>
                                <li>Go to Supabase Dashboard → Authentication → Users</li>
                                <li>Find the asisten's email</li>
                                <li>Copy the UUID (User UID column)</li>
                            </ol>
                            <p class="mb-0">Or check browser console when logging in - it shows <code>user.id</code></p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </body>
    </html>
    <?php
    exit;
}

// Handle POST - Insert the record
if ($method === 'POST') {
    $data = $_POST;
    
    // Validate required fields
    $required = ['auth_uuid', 'email', 'nama_lengkap', 'no_telp', 'alamat', 'id_dokter'];
    $missing = [];
    
    foreach ($required as $field) {
        if (empty($data[$field])) {
            $missing[] = $field;
        }
    }
    
    if (!empty($missing)) {
        die(json_encode([
            'success' => false,
            'error' => 'Missing required fields: ' . implode(', ', $missing)
        ]));
    }
    
    // Validate UUID format
    $uuidPattern = '/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i';
    
    if (!preg_match($uuidPattern, $data['auth_uuid'])) {
        die(json_encode([
            'success' => false,
            'error' => 'Invalid auth_uuid format. Must be a valid UUID.'
        ]));
    }
    
    if (!preg_match($uuidPattern, $data['id_dokter'])) {
        die(json_encode([
            'success' => false,
            'error' => 'Invalid id_dokter format. Must be a valid UUID.'
        ]));
    }
    
    // Check if record already exists
    $existing = supabase('GET', 'asisten_dokter', 'id_asisten_dokter=eq.' . $data['auth_uuid']);
    
    if (!empty($existing) && !isset($existing['error'])) {
        die(json_encode([
            'success' => false,
            'error' => 'Record already exists for this UUID!',
            'existing' => $existing
        ]));
    }
    
    // Prepare insert data
    $insertData = [
        'id_asisten_dokter' => $data['auth_uuid'],
        'email' => trim($data['email']),
        'nama_lengkap' => trim($data['nama_lengkap']),
        'no_telp' => trim($data['no_telp']),
        'alamat' => trim($data['alamat']),
        'id_dokter' => $data['id_dokter']
    ];
    
    // Add optional fields
    if (!empty($data['username'])) $insertData['username'] = trim($data['username']);
    if (!empty($data['jenis_kelamin'])) $insertData['jenis_kelamin'] = $data['jenis_kelamin'];
    if (!empty($data['nik'])) $insertData['nik'] = trim($data['nik']);
    
    error_log("📝 Inserting orphan asisten: " . json_encode($insertData));
    
    // Insert into database
    $result = supabase('POST', 'asisten_dokter', '', $insertData);
    
    if (isset($result['error'])) {
        echo json_encode([
            'success' => false,
            'error' => $result['error'],
            'details' => $result
        ]);
    } else {
        echo "<html><body style='font-family: sans-serif; padding: 40px;'>";
        echo "<div style='max-width: 600px; margin: 0 auto; background: #d4edda; padding: 20px; border-radius: 10px;'>";
        echo "<h2 style='color: #155724;'>✅ Success!</h2>";
        echo "<p>Asisten record has been inserted successfully.</p>";
        echo "<pre style='background: #fff; padding: 15px; border-radius: 5px;'>" . json_encode($result, JSON_PRETTY_PRINT) . "</pre>";
        echo "<p><strong>The asisten can now log in!</strong></p>";
        echo "<a href='javascript:history.back()' style='color: #155724;'>← Go back</a>";
        echo "</div></body></html>";
    }
    exit;
}
?>