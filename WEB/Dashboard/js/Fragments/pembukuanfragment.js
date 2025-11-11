/**
 * Pembukuan Fragment - COMPLETE VERSION WITH DETAIL VIEW
 * Added comprehensive functionality for viewing transaction details
 */

class PembukuanFragment {
    constructor() {
        this.title = 'Pembukuan';
        this.icon = 'bi-journal-text';
    }

    render() {
        return `
        <div id="content-wrapper" class="d-flex flex-column">
            <div id="content">
                <div class="container-fluid">
                    <div class="d-flex justify-content-between align-items-center mb-4">
                        <h1 class="h3 mb-0 text-gray-800 fw-bold">Pembukuan Klinik</h1>
                        <button class="btn btn-primary shadow-sm" data-bs-toggle="modal" data-bs-target="#tambahModal" 
                                style="background: linear-gradient(135deg, #065f46 0%, #0891b2 100%); border: none;">
                            <i class="fas fa-plus me-2"></i>Tambah Transaksi
                        </button>
                    </div>

                    <!-- Summary Cards -->
                    <div class="row">
                        <div class="col-xl-4 col-md-6 mb-4">
                            <div class="card shadow-sm border-0 h-100" style="border-left: 4px solid #1cc88a !important;">
                                <div class="card-body">
                                    <div class="d-flex justify-content-between align-items-center">
                                        <div>
                                            <div class="text-success text-uppercase mb-2" style="font-size: 0.75rem; font-weight: 600; letter-spacing: 0.5px;">
                                                Total Pemasukan
                                            </div>
                                            <div class="h4 mb-0 font-weight-bold text-gray-800" id="totalMasuk">Rp 0</div>
                                            <div class="text-muted mt-2" style="font-size: 0.75rem;">Periode terpilih</div>
                                        </div>
                                        <div class="text-success" style="font-size: 2.5rem; opacity: 0.15;">
                                            <i class="fas fa-arrow-circle-up"></i>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div class="col-xl-4 col-md-6 mb-4">
                            <div class="card shadow-sm border-0 h-100" style="border-left: 4px solid #e74a3b !important;">
                                <div class="card-body">
                                    <div class="d-flex justify-content-between align-items-center">
                                        <div>
                                            <div class="text-danger text-uppercase mb-2" style="font-size: 0.75rem; font-weight: 600; letter-spacing: 0.5px;">
                                                Total Pengeluaran
                                            </div>
                                            <div class="h4 mb-0 font-weight-bold text-gray-800" id="totalKeluar">Rp 0</div>
                                            <div class="text-muted mt-2" style="font-size: 0.75rem;">Periode terpilih</div>
                                        </div>
                                        <div class="text-danger" style="font-size: 2.5rem; opacity: 0.15;">
                                            <i class="fas fa-arrow-circle-down"></i>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div class="col-xl-4 col-md-6 mb-4">
                            <div class="card shadow-sm border-0 h-100" style="border-left: 4px solid #667eea !important;">
                                <div class="card-body">
                                    <div class="d-flex justify-content-between align-items-center">
                                        <div>
                                            <div class="text-uppercase mb-2" style="font-size: 0.75rem; font-weight: 600; letter-spacing: 0.5px; color: #667eea;">
                                                Total Profit
                                            </div>
                                            <div class="h4 mb-0 font-weight-bold text-gray-800" id="totalProfit">Rp 0</div>
                                            <div class="text-muted mt-2" style="font-size: 0.75rem;">Pemasukan - Pengeluaran</div>
                                        </div>
                                        <div style="font-size: 2.5rem; opacity: 0.15; color: #667eea;">
                                            <i class="fas fa-chart-line"></i>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Filter Section -->
                    <div class="card shadow-sm border-0 mb-4">
                        <div class="card-header bg-white py-3 border-0">
                            <h6 class="m-0 text-primary fw-bold">Filter Data</h6>
                        </div>
                        <div class="card-body">
                            <div class="row g-3">
                                <div class="col-md-3">
                                    <label class="form-label text-muted small fw-semibold">Dari Tanggal</label>
                                    <input type="date" id="startDate" class="form-control">
                                </div>
                                <div class="col-md-3">
                                    <label class="form-label text-muted small fw-semibold">Sampai Tanggal</label>
                                    <input type="date" id="endDate" class="form-control">
                                </div>
                                <div class="col-md-2 align-self-end">
                                    <button class="btn btn-primary w-100" onclick="pembukuanFilter()" 
                                            style="background: linear-gradient(135deg, #065f46 0%, #0891b2 100%); border: none;">
                                        <i class="fas fa-search me-1"></i>Filter
                                    </button>
                                </div>
                                <div class="col-md-2 align-self-end">
                                    <button class="btn btn-secondary w-100" onclick="pembukuanResetFilter()">
                                        <i class="fas fa-undo me-1"></i>Reset
                                    </button>
                                </div>
                                <div class="col-md-2 align-self-end">
                                    <button class="btn btn-success w-100" onclick="pembukuanCetakPDF()">
                                        <i class="fas fa-file-pdf me-1"></i>Cetak PDF
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Data Table -->
                    <div class="card shadow-sm border-0 mb-4">
                        <div class="card-header bg-white py-3 border-0">
                            <div class="d-flex justify-content-between align-items-center">
                                <h5 class="m-0 text-primary fw-bold">Riwayat Pembukuan</h5>
                                <div class="dropdown">
                                    <button class="btn btn-sm btn-outline-secondary dropdown-toggle" type="button" 
                                            id="dropdownMenuButton" data-bs-toggle="dropdown" aria-expanded="false">
                                        <i class="fas fa-download me-1"></i>Export
                                    </button>
                                    <ul class="dropdown-menu dropdown-menu-end shadow" aria-labelledby="dropdownMenuButton">
                                        <li><a class="dropdown-item" href="#" onclick="pembukuanExportToExcel()">
                                            <i class="fas fa-file-excel me-2 text-success"></i>Export ke Excel</a></li>
                                        <li><a class="dropdown-item" href="#" onclick="pembukuanCetakPDF()">
                                            <i class="fas fa-file-pdf me-2 text-danger"></i>Export ke PDF</a></li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                        <div class="card-body p-0">
                            <div class="table-responsive">
                                <table class="table table-hover align-middle mb-0" id="tabelPembukuan">
                                    <thead style="background-color: #f8f9fc; border-top: 2px solid #e3e6f0;">
                                        <tr>
                                            <th class="text-center py-3" style="width: 50px; font-size: 0.85rem; color: #5a5c69;">No</th>
                                            <th class="py-3" style="font-size: 0.85rem; color: #5a5c69;">Tanggal</th>
                                            <th class="py-3" style="font-size: 0.85rem; color: #5a5c69;">Jenis Transaksi</th>
                                            <th class="py-3" colspan="2" style="font-size: 0.85rem; color: #5a5c69;">Keterangan</th>
                                            <th class="text-end py-3" style="font-size: 0.85rem; color: #5a5c69;">Total Pemasukan</th>
                                            <th class="text-end py-3" style="font-size: 0.85rem; color: #5a5c69;">Total Pengeluaran</th>
                                            <th class="text-end py-3" style="font-size: 0.85rem; color: #5a5c69;">Saldo</th>
                                            <th class="text-center py-3" style="width: 120px; font-size: 0.85rem; color: #5a5c69;">Aksi</th>
                                        </tr>
                                    </thead>
                                    <tbody id="pembukuanBody">
                                        <tr><td colspan="9" class="text-center py-4">
                                            <div class="spinner-border text-primary" role="status">
                                                <span class="visually-hidden">Loading...</span>
                                            </div>
                                            <div class="mt-2 text-muted">Memuat data...</div>
                                        </td></tr>
                                    </tbody>
                                    <tfoot style="background-color: #f8f9fc; border-top: 2px solid #e3e6f0;">
                                        <tr>
                                            <th colspan="5" class="text-end py-3 fw-bold" style="font-size: 0.9rem;">TOTAL:</th>
                                            <th class="text-end py-3 fw-bold text-success" id="footerMasuk" style="font-size: 0.9rem;">Rp 0</th>
                                            <th class="text-end py-3 fw-bold text-danger" id="footerKeluar" style="font-size: 0.9rem;">Rp 0</th>
                                            <th class="text-end py-3 fw-bold text-primary" id="footerSaldo" style="font-size: 0.9rem;">Rp 0</th>
                                            <th></th>
                                        </tr>
                                    </tfoot>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Add Transaction Modal -->
            <div class="modal fade" id="tambahModal" tabindex="-1" aria-labelledby="tambahModalLabel" aria-hidden="true">
                <div class="modal-dialog modal-lg">
                    <div class="modal-content">
                        <div class="modal-header bg-primary text-white">
                            <h5 class="modal-title" id="tambahModalLabel">
                                <i class="fas fa-plus-circle me-2"></i>Tambah Transaksi Manual
                            </h5>
                            <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
                        </div>
                        <div class="modal-body">
                            <form id="formPembukuan">
                                <div class="mb-4">
                                    <label class="form-label fw-bold">
                                        <i class="fas fa-exchange-alt me-2 text-primary"></i>Tipe Transaksi
                                        <span class="text-danger">*</span>
                                    </label>
                                    <div class="btn-group w-100" role="group">
                                        <input type="radio" class="btn-check" name="tipeTransaksi" id="tipePemasukan" value="pemasukan" checked>
                                        <label class="btn btn-outline-success" for="tipePemasukan">
                                            <i class="fas fa-arrow-up me-2"></i>Pemasukan
                                        </label>
                                        <input type="radio" class="btn-check" name="tipeTransaksi" id="tipePengeluaran" value="pengeluaran">
                                        <label class="btn btn-outline-danger" for="tipePengeluaran">
                                            <i class="fas fa-arrow-down me-2"></i>Pengeluaran
                                        </label>
                                    </div>
                                </div>
                                <div class="mb-3">
                                    <label for="tanggal" class="form-label fw-bold">
                                        <i class="fas fa-calendar me-2 text-primary"></i>Tanggal
                                        <span class="text-danger">*</span>
                                    </label>
                                    <input type="date" id="tanggal" class="form-control" required>
                                </div>
                                <div class="mb-3">
                                    <label for="judulTransaksi" class="form-label fw-bold">
                                        <i class="fas fa-heading me-2 text-primary"></i>Judul/Jenis Transaksi
                                        <span class="text-danger">*</span>
                                    </label>
                                    <input type="text" id="judulTransaksi" class="form-control" 
                                           placeholder="Contoh: Pembelian Obat, Biaya Listrik, Pembayaran Pasien, dll" required>
                                </div>
                                <div class="mb-3">
                                    <label for="deskripsi" class="form-label fw-bold">
                                        <i class="fas fa-align-left me-2 text-primary"></i>Deskripsi
                                    </label>
                                    <textarea id="deskripsi" class="form-control" rows="3" 
                                              placeholder="Keterangan detail transaksi (opsional)"></textarea>
                                </div>
                                <div class="mb-3">
                                    <label for="totalAmount" class="form-label fw-bold">
                                        <i class="fas fa-money-bill-wave me-2 text-primary"></i>Total (Rp)
                                        <span class="text-danger">*</span>
                                    </label>
                                    <div class="input-group">
                                        <span class="input-group-text">Rp</span>
                                        <input type="number" id="totalAmount" class="form-control" 
                                               placeholder="0" min="0" step="1000" required>
                                    </div>
                                </div>
                                <hr class="my-4">
                                <div class="d-grid gap-2">
                                    <button type="submit" class="btn btn-primary btn-lg" id="btnSubmitPembukuan">
                                        <i class="fas fa-save me-2"></i>Simpan Transaksi
                                    </button>
                                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">
                                        <i class="fas fa-times me-2"></i>Batal
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Detail Transaction Modal -->
            <div class="modal fade" id="detailModal" tabindex="-1" aria-labelledby="detailModalLabel" aria-hidden="true">
                <div class="modal-dialog modal-lg modal-dialog-scrollable">
                    <div class="modal-content">
                        <div class="modal-header bg-primary text-white">
                            <h5 class="modal-title" id="detailModalLabel">
                                <i class="fas fa-list me-2"></i>Detail Transaksi - <span id="detailTanggal"></span>
                            </h5>
                            <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
                        </div>
                        <div class="modal-body">
                            <div class="table-responsive">
                                <table class="table table-hover align-middle" id="tabelDetail">
                                    <thead style="background-color: #f8f9fc;">
                                        <tr>
                                            <th class="py-3" style="width: 50px;">No</th>
                                            <th class="py-3">Deskripsi</th>
                                            <th class="py-3">Detail</th>
                                            <th class="py-3 text-center">Jenis</th>
                                            <th class="py-3 text-end">Total</th>
                                        </tr>
                                    </thead>
                                    <tbody id="detailBody">
                                        <tr>
                                            <td colspan="5" class="text-center py-4">
                                                <div class="spinner-border text-primary" role="status">
                                                    <span class="visually-hidden">Loading...</span>
                                                </div>
                                            </td>
                                        </tr>
                                    </tbody>
                                    <tfoot style="background-color: #f8f9fc; border-top: 2px solid #e3e6f0;">
                                        <tr>
                                            <th colspan="4" class="text-end py-3 fw-bold">TOTAL:</th>
                                            <th class="text-end py-3 fw-bold" id="detailTotalFooter">Rp 0</th>
                                        </tr>
                                    </tfoot>
                                </table>
                            </div>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">
                                <i class="fas fa-times me-2"></i>Tutup
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        ${this.getStyles()}
        `;
    }

    getStyles() {
        return `<style>
            .card { border-radius: 10px; }
            .shadow-sm { box-shadow: 0 0.125rem 0.25rem rgba(0, 0, 0, 0.075) !important; }
            .table tbody tr { border-bottom: 1px solid #f0f0f0; }
            .table tbody tr:hover { background-color: #f8f9fc; }
            .table tbody td { padding: 1rem 0.75rem; vertical-align: middle; }
            .form-control { border: 1px solid #e3e6f0; border-radius: 8px; padding: 0.5rem 0.75rem; }
            .form-control:focus { border-color: #667eea; box-shadow: 0 0 0 0.2rem rgba(102, 126, 234, 0.25); }
            .btn { border-radius: 8px; padding: 0.5rem 1rem; font-weight: 500; }
            .btn-primary { background: #667eea; border-color: #667eea; }
            .btn-primary:hover { background: #5568d3; border-color: #5568d3; }
            .badge { padding: 0.35em 0.65em; font-weight: 500; border-radius: 6px; }
            .btn-sm { padding: 0.25rem 0.5rem; font-size: 0.875rem; }
        </style>`;
    }

    async onInit() { console.log('Pembukuan initialized'); }
    onDestroy() { console.log('Pembukuan fragment destroyed'); }
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = PembukuanFragment;
}

// ===================================
// JAVASCRIPT - COMPLETE VERSION WITH DETAIL VIEW
// ===================================

window.PEMBUKUAN_API_URL = '../API/pembukuan_api.php';
window.PEMBUKUAN_DOKTER_ID = localStorage.getItem('id_dokter') || sessionStorage.getItem('id_dokter');

console.log('🔧 API URL configured:', window.PEMBUKUAN_API_URL);
console.log('👨‍⚕️ Doctor ID:', window.PEMBUKUAN_DOKTER_ID || 'NOT SET - Will try from session');

document.addEventListener('DOMContentLoaded', function() {
    pembukuanInit();
});

function pembukuanInit() {
    const today = new Date().toISOString().split('T')[0];
    const tanggalInput = document.getElementById('tanggal');
    const endDateInput = document.getElementById('endDate');
    
    if (tanggalInput) tanggalInput.value = today;
    if (endDateInput) endDateInput.value = today;
    
    const firstDay = new Date();
    firstDay.setDate(1);
    const startDateInput = document.getElementById('startDate');
    if (startDateInput) startDateInput.value = firstDay.toISOString().split('T')[0];

    pembukuanLoadData();
}

async function pembukuanLoadData() {
    try {
        console.log('📡 Loading data from:', window.PEMBUKUAN_API_URL);
        
        const dokterId = localStorage.getItem('id_dokter');
        console.log('👨‍⚕️ Doctor ID from localStorage:', dokterId);
        
        if (!dokterId) {
            throw new Error('Doctor ID not found in localStorage. Please login again.');
        }
        
        const url = window.PEMBUKUAN_API_URL + '?action=get_pembukuan&dokter_id=' + dokterId;
        console.log('🌐 Full URL:', url);
        
        const response = await fetch(url, {
            method: 'GET',
            credentials: 'same-origin',
            headers: { 
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            }
        });
        
        console.log('📥 Response status:', response.status);
        
        const responseText = await response.text();
        console.log('📄 Raw response (first 500 chars):', responseText.substring(0, 500));
        
        let result;
        try {
            result = JSON.parse(responseText);
            console.log('📊 Parsed result.success:', result.success);
            console.log('📊 Parsed result.data length:', result.data ? result.data.length : 'null/undefined');
        } catch (parseError) {
            console.error('❌ JSON parse error:', parseError);
            console.error('Raw text was:', responseText);
            throw new Error('Invalid JSON response from server');
        }
        
        if (result.success) {
            console.log('✅ API Success! Processing', result.data ? result.data.length : 0, 'items');
            pembukuanDisplayData(result.data);
        } else {
            console.error('❌ API returned success: false');
            throw new Error(result.message || 'Gagal memuat data');
        }
    } catch (error) {
        console.error('❌ Error loading data:', error);
        const pembukuanBody = document.getElementById('pembukuanBody');
        if (pembukuanBody) {
            pembukuanBody.innerHTML = 
                `<tr><td colspan="9" class="text-center text-danger py-4">
                    ❌ Gagal memuat data: ${error.message}
                    <br><small>Check browser console (F12) for details</small>
                    <br><small class="text-muted">API URL: ${window.PEMBUKUAN_API_URL}</small>
                    <br><small class="text-muted">Doctor ID: ${localStorage.getItem('id_dokter') || 'Not set'}</small>
                    <br><br>
                    <button onclick="location.reload()" class="btn btn-sm btn-primary">Refresh</button>
                </td></tr>`;
        }
    }
}

// Update summary cards
function pembukuanUpdateSummaryCards(totalPemasukan, totalPengeluaran, totalProfit) {
    const totalMasuk = document.getElementById('totalMasuk');
    const totalKeluar = document.getElementById('totalKeluar');
    const totalProfitEl = document.getElementById('totalProfit');
    
    if (totalMasuk) totalMasuk.textContent = pembukuanFormatRupiah(totalPemasukan);
    if (totalKeluar) totalKeluar.textContent = pembukuanFormatRupiah(totalPengeluaran);
    if (totalProfitEl) {
        totalProfitEl.textContent = pembukuanFormatRupiah(totalProfit);
        if (totalProfit >= 0) {
            totalProfitEl.classList.remove('text-danger');
            totalProfitEl.classList.add('text-gray-800');
        } else {
            totalProfitEl.classList.remove('text-gray-800');
            totalProfitEl.classList.add('text-danger');
        }
    }
}

// MAIN DISPLAY FUNCTION - FOR DAILY SUMMARIES (GROUPED BY DATE)
function pembukuanDisplayData(data) {
    console.log('====================================');
    console.log('🎨 DISPLAY FUNCTION CALLED');
    console.log('====================================');
    console.log('📦 Input data:', data);
    console.log('   Type:', typeof data);
    console.log('   Is Array:', Array.isArray(data));
    console.log('   Length:', data ? data.length : 'null');
    console.log('   First item:', data && data[0] ? data[0] : 'none');
    
    const tbody = document.getElementById('pembukuanBody');
    if (!tbody) {
        console.error('❌ Table body element #pembukuanBody not found!');
        return;
    }
    
    console.log('✅ Table body element found');
    
    // Handle various data formats
    let dailySummaries = data;
    if (data && typeof data === 'object' && !Array.isArray(data)) {
        console.log('⚠️  Data is object, checking for nested data property');
        if (data.data) {
            console.log('   Found data.data property');
            dailySummaries = data.data;
        } else {
            console.log('   No data.data property found');
        }
    }
    
    // Validate array
    if (!Array.isArray(dailySummaries)) {
        console.error('❌ DATA IS NOT AN ARRAY');
        tbody.innerHTML = '<tr><td colspan="9" class="text-center text-danger py-4">Format data tidak valid</td></tr>';
        pembukuanUpdateSummaryCards(0, 0, 0);
        return;
    }
    
    console.log('✅ Daily summaries is valid array with', dailySummaries.length, 'items');
    
    if (dailySummaries.length === 0) {
        console.warn('⚠️  EMPTY ARRAY - No data to display');
        tbody.innerHTML = '<tr><td colspan="9" class="text-center text-muted py-4">Belum ada data transaksi untuk periode ini</td></tr>';
        
        // Update summary cards and footer
        pembukuanUpdateSummaryCards(0, 0, 0);
        
        const footerMasuk = document.getElementById('footerMasuk');
        const footerKeluar = document.getElementById('footerKeluar');
        const footerSaldo = document.getElementById('footerSaldo');
        
        if (footerMasuk) footerMasuk.textContent = 'Rp 0';
        if (footerKeluar) footerKeluar.textContent = 'Rp 0';
        if (footerSaldo) footerSaldo.textContent = 'Rp 0';
        
        return;
    }
    
    console.log('✅ Processing', dailySummaries.length, 'daily summaries');
    
    let html = '';
    let totalPemasukan = 0;
    let totalPengeluaran = 0;
    
    dailySummaries.forEach((item, index) => {
        const pemasukan = parseFloat(item.pemasukan || 0);
        const pengeluaran = parseFloat(item.pengeluaran || 0);
        const saldo = parseFloat(item.saldo || 0);
        
        totalPemasukan += pemasukan;
        totalPengeluaran += pengeluaran;
        
        const tanggal = item.tanggal || '-';
        
        // Determine badge based on which is higher
        let badgeClass = 'bg-secondary';
        let badgeText = 'Tidak ada';
        
        if (pemasukan > 0 && pengeluaran > 0) {
            badgeClass = 'bg-info';
            badgeText = 'Pemasukan & Pengeluaran';
        } else if (pemasukan > 0) {
            badgeClass = 'bg-success';
            badgeText = 'Pemasukan';
        } else if (pengeluaran > 0) {
            badgeClass = 'bg-danger';
            badgeText = 'Pengeluaran';
        }
        
        html += `
            <tr>
                <td class="text-center">${index + 1}</td>
                <td><strong>${pembukuanFormatDate(tanggal)}</strong></td>
                <td><span class="badge ${badgeClass}">${badgeText}</span></td>
                <td colspan="2" class="text-muted small">Klik "Lihat Detail" untuk melihat transaksi</td>
                <td class="text-end text-success fw-semibold">${pembukuanFormatRupiah(pemasukan)}</td>
                <td class="text-end text-danger fw-semibold">${pembukuanFormatRupiah(pengeluaran)}</td>
                <td class="text-end fw-bold">${pembukuanFormatRupiah(saldo)}</td>
                <td class="text-center">
                    <button class="btn btn-sm btn-info" onclick="pembukuanShowDetail('${tanggal}')" title="Lihat Detail">
                        <i class="fas fa-eye"></i> Detail
                    </button>
                </td>
            </tr>
        `;
    });
    
    tbody.innerHTML = html;
    
    // Update footer
    const footerMasuk = document.getElementById('footerMasuk');
    const footerKeluar = document.getElementById('footerKeluar');
    const footerSaldo = document.getElementById('footerSaldo');
    
    if (footerMasuk) footerMasuk.textContent = pembukuanFormatRupiah(totalPemasukan);
    if (footerKeluar) footerKeluar.textContent = pembukuanFormatRupiah(totalPengeluaran);
    if (footerSaldo) footerSaldo.textContent = pembukuanFormatRupiah(totalPemasukan - totalPengeluaran);
    
    // Update summary cards
    pembukuanUpdateSummaryCards(totalPemasukan, totalPengeluaran, totalPemasukan - totalPengeluaran);
    
    console.log('====================================');
    console.log('✅ DISPLAY COMPLETE');
    console.log('   Days shown:', dailySummaries.length);
    console.log('   Total Pemasukan:', totalPemasukan);
    console.log('   Total Pengeluaran:', totalPengeluaran);
    console.log('   Saldo:', totalPemasukan - totalPengeluaran);
    console.log('====================================');
}

document.addEventListener('submit', async function(e) {
    if (e.target.id === 'formPembukuan') {
        e.preventDefault();
        
        const submitBtn = document.getElementById('btnSubmitPembukuan');
        if (!submitBtn) return;
        
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i>Menyimpan...';
        
        try {
            const dokterId = localStorage.getItem('id_dokter');
            if (!dokterId) throw new Error('Doctor ID not found. Please login again.');
            
            const tipe = document.querySelector('input[name="tipeTransaksi"]:checked')?.value;
            const tanggal = document.getElementById('tanggal')?.value;
            const judul = document.getElementById('judulTransaksi')?.value;
            const deskripsi = document.getElementById('deskripsi')?.value;
            const total = parseFloat(document.getElementById('totalAmount')?.value);

            if (!tipe || !tanggal || !judul || !total) {
                throw new Error('Mohon lengkapi semua field yang wajib diisi');
            }

            const data = { tipe, tanggal, judul, deskripsi, total, id_dokter: dokterId };

            const response = await fetch(window.PEMBUKUAN_API_URL + '?action=add_transaksi&dokter_id=' + dokterId, {
                method: 'POST',
                credentials: 'same-origin',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            
            const result = await response.json();
            
            if (result.success) {
                alert('Transaksi berhasil disimpan!');
                e.target.reset();
                document.getElementById('tanggal').value = new Date().toISOString().split('T')[0];
                
                const modalElement = document.getElementById('tambahModal');
                if (modalElement && typeof bootstrap !== 'undefined') {
                    const modal = bootstrap.Modal.getInstance(modalElement);
                    if (modal) modal.hide();
                }
                
                await pembukuanLoadData();
            } else {
                throw new Error(result.message || 'Gagal menyimpan transaksi');
            }
        } catch (error) {
            console.error('Error saving transaction:', error);
            alert('Gagal menyimpan transaksi: ' + error.message);
        } finally {
            submitBtn.disabled = false;
            submitBtn.innerHTML = '<i class="fas fa-save me-2"></i>Simpan Transaksi';
        }
    }
});

// FIXED FILTER FUNCTION WITH COMPREHENSIVE DEBUGGING
async function pembukuanFilter() {
    const startDate = document.getElementById('startDate')?.value;
    const endDate = document.getElementById('endDate')?.value;
    
    console.log('====================================');
    console.log('🔍 FILTER BUTTON CLICKED');
    console.log('====================================');
    console.log('📅 Start Date:', startDate);
    console.log('📅 End Date:', endDate);
    
    if (!startDate || !endDate) {
        alert('Silakan pilih rentang tanggal');
        return;
    }
    
    const dokterId = localStorage.getItem('id_dokter');
    console.log('👨‍⚕️ Doctor ID:', dokterId);
    
    if (!dokterId) {
        alert('Doctor ID not found. Please login again.');
        return;
    }
    
    try {
        const url = window.PEMBUKUAN_API_URL + 
            '?action=filter_pembukuan&start_date=' + startDate + 
            '&end_date=' + endDate + 
            '&dokter_id=' + dokterId;
        
        console.log('📡 Fetching from URL:', url);
        
        const response = await fetch(url, {
            method: 'GET',
            credentials: 'same-origin',
            headers: { 'Accept': 'application/json' }
        });
        
        console.log('📥 Response received');
        console.log('   Status:', response.status);
        console.log('   Status Text:', response.statusText);
        console.log('   OK:', response.ok);
        
        const responseText = await response.text();
        console.log('📄 Raw response (first 1000 chars):', responseText.substring(0, 1000));
        console.log('📄 Raw response length:', responseText.length);
        
        let result;
        try {
            result = JSON.parse(responseText);
            console.log('✅ JSON parsed successfully');
        } catch (parseError) {
            console.error('❌ JSON Parse Error:', parseError);
            console.error('   Raw text:', responseText);
            throw new Error('Invalid JSON response from server');
        }
        
        console.log('📊 Parsed result:', result);
        console.log('   success:', result.success);
        console.log('   data type:', typeof result.data);
        console.log('   data is array:', Array.isArray(result.data));
        console.log('   data length:', result.data ? result.data.length : 'null/undefined');
        
        if (result.debug) {
            console.log('🐞 Debug info from API:', result.debug);
        }
        
        if (result.success) {
            console.log('✅ API Success - Calling display function');
            console.log('   Passing data:', result.data);
            pembukuanDisplayData(result.data);
        } else {
            console.error('❌ API returned success: false');
            console.error('   Message:', result.message);
            throw new Error(result.message || 'Gagal filter data');
        }
    } catch (error) {
        console.error('====================================');
        console.error('❌ FILTER ERROR');
        console.error('====================================');
        console.error('Error:', error);
        console.error('Stack:', error.stack);
        alert('Gagal filter data: ' + error.message);
    }
}

function pembukuanResetFilter() {
    const today = new Date().toISOString().split('T')[0];
    const firstDay = new Date();
    firstDay.setDate(1);
    
    const startDateInput = document.getElementById('startDate');
    const endDateInput = document.getElementById('endDate');
    
    if (startDateInput) startDateInput.value = firstDay.toISOString().split('T')[0];
    if (endDateInput) endDateInput.value = today;
    
    pembukuanLoadData();
}

/**
 * Show detail modal for a specific date
 */
async function pembukuanShowDetail(tanggal) {
    console.log('📋 Showing detail for date:', tanggal);
    
    const dokterId = localStorage.getItem('id_dokter');
    if (!dokterId) {
        alert('Doctor ID not found. Please login again.');
        return;
    }
    
    // Show the modal
    const modalElement = document.getElementById('detailModal');
    if (modalElement && typeof bootstrap !== 'undefined') {
        const modal = new bootstrap.Modal(modalElement);
        modal.show();
    }
    
    // Update modal title with date
    const detailTanggalEl = document.getElementById('detailTanggal');
    if (detailTanggalEl) {
        detailTanggalEl.textContent = pembukuanFormatDate(tanggal);
    }
    
    // Show loading state
    const detailBody = document.getElementById('detailBody');
    if (detailBody) {
        detailBody.innerHTML = `
            <tr>
                <td colspan="5" class="text-center py-4">
                    <div class="spinner-border text-primary" role="status">
                        <span class="visually-hidden">Loading...</span>
                    </div>
                    <div class="mt-2 text-muted">Memuat detail transaksi...</div>
                </td>
            </tr>
        `;
    }
    
    try {
        const url = window.PEMBUKUAN_API_URL + 
            '?action=get_detail_transaksi&tanggal=' + tanggal + 
            '&dokter_id=' + dokterId;
        
        console.log('📡 Fetching detail from:', url);
        
        const response = await fetch(url, {
            method: 'GET',
            credentials: 'same-origin',
            headers: { 'Accept': 'application/json' }
        });
        
        const result = await response.json();
        console.log('📊 Detail result:', result);
        
        if (result.success) {
            pembukuanDisplayDetail(result.data);
        } else {
            throw new Error(result.message || 'Gagal memuat detail');
        }
    } catch (error) {
        console.error('❌ Error loading detail:', error);
        if (detailBody) {
            detailBody.innerHTML = `
                <tr>
                    <td colspan="5" class="text-center text-danger py-4">
                        ❌ Gagal memuat detail: ${error.message}
                    </td>
                </tr>
            `;
        }
    }
}

/**
 * Display detail transactions in modal
 */
function pembukuanDisplayDetail(data) {
    console.log('🎨 Displaying detail data:', data);
    
    const detailBody = document.getElementById('detailBody');
    if (!detailBody) {
        console.error('❌ Detail body element not found');
        return;
    }
    
    if (!Array.isArray(data) || data.length === 0) {
        detailBody.innerHTML = `
            <tr>
                <td colspan="5" class="text-center text-muted py-4">
                    Tidak ada detail transaksi untuk tanggal ini
                </td>
            </tr>
        `;
        
        // Update footer to 0
        const detailTotalFooter = document.getElementById('detailTotalFooter');
        if (detailTotalFooter) {
            detailTotalFooter.textContent = 'Rp 0';
            detailTotalFooter.className = 'text-end py-3 fw-bold';
        }
        return;
    }
    
    let html = '';
    let totalKeseluruhan = 0;
    
    data.forEach((item, index) => {
        const total = parseFloat(item.total || 0);
        totalKeseluruhan += (item.jenis === 'Pemasukan' ? total : -total);
        
        const badgeClass = item.jenis === 'Pemasukan' ? 'bg-success' : 'bg-danger';
        const totalClass = item.jenis === 'Pemasukan' ? 'text-success' : 'text-danger';
        
        html += `
            <tr>
                <td class="text-center">${index + 1}</td>
                <td>${item.deskripsi || '-'}</td>
                <td>${item.detail || '-'}</td>
                <td class="text-center">
                    <span class="badge ${badgeClass}">${item.jenis}</span>
                </td>
                <td class="text-end fw-semibold ${totalClass}">
                    ${pembukuanFormatRupiah(total)}
                </td>
            </tr>
        `;
    });
    
    detailBody.innerHTML = html;
    
    // Update footer total
    const detailTotalFooter = document.getElementById('detailTotalFooter');
    if (detailTotalFooter) {
        detailTotalFooter.textContent = pembukuanFormatRupiah(totalKeseluruhan);
        detailTotalFooter.className = 'text-end py-3 fw-bold ' + 
            (totalKeseluruhan >= 0 ? 'text-success' : 'text-danger');
    }
    
    console.log('✅ Detail displayed successfully');
}

function pembukuanFormatRupiah(angka) {
    const number = parseFloat(angka);
    if (isNaN(number)) return 'Rp 0';
    
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0
    }).format(number);
}

function pembukuanFormatDate(dateString) {
    if (!dateString || dateString === '-') return '-';
    
    try {
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return dateString;
        
        return new Intl.DateTimeFormat('id-ID', {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
        }).format(date);
    } catch (e) {
        console.error('Date format error:', e);
        return dateString;
    }
}

function pembukuanCetakPDF() {
    alert('Fitur cetak PDF akan segera tersedia');
}

function pembukuanExportToExcel() {
    alert('Fitur export Excel akan segera tersedia');
}