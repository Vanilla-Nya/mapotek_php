console.log("🔥 PEMERIKSAAN SYSTEM - WITH CUSTOM ALERTS & SHARED COMPONENTS 🔥");

// ========================================
// NOTE: LoadingOverlay, CustomAlert, Toast are loaded from antrianfragment.js
// Make sure antrianfragment.js loads BEFORE this file
// ========================================

// ========================================
// SKELETON LOADER UTILITIES (Local to this file)
// ========================================
const PemeriksaanSkeletonLoader = {
  tableRows(columns, rows = 5) {
    let html = '';
    for (let i = 0; i < rows; i++) {
      html += '<tr>';
      for (let j = 0; j < columns; j++) {
        html += `
          <td style="padding: 12px;">
            <div class="skeleton skeleton-text" style="width: ${60 + Math.random() * 40}%;"></div>
          </td>
        `;
      }
      html += '</tr>';
    }
    return html;
  },

  searchResults(count = 5) {
    let html = '';
    for (let i = 0; i < count; i++) {
      html += `
        <tr>
          <td style="padding: 12px;">
            <div class="skeleton skeleton-text" style="width: 80px;"></div>
          </td>
          <td style="padding: 12px;">
            <div class="skeleton skeleton-text large" style="width: 90%; margin-bottom: 4px;"></div>
            <div class="skeleton skeleton-text small" style="width: 60%;"></div>
          </td>
        </tr>
      `;
    }
    return html;
  },

  card() {
    return `
      <div style="padding: 20px;">
        <div class="skeleton skeleton-text large" style="width: 40%; margin-bottom: 16px;"></div>
        <div class="skeleton skeleton-text" style="width: 90%; margin-bottom: 8px;"></div>
        <div class="skeleton skeleton-text" style="width: 80%; margin-bottom: 8px;"></div>
        <div class="skeleton skeleton-text" style="width: 70%;"></div>
      </div>
    `;
  }
};

// Skeleton styles
const pemeriksaanSkeletonStyles = `
  <style>
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
      margin-bottom: 8px;
      border-radius: 4px;
    }

    .skeleton-text.large {
      height: 24px;
    }

    .skeleton-text.small {
      height: 12px;
    }
  </style>
`;

// ========================================
// ICDX SELECTION MODAL CLASS
// ========================================
class ICDXSelectionModal {
  constructor(pemeriksaanModal) {
    this.pemeriksaanModal = pemeriksaanModal;
    this.allICDXData = [];
    this.filteredICDXData = [];
    this.selectedICDX = null;
    this.dataLoaded = false;
    this.searchTimeout = null;
  }

  async show() {
    this.createModal();
    await this.loadICDXData();
  }

  async loadICDXData() {
    if (this.dataLoaded && this.allICDXData.length > 0) {
      console.log("✅ ICDX data already loaded from cache");
      return;
    }

    console.log("📦 Loading ICDX data from JSON file...");
    const tbody = document.getElementById("icdxTableBody");
    
    tbody.innerHTML = PemeriksaanSkeletonLoader.searchResults(8);
    
    try {
      const response = await fetch('/mapotek_php/WEB/Dashboard/resource/icd10.json');
      if (!response.ok) throw new Error('Failed to load icd10.json');
      
      const jsonData = await response.json();
      
      this.allICDXData = jsonData.map(item => ({
        code: item.CODE || '',
        display: item.DISPLAY || '',
        name_en: item.DISPLAY || ''
      }));

      this.filteredICDXData = [...this.allICDXData];
      this.dataLoaded = true;
      
      console.log(`✅ Loaded ${this.allICDXData.length} ICDX records from JSON`);
      
      tbody.innerHTML = `
        <tr>
          <td colspan="2" style="text-align: center; padding: 40px; color: #999;">
            <i class="bi bi-search" style="font-size: 48px; display: block; margin-bottom: 10px;"></i>
            ${this.allICDXData.length} data ICDX tersedia<br>
            <small>Masukkan kata kunci untuk mencari</small>
          </td>
        </tr>
      `;
    } catch (error) {
      console.error("❌ Error loading ICDX data:", error);
      tbody.innerHTML = `
        <tr>
          <td colspan="2" style="text-align: center; padding: 40px; color: #dc3545;">
            <i class="bi bi-exclamation-triangle" style="font-size: 48px; display: block; margin-bottom: 10px;"></i>
            Gagal memuat data ICDX: ${error.message}
          </td>
        </tr>
      `;
    }
  }

  createModal() {
    const existingModal = document.getElementById("icdxSelectionModal");
    if (existingModal) existingModal.remove();

    const modalHTML = `
      <div id="icdxSelectionModal" class="modal-overlay" style="z-index: 1060;">
        <div class="icdx-modal-container">
          <div class="modal-header">
            <h3>🔍 Pencarian ICDX (Diagnosa Penyakit)</h3>
            <button class="close-btn" onclick="icdxSelectionModal.close()">
              <i class="bi bi-x-lg"></i>
            </button>
          </div>

          <div class="icdx-modal-body">
            <div class="search-section" style="display: flex; gap: 10px; margin-bottom: 20px;">
              <input type="text" 
                     id="icdxSearchInput" 
                     class="form-control" 
                     placeholder="🔍 Cari ICDX berdasarkan kode atau deskripsi..."
                     style="flex: 1;"
                     oninput="icdxSelectionModal.handleSearchInput()">
              <button class="btn-primary" onclick="icdxSelectionModal.searchICDX()" style="padding: 0.5rem 1.5rem;">
                <i class="bi bi-search me-1"></i>Cari
              </button>
            </div>

            <div class="table-container" style="max-height: 400px; overflow-y: auto;">
              <table class="table table-hover">
                <thead style="position: sticky; top: 0; background: linear-gradient(135deg, #065f46 0%, #0891b2 100%); z-index: 1;">
                  <tr>
                    <th style="color: white; width: 120px;">Kode ICDX</th>
                    <th style="color: white;">Deskripsi</th>
                  </tr>
                </thead>
                <tbody id="icdxTableBody">
                  ${PemeriksaanSkeletonLoader.searchResults(8)}
                </tbody>
              </table>
            </div>
          </div>

          <div class="modal-footer">
            <button class="btn-secondary" onclick="icdxSelectionModal.close()">
              <i class="bi bi-x-circle me-1"></i>Batal
            </button>
            <button class="btn-success" onclick="icdxSelectionModal.selectICDX()">
              <i class="bi bi-check-circle me-1"></i>Pilih
            </button>
          </div>
        </div>
      </div>

      ${pemeriksaanSkeletonStyles}

      <style>
        .icdx-modal-container {
          background: white;
          border-radius: 12px;
          width: 90%;
          max-width: 900px;
          max-height: 90vh;
          display: flex;
          flex-direction: column;
          box-shadow: 0 1rem 3rem rgba(0, 0, 0, 0.3);
          animation: slideUp 0.3s;
        }

        .icdx-modal-body {
          padding: 2rem;
          overflow-y: auto;
          flex: 1;
        }

        .table tbody tr {
          cursor: pointer;
          transition: background 0.15s;
        }

        .table tbody tr:hover:not(.skeleton-row) {
          background: #f0f9ff !important;
        }

        .table tbody tr.selected {
          background: #d1fae5 !important;
          border-left: 4px solid #065f46;
        }
      </style>
    `;

    document.body.insertAdjacentHTML("beforeend", modalHTML);
    this.attachTableEvents();
  }

  handleSearchInput() {
    if (this.searchTimeout) {
      clearTimeout(this.searchTimeout);
    }

    const tbody = document.getElementById("icdxTableBody");
    tbody.innerHTML = PemeriksaanSkeletonLoader.searchResults(5);

    this.searchTimeout = setTimeout(() => {
      this.searchICDX();
    }, 300);
  }

  searchICDX() {
    const keyword = document.getElementById("icdxSearchInput")?.value.trim().toLowerCase();
    
    if (!keyword) {
      this.filteredICDXData = [...this.allICDXData];
      this.renderICDXTable();
      return;
    }

    const keywords = keyword.split(' ').filter(k => k.length > 0);
    
    this.filteredICDXData = this.allICDXData.filter(icdx => {
      const code = (icdx.code || '').toLowerCase();
      const display = (icdx.display || '').toLowerCase();
      const name_en = (icdx.name_en || '').toLowerCase();
      const searchText = `${code} ${display} ${name_en}`;
      
      return keywords.every(kw => searchText.includes(kw));
    });

    console.log(`🔍 Found ${this.filteredICDXData.length} results for "${keyword}"`);
    this.renderICDXTable();
  }

  renderICDXTable() {
    const tbody = document.getElementById("icdxTableBody");
    
    if (this.filteredICDXData.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="2" style="text-align: center; padding: 40px; color: #999;">
            <i class="bi bi-inbox" style="font-size: 48px; display: block; margin-bottom: 10px;"></i>
            Tidak ada data ICDX ditemukan
          </td>
        </tr>
      `;
      return;
    }

    const fragment = document.createDocumentFragment();
    const maxResults = 100;
    const dataToShow = this.filteredICDXData.slice(0, maxResults);

    dataToShow.forEach((icdx, index) => {
      const tr = document.createElement('tr');
      tr.dataset.index = index;
      tr.style.cursor = 'pointer';
      tr.innerHTML = `
        <td><strong>${icdx.code || 'N/A'}</strong></td>
        <td>${icdx.display || icdx.name_en || 'N/A'}</td>
      `;
      fragment.appendChild(tr);
    });

    tbody.innerHTML = '';
    tbody.appendChild(fragment);

    if (this.filteredICDXData.length > maxResults) {
      const infoRow = document.createElement('tr');
      infoRow.innerHTML = `
        <td colspan="2" style="text-align: center; padding: 15px; background: #fff3cd; color: #856404;">
          <i class="bi bi-info-circle me-2"></i>
          Menampilkan ${maxResults} dari ${this.filteredICDXData.length} hasil. Gunakan kata kunci lebih spesifik.
        </td>
      `;
      tbody.appendChild(infoRow);
    }
  }

  attachTableEvents() {
    setTimeout(() => {
      const tbody = document.getElementById("icdxTableBody");
      if (!tbody) return;

      tbody.addEventListener("click", (e) => {
        const row = e.target.closest("tr");
        if (!row || !row.dataset.index) return;

        tbody.querySelectorAll("tr").forEach(tr => tr.classList.remove("selected"));
        row.classList.add("selected");

        const index = parseInt(row.dataset.index);
        this.selectedICDX = this.filteredICDXData[index];
      });
    }, 100);
  }

  selectICDX() {
    if (!this.selectedICDX) {
      if (window.CustomAlert) {
        CustomAlert.warning("Pilih salah satu data ICDX!", "Pilih Data");
      } else {
        alert("⚠️ Pilih salah satu data ICDX!");
      }
      return;
    }

    const kode = this.selectedICDX.code;
    const deskripsi = this.selectedICDX.display || this.selectedICDX.name_en;

    this.pemeriksaanModal.icdxTableData.push({ kode, deskripsi });
    this.pemeriksaanModal.renderICDXTable();
    
    if (window.Toast) {
      Toast.success(`ICDX "${kode}" berhasil ditambahkan!`);
    }
    this.close();
  }

  close() {
    const modal = document.getElementById("icdxSelectionModal");
    if (modal) {
      modal.style.animation = "fadeOut 0.2s";
      setTimeout(() => modal.remove(), 200);
    }
  }
}

// ========================================
// ICDIX SELECTION MODAL CLASS
// ========================================
class ICDIXSelectionModal {
  constructor(pemeriksaanModal) {
    this.pemeriksaanModal = pemeriksaanModal;
    this.allICDIXData = [];
    this.filteredICDIXData = [];
    this.selectedICDIX = null;
    this.dataLoaded = false;
    this.searchTimeout = null;
  }

  async show() {
    this.createModal();
    await this.loadICDIXData();
  }

  async loadICDIXData() {
    if (this.dataLoaded && this.allICDIXData.length > 0) {
      console.log("✅ ICDIX data already loaded from cache");
      return;
    }

    console.log("📦 Loading ICDIX data from JSON file...");
    const tbody = document.getElementById("icdixTableBody");
    
    tbody.innerHTML = PemeriksaanSkeletonLoader.searchResults(8);
    
    try {
      const response = await fetch('/mapotek_php/WEB/Dashboard/resource/icd9.json');
      if (!response.ok) throw new Error('Failed to load icd9.json');
      
      const jsonData = await response.json();
      
      this.allICDIXData = jsonData.map(item => ({
        code: String(item.CODE || ''),     
        display: String(item.DISPLAY || '')  
      }));

      this.filteredICDIXData = [...this.allICDIXData];
      this.dataLoaded = true;
      
      console.log(`✅ Loaded ${this.allICDIXData.length} ICDIX records from JSON`);
      
      tbody.innerHTML = `
        <tr>
          <td colspan="2" style="text-align: center; padding: 40px; color: #999;">
            <i class="bi bi-search" style="font-size: 48px; display: block; margin-bottom: 10px;"></i>
            ${this.allICDIXData.length} data ICDIX tersedia<br>
            <small>Masukkan kata kunci untuk mencari</small>
          </td>
        </tr>
      `;
    } catch (error) {
      console.error("❌ Error loading ICDIX data:", error);
      tbody.innerHTML = `
        <tr>
          <td colspan="2" style="text-align: center; padding: 40px; color: #dc3545;">
            <i class="bi bi-exclamation-triangle" style="font-size: 48px; display: block; margin-bottom: 10px;"></i>
            Gagal memuat data ICDIX: ${error.message}
          </td>
        </tr>
      `;
    }
  }

  createModal() {
    const existingModal = document.getElementById("icdixSelectionModal");
    if (existingModal) existingModal.remove();

    const modalHTML = `
      <div id="icdixSelectionModal" class="modal-overlay" style="z-index: 1060;">
        <div class="icdix-modal-container">
          <div class="modal-header">
            <h3>🔍 Pencarian ICDIX (Prosedur Medis)</h3>
            <button class="close-btn" onclick="icdixSelectionModal.close()">
              <i class="bi bi-x-lg"></i>
            </button>
          </div>

          <div class="icdix-modal-body">
            <div class="search-section" style="display: flex; gap: 10px; margin-bottom: 20px;">
              <input type="text" 
                     id="icdixSearchInput" 
                     class="form-control" 
                     placeholder="🔍 Cari ICDIX berdasarkan kode atau deskripsi..."
                     style="flex: 1;"
                     oninput="icdixSelectionModal.handleSearchInput()">
              <button class="btn-primary" onclick="icdixSelectionModal.searchICDIX()" style="padding: 0.5rem 1.5rem;">
                <i class="bi bi-search me-1"></i>Cari
              </button>
            </div>

            <div class="table-container" style="max-height: 400px; overflow-y: auto;">
              <table class="table table-hover">
                <thead style="position: sticky; top: 0; background: linear-gradient(135deg, #065f46 0%, #0891b2 100%); z-index: 1;">
                  <tr>
                    <th style="color: white; width: 120px;">Kode ICDIX</th>
                    <th style="color: white;">Deskripsi</th>
                  </tr>
                </thead>
                <tbody id="icdixTableBody">
                  ${PemeriksaanSkeletonLoader.searchResults(8)}
                </tbody>
              </table>
            </div>
          </div>

          <div class="modal-footer">
            <button class="btn-secondary" onclick="icdixSelectionModal.close()">
              <i class="bi bi-x-circle me-1"></i>Batal
            </button>
            <button class="btn-success" onclick="icdixSelectionModal.selectICDIX()">
              <i class="bi bi-check-circle me-1"></i>Pilih
            </button>
          </div>
        </div>
      </div>

      ${pemeriksaanSkeletonStyles}

      <style>
        .icdix-modal-container {
          background: white;
          border-radius: 12px;
          width: 90%;
          max-width: 900px;
          max-height: 90vh;
          display: flex;
          flex-direction: column;
          box-shadow: 0 1rem 3rem rgba(0, 0, 0, 0.3);
          animation: slideUp 0.3s;
        }

        .icdix-modal-body {
          padding: 2rem;
          overflow-y: auto;
          flex: 1;
        }

        .table tbody tr {
          cursor: pointer;
          transition: background 0.15s;
        }

        .table tbody tr:hover:not(.skeleton-row) {
          background: #f0f9ff !important;
        }

        .table tbody tr.selected {
          background: #d1fae5 !important;
          border-left: 4px solid #065f46;
        }
      </style>
    `;

    document.body.insertAdjacentHTML("beforeend", modalHTML);
    this.attachTableEvents();
  }

  handleSearchInput() {
    if (this.searchTimeout) {
      clearTimeout(this.searchTimeout);
    }

    const tbody = document.getElementById("icdixTableBody");
    tbody.innerHTML = PemeriksaanSkeletonLoader.searchResults(5);

    this.searchTimeout = setTimeout(() => {
      this.searchICDIX();
    }, 300);
  }

  searchICDIX() {
    const keyword = document.getElementById("icdixSearchInput")?.value.trim().toLowerCase();
    
    if (!keyword) {
      this.filteredICDIXData = [...this.allICDIXData];
      this.renderICDIXTable();
      return;
    }

    this.filteredICDIXData = this.allICDIXData.filter(icdix => {
      if (!icdix) return false;
      const code = String(icdix.code || "").toLowerCase();
      const display = String(icdix.display || "").toLowerCase();
      return code.includes(keyword) || display.includes(keyword);
    });
    
    this.renderICDIXTable();
  }

  renderICDIXTable() {
    const tbody = document.getElementById("icdixTableBody");
    
    if (this.filteredICDIXData.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="2" style="text-align: center; padding: 40px; color: #999;">
            <i class="bi bi-inbox" style="font-size: 48px; display: block; margin-bottom: 10px;"></i>
            Tidak ada data ICDIX ditemukan
          </td>
        </tr>
      `;
      return;
    }

    const fragment = document.createDocumentFragment();
    const maxResults = 100;
    const dataToShow = this.filteredICDIXData.slice(0, maxResults);

    dataToShow.forEach((icdix, index) => {
      const tr = document.createElement('tr');
      tr.dataset.index = index;
      tr.style.cursor = 'pointer';
      tr.innerHTML = `
        <td><strong>${icdix.code || 'N/A'}</strong></td>
        <td>${icdix.display || 'N/A'}</td>
      `;
      fragment.appendChild(tr);
    });

    tbody.innerHTML = '';
    tbody.appendChild(fragment);

    if (this.filteredICDIXData.length > maxResults) {
      const infoRow = document.createElement('tr');
      infoRow.innerHTML = `
        <td colspan="2" style="text-align: center; padding: 15px; background: #fff3cd; color: #856404;">
          <i class="bi bi-info-circle me-2"></i>
          Menampilkan ${maxResults} dari ${this.filteredICDIXData.length} hasil.
        </td>
      `;
      tbody.appendChild(infoRow);
    }
  }

  attachTableEvents() {
    setTimeout(() => {
      const tbody = document.getElementById("icdixTableBody");
      if (!tbody) return;

      tbody.addEventListener("click", (e) => {
        const row = e.target.closest("tr");
        if (!row || !row.dataset.index) return;

        tbody.querySelectorAll("tr").forEach(tr => tr.classList.remove("selected"));
        row.classList.add("selected");

        const index = parseInt(row.dataset.index);
        this.selectedICDIX = this.filteredICDIXData[index];
      });
    }, 100);
  }

  selectICDIX() {
    if (!this.selectedICDIX) {
      if (window.CustomAlert) {
        CustomAlert.warning("Pilih salah satu data ICDIX!", "Pilih Data");
      } else {
        alert("⚠️ Pilih salah satu data ICDIX!");
      }
      return;
    }

    const kode = this.selectedICDIX.code;
    const deskripsi = this.selectedICDIX.display;

    this.pemeriksaanModal.icdixTableData.push({ kode, deskripsi });
    this.pemeriksaanModal.renderICDIXTable();
    
    if (window.Toast) {
      Toast.success(`ICDIX "${kode}" berhasil ditambahkan!`);
    }
    this.close();
  }

  close() {
    const modal = document.getElementById("icdixSelectionModal");
    if (modal) {
      modal.style.animation = "fadeOut 0.2s";
      setTimeout(() => modal.remove(), 200);
    }
  }
}

// ========================================
// OBAT SELECTION MODAL CLASS
// ========================================
class ObatSelectionModal {
  constructor(pemeriksaanModal, doctorId) {
    this.pemeriksaanModal = pemeriksaanModal;
    this.allObatData = [];
    this.doctorId = doctorId;
    this.filteredObatData = [];
    this.selectedObat = null;
    this.jumlah = 1;
    this.signa = "";
    this.isLoading = true;
  }

  async show() {
    this.createModal();
    await this.loadObatData();
  }

  async loadObatData() {
    console.log("📦 Loading obat data for doctor:", this.doctorId);
    
    if (!this.doctorId) {
      console.error("❌ No doctor ID provided to ObatSelectionModal!");
      const tbody = document.getElementById("obatTableBody");
      if (tbody) {
        tbody.innerHTML = `
          <tr>
            <td colspan="6" style="text-align: center; padding: 40px; color: #dc3545;">
              <i class="bi bi-exclamation-triangle" style="font-size: 48px; display: block; margin-bottom: 10px;"></i>
              Error: Doctor ID tidak ditemukan
            </td>
          </tr>
        `;
      }
      return;
    }
    
    try {
      const url = `/mapotek_php/WEB/API/obat.php?action=get_all&id_dokter=${this.doctorId}`;
      console.log("📤 Fetching from:", url);
      
      this.showLoading(true);
      
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      
      const result = await response.json();
      console.log('📦 Medicines response:', result);
      
      if (!result.success) {
        throw new Error(result.message || 'Gagal memuat data obat');
      }
      
      this.allObatData = result.data || [];
      this.filteredObatData = [...this.allObatData];
      
      console.log(`✅ Loaded ${this.allObatData.length} medicines for doctor ID: ${this.doctorId}`);
      
    } catch (error) {
      console.error("❌ Error loading obat:", error);
      this.allObatData = [];
      this.filteredObatData = [];
      
      const tbody = document.getElementById("obatTableBody");
      if (tbody) {
        tbody.innerHTML = `
          <tr>
            <td colspan="6" style="text-align: center; padding: 40px; color: #dc3545;">
              <i class="bi bi-exclamation-triangle" style="font-size: 48px; display: block; margin-bottom: 10px;"></i>
              Gagal memuat data obat: ${error.message}
            </td>
          </tr>
        `;
      }
    } finally {
      this.isLoading = false;
      this.updateTable();
    }
  }

  showLoading(show) {
    const tbody = document.getElementById("obatTableBody");
    if (!tbody) return;
    
    if (show) {
      tbody.innerHTML = PemeriksaanSkeletonLoader.tableRows(6, 5);
    }
  }

  createModal() {
    const existingModal = document.getElementById("obatSelectionModal");
    if (existingModal) existingModal.remove();

    const modalHTML = `
      <div id="obatSelectionModal" class="modal-overlay" style="z-index: 1060;">
        <div class="obat-modal-container">
          <div class="modal-header">
            <h3>💊 Pilih Obat</h3>
            <button class="close-btn" onclick="obatSelectionModal.close()">
              <i class="bi bi-x-lg"></i>
            </button>
          </div>

          <div class="obat-modal-body">
            <div class="search-section">
              <input type="text" 
                     id="obatSearchInput" 
                     class="form-control" 
                     placeholder="🔍 Cari obat berdasarkan nama atau barcode..."
                     oninput="obatSelectionModal.filterObat(this.value)">
            </div>

            <div class="table-container" style="margin-top: 20px; max-height: 300px; overflow-y: auto;">
              <table class="table table-hover">
                <thead style="position: sticky; top: 0; background: linear-gradient(135deg, #065f46 0%, #0891b2 100%); z-index: 1;">
                  <tr>
                    <th style="color: white;">NO</th>
                    <th style="color: white;">BARCODE</th>
                    <th style="color: white;">NAMA OBAT</th>
                    <th style="color: white;">JENIS OBAT</th>
                    <th style="color: white;">HARGA</th>
                    <th style="color: white;">STOCK</th>
                  </tr>
                </thead>
                <tbody id="obatTableBody">
                  ${PemeriksaanSkeletonLoader.tableRows(6, 5)}
                </tbody>
              </table>
            </div>

            <div id="selectedObatInfo" style="display: none; margin-top: 20px; padding: 20px; background: linear-gradient(135deg, #d1fae5 0%, #cffafe 100%); border-radius: 8px; border: 2px solid #065f46;">
              <h4 style="color: #065f46; margin-bottom: 15px;">📋 Informasi Obat Terpilih</h4>
              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 15px;">
                <div><strong>Nama Obat:</strong> <span id="selectedNama">-</span></div>
                <div><strong>Jenis:</strong> <span id="selectedJenis">-</span></div>
                <div><strong>Harga:</strong> Rp <span id="selectedHarga">0</span></div>
                <div><strong>Stock Tersedia:</strong> <span id="selectedStock">0</span></div>
              </div>
              
              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
                <div class="form-group" style="margin-bottom: 0;">
                  <label style="font-weight: 600; margin-bottom: 8px; display: block;">Jumlah *</label>
                  <input type="number" 
                         id="obatJumlahInput" 
                         class="form-control" 
                         min="1" 
                         value="1"
                         placeholder="Masukkan jumlah">
                </div>
                <div class="form-group" style="margin-bottom: 0;">
                  <label style="font-weight: 600; margin-bottom: 8px; display: block;">Signa (Aturan Pakai) *</label>
                  <input type="text" 
                         id="obatSignaInput" 
                         class="form-control" 
                         placeholder="Contoh: 3x1 sehari sesudah makan">
                </div>
              </div>
            </div>
          </div>

          <div class="modal-footer">
            <button class="btn-secondary" onclick="obatSelectionModal.close()">
              <i class="bi bi-x-circle me-1"></i>Batal
            </button>
            <button class="btn-success" onclick="obatSelectionModal.addObat()">
              <i class="bi bi-check-circle me-1"></i>Tambahkan Obat
            </button>
          </div>
        </div>
      </div>

      ${pemeriksaanSkeletonStyles}

      <style>
        .obat-modal-container {
          background: white;
          border-radius: 12px;
          width: 90%;
          max-width: 1000px;
          max-height: 90vh;
          display: flex;
          flex-direction: column;
          box-shadow: 0 1rem 3rem rgba(0, 0, 0, 0.3);
          animation: slideUp 0.3s;
        }

        .obat-modal-body {
          padding: 2rem;
          overflow-y: auto;
          flex: 1;
        }

        .search-section {
          margin-bottom: 15px;
        }

        .table tbody tr {
          cursor: pointer;
          transition: background 0.15s;
        }

        .table tbody tr:hover:not(.skeleton-row) {
          background: #f0f9ff !important;
        }

        .table tbody tr.selected {
          background: #d1fae5 !important;
          border-left: 4px solid #065f46;
        }
      </style>
    `;

    document.body.insertAdjacentHTML("beforeend", modalHTML);
  }

  updateTable() {
    const tbody = document.getElementById("obatTableBody");
    if (tbody) {
      tbody.innerHTML = this.renderObatTableRows();
      this.attachTableEvents();
    }
  }

  renderObatTableRows() {
    if (this.isLoading) {
      return PemeriksaanSkeletonLoader.tableRows(6, 5);
    }

    if (this.filteredObatData.length === 0) {
      return `
        <tr>
          <td colspan="6" style="text-align: center; padding: 40px; color: #999;">
            <i class="bi bi-inbox" style="font-size: 48px; display: block; margin-bottom: 10px;"></i>
            Tidak ada data obat
          </td>
        </tr>
      `;
    }

    return this.filteredObatData.map((obat, index) => `
      <tr data-index="${index}" data-id="${obat.id_obat}">
        <td>${index + 1}</td>
        <td>${obat.barcode || '-'}</td>
        <td><strong>${obat.nama_obat}</strong></td>
        <td>${obat.jenis_obat || '-'}</td>
        <td>Rp ${parseFloat(obat.harga_jual || 0).toLocaleString('id-ID')}</td>
        <td><span class="badge ${obat.stock > 0 ? 'bg-success' : 'bg-danger'}">${obat.stock || 0}</span></td>
      </tr>
    `).join('');
  }

  attachTableEvents() {
    const tbody = document.getElementById("obatTableBody");
    if (!tbody) return;

    tbody.addEventListener("click", (e) => {
      const row = e.target.closest("tr");
      if (!row || !row.dataset.index) return;

      tbody.querySelectorAll("tr").forEach(tr => tr.classList.remove("selected"));
      row.classList.add("selected");

      const index = parseInt(row.dataset.index);
      this.selectedObat = this.filteredObatData[index];
      
      this.showSelectedObatInfo();
    });
  }

  showSelectedObatInfo() {
    if (!this.selectedObat) return;

    const infoDiv = document.getElementById("selectedObatInfo");
    infoDiv.style.display = "block";

    document.getElementById("selectedNama").textContent = this.selectedObat.nama_obat;
    document.getElementById("selectedJenis").textContent = this.selectedObat.jenis_obat || '-';
    document.getElementById("selectedHarga").textContent = parseFloat(this.selectedObat.harga_jual || 0).toLocaleString('id-ID');
    document.getElementById("selectedStock").textContent = this.selectedObat.stock || 0;

    document.getElementById("obatJumlahInput").value = 1;
    document.getElementById("obatSignaInput").value = "";
  }

  filterObat(searchTerm) {
    const term = searchTerm.toLowerCase().trim();
    
    if (!term) {
      this.filteredObatData = [...this.allObatData];
    } else {
      this.filteredObatData = this.allObatData.filter(obat => 
        (obat.nama_obat && obat.nama_obat.toLowerCase().includes(term)) ||
        (obat.barcode && obat.barcode.toLowerCase().includes(term))
      );
    }

    this.updateTable();

    if (this.selectedObat) {
      const stillExists = this.filteredObatData.find(o => o.id_obat === this.selectedObat.id_obat);
      if (!stillExists) {
        document.getElementById("selectedObatInfo").style.display = "none";
        this.selectedObat = null;
      }
    }
  }

  async addObat() {
    if (!this.selectedObat) {
      if (window.CustomAlert) {
        CustomAlert.warning("Silakan pilih obat terlebih dahulu!", "Pilih Obat");
      } else {
        alert("⚠️ Silakan pilih obat terlebih dahulu!");
      }
      return;
    }

    const jumlahInput = document.getElementById("obatJumlahInput");
    const signaInput = document.getElementById("obatSignaInput");

    const jumlah = parseInt(jumlahInput.value);
    const signa = signaInput.value.trim();

    if (!jumlah || jumlah <= 0) {
      if (window.CustomAlert) {
        CustomAlert.warning("Jumlah harus lebih dari 0!", "Jumlah Invalid");
      } else {
        alert("⚠️ Jumlah harus lebih dari 0!");
      }
      jumlahInput.focus();
      return;
    }

    if (jumlah > this.selectedObat.stock) {
      if (window.CustomAlert) {
        CustomAlert.warning(`Stock tidak mencukupi!\nStock tersedia: ${this.selectedObat.stock}`, "Stock Kurang");
      } else {
        alert(`⚠️ Stock tidak mencukupi!\nStock tersedia: ${this.selectedObat.stock}`);
      }
      jumlahInput.focus();
      return;
    }

    if (!signa) {
      if (window.CustomAlert) {
        CustomAlert.warning("Signa (aturan pakai) harus diisi!", "Signa Kosong");
      } else {
        alert("⚠️ Signa (aturan pakai) harus diisi!");
      }
      signaInput.focus();
      return;
    }

    // Get the batch using supabaseClient (FIFO - First In First Out)
    try {
      console.log('🔍 Finding batch for medicine:', this.selectedObat.id_obat);
      
      const { data: batches, error } = await window.supabaseClient
        .from('detail_obat')
        .select('id_detail_obat, stock, tanggal_expired, harga_jual')
        .eq('id_obat', this.selectedObat.id_obat)
        .eq('status_batch', 'aktif')
        .gt('stock', 0)
        .order('tanggal_expired', { ascending: true })
        .limit(1);
      
      if (error) {
        throw new Error(error.message);
      }
      
      if (!batches || batches.length === 0) {
        if (window.CustomAlert) {
          CustomAlert.warning("Tidak ada batch aktif dengan stock tersedia untuk obat ini!", "Batch Tidak Tersedia");
        } else {
          alert(`⚠️ Tidak ada batch aktif dengan stock tersedia untuk obat ini!`);
        }
        return;
      }
      
      const selectedBatch = batches[0];
      console.log('✅ Selected batch (FIFO):', selectedBatch);
      
      if (selectedBatch.stock < jumlah) {
        if (window.CustomAlert) {
          CustomAlert.warning(`Stock batch tidak mencukupi!\nStock batch tersedia: ${selectedBatch.stock}\nDiminta: ${jumlah}`, "Stock Batch Kurang");
        } else {
          alert(`⚠️ Stock batch tidak mencukupi!\nStock batch tersedia: ${selectedBatch.stock}\nDiminta: ${jumlah}`);
        }
        return;
      }
      
      const obatData = {
        id_obat: this.selectedObat.id_obat,
        id_detail_obat: selectedBatch.id_detail_obat,
        nama: this.selectedObat.nama_obat,
        jenis: this.selectedObat.jenis_obat || '-',
        jumlah: jumlah,
        harga: parseFloat(selectedBatch.harga_jual || 0),
        signa: signa
      };

      console.log('💊 Adding medicine with batch tracking:', obatData);

      this.pemeriksaanModal.addOrUpdateDrug(obatData);
      
      if (window.Toast) {
        Toast.success(`Obat "${obatData.nama}" berhasil ditambahkan!`);
      }
      this.close();
      
    } catch (error) {
      console.error('❌ Error finding batch:', error);
      if (window.CustomAlert) {
        CustomAlert.error('Gagal menemukan batch obat.\n\n' + error.message, "Error");
      } else {
        alert('❌ Error: Gagal menemukan batch obat.\n\n' + error.message);
      }
    }
  }

  close() {
    const modal = document.getElementById("obatSelectionModal");
    if (modal) {
      modal.style.animation = "fadeOut 0.2s";
      setTimeout(() => modal.remove(), 200);
    }
  }
}

// ========================================
// RESEP MODAL CLASS
// ========================================
class ResepModal {
  constructor(pemeriksaanModal) {
    this.pemeriksaanModal = pemeriksaanModal;
  }

  show() {
    this.createModal();
  }

  createModal() {
    const existingModal = document.getElementById("resepModal");
    if (existingModal) existingModal.remove();

    const currentResep = this.pemeriksaanModal.resepData;

    const modalHTML = `
      <div id="resepModal" class="modal-overlay" style="z-index: 1060;">
        <div class="resep-modal-container">
          <div class="modal-header">
            <h3>📝 Resep Obat</h3>
            <button class="close-btn" onclick="resepModal.close()">
              <i class="bi bi-x-lg"></i>
            </button>
          </div>

          <div class="resep-modal-body">
            <div class="alert alert-info" style="background: #cffafe; border: 1px solid #0891b2; border-radius: 8px; padding: 15px; margin-bottom: 20px;">
              <i class="bi bi-info-circle me-2"></i>
              <strong>Info:</strong> Resep ini adalah catatan terpisah dari daftar obat. Resep bersifat opsional.
            </div>

            <div class="form-group">
              <label>Nama Resep *</label>
              <input type="text" 
                     id="resepNama" 
                     class="form-control" 
                     placeholder="Contoh: Resep untuk Demam dan Batuk"
                     value="${currentResep.nama || ''}">
            </div>

            <div class="form-group">
              <label>Catatan Resep</label>
              <textarea id="resepCatatan" 
                        class="form-control" 
                        rows="4"
                        placeholder="Catatan khusus untuk resep ini...">${currentResep.catatan || ''}</textarea>
            </div>

            <div class="form-group">
              <label>Detail Resep Obat *</label>
              <textarea id="resepDetail" 
                        class="form-control" 
                        rows="6"
                        placeholder="Contoh:&#10;1. Paracetamol 500mg - 3x1 sehari sesudah makan&#10;2. Amoxicillin 500mg - 3x1 sehari sesudah makan&#10;3. OBH Sirup 60ml - 3x1 sendok makan">${currentResep.detail || ''}</textarea>
            </div>
          </div>

          <div class="modal-footer">
            <button class="btn-secondary" onclick="resepModal.close()">
              <i class="bi bi-x-circle me-1"></i>Batal
            </button>
            <button class="btn-danger" onclick="resepModal.clearResep()" style="margin-right: auto;">
              <i class="bi bi-trash me-1"></i>Hapus Resep
            </button>
            <button class="btn-success" onclick="resepModal.saveResep()">
              <i class="bi bi-check-circle me-1"></i>Simpan Resep
            </button>
          </div>
        </div>
      </div>

      <style>
        .resep-modal-container {
          background: white;
          border-radius: 12px;
          width: 90%;
          max-width: 700px;
          max-height: 90vh;
          display: flex;
          flex-direction: column;
          box-shadow: 0 1rem 3rem rgba(0, 0, 0, 0.3);
          animation: slideUp 0.3s;
        }

        .resep-modal-body {
          padding: 2rem;
          overflow-y: auto;
          flex: 1;
        }
      </style>
    `;

    document.body.insertAdjacentHTML("beforeend", modalHTML);
  }

  saveResep() {
    const nama = document.getElementById("resepNama")?.value.trim();
    const catatan = document.getElementById("resepCatatan")?.value.trim();
    const detail = document.getElementById("resepDetail")?.value.trim();

    if (!nama) {
      if (window.CustomAlert) {
        CustomAlert.warning("Nama resep harus diisi!", "Nama Kosong");
      } else {
        alert("⚠️ Nama resep harus diisi!");
      }
      document.getElementById("resepNama")?.focus();
      return;
    }

    if (!detail) {
      if (window.CustomAlert) {
        CustomAlert.warning("Detail resep obat harus diisi!", "Detail Kosong");
      } else {
        alert("⚠️ Detail resep obat harus diisi!");
      }
      document.getElementById("resepDetail")?.focus();
      return;
    }

    this.pemeriksaanModal.resepData = {
      nama: nama,
      catatan: catatan,
      detail: detail
    };

    if (window.Toast) {
      Toast.success(`Resep "${nama}" berhasil disimpan!`);
    }
    this.pemeriksaanModal.renderStepContent();
    this.close();
  }

  async clearResep() {
    let confirmed = false;
    if (window.CustomAlert) {
      confirmed = await CustomAlert.confirm("Hapus resep yang sudah diisi?\n\nData resep akan dihapus.", "Hapus Resep?");
    } else {
      confirmed = confirm("⚠️ Hapus resep yang sudah diisi?\n\nData resep akan dihapus.");
    }

    if (!confirmed) return;

    this.pemeriksaanModal.resepData = {
      nama: '',
      catatan: '',
      detail: ''
    };

    if (window.Toast) {
      Toast.success("Resep berhasil dihapus!");
    }
    this.pemeriksaanModal.renderStepContent();
    this.close();
  }

  close() {
    const modal = document.getElementById("resepModal");
    if (modal) {
      modal.style.animation = "fadeOut 0.2s";
      setTimeout(() => modal.remove(), 200);
    }
  }
}

// ========================================
// PEMERIKSAAN MODAL CLASS
// ========================================
class PemeriksaanModal {
  constructor() {
    this.currentStep = 0;
    this.totalSteps = 5;
    this.drugTableData = [];
    this.icdxTableData = [];
    this.icdixTableData = [];
    this.totalHarga = 0;
    this.hargaJasa = 0;
    this.resepData = {
      nama: '',
      catatan: '',
      detail: ''
    };

    this.currentDoctorId = null;
    this.isProcessing = false;
    
    this.formData = {
      keluhan: '',
      anamnesis: '',
      alergi_makanan: 'Tidak Ada',
      alergi_udara: 'Tidak Ada',
      alergi_obat: 'Tidak Ada',
      prognosa: '',
      terapi_obat: '',
      terapi_non_obat: '',
      bmhp: '',
      body_weight: '',
      oxygen_sat: '',
      body_height: '',
      body_temp: '',
      blood_pressure: '',
      heart_rate: '',
      resp_rate: ''
    };
  }

  show(queueData, doctorId) {
    this.reset();
    this.queueData = { ...queueData };
    this.currentDoctorId = doctorId;
    
    console.log("📋 Modal opened with queue data:", this.queueData);
    console.log("👨‍⚕️ Doctor ID:", this.currentDoctorId);
    
    this.createModal();
    this.initializeStep(0);
  }

  reset() {
    console.log("🔄 Resetting modal data...");
    this.currentStep = 0;
    this.drugTableData = [];
    this.icdxTableData = [];
    this.icdixTableData = [];
    this.totalHarga = 0;
    this.hargaJasa = 0;
    this.isProcessing = false;
    this.resepData = {
      nama: '',
      catatan: '',
      detail: ''
    };
    
    this.formData = {
      keluhan: '',
      anamnesis: '',
      alergi_makanan: 'Tidak Ada',
      alergi_udara: 'Tidak Ada',
      alergi_obat: 'Tidak Ada',
      prognosa: '',
      terapi_obat: '',
      terapi_non_obat: '',
      bmhp: '',
      body_weight: '',
      oxygen_sat: '',
      body_height: '',
      body_temp: '',
      blood_pressure: '',
      heart_rate: '',
      resp_rate: ''
    };
    
    setTimeout(() => {
      const inputs = document.querySelectorAll('#pemeriksaanModal input, #pemeriksaanModal textarea, #pemeriksaanModal select');
      inputs.forEach(input => {
        if (input.type === 'checkbox' || input.type === 'radio') {
          input.checked = false;
        } else if (input.tagName === 'SELECT') {
          input.selectedIndex = 0;
        } else {
          input.value = '';
        }
      });
    }, 100);
  }

  saveCurrentStepData() {
    switch (this.currentStep) {
      case 1:
        this.formData.keluhan = document.getElementById("keluhan")?.value || "";
        this.formData.anamnesis = document.getElementById("anamnesis")?.value || "";
        this.formData.alergi_makanan = document.getElementById("alergiMakanan")?.value || "Tidak Ada";
        this.formData.alergi_udara = document.getElementById("alergiUdara")?.value || "Tidak Ada";
        this.formData.alergi_obat = document.getElementById("alergiObat")?.value || "Tidak Ada";
        this.formData.prognosa = document.getElementById("prognosa")?.value || "";
        this.formData.terapi_obat = document.getElementById("terapiObat")?.value || "";
        this.formData.terapi_non_obat = document.getElementById("terapiNonObat")?.value || "";
        this.formData.bmhp = document.getElementById("bmhp")?.value || "";
        console.log("💾 Saved Anamnesa data:", this.formData);
        break;
        
      case 2:
        this.formData.body_weight = document.getElementById("bodyWeight")?.value || "";
        this.formData.oxygen_sat = document.getElementById("oxygenSat")?.value || "";
        this.formData.body_height = document.getElementById("bodyHeight")?.value || "";
        this.formData.body_temp = document.getElementById("bodyTemp")?.value || "";
        this.formData.blood_pressure = document.getElementById("bloodPressure")?.value || "";
        this.formData.heart_rate = document.getElementById("heartRate")?.value || "";
        this.formData.resp_rate = document.getElementById("respRate")?.value || "";
        console.log("💾 Saved Vital Signs data:", this.formData);
        break;
        
      case 4:
        const hargaJasaInput = document.getElementById("hargaJasa");
        if (hargaJasaInput) {
          const numericValue = hargaJasaInput.value.replace(/[^0-9]/g, '');
          this.hargaJasa = parseFloat(numericValue) || 0;
          console.log("💾 Saved Harga Jasa from step 4:", this.hargaJasa);
        }
        break;
    }
  }

  createModal() {
    const existingModal = document.getElementById("pemeriksaanModal");
    if (existingModal) existingModal.remove();

    const modalHTML = `
      <div id="pemeriksaanModal" class="modal-overlay">
        <div class="modal-container">
          <div class="modal-header">
            <h2>📋 Pemeriksaan Pasien</h2>
            <button class="close-btn" onclick="pemeriksaanModal.close()">
              <i class="bi bi-x-lg"></i>
            </button>
          </div>

          <div class="stepper-container">
            <div class="stepper">
              <div class="step active" data-step="0">
                <div class="step-number">1</div>
                <div class="step-label">Info Pasien</div>
              </div>
              <div class="step-line"></div>
              <div class="step" data-step="1">
                <div class="step-number">2</div>
                <div class="step-label">Anamnesa</div>
              </div>
              <div class="step-line"></div>
              <div class="step" data-step="2">
                <div class="step-number">3</div>
                <div class="step-label">Data Vital</div>
              </div>
              <div class="step-line"></div>
              <div class="step" data-step="3">
                <div class="step-number">4</div>
                <div class="step-label">Diagnosa</div>
              </div>
              <div class="step-line"></div>
              <div class="step" data-step="4">
                <div class="step-number">5</div>
                <div class="step-label">Obat</div>
              </div>
            </div>
          </div>

          <div class="modal-content modal-content-pemeriksaan" id="modalContent"></div>

          <div class="modal-footer">
            <button class="btn-secondary" id="prevBtn" onclick="pemeriksaanModal.previousStep()">
              <i class="bi bi-arrow-left me-1"></i>Kembali
            </button>
            <button class="btn-primary" id="nextBtn" onclick="pemeriksaanModal.nextStep()">
              Selanjutnya<i class="bi bi-arrow-right ms-1"></i>
            </button>
            <button class="btn-success" id="finishBtn" style="display: none;" onclick="pemeriksaanModal.finish()">
              <i class="bi bi-check-circle me-1"></i>Selesai
            </button>
          </div>
        </div>
      </div>

      <style>
      .modal-overlay {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.5);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 1055;
        overflow-y: auto;
        padding: 0;
        animation: fadeIn 0.15s;
      }

      @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
      }

      @keyframes fadeOut {
        from { opacity: 1; }
        to { opacity: 0; }
      }

      .modal-container {
        background: white;
        border-radius: 12px;
        width: 90%;
        max-width: 800px;
        margin: 1.75rem auto;
        max-height: calc(100vh - 3.5rem);
        display: flex;
        flex-direction: column;
        box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.15);
        animation: slideUp 0.3s;
        position: relative;
      }

      @keyframes slideUp {
        from {
          transform: translateY(50px);
          opacity: 0;
        }
        to {
          transform: translateY(0);
          opacity: 1;
        }
      }

      .modal-header {
        padding: 1rem 1.5rem;
        border-bottom: 1px solid #dee2e6;
        display: flex;
        justify-content: space-between;
        align-items: center;
        background: linear-gradient(135deg, #065f46 0%, #0891b2 100%);
        color: white;
        border-radius: 12px 12px 0 0;
      }

      .modal-header h2 {
        margin: 0;
        font-size: 1.25rem;
        font-weight: 500;
      }

      .close-btn {
        background: transparent;
        border: none;
        font-size: 1.5rem;
        cursor: pointer;
        color: white;
        opacity: 0.8;
        padding: 0;
        width: 32px;
        height: 32px;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 4px;
        transition: all 0.15s;
      }

      .close-btn:hover {
        opacity: 1;
        background: rgba(255, 255, 255, 0.1);
      }

      .stepper-container {
        padding: 30px;
        background: #f8f9fa;
        border-bottom: 1px solid #dee2e6;
      }

      .stepper {
        display: flex;
        align-items: center;
        justify-content: space-between;
        max-width: 900px;
        margin: 0 auto;
      }

      .step {
        display: flex;
        flex-direction: column;
        align-items: center;
        flex: 0 0 auto;
      }

      .step-number {
        width: 40px;
        height: 40px;
        border-radius: 50%;
        background: #ddd;
        color: #666;
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: 700;
        margin-bottom: 8px;
        transition: all 0.3s;
      }

      .step.active .step-number {
        background: linear-gradient(135deg, #065f46 0%, #0891b2 100%);
        color: white;
        box-shadow: 0 4px 12px rgba(6, 95, 70, 0.4);
        transform: scale(1.1);
      }

      .step.completed .step-number {
        background: #10b981;
        color: white;
      }

      .step-label {
        font-size: 12px;
        color: #666;
        text-align: center;
        max-width: 100px;
      }

      .step.active .step-label {
        color: #065f46;
        font-weight: 600;
      }

      .step-line {
        flex: 1;
        height: 2px;
        background: #ddd;
        margin: 0 10px;
        margin-bottom: 28px;
      }

      .step.completed ~ .step .step-line {
        background: #10b981;
      }

      .modal-content-pemeriksaan {
        padding: 30px;
        overflow-y: auto;
        flex: 1;
      }

      .form-section h3 {
        font-size: 1.25rem;
        font-weight: 600;
        margin-bottom: 20px;
        color: #333;
        border-bottom: 2px solid #065f46;
        padding-bottom: 10px;
      }

      .form-group {
        margin-bottom: 20px;
      }

      .form-group label {
        display: block;
        font-weight: 600;
        margin-bottom: 8px;
        color: #333;
        font-size: 14px;
      }

      .form-group input,
      .form-group textarea,
      .form-group select {
        width: 100%;
        padding: 0.5rem 0.75rem;
        border: 1px solid #ced4da;
        border-radius: 0.375rem;
        font-size: 14px;
        transition: border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out;
        background: white;
        color: #333;
      }

      .form-group input:focus,
      .form-group textarea:focus,
      .form-group select:focus {
        outline: none;
        border-color: #0891b2;
        box-shadow: 0 0 0 0.25rem rgba(8, 145, 178, 0.25);
      }

      .form-group textarea {
        resize: vertical;
        min-height: 100px;
        font-family: inherit;
      }

      .info-card {
        background: linear-gradient(135deg, #065f46 0%, #0891b2 100%);
        color: white;
        border-radius: 0.5rem;
        padding: 1.5rem;
        margin-bottom: 20px;
        box-shadow: 0 4px 15px rgba(6, 95, 70, 0.3);
      }

      .info-row {
        display: flex;
        margin-bottom: 12px;
        font-size: 16px;
      }

      .info-label {
        font-weight: 600;
        width: 180px;
        opacity: 0.9;
      }

      .info-value {
        font-weight: 500;
      }

      .table-container {
        margin-top: 20px;
        border: 1px solid #dee2e6;
        border-radius: 0.5rem;
        overflow: hidden;
        box-shadow: 0 0.125rem 0.25rem rgba(0, 0, 0, 0.075);
      }

      .table-container table {
        width: 100%;
        border-collapse: collapse;
      }

      .table-container th {
        background: #059669;
        color: white;
        padding: 14px 12px;
        text-align: left;
        font-weight: 600;
        font-size: 13px;
      }

      .table-container td {
        padding: 12px;
        border-bottom: 1px solid #f0f0f0;
        font-size: 14px;
      }

      .table-container tbody tr:hover {
        background: #f8f9fa;
      }

      .modal-footer {
        padding: 1rem 1.5rem;
        border-top: 1px solid #dee2e6;
        display: flex;
        justify-content: space-between;
        gap: 10px;
        background: #f8f9fa;
        border-radius: 0 0 12px 12px;
      }

      .btn-primary,
      .btn-secondary,
      .btn-success,
      .btn-danger,
      .btn-add {
        padding: 0.5rem 1rem;
        border: none;
        border-radius: 0.375rem;
        font-weight: 500;
        cursor: pointer;
        transition: all 0.15s;
        display: inline-flex;
        align-items: center;
        font-size: 14px;
      }

      .btn-primary {
        background: linear-gradient(135deg, #065f46 0%, #0891b2 100%);
        color: white;
      }

      .btn-primary:hover {
        background: linear-gradient(135deg, #064e3b 0%, #0e7490 100%);
      }

      .btn-secondary {
        background: #6c757d;
        color: white;
      }

      .btn-secondary:hover {
        background: #5c636a;
      }

      .btn-success {
        background: #10b981;
        color: white;
      }

      .btn-success:hover {
        background: #059669;
      }

      .btn-danger {
        background: #ef4444;
        color: white;
        padding: 6px 12px;
        font-size: 12px;
      }

      .btn-danger:hover {
        background: #dc2626;
      }

      .btn-add {
        background: linear-gradient(135deg, #065f46 0%, #0891b2 100%);
        color: white;
        padding: 10px 20px;
        margin-top: 10px;
      }

      .btn-add:hover {
        background: linear-gradient(135deg, #064e3b 0%, #0e7490 100%);
      }

      .grid-2 {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 20px;
      }

      @media (max-width: 768px) {
        .grid-2 {
          grid-template-columns: 1fr;
        }
      }

      .total-section {
        background: linear-gradient(135deg, #065f46 0%, #0891b2 100%);
        color: white;
        padding: 1.5rem;
        border-radius: 0.5rem;
        margin-top: 20px;
        display: flex;
        justify-content: space-between;
        align-items: center;
        box-shadow: 0 4px 15px rgba(6, 95, 70, 0.3);
      }

      .total-section .form-group {
        margin-bottom: 0;
      }

      .total-section .form-group label {
        color: white;
        opacity: 0.9;
      }

      .total-section .form-group input {
        width: 200px;
        background: white;
        border: 1px solid rgba(255,255,255,0.5);
        color: #333;
        font-weight: 600;
      }

      .total-section .form-group input::placeholder {
        color: #999;
      }
      
      .total-section .form-group input:focus {
        background: white;
        border-color: #fff;
        box-shadow: 0 0 0 0.25rem rgba(255, 255, 255, 0.3);
      }

      .total-section .total-label {
        font-size: 16px;
        font-weight: 600;
        opacity: 0.9;
        margin-bottom: 5px;
      }

      .total-section .total-value {
        font-size: 32px;
        font-weight: 700;
      }
      
      .btn-primary:disabled,
      .btn-success:disabled {
        opacity: 0.6;
        cursor: not-allowed;
      }
    </style>
    `;

    document.body.insertAdjacentHTML("beforeend", modalHTML);
  }

  initializeStep(step) {
    this.currentStep = step;
    this.updateStepper();
    this.renderStepContent();
    this.updateNavigationButtons();
  }

  updateStepper() {
    const steps = document.querySelectorAll(".step");
    steps.forEach((stepEl, index) => {
      stepEl.classList.remove("active", "completed");
      if (index < this.currentStep) {
        stepEl.classList.add("completed");
      } else if (index === this.currentStep) {
        stepEl.classList.add("active");
      }
    });
  }

  renderStepContent() {
    const contentDiv = document.getElementById("modalContent");

    switch (this.currentStep) {
      case 0:
        contentDiv.innerHTML = this.renderPatientInfo();
        break;
      case 1:
        contentDiv.innerHTML = this.renderAnamnesa();
        break;
      case 2:
        contentDiv.innerHTML = this.renderVitalSigns();
        break;
      case 3:
        contentDiv.innerHTML = this.renderDiagnosis();
        this.attachDiagnosisEvents();
        break;
      case 4:
        contentDiv.innerHTML = this.renderDrugs();
        break;
    }
  }

  renderPatientInfo() {
    return `
      <div class="form-section">
        <h3>📋 Informasi Pasien</h3>
        <div class="info-card">
          <div class="info-row">
            <div class="info-label">👤 Nama:</div>
            <div class="info-value">${this.queueData.nama || "-"}</div>
          </div>
          <div class="info-row">
            <div class="info-label">🆔 NIK:</div>
            <div class="info-value">${this.queueData.nik || "-"}</div>
          </div>
          <div class="info-row">
            <div class="info-label">🎫 No. Antrian:</div>
            <div class="info-value"><strong>${this.queueData.no_antrian || "-"}</strong></div>
          </div>
          <div class="info-row">
            <div class="info-label">📅 Tanggal:</div>
            <div class="info-value">${this.queueData.tanggal_antrian || "-"}</div>
          </div>
          <div class="info-row">
            <div class="info-label">🕐 Jam:</div>
            <div class="info-value">${this.queueData.jam_antrian || "-"}</div>
          </div>
          <div class="info-row">
            <div class="info-label">💳 Jenis Pasien:</div>
            <div class="info-value">${this.queueData.jenis_pasien || "-"}</div>
          </div>
        </div>
      </div>
    `;
  }

  renderAnamnesa() {
    return `
      <div class="form-section">
        <h3>🩺 Anamnesa</h3>
        
        <div class="form-group">
          <label>Keluhan Utama *</label>
          <textarea id="keluhan" placeholder="Tuliskan keluhan utama pasien..." required>${this.formData.keluhan}</textarea>
        </div>

        <div class="form-group">
          <label>Anamnesis *</label>
          <textarea id="anamnesis" placeholder="Riwayat penyakit sekarang, riwayat penyakit dahulu..." required>${this.formData.anamnesis}</textarea>
        </div>

        <h4 style="margin-top: 30px; margin-bottom: 15px; color: #065f46;">🔔 Riwayat Alergi</h4>
        
        <div class="grid-2">
          <div class="form-group">
            <label>Makanan</label>
            <select id="alergiMakanan">
              <option value="Tidak Ada" ${this.formData.alergi_makanan === "Tidak Ada" ? "selected" : ""}>Tidak Ada</option>
              <option value="Ada" ${this.formData.alergi_makanan === "Ada" ? "selected" : ""}>Ada</option>
            </select>
          </div>

          <div class="form-group">
            <label>Udara</label>
            <select id="alergiUdara">
              <option value="Tidak Ada" ${this.formData.alergi_udara === "Tidak Ada" ? "selected" : ""}>Tidak Ada</option>
              <option value="Ada" ${this.formData.alergi_udara === "Ada" ? "selected" : ""}>Ada</option>
            </select>
          </div>

          <div class="form-group">
            <label>Obat-Obatan</label>
            <select id="alergiObat">
              <option value="Tidak Ada" ${this.formData.alergi_obat === "Tidak Ada" ? "selected" : ""}>Tidak Ada</option>
              <option value="Ada" ${this.formData.alergi_obat === "Ada" ? "selected" : ""}>Ada</option>
            </select>
          </div>

          <div class="form-group">
            <label>Prognosa</label>
            <select id="prognosa">
              <option value="">Pilih Prognosa</option>
              <option value="Sanam" ${this.formData.prognosa === "Sanam" ? "selected" : ""}>Sanam (Sembuh)</option>
              <option value="Bonam" ${this.formData.prognosa === "Bonam" ? "selected" : ""}>Bonam (Baik)</option>
              <option value="Malam" ${this.formData.prognosa === "Malam" ? "selected" : ""}>Malam (Buruk/Jelek)</option>
              <option value="Dubia Ad Sanam" ${this.formData.prognosa === "Dubia Ad Sanam" ? "selected" : ""}>Dubia Ad Sanam/Bonam</option>
              <option value="Dubia Ad Malam" ${this.formData.prognosa === "Dubia Ad Malam" ? "selected" : ""}>Dubia Ad Malam</option>
            </select>
          </div>
        </div>

        <div class="form-group">
          <label>Terapi Obat *</label>
          <textarea id="terapiObat" placeholder="Rencana terapi menggunakan obat..." required>${this.formData.terapi_obat}</textarea>
        </div>

        <div class="form-group">
          <label>Terapi Non Obat</label>
          <textarea id="terapiNonObat" placeholder="Rencana terapi tanpa obat (fisioterapi, diet, dll)...">${this.formData.terapi_non_obat}</textarea>
        </div>

        <div class="form-group">
          <label>BMHP (Bahan Medis Habis Pakai)</label>
          <input type="text" id="bmhp" placeholder="Contoh: Kapas, perban, dll..." value="${this.formData.bmhp}">
        </div>
      </div>
    `;
  }

  renderVitalSigns() {
    return `
      <div class="form-section">
        <h3>❤️ Data Tanda Vital</h3>
        
        <div class="grid-2">
          <div class="form-group">
            <label>⚖️ Berat Badan (kg)</label>
            <input type="text" id="bodyWeight" placeholder="Contoh: 65.5" value="${this.formData.body_weight}">
          </div>

          <div class="form-group">
            <label>💨 Saturasi Oksigen (%)</label>
            <input type="text" id="oxygenSat" placeholder="Contoh: 98" value="${this.formData.oxygen_sat}">
          </div>

          <div class="form-group">
            <label>📏 Tinggi Badan (cm)</label>
            <input type="text" id="bodyHeight" placeholder="Contoh: 170" value="${this.formData.body_height}">
          </div>

          <div class="form-group">
            <label>🌡️ Suhu Tubuh (°C)</label>
            <input type="text" id="bodyTemp" placeholder="Contoh: 36.5" value="${this.formData.body_temp}">
          </div>

          <div class="form-group">
            <label>💉 Tekanan Darah (mmHg)</label>
            <input type="text" id="bloodPressure" placeholder="Contoh: 120/80" value="${this.formData.blood_pressure}">
          </div>

          <div class="form-group">
            <label>💓 Denyut Nadi (bpm)</label>
            <input type="text" id="heartRate" placeholder="Contoh: 72" value="${this.formData.heart_rate}">
          </div>

          <div class="form-group">
            <label>🫁 Laju Pernapasan (x/min)</label>
            <input type="text" id="respRate" placeholder="Contoh: 16" value="${this.formData.resp_rate}">
          </div>
        </div>
      </div>
    `;
  }

  renderDiagnosis() {
    return `
      <div class="form-section">
        <h3>🔬 Diagnosa Pasien</h3>
        
        <div style="margin-bottom: 30px;">
          <h4 style="color: #065f46; margin-bottom: 15px;">📋 ICDX (Diagnosa Penyakit)</h4>
          <button class="btn-add" onclick="pemeriksaanModal.addICDX()">
            <i class="bi bi-plus-circle me-2"></i>Tambah ICDX
          </button>
          <div class="table-container" style="margin-top: 15px;">
            <table id="icdxTable">
              <thead>
                <tr>
                  <th width="120">Kode ICDX</th>
                  <th>Deskripsi</th>
                  <th width="100">Aksi</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td colspan="3" style="text-align: center; color: #999; padding: 30px;">
                    Belum ada data ICDX
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div>
          <h4 style="color: #065f46; margin-bottom: 15px;">⚕️ ICDIX (Prosedur Medis)</h4>
          <button class="btn-add" onclick="pemeriksaanModal.addICDIX()">
            <i class="bi bi-plus-circle me-2"></i>Tambah ICDIX
          </button>
          <div class="table-container" style="margin-top: 15px;">
            <table id="icdixTable">
              <thead>
                <tr>
                  <th width="120">Kode ICDIX</th>
                  <th>Deskripsi</th>
                  <th width="100">Aksi</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td colspan="3" style="text-align: center; color: #999; padding: 30px;">
                    Belum ada data ICDIX
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    `;
  }

  renderDrugs() {
    const totalHargaObat = this.drugTableData.reduce(
      (sum, drug) => sum + (drug.harga * drug.jumlah),
      0
    );
    const total = totalHargaObat + this.hargaJasa;

    const hasResep = this.resepData.nama && this.resepData.detail;

    return `
      <div class="form-section">
        <h3>💊 Daftar Obat & Resep</h3>
        
        <div style="display: flex; gap: 10px; margin-bottom: 15px;">
          <button class="btn-add" onclick="pemeriksaanModal.showObatSelectionModal()" style="flex: 1;">
            <i class="bi bi-plus-circle me-2"></i>Tambah Obat
          </button>
          <button class="btn-add" onclick="pemeriksaanModal.showResepModal()" style="flex: 1; background: ${hasResep ? '#10b981' : 'linear-gradient(135deg, #065f46 0%, #0891b2 100%)'};">
            <i class="bi bi-file-earmark-medical me-2"></i>${hasResep ? '✓ Edit Resep' : 'Tambah Resep'}
          </button>
        </div>

        ${hasResep ? `
        <div class="resep-indicator" style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 15px; border-radius: 8px; margin-bottom: 15px;">
          <div style="display: flex; align-items: center; justify-content: space-between;">
            <div>
              <i class="bi bi-check-circle-fill me-2"></i>
              <strong>Resep: ${this.resepData.nama}</strong>
              ${this.resepData.catatan ? `<br><small style="opacity: 0.9; margin-left: 28px;">${this.resepData.catatan}</small>` : ''}
            </div>
            <button onclick="pemeriksaanModal.showResepModal()" style="background: rgba(255,255,255,0.2); border: 1px solid white; color: white; padding: 6px 12px; border-radius: 6px; cursor: pointer; font-size: 12px;">
              <i class="bi bi-pencil me-1"></i>Edit
            </button>
          </div>
        </div>
        ` : ''}

        <div class="table-container">
          <table id="drugTable">
            <thead>
              <tr>
                <th>Nama Obat</th>
                <th width="80">Jumlah</th>
                <th width="150">Signa</th>
                <th width="100">Aksi</th>
              </tr>
            </thead>
            <tbody>
              ${
                this.drugTableData.length === 0
                  ? '<tr><td colspan="4" style="text-align: center; color: #999; padding: 30px;">Belum ada obat ditambahkan</td></tr>'
                  : this.drugTableData
                      .map(
                        (drug, index) => `
                  <tr>
                    <td><strong>${drug.nama}</strong></td>
                    <td style="text-align: center;">${drug.jumlah}</td>
                    <td><em>${drug.signa}</em></td>
                    <td>
                      <button class="btn-danger" onclick="pemeriksaanModal.removeDrug(${index})">
                        <i class="bi bi-trash"></i> Hapus
                      </button>
                    </td>
                  </tr>
                `
                      )
                      .join("")
              }
            </tbody>
          </table>
        </div>

        <div class="total-section">
          <div>
            <div class="form-group" style="margin-bottom: 0;">
              <label>💰 Harga Jasa Dokter</label>
              <input type="text" id="hargaJasa" value="${this.hargaJasa}" 
                     oninput="pemeriksaanModal.updateHargaJasa(this.value)" 
                     placeholder="0" style="width: 250px;">
            </div>
          </div>
          <div style="text-align: right;">
            <div class="total-label">Total Keseluruhan:</div>
            <div class="total-value">Rp ${total.toLocaleString("id-ID")}</div>
            <div style="font-size: 12px; opacity: 0.8; margin-top: 5px;">
              (Obat: Rp ${totalHargaObat.toLocaleString(
                "id-ID"
              )} + Jasa: Rp ${this.hargaJasa.toLocaleString("id-ID")})
            </div>
          </div>
        </div>
      </div>
    `;
  }

  showResepModal() {
    window.resepModal = new ResepModal(this);
    window.resepModal.show();
  }

  showObatSelectionModal() {
    console.log("💊 Opening Obat Selection Modal with doctor ID:", this.currentDoctorId);
    
    if (!this.currentDoctorId) {
      console.error("❌ No doctor ID available!");
      if (window.CustomAlert) {
        CustomAlert.error("Doctor ID tidak ditemukan. Silakan refresh halaman.", "Error");
      } else {
        alert("Error: Doctor ID tidak ditemukan. Silakan refresh halaman.");
      }
      return;
    }
    
    window.obatSelectionModal = new ObatSelectionModal(this, this.currentDoctorId);
    window.obatSelectionModal.show();
  }

  addOrUpdateDrug(obatData) {
    const existingIndex = this.drugTableData.findIndex(
      drug => drug.id_obat === obatData.id_obat
    );

    if (existingIndex >= 0) {
      this.drugTableData[existingIndex] = obatData;
    } else {
      this.drugTableData.push(obatData);
    }

    this.renderStepContent();
  }

  async removeDrug(index) {
    let confirmed = false;
    if (window.CustomAlert) {
      confirmed = await CustomAlert.confirm("Hapus obat ini dari daftar?", "Hapus Obat?");
    } else {
      confirmed = confirm("Hapus obat ini?");
    }
    
    if (confirmed) {
      this.drugTableData.splice(index, 1);
      this.renderStepContent();
    }
  }

  updateHargaJasa(value) {
    const numericValue = value.replace(/[^0-9]/g, '');
    this.hargaJasa = parseFloat(numericValue) || 0;
    console.log("💰 Updated Harga Jasa (via input):", this.hargaJasa);
    this.renderStepContent();
  }

  attachDiagnosisEvents() {
    this.renderICDXTable();
    this.renderICDIXTable();
  }

  renderICDXTable() {
    const tbody = document.querySelector("#icdxTable tbody");
    if (this.icdxTableData.length === 0) {
      tbody.innerHTML =
        '<tr><td colspan="3" style="text-align: center; color: #999; padding: 30px;">Belum ada data ICDX</td></tr>';
    } else {
      tbody.innerHTML = this.icdxTableData
        .map(
          (item, index) => `
        <tr>
          <td><strong>${item.kode}</strong></td>
          <td>${item.deskripsi}</td>
          <td>
            <button class="btn-danger" onclick="pemeriksaanModal.removeICDX(${index})">
              <i class="bi bi-trash"></i> Hapus
            </button>
          </td>
        </tr>
      `
        )
        .join("");
    }
  }

  renderICDIXTable() {
    const tbody = document.querySelector("#icdixTable tbody");
    if (this.icdixTableData.length === 0) {
      tbody.innerHTML =
        '<tr><td colspan="3" style="text-align: center; color: #999; padding: 30px;">Belum ada data ICDIX</td></tr>';
    } else {
      tbody.innerHTML = this.icdixTableData
        .map(
          (item, index) => `
        <tr>
          <td><strong>${item.kode}</strong></td>
          <td>${item.deskripsi}</td>
          <td>
            <button class="btn-danger" onclick="pemeriksaanModal.removeICDIX(${index})">
              <i class="bi bi-trash"></i> Hapus
            </button>
          </td>
        </tr>
      `
        )
        .join("");
    }
  }

  addICDX() {
    window.icdxSelectionModal = new ICDXSelectionModal(this);
    window.icdxSelectionModal.show();
  }

  async removeICDX(index) {
    let confirmed = false;
    if (window.CustomAlert) {
      confirmed = await CustomAlert.confirm("Hapus data ICDX ini?", "Hapus ICDX?");
    } else {
      confirmed = confirm("Hapus data ICDX ini?");
    }
    
    if (confirmed) {
      this.icdxTableData.splice(index, 1);
      this.renderICDXTable();
    }
  }

  addICDIX() {
    window.icdixSelectionModal = new ICDIXSelectionModal(this);
    window.icdixSelectionModal.show();
  }

  async removeICDIX(index) {
    let confirmed = false;
    if (window.CustomAlert) {
      confirmed = await CustomAlert.confirm("Hapus data ICDIX ini?", "Hapus ICDIX?");
    } else {
      confirmed = confirm("Hapus data ICDIX ini?");
    }
    
    if (confirmed) {
      this.icdixTableData.splice(index, 1);
      this.renderICDIXTable();
    }
  }

  updateNavigationButtons() {
    const prevBtn = document.getElementById("prevBtn");
    const nextBtn = document.getElementById("nextBtn");
    const finishBtn = document.getElementById("finishBtn");

    prevBtn.style.display = this.currentStep === 0 ? "none" : "inline-flex";

    if (this.currentStep === this.totalSteps - 1) {
      nextBtn.style.display = "none";
      finishBtn.style.display = "inline-flex";
    } else {
      nextBtn.style.display = "inline-flex";
      finishBtn.style.display = "none";
    }
  }

  validateCurrentStep() {
    switch (this.currentStep) {
      case 1:
        const keluhan = document.getElementById("keluhan")?.value.trim();
        const anamnesis = document.getElementById("anamnesis")?.value.trim();
        const terapiObat = document.getElementById("terapiObat")?.value.trim();

        if (!keluhan || !anamnesis || !terapiObat) {
          if (window.CustomAlert) {
            CustomAlert.warning("Field yang bertanda (*) wajib diisi!", "Data Tidak Lengkap");
          } else {
            alert("⚠️ Field yang bertanda (*) wajib diisi!");
          }
          return false;
        }
        break;

      case 4:
        if (this.drugTableData.length === 0) {
          // Use sync confirm for this case
          if (!confirm("⚠️ Belum ada obat yang ditambahkan. Lanjutkan?")) {
            return false;
          }
        }
        break;
    }
    return true;
  }

  nextStep() {
    if (!this.validateCurrentStep()) return;
    this.saveCurrentStepData();

    if (this.currentStep < this.totalSteps - 1) {
      this.currentStep++;
      this.initializeStep(this.currentStep);
    }
  }

  previousStep() {
    this.saveCurrentStepData();

    if (this.currentStep > 0) {
      this.currentStep--;
      this.initializeStep(this.currentStep);
    }
  }

  async finish() {
    if (this.isProcessing) {
      console.log("⏳ Already processing, ignoring duplicate click");
      return;
    }
    
    if (!this.validateCurrentStep()) return;

    const hargaJasaInput = document.getElementById("hargaJasa");
    if (hargaJasaInput) {
        const numericValue = hargaJasaInput.value.replace(/[^0-9]/g, '');
        this.hargaJasa = parseFloat(numericValue) || 0;
        console.log("💰 Final Harga Jasa captured:", this.hargaJasa);
    }

    this.saveCurrentStepData();

    let confirmed = false;
    if (window.CustomAlert) {
      confirmed = await CustomAlert.confirm(
        "Selesaikan pemeriksaan ini?\n\nData akan disimpan dan status antrian akan diperbarui.",
        "Selesaikan Pemeriksaan?"
      );
    } else {
      confirmed = confirm("🏁 Selesaikan pemeriksaan ini?\n\nData akan disimpan dan status antrian akan diperbarui.");
    }

    if (!confirmed) return;

    this.isProcessing = true;
    const finishBtn = document.getElementById("finishBtn");
    if (finishBtn) {
      finishBtn.disabled = true;
      finishBtn.innerHTML = '<i class="bi bi-hourglass-split me-1"></i>Menyimpan...';
    }

    if (window.LoadingOverlay) {
      LoadingOverlay.show(
        "Menyimpan Data Pemeriksaan",
        "Mengirim data ke server dan memperbarui status..."
      );
    }

    const totalHargaObat = this.drugTableData.reduce(
      (sum, drug) => sum + drug.harga * drug.jumlah,
      0
    );
    const totalKeseluruhan = totalHargaObat + this.hargaJasa;

    const pemeriksaanData = {
      id_antrian: this.queueData.id_antrian,
      keluhan: this.formData.keluhan,
      anamnesis: this.formData.anamnesis,
      alergi_makanan: this.formData.alergi_makanan,
      alergi_udara: this.formData.alergi_udara,
      alergi_obat: this.formData.alergi_obat,
      prognosa: this.formData.prognosa,
      terapi_obat: this.formData.terapi_obat,
      terapi_non_obat: this.formData.terapi_non_obat,
      bmhp: this.formData.bmhp,
      body_weight: this.formData.body_weight,
      oxygen_sat: this.formData.oxygen_sat,
      body_height: this.formData.body_height,
      body_temp: this.formData.body_temp,
      blood_pressure: this.formData.blood_pressure,
      heart_rate: this.formData.heart_rate,
      resp_rate: this.formData.resp_rate,
      icdx: this.icdxTableData,
      icdix: this.icdixTableData,
      obat: this.drugTableData,
      resep: this.resepData,
      harga_jasa: this.hargaJasa,
      total: totalKeseluruhan,
    };

    console.log("=".repeat(60));
    console.log("💾 SAVING PEMERIKSAAN DATA");
    console.log("=".repeat(60));
    console.log("📊 id_antrian:", this.queueData.id_antrian);
    console.log("💰 Harga Jasa:", this.hargaJasa);
    console.log("💊 Total Harga Obat:", totalHargaObat);
    console.log("💵 Total Keseluruhan:", totalKeseluruhan);
    console.log("📦 Full Data:", pemeriksaanData);
    console.log("=".repeat(60));

    try {
      if (window.LoadingOverlay) {
        LoadingOverlay.updateMessage("Menyimpan ke Database", "Mohon tunggu sebentar...");
      }
      
      const response = await fetch(
        `../API/auth/antrian.php?action=finish_pemeriksaan&id=${this.queueData.id_antrian}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(pemeriksaanData),
        }
      );

      const result = await response.json();
      console.log("📥 Server Response:", result);

      if (window.LoadingOverlay) {
        LoadingOverlay.hide();
      }

      if (result.success) {
        if (window.LoadingOverlay) {
          LoadingOverlay.show("✅ Pemeriksaan Berhasil!", "Memperbarui daftar pasien...");
        }
        
        setTimeout(async () => {
          if (window.LoadingOverlay) {
            LoadingOverlay.hide();
          }
          this.close();

          if (window.currentFragment && window.currentFragment.loadQueues) {
            await window.currentFragment.loadQueues();
          }
          
          if (window.Toast) {
            Toast.success("Pemeriksaan berhasil disimpan!");
          }
        }, 1500);
      } else {
        if (window.CustomAlert) {
          CustomAlert.error(
            result.message || result.error || "Unknown error",
            "Gagal Menyimpan Pemeriksaan"
          );
        } else {
          alert("❌ Gagal menyimpan pemeriksaan:\n" + (result.message || result.error || "Unknown error"));
        }
      }
    } catch (error) {
      console.error("❌ Error saving pemeriksaan:", error);
      if (window.LoadingOverlay) {
        LoadingOverlay.hide();
      }
      if (window.CustomAlert) {
        CustomAlert.error(error.message, "Error");
      } else {
        alert("❌ Error: " + error.message);
      }
    } finally {
      this.isProcessing = false;
      if (finishBtn) {
        finishBtn.disabled = false;
        finishBtn.innerHTML = '<i class="bi bi-check-circle me-1"></i>Selesai';
      }
    }
  }

  close() {
    const modal = document.getElementById("pemeriksaanModal");
    if (modal) {
      modal.style.animation = "fadeOut 0.3s";
      setTimeout(() => modal.remove(), 300);
    }
  }
}

window.pemeriksaanModal = new PemeriksaanModal();

// ========================================
// PEMERIKSAAN FRAGMENT CLASS
// ========================================
class PemeriksaanFragment {
  constructor() {
    this.title = "Pemeriksaan";
    this.icon = "bi-heart-pulse";
    this.queues = [];
    this.currentDoctorId = null;
    this.currentDoctorName = "";
    this.apiUrl = "../API/auth/antrian.php";
    this.profileApiUrl = "../API/auth/profile.php";
    this.isProcessingQueue = false;

    this.currentPage = 1;
    this.pageSize = 10;
    this.totalQueues = 0;
    this.isLoading = false;
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
                    <th class="text-success">ENCOUNTER</th>
                    <th class="text-success">AKSI</th>
                  </tr>
                </thead>
                <tbody id="queueTableBody">
                  ${PemeriksaanSkeletonLoader.tableRows(8, 5)}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      ${pemeriksaanSkeletonStyles}

      <style>
        .btn-periksa { 
          background: linear-gradient(135deg, #065f46 0%, #0891b2 100%); 
          color: white; 
          border: none; 
          padding: 6px 20px; 
          border-radius: 20px; 
          font-size: 0.85rem; 
        }
        .btn-periksa:hover { 
          background: linear-gradient(135deg, #064e3b 0%, #0e7490 100%); 
          color: white;
        }
        .btn-periksa:disabled { 
          opacity: 0.6; 
          cursor: not-allowed; 
        }
        
        .btn-resume { 
          background-color: #0891b2; 
          color: white; 
          border: none; 
          padding: 6px 20px; 
          border-radius: 20px; 
          font-size: 0.85rem; 
        }
        .btn-resume:hover { background-color: #0e7490; color: white; }
        .btn-resume:disabled { 
          opacity: 0.6; 
          cursor: not-allowed; 
        }
        
        .btn-continue {
          background-color: #10b981;
          color: white;
          border: none;
          padding: 6px 16px;
          border-radius: 20px;
          font-size: 0.85rem;
        }
        .btn-continue:hover { background-color: #059669; color: white; }
        .btn-continue:disabled { 
          opacity: 0.6; 
          cursor: not-allowed; 
        }
        
        .badge-status { 
          padding: 6px 16px; 
          border-radius: 20px; 
          font-size: 0.85rem; 
          font-weight: 500; 
        }
        .status-belum-periksa { background-color: #ffc107; color: #000; }
        .status-di-terima { background-color: #0891b2; color: white; }
        .status-sedang-diperiksa { background-color: #10b981; color: white; }
        .status-selesai { background-color: #198754; color: white; }
        
        .encounter-badge { 
          background-color: #d1fae5; 
          color: #065f46; 
          padding: 4px 12px; 
          border-radius: 12px; 
          font-size: 0.75rem;
          font-family: monospace;
        }
      </style>
    `;
  }

  renderQueueRows() {
    if (this.queues.length === 0) {
      return `
        <tr>
          <td colspan="8" class="text-center py-5">
            <i class="bi bi-inbox fs-1 text-muted"></i>
            <p class="text-muted mt-3">Belum ada pasien yang perlu diperiksa</p>
          </td>
        </tr>
      `;
    }

    return this.queues
      .map((queue) => {
        const statusClass = `status-${queue.status_antrian
          .toLowerCase()
          .replace(" ", "-")}`;
        const hasEncounter = queue.id_encounter_satusehat;

        let actionButtons = "";

        if (queue.status_antrian.toLowerCase() === "di terima") {
          if (hasEncounter) {
            actionButtons = `
            <button class="btn btn-resume btn-sm" onclick="window.currentFragment.resumeQueue('${queue.id_antrian}')" id="btn-resume-${queue.id_antrian}">
              <i class="bi bi-play-circle me-1"></i>LANJUTKAN
            </button>
          `;
          } else {
            actionButtons = `
            <button class="btn btn-periksa btn-sm" onclick="window.currentFragment.periksaQueue('${queue.id_antrian}')" id="btn-periksa-${queue.id_antrian}">
              <i class="bi bi-heart-pulse me-1"></i>PERIKSA
            </button>
          `;
          }
        } else if (queue.status_antrian.toLowerCase() === "sedang diperiksa") {
          actionButtons = `
          <button class="btn btn-continue btn-sm" onclick="window.currentFragment.continueExamination('${queue.id_antrian}')" id="btn-continue-${queue.id_antrian}" title="Lanjutkan Pemeriksaan">
            <i class="bi bi-clipboard-pulse me-1"></i>LANJUT
          </button>
        `;
        } else if (queue.status_antrian.toLowerCase() === "selesai") {
          actionButtons = `<span class="text-success"><i class="bi bi-check-circle me-1"></i>Selesai</span>`;
        } else {
          actionButtons = `<span class="text-muted">-</span>`;
        }

        const encounterDisplay = hasEncounter
          ? `<span class="encounter-badge" title="${hasEncounter}">${hasEncounter.substring(
              0,
              8
            )}...</span>`
          : `<span class="text-muted">-</span>`;

        return `
        <tr>
          <td><strong class="text-primary fs-5">${
            queue.no_antrian
          }</strong></td>
          <td>${queue.tanggal_antrian}</td>
          <td><strong>${queue.jam_antrian}</strong></td>
          <td>${queue.nama ?? "-"}</td>
          <td><small>${queue.nik ?? "-"}</small></td>
          <td><span class="badge badge-status ${statusClass}">${
          queue.status_antrian
        }</span></td>
          <td>${encounterDisplay}</td>
          <td>${actionButtons}</td>
        </tr>
      `;
      })
      .join("");
  }

  async continueExamination(id) {
    console.log("📋 Continue examination for queue:", id);

    const queueData = this.queues.find((q) => q.id_antrian === id);
    if (queueData) {
      const dataToPass = { ...queueData };
      dataToPass.status_antrian = "Sedang Diperiksa";
      
      console.log("📋 Continuing with queue data:", dataToPass);
      
      window.pemeriksaanModal.show(dataToPass, this.currentDoctorId);
    } else {
      if (window.CustomAlert) {
        CustomAlert.error("Data antrian tidak ditemukan", "Error");
      } else {
        alert("❌ Data antrian tidak ditemukan");
      }
    }
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
        console.error("❌ No user email found");
        if (window.CustomAlert) {
          CustomAlert.error("Anda belum login.", "Sesi Tidak Valid");
        } else {
          alert("Error: Anda belum login.");
        }
        return;
      }

      const response = await fetch(this.profileApiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ action: "get", email: data }),
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
        console.error("❌ Failed to load profile");
        if (window.CustomAlert) {
          CustomAlert.error("Tidak dapat memuat profil dokter.", "Error");
        } else {
          alert("Error: Tidak dapat memuat profil dokter.");
        }
      }
    } catch (error) {
      console.error("❌ Error loading profile:", error);
      if (window.CustomAlert) {
        CustomAlert.error(error.message, "Error");
      } else {
        alert("Error: " + error.message);
      }
    }
  }

  setupEventListeners() {
    const refreshBtn = document.getElementById("refreshBtn");
    if (refreshBtn)
      refreshBtn.addEventListener("click", () => this.loadQueues());
  }

  async loadQueues() {
    if (!this.currentDoctorId) {
      console.error("❌ No doctor ID available");
      return;
    }

    try {
      let { data, error } = await window.supabaseClient.rpc(
        "get_latest_antrian_for_dokter",
        {
          p_dokter: this.currentDoctorId,
        }
      );

      console.log("📥 Loaded queues:", data, error);

      if (Array.isArray(data)) {
        this.queues = data.filter(
          (q) =>
            q.status_antrian.toLowerCase() === "di terima" ||
            q.status_antrian.toLowerCase() === "sedang diperiksa" 
        );

        this.updateTable();

        const countBadge = document.getElementById("queueCount");
        if (countBadge) {
          countBadge.textContent = `${this.queues.length} Pasien`;
        }
      }
    } catch (error) {
      console.error("❌ Error loading queues:", error);
      if (window.CustomAlert) {
        CustomAlert.error("Gagal memuat data antrian: " + error.message, "Error");
      } else {
        alert("Error loading queues: " + error.message);
      }
    }
  }

  async periksaQueue(id) {
    if (this.isProcessingQueue) {
      console.log("⏳ Already processing, ignoring duplicate click");
      return;
    }

    const queueData = this.queues.find((q) => q.id_antrian === id);
    if (!queueData) {
      if (window.CustomAlert) {
        CustomAlert.error("Data antrian tidak ditemukan", "Error");
      } else {
        alert("❌ Data antrian tidak ditemukan");
      }
      return;
    }

    let confirmed = false;
    if (window.CustomAlert) {
      confirmed = await CustomAlert.confirm(
        "Mulai pemeriksaan untuk pasien ini?\n\nIni akan membuat Encounter baru di SATUSEHAT.",
        "Mulai Pemeriksaan?"
      );
    } else {
      confirmed = confirm("Mulai pemeriksaan untuk pasien ini?\n\nIni akan membuat Encounter baru di SATUSEHAT.");
    }

    if (!confirmed) return;

    this.isProcessingQueue = true;
    const periksaBtn = document.getElementById(`btn-periksa-${id}`);
    if (periksaBtn) {
      periksaBtn.disabled = true;
      periksaBtn.innerHTML = '<i class="bi bi-hourglass-split me-1"></i>Loading...';
    }

    if (window.LoadingOverlay) {
      LoadingOverlay.show(
        "Membuat Encounter SATUSEHAT",
        "Menghubungi server SATUSEHAT untuk membuat encounter baru..."
      );
    }

    try {
      setTimeout(() => {
        if (window.LoadingOverlay) {
          LoadingOverlay.updateMessage("Memproses Data Pasien", "Menyinkronkan data dengan SATUSEHAT...");
        }
      }, 1500);
      
      const response = await fetch(`${this.apiUrl}?action=periksa&id=${id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      const result = await response.json();

      if (window.LoadingOverlay) {
        LoadingOverlay.hide();
      }

      if (result.success) {
        const updatedQueueData = {
          ...queueData,
          id_antrian: result.id_antrian,
          id_encounter_satusehat: result.id_encounter_satusehat,
          status_antrian: "Sedang Diperiksa"
        };
        
        const queueIndex = this.queues.findIndex((q) => q.id_antrian === id);
        if (queueIndex !== -1) {
          this.queues[queueIndex] = updatedQueueData;
        }
        
        this.updateTable();
        
        window.pemeriksaanModal.show(updatedQueueData, this.currentDoctorId);
        
        setTimeout(() => this.loadQueues(), 1000);
      } else {
        if (window.CustomAlert) {
          CustomAlert.error(
            result.message || result.error || "Unknown error",
            "Gagal Memulai Pemeriksaan"
          );
        } else {
          alert("❌ Gagal memulai pemeriksaan: " + (result.message || result.error || ""));
        }
      }
    } catch (error) {
      console.error("❌ Error starting examination:", error);
      if (window.LoadingOverlay) {
        LoadingOverlay.hide();
      }
      if (window.CustomAlert) {
        CustomAlert.error(error.message, "Error");
      } else {
        alert("❌ Error: " + error.message);
      }
    } finally {
      this.isProcessingQueue = false;
      if (periksaBtn) {
        periksaBtn.disabled = false;
        periksaBtn.innerHTML = '<i class="bi bi-heart-pulse me-1"></i>PERIKSA';
      }
    }
  }

  async resumeQueue(id) {
    if (this.isProcessingQueue) {
      console.log("⏳ Already processing, ignoring duplicate click");
      return;
    }

    const queueData = this.queues.find((q) => q.id_antrian === id);
    if (!queueData) {
      if (window.CustomAlert) {
        CustomAlert.error("Data antrian tidak ditemukan", "Error");
      } else {
        alert("❌ Data antrian tidak ditemukan");
      }
      return;
    }

    let confirmed = false;
    if (window.CustomAlert) {
      confirmed = await CustomAlert.confirm("Lanjutkan pemeriksaan pasien ini?", "Lanjutkan Pemeriksaan?");
    } else {
      confirmed = confirm("Lanjutkan pemeriksaan pasien ini?");
    }

    if (!confirmed) return;

    this.isProcessingQueue = true;
    const resumeBtn = document.getElementById(`btn-resume-${id}`);
    if (resumeBtn) {
      resumeBtn.disabled = true;
      resumeBtn.innerHTML = '<i class="bi bi-hourglass-split me-1"></i>Loading...';
    }

    if (window.LoadingOverlay) {
      LoadingOverlay.show(
        "Melanjutkan Pemeriksaan",
        "Memuat data pemeriksaan sebelumnya..."
      );
    }

    try {
      const response = await fetch(`${this.apiUrl}?action=resume_pemeriksaan&id=${id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      const result = await response.json();

      if (window.LoadingOverlay) {
        LoadingOverlay.hide();
      }

      if (result.success) {
        const updatedQueueData = {
          ...queueData,
          id_antrian: result.id_antrian,
          status_antrian: "Sedang Diperiksa"
        };
        
        const queueIndex = this.queues.findIndex((q) => q.id_antrian === id);
        if (queueIndex !== -1) {
          this.queues[queueIndex] = updatedQueueData;
        }
        
        this.updateTable();
        
        window.pemeriksaanModal.show(updatedQueueData, this.currentDoctorId);
        
        setTimeout(() => this.loadQueues(), 1000);
      } else {
        if (window.CustomAlert) {
          CustomAlert.error(
            result.message || result.error || "Unknown error",
            "Gagal Melanjutkan Pemeriksaan"
          );
        } else {
          alert("❌ Gagal melanjutkan pemeriksaan: " + (result.message || result.error || ""));
        }
      }
    } catch (error) {
      console.error("❌ Error resuming examination:", error);
      if (window.LoadingOverlay) {
        LoadingOverlay.hide();
      }
      if (window.CustomAlert) {
        CustomAlert.error(error.message, "Error");
      } else {
        alert("❌ Error: " + error.message);
      }
    } finally {
      this.isProcessingQueue = false;
      if (resumeBtn) {
        resumeBtn.disabled = false;
        resumeBtn.innerHTML = '<i class="bi bi-play-circle me-1"></i>LANJUTKAN';
      }
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
    console.log("Pemeriksaan fragment destroyed");
  }
}

console.log("✅ Pemeriksaan System loaded with Custom Alerts & Shared Components");

// Export to window
window.PemeriksaanFragment = PemeriksaanFragment;