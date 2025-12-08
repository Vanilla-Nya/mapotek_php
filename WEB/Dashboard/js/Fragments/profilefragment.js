// ProfileFragment.js - Complete Fixed Version with Working Cropper
class ProfileFragment {
    constructor() {
        this.title = 'Profile';
        this.icon = 'bi-person-circle';
        this.currentDokterId = null;
        this.merchantOrderId = null;
        this.originalAvatarUrl = null;
        this.originalAvatarVisible = false;
        this.cropper = null;
        this.croppedBlob = null;
        this.qrCode = null;
        this.qrisFileBlob = null;
        this.qrisUrlLink = null;
        this.isProcessingFile = false; 
    }

    dispatchProfileUpdate(name = null, email = null, avatarUrl = undefined) {
        console.log('📢 Dispatching profile update event:', { name, email, avatarUrl });
        const event = new CustomEvent('profileUpdated', {
            detail: { name, email, avatarUrl }
        });
        window.dispatchEvent(event);
    }

    render() {
        return `
                <style>
                /* ========================================
                CROPPER MODAL - FIXED VERSION
                ======================================== */
                
                body.modal-open {
                    overflow: hidden !important;
                }

                .cropper-modal-backdrop {
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: 100vw;
                    height: 100vh;
                    background-color: rgba(0, 0, 0, 0.85);
                    z-index: 999998;
                    display: none;
                }

                #cropModal {
                    display: none;
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: 100vw;
                    height: 100vh;
                    z-index: 999999;
                    overflow: hidden;
                }

                #cropModal.show {
                    display: flex !important;
                    align-items: center;
                    justify-content: center;
                }

                #cropModal .modal-dialog {
                    margin: 0;
                    width: 90vw;
                    max-width: 1200px;
                    height: 90vh;
                    display: flex;
                    flex-direction: column;
                }

                #cropModal .modal-content {
                    height: 100%;
                    border: none;
                    border-radius: 12px;
                    display: flex;
                    flex-direction: column;
                    background: #2d2d2d;
                    overflow: hidden;
                    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.8);
                }

                #cropModal .modal-header {
                    background: #1a1a1a;
                    border: none;
                    padding: 1rem 1.5rem;
                    flex-shrink: 0;
                    border-radius: 12px 12px 0 0;
                }

                #cropModal .modal-body {
                    flex: 1;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    padding: 20px;
                    background: #1a1a1a;
                    overflow: hidden;
                    min-height: 0;
                }

                #cropModal .modal-footer {
                    background: #1a1a1a;
                    border: none;
                    padding: 1rem 1.5rem;
                    flex-shrink: 0;
                    border-radius: 0 0 12px 12px;
                }

                .crop-container {
                    width: 100%;
                    height: 100%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    position: relative;
                    background: #1a1a1a;
                }

                #cropImage {
                    max-width: 100%;
                    max-height: 100%;
                    display: block;
                    visibility: visible !important;
                    opacity: 1 !important;
                }

                .cropper-container {
                    width: 100% !important;
                    height: 100% !important;
                    background: #1a1a1a !important;
                }

                .cropper-wrap-box,
                .cropper-canvas {
                    width: 100% !important;
                    height: 100% !important;
                }

                .cropper-canvas > img {
                    filter: brightness(1) !important;
                    opacity: 1 !important;
                    visibility: visible !important;
                    display: block !important;
                }

                .cropper-view-box {
                    outline: 3px solid #667eea !important;
                    outline-offset: -3px;
                    border-radius: 50%;
                }

                .cropper-crop-box {
                    border-radius: 50%;
                }

                .cropper-face {
                    background-color: transparent !important;
                }

                .cropper-line {
                    background-color: #667eea !important;
                    opacity: 0.8 !important;
                }

                .cropper-dashed {
                    border-color: rgba(102, 126, 234, 0.5) !important;
                    opacity: 0.8 !important;
                }

                .cropper-point {
                    width: 12px !important;
                    height: 12px !important;
                    background-color: #667eea !important;
                    border: 3px solid #fff !important;
                    opacity: 1 !important;
                    box-shadow: 0 0 8px rgba(102, 126, 234, 0.8);
                    border-radius: 50%;
                }

                .cropper-modal {
                    background-color: rgba(0, 0, 0, 0.2) !important;
                    opacity: 1 !important;
                }
                
                /* Alternative: Completely remove the dark overlay */
                /* Uncomment below if you want no overlay at all */
                /*
                .cropper-modal {
                    background-color: transparent !important;
                    opacity: 0 !important;
                    display: none !important;
                }
                */

                .cropper-drag-box {
                    background-color: transparent !important;
                    opacity: 1 !important;
                }

                .cropper-bg {
                    background-image: none !important;
                    background-color: transparent !important;
                }

                /* Profile Avatar Styling */
                #avatarContainer {
                    width: 100px;
                    height: 100px;
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    overflow: hidden;
                    position: relative;
                    border-radius: 50%;
                    display: inline-flex;
                    align-items: center;
                    justify-content: center;
                }

                #btnChangeAvatar {
                    position: absolute !important;
                    bottom: 0 !important;
                    right: 0 !important;
                    width: 32px !important;
                    height: 32px !important;
                    padding: 0 !important;
                    z-index: 10 !important;
                    border-radius: 50% !important;
                    display: flex !important;
                    align-items: center !important;
                    justify-content: center !important;
                    background: #0d6efd !important;
                    border: 2px solid white !important;
                    box-shadow: 0 2px 4px rgba(0,0,0,0.2) !important;
                }

                #btnChangeAvatar:hover {
                    background: #0b5ed7 !important;
                    transform: scale(1.05) !important;
                }

                #avatarImage,
                #avatarIcon {
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                }

                #avatarIcon {
                    font-size: 50px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }

                .password-toggle {
                    position: relative;
                }

                .password-toggle-icon {
                    position: absolute;
                    right: 10px;
                    top: 50%;
                    transform: translateY(-50%);
                    cursor: pointer;
                    color: rgba(255,255,255,0.7);
                }

                .password-toggle-icon:hover {
                    color: white;
                }

                @media (max-width: 768px) {
                    #cropModal .modal-dialog {
                        width: 95vw;
                        height: 95vh;
                    }
                    
                    #cropModal .modal-body {
                        padding: 10px;
                    }
                    
                    #cropModal .modal-header,
                    #cropModal .modal-footer {
                        padding: 0.75rem 1rem;
                    }
                    
                    #cropModal .modal-footer .w-100 {
                        flex-direction: column;
                        gap: 10px;
                    }
                }

                #cropModal .btn {
                    transition: all 0.2s ease;
                }

                #cropModal .btn:hover {
                    transform: translateY(-1px);
                    box-shadow: 0 4px 8px rgba(0,0,0,0.3);
                }

                #cropModal .btn:active {
                    transform: translateY(0);
                }
            </style>

            <div class="row justify-content-center">
                <div class="col-lg-9">
                    <!-- Profile Header Card with Blurry Background -->
                    <div class="card border-0 shadow-sm mb-4 overflow-hidden" style="position: relative; background: white;">
                        <!-- Blurry Background Layer (behind everything) -->
                        <div id="avatarBackground" style="
                            position: absolute;
                            top: 0;
                            left: 0;
                            width: 100%;
                            height: 100%;
                            background-image: url('');
                            background-size: cover;
                            background-position: center;
                            filter: blur(5px);
                            opacity: 0;
                            transition: opacity 0.5s ease;
                            z-index: 0;
                            transform: scale(1.1);
                        "></div>
                        
                        <!-- Dark overlay for better text readability -->
                        <div style="
                            position: absolute;
                            top: 0;
                            left: 0;
                            width: 100%;
                            height: 100%;
                            background: linear-gradient(135deg, rgba(0,0,0,0.6), rgba(0,0,0,0.3));
                            opacity: 0;
                            transition: opacity 0.5s ease;
                            z-index: 1;
                        " id="avatarOverlay"></div>
                        
                        <!-- Card Content (on top with higher z-index) -->
                        <div class="card-body text-center py-5" style="position: relative; z-index: 2; background: transparent;">
                            <div class="mb-3 position-relative d-inline-block">
                                <div id="avatarContainer">
                                    <img id="avatarImage" src="" alt="Avatar" class="d-none">
                                    <i id="avatarIcon" class="bi bi-person-fill text-white"></i>
                                </div>
                                
                                <button class="btn btn-sm btn-primary rounded-circle position-absolute bottom-0 end-0" 
                                        id="btnChangeAvatar">
                                    <i class="bi bi-camera-fill"></i>
                                </button>
                            </div>
                            
                            <!-- Avatar Upload Section -->
                            <div id="avatarUploadSection" class="d-none mt-3">
                                <div class="btn-group mb-2" role="group">
                                    <input type="radio" class="btn-check" name="avatarOption" id="optionUpload" checked>
                                    <label class="btn btn-outline-primary btn-sm" for="optionUpload">
                                        <i class="bi bi-upload me-1"></i>Upload
                                    </label>
                                    
                                    <input type="radio" class="btn-check" name="avatarOption" id="optionLink">
                                    <label class="btn btn-outline-primary btn-sm" for="optionLink">
                                        <i class="bi bi-link-45deg me-1"></i>Link
                                    </label>
                                </div>
                                
                                <div id="uploadOption">
                                    <input type="file" class="form-control form-control-sm" id="avatarFile" accept="image/*">
                                    <small class="text-muted">Pilih foto untuk crop & preview</small>
                                </div>
                                
                                <div id="linkOption" class="d-none">
                                    <input type="url" class="form-control form-control-sm" id="avatarLink" 
                                        placeholder="https://example.com/photo.jpg">
                                </div>
                                
                                <div class="mt-2">
                                    <button class="btn btn-primary btn-sm" id="btnSaveAvatar">
                                        <i class="bi bi-check-circle me-1"></i>Simpan
                                    </button>
                                    <button class="btn btn-secondary btn-sm" id="btnCancelAvatar">Batal</button>
                                </div>
                            </div>
                                                
                            <h3 id="profileDisplayName" class="mb-1 fw-bold" style="color: inherit;">Loading...</h3>
                            <p id="profileDisplayEmail" class="text-muted mb-3">Loading...</p>
                            <button class="btn btn-outline-primary btn-sm" id="btnEditToggle">
                                <i class="bi bi-pencil me-1"></i> Edit Profile
                            </button>
                        </div>
                    </div>

                    <!-- Profile Form Card -->
                    <div class="card border-0 shadow-sm mb-4" style="background: linear-gradient(135deg, #065f46 0%, #0891b2 100%);">
                        <div class="card-body p-4">
                            <h5 class="card-title mb-4 pb-3 border-bottom border-white border-opacity-25 text-white">
                                <i class="bi bi-info-circle me-2"></i>Informasi Pribadi
                            </h5>
                            
                            <form id="profileForm">
                                <div class="row g-3">
                                    <div class="col-md-6">
                                        <label class="form-label text-white text-opacity-75 small mb-1">Email</label>
                                        <input type="email" class="form-control bg-white bg-opacity-10 text-white border-white border-opacity-25" 
                                               id="email" readonly style="backdrop-filter: blur(10px);">
                                    </div>
                                    <div class="col-md-6">
                                        <label class="form-label text-white text-opacity-75 small mb-1">Nama Faskes</label>
                                        <input type="text" class="form-control bg-white bg-opacity-10 text-white border-white border-opacity-25" 
                                               id="nama_faskes" disabled style="backdrop-filter: blur(10px);">
                                    </div>
                                    <div class="col-md-6">
                                        <label class="form-label text-white text-opacity-75 small mb-1">Nama Lengkap</label>
                                        <input type="text" class="form-control bg-white bg-opacity-10 text-white border-white border-opacity-25" 
                                               id="nama_lengkap" disabled style="backdrop-filter: blur(10px);">
                                    </div>
                                    <div class="col-md-6">
                                        <label class="form-label text-white text-opacity-75 small mb-1">Username</label>
                                        <input type="text" class="form-control bg-white bg-opacity-10 text-white border-white border-opacity-25" 
                                               id="username" disabled style="backdrop-filter: blur(10px);">
                                    </div>
                                    <div class="col-md-6">
                                        <label class="form-label text-white text-opacity-75 small mb-1">Jenis Kelamin</label>
                                        <select class="form-select bg-white bg-opacity-10 text-white border-white border-opacity-25" 
                                                id="jenis_kelamin" disabled style="backdrop-filter: blur(10px);">
                                            <option value="">Pilih Jenis Kelamin</option>
                                            <option value="Laki-Laki">Laki-Laki</option>
                                            <option value="Perempuan">Perempuan</option>
                                        </select>
                                    </div>
                                    <div class="col-md-6">
                                        <label class="form-label text-white text-opacity-75 small mb-1">No. Telepon</label>
                                        <input type="text" class="form-control bg-white bg-opacity-10 text-white border-white border-opacity-25" 
                                               id="no_telp" disabled style="backdrop-filter: blur(10px);">
                                    </div>
                                    <div class="col-md-6">
                                        <label class="form-label text-white text-opacity-75 small mb-1">NIK</label>
                                        <input type="text" class="form-control bg-white bg-opacity-10 text-white border-white border-opacity-25" 
                                               id="nik" placeholder="Nomor Induk Kependudukan" disabled style="backdrop-filter: blur(10px);">
                                        <small class="text-white text-opacity-50">Digunakan untuk pencarian ID SatuSehat</small>
                                    </div>
                                    <div class="col-md-6">
                                        <label class="form-label text-white text-opacity-75 small mb-1">RFID</label>
                                        <input type="text" class="form-control bg-white bg-opacity-10 text-white border-white border-opacity-25" 
                                               id="rfid" placeholder="Belum diatur" disabled style="backdrop-filter: blur(10px);">
                                    </div>
                                    <div class="col-md-6">
                                        <label class="form-label text-white text-opacity-75 small mb-1">Jam Kerja</label>
                                        <input type="text" class="form-control bg-white bg-opacity-10 text-white border-white border-opacity-25" 
                                               id="jam_kerja" placeholder="Contoh: 08:00 - 17:00" disabled style="backdrop-filter: blur(10px);">
                                    </div>
                                    <div class="col-md-6">
                                        <label class="form-label text-white text-opacity-75 small mb-1">
                                            <i class="bi bi-hospital me-1"></i>ID SatuSehat (Practitioner)
                                        </label>
                                        <div class="input-group">
                                            <input type="text" class="form-control bg-white bg-opacity-10 text-white border-white border-opacity-25" 
                                                   id="id_satusehat" placeholder="Belum dicari" readonly style="backdrop-filter: blur(10px);">
                                            <button class="btn btn-outline-light" type="button" id="btnSearchSatuSehatId" disabled>
                                                <i class="bi bi-search"></i>
                                            </button>
                                        </div>
                                        <small class="text-white text-opacity-50" id="satusehat_practitioner_info"></small>
                                    </div>
                                    <div class="col-12">
                                        <label class="form-label text-white text-opacity-75 small mb-1">Alamat</label>
                                        <textarea class="form-control bg-white bg-opacity-10 text-white border-white border-opacity-25" 
                                                  id="alamat" rows="3" disabled style="backdrop-filter: blur(10px);"></textarea>
                                    </div>
                                </div>

                                <div class="d-none gap-2 justify-content-end mt-4 pt-3 border-top border-white border-opacity-25" id="actionButtons">
                                    <button type="button" class="btn btn-light" id="btnCancel">
                                        <i class="bi bi-x-circle me-1"></i> Batal
                                    </button>
                                    <button type="submit" class="btn btn-light">
                                        <i class="bi bi-check-circle me-1"></i> Simpan Perubahan
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>

                    <!-- SatuSehat API Configuration Card -->
                    <div class="card border-0 shadow-sm mb-4" style="background: linear-gradient(135deg, #065f46 0%, #0891b2 100%);">
                        <div class="card-body p-4">
                            <div class="d-flex justify-content-between align-items-center mb-4 pb-3 border-bottom border-white border-opacity-25">
                                <h5 class="card-title mb-0 text-white">
                                    <i class="bi bi-shield-check me-2"></i>Konfigurasi SatuSehat API
                                </h5>
                                <div class="form-check form-switch">
                                    <input class="form-check-input" type="checkbox" id="satusehatEnabled" disabled>
                                    <label class="form-check-label text-white small" for="satusehatEnabled">
                                        Aktif
                                    </label>
                                </div>
                            </div>
                            
                            <form id="satusehatForm">
                                <div class="row g-3">
                                    <div class="col-12">
                                        <label class="form-label text-white text-opacity-75 small mb-1">
                                            <i class="bi bi-building me-1"></i>Organization ID
                                        </label>
                                        <input type="text" 
                                               class="form-control bg-white bg-opacity-10 text-white border-white border-opacity-25" 
                                               id="satusehat_org_id" 
                                               placeholder="Contoh: 7b4db35e-ea4e-4b46-b389-095472942d34"
                                               disabled 
                                               style="backdrop-filter: blur(10px);">
                                        <small class="text-white text-opacity-50">ID organisasi dari SatuSehat</small>
                                    </div>
                                    
                                    <div class="col-12">
                                        <label class="form-label text-white text-opacity-75 small mb-1">
                                            <i class="bi bi-key me-1"></i>Client ID
                                        </label>
                                        <input type="text" 
                                               class="form-control bg-white bg-opacity-10 text-white border-white border-opacity-25" 
                                               id="satusehat_client_id" 
                                               placeholder="Client ID dari SatuSehat"
                                               disabled 
                                               style="backdrop-filter: blur(10px);">
                                    </div>
                                    
                                    <div class="col-12">
                                        <label class="form-label text-white text-opacity-75 small mb-1">
                                            <i class="bi bi-shield-lock me-1"></i>Client Secret
                                        </label>
                                        <div class="password-toggle">
                                            <input type="password" 
                                                   class="form-control bg-white bg-opacity-10 text-white border-white border-opacity-25" 
                                                   id="satusehat_client_secret" 
                                                   placeholder="Client Secret dari SatuSehat"
                                                   disabled 
                                                   style="backdrop-filter: blur(10px); padding-right: 40px;">
                                            <i class="bi bi-eye password-toggle-icon" id="toggleSecret"></i>
                                        </div>
                                        <small class="text-white text-opacity-50">Rahasia, jangan dibagikan ke orang lain</small>
                                    </div>
                                </div>

                                <div class="d-none gap-2 justify-content-end mt-4 pt-3 border-top border-white border-opacity-25" id="satusehatActionButtons">
                                    <button type="button" class="btn btn-light" id="btnCancelSatuSehat">
                                        <i class="bi bi-x-circle me-1"></i> Batal
                                    </button>
                                    <button type="button" class="btn btn-success" id="btnTestSatuSehat">
                                        <i class="bi bi-lightning me-1"></i> Test Koneksi
                                    </button>
                                    <button type="submit" class="btn btn-light">
                                        <i class="bi bi-check-circle me-1"></i> Simpan
                                    </button>
                                </div>

                                <div class="mt-3 text-center">
                                    <button type="button" class="btn btn-outline-light btn-sm" id="btnEditSatuSehat">
                                        <i class="bi bi-pencil me-1"></i> Edit Konfigurasi API
                                    </button>
                                </div>
                            </form>
                            
                            <div id="satusehatStatus" class="mt-3 d-none">
                                <div class="alert mb-0" role="alert" id="satusehatStatusMessage"></div>
                            </div>
                        </div>
                    </div>

                    <!-- Location Configuration Card -->
                    <div class="card border-0 shadow-sm mb-4" style="background: linear-gradient(135deg, #065f46 0%, #0891b2 100%);">
                        <div class="card-body p-4">
                            <div class="d-flex justify-content-between align-items-center mb-4 pb-3 border-bottom border-white border-opacity-25">
                                <h5 class="card-title mb-0 text-white">
                                    <i class="bi bi-geo-alt me-2"></i>Lokasi Praktik
                                </h5>
                                <button type="button" class="btn btn-outline-light btn-sm" id="btnEditLocation" disabled>
                                    <i class="bi bi-pencil me-1"></i> Edit Lokasi
                                </button>
                            </div>
                            
                            <div id="locationDisplay" class="mb-3">
                                <div class="bg-white bg-opacity-10 rounded p-3">
                                    <div class="d-flex justify-content-between align-items-start">
                                        <div class="flex-grow-1">
                                            <p class="text-white text-opacity-75 small mb-1">Lokasi Saat Ini:</p>
                                            <h6 class="text-white mb-1" id="currentLocationName">Belum diatur</h6>
                                            <small class="text-white text-opacity-50" id="currentLocationId">-</small>
                                        </div>
                                        <div>
                                            <span class="badge bg-white bg-opacity-25" id="locationStatusBadge">
                                                <i class="bi bi-x-circle me-1"></i>Belum Diatur
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div id="locationEditSection" class="d-none">
                                <div class="alert alert-info bg-white bg-opacity-10 border-white border-opacity-25 text-white">
                                    <i class="bi bi-info-circle me-2"></i>
                                    <small>Lokasi ini akan digunakan saat membuat Encounter di SatuSehat</small>
                                </div>

                                <div class="mb-3">
                                    <label class="form-label text-white text-opacity-75 small mb-1">
                                        <i class="bi bi-search me-1"></i>Cari Lokasi
                                    </label>
                                    <div class="input-group">
                                        <input type="text" 
                                            class="form-control bg-white bg-opacity-10 text-white border-white border-opacity-25" 
                                            id="locationSearchInput"
                                            placeholder="Ketik nama lokasi untuk mencari..."
                                            style="backdrop-filter: blur(10px);">
                                        <button class="btn btn-outline-light" type="button" id="btnSearchLocation">
                                            <i class="bi bi-search"></i> Cari
                                        </button>
                                    </div>
                                    <small class="text-white text-opacity-50">
                                        Kosongkan untuk melihat semua lokasi
                                    </small>
                                </div>

                                <div id="locationResults" class="d-none">
                                    <label class="form-label text-white text-opacity-75 small mb-2">
                                        Pilih Lokasi:
                                    </label>
                                    <div class="list-group" id="locationList" style="max-height: 300px; overflow-y: auto;"></div>
                                </div>

                                <div id="locationLoading" class="text-center py-3 d-none">
                                    <div class="spinner-border text-white" role="status">
                                        <span class="visually-hidden">Loading...</span>
                                    </div>
                                    <p class="text-white mt-2 mb-0">Memuat lokasi...</p>
                                </div>

                                <div class="d-flex gap-2 justify-content-end mt-3 pt-3 border-top border-white border-opacity-25">
                                    <button type="button" class="btn btn-light" id="btnCancelLocation">
                                        <i class="bi bi-x-circle me-1"></i> Batal
                                    </button>
                                </div>
                            </div>

                            <div id="locationNoSatuSehat" class="text-center py-4">
                                <i class="bi bi-exclamation-triangle text-white" style="font-size: 48px; opacity: 0.5;"></i>
                                <p class="text-white mt-3 mb-0">
                                    Aktifkan SatuSehat API terlebih dahulu untuk mengelola lokasi
                                </p>
                            </div>
                        </div>
                    </div>

                    <!-- QR Code Card -->
                    <div class="card border-0 shadow-sm mb-4" style="background: linear-gradient(135deg, #065f46 0%, #0891b2 100%);">
                        <div class="card-body text-center text-white p-5">
                            <h4 class="mb-4 fw-bold">
                                <i class="bi bi-qr-code me-2"></i>QR Code Antrian
                            </h4>
                            
                            <div id="qrSection">
                                <div id="qrDisplayArea" class="d-none">
                                    <div class="bg-white p-4 rounded mb-3 d-inline-block">
                                        <div id="qrCanvas"></div>
                                    </div>
                                    <p class="small mb-3">Pasien scan QR ini untuk daftar antrian</p>
                                    <div class="d-flex gap-2 justify-content-center flex-wrap">
                                        <button class="btn btn-light" id="btnDownloadQR">
                                            <i class="bi bi-download me-2"></i>Download QR
                                        </button>
                                        <button class="btn btn-light" id="btnPrintQR">
                                            <i class="bi bi-printer me-2"></i>Print QR
                                        </button>
                                        <button class="btn btn-outline-light" id="btnRegenerateQR">
                                            <i class="bi bi-arrow-repeat me-2"></i>Generate Ulang
                                        </button>
                                    </div>
                                </div>
                                
                                <div id="qrGenerateArea">
                                    <i class="bi bi-qr-code mb-3" style="font-size: 80px; opacity: 0.5;"></i>
                                    <p class="mb-4">QR Code belum dibuat. Klik tombol di bawah untuk generate QR Code antrian Anda.</p>
                                    <button class="btn btn-light btn-lg" id="btnGenerateQR">
                                        <i class="bi bi-qr-code-scan me-2"></i>Generate QR Code
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- QRIS Payment Card -->
                    <div class="card border-0 shadow-sm mb-4" style="background: linear-gradient(135deg, #065f46 0%, #0891b2 100%);">
                        <div class="card-body text-center text-white p-5">
                            <h4 class="mb-4 fw-bold">
                                <i class="bi bi-qr-code-scan me-2"></i>QRIS Payment
                            </h4>
                            
                            <div id="qrisSection">
                                <!-- Display Area (when QRIS exists) -->
                                <div id="qrisDisplayArea" class="d-none">
                                    <div class="bg-white p-4 rounded mb-3 d-inline-block">
                                        <img id="qrisImage" src="" alt="QRIS Code" style="max-width: 300px; max-height: 300px;">
                                    </div>
                                    <p class="small mb-3">Pasien scan QRIS ini untuk pembayaran antrian</p>
                                    <div class="d-flex gap-2 justify-content-center flex-wrap">
                                        <button class="btn btn-light" id="btnDownloadQRIS">
                                            <i class="bi bi-download me-2"></i>Download QRIS
                                        </button>
                                        <button class="btn btn-light" id="btnPrintQRIS">
                                            <i class="bi bi-printer me-2"></i>Print QRIS
                                        </button>
                                        <button class="btn btn-outline-light" id="btnChangeQRIS">
                                            <i class="bi bi-arrow-repeat me-2"></i>Ganti QRIS
                                        </button>
                                    </div>
                                </div>
                                
                                <!-- Upload Area (when no QRIS or changing) -->
                                <div id="qrisUploadArea">
                                    <i class="bi bi-qr-code-scan mb-3" style="font-size: 80px; opacity: 0.5;"></i>
                                    <p class="mb-4">Upload QRIS code Anda untuk pembayaran antrian</p>
                                    
                                    <div class="btn-group mb-3" role="group">
                                        <input type="radio" class="btn-check" name="qrisOption" id="qrisOptionUpload" checked>
                                        <label class="btn btn-outline-light" for="qrisOptionUpload">
                                            <i class="bi bi-upload me-1"></i>Upload File
                                        </label>
                                        
                                        <input type="radio" class="btn-check" name="qrisOption" id="qrisOptionLink">
                                        <label class="btn btn-outline-light" for="qrisOptionLink">
                                            <i class="bi bi-link-45deg me-1"></i>Link URL
                                        </label>
                                    </div>
                                    
                                    <div id="qrisUploadOption" class="mb-3">
                                        <input type="file" class="form-control" id="qrisFile" accept="image/*">
                                        <small class="text-white text-opacity-75 d-block mt-2">
                                            Format: JPG, PNG, atau WebP (Max 5MB)
                                        </small>
                                    </div>
                                    
                                    <div id="qrisLinkOption" class="d-none mb-3">
                                        <input type="url" class="form-control" id="qrisLink" 
                                            placeholder="https://example.com/qris.jpg">
                                        <small class="text-white text-opacity-75 d-block mt-2">
                                            Masukkan URL gambar QRIS
                                        </small>
                                    </div>
                                    
                                    <div id="qrisPreview" class="mt-3 d-none">
                                        <div class="bg-white p-3 rounded d-inline-block">
                                            <img id="qrisPreviewImage" src="" alt="Preview" style="max-width: 250px; max-height: 250px;">
                                        </div>
                                        <div class="mt-2">
                                            <button class="btn btn-success" id="btnSaveQRIS">
                                                <i class="bi bi-check-circle me-1"></i>Simpan QRIS
                                            </button>
                                            <button class="btn btn-secondary" id="btnCancelQRIS">
                                                Batal
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Subscription Card -->
                    <div class="card border-0 shadow-sm mb-4" style="background: linear-gradient(135deg, #065f46 0%, #0891b2 100%);">
                        <div class="card-body text-center text-white p-5">
                            <h4 class="mb-4 fw-bold">
                                <i class="bi bi-calendar-check me-2"></i>Status Langganan
                            </h4>
                            
                            <div class="bg-white bg-opacity-10 rounded p-4 mb-4">
                                <div class="d-flex justify-content-between mb-3">
                                    <span class="text-white-50">Tanggal Mulai:</span>
                                    <strong id="tanggalMulai">-</strong>
                                </div>
                                <div class="d-flex justify-content-between mb-3">
                                    <span class="text-white-50">Tanggal Berakhir:</span>
                                    <strong id="tanggalBerakhir">-</strong>
                                </div>
                                <div class="d-flex justify-content-between">
                                    <span class="text-white-50">Sisa Hari:</span>
                                    <strong id="sisaHari" class="fs-4">-</strong>
                                </div>
                            </div>

                            <button class="btn btn-light w-100 mb-3" id="btnPerpanjang">
                                <i class="bi bi-arrow-clockwise me-2"></i>Perpanjang 30 Hari
                            </button>

                            <button class="btn btn-outline-light w-100" id="btnCekStatus">
                                <i class="bi bi-check-circle me-2"></i>Cek Status Pembayaran
                            </button>

                            <div id="vaNumberDisplay" class="mt-4 p-3 bg-white bg-opacity-25 rounded d-none">
                                <p class="small mb-2">Virtual Account:</p>
                                <h5 class="mb-2" id="vaNumber">-</h5>
                                <p class="small mb-2">Jumlah: <strong id="vaAmount">-</strong></p>
                                <button class="btn btn-sm btn-light" id="btnCopyVA">
                                    <i class="bi bi-clipboard me-1"></i> Salin VA
                                </button>
                            </div>
                        </div>
                    </div>

                    <!-- Timestamps -->
                    <div class="card border-0 shadow-sm">
                        <div class="card-body p-3">
                            <div class="d-flex justify-content-between text-muted small">
                                <span><i class="bi bi-calendar-plus me-2"></i>Dibuat: <span id="created_at">-</span></span>
                                <span><i class="bi bi-clock-history me-2"></i>Update: <span id="updated_at">-</span></span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- CROP MODAL - PLACED OUTSIDE ALL CARDS -->
            <div class="cropper-modal-backdrop" id="cropperBackdrop"></div>
            <div id="cropModal" class="modal">
                <div class="modal-dialog">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title text-white">
                                <i class="bi bi-crop me-2"></i>Crop Foto Profil
                            </h5>
                            <button type="button" class="btn-close btn-close-white" id="btnCloseCrop"></button>
                        </div>
                        <div class="modal-body">
                            <div class="crop-container">
                                <img id="cropImage" src="" alt="Crop image">
                            </div>
                        </div>
                        <div class="modal-footer">
                            <div class="w-100 d-flex justify-content-between align-items-center flex-wrap gap-2">
                                <div class="text-white small">
                                    <i class="bi bi-info-circle me-2"></i>
                                    Drag untuk pindah | Scroll untuk zoom | Drag sudut untuk resize
                                </div>
                                <div>
                                    <button type="button" class="btn btn-secondary me-2" id="btnCancelCrop">
                                        <i class="bi bi-x-lg me-1"></i>Batal
                                    </button>
                                    <button type="button" class="btn btn-primary" id="btnApplyCrop">
                                        <i class="bi bi-check-lg me-1"></i>Terapkan Crop
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    async onInit() {
        console.log('🟢 ProfileFragment onInit');
        
        const user = JSON.parse(localStorage.getItem('user') || 'null');
        
        if (!user || !user.email) {
            alert('Session expired. Please login again.');
            window.location.href = '../LandingPage/booksaw-1.0.0/index.html';
            return;
        }

        // ⭐ NEW: Detect user role
        this.userRole = localStorage.getItem('user_role') || 'dokter';
        this.isAsisten = this.userRole === 'asisten_dokter';
        
        console.log('👤 User role:', this.userRole);
        console.log('🔹 Is Asisten:', this.isAsisten);

        this.formFields = ['nama_faskes', 'nama_lengkap', 'username', 'jenis_kelamin', 'no_telp', 'nik', 'rfid', 'jam_kerja', 'alamat'];
        this.satusehatFields = ['satusehat_org_id', 'satusehat_client_id', 'satusehat_client_secret'];

        try {
            await this.initializeSubscription(user.email);
            
            if (!this.currentDokterId) {
                console.warn('⚠️ Doctor ID not set after initialization, waiting...');
                await new Promise(resolve => setTimeout(resolve, 1000));
            }
            
            // ⭐ NEW: Load profile based on role
            if (this.isAsisten) {
                await this.loadAsistenProfile();
            } else {
                await this.loadProfile();
            }
            
            await this.loadQRCode();
            await this.loadQRIS();
            this.attachEventListeners();
            
            // ⭐ NEW: Apply role-based UI restrictions
            this.applyRoleBasedUI();
            
            console.log('✅ ProfileFragment fully initialized');
        } catch (error) {
            console.error('❌ Error initializing ProfileFragment:', error);
            alert('Gagal memuat profil. Silakan refresh halaman.');
        }
    }

    async initializeSubscription(email) {
        const access_token = localStorage.getItem('access_token');
        
        const { data: { user }, error } = await supabaseClient.auth.getUser();
        
        if (error || !user) {
            localStorage.removeItem("access_token");
            alert('Session expired. Please login again.');
            window.location.replace("http://localhost/mapotek_php/WEB/LandingPage/booksaw-1.0.0/index.html");
            return;
        }
        
        try {
            if (!window.supabaseClient) {
                console.error('❌ Supabase not initialized');
                return;
            }

            // ⭐ NEW: Detect user role first
            const userRole = localStorage.getItem('user_role');
            console.log('👤 Initializing subscription for role:', userRole);
            console.log('📧 Email from localStorage:', email);

            let dokterId = null;

            if (userRole === 'asisten_dokter') {
                // ✅ For asisten: Get id_dokter from asisten_dokter table
                console.log('🔍 Fetching asisten data...');
                console.log('   Query: asisten_dokter table where email =', email);
                
                // ⚠️ CRITICAL FIX: Use ilike for case-insensitive matching
                const { data: asisten, error: asistenError } = await window.supabaseClient
                    .from('asisten_dokter')
                    .select('id_dokter, id_asisten_dokter, email, nama_lengkap')
                    .ilike('email', email) // Changed from .eq to .ilike for case-insensitive
                    .single();

                console.log('📊 Query result:', { asisten, asistenError });

                if (asistenError) {
                    console.error('❌ Supabase error:', asistenError);
                    
                    // Try to fetch all asisten records to debug
                    console.log('🔍 Debugging: Fetching all asisten records...');
                    const { data: allAsisten } = await window.supabaseClient
                        .from('asisten_dokter')
                        .select('email, nama_lengkap')
                        .limit(5);
                    console.log('📋 Sample asisten emails in database:', allAsisten);
                    
                    alert('Gagal memuat data asisten. Email: ' + email + '\nError: ' + asistenError.message);
                    return;
                }

                if (!asisten) {
                    console.error('❌ No asisten found with email:', email);
                    
                    // Check if email exists with different casing
                    const { data: asistenCheck } = await window.supabaseClient
                        .from('asisten_dokter')
                        .select('email, nama_lengkap')
                        .limit(10);
                    console.log('📋 Available asisten records:', asistenCheck);
                    
                    alert('Data asisten tidak ditemukan untuk email: ' + email);
                    return;
                }

                dokterId = asisten.id_dokter; // Parent doctor's ID
                
                // Store both IDs
                localStorage.setItem('id_dokter', asisten.id_dokter);
                localStorage.setItem('id_asisten_dokter', asisten.id_asisten_dokter);
                
                console.log('✅ Asisten data loaded:');
                console.log('   - Asisten Name:', asisten.nama_lengkap);
                console.log('   - Asisten Email:', asisten.email);
                console.log('   - Parent Doctor ID:', asisten.id_dokter);
                console.log('   - Asisten ID:', asisten.id_asisten_dokter);

            } else {
                // ✅ For dokter: Get id_dokter from dokter table
                console.log('🔍 Fetching dokter data...');
                
                // Also use ilike for consistency
                const { data: dokter, error: dokterError } = await window.supabaseClient
                    .from('dokter')
                    .select('id_dokter, email, nama_lengkap')
                    .ilike('email', email) // Changed from .eq to .ilike
                    .single();

                if (dokterError || !dokter) {
                    console.error('❌ Could not get doctor data:', dokterError);
                    alert('Gagal memuat data dokter. Silakan login ulang.');
                    return;
                }

                dokterId = dokter.id_dokter;
                
                // Store doctor ID
                localStorage.setItem('id_dokter', dokter.id_dokter);
                
                console.log('✅ Dokter data loaded:');
                console.log('   - Doctor Name:', dokter.nama_lengkap);
                console.log('   - Doctor Email:', dokter.email);
                console.log('   - Doctor ID:', dokter.id_dokter);
            }

            this.currentDokterId = dokterId;
            localStorage.setItem('currentDokterId', this.currentDokterId);
            
            console.log('🟢 Current Doctor ID set:', this.currentDokterId);

            // Load subscription status using doctor ID (works for both roles)
            await this.loadSubscriptionStatus();

        } catch (error) {
            console.error('❌ Error initializing subscription:', error);
            alert('Terjadi kesalahan saat memuat data. Silakan refresh halaman.');
        }
    }

    attachEventListeners() {
        document.getElementById('btnEditToggle')?.addEventListener('click', () => this.enableEdit());
        document.getElementById('btnCancel')?.addEventListener('click', () => this.cancelEdit());
        document.getElementById('profileForm')?.addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveProfile();
        });

        // Avatar listeners
        document.getElementById('btnChangeAvatar')?.addEventListener('click', () => this.showAvatarUpload());
        document.getElementById('btnCancelAvatar')?.addEventListener('click', () => {
            this.hideAvatarUpload();
            this.restoreOriginalAvatar();
        });
        document.getElementById('avatarFile')?.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                console.log('📁 File selected:', {
                    name: file.name,
                    type: file.type,
                    size: file.size,
                    lastModified: new Date(file.lastModified)
                });
                this.showCropModal(file);
            } else {
                e.target.value = '';
            }
        });
        document.getElementById('btnCloseCrop')?.addEventListener('click', () => this.closeCropModal());
        document.getElementById('btnCancelCrop')?.addEventListener('click', () => this.closeCropModal());
        document.getElementById('btnApplyCrop')?.addEventListener('click', () => this.applyCrop());
        document.getElementById('btnSaveAvatar')?.addEventListener('click', () => this.saveAvatar());

        document.getElementById('optionUpload')?.addEventListener('change', () => {
            document.getElementById('uploadOption').classList.remove('d-none');
            document.getElementById('linkOption').classList.add('d-none');
        });
        document.getElementById('optionLink')?.addEventListener('change', () => {
            document.getElementById('uploadOption').classList.add('d-none');
            document.getElementById('linkOption').classList.remove('d-none');
        });

        // SatuSehat listeners
        document.getElementById('btnEditSatuSehat')?.addEventListener('click', () => this.enableSatuSehatEdit());
        document.getElementById('btnCancelSatuSehat')?.addEventListener('click', () => this.cancelSatuSehatEdit());
        document.getElementById('satusehatForm')?.addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveSatuSehatConfig();
        });
        document.getElementById('btnTestSatuSehat')?.addEventListener('click', () => this.testSatuSehatConnection());
        document.getElementById('toggleSecret')?.addEventListener('click', () => this.togglePasswordVisibility());
        document.getElementById('satusehatEnabled')?.addEventListener('change', (e) => {
            if (!e.target.disabled) {
                this.toggleSatuSehatEnabled(e.target.checked);
            }
        });
        document.getElementById('btnSearchSatuSehatId')?.addEventListener('click', () => this.searchSatuSehatId());

        // Location listeners
        document.getElementById('btnEditLocation')?.addEventListener('click', () => this.enableLocationEdit());
        document.getElementById('btnCancelLocation')?.addEventListener('click', () => this.cancelLocationEdit());
        document.getElementById('btnSearchLocation')?.addEventListener('click', () => this.searchLocations());
        document.getElementById('locationSearchInput')?.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.searchLocations();
            }
        });

        // QR Code listeners
        document.getElementById('btnGenerateQR')?.addEventListener('click', () => this.generateQRCode());
        document.getElementById('btnDownloadQR')?.addEventListener('click', () => this.downloadQRCode());
        document.getElementById('btnPrintQR')?.addEventListener('click', () => this.printQRCode());
        document.getElementById('btnRegenerateQR')?.addEventListener('click', () => this.generateQRCode(true));

        document.getElementById('qrisOptionUpload')?.addEventListener('change', () => {
            document.getElementById('qrisUploadOption').classList.remove('d-none');
            document.getElementById('qrisLinkOption').classList.add('d-none');
        });

        document.getElementById('qrisOptionLink')?.addEventListener('change', () => {
            document.getElementById('qrisUploadOption').classList.add('d-none');
            document.getElementById('qrisLinkOption').classList.remove('d-none');
            document.getElementById('qrisPreview').classList.add('d-none');
            document.getElementById('qrisFile').value = '';
            this.qrisFileBlob = null;
            this.qrisUrlLink = null;
        });

        document.getElementById('qrisFile')?.addEventListener('change', (e) => this.previewQRIS(e.target.files[0]));
        document.getElementById('qrisLink')?.addEventListener('input', (e) => this.previewQRISFromLink(e.target.value));
        document.getElementById('btnSaveQRIS')?.addEventListener('click', () => this.saveQRIS());
        document.getElementById('btnCancelQRIS')?.addEventListener('click', () => this.cancelQRISUpload());
        document.getElementById('btnChangeQRIS')?.addEventListener('click', () => this.changeQRIS());
        document.getElementById('btnDownloadQRIS')?.addEventListener('click', () => this.downloadQRIS());
        document.getElementById('btnPrintQRIS')?.addEventListener('click', () => this.printQRIS());

        // Subscription listeners
        document.getElementById('btnPerpanjang')?.addEventListener('click', () => this.extendSubscription());
        document.getElementById('btnCekStatus')?.addEventListener('click', () => this.checkPaymentStatus());
        document.getElementById('btnCopyVA')?.addEventListener('click', () => this.copyVANumber());

        console.log('🟢 All event listeners attached');
    }

    // Avatar Methods
    showAvatarUpload() {
        this.storeOriginalAvatar();
        document.getElementById('avatarUploadSection')?.classList.remove('d-none');
    }

    hideAvatarUpload() {
        document.getElementById('avatarUploadSection')?.classList.add('d-none');
        
        const fileInput = document.getElementById('avatarFile');
        if (fileInput) {
            fileInput.value = '';
        }
        
        const linkInput = document.getElementById('avatarLink');
        if (linkInput) {
            linkInput.value = '';
        }
        
        document.getElementById('optionUpload').checked = true;
        document.getElementById('uploadOption').classList.remove('d-none');
        document.getElementById('linkOption').classList.add('d-none');
        
        // Clear the cropped blob
        this.croppedBlob = null;
    }

    storeOriginalAvatar() {
        const avatarImage = document.getElementById('avatarImage');
        if (avatarImage) {
            this.originalAvatarUrl = avatarImage.src;
            this.originalAvatarVisible = !avatarImage.classList.contains('d-none');
        }
    }

    restoreOriginalAvatar() {
        const avatarImage = document.getElementById('avatarImage');
        const avatarIcon = document.getElementById('avatarIcon');
        
        if (!avatarImage || !avatarIcon) return;
        
        if (this.originalAvatarVisible && this.originalAvatarUrl && this.originalAvatarUrl !== window.location.href) {
            avatarImage.src = this.originalAvatarUrl;
            avatarImage.classList.remove('d-none');
            avatarIcon.classList.add('d-none');
        } else {
            avatarImage.classList.add('d-none');
            avatarImage.src = '';
            avatarIcon.classList.remove('d-none');
        }
    }

    showCropModal(file) {
        // Prevent multiple simultaneous calls
        if (this.isProcessingFile) {
            console.log('Already processing a file');
            return;
        }
        
        if (!file) {
            console.log('No file selected');
            return;
        }
        
        // Validate file type
        if (!file.type.startsWith('image/')) {
            alert('File harus berupa gambar!');
            const fileInput = document.getElementById('avatarFile');
            if (fileInput) {
                fileInput.value = '';
                fileInput.blur();
            }
            return;
        }
        
        // Validate file size (5MB)
        if (file.size > 5 * 1024 * 1024) {
            alert('Ukuran file terlalu besar. Maksimal 5MB');
            const fileInput = document.getElementById('avatarFile');
            if (fileInput) {
                fileInput.value = '';
                fileInput.blur();
            }
            return;
        }
        
        // Set processing flag
        this.isProcessingFile = true;
        
        // Destroy existing cropper
        if (this.cropper) {
            this.cropper.destroy();
            this.cropper = null;
        }
        
        const reader = new FileReader();
        
        reader.onload = (e) => {
            const modal = document.getElementById('cropModal');
            const backdrop = document.getElementById('cropperBackdrop');
            const cropImage = document.getElementById('cropImage');
            
            if (!modal || !backdrop || !cropImage) {
                console.error('❌ Modal elements not found');
                alert('Gagal menginisialisasi modal. Refresh halaman dan coba lagi.');
                this.isProcessingFile = false;
                return;
            }
            
            // Validate result
            if (!e.target || !e.target.result) {
                console.error('❌ FileReader result is empty');
                alert('Gagal membaca file. Coba file lain.');
                this.isProcessingFile = false;
                return;
            }
            
            console.log('✅ FileReader loaded, data length:', e.target.result.length);
            
            // IMPORTANT: Set up error handler BEFORE setting src
            let errorHandled = false; // Flag to prevent multiple error alerts
            
            cropImage.onerror = (error) => {
                // Only handle error once
                if (errorHandled) {
                    return;
                }
                errorHandled = true;
                
                console.error('❌ Image load error:', error);
                console.error('Image src length:', cropImage.src?.length || 0);
                
                // Remove event handlers to prevent further triggers
                cropImage.onload = null;
                cropImage.onerror = null;
                
                // Clean up - set to empty string without quotes to avoid triggering error again
                cropImage.removeAttribute('src');
                
                const fileInput = document.getElementById('avatarFile');
                if (fileInput) {
                    fileInput.value = '';
                }
                
                this.isProcessingFile = false;
                
                // Show alert ONCE
                alert('Gagal memuat gambar. File mungkin rusak atau format tidak didukung. Coba file JPG atau PNG lain.');
            };
            
            cropImage.onload = () => {
                // Clear error handler since image loaded successfully
                cropImage.onerror = null;
                
                console.log('✅ Image loaded successfully');
                console.log('Image dimensions:', cropImage.naturalWidth, 'x', cropImage.naturalHeight);
                
                // Validate image dimensions
                if (cropImage.naturalWidth === 0 || cropImage.naturalHeight === 0) {
                    console.error('❌ Invalid image dimensions');
                    alert('File gambar tidak valid atau rusak.');
                    cropImage.removeAttribute('src');
                    this.isProcessingFile = false;
                    return;
                }
                
                // Show modal
                backdrop.classList.add('show');
                modal.classList.add('show');
                document.body.classList.add('modal-open');
                
                // Initialize cropper with delay
                setTimeout(() => {
                    try {
                        this.cropper = new Cropper(cropImage, {
                            aspectRatio: 1,
                            viewMode: 2,
                            dragMode: 'move',
                            autoCropArea: 0.9,
                            restore: false,
                            guides: true,
                            center: true,
                            highlight: true,
                            cropBoxMovable: true,
                            cropBoxResizable: true,
                            toggleDragModeOnDblclick: false,
                            responsive: true,
                            checkOrientation: true,
                            zoomable: true,
                            zoomOnWheel: true,
                            wheelZoomRatio: 0.1,
                            background: true,
                            modal: true,
                            movable: true,
                            minContainerWidth: 200,
                            minContainerHeight: 200,
                            ready: () => {
                                console.log('✅ Cropper initialized and ready!');
                                // Reset processing flag after cropper is fully ready
                                this.isProcessingFile = false;
                            }
                        });
                        
                        console.log('✅ Cropper instance created');
                        
                    } catch (error) {
                        console.error('❌ Cropper initialization error:', error);
                        alert('Gagal menginisialisasi cropper: ' + error.message);
                        this.closeCropModal();
                        this.isProcessingFile = false;
                    }
                }, 250);
            };
            
            // Set the image source AFTER setting up the handlers
            cropImage.src = e.target.result;
        };
        
        reader.onerror = (error) => {
            console.error('❌ FileReader error:', error);
            alert('Gagal membaca file. Coba lagi.');
            
            const fileInput = document.getElementById('avatarFile');
            if (fileInput) {
                fileInput.value = '';
            }
            this.isProcessingFile = false;
        };
        
        // Start reading the file
        try {
            reader.readAsDataURL(file);
        } catch (error) {
            console.error('❌ Error starting FileReader:', error);
            alert('Gagal memproses file: ' + error.message);
            this.isProcessingFile = false;
        }
    }

    closeCropModal() {
        const modal = document.getElementById('cropModal');
        const backdrop = document.getElementById('cropperBackdrop');
        
        modal.classList.remove('show');
        backdrop.classList.remove('show');
        document.body.classList.remove('modal-open');
        
        if (this.cropper) {
            this.cropper.destroy();
            this.cropper = null;
        }
        
        // Clear file input
        const fileInput = document.getElementById('avatarFile');
        if (fileInput) {
            fileInput.value = '';
        }
        
        // Clear the crop image source
        const cropImage = document.getElementById('cropImage');
        if (cropImage) {
            cropImage.src = '';
            cropImage.onload = null;
            cropImage.onerror = null;
        }
    }

    applyCrop() {
        if (!this.cropper) {
            console.error('❌ No cropper instance');
            alert('Cropper belum diinisialisasi. Coba lagi.');
            return;
        }
        
        console.log('🔧 Applying crop...');
        
        const canvas = this.cropper.getCroppedCanvas({
            width: 300,
            height: 300,
            imageSmoothingQuality: 'high'
        });
        
        if (!canvas) {
            alert('Gagal membuat canvas. Coba lagi.');
            return;
        }
        
        canvas.toBlob((blob) => {
            if (!blob) {
                alert('Gagal membuat blob. Coba lagi.');
                return;
            }
            
            this.croppedBlob = blob;
            
            const url = URL.createObjectURL(blob);
            document.getElementById('avatarImage').src = url;
            document.getElementById('avatarImage').classList.remove('d-none');
            document.getElementById('avatarIcon').classList.add('d-none');
            
            console.log('✅ Crop applied, showing preview');
            
            this.closeCropModal();
            
            this.showToast('✅ Foto di-crop! Klik "Simpan" untuk upload.', 'info');
            
        }, 'image/jpeg', 0.9);
    }

    async saveAvatar() {
        const isUpload = document.getElementById('optionUpload').checked;
        let avatarUrl = '';
        
        const btnSave = document.getElementById('btnSaveAvatar');
        btnSave.disabled = true;
        btnSave.innerHTML = '<span class="spinner-border spinner-border-sm me-1"></span>Menyimpan...';
        
        try {
            if (isUpload) {
                console.log('🔧 Upload mode, checking croppedBlob:', this.croppedBlob);
                
                if (!this.croppedBlob) {
                    alert('Pilih dan crop foto terlebih dahulu');
                    btnSave.disabled = false;
                    btnSave.innerHTML = '<i class="bi bi-check-circle me-1"></i>Simpan';
                    return;
                }
                
                console.log('🔧 Blob size:', this.croppedBlob.size, 'bytes');
                console.log('🔧 Blob type:', this.croppedBlob.type);
                console.log('🔧 Uploading cropped image...');
                
                avatarUrl = await this.uploadToSupabase(this.croppedBlob);
                console.log('✅ Upload successful:', avatarUrl);
                
            } else {
                avatarUrl = document.getElementById('avatarLink').value;
                console.log('🔧 Link mode, URL:', avatarUrl);
                
                if (!avatarUrl) {
                    alert('Masukkan link foto');
                    btnSave.disabled = false;
                    btnSave.innerHTML = '<i class="bi bi-check-circle me-1"></i>Simpan';
                    return;
                }
                
                if (!avatarUrl.match(/^https?:\/\/.+\.(jpg|jpeg|png|gif|webp)$/i)) {
                    alert('URL harus berupa link gambar yang valid');
                    btnSave.disabled = false;
                    btnSave.innerHTML = '<i class="bi bi-check-circle me-1"></i>Simpan';
                    return;
                }
            }
            
            console.log('🔧 Avatar URL to save:', avatarUrl);
            console.log('🔧 Updating database...');
            
            await this.updateAvatarInDatabase(avatarUrl);
            console.log('✅ Database updated successfully');
            
            this.displayAvatar(avatarUrl);
            this.hideAvatarUpload();
            this.croppedBlob = null;
            
            this.dispatchProfileUpdate(null, null, avatarUrl);
            
            this.showToast('✅ Foto profil berhasil diupdate!', 'success');
            
        } catch (error) {
            console.error('❌ Error saving avatar:', error);
            console.error('Error details:', {
                message: error.message,
                stack: error.stack
            });
            alert('Gagal menyimpan foto: ' + error.message);
            this.restoreOriginalAvatar();
        } finally {
            btnSave.disabled = false;
            btnSave.innerHTML = '<i class="bi bi-check-circle me-1"></i>Simpan';
        }
    }

    async uploadToSupabase(fileOrBlob) {
        const timestamp = Date.now();
        const random = Math.random().toString(36).substring(7);
        const fileName = `${timestamp}_${random}.jpg`;
        const filePath = `avatars/${fileName}`;
        
        const { data, error } = await window.supabaseClient.storage
            .from('avatars')
            .upload(filePath, fileOrBlob, {
                cacheControl: '3600',
                upsert: false,
                contentType: 'image/jpeg'
            });
        
        if (error) {
            throw new Error('Upload failed: ' + error.message);
        }
        
        const { data: urlData } = window.supabaseClient.storage
            .from('avatars')
            .getPublicUrl(filePath);
        
        return urlData.publicUrl;
    }

    async updateAvatarInDatabase(avatarUrl) {
        const user = JSON.parse(localStorage.getItem('user'));
        
        const response = await fetch('../API/auth/profile.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                action: this.isAsisten ? 'update_asisten_avatar' : 'update_avatar',
                email: user.email,
                avatar_url: avatarUrl
            })
        });
        
        const result = await response.json();
        
        if (!result.success) {
            throw new Error(result.message);
        }
    }

    displayAvatar(avatarUrl) {
        const avatarImage = document.getElementById('avatarImage');
        const avatarIcon = document.getElementById('avatarIcon');
        const avatarBackground = document.getElementById('avatarBackground');
        const avatarOverlay = document.getElementById('avatarOverlay');
        const profileDisplayName = document.getElementById('profileDisplayName');
        const profileDisplayEmail = document.getElementById('profileDisplayEmail');
        
        if (!avatarImage || !avatarIcon) return;
        
        if (avatarUrl && avatarUrl !== '' && avatarUrl !== window.location.href) {
            // Show avatar image
            avatarImage.src = avatarUrl;
            avatarImage.classList.remove('d-none');
            avatarIcon.classList.add('d-none');
            
            // Show blurry background with the avatar
            if (avatarBackground) {
                avatarBackground.style.backgroundImage = `url('${avatarUrl}')`;
                avatarBackground.style.opacity = '1';
            }
            
            // Show dark overlay for text readability
            if (avatarOverlay) {
                avatarOverlay.style.opacity = '1';
            }
            
            // Change text color to white for better contrast
            if (profileDisplayName) {
                profileDisplayName.style.color = 'white';
            }
            if (profileDisplayEmail) {
                profileDisplayEmail.style.color = 'rgba(255, 255, 255, 0.8)';
            }
        } else {
            // No avatar - show icon
            avatarImage.classList.add('d-none');
            avatarImage.src = '';
            avatarIcon.classList.remove('d-none');
            
            // Hide background and overlay
            if (avatarBackground) {
                avatarBackground.style.opacity = '0';
            }
            if (avatarOverlay) {
                avatarOverlay.style.opacity = '0';
            }
            
            // Reset text colors to default
            if (profileDisplayName) {
                profileDisplayName.style.color = '';
            }
            if (profileDisplayEmail) {
                profileDisplayEmail.style.color = '';
            }
        }
    }

    // Profile Edit Methods
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
        document.getElementById('btnEditToggle').style.display = '';
        this.loadProfile();
    }

    async loadProfile() {
        const user = JSON.parse(localStorage.getItem('user'));
        
        if (!user || !user.email) {
            console.error('❌ No user in localStorage');
            return;
        }
        
        try {
            const response = await fetch('../API/auth/profile.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    action: 'get',
                    email: user.email
                })
            });

            const result = await response.json();
            
            if (result.success) {
                const profile = result.data;
                
                document.getElementById('profileDisplayName').textContent = profile.nama_lengkap || 'Nama Belum Diisi';
                document.getElementById('profileDisplayEmail').textContent = profile.email || '';
                
                document.getElementById('email').value = profile.email || '';
                document.getElementById('nama_faskes').value = profile.nama_faskes || '';
                document.getElementById('nama_lengkap').value = profile.nama_lengkap || '';
                document.getElementById('username').value = profile.username || '';
                document.getElementById('jenis_kelamin').value = profile.jenis_kelamin || '';
                document.getElementById('no_telp').value = profile.no_telp || '';
                document.getElementById('nik').value = profile.nik || '';
                document.getElementById('rfid').value = profile.rfid || '';
                document.getElementById('jam_kerja').value = profile.jam_kerja || '';
                document.getElementById('alamat').value = profile.alamat || '';
                
                document.getElementById('satusehat_org_id').value = profile.satusehat_org_id || '';
                document.getElementById('satusehat_client_id').value = profile.satusehat_client_id || '';
                document.getElementById('satusehat_client_secret').value = profile.satusehat_client_secret || '';
                document.getElementById('satusehatEnabled').checked = profile.satusehat_enabled || false;
                
                document.getElementById('id_satusehat').value = profile.id_satusehat || '';
                const infoDisplay = document.getElementById('satusehat_practitioner_info');
                if (profile.id_satusehat) {
                    infoDisplay.textContent = profile.nama_lengkap + 
                        (profile.nik ? ' (NIK: ' + profile.nik + ')' : '');
                } else {
                    infoDisplay.textContent = '';
                }
                
                const btnSearch = document.getElementById('btnSearchSatuSehatId');
                btnSearch.disabled = !(profile.satusehat_enabled || false);
                
                document.getElementById('currentLocationName').textContent = 
                    profile.satusehat_location_name || 'Belum diatur';
                document.getElementById('currentLocationId').textContent = 
                    profile.satusehat_location_id ? 'ID: ' + profile.satusehat_location_id : '-';

                const locationStatusBadge = document.getElementById('locationStatusBadge');
                if (profile.satusehat_location_id) {
                    locationStatusBadge.innerHTML = '<i class="bi bi-check-circle me-1"></i>Aktif';
                    locationStatusBadge.className = 'badge bg-success';
                } else {
                    locationStatusBadge.innerHTML = '<i class="bi bi-x-circle me-1"></i>Belum Diatur';
                    locationStatusBadge.className = 'badge bg-white bg-opacity-25';
                }

                const btnEditLocation = document.getElementById('btnEditLocation');
                const locationNoSatuSehat = document.getElementById('locationNoSatuSehat');
                const locationDisplay = document.getElementById('locationDisplay');

                if (profile.satusehat_enabled) {
                    btnEditLocation.disabled = false;
                    locationNoSatuSehat.classList.add('d-none');
                    locationDisplay.classList.remove('d-none');
                } else {
                    btnEditLocation.disabled = true;
                    locationNoSatuSehat.classList.remove('d-none');
                    locationDisplay.classList.add('d-none');
                }
                
                if (profile.avatar_url) {
                    this.displayAvatar(profile.avatar_url);
                } else {
                    this.displayAvatar(null);
                }
                
                this.dispatchProfileUpdate(profile.nama_lengkap, profile.email, profile.avatar_url || null);
                
                if (profile.created_at) {
                    document.getElementById('created_at').textContent = new Date(profile.created_at).toLocaleString('id-ID');
                }
                if (profile.updated_at) {
                    document.getElementById('updated_at').textContent = new Date(profile.updated_at).toLocaleString('id-ID');
                }
            }
        } catch (error) {
            console.error('❌ Error loading profile:', error);
            alert('Gagal memuat profil. Silakan refresh halaman.');
        }
    }

    async loadAsistenProfile() {
        const user = JSON.parse(localStorage.getItem('user'));
        
        if (!user || !user.email) {
            console.error('❌ No user in localStorage');
            return;
        }
        
        try {
            console.log('📋 Loading asisten profile...');
            
            // Load asisten's own profile data
            const asistenResponse = await fetch('../API/auth/profile.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    action: 'get_asisten',
                    email: user.email
                })
            });

            const asistenResult = await asistenResponse.json();
            
            if (!asistenResult.success) {
                throw new Error('Failed to load asisten profile');
            }
            
            const asistenProfile = asistenResult.data;
            
            // Load doctor's shared data (API, location, QR, subscription)
            const doctorResponse = await fetch('../API/auth/profile.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    action: 'get_doctor_shared_data',
                    id_dokter: this.currentDokterId
                })
            });

            const doctorResult = await doctorResponse.json();
            
            if (!doctorResult.success) {
                throw new Error('Failed to load doctor shared data');
            }
            
            const doctorShared = doctorResult.data;
            
            console.log('✅ Asisten profile loaded');
            console.log('✅ Doctor shared data loaded');
            
            // Display asisten's own data
            document.getElementById('profileDisplayName').textContent = asistenProfile.nama_lengkap || 'Nama Belum Diisi';
            document.getElementById('profileDisplayEmail').textContent = asistenProfile.email || '';
            
            document.getElementById('email').value = asistenProfile.email || '';
            document.getElementById('nama_faskes').value = doctorShared.nama_faskes || ''; // From doctor
            document.getElementById('nama_lengkap').value = asistenProfile.nama_lengkap || '';
            document.getElementById('username').value = asistenProfile.username || '';
            document.getElementById('jenis_kelamin').value = asistenProfile.jenis_kelamin || '';
            document.getElementById('no_telp').value = asistenProfile.no_telp || '';
            document.getElementById('nik').value = asistenProfile.nik || '';
            document.getElementById('rfid').value = asistenProfile.rfid || '';
            document.getElementById('jam_kerja').value = asistenProfile.jam_kerja || '';
            document.getElementById('alamat').value = asistenProfile.alamat || '';
            
            // Display doctor's shared API config
            document.getElementById('satusehat_org_id').value = doctorShared.satusehat_org_id || '';
            document.getElementById('satusehat_client_id').value = doctorShared.satusehat_client_id || '';
            document.getElementById('satusehat_client_secret').value = doctorShared.satusehat_client_secret || '';
            document.getElementById('satusehatEnabled').checked = doctorShared.satusehat_enabled || false;
            
            // Display doctor's location
            document.getElementById('currentLocationName').textContent = 
                doctorShared.satusehat_location_name || 'Belum diatur';
            document.getElementById('currentLocationId').textContent = 
                doctorShared.satusehat_location_id ? 'ID: ' + doctorShared.satusehat_location_id : '-';

            const locationStatusBadge = document.getElementById('locationStatusBadge');
            if (doctorShared.satusehat_location_id) {
                locationStatusBadge.innerHTML = '<i class="bi bi-check-circle me-1"></i>Aktif';
                locationStatusBadge.className = 'badge bg-success';
            } else {
                locationStatusBadge.innerHTML = '<i class="bi bi-x-circle me-1"></i>Belum Diatur';
                locationStatusBadge.className = 'badge bg-white bg-opacity-25';
            }

            const btnEditLocation = document.getElementById('btnEditLocation');
            const locationNoSatuSehat = document.getElementById('locationNoSatuSehat');
            const locationDisplay = document.getElementById('locationDisplay');

            if (doctorShared.satusehat_enabled) {
                btnEditLocation.disabled = false;
                locationNoSatuSehat.classList.add('d-none');
                locationDisplay.classList.remove('d-none');
            } else {
                btnEditLocation.disabled = true;
                locationNoSatuSehat.classList.remove('d-none');
                locationDisplay.classList.add('d-none');
            }
            
            // Display asisten's avatar (own)
            if (asistenProfile.avatar_url) {
                this.displayAvatar(asistenProfile.avatar_url);
            } else {
                this.displayAvatar(null);
            }
            
            this.dispatchProfileUpdate(asistenProfile.nama_lengkap, asistenProfile.email, asistenProfile.avatar_url || null);
            
            if (asistenProfile.created_at) {
                document.getElementById('created_at').textContent = new Date(asistenProfile.created_at).toLocaleString('id-ID');
            }
            if (asistenProfile.updated_at) {
                document.getElementById('updated_at').textContent = new Date(asistenProfile.updated_at).toLocaleString('id-ID');
            }
            
        } catch (error) {
            console.error('❌ Error loading asisten profile:', error);
            alert('Gagal memuat profil. Silakan refresh halaman.');
        }
    }

    /**
     * Apply role-based UI restrictions for asisten
     */
    applyRoleBasedUI() {
        if (!this.isAsisten) {
            console.log('✅ User is dokter, no UI restrictions');
            return;
        }
        
        console.log('🔒 Applying asisten UI restrictions...');
        
        // Disable subscription extension for asisten
        const btnPerpanjang = document.getElementById('btnPerpanjang');
        const btnCekStatus = document.getElementById('btnCekStatus');
        
        if (btnPerpanjang) {
            btnPerpanjang.disabled = true;
            btnPerpanjang.innerHTML = '<i class="bi bi-lock me-2"></i>Hanya Dokter';
            btnPerpanjang.classList.add('btn-secondary');
            btnPerpanjang.classList.remove('btn-light');
        }
        
        if (btnCekStatus) {
            btnCekStatus.disabled = true;
            btnCekStatus.innerHTML = '<i class="bi bi-lock me-2"></i>Hanya Dokter';
            btnCekStatus.classList.add('btn-secondary');
            btnCekStatus.classList.remove('btn-light');
        }
        
        // Add info message about shared data
        const subscriptionCard = btnPerpanjang?.closest('.card-body');
        if (subscriptionCard && !document.getElementById('asistenSubscriptionNote')) {
            const note = document.createElement('div');
            note.id = 'asistenSubscriptionNote';
            note.className = 'alert alert-info bg-white bg-opacity-10 border-white border-opacity-25 text-white mt-3';
            note.innerHTML = `
                <i class="bi bi-info-circle me-2"></i>
                <strong>Info:</strong> Data langganan ini milik dokter utama. 
                Hanya dokter yang dapat memperpanjang langganan.
            `;
            subscriptionCard.appendChild(note);
        }
        
        // Disable nama_faskes field (shared from doctor)
        const namaFaskesField = document.getElementById('nama_faskes');
        if (namaFaskesField) {
            namaFaskesField.disabled = true;
            namaFaskesField.readOnly = true;
        }
        
        console.log('✅ Asisten UI restrictions applied');
    }

    async saveProfile() {
        const user = JSON.parse(localStorage.getItem('user'));
        
        const formData = {
            action: this.isAsisten ? 'update_asisten' : 'update',
            email: user.email,
            nama_lengkap: document.getElementById('nama_lengkap').value,
            username: document.getElementById('username').value,
            jenis_kelamin: document.getElementById('jenis_kelamin').value,
            no_telp: document.getElementById('no_telp').value,
            nik: document.getElementById('nik').value,
            rfid: document.getElementById('rfid').value,
            jam_kerja: document.getElementById('jam_kerja').value,
            alamat: document.getElementById('alamat').value
        };
        
        // Only dokter can update nama_faskes
        if (!this.isAsisten) {
            formData.nama_faskes = document.getElementById('nama_faskes').value;
        }
        
        try {
            const response = await fetch('../API/auth/profile.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });
            
            const result = await response.json();
            
            if (result.success) {
                alert('Profile berhasil diupdate!');
                user.nama_lengkap = formData.nama_lengkap;
                if (!this.isAsisten) {
                    user.nama_faskes = formData.nama_faskes;
                }
                localStorage.setItem('user', JSON.stringify(user));
                
                this.dispatchProfileUpdate(formData.nama_lengkap, formData.email, undefined);
                
                this.cancelEdit();
            } else {
                alert('Gagal mengupdate profil: ' + result.message);
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Terjadi kesalahan saat menyimpan profil');
        }
    }

    // SatuSehat Methods
    enableSatuSehatEdit() {
        this.satusehatFields.forEach(field => {
            document.getElementById(field).disabled = false;
        });
        document.getElementById('satusehatEnabled').disabled = false;
        document.getElementById('satusehatActionButtons').classList.remove('d-none');
        document.getElementById('satusehatActionButtons').classList.add('d-flex');
        document.getElementById('btnEditSatuSehat').style.display = 'none';
    }

    cancelSatuSehatEdit() {
        this.satusehatFields.forEach(field => {
            document.getElementById(field).disabled = true;
        });
        document.getElementById('satusehatEnabled').disabled = true;
        document.getElementById('satusehatActionButtons').classList.remove('d-flex');
        document.getElementById('satusehatActionButtons').classList.add('d-none');
        document.getElementById('btnEditSatuSehat').style.display = '';
        this.loadProfile();
    }

    async saveSatuSehatConfig() {
        const user = JSON.parse(localStorage.getItem('user'));
        
        const formData = {
            action: this.isAsisten ? 'update_doctor_satusehat' : 'update_satusehat',
            email: user.email,
            id_dokter: this.currentDokterId, // ⭐ Use doctor ID for shared data
            satusehat_org_id: document.getElementById('satusehat_org_id').value,
            satusehat_client_id: document.getElementById('satusehat_client_id').value,
            satusehat_client_secret: document.getElementById('satusehat_client_secret').value,
            satusehat_enabled: document.getElementById('satusehatEnabled').checked
        };

        if (formData.satusehat_enabled) {
            if (!formData.satusehat_org_id || !formData.satusehat_client_id || !formData.satusehat_client_secret) {
                alert('Mohon lengkapi semua field API sebelum mengaktifkan!');
                return;
            }
        }

        const btnSubmit = document.querySelector('#satusehatForm button[type="submit"]');
        btnSubmit.disabled = true;
        btnSubmit.innerHTML = '<span class="spinner-border spinner-border-sm me-1"></span>Menyimpan...';
        
        try {
            const response = await fetch('../API/auth/profile.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });
            
            const result = await response.json();
            
            if (result.success) {
                this.showToast('Konfigurasi SatuSehat berhasil disimpan!', 'success');
                this.cancelSatuSehatEdit();
                
                // Reload to show updated shared data
                if (this.isAsisten) {
                    await this.loadAsistenProfile();
                }
            } else {
                alert('Gagal menyimpan konfigurasi: ' + result.message);
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Terjadi kesalahan saat menyimpan konfigurasi');
        } finally {
            btnSubmit.disabled = false;
            btnSubmit.innerHTML = '<i class="bi bi-check-circle me-1"></i> Simpan';
        }
    }

    async testSatuSehatConnection() {
        const org_id = document.getElementById('satusehat_org_id').value;
        const client_id = document.getElementById('satusehat_client_id').value;
        const client_secret = document.getElementById('satusehat_client_secret').value;

        if (!org_id || !client_id || !client_secret) {
            alert('Mohon lengkapi semua field sebelum test koneksi!');
            return;
        }

        const btnTest = document.getElementById('btnTestSatuSehat');
        btnTest.disabled = true;
        btnTest.innerHTML = '<span class="spinner-border spinner-border-sm me-1"></span>Testing...';

        try {
            const response = await fetch('../API/satusehat/test_connection.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ org_id, client_id, client_secret })
            });

            const result = await response.json();
            
            const statusDiv = document.getElementById('satusehatStatus');
            const statusMessage = document.getElementById('satusehatStatusMessage');
            
            statusDiv.classList.remove('d-none');
            
            if (result.success) {
                statusMessage.className = 'alert alert-success mb-0';
                statusMessage.innerHTML = `
                    <i class="bi bi-check-circle me-2"></i>
                    <strong>Koneksi Berhasil!</strong><br>
                    <small>Token: ${result.token?.substring(0, 20)}...</small>
                `;
            } else {
                statusMessage.className = 'alert alert-danger mb-0';
                statusMessage.innerHTML = `
                    <i class="bi bi-x-circle me-2"></i>
                    <strong>Koneksi Gagal!</strong><br>
                    <small>${result.message}</small>
                `;
            }

            setTimeout(() => statusDiv.classList.add('d-none'), 5000);

        } catch (error) {
            console.error('Error:', error);
            alert('Terjadi kesalahan saat test koneksi');
        } finally {
            btnTest.disabled = false;
            btnTest.innerHTML = '<i class="bi bi-lightning me-1"></i> Test Koneksi';
        }
    }

    togglePasswordVisibility() {
        const input = document.getElementById('satusehat_client_secret');
        const icon = document.getElementById('toggleSecret');
        
        if (input.type === 'password') {
            input.type = 'text';
            icon.classList.remove('bi-eye');
            icon.classList.add('bi-eye-slash');
        } else {
            input.type = 'password';
            icon.classList.remove('bi-eye-slash');
            icon.classList.add('bi-eye');
        }
    }

    async toggleSatuSehatEnabled(enabled) {
        if (enabled) {
            const org_id = document.getElementById('satusehat_org_id').value;
            const client_id = document.getElementById('satusehat_client_id').value;
            const client_secret = document.getElementById('satusehat_client_secret').value;

            if (!org_id || !client_id || !client_secret) {
                document.getElementById('satusehatEnabled').checked = false;
                alert('Mohon lengkapi konfigurasi API terlebih dahulu!');
                return;
            }
        }
    }

    async searchSatuSehatId() {
        if (!this.currentDokterId) {
            alert('Doctor ID tidak ditemukan');
            return;
        }

        const btnSearch = document.getElementById('btnSearchSatuSehatId');
        const originalContent = btnSearch.innerHTML;
        
        btnSearch.disabled = true;
        btnSearch.innerHTML = '<span class="spinner-border spinner-border-sm"></span>';

        try {
            const nik = document.getElementById('nik').value || '';

            const response = await fetch('../API/satusehat/search_practitioner.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    id_dokter: this.currentDokterId,
                    nik: nik
                })
            });

            const result = await response.json();

            if (result.success) {
                if (result.multiple_found) {
                    this.showPractitionerSelection(result.practitioners);
                } else {
                    const data = result.data;
                    
                    document.getElementById('id_satusehat').value = data.id_satusehat;
                    
                    const infoDisplay = document.getElementById('satusehat_practitioner_info');
                    infoDisplay.textContent = data.practitioner_name + 
                        (data.practitioner_nik ? ' (NIK: ' + data.practitioner_nik + ')' : '');
                    
                    this.showToast('✅ ID SatuSehat berhasil ditemukan dan disimpan!', 'success');
                    
                    const idField = document.getElementById('id_satusehat');
                    idField.classList.add('border-success');
                    setTimeout(() => idField.classList.remove('border-success'), 2000);
                }
            } else {
                let errorMessage = result.message;
                
                if (result.action_required === 'enable_satusehat') {
                    errorMessage += '\n\nSilakan aktifkan SatuSehat di bagian "Konfigurasi SatuSehat API" terlebih dahulu.';
                }
                
                if (result.suggestion) {
                    errorMessage += '\n\n💡 ' + result.suggestion;
                }
                
                alert(errorMessage);
            }

        } catch (error) {
            console.error('❌ Error searching SatuSehat ID:', error);
            alert('Terjadi kesalahan saat mencari ID SatuSehat: ' + error.message);
        } finally {
            btnSearch.disabled = false;
            btnSearch.innerHTML = originalContent;
        }
    }

    showPractitionerSelection(practitioners) {
        const modal = document.createElement('div');
        modal.className = 'modal fade show';
        modal.style.display = 'block';
        modal.style.backgroundColor = 'rgba(0,0,0,0.5)';
        
        modal.innerHTML = `
            <div class="modal-dialog modal-dialog-centered">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">Pilih Practitioner Anda</h5>
                        <button type="button" class="btn-close" onclick="this.closest('.modal').remove()"></button>
                    </div>
                    <div class="modal-body">
                        <p>Ditemukan ${practitioners.length} practitioner. Pilih yang sesuai:</p>
                        <div class="list-group">
                            ${practitioners.map(p => `
                                <button type="button" class="list-group-item list-group-item-action" 
                                        onclick="window.profileFragment.selectPractitioner('${p.id}', '${p.name}', '${p.identifier || ''}')">
                                    <strong>${p.name}</strong><br>
                                    <small class="text-muted">ID: ${p.id}${p.identifier ? ' | NIK: ' + p.identifier : ''}</small>
                                </button>
                            `).join('')}
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        window.profileFragment = this;
    }

    async selectPractitioner(id, name, identifier) {
        try {
            const user = JSON.parse(localStorage.getItem('user'));
            
            const response = await fetch('../API/auth/profile.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    action: 'update_id_satusehat',
                    email: user.email,
                    id_satusehat: id
                })
            });

            const result = await response.json();

            if (result.success) {
                document.getElementById('id_satusehat').value = id;
                document.getElementById('satusehat_practitioner_info').textContent = 
                    name + (identifier ? ' (NIK: ' + identifier + ')' : '');
                
                this.showToast('✅ ID SatuSehat berhasil disimpan!', 'success');
                
                document.querySelector('.modal')?.remove();
            } else {
                alert('Gagal menyimpan: ' + result.message);
            }

        } catch (error) {
            console.error('Error:', error);
            alert('Terjadi kesalahan: ' + error.message);
        }
    }

    // Location Methods
    enableLocationEdit() {
        const satusehatEnabled = document.getElementById('satusehatEnabled')?.checked;
        
        if (!satusehatEnabled) {
            alert('Aktifkan SatuSehat API terlebih dahulu!');
            return;
        }
        
        document.getElementById('locationDisplay').classList.add('d-none');
        document.getElementById('locationEditSection').classList.remove('d-none');
        document.getElementById('btnEditLocation').style.display = 'none';
        
        this.searchLocations();
    }

    cancelLocationEdit() {
        document.getElementById('locationDisplay').classList.remove('d-none');
        document.getElementById('locationEditSection').classList.add('d-none');
        document.getElementById('locationResults').classList.add('d-none');
        document.getElementById('locationSearchInput').value = '';
        document.getElementById('btnEditLocation').style.display = '';
    }

    async searchLocations() {
        if (!this.currentDokterId) {
            alert('Doctor ID tidak ditemukan');
            return;
        }
        
        const searchInput = document.getElementById('locationSearchInput');
        const searchName = searchInput?.value.trim() || '';
        
        const loadingDiv = document.getElementById('locationLoading');
        const resultsDiv = document.getElementById('locationResults');
        const locationList = document.getElementById('locationList');
        
        loadingDiv.classList.remove('d-none');
        resultsDiv.classList.add('d-none');
        
        try {
            const response = await fetch('../API/satusehat/get_locations.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    id_dokter: this.currentDokterId,
                    search_name: searchName
                })
            });
            
            const result = await response.json();
            
            if (result.success) {
                const locations = result.data.locations;
                
                if (locations.length === 0) {
                    locationList.innerHTML = `
                        <div class="text-center py-4 text-white">
                            <i class="bi bi-inbox" style="font-size: 48px; opacity: 0.5;"></i>
                            <p class="mt-2 mb-0">Tidak ada lokasi ditemukan</p>
                            <small class="text-white-50">Coba kata kunci lain atau kosongkan pencarian</small>
                        </div>
                    `;
                } else {
                    locationList.innerHTML = locations.map(loc => `
                        <button type="button" 
                                class="list-group-item list-group-item-action bg-white bg-opacity-10 border-white border-opacity-25 text-white" 
                                onclick="window.profileFragment.selectLocation('${loc.id}', '${this.escapeHtml(loc.name)}')">
                            <div class="d-flex justify-content-between align-items-start">
                                <div class="flex-grow-1">
                                    <h6 class="mb-1">${loc.name}</h6>
                                    ${loc.description ? `<small class="text-white-50">${loc.description}</small><br>` : ''}
                                    ${loc.physical_type ? `<small class="badge bg-primary bg-opacity-50 mt-1">${loc.physical_type}</small>` : ''}
                                </div>
                                <div>
                                    <span class="badge ${loc.status === 'active' ? 'bg-success' : 'bg-secondary'}">
                                        ${loc.status}
                                    </span>
                                </div>
                            </div>
                            <small class="text-white-50 d-block mt-1">
                                <i class="bi bi-key me-1"></i>ID: ${loc.id}
                            </small>
                        </button>
                    `).join('');
                    
                    window.profileFragment = this;
                }
                
                resultsDiv.classList.remove('d-none');
                
            } else {
                alert('Gagal memuat lokasi: ' + result.error);
                this.cancelLocationEdit();
            }
            
        } catch (error) {
            console.error('❌ Error searching locations:', error);
            alert('Terjadi kesalahan: ' + error.message);
            this.cancelLocationEdit();
        } finally {
            loadingDiv.classList.add('d-none');
        }
    }

    async selectLocation(locationId, locationName) {
        if (!confirm(`Pilih lokasi "${locationName}"?`)) {
            return;
        }
        
        const user = JSON.parse(localStorage.getItem('user'));
        
        try {
            const response = await fetch('../API/auth/profile.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    action: this.isAsisten ? 'update_doctor_location' : 'update_location',
                    email: user.email,
                    id_dokter: this.currentDokterId, // ⭐ Use doctor ID for shared data
                    satusehat_location_id: locationId,
                    satusehat_location_name: locationName
                })
            });
            
            const result = await response.json();
            
            if (result.success) {
                document.getElementById('currentLocationName').textContent = locationName;
                document.getElementById('currentLocationId').textContent = 'ID: ' + locationId;
                document.getElementById('locationStatusBadge').innerHTML = `
                    <i class="bi bi-check-circle me-1"></i>Aktif
                `;
                document.getElementById('locationStatusBadge').className = 'badge bg-success';
                
                this.showToast('✅ Lokasi berhasil disimpan!', 'success');
                this.cancelLocationEdit();
                
            } else {
                alert('Gagal menyimpan lokasi: ' + result.message);
            }
            
        } catch (error) {
            console.error('Error:', error);
            alert('Terjadi kesalahan: ' + error.message);
        }
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // QR Code Methods
    async loadQRCode(retryCount = 0) {
        const MAX_RETRIES = 10;
        
        if (!this.currentDokterId) {
            if (retryCount >= MAX_RETRIES) {
                console.error('❌ Failed to load QR Code');
                document.getElementById('qrGenerateArea')?.classList.remove('d-none');
                document.getElementById('qrDisplayArea')?.classList.add('d-none');
                return;
            }
            
            console.warn(`⚠️ No doctor ID, waiting... (Retry ${retryCount + 1}/${MAX_RETRIES})`);
            setTimeout(() => this.loadQRCode(retryCount + 1), 500);
            return;
        }

        try {
            const { data, error } = await window.supabaseClient
                .from('dokter')
                .select('qr_code_data')
                .eq('id_dokter', this.currentDokterId)
                .single();

            if (error) throw error;

            if (data && data.qr_code_data) {
                this.displayQRCode(data.qr_code_data);
            } else {
                document.getElementById('qrGenerateArea').classList.remove('d-none');
                document.getElementById('qrDisplayArea').classList.add('d-none');
            }
        } catch (error) {
            console.error('❌ Error loading QR:', error);
            document.getElementById('qrGenerateArea')?.classList.remove('d-none');
            document.getElementById('qrDisplayArea')?.classList.add('d-none');
        }
    }

    async generateQRCode(regenerate = false) {
        if (!this.currentDokterId) {
            alert('Doctor ID tidak ditemukan');
            return;
        }

        const btnGenerate = document.getElementById('btnGenerateQR');
        const btnRegenerate = document.getElementById('btnRegenerateQR');
        const activeBtn = regenerate ? btnRegenerate : btnGenerate;
        
        activeBtn.disabled = true;
        activeBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Generating...';

        try {
            const { data: dokter, error: fetchError } = await window.supabaseClient
                .from('dokter')
                .select('id_dokter, nama_lengkap')
                .eq('id_dokter', this.currentDokterId)
                .single();

            if (fetchError || !dokter) {
                throw new Error('Gagal mengambil data dokter');
            }

            const qrData = JSON.stringify({
                doctor_id: dokter.id_dokter,
                doctor_name: dokter.nama_lengkap
            });
            
            const { error } = await window.supabaseClient
                .from('dokter')
                .update({ 
                    qr_code_data: qrData,
                    updated_at: new Date().toISOString()
                })
                .eq('id_dokter', this.currentDokterId);

            if (error) throw error;

            this.displayQRCode(qrData);
            
            this.showToast('QR Code berhasil di-generate!', 'success');

        } catch (error) {
            console.error('❌ Error generating QR:', error);
            alert('Gagal generate QR Code: ' + error.message);
        } finally {
            activeBtn.disabled = false;
            activeBtn.innerHTML = regenerate 
                ? '<i class="bi bi-arrow-repeat me-2"></i>Generate Ulang'
                : '<i class="bi bi-qr-code-scan me-2"></i>Generate QR Code';
        }
    }

    displayQRCode(qrData) {
        const canvas = document.getElementById('qrCanvas');
        canvas.innerHTML = '';
        
        if (this.qrCode) {
            this.qrCode = null;
        }
        
        this.qrCode = new QRCode(canvas, {
            text: qrData,
            width: 250,
            height: 250,
            colorDark: "#000000",
            colorLight: "#ffffff",
            correctLevel: QRCode.CorrectLevel.H
        });

        document.getElementById('qrDisplayArea').classList.remove('d-none');
        document.getElementById('qrGenerateArea').classList.add('d-none');
    }

    downloadQRCode() {
        const canvas = document.querySelector('#qrCanvas canvas');
        
        if (!canvas) {
            alert('QR Code tidak ditemukan');
            return;
        }

        const url = canvas.toDataURL('image/png');
        const link = document.createElement('a');
        link.download = `QR_Doctor_${this.currentDokterId}.png`;
        link.href = url;
        link.click();
        
        this.showToast('QR Code berhasil didownload!', 'success');
    }

    printQRCode() {
        const canvas = document.querySelector('#qrCanvas canvas');
        
        if (!canvas) {
            alert('QR Code tidak ditemukan');
            return;
        }

        const doctorName = document.getElementById('profileDisplayName').textContent;
        const doctorFaskes = document.getElementById('nama_faskes').value;

        const printWindow = window.open('', '_blank');
        printWindow.document.write(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>Print QR Code - ${doctorName}</title>
                <style>
                    body {
                        font-family: Arial, sans-serif;
                        display: flex;
                        flex-direction: column;
                        align-items: center;
                        justify-content: center;
                        min-height: 100vh;
                        margin: 0;
                        padding: 20px;
                    }
                    .container {
                        text-align: center;
                        border: 2px solid #667eea;
                        padding: 30px;
                        border-radius: 15px;
                        box-shadow: 0 4px 6px rgba(0,0,0,0.1);
                    }
                    h1 {
                        color: #667eea;
                        margin-bottom: 10px;
                        font-size: 28px;
                    }
                    h2 {
                        color: #764ba2;
                        margin-bottom: 20px;
                        font-size: 20px;
                    }
                    .qr-container {
                        margin: 20px 0;
                    }
                    img {
                        border: 3px solid #667eea;
                        padding: 10px;
                        background: white;
                        border-radius: 10px;
                    }
                    p {
                        color: #666;
                        font-size: 16px;
                        margin-top: 20px;
                    }
                    .footer {
                        margin-top: 20px;
                        font-size: 14px;
                        color: #999;
                    }
                    @media print {
                        body {
                            padding: 0;
                        }
                        .container {
                            border: none;
                            box-shadow: none;
                        }
                    }
                </style>
            </head>
            <body>
                <div class="container">
                    <h1>${doctorName}</h1>
                    <h2>${doctorFaskes}</h2>
                    <div class="qr-container">
                        <img src="${canvas.toDataURL('image/png')}" alt="QR Code">
                    </div>
                    <p><strong>Scan QR Code untuk daftar antrian</strong></p>
                    <div class="footer">
                        ID: ${this.currentDokterId} | Generated: ${new Date().toLocaleString('id-ID')}
                    </div>
                </div>
            </body>
            </html>
        `);
        
        printWindow.document.close();
        
        setTimeout(() => {
            printWindow.print();
        }, 250);
        
        this.showToast('Membuka jendela print...', 'info');
    }

    // QRIS Methods
    async loadQRIS() {
        if (!this.currentDokterId) {
            console.warn('⚠️ No doctor ID for QRIS');
            return;
        }

        try {
            const { data, error } = await window.supabaseClient
                .from('dokter')
                .select('qris_url')
                .eq('id_dokter', this.currentDokterId)
                .single();

            if (error) throw error;

            if (data && data.qris_url) {
                this.displayQRIS(data.qris_url);
            } else {
                document.getElementById('qrisUploadArea').classList.remove('d-none');
                document.getElementById('qrisDisplayArea').classList.add('d-none');
            }
        } catch (error) {
            console.error('❌ Error loading QRIS:', error);
        }
    }

    previewQRIS(file) {
        if (!file) return;

        // Validate file type
        if (!file.type.startsWith('image/')) {
            alert('File harus berupa gambar!');
            document.getElementById('qrisFile').value = '';
            return;
        }

        // Validate file size (5MB)
        if (file.size > 5 * 1024 * 1024) {
            alert('Ukuran file terlalu besar. Maksimal 5MB');
            document.getElementById('qrisFile').value = '';
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            const previewImage = document.getElementById('qrisPreviewImage');
            previewImage.src = e.target.result;
            document.getElementById('qrisPreview').classList.remove('d-none');
            
            // Store the file for later upload
            this.qrisFileBlob = file;
        };
        reader.readAsDataURL(file);
    }

    previewQRISFromLink(url) {
        if (!url) {
            document.getElementById('qrisPreview').classList.add('d-none');
            return;
        }

        // Basic URL validation
        if (!url.match(/^https?:\/\/.+\.(jpg|jpeg|png|gif|webp)$/i)) {
            return; // Don't show preview for invalid URLs
        }

        const previewImage = document.getElementById('qrisPreviewImage');
        previewImage.src = url;
        document.getElementById('qrisPreview').classList.remove('d-none');
        
        // Store the URL for later
        this.qrisUrlLink = url;
    }

    handleQRISUpload() {
        const isUpload = document.getElementById('qrisOptionUpload').checked;
        
        if (isUpload) {
            const file = document.getElementById('qrisFile').files[0];
            if (!file) {
                alert('Pilih file QRIS terlebih dahulu');
                return;
            }
            this.previewQRIS(file);
        } else {
            const url = document.getElementById('qrisLink').value;
            if (!url) {
                alert('Masukkan URL QRIS terlebih dahulu');
                return;
            }
            this.previewQRISFromLink(url);
        }
    }

    async saveQRIS() {
        const btnSave = document.getElementById('btnSaveQRIS');
        btnSave.disabled = true;
        btnSave.innerHTML = '<span class="spinner-border spinner-border-sm me-1"></span>Menyimpan...';

        try {
            let qrisUrl = '';
            const isUpload = document.getElementById('qrisOptionUpload').checked;

            if (isUpload) {
                if (!this.qrisFileBlob) {
                    alert('Pilih file QRIS terlebih dahulu');
                    btnSave.disabled = false;
                    btnSave.innerHTML = '<i class="bi bi-check-circle me-1"></i>Simpan QRIS';
                    return;
                }
                
                // Upload to Supabase Storage
                qrisUrl = await this.uploadQRISToSupabase(this.qrisFileBlob);
            } else {
                qrisUrl = this.qrisUrlLink;
                
                if (!qrisUrl || !qrisUrl.match(/^https?:\/\/.+\.(jpg|jpeg|png|gif|webp)$/i)) {
                    alert('URL QRIS tidak valid');
                    btnSave.disabled = false;
                    btnSave.innerHTML = '<i class="bi bi-check-circle me-1"></i>Simpan QRIS';
                    return;
                }
            }

            // Save to database
            await this.updateQRISInDatabase(qrisUrl);
            
            // Display the QRIS
            this.displayQRIS(qrisUrl);
            
            // Reset upload area
            this.resetQRISUploadArea();
            
            this.showToast('✅ QRIS berhasil disimpan!', 'success');
            
        } catch (error) {
            console.error('❌ Error saving QRIS:', error);
            alert('Gagal menyimpan QRIS: ' + error.message);
        } finally {
            btnSave.disabled = false;
            btnSave.innerHTML = '<i class="bi bi-check-circle me-1"></i>Simpan QRIS';
        }
    }

    async uploadQRISToSupabase(file) {
        const timestamp = Date.now();
        const random = Math.random().toString(36).substring(7);
        const fileName = `qris_${timestamp}_${random}.jpg`;
        const filePath = `qris/${fileName}`;
        
        const { data, error } = await window.supabaseClient.storage
            .from('avatars') // Using same bucket, or create 'qris' bucket
            .upload(filePath, file, {
                cacheControl: '3600',
                upsert: false,
                contentType: file.type
            });
        
        if (error) {
            throw new Error('Upload failed: ' + error.message);
        }
        
        const { data: urlData } = window.supabaseClient.storage
            .from('avatars')
            .getPublicUrl(filePath);
        
        return urlData.publicUrl;
    }

    async updateQRISInDatabase(qrisUrl) {
        const user = JSON.parse(localStorage.getItem('user'));
        
        const response = await fetch('../API/auth/profile.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                action: 'update_qris',
                email: user.email,
                qris_url: qrisUrl
            })
        });
        
        const result = await response.json();
        
        if (!result.success) {
            throw new Error(result.message);
        }
    }

    displayQRIS(qrisUrl) {
        const qrisImage = document.getElementById('qrisImage');
        qrisImage.src = qrisUrl;
        
        document.getElementById('qrisDisplayArea').classList.remove('d-none');
        document.getElementById('qrisUploadArea').classList.add('d-none');
    }

    changeQRIS() {
        document.getElementById('qrisDisplayArea').classList.add('d-none');
        document.getElementById('qrisUploadArea').classList.remove('d-none');
        this.resetQRISUploadArea();
    }

    cancelQRISUpload() {
        this.resetQRISUploadArea();
        
        // If there's existing QRIS, show it
        if (document.getElementById('qrisImage').src) {
            document.getElementById('qrisDisplayArea').classList.remove('d-none');
            document.getElementById('qrisUploadArea').classList.add('d-none');
        }
    }

    resetQRISUploadArea() {
        document.getElementById('qrisFile').value = '';
        document.getElementById('qrisLink').value = '';
        document.getElementById('qrisPreview').classList.add('d-none');
        document.getElementById('qrisPreviewImage').src = '';
        document.getElementById('qrisOptionUpload').checked = true;
        document.getElementById('qrisUploadOption').classList.remove('d-none');
        document.getElementById('qrisLinkOption').classList.add('d-none');
        
        this.qrisFileBlob = null;
        this.qrisUrlLink = null;
    }

    downloadQRIS() {
        const qrisImage = document.getElementById('qrisImage');
        
        if (!qrisImage.src) {
            alert('QRIS tidak ditemukan');
            return;
        }

        // Create a link and trigger download
        fetch(qrisImage.src)
            .then(res => res.blob())
            .then(blob => {
                const url = URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.download = `QRIS_Doctor_${this.currentDokterId}.jpg`;
                link.href = url;
                link.click();
                URL.revokeObjectURL(url);
                
                this.showToast('QRIS berhasil didownload!', 'success');
            })
            .catch(error => {
                console.error('Download error:', error);
                alert('Gagal download QRIS');
            });
    }

    printQRIS() {
        const qrisImage = document.getElementById('qrisImage');
        
        if (!qrisImage.src) {
            alert('QRIS tidak ditemukan');
            return;
        }

        const doctorName = document.getElementById('profileDisplayName').textContent;
        const doctorFaskes = document.getElementById('nama_faskes').value;

        const printWindow = window.open('', '_blank');
        printWindow.document.write(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>Print QRIS - ${doctorName}</title>
                <style>
                    body {
                        font-family: Arial, sans-serif;
                        display: flex;
                        flex-direction: column;
                        align-items: center;
                        justify-content: center;
                        min-height: 100vh;
                        margin: 0;
                        padding: 20px;
                    }
                    .container {
                        text-align: center;
                        border: 2px solid #065f46;
                        padding: 30px;
                        border-radius: 15px;
                        box-shadow: 0 4px 6px rgba(0,0,0,0.1);
                    }
                    h1 {
                        color: #065f46;
                        margin-bottom: 10px;
                        font-size: 28px;
                    }
                    h2 {
                        color: #0891b2;
                        margin-bottom: 20px;
                        font-size: 20px;
                    }
                    .qris-container {
                        margin: 20px 0;
                    }
                    img {
                        max-width: 400px;
                        border: 3px solid #065f46;
                        padding: 10px;
                        background: white;
                        border-radius: 10px;
                    }
                    p {
                        color: #666;
                        font-size: 16px;
                        margin-top: 20px;
                    }
                    .footer {
                        margin-top: 20px;
                        font-size: 14px;
                        color: #999;
                    }
                    @media print {
                        body {
                            padding: 0;
                        }
                        .container {
                            border: none;
                            box-shadow: none;
                        }
                    }
                </style>
            </head>
            <body>
                <div class="container">
                    <h1>${doctorName}</h1>
                    <h2>${doctorFaskes}</h2>
                    <div class="qris-container">
                        <img src="${qrisImage.src}" alt="QRIS Code">
                    </div>
                    <p><strong>Scan QRIS untuk pembayaran antrian</strong></p>
                    <div class="footer">
                        ID: ${this.currentDokterId} | Generated: ${new Date().toLocaleString('id-ID')}
                    </div>
                </div>
            </body>
            </html>
        `);
        
        printWindow.document.close();
        
        setTimeout(() => {
            printWindow.print();
        }, 250);
        
        this.showToast('Membuka jendela print...', 'info');
    }

    // Subscription Methods
    async loadSubscriptionStatus() {
        if (!this.currentDokterId) {
            console.warn('⚠️ No doctor ID available');
            return;
        }

        try {
            const response = await fetch('../API/subscription/get_status.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id_dokter: this.currentDokterId })
            });

            const result = await response.json();

            if (result.success && result.data) {
                document.getElementById('tanggalMulai').textContent = result.data.tanggal_mulai;
                document.getElementById('tanggalBerakhir').textContent = result.data.tanggal_berakhir;
                document.getElementById('sisaHari').textContent = result.data.sisa_hari;

                const sisaHari = parseInt(result.data.sisa_hari);
                const sisaHariEl = document.getElementById('sisaHari');
                if (sisaHari <= 7) {
                    sisaHariEl.classList.add('text-danger');
                } else if (sisaHari <= 15) {
                    sisaHariEl.classList.add('text-warning');
                }
            }
        } catch (error) {
            console.error('❌ Error loading subscription:', error);
        }
    }

    async extendSubscription() {
        if (!this.currentDokterId) {
            alert('Doctor ID tidak ditemukan');
            return;
        }

        const btnPerpanjang = document.getElementById('btnPerpanjang');
        btnPerpanjang.disabled = true;
        btnPerpanjang.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Memproses...';

        try {
            const { data: dokter } = await window.supabaseClient
                .from('dokter')
                .select('nama_lengkap, email')
                .eq('id_dokter', this.currentDokterId)
                .single();

            const response = await fetch('../API/subscription/create_transaction.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    action: 'create',
                    id_dokter: this.currentDokterId,
                    customer_name: dokter.nama_lengkap,
                    customer_email: dokter.email
                })
            });

            const result = await response.json();

            if (result.success) {
                this.merchantOrderId = result.data.merchantOrderId;
                localStorage.setItem('merchantOrderId', this.merchantOrderId);
                
                document.getElementById('vaNumber').textContent = result.data.vaNumber;
                document.getElementById('vaAmount').textContent = 'Rp ' + result.data.amount.toLocaleString('id-ID');
                document.getElementById('vaNumberDisplay').classList.remove('d-none');
                
                this.showToast('Transaksi berhasil dibuat!', 'success');
            } else {
                alert('Gagal: ' + result.message);
            }
        } catch (error) {
            console.error('❌ Error:', error);
            alert('Terjadi kesalahan: ' + error.message);
        } finally {
            btnPerpanjang.disabled = false;
            btnPerpanjang.innerHTML = '<i class="bi bi-arrow-clockwise me-2"></i>Perpanjang 30 Hari';
        }
    }

    async checkPaymentStatus() {
        const merchantOrderId = localStorage.getItem('merchantOrderId');
        
        if (!merchantOrderId) {
            alert('Order ID tidak ditemukan. Silakan lakukan pembayaran terlebih dahulu.');
            return;
        }

        const btnCekStatus = document.getElementById('btnCekStatus');
        btnCekStatus.disabled = true;
        btnCekStatus.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Memeriksa...';

        try {
            const response = await fetch('../API/subscription/check_status.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    action: 'check_status',
                    merchant_order_id: merchantOrderId,
                    id_dokter: this.currentDokterId
                })
            });

            const result = await response.json();

            if (result.success && result.data.status === 'SUCCESS') {
                alert('🎉 Pembayaran berhasil! Langganan diperpanjang.');
                localStorage.removeItem('merchantOrderId');
                document.getElementById('vaNumberDisplay').classList.add('d-none');
                await this.loadSubscriptionStatus();
            } else {
                alert('Pembayaran belum selesai: ' + (result.data?.message || result.message));
            }
        } catch (error) {
            console.error('❌ Error:', error);
            alert('Terjadi kesalahan: ' + error.message);
        } finally {
            btnCekStatus.disabled = false;
            btnCekStatus.innerHTML = '<i class="bi bi-check-circle me-2"></i>Cek Status Pembayaran';
        }
    }

    copyVANumber() {
        const vaNumber = document.getElementById('vaNumber').textContent;
        navigator.clipboard.writeText(vaNumber).then(() => {
            this.showToast('Nomor VA berhasil disalin!', 'success');
        });
    }

    // Utility Methods
    showToast(message, type = 'info') {
        const toast = document.createElement('div');
        toast.className = `alert alert-${type} position-fixed bottom-0 end-0 m-3`;
        toast.style.zIndex = '9999';
        toast.textContent = message;
        document.body.appendChild(toast);
        setTimeout(() => toast.remove(), 3000);
    }

    onDestroy() {
        console.log('🟢 ProfileFragment destroyed');
        if (this.cropper) {
            this.cropper.destroy();
            this.cropper = null;
        }
    }
}