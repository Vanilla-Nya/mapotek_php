<!DOCTYPE html>
<html lang="id">
<head>
	<meta charset="UTF-8">
	<meta name="viewport" content="width=device-width, initial-scale=1.0">
	<title>Register - MAPOTEK</title>
	<!-- Tambahkan CSS Bootstrap dan CSS custom Anda -->
	<link rel="stylesheet" href="path/to/bootstrap.css">
	<link rel="stylesheet" href="path/to/style.css">
</head>
<body>
	<div class="container">
		<div class="row justify-content-center align-items-center min-vh-100 py-5">
			<div class="col-md-6">
				<div class="card shadow">
					<div class="card-body p-5">
						<div class="text-center mb-4">
							<h1 class="section-judul">MAPOTEK</h1>
						</div>
						
						<h2 class="text-center mb-4">Register</h2>
						<form action="proses_register.php" method="POST">
							<div class="mb-3">
								<label class="form-label">Nama Faskes</label>
								<input type="text" class="form-control" name="nama_faskes" placeholder="Masukkan Nama Faskes" required>
							</div>
							<div class="mb-3">
								<label class="form-label">Nama Lengkap</label>
								<input type="text" class="form-control" name="nama_lengkap" placeholder="Masukkan Nama Lengkap" required>
							</div>
							<div class="mb-3">
								<label class="form-label">Username</label>
								<input type="text" class="form-control" name="username" placeholder="Masukkan Username" required>
							</div>
							<div class="mb-3">
								<label class="form-label">Jenis Kelamin</label>
								<select class="form-control" name="jenis_kelamin" required>
									<option value="">-- Pilih Jenis Kelamin --</option>
									<option value="Laki-laki">Laki-laki</option>
									<option value="Perempuan">Perempuan</option>
								</select>
							</div>
							<div class="mb-3">
								<label class="form-label">Alamat</label>
								<textarea class="form-control" name="alamat" placeholder="Masukkan Alamat" rows="3" required></textarea>
							</div>
							<div class="mb-3">
								<label class="form-label">No. Telepon</label>
								<input type="text" class="form-control" name="no_telp" placeholder="Masukkan No. Telepon" required>
							</div>
							<div class="mb-3">
								<label class="form-label">Email</label>
								<input type="email" class="form-control" name="email" placeholder="Masukkan Email" required>
							</div>
							<div class="mb-3">
								<label class="form-label">Password</label>
								<input type="password" class="form-control" name="password" placeholder="Masukkan Password" required>
							</div>
							<button type="submit" class="btn btn-success w-100">Register</button>
							<p class="text-center mt-3">
								Sudah punya akun? <a href="login.html">Login</a>
							</p>
							<p class="text-center">
								<a href="index.html">Kembali ke Home</a>
							</p>
						</form>
					</div>
				</div>
			</div>
		</div>
	</div>

	<!-- Tambahkan JS Bootstrap -->
	<script src="path/to/bootstrap.bundle.js"></script>
</body>
</html>