console.log("🔥 ANTRIAN FRAGMENT - WITH CUSTOM ALERTS & LOADING STATES 🔥");

// ========================================
// CUSTOM ALERT SYSTEM
// ========================================
const CustomAlert = {
  // Show alert modal
  show({ 
    type = 'info', // success, error, warning, info, confirm
    title = '', 
    message = '', 
    confirmText = 'OK',
    cancelText = 'Batal',
    onConfirm = null,
    onCancel = null,
    showCancel = false,
    autoClose = 0 // Auto close after ms (0 = disabled)
  }) {
    // Remove existing alert
    this.hide();
    
    const icons = {
      success: '<i class="bi bi-check-circle-fill"></i>',
      error: '<i class="bi bi-x-circle-fill"></i>',
      warning: '<i class="bi bi-exclamation-triangle-fill"></i>',
      info: '<i class="bi bi-info-circle-fill"></i>',
      confirm: '<i class="bi bi-question-circle-fill"></i>'
    };
    
    const colors = {
      success: { bg: '#10b981', light: '#d1fae5' },
      error: { bg: '#ef4444', light: '#fee2e2' },
      warning: { bg: '#f59e0b', light: '#fef3c7' },
      info: { bg: '#0891b2', light: '#cffafe' },
      confirm: { bg: '#6366f1', light: '#e0e7ff' }
    };
    
    const color = colors[type] || colors.info;
    
    const alertHTML = `
      <div id="customAlertOverlay" class="custom-alert-overlay">
        <div class="custom-alert-container" style="animation: alertSlideIn 0.3s ease;">
          <div class="custom-alert-icon" style="background: ${color.light}; color: ${color.bg};">
            ${icons[type]}
          </div>
          <div class="custom-alert-content">
            ${title ? `<h4 class="custom-alert-title">${title}</h4>` : ''}
            <p class="custom-alert-message">${message}</p>
          </div>
          <div class="custom-alert-buttons">
            ${showCancel ? `
              <button class="custom-alert-btn btn-cancel" id="customAlertCancel">
                ${cancelText}
              </button>
            ` : ''}
            <button class="custom-alert-btn btn-confirm" id="customAlertConfirm" style="background: linear-gradient(135deg, #065f46 0%, #0891b2 100%);">
              ${confirmText}
            </button>
          </div>
        </div>
      </div>
      
      <style>
        .custom-alert-overlay {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: rgba(0, 0, 0, 0.6);
          backdrop-filter: blur(4px);
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 10000;
          animation: alertFadeIn 0.2s ease;
        }
        
        @keyframes alertFadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes alertSlideIn {
          from { 
            transform: scale(0.9) translateY(-20px); 
            opacity: 0; 
          }
          to { 
            transform: scale(1) translateY(0); 
            opacity: 1; 
          }
        }
        
        @keyframes alertSlideOut {
          from { 
            transform: scale(1) translateY(0); 
            opacity: 1; 
          }
          to { 
            transform: scale(0.9) translateY(-20px); 
            opacity: 0; 
          }
        }
        
        .custom-alert-container {
          background: white;
          border-radius: 16px;
          padding: 32px;
          max-width: 420px;
          width: 90%;
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
          text-align: center;
        }
        
        .custom-alert-icon {
          width: 72px;
          height: 72px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 20px;
          font-size: 36px;
        }
        
        .custom-alert-title {
          font-size: 20px;
          font-weight: 700;
          color: #1f2937;
          margin: 0 0 8px 0;
        }
        
        .custom-alert-message {
          font-size: 15px;
          color: #6b7280;
          margin: 0;
          line-height: 1.6;
          white-space: pre-line;
        }
        
        .custom-alert-buttons {
          display: flex;
          gap: 12px;
          justify-content: center;
          margin-top: 24px;
        }
        
        .custom-alert-btn {
          padding: 12px 28px;
          border-radius: 10px;
          font-weight: 600;
          font-size: 14px;
          cursor: pointer;
          transition: all 0.2s;
          border: none;
        }
        
        .custom-alert-btn.btn-confirm {
          color: white;
          box-shadow: 0 4px 14px rgba(6, 95, 70, 0.4);
        }
        
        .custom-alert-btn.btn-confirm:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(6, 95, 70, 0.5);
        }
        
        .custom-alert-btn.btn-cancel {
          background: #f3f4f6;
          color: #4b5563;
        }
        
        .custom-alert-btn.btn-cancel:hover {
          background: #e5e7eb;
        }
      </style>
    `;
    
    document.body.insertAdjacentHTML('beforeend', alertHTML);
    
    // Setup event listeners
    const confirmBtn = document.getElementById('customAlertConfirm');
    const cancelBtn = document.getElementById('customAlertCancel');
    
    if (confirmBtn) {
      confirmBtn.addEventListener('click', () => {
        this.hide();
        if (onConfirm) onConfirm();
      });
    }
    
    if (cancelBtn) {
      cancelBtn.addEventListener('click', () => {
        this.hide();
        if (onCancel) onCancel();
      });
    }
    
    // Auto close
    if (autoClose > 0) {
      setTimeout(() => this.hide(), autoClose);
    }
    
    // Return promise for async usage
    return new Promise((resolve) => {
      // Setup event listeners (only once)
      const confirmBtn = document.getElementById('customAlertConfirm');
      const cancelBtn = document.getElementById('customAlertCancel');
      
      if (confirmBtn) {
        confirmBtn.addEventListener('click', () => {
          this.hide();
          if (onConfirm) onConfirm();
          resolve(true);
        });
      }
      
      if (cancelBtn) {
        cancelBtn.addEventListener('click', () => {
          this.hide();
          if (onCancel) onCancel();
          resolve(false);
        });
      }
      
      // Auto close
      if (autoClose > 0) {
        setTimeout(() => {
          this.hide();
          resolve(false);
        }, autoClose);
      }
    });
  },
  
  hide() {
    const overlay = document.getElementById('customAlertOverlay');
    if (overlay) {
      const container = overlay.querySelector('.custom-alert-container');
      if (container) {
        container.style.animation = 'alertSlideOut 0.2s ease';
      }
      overlay.style.animation = 'alertFadeIn 0.2s ease reverse';
      setTimeout(() => overlay.remove(), 200);
    }
  },
  
  // Shorthand methods
  success(message, title = 'Berhasil!') {
    return this.show({ type: 'success', title, message });
  },
  
  error(message, title = 'Error!') {
    return this.show({ type: 'error', title, message });
  },
  
  warning(message, title = 'Peringatan!') {
    return this.show({ type: 'warning', title, message });
  },
  
  info(message, title = 'Informasi') {
    return this.show({ type: 'info', title, message });
  },
  
  confirm(message, title = 'Konfirmasi') {
    return new Promise((resolve) => {
      this.show({
        type: 'confirm',
        title,
        message,
        showCancel: true,
        confirmText: 'Ya, Lanjutkan',
        cancelText: 'Batal',
        onConfirm: () => resolve(true),
        onCancel: () => resolve(false)
      });
    });
  }
};

// ========================================
// LOADING OVERLAY COMPONENT
// ========================================
const LoadingOverlay = {
  show(message = "Memproses...", subMessage = "") {
    this.hide();
    
    const overlayHTML = `
      <div id="loadingOverlay" class="loading-overlay-fullscreen">
        <div class="loading-content">
          <div class="loading-spinner-container">
            <div class="loading-spinner"></div>
            <div class="loading-pulse"></div>
          </div>
          <div class="loading-message">${message}</div>
          ${subMessage ? `<div class="loading-sub-message">${subMessage}</div>` : ''}
          <div class="loading-dots">
            <span></span>
            <span></span>
            <span></span>
          </div>
        </div>
      </div>
      
      <style>
        .loading-overlay-fullscreen {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: rgba(0, 0, 0, 0.7);
          backdrop-filter: blur(4px);
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 9999;
          animation: loadingFadeIn 0.3s ease;
        }
        
        @keyframes loadingFadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes loadingFadeOut {
          from { opacity: 1; }
          to { opacity: 0; }
        }
        
        .loading-content {
          background: white;
          padding: 40px 60px;
          border-radius: 16px;
          text-align: center;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
          animation: loadingScaleIn 0.3s ease;
        }
        
        @keyframes loadingScaleIn {
          from { transform: scale(0.8); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
        
        .loading-spinner-container {
          position: relative;
          width: 80px;
          height: 80px;
          margin: 0 auto 20px;
        }
        
        .loading-spinner {
          width: 80px;
          height: 80px;
          border: 4px solid #e0f2f1;
          border-top: 4px solid #0891b2;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }
        
        .loading-pulse {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 40px;
          height: 40px;
          background: linear-gradient(135deg, #065f46, #0891b2);
          border-radius: 50%;
          animation: pulse 1.5s ease-in-out infinite;
        }
        
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        
        @keyframes pulse {
          0%, 100% { transform: translate(-50%, -50%) scale(0.8); opacity: 0.5; }
          50% { transform: translate(-50%, -50%) scale(1); opacity: 1; }
        }
        
        .loading-message {
          font-size: 18px;
          font-weight: 600;
          color: #1f2937;
          margin-bottom: 8px;
        }
        
        .loading-sub-message {
          font-size: 14px;
          color: #6b7280;
          margin-bottom: 16px;
        }
        
        .loading-dots {
          display: flex;
          justify-content: center;
          gap: 6px;
        }
        
        .loading-dots span {
          width: 8px;
          height: 8px;
          background: linear-gradient(135deg, #065f46, #0891b2);
          border-radius: 50%;
          animation: bounce 1.4s ease-in-out infinite;
        }
        
        .loading-dots span:nth-child(1) { animation-delay: 0s; }
        .loading-dots span:nth-child(2) { animation-delay: 0.2s; }
        .loading-dots span:nth-child(3) { animation-delay: 0.4s; }
        
        @keyframes bounce {
          0%, 80%, 100% { transform: translateY(0); }
          40% { transform: translateY(-12px); }
        }
      </style>
    `;
    
    document.body.insertAdjacentHTML("beforeend", overlayHTML);
  },
  
  hide() {
    const overlay = document.getElementById("loadingOverlay");
    if (overlay) {
      overlay.style.animation = "loadingFadeOut 0.2s ease";
      setTimeout(() => overlay.remove(), 200);
    }
  },
  
  updateMessage(message, subMessage = "") {
    const msgEl = document.querySelector(".loading-message");
    const subMsgEl = document.querySelector(".loading-sub-message");
    if (msgEl) msgEl.textContent = message;
    if (subMsgEl) {
      if (subMessage) {
        subMsgEl.textContent = subMessage;
        subMsgEl.style.display = "block";
      } else {
        subMsgEl.style.display = "none";
      }
    }
  }
};

// ========================================
// TOAST NOTIFICATION SYSTEM
// ========================================
const Toast = {
  show(message, type = 'info', duration = 3000) {
    // Remove existing toast
    const existing = document.getElementById('toastNotification');
    if (existing) existing.remove();
    
    const colors = {
      success: { bg: 'linear-gradient(135deg, #065f46, #10b981)', icon: 'bi-check-circle-fill' },
      error: { bg: 'linear-gradient(135deg, #dc2626, #ef4444)', icon: 'bi-x-circle-fill' },
      warning: { bg: 'linear-gradient(135deg, #d97706, #f59e0b)', icon: 'bi-exclamation-triangle-fill' },
      info: { bg: 'linear-gradient(135deg, #065f46, #0891b2)', icon: 'bi-info-circle-fill' }
    };
    
    const color = colors[type] || colors.info;
    
    const toastHTML = `
      <div id="toastNotification" class="toast-notification" style="background: ${color.bg};">
        <i class="bi ${color.icon}"></i>
        <span>${message}</span>
      </div>
      
      <style>
        .toast-notification {
          position: fixed;
          top: 20px;
          right: 20px;
          padding: 16px 24px;
          border-radius: 12px;
          color: white;
          font-weight: 500;
          font-size: 14px;
          display: flex;
          align-items: center;
          gap: 12px;
          box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
          z-index: 10001;
          animation: toastSlideIn 0.4s ease;
        }
        
        .toast-notification i {
          font-size: 20px;
        }
        
        @keyframes toastSlideIn {
          from { 
            transform: translateX(100%);
            opacity: 0;
          }
          to { 
            transform: translateX(0);
            opacity: 1;
          }
        }
        
        @keyframes toastSlideOut {
          from { 
            transform: translateX(0);
            opacity: 1;
          }
          to { 
            transform: translateX(100%);
            opacity: 0;
          }
        }
      </style>
    `;
    
    document.body.insertAdjacentHTML('beforeend', toastHTML);
    
    // Auto remove
    setTimeout(() => {
      const toast = document.getElementById('toastNotification');
      if (toast) {
        toast.style.animation = 'toastSlideOut 0.4s ease';
        setTimeout(() => toast.remove(), 400);
      }
    }, duration);
  },
  
  success(message) { this.show(message, 'success'); },
  error(message) { this.show(message, 'error'); },
  warning(message) { this.show(message, 'warning'); },
  info(message) { this.show(message, 'info'); }
};

// ========================================
// ANTRIAN FRAGMENT CLASS
// ========================================
class AntrianFragment {
  constructor() {
    this.title = "Antrian";
    this.icon = "bi-clock-history";
    this.queues = [];
    this.patients = [];
    this.currentDoctorId = null;
    this.currentDoctorName = "";
    this.apiUrl = "../API/auth/antrian.php";
    this.profileApiUrl = "../API/auth/profile.php";
    this.selectedPatientId = null;
    this.satusehatChecked = false;
    this.currentQueueData = null;
    this.isProcessing = false;
    
    // Payment properties
    this.currentPaymentQueue = null;
    this.paymentData = null;
    this.paymentMethod = 'cash';
  }

  render() {
    return `
      <div>
        <div class="d-flex justify-content-between align-items-center mb-4">
          <div>
            <h2 class="mb-1">Antrian Pasien</h2>
            <p class="text-muted mb-0" id="doctorInfo">
              <i class="bi bi-person-circle me-1"></i>Loading...
            </p>
          </div>
          <button class="btn btn-custom-teal" id="addQueueBtn">
            <i class="bi bi-plus-circle me-2"></i>Tambah Antrian Baru
          </button>
        </div>

        <div class="card shadow-sm border-0 mb-3">
          <div class="card-body">
            <div class="row g-3">
              <div class="col-md-4">
                <label class="form-label">Tanggal</label>
                <input type="date" class="form-control" id="filterDate" value="${
                  new Date().toISOString().split("T")[0]
                }">
              </div>
              <div class="col-md-3">
                <label class="form-label">Jam Mulai</label>
                <input type="time" class="form-control" id="filterStartTime" value="00:00">
              </div>
              <div class="col-md-3">
                <label class="form-label">Jam Akhir</label>
                <input type="time" class="form-control" id="filterEndTime" value="23:59">
              </div>
              <div class="col-md-2 d-flex align-items-end">
                <button class="btn btn-custom-teal w-100" id="applyFilterBtn">
                  <i class="bi bi-search me-2"></i>Filter
                </button>
              </div>
            </div>
          </div>
        </div>
        
        <div class="card shadow-sm border-0">
          <div class="card-header bg-white border-bottom">
            <div class="d-flex justify-content-between align-items-center">
              <span class="fw-bold">ANTRIAN SAYA</span>
              <div>
                <span class="badge bg-primary me-2" id="queueCount">0 Antrian</span>
                <button class="btn btn-sm btn-outline-secondary" id="refreshBtn">
                  <i class="bi bi-arrow-clockwise me-1"></i>Refresh
                </button>
              </div>
            </div>
          </div>
          <div class="card-body p-0">
            <div class="table-responsive">
              <table class="table table-hover mb-0">
                <thead class="bg-light">
                  <tr>
                    <th class="text-success">NO ANTRIAN</th>
                    <th class="text-success">TANGGAL</th>
                    <th class="text-success">JAM</th>
                    <th class="text-success">NAMA PASIEN</th>
                    <th class="text-success">NIK</th>
                    <th class="text-success">JENIS</th>
                    <th class="text-success">SATUSEHAT</th>
                    <th class="text-success">STATUS</th>
                    <th class="text-success">AKSI</th>
                  </tr>
                </thead>
                <tbody id="queueTableBody">
                  <tr>
                    <td colspan="9" class="text-center py-4">
                      <div class="spinner-border text-primary" role="status"></div>
                      <p class="mt-2">Loading data...</p>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      <!-- ADD QUEUE MODAL -->
      <div class="modal fade" id="addQueueModal" tabindex="-1">
        <div class="modal-dialog modal-lg">
          <div class="modal-content modal-content-antrian">
            <div class="modal-header">
              <h5 class="modal-title">
                <i class="bi bi-plus-circle me-2"></i>Tambah Antrian Baru
              </h5>
              <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
            </div>
            <div class="modal-body">
              <form id="addQueueForm">
                <div class="mb-3">
                  <label class="form-label">Cari Pasien <span class="text-danger">*</span></label>
                  <div class="input-group">
                    <input type="text" class="form-control" id="patientSearch" placeholder="Ketik nama atau NIK pasien...">
                    <button class="btn btn-outline-secondary" type="button" id="searchPatientBtn">
                      <i class="bi bi-search"></i> Cari
                    </button>
                  </div>
                  <small class="text-muted">Ketik minimal 3 karakter</small>
                </div>

                <div class="mb-3" id="patientSelectContainer" style="display: none;">
                  <label class="form-label">Pilih Pasien <span class="text-danger">*</span></label>
                  <select class="form-select" id="patientSelect" required>
                    <option value="">-- Pilih Pasien --</option>
                  </select>
                </div>

                <div class="alert alert-info" id="selectedPatientInfo" style="display: none;">
                  <strong><i class="bi bi-person-check me-2"></i>Pasien Terpilih:</strong>
                  <div id="patientInfoText" class="mt-2"></div>
                </div>

                <div class="mb-4" id="jenisPatienContainer" style="display: none;">
                  <label class="form-label fw-bold">Jenis Pasien <span class="text-danger">*</span></label>
                  <div class="d-flex gap-4">
                    <div class="form-check form-check-custom">
                      <input class="form-check-input" type="radio" name="jenis_pasien" id="jenisBPJS" value="BPJS" required>
                      <label class="form-check-label" for="jenisBPJS">
                        <i class="bi bi-shield-check text-primary me-1"></i>
                        <strong>BPJS</strong>
                      </label>
                    </div>
                    <div class="form-check form-check-custom">
                      <input class="form-check-input" type="radio" name="jenis_pasien" id="jenisUMUM" value="UMUM" required>
                      <label class="form-check-label" for="jenisUMUM">
                        <i class="bi bi-wallet2 text-success me-1"></i>
                        <strong>UMUM</strong>
                      </label>
                    </div>
                  </div>
                </div>

                <div class="alert alert-warning" id="satusehatCheckStatus" style="display: none;">
                  <div class="d-flex align-items-center">
                    <div class="spinner-border spinner-border-sm me-2" role="status"></div>
                    <span>Memeriksa SATUSEHAT...</span>
                  </div>
                </div>

                <div class="alert alert-success" id="satusehatFoundAlert" style="display: none;">
                  <i class="bi bi-check-circle-fill me-2"></i>
                  <strong>Pasien terdaftar di SATUSEHAT</strong>
                  <div id="satusehatIdText" class="mt-2"></div>
                </div>

                <div class="alert alert-info" id="satusehatNotFoundAlert" style="display: none;">
                  <i class="bi bi-info-circle-fill me-2"></i>
                  <strong>Pasien belum terdaftar di SATUSEHAT</strong>
                  <p class="mb-0 mt-2">Antrian tetap dapat dibuat tanpa ID SATUSEHAT</p>
                </div>

                <hr>

                <div class="row">
                  <div class="col-md-6">
                    <div class="mb-3">
                      <label class="form-label">Tanggal Antrian <span class="text-danger">*</span></label>
                      <input type="date" class="form-control" id="queueDate" required value="${
                        new Date().toISOString().split("T")[0]
                      }">
                    </div>
                  </div>
                  <div class="col-md-6">
                    <div class="mb-3">
                      <label class="form-label">Jam Antrian <span class="text-danger">*</span></label>
                      <input type="time" class="form-control" id="queueTime" required>
                    </div>
                  </div>
                </div>

                <div class="mb-3">
                  <label class="form-label">No Antrian (Auto)</label>
                  <input type="text" class="form-control bg-light" id="queueNumber" placeholder="Auto-generated..." readonly required>
                  <small class="text-muted">Format: [Nomor][Tanggal] - Contoh: 1081025</small>
                </div>

                <input type="hidden" id="selectedPatientId">
              </form>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">
                <i class="bi bi-x-circle me-2"></i>Batal
              </button>
              <button type="button" class="btn btn-custom-teal" id="saveQueueBtn">
                <i class="bi bi-save me-2"></i>Simpan
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- ACTION QUEUE MODAL (Detail Pasien) -->
      <div class="modal fade" id="actionQueueModal" tabindex="-1">
        <div class="modal-dialog modal-lg">
          <div class="modal-content modal-content-antrian">
            <div class="modal-header bg-primary text-white">
              <h5 class="modal-title">
                <i class="bi bi-person-lines-fill me-2"></i>Detail Antrian Pasien
              </h5>
              <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
            </div>
            <div class="modal-body">
              
              <div class="card border-0 bg-light mb-3">
                <div class="card-body">
                  <div class="row g-3">
                    <div class="col-md-6">
                      <label class="text-muted small mb-1">No. Antrian</label>
                      <h4 class="text-primary mb-0" id="detailNoAntrian">-</h4>
                    </div>
                    <div class="col-md-6">
                      <label class="text-muted small mb-1">Status Antrian</label>
                      <div id="detailStatusAntrian"></div>
                    </div>
                  </div>
                </div>
              </div>

              <div class="row g-3 mb-3">
                <div class="col-md-6">
                  <label class="text-muted small mb-1"><i class="bi bi-person-fill me-1"></i>Nama Pasien</label>
                  <p class="fw-bold mb-0" id="detailNamaPasien">-</p>
                </div>
                <div class="col-md-6">
                  <label class="text-muted small mb-1"><i class="bi bi-calendar3 me-1"></i>Umur</label>
                  <p class="fw-bold mb-0" id="detailUmurPasien">-</p>
                </div>
              </div>

              <div class="row g-3 mb-3">
                <div class="col-md-6">
                  <label class="text-muted small mb-1"><i class="bi bi-credit-card me-1"></i>NIK</label>
                  <p class="mb-0" id="detailNikPasien">-</p>
                </div>
                <div class="col-md-6">
                  <label class="text-muted small mb-1"><i class="bi bi-telephone-fill me-1"></i>No. Telepon</label>
                  <p class="mb-0" id="detailTelpPasien">-</p>
                </div>
              </div>

              <div class="row g-3 mb-3">
                <div class="col-md-6">
                  <label class="text-muted small mb-1"><i class="bi bi-calendar-event me-1"></i>Tanggal Antrian</label>
                  <p class="mb-0" id="detailTanggalAntrian">-</p>
                </div>
                <div class="col-md-6">
                  <label class="text-muted small mb-1"><i class="bi bi-clock-fill me-1"></i>Jam Antrian</label>
                  <p class="mb-0" id="detailJamAntrian">-</p>
                </div>
              </div>

              <hr>

              <!-- SATUSEHAT Registration Section -->
              <div class="alert alert-warning" id="satusehatNotRegistered" style="display: none;">
                <div class="d-flex justify-content-between align-items-center">
                  <div>
                    <i class="bi bi-exclamation-triangle-fill me-2"></i>
                    <strong>Pasien belum terdaftar di SATUSEHAT</strong>
                    <p class="mb-0 mt-1 small">Harap daftarkan pasien terlebih dahulu untuk melanjutkan</p>
                  </div>
                  <button class="btn btn-warning btn-sm" id="registerSatusehatBtn">
                    <i class="bi bi-plus-circle me-1"></i>Daftar SATUSEHAT
                  </button>
                </div>
              </div>

              <div class="alert alert-info" id="satusehatProcessing" style="display: none;">
                <div class="d-flex align-items-center">
                  <div class="spinner-border spinner-border-sm me-2" role="status"></div>
                  <span>Sedang mendaftarkan ke SATUSEHAT...</span>
                </div>
              </div>

              <div class="alert alert-success" id="satusehatRegistered" style="display: none;">
                <i class="bi bi-check-circle-fill me-2"></i>
                <strong>Pasien terdaftar di SATUSEHAT</strong>
                <div id="detailSatusehatIdText" class="mt-2"></div>
              </div>

              <hr>

              <!-- Jenis Pasien Selection -->
              <div class="mb-4">
                <label class="form-label fw-bold">
                  <i class="bi bi-clipboard-check me-2"></i>Konfirmasi Jenis Pasien <span class="text-danger">*</span>
                </label>
                <div class="d-flex gap-4">
                  <div class="form-check form-check-custom">
                    <input class="form-check-input" type="radio" name="confirm_jenis_pasien" id="confirmBPJS" value="BPJS">
                    <label class="form-check-label" for="confirmBPJS">
                      <i class="bi bi-shield-check text-primary me-1"></i>
                      <strong>BPJS</strong>
                    </label>
                  </div>
                  <div class="form-check form-check-custom">
                    <input class="form-check-input" type="radio" name="confirm_jenis_pasien" id="confirmUMUM" value="UMUM">
                    <label class="form-check-label" for="confirmUMUM">
                      <i class="bi bi-wallet2 text-success me-1"></i>
                      <strong>UMUM</strong>
                    </label>
                  </div>
                </div>
                <small class="text-muted d-block mt-2" id="jenisAsliText">Jenis saat mendaftar: <span class="fw-bold">-</span></small>
              </div>

            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-danger" id="tolakQueueBtn">
                <i class="bi bi-x-circle me-2"></i>Tolak
              </button>
              <button type="button" class="btn btn-success" id="terimaQueueBtn">
                <i class="bi bi-check-circle me-2"></i>Terima
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- 💳 ENHANCED PAYMENT MODAL WITH QRIS -->
      <div class="modal fade" id="paymentModal" tabindex="-1">
        <div class="modal-dialog modal-xl">
          <div class="modal-content">
            <div class="modal-header bg-gradient-teal text-white">
              <h5 class="modal-title">
                <i class="bi bi-cash-coin me-2"></i>Form Pembayaran
              </h5>
              <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
            </div>
            <div class="modal-body p-4" style="background-color: #f8f9fa;">
              
              <!-- Success Animation Overlay -->
              <div id="paymentSuccessOverlay" style="display: none; position: fixed; top: 0; left: 0; right: 0; bottom: 0; background-color: rgba(0,0,0,0.7); z-index: 9999; align-items: center; justify-content: center;">
                <div style="background-color: white; padding: 3rem; border-radius: 1rem; text-align: center;">
                  <i class="bi bi-check-circle-fill text-success" style="font-size: 5rem;"></i>
                  <h2 class="mt-3 text-success">Pembayaran Berhasil!</h2>
                </div>
              </div>

              <!-- Patient Type Selection -->
              <div class="card mb-3">
                <div class="card-body">
                  <h6 class="card-title mb-3">
                    <i class="bi bi-person me-2"></i>Jenis Pasien
                  </h6>
                  <div class="d-flex gap-3">
                    <button type="button" class="btn btn-outline-primary flex-fill patient-type-btn" data-type="BPJS">
                      <i class="bi bi-shield-check me-2"></i>BPJS (Gratis)
                    </button>
                    <button type="button" class="btn btn-outline-success flex-fill patient-type-btn" data-type="UMUM">
                      <i class="bi bi-wallet2 me-2"></i>UMUM
                    </button>
                  </div>
                </div>
              </div>

              <div class="row g-3 mb-3">
                <!-- Left Panel - Patient Details -->
                <div class="col-md-6">
                  <div class="card h-100">
                    <div class="card-body">
                      <h6 class="card-title border-bottom border-primary pb-2 mb-3">Detail Pasien</h6>
                      <div class="mb-2">
                        <small class="text-muted">Nama:</small>
                        <div class="fw-bold" id="paymentPatientName">-</div>
                      </div>
                      <div class="mb-2">
                        <small class="text-muted">No. Antrian:</small>
                        <div class="fw-bold text-primary" id="paymentQueueNumber">-</div>
                      </div>
                      <div class="mb-3">
                        <small class="text-muted">Jenis Pasien:</small>
                        <div id="paymentPatientType">-</div>
                      </div>
                      <hr>
                      <div class="d-flex justify-content-between align-items-center">
                        <span class="fw-bold">Total Tagihan:</span>
                        <span class="fs-4 fw-bold text-primary" id="paymentGrandTotal">Rp 0</span>
                      </div>

                      <!-- Payment Method Selection (Only for UMUM) -->
                      <div id="paymentMethodContainer" style="display: none;">
                        <h6 class="card-title border-bottom border-success pb-2 mt-4 mb-3">Metode Pembayaran</h6>
                        <div class="d-flex gap-2">
                          <button type="button" class="btn btn-outline-success flex-fill payment-method-btn" data-method="cash">
                            <i class="bi bi-wallet2 me-2"></i>Cash
                          </button>
                          <button type="button" class="btn btn-outline-success flex-fill payment-method-btn" data-method="qris">
                            <i class="bi bi-qr-code me-2"></i>QRIS
                          </button>
                        </div>
                      </div>

                      <!-- BPJS Info -->
                      <div id="bpjsInfoContainer" style="display: none;">
                        <div class="alert alert-info mt-3 mb-0">
                          <div class="d-flex align-items-center mb-2">
                            <i class="bi bi-shield-check me-2"></i>
                            <strong>Pasien BPJS</strong>
                          </div>
                          <small>
                            ✅ Pembayaran ditanggung oleh BPJS<br>
                            ✅ Tidak ada biaya yang harus dibayar<br>
                            ✅ Klik tombol "Proses Pembayaran" untuk menyelesaikan
                          </small>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Right Panel - Payment Input OR QRIS Display -->
                <div class="col-md-6">
                  <div class="card h-100">
                    <div class="card-body">
                      <!-- Cash Payment Input -->
                      <div id="paymentInputContainer">
                        <h6 class="card-title border-bottom border-success pb-2 mb-3">Input Pembayaran</h6>
                        <div class="mb-3">
                          <label class="form-label fw-bold">Jumlah Uang:</label>
                          <input type="number" class="form-control form-control-lg" id="paymentAmount" placeholder="Masukkan jumlah uang...">
                        </div>
                        <div class="mb-0">
                          <label class="form-label fw-bold">Kembalian:</label>
                          <div class="alert alert-success mb-0 py-2">
                            <h4 class="mb-0 text-success" id="paymentChange">Rp 0</h4>
                          </div>
                        </div>
                      </div>

                      <!-- QRIS Display (Hidden by default) -->
                      <div id="qrisDisplayContainer" style="display: none;">
                        <h6 class="card-title border-bottom border-success pb-2 mb-3">
                          <i class="bi bi-qr-code-scan me-2"></i>Scan QRIS untuk Pembayaran
                        </h6>
                        <div class="text-center">
                          <div class="bg-white p-4 rounded d-inline-block shadow-sm mb-3" style="border: 3px solid #10b981;">
                            <img id="qrisPaymentImage" src="" alt="QRIS Code" style="max-width: 280px; max-height: 200px; display: none;">
                            <div id="qrisLoadingSpinner" class="text-center py-5">
                              <div class="spinner-border text-success" role="status" style="width: 3rem; height: 3rem;">
                                <span class="visually-hidden">Loading...</span>
                              </div>
                              <p class="mt-3 text-muted">Memuat QRIS...</p>
                            </div>
                            <div id="qrisNotAvailable" style="display: none;" class="text-center py-5">
                              <i class="bi bi-exclamation-triangle text-warning" style="font-size: 3rem;"></i>
                              <p class="mt-3 text-muted">QRIS belum tersedia</p>
                              <small class="text-muted">Upload QRIS di halaman Profil</small>
                            </div>
                          </div>
                          <div class="alert alert-info mb-0">
                            <small>
                              <i class="bi bi-info-circle me-1"></i>
                              <strong>Total: Rp <span id="qrisTotalAmount">0</span></strong><br>
                              Scan QR code di atas menggunakan aplikasi e-wallet Anda
                            </small>
                          </div>
                        </div>
                      </div>

                      <!-- BPJS Placeholder -->
                      <div id="bpjsPlaceholder" style="display: none;" class="d-flex flex-column align-items-center justify-content-center h-1 text-center text-primary">
                        <i class="bi bi-shield-check" style="font-size: 4rem;"></i>
                        <p class="mt-3">Pasien BPJS tidak memerlukan<br>input pembayaran</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Drug Table -->
              <div class="card mb-3">
                <div class="card-body">
                  <h6 class="card-title border-bottom border-primary pb-2 mb-3">Detail Obat & Jasa</h6>
                  <div class="table-responsive">
                    <table class="table table-hover">
                      <thead class="table-primary">
                        <tr>
                          <th>Nama Obat</th>
                          <th>Jenis</th>
                          <th class="text-center">Jumlah</th>
                          <th>Signa</th>
                          <th class="text-end">Harga Obat</th>
                          <th class="text-end">Harga Jasa</th>
                          <th class="text-end">Total</th>
                        </tr>
                      </thead>
                      <tbody id="paymentDrugTableBody">
                        <tr>
                          <td colspan="7" class="text-center">Memuat data...</td>
                        </tr>
                      </tbody>
                      <tfoot class="table-light">
                        <tr>
                          <td colspan="6" class="text-end fw-bold">TOTAL TAGIHAN:</td>
                          <td class="text-end fw-bold text-primary fs-5" id="paymentTableTotal">Rp 0</td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                </div>
              </div>

            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">
                <i class="bi bi-x-circle me-2"></i>Batal
              </button>
              <button type="button" class="btn btn-primary" id="previewBillBtn">
                <i class="bi bi-printer me-2"></i>Preview Tagihan
              </button>
              <button type="button" class="btn btn-success" id="processPaymentBtn">
                <i class="bi bi-check-circle me-2"></i>Bayar
              </button>
            </div>
          </div>
        </div>
      </div>

      <style>
      /* Fix modal appearance */
      #addQueueModal .modal-dialog,
      #actionQueueModal .modal-dialog {
        max-width: 800px;
        margin: 1.75rem auto;
      }
      
      #addQueueModal .modal-content-antrian,
      #actionQueueModal .modal-content-antrian {
        border-radius: 12px;
        border: none;
        box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.15);
      }
      
      #addQueueModal .modal-header,
      #actionQueueModal .modal-header {
        background: linear-gradient(135deg, #065f46 0%, #0891b2 100%);
        border-radius: 12px 12px 0 0;
        padding: 1rem 1.5rem;
        border-bottom: none;
      }
      
      #addQueueModal .modal-title,
      #actionQueueModal .modal-title {
        font-size: 1.25rem;
        font-weight: 500;
        color: white;
      }
      
      #addQueueModal .btn-close,
      #actionQueueModal .btn-close {
        filter: brightness(0) invert(1);
        opacity: 0.8;
      }
      
      #addQueueModal .btn-close:hover,
      #actionQueueModal .btn-close:hover {
        opacity: 1;
      }
      
      #addQueueModal .modal-body,
      #actionQueueModal .modal-body {
        padding: 1.5rem;
        background-color: #f8f9fa;
      }
      
      #addQueueModal .modal-footer,
      #actionQueueModal .modal-footer {
        padding: 1rem 1.5rem;
        border-top: 1px solid #dee2e6;
        background-color: #f8f9fa;
        border-radius: 0 0 12px 12px;
      }
      
      /* Remove double border from form controls */
      #addQueueModal .form-control,
      #actionQueueModal .form-control,
      #addQueueModal .form-select,
      #actionQueueModal .form-select {
        border: 1px solid #ced4da;
        border-radius: 0.375rem;
      }
      
      #addQueueModal .form-control:focus,
      #actionQueueModal .form-control:focus,
      #addQueueModal .form-select:focus,
      #actionQueueModal .form-select:focus {
        border-color: #0891b2;
        box-shadow: 0 0 0 0.25rem rgba(8, 145, 178, 0.25);
      }

      .btn-custom-teal { 
        background: linear-gradient(135deg, #065f46 0%, #0891b2 100%); 
        color: white; 
        border: none;
        border-radius: 0.375rem;
        padding: 0.5rem 1rem;
        font-weight: 500;
        transition: all 0.2s;
      }
      .btn-custom-teal:hover { 
        background: linear-gradient(135deg, #064e3b 0%, #0e7490 100%); 
        color: white;
        transform: translateY(-1px);
        box-shadow: 0 4px 12px rgba(6, 95, 70, 0.3);
      }
      
      .btn-action { 
        background: linear-gradient(135deg, #065f46 0%, #0891b2 100%); 
        color: white; 
        border: none; 
        padding: 6px 24px; 
        border-radius: 20px; 
        font-size: 0.85rem;
        transition: all 0.2s;
      }
      .btn-action:hover { 
        background: linear-gradient(135deg, #064e3b 0%, #0e7490 100%); 
        color: white;
        transform: translateY(-1px);
      }
      
      .badge-status { 
        padding: 6px 16px; 
        border-radius: 20px; 
        font-size: 0.85rem; 
        font-weight: 500; 
      }
      .status-belum-periksa { background-color: #ffc107; color: #000; }
      .status-di-terima { background-color: #17a2b8; color: white; }
      .status-sedang-periksa { background-color: #0dcaf0; color: #000; }
      .status-selesai-periksa { background-color: #198754; color: white; }
      .status-batal { background-color: #dc3545; color: white; }
      
      .table thead th { font-weight: 600; font-size: 0.85rem; padding: 1rem; }
      .table tbody td { padding: 1rem; vertical-align: middle; }
      
      .badge-satusehat { padding: 4px 12px; border-radius: 12px; font-size: 0.75rem; }
      .satusehat-registered { background-color: #10b981; color: white; }
      .satusehat-not-registered { background-color: #6c757d; color: white; }
      
      .badge-jenis { padding: 6px 14px; border-radius: 20px; font-size: 0.8rem; font-weight: 600; }
      .jenis-bpjs { background: linear-gradient(135deg, #065f46 0%, #0891b2 100%); color: white; }
      .jenis-umum { background-color: #10b981; color: white; }
      
      .form-check-custom .form-check-input { width: 20px; height: 20px; margin-top: 2px; }
      .form-check-custom .form-check-label { font-size: 1.1rem; cursor: pointer; }

      /* ✅ SKELETON LOADER STYLES */
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
        margin-bottom: 0;
        border-radius: 4px;
      }

      .skeleton-badge {
        height: 24px;
        width: 80px;
        border-radius: 12px;
        display: inline-block;
      }

      .skeleton-button {
        height: 32px;
        width: 80px;
        border-radius: 20px;
        display: inline-block;
      }

      /* Payment Modal Styles */
      .bg-gradient-teal {
        background: linear-gradient(135deg, #065f46 0%, #0891b2 100%);
      }
      
      .patient-type-btn.active {
        background-color: var(--bs-primary);
        color: white;
        border-color: var(--bs-primary);
      }
      .patient-type-btn.active[data-type="BPJS"] {
        background: linear-gradient(135deg, #065f46 0%, #0891b2 100%);
        border-color: #065f46;
      }
      .patient-type-btn.active[data-type="UMUM"] {
        background-color: #10b981;
        border-color: #10b981;
      }
      .payment-method-btn.active {
        background-color: #10b981;
        color: white;
        border-color: #10b981;
      }
    </style>
    `;
  }

  // ========================================
  // ✅ SKELETON GENERATOR FUNCTIONS
  // ========================================

  generateQueueTableSkeleton(rows = 5) {
    return Array(rows).fill(0).map(() => `
      <tr>
        <td><div class="skeleton skeleton-text" style="width: 80px; margin: 0 auto;"></div></td>
        <td><div class="skeleton skeleton-text" style="width: ${70 + Math.random() * 20}%;"></div></td>
        <td><div class="skeleton skeleton-text" style="width: 60px;"></div></td>
        <td><div class="skeleton skeleton-text" style="width: ${60 + Math.random() * 30}%;"></div></td>
        <td><div class="skeleton skeleton-text" style="width: ${60 + Math.random() * 20}%;"></div></td>
        <td><div class="skeleton skeleton-badge"></div></td>
        <td><div class="skeleton skeleton-badge"></div></td>
        <td><div class="skeleton skeleton-badge"></div></td>
        <td class="text-center"><div class="skeleton skeleton-button" style="margin: 0 auto;"></div></td>
      </tr>
    `).join('');
  }

  generatePaymentDrugSkeleton(rows = 3) {
    return Array(rows).fill(0).map(() => `
      <tr>
        <td><div class="skeleton skeleton-text" style="width: ${60 + Math.random() * 30}%;"></div></td>
        <td><div class="skeleton skeleton-text" style="width: 70px;"></div></td>
        <td class="text-center"><div class="skeleton skeleton-text" style="width: 30px; margin: 0 auto;"></div></td>
        <td><div class="skeleton skeleton-text" style="width: ${50 + Math.random() * 30}%;"></div></td>
        <td class="text-end"><div class="skeleton skeleton-text" style="width: 90px; margin-left: auto;"></div></td>
        <td class="text-end"><div class="skeleton skeleton-text" style="width: 90px; margin-left: auto;"></div></td>
        <td class="text-end"><div class="skeleton skeleton-text" style="width: 100px; margin-left: auto;"></div></td>
      </tr>
    `).join('');
  }

  renderQueueRows() {
    // Filter out "Belum Periksa" status
    const filteredQueues = this.queues.filter(
      (queue) =>
        queue.status_antrian === "Belum Periksa" ||
        queue.status_antrian === "Selesai Periksa"
    );

    if (filteredQueues.length === 0) {
      return `
        <tr>
          <td colspan="9" class="text-center py-5">
            <i class="bi bi-inbox fs-1 text-muted"></i>
            <p class="text-muted mt-3">Belum ada antrian yang ditampilkan</p>
          </td>
        </tr>
      `;
    }

    return filteredQueues
      .map((queue) => {
        const statusClass = `status-${queue.status_antrian
          .toLowerCase()
          .replace(" ", "-")}`;
        const patientName = queue.nama ?? "-";
        const patientNik = queue.nik ?? "-";

        const jenisPasien = queue.jenis_pasien || "UMUM";
        const jenisBadgeClass =
          jenisPasien === "BPJS" ? "jenis-bpjs" : "jenis-umum";
        const jenisIcon =
          jenisPasien === "BPJS" ? "bi-shield-check" : "bi-wallet2";
        const jenisBadge = `<span class="badge badge-jenis ${jenisBadgeClass}"><i class="bi ${jenisIcon} me-1"></i>${jenisPasien}</span>`;

        const satusehatBadge = queue.id_satusehat
          ? `<span class="badge badge-satusehat satusehat-registered"><i class="bi bi-check-circle me-1"></i>Terdaftar</span>`
          : `<span class="badge badge-satusehat satusehat-not-registered"><i class="bi bi-x-circle me-1"></i>Belum</span>`;

        // Change button based on status
        let actionButton;
        if (queue.status_antrian === "Selesai Periksa") {
          actionButton = `<button class="btn btn-success btn-sm" onclick="window.currentFragment.showPaymentModal('${queue.id_antrian}')">
          <i class="bi bi-cash-coin me-1"></i>BAYAR
        </button>`;
        } else {
          actionButton = `<button class="btn btn-action btn-sm" onclick="window.currentFragment.showActionModal('${queue.id_antrian}')">AKSI</button>`;
        }

        return `
        <tr>
          <td><strong class="text-primary fs-5">${queue.no_antrian}</strong></td>
          <td>${queue.tanggal_antrian}</td>
          <td><strong>${queue.jam_antrian}</strong></td>
          <td>${patientName}</td>
          <td><small>${patientNik}</small></td>
          <td>${jenisBadge}</td>
          <td>${satusehatBadge}</td>
          <td><span class="badge badge-status ${statusClass}">${queue.status_antrian}</span></td>
          <td>${actionButton}</td>
        </tr>
      `;
      })
      .join("");
  }

  async onInit() {
    console.log("🎬 Antrian Fragment Initialized with Custom Alerts & Loading States");
    window.currentFragment = this;

    await this.loadCurrentDoctor();
    await this.loadQueues();
    this.setupEventListeners();

    setTimeout(() => {
      const now = new Date();
      const currentTime =
        now.getHours().toString().padStart(2, "0") +
        ":" +
        now.getMinutes().toString().padStart(2, "0");
      const timeInput = document.getElementById("queueTime");
      if (timeInput) timeInput.value = currentTime;
    }, 100);

    console.log("✅ Initialization complete");
  }

  async loadCurrentDoctor() {
    console.log("👨‍⚕️ Loading current doctor profile...");

    try {
      // ✅ FIX 1: Check cache first
      const cached = localStorage.getItem('currentDokterId');
      const cachedName = localStorage.getItem('currentDoctorName');
      
      if (cached && cachedName) {
        this.currentDoctorId = cached;
        this.currentDoctorName = cachedName;
        console.log('✅ Using cached doctor:', this.currentDoctorName, '(ID:', cached, ')');
        
        const doctorInfo = document.getElementById("doctorInfo");
        if (doctorInfo) {
          doctorInfo.innerHTML = `<i class="bi bi-person-circle me-1"></i>Antrian untuk: <strong>Dr. ${this.currentDoctorName}</strong>`;
        }
        return;
      }

      // ✅ FIX 2: Get user data
      const user = JSON.parse(localStorage.getItem("user") || '{}');
      const userEmail = user.email;

      if (!userEmail) {
        console.error("❌ No user email found in session");
        CustomAlert.error("Anda belum login. Silakan login terlebih dahulu.", "Sesi Tidak Valid");
        return;
      }

      console.log("📧 User email:", userEmail);

      // ✅ FIX 3: Wait for Supabase to be ready
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

      // ✅ FIX 4: Try to find doctor first
      console.log('🔍 Checking dokter table...');
      const { data: dokter, error: dokterError } = await window.supabaseClient
        .from('dokter')
        .select('id_dokter, nama_lengkap, email')
        .ilike('email', userEmail)
        .maybeSingle();

      if (dokter && !dokterError) {
        // User is a doctor
        this.currentDoctorId = dokter.id_dokter;
        this.currentDoctorName = dokter.nama_lengkap;
        
        // Cache the results
        localStorage.setItem('currentDokterId', this.currentDoctorId);
        localStorage.setItem('currentDoctorName', this.currentDoctorName);
        localStorage.setItem('userRole', 'dokter');
        
        console.log('✅ Found doctor:', dokter.nama_lengkap, '(ID:', dokter.id_dokter, ')');
        
        const doctorInfo = document.getElementById("doctorInfo");
        if (doctorInfo) {
          doctorInfo.innerHTML = `<i class="bi bi-person-circle me-1"></i>Antrian untuk: <strong>Dr. ${this.currentDoctorName}</strong>`;
        }
        return;
      }

      // ✅ FIX 5: If not found in dokter table, check asisten_dokter table
      console.log('🔍 Not found in dokter table, checking asisten_dokter table...');
      const { data: asisten, error: asistenError } = await window.supabaseClient
        .from('asisten_dokter')
        .select('id_dokter, nama_lengkap, email, dokter:id_dokter(id_dokter, nama_lengkap)')
        .ilike('email', userEmail)
        .maybeSingle();

      console.log('📋 Asisten query result:', asisten);
      console.log('❌ Asisten query error:', asistenError);

      if (asisten && !asistenError && asisten.dokter) {
        // User is an assistant doctor - use supervising doctor's ID
        this.currentDoctorId = asisten.dokter.id_dokter;
        this.currentDoctorName = asisten.dokter.nama_lengkap;
        
        // Cache the results
        localStorage.setItem('currentDokterId', this.currentDoctorId);
        localStorage.setItem('currentDoctorName', this.currentDoctorName);
        localStorage.setItem('userRole', 'asisten_dokter');
        localStorage.setItem('asistenName', asisten.nama_lengkap);
        
        console.log('✅ Found assistant doctor:', asisten.nama_lengkap);
        console.log('✅ Supervising doctor:', this.currentDoctorName, '(ID:', this.currentDoctorId, ')');
        
        const doctorInfo = document.getElementById("doctorInfo");
        if (doctorInfo) {
          doctorInfo.innerHTML = `<i class="bi bi-person-circle me-1"></i>Asisten: <strong>${asisten.nama_lengkap}</strong> | Dokter: <strong>Dr. ${this.currentDoctorName}</strong>`;
        }
        return;
      }

      // ✅ If neither found, show error
      console.error("❌ No doctor or assistant found with email:", userEmail);
      CustomAlert.warning(
        `Email yang dicari: ${userEmail}\n\nPastikan email Anda sesuai dengan data di database.\nCoba login ulang atau hubungi administrator.`,
        "Data Tidak Ditemukan"
      );

    } catch (error) {
      console.error("❌ Error loading doctor:", error);
      CustomAlert.error(error.message, "Error");
    }
  }

  setupEventListeners() {
    const addBtn = document.getElementById("addQueueBtn");
    if (addBtn) {
      addBtn.addEventListener("click", async () => {
        if (!this.currentDoctorId) {
          CustomAlert.error("Doctor ID tidak ditemukan. Silakan refresh halaman.", "Error");
          return;
        }

        // Reset state first
        this.satusehatChecked = false;

        // Generate queue number
        await this.generateQueueNumber();

        // Show modal
        window.modalHelper.showBootstrapModal("addQueueModal");

        // Hide alerts and reset form
        setTimeout(() => {
          this.hideAllSatusehatAlerts();
          const jenisContainer = document.getElementById(
            "jenisPatienContainer"
          );
          if (jenisContainer) jenisContainer.style.display = "none";
        }, 100);
      });
    }

    const searchBtn = document.getElementById("searchPatientBtn");
    if (searchBtn)
      searchBtn.addEventListener("click", () => this.searchPatients());

    const searchInput = document.getElementById("patientSearch");
    if (searchInput) {
      searchInput.addEventListener("keypress", (e) => {
        if (e.key === "Enter") {
          e.preventDefault();
          this.searchPatients();
        }
      });
    }

    const patientSelect = document.getElementById("patientSelect");
    if (patientSelect) {
      patientSelect.addEventListener("change", (e) => {
        this.showPatientInfo(e.target.value);
        if (e.target.value) {
          document.getElementById("jenisPatienContainer").style.display =
            "block";
          this.checkSatusehat(e.target.value);
        } else {
          document.getElementById("jenisPatienContainer").style.display =
            "none";
        }
      });
    }

    const saveBtn = document.getElementById("saveQueueBtn");
    if (saveBtn) saveBtn.addEventListener("click", () => this.saveQueue());

    const applyFilterBtn = document.getElementById("applyFilterBtn");
    if (applyFilterBtn)
      applyFilterBtn.addEventListener("click", () => this.applyFilters());

    const refreshBtn = document.getElementById("refreshBtn");
    if (refreshBtn)
      refreshBtn.addEventListener("click", () => this.loadQueues());

    const terimaBtn = document.getElementById("terimaQueueBtn");
    if (terimaBtn)
      terimaBtn.addEventListener("click", () => this.terimaQueue());

    const tolakBtn = document.getElementById("tolakQueueBtn");
    if (tolakBtn) tolakBtn.addEventListener("click", () => this.tolakQueue());

    const registerBtn = document.getElementById("registerSatusehatBtn");
    if (registerBtn)
      registerBtn.addEventListener("click", () => this.registerToSatusehat());
  }

  hideAllSatusehatAlerts() {
    const checkStatus = document.getElementById("satusehatCheckStatus");
    const foundAlert = document.getElementById("satusehatFoundAlert");
    const notFoundAlert = document.getElementById("satusehatNotFoundAlert");

    if (checkStatus) checkStatus.style.display = "none";
    if (foundAlert) foundAlert.style.display = "none";
    if (notFoundAlert) notFoundAlert.style.display = "none";
  }

  async checkSatusehat(patientId) {
    console.log("🔍 Checking SATUSEHAT for patient:", patientId);

    this.hideAllSatusehatAlerts();
    document.getElementById("satusehatCheckStatus").style.display = "block";

    try {
      const url = `${this.apiUrl}?action=check_satusehat&id_pasien=${patientId}`;
      const response = await fetch(url);
      const result = await response.json();

      console.log("📥 SATUSEHAT Check Result:", result);

      document.getElementById("satusehatCheckStatus").style.display = "none";

      if (result.success) {
        this.satusehatChecked = true;

        if (result.has_satusehat_id) {
          const foundAlert = document.getElementById("satusehatFoundAlert");
          const idText = document.getElementById("satusehatIdText");

          idText.innerHTML = `<strong>SATUSEHAT ID:</strong> ${result.id_satusehat}`;
          foundAlert.style.display = "block";

          console.log(
            "✅ Patient registered in SATUSEHAT:",
            result.id_satusehat
          );
        } else {
          document.getElementById("satusehatNotFoundAlert").style.display =
            "block";
          console.log("⚠️ Patient not found in SATUSEHAT");
        }
      } else {
        console.error("❌ SATUSEHAT Check Failed:", result.error);
        Toast.warning("Gagal memeriksa SATUSEHAT. Antrian tetap dapat dibuat.");
        this.satusehatChecked = true;
      }
    } catch (error) {
      console.error("❌ Error checking SATUSEHAT:", error);
      document.getElementById("satusehatCheckStatus").style.display = "none";
      Toast.warning("Error memeriksa SATUSEHAT. Antrian tetap dapat dibuat.");
      this.satusehatChecked = true;
    }
  }

  async generateQueueNumber() {
    try {
      const url = `${this.apiUrl}?action=generate_number`;
      const response = await fetch(url);
      const data = await response.json();

      const input = document.getElementById("queueNumber");
      if (input && data.no_antrian) {
        input.value = data.no_antrian;
      }
    } catch (error) {
      console.error("❌ Error generating number:", error);
      CustomAlert.error("Gagal generate nomor antrian: " + error.message, "Error");
    }
  }

  async searchPatients() {
    const keyword = document.getElementById("patientSearch").value.trim();

    if (keyword.length < 3) {
      CustomAlert.warning("Ketik minimal 3 karakter untuk pencarian", "Pencarian");
      return;
    }

    LoadingOverlay.show("Mencari Pasien", "Mohon tunggu...");

    try {
      const url = `${
        this.apiUrl
      }?action=search_pasien&keyword=${encodeURIComponent(keyword)}`;
      const response = await fetch(url);
      const data = await response.json();

      LoadingOverlay.hide();

      if (Array.isArray(data) && data.length > 0) {
        this.patients = data;
        this.populatePatientSelect();
        Toast.success(`Ditemukan ${data.length} pasien`);
      } else {
        CustomAlert.info(`Tidak ada pasien ditemukan dengan keyword: "${keyword}"`, "Hasil Pencarian");
      }
    } catch (error) {
      LoadingOverlay.hide();
      console.error("❌ Error searching patients:", error);
      CustomAlert.error(error.message, "Error Pencarian");
    }
  }

  populatePatientSelect() {
    const container = document.getElementById("patientSelectContainer");
    const select = document.getElementById("patientSelect");

    select.innerHTML = '<option value="">-- Pilih Pasien --</option>';

    this.patients.forEach((patient) => {
      const option = document.createElement("option");
      option.value = patient.id_pasien;
      option.textContent = `${patient.nama} - NIK: ${patient.nik}`;
      select.appendChild(option);
    });

    container.style.display = "block";
  }

  showPatientInfo(patientId) {
    const patient = this.patients.find((p) => p.id_pasien == patientId);
    const infoDiv = document.getElementById("selectedPatientInfo");
    const infoText = document.getElementById("patientInfoText");
    const hiddenInput = document.getElementById("selectedPatientId");

    if (patient) {
      infoText.innerHTML = `
        <strong>Nama:</strong> ${patient.nama}<br>
        <strong>NIK:</strong> ${patient.nik}<br>
        <strong>No. Telp:</strong> ${patient.no_telp || "-"}
      `;
      infoDiv.style.display = "block";
      hiddenInput.value = patientId;
      this.selectedPatientId = patientId;
    } else {
      infoDiv.style.display = "none";
      hiddenInput.value = "";
      this.selectedPatientId = null;
    }
  }

  async showActionModal(queueId) {
    console.log("📋 Opening action modal for queue:", queueId);

    try {
      const queue = this.queues.find((q) => q.id_antrian === queueId);

      if (!queue) {
        CustomAlert.error("Data antrian tidak ditemukan", "Error");
        return;
      }

      this.currentQueueData = queue;

      let ageText = "-";
      if (queue.tanggal_lahir) {
        const birthDate = new Date(queue.tanggal_lahir);
        const today = new Date();
        let age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();
        if (
          monthDiff < 0 ||
          (monthDiff === 0 && today.getDate() < birthDate.getDate())
        ) {
          age--;
        }
        ageText = `${age} tahun`;
      }

      document.getElementById("detailNoAntrian").textContent =
        queue.no_antrian || "-";
      document.getElementById("detailNamaPasien").textContent =
        queue.nama || "-";
      document.getElementById("detailUmurPasien").textContent =
        queue.umur || "-";
      document.getElementById("detailNikPasien").textContent = queue.nik || "-";
      document.getElementById("detailTelpPasien").textContent =
        queue.no_telp || "-";
      document.getElementById("detailTanggalAntrian").textContent =
        queue.tanggal_antrian || "-";
      document.getElementById("detailJamAntrian").textContent =
        queue.jam_antrian || "-";

      const statusClass = `status-${queue.status_antrian
        .toLowerCase()
        .replace(" ", "-")}`;
      document.getElementById(
        "detailStatusAntrian"
      ).innerHTML = `<span class="badge badge-status ${statusClass}">${queue.status_antrian}</span>`;

      const jenisPasien = queue.jenis_pasien || "UMUM";
      document.getElementById(
        "jenisAsliText"
      ).innerHTML = `Jenis saat mendaftar: <span class="fw-bold">${jenisPasien}</span>`;

      if (jenisPasien === "BPJS") {
        document.getElementById("confirmBPJS").checked = true;
      } else {
        document.getElementById("confirmUMUM").checked = true;
      }

      document.getElementById("satusehatNotRegistered").style.display = "none";
      document.getElementById("satusehatProcessing").style.display = "none";
      document.getElementById("satusehatRegistered").style.display = "none";

      if (queue.id_satusehat) {
        document.getElementById("satusehatRegistered").style.display = "block";
        document.getElementById(
          "detailSatusehatIdText"
        ).innerHTML = `<strong>SATUSEHAT ID:</strong> ${queue.id_satusehat}`;
      } else {
        document.getElementById("satusehatNotRegistered").style.display =
          "block";
      }

      window.modalHelper.showBootstrapModal("actionQueueModal");
    } catch (error) {
      console.error("❌ Error showing action modal:", error);
      CustomAlert.error(error.message, "Error");
    }
  }

  async registerToSatusehat() {
    if (!this.currentQueueData) {
      CustomAlert.error("Data antrian tidak ditemukan", "Error");
      return;
    }

    console.log(
      "🏥 Registering patient to SATUSEHAT:",
      this.currentQueueData.id_pasien
    );

    document.getElementById("satusehatNotRegistered").style.display = "none";
    document.getElementById("satusehatProcessing").style.display = "block";

    try {
      const response = await fetch(`${this.apiUrl}?action=register_satusehat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id_pasien: this.currentQueueData.id_pasien,
          id_dokter: this.currentDoctorId,
        }),
      });

      const result = await response.json();

      document.getElementById("satusehatProcessing").style.display = "none";

      if (result.success) {
        this.currentQueueData.id_satusehat = result.id_satusehat;

        document.getElementById("satusehatRegistered").style.display = "block";
        document.getElementById(
          "detailSatusehatIdText"
        ).innerHTML = `<strong>SATUSEHAT ID:</strong> ${result.id_satusehat}`;

        await this.loadQueues();

        CustomAlert.success(
          `SATUSEHAT ID: ${result.id_satusehat}`,
          "Pasien Berhasil Didaftarkan ke SATUSEHAT"
        );
      } else {
        document.getElementById("satusehatNotRegistered").style.display =
          "block";
        CustomAlert.error(
          result.message || result.error || "Unknown error",
          "Gagal Mendaftarkan ke SATUSEHAT"
        );
      }
    } catch (error) {
      console.error("❌ Error registering to SATUSEHAT:", error);
      document.getElementById("satusehatProcessing").style.display = "none";
      document.getElementById("satusehatNotRegistered").style.display = "block";
      CustomAlert.error(error.message, "Error");
    }
  }

  async terimaQueue() {
    if (!this.currentQueueData) {
      CustomAlert.error("Data antrian tidak ditemukan", "Error");
      return;
    }

    const selectedJenis = document.querySelector(
      'input[name="confirm_jenis_pasien"]:checked'
    );

    if (!selectedJenis) {
      CustomAlert.warning("Mohon pilih jenis pasien (BPJS atau UMUM)!", "Pilih Jenis Pasien");
      return;
    }

    if (!this.currentQueueData.id_satusehat) {
      const autoRegister = await CustomAlert.confirm(
        `Pasien belum terdaftar di SATUSEHAT.\n\nApakah Anda ingin sistem otomatis mendaftarkan pasien ke SATUSEHAT sebelum menerima antrian?`,
        "Daftar SATUSEHAT Otomatis?"
      );

      if (autoRegister) {
        console.log("🔄 Auto-registering patient to SATUSEHAT...");

        document.getElementById("satusehatNotRegistered").style.display =
          "none";
        document.getElementById("satusehatProcessing").style.display = "block";

        try {
          const registerResponse = await fetch(
            `${this.apiUrl}?action=register_satusehat`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                id_pasien: this.currentQueueData.id_pasien,
                id_dokter: this.currentDoctorId,
              }),
            }
          );

          const registerResult = await registerResponse.json();

          document.getElementById("satusehatProcessing").style.display = "none";

          if (registerResult.success) {
            this.currentQueueData.id_satusehat = registerResult.id_satusehat;

            document.getElementById("satusehatRegistered").style.display =
              "block";
            document.getElementById(
              "detailSatusehatIdText"
            ).innerHTML = `<strong>SATUSEHAT ID:</strong> ${registerResult.id_satusehat}`;

            console.log(
              "✅ Auto-registration successful:",
              registerResult.id_satusehat
            );
            Toast.success("Pasien berhasil didaftarkan ke SATUSEHAT");
          } else {
            document.getElementById("satusehatNotRegistered").style.display =
              "block";
            CustomAlert.error(
              registerResult.message || registerResult.error,
              "Gagal Mendaftarkan ke SATUSEHAT"
            );
            return;
          }
        } catch (error) {
          console.error("❌ Auto-registration error:", error);
          document.getElementById("satusehatProcessing").style.display = "none";
          document.getElementById("satusehatNotRegistered").style.display =
            "block";
          CustomAlert.error(error.message, "Error Auto-Register");
          return;
        }
      } else {
        return;
      }
    }

    const confirmAccept = await CustomAlert.confirm(
      `Terima antrian pasien ${this.currentQueueData.nama}?\n\nJenis: ${selectedJenis.value}`,
      "Terima Antrian?"
    );

    if (!confirmAccept) return;

    console.log("✅ Accepting queue:", this.currentQueueData.id_antrian);
    console.log("   Jenis Pasien:", selectedJenis.value);

    LoadingOverlay.show("Menerima Antrian", "Memperbarui status...");

    try {
      const modal = bootstrap.Modal.getInstance(
        document.getElementById("actionQueueModal")
      );
      modal.hide();

      const response = await fetch(
        `${this.apiUrl}?action=accept&id=${this.currentQueueData.id_antrian}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            jenis_pasien: selectedJenis.value,
          }),
        }
      );

      const result = await response.json();

      LoadingOverlay.hide();

      if (result.success) {
        await this.loadQueues();
        CustomAlert.success("Antrian berhasil diterima!", "Berhasil");
      } else {
        CustomAlert.error(
          result.message || result.error || "Unknown error",
          "Gagal Menerima Antrian"
        );
      }
    } catch (error) {
      LoadingOverlay.hide();
      console.error("❌ Error accepting queue:", error);
      CustomAlert.error(error.message, "Error");
    }

    this.currentQueueData = null;
  }

  async tolakQueue() {
    if (!this.currentQueueData) {
      CustomAlert.error("Data antrian tidak ditemukan", "Error");
      return;
    }

    const confirmReject = await CustomAlert.confirm(
      `Tolak antrian pasien ${this.currentQueueData.nama}?\n\nAntrian akan dibatalkan.`,
      "Tolak Antrian?"
    );

    if (!confirmReject) return;

    console.log(
      "🗑️ Rejecting/Deleting queue:",
      this.currentQueueData.id_antrian
    );

    LoadingOverlay.show("Menolak Antrian", "Memperbarui status...");

    try {
      const modal = bootstrap.Modal.getInstance(
        document.getElementById("actionQueueModal")
      );
      modal.hide();

      const response = await fetch(
        `${this.apiUrl}?action=delete&id=${this.currentQueueData.id_antrian}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
        }
      );

      const result = await response.json();

      LoadingOverlay.hide();

      if (result.success) {
        await this.loadQueues();
        CustomAlert.success("Antrian berhasil ditolak/dibatalkan!", "Berhasil");
      } else {
        CustomAlert.error(
          result.message || "Unknown error",
          "Gagal Menolak Antrian"
        );
      }
    } catch (error) {
      LoadingOverlay.hide();
      console.error("❌ Error rejecting queue:", error);
      CustomAlert.error(error.message, "Error");
    }

    this.currentQueueData = null;
  }

  async loadQueues() {
    if (!this.currentDoctorId) {
      console.error("❌ No doctor ID available");
      return;
    }

    // ✅ SHOW SKELETON FIRST
    const tbody = document.getElementById("queueTableBody");
    if (tbody) {
      tbody.innerHTML = this.generateQueueTableSkeleton(5);
    }

    try {
      // ✅ Small delay to show skeleton animation
      await new Promise(resolve => setTimeout(resolve, 300));

      let { data, error } = await window.supabaseClient.rpc(
        "get_latest_antrian_for_dokter",
        { p_dokter: this.currentDoctorId }
      );

      if (Array.isArray(data)) {
        this.queues = data;
        this.updateTable();

        const countBadge = document.getElementById("queueCount");
        if (countBadge) {
          const allowedStatuses = [
            "Belum Diperiksa",
            "Di Terima",
            "Sedang Diperiksa",
            "Selesai Periksa",
          ];

          const visibleCount = this.queues.filter((q) =>
            allowedStatuses.includes(q.status_antrian)
          ).length;
          countBadge.textContent = `${visibleCount} Pasien`;
        }
      }
    } catch (error) {
      console.error("❌ Error loading queues:", error);
      CustomAlert.error("Gagal memuat data antrian: " + error.message, "Error");
    }
  }

  async applyFilters() {
    if (!this.currentDoctorId) {
      console.error("❌ No doctor ID");
      CustomAlert.error("Doctor ID tidak ditemukan", "Error");
      return;
    }

    const tanggal = document.getElementById("filterDate").value;
    const jamMulai = document.getElementById("filterStartTime").value;
    const jamAkhir = document.getElementById("filterEndTime").value;

    // ✅ SHOW SKELETON FIRST
    const tbody = document.getElementById("queueTableBody");
    if (tbody) {
      tbody.innerHTML = this.generateQueueTableSkeleton(5);
    }

    try {
      // ✅ Small delay to show skeleton animation
      await new Promise(resolve => setTimeout(resolve, 300));

      const url = `${this.apiUrl}?action=filter_by_hour&tanggal=${tanggal}&jam_mulai=${jamMulai}&jam_akhir=${jamAkhir}&dokter_id=${this.currentDoctorId}`;
      const response = await fetch(url);
      const data = await response.json();

      if (Array.isArray(data)) {
        this.queues = data;
        this.updateTable();

        const countBadge = document.getElementById("queueCount");
        if (countBadge) {
          const allowedStatuses = [
            "Belum Diperiksa",
            "Di Terima",
            "Sedang Diperiksa",
            "Selesai Periksa",
          ];

          const visibleCount = this.queues.filter((q) =>
            allowedStatuses.includes(q.status_antrian)
          ).length;
          countBadge.textContent = `${visibleCount} Pasien`;
        }
        
        Toast.success(`Filter diterapkan: ${data.length} hasil`);
      }
    } catch (error) {
      console.error("❌ Error filtering:", error);
      CustomAlert.error("Gagal memfilter data: " + error.message, "Error Filter");
    }
  }

  async saveQueue() {
    if (!this.currentDoctorId) {
      CustomAlert.error("Doctor ID tidak ditemukan", "Error");
      return;
    }

    const date = document.getElementById("queueDate").value;
    const time = document.getElementById("queueTime").value;
    const number = document.getElementById("queueNumber").value;
    const patientId = document.getElementById("selectedPatientId").value;

    const jenisPasienRadio = document.querySelector(
      'input[name="jenis_pasien"]:checked'
    );

    if (!date || !time || !number || !patientId) {
      CustomAlert.warning("Mohon lengkapi semua field dan pilih pasien!", "Data Tidak Lengkap");
      return;
    }

    if (!jenisPasienRadio) {
      CustomAlert.warning("Mohon pilih jenis pasien (BPJS atau UMUM)!", "Pilih Jenis Pasien");
      return;
    }

    if (!this.satusehatChecked) {
      Toast.info("Sedang memeriksa SATUSEHAT...");
      return;
    }

    const newQueue = {
      tanggal_antrian: date,
      jam_antrian: time,
      no_antrian: number,
      id_pasien: patientId,
      id_dokter: this.currentDoctorId,
      jenis_pasien: jenisPasienRadio.value,
    };

    console.log("📤 Creating queue with BPJS/UMUM:", newQueue);

    LoadingOverlay.show("Menyimpan Antrian", "Mohon tunggu...");

    try {
      const response = await fetch(`${this.apiUrl}?action=create`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newQueue),
      });

      const result = await response.json();

      LoadingOverlay.hide();

      if (result.success) {
        const modal = bootstrap.Modal.getInstance(
          document.getElementById("addQueueModal")
        );
        modal.hide();

        document.getElementById("addQueueForm").reset();
        document.getElementById("patientSelectContainer").style.display =
          "none";
        document.getElementById("selectedPatientInfo").style.display = "none";
        document.getElementById("jenisPatienContainer").style.display = "none";
        this.hideAllSatusehatAlerts();
        this.satusehatChecked = false;

        await this.loadQueues();
        CustomAlert.success(`Antrian ${number} berhasil ditambahkan!`, "Berhasil");
      } else {
        CustomAlert.error(
          result.error || result.message || "Unknown error",
          "Gagal Menambahkan Antrian"
        );
      }
    } catch (error) {
      LoadingOverlay.hide();
      console.error("❌ Error saving queue:", error);
      CustomAlert.error(error.message, "Error");
    }
  }

  updateTable() {
    const tbody = document.getElementById("queueTableBody");
    if (!tbody) return;

    const visibleQueues = this.queues.filter(
      (queue) =>
        queue.status_antrian === "Belum Periksa" ||
        queue.status_antrian === "Selesai Periksa"
    );

    tbody.innerHTML = this.renderQueueRows();

    const countBadge = document.getElementById("queueCount");
    if (countBadge) {
      countBadge.textContent = `${visibleQueues.length} Pasien`;
    }
  }

  // ========================================
  // 💳 PAYMENT METHODS
  // ========================================

  async showPaymentModal(queueId) {
    console.log("💳 Opening payment modal for queue:", queueId);

    const queue = this.queues.find((q) => q.id_antrian === queueId);

    if (!queue) {
      CustomAlert.error("Data antrian tidak ditemukan", "Error");
      return;
    }

    // Store current queue for payment processing
    this.currentPaymentQueue = queue;

    // Initialize payment data
    this.paymentData = {
      queueNumber: queue.no_antrian,
      patientName: queue.nama,
      patientType: queue.jenis_pasien || 'UMUM',
      drugs: [],
      totalDrugs: 0,
      serviceCharge: 50000,
      grandTotal: 0
    };

    // Show modal first
    window.modalHelper.showBootstrapModal('paymentModal');

    // Then load payment details
    await this.loadPaymentDetails(queueId);
  }

  async loadPaymentDetails(queueId) {
    // ✅ SHOW SKELETON IN DRUG TABLE
    const tbody = document.getElementById('paymentDrugTableBody');
    if (tbody) {
      tbody.innerHTML = this.generatePaymentDrugSkeleton(3);
    }

    try {
      // ✅ Small delay to show skeleton animation
      await new Promise(resolve => setTimeout(resolve, 300));

      const response = await fetch(`${this.apiUrl}?action=get_payment_details&id=${queueId}`);
      const result = await response.json();

      console.log("💳 Payment Details Response:", result);

      if (result.success && result.data) {
        this.paymentData.drugs = result.data.drugs || [];
        this.paymentData.serviceCharge = result.data.harga_jasa || 0;
        this.paymentData.totalDrugs = result.data.total_drugs || 0;
        this.paymentData.grandTotal = result.data.grand_total || 0;
        
        console.log("💰 Grand Total:", this.paymentData.grandTotal);
      }

      this.populatePaymentModal();
      this.setupPaymentEventListeners();
    } catch (error) {
      console.error("❌ Error:", error);
      if (tbody) {
        tbody.innerHTML = '<tr><td colspan="7" class="text-center text-danger">Error loading data</td></tr>';
      }
    }
  }

  populatePaymentModal() {
    const data = this.paymentData;

    // Set patient info
    document.getElementById('paymentPatientName').textContent = data.patientName;
    document.getElementById('paymentQueueNumber').textContent = data.queueNumber;
    
    // Set patient type
    this.updatePatientType(data.patientType);
    
    // Set totals
    this.updateTotals();
    
    // Populate drug table
    this.populateDrugTable();
  }

  updatePatientType(type) {
    this.paymentData.patientType = type;
    
    // Update buttons
    document.querySelectorAll('.patient-type-btn').forEach(btn => {
      if (btn.dataset.type === type) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });

    // Update patient type badge
    const badge = type === 'BPJS' 
      ? '<span class="badge bg-primary"><i class="bi bi-shield-check me-1"></i>BPJS</span>'
      : '<span class="badge bg-success"><i class="bi bi-wallet2 me-1"></i>UMUM</span>';
    document.getElementById('paymentPatientType').innerHTML = badge;

    // Show/hide relevant sections
    if (type === 'BPJS') {
      // Reset payment method when switching to BPJS
      this.paymentMethod = 'bpjs';
      
      // Hide UMUM payment sections
      document.getElementById('paymentMethodContainer').style.display = 'none';
      document.getElementById('paymentInputContainer').style.display = 'none';
      document.getElementById('qrisDisplayContainer').style.display = 'none';
      
      // Show BPJS sections
      document.getElementById('bpjsInfoContainer').style.display = 'block';
      document.getElementById('bpjsPlaceholder').style.display = 'flex';
      
      // Update button text
      document.getElementById('processPaymentBtn').innerHTML = '<i class="bi bi-check-circle me-2"></i>Proses Pembayaran';
      
      // Reset payment method buttons
      document.querySelectorAll('.payment-method-btn').forEach(btn => {
        btn.classList.remove('active');
      });
    } else {
      // Reset to cash by default for UMUM
      this.paymentMethod = 'cash';
      
      // Show UMUM sections
      document.getElementById('paymentMethodContainer').style.display = 'block';
      document.getElementById('paymentInputContainer').style.display = 'block';
      document.getElementById('qrisDisplayContainer').style.display = 'none';
      
      // Hide BPJS sections
      document.getElementById('bpjsInfoContainer').style.display = 'none';
      document.getElementById('bpjsPlaceholder').style.display = 'none';
      
      // Update button text
      document.getElementById('processPaymentBtn').innerHTML = '<i class="bi bi-check-circle me-2"></i>Bayar';
      
      // Set cash as default active
      document.querySelectorAll('.payment-method-btn').forEach(btn => {
        if (btn.dataset.method === 'cash') {
          btn.classList.add('active');
        } else {
          btn.classList.remove('active');
        }
      });
      
      // Clear payment input
      document.getElementById('paymentAmount').value = '';
      document.getElementById('paymentChange').textContent = 'Rp 0';
    }
  }

  updatePaymentMethod(method) {
    this.paymentMethod = method;
    
    // Update buttons
    document.querySelectorAll('.payment-method-btn').forEach(btn => {
      if (btn.dataset.method === method) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });

    // Show/hide appropriate containers
    if (method === 'qris') {
      // Hide cash input, show QRIS display
      document.getElementById('paymentInputContainer').style.display = 'none';
      document.getElementById('qrisDisplayContainer').style.display = 'block';
      
      // Load and display QRIS
      this.displayQRISForPayment();
      
      // Auto-set payment amount to exact total
      document.getElementById('paymentAmount').value = this.paymentData.grandTotal;
      
      // Enable process button for QRIS
      const processBtn = document.getElementById('processPaymentBtn');
      if (processBtn) {
        processBtn.disabled = false;
        processBtn.classList.remove('disabled');
      }
      
      // Enable preview button
      const previewBtn = document.getElementById('previewBillBtn');
      if (previewBtn) {
        previewBtn.disabled = false;
        previewBtn.classList.remove('disabled');
      }
    } else {
      // Show cash input, hide QRIS display
      document.getElementById('paymentInputContainer').style.display = 'block';
      document.getElementById('qrisDisplayContainer').style.display = 'none';
      
      // Enable manual input for cash
      document.getElementById('paymentAmount').disabled = false;
      document.getElementById('paymentAmount').value = '';
      document.getElementById('paymentChange').textContent = 'Rp 0';
      
      // Enable buttons for cash
      const processBtn = document.getElementById('processPaymentBtn');
      if (processBtn) {
        processBtn.disabled = false;
        processBtn.classList.remove('disabled');
      }
      
      const previewBtn = document.getElementById('previewBillBtn');
      if (previewBtn) {
        previewBtn.disabled = false;
        previewBtn.classList.remove('disabled');
      }
    }
  }

  calculateChange() {
    if (this.paymentData.patientType === 'UMUM' && this.paymentMethod === 'cash') {
      const paid = parseFloat(document.getElementById('paymentAmount').value) || 0;
      const change = paid - this.paymentData.grandTotal;
      const changeAmount = change > 0 ? change : 0;
      document.getElementById('paymentChange').textContent = 'Rp ' + changeAmount.toLocaleString('id-ID');
    } else {
      document.getElementById('paymentChange').textContent = 'Rp 0';
    }
  }

  updateTotals() {
    const total = this.paymentData.grandTotal;
    document.getElementById('paymentGrandTotal').textContent = 'Rp ' + total.toLocaleString('id-ID');
    document.getElementById('paymentTableTotal').textContent = 'Rp ' + total.toLocaleString('id-ID');
  }

  populateDrugTable() {
    const tbody = document.getElementById('paymentDrugTableBody');
    
    if (!this.paymentData.drugs || this.paymentData.drugs.length === 0) {
      tbody.innerHTML = '<tr><td colspan="7" class="text-center">Tidak ada data obat</td></tr>';
      return;
    }

    tbody.innerHTML = this.paymentData.drugs.map(drug => `
      <tr>
        <td>${drug.name}</td>
        <td>${drug.type}</td>
        <td class="text-center">${drug.qty}</td>
        <td>${drug.signa}</td>
        <td class="text-end">Rp ${(drug.qty * drug.price).toLocaleString('id-ID')}</td>
        <td class="text-end">Rp ${drug.serviceCharge.toLocaleString('id-ID')}</td>
        <td class="text-end fw-bold">Rp ${(drug.qty * drug.price + drug.serviceCharge).toLocaleString('id-ID')}</td>
      </tr>
    `).join('');
  }

  setupPaymentEventListeners() {
    console.log('🔧 Setting up payment event listeners...');
    
    // Patient Type buttons - BPJS/UMUM
    document.querySelectorAll('.patient-type-btn').forEach(btn => {
      const newBtn = btn.cloneNode(true);
      btn.parentNode.replaceChild(newBtn, btn);
      
      newBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        console.log('👤 Patient type clicked:', newBtn.dataset.type);
        this.updatePatientType(newBtn.dataset.type);
      });
    });
    
    // Payment method buttons - Cash/QRIS
    document.querySelectorAll('.payment-method-btn').forEach(btn => {
      const newBtn = btn.cloneNode(true);
      btn.parentNode.replaceChild(newBtn, btn);
      
      newBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        console.log('💳 Payment method clicked:', newBtn.dataset.method);
        this.updatePaymentMethod(newBtn.dataset.method);
      });
    });

    // Payment amount input - calculate change
    const paymentInput = document.getElementById('paymentAmount');
    if (paymentInput) {
      const newInput = paymentInput.cloneNode(true);
      paymentInput.parentNode.replaceChild(newInput, paymentInput);
      
      newInput.addEventListener('input', () => {
        console.log('💰 Amount changed:', newInput.value);
        this.calculateChange();
      });
    }

    // Process payment button
    const processBtn = document.getElementById('processPaymentBtn');
    if (processBtn) {
      const newProcessBtn = processBtn.cloneNode(true);
      processBtn.parentNode.replaceChild(newProcessBtn, processBtn);
      
      newProcessBtn.addEventListener('click', async (e) => {
        e.preventDefault();
        console.log('💰 Bayar clicked');
        await this.handlePayment();
      });
    }

    // Preview bill button
    const previewBtn = document.getElementById('previewBillBtn');
    if (previewBtn) {
      const newPreviewBtn = previewBtn.cloneNode(true);
      previewBtn.parentNode.replaceChild(newPreviewBtn, previewBtn);
      
      newPreviewBtn.addEventListener('click', (e) => {
        e.preventDefault();
        console.log('🖨️ Preview clicked');
        this.printBill();
      });
    }
    
    console.log('✅ Event listeners setup complete');
  }

  async handlePayment() {
    // Prevent double click
    if (this.isProcessing) return;
    
    // Validation for UMUM payment
    if (this.paymentData.patientType === 'UMUM') {
      if (this.paymentMethod === 'cash') {
        const paid = parseFloat(document.getElementById('paymentAmount').value) || 0;
        if (paid < this.paymentData.grandTotal) {
          CustomAlert.warning("Jumlah uang masih kurang!", "Pembayaran Tidak Cukup");
          return;
        }
      } else if (this.paymentMethod === 'qris') {
        // For QRIS, check if QRIS image is available
        const qrisImage = document.getElementById('qrisPaymentImage');
        if (!qrisImage.src || qrisImage.style.display === 'none') {
          CustomAlert.warning(
            "QRIS belum tersedia!\n\nSilakan upload QRIS di halaman Profil terlebih dahulu atau gunakan metode Cash.",
            "QRIS Tidak Tersedia"
          );
          return;
        }
        
        // Confirm QRIS payment
        const confirmQris = await CustomAlert.confirm(
          "Pastikan pasien sudah melakukan pembayaran via scan QRIS.",
          "Konfirmasi Pembayaran QRIS"
        );
        if (!confirmQris) return;
      }
    }

    this.isProcessing = true;
    
    // Show success animation
    document.getElementById('paymentSuccessOverlay').style.display = 'flex';

    try {
      const response = await fetch(`${this.apiUrl}?action=process_payment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          queue_id: this.currentPaymentQueue.id_antrian,
          patient_type: this.paymentData.patientType,
          payment_method: this.paymentMethod || 'bpjs',
          amount_paid: document.getElementById('paymentAmount')?.value || 0,
          total_bill: this.paymentData.grandTotal
        })
      });

      const result = await response.json();

      setTimeout(async () => {
        document.getElementById('paymentSuccessOverlay').style.display = 'none';
        this.isProcessing = false;
        
        if (result.success) {
          const paymentMethodText = this.paymentMethod === 'qris' ? 'QRIS' : 
                                    this.paymentMethod === 'cash' ? 'Cash' : 'BPJS';
          
          // Close modal first
          const modal = bootstrap.Modal.getInstance(document.getElementById('paymentModal'));
          modal.hide();
          
          // Show success alert
          await CustomAlert.success(
            `Pembayaran berhasil (${paymentMethodText})!\n\nStatus antrian diperbarui ke "Selesai".`,
            "Pembayaran Berhasil"
          );
          
          // Ask to print bill
          const wantPrint = await CustomAlert.confirm(
            "Apakah Anda ingin mencetak tagihan?",
            "Cetak Tagihan?"
          );
          
          if (wantPrint) {
            this.printBill();
          }
          
          this.loadQueues();
        } else {
          CustomAlert.error(
            result.message || result.error || 'Unknown error',
            "Gagal Memproses Pembayaran"
          );
        }
      }, 1500);
    } catch (error) {
      document.getElementById('paymentSuccessOverlay').style.display = 'none';
      this.isProcessing = false;
      console.error('❌ Error processing payment:', error);
      CustomAlert.error(error.message, "Error");
    }
  }

  async loadDoctorQRIS() {
    if (!this.currentDoctorId) {
      console.error('❌ No doctor ID for QRIS');
      return null;
    }

    try {
      const { data, error } = await window.supabaseClient
        .from('dokter')
        .select('qris_url')
        .eq('id_dokter', this.currentDoctorId)
        .single();

      if (error) {
        console.error('❌ Error loading QRIS:', error);
        return null;
      }

      return data?.qris_url || null;
    } catch (error) {
      console.error('❌ Exception loading QRIS:', error);
      return null;
    }
  }

  async displayQRISForPayment() {
    const qrisImage = document.getElementById('qrisPaymentImage');
    const qrisLoading = document.getElementById('qrisLoadingSpinner');
    const qrisNotAvailable = document.getElementById('qrisNotAvailable');

    // Show loading
    qrisLoading.style.display = 'block';
    qrisImage.style.display = 'none';
    qrisNotAvailable.style.display = 'none';

    // Load QRIS URL
    const qrisUrl = await this.loadDoctorQRIS();

    // Hide loading
    qrisLoading.style.display = 'none';

    if (qrisUrl) {
      qrisImage.src = qrisUrl;
      qrisImage.style.display = 'block';
      
      // Update total amount in QRIS section
      document.getElementById('qrisTotalAmount').textContent = 
        this.paymentData.grandTotal.toLocaleString('id-ID');
    } else {
      qrisNotAvailable.style.display = 'block';
    }
  }

  printBill() {
    const data = this.paymentData;
    const now = new Date().toLocaleString('id-ID');
    const paymentAmount = document.getElementById('paymentAmount')?.value || 0;
    const changeText = document.getElementById('paymentChange')?.textContent || 'Rp 0';
    const change = parseFloat(changeText.replace('Rp ', '').replace(/\./g, '').replace(',', '.')) || 0;

    const billContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Tagihan - ${data.queueNumber}</title>
        <style>
          body { font-family: 'Courier New', monospace; font-size: 12px; padding: 20px; }
          .center { text-align: center; }
          .bold { font-weight: bold; }
          .line { border-top: 1px dashed #000; margin: 10px 0; }
          table { width: 100%; border-collapse: collapse; }
          td { padding: 5px 0; }
          .right { text-align: right; }
        </style>
      </head>
      <body>
        <div class="center bold">
          <h2>KLINIK SEHAT SENTOSA</h2>
          <p>Jl. Kesehatan No. 123<br>Telp: (021) 12345678</p>
        </div>
        <div class="line"></div>
        <table>
          <tr><td>No. Antrian</td><td class="right">${data.queueNumber}</td></tr>
          <tr><td>Pasien</td><td class="right">${data.patientName}</td></tr>
          <tr><td>Jenis</td><td class="right">${data.patientType}</td></tr>
          <tr><td>Tanggal</td><td class="right">${now}</td></tr>
        </table>
        <div class="line"></div>
        <table>
          ${data.drugs.map(drug => `
            <tr>
              <td colspan="2" class="bold">${drug.name}</td>
            </tr>
            <tr>
              <td>  ${drug.qty} x Rp ${drug.price.toLocaleString('id-ID')}</td>
              <td class="right">Rp ${(drug.qty * drug.price).toLocaleString('id-ID')}</td>
            </tr>
            ${drug.serviceCharge > 0 ? `
              <tr>
                <td>  Jasa Dokter</td>
                <td class="right">Rp ${drug.serviceCharge.toLocaleString('id-ID')}</td>
              </tr>
            ` : ''}
          `).join('')}
        </table>
        <div class="line"></div>
        <table>
          <tr class="bold"><td>TOTAL</td><td class="right">Rp ${data.grandTotal.toLocaleString('id-ID')}</td></tr>
          ${data.patientType === 'UMUM' ? `
            <tr><td>Dibayar (${(this.paymentMethod || 'cash').toUpperCase()})</td><td class="right">Rp ${parseFloat(paymentAmount).toLocaleString('id-ID')}</td></tr>
            ${this.paymentMethod === 'cash' ? `<tr><td>Kembalian</td><td class="right">Rp ${change.toLocaleString('id-ID')}</td></tr>` : ''}
          ` : `
            <tr><td colspan="2" class="center bold">GRATIS (BPJS)</td></tr>
          `}
        </table>
        <div class="line"></div>
        <div class="center">
          <p>Terima kasih atas kunjungan Anda<br>Semoga lekas sembuh!</p>
        </div>
      </body>
      </html>
    `;

    const printWindow = window.open('', '', 'width=400,height=600');
    printWindow.document.write(billContent);
    printWindow.document.close();
    printWindow.print();
  }

  onDestroy() {
    window.currentFragment = null;
    this.currentQueueData = null;
    this.currentPaymentQueue = null;
    this.paymentData = null;
  }
}

// Make components globally available
window.CustomAlert = CustomAlert;
window.LoadingOverlay = LoadingOverlay;
window.Toast = Toast;

console.log("✅ AntrianFragment with Custom Alerts, Loading States & Toast Notifications loaded successfully");