class ObatFragment {
  constructor() {
    this.title = "Obat";
    this.icon = "bi-capsule";
    this.apiUrl = "/MAPOTEK_PHP/WEB/obat/obatEndpoint.php";
    this.medicines = [];
    this.loadingEl = null;
    this.tableContainer = null;
    this.tableBody = null;
    this.emptyState = null;
    this.bentukObatOptions = [];
    this.jenisObatOptions = [];
    this.userEmail = null;           // ✅ TAMBAH
    this.currentDokterId = null;
  }

  render() {
    return `
      <div>
        <!-- Header -->
        <div class="d-flex justify-content-between align-items-center mb-4">
          <div>
            <h2 class="mb-1">Data Obat</h2>
            <p class="text-muted mb-0">Kelola stok obat</p>
          </div>
          <button class="btn btn-primary" data-bs-toggle="modal" data-bs-target="#modalTambahObat">
            <i class="bi bi-plus-circle me-2"></i>Tambah Obat
          </button>
        </div>

        <!-- Filter Section -->
        <div class="row mb-3">
          <div class="col-md-6">
            <div class="btn-group">
              <button class="btn btn-primary active" id="btnAll">Semua</button>
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

        <!-- Loading -->
        <div id="loadingObat" class="text-center py-4">
          <div class="spinner-border text-primary" role="status">
            <span class="visually-hidden">Loading...</span>
          </div>
          <p class="text-muted mt-2">Memuat data obat...</p>
        </div>

        <!-- Table -->
        <div class="card shadow-sm border-0" id="tableContainer" style="display: none;">
          <div class="card-body">
            <div class="table-responsive">
              <table class="table table-hover" id="medicineTable">
                <thead class="table-light">
                  <tr>
                    <th>Nama Obat</th>
                    <th>Bentuk Obat</th>
                    <th>Jenis</th>
                    <th>Harga</th>
                    <th>Stock</th>
                    <th>Expired Date</th>
                    <th width="150">Aksi</th>
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
                <!-- BARIS 1: Nama obat, Jenis obat, Bentuk obat -->
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
                      <!-- options diisi via JS -->
                    </select>
                    <div class="invalid-feedback">Pilih jenis obat.</div>
                  </div>
                  <div class="col-md-3">
                    <label for="bentuk_obat" class="form-label">Bentuk Obat</label>
                    <select id="bentuk_obat" name="bentuk_obat" class="form-select" required>
                      <option value="">Pilih bentuk...</option>
                      <!-- Opsi akan diisi dari JS saat modal dibuka -->
                    </select>
                    <div class="invalid-feedback">Pilih bentuk obat.</div>
                  </div>
                </div>

                <!-- BARIS 2: Harga jual, Harga beli, Stok -->
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

                <!-- BARIS 3: Tanggal Expired -->
                <div class="row mb-3">
                  <div class="col-md-5">
                    <label for="tanggal_expired" class="form-label">Tanggal Expired</label>
                    <input type="date" id="tanggal_expired" name="tanggal_expired" class="form-control" required>
                    <div class="invalid-feedback">Pilih tanggal expired.</div>
                  </div>
                </div>

                <!-- Area feedback -->
                <div id="formFeedback" class="mt-2"></div>
              </form>
            </div>

            <!-- Footer: tombol batal & simpan -->
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
    `;
  }

  /**
   * Format input Rupiah
   */
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

  /**
   * Inisialisasi fragment
   */
  async onInit() {
    console.log("=== ObatFragment initialized ===");
    
    // ========================================
    // 1️⃣ CEK SESSION USER (CRITICAL!)
    // ========================================
    const user = JSON.parse(localStorage.getItem('user') || 'null');
    
    if (!user || !user.email) {
        console.error('❌ No user session found!');
        alert('Session expired. Please login again.');
        window.location.href = '../LandingPage/booksaw-1.0.0/index.html';
        return;
    }
    
    // ✅ Simpan email user
    this.userEmail = user.email;
    console.log("✅ User logged in:", this.userEmail);
    
    // ========================================
    // 2️⃣ AMBIL ID DOKTER DARI SUPABASE
    // ========================================
    try {
        await this.initializeDoctorId();
        
        if (!this.currentDokterId) {
            console.error('❌ Failed to get doctor ID!');
            alert('Gagal mengambil data dokter. Silakan refresh halaman atau login ulang.');
            return;
        }
        
        console.log("✅ Doctor ID loaded:", this.currentDokterId);
        
    } catch (error) {
        console.error('❌ Error during doctor ID initialization:', error);
        alert('Terjadi kesalahan saat mengambil data dokter: ' + error.message);
        return;
    }
    
    // ========================================
    // 3️⃣ CACHE ELEMENT DOM
    // ========================================
    this.loadingEl = document.getElementById("loadingObat");
    this.tableContainer = document.getElementById("tableContainer");
    this.tableBody = document.getElementById("medicineTableBody");
    this.emptyState = document.getElementById("emptyState");
    
    // Validasi elemen penting
    if (!this.loadingEl || !this.tableContainer || !this.tableBody) {
        console.error('❌ Required DOM elements not found!');
        alert('Terjadi kesalahan pada halaman. Silakan refresh.');
        return;
    }
    
    console.log("✅ DOM elements cached");
  
    // ========================================
    // 4️⃣ INIT LISTENER RUPIAH
    // ========================================
    this.initRupiahListener();
    console.log("✅ Rupiah listener initialized");
    
    // ========================================
    // 5️⃣ LOAD DATA SECARA PARALEL
    // ========================================
    console.log("📡 Loading data...");
    
    try {
        await Promise.all([
            this.loadMedicines(),
            this.getAllJenisObat(),
            this.getAllBentukObat()
        ]);
        
        console.log("✅ All data loaded successfully");
        console.log("   - Medicines:", this.medicines.length);
        console.log("   - Jenis Obat:", this.jenisObatOptions.length);
        console.log("   - Bentuk Obat:", this.bentukObatOptions.length);
        
    } catch (error) {
        console.error('❌ Error loading data:', error);
        alert('Gagal memuat data obat: ' + error.message);
    }
    
    // ========================================
    // 6️⃣ SETUP EVENT LISTENERS UNTUK MODAL
    // ========================================
    this.setupModalListeners();
    console.log("✅ Modal listeners setup");
    
    console.log("=== ObatFragment initialization complete ===");
  }
  

  /**
   * Setup event listeners untuk modal
   */
  setupModalListeners() {
    const modal = document.getElementById('modalTambahObat');
    if (modal) {
        modal.addEventListener('shown.bs.modal', () => {
            console.log('📢 Modal opened, populating selects...');
            this.populateJenisSelect();
            this.populateBentukSelect();
        });
        
        modal.addEventListener('hidden.bs.modal', () => {
            console.log('📢 Modal closed, resetting form...');
            this.resetForm();
        });
    }
    
    // Event listener untuk tombol simpan
    const btnSimpan = document.getElementById('btnSimpanObat');
    if (btnSimpan) {
        btnSimpan.addEventListener('click', () => {
            this.handleSubmit();
        });
    }
  }

  /**
   * Ambil data obat dari API
   */
  async loadMedicines() {
    this.showLoading(true);
    
    try {
      const response = await fetch(this.apiUrl);
      if (!response.ok) throw new Error(`HTTP Error ${response.status}`);
      
      const text = await response.text();
      let result;
      
      try {
        result = JSON.parse(text);
      } catch (err) {
        console.error("❌ JSON parse error:", err, text);
        throw new Error("Respon server tidak valid (bukan JSON)");
      }
      
      if (!result.success) {
        throw new Error(result.message || "Gagal mengambil data obat");
      }
      
      this.medicines = Array.isArray(result.data) ? result.data : [];
      console.log("✅ Data obat berhasil diambil:", this.medicines.length);
      this.renderTable();
      
    } catch (error) {
      console.error("❌ Gagal memuat data obat:", error);
      alert("Gagal memuat data obat: " + error.message);
    } finally {
      this.showLoading(false);
    }
  }

  /**
   * Ambil data jenis obat dari API
   */
 async getAllJenisObat() {
  try {
    const res = await fetch(`${this.apiUrl}?action=get_jenis`);
    console.log('📡 Fetching jenis obat...');
    
    if (!res.ok) throw new Error('HTTP ' + res.status);
    
    const json = await res.json();
    console.log('📦 Jenis obat response:', json);
    
    if (!json.success) throw new Error(json.message || 'Gagal ambil jenis');

    const data = Array.isArray(json.data) ? json.data : [];
    this.jenisObatOptions = data;
    
    console.log(`✅ Jenis obat loaded: ${data.length} items`);
    console.log('📋 Detail data:', data);  // ✅ Tambah debug log
    
  } catch (err) {
    console.error('❌ Error getAllJenisObat:', err);
    this.jenisObatOptions = [];
  }
}

/**
 * Populate select jenis obat (dipanggil saat modal dibuka)
 */
populateJenisSelect() {
  const sel = document.getElementById('id_jenis_obat');
  
  if (!sel) {
      console.error('❌ Element #id_jenis_obat tidak ditemukan!');
      return;
  }
  
  console.log(`🔄 Populating id_jenis_obat dengan ${this.jenisObatOptions.length} options...`);
  
  sel.innerHTML = `<option value="">Pilih jenis...</option>`;
  
  this.jenisObatOptions.forEach((item, index) => {
      const opt = document.createElement('option');
      
      // ✅ Handle object vs string
      if (typeof item === 'object' && item !== null) {
          // Support multiple field names
          opt.value = item.id_jenis_obat || item.id || '';
          opt.textContent = item.nama_jenis_obat || item.nama_jenis || item.nama || `Item ${index + 1}`;
          
          console.log(`✅ [${index}] Added: ID="${opt.value}" Name="${opt.textContent}"`);
      } else {
          opt.value = item;
          opt.textContent = item;
          console.log(`✅ [${index}] Added string: "${item}"`);
      }
      
      sel.appendChild(opt);
  });
  
  console.log(`✅ Total options in select: ${sel.options.length}`);
}

  /**
   * Ambil data bentuk obat dari API (hanya simpan data, tidak populate)
   */
  async getAllBentukObat() {
    try {
      const res = await fetch(`${this.apiUrl}?action=get_bentuk`);
      console.log('📡 Fetching bentuk obat...');
      
      if (!res.ok) throw new Error('HTTP ' + res.status);
      
      const json = await res.json();
      console.log('📦 Bentuk obat response:', json);
      
      if (!json.success) throw new Error(json.message || 'Gagal ambil bentuk');

      const data = Array.isArray(json.data) ? json.data : [];
      this.bentukObatOptions = data;
      
      console.log(`✅ Bentuk obat loaded: ${data.length} items`, data);
      
    } catch (err) {
      console.error('❌ Error getAllBentukObat:', err);
      this.bentukObatOptions = [];
    }
  }

  /**
   * Populate select jenis obat (dipanggil saat modal dibuka)
   */
 

  /**
   * Populate select bentuk obat (dipanggil saat modal dibuka)
   */
  populateBentukSelect() {
    const sel = document.getElementById('bentuk_obat');
    
    if (!sel) {
        console.error('❌ Element #bentuk_obat tidak ditemukan!');
        return;
    }
    
    console.log(`🔄 Populating bentuk_obat dengan ${this.bentukObatOptions.length} options...`);
    
    sel.innerHTML = `<option value="">Pilih bentuk...</option>`;
    
    this.bentukObatOptions.forEach(item => {
        const opt = document.createElement('option');
        opt.value = item;
        opt.textContent = item;
        sel.appendChild(opt);
    });
    
    console.log(`✅ Bentuk obat berhasil di-populate: ${sel.options.length} options`);
  }

  /**
   * Render tabel obat ke HTML
   */
  renderTable() {
    if (!this.tableBody) return;

    if (this.medicines.length === 0) {
      this.tableBody.innerHTML = "";
      if (this.emptyState) this.emptyState.style.display = "block";
      if (this.tableContainer) this.tableContainer.style.display = "none";
      return;
    }

    if (this.emptyState) this.emptyState.style.display = "none";
    if (this.tableContainer) this.tableContainer.style.display = "block";

    const html = this.medicines
      .map(
        (med) => `
          <tr>
            <td><strong>${this.escapeHtml(med.nama_obat)}</strong></td>
            <td>${this.escapeHtml(med.bentuk_obat || "-")}</td>
            <td><span class="badge bg-info">${this.escapeHtml(med.jenis || "-")}</span></td>
            <td>Rp ${this.formatCurrency(med.harga)}</td>
            <td>${med.stock ?? 0}</td>
            <td>${med.expired_date ? this.formatDate(med.expired_date) : "-"}</td>
            <td>
              <button class="btn btn-outline-info btn-sm" title="Detail Obat">
                <i class="bi bi-info-circle"></i> Detail
              </button>
            </td>
          </tr>
        `
      )
      .join("");

    this.tableBody.innerHTML = html;
  }

  /**
   * Handle submit form tambah obat
   */
  async handleSubmit() {
    const form = document.getElementById('formTambahObat');
    const btnLabel = document.getElementById('btnSimpanLabel');
    const btnSpinner = document.getElementById('btnSimpanSpinner');
    const feedback = document.getElementById('formFeedback');
    
    // Validasi form
    if (!form.checkValidity()) {
      form.classList.add('was-validated');
      return;
    }
     if (!this.currentDokterId) {
      feedback.innerHTML = `<div class="alert alert-danger">❌ ID Dokter tidak ditemukan.</div>`;
      return;
    }
    
    // Show loading
    btnLabel.textContent = 'Menyimpan...';
    btnSpinner.classList.remove('d-none');
    
    try {
      // Ambil data form
      const formData = new FormData(form);
       const payload = {
        action: 'add_obat',
        nama_obat: formData.get('nama_obat'),
        id_jenis_obat: formData.get('id_jenis_obat'),
        bentuk_obat: formData.get('bentuk_obat'),
        harga_jual: this.parseRupiah(formData.get('harga_jual_master')),
        harga_beli: this.parseRupiah(formData.get('harga_beli')),
        stok: parseInt(formData.get('stok')),
        tanggal_expired: formData.get('tanggal_expired'),
        id_dokter: this.currentDokterId,  // ✅ TAMBAH
        email: this.userEmail              // ✅ TAMBAH
    };
      
      console.log('📤 Sending payload:', payload);
      
      // Send to API
      const response = await fetch(this.apiUrl, {
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
      
      // Success
      feedback.innerHTML = `<div class="alert alert-success">✅ ${result.message || 'Data berhasil disimpan'}</div>`;
      
      // Reload data
      await this.loadMedicines();
      
      // Close modal after 1 second
      setTimeout(() => {
        const modal = bootstrap.Modal.getInstance(document.getElementById('modalTambahObat'));
        if (modal) modal.hide();
      }, 1000);
      
    } catch (error) {
      console.error('❌ Error saving:', error);
      feedback.innerHTML = `<div class="alert alert-danger">❌ ${error.message}</div>`;
    } finally {
      btnLabel.textContent = 'Simpan';
      btnSpinner.classList.add('d-none');
    }
  }

  async initializeDoctorId() {
    try {
        if (!window.supabaseClient) {
            console.error('❌ Supabase not initialized');
            alert('Supabase tidak tersedia. Silakan refresh halaman.');
            return;
        }

        const { data: dokter, error } = await window.supabaseClient
            .from('dokter')
            .select('id_dokter')
            .eq('email', this.userEmail)
            .single();

        if (error || !dokter) {
            console.error('❌ Could not get doctor ID:', error);
            alert('Data dokter tidak ditemukan. Silakan login ulang.');
            return;
        }

        this.currentDokterId = dokter.id_dokter;
        localStorage.setItem('currentDokterId', this.currentDokterId);
        
        console.log('✅ Doctor ID loaded:', this.currentDokterId);

    } catch (error) {
        console.error('❌ Error initializing doctor ID:', error);
        alert('Gagal mengambil data dokter: ' + error.message);
    }
}

  /**
   * Reset form
   */
  resetForm() {
    const form = document.getElementById('formTambahObat');
    const feedback = document.getElementById('formFeedback');
    
    if (form) {
      form.reset();
      form.classList.remove('was-validated');
    }
    
    if (feedback) {
      feedback.innerHTML = '';
    }
  }

  /**
   * Parse rupiah string ke number
   */
  parseRupiah(rupiahStr) {
    if (!rupiahStr) return 0;
    return parseInt(rupiahStr.replace(/[^\d]/g, '')) || 0;
  }

  /**
   * Tampilkan atau sembunyikan animasi loading
   */
  showLoading(show) {
    if (this.loadingEl) this.loadingEl.style.display = show ? "block" : "none";
    if (this.tableContainer) this.tableContainer.style.display = show ? "none" : "block";
  }

  /**
   * Helper: Format currency
   */
  formatCurrency(value) {
    return new Intl.NumberFormat("id-ID").format(value ?? 0);
  }

  /**
   * Helper: Format date
   */
  formatDate(dateStr) {
    const date = new Date(dateStr);
    return date.toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  }

  /**
   * Helper: Escape HTML
   */
  escapeHtml(text) {
    return String(text || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }
}