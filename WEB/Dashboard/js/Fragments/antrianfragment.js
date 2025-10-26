console.log("🔥 ANTRIAN FRAGMENT - WITH SATUSEHAT AUTO-REGISTER 🔥");

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

      <!-- ⭐ ADD THIS MODAL (Missing from your code!) -->
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

      <!-- 🔥 Action Modal (Detail Pasien) -->
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

              <!-- 🔥 SATUSEHAT Registration Section -->
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
        background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
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
        border-color: #6366f1;
        box-shadow: 0 0 0 0.25rem rgba(99, 102, 241, 0.25);
      }

      .btn-custom-teal { 
        background: linear-gradient(135deg, #5CD4C8 0%, #4AC4B8 100%); 
        color: white; 
        border: none;
        border-radius: 0.375rem;
        padding: 0.5rem 1rem;
        font-weight: 500;
      }
      .btn-custom-teal:hover { 
        background: linear-gradient(135deg, #4AC4B8 0%, #3AB3A8 100%); 
        color: white; 
      }
      
      .btn-action { 
        background-color: #6366f1; 
        color: white; 
        border: none; 
        padding: 6px 24px; 
        border-radius: 20px; 
        font-size: 0.85rem; 
      }
      .btn-action:hover { 
        background-color: #4f46e5; 
        color: white; 
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
      .status-selesai { background-color: #198754; color: white; }
      .status-batal { background-color: #dc3545; color: white; }
      
      .table thead th { font-weight: 600; font-size: 0.85rem; padding: 1rem; }
      .table tbody td { padding: 1rem; vertical-align: middle; }
      
      .badge-satusehat { padding: 4px 12px; border-radius: 12px; font-size: 0.75rem; }
      .satusehat-registered { background-color: #28a745; color: white; }
      .satusehat-not-registered { background-color: #6c757d; color: white; }
      
      .badge-jenis { padding: 6px 14px; border-radius: 20px; font-size: 0.8rem; font-weight: 600; }
      .jenis-bpjs { background-color: #6366f1; color: white; }
      .jenis-umum { background-color: #198754; color: white; }
      
      .form-check-custom .form-check-input { width: 20px; height: 20px; margin-top: 2px; }
      .form-check-custom .form-check-label { font-size: 1.1rem; cursor: pointer; }
    </style>
    `;
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
        if (queue.status_antrian === "Selesai") {
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

  // Add this new method for payment modal
  showPaymentModal(queueId) {
    console.log("💳 Opening payment modal for queue:", queueId);

    const queue = this.queues.find((q) => q.id_antrian === queueId);

    if (!queue) {
      alert("Error: Data antrian tidak ditemukan");
      return;
    }

    // You can create a custom payment modal or redirect to payment page
    alert(
      `Pembayaran untuk:\n\nNo. Antrian: ${queue.no_antrian}\nPasien: ${queue.nama}\nJenis: ${queue.jenis_pasien}\n\n(Fitur pembayaran akan segera ditambahkan)`
    );

    // Example: Redirect to payment page
    // window.location.href = `payment.html?queue_id=${queueId}`;

    // Or you could show a payment modal similar to actionQueueModal
  }

  async onInit() {
    console.log("🎬 Antrian Fragment Initialized with SATUSEHAT Auto-Register");
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
      const token = localStorage.getItem("access_token");
      const data = JSON.parse(localStorage.getItem("user")).email;

      if (!token) {
        console.error("❌ No user email found in session");
        alert("Error: Anda belum login. Silakan login terlebih dahulu.");
        return;
      }

      const response = await fetch(this.profileApiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          action: "get",
          email: data,
        }),
      });

      const result = await response.json();

      if (result.success && result.data) {
        this.currentDoctorId = result.data.id_dokter;
        this.currentDoctorName = result.data.nama_lengkap;

        const doctorInfo = document.getElementById("doctorInfo");
        if (doctorInfo) {
          doctorInfo.innerHTML = `<i class="bi bi-person-circle me-1"></i>Antrian untuk: <strong>Dr. ${this.currentDoctorName}</strong>`;
        }
      } else {
        console.error("❌ Failed to load profile:", result.message);
        alert(
          "Error: Tidak dapat memuat profil dokter. " + (result.message || "")
        );
      }
    } catch (error) {
      console.error("❌ Error loading profile:", error);
      alert("Error: " + error.message);
    }
  }

  setupEventListeners() {
    const addBtn = document.getElementById("addQueueBtn");
    if (addBtn) {
      addBtn.addEventListener("click", async () => {
        if (!this.currentDoctorId) {
          alert("Error: Doctor ID tidak ditemukan. Silakan refresh halaman.");
          return;
        }

        // ✅ Reset state first (before accessing DOM elements)
        this.satusehatChecked = false;

        // ✅ Generate queue number
        await this.generateQueueNumber();

        // ✅ Show modal first
        window.modalHelper.showBootstrapModal("addQueueModal");

        // ✅ Then hide alerts and reset form (after modal is shown)
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
    // ✅ Add null checks before accessing style
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
      const url = `${this.apiUrl}?action=check_satusehat&patient_id=${patientId}`;
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
        alert(
          "Peringatan: Gagal memeriksa SATUSEHAT. Antrian tetap dapat dibuat."
        );
        this.satusehatChecked = true;
      }
    } catch (error) {
      console.error("❌ Error checking SATUSEHAT:", error);
      document.getElementById("satusehatCheckStatus").style.display = "none";
      alert(
        "Peringatan: Error memeriksa SATUSEHAT. Antrian tetap dapat dibuat."
      );
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
      alert("Error generating queue number: " + error.message);
    }
  }

  async searchPatients() {
    const keyword = document.getElementById("patientSearch").value.trim();

    if (keyword.length < 3) {
      alert("Mohon ketik minimal 3 karakter untuk pencarian");
      return;
    }

    try {
      const url = `${
        this.apiUrl
      }?action=search_pasien&keyword=${encodeURIComponent(keyword)}`;
      const response = await fetch(url);
      const data = await response.json();

      if (Array.isArray(data) && data.length > 0) {
        this.patients = data;
        this.populatePatientSelect();
      } else {
        alert("Tidak ada pasien ditemukan dengan keyword: " + keyword);
      }
    } catch (error) {
      console.error("❌ Error searching patients:", error);
      alert("Error: " + error.message);
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
        alert("Error: Data antrian tidak ditemukan");
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

      // ✅ Use modal helper instead of creating new instance
      window.modalHelper.showBootstrapModal("actionQueueModal");
    } catch (error) {
      console.error("❌ Error showing action modal:", error);
      alert("Error: " + error.message);
    }
  }

  async registerToSatusehat() {
    if (!this.currentQueueData) {
      alert("Error: Data antrian tidak ditemukan");
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
          patient_id: this.currentQueueData.id_pasien,
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

        alert(
          "✓ Pasien berhasil didaftarkan ke SATUSEHAT!\n\nSATUSEHAT ID: " +
            result.id_satusehat
        );
      } else {
        document.getElementById("satusehatNotRegistered").style.display =
          "block";
        alert(
          "✗ Gagal mendaftarkan ke SATUSEHAT:\n" +
            (result.message || result.error || "Unknown error")
        );
      }
    } catch (error) {
      console.error("❌ Error registering to SATUSEHAT:", error);
      document.getElementById("satusehatProcessing").style.display = "none";
      document.getElementById("satusehatNotRegistered").style.display = "block";
      alert("✗ Error: " + error.message);
    }
  }

  async terimaQueue() {
    if (!this.currentQueueData) {
      alert("Error: Data antrian tidak ditemukan");
      return;
    }

    const selectedJenis = document.querySelector(
      'input[name="confirm_jenis_pasien"]:checked'
    );

    if (!selectedJenis) {
      alert("Mohon pilih jenis pasien (BPJS atau UMUM)!");
      return;
    }

    if (!this.currentQueueData.id_satusehat) {
      const autoRegister = confirm(
        `Pasien belum terdaftar di SATUSEHAT.\n\n` +
          `Apakah Anda ingin sistem otomatis mendaftarkan pasien ke SATUSEHAT sebelum menerima antrian?\n\n` +
          `- Klik OK: Daftar otomatis & terima antrian\n` +
          `- Klik Cancel: Kembali (gunakan tombol "Daftar SATUSEHAT" terlebih dahulu)`
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
                patient_id: this.currentQueueData.id_pasien,
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
          } else {
            document.getElementById("satusehatNotRegistered").style.display =
              "block";
            alert(
              "✗ Gagal mendaftarkan ke SATUSEHAT:\n" +
                (registerResult.message || registerResult.error)
            );
            return;
          }
        } catch (error) {
          console.error("❌ Auto-registration error:", error);
          document.getElementById("satusehatProcessing").style.display = "none";
          document.getElementById("satusehatNotRegistered").style.display =
            "block";
          alert("✗ Error auto-register: " + error.message);
          return;
        }
      } else {
        return;
      }
    }

    const confirmMsg = `Terima antrian pasien ${this.currentQueueData.nama}?\n\nJenis: ${selectedJenis.value}`;
    if (!confirm(confirmMsg)) return;

    console.log("✅ Accepting queue:", this.currentQueueData.id_antrian);
    console.log("   Jenis Pasien:", selectedJenis.value);

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

      if (result.success) {
        await this.loadQueues();
        alert("✓ Antrian berhasil diterima!");
      } else {
        alert(
          "✗ Gagal menerima antrian: " +
            (result.message || result.error || "Unknown error")
        );
      }
    } catch (error) {
      console.error("❌ Error accepting queue:", error);
      alert("✗ Error: " + error.message);
    }

    this.currentQueueData = null;
  }

  async tolakQueue() {
    if (!this.currentQueueData) {
      alert("Error: Data antrian tidak ditemukan");
      return;
    }

    const confirmMsg = `Tolak antrian pasien ${this.currentQueueData.nama}?\n\nAntrian akan dibatalkan.`;
    if (!confirm(confirmMsg)) return;

    console.log(
      "🗑️ Rejecting/Deleting queue:",
      this.currentQueueData.id_antrian
    );

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

      if (result.success) {
        await this.loadQueues();
        alert("✓ Antrian berhasil ditolak/dibatalkan!");
      } else {
        alert(
          "✗ Gagal menolak antrian: " + (result.message || "Unknown error")
        );
      }
    } catch (error) {
      console.error("❌ Error rejecting queue:", error);
      alert("✗ Error: " + error.message);
    }

    this.currentQueueData = null;
  }

  async loadQueues() {
    if (!this.currentDoctorId) {
      console.error("❌ No doctor ID available");
      return;
    }

    try {
      let { data, error } = await window.supabaseClient.rpc(
        "get_latest_antrian_for_dokter",
        { p_dokter: this.currentDoctorId }
      );

      if (Array.isArray(data)) {
        this.queues = data;
        this.updateTable();

        const countBadge = document.getElementById("queueCount");
        if (countBadge) {
          const countBadge = document.getElementById("queueCount");
          if (countBadge) {
            // Only count these statuses
            const allowedStatuses = [
              "Belum Diperiksa",
              "Di Terima",
              "Sedang Diperiksa",
              "Selesai Diperiksa",
            ];

            const visibleCount = this.queues.filter((q) =>
              allowedStatuses.includes(q.status_antrian)
            ).length;
            countBadge.textContent = `${visibleCount} Pasien`;
          }
        }
      }
    } catch (error) {
      console.error("❌ Error loading queues:", error);
      alert("Error loading queues: " + error.message);
    }
  }

  async applyFilters() {
    if (!this.currentDoctorId) {
      console.error("❌ No doctor ID");
      alert("Error: Doctor ID tidak ditemukan");
      return;
    }

    const tanggal = document.getElementById("filterDate").value;
    const jamMulai = document.getElementById("filterStartTime").value;
    const jamAkhir = document.getElementById("filterEndTime").value;

    try {
      const url = `${this.apiUrl}?action=filter_by_hour&tanggal=${tanggal}&jam_mulai=${jamMulai}&jam_akhir=${jamAkhir}&dokter_id=${this.currentDoctorId}`;
      const response = await fetch(url);
      const data = await response.json();

      if (Array.isArray(data)) {
        this.queues = data;
        this.updateTable();

        const countBadge = document.getElementById("queueCount");
        if (countBadge) {
          const countBadge = document.getElementById("queueCount");
          if (countBadge) {
            // Only count these statuses
            const allowedStatuses = [
              "Belum Diperiksa",
              "Di Terima",
              "Sedang Diperiksa",
              "Selesai Diperiksa",
            ];

            const visibleCount = this.queues.filter((q) =>
              allowedStatuses.includes(q.status_antrian)
            ).length;
            countBadge.textContent = `${visibleCount} Pasien`;
          }
        }
      }
    } catch (error) {
      console.error("❌ Error filtering:", error);
      alert("Error filtering queues: " + error.message);
    }
  }

  async saveQueue() {
    if (!this.currentDoctorId) {
      alert("Error: Doctor ID tidak ditemukan");
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
      alert("Mohon lengkapi semua field dan pilih pasien!");
      return;
    }

    if (!jenisPasienRadio) {
      alert("Mohon pilih jenis pasien (BPJS atau UMUM)!");
      return;
    }

    if (!this.satusehatChecked) {
      alert("Mohon tunggu, sedang memeriksa SATUSEHAT...");
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

    try {
      const response = await fetch(`${this.apiUrl}?action=create`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newQueue),
      });

      const result = await response.json();

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
        alert("✓ Antrian berhasil ditambahkan!");
      } else {
        alert(
          "✗ Gagal menambahkan antrian: " +
            (result.error || result.message || "Unknown error")
        );
      }
    } catch (error) {
      console.error("❌ Error saving queue:", error);
      alert("✗ Error: " + error.message);
    }
  }

  updateTable() {
    const tbody = document.getElementById("queueTableBody");
    if (!tbody) return;

    // Apply the same filter
    const visibleQueues = this.queues.filter(
      (queue) =>
        queue.status_antrian === "Belum Periksa" ||
        queue.status_antrian === "Selesai Periksa"
    );

    // Render only filtered queues
    tbody.innerHTML = this.renderQueueRows();

    // Update count badge
    const countBadge = document.getElementById("queueCount");
    if (countBadge) {
      countBadge.textContent = `${visibleQueues.length} Pasien`;
    }
  }

  onDestroy() {
    window.currentFragment = null;
    this.currentQueueData = null;
  }
}

console.log(
  "✅ AntrianFragment with SATUSEHAT Auto-Register loaded successfully"
);
