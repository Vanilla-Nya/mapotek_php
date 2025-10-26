console.log("🔥 PEMERIKSAAN SYSTEM - FIXED VERSION 🔥");

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
  }

  show(queueData) {
    this.queueData = queueData;
    this.createModal();
    this.initializeStep(0);
  }

  createModal() {
    const existingModal = document.getElementById('pemeriksaanModal');
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

          <div class="modal-content" id="modalContent"></div>

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
      background: rgba(0, 0, 0, 0.5);  /* Changed from 0.6 to 0.5 */
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 1055;  /* Bootstrap's modal z-index */
      overflow-y: auto;
      padding: 0;  /* Remove padding */
      animation: fadeIn 0.15s;  /* Faster animation */
    }

      @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
      }

      .modal-container {
      background: white;
      border-radius: 12px;
      width: 90%;
      max-width: 800px;  /* Match Bootstrap's default */
      margin: 1.75rem auto;
      max-height: calc(100vh - 3.5rem);
      display: flex;
      flex-direction: column;
      box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.15);
      animation: slideUp 0.3s;
      position: relative;  /* Add this */
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
        background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
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
        background: #6366f1;
        color: white;
        box-shadow: 0 4px 12px rgba(99, 102, 241, 0.4);
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
        color: #6366f1;
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

      .modal-content {
        padding: 30px;
        overflow-y: auto;
        flex: 1;
      }

      .form-section h3 {
        font-size: 1.25rem;
        font-weight: 600;
        margin-bottom: 20px;
        color: #333;
        border-bottom: 2px solid #6366f1;
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
        border-color: #6366f1;
        box-shadow: 0 0 0 0.25rem rgba(99, 102, 241, 0.25);
      }

      .form-group textarea {
        resize: vertical;
        min-height: 100px;
        font-family: inherit;
      }

      .info-card {
        background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
        color: white;
        border-radius: 0.5rem;
        padding: 1.5rem;
        margin-bottom: 20px;
        box-shadow: 0 4px 15px rgba(99, 102, 241, 0.3);
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
        background: #6366f1;
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
        background: #6366f1;
        color: white;
      }

      .btn-primary:hover {
        background: #4f46e5;
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
        background: #6366f1;
        color: white;
        padding: 10px 20px;
        margin-top: 10px;
      }

      .btn-add:hover {
        background: #4f46e5;
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
        background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
        color: white;
        padding: 1.5rem;
        border-radius: 0.5rem;
        margin-top: 20px;
        display: flex;
        justify-content: space-between;
        align-items: center;
        box-shadow: 0 4px 15px rgba(99, 102, 241, 0.3);
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
    </style>
    `;

    document.body.insertAdjacentHTML('beforeend', modalHTML);
  }

  initializeStep(step) {
    this.currentStep = step;
    this.updateStepper();
    this.renderStepContent();
    this.updateNavigationButtons();
  }

  updateStepper() {
    const steps = document.querySelectorAll('.step');
    steps.forEach((stepEl, index) => {
      stepEl.classList.remove('active', 'completed');
      if (index < this.currentStep) {
        stepEl.classList.add('completed');
      } else if (index === this.currentStep) {
        stepEl.classList.add('active');
      }
    });
  }

  renderStepContent() {
    const contentDiv = document.getElementById('modalContent');
    
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
            <div class="info-value">${this.queueData.nama || '-'}</div>
          </div>
          <div class="info-row">
            <div class="info-label">🆔 NIK:</div>
            <div class="info-value">${this.queueData.nik || '-'}</div>
          </div>
          <div class="info-row">
            <div class="info-label">🎫 No. Antrian:</div>
            <div class="info-value"><strong>${this.queueData.no_antrian || '-'}</strong></div>
          </div>
          <div class="info-row">
            <div class="info-label">📅 Tanggal:</div>
            <div class="info-value">${this.queueData.tanggal_antrian || '-'}</div>
          </div>
          <div class="info-row">
            <div class="info-label">🕐 Jam:</div>
            <div class="info-value">${this.queueData.jam_antrian || '-'}</div>
          </div>
          <div class="info-row">
            <div class="info-label">💳 Jenis Pasien:</div>
            <div class="info-value">${this.queueData.jenis_pasien || '-'}</div>
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
          <textarea id="keluhan" placeholder="Tuliskan keluhan utama pasien..." required></textarea>
        </div>

        <div class="form-group">
          <label>Anamnesis *</label>
          <textarea id="anamnesis" placeholder="Riwayat penyakit sekarang, riwayat penyakit dahulu..." required></textarea>
        </div>

        <h4 style="margin-top: 30px; margin-bottom: 15px; color: #667eea;">🔔 Riwayat Alergi</h4>
        
        <div class="grid-2">
          <div class="form-group">
            <label>Makanan</label>
            <select id="alergiMakanan">
              <option value="Tidak Ada">Tidak Ada</option>
              <option value="Ada">Ada</option>
            </select>
          </div>

          <div class="form-group">
            <label>Udara</label>
            <select id="alergiUdara">
              <option value="Tidak Ada">Tidak Ada</option>
              <option value="Ada">Ada</option>
            </select>
          </div>

          <div class="form-group">
            <label>Obat-Obatan</label>
            <select id="alergiObat">
              <option value="Tidak Ada">Tidak Ada</option>
              <option value="Ada">Ada</option>
            </select>
          </div>

          <div class="form-group">
            <label>Prognosa</label>
            <select id="prognosa">
              <option value="">Pilih Prognosa</option>
              <option value="Sanam">Sanam (Sembuh)</option>
              <option value="Bonam">Bonam (Baik)</option>
              <option value="Malam">Malam (Buruk/Jelek)</option>
              <option value="Dubia Ad Sanam">Dubia Ad Sanam/Bonam</option>
              <option value="Dubia Ad Malam">Dubia Ad Malam</option>
            </select>
          </div>
        </div>

        <div class="form-group">
          <label>Terapi Obat *</label>
          <textarea id="terapiObat" placeholder="Rencana terapi menggunakan obat..." required></textarea>
        </div>

        <div class="form-group">
          <label>Terapi Non Obat</label>
          <textarea id="terapiNonObat" placeholder="Rencana terapi tanpa obat (fisioterapi, diet, dll)..."></textarea>
        </div>

        <div class="form-group">
          <label>BMHP (Bahan Medis Habis Pakai)</label>
          <input type="text" id="bmhp" placeholder="Contoh: Kapas, perban, dll...">
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
            <input type="number" id="bodyWeight" step="0.1" placeholder="Contoh: 65.5">
          </div>

          <div class="form-group">
            <label>💨 Saturasi Oksigen (%)</label>
            <input type="number" id="oxygenSat" step="0.1" placeholder="Contoh: 98">
          </div>

          <div class="form-group">
            <label>📏 Tinggi Badan (cm)</label>
            <input type="number" id="bodyHeight" step="0.1" placeholder="Contoh: 170">
          </div>

          <div class="form-group">
            <label>🌡️ Suhu Tubuh (°C)</label>
            <input type="number" id="bodyTemp" step="0.1" placeholder="Contoh: 36.5">
          </div>

          <div class="form-group">
            <label>💉 Tekanan Darah (mmHg)</label>
            <input type="text" id="bloodPressure" placeholder="Contoh: 120/80">
          </div>

          <div class="form-group">
            <label>💓 Denyut Nadi (bpm)</label>
            <input type="number" id="heartRate" placeholder="Contoh: 72">
          </div>

          <div class="form-group">
            <label>🫁 Laju Pernapasan (x/min)</label>
            <input type="number" id="respRate" placeholder="Contoh: 16">
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
          <h4 style="color: #667eea; margin-bottom: 15px;">📋 ICDX (Diagnosa Penyakit)</h4>
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
          <h4 style="color: #667eea; margin-bottom: 15px;">⚕️ ICDIX (Prosedur Medis)</h4>
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
    const totalHargaObat = this.drugTableData.reduce((sum, drug) => sum + (drug.harga * drug.jumlah), 0);
    const total = totalHargaObat + this.hargaJasa;

    return `
      <div class="form-section">
        <h3>💊 Daftar Obat</h3>
        
        <button class="btn-add" onclick="pemeriksaanModal.addDrug()">
          <i class="bi bi-plus-circle me-2"></i>Tambah Obat
        </button>

        <div class="table-container" style="margin-top: 15px;">
          <table id="drugTable">
            <thead>
              <tr>
                <th>Nama Obat</th>
                <th width="120">Jenis</th>
                <th width="80">Jumlah</th>
                <th width="120">Harga</th>
                <th width="150">Signa</th>
                <th width="100">Aksi</th>
              </tr>
            </thead>
            <tbody>
              ${this.drugTableData.length === 0 ? 
                '<tr><td colspan="6" style="text-align: center; color: #999; padding: 30px;">Belum ada obat ditambahkan</td></tr>' :
                this.drugTableData.map((drug, index) => `
                  <tr>
                    <td><strong>${drug.nama}</strong></td>
                    <td>${drug.jenis}</td>
                    <td style="text-align: center;">${drug.jumlah}</td>
                    <td>Rp ${drug.harga.toLocaleString('id-ID')}</td>
                    <td><em>${drug.signa}</em></td>
                    <td>
                      <button class="btn-danger" onclick="pemeriksaanModal.removeDrug(${index})">
                        <i class="bi bi-trash"></i> Hapus
                      </button>
                    </td>
                  </tr>
                `).join('')
              }
            </tbody>
          </table>
        </div>

        <div class="total-section">
          <div>
            <div class="form-group" style="margin-bottom: 0;">
              <label>💰 Harga Jasa Dokter</label>
              <input type="number" id="hargaJasa" value="${this.hargaJasa}" 
                     oninput="pemeriksaanModal.updateHargaJasa(this.value)" 
                     placeholder="0" style="width: 250px;">
            </div>
          </div>
          <div style="text-align: right;">
            <div class="total-label">Total Keseluruhan:</div>
            <div class="total-value">Rp ${total.toLocaleString('id-ID')}</div>
            <div style="font-size: 12px; opacity: 0.8; margin-top: 5px;">
              (Obat: Rp ${totalHargaObat.toLocaleString('id-ID')} + Jasa: Rp ${this.hargaJasa.toLocaleString('id-ID')})
            </div>
          </div>
        </div>
      </div>
    `;
  }

  attachDiagnosisEvents() {
    this.renderICDXTable();
    this.renderICDIXTable();
  }

  renderICDXTable() {
    const tbody = document.querySelector('#icdxTable tbody');
    if (this.icdxTableData.length === 0) {
      tbody.innerHTML = '<tr><td colspan="3" style="text-align: center; color: #999; padding: 30px;">Belum ada data ICDX</td></tr>';
    } else {
      tbody.innerHTML = this.icdxTableData.map((item, index) => `
        <tr>
          <td><strong>${item.kode}</strong></td>
          <td>${item.deskripsi}</td>
          <td>
            <button class="btn-danger" onclick="pemeriksaanModal.removeICDX(${index})">
              <i class="bi bi-trash"></i> Hapus
            </button>
          </td>
        </tr>
      `).join('');
    }
  }

  renderICDIXTable() {
    const tbody = document.querySelector('#icdixTable tbody');
    if (this.icdixTableData.length === 0) {
      tbody.innerHTML = '<tr><td colspan="3" style="text-align: center; color: #999; padding: 30px;">Belum ada data ICDIX</td></tr>';
    } else {
      tbody.innerHTML = this.icdixTableData.map((item, index) => `
        <tr>
          <td><strong>${item.kode}</strong></td>
          <td>${item.deskripsi}</td>
          <td>
            <button class="btn-danger" onclick="pemeriksaanModal.removeICDIX(${index})">
              <i class="bi bi-trash"></i> Hapus
            </button>
          </td>
        </tr>
      `).join('');
    }
  }

  addICDX() {
    const kode = prompt('Masukkan Kode ICDX (contoh: A00.0):');
    if (!kode) return;
    const deskripsi = prompt('Masukkan Deskripsi Diagnosa:');
    if (!deskripsi) return;

    this.icdxTableData.push({ kode: kode.trim(), deskripsi: deskripsi.trim() });
    this.renderICDXTable();
  }

  removeICDX(index) {
    if (confirm('Hapus data ICDX ini?')) {
      this.icdxTableData.splice(index, 1);
      this.renderICDXTable();
    }
  }

  addICDIX() {
    const kode = prompt('Masukkan Kode ICDIX (contoh: 01.00):');
    if (!kode) return;
    const deskripsi = prompt('Masukkan Deskripsi Prosedur:');
    if (!deskripsi) return;

    this.icdixTableData.push({ kode: kode.trim(), deskripsi: deskripsi.trim() });
    this.renderICDIXTable();
  }

  removeICDIX(index) {
    if (confirm('Hapus data ICDIX ini?')) {
      this.icdixTableData.splice(index, 1);
      this.renderICDIXTable();
    }
  }

  addDrug() {
    const nama = prompt('Nama Obat:');
    if (!nama) return;
    const jenis = prompt('Jenis Obat (contoh: Tablet, Kapsul, Sirup):');
    if (!jenis) return;
    const jumlah = parseInt(prompt('Jumlah:'));
    if (!jumlah || jumlah <= 0) {
      alert('Jumlah harus lebih dari 0!');
      return;
    }
    const harga = parseFloat(prompt('Harga per unit:'));
    if (!harga || harga < 0) {
      alert('Harga tidak valid!');
      return;
    }
    const signa = prompt('Signa (aturan pakai):');
    if (!signa) return;

    this.drugTableData.push({ 
      nama: nama.trim(), 
      jenis: jenis.trim(), 
      jumlah, 
      harga, 
      signa: signa.trim() 
    });
    this.renderStepContent();
  }

  removeDrug(index) {
    if (confirm('Hapus obat ini?')) {
      this.drugTableData.splice(index, 1);
      this.renderStepContent();
    }
  }

  updateHargaJasa(value) {
    this.hargaJasa = parseFloat(value) || 0;
    this.renderStepContent();
  }

  updateNavigationButtons() {
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    const finishBtn = document.getElementById('finishBtn');

    prevBtn.style.display = this.currentStep === 0 ? 'none' : 'inline-flex';
    
    if (this.currentStep === this.totalSteps - 1) {
      nextBtn.style.display = 'none';
      finishBtn.style.display = 'inline-flex';
    } else {
      nextBtn.style.display = 'inline-flex';
      finishBtn.style.display = 'none';
    }
  }

  validateCurrentStep() {
    switch (this.currentStep) {
      case 1:
        const keluhan = document.getElementById('keluhan')?.value.trim();
        const anamnesis = document.getElementById('anamnesis')?.value.trim();
        const terapiObat = document.getElementById('terapiObat')?.value.trim();
        
        if (!keluhan || !anamnesis || !terapiObat) {
          alert('⚠️ Field yang bertanda (*) wajib diisi!');
          return false;
        }
        break;
      
      case 4:
        if (this.drugTableData.length === 0) {
          if (!confirm('⚠️ Belum ada obat yang ditambahkan. Lanjutkan?')) {
            return false;
          }
        }
        break;
    }
    return true;
  }

  nextStep() {
    if (!this.validateCurrentStep()) return;
    
    if (this.currentStep < this.totalSteps - 1) {
      this.currentStep++;
      this.initializeStep(this.currentStep);
    }
  }

  previousStep() {
    if (this.currentStep > 0) {
      this.currentStep--;
      this.initializeStep(this.currentStep);
    }
  }

  async finish() {
    if (!this.validateCurrentStep()) return;

    if (!confirm('🏁 Selesaikan pemeriksaan ini?\n\nData akan disimpan dan status antrian akan diperbarui.')) return;

    const pemeriksaanData = {
      id_antrian: this.queueData.id_antrian,
      
      keluhan: document.getElementById('keluhan')?.value || '',
      anamnesis: document.getElementById('anamnesis')?.value || '',
      alergi_makanan: document.getElementById('alergiMakanan')?.value || 'Tidak Ada',
      alergi_udara: document.getElementById('alergiUdara')?.value || 'Tidak Ada',
      alergi_obat: document.getElementById('alergiObat')?.value || 'Tidak Ada',
      prognosa: document.getElementById('prognosa')?.value || '',
      terapi_obat: document.getElementById('terapiObat')?.value || '',
      terapi_non_obat: document.getElementById('terapiNonObat')?.value || '',
      bmhp: document.getElementById('bmhp')?.value || '',
      
      body_weight: document.getElementById('bodyWeight')?.value || '',
      oxygen_sat: document.getElementById('oxygenSat')?.value || '',
      body_height: document.getElementById('bodyHeight')?.value || '',
      body_temp: document.getElementById('bodyTemp')?.value || '',
      blood_pressure: document.getElementById('bloodPressure')?.value || '',
      heart_rate: document.getElementById('heartRate')?.value || '',
      resp_rate: document.getElementById('respRate')?.value || '',
      
      icdx: this.icdxTableData,
      icdix: this.icdixTableData,
      
      obat: this.drugTableData,
      harga_jasa: this.hargaJasa,
      total: this.drugTableData.reduce((sum, drug) => sum + (drug.harga * drug.jumlah), 0) + this.hargaJasa
    };

    console.log('💾 Saving pemeriksaan data:', pemeriksaanData);

    try {
      const response = await fetch(`../API/auth/antrian.php?action=finish_pemeriksaan&id=${this.queueData.id_antrian}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(pemeriksaanData)
      });

      const result = await response.json();
      console.log('📥 Server Response:', result);

      if (result.success) {
        alert('✅ Pemeriksaan berhasil diselesaikan!\n\nData telah tersimpan di sistem.');
        this.close();
        
        if (window.currentFragment && window.currentFragment.loadQueues) {
          await window.currentFragment.loadQueues();
        }
      } else {
        alert('❌ Gagal menyimpan pemeriksaan:\n' + (result.message || result.error || 'Unknown error'));
      }
    } catch (error) {
      console.error('❌ Error saving pemeriksaan:', error);
      alert('❌ Error: ' + error.message);
    }
  }

  close() {
    const modal = document.getElementById('pemeriksaanModal');
    if (modal) {
      modal.style.animation = 'fadeOut 0.3s';
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
                  <tr>
                    <td colspan="8" class="text-center py-4">
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
        .btn-periksa { 
          background-color: #0d6efd; 
          color: white; 
          border: none; 
          padding: 6px 20px; 
          border-radius: 20px; 
          font-size: 0.85rem; 
        }
        .btn-periksa:hover { background-color: #0b5ed7; }
        
        .btn-resume { 
          background-color: #17a2b8; 
          color: white; 
          border: none; 
          padding: 6px 20px; 
          border-radius: 20px; 
          font-size: 0.85rem; 
        }
        .btn-resume:hover { background-color: #138496; }
        
        .btn-continue {
          background-color: #0dcaf0;
          color: white;
          border: none;
          padding: 6px 16px;
          border-radius: 20px;
          font-size: 0.85rem;
        }
        .btn-continue:hover { background-color: #0bb5d6; }
        
        .badge-status { 
          padding: 6px 16px; 
          border-radius: 20px; 
          font-size: 0.85rem; 
          font-weight: 500; 
        }
        .status-belum-periksa { background-color: #ffc107; color: #000; }
        .status-di-terima { background-color: #17a2b8; color: white; }
        .status-sedang-diperiksa { background-color: #0dcaf0; color: #000; }
        .status-selesai { background-color: #198754; color: white; }
        
        .encounter-badge { 
          background-color: #e7f3ff; 
          color: #0066cc; 
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

    return this.queues.map((queue) => {
      const statusClass = `status-${queue.status_antrian.toLowerCase().replace(" ", "-")}`;
      const hasEncounter = queue.id_encounter_satusehat; // ✅ FIXED: Correct column name

      let actionButtons = '';
      
      if (queue.status_antrian.toLowerCase() === "di terima") {
        if (hasEncounter) {
          actionButtons = `
            <button class="btn btn-resume btn-sm" onclick="window.currentFragment.resumeQueue('${queue.id_antrian}')">
              <i class="bi bi-play-circle me-1"></i>LANJUTKAN
            </button>
          `;
        } else {
          actionButtons = `
            <button class="btn btn-periksa btn-sm" onclick="window.currentFragment.periksaQueue('${queue.id_antrian}')">
              <i class="bi bi-heart-pulse me-1"></i>PERIKSA
            </button>
          `;
        }
      } else if (queue.status_antrian.toLowerCase() === "sedang diperiksa") {
        // ✅ FIXED: Removed KELUAR button, only show LANJUT
        actionButtons = `
          <button class="btn btn-continue btn-sm" onclick="window.currentFragment.continueExamination('${queue.id_antrian}')" title="Lanjutkan Pemeriksaan">
            <i class="bi bi-clipboard-pulse me-1"></i>LANJUT
          </button>
        `;
      } else if (queue.status_antrian.toLowerCase() === "selesai") {
        actionButtons = `<span class="text-success"><i class="bi bi-check-circle me-1"></i>Selesai</span>`;
      } else {
        actionButtons = `<span class="text-muted">-</span>`;
      }

      const encounterDisplay = hasEncounter 
        ? `<span class="encounter-badge" title="${hasEncounter}">${hasEncounter.substring(0, 8)}...</span>`
        : `<span class="text-muted">-</span>`;

      return `
        <tr>
          <td><strong class="text-primary fs-5">${queue.no_antrian}</strong></td>
          <td>${queue.tanggal_antrian}</td>
          <td><strong>${queue.jam_antrian}</strong></td>
          <td>${queue.nama ?? "-"}</td>
          <td><small>${queue.nik ?? "-"}</small></td>
          <td><span class="badge badge-status ${statusClass}">${queue.status_antrian}</span></td>
          <td>${encounterDisplay}</td>
          <td>${actionButtons}</td>
        </tr>
      `;
    }).join("");
  }

  async continueExamination(id) {
    console.log("📋 Continue examination for queue:", id);
    
    const queueData = this.queues.find(q => q.id_antrian === id);
    if (queueData) {
      window.pemeriksaanModal.show(queueData);
    } else {
      alert('❌ Data antrian tidak ditemukan');
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
        alert("Error: Anda belum login.");
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
        alert("Error: Tidak dapat memuat profil dokter.");
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
      let { data, error } = await window.supabaseClient.rpc('get_latest_antrian_for_dokter', { 
        p_dokter: this.currentDoctorId 
      });
      
      console.log("📥 Loaded queues:", data, error);

      if (Array.isArray(data)) {
        this.queues = data.filter(q => 
          q.status_antrian.toLowerCase() === "di terima" || 
          q.status_antrian.toLowerCase() === "sedang diperiksa" || 
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
    if (!confirm("Mulai pemeriksaan untuk pasien ini?\n\nIni akan membuat Encounter baru di SATUSEHAT.")) return;

    console.log("=".repeat(50));
    console.log("🔗 BLOCKCHAIN MODE: NEW EXAMINATION");
    console.log("=".repeat(50));
    console.log("🩺 Starting examination for queue ID:", id);
    console.log("🏥 Creating new SATUSEHAT Encounter");
    console.log("=".repeat(50));

    try {
      const response = await fetch(`${this.apiUrl}?action=periksa&id=${id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      const result = await response.json();
      console.log("📥 Server Response:", result);

      if (result.success) {
        console.log("✅ SUCCESS! New examination started!");
        console.log("🏥 Encounter ID:", result.id_encounter_satusehat);
        console.log("🔗 Hash:", result.hash);
        console.log("=".repeat(50));
        
        await this.loadQueues();
        
        const queueData = this.queues.find(q => q.id_antrian === id);
        if (queueData) {
          window.pemeriksaanModal.show(queueData);
        } else {
          alert('❌ Data antrian tidak ditemukan');
        }
      } else {
        alert("❌ Gagal memulai pemeriksaan: " + (result.message || result.error || ""));
      }
    } catch (error) {
      console.error("❌ Error starting examination:", error);
      alert("❌ Error: " + error.message);
    }
  }

  async resumeQueue(id) {
    if (!confirm("Lanjutkan pemeriksaan pasien ini?\n\nAnda akan melanjutkan pemeriksaan yang sudah dimulai sebelumnya.")) return;

    console.log("=".repeat(50));
    console.log("▶️ BLOCKCHAIN MODE: RESUME EXAMINATION");
    console.log("=".repeat(50));
    console.log("📋 Resuming examination for queue ID:", id);
    console.log("🔄 Reusing existing SATUSEHAT Encounter");
    console.log("=".repeat(50));

    try {
      const response = await fetch(`${this.apiUrl}?action=resume_pemeriksaan&id=${id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      const result = await response.json();
      console.log("📥 Server Response:", result);

      if (result.success) {
        console.log("✅ SUCCESS! Examination resumed!");
        console.log("🏥 Encounter ID (reused):", result.id_encounter_satusehat);
        console.log("🔗 Hash:", result.hash);
        console.log("=".repeat(50));
        
        await this.loadQueues();
        
        const queueData = this.queues.find(q => q.id_antrian === id);
        if (queueData) {
          window.pemeriksaanModal.show(queueData);
        } else {
          alert('❌ Data antrian tidak ditemukan');
        }
      } else {
        alert("❌ Gagal melanjutkan pemeriksaan: " + (result.message || result.error || ""));
      }
    } catch (error) {
      console.error("❌ Error resuming examination:", error);
      alert("❌ Error: " + error.message);
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

console.log("✅ Pemeriksaan System loaded successfully");

window.PemeriksaanFragment = PemeriksaanFragment;