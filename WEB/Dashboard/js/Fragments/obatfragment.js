// js/Fragments/obatfragment.js
console.log("💊 ObatFragment.js loaded");

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
    this._eventListenersInitialized = false;
    this._clickGuard = false;
  }

  render() {
    console.log('🎨 ObatFragment.render() called');
    
    // Inject styles and toast system
    this.injectModernStyles();
    this.injectToastSystem();
    
    return `
      <div class="obat-container">
        <!-- Modern Header -->
        <div class="modern-header">
          <div class="header-content">
            <div class="header-text">
              <h2 class="header-title">Data Obat</h2>
              <p class="header-subtitle">Kelola stok obat (<span id="medicineCount" class="count-badge">0</span> obat)</p>
            </div>
            <button class="btn-modern btn-primary" data-bs-toggle="modal" data-bs-target="#modalTambahObat">
              <i class="bi bi-plus-circle me-2"></i>Tambah Obat
            </button>
          </div>
        </div>

        <!-- Modern Filter Section -->
        <div class="filter-section">
          <div class="filter-buttons">
            <button class="filter-btn active" id="btnAll" data-filter="all">
              <i class="bi bi-list-ul me-2"></i>
              <span>Semua</span>
            </button>
            <button class="filter-btn filter-warning" id="btnStockLow" data-filter="low">
              <i class="bi bi-exclamation-triangle me-2"></i>
              <span>Stock Menipis</span>
            </button>
            <button class="filter-btn filter-danger" id="btnExpired" data-filter="expired">
              <i class="bi bi-clock me-2"></i>
              <span>Hampir Expired</span>
            </button>
          </div>
          <div class="search-wrapper">
            <i class="bi bi-search search-icon"></i>
            <input type="text" class="search-input" id="searchObat" placeholder="Cari nama obat, barcode, atau jenis...">
          </div>
        </div>

        <!-- Loading with skeleton -->
        <div id="loadingObat" class="modern-loading" style="display: block;">
          <div class="modern-card">
            <div class="table-responsive">
              <table class="modern-table">
                <thead>
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

        <!-- Table -->
        <div class="modern-card" id="tableContainer" style="display: none;">
          <div class="table-responsive">
            <table class="modern-table" id="medicineTable">
              <thead>
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
                <!-- Data loaded from JS -->
              </tbody>
            </table>
          </div>

          <!-- Empty State -->
          <div id="emptyState" class="modern-empty-state" style="display: none;">
            <div class="empty-icon">
              <i class="bi bi-capsule"></i>
            </div>
            <p class="empty-text">Belum ada data obat</p>
            <button class="btn-modern btn-primary" id="btnTambahFirst">
              <i class="bi bi-plus-circle me-2"></i>Tambah Obat Pertama
            </button>
          </div>
        </div>
      </div>

      <!-- Modern Modal Tambah Obat -->
      <div class="modal fade" id="modalTambahObat" tabindex="-1" aria-labelledby="modalTambahObatLabel" aria-hidden="true">
        <div class="modal-dialog modal-lg modal-dialog-centered">
          <div class="modal-content modern-modal">
            <div class="modal-header-gradient">
              <div class="modal-header-content">
                <i class="bi bi-plus-circle-fill modal-icon"></i>
                <h5 class="modal-title" id="modalTambahObatLabel">Tambah Obat Baru</h5>
              </div>
              <button type="button" class="btn-close-modern" data-bs-dismiss="modal" aria-label="Close">
                <i class="bi bi-x-lg"></i>
              </button>
            </div>
            
            <div class="modal-body modern-modal-body">
              <form id="formTambahObat" novalidate>
                <div class="form-section">
                  <h6 class="section-title">Informasi Obat</h6>
                  
                  <div class="row g-3">
                    <div class="col-md-5">
                      <label for="nama_obat" class="modern-label">
                        Nama Obat <span class="required">*</span>
                      </label>
                      <input type="text" id="nama_obat" name="nama_obat" class="modern-input" placeholder="Masukkan nama obat" required>
                      <div class="invalid-feedback">Nama obat wajib diisi.</div>
                    </div>
                    
                    <div class="col-md-4">
                      <label for="id_jenis_obat" class="modern-label">
                        Jenis Obat <span class="required">*</span>
                      </label>
                      <select id="id_jenis_obat" name="id_jenis_obat" class="modern-select" required>
                        <option value="">Pilih jenis...</option>
                      </select>
                      <div class="invalid-feedback">Pilih jenis obat.</div>
                    </div>
                    
                    <div class="col-md-3">
                      <label for="bentuk_obat" class="modern-label">
                        Bentuk Obat <span class="required">*</span>
                      </label>
                      <select id="bentuk_obat" name="bentuk_obat" class="modern-select" required>
                        <option value="">Pilih bentuk...</option>
                      </select>
                      <div class="invalid-feedback">Pilih bentuk obat.</div>
                    </div>
                  </div>
                </div>

                <div class="form-section">
                  <h6 class="section-title">Harga & Stok</h6>
                  
                  <div class="row g-3">
                    <div class="col-md-4">
                      <label for="harga_jual_master" class="modern-label">
                        Harga Jual <span class="required">*</span>
                      </label>
                      <div class="input-group-modern">
                        <span class="input-prefix">Rp</span>
                        <input type="text" id="harga_jual_master" name="harga_jual_master" class="modern-input with-prefix rupiah" placeholder="0" required />
                      </div>
                      <div class="invalid-feedback">Harga jual wajib diisi.</div>
                    </div>
                    
                    <div class="col-md-4">
                      <label for="harga_beli" class="modern-label">
                        Harga Beli <span class="required">*</span>
                      </label>
                      <div class="input-group-modern">
                        <span class="input-prefix">Rp</span>
                        <input type="text" id="harga_beli" name="harga_beli" class="modern-input with-prefix rupiah" placeholder="0" required />
                      </div>
                      <div class="invalid-feedback">Harga beli wajib diisi.</div>
                    </div>
                    
                    <div class="col-md-4">
                      <label for="stok" class="modern-label">
                        Stok <span class="required">*</span>
                      </label>
                      <input type="number" id="stok" name="stok" class="modern-input" placeholder="0" min="0" required>
                      <div class="invalid-feedback">Masukkan stok (>=0).</div>
                    </div>
                  </div>
                  
                  <div class="row g-3 mt-1">
                    <div class="col-md-5">
                      <label for="tanggal_expired" class="modern-label">
                        Tanggal Expired <span class="required">*</span>
                      </label>
                      <input type="date" id="tanggal_expired" name="tanggal_expired" class="modern-input" required>
                      <div class="invalid-feedback">Pilih tanggal expired.</div>
                    </div>
                  </div>
                </div>
              </form>
            </div>

            <div class="modal-footer modern-modal-footer">
              <button type="button" class="btn-modern btn-secondary" data-bs-dismiss="modal">
                <i class="bi bi-x-circle me-2"></i>Batal
              </button>
              <button type="button" id="btnSimpanObat" class="btn-modern btn-primary">
                <i class="bi bi-check-circle me-2"></i>
                <span id="btnSimpanLabel">Simpan</span>
                <span id="btnSimpanSpinner" class="spinner-border spinner-border-sm ms-2 d-none" role="status" aria-hidden="true"></span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Modal Detail Obat -->
      <div class="modal fade" id="modalDetailObat" tabindex="-1" aria-labelledby="modalDetailObatLabel" aria-hidden="true">
        <div class="modal-dialog modal-lg modal-dialog-centered">
          <div class="modal-content modern-modal">
            <div class="modal-header-gradient">
              <div class="modal-header-content">
                <i class="bi bi-capsule-fill modal-icon"></i>
                <h5 class="modal-title" id="modalDetailObatLabel">Detail Obat</h5>
              </div>
              <button type="button" class="btn-close-modern" data-bs-dismiss="modal" aria-label="Close">
                <i class="bi bi-x-lg"></i>
              </button>
            </div>
            
            <div class="modal-body modern-modal-body" id="detailObatContent">
              <div class="loading-state">
                <div class="spinner-border text-primary" role="status">
                  <span class="visually-hidden">Loading...</span>
                </div>
                <p class="loading-text">Memuat detail...</p>
              </div>
            </div>
            
            <div class="modal-footer modern-modal-footer">
              <button type="button" class="btn-modern btn-secondary" data-bs-dismiss="modal">
                <i class="bi bi-x-circle me-2"></i>Tutup
              </button>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  // Generate table skeleton
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

  // Generate batch skeleton
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

  // Inject modern styles
  injectModernStyles() {
    if (document.getElementById('obat-modern-styles')) return;

    const styleElement = document.createElement('style');
    styleElement.id = 'obat-modern-styles';
    styleElement.textContent = `
      /* ===== MODERN MEDICAL THEME ===== */
      
      :root {
        --gradient-primary: linear-gradient(135deg, #065f46 0%, #0891b2 100%);
        --color-emerald: #065f46;
        --color-emerald-light: #059669;
        --color-cyan: #0891b2;
        --color-cyan-light: #06b6d4;
        --color-gray-50: #f9fafb;
        --color-gray-100: #f3f4f6;
        --color-gray-200: #e5e7eb;
        --color-gray-300: #d1d5db;
        --color-gray-600: #4b5563;
        --color-gray-700: #374151;
        --color-gray-900: #111827;
        --shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
        --shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
        --shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
        --shadow-xl: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
        --radius-sm: 6px;
        --radius-md: 10px;
        --radius-lg: 14px;
        --radius-xl: 18px;
      }

      /* Container */
      .obat-container {
        padding: 0;
        max-width: 1400px;
        margin: 0 auto;
        animation: fadeIn 0.3s ease-in;
      }

      @keyframes fadeIn {
        from {
          opacity: 0;
          transform: translateY(10px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }

      /* ===== MODERN HEADER ===== */
      .modern-header {
        background: var(--gradient-primary);
        padding: 2rem 2.5rem;
        border-radius: var(--radius-lg);
        margin-bottom: 2rem;
        box-shadow: var(--shadow-lg);
      }

      .header-content {
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 1.5rem;
      }

      .header-text {
        flex: 1;
      }

      .header-title {
        color: white;
        font-size: 1.875rem;
        font-weight: 700;
        margin: 0 0 0.5rem 0;
        letter-spacing: -0.025em;
      }

      .header-subtitle {
        color: rgba(255, 255, 255, 0.9);
        font-size: 1rem;
        margin: 0;
        display: flex;
        align-items: center;
        gap: 0.5rem;
      }

      .count-badge {
        background: rgba(255, 255, 255, 0.2);
        backdrop-filter: blur(10px);
        padding: 0.25rem 0.75rem;
        border-radius: 999px;
        font-weight: 600;
        color: white;
      }

      /* ===== MODERN BUTTONS ===== */
      .btn-modern {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        padding: 0.75rem 1.5rem;
        font-size: 0.95rem;
        font-weight: 600;
        border-radius: var(--radius-md);
        border: none;
        cursor: pointer;
        transition: all 0.2s ease;
        gap: 0.5rem;
        white-space: nowrap;
      }

      .btn-modern:focus {
        outline: none;
        box-shadow: 0 0 0 3px rgba(6, 95, 70, 0.3);
      }

      .btn-modern.btn-primary {
        background: white;
        color: var(--color-emerald);
        box-shadow: var(--shadow-md);
      }

      .btn-modern.btn-primary:hover {
        background: var(--color-gray-50);
        transform: translateY(-2px);
        box-shadow: var(--shadow-lg);
      }

      .btn-modern.btn-secondary {
        background: var(--color-gray-100);
        color: var(--color-gray-700);
      }

      .btn-modern.btn-secondary:hover {
        background: var(--color-gray-200);
      }

      .btn-modern.btn-success {
        background: var(--color-emerald);
        color: white;
      }

      .btn-modern.btn-success:hover {
        background: var(--color-emerald-light);
        transform: translateY(-2px);
        box-shadow: var(--shadow-lg);
      }

      .btn-modern.btn-info {
        background: var(--color-cyan);
        color: white;
      }

      .btn-modern.btn-info:hover {
        background: var(--color-cyan-light);
        transform: translateY(-2px);
        box-shadow: var(--shadow-lg);
      }

      .btn-modern.btn-warning {
        background: #f59e0b;
        color: white;
      }

      .btn-modern.btn-warning:hover {
        background: #d97706;
        transform: translateY(-2px);
        box-shadow: var(--shadow-lg);
      }

      /* ===== FILTER SECTION ===== */
      .filter-section {
        display: flex;
        gap: 1.5rem;
        margin-bottom: 2rem;
        flex-wrap: wrap;
      }

      .filter-buttons {
        display: flex;
        gap: 0.75rem;
        flex: 1;
        min-width: 300px;
      }

      .filter-btn {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        padding: 0.75rem 1.25rem;
        background: white;
        border: 2px solid var(--color-gray-200);
        border-radius: var(--radius-md);
        font-size: 0.9rem;
        font-weight: 600;
        color: var(--color-gray-600);
        cursor: pointer;
        transition: all 0.2s ease;
        white-space: nowrap;
      }

      .filter-btn:hover {
        border-color: var(--color-emerald);
        background: var(--color-gray-50);
        transform: translateY(-2px);
        box-shadow: var(--shadow-md);
      }

      .filter-btn.active {
        background: var(--gradient-primary);
        border-color: transparent;
        color: white;
        box-shadow: var(--shadow-md);
      }

      .filter-btn.filter-warning:not(.active) {
        border-color: #fbbf24;
        color: #d97706;
      }

      .filter-btn.filter-warning.active {
        background: linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%);
      }

      .filter-btn.filter-danger:not(.active) {
        border-color: #f87171;
        color: #dc2626;
      }

      .filter-btn.filter-danger.active {
        background: linear-gradient(135deg, #dc2626 0%, #f87171 100%);
      }

      /* Search Input */
      .search-wrapper {
        position: relative;
        flex: 1;
        min-width: 300px;
        max-width: 400px;
      }

      .search-icon {
        position: absolute;
        left: 1rem;
        top: 50%;
        transform: translateY(-50%);
        color: var(--color-gray-400);
        font-size: 1.1rem;
        pointer-events: none;
      }

      .search-input {
        width: 100%;
        padding: 0.75rem 1rem 0.75rem 2.75rem;
        border: 2px solid var(--color-gray-200);
        border-radius: var(--radius-md);
        font-size: 0.95rem;
        transition: all 0.2s ease;
        background: white;
      }

      .search-input:focus {
        outline: none;
        border-color: var(--color-emerald);
        box-shadow: 0 0 0 3px rgba(6, 95, 70, 0.1);
      }

      /* ===== MODERN CARD ===== */
      .modern-card {
        background: white;
        border-radius: var(--radius-lg);
        box-shadow: var(--shadow-md);
        overflow: hidden;
        margin-bottom: 1.5rem;
      }

      /* ===== MODERN TABLE ===== */
      .modern-table {
        width: 100%;
        border-collapse: collapse;
        font-size: 0.9rem;
      }

      .modern-table thead {
        background: var(--color-gray-50);
      }

      .modern-table thead th {
        padding: 1rem 1.25rem;
        text-align: left;
        font-weight: 700;
        color: var(--color-gray-700);
        text-transform: uppercase;
        font-size: 0.75rem;
        letter-spacing: 0.05em;
        border-bottom: 2px solid var(--color-gray-200);
      }

      .modern-table tbody tr {
        border-bottom: 1px solid var(--color-gray-100);
        transition: all 0.2s ease;
      }

      .modern-table tbody tr:hover {
        background: var(--color-gray-50);
      }

      .modern-table tbody tr.medicine-row {
        cursor: pointer;
      }

      .modern-table tbody tr.medicine-row:hover {
        background: linear-gradient(90deg, rgba(6, 95, 70, 0.05) 0%, rgba(8, 145, 178, 0.05) 100%);
        transform: scale(1.01);
      }

      .modern-table tbody td {
        padding: 1rem 1.25rem;
        color: var(--color-gray-700);
      }

      .modern-table tbody td strong {
        color: var(--color-gray-900);
        font-weight: 600;
      }

      /* Modern Badges */
      .badge {
        display: inline-flex;
        align-items: center;
        padding: 0.375rem 0.875rem;
        border-radius: 999px;
        font-size: 0.8rem;
        font-weight: 600;
        letter-spacing: 0.025em;
      }

      .badge.bg-success {
        background: linear-gradient(135deg, #059669 0%, #10b981 100%);
        color: white;
      }

      .badge.bg-danger {
        background: linear-gradient(135deg, #dc2626 0%, #f87171 100%);
        color: white;
      }

      .badge.bg-warning {
        background: linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%);
        color: white;
      }

      .badge.bg-info {
        background: linear-gradient(135deg, #0891b2 0%, #06b6d4 100%);
        color: white;
      }

      .badge.bg-secondary {
        background: var(--color-gray-200);
        color: var(--color-gray-700);
      }

      /* ===== EMPTY STATE ===== */
      .modern-empty-state {
        text-align: center;
        padding: 4rem 2rem;
      }

      .empty-icon {
        width: 80px;
        height: 80px;
        margin: 0 auto 1.5rem;
        background: var(--gradient-primary);
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-size: 2.5rem;
      }

      .empty-text {
        color: var(--color-gray-600);
        font-size: 1.1rem;
        margin-bottom: 1.5rem;
      }

      /* ===== MODAL STYLING ===== */
      .modern-modal {
        border: none;
        border-radius: var(--radius-xl);
        overflow: hidden;
        box-shadow: var(--shadow-xl);
      }

      .modal-header-gradient {
        background: var(--gradient-primary);
        padding: 1.75rem 2rem;
        border: none;
        display: flex;
        justify-content: space-between;
        align-items: center;
      }

      .modal-header-content {
        display: flex;
        align-items: center;
        gap: 1rem;
        color: white;
      }

      .modal-icon {
        font-size: 1.75rem;
        opacity: 0.9;
      }

      .modal-title {
        font-size: 1.5rem;
        font-weight: 700;
        margin: 0;
        color: white;
      }

      .btn-close-modern {
        background: rgba(255, 255, 255, 0.2);
        border: none;
        width: 36px;
        height: 36px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        transition: all 0.2s ease;
        color: white;
        font-size: 1.25rem;
      }

      .btn-close-modern:hover {
        background: rgba(255, 255, 255, 0.3);
        transform: rotate(90deg);
      }

      .modern-modal-body {
        padding: 2rem;
        background: var(--color-gray-50);
      }

      .modern-modal-footer {
        padding: 1.5rem 2rem;
        background: white;
        border-top: 1px solid var(--color-gray-200);
        display: flex;
        gap: 1rem;
        justify-content: flex-end;
      }

      /* ===== FORM STYLING ===== */
      .form-section {
        background: white;
        padding: 1.75rem;
        border-radius: var(--radius-lg);
        margin-bottom: 1.5rem;
        box-shadow: var(--shadow-sm);
      }

      .section-title {
        font-size: 1rem;
        font-weight: 700;
        color: var(--color-gray-900);
        margin-bottom: 1.25rem;
        padding-bottom: 0.75rem;
        border-bottom: 2px solid var(--color-gray-200);
        display: flex;
        align-items: center;
        gap: 0.5rem;
      }

      .section-title::before {
        content: '';
        width: 4px;
        height: 20px;
        background: var(--gradient-primary);
        border-radius: 2px;
      }

      .modern-label {
        display: block;
        font-size: 0.875rem;
        font-weight: 600;
        color: var(--color-gray-700);
        margin-bottom: 0.5rem;
      }

      .required {
        color: #dc2626;
      }

      .modern-input,
      .modern-select {
        width: 100%;
        padding: 0.75rem 1rem;
        border: 2px solid var(--color-gray-200);
        border-radius: var(--radius-md);
        font-size: 0.95rem;
        transition: all 0.2s ease;
        background: white;
        color: var(--color-gray-900);
      }

      .modern-input:focus,
      .modern-select:focus {
        outline: none;
        border-color: var(--color-emerald);
        box-shadow: 0 0 0 3px rgba(6, 95, 70, 0.1);
      }

      .modern-input::placeholder {
        color: var(--color-gray-400);
      }

      .modern-input.with-prefix {
        padding-left: 3.5rem;
      }

      .input-group-modern {
        position: relative;
        display: flex;
        align-items: center;
      }

      .input-prefix {
        position: absolute;
        left: 1rem;
        color: var(--color-gray-600);
        font-weight: 600;
        font-size: 0.95rem;
        pointer-events: none;
        z-index: 1;
      }

      /* Form Validation */
      .modern-input.is-invalid,
      .modern-select.is-invalid {
        border-color: #dc2626;
      }

      .invalid-feedback {
        display: none;
        color: #dc2626;
        font-size: 0.8rem;
        margin-top: 0.375rem;
      }

      .was-validated .modern-input:invalid ~ .invalid-feedback,
      .was-validated .modern-select:invalid ~ .invalid-feedback,
      .modern-input.is-invalid ~ .invalid-feedback,
      .modern-select.is-invalid ~ .invalid-feedback {
        display: block;
      }

      /* ===== LOADING STATE ===== */
      .loading-state {
        text-align: center;
        padding: 3rem 2rem;
      }

      .loading-text {
        color: var(--color-gray-600);
        margin-top: 1rem;
        margin-bottom: 0;
      }

      /* ===== SKELETON LOADING ===== */
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

      /* Detail Table Styling */
      .detail-info-table {
        width: 100%;
      }

      .detail-info-table td {
        padding: 0.75rem 0;
        border-bottom: 1px solid var(--color-gray-100);
      }

      .detail-info-table td:first-child {
        color: var(--color-gray-600);
        font-weight: 500;
        width: 40%;
      }

      .detail-info-table td:last-child {
        color: var(--color-gray-900);
        font-weight: 600;
      }

      /* Batch Table in Edit Modal */
      .batch-table-container {
        background: white;
        border-radius: var(--radius-lg);
        padding: 1.5rem;
        box-shadow: var(--shadow-sm);
      }

      .batch-section-title {
        font-size: 1rem;
        font-weight: 700;
        color: var(--color-gray-900);
        margin-bottom: 1rem;
        display: flex;
        align-items: center;
        gap: 0.5rem;
      }

      .btn-batch-detail {
        padding: 0.375rem 0.875rem;
        font-size: 0.8rem;
        font-weight: 600;
        background: white;
        color: var(--color-cyan);
        border: 2px solid var(--color-cyan);
        border-radius: var(--radius-sm);
        cursor: pointer;
        transition: all 0.2s ease;
      }

      .btn-batch-detail:hover {
        background: var(--color-cyan);
        color: white;
        transform: translateY(-2px);
        box-shadow: var(--shadow-md);
      }

      /* ===== RESPONSIVE ===== */
      @media (max-width: 768px) {
        .modern-header {
          padding: 1.5rem;
        }

        .header-content {
          flex-direction: column;
          align-items: flex-start;
        }

        .filter-section {
          flex-direction: column;
        }

        .filter-buttons {
          width: 100%;
          flex-wrap: wrap;
        }

        .search-wrapper {
          max-width: 100%;
        }

        .modern-modal-body {
          padding: 1.5rem;
        }

        .form-section {
          padding: 1.25rem;
        }
      }
    `;
    
    document.head.appendChild(styleElement);
  }

  // Inject toast notification system
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
        box-shadow: var(--shadow-xl);
        border-left: 4px solid;
        animation: slideInRight 0.3s ease-out;
        border-radius: var(--radius-md);
        overflow: hidden;
      }
      
      .custom-toast.toast-success {
        border-left-color: #059669;
      }
      
      .custom-toast.toast-error {
        border-left-color: #dc2626;
      }
      
      .custom-toast.toast-warning {
        border-left-color: #f59e0b;
      }
      
      .custom-toast.toast-info {
        border-left-color: #0891b2;
      }

      .toast-icon {
        font-size: 1.5rem;
        margin-right: 0.75rem;
      }

      .toast-success .toast-icon { color: #059669; }
      .toast-error .toast-icon { color: #dc2626; }
      .toast-warning .toast-icon { color: #f59e0b; }
      .toast-info .toast-icon { color: #0891b2; }

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
    `;
    document.head.appendChild(styleElement);
  }

  // Show custom toast notification
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

  // Show loading overlay
  showLoadingOverlay(message = 'Memproses...') {
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
          border-radius: var(--radius-xl);
          text-align: center;
          min-width: 250px;
          box-shadow: var(--shadow-xl);
        ">
          <div class="spinner-border mb-3" role="status" style="width: 3rem; height: 3rem; color: var(--color-emerald);">
            <span class="visually-hidden">Loading...</span>
          </div>
          <p class="mb-0 fw-bold" style="color: var(--color-gray-700);">${message}</p>
        </div>
      </div>
    `;

    document.body.insertAdjacentHTML('beforeend', overlayHtml);
  }

  hideLoadingOverlay() {
    const overlay = document.getElementById('obat-loading-overlay');
    if (overlay) overlay.remove();
  }

  // Show confirmation dialog
  showConfirmDialog(message, onConfirm, onCancel = null) {
    const confirmId = 'confirm-' + Date.now();
    const confirmHtml = `
      <div class="modal fade" id="${confirmId}" tabindex="-1">
        <div class="modal-dialog modal-dialog-centered">
          <div class="modal-content modern-modal">
            <div class="modal-header-gradient" style="background: linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%);">
              <div class="modal-header-content">
                <i class="bi bi-exclamation-triangle-fill modal-icon"></i>
                <h5 class="modal-title">Konfirmasi</h5>
              </div>
            </div>
            <div class="modal-body modern-modal-body">
              <p class="mb-0" style="font-size: 1rem; color: var(--color-gray-700);">${message}</p>
            </div>
            <div class="modal-footer modern-modal-footer">
              <button type="button" class="btn-modern btn-secondary" data-bs-dismiss="modal">
                <i class="bi bi-x-circle me-2"></i>Batal
              </button>
              <button type="button" class="btn-modern btn-warning" id="${confirmId}-confirm">
                <i class="bi bi-check-circle me-2"></i>Ya, Lanjutkan
              </button>
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

  // Initialize Rupiah formatter
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
        
        this.value = angka ? hasil : '';
      });
    }
  }

  // Initialize fragment
  async onInit() {
    console.log("⚙️ ObatFragment.onInit() starting...");
    
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
    this.initBatchEventListeners();
    
    console.log("✅ ObatFragment ready");
  }

  // Initialize event listeners
  initEventListeners() {
    if (this._eventListenersInitialized) {
      console.log('⚠️ Event listeners already initialized, skipping...');
      return;
    }
    this._eventListenersInitialized = true;
    console.log('✅ Initializing event listeners...');

    const btnAll = document.getElementById('btnAll');
    const btnStockLow = document.getElementById('btnStockLow');
    const btnExpired = document.getElementById('btnExpired');

    // Table row click with guard
    if (this.tableBody) {
      this.tableBody.addEventListener('click', async (e) => {
        if (this._clickGuard) {
          console.log('⚠️ Click guard active, ignoring click');
          return;
        }
        
        const row = e.target.closest('.medicine-row');
        if (row) {
          this._clickGuard = true;
          const medId = row.getAttribute('data-id');
          
          console.log('🖱️ Medicine row clicked, ID:', medId);
          await this.showEditModal(medId);
          
          setTimeout(() => {
            this._clickGuard = false;
            console.log('✅ Click guard released');
          }, 500);
        }
      });
      console.log('✅ Table click listener attached');
    }
    
    // Filter buttons
    if (btnAll) btnAll.addEventListener('click', () => this.filterMedicines('all'));
    if (btnStockLow) btnStockLow.addEventListener('click', () => this.filterMedicines('low'));
    if (btnExpired) btnExpired.addEventListener('click', () => this.filterMedicines('expired'));
    
    // Search input
    const searchInput = document.getElementById('searchObat');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => this.searchMedicines(e.target.value));
    }
    
    // Save button
    const btnSimpan = document.getElementById('btnSimpanObat');
    if (btnSimpan) {
      btnSimpan.addEventListener('click', () => this.handleSubmit());
    }
    
    // Modal reset
    const modal = document.getElementById('modalTambahObat');
    if (modal) {
      modal.addEventListener('show.bs.modal', () => this.resetForm());
    }
    
    // First add button
    const btnTambahFirst = document.getElementById('btnTambahFirst');
    if (btnTambahFirst) {
      btnTambahFirst.addEventListener('click', () => {
        const modal = new bootstrap.Modal(document.getElementById('modalTambahObat'));
        modal.show();
      });
    }
    
    console.log('✅ All event listeners initialized');
  }

  // Initialize batch event listeners
  initBatchEventListeners() {
    document.addEventListener('click', async (e) => {
      const btnDetail = e.target.closest('.btn-batch-detail');
      
      if (btnDetail && document.getElementById('editBatchTableBody')) {
        let batchId = btnDetail.getAttribute('data-batch-id');
        const batchStatus = btnDetail.getAttribute('data-batch-status');
        
        if (batchId) {
          batchId = batchId.trim().replace(/['"]/g, '');
          
          console.log('🖱️ Clicked batch ID (raw):', batchId);
          console.log('🔍 Length:', batchId.length, 'Expected: 36');
          
          const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
          
          if (!uuidRegex.test(batchId)) {
            console.error('❌ Invalid UUID format:', batchId);
            this.showToast('Format ID batch tidak valid', 'error');
            return;
          }
          
          console.log('✅ UUID validated, calling showBatchUsageDetail...');
          await this.showBatchUsageDetail(batchId, batchStatus);
        }
      }
    });
  }

  // Load medicines with skeleton
  async loadMedicines() {
    try {
      console.log('🔄 Loading medicines for doctor:', this.currentDokterId);
      
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
      
      await new Promise(resolve => setTimeout(resolve, 300));
      
      this.renderTable();
      
    } catch (error) {
      console.error('❌ Error loading medicines:', error);
      this.showToast('Gagal memuat data obat: ' + error.message, 'error');
    } finally {
      this.showLoading(false);
    }
  }

  // Load jenis obat
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

  // Load bentuk obat
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

  // Populate jenis obat dropdown
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

  // Populate bentuk obat dropdown
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

  // Filter medicines
  filterMedicines(type) {
    console.log('🔍 Filtering medicines by:', type);
    
    this.currentFilter = type;
    
    document.querySelectorAll('.filter-btn').forEach(btn => {
      btn.classList.remove('active');
    });
    
    const activeBtn = type === 'all' ? document.getElementById('btnAll') :
                      type === 'low' ? document.getElementById('btnStockLow') :
                      document.getElementById('btnExpired');
    
    if (activeBtn) {
      activeBtn.classList.add('active');
    }
    
    this.renderTable();
  }

  // Search medicines
  searchMedicines(query) {
    console.log('🔍 Searching for:', query);
    this.searchQuery = query.toLowerCase();
    this.renderTable();
  }

  // Get filtered medicines
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

  // Render table
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
        
        const emptyText = this.emptyState.querySelector('.empty-text');
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
          ? `<span class="badge bg-danger">${med.stock}</span>` 
          : `<span class="badge bg-success">${med.stock}</span>`;
        
        return `
          <tr class="medicine-row" data-id="${med.id_obat}">
            <td>${index + 1}</td>
            <td>${this.escapeHtml(med.barcode || '-')}</td>
            <td>
              <strong>${this.escapeHtml(med.nama_obat)}</strong>
            </td>
            <td><span class="badge bg-info">${this.escapeHtml(med.jenis_obat || "-")}</span></td>
            <td><strong style="color: var(--color-emerald);">Rp ${this.formatCurrency(med.harga_jual)}</strong></td>
            <td>${stockBadge}</td>
          </tr>
        `;
      })
      .join("");

    this.tableBody.innerHTML = html;
    
    console.log(`✅ Rendered ${filteredMedicines.length} medicines (filter: ${this.currentFilter}, search: "${this.searchQuery}")`);
  }

  // Show edit modal
  async showEditModal(medId) {
    console.log('✏️ Opening edit modal for medicine ID:', medId);
    
    const existingModal = document.getElementById('modalEditObat');
    if (existingModal) {
      console.log('🧹 Cleaning up existing modal...');
      
      const existingInstance = bootstrap.Modal.getInstance(existingModal);
      if (existingInstance) {
        existingInstance.dispose();
        console.log('✅ Bootstrap modal instance disposed');
      }
      
      existingModal.remove();
      console.log('✅ Modal DOM removed');
      
      await new Promise(resolve => setTimeout(resolve, 150));
    }
    
    const backdrops = document.querySelectorAll('.modal-backdrop');
    if (backdrops.length > 0) {
      console.log(`🧹 Removing ${backdrops.length} lingering backdrop(s)...`);
      backdrops.forEach(backdrop => backdrop.remove());
    }
    
    document.body.classList.remove('modal-open');
    document.body.style.overflow = '';
    document.body.style.paddingRight = '';
    
    const modalHtml = `
      <div class="modal fade" id="modalEditObat" tabindex="-1" aria-labelledby="modalEditObatLabel" aria-hidden="true">
        <div class="modal-dialog modal-xl modal-dialog-centered modal-dialog-scrollable">
          <div class="modal-content modern-modal">
            <div class="modal-header-gradient">
              <div class="modal-header-content">
                <i class="bi bi-pencil-fill modal-icon"></i>
                <h5 class="modal-title" id="modalEditObatLabel">Edit Obat</h5>
              </div>
              <button type="button" class="btn-close-modern" data-bs-dismiss="modal" aria-label="Close">
                <i class="bi bi-x-lg"></i>
              </button>
            </div>
            
            <div class="modal-body modern-modal-body" style="max-height: calc(100vh - 250px); overflow-y: auto;">
              <div class="loading-state" id="editLoading">
                <div class="spinner-border text-primary" role="status">
                  <span class="visually-hidden">Loading...</span>
                </div>
                <p class="loading-text">Memuat data...</p>
              </div>
              
              <div id="editFormContent" style="display: none;">
                <div class="form-section">
                  <form id="formEditObat" novalidate>
                    <input type="hidden" id="edit_id_obat">
                    
                    <div class="row g-3 mb-3">
                      <div class="col-md-4">
                        <label for="edit_nama_obat" class="modern-label">
                          Nama Obat <span class="required">*</span>
                        </label>
                        <input type="text" class="modern-input" id="edit_nama_obat" required>
                        <div class="invalid-feedback">Nama obat wajib diisi</div>
                      </div>
                      
                      <div class="col-md-4">
                        <label for="edit_jenis_obat" class="modern-label">
                          Jenis Obat <span class="required">*</span>
                        </label>
                        <select class="modern-select" id="edit_jenis_obat" required>
                          <option value="">Pilih jenis...</option>
                        </select>
                        <div class="invalid-feedback">Pilih jenis obat</div>
                      </div>
                      
                      <div class="col-md-4">
                        <label for="edit_bentuk_obat" class="modern-label">
                          Bentuk Obat <span class="required">*</span>
                        </label>
                        <select class="modern-select" id="edit_bentuk_obat" required>
                          <option value="">Pilih bentuk...</option>
                        </select>
                        <div class="invalid-feedback">Pilih bentuk obat</div>
                      </div>
                    </div>
                    
                    <div class="row g-3">
                      <div class="col-md-4">
                        <label for="edit_barcode" class="modern-label">Barcode</label>
                        <input type="text" class="modern-input" id="edit_barcode">
                      </div>
                      
                      <div class="col-md-3">
                        <label class="modern-label">Stock</label>
                        <input type="text" class="modern-input" id="edit_total_stock" readonly>
                      </div>
                      
                      <div class="col-md-5 d-flex flex-column justify-content-end gap-2">
                        <button type="button" class="btn-modern btn-info w-100" id="btnTambahStockEdit">
                          <i class="bi bi-plus-circle me-2"></i>Tambahkan Stock
                        </button>
                        <button type="button" id="btnSimpanEdit" class="btn-modern btn-success w-100">
                          <i class="bi bi-check-circle me-2"></i>
                          <span id="btnSimpanEditLabel">Simpan</span>
                          <span id="btnSimpanEditSpinner" class="spinner-border spinner-border-sm ms-2 d-none" role="status" aria-hidden="true"></span>
                        </button>
                      </div>
                    </div>
                  </form>
                </div>
                
                <div class="batch-table-container mt-3">
                  <h6 class="batch-section-title">
                    <i class="bi bi-box-seam me-2"></i>Obat Masuk (Detail Batch)
                  </h6>
                  
                  <div id="batchLoading" style="display: none;">
                    <div class="table-responsive">
                      <table class="modern-table">
                        <thead>
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
                    <table class="modern-table">
                      <thead>
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
                  
                  <div id="emptyBatch" class="text-center py-4 text-muted" style="display: none;">
                    <i class="bi bi-inbox" style="font-size: 2rem;"></i>
                    <p class="mb-0 mt-2">Belum ada batch obat masuk</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
    
    console.log('📝 Creating new modal...');
    document.body.insertAdjacentHTML('beforeend', modalHtml);
    
    console.log('🎭 Showing modal...');
    const modal = new bootstrap.Modal(document.getElementById('modalEditObat'));
    modal.show();
    
    console.log('📊 Loading edit data...');
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
    console.log('✅ Edit modal ready');
  }

  // Load edit data
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
          <div class="alert alert-danger" style="border-radius: var(--radius-md);">
            <i class="bi bi-exclamation-triangle me-2"></i>
            ${error.message}
          </div>
        `;
      }
      
      this.showToast('Gagal memuat data obat', 'error');
    }
  }

  // Populate edit dropdowns
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

  // Load batch details
  async loadBatchDetails(medId) {
    try {
      console.log('🔄 Loading batch details for medicine ID:', medId);
      
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
      
      await new Promise(resolve => setTimeout(resolve, 300));
      
      if (batchLoading) batchLoading.style.display = 'none';
      if (batchTableContainer) batchTableContainer.style.display = 'block';
      
      if (batches.length === 0) {
        tbody.innerHTML = '';
        if (batchTableContainer) batchTableContainer.style.display = 'none';
        if (emptyState) emptyState.style.display = 'block';
        return;
      }
      
      if (emptyState) emptyState.style.display = 'none';
      
      const html = batches.map(batch => {
        let batchId = String(batch.id_detail_obat || '').trim();
        batchId = batchId.replace(/['"]/g, '');
        
        console.log('🔍 Batch ID:', batchId, 'Length:', batchId.length);
        
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
        if (!uuidRegex.test(batchId)) {
          console.error('❌ Invalid batch UUID:', batchId);
        }
        
        return `
          <tr>
            <td>${this.escapeHtml(batch.nama_obat || '-')}</td>
            <td><strong>${batch.stock || 0}</strong></td>
            <td>${batch.created_at ? this.formatDate(batch.created_at) : '-'}</td>
            <td>${batch.tanggal_expired ? this.formatDate(batch.tanggal_expired) : '-'}</td>
            <td>Rp ${this.formatCurrency(batch.harga_beli)}</td>
            <td>Rp ${this.formatCurrency(batch.harga_jual)}</td>
            <td><span class="badge bg-${this.getBatchStatusColor(batch.status_batch)}">${batch.status_batch || 'aktif'}</span></td>
            <td class="text-center">
              <button class="btn-batch-detail" 
                      data-batch-id="${batchId}"
                      data-batch-status="${batch.status_batch || 'aktif'}"
                      title="Lihat Detail Penggunaan">
                DETAIL
              </button>
            </td>
          </tr>
        `;
      }).join('');
      
      tbody.innerHTML = html;
      
      console.log('✅ Batch table rendered with', batches.length, 'rows');
      
    } catch (error) {
      console.error('❌ Error loading batch details:', error);
      console.error('❌ Error stack:', error.stack);
      
      const batchLoading = document.getElementById('batchLoading');
      if (batchLoading) {
        batchLoading.innerHTML = `
          <div class="alert alert-danger" style="border-radius: var(--radius-md);">
            <i class="bi bi-exclamation-triangle me-2"></i>
            Gagal memuat detail batch: ${error.message}
          </div>
        `;
      }
      
      this.showToast('Gagal memuat detail batch', 'error');
    }
  }

  // Show batch usage detail
  async showBatchUsageDetail(batchId, batchStatus) {
    try {
      batchId = String(batchId).trim().replace(/['"]/g, '');
      
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      if (!uuidRegex.test(batchId)) {
        console.error('❌ Invalid UUID format:', batchId);
        throw new Error('Format ID batch tidak valid');
      }
      
      console.log('🔍 Loading batch usage for batch ID:', batchId);
      
      const url = `${this.apiBasePath}/obat.php?action=getBatchUsage&batch_id=${batchId}`;
      console.log('📤 Request URL:', url);
      
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`HTTP Error: ${response.status}`);
      }
      
      const responseText = await response.text();
      console.log('📥 Raw response:', responseText);
      
      let result;
      try {
        result = JSON.parse(responseText);
      } catch (parseError) {
        console.error('❌ JSON Parse Error:', parseError);
        throw new Error('Invalid JSON response from server');
      }
      
      console.log('📦 Batch usage result:', result);
      
      if (result.success === false) {
        console.error('❌ API returned error:', result.message || result.error);
        throw new Error(result.message || result.error || 'Gagal memuat detail penggunaan');
      }
      
      let usage = result.data || [];
      
      if (!Array.isArray(usage)) {
        console.error('❌ Usage is not an array:', usage);
        console.error('❌ Type:', typeof usage);
        console.error('❌ Full result:', JSON.stringify(result));
        
        if (usage && typeof usage === 'object' && usage.error) {
          throw new Error(usage.error);
        }
        
        usage = [];
      }
      
      console.log('✅ Found', usage.length, 'usage records');
      
      const showRestockButton = (batchStatus === 'aktif' || batchStatus === 'expired');
      
      const detailHtml = `
        <div class="modal fade" id="modalBatchUsage" tabindex="-1">
          <div class="modal-dialog modal-lg modal-dialog-centered">
            <div class="modal-content modern-modal">
              <div class="modal-header-gradient" style="background: var(--gradient-primary);">
                <div class="modal-header-content">
                  <i class="bi bi-list-ul modal-icon"></i>
                  <h5 class="modal-title">Detail Pengeluaran Obat Per Batch</h5>
                </div>
                <button type="button" class="btn-close-modern" data-bs-dismiss="modal">
                  <i class="bi bi-x-lg"></i>
                </button>
              </div>
              <div class="modal-body modern-modal-body">
                ${usage.length === 0 ? `
                  <div class="modern-empty-state">
                    <div class="empty-icon">
                      <i class="bi bi-inbox"></i>
                    </div>
                    <p class="empty-text">Belum ada penggunaan obat dari batch ini</p>
                  </div>
                ` : `
                  <div class="table-responsive">
                    <table class="modern-table">
                      <thead>
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
              <div class="modal-footer modern-modal-footer">
                ${showRestockButton ? `
                  <button type="button" class="btn-modern btn-info" id="btnRestockFromDetail" data-batch-id="${batchId}">
                    <i class="bi bi-arrow-repeat me-2"></i>Restock
                  </button>
                ` : ''}
                <button type="button" class="btn-modern btn-secondary" data-bs-dismiss="modal">
                  <i class="bi bi-x-circle me-2"></i>Tutup
                </button>
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
      console.error('❌ Stack:', error.stack);
      this.showToast('Gagal memuat detail penggunaan: ' + error.message, 'error');
    }
  }

  // Show restock modal
  async showRestockModal(medId) {
    console.log('🔄 Opening restock modal for medicine ID:', medId);
    
    const modalHtml = `
      <div class="modal fade" id="modalRestockObat" tabindex="-1" aria-labelledby="modalRestockObatLabel" aria-hidden="true">
        <div class="modal-dialog modal-lg modal-dialog-centered">
          <div class="modal-content modern-modal">
            <div class="modal-header-gradient" style="background: linear-gradient(135deg, #0891b2 0%, #06b6d4 100%);">
              <div class="modal-header-content">
                <i class="bi bi-arrow-repeat modal-icon"></i>
                <h5 class="modal-title" id="modalRestockObatLabel">Restock Obat</h5>
              </div>
              <button type="button" class="btn-close-modern" data-bs-dismiss="modal" aria-label="Close">
                <i class="bi bi-x-lg"></i>
              </button>
            </div>
            
            <div class="modal-body modern-modal-body">
              <div class="loading-state" id="restockLoading">
                <div class="spinner-border text-primary" role="status">
                  <span class="visually-hidden">Loading...</span>
                </div>
                <p class="loading-text">Memuat data...</p>
              </div>
              
              <div id="restockFormContent" style="display: none;">
                <div class="row g-3">
                  <div class="col-md-6">
                    <div class="form-section">
                      <h6 class="section-title">Data Obat Saat Ini</h6>
                      <table class="detail-info-table">
                        <tr>
                          <td>Nama Obat</td>
                          <td id="restock_nama_obat">-</td>
                        </tr>
                        <tr>
                          <td>Jenis</td>
                          <td id="restock_jenis_obat">-</td>
                        </tr>
                        <tr>
                          <td>Stok Saat Ini</td>
                          <td><strong id="restock_stok_lama">0</strong></td>
                        </tr>
                      </table>
                    </div>
                  </div>
                  
                  <div class="col-md-6">
                    <div class="form-section">
                      <h6 class="section-title">Data Restock Baru</h6>
                      <form id="formRestock" novalidate>
                        <input type="hidden" id="restock_id_obat">
                        
                        <div class="mb-3">
                          <label for="restock_stok_baru" class="modern-label">
                            Jumlah Stok Masuk <span class="required">*</span>
                          </label>
                          <input type="number" class="modern-input" id="restock_stok_baru" placeholder="0" required min="0">
                          <div class="invalid-feedback">Masukkan stok baru</div>
                        </div>
                        
                        <div class="mb-3">
                          <label for="restock_tanggal_expired" class="modern-label">
                            Tanggal Expired <span class="required">*</span>
                          </label>
                          <input type="date" class="modern-input" id="restock_tanggal_expired" required>
                          <div class="invalid-feedback">Pilih tanggal expired</div>
                        </div>
                        
                        <div class="mb-3">
                          <label for="restock_harga_beli" class="modern-label">Harga Beli</label>
                          <div class="input-group-modern">
                            <span class="input-prefix">Rp</span>
                            <input type="text" class="modern-input with-prefix rupiah" id="restock_harga_beli" placeholder="0">
                          </div>
                        </div>
                        
                        <div class="mb-3">
                          <label for="restock_harga_jual" class="modern-label">Harga Jual</label>
                          <div class="input-group-modern">
                            <span class="input-prefix">Rp</span>
                            <input type="text" class="modern-input with-prefix rupiah" id="restock_harga_jual" placeholder="0">
                          </div>
                        </div>
                      </form>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div class="modal-footer modern-modal-footer">
              <button type="button" class="btn-modern btn-secondary" data-bs-dismiss="modal">
                <i class="bi bi-x-circle me-2"></i>Batal
              </button>
              <button type="button" id="btnProsesRestock" class="btn-modern btn-info">
                <i class="bi bi-arrow-repeat me-2"></i>
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
    
    document.body.insertAdjacentHTML('beforeend', modalHtml);
    
    const modal = new bootstrap.Modal(document.getElementById('modalRestockObat'));
    modal.show();
    
    this.initRupiahListener();
    
    await this.loadRestockData(medId);
    
    const btnProses = document.getElementById('btnProsesRestock');
    if (btnProses) {
      btnProses.addEventListener('click', () => this.handleRestockSubmit());
    }
  }

  // Load restock data
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
      document.getElementById('restock_harga_beli').value = this.formatCurrency(medicine.harga_beli);
      document.getElementById('restock_harga_jual').value = this.formatCurrency(medicine.harga_jual);
      
    } catch (error) {
      console.error('❌ Error loading restock data:', error);
      document.getElementById('restockLoading').innerHTML = `
        <div class="alert alert-danger" style="border-radius: var(--radius-md);">
          <i class="bi bi-exclamation-triangle me-2"></i>
          ${error.message}
        </div>
      `;
      this.showToast('Gagal memuat data restock', 'error');
    }
  }

  // Handle restock submit
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

  // Handle submit new medicine
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

  // Handle edit submit
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

  // Initialize doctor ID
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

  // Reset form
  resetForm() {
    const form = document.getElementById('formTambahObat');
    
    if (form) {
      form.reset();
      form.classList.remove('was-validated');
    }
  }

  // Parse rupiah string to number
  parseRupiah(rupiahStr) {
    if (!rupiahStr) return 0;
    return parseInt(rupiahStr.replace(/[^\d]/g, '')) || 0;
  }

  // Show/hide loading
  showLoading(show) {
    if (this.loadingEl) this.loadingEl.style.display = show ? "block" : "none";
    if (this.tableContainer) this.tableContainer.style.display = show ? "none" : "block";
  }

  // Format currency
  formatCurrency(value) {
    return new Intl.NumberFormat("id-ID").format(value ?? 0);
  }

  // Format date
  formatDate(dateStr) {
    const date = new Date(dateStr);
    return date.toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  }

  // Format date time
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

  // Escape HTML
  escapeHtml(text) {
    return String(text || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  // Get batch status color
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

  // Cleanup on destroy
  onDestroy() {
    console.log('🧹 Cleaning up ObatFragment...');
    
    this._eventListenersInitialized = false;
    this._clickGuard = false;
    console.log('✅ Event listener flags reset');
    
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
    
    const toastContainer = document.getElementById('obat-toast-container');
    if (toastContainer) toastContainer.remove();
    
    const toastStyles = document.getElementById('obat-toast-styles');
    if (toastStyles) toastStyles.remove();
    
    this.hideLoadingOverlay();
    
    const modernStyles = document.getElementById('obat-modern-styles');
    if (modernStyles) modernStyles.remove();
    
    console.log('✅ ObatFragment cleaned up');
  }
}

// Export to window
window.ObatFragment = ObatFragment;
console.log("✅ ObatFragment class registered globally");