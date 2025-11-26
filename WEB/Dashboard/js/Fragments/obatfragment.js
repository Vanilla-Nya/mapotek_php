class ObatFragment {
  constructor() {
    this.title = "Obat";
    this.icon = "bi-capsule";
    this.apiBasePath = "../API";
    this.medicines = [];
    this.loadingEl = null;
    this.tableContainer = null;
    this.tableBody = null;
    this.emptyState = null;
    this.bentukObatOptions = [];
    this.jenisObatOptions = [];
    this.userEmail = null;
    this.currentDokterId = null;
    this.activeModals = [];
    this.currentFilter = 'all';
    this.searchQuery = '';
    this.toastContainer = null;
  }

  render() {
    // ✅ Inject skeleton and toast systems
    this.injectSkeletonStyles();
    this.injectToastSystem();
    
    return `
      <div>
        <!-- Header -->
        <div class="d-flex justify-content-between align-items-center mb-4">
          <div>
            <h2 class="mb-1">Data Obat</h2>
            <p class="text-muted mb-0">Kelola stok obat (<span id="medicineCount">${this.medicines.length}</span> obat)</p>
          </div>
          <button class="btn btn-primary" data-bs-toggle="modal" data-bs-target="#modalTambahObat">
            <i class="bi bi-plus-circle me-2"></i>Tambah Obat
          </button>
        </div>

        <!-- Filter Section -->
        <div class="row mb-3">
          <div class="col-md-6">
            <div class="btn-group">
              <button class="btn btn-primary active" id="btnAll">
                <i class="bi bi-list-ul me-1"></i>Semua
              </button>
              <button class="btn btn-outline-warning" id="btnStockLow">
                <i class="bi bi-exclamation-triangle me-1"></i>Stock Menipis
              </button>
              <button class="btn btn-outline-danger" id="btnExpired">
                <i class="bi bi-clock me-1"></i>Hampir Expired
              </button>
            </div>
          </div>
          <div class="col-md-6">
            <input type="text" class="form-control" id="searchObat" placeholder="Cari obat...">
          </div>
        </div>

        <!-- Loading with skeleton -->
        <div id="loadingObat" class="text-center py-4" style="display: none;">
          <div class="card shadow-sm border-0">
            <div class="card-body">
              <div class="table-responsive">
                <table class="table table-hover">
                  <thead class="table-light">
                    <tr>
                      <th style="width: 5%">NO</th>
                      <th style="width: 10%">BARCODE</th>
                      <th style="width: 25%">NAMA OBAT</th>
                      <th style="width: 15%">JENIS OBAT</th>
                      <th style="width: 15%">HARGA JUAL</th>
                      <th style="width: 10%">STOCK</th>
                    </tr>
                  </thead>
                  <tbody id="skeletonTableBody">
                    ${this.generateTableSkeleton(8)}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        <!-- Table -->
        <div class="card shadow-sm border-0" id="tableContainer" style="display: none;">
          <div class="card-body">
            <div class="table-responsive">
              <table class="table table-hover" id="medicineTable">
                <thead class="table-light">
                  <tr>
                    <th style="width: 5%">NO</th>
                    <th style="width: 10%">BARCODE</th>
                    <th style="width: 25%">NAMA OBAT</th>
                    <th style="width: 15%">JENIS OBAT</th>
                    <th style="width: 15%">HARGA JUAL</th>
                    <th style="width: 10%">STOCK</th>
                  </tr>
                </thead>
                <tbody id="medicineTableBody">
                  <!-- Data diisi dari JS -->
                </tbody>
              </table>
            </div>

            <!-- Empty State -->
            <div id="emptyState" class="text-center py-5" style="display: none;">
              <i class="bi bi-capsule fs-1 text-muted"></i>
              <p class="text-muted mt-3">Belum ada data obat</p>
              <button class="btn btn-primary mt-2" id="btnTambahFirst">
                <i class="bi bi-plus-circle me-2"></i>Tambah Obat Pertama
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Modal Tambah Obat -->
      <div class="modal fade" id="modalTambahObat" tabindex="-1" aria-labelledby="modalTambahObatLabel" aria-hidden="true">
        <div class="modal-dialog modal-lg">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title" id="modalTambahObatLabel">Tambah Obat Baru</h5>
              <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            
            <div class="modal-body">
              <form id="formTambahObat" novalidate>
                <div class="row mb-3">
                  <div class="col-md-5">
                    <label for="nama_obat" class="form-label">Nama Obat</label>
                    <input type="text" id="nama_obat" name="nama_obat" class="form-control" required>
                    <div class="invalid-feedback">Nama obat wajib diisi.</div>
                  </div>
                  <div class="col-md-4">
                    <label for="id_jenis_obat" class="form-label">Jenis Obat</label>
                    <select id="id_jenis_obat" name="id_jenis_obat" class="form-select" required>
                      <option value="">Pilih jenis...</option>
                    </select>
                    <div class="invalid-feedback">Pilih jenis obat.</div>
                  </div>
                  <div class="col-md-3">
                    <label for="bentuk_obat" class="form-label">Bentuk Obat</label>
                    <select id="bentuk_obat" name="bentuk_obat" class="form-select" required>
                      <option value="">Pilih bentuk...</option>
                    </select>
                    <div class="invalid-feedback">Pilih bentuk obat.</div>
                  </div>
                </div>

                <div class="row mb-3">
                  <div class="col-md-4">
                    <label for="harga_jual_master" class="form-label">Harga Jual</label>
                    <input type="text" id="harga_jual_master" name="harga_jual_master" class="form-control rupiah" placeholder="Masukkan harga jual" required />
                    <div class="invalid-feedback">Harga jual wajib diisi.</div>
                  </div>
                  <div class="col-md-4">
                    <label for="harga_beli" class="form-label">Harga Beli</label>
                    <input type="text" id="harga_beli" name="harga_beli" class="form-control rupiah" placeholder="Masukkan harga beli" required />
                    <div class="invalid-feedback">Harga beli wajib diisi.</div>
                  </div>
                  <div class="col-md-4">
                    <label for="stok" class="form-label">Stok</label>
                    <input type="number" id="stok" name="stok" class="form-control" min="0" required>
                    <div class="invalid-feedback">Masukkan stok (>=0).</div>
                  </div>
                </div>

                <div class="row mb-3">
                  <div class="col-md-5">
                    <label for="tanggal_expired" class="form-label">Tanggal Expired</label>
                    <input type="date" id="tanggal_expired" name="tanggal_expired" class="form-control" required>
                    <div class="invalid-feedback">Pilih tanggal expired.</div>
                  </div>
                </div>
              </form>
            </div>

            <div class="modal-footer">
              <button type="button" class="btn btn-danger" data-bs-dismiss="modal">Batal</button>
              <button type="button" id="btnSimpanObat" class="btn btn-primary">
                <span id="btnSimpanLabel">Simpan</span>
                <span id="btnSimpanSpinner" class="spinner-border spinner-border-sm ms-2 d-none" role="status" aria-hidden="true"></span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Modal Detail Obat -->
      <div class="modal fade" id="modalDetailObat" tabindex="-1" aria-labelledby="modalDetailObatLabel" aria-hidden="true">
        <div class="modal-dialog modal-lg">
          <div class="modal-content">
            <div class="modal-header bg-primary text-white">
              <h5 class="modal-title" id="modalDetailObatLabel">
                <i class="bi bi-capsule me-2"></i>Detail Obat
              </h5>
              <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            
            <div class="modal-body" id="detailObatContent">
              <div class="text-center py-4" id="detailLoading">
                <div class="spinner-border text-primary" role="status">
                  <span class="visually-hidden">Loading...</span>
                </div>
                <p class="text-muted mt-2">Memuat detail...</p>
              </div>
            </div>
            
            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Tutup</button>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  // ✅ Inject skeleton loader styles
  injectSkeletonStyles() {
    if (document.getElementById('obat-skeleton-styles')) return;

    const styleElement = document.createElement('style');
    styleElement.id = 'obat-skeleton-styles';
    styleElement.textContent = `
      .skeleton {
        background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
        background-size: 200% 100%;
        animation: skeleton-loading 1.5s infinite;
        border-radius: 4px;
      }

      @keyframes skeleton-loading {
        0% { background-position: 200% 0; }
        100% { background-position: -200% 0; }
      }

      .skeleton-text {
        height: 16px;
        margin-bottom: 0;
        border-radius: 4px;
      }

      .skeleton-badge {
        height: 22px;
        width: 80px;
        border-radius: 12px;
        display: inline-block;
      }

      .skeleton-button {
        height: 32px;
        width: 70px;
        border-radius: 6px;
      }
    `;
    
    document.head.appendChild(styleElement);
  }

  // ✅ Generate table skeleton
  generateTableSkeleton(rows = 8) {
    return Array(rows).fill(0).map((_, index) => `
      <tr>
        <td><div class="skeleton skeleton-text" style="width: 30px;"></div></td>
        <td><div class="skeleton skeleton-text" style="width: ${60 + Math.random() * 30}%;"></div></td>
        <td><div class="skeleton skeleton-text" style="width: ${70 + Math.random() * 20}%;"></div></td>
        <td><div class="skeleton skeleton-badge"></div></td>
        <td><div class="skeleton skeleton-text" style="width: ${50 + Math.random() * 30}%;"></div></td>
        <td><div class="skeleton skeleton-badge"></div></td>
      </tr>
    `).join('');
  }

  // ✅ Generate batch skeleton
  generateBatchSkeleton(rows = 5) {
    return Array(rows).fill(0).map(() => `
      <tr>
        <td><div class="skeleton skeleton-text" style="width: 70%;"></div></td>
        <td><div class="skeleton skeleton-text" style="width: 50px;"></div></td>
        <td><div class="skeleton skeleton-text" style="width: 80px;"></div></td>
        <td><div class="skeleton skeleton-text" style="width: 80px;"></div></td>
        <td><div class="skeleton skeleton-text" style="width: 90px;"></div></td>
        <td><div class="skeleton skeleton-text" style="width: 90px;"></div></td>
        <td><div class="skeleton skeleton-badge"></div></td>
        <td class="text-center"><div class="skeleton skeleton-button" style="margin: 0 auto;"></div></td>
      </tr>
    `).join('');
  }

  // ✅ NEW: Inject toast notification system
  injectToastSystem() {
    if (document.getElementById('obat-toast-container')) return;

    // Toast container
    const toastContainer = document.createElement('div');
    toastContainer.id = 'obat-toast-container';
    toastContainer.className = 'toast-container position-fixed top-0 end-0 p-3';
    toastContainer.style.zIndex = '9999';
    document.body.appendChild(toastContainer);
    this.toastContainer = toastContainer;

    // Toast styles
    const styleElement = document.createElement('style');
    styleElement.id = 'obat-toast-styles';
    styleElement.textContent = `
      .custom-toast {
        min-width: 300px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        border-left: 4px solid;
        animation: slideInRight 0.3s ease-out;
      }
      
      @keyframes slideInRight {
        from {
          transform: translateX(100%);
          opacity: 0;
        }
        to {
          transform: translateX(0);
          opacity: 1;
        }
      }
      
      .custom-toast.toast-success {
        border-left-color: #28a745;
      }
      
      .custom-toast.toast-error {
        border-left-color: #dc3545;
      }
      
      .custom-toast.toast-warning {
        border-left-color: #ffc107;
      }
      
      .custom-toast.toast-info {
        border-left-color: #17a2b8;
      }

      .toast-icon {
        font-size: 1.5rem;
        margin-right: 0.75rem;
      }

      .toast-success .toast-icon { color: #28a745; }
      .toast-error .toast-icon { color: #dc3545; }
      .toast-warning .toast-icon { color: #ffc107; }
      .toast-info .toast-icon { color: #17a2b8; }
    `;
    document.head.appendChild(styleElement);
  }

  // ✅ NEW: Show custom toast notification
  showToast(message, type = 'info', duration = 5000) {
    const icons = {
      success: 'bi-check-circle-fill',
      error: 'bi-x-circle-fill',
      warning: 'bi-exclamation-triangle-fill',
      info: 'bi-info-circle-fill'
    };

    const toastId = 'toast-' + Date.now();
    const toastHtml = `
      <div id="${toastId}" class="toast custom-toast toast-${type}" role="alert" aria-live="assertive" aria-atomic="true">
        <div class="toast-header">
          <i class="bi ${icons[type]} toast-icon"></i>
          <strong class="me-auto">${this.getToastTitle(type)}</strong>
          <button type="button" class="btn-close" data-bs-dismiss="toast" aria-label="Close"></button>
        </div>
        <div class="toast-body">
          ${message}
        </div>
      </div>
    `;

    this.toastContainer.insertAdjacentHTML('beforeend', toastHtml);
    
    const toastElement = document.getElementById(toastId);
    const toast = new bootstrap.Toast(toastElement, {
      autohide: true,
      delay: duration
    });
    
    toast.show();

    // Remove from DOM after hidden
    toastElement.addEventListener('hidden.bs.toast', () => {
      toastElement.remove();
    });
  }

  getToastTitle(type) {
    const titles = {
      success: 'Berhasil',
      error: 'Error',
      warning: 'Peringatan',
      info: 'Informasi'
    };
    return titles[type] || 'Notifikasi';
  }

  // ✅ NEW: Show loading overlay
  showLoadingOverlay(message = 'Memproses...') {
    // Remove existing overlay first
    this.hideLoadingOverlay();

    const overlayHtml = `
      <div id="obat-loading-overlay" style="
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0,0,0,0.5);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 9998;
        animation: fadeIn 0.2s ease-out;
      ">
        <div style="
          background: white;
          padding: 2rem;
          border-radius: 12px;
          text-align: center;
          min-width: 250px;
          box-shadow: 0 10px 40px rgba(0,0,0,0.3);
        ">
          <div class="spinner-border text-primary mb-3" role="status" style="width: 3rem; height: 3rem;">
            <span class="visually-hidden">Loading...</span>
          </div>
          <p class="mb-0 text-muted fw-bold">${message}</p>
        </div>
      </div>
    `;

    document.body.insertAdjacentHTML('beforeend', overlayHtml);
    
    // Add fadeIn animation
    const style = document.createElement('style');
    style.textContent = `
      @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
      }
    `;
    document.head.appendChild(style);
  }

  hideLoadingOverlay() {
    const overlay = document.getElementById('obat-loading-overlay');
    if (overlay) overlay.remove();
  }

  // ✅ NEW: Show confirmation dialog
  showConfirmDialog(message, onConfirm, onCancel = null) {
    const confirmId = 'confirm-' + Date.now();
    const confirmHtml = `
      <div class="modal fade" id="${confirmId}" tabindex="-1">
        <div class="modal-dialog modal-dialog-centered">
          <div class="modal-content">
            <div class="modal-header bg-warning text-dark">
              <h5 class="modal-title">
                <i class="bi bi-exclamation-triangle me-2"></i>Konfirmasi
              </h5>
            </div>
            <div class="modal-body">
              <p class="mb-0">${message}</p>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Batal</button>
              <button type="button" class="btn btn-warning" id="${confirmId}-confirm">Ya, Lanjutkan</button>
            </div>
          </div>
        </div>
      </div>
    `;

    document.body.insertAdjacentHTML('beforeend', confirmHtml);
    
    const modalEl = document.getElementById(confirmId);
    const modal = new bootstrap.Modal(modalEl);
    
    const confirmBtn = document.getElementById(`${confirmId}-confirm`);
    confirmBtn.addEventListener('click', () => {
      modal.hide();
      if (onConfirm) onConfirm();
    });

    modalEl.addEventListener('hidden.bs.modal', () => {
      if (onCancel) onCancel();
      modalEl.remove();
    });

    modal.show();
  }

  onDestroy() {
    console.log('🧹 Cleaning up ObatFragment...');
    
    // Close and remove all Bootstrap modals
    const modalIds = [
      'modalTambahObat',
      'modalDetailObat', 
      'modalRestockObat',
      'modalEditObat',
      'modalBatchUsage'
    ];
    
    modalIds.forEach(modalId => {
      const modalEl = document.getElementById(modalId);
      if (modalEl) {
        const modalInstance = bootstrap.Modal.getInstance(modalEl);
        if (modalInstance) {
          modalInstance.hide();
          modalInstance.dispose();
        }
        if (modalId !== 'modalTambahObat' && modalId !== 'modalDetailObat') {
          modalEl.remove();
        }
      }
    });
    
    document.querySelectorAll('.modal-backdrop').forEach(backdrop => {
      backdrop.remove();
    });
    
    document.body.classList.remove('modal-open');
    document.body.style.overflow = '';
    document.body.style.paddingRight = '';
    
    // ✅ Remove toast system
    const toastContainer = document.getElementById('obat-toast-container');
    if (toastContainer) {
      toastContainer.remove();
    }
    
    const toastStyles = document.getElementById('obat-toast-styles');
    if (toastStyles) {
      toastStyles.remove();
    }
    
    // ✅ Remove any loading overlays
    this.hideLoadingOverlay();
    
    // ✅ Remove skeleton styles
    const skeletonStyles = document.getElementById('obat-skeleton-styles');
    if (skeletonStyles) {
      skeletonStyles.remove();
    }
    
    console.log('✅ ObatFragment cleaned up');
  }

  initRupiahListener() {
    const inputs = document.querySelectorAll('.rupiah');
    for (let i = 0; i < inputs.length; i++) {
      const input = inputs[i];
      if (input._rupiahInitialized) continue;
      input._rupiahInitialized = true;
      
      input.addEventListener('input', function () {
        let angka = this.value.replace(/[^\d]/g, '');
        let hasil = '';
        let reverse = angka.split('').reverse().join('');
        
        for (let j = 0; j < reverse.length; j++) {
          if (j % 3 === 0 && j !== 0) hasil = '.' + hasil;
          hasil = reverse[j] + hasil;
        }
        
        this.value = angka ? 'Rp ' + hasil : '';
      });
    }
  }

  async onInit() {
    console.log("=== ObatFragment initialized ===");
    
    const user = JSON.parse(localStorage.getItem('user') || 'null');
    
    if (!user || !user.email) {
      console.error('❌ No user session found!');
      this.showToast('Session expired. Silakan login kembali.', 'error', 3000);
      setTimeout(() => {
        window.location.href = '../LandingPage/booksaw-1.0.0/index.html';
      }, 3000);
      return;
    }
    
    this.userEmail = user.email;
    console.log("✅ User logged in:", this.userEmail);
    
    await this.initializeDoctorId();
    
    if (!this.currentDokterId) {
      console.error('❌ Failed to initialize doctor ID');
      this.showToast('Gagal mendapatkan data dokter. Silakan login ulang.', 'error');
      return;
    }
    
    console.log('✅ Doctor ID ready:', this.currentDokterId);
    
    this.loadingEl = document.getElementById('loadingObat');
    this.tableContainer = document.getElementById('tableContainer');
    this.tableBody = document.getElementById('medicineTableBody');
    this.emptyState = document.getElementById('emptyState');
    
    await this.loadJenisObat();
    await this.loadBentukObat();
    
    await this.loadMedicines();
    
    this.initEventListeners();
    this.initRupiahListener();
    
    console.log("✅ ObatFragment ready");
  }

  initEventListeners() {
    const btnAll = document.getElementById('btnAll');
    const btnStockLow = document.getElementById('btnStockLow');
    const btnExpired = document.getElementById('btnExpired');

    if (this.tableBody) {
      this.tableBody.addEventListener('click', (e) => {
        const row = e.target.closest('.medicine-row');
        if (row) {
          const medId = row.getAttribute('data-id');
          this.showEditModal(medId);
        }
      });
    }
    
    if (btnAll) btnAll.addEventListener('click', () => this.filterMedicines('all'));
    if (btnStockLow) btnStockLow.addEventListener('click', () => this.filterMedicines('low'));
    if (btnExpired) btnExpired.addEventListener('click', () => this.filterMedicines('expired'));
    
    const searchInput = document.getElementById('searchObat');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => this.searchMedicines(e.target.value));
    }
    
    const btnSimpan = document.getElementById('btnSimpanObat');
    if (btnSimpan) {
      btnSimpan.addEventListener('click', () => this.handleSubmit());
    }
    
    const modal = document.getElementById('modalTambahObat');
    if (modal) {
      modal.addEventListener('show.bs.modal', () => this.resetForm());
    }
    
    const btnTambahFirst = document.getElementById('btnTambahFirst');
    if (btnTambahFirst) {
      btnTambahFirst.addEventListener('click', () => {
        const modal = new bootstrap.Modal(document.getElementById('modalTambahObat'));
        modal.show();
      });
    }
  }

  // ✅ Load medicines with skeleton
  async loadMedicines() {
    try {
      console.log('🔄 Loading medicines for doctor:', this.currentDokterId);
      
      // ✅ Show skeleton loader
      this.showLoading(true);
      
      let url = `${this.apiBasePath}/obat.php`;
      
      if (this.currentDokterId) {
        url += `?id_dokter=${this.currentDokterId}`;
        console.log('🔍 Filtering by id_dokter:', this.currentDokterId);
      }
      
      console.log('📤 Request URL:', url);
      
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      
      const result = await response.json();
      console.log('📦 Medicines response:', result);
      
      if (!result.success) {
        throw new Error(result.message || 'Gagal memuat data obat');
      }
      
      this.medicines = result.data || [];
      console.log('✅ Loaded', this.medicines.length, 'medicines for this doctor');
      
      // ✅ Small delay to show skeleton animation
      await new Promise(resolve => setTimeout(resolve, 300));
      
      this.renderTable();
      
    } catch (error) {
      console.error('❌ Error loading medicines:', error);
      this.showToast('Gagal memuat data obat: ' + error.message, 'error');
    } finally {
      this.showLoading(false);
    }
  }

  async loadJenisObat() {
    try {
      console.log('🔄 Loading jenis obat...');
      
      const response = await fetch(`${this.apiBasePath}/obat.php?action=getJenisObat`);
      const result = await response.json();
      
      console.log('📦 Jenis obat response:', result);
      
      if (result.success && Array.isArray(result.data)) {
        this.jenisObatOptions = result.data;
        this.populateJenisObat();
        console.log('✅ Loaded', this.jenisObatOptions.length, 'jenis obat');
      }
      
    } catch (error) {
      console.error('❌ Error loading jenis obat:', error);
      this.showToast('Gagal memuat jenis obat', 'warning');
    }
  }

  async loadBentukObat() {
    try {
      console.log('🔄 Loading bentuk obat...');
      
      const response = await fetch(`${this.apiBasePath}/obat.php?action=getBentukObat`);
      const result = await response.json();
      
      console.log('📦 Bentuk obat response:', result);
      
      if (result.success && Array.isArray(result.data)) {
        this.bentukObatOptions = result.data;
        this.populateBentukObat();
        console.log('✅ Loaded', this.bentukObatOptions.length, 'bentuk obat');
      }
      
    } catch (error) {
      console.error('❌ Error loading bentuk obat:', error);
      this.bentukObatOptions = ['Tablet', 'Kapsul', 'Sirup', 'Salep', 'Krim', 'Injeksi', 'Tetes', 'Bubuk'];
      this.populateBentukObat();
    }
  }

  populateJenisObat() {
    const sel = document.getElementById('id_jenis_obat');
    if (!sel) return;
    
    sel.innerHTML = '<option value="">Pilih jenis...</option>';
    
    this.jenisObatOptions.forEach(item => {
      const opt = document.createElement('option');
      opt.value = item.id_jenis_obat || item.id;
      opt.textContent = item.nama_jenis_obat || item.nama_jenis || item.name;
      sel.appendChild(opt);
    });
    
    console.log(`✅ Jenis obat populated: ${sel.options.length} options`);
  }

  populateBentukObat() {
    const sel = document.getElementById('bentuk_obat');
    if (!sel) return;
    
    sel.innerHTML = '<option value="">Pilih bentuk...</option>';
    
    this.bentukObatOptions.forEach(item => {
      const opt = document.createElement('option');
      opt.value = item;
      opt.textContent = item;
      sel.appendChild(opt);
    });
    
    console.log(`✅ Bentuk obat populated: ${sel.options.length} options`);
  }

  filterMedicines(type) {
    console.log('🔍 Filtering medicines by:', type);
    
    this.currentFilter = type;
    
    document.querySelectorAll('.btn-group .btn').forEach(btn => {
      btn.classList.remove('btn-primary', 'btn-warning', 'btn-danger', 'active');
      btn.classList.add('btn-outline-primary');
    });
    
    const activeBtn = type === 'all' ? document.getElementById('btnAll') :
                      type === 'low' ? document.getElementById('btnStockLow') :
                      document.getElementById('btnExpired');
    
    if (activeBtn) {
      activeBtn.classList.remove('btn-outline-primary', 'btn-outline-warning', 'btn-outline-danger');
      
      if (type === 'all') {
        activeBtn.classList.add('btn-primary', 'active');
      } else if (type === 'low') {
        activeBtn.classList.add('btn-warning', 'active');
      } else if (type === 'expired') {
        activeBtn.classList.add('btn-danger', 'active');
      }
    }
    
    this.renderTable();
  }

  searchMedicines(query) {
    console.log('🔍 Searching for:', query);
    this.searchQuery = query.toLowerCase();
    this.renderTable();
  }

  getFilteredMedicines() {
    let filtered = [...this.medicines];
    
    if (this.currentFilter === 'low') {
      filtered = filtered.filter(med => (med.stock || 0) < 10);
      console.log(`📊 Low stock filter: ${filtered.length} medicines with stock < 10`);
    } else if (this.currentFilter === 'expired') {
      const today = new Date();
      const thirtyDaysFromNow = new Date(today.getTime() + (30 * 24 * 60 * 60 * 1000));
      
      filtered = filtered.filter(med => {
        if (!med.expired_date) return false;
        
        const expDate = new Date(med.expired_date);
        const daysUntilExpiry = Math.ceil((expDate - today) / (1000 * 60 * 60 * 24));
        
        return daysUntilExpiry >= 0 && daysUntilExpiry <= 30;
      });
      
      console.log(`📊 Near expiry filter: ${filtered.length} medicines expiring within 30 days`);
    }
    
    if (this.searchQuery) {
      filtered = filtered.filter(med => {
        const namaObat = (med.nama_obat || '').toLowerCase();
        const barcode = (med.barcode || '').toLowerCase();
        const jenisObat = (med.jenis_obat || '').toLowerCase();
        
        return namaObat.includes(this.searchQuery) || 
               barcode.includes(this.searchQuery) ||
               jenisObat.includes(this.searchQuery);
      });
      
      console.log(`🔍 Search filter: ${filtered.length} medicines match "${this.searchQuery}"`);
    }
    
    return filtered;
  }

  renderTable() {
    if (!this.tableBody) return;

    const filteredMedicines = this.getFilteredMedicines();
    
    const countEl = document.getElementById('medicineCount');
    if (countEl) {
      countEl.textContent = filteredMedicines.length;
    }

    if (filteredMedicines.length === 0) {
      this.tableBody.innerHTML = "";
      if (this.emptyState) {
        this.emptyState.style.display = "block";
        
        let emptyMessage = "Belum ada data obat";
        if (this.currentFilter === 'low') {
          emptyMessage = "✅ Tidak ada obat dengan stok menipis";
        } else if (this.currentFilter === 'expired') {
          emptyMessage = "✅ Tidak ada obat yang hampir expired";
        } else if (this.searchQuery) {
          emptyMessage = `Tidak ada hasil untuk "${this.searchQuery}"`;
        }
        
        const emptyText = this.emptyState.querySelector('p');
        if (emptyText) emptyText.textContent = emptyMessage;
        
        const btnTambahFirst = document.getElementById('btnTambahFirst');
        if (btnTambahFirst) {
          btnTambahFirst.style.display = (this.currentFilter !== 'all' || this.searchQuery) ? 'none' : 'inline-block';
        }
      }
      if (this.tableContainer) this.tableContainer.style.display = "none";
      return;
    }

    if (this.emptyState) this.emptyState.style.display = "none";
    if (this.tableContainer) this.tableContainer.style.display = "block";

    const html = filteredMedicines
      .map((med, index) => {
        const stockBadge = med.stock < 10 
          ? `<span class="badge bg-danger ms-2">${med.stock}</span>` 
          : `<span class="badge bg-success ms-2">${med.stock}</span>`;
        
        return `
          <tr class="medicine-row" data-id="${med.id_obat}" style="cursor: pointer;">
            <td>${index + 1}</td>
            <td>${this.escapeHtml(med.barcode || '-')}</td>
            <td>
              <strong>${this.escapeHtml(med.nama_obat)}</strong>
            </td>
            <td><span class="badge bg-info">${this.escapeHtml(med.jenis_obat || "-")}</span></td>
            <td><strong class="text-success">Rp ${this.formatCurrency(med.harga_jual)}</strong></td>
            <td>${stockBadge}</td>
          </tr>
        `;
      })
      .join("");

    this.tableBody.innerHTML = html;
    
    console.log(`✅ Rendered ${filteredMedicines.length} medicines (filter: ${this.currentFilter}, search: "${this.searchQuery}")`);
  }

  async showDetailObat(medId) {
    console.log('🔍 Showing detail for medicine ID:', medId);
    
    const modal = new bootstrap.Modal(document.getElementById('modalDetailObat'));
    modal.show();
    
    const detailContent = document.getElementById('detailObatContent');
    const detailLoading = document.getElementById('detailLoading');
    
    if (detailLoading) detailLoading.style.display = 'block';
    
    try {
      const response = await fetch(`${this.apiBasePath}/obat.php?action=getDetail&id=${medId}`);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      
      const result = await response.json();
      console.log('📦 Medicine detail response:', result);
      
      if (!result.success) {
        throw new Error(result.message || 'Gagal memuat detail obat');
      }
      
      const medicine = result.data;
      
      if (detailLoading) detailLoading.style.display = 'none';
      
      detailContent.innerHTML = `
        <div class="row mb-3">
          <div class="col-md-6">
            <h6 class="text-muted mb-2">Informasi Dasar</h6>
            <table class="table table-sm table-borderless">
              <tr>
                <td width="40%" class="text-muted">Nama Obat</td>
                <td><strong>${this.escapeHtml(medicine.nama_obat)}</strong></td>
              </tr>
              <tr>
                <td class="text-muted">Bentuk</td>
                <td>${this.escapeHtml(medicine.bentuk_obat)}</td>
              </tr>
              <tr>
                <td class="text-muted">Jenis</td>
                <td><span class="badge bg-info">${this.escapeHtml(medicine.jenis_obat)}</span></td>
              </tr>
            </table>
          </div>
          
          <div class="col-md-6">
            <h6 class="text-muted mb-2">Harga & Stok</h6>
            <table class="table table-sm table-borderless">
              <tr>
                <td width="40%" class="text-muted">Harga Jual</td>
                <td><strong class="text-success">Rp ${this.formatCurrency(medicine.harga_jual)}</strong></td>
              </tr>
              <tr>
                <td class="text-muted">Harga Beli</td>
                <td><strong class="text-primary">Rp ${this.formatCurrency(medicine.harga_beli)}</strong></td>
              </tr>
              <tr>
                <td class="text-muted">Total Stok</td>
                <td><strong class="${medicine.total_stock < 10 ? 'text-danger' : 'text-success'}">${medicine.total_stock}</strong></td>
              </tr>
              <tr>
                <td class="text-muted">Expired Terdekat</td>
                <td>${medicine.nearest_expired ? this.formatDate(medicine.nearest_expired) : '-'}</td>
              </tr>
            </table>
          </div>
        </div>
        
        ${medicine.details && medicine.details.length > 0 ? `
          <hr>
          <h6 class="text-muted mb-3">Detail Batch</h6>
          <div class="table-responsive">
            <table class="table table-sm table-hover">
              <thead class="table-light">
                <tr>
                  <th>Batch</th>
                  <th>Stok</th>
                  <th>Harga Jual</th>
                  <th>Harga Beli</th>
                  <th>Tanggal Expired</th>
                </tr>
              </thead>
              <tbody>
                ${medicine.details.map((detail, index) => `
                  <tr>
                    <td>#${index + 1}</td>
                    <td>${detail.stock}</td>
                    <td>Rp ${this.formatCurrency(detail.harga_jual)}</td>
                    <td>Rp ${this.formatCurrency(detail.harga_beli)}</td>
                    <td>${detail.tanggal_expired ? this.formatDate(detail.tanggal_expired) : '-'}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        ` : ''}
      `;
      
    } catch (error) {
      console.error('❌ Error loading detail:', error);
      
      if (detailLoading) detailLoading.style.display = 'none';
      
      detailContent.innerHTML = `
        <div class="alert alert-danger">
          <i class="bi bi-exclamation-triangle me-2"></i>
          ${error.message}
        </div>
      `;
      
      this.showToast('Gagal memuat detail obat', 'error');
    }
  }

  async showRestockModal(medId) {
    console.log('🔄 Opening restock modal for medicine ID:', medId);
    
    const modalHtml = `
      <div class="modal fade" id="modalRestockObat" tabindex="-1" aria-labelledby="modalRestockObatLabel" aria-hidden="true">
        <div class="modal-dialog modal-lg">
          <div class="modal-content">
            <div class="modal-header bg-warning text-white">
              <h5 class="modal-title" id="modalRestockObatLabel">
                <i class="bi bi-arrow-repeat me-2"></i>Restock Obat
              </h5>
              <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            
            <div class="modal-body">
              <div class="text-center py-4" id="restockLoading">
                <div class="spinner-border text-warning" role="status">
                  <span class="visually-hidden">Loading...</span>
                </div>
                <p class="text-muted mt-2">Memuat data...</p>
              </div>
              
              <div id="restockFormContent" style="display: none;">
                <div class="row mb-3">
                  <div class="col-md-6">
                    <h6 class="text-muted mb-2">Data Obat Saat Ini</h6>
                    <table class="table table-sm table-borderless">
                      <tr>
                        <td width="40%" class="text-muted">Nama Obat</td>
                        <td><strong id="restock_nama_obat">-</strong></td>
                      </tr>
                      <tr>
                        <td class="text-muted">Jenis</td>
                        <td id="restock_jenis_obat">-</td>
                      </tr>
                      <tr>
                        <td class="text-muted">Stok Saat Ini</td>
                        <td><strong class="text-primary" id="restock_stok_lama">0</strong></td>
                      </tr>
                    </table>
                  </div>
                  
                  <div class="col-md-6">
                    <h6 class="text-muted mb-2">Data Restock Baru</h6>
                    <form id="formRestock" novalidate>
                      <input type="hidden" id="restock_id_obat">
                      
                      <div class="mb-3">
                        <label for="restock_stok_baru" class="form-label">Jumlah Stok Masuk</label>
                        <input type="number" class="form-control" id="restock_stok_baru" required min="0">
                        <div class="invalid-feedback">Masukkan stok baru</div>
                      </div>
                      
                      <div class="mb-3">
                        <label for="restock_tanggal_expired" class="form-label">Tanggal Expired</label>
                        <input type="date" class="form-control" id="restock_tanggal_expired" required>
                        <div class="invalid-feedback">Pilih tanggal expired</div>
                      </div>
                      
                      <div class="mb-3">
                        <label for="restock_harga_beli" class="form-label">Harga Beli</label>
                        <input type="text" class="form-control rupiah" id="restock_harga_beli" placeholder="Rp 0">
                      </div>
                      
                      <div class="mb-3">
                        <label for="restock_harga_jual" class="form-label">Harga Jual</label>
                        <input type="text" class="form-control rupiah" id="restock_harga_jual" placeholder="Rp 0">
                      </div>
                    </form>
                  </div>
                </div>
              </div>
            </div>
            
            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Batal</button>
              <button type="button" id="btnProsesRestock" class="btn btn-warning">
                <span id="btnRestockLabel">Proses Restock</span>
                <span id="btnRestockSpinner" class="spinner-border spinner-border-sm ms-2 d-none" role="status" aria-hidden="true"></span>
              </button>
            </div>
          </div>
        </div>
      </div>
    `;
    
    const existingModal = document.getElementById('modalRestockObat');
    if (existingModal) {
      existingModal.remove();
    }
    
    const modalRoot = document.getElementById('modal-root');
    if (modalRoot) {
      modalRoot.innerHTML = modalHtml;
    } else {
      document.body.insertAdjacentHTML('beforeend', modalHtml);
    }
    
    const modal = new bootstrap.Modal(document.getElementById('modalRestockObat'));
    modal.show();
    
    this.initRupiahListener();
    
    await this.loadRestockData(medId);
    
    const btnProses = document.getElementById('btnProsesRestock');
    if (btnProses) {
      btnProses.addEventListener('click', () => this.handleRestockSubmit());
    }
  }

  async loadRestockData(medId) {
    try {
      const response = await fetch(`${this.apiBasePath}/obat.php?action=getDetail&id=${medId}`);
      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.message || 'Gagal memuat data obat');
      }
      
      const medicine = result.data;
      
      document.getElementById('restockLoading').style.display = 'none';
      document.getElementById('restockFormContent').style.display = 'block';
      
      document.getElementById('restock_id_obat').value = medicine.id_obat;
      document.getElementById('restock_nama_obat').textContent = medicine.nama_obat;
      document.getElementById('restock_jenis_obat').textContent = medicine.jenis_obat;
      document.getElementById('restock_stok_lama').textContent = medicine.total_stock;
      
      document.getElementById('restock_stok_baru').value = 0;
      document.getElementById('restock_harga_beli').value = 'Rp ' + this.formatCurrency(medicine.harga_beli);
      document.getElementById('restock_harga_jual').value = 'Rp ' + this.formatCurrency(medicine.harga_jual);
      
    } catch (error) {
      console.error('❌ Error loading restock data:', error);
      document.getElementById('restockLoading').innerHTML = `
        <div class="alert alert-danger">
          <i class="bi bi-exclamation-triangle me-2"></i>
          ${error.message}
        </div>
      `;
      this.showToast('Gagal memuat data restock', 'error');
    }
  }

  // ✅ Handle restock submit with loading overlay
  async handleRestockSubmit() {
    const form = document.getElementById('formRestock');
    const btnLabel = document.getElementById('btnRestockLabel');
    const btnSpinner = document.getElementById('btnRestockSpinner');
    
    if (!form.checkValidity()) {
      form.classList.add('was-validated');
      this.showToast('Mohon lengkapi semua field yang wajib diisi', 'warning');
      return;
    }
    
    if (!this.currentDokterId) {
      this.showToast('❌ ID Dokter tidak ditemukan', 'error');
      return;
    }
    
    btnLabel.textContent = 'Memproses...';
    btnSpinner.classList.remove('d-none');
    
    // ✅ Show loading overlay
    this.showLoadingOverlay('Memproses restock obat...');
    
    try {
      const payload = {
        action: 'restockObat',
        id_obat: document.getElementById('restock_id_obat').value,
        stok_baru: parseInt(document.getElementById('restock_stok_baru').value),
        tanggal_expired: document.getElementById('restock_tanggal_expired').value,
        harga_beli: this.parseRupiah(document.getElementById('restock_harga_beli').value),
        harga_jual: this.parseRupiah(document.getElementById('restock_harga_jual').value),
        id_dokter: this.currentDokterId
      };
      
      console.log('📤 Sending restock payload:', payload);
      
      const response = await fetch(`${this.apiBasePath}/obat.php`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });
      
      const result = await response.json();
      console.log('📥 Restock response:', result);
      
      if (!result.success) {
        throw new Error(result.message || 'Gagal memproses restock');
      }
      
      // ✅ Show success toast
      let message = result.message || 'Restock berhasil diproses';
      if (result.data) {
        message += `\nStok ditambahkan: ${result.data.stock_added || 0} unit\nTotal stok: ${result.data.total_stock_now || 0} unit`;
      }
      this.showToast(message, 'success', 4000);
      
      await this.loadMedicines();
      
      setTimeout(() => {
        const modal = bootstrap.Modal.getInstance(document.getElementById('modalRestockObat'));
        if (modal) modal.hide();
      }, 1500);
      
    } catch (error) {
      console.error('❌ Error processing restock:', error);
      this.showToast(error.message, 'error');
    } finally {
      btnLabel.textContent = 'Proses Restock';
      btnSpinner.classList.add('d-none');
      this.hideLoadingOverlay();
    }
  }

  // ✅ Handle submit with loading overlay
  async handleSubmit() {
    const form = document.getElementById('formTambahObat');
    const btnLabel = document.getElementById('btnSimpanLabel');
    const btnSpinner = document.getElementById('btnSimpanSpinner');
    
    if (!form.checkValidity()) {
      form.classList.add('was-validated');
      this.showToast('Mohon lengkapi semua field yang wajib diisi', 'warning');
      return;
    }
    
    if (!this.currentDokterId) {
      this.showToast('❌ ID Dokter tidak ditemukan', 'error');
      return;
    }
    
    btnLabel.textContent = 'Menyimpan...';
    btnSpinner.classList.remove('d-none');
    
    // ✅ Show loading overlay
    this.showLoadingOverlay('Menyimpan obat baru...');
    
    try {
      const formData = new FormData(form);
      
      const payload = {
        action: 'addObat',
        nama_obat: formData.get('nama_obat'),
        id_jenis_obat: formData.get('id_jenis_obat'),
        bentuk_obat: formData.get('bentuk_obat'),
        harga_jual: this.parseRupiah(formData.get('harga_jual_master')),
        harga_beli: this.parseRupiah(formData.get('harga_beli')),
        stok: parseInt(formData.get('stok')),
        tanggal_expired: formData.get('tanggal_expired'),
        id_dokter: this.currentDokterId
      };
      
      console.log('📤 Sending payload:', payload);
      
      const response = await fetch(`${this.apiBasePath}/obat.php`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });
      
      const result = await response.json();
      console.log('📥 Response:', result);
      
      if (!result.success) {
        throw new Error(result.message || 'Gagal menyimpan data');
      }
      
      // ✅ Show success toast
      this.showToast(result.message || 'Data obat berhasil disimpan', 'success');
      
      await this.loadMedicines();
      
      setTimeout(() => {
        const modal = bootstrap.Modal.getInstance(document.getElementById('modalTambahObat'));
        if (modal) modal.hide();
      }, 1000);
      
    } catch (error) {
      console.error('❌ Error saving:', error);
      this.showToast(error.message, 'error');
    } finally {
      btnLabel.textContent = 'Simpan';
      btnSpinner.classList.add('d-none');
      this.hideLoadingOverlay();
    }
  }

  async initializeDoctorId() {
    try {
      console.log('🔍 Starting doctor ID initialization...');
      console.log('📧 User email from localStorage:', this.userEmail);
      
      const cached = localStorage.getItem('currentDokterId');
      if (cached) {
        this.currentDokterId = cached;
        console.log('✅ Doctor ID from cache:', this.currentDokterId);
        return;
      }
      
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      if (user.id_dokter) {
        this.currentDokterId = user.id_dokter;
        localStorage.setItem('currentDokterId', this.currentDokterId);
        console.log('✅ Doctor ID from user object:', this.currentDokterId);
        return;
      }
      
      let attempts = 0;
      const maxAttempts = 10;
      
      while (!window.supabaseClient && attempts < maxAttempts) {
        console.log(`⏳ Waiting for Supabase... (${attempts + 1}/${maxAttempts})`);
        await new Promise(resolve => setTimeout(resolve, 500));
        attempts++;
      }
      
      if (!window.supabaseClient) {
        throw new Error('Supabase tidak tersedia');
      }
      
      console.log('✅ Supabase ready');
      console.log('🔍 Querying dokter table (case-insensitive)...');
      
      const { data: dokter, error } = await window.supabaseClient
        .from('dokter')
        .select('id_dokter, nama_lengkap, email')
        .ilike('email', this.userEmail)
        .maybeSingle();

      if (error) {
        console.error('❌ Database error:', error);
        throw new Error(`Error database: ${error.message}`);
      }

      if (!dokter) {
        console.error('❌ No doctor found with email:', this.userEmail);
        this.showToast(
          `⚠️ DATA DOKTER TIDAK DITEMUKAN\n\nEmail: ${this.userEmail}\n\nPastikan email Anda sesuai dengan data di database.`,
          'error',
          7000
        );
        return;
      }

      this.currentDokterId = dokter.id_dokter;
      localStorage.setItem('currentDokterId', this.currentDokterId);
      user.id_dokter = this.currentDokterId;
      localStorage.setItem('user', JSON.stringify(user));
      
      console.log('✅ Doctor found:', {
        id_dokter: dokter.id_dokter,
        nama: dokter.nama_lengkap,
        email: dokter.email
      });

    } catch (error) {
      console.error('❌ Error initializing doctor ID:', error);
      this.showToast('Gagal mengambil data dokter: ' + error.message, 'error');
    }
  }

  resetForm() {
    const form = document.getElementById('formTambahObat');
    
    if (form) {
      form.reset();
      form.classList.remove('was-validated');
    }
  }

  parseRupiah(rupiahStr) {
    if (!rupiahStr) return 0;
    return parseInt(rupiahStr.replace(/[^\d]/g, '')) || 0;
  }

  showLoading(show) {
    if (this.loadingEl) this.loadingEl.style.display = show ? "block" : "none";
    if (this.tableContainer) this.tableContainer.style.display = show ? "none" : "block";
  }

  formatCurrency(value) {
    return new Intl.NumberFormat("id-ID").format(value ?? 0);
  }

  formatDate(dateStr) {
    const date = new Date(dateStr);
    return date.toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  }

  escapeHtml(text) {
    return String(text || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  // ✅ Edit modal with skeleton for batch loading
  async showEditModal(medId) {
    console.log('✏️ Opening edit modal for medicine ID:', medId);
    
    const modalHtml = `
      <div class="modal fade" id="modalEditObat" tabindex="-1" aria-labelledby="modalEditObatLabel" aria-hidden="true">
        <div class="modal-dialog modal-xl">
          <div class="modal-content">
            <div class="modal-header bg-primary text-white">
              <h5 class="modal-title" id="modalEditObatLabel">
                <i class="bi bi-pencil me-2"></i>Edit Obat
              </h5>
              <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            
            <div class="modal-body">
              <div class="text-center py-4" id="editLoading">
                <div class="spinner-border text-primary" role="status">
                  <span class="visually-hidden">Loading...</span>
                </div>
                <p class="text-muted mt-2">Memuat data...</p>
              </div>
              
              <div id="editFormContent" style="display: none;">
                <div class="card mb-3">
                  <div class="card-body">
                    <form id="formEditObat" novalidate>
                      <input type="hidden" id="edit_id_obat">
                      
                      <div class="row mb-3">
                        <div class="col-md-4">
                          <label for="edit_nama_obat" class="form-label">Nama Obat</label>
                          <input type="text" class="form-control" id="edit_nama_obat" required>
                          <div class="invalid-feedback">Nama obat wajib diisi</div>
                        </div>
                        
                        <div class="col-md-4">
                          <label for="edit_jenis_obat" class="form-label">Jenis Obat</label>
                          <select class="form-select" id="edit_jenis_obat" required>
                            <option value="">Pilih jenis...</option>
                          </select>
                          <div class="invalid-feedback">Pilih jenis obat</div>
                        </div>
                        
                        <div class="col-md-4">
                          <label for="edit_bentuk_obat" class="form-label">Jenis Bentuk Obat</label>
                          <select class="form-select" id="edit_bentuk_obat" required>
                            <option value="">Pilih bentuk...</option>
                          </select>
                          <div class="invalid-feedback">Pilih bentuk obat</div>
                        </div>
                      </div>
                      
                      <div class="row mb-3">
                        <div class="col-md-4">
                          <label for="edit_barcode" class="form-label">Barcode</label>
                          <input type="text" class="form-control" id="edit_barcode">
                        </div>
                        
                        <div class="col-md-3">
                          <label class="form-label">Stock</label>
                          <input type="text" class="form-control" id="edit_total_stock" readonly>
                        </div>
                        
                        <div class="col-md-5 d-flex align-items-end">
                          <button type="button" class="btn btn-info me-2" id="btnTambahStockEdit">
                            <i class="bi bi-plus-circle me-2"></i>Tambahkan Stock
                          </button>
                          <button type="button" id="btnSimpanEdit" class="btn btn-success">
                            <span id="btnSimpanEditLabel">Simpan</span>
                            <span id="btnSimpanEditSpinner" class="spinner-border spinner-border-sm ms-2 d-none" role="status" aria-hidden="true"></span>
                          </button>
                        </div>
                      </div>
                    </form>
                  </div>
                </div>
                
                <div class="card">
                  <div class="card-header bg-light">
                    <h6 class="mb-0">Obat Masuk (Detail Batch)</h6>
                  </div>
                  <div class="card-body">
                    <!-- ✅ Skeleton loader for batch table -->
                    <div id="batchLoading" style="display: none;">
                      <div class="table-responsive">
                        <table class="table table-hover table-sm table-bordered">
                          <thead class="table-light">
                            <tr>
                              <th>Nama Obat</th>
                              <th>Stock</th>
                              <th>Dibuat</th>
                              <th>Expired</th>
                              <th>Harga Beli</th>
                              <th>Harga Jual</th>
                              <th>Status</th>
                              <th width="100">AKSI</th>
                            </tr>
                          </thead>
                          <tbody>
                            ${this.generateBatchSkeleton(5)}
                          </tbody>
                        </table>
                      </div>
                    </div>
                    
                    <div class="table-responsive" id="batchTableContainer" style="display: none;">
                      <table class="table table-hover table-sm table-bordered">
                        <thead class="table-light">
                          <tr>
                            <th>Nama Obat</th>
                            <th>Stock</th>
                            <th>Dibuat</th>
                            <th>Expired</th>
                            <th>Harga Beli</th>
                            <th>Harga Jual</th>
                            <th>Status</th>
                            <th width="100">AKSI</th>
                          </tr>
                        </thead>
                        <tbody id="editBatchTableBody">
                        </tbody>
                      </table>
                    </div>
                    
                    <div id="emptyBatch" class="text-center py-3 text-muted" style="display: none;">
                      <i class="bi bi-inbox"></i>
                      <p class="mb-0">Belum ada batch obat masuk</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
    
    const existingModal = document.getElementById('modalEditObat');
    if (existingModal) {
      existingModal.remove();
    }
    
    document.body.insertAdjacentHTML('beforeend', modalHtml);
    
    const modal = new bootstrap.Modal(document.getElementById('modalEditObat'));
    modal.show();
    
    await this.loadEditData(medId);
    
    const btnSimpan = document.getElementById('btnSimpanEdit');
    if (btnSimpan) {
      btnSimpan.addEventListener('click', () => this.handleEditSubmit());
    }
    
    const btnTambahStock = document.getElementById('btnTambahStockEdit');
    if (btnTambahStock) {
      btnTambahStock.addEventListener('click', () => {
        const medId = document.getElementById('edit_id_obat').value;
        const editModal = bootstrap.Modal.getInstance(document.getElementById('modalEditObat'));
        if (editModal) editModal.hide();
        setTimeout(() => this.showRestockModal(medId), 300);
      });
    }
    
    const batchTableBody = document.getElementById('editBatchTableBody');
    if (batchTableBody) {
      batchTableBody.addEventListener('click', async (e) => {
        const btnDetail = e.target.closest('.btn-batch-detail');
        if (btnDetail) {
          const batchId = btnDetail.getAttribute('data-batch-id');
          const batchStatus = btnDetail.getAttribute('data-batch-status');
          await this.showBatchUsageDetail(batchId, batchStatus);
        }
      });
    }
  }

  async loadEditData(medId) {
    try {
      console.log('🔄 Loading edit data for medicine ID:', medId);
      
      const url = `${this.apiBasePath}/obat.php?action=getDetail&id=${medId}`;
      console.log('📤 Request URL:', url);
      
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`HTTP Error: ${response.status}`);
      }
      
      const result = await response.json();
      console.log('📦 Edit data result:', result);
      
      if (!result.success) {
        throw new Error(result.message || 'Gagal memuat data obat');
      }
      
      const medicine = result.data;
      console.log('✅ Medicine data:', medicine);
      
      const loadingEl = document.getElementById('editLoading');
      const formContent = document.getElementById('editFormContent');
      
      if (loadingEl) loadingEl.style.display = 'none';
      if (formContent) formContent.style.display = 'block';
      
      const idField = document.getElementById('edit_id_obat');
      const namaField = document.getElementById('edit_nama_obat');
      const barcodeField = document.getElementById('edit_barcode');
      const stockField = document.getElementById('edit_total_stock');
      
      if (idField) {
        idField.value = medicine.id_obat || '';
        console.log('✅ Set id_obat:', medicine.id_obat);
      }
      
      if (namaField) {
        namaField.value = medicine.nama_obat || '';
        console.log('✅ Set nama_obat:', medicine.nama_obat);
      }
      
      if (barcodeField) {
        barcodeField.value = medicine.barcode || '';
        console.log('✅ Set barcode:', medicine.barcode || '(empty)');
      }
      
      if (stockField) {
        stockField.value = medicine.total_stock || 0;
        console.log('✅ Set total_stock:', medicine.total_stock);
      }
      
      console.log('🔄 Populating dropdowns...');
      await this.populateEditDropdowns(medicine.id_jenis_obat, medicine.bentuk_obat);
      
      console.log('✅ Form fields populated successfully');
      
      console.log('🔄 Loading batch details...');
      await this.loadBatchDetails(medId);
      
    } catch (error) {
      console.error('❌ Error loading edit data:', error);
      console.error('❌ Error stack:', error.stack);
      
      const loadingEl = document.getElementById('editLoading');
      if (loadingEl) {
        loadingEl.innerHTML = `
          <div class="alert alert-danger">
            <i class="bi bi-exclamation-triangle me-2"></i>
            ${error.message}
          </div>
        `;
      }
      
      this.showToast('Gagal memuat data obat', 'error');
    }
  }

  async populateEditDropdowns(selectedJenisId, selectedBentuk) {
    console.log('🔄 Populating dropdowns with:', { selectedJenisId, selectedBentuk });
    
    const jenisSelect = document.getElementById('edit_jenis_obat');
    if (jenisSelect) {
      jenisSelect.innerHTML = '<option value="">Pilih jenis...</option>';
      
      if (this.jenisObatOptions.length > 0) {
        this.jenisObatOptions.forEach(item => {
          const opt = document.createElement('option');
          opt.value = item.id_jenis_obat;
          opt.textContent = item.nama_jenis_obat;
          
          if (item.id_jenis_obat === selectedJenisId) {
            opt.selected = true;
            console.log('✅ Selected jenis:', item.nama_jenis_obat);
          }
          
          jenisSelect.appendChild(opt);
        });
      } else {
        console.warn('⚠️ No jenis obat options available');
      }
    } else {
      console.error('❌ Jenis obat select not found');
    }
    
    const bentukSelect = document.getElementById('edit_bentuk_obat');
    if (bentukSelect) {
      bentukSelect.innerHTML = '<option value="">Pilih bentuk...</option>';
      
      if (this.bentukObatOptions.length > 0) {
        this.bentukObatOptions.forEach(item => {
          const opt = document.createElement('option');
          opt.value = item;
          opt.textContent = item;
          
          if (item === selectedBentuk) {
            opt.selected = true;
            console.log('✅ Selected bentuk:', item);
          }
          
          bentukSelect.appendChild(opt);
        });
      } else {
        console.warn('⚠️ No bentuk obat options available');
      }
    } else {
      console.error('❌ Bentuk obat select not found');
    }
    
    console.log('✅ Dropdowns populated');
  }

  // ✅ Load batch details with skeleton
  async loadBatchDetails(medId) {
    try {
      console.log('🔄 Loading batch details for medicine ID:', medId);
      
      // ✅ Show skeleton loader
      const batchLoading = document.getElementById('batchLoading');
      const batchTableContainer = document.getElementById('batchTableContainer');
      
      if (batchLoading) batchLoading.style.display = 'block';
      if (batchTableContainer) batchTableContainer.style.display = 'none';
      
      const url = `${this.apiBasePath}/obat.php?action=getBatchDetails&id=${medId}`;
      console.log('📤 Request URL:', url);
      
      const response = await fetch(url);
      
      console.log('📥 Response status:', response.status);
      
      if (!response.ok) {
        throw new Error(`HTTP Error: ${response.status} ${response.statusText}`);
      }
      
      const responseText = await response.text();
      console.log('📥 Raw response:', responseText.substring(0, 500));
      
      let result;
      try {
        result = JSON.parse(responseText);
      } catch (parseError) {
        console.error('❌ JSON Parse Error:', parseError);
        console.error('❌ Response was:', responseText);
        throw new Error('Invalid JSON response from server');
      }
      
      console.log('📦 Parsed result:', result);
      
      if (!result.success) {
        throw new Error(result.message || 'Gagal mengambil detail batch');
      }
      
      const batches = result.data || [];
      const tbody = document.getElementById('editBatchTableBody');
      const emptyState = document.getElementById('emptyBatch');
      
      console.log('✅ Found', batches.length, 'batches');
      
      // ✅ Small delay for skeleton animation
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // ✅ Hide skeleton, show table
      if (batchLoading) batchLoading.style.display = 'none';
      if (batchTableContainer) batchTableContainer.style.display = 'block';
      
      if (batches.length === 0) {
        tbody.innerHTML = '';
        if (batchTableContainer) batchTableContainer.style.display = 'none';
        if (emptyState) emptyState.style.display = 'block';
        return;
      }
      
      if (emptyState) emptyState.style.display = 'none';
      
      const html = batches.map(batch => `
        <tr>
          <td>${this.escapeHtml(batch.nama_obat || '-')}</td>
          <td><strong>${batch.stock || 0}</strong></td>
          <td>${batch.created_at ? this.formatDate(batch.created_at) : '-'}</td>
          <td>${batch.tanggal_expired ? this.formatDate(batch.tanggal_expired) : '-'}</td>
          <td>Rp ${this.formatCurrency(batch.harga_beli)}</td>
          <td>Rp ${this.formatCurrency(batch.harga_jual)}</td>
          <td><span class="badge bg-${this.getBatchStatusColor(batch.status_batch)}">${batch.status_batch || 'aktif'}</span></td>
          <td class="text-center">
            <button class="btn btn-sm btn-outline-primary btn-batch-detail" 
                    data-batch-id="${batch.id_detail_obat}"
                    data-batch-status="${batch.status_batch || 'aktif'}"
                    title="Lihat Detail Penggunaan">
              DETAIL
            </button>
          </td>
        </tr>
      `).join('');
      
      tbody.innerHTML = html;
      
    } catch (error) {
      console.error('❌ Error loading batch details:', error);
      console.error('❌ Error stack:', error.stack);
      
      const batchLoading = document.getElementById('batchLoading');
      if (batchLoading) {
        batchLoading.innerHTML = `
          <div class="alert alert-danger">
            <i class="bi bi-exclamation-triangle me-2"></i>
            Gagal memuat detail batch: ${error.message}
          </div>
        `;
      }
      
      this.showToast('Gagal memuat detail batch', 'error');
    }
  }

  async showBatchUsageDetail(batchId, batchStatus) {
    try {
      console.log('🔍 Loading batch usage for batch ID:', batchId);
      
      const url = `${this.apiBasePath}/obat.php?action=getBatchUsage&batch_id=${batchId}`;
      console.log('📤 Request URL:', url);
      
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`HTTP Error: ${response.status}`);
      }
      
      const result = await response.json();
      console.log('📦 Batch usage result:', result);
      
      if (!result.success) {
        throw new Error(result.message || 'Gagal memuat detail penggunaan');
      }
      
      let usage = result.data || [];
      
      if (!Array.isArray(usage)) {
        console.error('❌ Usage is not an array:', usage);
        usage = [];
      }
      
      console.log('✅ Found', usage.length, 'usage records');
      
      const showRestockButton = (batchStatus === 'aktif' || batchStatus === 'expired');
      
      const detailHtml = `
        <div class="modal fade" id="modalBatchUsage" tabindex="-1">
          <div class="modal-dialog modal-lg">
            <div class="modal-content">
              <div class="modal-header bg-info text-white">
                <h5 class="modal-title">
                  <i class="bi bi-list-ul me-2"></i>Detail Pengeluaran Obat Per Batch
                </h5>
                <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
              </div>
              <div class="modal-body">
                ${usage.length === 0 ? `
                  <div class="text-center py-4 text-muted">
                    <i class="bi bi-inbox fs-1"></i>
                    <p class="mt-2">Belum ada penggunaan obat dari batch ini</p>
                  </div>
                ` : `
                  <div class="table-responsive">
                    <table class="table table-hover table-sm table-bordered">
                      <thead class="table-light">
                        <tr>
                          <th>Jumlah</th>
                          <th>Signa</th>
                          <th>Created At</th>
                        </tr>
                      </thead>
                      <tbody>
                        ${usage.map(item => `
                          <tr>
                            <td><strong>${item.jumlah || 0}</strong></td>
                            <td>${this.escapeHtml(item.signa || '-')}</td>
                            <td>${item.created_at ? this.formatDateTime(item.created_at) : '-'}</td>
                          </tr>
                        `).join('')}
                      </tbody>
                    </table>
                  </div>
                `}
              </div>
              <div class="modal-footer">
                ${showRestockButton ? `
                  <button type="button" class="btn btn-primary" id="btnRestockFromDetail" data-batch-id="${batchId}">
                    <i class="bi bi-arrow-repeat me-2"></i>Restock
                  </button>
                ` : ''}
                <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Tutup</button>
              </div>
            </div>
          </div>
        </div>
      `;
      
      const existingDetail = document.getElementById('modalBatchUsage');
      if (existingDetail) {
        const instance = bootstrap.Modal.getInstance(existingDetail);
        if (instance) instance.dispose();
        existingDetail.remove();
      }
      
      document.body.insertAdjacentHTML('beforeend', detailHtml);
      
      const modal = new bootstrap.Modal(document.getElementById('modalBatchUsage'));
      modal.show();
      
      if (showRestockButton) {
        const btnRestock = document.getElementById('btnRestockFromDetail');
        if (btnRestock) {
          btnRestock.addEventListener('click', async () => {
            console.log('🔄 Restock clicked for batch:', batchId);
            
            modal.hide();
            
            setTimeout(async () => {
              await this.showRestockFromBatch(batchId);
            }, 300);
          });
        }
      }
      
    } catch (error) {
      console.error('❌ Error loading batch usage:', error);
      this.showToast('Gagal memuat detail penggunaan: ' + error.message, 'error');
    }
  }

  async showRestockFromBatch(batchId) {
    try {
      const response = await fetch(`${this.apiBasePath}/obat.php?action=getBatchDetailById&batch_id=${batchId}`);
      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.message || 'Gagal memuat data batch');
      }
      
      const batch = result.data;
      const medId = batch.id_obat;
      
      await this.showRestockModal(medId);
      
    } catch (error) {
      console.error('❌ Error loading batch for restock:', error);
      this.showToast('Gagal memuat data batch: ' + error.message, 'error');
    }
  }

  // ✅ Handle edit submit with loading overlay
  async handleEditSubmit() {
    const form = document.getElementById('formEditObat');
    const btnLabel = document.getElementById('btnSimpanEditLabel');
    const btnSpinner = document.getElementById('btnSimpanEditSpinner');
    
    if (!form.checkValidity()) {
      form.classList.add('was-validated');
      this.showToast('Mohon lengkapi semua field yang wajib diisi', 'warning');
      return;
    }
    
    btnLabel.textContent = 'Menyimpan...';
    btnSpinner.classList.remove('d-none');
    
    // ✅ Show loading overlay
    this.showLoadingOverlay('Menyimpan perubahan...');
    
    try {
      const payload = {
        action: 'updateObat',
        id_obat: document.getElementById('edit_id_obat').value,
        nama_obat: document.getElementById('edit_nama_obat').value,
        id_jenis_obat: document.getElementById('edit_jenis_obat').value,
        bentuk_obat: document.getElementById('edit_bentuk_obat').value,
        barcode: document.getElementById('edit_barcode').value,
        id_dokter: this.currentDokterId
      };
      
      console.log('📤 Sending update payload:', payload);
      
      const response = await fetch(`${this.apiBasePath}/obat.php`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });
      
      const result = await response.json();
      console.log('📥 Update response:', result);
      
      if (!result.success) {
        throw new Error(result.message || 'Gagal menyimpan perubahan');
      }
      
      // ✅ Show success toast
      this.showToast(result.message || 'Perubahan berhasil disimpan', 'success');
      
      await this.loadMedicines();
      
      setTimeout(() => {
        const modal = bootstrap.Modal.getInstance(document.getElementById('modalEditObat'));
        if (modal) modal.hide();
      }, 1500);
      
    } catch (error) {
      console.error('❌ Error updating:', error);
      this.showToast(error.message, 'error');
    } finally {
      btnLabel.textContent = 'Simpan';
      btnSpinner.classList.add('d-none');
      this.hideLoadingOverlay();
    }
  }

  formatDateTime(dateStr) {
    const date = new Date(dateStr);
    return date.toLocaleString("id-ID", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  }

  getBatchStatusColor(status) {
    const colors = {
      'aktif': 'success',
      'habis': 'secondary',
      'expired': 'danger',
      'dibuang': 'dark',
      'diganti': 'warning'
    };
    return colors[status] || 'secondary';
  }
}