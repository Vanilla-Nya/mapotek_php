// ProfileFragment.js - Complete version with profile sync
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
    }

    // ⭐ NEW: Helper to dispatch profile updates to top bar
    dispatchProfileUpdate(name = null, email = null, avatarUrl = undefined) {
        console.log('📢 Dispatching profile update event:', { name, email, avatarUrl });
        const event = new CustomEvent('profileUpdated', {
            detail: { name, email, avatarUrl }
        });
        window.dispatchEvent(event);
    }

    render() {
        return `
            <div class="row justify-content-center">
                <div class="col-lg-9">
                    <!-- Profile Header Card -->
                    <div class="card border-0 shadow-sm mb-4">
                        <div class="card-body text-center py-5">
                            <div class="mb-3 position-relative d-inline-block">
                                <!-- Photo Display -->
                                <div id="avatarContainer" class="bg-gradient rounded-circle d-inline-flex align-items-center justify-content-center" 
                                    style="width: 100px; height: 100px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); overflow: hidden;">
                                    <img id="avatarImage" src="" alt="Avatar" class="d-none w-100 h-100" style="object-fit: cover;">
                                    <i id="avatarIcon" class="bi bi-person-fill text-white" style="font-size: 50px;"></i>
                                </div>
                                
                                <!-- Edit Button -->
                                <button class="btn btn-sm btn-primary rounded-circle position-absolute bottom-0 end-0" 
                                        id="btnChangeAvatar" style="width: 32px; height: 32px; padding: 0;">
                                    <i class="bi bi-camera-fill"></i>
                                </button>
                            </div>
                            
                            <!-- Avatar Upload Section (hidden by default) -->
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
                                
                                <!-- Upload Option -->
                                <div id="uploadOption">
                                    <input type="file" class="form-control form-control-sm" id="avatarFile" accept="image/*">
                                    <small class="text-muted">Pilih foto untuk crop & preview</small>
                                </div>
                                
                                <!-- Link Option -->
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
                            
                            <!-- Crop Modal -->
                            <div id="cropModal" class="modal fade" tabindex="-1" style="display: none;">
                                <div class="modal-dialog modal-fullscreen">
                                    <div class="modal-content" style="background: #000;">
                                        <div class="modal-header border-0" style="background: #000; color: #fff;">
                                            <h5 class="modal-title">Crop Foto Profil</h5>
                                            <button type="button" class="btn-close btn-close-white" id="btnCloseCrop"></button>
                                        </div>
                                        <div class="modal-body p-0 d-flex align-items-center justify-content-center" style="background: #000; position: relative; overflow: hidden;">
                                            <img id="cropImage" src="" style="max-width: 100%; max-height: 100%;">
                                        </div>
                                        <div class="modal-footer border-0" style="background: #000;">
                                            <button type="button" class="btn btn-light" id="btnCancelCrop">
                                                <i class="bi bi-x-lg me-2"></i>Cancel
                                            </button>
                                            <button type="button" class="btn btn-success" id="btnDoneCrop">
                                                <i class="bi bi-check-lg me-2"></i>Done
                                            </button>
                                        </div>
                                    </div>
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
                    <div class="card border-0 shadow-sm mb-4" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);">
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
                                            <option value="Laki-laki">Laki-laki</option>
                                            <option value="Perempuan">Perempuan</option>
                                        </select>
                                    </div>
                                    <div class="col-md-6">
                                        <label class="form-label text-white text-opacity-75 small mb-1">No. Telepon</label>
                                        <input type="text" class="form-control bg-white bg-opacity-10 text-white border-white border-opacity-25" 
                                               id="no_telp" disabled style="backdrop-filter: blur(10px);">
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

                    <!-- QR Code Card -->
                    <div class="card border-0 shadow-sm mb-4" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);">
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

                    <!-- Subscription Card -->
                    <div class="card border-0 shadow-sm mb-4" style="background: linear-gradient(135deg, #764ba2 0%, #667eea 100%);">
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

        this.formFields = [
            'nama_faskes', 'nama_lengkap', 'username', 'jenis_kelamin',
            'no_telp', 'rfid', 'jam_kerja', 'alamat'
        ];

        await this.loadProfile();
        await this.initializeSubscription(user.email);
        await this.loadQRCode();
        this.attachEventListeners();
    }

    async initializeSubscription(email) {
        const access_token = localStorage.getItem('access_token');
        
        const { data: { user }, error } = await supabaseClient.auth.getUser(access_token)
        
        if (error || !user) {
            localStorage.removeItem("access_token");
            alert('Session expired. Please login again.');
            window.location.replace("http://localhost/mapotek_php/WEB/LandingPage/booksaw-1.0.0/index.html");
        }
        
        try {
            if (!window.supabaseClient) {
                console.error('❌ Supabase not initialized');
                return;
            }

            const { data: dokter, error } = await window.supabaseClient
                .from('dokter')
                .select('id_dokter')
                .eq('email', email)
                .single();
        

            if (error || !dokter) {
                console.error('❌ Could not get doctor ID:', error);
                return;
            }

            this.currentDokterId = dokter.id_dokter;
            localStorage.setItem('currentDokterId', this.currentDokterId);
            
            console.log('🟢 Doctor ID:', this.currentDokterId);

            await this.loadSubscriptionStatus();

        } catch (error) {
            console.error('❌ Error initializing subscription:', error);
        }
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

        document.getElementById('btnChangeAvatar').addEventListener('click', () => {
            this.showAvatarUpload();
        });
        
        document.getElementById('btnCancelAvatar').addEventListener('click', () => {
            this.hideAvatarUpload();
            this.restoreOriginalAvatar();
        });
        
        document.getElementById('btnSaveAvatar').addEventListener('click', () => {
            this.saveAvatar();
        });
        
        document.getElementById('avatarFile').addEventListener('change', (e) => {
            this.showCropModal(e.target.files[0]);
        });
        
        document.getElementById('btnCloseCrop').addEventListener('click', () => {
            this.closeCropModal();
        });
        
        document.getElementById('btnCancelCrop').addEventListener('click', () => {
            this.closeCropModal();
        });
        
        document.getElementById('btnDoneCrop').addEventListener('click', () => {
            this.applyCrop();
        });
        
        document.getElementById('optionUpload').addEventListener('change', () => {
            document.getElementById('uploadOption').classList.remove('d-none');
            document.getElementById('linkOption').classList.add('d-none');
        });
        
        document.getElementById('optionLink').addEventListener('change', () => {
            document.getElementById('uploadOption').classList.add('d-none');
            document.getElementById('linkOption').classList.remove('d-none');
        });

        const btnGenerateQR = document.getElementById('btnGenerateQR');
        const btnDownloadQR = document.getElementById('btnDownloadQR');
        const btnPrintQR = document.getElementById('btnPrintQR');
        const btnRegenerateQR = document.getElementById('btnRegenerateQR');

        if (btnGenerateQR) {
            btnGenerateQR.addEventListener('click', () => this.generateQRCode());
        }
        if (btnDownloadQR) {
            btnDownloadQR.addEventListener('click', () => this.downloadQRCode());
        }
        if (btnPrintQR) {
            btnPrintQR.addEventListener('click', () => this.printQRCode());
        }
        if (btnRegenerateQR) {
            btnRegenerateQR.addEventListener('click', () => this.generateQRCode(true));
        }

        const btnPerpanjang = document.getElementById('btnPerpanjang');
        const btnCekStatus = document.getElementById('btnCekStatus');
        const btnCopyVA = document.getElementById('btnCopyVA');

        if (btnPerpanjang) {
            btnPerpanjang.addEventListener('click', () => this.extendSubscription());
        }

        if (btnCekStatus) {
            btnCekStatus.addEventListener('click', () => this.checkPaymentStatus());
        }

        if (btnCopyVA) {
            btnCopyVA.addEventListener('click', () => this.copyVANumber());
        }

        console.log('🟢 All event listeners attached');
    }

    async loadQRCode() {
        if (!this.currentDokterId) {
            console.warn('⚠️ No doctor ID, waiting...');
            setTimeout(() => this.loadQRCode(), 500);
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
                console.log('✅ QR exists:', data.qr_code_data);
                this.displayQRCode(data.qr_code_data);
            } else {
                console.log('❌ No QR found, showing generate button');
                document.getElementById('qrGenerateArea').classList.remove('d-none');
                document.getElementById('qrDisplayArea').classList.add('d-none');
            }
        } catch (error) {
            console.error('❌ Error loading QR:', error);
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
            // ✅ Get doctor info first
            const { data: dokter, error: fetchError } = await window.supabaseClient
                .from('dokter')
                .select('id_dokter, nama_lengkap')
                .eq('id_dokter', this.currentDokterId)
                .single();

            if (fetchError || !dokter) {
                throw new Error('Gagal mengambil data dokter');
            }

            // ✅ Generate QR data in the format Android expects (JSON)
            const qrData = JSON.stringify({
                doctor_id: dokter.id_dokter,
                doctor_name: dokter.nama_lengkap
            });
            
            console.log('🟢 Generating QR with data:', qrData);
            
            // Save to database
            const { error } = await window.supabaseClient
                .from('dokter')
                .update({ 
                    qr_code_data: qrData,
                    updated_at: new Date().toISOString()
                })
                .eq('id_dokter', this.currentDokterId);

            if (error) throw error;

            console.log('✅ QR data saved to database');

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

    generateUUID() {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            const r = Math.random() * 16 | 0;
            const v = c == 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
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

        console.log('✅ QR Code displayed');

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

    showAvatarUpload() {
        this.storeOriginalAvatar();
        document.getElementById('avatarUploadSection').classList.remove('d-none');
    }

    hideAvatarUpload() {
        document.getElementById('avatarUploadSection').classList.add('d-none');
        document.getElementById('avatarFile').value = '';
        document.getElementById('avatarLink').value = '';
        this.croppedBlob = null;
    }

    storeOriginalAvatar() {
        this.originalAvatarUrl = document.getElementById('avatarImage').src;
        this.originalAvatarVisible = !document.getElementById('avatarImage').classList.contains('d-none');
    }

    restoreOriginalAvatar() {
        if (this.originalAvatarVisible && this.originalAvatarUrl) {
            this.displayAvatar(this.originalAvatarUrl);
        } else {
            this.displayAvatar(null);
        }
    }

    showCropModal(file) {
        if (!file) return;
        
        if (!file.type.startsWith('image/')) {
            alert('File harus berupa gambar!');
            document.getElementById('avatarFile').value = '';
            return;
        }
        
        if (file.size > 2 * 1024 * 1024) {
            alert('Ukuran file terlalu besar. Maksimal 2MB');
            document.getElementById('avatarFile').value = '';
            return;
        }
        
        const reader = new FileReader();
        reader.onload = (e) => {
            const cropImage = document.getElementById('cropImage');
            cropImage.src = e.target.result;
            
            const modal = document.getElementById('cropModal');
            modal.style.display = 'block';
            modal.classList.add('show');
            document.body.classList.add('modal-open');
            
            if (this.cropper) {
                this.cropper.destroy();
                this.cropper = null;
            }
            
            cropImage.onload = () => {
                this.cropper = new Cropper(cropImage, {
                    aspectRatio: 1,
                    viewMode: 0,
                    dragMode: 'move',
                    autoCropArea: 0.65,
                    restore: false,
                    guides: false,
                    center: true,
                    highlight: false,
                    cropBoxMovable: false,
                    cropBoxResizable: false,
                    toggleDragModeOnDblclick: false,
                    background: true,
                    responsive: true,
                    modal: true,
                    checkOrientation: true,
                    zoomable: true,
                    zoomOnWheel: true,
                    wheelZoomRatio: 0.1,
                    ready: function() {
                        console.log('✅ Cropper ready!');
                    }
                });
            };
        };
        reader.readAsDataURL(file);
    }

    closeCropModal() {
        const modal = document.getElementById('cropModal');
        modal.style.display = 'none';
        modal.classList.remove('show');
        document.body.classList.remove('modal-open');
        
        if (this.cropper) {
            this.cropper.destroy();
            this.cropper = null;
        }
        
        document.getElementById('avatarFile').value = '';
    }

    applyCrop() {
        if (!this.cropper) return;
        
        const canvas = this.cropper.getCroppedCanvas({
            width: 300,
            height: 300,
            imageSmoothingQuality: 'high'
        });
        
        canvas.toBlob((blob) => {
            this.croppedBlob = blob;
            
            const url = URL.createObjectURL(blob);
            document.getElementById('avatarImage').src = url;
            document.getElementById('avatarImage').classList.remove('d-none');
            document.getElementById('avatarIcon').classList.add('d-none');
            
            this.closeCropModal();
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
                if (!this.croppedBlob) {
                    alert('Pilih dan crop foto terlebih dahulu');
                    btnSave.disabled = false;
                    btnSave.innerHTML = '<i class="bi bi-check-circle me-1"></i>Simpan';
                    return;
                }
                
                avatarUrl = await this.uploadToSupabase(this.croppedBlob);
                
            } else {
                avatarUrl = document.getElementById('avatarLink').value;
                
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
            
            await this.updateAvatarInDatabase(avatarUrl);
            
            this.displayAvatar(avatarUrl);
            this.hideAvatarUpload();
            this.croppedBlob = null;
            
            // ⭐ UPDATE TOP BAR
            this.dispatchProfileUpdate(null, null, avatarUrl);
            
            this.showToast('Foto profil berhasil diupdate!', 'success');
            
        } catch (error) {
            console.error('Error saving avatar:', error);
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
                action: 'update_avatar',
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
        const avatarCard = document.querySelector('.row.justify-content-center > .col-lg-9 > .card:first-child');
        
        if (avatarUrl) {
            avatarImage.src = avatarUrl;
            avatarImage.classList.remove('d-none');
            avatarIcon.classList.add('d-none');
            avatarCard.style.setProperty('--avatar-bg-image', `url('${avatarUrl}')`);
        } else {
            avatarImage.classList.add('d-none');
            avatarIcon.classList.remove('d-none');
            avatarCard.style.setProperty('--avatar-bg-image', 'none');
        }
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
                document.getElementById('rfid').value = profile.rfid || '';
                document.getElementById('jam_kerja').value = profile.jam_kerja || '';
                document.getElementById('alamat').value = profile.alamat || '';
                
                if (profile.avatar_url) {
                    this.displayAvatar(profile.avatar_url);
                } else {
                    this.displayAvatar(null);
                }
                
                // ⭐ UPDATE TOP BAR
                this.dispatchProfileUpdate(
                    profile.nama_lengkap,
                    profile.email,
                    profile.avatar_url || null
                );
                
                if (profile.created_at) {
                    document.getElementById('created_at').textContent = new Date(profile.created_at).toLocaleString('id-ID');
                }
                if (profile.updated_at) {
                    document.getElementById('updated_at').textContent = new Date(profile.updated_at).toLocaleString('id-ID');
                }
            }
        } catch (error) {
            console.error('Error loading profile:', error);
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
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });
            
            const result = await response.json();
            
            if (result.success) {
                alert('Profile berhasil diupdate!');
                user.nama_lengkap = formData.nama_lengkap;
                user.nama_faskes = formData.nama_faskes;
                localStorage.setItem('user', JSON.stringify(user));
                
                // ⭐ UPDATE TOP BAR
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
    }
}