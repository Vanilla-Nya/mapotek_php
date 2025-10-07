 <?php
// Mulai session agar kita bisa simpan data user setelah login
session_start();

// Include file database.php yang berisi konfigurasi Supabase & function supabase()
include "database.php"; 

// Cek apakah form dikirim dengan metode POST (artinya tombol "Login" ditekan)
if ($_SERVER["REQUEST_METHOD"] == "POST") {
    
    // Ambil nilai dari input form
    $email = $_POST['email'];       // Email user dari form
    $password = $_POST['password']; // Password user dari form

    // Query ke tabel "dokter" berdasarkan email
    // Supabase query: SELECT * FROM dokter WHERE email = 'email'
    $params = "email=eq." . urlencode($email);
    $result = supabase("GET", "dokter", $params);

    // Cek apakah ada user ditemukan di database
    if ($result && count($result) > 0) {
        $user = $result[0]; // Ambil data dokter pertama (seharusnya unik)

        // Verifikasi password yang diinput dengan password hash di database
        if (password_verify($password, $user['password'])) {
            
            // Jika cocok, simpan data user ke dalam session
            $_SESSION['dokter'] = $user;

            // Redirect ke dashboard (halaman setelah login)
            header("Location: dashboard.php");
            exit(); // Pastikan berhenti setelah redirect
        } else {
            // Kalau password salah
            echo "❌ Password salah!";
        }
    } else {
        // Kalau email tidak ditemukan di database
        echo "❌ Email tidak ditemukan!";
    }
}
