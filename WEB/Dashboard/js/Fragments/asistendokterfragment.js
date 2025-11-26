// Asisten Dokter Fragment - Expandable with Horizontal Scroll & Skeleton Loaders
class AsistenDokterFragment {
    constructor() {
        this.icon = 'bi-person-badge';
        this.title = 'Asisten Dokter';
        this.expandedCards = new Set();
        this.regionData = {
            provinsi: [],
            kota: [],
            kecamatan: [],
            kelurahan: []
        };
    }

    render() {
        return `
            <div class="container-fluid">
                <div class="row">
                    <div class="col-12">
                        <div class="card shadow-sm border-0 mb-4">
                            <div class="card-header bg-white border-bottom d-flex justify-content-between align-items-center">
                                <h5 class="mb-0">
                                    <i class="bi bi-person-badge me-2 text-primary"></i>
                                    Data Asisten Dokter
                                </h5>
                                <button class="btn btn-primary" id="btnTambahAsisten">
                                    <i class="bi bi-plus-circle me-2"></i>Tambah Asisten
                                </button>
                            </div>
                            <div class="card-body">
                                <div class="row mb-4">
                                    <div class="col-md-6">
                                        <div class="input-group">
                                            <span class="input-group-text">
                                                <i class="bi bi-search"></i>
                                            </span>
                                            <input type="text" class="form-control" id="searchAsisten" 
                                                   placeholder="Cari nama asisten...">
                                        </div>
                                    </div>
                                </div>
                                <div class="main-cards-horizontal-container" id="asistenCardsContainer">
                                    <div class="col-12 text-center py-5">
                                        <div class="spinner-border text-primary" role="status">
                                            <span class="visually-hidden">Loading...</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            ${this.renderAddAsistenModal()}
            ${this.renderStyles()}
        `;
    }

    renderStyles() {
        return `
            <style>
                /* ========================================
                   SKELETON LOADER STYLES
                   ======================================== */
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
                    width: 90px;
                    height: 90px;
                    border-radius: 50%;
                    flex-shrink: 0;
                }

                .skeleton-badge {
                    height: 24px;
                    width: 80px;
                    border-radius: 12px;
                }

                .skeleton-header {
                    height: 140px;
                    border-radius: 20px 20px 0 0;
                }

                .skeleton-card-wrapper {
                    min-width: 350px;
                    max-width: 350px;
                    flex-shrink: 0;
                }

                /* Main Cards Horizontal Container */
                .main-cards-horizontal-container {
                    display: flex;
                    overflow-x: auto;
                    overflow-y: hidden;
                    scroll-behavior: smooth;
                    gap: 20px;
                    padding: 20px 10px 30px 10px;
                    scrollbar-width: thin;
                    scrollbar-color: rgba(0,0,0,0.2) rgba(0,0,0,0.05);
                }
                
                .main-cards-horizontal-container::-webkit-scrollbar {
                    height: 10px;
                }
                
                .main-cards-horizontal-container::-webkit-scrollbar-track {
                    background: rgba(0,0,0,0.05);
                    border-radius: 10px;
                }
                
                .main-cards-horizontal-container::-webkit-scrollbar-thumb {
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    border-radius: 10px;
                }
                
                .main-cards-horizontal-container::-webkit-scrollbar-thumb:hover {
                    background: linear-gradient(135deg, #764ba2 0%, #667eea 100%);
                }
                
                .asisten-card-wrapper {
                    min-width: 350px;
                    max-width: 350px;
                    flex-shrink: 0;
                }
                
                .asisten-card {
                    transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
                    border: none;
                    border-radius: 20px;
                    overflow: visible;
                    width: 100%;
                    height: auto;
                }
                
                .asisten-card:hover {
                    transform: translateY(-5px);
                    box-shadow: 0 12px 24px rgba(0,0,0,0.15) !important;
                }
                
                .asisten-card.expanded {
                    transform: scale(1.02);
                    z-index: 10;
                }
                
                /* Show More Button */
                .show-more-btn {
                    background: white;
                    padding: 12px 20px;
                    text-align: center;
                    cursor: pointer;
                    border-top: 1px solid rgba(0,0,0,0.05);
                    border-radius: 0 0 20px 20px;
                    transition: all 0.3s ease;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 8px;
                    user-select: none;
                }
                
                .show-more-btn:hover {
                    background: rgba(0,0,0,0.02);
                }
                
                .show-more-text {
                    font-size: 14px;
                    font-weight: 600;
                    color: #666;
                }
                
                .show-more-text::before {
                    content: 'Show';
                }
                
                .asisten-card.expanded .show-more-text::before {
                    content: 'Show';
                }
                
                .show-more-text::after {
                    content: ' More';
                }
                
                .asisten-card.expanded .show-more-text::after {
                    content: ' Less';
                }
                
                .show-more-icon {
                    font-size: 16px;
                    color: #666;
                    transition: transform 0.3s ease;
                }
                
                .asisten-card.expanded .show-more-icon {
                    transform: rotate(180deg);
                }
                
                .card-header-custom {
                    position: relative;
                    padding: 0;
                    border: none;
                    border-radius: 20px 20px 0 0;
                }
                
                .header-gradient {
                    padding: 25px;
                    border-radius: 20px 20px 0 0;
                    position: relative;
                }
                
                .avatar-name-card {
                    background: rgba(255, 255, 255, 0.98);
                    border-radius: 15px;
                    padding: 20px;
                    margin-top: -10px;
                    box-shadow: 0 8px 16px rgba(0,0,0,0.1);
                }
                
                .avatar-wrapper {
                    width: 90px;
                    height: 90px;
                    border-radius: 50%;
                    overflow: hidden;
                    border: 5px solid white;
                    box-shadow: 0 6px 12px rgba(0,0,0,0.15);
                    flex-shrink: 0;
                }
                
                .avatar-wrapper img {
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                }
                
                .expandable-content {
                    max-height: 0;
                    overflow: hidden;
                    transition: max-height 0.5s cubic-bezier(0.4, 0, 0.2, 1);
                    opacity: 0;
                }
                
                .expandable-content.expanded {
                    max-height: 500px;
                    overflow-y: auto;
                    overflow-x: hidden;
                    opacity: 1;
                    transition: max-height 0.5s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.3s ease-in 0.2s;
                    scrollbar-width: thin;
                    scrollbar-color: rgba(0,0,0,0.2) rgba(0,0,0,0.05);
                }
                
                .expandable-content.expanded::-webkit-scrollbar {
                    width: 6px;
                }
                
                .expandable-content.expanded::-webkit-scrollbar-track {
                    background: rgba(0,0,0,0.05);
                    border-radius: 10px;
                }
                
                .expandable-content.expanded::-webkit-scrollbar-thumb {
                    background: rgba(0,0,0,0.2);
                    border-radius: 10px;
                }
                
                .expandable-content.expanded::-webkit-scrollbar-thumb:hover {
                    background: rgba(0,0,0,0.3);
                }
                
                /* Vertical Stack Container for Details */
                .detail-cards-container {
                    display: flex;
                    flex-direction: column;
                    gap: 0;
                    padding: 15px;
                }
                
                .detail-card {
                    width: 100%;
                    background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
                    border-radius: 15px;
                    padding: 25px;
                    text-align: center;
                    box-shadow: 0 4px 12px rgba(0,0,0,0.08);
                    transition: transform 0.3s ease, box-shadow 0.3s ease;
                    margin-bottom: 15px;
                    position: relative;
                }
                
                .detail-card:last-child {
                    margin-bottom: 0;
                }
                
                .detail-card:hover {
                    transform: scale(1.02);
                    box-shadow: 0 8px 20px rgba(0,0,0,0.15);
                }
                
                .detail-card.card-contact {
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    color: white;
                }
                
                .detail-card.card-address {
                    background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
                    color: white;
                }
                
                .detail-card.card-identity {
                    background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
                    color: white;
                }
                
                .detail-card.card-system {
                    background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);
                    color: white;
                }
                
                .detail-icon {
                    font-size: 48px;
                    margin-bottom: 15px;
                    opacity: 0.9;
                }
                
                .detail-title {
                    font-size: 14px;
                    font-weight: 600;
                    margin-bottom: 10px;
                    text-transform: uppercase;
                    letter-spacing: 1px;
                    opacity: 0.9;
                }
                
                .detail-value {
                    font-size: 16px;
                    font-weight: 500;
                    line-height: 1.6;
                    word-wrap: break-word;
                }
                
                .badge-status {
                    padding: 6px 12px;
                    border-radius: 20px;
                    font-size: 12px;
                    font-weight: 600;
                }
                
                .gradient-orange { background: linear-gradient(135deg, #ff6b35 0%, #ff8c42 100%); }
                .gradient-blue { background: linear-gradient(135deg, #4e73df 0%, #5a8dee 100%); }
                .gradient-red { background: linear-gradient(135deg, #e74c3c 0%, #f39c12 100%); }
                .gradient-green { background: linear-gradient(135deg, #36d1dc 0%, #5b86e5 100%); }
                .gradient-purple { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); }
                
                @media (max-width: 768px) {
                    .asisten-card-wrapper, .skeleton-card-wrapper {
                        min-width: 300px;
                        max-width: 300px;
                    }
                }
            </style>
        `;
    }

    // ========================================
    // ✅ SKELETON GENERATOR FUNCTIONS
    // ========================================

    generateAsistenCardSkeleton(count = 5) {
        return Array(count).fill(0).map(() => `
            <div class="skeleton-card-wrapper">
                <div class="card asisten-card shadow">
                    <div class="card-header-custom">
                        <div class="skeleton skeleton-header"></div>
                    </div>
                    <div style="padding: 20px;">
                        <div class="d-flex align-items-center mb-3">
                            <div class="skeleton skeleton-avatar me-3"></div>
                            <div style="flex: 1;">
                                <div class="skeleton skeleton-text large" style="width: 70%;"></div>
                                <div class="skeleton skeleton-text" style="width: 50%; margin-top: 10px;"></div>
                            </div>
                        </div>
                        <div class="skeleton skeleton-badge" style="margin: 0 auto;"></div>
                    </div>
                </div>
            </div>
        `).join('');
    }

    renderAddAsistenModal() {
        return `
            <div class="modal fade" id="modalTambahAsisten" tabindex="-1" aria-hidden="true">
                <div class="modal-dialog modal-lg modal-dialog-scrollable">
                    <div class="modal-content">
                        <div class="modal-header bg-primary text-white">
                            <h5 class="modal-title">
                                <i class="bi bi-person-plus-fill me-2"></i>Tambah Asisten Dokter
                            </h5>
                            <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
                        </div>
                        <div class="modal-body">
                            <form id="formTambahAsisten">
                                <div class="mb-3">
                                    <label class="form-label">Email <span class="text-danger">*</span></label>
                                    <input type="email" class="form-control" id="inputEmailAsisten" placeholder="email@example.com">
                                    <div class="invalid-feedback"></div>
                                </div>
                                <div class="mb-3">
                                    <label class="form-label">Nama Lengkap <span class="text-danger">*</span></label>
                                    <input type="text" class="form-control" id="inputNamaAsisten" placeholder="Masukkan nama lengkap">
                                    <div class="invalid-feedback"></div>
                                </div>
                                <div class="mb-3">
                                    <label class="form-label">Username <span class="text-danger">*</span></label>
                                    <input type="text" class="form-control" id="inputUsernameAsisten" placeholder="Masukkan username">
                                    <div class="invalid-feedback"></div>
                                </div>
                                <div class="mb-3">
                                    <label class="form-label">NIK</label>
                                    <input type="text" class="form-control" id="inputNIKAsisten" maxlength="16" placeholder="16 digit (opsional)">
                                    <div class="invalid-feedback"></div>
                                </div>
                                <div class="mb-3">
                                    <label class="form-label">Jenis Kelamin <span class="text-danger">*</span></label>
                                    <select class="form-select" id="inputJenisKelaminAsisten">
                                        <option value="">Pilih Jenis Kelamin</option>
                                        <option value="L">Laki-Laki</option>
                                        <option value="P">Perempuan</option>
                                    </select>
                                    <div class="invalid-feedback"></div>
                                </div>
                                <div class="mb-3">
                                    <label class="form-label">No. Telepon <span class="text-danger">*</span></label>
                                    <div class="input-group">
                                        <span class="input-group-text">+62</span>
                                        <input type="tel" class="form-control" id="inputNoTelpAsisten" placeholder="81234567890">
                                    </div>
                                    <div class="invalid-feedback"></div>
                                </div>
                                <div class="border-top pt-3 mb-3">
                                    <h6 class="text-primary mb-3"><i class="bi bi-geo-alt-fill me-2"></i>Informasi Alamat</h6>
                                    <div class="mb-3">
                                        <label class="form-label">Provinsi <span class="text-danger">*</span></label>
                                        <select class="form-select" id="inputProvinsiAsisten">
                                            <option value="">Memuat provinsi...</option>
                                        </select>
                                        <div class="invalid-feedback"></div>
                                    </div>
                                    <div class="mb-3">
                                        <label class="form-label">Kota/Kabupaten <span class="text-danger">*</span></label>
                                        <select class="form-select" id="inputKotaAsisten" disabled>
                                            <option value="">Pilih provinsi terlebih dahulu</option>
                                        </select>
                                        <div class="invalid-feedback"></div>
                                    </div>
                                    <div class="mb-3">
                                        <label class="form-label">Kecamatan <span class="text-danger">*</span></label>
                                        <select class="form-select" id="inputKecamatanAsisten" disabled>
                                            <option value="">Pilih kota terlebih dahulu</option>
                                        </select>
                                        <div class="invalid-feedback"></div>
                                    </div>
                                    <div class="mb-3">
                                        <label class="form-label">Kelurahan/Desa</label>
                                        <select class="form-select" id="inputKelurahanAsisten" disabled>
                                            <option value="">Pilih kecamatan terlebih dahulu</option>
                                        </select>
                                    </div>
                                    <div class="mb-3">
                                        <label class="form-label">Alamat Detail <span class="text-danger">*</span></label>
                                        <textarea class="form-control" id="inputAlamatDetailAsisten" rows="3" placeholder="Jalan, RT/RW, No. Rumah"></textarea>
                                        <div class="invalid-feedback"></div>
                                    </div>
                                </div>
                                <div class="border-top pt-3">
                                    <h6 class="text-primary mb-3"><i class="bi bi-lock-fill me-2"></i>Keamanan Akun</h6>
                                    <div class="mb-3">
                                        <label class="form-label">Password <span class="text-danger">*</span></label>
                                        <input type="password" class="form-control" id="inputPasswordAsisten" placeholder="Minimal 6 karakter">
                                        <div class="invalid-feedback"></div>
                                    </div>
                                    <div class="mb-3">
                                        <label class="form-label">Konfirmasi Password <span class="text-danger">*</span></label>
                                        <input type="password" class="form-control" id="inputConfirmPasswordAsisten" placeholder="Ulangi password">
                                        <div class="invalid-feedback"></div>
                                    </div>
                                </div>
                                <div class="border-top pt-3">
                                    <h6 class="text-primary mb-3"><i class="bi bi-credit-card-2-front me-2"></i>RFID (Opsional)</h6>
                                    <div class="mb-3">
                                        <label class="form-label">Nomor RFID</label>
                                        <input type="text" class="form-control" id="inputRFIDAsisten" placeholder="Opsional">
                                        <small class="text-muted">Kosongkan jika tidak menggunakan RFID</small>
                                    </div>
                                </div>
                            </form>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">
                                <i class="bi bi-x-circle me-2"></i>Batal
                            </button>
                            <button type="button" class="btn btn-primary" id="btnSimpanAsisten">
                                <i class="bi bi-check-circle me-2"></i>Simpan Data
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    async onInit() {
        console.log('✅ AsistenDokterFragment initialized');
        await this.loadAsistenData();
        this.setupSearch();
        this.setupEventListeners();
        await this.loadProvinces();
    }

    setupEventListeners() {
        const btnTambah = document.getElementById('btnTambahAsisten');
        if (btnTambah) {
            btnTambah.addEventListener('click', () => this.showAddModal());
        }
        setTimeout(() => this.setupFormListeners(), 100);
    }

    setupFormListeners() {
        const btnSimpan = document.getElementById('btnSimpanAsisten');
        if (btnSimpan) {
            btnSimpan.addEventListener('click', () => this.saveAsisten());
        }

        const inputProvinsi = document.getElementById('inputProvinsiAsisten');
        const inputKota = document.getElementById('inputKotaAsisten');
        const inputKecamatan = document.getElementById('inputKecamatanAsisten');

        if (inputProvinsi) inputProvinsi.addEventListener('change', (e) => this.onProvinsiChange(e.target.value));
        if (inputKota) inputKota.addEventListener('change', (e) => this.onKotaChange(e.target.value));
        if (inputKecamatan) inputKecamatan.addEventListener('change', (e) => this.onKecamatanChange(e.target.value));
    }

    showAddModal() {
        const modal = new bootstrap.Modal(document.getElementById('modalTambahAsisten'));
        this.resetForm();
        modal.show();
    }

    resetForm() {
        const form = document.getElementById('formTambahAsisten');
        if (form) form.reset();
        document.querySelectorAll('.is-invalid').forEach(el => el.classList.remove('is-invalid'));
        ['inputKotaAsisten', 'inputKecamatanAsisten', 'inputKelurahanAsisten'].forEach(id => {
            const el = document.getElementById(id);
            if (el) el.disabled = true;
        });
    }

    async loadProvinces() {
        try {
            const response = await fetch('https://www.emsifa.com/api-wilayah-indonesia/api/provinces.json');
            const data = await response.json();
            this.regionData.provinsi = data;
            const select = document.getElementById('inputProvinsiAsisten');
            if (select) {
                select.innerHTML = '<option value="">Pilih Provinsi</option>' +
                    data.map(p => `<option value="${p.id}">${p.name}</option>`).join('');
            }
        } catch (error) {
            console.error('Error loading provinces:', error);
        }
    }

    async onProvinsiChange(provinsiId) {
        const selects = {
            kota: document.getElementById('inputKotaAsisten'),
            kecamatan: document.getElementById('inputKecamatanAsisten'),
            kelurahan: document.getElementById('inputKelurahanAsisten')
        };

        if (!provinsiId) {
            selects.kota.disabled = true;
            selects.kota.innerHTML = '<option value="">Pilih provinsi terlebih dahulu</option>';
            selects.kecamatan.disabled = true;
            selects.kecamatan.innerHTML = '<option value="">Pilih kota terlebih dahulu</option>';
            selects.kelurahan.disabled = true;
            selects.kelurahan.innerHTML = '<option value="">Pilih kecamatan terlebih dahulu</option>';
            return;
        }

        try {
            selects.kota.innerHTML = '<option value="">Memuat kota...</option>';
            selects.kota.disabled = true;
            const response = await fetch(`https://www.emsifa.com/api-wilayah-indonesia/api/regencies/${provinsiId}.json`);
            const data = await response.json();
            this.regionData.kota = data;
            selects.kota.innerHTML = '<option value="">Pilih Kota/Kabupaten</option>' +
                data.map(k => `<option value="${k.id}">${k.name}</option>`).join('');
            selects.kota.disabled = false;
            selects.kecamatan.disabled = true;
            selects.kecamatan.innerHTML = '<option value="">Pilih kota terlebih dahulu</option>';
            selects.kelurahan.disabled = true;
            selects.kelurahan.innerHTML = '<option value="">Pilih kecamatan terlebih dahulu</option>';
        } catch (error) {
            console.error('Error loading cities:', error);
            selects.kota.innerHTML = '<option value="">Gagal memuat data</option>';
        }
    }

    async onKotaChange(kotaId) {
        const selects = {
            kecamatan: document.getElementById('inputKecamatanAsisten'),
            kelurahan: document.getElementById('inputKelurahanAsisten')
        };

        if (!kotaId) {
            selects.kecamatan.disabled = true;
            selects.kecamatan.innerHTML = '<option value="">Pilih kota terlebih dahulu</option>';
            selects.kelurahan.disabled = true;
            selects.kelurahan.innerHTML = '<option value="">Pilih kecamatan terlebih dahulu</option>';
            return;
        }

        try {
            selects.kecamatan.innerHTML = '<option value="">Memuat kecamatan...</option>';
            selects.kecamatan.disabled = true;
            const response = await fetch(`https://www.emsifa.com/api-wilayah-indonesia/api/districts/${kotaId}.json`);
            const data = await response.json();
            this.regionData.kecamatan = data;
            selects.kecamatan.innerHTML = '<option value="">Pilih Kecamatan</option>' +
                data.map(k => `<option value="${k.id}">${k.name}</option>`).join('');
            selects.kecamatan.disabled = false;
            selects.kelurahan.disabled = true;
            selects.kelurahan.innerHTML = '<option value="">Pilih kecamatan terlebih dahulu</option>';
        } catch (error) {
            console.error('Error loading districts:', error);
            selects.kecamatan.innerHTML = '<option value="">Gagal memuat data</option>';
        }
    }

    async onKecamatanChange(kecamatanId) {
        const kelurahanSelect = document.getElementById('inputKelurahanAsisten');
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

    validateForm() {
        const fields = {
            inputEmailAsisten: { required: true, pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Format email tidak valid' },
            inputNamaAsisten: { required: true, minLength: 3, message: 'Nama minimal 3 karakter' },
            inputUsernameAsisten: { required: true, minLength: 3, message: 'Username minimal 3 karakter' },
            inputJenisKelaminAsisten: { required: true, message: 'Pilih jenis kelamin' },
            inputNoTelpAsisten: { required: true, minLength: 10, maxLength: 13, message: 'No. telepon tidak valid (10-13 digit)' },
            inputProvinsiAsisten: { required: true, message: 'Pilih provinsi' },
            inputKotaAsisten: { required: true, message: 'Pilih kota/kabupaten' },
            inputKecamatanAsisten: { required: true, message: 'Pilih kecamatan' },
            inputAlamatDetailAsisten: { required: true, message: 'Alamat detail harus diisi' },
            inputPasswordAsisten: { required: true, minLength: 6, message: 'Password minimal 6 karakter' },
            inputConfirmPasswordAsisten: { required: true, match: 'inputPasswordAsisten', message: 'Password tidak cocok' }
        };

        const nikInput = document.getElementById('inputNIKAsisten');
        if (nikInput && nikInput.value.trim() !== '' && nikInput.value.trim().length !== 16) {
            this.showFieldError(nikInput, 'NIK harus 16 digit');
            return false;
        }

        let isValid = true;
        for (const [fieldId, rules] of Object.entries(fields)) {
            const input = document.getElementById(fieldId);
            if (!input) continue;
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
        const feedback = input.parentElement.querySelector('.invalid-feedback') || input.nextElementSibling;
        if (feedback && feedback.classList.contains('invalid-feedback')) {
            feedback.textContent = message;
        }
    }

    formatAddress() {
        const provinsiId = document.getElementById('inputProvinsiAsisten').value;
        const kotaId = document.getElementById('inputKotaAsisten').value;
        const kecamatanId = document.getElementById('inputKecamatanAsisten').value;
        const kelurahanId = document.getElementById('inputKelurahanAsisten').value;
        const alamatDetail = document.getElementById('inputAlamatDetailAsisten').value.trim();

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

    async saveAsisten() {
        if (!this.validateForm()) return;

        const btnSimpan = document.getElementById('btnSimpanAsisten');
        const originalText = btnSimpan.innerHTML;
        btnSimpan.disabled = true;
        btnSimpan.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Menyimpan...';

        try {
            const { data: { session }, error: sessionError } = await supabaseClient.auth.getSession();
            
            if (sessionError || !session) {
                throw new Error('Anda harus login sebagai dokter terlebih dahulu');
            }

            const dokterId = session.user.id;
            const doctorToken = session.access_token;
            
            console.log('👨‍⚕️ Doctor ID:', dokterId);

            const email = document.getElementById('inputEmailAsisten').value.trim();
            const password = document.getElementById('inputPasswordAsisten').value;
            const nama = document.getElementById('inputNamaAsisten').value.trim();
            const username = document.getElementById('inputUsernameAsisten').value.trim();
            const nik = document.getElementById('inputNIKAsisten').value.trim();
            const jenis_kelamin = document.getElementById('inputJenisKelaminAsisten').value;
            const no_telp = document.getElementById('inputNoTelpAsisten').value.trim();
            const rfid = document.getElementById('inputRFIDAsisten').value.trim();
            const formattedAddress = this.formatAddress();
            
            if (!formattedAddress || formattedAddress.trim() === '') {
                throw new Error('Alamat tidak boleh kosong');
            }

            // ⭐ STEP 1: Create auth account
            console.log('📝 Creating auth account...');
            const authResponse = await fetch('/MAPOTEK_PHP/WEB/API/auth.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: email,
                    password: password,
                    nama: nama,
                    alamat: formattedAddress
                })
            });

            const authResult = await authResponse.json();
            console.log('🔍 Full auth response:', authResult);
            
            if (!authResult.success) {
                throw new Error(authResult.error || 'Gagal membuat akun asisten');
            }
            
            // ⭐ STEP 2: Extract UUID
            const authUserId = authResult.data?.user?.id || authResult.user?.id;
            
            console.log('🔍 Extracted authUserId:', authUserId);
            
            if (!authUserId || typeof authUserId !== 'string') {
                console.error('❌ Auth response:', authResult);
                throw new Error('Gagal mendapatkan ID user dari auth response');
            }
            
            console.log('✅ Auth account created with UUID:', authUserId);

            // ⭐ STEP 3: Build data WITH UUID
            const asistenData = {
                id_asisten_dokter: authUserId,
                email: email,
                nama_lengkap: nama,
                username: username,
                jenis_kelamin: jenis_kelamin,
                no_telp: no_telp,
                alamat: formattedAddress,
                id_dokter: dokterId
            };

            if (nik) asistenData.nik = nik;
            if (rfid) asistenData.rfid = rfid;

            console.log('📝 Inserting asisten_dokter with UUID:', authUserId);
            
            // ⭐ STEP 4: Insert into database
            const response = await fetch('/MAPOTEK_PHP/WEB/API/asisten_dokter.php', {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${doctorToken}`
                },
                body: JSON.stringify(asistenData)
            });

            const responseText = await response.text();
            let result;
            try {
                result = JSON.parse(responseText);
            } catch (e) {
                console.error('❌ Invalid JSON:', responseText);
                throw new Error('Invalid response from server');
            }

            if (result.success) {
                console.log('✅ Asisten created successfully!');
                
                const modal = bootstrap.Modal.getInstance(document.getElementById('modalTambahAsisten'));
                modal.hide();
                
                this.showSuccessToast('Asisten dokter berhasil ditambahkan!');
                await this.loadAsistenData();
            } else {
                throw new Error(result.error || 'Gagal menyimpan data asisten');
            }
            
        } catch (error) {
            console.error('❌ Error:', error);
            alert('Gagal menyimpan data: ' + error.message);
        } finally {
            btnSimpan.disabled = false;
            btnSimpan.innerHTML = originalText;
        }
    }

    showSuccessToast(message) {
        if (!document.getElementById('successToastAsisten')) {
            document.body.insertAdjacentHTML('beforeend', `
                <div class="position-fixed top-0 end-0 p-3" style="z-index: 9999">
                    <div id="successToastAsisten" class="toast" role="alert">
                        <div class="toast-header bg-success text-white">
                            <i class="bi bi-check-circle-fill me-2"></i>
                            <strong class="me-auto">Berhasil</strong>
                            <button type="button" class="btn-close btn-close-white" data-bs-dismiss="toast"></button>
                        </div>
                        <div class="toast-body"></div>
                    </div>
                </div>
            `);
        }
        const toastEl = document.getElementById('successToastAsisten');
        toastEl.querySelector('.toast-body').textContent = message;
        const toast = new bootstrap.Toast(toastEl);
        toast.show();
    }

    async loadAsistenData() {
        try {
            const container = document.getElementById('asistenCardsContainer');
            
            // ✅ SHOW SKELETON FIRST
            container.innerHTML = this.generateAsistenCardSkeleton(5);

            const { data: { session }, error: sessionError } = await supabaseClient.auth.getSession();
            
            if (sessionError || !session) {
                container.innerHTML = `<div class="col-12 text-center text-danger py-4">
                    <i class="bi bi-exclamation-triangle fs-1 d-block mb-2"></i>
                    Silakan login terlebih dahulu
                </div>`;
                return;
            }

            // ✅ Small delay to show skeleton animation
            await new Promise(resolve => setTimeout(resolve, 300));

            const dokterId = session.user.id;
            const { data, error } = await supabaseClient
                .from('asisten_dokter')
                .select('*')
                .eq('id_dokter', dokterId)
                .order('created_at', { ascending: false });
            
            if (error) throw error;
            
            if (data && data.length > 0) {
                container.innerHTML = data.map((asisten, index) => this.createAsistenCard(asisten, index)).join('');
                this.setupCardClickHandlers();
            } else {
                container.innerHTML = `
                    <div style="width: 100%; text-align: center; padding: 3rem 1rem;">
                        <i class="bi bi-inbox" style="font-size: 4rem; display: block; margin-bottom: 1rem; color: #6c757d;"></i>
                        <h5>Belum ada data asisten dokter</h5>
                        <p class="text-muted">Klik tombol "Tambah Asisten" untuk menambahkan data</p>
                    </div>`;
            }
        } catch (error) {
            console.error('Error loading asisten:', error);
            document.getElementById('asistenCardsContainer').innerHTML = `
                <div style="width: 100%; text-align: center; padding: 3rem 1rem; color: #dc3545;">
                    <i class="bi bi-exclamation-triangle" style="font-size: 4rem;"></i>
                    <h5>Gagal memuat data</h5>
                    <p>${error.message}</p>
                </div>`;
        }
    }

    setupCardClickHandlers() {
        document.querySelectorAll('.asisten-card').forEach(card => {
            const showMoreBtn = card.querySelector('.show-more-btn');
            if (showMoreBtn) {
                showMoreBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    
                    const cardId = card.getAttribute('data-asisten-id');
                    const expandableContent = card.querySelector('.expandable-content');
                    const isExpanded = this.expandedCards.has(cardId);
                    
                    if (isExpanded) {
                        expandableContent.classList.remove('expanded');
                        card.classList.remove('expanded');
                        this.expandedCards.delete(cardId);
                    } else {
                        // Close all other expanded cards
                        document.querySelectorAll('.expandable-content').forEach(el => el.classList.remove('expanded'));
                        document.querySelectorAll('.asisten-card').forEach(c => c.classList.remove('expanded'));
                        this.expandedCards.clear();
                        
                        // Expand this card
                        expandableContent.classList.add('expanded');
                        card.classList.add('expanded');
                        this.expandedCards.add(cardId);
                    }
                });
            }
        });
    }

    parseAddress(addressString) {
        if (!addressString) return {
            provinsi: '-',
            kota: '-',
            kecamatan: '-',
            kelurahan: '-',
            detail: '-'
        };

        const parts = addressString.split(',');
        return {
            provinsi: parts[0]?.match(/^([^(]+)/)?.[1]?.trim() || '-',
            kota: parts[1]?.match(/^([^(]+)/)?.[1]?.trim() || '-',
            kecamatan: parts[2]?.match(/^([^(]+)/)?.[1]?.trim() || '-',
            kelurahan: parts[3]?.match(/^([^(]+)/)?.[1]?.trim() || '-',
            detail: parts[4]?.trim() || '-'
        };
    }

    createAsistenCard(asisten, index) {
        const gradients = ['gradient-orange', 'gradient-blue', 'gradient-red', 'gradient-green', 'gradient-purple'];
        const avatarUrl = asisten.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(asisten.nama_lengkap || 'User')}&size=200&background=random`;
        const statusBadge = '<span class="badge-status bg-success text-white">Aktif</span>';
        
        const address = this.parseAddress(asisten.alamat);
        const gender = this.formatGender(asisten.jenis_kelamin);
        const createdDate = this.formatDate(asisten.created_at);

        return `
            <div class="asisten-card-wrapper">
                <div class="card asisten-card shadow" data-asisten-id="${asisten.id_asisten_dokter}">
                    <div class="card-header-custom">
                        <div class="header-gradient ${gradients[index % gradients.length]}">
                            <div class="avatar-name-card">
                                <div class="d-flex align-items-center">
                                    <div class="avatar-wrapper">
                                        <img src="${avatarUrl}" alt="${asisten.nama_lengkap}">
                                    </div>
                                    <div class="ms-3 flex-grow-1">
                                        <h5 class="mb-1 fw-bold text-dark">${asisten.nama_lengkap}</h5>
                                        <div class="d-flex align-items-center justify-content-between">
                                            <small class="text-muted"><i class="bi bi-telephone me-1"></i>${asisten.no_telp || '-'}</small>
                                            ${statusBadge}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <div class="show-more-btn">
                        <span class="show-more-text"></span>
                        <i class="bi bi-chevron-down show-more-icon"></i>
                    </div>
                    
                    <div class="expandable-content">
                        <div class="detail-cards-container">
                            <!-- Contact Card -->
                            <div class="detail-card card-contact">
                                <div class="detail-icon">
                                    <i class="bi bi-person-vcard"></i>
                                </div>
                                <div class="detail-title">Kontak</div>
                                <div class="detail-value">
                                    <div class="mb-2">
                                        <i class="bi bi-envelope me-1"></i>
                                        <small>${asisten.email || '-'}</small>
                                    </div>
                                    <div class="mb-2">
                                        <i class="bi bi-phone me-1"></i>
                                        <small>+62${asisten.no_telp || '-'}</small>
                                    </div>
                                    <div>
                                        <i class="bi bi-at me-1"></i>
                                        <small>${asisten.username || '-'}</small>
                                    </div>
                                </div>
                            </div>

                            <!-- Identity Card -->
                            <div class="detail-card card-identity">
                                <div class="detail-icon">
                                    <i class="bi bi-card-heading"></i>
                                </div>
                                <div class="detail-title">Identitas</div>
                                <div class="detail-value">
                                    <div class="mb-2">
                                        <small><strong>NIK:</strong></small><br>
                                        <small>${asisten.nik || 'Tidak tersedia'}</small>
                                    </div>
                                    <div class="mb-2">
                                        <small><strong>Jenis Kelamin:</strong></small><br>
                                        <small>${gender}</small>
                                    </div>
                                    <div>
                                        <small><strong>RFID:</strong></small><br>
                                        <small>${asisten.rfid || 'Tidak terdaftar'}</small>
                                    </div>
                                </div>
                            </div>

                            <!-- Address Card -->
                            <div class="detail-card card-address">
                                <div class="detail-icon">
                                    <i class="bi bi-geo-alt"></i>
                                </div>
                                <div class="detail-title">Alamat</div>
                                <div class="detail-value text-start">
                                    <div class="mb-1">
                                        <small><i class="bi bi-building me-1"></i><strong>Provinsi:</strong></small><br>
                                        <small>${address.provinsi}</small>
                                    </div>
                                    <div class="mb-1">
                                        <small><i class="bi bi-house me-1"></i><strong>Kota:</strong></small><br>
                                        <small>${address.kota}</small>
                                    </div>
                                    <div class="mb-1">
                                        <small><i class="bi bi-signpost me-1"></i><strong>Kecamatan:</strong></small><br>
                                        <small>${address.kecamatan}</small>
                                    </div>
                                    <div class="mb-1">
                                        <small><i class="bi bi-map me-1"></i><strong>Kelurahan:</strong></small><br>
                                        <small>${address.kelurahan}</small>
                                    </div>
                                    <div>
                                        <small><i class="bi bi-pin-map me-1"></i><strong>Detail:</strong></small><br>
                                        <small>${address.detail}</small>
                                    </div>
                                </div>
                            </div>

                            <!-- System Info Card -->
                            <div class="detail-card card-system">
                                <div class="detail-icon">
                                    <i class="bi bi-info-circle"></i>
                                </div>
                                <div class="detail-title">Info Sistem</div>
                                <div class="detail-value">
                                    <div class="mb-2">
                                        <small><strong>ID Asisten:</strong></small><br>
                                        <small class="text-truncate d-block">${asisten.id_asisten_dokter?.substring(0, 20)}...</small>
                                    </div>
                                    <div class="mb-2">
                                        <small><strong>Terdaftar:</strong></small><br>
                                        <small>${createdDate}</small>
                                    </div>
                                    <div>
                                        <small><strong>Status:</strong></small><br>
                                        <span class="badge bg-success mt-1">Aktif</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    setupSearch() {
        const searchInput = document.getElementById('searchAsisten');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                const searchTerm = e.target.value.toLowerCase();
                document.querySelectorAll('.asisten-card-wrapper').forEach(wrapper => {
                    const visible = wrapper.textContent.toLowerCase().includes(searchTerm);
                    wrapper.style.display = visible ? '' : 'none';
                });
            });
        }
    }

    calculateAge(createdAt) { return '25'; }
    formatGender(gender) { 
        return !gender ? '-' : (gender.toLowerCase() === 'l' ? 'Laki-laki' : 'Perempuan'); 
    }
    formatDate(dateString) {
        if (!dateString) return '-';
        return new Date(dateString).toLocaleDateString('id-ID', {
            day: 'numeric', month: 'long', year: 'numeric'
        });
    }
    onDestroy() { this.expandedCards.clear(); }
}