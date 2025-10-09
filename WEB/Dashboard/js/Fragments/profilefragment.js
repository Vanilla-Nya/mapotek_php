// ProfileFragment.js - Stacked layout with purple cards + Avatar Upload with Preview
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

                    <!-- Profile Form Card - Purple Style -->
                    <div class="card border-0 shadow-sm mb-4" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);">
                        <div class="card-body p-4">
                            <h5 class="card-title mb-4 pb-3 border-bottom border-white border-opacity-25 text-white">
                                <i class="bi bi-info-circle me-2"></i>Informasi Pribadi
                            </h5>
                            
                            <form id="profileForm">
                                <div class="row g-3">
                                    <!-- Email -->
                                    <div class="col-md-6">
                                        <label class="form-label text-white text-opacity-75 small mb-1">Email</label>
                                        <input type="email" class="form-control bg-white bg-opacity-10 text-white border-white border-opacity-25" 
                                               id="email" readonly style="backdrop-filter: blur(10px);">
                                    </div>

                                    <!-- Nama Faskes -->
                                    <div class="col-md-6">
                                        <label class="form-label text-white text-opacity-75 small mb-1">Nama Faskes</label>
                                        <input type="text" class="form-control bg-white bg-opacity-10 text-white border-white border-opacity-25" 
                                               id="nama_faskes" disabled style="backdrop-filter: blur(10px);">
                                    </div>

                                    <!-- Nama Lengkap -->
                                    <div class="col-md-6">
                                        <label class="form-label text-white text-opacity-75 small mb-1">Nama Lengkap</label>
                                        <input type="text" class="form-control bg-white bg-opacity-10 text-white border-white border-opacity-25" 
                                               id="nama_lengkap" disabled style="backdrop-filter: blur(10px);">
                                    </div>

                                    <!-- Username -->
                                    <div class="col-md-6">
                                        <label class="form-label text-white text-opacity-75 small mb-1">Username</label>
                                        <input type="text" class="form-control bg-white bg-opacity-10 text-white border-white border-opacity-25" 
                                               id="username" disabled style="backdrop-filter: blur(10px);">
                                    </div>

                                    <!-- Jenis Kelamin -->
                                    <div class="col-md-6">
                                        <label class="form-label text-white text-opacity-75 small mb-1">Jenis Kelamin</label>
                                        <select class="form-select bg-white bg-opacity-10 text-white border-white border-opacity-25" 
                                                id="jenis_kelamin" disabled style="backdrop-filter: blur(10px);">
                                            <option value="">Pilih Jenis Kelamin</option>
                                            <option value="Laki-laki">Laki-laki</option>
                                            <option value="Perempuan">Perempuan</option>
                                        </select>
                                    </div>

                                    <!-- No. Telepon -->
                                    <div class="col-md-6">
                                        <label class="form-label text-white text-opacity-75 small mb-1">No. Telepon</label>
                                        <input type="text" class="form-control bg-white bg-opacity-10 text-white border-white border-opacity-25" 
                                               id="no_telp" disabled style="backdrop-filter: blur(10px);">
                                    </div>

                                    <!-- RFID -->
                                    <div class="col-md-6">
                                        <label class="form-label text-white text-opacity-75 small mb-1">RFID</label>
                                        <input type="text" class="form-control bg-white bg-opacity-10 text-white border-white border-opacity-25" 
                                               id="rfid" placeholder="Belum diatur" disabled style="backdrop-filter: blur(10px);">
                                    </div>

                                    <!-- Jam Kerja -->
                                    <div class="col-md-6">
                                        <label class="form-label text-white text-opacity-75 small mb-1">Jam Kerja</label>
                                        <input type="text" class="form-control bg-white bg-opacity-10 text-white border-white border-opacity-25" 
                                               id="jam_kerja" placeholder="Contoh: 08:00 - 17:00" disabled style="backdrop-filter: blur(10px);">
                                    </div>

                                    <!-- Alamat -->
                                    <div class="col-12">
                                        <label class="form-label text-white text-opacity-75 small mb-1">Alamat</label>
                                        <textarea class="form-control bg-white bg-opacity-10 text-white border-white border-opacity-25" 
                                                  id="alamat" rows="3" disabled style="backdrop-filter: blur(10px);"></textarea>
                                    </div>
                                </div>

                                <!-- Action Buttons -->
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

                    <!-- Subscription Card - Below Profile -->
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

                            <!-- VA Display -->
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
        this.attachEventListeners();
    }

    async initializeSubscription(email) {
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
        // Profile edit
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

        // Avatar listeners
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
        
        // Preview image when file is selected
        document.getElementById('avatarFile').addEventListener('change', (e) => {
            this.showCropModal(e.target.files[0]);
        });
        
        // Crop modal buttons
        document.getElementById('btnCloseCrop').addEventListener('click', () => {
            this.closeCropModal();
        });
        
        document.getElementById('btnCancelCrop').addEventListener('click', () => {
            this.closeCropModal();
        });
        
        document.getElementById('btnDoneCrop').addEventListener('click', () => {
            this.applyCrop();
        });
        
        // Toggle upload/link option
        document.getElementById('optionUpload').addEventListener('change', () => {
            document.getElementById('uploadOption').classList.remove('d-none');
            document.getElementById('linkOption').classList.add('d-none');
        });
        
        document.getElementById('optionLink').addEventListener('change', () => {
            document.getElementById('uploadOption').classList.add('d-none');
            document.getElementById('linkOption').classList.remove('d-none');
        });

        // Subscription
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

    // Avatar methods
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

    previewImage(file) {
        if (!file) return;
        
        // Validate file type
        if (!file.type.startsWith('image/')) {
            alert('File harus berupa gambar!');
            document.getElementById('avatarFile').value = '';
            return;
        }
        
        // Validate file size (max 2MB)
        if (file.size > 2 * 1024 * 1024) {
            alert('Ukuran file terlalu besar. Maksimal 2MB');
            document.getElementById('avatarFile').value = '';
            return;
        }
        
        // Read file and show preview
        const reader = new FileReader();
        reader.onload = (e) => {
            // Show preview in avatar circle
            document.getElementById('avatarImage').src = e.target.result;
            document.getElementById('avatarImage').classList.remove('d-none');
            document.getElementById('avatarIcon').classList.add('d-none');
        };
        reader.readAsDataURL(file);
    }

    showCropModal(file) {
        if (!file) return;
        
        // Validate file type
        if (!file.type.startsWith('image/')) {
            alert('File harus berupa gambar!');
            document.getElementById('avatarFile').value = '';
            return;
        }
        
        // Validate file size (max 2MB)
        if (file.size > 2 * 1024 * 1024) {
            alert('Ukuran file terlalu besar. Maksimal 2MB');
            document.getElementById('avatarFile').value = '';
            return;
        }
        
        const reader = new FileReader();
        reader.onload = (e) => {
            const cropImage = document.getElementById('cropImage');
            cropImage.src = e.target.result;
            
            // Show modal
            const modal = document.getElementById('cropModal');
            modal.style.display = 'block';
            modal.classList.add('show');
            document.body.classList.add('modal-open');
            
            // Destroy previous cropper if exists
            if (this.cropper) {
                this.cropper.destroy();
                this.cropper = null;
            }
            
            // Wait for image to fully load
            cropImage.onload = () => {
                // Initialize Cropper.js with WhatsApp-style settings
                this.cropper = new Cropper(cropImage, {
                    aspectRatio: 1, // Square crop
                    viewMode: 0, // No restrictions
                    dragMode: 'move', // Move the image, not the crop box
                    autoCropArea: 0.65, // Crop box size (65% of container)
                    restore: false,
                    guides: false, // No grid lines
                    center: true,
                    highlight: false,
                    cropBoxMovable: false, // Crop box stays fixed!
                    cropBoxResizable: false, // Crop box size is fixed!
                    toggleDragModeOnDblclick: false,
                    background: true,
                    responsive: true,
                    modal: true, // Dark area outside crop box
                    checkOrientation: true,
                    zoomable: true,
                    zoomOnWheel: true,
                    wheelZoomRatio: 0.1,
                    ready: function() {
                        console.log('✅ Cropper ready! Drag to move image.');
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
        
        // Clear file input
        document.getElementById('avatarFile').value = '';
    }

    applyCrop() {
        if (!this.cropper) return;
        
        // Get cropped canvas
        const canvas = this.cropper.getCroppedCanvas({
            width: 300,
            height: 300,
            imageSmoothingQuality: 'high'
        });
        
        // Convert to blob
        canvas.toBlob((blob) => {
            this.croppedBlob = blob;
            
            // Show preview in avatar circle
            const url = URL.createObjectURL(blob);
            document.getElementById('avatarImage').src = url;
            document.getElementById('avatarImage').classList.remove('d-none');
            document.getElementById('avatarIcon').classList.add('d-none');
            
            // Close modal
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
                // Check if we have cropped image
                if (!this.croppedBlob) {
                    alert('Pilih dan crop foto terlebih dahulu');
                    btnSave.disabled = false;
                    btnSave.innerHTML = '<i class="bi bi-check-circle me-1"></i>Simpan';
                    return;
                }
                
                // Upload cropped image
                avatarUrl = await this.uploadToSupabase(this.croppedBlob);
                
            } else {
                // Use link directly
                avatarUrl = document.getElementById('avatarLink').value;
                
                if (!avatarUrl) {
                    alert('Masukkan link foto');
                    btnSave.disabled = false;
                    btnSave.innerHTML = '<i class="bi bi-check-circle me-1"></i>Simpan';
                    return;
                }
                
                // Validate URL format
                if (!avatarUrl.match(/^https?:\/\/.+\.(jpg|jpeg|png|gif|webp)$/i)) {
                    alert('URL harus berupa link gambar yang valid (jpg, jpeg, png, gif, webp)');
                    btnSave.disabled = false;
                    btnSave.innerHTML = '<i class="bi bi-check-circle me-1"></i>Simpan';
                    return;
                }
            }
            
            // Save to database via PHP
            await this.updateAvatarInDatabase(avatarUrl);
            
            // Update display (already showing preview, just keep it)
            this.displayAvatar(avatarUrl);
            this.hideAvatarUpload();
            
            // Clear cropped blob
            this.croppedBlob = null;
            
            this.showToast('Foto profil berhasil diupdate!', 'success');
            
        } catch (error) {
            console.error('Error saving avatar:', error);
            alert('Gagal menyimpan foto: ' + error.message);
            // Restore original on error
            this.restoreOriginalAvatar();
        } finally {
            btnSave.disabled = false;
            btnSave.innerHTML = '<i class="bi bi-check-circle me-1"></i>Simpan';
        }
    }

    async uploadToSupabase(fileOrBlob) {
        // Create unique filename
        const timestamp = Date.now();
        const random = Math.random().toString(36).substring(7);
        const fileName = `${timestamp}_${random}.jpg`;
        const filePath = `avatars/${fileName}`;
        
        // Upload to Supabase Storage
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
        
        // Get public URL
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
            
            // 🎨 Set the blurred background!
            avatarCard.style.setProperty('--avatar-bg-image', `url('${avatarUrl}')`);
        } else {
            avatarImage.classList.add('d-none');
            avatarIcon.classList.remove('d-none');
            
            // Remove blurred background when no avatar
            avatarCard.style.setProperty('--avatar-bg-image', 'none');
        }
    }

    // Profile methods
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
            
            console.log('🔍 Profile data from DB:', result);
            
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
                
                // Display avatar if exists
                if (profile.avatar_url) {
                    console.log('✅ Loading avatar:', profile.avatar_url);
                    this.displayAvatar(profile.avatar_url);
                } else {
                    console.log('❌ No avatar_url found in profile');
                    this.displayAvatar(null);
                }
                
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

    // Subscription methods
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