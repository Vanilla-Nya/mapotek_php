// Enhanced Pasien Fragment with Patient History Modal & Skeleton Loaders
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
        this.selectedPatient = null;
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
                ${this.renderPatientHistoryModal()}
                ${this.getStyles()}
            </div>
        `;
    }

    getStyles() {
        return `
            <style>
                /* Skeleton Loader Styles */
                .skeleton {
                    background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
                    background-size: 200% 100%;
                    animation: skeleton-loading 1.5s infinite;
                    border-radius: 8px;
                }

                @keyframes skeleton-loading {
                    0% { background-position: 200% 0; }
                    100% { background-position: -200% 0; }
                }

                .skeleton-text {
                    height: 16px;
                    margin-bottom: 8px;
                    border-radius: 4px;
                }

                .skeleton-text.large {
                    height: 24px;
                }

                .skeleton-avatar {
                    width: 80px;
                    height: 80px;
                    border-radius: 50%;
                    flex-shrink: 0;
                }

                .skeleton-card {
                    height: 180px;
                    border-radius: 12px;
                }

                .skeleton-accordion-header {
                    height: 70px;
                    border-radius: 8px;
                    margin-bottom: 8px;
                }

                /* Patient Card Styles */
                .patient-card {
                    position: relative;
                    border-radius: 12px;
                    overflow: hidden;
                    background: white;
                    box-shadow: 0 2px 8px rgba(0,0,0,0.1);
                    transition: all 0.3s ease;
                    height: 180px;
                    cursor: pointer;
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
        `;
    }

    // ========================================
    // ✅ SKELETON GENERATOR FUNCTIONS
    // ========================================

    generatePatientCardSkeleton(count = 6) {
        return Array(count).fill(0).map(() => `
            <div class="col-12 col-lg-6">
                <div class="skeleton skeleton-card">
                    <div class="patient-card-content">
                        <div class="skeleton skeleton-avatar"></div>
                        <div style="flex: 1;">
                            <div class="skeleton skeleton-text large" style="width: 70%;"></div>
                            <div class="skeleton skeleton-text" style="width: 40%; margin-top: 12px;"></div>
                            <div class="skeleton skeleton-text" style="width: 50%; margin-top: 8px;"></div>
                        </div>
                    </div>
                </div>
            </div>
        `).join('');
    }

    generateHistorySkeleton(count = 3) {
        return Array(count).fill(0).map(() => `
            <div class="mb-3">
                <div class="skeleton skeleton-accordion-header"></div>
            </div>
        `).join('');
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

    renderPatientHistoryModal() {
        return `
            <!-- Patient History Modal -->
            <div class="modal fade" id="modalRiwayatPasien" tabindex="-1" aria-hidden="true">
                <div class="modal-dialog modal-xl modal-dialog-scrollable">
                    <div class="modal-content">
                        <div class="modal-header bg-gradient" style="background: linear-gradient(135deg, #065f46 0%, #0891b2 100%);">
                            <h5 class="modal-title text-white">
                                <i class="bi bi-clock-history me-2"></i>Riwayat Pemeriksaan Pasien
                            </h5>
                            <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
                        </div>
                        <div class="modal-body">
                            <!-- Patient Info Header -->
                            <div id="patientInfoHeader" class="mb-4"></div>
                            
                            <!-- History Content -->
                            <div id="historyContent">
                                <div class="text-center py-5">
                                    <div class="spinner-border text-primary" role="status">
                                        <span class="visually-hidden">Loading...</span>
                                    </div>
                                    <p class="text-muted mt-3">Memuat riwayat pemeriksaan...</p>
                                </div>
                            </div>
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
        
        // ✅ SHOW SKELETON FIRST
        container.innerHTML = `<div class="row g-3">${this.generatePatientCardSkeleton(6)}</div>`;

        try {
            // ✅ Small delay to show skeleton animation
            await new Promise(resolve => setTimeout(resolve, 300));

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
            <div class="row g-3">
                ${this.pasienList.map((pasien) => {
                    const avatarUrl = pasien.avatar_url || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(pasien.nama) + '&size=200&background=random';
                    
                    return `
                        <div class="col-12 col-lg-6">
                            <div class="patient-card" onclick="pasienFragment.showPatientHistory('${pasien.id_pasien}')">
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
                Menampilkan ${this.pasienList.length} data pasien. Klik kartu untuk melihat riwayat.
            </div>
        `;
    }

    async showPatientHistory(patientId) {
        this.selectedPatient = this.pasienList.find(p => p.id_pasien === patientId);
        
        if (!this.selectedPatient) {
            console.log('Patient not in current list, fetching data...');
            try {
                // Fetch patient from API
                const response = await fetch(`/MAPOTEK_PHP/WEB/API/pasien.php?select=*&id_pasien=eq.${patientId}`);
                const result = await response.json();
                
                if (result.success && result.data && result.data.length > 0) {
                    this.selectedPatient = result.data[0];
                } else {
                    alert('Data pasien tidak ditemukan');
                    return;
                }
            } catch (error) {
                alert('Gagal memuat data pasien: ' + error.message);
                return;
            }
        }

        const modal = new bootstrap.Modal(document.getElementById('modalRiwayatPasien'));
        modal.show();

        // Render patient header
        this.renderPatientHeader();

        // Load history
        await this.loadPatientHistory(patientId);
    }

    renderPatientHeader() {
        const container = document.getElementById('patientInfoHeader');
        if (!container || !this.selectedPatient) return;

        const avatarUrl = this.selectedPatient.avatar_url || 
            'https://ui-avatars.com/api/?name=' + encodeURIComponent(this.selectedPatient.nama) + '&size=150&background=random';

        container.innerHTML = `
            <div class="card border-0 shadow-sm">
                <div class="card-body">
                    <div class="row align-items-center">
                        <div class="col-auto">
                            <img src="${this.escapeHtml(avatarUrl)}" 
                                class="rounded-circle" 
                                width="100" 
                                height="100"
                                alt="${this.escapeHtml(this.selectedPatient.nama)}">
                        </div>
                        <div class="col">
                            <h4 class="mb-2">${this.escapeHtml(this.selectedPatient.nama)}</h4>
                            <div class="row g-3">
                                <div class="col-md-6">
                                    <div class="d-flex align-items-center text-muted">
                                        <i class="bi bi-card-text me-2"></i>
                                        <small>NIK: ${this.escapeHtml(this.selectedPatient.nik || '-')}</small>
                                    </div>
                                </div>
                                <div class="col-md-6">
                                    <div class="d-flex align-items-center text-muted">
                                        <i class="bi bi-gender-ambiguous me-2"></i>
                                        <small>${this.escapeHtml(this.selectedPatient.jenis_kelamin || '-')}</small>
                                    </div>
                                </div>
                                <div class="col-md-6">
                                    <div class="d-flex align-items-center text-muted">
                                        <i class="bi bi-calendar3 me-2"></i>
                                        <small>${this.formatDate(this.selectedPatient.tanggal_lahir)} (${this.calculateAge(this.selectedPatient.tanggal_lahir)} tahun)</small>
                                    </div>
                                </div>
                                <div class="col-md-6">
                                    <div class="d-flex align-items-center text-muted">
                                        <i class="bi bi-telephone me-2"></i>
                                        <small>${this.escapeHtml(this.selectedPatient.no_telp || '-')}</small>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }
    
    async loadPatientHistory(patientId) {
        const container = document.getElementById('historyContent');
        if (!container) return;

        // ✅ SHOW SKELETON FIRST
        container.innerHTML = this.generateHistorySkeleton(5);

        try {
            // ✅ Small delay to show skeleton animation
            await new Promise(resolve => setTimeout(resolve, 300));

            // Step 1: Get all unique encounters for this patient (completed only)
            const antrianResponse = await fetch(`/MAPOTEK_PHP/WEB/API/auth/antrian.php?select=*&id_pasien=eq.${patientId}&status_antrian=eq.Selesai&id_encounter_satusehat=not.is.null&order=tanggal_antrian.desc,jam_antrian.desc`);
            const antrianResult = await antrianResponse.json();

            if (!antrianResult.success || !antrianResult.data || antrianResult.data.length === 0) {
                container.innerHTML = `
                    <div class="text-center py-5">
                        <i class="bi bi-inbox fs-1 text-muted"></i>
                        <p class="text-muted mt-3">Belum ada riwayat pemeriksaan</p>
                        <p class="text-muted small">Pasien ini belum pernah melakukan pemeriksaan</p>
                    </div>
                `;
                return;
            }

            // Group by unique encounter ID
            const uniqueEncounters = new Map();
            antrianResult.data.forEach(antrian => {
                const encounterId = antrian.id_encounter_satusehat;
                if (!uniqueEncounters.has(encounterId)) {
                    uniqueEncounters.set(encounterId, antrian);
                }
            });

            const uniqueAntrianData = Array.from(uniqueEncounters.values());
            console.log(`📊 Found ${uniqueAntrianData.length} unique examinations`);

            // For each unique examination
            const historyPromises = uniqueAntrianData.map(async (displayAntrian) => {
                const encounterId = displayAntrian.id_encounter_satusehat;
                
                console.log(`🔍 Processing encounter: ${encounterId}`);
                
                // Step 2: Get ALL antrian entries with this encounter
                const allAntrianResponse = await fetch(`/MAPOTEK_PHP/WEB/API/auth/antrian.php?select=id_antrian&id_encounter_satusehat=eq.${encounterId}`);
                const allAntrianResult = await allAntrianResponse.json();
                
                let pemeriksaan = null;
                let anamnesa = null;
                let diagnosa = [];
                let diagnosaProsedur = [];
                let resep = [];
                let obat = [];
                let vitalSigns = [];
                
                if (allAntrianResult.success && allAntrianResult.data && allAntrianResult.data.length > 0) {
                    const antrianIds = allAntrianResult.data.map(a => a.id_antrian);
                    console.log(`   Found ${antrianIds.length} antrian IDs for this encounter`);
                    
                    // Step 3: Try to find pemeriksaan for ANY of these antrian IDs
                    for (const antrianId of antrianIds) {
                        const pemeriksaanResponse = await fetch(`/MAPOTEK_PHP/WEB/API/pemeriksaan.php?select=*&id_antrian=eq.${antrianId}`);
                        const pemeriksaanResult = await pemeriksaanResponse.json();
                        
                        if (pemeriksaanResult.success && pemeriksaanResult.data && pemeriksaanResult.data.length > 0) {
                            pemeriksaan = pemeriksaanResult.data[0];
                            console.log(`   ✅ Found pemeriksaan: ${pemeriksaan.id_pemeriksaan}`);
                            break;
                        }
                    }
                }
                
                // Step 4: If pemeriksaan found, load all related data
                if (pemeriksaan) {
                    // Get anamnesa
                    if (pemeriksaan.id_anamnesa) {
                        try {
                            const anamnesaResponse = await fetch(`/MAPOTEK_PHP/WEB/API/anamnesa.php?select=*&id_anamnesa=eq.${pemeriksaan.id_anamnesa}`);
                            const anamnesaResult = await anamnesaResponse.json();
                            if (anamnesaResult.success && anamnesaResult.data && anamnesaResult.data.length > 0) {
                                anamnesa = anamnesaResult.data[0];
                            }
                        } catch (error) {
                            console.warn(`   ⚠️ Failed to load anamnesa:`, error);
                        }
                    }
                    
                    // Get vital signs
                    try {
                        const vitalResponse = await fetch(`/MAPOTEK_PHP/WEB/API/table_pemeriksaan_loinc.php?select=*,loinc:id_ioinc(display)&id_pemeriksaan=eq.${pemeriksaan.id_pemeriksaan}`);
                        const vitalResult = await vitalResponse.json();
                        if (vitalResult.success && vitalResult.data) {
                            vitalSigns = vitalResult.data;
                        }
                    } catch (error) {
                        console.warn(`   ⚠️ Failed to load vital signs:`, error);
                    }
                    
                    // Get diagnosis ICD-X
                    try {
                        const diagnosisResponse = await fetch(`/MAPOTEK_PHP/WEB/API/diagnosis_icdx.php?select=*&id_pemeriksaan=eq.${pemeriksaan.id_pemeriksaan}`);
                        const diagnosisResult = await diagnosisResponse.json();
                        if (diagnosisResult.success && diagnosisResult.data) {
                            diagnosa = diagnosisResult.data;
                        }
                    } catch (error) {
                        console.warn(`   ⚠️ Failed to load ICD-X:`, error);
                    }
                    
                    // Get diagnosis ICD-IX
                    try {
                        const prosedurResponse = await fetch(`/MAPOTEK_PHP/WEB/API/diagnosis_icdix.php?select=*&id_pemeriksaan=eq.${pemeriksaan.id_pemeriksaan}`);
                        const prosedurResult = await prosedurResponse.json();
                        if (prosedurResult.success && prosedurResult.data) {
                            diagnosaProsedur = prosedurResult.data;
                        }
                    } catch (error) {
                        console.warn(`   ⚠️ Failed to load ICD-IX:`, error);
                    }
                    
                    // Get medicines
                    try {
                        const obatResponse = await fetch(`/MAPOTEK_PHP/WEB/API/pemeriksaan_obat.php?select=*,obat:id_obat(nama_obat,id_jenis_obat,jenis_obat:id_jenis_obat(nama_jenis_obat))&id_pemeriksaan=eq.${pemeriksaan.id_pemeriksaan}`);
                        const obatResult = await obatResponse.json();
                        if (obatResult.success && obatResult.data) {
                            obat = obatResult.data;
                        }
                    } catch (error) {
                        console.warn(`   ⚠️ Failed to load medicines:`, error);
                    }
                    
                    // Get prescriptions
                    try {
                        const resepResponse = await fetch(`/MAPOTEK_PHP/WEB/API/resep.php?select=*&id_pemeriksaan=eq.${pemeriksaan.id_pemeriksaan}`);
                        const resepResult = await resepResponse.json();
                        if (resepResult.success && resepResult.data && resepResult.data.length > 0) {
                            for (let r of resepResult.data) {
                                const detailResponse = await fetch(`/MAPOTEK_PHP/WEB/API/resep_detail.php?select=*&id_resep=eq.${r.id_resep}`);
                                const detailResult = await detailResponse.json();
                                if (detailResult.success && detailResult.data) {
                                    resep.push({
                                        ...r,
                                        details: detailResult.data
                                    });
                                }
                            }
                        }
                    } catch (error) {
                        console.warn(`   ⚠️ Failed to load prescriptions:`, error);
                    }
                }
                
                // Get doctor info
                let doctor = null;
                if (displayAntrian.id_dokter) {
                    try {
                        const doctorResponse = await fetch(`/MAPOTEK_PHP/WEB/API/dokter.php?select=*&id_dokter=eq.${displayAntrian.id_dokter}`);
                        const doctorResult = await doctorResponse.json();
                        if (doctorResult.success && doctorResult.data && doctorResult.data.length > 0) {
                            doctor = doctorResult.data[0];
                        }
                    } catch (error) {
                        console.warn(`   ⚠️ Failed to load doctor:`, error);
                    }
                }
                
                return {
                    antrian: displayAntrian,
                    pemeriksaan,
                    anamnesa,
                    diagnosa,
                    diagnosaProsedur,
                    obat,
                    resep,
                    vitalSigns,
                    doctor
                };
            });

            const historyData = await Promise.all(historyPromises);
            console.log('✅ History loading complete');
            this.renderHistoryList(historyData);

        } catch (error) {
            console.error('❌ Error loading patient history:', error);
            container.innerHTML = `
                <div class="alert alert-danger">
                    <i class="bi bi-exclamation-triangle me-2"></i>
                    Gagal memuat riwayat pemeriksaan: ${error.message}
                </div>
            `;
        }
    }

    renderHistoryList(historyData) {
        const container = document.getElementById('historyContent');
        if (!container) return;

        if (historyData.length === 0) {
            container.innerHTML = `
                <div class="text-center py-5">
                    <i class="bi bi-inbox fs-1 text-muted"></i>
                    <p class="text-muted mt-3">Belum ada riwayat pemeriksaan</p>
                </div>
            `;
            return;
        }

        container.innerHTML = `
            <div class="accordion" id="historyAccordion">
                ${historyData.map((history, index) => this.renderHistoryItem(history, index)).join('')}
            </div>
        `;
    }

    renderHistoryItem(history, index) {
        const { antrian, pemeriksaan, anamnesa, diagnosa, diagnosaProsedur, obat, resep, vitalSigns, doctor } = history;
        
        const statusBadge = {
            'Belum Periksa': 'bg-warning',
            'Sedang Periksa': 'bg-info',
            'Selesai': 'bg-success',
            'Batal': 'bg-danger'
        }[antrian.status_antrian] || 'bg-secondary';

        const doctorName = doctor ? this.escapeHtml(doctor.nama_lengkap) : 'Dokter tidak diketahui';
        const doctorAvatar = doctor && doctor.avatar_url 
            ? doctor.avatar_url 
            : 'https://ui-avatars.com/api/?name=' + encodeURIComponent(doctorName) + '&size=40&background=667eea';

        return `
            <div class="accordion-item border mb-2">
                <h2 class="accordion-header">
                    <button class="accordion-button ${index !== 0 ? 'collapsed' : ''}" type="button" 
                            data-bs-toggle="collapse" data-bs-target="#history${index}">
                        <div class="d-flex align-items-center gap-3 w-100">
                            <div class="flex-shrink-0">
                                <i class="bi bi-calendar-check fs-4 text-primary"></i>
                            </div>
                            <div class="flex-grow-1">
                                <div class="fw-bold">${this.formatDate(antrian.tanggal_antrian)}</div>
                                <small class="text-muted">
                                    <i class="bi bi-clock me-1"></i>${antrian.jam_antrian || '-'} | 
                                    <i class="bi bi-person-badge me-1"></i>${doctorName}
                                </small>
                            </div>
                            <div class="flex-shrink-0">
                                <span class="badge ${statusBadge}">${antrian.status_antrian}</span>
                            </div>
                        </div>
                    </button>
                </h2>
                <div id="history${index}" class="accordion-collapse collapse ${index === 0 ? 'show' : ''}" 
                    data-bs-parent="#historyAccordion">
                    <div class="accordion-body">
                        ${pemeriksaan ? this.renderPemeriksaanDetails(pemeriksaan, anamnesa, diagnosa, diagnosaProsedur, obat, resep, vitalSigns) : `
                            <div class="text-center text-muted py-3">
                                <i class="bi bi-hourglass-split me-2"></i>
                                <small>Pemeriksaan belum dilakukan</small>
                            </div>
                        `}

                        ${doctor ? `
                            <div class="border-top pt-3 mt-3">
                                <div class="d-flex align-items-center text-muted">
                                    <img src="${doctorAvatar}" 
                                        class="rounded-circle me-2" 
                                        width="40" 
                                        height="40"
                                        alt="Doctor">
                                    <div>
                                        <small class="d-block fw-bold text-dark">${doctorName}</small>
                                        <small class="text-muted">
                                            <i class="bi bi-hospital me-1"></i>${this.escapeHtml(doctor.nama_faskes || 'Klinik')}
                                        </small>
                                    </div>
                                </div>
                            </div>
                        ` : ''}
                    </div>
                </div>
            </div>
        `;
    }

    renderPemeriksaanDetails(pemeriksaan, anamnesa, diagnosa, diagnosaProsedur, obat, resep, vitalSigns) {
        let html = '';
        
        // Anamnesa Section
        if (anamnesa) {
            html += `
                <div class="card mb-3 border-start border-primary border-4">
                    <div class="card-body">
                        <h6 class="card-title text-primary">
                            <i class="bi bi-clipboard2-pulse me-2"></i>Anamnesa
                        </h6>
                        <div class="row g-3">
            `;
            
            if (anamnesa.keluhan) {
                html += `
                    <div class="col-12">
                        <strong>Keluhan:</strong>
                        <p class="mb-0">${this.escapeHtml(anamnesa.keluhan)}</p>
                    </div>
                `;
            }
            
            if (anamnesa.anamnesis) {
                html += `
                    <div class="col-12">
                        <strong>Anamnesis:</strong>
                        <p class="mb-0">${this.escapeHtml(anamnesa.anamnesis)}</p>
                    </div>
                `;
            }
            
            if (anamnesa.alergi_obat || anamnesa.alergi_makanan || anamnesa.alergi_udara) {
                html += `<div class="col-12"><strong>Alergi:</strong><ul class="mb-0">`;
                if (anamnesa.alergi_obat) html += `<li>Obat: ${this.escapeHtml(anamnesa.alergi_obat)}</li>`;
                if (anamnesa.alergi_makanan) html += `<li>Makanan: ${this.escapeHtml(anamnesa.alergi_makanan)}</li>`;
                if (anamnesa.alergi_udara) html += `<li>Udara: ${this.escapeHtml(anamnesa.alergi_udara)}</li>`;
                html += `</ul></div>`;
            }
            
            if (anamnesa.prognosa) {
                html += `
                    <div class="col-12">
                        <strong>Prognosa:</strong>
                        <p class="mb-0">${this.escapeHtml(anamnesa.prognosa)}</p>
                    </div>
                `;
            }
            
            if (anamnesa.terapi_obat) {
                html += `
                    <div class="col-12">
                        <strong>Terapi Obat:</strong>
                        <p class="mb-0">${this.escapeHtml(anamnesa.terapi_obat)}</p>
                    </div>
                `;
            }
            
            if (anamnesa.terapi_non_obat) {
                html += `
                    <div class="col-12">
                        <strong>Terapi Non-Obat:</strong>
                        <p class="mb-0">${this.escapeHtml(anamnesa.terapi_non_obat)}</p>
                    </div>
                `;
            }
            
            html += `
                        </div>
                    </div>
                </div>
            `;
        }
        
        // Diagnosis ICD-X Section
        if (diagnosa && diagnosa.length > 0) {
            html += `
                <div class="card mb-3 border-start border-danger border-4">
                    <div class="card-body">
                        <h6 class="card-title text-danger">
                            <i class="bi bi-clipboard2-check me-2"></i>Diagnosis (ICD-X)
                        </h6>
                        <div class="table-responsive">
                            <table class="table table-sm table-hover">
                                <thead>
                                    <tr>
                                        <th width="150">Kode ICD-X</th>
                                        <th>Deskripsi</th>
                                    </tr>
                                </thead>
                                <tbody>
            `;
            
            diagnosa.forEach(d => {
                html += `
                    <tr>
                        <td><span class="badge bg-danger">${this.escapeHtml(d.kode_icdx)}</span></td>
                        <td>${this.escapeHtml(d.deskripsi)}</td>
                    </tr>
                `;
            });
            
            html += `
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            `;
        }
        
        // Diagnosis ICD-IX (Procedures) Section
        if (diagnosaProsedur && diagnosaProsedur.length > 0) {
            html += `
                <div class="card mb-3 border-start border-warning border-4">
                    <div class="card-body">
                        <h6 class="card-title text-warning">
                            <i class="bi bi-file-medical me-2"></i>Prosedur Medis (ICD-IX)
                        </h6>
                        <div class="table-responsive">
                            <table class="table table-sm table-hover">
                                <thead>
                                    <tr>
                                        <th width="150">Kode ICD-IX</th>
                                        <th>Deskripsi Prosedur</th>
                                    </tr>
                                </thead>
                                <tbody>
            `;
            
            diagnosaProsedur.forEach(p => {
                html += `
                    <tr>
                        <td><span class="badge bg-warning text-dark">${this.escapeHtml(p.kode_icdix)}</span></td>
                        <td>${this.escapeHtml(p.deskripsi)}</td>
                    </tr>
                `;
            });
            
            html += `
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            `;
        }
        
        // Medicines Given Section
        if (obat && obat.length > 0) {
            html += `
                <div class="card mb-3 border-start border-info border-4">
                    <div class="card-body">
                        <h6 class="card-title text-info">
                            <i class="bi bi-capsule me-2"></i>Obat yang Diberikan
                        </h6>
                        <div class="table-responsive">
                            <table class="table table-sm table-bordered">
                                <thead class="table-light">
                                    <tr>
                                        <th>Nama Obat</th>
                                        <th width="120">Jenis</th>
                                        <th width="150">Signa</th>
                                        <th width="100">Jumlah</th>
                                    </tr>
                                </thead>
                                <tbody>
            `;
            
            obat.forEach(o => {
                const jenisObat = o.obat?.jenis_obat?.nama_jenis_obat || o.obat?.jenis_obat || '-';
                html += `
                    <tr>
                        <td>
                            <i class="bi bi-capsule-pill text-info me-1"></i>
                            ${this.escapeHtml(o.obat?.nama_obat || 'Unknown')}
                        </td>
                        <td><span class="badge bg-info">${this.escapeHtml(jenisObat)}</span></td>
                        <td>${this.escapeHtml(o.signa || '-')}</td>
                        <td class="text-center">
                            <span class="badge bg-info">${this.escapeHtml(o.jumlah || '-')}</span>
                        </td>
                    </tr>
                `;
            });
            
            html += `
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            `;
        }
        
        // Resep Section
        if (resep && resep.length > 0) {
            html += `
                <div class="card mb-3 border-start border-success border-4">
                    <div class="card-body">
                        <h6 class="card-title text-success">
                            <i class="bi bi-prescription2 me-2"></i>Resep Obat
                        </h6>
            `;
            
            resep.forEach(r => {
                html += `
                    <div class="mb-3">
                        <div class="d-flex align-items-center mb-2">
                            <strong class="text-success me-2">
                                <i class="bi bi-file-medical"></i> ${this.escapeHtml(r.nama_resep || 'Resep')}
                            </strong>
                        </div>
                `;
                
                if (r.catatan_resep) {
                    html += `
                        <div class="alert alert-info alert-sm py-2 mb-2">
                            <small><i class="bi bi-info-circle me-1"></i>${this.escapeHtml(r.catatan_resep)}</small>
                        </div>
                    `;
                }
                
                if (r.details && r.details.length > 0) {
                    html += `
                        <div class="table-responsive">
                            <table class="table table-sm table-bordered">
                                <thead class="table-light">
                                    <tr>
                                        <th>Nama Obat</th>
                                        <th width="150">Signa</th>
                                        <th width="100">Jumlah</th>
                                    </tr>
                                </thead>
                                <tbody>
                    `;
                    
                    r.details.forEach(detail => {
                        html += `
                            <tr>
                                <td>
                                    <i class="bi bi-capsule text-success me-1"></i>
                                    ${this.escapeHtml(detail.nama_obat)}
                                </td>
                                <td>${this.escapeHtml(detail.signa || '-')}</td>
                                <td class="text-center">
                                    <span class="badge bg-success">${this.escapeHtml(detail.jumlah || '-')}</span>
                                </td>
                            </tr>
                        `;
                    });
                    
                    html += `
                                </tbody>
                            </table>
                        </div>
                    `;
                } else {
                    html += '<p class="text-muted small mb-0">Tidak ada detail obat</p>';
                }
                
                html += '</div>';
            });
            
            html += `
                    </div>
                </div>
            `;
        }
        
        return html;
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
        if (!this.validateForm()) {
            return;
        }

        const btnSimpan = document.getElementById('btnSimpanPasien');
        const originalText = btnSimpan.innerHTML;
        btnSimpan.disabled = true;
        btnSimpan.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Menyimpan...';

        try {
            const email = document.getElementById('inputEmail').value.trim();
            const password = document.getElementById('inputPassword').value;
            const nik = document.getElementById('inputNIK').value.trim();
            const nama = document.getElementById('inputNama').value.trim();
            const jenis_kelamin = document.getElementById('inputJenisKelamin').value;
            const tanggal_lahir = document.getElementById('inputTanggalLahir').value;
            const no_telp = document.getElementById('inputNoTelp').value.trim();
            const formattedAddress = this.formatAddress();
            
            if (!formattedAddress || formattedAddress.trim() === '') {
                throw new Error('Alamat tidak boleh kosong. Pastikan semua field alamat terisi.');
            }

            const authPayload = {
                email: email,
                password: password,
                nama: nama,
                alamat: formattedAddress
            };
            
            const authResponse = await fetch('/MAPOTEK_PHP/WEB/API/auth.php', {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(authPayload)
            });

            const authResult = await authResponse.json();

            if (!authResult.success) {
                throw new Error(authResult.error || 'Gagal membuat akun');
            }

            const userToken = authResult.data?.access_token || 
                            authResult.data?.session?.access_token;
            
            if (!userToken) {
                throw new Error('Token tidak ditemukan setelah registrasi');
            }

            const patientData = {
                nik: nik,
                nama: nama,
                jenis_kelamin: jenis_kelamin,
                tanggal_lahir: tanggal_lahir,
                no_telp: no_telp,
                alamat: formattedAddress
            };

            const response = await fetch('/MAPOTEK_PHP/WEB/API/pasien.php', {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${userToken}`
                },
                body: JSON.stringify(patientData)
            });

            const responseText = await response.text();
            let result;
            try {
                result = JSON.parse(responseText);
            } catch (e) {
                throw new Error('Invalid response from server: ' + responseText);
            }

            if (result.success) {
                const modal = bootstrap.Modal.getInstance(document.getElementById('modalTambahPasien'));
                modal.hide();

                this.showSuccessToast('Pasien berhasil ditambahkan!');

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

    formatDate(dateString) {
        if (!dateString) return '-';
        const date = new Date(dateString);
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        return date.toLocaleDateString('id-ID', options);
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