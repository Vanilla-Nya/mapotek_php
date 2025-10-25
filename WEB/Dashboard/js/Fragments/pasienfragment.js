// Enhanced Pasien Fragment with Add Patient Modal
class PasienFragment {
    constructor() {
        this.title = 'Pasien';
        this.icon = 'bi-people';
        this.pasienList = [];
        this.isLoading = false;
        this.hasSearched = false;
        this.regionData = {
            provinsi: [],
            kota: [],
            kecamatan: [],
            kelurahan: []
        };
    }

    render() {
        return `
            <div>
                <div class="d-flex justify-content-between align-items-center mb-4">
                    <div>
                        <h2 class="mb-1">Data Pasien</h2>
                        <p class="text-muted mb-0">Kelola data pasien</p>
                    </div>
                    <button class="btn btn-primary" id="btnTambahPasien">
                        <i class="bi bi-plus-circle me-2"></i>Tambah Pasien
                    </button>
                </div>

                <!-- Search Bar -->
                <div class="card shadow-sm border-0 mb-4">
                    <div class="card-body">
                        <div class="row g-3">
                            <div class="col-md-8">
                                <input type="text" class="form-control" id="searchPasien" 
                                    placeholder="Cari nama pasien atau kosongkan untuk tampilkan semua...">
                            </div>
                            <div class="col-md-4">
                                <button class="btn btn-outline-primary w-100" id="btnSearchPasien">
                                    <i class="bi bi-search me-2"></i>Cari
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
                
                <!-- Pasien List -->
                <div class="card shadow-sm border-0">
                    <div class="card-body">
                        <div id="pasienList">
                            <div class="text-center py-5">
                                <i class="bi bi-search fs-1 text-muted"></i>
                                <p class="text-muted mt-3">Gunakan form pencarian untuk menampilkan data pasien</p>
                            </div>
                        </div>
                    </div>
                </div>

                ${this.renderAddPasienModal()}
            </div>
        `;
    }

    renderAddPasienModal() {
        return `
            <!-- Add Pasien Modal -->
            <div class="modal fade" id="modalTambahPasien" tabindex="-1" aria-hidden="true">
                <div class="modal-dialog modal-lg modal-dialog-scrollable">
                    <div class="modal-content">
                        <div class="modal-header bg-primary text-white">
                            <h5 class="modal-title">
                                <i class="bi bi-person-plus-fill me-2"></i>Tambah Pasien Baru
                            </h5>
                            <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
                        </div>
                        <div class="modal-body">
                            <form id="formTambahPasien">
                                <!-- NIK -->
                                <div class="mb-3">
                                    <label class="form-label">NIK <span class="text-danger">*</span></label>
                                    <input type="text" class="form-control" id="inputNIK" 
                                           maxlength="16" placeholder="Masukkan 16 digit NIK">
                                    <div class="invalid-feedback"></div>
                                </div>

                                <!-- Nama Lengkap -->
                                <div class="mb-3">
                                    <label class="form-label">Nama Lengkap <span class="text-danger">*</span></label>
                                    <input type="text" class="form-control" id="inputNama" 
                                           placeholder="Masukkan nama lengkap">
                                    <div class="invalid-feedback"></div>
                                </div>

                                <!-- Email -->
                                <div class="mb-3">
                                    <label class="form-label">Email <span class="text-danger">*</span></label>
                                    <input type="email" class="form-control" id="inputEmail" 
                                           placeholder="email@example.com">
                                    <div class="invalid-feedback"></div>
                                </div>

                                <!-- Jenis Kelamin -->
                                <div class="mb-3">
                                    <label class="form-label">Jenis Kelamin <span class="text-danger">*</span></label>
                                    <select class="form-select" id="inputJenisKelamin">
                                        <option value="">Pilih Jenis Kelamin</option>
                                        <option value="Laki-Laki">Laki-Laki</option>
                                        <option value="Perempuan">Perempuan</option>
                                        <option value="Tidak Bisa Dijelaskan">Tidak Bisa Dijelaskan</option>
                                    </select>
                                    <div class="invalid-feedback"></div>
                                </div>

                                <!-- Tanggal Lahir -->
                                <div class="mb-3">
                                    <label class="form-label">Tanggal Lahir <span class="text-danger">*</span></label>
                                    <input type="date" class="form-control" id="inputTanggalLahir">
                                    <div class="invalid-feedback"></div>
                                </div>

                                <!-- No Telepon -->
                                <div class="mb-3">
                                    <label class="form-label">No. Telepon <span class="text-danger">*</span></label>
                                    <div class="input-group">
                                        <span class="input-group-text">+62</span>
                                        <input type="tel" class="form-control" id="inputNoTelp" 
                                               placeholder="81234567890">
                                    </div>
                                    <div class="invalid-feedback"></div>
                                </div>

                                <!-- Region Selection -->
                                <div class="border-top pt-3 mb-3">
                                    <h6 class="text-primary mb-3">
                                        <i class="bi bi-geo-alt-fill me-2"></i>Informasi Alamat
                                    </h6>

                                    <!-- Provinsi -->
                                    <div class="mb-3">
                                        <label class="form-label">Provinsi <span class="text-danger">*</span></label>
                                        <select class="form-select" id="inputProvinsi">
                                            <option value="">Memuat provinsi...</option>
                                        </select>
                                        <div class="invalid-feedback"></div>
                                    </div>

                                    <!-- Kota -->
                                    <div class="mb-3">
                                        <label class="form-label">Kota/Kabupaten <span class="text-danger">*</span></label>
                                        <select class="form-select" id="inputKota" disabled>
                                            <option value="">Pilih provinsi terlebih dahulu</option>
                                        </select>
                                        <div class="invalid-feedback"></div>
                                    </div>

                                    <!-- Kecamatan -->
                                    <div class="mb-3">
                                        <label class="form-label">Kecamatan <span class="text-danger">*</span></label>
                                        <select class="form-select" id="inputKecamatan" disabled>
                                            <option value="">Pilih kota terlebih dahulu</option>
                                        </select>
                                        <div class="invalid-feedback"></div>
                                    </div>

                                    <!-- Kelurahan -->
                                    <div class="mb-3">
                                        <label class="form-label">Kelurahan/Desa</label>
                                        <select class="form-select" id="inputKelurahan" disabled>
                                            <option value="">Pilih kecamatan terlebih dahulu</option>
                                        </select>
                                        <div class="invalid-feedback"></div>
                                    </div>

                                    <!-- Alamat Detail -->
                                    <div class="mb-3">
                                        <label class="form-label">Alamat Detail <span class="text-danger">*</span></label>
                                        <textarea class="form-control" id="inputAlamatDetail" rows="3"
                                                  placeholder="Jalan, RT/RW, No. Rumah, dll"></textarea>
                                        <div class="invalid-feedback"></div>
                                    </div>
                                </div>

                                <!-- Password Section -->
                                <div class="border-top pt-3">
                                    <h6 class="text-primary mb-3">
                                        <i class="bi bi-lock-fill me-2"></i>Keamanan Akun
                                    </h6>

                                    <!-- Password -->
                                    <div class="mb-3">
                                        <label class="form-label">Password <span class="text-danger">*</span></label>
                                        <input type="password" class="form-control" id="inputPassword" 
                                               placeholder="Minimal 6 karakter">
                                        <div class="invalid-feedback"></div>
                                    </div>

                                    <!-- Confirm Password -->
                                    <div class="mb-3">
                                        <label class="form-label">Konfirmasi Password <span class="text-danger">*</span></label>
                                        <input type="password" class="form-control" id="inputConfirmPassword" 
                                               placeholder="Ulangi password">
                                        <div class="invalid-feedback"></div>
                                    </div>
                                </div>
                            </form>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">
                                <i class="bi bi-x-circle me-2"></i>Batal
                            </button>
                            <button type="button" class="btn btn-primary" id="btnSimpanPasien">
                                <i class="bi bi-check-circle me-2"></i>Simpan Data
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    async onInit() {
        this.setupEventListeners();
        this.showInitialState();
        await this.loadProvinces();
    }

    showInitialState() {
        const container = document.getElementById('pasienList');
        if (!container) return;

        container.innerHTML = `
            <div class="text-center py-5">
                <i class="bi bi-search fs-1 text-muted"></i>
                <p class="text-muted mt-3">Gunakan form pencarian untuk menampilkan data pasien</p>
                <p class="text-muted small">Ketik nama pasien atau biarkan kosong untuk menampilkan semua data</p>
            </div>
        `;
    }

    async loadPasienData(searchQuery = '') {
        const container = document.getElementById('pasienList');
        if (!container) return;

        this.isLoading = true;
        container.innerHTML = `
            <div class="text-center py-5">
                <div class="spinner-border text-primary" role="status">
                    <span class="visually-hidden">Loading...</span>
                </div>
                <p class="text-muted mt-3">Memuat data pasien...</p>
            </div>
        `;

        try {
            let params = 'select=*';
            
            if (searchQuery && searchQuery.trim() !== '') {
                params += `&nama=ilike.*${encodeURIComponent(searchQuery)}*`;
            }

            const response = await fetch(`/MAPOTEK_PHP/WEB/API/pasien.php?${params}`);
            const result = await response.json();

            if (result.success) {
                this.pasienList = result.data || [];
                this.hasSearched = true;
                this.renderPasienList();
            } else {
                this.showError(result.error || 'Gagal memuat data');
            }
        } catch (error) {
            console.error('Error loading pasien:', error);
            this.showError('Terjadi kesalahan saat memuat data');
        } finally {
            this.isLoading = false;
        }
    }

    renderPasienList() {
        const container = document.getElementById('pasienList');
        if (!container) return;

        if (this.pasienList.length === 0) {
            container.innerHTML = `
                <div class="text-center py-5">
                    <i class="bi bi-people fs-1 text-muted"></i>
                    <p class="text-muted mt-3">Tidak ada data pasien ditemukan</p>
                    <p class="text-muted small">Coba kata kunci lain atau kosongkan pencarian</p>
                </div>
            `;
            return;
        }

        container.innerHTML = `
            <style>
                .patient-card {
                    position: relative;
                    border-radius: 12px;
                    overflow: hidden;
                    background: white;
                    box-shadow: 0 2px 8px rgba(0,0,0,0.1);
                    transition: all 0.3s ease;
                    height: 180px;
                }
                
                .patient-card:hover {
                    transform: translateY(-4px);
                    box-shadow: 0 4px 16px rgba(0,0,0,0.15);
                }
                
                .patient-card-bg {
                    position: absolute;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    background-size: cover;
                    background-position: center;
                    filter: blur(8px) brightness(0.7);
                    transform: scale(1.1);
                }
                
                .patient-card-overlay {
                    position: absolute;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    background: linear-gradient(135deg, rgba(0,0,0,0.6) 0%, rgba(0,0,0,0.3) 100%);
                }
                
                .patient-card-content {
                    position: relative;
                    z-index: 2;
                    padding: 20px;
                    height: 100%;
                    display: flex;
                    align-items: center;
                    gap: 20px;
                }
                
                .patient-avatar {
                    width: 80px;
                    height: 80px;
                    border-radius: 50%;
                    object-fit: cover;
                    border: 3px solid white;
                    box-shadow: 0 4px 8px rgba(0,0,0,0.2);
                    flex-shrink: 0;
                }
                
                .patient-info {
                    flex: 1;
                    color: white;
                    text-shadow: 0 2px 4px rgba(0,0,0,0.3);
                }
                
                .patient-name {
                    font-size: 1.5rem;
                    font-weight: 600;
                    margin-bottom: 8px;
                    color: white;
                }
                
                .patient-details {
                    display: flex;
                    gap: 20px;
                    flex-wrap: wrap;
                    margin-bottom: 10px;
                }
                
                .patient-detail-item {
                    display: flex;
                    align-items: center;
                    gap: 6px;
                    font-size: 0.9rem;
                    color: rgba(255,255,255,0.95);
                }
                
                .patient-detail-item i {
                    opacity: 0.8;
                }
            </style>
            
            <div class="row g-3">
                ${this.pasienList.map((pasien) => {
                    const avatarUrl = pasien.avatar_url || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(pasien.nama) + '&size=200&background=random';
                    
                    return `
                        <div class="col-12 col-lg-6">
                            <div class="patient-card">
                                <div class="patient-card-bg" style="background-image: url('${this.escapeHtml(avatarUrl)}');"></div>
                                <div class="patient-card-overlay"></div>
                                <div class="patient-card-content">
                                    <img src="${this.escapeHtml(avatarUrl)}" 
                                         alt="${this.escapeHtml(pasien.nama)}" 
                                         class="patient-avatar"
                                         onerror="this.src='https://ui-avatars.com/api/?name=${encodeURIComponent(pasien.nama)}&size=200&background=random'">
                                    <div class="patient-info">
                                        <h5 class="patient-name">${this.escapeHtml(pasien.nama)}</h5>
                                        <div class="patient-details">
                                            <div class="patient-detail-item">
                                                <i class="bi bi-calendar"></i>
                                                <span>${this.calculateAge(pasien.tanggal_lahir)} tahun</span>
                                            </div>
                                            <div class="patient-detail-item">
                                                <i class="bi bi-telephone"></i>
                                                <span>${this.escapeHtml(pasien.no_telp || '-')}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    `;
                }).join('')}
            </div>
            
            <div class="mt-4 text-muted small">
                <i class="bi bi-info-circle me-1"></i>
                Menampilkan ${this.pasienList.length} data pasien
            </div>
        `;
    }

    setupEventListeners() {
        const btnTambah = document.getElementById('btnTambahPasien');
        const btnSearch = document.getElementById('btnSearchPasien');
        const searchInput = document.getElementById('searchPasien');

        if (btnTambah) {
            btnTambah.addEventListener('click', () => this.showAddModal());
        }

        if (btnSearch) {
            btnSearch.addEventListener('click', () => this.searchPasien());
        }

        if (searchInput) {
            searchInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') this.searchPasien();
            });
        }

        // Setup form event listeners
        setTimeout(() => {
            this.setupFormListeners();
        }, 100);
    }

    setupFormListeners() {
        const btnSimpan = document.getElementById('btnSimpanPasien');
        const inputProvinsi = document.getElementById('inputProvinsi');
        const inputKota = document.getElementById('inputKota');
        const inputKecamatan = document.getElementById('inputKecamatan');

        if (btnSimpan) {
            btnSimpan.addEventListener('click', () => this.savePasien());
        }

        if (inputProvinsi) {
            inputProvinsi.addEventListener('change', (e) => this.onProvinsiChange(e.target.value));
        }

        if (inputKota) {
            inputKota.addEventListener('change', (e) => this.onKotaChange(e.target.value));
        }

        if (inputKecamatan) {
            inputKecamatan.addEventListener('change', (e) => this.onKecamatanChange(e.target.value));
        }
    }

    async loadProvinces() {
        try {
            const response = await fetch('https://www.emsifa.com/api-wilayah-indonesia/api/provinces.json');
            const data = await response.json();
            this.regionData.provinsi = data;

            const select = document.getElementById('inputProvinsi');
            if (select) {
                select.innerHTML = '<option value="">Pilih Provinsi</option>' +
                    data.map(p => `<option value="${p.id}">${p.name}</option>`).join('');
            }
        } catch (error) {
            console.error('Error loading provinces:', error);
        }
    }

    async onProvinsiChange(provinsiId) {
        const kotaSelect = document.getElementById('inputKota');
        const kecamatanSelect = document.getElementById('inputKecamatan');
        const kelurahanSelect = document.getElementById('inputKelurahan');

        if (!provinsiId) {
            kotaSelect.disabled = true;
            kotaSelect.innerHTML = '<option value="">Pilih provinsi terlebih dahulu</option>';
            kecamatanSelect.disabled = true;
            kecamatanSelect.innerHTML = '<option value="">Pilih kota terlebih dahulu</option>';
            kelurahanSelect.disabled = true;
            kelurahanSelect.innerHTML = '<option value="">Pilih kecamatan terlebih dahulu</option>';
            return;
        }

        try {
            kotaSelect.innerHTML = '<option value="">Memuat kota...</option>';
            kotaSelect.disabled = true;

            const response = await fetch(`https://www.emsifa.com/api-wilayah-indonesia/api/regencies/${provinsiId}.json`);
            const data = await response.json();
            this.regionData.kota = data;

            kotaSelect.innerHTML = '<option value="">Pilih Kota/Kabupaten</option>' +
                data.map(k => `<option value="${k.id}">${k.name}</option>`).join('');
            kotaSelect.disabled = false;

            kecamatanSelect.disabled = true;
            kecamatanSelect.innerHTML = '<option value="">Pilih kota terlebih dahulu</option>';
            kelurahanSelect.disabled = true;
            kelurahanSelect.innerHTML = '<option value="">Pilih kecamatan terlebih dahulu</option>';
        } catch (error) {
            console.error('Error loading cities:', error);
            kotaSelect.innerHTML = '<option value="">Gagal memuat data</option>';
        }
    }

    async onKotaChange(kotaId) {
        const kecamatanSelect = document.getElementById('inputKecamatan');
        const kelurahanSelect = document.getElementById('inputKelurahan');

        if (!kotaId) {
            kecamatanSelect.disabled = true;
            kecamatanSelect.innerHTML = '<option value="">Pilih kota terlebih dahulu</option>';
            kelurahanSelect.disabled = true;
            kelurahanSelect.innerHTML = '<option value="">Pilih kecamatan terlebih dahulu</option>';
            return;
        }

        try {
            kecamatanSelect.innerHTML = '<option value="">Memuat kecamatan...</option>';
            kecamatanSelect.disabled = true;

            const response = await fetch(`https://www.emsifa.com/api-wilayah-indonesia/api/districts/${kotaId}.json`);
            const data = await response.json();
            this.regionData.kecamatan = data;

            kecamatanSelect.innerHTML = '<option value="">Pilih Kecamatan</option>' +
                data.map(k => `<option value="${k.id}">${k.name}</option>`).join('');
            kecamatanSelect.disabled = false;

            kelurahanSelect.disabled = true;
            kelurahanSelect.innerHTML = '<option value="">Pilih kecamatan terlebih dahulu</option>';
        } catch (error) {
            console.error('Error loading districts:', error);
            kecamatanSelect.innerHTML = '<option value="">Gagal memuat data</option>';
        }
    }

    async onKecamatanChange(kecamatanId) {
        const kelurahanSelect = document.getElementById('inputKelurahan');

        if (!kecamatanId) {
            kelurahanSelect.disabled = true;
            kelurahanSelect.innerHTML = '<option value="">Pilih kecamatan terlebih dahulu</option>';
            return;
        }

        try {
            kelurahanSelect.innerHTML = '<option value="">Memuat kelurahan...</option>';
            kelurahanSelect.disabled = true;

            const response = await fetch(`https://www.emsifa.com/api-wilayah-indonesia/api/villages/${kecamatanId}.json`);
            const data = await response.json();
            this.regionData.kelurahan = data;

            kelurahanSelect.innerHTML = '<option value="">Pilih Kelurahan/Desa</option>' +
                data.map(k => `<option value="${k.id}">${k.name}</option>`).join('');
            kelurahanSelect.disabled = false;
        } catch (error) {
            console.error('Error loading villages:', error);
            kelurahanSelect.innerHTML = '<option value="">Gagal memuat data</option>';
        }
    }

    showAddModal() {
        const modal = new bootstrap.Modal(document.getElementById('modalTambahPasien'));
        this.resetForm();
        modal.show();
    }

    resetForm() {
        document.getElementById('formTambahPasien').reset();
        document.querySelectorAll('.is-invalid').forEach(el => el.classList.remove('is-invalid'));
        document.getElementById('inputKota').disabled = true;
        document.getElementById('inputKecamatan').disabled = true;
        document.getElementById('inputKelurahan').disabled = true;
    }

    validateForm() {
        const fields = {
            inputNIK: { 
                required: true, 
                minLength: 16, 
                maxLength: 16,
                message: 'NIK harus 16 digit' 
            },
            inputNama: { 
                required: true, 
                minLength: 3,
                message: 'Nama minimal 3 karakter' 
            },
            inputEmail: { 
                required: true, 
                pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                message: 'Format email tidak valid' 
            },
            inputJenisKelamin: { 
                required: true,
                message: 'Pilih jenis kelamin' 
            },
            inputTanggalLahir: { 
                required: true,
                message: 'Tanggal lahir harus diisi' 
            },
            inputNoTelp: { 
                required: true, 
                minLength: 10,
                maxLength: 13,
                message: 'No. telepon tidak valid (10-13 digit)' 
            },
            inputProvinsi: { 
                required: true,
                message: 'Pilih provinsi' 
            },
            inputKota: { 
                required: true,
                message: 'Pilih kota/kabupaten' 
            },
            inputKecamatan: { 
                required: true,
                message: 'Pilih kecamatan' 
            },
            inputAlamatDetail: { 
                required: true,
                message: 'Alamat detail harus diisi' 
            },
            inputPassword: { 
                required: true, 
                minLength: 6,
                message: 'Password minimal 6 karakter' 
            },
            inputConfirmPassword: { 
                required: true,
                match: 'inputPassword',
                message: 'Password tidak cocok' 
            }
        };

        let isValid = true;

        for (const [fieldId, rules] of Object.entries(fields)) {
            const input = document.getElementById(fieldId);
            const value = input.value.trim();

            input.classList.remove('is-invalid');

            if (rules.required && !value) {
                this.showFieldError(input, rules.message);
                isValid = false;
                continue;
            }

            if (rules.minLength && value.length < rules.minLength) {
                this.showFieldError(input, rules.message);
                isValid = false;
                continue;
            }

            if (rules.maxLength && value.length > rules.maxLength) {
                this.showFieldError(input, rules.message);
                isValid = false;
                continue;
            }

            if (rules.pattern && !rules.pattern.test(value)) {
                this.showFieldError(input, rules.message);
                isValid = false;
                continue;
            }

            if (rules.match) {
                const matchInput = document.getElementById(rules.match);
                if (value !== matchInput.value.trim()) {
                    this.showFieldError(input, rules.message);
                    isValid = false;
                    continue;
                }
            }
        }

        return isValid;
    }

    showFieldError(input, message) {
        input.classList.add('is-invalid');
        const feedback = input.parentElement.querySelector('.invalid-feedback');
        if (feedback) {
            feedback.textContent = message;
        }
    }

    formatAddress() {
        const provinsiId = document.getElementById('inputProvinsi').value;
        const kotaId = document.getElementById('inputKota').value;
        const kecamatanId = document.getElementById('inputKecamatan').value;
        const kelurahanId = document.getElementById('inputKelurahan').value;
        const alamatDetail = document.getElementById('inputAlamatDetail').value.trim();

        const provinsiName = this.regionData.provinsi.find(p => p.id == provinsiId)?.name || '';
        const kotaName = this.regionData.kota.find(k => k.id == kotaId)?.name || '';
        const kecamatanName = this.regionData.kecamatan.find(k => k.id == kecamatanId)?.name || '';
        const kelurahanName = this.regionData.kelurahan.find(k => k.id == kelurahanId)?.name || '';

        let address = '';
        
        if (provinsiName) address += `${provinsiName}(${provinsiId})`;
        if (kotaName) address += `,${kotaName}(${kotaId})`;
        if (kecamatanName) address += `,${kecamatanName}(${kecamatanId})`;
        if (kelurahanName) address += `,${kelurahanName}(${kelurahanId})`;
        if (alamatDetail) address += `,${alamatDetail}`;

        return address;
    }

    async savePasien() {
        console.log("Starting save process...");
        
        if (!this.validateForm()) {
            console.log("Form validation failed");
            return;
        }

        const btnSimpan = document.getElementById('btnSimpanPasien');
        const originalText = btnSimpan.innerHTML;
        btnSimpan.disabled = true;
        btnSimpan.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Menyimpan...';

        try {
            // Get form values
            const email = document.getElementById('inputEmail').value.trim();
            const password = document.getElementById('inputPassword').value;
            const nik = document.getElementById('inputNIK').value.trim();
            const nama = document.getElementById('inputNama').value.trim();
            const jenis_kelamin = document.getElementById('inputJenisKelamin').value;
            const tanggal_lahir = document.getElementById('inputTanggalLahir').value;
            const no_telp = document.getElementById('inputNoTelp').value.trim();
            
            console.log("Form values collected:", { email, nama, nik });

            // Format address
            const formattedAddress = this.formatAddress();
            console.log("Formatted address:", formattedAddress);
            
            // Validate address is not empty
            if (!formattedAddress || formattedAddress.trim() === '') {
                throw new Error('Alamat tidak boleh kosong. Pastikan semua field alamat terisi.');
            }

            // Step 1: Register user in auth
            // Auth needs: email, password, nama, alamat (for user profile/metadata)
            console.log("Registering user...");
            const authPayload = {
                email: email,
                password: password,
                nama: nama,
                alamat: formattedAddress
            };
            console.log("Auth payload:", authPayload);
            
            const authResponse = await fetch('/MAPOTEK_PHP/WEB/API/auth.php', {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(authPayload)
            });

            const authResult = await authResponse.json();
            console.log("Auth result:", authResult);

            if (!authResult.success) {
                throw new Error(authResult.error || 'Gagal membuat akun');
            }

            // Get the user token from auth result
            const userToken = authResult.data?.access_token || 
                            authResult.data?.session?.access_token;
            
            console.log("Extracted token:", userToken);
            console.log("Full auth response:", authResult);
            
            if (!userToken) {
                console.error("Full auth result:", JSON.stringify(authResult, null, 2));
                throw new Error('Token tidak ditemukan setelah registrasi. Cek console untuk detail.');
            }

            // Step 2: Insert patient data with user token
            console.log("Inserting patient data...");
            console.log("Using token:", userToken);
            
            const patientData = {
                nik: nik,
                nama: nama,
                jenis_kelamin: jenis_kelamin,
                tanggal_lahir: tanggal_lahir,
                no_telp: no_telp,
                alamat: formattedAddress
            };

            console.log("Patient data to send:", patientData);
            console.log("Patient data JSON:", JSON.stringify(patientData));

            const response = await fetch('/MAPOTEK_PHP/WEB/API/pasien.php', {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${userToken}`
                },
                body: JSON.stringify(patientData)
            });

            console.log("Response status:", response.status);
            console.log("Response headers:", [...response.headers.entries()]);
            
            const responseText = await response.text();
            console.log("Raw response from pasien.php:", responseText);

            let result;
            try {
                result = JSON.parse(responseText);
            } catch (e) {
                console.error("Failed to parse response:", responseText);
                throw new Error('Invalid response from server: ' + responseText);
            }

            console.log("Parsed result:", result);

            if (result.success) {
                // Close modal
                const modal = bootstrap.Modal.getInstance(document.getElementById('modalTambahPasien'));
                modal.hide();

                // Show success message
                this.showSuccessToast('Pasien berhasil ditambahkan!');

                // Reload data
                const searchQuery = document.getElementById('searchPasien').value;
                await this.loadPasienData(searchQuery);
            } else {
                throw new Error(result.error || 'Gagal menyimpan data');
            }
        } catch (error) {
            console.error('Error saving pasien:', error);
            alert('Gagal menyimpan data: ' + error.message);
        } finally {
            btnSimpan.disabled = false;
            btnSimpan.innerHTML = originalText;
        }
    }

    showSuccessToast(message) {
        // Create toast if not exists
        if (!document.getElementById('successToast')) {
            const toastHTML = `
                <div class="position-fixed top-0 end-0 p-3" style="z-index: 9999">
                    <div id="successToast" class="toast" role="alert">
                        <div class="toast-header bg-success text-white">
                            <i class="bi bi-check-circle-fill me-2"></i>
                            <strong class="me-auto">Berhasil</strong>
                            <button type="button" class="btn-close btn-close-white" data-bs-dismiss="toast"></button>
                        </div>
                        <div class="toast-body"></div>
                    </div>
                </div>
            `;
            document.body.insertAdjacentHTML('beforeend', toastHTML);
        }

        const toastEl = document.getElementById('successToast');
        toastEl.querySelector('.toast-body').textContent = message;
        const toast = new bootstrap.Toast(toastEl);
        toast.show();
    }

    searchPasien() {
        if (this.isLoading) return;
        
        const query = document.getElementById('searchPasien').value;
        this.loadPasienData(query);
    }

    calculateAge(birthDate) {
        if (!birthDate) return '-';
        const today = new Date();
        const birth = new Date(birthDate);
        let age = today.getFullYear() - birth.getFullYear();
        const monthDiff = today.getMonth() - birth.getMonth();
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
            age--;
        }
        return age;
    }

    showError(message) {
        const container = document.getElementById('pasienList');
        if (!container) return;

        container.innerHTML = `
            <div class="alert alert-danger" role="alert">
                <i class="bi bi-exclamation-triangle me-2"></i>
                ${this.escapeHtml(message)}
            </div>
        `;
    }

    escapeHtml(text) {
        const map = {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#039;'
        };
        return String(text).replace(/[&<>"']/g, m => map[m]);
    }

    onDestroy() {
        console.log('Pasien fragment destroyed');
    }
}

// Make instance available globally
const pasienFragment = new PasienFragment();