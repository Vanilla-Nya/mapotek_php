class ProfileFragment {
    constructor() {
        this.title = 'Profile';
        this.icon = 'bi-person-circle';
    }

    render() {
        const html = `
            <div class="row justify-content-center">
                <div class="col-lg-9">
                    <!-- Profile Header Card -->
                    <div class="card border-0 shadow-sm mb-4">
                        <div class="card-body text-center py-5">
                            <div class="mb-3">
                                <div class="bg-gradient rounded-circle d-inline-flex align-items-center justify-content-center" 
                                    style="width: 100px; height: 100px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);">
                                    <i class="bi bi-person-fill text-white" style="font-size: 50px;"></i>
                                </div>
                            </div>
                            <h3 id="profileDisplayName" class="mb-1 fw-bold">Loading...</h3>
                            <p id="profileDisplayEmail" class="text-muted mb-3">Loading...</p>
                            <button class="btn btn-outline-primary btn-sm" id="btnEditToggle">
                                <i class="bi bi-pencil me-1"></i> Edit Profile
                            </button>
                        </div>
                    </div>

                    <!-- Profile Form Card -->
                    <div class="card border-0 shadow-sm">
                        <div class="card-body p-4">
                            <h5 class="card-title mb-4 pb-3 border-bottom">
                                <i class="bi bi-info-circle me-2 text-primary"></i>Informasi Pribadi
                            </h5>
                            
                            <form id="profileForm">
                                <div class="row g-3">
                                    <!-- Email -->
                                    <div class="col-md-6">
                                        <label class="form-label text-muted small mb-1">Email</label>
                                        <input type="email" class="form-control" id="email" readonly>
                                    </div>

                                    <!-- Nama Faskes -->
                                    <div class="col-md-6">
                                        <label class="form-label text-muted small mb-1">Nama Faskes</label>
                                        <input type="text" class="form-control" id="nama_faskes" disabled>
                                    </div>

                                    <!-- Nama Lengkap -->
                                    <div class="col-md-6">
                                        <label class="form-label text-muted small mb-1">Nama Lengkap</label>
                                        <input type="text" class="form-control" id="nama_lengkap" disabled>
                                    </div>

                                    <!-- Username -->
                                    <div class="col-md-6">
                                        <label class="form-label text-muted small mb-1">Username</label>
                                        <input type="text" class="form-control" id="username" disabled>
                                    </div>

                                    <!-- Jenis Kelamin -->
                                    <div class="col-md-6">
                                        <label class="form-label text-muted small mb-1">Jenis Kelamin</label>
                                        <select class="form-select" id="jenis_kelamin" disabled>
                                            <option value="">Pilih Jenis Kelamin</option>
                                            <option value="Laki-laki">Laki-laki</option>
                                            <option value="Perempuan">Perempuan</option>
                                        </select>
                                    </div>

                                    <!-- No. Telepon -->
                                    <div class="col-md-6">
                                        <label class="form-label text-muted small mb-1">No. Telepon</label>
                                        <input type="text" class="form-control" id="no_telp" disabled>
                                    </div>

                                    <!-- RFID -->
                                    <div class="col-md-6">
                                        <label class="form-label text-muted small mb-1">RFID</label>
                                        <input type="text" class="form-control" id="rfid" placeholder="Belum diatur" disabled>
                                    </div>

                                    <!-- Jam Kerja -->
                                    <div class="col-md-6">
                                        <label class="form-label text-muted small mb-1">Jam Kerja</label>
                                        <input type="text" class="form-control" id="jam_kerja" placeholder="Contoh: 08:00 - 17:00" disabled>
                                    </div>

                                    <!-- Alamat -->
                                    <div class="col-12">
                                        <label class="form-label text-muted small mb-1">Alamat</label>
                                        <textarea class="form-control" id="alamat" rows="3" disabled></textarea>
                                    </div>
                                </div>

                                <!-- Action Buttons -->
                                <div class="d-none gap-2 justify-content-end mt-4 pt-3 border-top" id="actionButtons">
                                    <button type="button" class="btn btn-light" id="btnCancel">
                                        <i class="bi bi-x-circle me-1"></i> Batal
                                    </button>
                                    <button type="submit" class="btn btn-primary">
                                        <i class="bi bi-check-circle me-1"></i> Simpan Perubahan
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>

                    <!-- Timestamps -->
                    <div class="card border-0 shadow-sm mt-3">
                        <div class="card-body p-3">
                            <div class="d-flex justify-content-between text-muted small">
                                <span><i class="bi bi-calendar-plus me-2"></i>Dibuat: <span id="created_at">-</span></span>
                                <span><i class="bi bi-clock-history me-2"></i>Update: <span id="updated_at">-</span></span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
        return html;
    }

    async onInit() {
        const user = JSON.parse(localStorage.getItem('user') || 'null');
        
        if (!user) {
            alert('Session expired. Please login again.');
            window.location.href = '../LandingPage/booksaw-1.0.0/index.html';
            return;
        }

        this.formFields = [
            'nama_faskes', 'nama_lengkap', 'username', 'jenis_kelamin',
            'no_telp', 'rfid', 'jam_kerja', 'alamat'
        ];

        await this.loadProfile();
        this.attachEventListeners();
    }

    attachEventListeners() {
        document.getElementById('btnEditToggle').addEventListener('click', () => {
            this.enableEdit();
        });

        document.getElementById('btnCancel').addEventListener('click', () => {
            this.cancelEdit();
        });

        document.getElementById('profileForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveProfile();
        });
    }

    enableEdit() {
        this.formFields.forEach(field => {
            document.getElementById(field).disabled = false;
        });
        document.getElementById('actionButtons').classList.remove('d-none');
        document.getElementById('actionButtons').classList.add('d-flex');
        document.getElementById('btnEditToggle').style.display = 'none';
    }

    cancelEdit() {
        this.formFields.forEach(field => {
            document.getElementById(field).disabled = true;
        });
        document.getElementById('actionButtons').classList.remove('d-flex');
        document.getElementById('actionButtons').classList.add('d-none');
        document.getElementById('btnEditToggle').style.display = 'block';
        this.loadProfile();
    }

    async loadProfile() {
        const user = JSON.parse(localStorage.getItem('user'));
        
        console.log('Loading profile for:', user.email); // Debug
        
        try {
            const response = await fetch('../API/auth/profile.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    action: 'get',
                    email: user.email
                })
            });

            const result = await response.json();
            console.log('Profile data received:', result); // Debug
            
            if (result.success) {
                const profile = result.data;
                console.log('Profile:', profile); // Debug
                
                document.getElementById('profileDisplayName').textContent = profile.nama_lengkap || 'Nama Belum Diisi';
                document.getElementById('profileDisplayEmail').textContent = profile.email || '';
                
                document.getElementById('email').value = profile.email || '';
                document.getElementById('nama_faskes').value = profile.nama_faskes || '';
                document.getElementById('nama_lengkap').value = profile.nama_lengkap || '';
                document.getElementById('username').value = profile.username || '';
                document.getElementById('jenis_kelamin').value = profile.jenis_kelamin || '';
                document.getElementById('no_telp').value = profile.no_telp || '';
                document.getElementById('rfid').value = profile.rfid || '';
                document.getElementById('jam_kerja').value = profile.jam_kerja || '';
                document.getElementById('alamat').value = profile.alamat || '';
                
                if (profile.created_at) {
                    document.getElementById('created_at').textContent = new Date(profile.created_at).toLocaleString('id-ID');
                }
                if (profile.updated_at) {
                    document.getElementById('updated_at').textContent = new Date(profile.updated_at).toLocaleString('id-ID');
                }
            } else {
                console.error('Profile load failed:', result.message);
                alert('Gagal memuat profil: ' + result.message);
            }
        } catch (error) {
            console.error('Error loading profile:', error);
            alert('Terjadi kesalahan saat memuat profil');
        }
    }

    async saveProfile() {
        const user = JSON.parse(localStorage.getItem('user'));
        
        const formData = {
            action: 'update',
            email: user.email,
            nama_faskes: document.getElementById('nama_faskes').value,
            nama_lengkap: document.getElementById('nama_lengkap').value,
            username: document.getElementById('username').value,
            jenis_kelamin: document.getElementById('jenis_kelamin').value,
            no_telp: document.getElementById('no_telp').value,
            rfid: document.getElementById('rfid').value,
            jam_kerja: document.getElementById('jam_kerja').value,
            alamat: document.getElementById('alamat').value
        };
        
        try {
            const response = await fetch('../API/auth/profile.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });
            
            const result = await response.json();
            
            if (result.success) {
                alert('Profile berhasil diupdate!');
                
                user.nama_lengkap = formData.nama_lengkap;
                user.nama_faskes = formData.nama_faskes;
                localStorage.setItem('user', JSON.stringify(user));
                
                document.getElementById('userName').textContent = formData.nama_lengkap;
                
                this.cancelEdit();
            } else {
                alert('Gagal mengupdate profil: ' + result.message);
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Terjadi kesalahan saat menyimpan profil');
        }
    }

    onDestroy() {
        // Cleanup if needed
    }
}