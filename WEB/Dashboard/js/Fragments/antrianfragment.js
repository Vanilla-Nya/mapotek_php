console.log("🔥 ANTRIAN FRAGMENT - AUTO-DETECT DOCTOR VERSION 🔥");

// Antrian Fragment - Shows Only Logged-in Doctor's Patients
class AntrianFragment {
  constructor() {
    this.title = "Antrian";
    this.icon = "bi-clock-history";
    this.queues = [];
    this.patients = [];
    this.currentDoctorId = null; // Auto-filled from profile
    this.currentDoctorName = ""; // For display
    this.apiUrl = "../API/auth/antrian.php";
    this.profileApiUrl = "../API/auth/profile.php";
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

                <!-- Filter Section (No Doctor Dropdown) -->
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
                                        <th class="text-success">STATUS</th>
                                        <th class="text-success">AKSI</th>
                                    </tr>
                                </thead>
                                <tbody id="queueTableBody">
                                    <tr>
                                        <td colspan="7" class="text-center py-4">
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
                                <!-- No Doctor Selection - Auto from Profile -->
                                
                                <!-- Patient Search -->
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

                                <!-- Patient Selection -->
                                <div class="mb-3" id="patientSelectContainer" style="display: none;">
                                    <label class="form-label">Pilih Pasien <span class="text-danger">*</span></label>
                                    <select class="form-select" id="patientSelect" required>
                                        <option value="">-- Pilih Pasien --</option>
                                    </select>
                                </div>

                                <!-- Selected Patient Info -->
                                <div class="alert alert-info" id="selectedPatientInfo" style="display: none;">
                                    <strong><i class="bi bi-person-check me-2"></i>Pasien Terpilih:</strong>
                                    <div id="patientInfoText" class="mt-2"></div>
                                </div>

                                <hr>

                                <div class="row">
                                    <div class="col-md-6">
                                        <div class="mb-3">
                                            <label class="form-label">Tanggal Antrian <span class="text-danger">*</span></label>
                                            <input type="date" class="form-control" id="queueDate" required value="${
                                              new Date()
                                                .toISOString()
                                                .split("T")[0]
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

            <style>
                .btn-custom-teal {
                    background-color: #5CD4C8;
                    color: white;
                    border: none;
                }
                .btn-custom-teal:hover {
                    background-color: #4AC4B8;
                    color: white;
                }
                .bg-custom-teal {
                    background-color: #5CD4C8;
                }
                .btn-delete {
                    background-color: #dc3545;
                    color: white;
                    border: none;
                    padding: 6px 24px;
                    border-radius: 20px;
                    font-size: 0.85rem;
                }
                .btn-delete:hover {
                    background-color: #bb2d3b;
                }
                .badge-status {
                    padding: 6px 16px;
                    border-radius: 20px;
                    font-size: 0.85rem;
                    font-weight: 500;
                }
                .status-belum-periksa {
                    background-color: #ffc107;
                    color: #000;
                }
                .status-sedang-periksa {
                    background-color: #0dcaf0;
                    color: #000;
                }
                .status-selesai {
                    background-color: #198754;
                    color: white;
                }
                .status-batal {
                    background-color: #dc3545;
                    color: white;
                }
                .table thead th {
                    font-weight: 600;
                    font-size: 0.85rem;
                    padding: 1rem;
                }
                .table tbody td {
                    padding: 1rem;
                    vertical-align: middle;
                }
            </style>
        `;
  }

  renderQueueRows() {
    if (this.queues.length === 0) {
      return `
                <tr>
                    <td colspan="7" class="text-center py-5">
                        <i class="bi bi-inbox fs-1 text-muted"></i>
                        <p class="text-muted mt-3">Belum ada antrian hari ini</p>
                        <small class="text-muted">Klik "Tambah Antrian Baru" untuk menambahkan pasien</small>
                    </td>
                </tr>
            `;
    }

    return this.queues
      .map((queue) => {
        const statusClass = `status-${queue.status_antrian
          .toLowerCase()
          .replace(" ", "-")}`;
        const patientName = queue.pasien ? queue.pasien.nama : "-";
        const patientNik = queue.pasien ? queue.pasien.nik : "-";

        return `
                <tr>
                    <td><strong class="text-primary fs-5">${queue.no_antrian}</strong></td>
                    <td>${queue.tanggal_antrian}</td>
                    <td><strong>${queue.jam_antrian}</strong></td>
                    <td>${patientName}</td>
                    <td><small>${patientNik}</small></td>
                    <td><span class="badge badge-status ${statusClass}">${queue.status_antrian}</span></td>
                    <td>
                        <button class="btn btn-delete btn-sm" onclick="window.currentFragment.deleteQueue(${queue.id_antrian})">
                            HAPUS
                        </button>
                    </td>
                </tr>
            `;
      })
      .join("");
  }

  async onInit() {
    console.log("🎬 Antrian Fragment Initialized");

    window.currentFragment = this;

    // STEP 1: Load current doctor's profile
    await this.loadCurrentDoctor();

    // STEP 2: Load their queues
    await this.loadQueues();

    // STEP 3: Setup event listeners
    this.setupEventListeners();

    // STEP 4: Set current time
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
      // Get email from session storage (set during login)
      const token = localStorage.getItem("access_token");
      const data = JSON.parse(localStorage.getItem("user")).email;

      if (!token) {
        console.error("❌ No user email found in session");
        alert("Error: Anda belum login. Silakan login terlebih dahulu.");
        // Redirect to login page
        // window.location.href = '/login.html';
        return;
      }

      // Call profile API to get doctor info
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
      console.log(response);

      console.log("📋 Profile result:", result);

      if (result.success && result.data) {
        this.currentDoctorId = result.data.id_dokter;
        this.currentDoctorName = result.data.nama_lengkap;

        console.log("✅ Doctor ID:", this.currentDoctorId);
        console.log("✅ Doctor Name:", this.currentDoctorName);

        // Update UI to show doctor name
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
    console.log("🎛️ Setting up event listeners...");

    // Add Queue Button
    const addBtn = document.getElementById("addQueueBtn");
    if (addBtn) {
      addBtn.addEventListener("click", async () => {
        if (!this.currentDoctorId) {
          alert("Error: Doctor ID tidak ditemukan. Silakan refresh halaman.");
          return;
        }
        await this.generateQueueNumber();
        const modal = new bootstrap.Modal(
          document.getElementById("addQueueModal")
        );
        modal.show();
      });
    }

    // Search Patient Button
    const searchBtn = document.getElementById("searchPatientBtn");
    if (searchBtn) {
      searchBtn.addEventListener("click", () => this.searchPatients());
    }

    // Patient Search on Enter
    const searchInput = document.getElementById("patientSearch");
    if (searchInput) {
      searchInput.addEventListener("keypress", (e) => {
        if (e.key === "Enter") {
          e.preventDefault();
          this.searchPatients();
        }
      });
    }

    // Patient Select
    const patientSelect = document.getElementById("patientSelect");
    if (patientSelect) {
      patientSelect.addEventListener("change", (e) =>
        this.showPatientInfo(e.target.value)
      );
    }

    // Save Button
    const saveBtn = document.getElementById("saveQueueBtn");
    if (saveBtn) {
      saveBtn.addEventListener("click", () => this.saveQueue());
    }

    // Apply Filter Button
    const applyFilterBtn = document.getElementById("applyFilterBtn");
    if (applyFilterBtn) {
      applyFilterBtn.addEventListener("click", () => this.applyFilters());
    }

    // Refresh Button
    const refreshBtn = document.getElementById("refreshBtn");
    if (refreshBtn) {
      refreshBtn.addEventListener("click", () => this.loadQueues());
    }
  }

  async generateQueueNumber() {
    console.log("🔢 Generating queue number...");

    try {
      const url = `${this.apiUrl}?action=generate_number`;
      const response = await fetch(url);
      const data = await response.json();

      console.log("✅ Generated number:", data.no_antrian);

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

    console.log("🔍 Searching patients with keyword:", keyword);

    try {
      const url = `${
        this.apiUrl
      }?action=search_pasien&keyword=${encodeURIComponent(keyword)}`;
      const response = await fetch(url);
      const data = await response.json();

      console.log("👥 Search results:", data.length, "patients");

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
    } else {
      infoDiv.style.display = "none";
      hiddenInput.value = "";
    }
  }

  async loadQueues() {
    console.log("🔄 Loading queues for doctor:", this.currentDoctorId);

    if (!this.currentDoctorId) {
      console.error("❌ No doctor ID available");
      return;
    }

    try {
      // Load only current doctor's queues
      const url = `${this.apiUrl}?action=list_by_doctor&dokter_id=${this.currentDoctorId}`;

      console.log("📡 Fetching from:", url);

      const response = await fetch(url);
      const data = await response.json();

      console.log("✅ Loaded:", data.length, "queues");

      if (Array.isArray(data)) {
        this.queues = data;
        this.updateTable();

        // Update queue count badge
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
    console.log("🔍 Applying filters...");

    if (!this.currentDoctorId) {
      console.error("❌ No doctor ID");
      alert("Error: Doctor ID tidak ditemukan");
      return;
    }

    const tanggal = document.getElementById("filterDate").value;
    const jamMulai = document.getElementById("filterStartTime").value;
    const jamAkhir = document.getElementById("filterEndTime").value;

    try {
      // Always filter by current doctor
      const url = `${this.apiUrl}?action=filter_by_hour&tanggal=${tanggal}&jam_mulai=${jamMulai}&jam_akhir=${jamAkhir}&dokter_id=${this.currentDoctorId}`;

      console.log("📡 Filtering with:", url);

      const response = await fetch(url);
      const data = await response.json();

      console.log("✅ Filter results:", data.length, "queues");

      if (Array.isArray(data)) {
        this.queues = data;
        this.updateTable();

        // Update count
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
    console.log("💾 Saving queue...");

    if (!this.currentDoctorId) {
      alert("Error: Doctor ID tidak ditemukan");
      return;
    }

    const date = document.getElementById("queueDate").value;
    const time = document.getElementById("queueTime").value;
    const number = document.getElementById("queueNumber").value;
    const patientId = document.getElementById("selectedPatientId").value;

    if (!date || !time || !number || !patientId) {
      alert("Mohon lengkapi semua field dan pilih pasien!");
      return;
    }

    const newQueue = {
      tanggal_antrian: date,
      jam_antrian: time,
      no_antrian: number,
      id_pasien: patientId,
      id_dokter: this.currentDoctorId, // Auto from profile
    };

    console.log("📤 Sending data:", newQueue);

    try {
      const response = await fetch(`${this.apiUrl}?action=create`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newQueue),
      });

      const result = await response.json();
      console.log("✅ Save result:", result);

      if (result && !result.error) {
        // Close modal
        const modal = bootstrap.Modal.getInstance(
          document.getElementById("addQueueModal")
        );
        modal.hide();

        // Reset form
        document.getElementById("addQueueForm").reset();
        document.getElementById("patientSelectContainer").style.display =
          "none";
        document.getElementById("selectedPatientInfo").style.display = "none";

        // Reload queues
        await this.loadQueues();
        alert("✓ Antrian berhasil ditambahkan!");
      } else {
        alert(
          "✗ Gagal menambahkan antrian: " + (result.error || "Unknown error")
        );
      }
    } catch (error) {
      console.error("❌ Error saving queue:", error);
      alert("✗ Error: " + error.message);
    }
  }

  async deleteQueue(id) {
    if (!confirm("Apakah Anda yakin ingin menghapus antrian ini?")) {
      return;
    }

    console.log("🗑️ Deleting queue ID:", id);

    try {
      const response = await fetch(`${this.apiUrl}?action=delete&id=${id}`, {
        method: "DELETE",
      });

      const result = await response.json();
      console.log("✅ Delete result:", result);

      if (result.success) {
        await this.loadQueues();
        alert("✓ Antrian berhasil dihapus");
      } else {
        alert("✗ Gagal menghapus antrian");
      }
    } catch (error) {
      console.error("❌ Error deleting queue:", error);
      alert("✗ Error: " + error.message);
    }
  }

  updateTable() {
    console.log("🔄 Updating table...");
    const tbody = document.getElementById("queueTableBody");
    if (tbody) {
      tbody.innerHTML = this.renderQueueRows();
      console.log("✅ Table updated with", this.queues.length, "rows");
    }
  }

  onDestroy() {
    console.log("💀 Antrian fragment destroyed");
    window.currentFragment = null;
  }
}

console.log("✅ AntrianFragment class loaded successfully");
