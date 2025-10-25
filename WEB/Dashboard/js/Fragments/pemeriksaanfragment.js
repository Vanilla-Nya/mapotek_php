console.log("🔥 PEMERIKSAAN FRAGMENT - BLOCKCHAIN VERSION 🔥");

class PemeriksaanFragment {
  constructor() {
    this.title = "Pemeriksaan";
    this.icon = "bi-heart-pulse";
    this.queues = [];
    this.currentDoctorId = null;
    this.currentDoctorName = "";
    this.apiUrl = "../API/auth/antrian.php";
    this.profileApiUrl = "../API/auth/profile.php";
  }

  render() {
    return `
      <div>
        <div class="d-flex justify-content-between align-items-center mb-4">
          <div>
            <h2 class="mb-1">Pemeriksaan Pasien</h2>
            <p class="text-muted mb-0" id="doctorInfo">
              <i class="bi bi-person-circle me-1"></i>Loading...
            </p>
          </div>
        </div>
        
        <div class="card shadow-sm border-0">
          <div class="card-header bg-white border-bottom">
            <div class="d-flex justify-content-between align-items-center">
              <span class="fw-bold">DAFTAR PASIEN UNTUK DIPERIKSA</span>
              <div>
                <span class="badge bg-primary me-2" id="queueCount">0 Pasien</span>
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

      <style>
        .btn-custom-teal { background-color: #5CD4C8; color: white; border: none; }
        .btn-custom-teal:hover { background-color: #4AC4B8; color: white; }
        .bg-custom-teal { background-color: #5CD4C8; }
        .btn-periksa { background-color: #0d6efd; color: white; border: none; padding: 6px 20px; border-radius: 20px; font-size: 0.85rem; }
        .btn-periksa:hover { background-color: #0b5ed7; }
        .badge-status { padding: 6px 16px; border-radius: 20px; font-size: 0.85rem; font-weight: 500; }
        .status-belum-periksa { background-color: #ffc107; color: #000; }
        .status-di-terima { background-color: #17a2b8; color: white; }
        .status-sedang-periksa { background-color: #0dcaf0; color: #000; }
        .status-selesai { background-color: #198754; color: white; }
        .status-batal { background-color: #dc3545; color: white; }
        .table thead th { font-weight: 600; font-size: 0.85rem; padding: 1rem; }
        .table tbody td { padding: 1rem; vertical-align: middle; }
      </style>
    `;
  }

  renderQueueRows() {
    if (this.queues.length === 0) {
      return `
        <tr>
          <td colspan="7" class="text-center py-5">
            <i class="bi bi-inbox fs-1 text-muted"></i>
            <p class="text-muted mt-3">Belum ada pasien yang perlu diperiksa</p>
            <small class="text-muted">Pasien yang sudah diterima akan muncul di sini</small>
          </td>
        </tr>
      `;
    }

    return this.queues.map((queue) => {
      const statusClass = `status-${queue.status_antrian.toLowerCase().replace(" ", "-")}`;
      const patientName = queue.nama ?? "-";
      const patientNik = queue.nik ?? "-";

      // Only show PERIKSA button for queues with status "Di Terima"
      const actionButtons = queue.status_antrian.toLowerCase() === "di terima" 
        ? `<button class="btn btn-periksa btn-sm" onclick="window.currentFragment.periksaQueue('${queue.id_antrian}')"><i class="bi bi-heart-pulse me-1"></i>PERIKSA</button>`
        : `<span class="text-muted"><i class="bi bi-check-circle me-1"></i>-</span>`;

      return `
        <tr>
          <td><strong class="text-primary fs-5">${queue.no_antrian}</strong></td>
          <td>${queue.tanggal_antrian}</td>
          <td><strong>${queue.jam_antrian}</strong></td>
          <td>${patientName}</td>
          <td><small>${patientNik}</small></td>
          <td><span class="badge badge-status ${statusClass}">${queue.status_antrian}</span></td>
          <td>${actionButtons}</td>
        </tr>
      `;
    }).join("");
  }

  async onInit() {
    console.log("🎬 Pemeriksaan Fragment Initialized");
    window.currentFragment = this;

    await this.loadCurrentDoctor();
    await this.loadQueues();
    this.setupEventListeners();

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
          doctorInfo.innerHTML = `<i class="bi bi-person-circle me-1"></i>Dokter: <strong>Dr. ${this.currentDoctorName}</strong>`;
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
    const refreshBtn = document.getElementById("refreshBtn");
    if (refreshBtn) refreshBtn.addEventListener("click", () => this.loadQueues());
  }

  async loadQueues() {
    if (!this.currentDoctorId) {
      console.error("❌ No doctor ID available");
      return;
    }

    try {
      let { data, error } = await window.supabaseClient.rpc('get_latest_antrian_for_dokter', { p_dokter: this.currentDoctorId });
      console.log("📥 Loaded queues:", data, error);

      if (Array.isArray(data)) {
        // Filter to show only "Di Terima" status for examination
        this.queues = data.filter(q => 
          q.status_antrian.toLowerCase() === "di terima" || 
          q.status_antrian.toLowerCase() === "sedang periksa" || 
          q.status_antrian.toLowerCase() === "selesai"
        );
        
        this.updateTable();

        const countBadge = document.getElementById("queueCount");
        if (countBadge) {
          countBadge.textContent = `${this.queues.length} Pasien`;
        }
      }
    } catch (error) {
      console.error("❌ Error loading queues:", error);
      alert("Error loading queues: " + error.message);
    }
  }

  async periksaQueue(id) {
    if (!confirm("Mulai pemeriksaan untuk pasien ini?")) return;

    console.log("=".repeat(50));
    console.log("🔗 BLOCKCHAIN MODE: INSERT ONLY");
    console.log("=".repeat(50));
    console.log("🩺 Starting examination for queue ID:", id);
    console.log("📝 This will INSERT a new blockchain record with status 'Sedang Periksa'");
    console.log("=".repeat(50));

    try {
      const response = await fetch(`${this.apiUrl}?action=periksa&id=${id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      const result = await response.json();
      console.log("📥 Server Response:", result);

      if (result.success) {
        console.log("✅ SUCCESS! New blockchain record created!");
        console.log("🔗 Hash:", result.hash);
        console.log("📎 References original ID:", result.reference_id);
        console.log("=".repeat(50));
        
        await this.loadQueues();
        alert("✓ Pemeriksaan dimulai!\n🔗 Hash: " + result.hash.substring(0, 16) + "...");
        
        // TODO: Navigate to pemeriksaan detail page
        // You can add navigation logic here
        console.log("📋 TODO: Navigate to pemeriksaan detail page for queue:", id);
      } else {
        alert("✗ Gagal memulai pemeriksaan: " + (result.message || ""));
      }
    } catch (error) {
      console.error("❌ Error starting examination:", error);
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
    console.log('Pemeriksaan fragment destroyed');
  }
}

console.log("✅ PemeriksaanFragment class loaded successfully");