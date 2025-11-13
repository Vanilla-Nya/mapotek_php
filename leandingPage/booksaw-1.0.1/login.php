<?php
session_start();

// Include koneksi Supabase
include 'database.php';

// Cek jika sudah login
if(isset($_SESSION['user_id'])) {
    header("Location: dashboard.php");
    exit();
}

// Proses login
if($_SERVER['REQUEST_METHOD'] == 'POST') {
    $email = trim($_POST['email']);
    $password = $_POST['password'];
    
    // Query ke Supabase - cari user berdasarkan email
    $result = supabase("GET", "dokter", "email=eq.$email");
    
    if($result && count($result) > 0) {
        $user = $result[0];
        
        // Verifikasi password
        if(password_verify($password, $user['prev_hash'])) {
            // Login berhasil
            $_SESSION['user_id'] = $user['id_dokter'];
            $_SESSION['username'] = $user['username'];
            $_SESSION['nama_lengkap'] = $user['nama_lengkap'];
            $_SESSION['email'] = $user['email'];
            $_SESSION['nama_faskes'] = $user['nama_faskes'];
            
            header("Location: dashboard.php");
            exit();
        } else {
            $error = "Password salah!";
        }
    } else {
        $error = "Email tidak ditemukan!";
    }
}
?>
<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Login - MAPOTEK</title>
    
    <!-- Google Fonts -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Nunito+Sans:ital,opsz,wght@0,6..12,200..1000;1,6..12,200..1000&display=swap" rel="stylesheet">
    
    <!-- Bootstrap CSS -->
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.1/dist/css/bootstrap.min.css" rel="stylesheet"
        integrity="sha384-4bw+/aepP/YC94hEpVNVgiZdgIC5+VKNBQNGCHeKRQN+PtmoHDEXuppvnDJzQIu9" crossorigin="anonymous">
    
    <!-- Custom CSS -->
    <link rel="stylesheet" type="text/css" href="css/normalize.css">
    <link rel="stylesheet" type="text/css" href="icomoon/icomoon.css">
    <link rel="stylesheet" type="text/css" href="css/vendor.css">
    <link rel="stylesheet" type="text/css" href="style.css">
</head>
<body data-bs-spy="scroll" data-bs-target="#header" tabindex="0">

    <div id="header-wrap">
        <header id="header">
            <div class="container-fluid">
                <div class="row align-items-center">
                    <div class="col-md-2">
                        <div class="main-logo">
                            <a href="index.php">
                                <h1 class="section-judul">MAPOTEK</h1>
                            </a>
                        </div>
                    </div>

                    <div class="col-md-10 text-end">
                        <a href="index.php" class="btn btn-outline-primary">Kembali ke Home</a>
                    </div>
                </div>
            </div>
        </header>
    </div>

    <section class="py-5">
        <div class="container">
            <div class="row justify-content-center">
                <div class="col-md-5">
                    <div class="card shadow-lg">
                        <div class="card-body p-5">
                            <h2 class="text-center mb-4">Login</h2>
                            
                            <?php if(isset($error)): ?>
                                <div class="alert alert-danger alert-dismissible fade show" role="alert">
                                    <?php echo $error; ?>
                                    <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
                                </div>
                            <?php endif; ?>
                            
                            <?php if(isset($_GET['success'])): ?>
                                <div class="alert alert-success alert-dismissible fade show" role="alert">
                                    Registrasi berhasil! Silakan login.
                                    <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
                                </div>
                            <?php endif; ?>
                            
                            <?php if(isset($_GET['logout'])): ?>
                                <div class="alert alert-info alert-dismissible fade show" role="alert">
                                    Anda telah logout.
                                    <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
                                </div>
                            <?php endif; ?>
                            
                            <form method="POST" action="">
                                <div class="mb-3">
                                    <label class="form-label">Email</label>
                                    <input type="email" class="form-control" name="email" placeholder="Masukkan email" required>
                                </div>
                                
                                <div class="mb-4">
                                    <label class="form-label">Password</label>
                                    <input type="password" class="form-control" name="password" placeholder="Masukkan password" required>
                                </div>
                                
                                <button type="submit" class="btn btn-primary w-100 mb-3">Login</button>
                                
                                <p class="text-center mb-0">
                                    Belum punya akun? <a href="register.php">Daftar sekarang</a>
                                </p>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </section>

    <!-- JavaScript -->
    <script src="js/jquery-1.11.0.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.1/dist/js/bootstrap.bundle.min.js"
        integrity="sha384-HwwvtgBNo3bZJJLYd8oVXjrBZt8cqVSpeBNS5n7C8IVInixGAoxmnlMuBnhbgrkm"
        crossorigin="anonymous"></script>
    <script src="js/plugins.js"></script>
    <script src="js/script.js"></script>
</body>
</html>