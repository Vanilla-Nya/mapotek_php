console.log("🔥 ANTRIAN FRAGMENT - WITH SATUSEHAT & BPJS/UMUM INTEGRATION 🔥");

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
                <input type="date" class="form-control" id="filterDate" value="${new Date().toISOString().split("T")[0]}">
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

      <!-- Modal for Adding Queue -->
      <div class="modal fade" id="addQueueModal" tabindex="-1">
        <div class="modal-dialog modal-lg">
          <div class="modal-content">
            <div class="modal-header bg-custom-teal text-white">
              <h5 class="modal-title">Tambah Antrian Baru</h5>
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

                <!-- JENIS PASIEN (BPJS/UMUM) -->
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

                <!-- SATUSEHAT Check Status -->
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
                      <input type="date" class="form-control" id="queueDate" required value="${new Date().toISOString().split("T")[0]}">
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

      <style>
        .btn-custom-teal { background-color: #5CD4C8; color: white; border: none; }
        .btn-custom-teal:hover { background-color: #4AC4B8; color: white; }
        .bg-custom-teal { background-color: #5CD4C8; }
        .btn-accept { background-color: #28a745; color: white; border: none; padding: 6px 20px; border-radius: 20px; font-size: 0.85rem; margin-right: 5px; }
        .btn-accept:hover { background-color: #218838; }
        .btn-delete { background-color: #dc3545; color: white; border: none; padding: 6px 24px; border-radius: 20px; font-size: 0.85rem; }
        .btn-delete:hover { background-color: #bb2d3b; }
        .badge-status { padding: 6px 16px; border-radius: 20px; font-size: 0.85rem; font-weight: 500; }
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
        .jenis-bpjs { background-color: #0d6efd; color: white; }
        .jenis-umum { background-color: #198754; color: white; }
        .form-check-custom .form-check-input { width: 20px; height: 20px; margin-top: 2px; }
        .form-check-custom .form-check-label { font-size: 1.1rem; cursor: pointer; }
      </style>
    `;
  }

  renderQueueRows() {
    if (this.queues.length === 0) {
      return `
        <tr>
          <td colspan="9" class="text-center py-5">
            <i class="bi bi-inbox fs-1 text-muted"></i>
            <p class="text-muted mt-3">Belum ada antrian hari ini</p>
            <small class="text-muted">Klik "Tambah Antrian Baru" untuk menambahkan pasien</small>
          </td>
        </tr>
      `;
    }

    return this.queues.map((queue) => {
      const statusClass = `status-${queue.status_antrian.toLowerCase().replace(" ", "-")}`;
      const patientName = queue.nama ?? "-";
      const patientNik = queue.nik ?? "-";
      
      // JENIS PASIEN Badge
      const jenisPasien = queue.jenis_pasien || "UMUM";
      const jenisBadgeClass = jenisPasien === "BPJS" ? "jenis-bpjs" : "jenis-umum";
      const jenisIcon = jenisPasien === "BPJS" ? "bi-shield-check" : "bi-wallet2";
      const jenisBadge = `<span class="badge badge-jenis ${jenisBadgeClass}"><i class="bi ${jenisIcon} me-1"></i>${jenisPasien}</span>`;
      
      // SATUSEHAT Badge
      const satusehatBadge = queue.id_satusehat 
        ? `<span class="badge badge-satusehat satusehat-registered"><i class="bi bi-check-circle me-1"></i>Terdaftar</span>`
        : `<span class="badge badge-satusehat satusehat-not-registered"><i class="bi bi-x-circle me-1"></i>Belum</span>`;

      const actionButtons = queue.status_antrian.toLowerCase() === "belum periksa" 
        ? `<button class="btn btn-accept btn-sm" onclick="window.currentFragment.acceptQueue('${queue.id_antrian}')">TERIMA</button> <button class="btn btn-delete btn-sm" onclick="window.currentFragment.deleteQueue('${queue.id_antrian}')">HAPUS</button>`
        : `<button class="btn btn-delete btn-sm" onclick="window.currentFragment.deleteQueue('${queue.id_antrian}')">HAPUS</button>`;

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
          <td>${actionButtons}</td>
        </tr>
      `;
    }).join("");
  }

  async onInit() {
    console.log("🎬 Antrian Fragment Initialized with SATUSEHAT & BPJS/UMUM");
    window.currentFragment = this;

    await this.loadCurrentDoctor();
    await this.loadQueues();
    this.setupEventListeners();

    setTimeout(() => {
      const now = new Date();
      const currentTime = now.getHours().toString().padStart(2, "0") + ":" + now.getMinutes().toString().padStart(2, "0");
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
        alert("Error: Tidak dapat memuat profil dokter. " + (result.message || ""));
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
        
        this.satusehatChecked = false;
        this.hideAllSatusehatAlerts();
        document.getElementById("jenisPatienContainer").style.display = "none";
        
        await this.generateQueueNumber();
        const modal = new bootstrap.Modal(document.getElementById("addQueueModal"));
        modal.show();
      });
    }

    const searchBtn = document.getElementById("searchPatientBtn");
    if (searchBtn) searchBtn.addEventListener("click", () => this.searchPatients());

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
          document.getElementById("jenisPatienContainer").style.display = "block";
          this.checkSatusehat(e.target.value);
        } else {
          document.getElementById("jenisPatienContainer").style.display = "none";
        }
      });
    }

    const saveBtn = document.getElementById("saveQueueBtn");
    if (saveBtn) saveBtn.addEventListener("click", () => this.saveQueue());

    const applyFilterBtn = document.getElementById("applyFilterBtn");
    if (applyFilterBtn) applyFilterBtn.addEventListener("click", () => this.applyFilters());

    const refreshBtn = document.getElementById("refreshBtn");
    if (refreshBtn) refreshBtn.addEventListener("click", () => this.loadQueues());
  }

  hideAllSatusehatAlerts() {
    document.getElementById("satusehatCheckStatus").style.display = "none";
    document.getElementById("satusehatFoundAlert").style.display = "none";
    document.getElementById("satusehatNotFoundAlert").style.display = "none";
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
          
          console.log("✅ Patient registered in SATUSEHAT:", result.id_satusehat);
        } else {
          document.getElementById("satusehatNotFoundAlert").style.display = "block";
          console.log("⚠️ Patient not found in SATUSEHAT");
        }
      } else {
        console.error("❌ SATUSEHAT Check Failed:", result.error);
        alert("Peringatan: Gagal memeriksa SATUSEHAT. Antrian tetap dapat dibuat.");
        this.satusehatChecked = true;
      }
    } catch (error) {
      console.error("❌ Error checking SATUSEHAT:", error);
      document.getElementById("satusehatCheckStatus").style.display = "none";
      alert("Peringatan: Error memeriksa SATUSEHAT. Antrian tetap dapat dibuat.");
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
      const url = `${this.apiUrl}?action=search_pasien&keyword=${encodeURIComponent(keyword)}`;
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

  async loadQueues() {
    if (!this.currentDoctorId) {
      console.error("❌ No doctor ID available");
      return;
    }

    try {
      let { data, error } = await window.supabaseClient.rpc('get_latest_antrian_for_dokter', { p_dokter: this.currentDoctorId });

      if (Array.isArray(data)) {
        this.queues = data;
        this.updateTable();

        const countBadge = document.getElementById("queueCount");
        if (countBadge) {
          countBadge.textContent = `${data.length} Antrian`;
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
          countBadge.textContent = `${data.length} Antrian`;
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
    
    // Get selected jenis_pasien
    const jenisPasienRadio = document.querySelector('input[name="jenis_pasien"]:checked');
    
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
      jenis_pasien: jenisPasienRadio.value
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
        const modal = bootstrap.Modal.getInstance(document.getElementById("addQueueModal"));
        modal.hide();

        document.getElementById("addQueueForm").reset();
        document.getElementById("patientSelectContainer").style.display = "none";
        document.getElementById("selectedPatientInfo").style.display = "none";
        document.getElementById("jenisPatienContainer").style.display = "none";
        this.hideAllSatusehatAlerts();
        this.satusehatChecked = false;

        await this.loadQueues();
        alert("✓ Antrian berhasil ditambahkan!");
      } else {
        alert("✗ Gagal menambahkan antrian: " + (result.error || result.message || "Unknown error"));
      }
    } catch (error) {
      console.error("❌ Error saving queue:", error);
      alert("✗ Error: " + error.message);
    }
  }

  async acceptQueue(id) {
    if (!confirm("Terima antrian pasien ini?")) return;

    console.log("✅ Accepting queue ID:", id);

    try {
      const response = await fetch(`${this.apiUrl}?action=accept&id=${id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      const result = await response.json();

      if (result.success) {
        await this.loadQueues();
        alert("✓ Antrian berhasil diterima");
      } else {
        alert("✗ Gagal menerima antrian: " + (result.message || ""));
      }
    } catch (error) {
      console.error("❌ Error accepting queue:", error);
      alert("✗ Error: " + error.message);
    }
  }

  async deleteQueue(id) {
    if (!confirm("Apakah Anda yakin ingin menghapus antrian ini?")) return;

    console.log("🗑️ Deleting queue ID:", id);

    try {
      const response = await fetch(`${this.apiUrl}?action=delete&id=${id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      const result = await response.json();

      if (result.success) {
        await this.loadQueues();
        alert("✓ Antrian berhasil dihapus!");
      } else {
        alert("✗ Gagal menghapus antrian");
      }
    } catch (error) {
      console.error("❌ Error deleting queue:", error);
      alert("✗ Error: " + error.message);
    }
  }

  updateTable() {
    const tbody = document.getElementById("queueTableBody");
    if (tbody) {
      tbody.innerHTML = this.renderQueueRows();
    }
  }

  onDestroy() {
    window.currentFragment = null;
  }
}

console.log("✅ AntrianFragment with SATUSEHAT & BPJS/UMUM integration loaded successfully");