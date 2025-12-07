/**
 * Pembukuan Fragment - ENHANCED WITH SKELETON LOADERS
 * Shows patient diagnosis, medicines, pricing details, and statistics
 */

class PembukuanFragment {
  constructor() {
    this.title = "Pembukuan";
    this.icon = "bi-journal-text";
  }

  render() {
    return `

        <!-- ✅ PDF & Excel Libraries -->
        <script src="https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js"></script>
        <script src="https://cdnjs.cloudflare.com/ajax/libs/jspdf-autotable/3.5.31/jspdf.plugin.autotable.min.js"></script>
        <script src="https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js"></script>
        <script src="../fragments/pembukuan_pdf.js"></script>
        
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

                    <!-- Summary Cards (3 Main Cards) -->
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

                    <!-- Expandable Patient Statistics Card -->
                    <div class="row">
                        <div class="col-xl-12 mb-4">
                            <div class="card shadow-sm border-0" style="border-left: 4px solid #f6ad55 !important;">
                                <div class="card-body">
                                    <div class="d-flex justify-content-between align-items-center">
                                        <div>
                                            <div class="text-warning text-uppercase mb-2" style="font-size: 0.75rem; font-weight: 600; letter-spacing: 0.5px;">
                                                Statistik Pasien
                                            </div>
                                            <div class="text-muted" style="font-size: 0.875rem;">Klik untuk melihat detail jumlah pasien</div>
                                        </div>
                                        <button class="btn btn-warning" onclick="togglePatientStats()" id="btnToggleStats">
                                            <i class="fas fa-chevron-down me-2" id="iconToggleStats"></i>
                                            <span id="textToggleStats">Tampilkan Detail</span>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Collapsible Patient Statistics Cards -->
                    <div class="collapse" id="patientStatsCollapse">
                        <div class="row">
                            <div class="col-xl-4 col-md-6 mb-4">
                                <div class="card shadow-sm border-0 h-100" style="border-left: 4px solid #667eea !important;">
                                    <div class="card-body">
                                        <div class="d-flex justify-content-between align-items-center">
                                            <div>
                                                <div class="text-uppercase mb-2" style="font-size: 0.75rem; font-weight: 600; letter-spacing: 0.5px; color: #667eea;">
                                                    Total Pasien Diperiksa
                                                </div>
                                                <div class="h4 mb-0 font-weight-bold text-gray-800" id="totalPasien">0</div>
                                                <div class="text-muted mt-2" style="font-size: 0.75rem;">Periode terpilih</div>
                                            </div>
                                            <div style="font-size: 2.5rem; opacity: 0.15; color: #667eea;">
                                                <i class="fas fa-users"></i>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div class="col-xl-4 col-md-6 mb-4">
                                <div class="card shadow-sm border-0 h-100" style="border-left: 4px solid #48bb78 !important;">
                                    <div class="card-body">
                                        <div class="d-flex justify-content-between align-items-center">
                                            <div>
                                                <div class="text-uppercase mb-2" style="font-size: 0.75rem; font-weight: 600; letter-spacing: 0.5px; color: #48bb78;">
                                                    Pasien BPJS
                                                </div>
                                                <div class="h4 mb-0 font-weight-bold text-gray-800" id="totalBPJS">0</div>
                                                <div class="text-muted mt-2" style="font-size: 0.75rem;">
                                                    <span id="percentBPJS">0%</span> dari total
                                                </div>
                                            </div>
                                            <div style="font-size: 2.5rem; opacity: 0.15; color: #48bb78;">
                                                <i class="fas fa-shield-alt"></i>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div class="col-xl-4 col-md-6 mb-4">
                                <div class="card shadow-sm border-0 h-100" style="border-left: 4px solid #ed8936 !important;">
                                    <div class="card-body">
                                        <div class="d-flex justify-content-between align-items-center">
                                            <div>
                                                <div class="text-uppercase mb-2" style="font-size: 0.75rem; font-weight: 600; letter-spacing: 0.5px; color: #ed8936;">
                                                    Pasien UMUM
                                                </div>
                                                <div class="h4 mb-0 font-weight-bold text-gray-800" id="totalUMUM">0</div>
                                                <div class="text-muted mt-2" style="font-size: 0.75rem;">
                                                    <span id="percentUMUM">0%</span> dari total
                                                </div>
                                            </div>
                                            <div style="font-size: 2.5rem; opacity: 0.15; color: #ed8936;">
                                                <i class="fas fa-user-friends"></i>
                                            </div>
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
                <div class="modal-dialog modal-xl modal-dialog-scrollable">
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
                                            <th class="py-3">Metode</th>
                                            <th class="py-3 text-end">Total</th>
                                            <th class="py-3 text-center" style="width: 100px;">Aksi</th>
                                        </tr>
                                    </thead>
                                    <tbody id="detailBody">
                                        <tr>
                                            <td colspan="7" class="text-center py-4">
                                                <div class="spinner-border text-primary" role="status">
                                                    <span class="visually-hidden">Loading...</span>
                                                </div>
                                            </td>
                                        </tr>
                                    </tbody>
                                    <tfoot style="background-color: #f8f9fc; border-top: 2px solid #e3e6f0;">
                                        <tr>
                                            <th colspan="5" class="text-end py-3 fw-bold">TOTAL:</th>
                                            <th class="text-end py-3 fw-bold" id="detailTotalFooter">Rp 0</th>
                                            <th></th>
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

            <!-- Patient Detail Modal -->
            <div class="modal fade" id="patientDetailModal" tabindex="-1" aria-labelledby="patientDetailModalLabel" aria-hidden="true">
                <div class="modal-dialog modal-xl modal-dialog-scrollable">
                    <div class="modal-content">
                        <div class="modal-header bg-info text-white">
                            <h5 class="modal-title" id="patientDetailModalLabel">
                                <i class="fas fa-user-md me-2"></i>Detail Pemeriksaan Pasien
                            </h5>
                            <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
                        </div>
                        <div class="modal-body" id="patientDetailBody">
                            <div class="text-center py-5">
                                <div class="spinner-border text-primary" role="status">
                                    <span class="visually-hidden">Loading...</span>
                                </div>
                                <p class="mt-3 text-muted">Memuat detail pasien...</p>
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

            .skeleton-card-value {
                height: 36px;
                width: 150px;
                border-radius: 8px;
                margin-bottom: 8px;
            }

            .skeleton-table-cell {
                height: 20px;
                border-radius: 4px;
            }

            .skeleton-stat-number {
                height: 32px;
                width: 60px;
                border-radius: 6px;
            }
            
            /* Patient detail styles */
            .info-card {
                background: #f8f9fc;
                border-radius: 8px;
                padding: 0.875rem;
                margin-bottom: 0;
                height: 100%;
            }
            .info-label {
                font-weight: 600;
                color: #5a5c69;
                font-size: 0.75rem;
                margin-bottom: 0.35rem;
                text-transform: uppercase;
                letter-spacing: 0.5px;
            }
            .info-value {
                color: #3a3b45;
                font-size: 0.95rem;
                word-break: break-word;
            }
            .section-header {
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                padding: 0.75rem 1rem;
                border-radius: 8px;
                margin: 1.5rem 0 1rem 0;
                font-weight: 600;
                font-size: 0.95rem;
            }
            .section-header:first-child {
                margin-top: 0;
            }
            .medicine-item {
                background: white;
                border: 1px solid #e3e6f0;
                border-radius: 8px;
                padding: 1rem;
                margin-bottom: 0.75rem;
                transition: all 0.3s;
            }
            .medicine-item:hover {
                box-shadow: 0 4px 6px rgba(0,0,0,0.1);
                transform: translateY(-2px);
            }
            .medicine-item:last-child {
                margin-bottom: 0;
            }
            
            #patientDetailBody {
                padding: 1.5rem;
            }
            
            #patientDetailBody .row {
                margin-bottom: 0.75rem;
            }
            #patientDetailBody .row:last-child {
                margin-bottom: 0;
            }
            
            .collapse {
                transition: height 0.35s ease;
            }
            
            .btn-warning {
                background: linear-gradient(135deg, #f6ad55 0%, #ed8936 100%);
                border: none;
                color: white;
            }
            
            .btn-warning:hover {
                background: linear-gradient(135deg, #ed8936 0%, #dd6b20 100%);
                color: white;
            }
            
            #btnToggleStats {
                transition: all 0.3s ease;
            }
        </style>`;
  }

  async onInit() {
    console.log("Pembukuan initialized");
    pembukuanInit();
  }
  onDestroy() {
    console.log("Pembukuan fragment destroyed");

    const modals = ["tambahModal", "detailModal", "patientDetailModal"];
    modals.forEach((modalId) => {
      const modalElement = document.getElementById(modalId);
      if (modalElement && typeof bootstrap !== "undefined") {
        const modalInstance = bootstrap.Modal.getInstance(modalElement);
        if (modalInstance) {
          modalInstance.hide();
        }
      }
    });

    document
      .querySelectorAll(".modal-backdrop")
      .forEach((backdrop) => backdrop.remove());

    document.body.classList.remove("modal-open");
    document.body.style.removeProperty("overflow");
    document.body.style.removeProperty("padding-right");
  }
}

if (typeof module !== "undefined" && module.exports) {
  module.exports = PembukuanFragment;
}

// ===================================
// ✅ SKELETON GENERATOR FUNCTIONS
// ===================================

function generatePembukuanTableSkeleton(rows = 5) {
  return Array(rows)
    .fill(0)
    .map(
      (_, index) => `
        <tr>
            <td class="text-center"><div class="skeleton skeleton-text" style="width: 30px; margin: 0 auto;"></div></td>
            <td><div class="skeleton skeleton-text" style="width: ${
              70 + Math.random() * 20
            }%;"></div></td>
            <td><div class="skeleton skeleton-text" style="width: 100px;"></div></td>
            <td colspan="2"><div class="skeleton skeleton-text" style="width: ${
              60 + Math.random() * 30
            }%;"></div></td>
            <td class="text-end"><div class="skeleton skeleton-text" style="width: 100px; margin-left: auto;"></div></td>
            <td class="text-end"><div class="skeleton skeleton-text" style="width: 100px; margin-left: auto;"></div></td>
            <td class="text-end"><div class="skeleton skeleton-text" style="width: 100px; margin-left: auto;"></div></td>
            <td class="text-center"><div class="skeleton skeleton-text" style="width: 70px; margin: 0 auto;"></div></td>
        </tr>
    `
    )
    .join("");
}

function generateDetailTableSkeleton(rows = 5) {
  return Array(rows)
    .fill(0)
    .map(
      () => `
        <tr>
            <td class="text-center"><div class="skeleton skeleton-text" style="width: 30px; margin: 0 auto;"></div></td>
            <td><div class="skeleton skeleton-text" style="width: ${
              60 + Math.random() * 30
            }%;"></div></td>
            <td><div class="skeleton skeleton-text" style="width: ${
              50 + Math.random() * 30
            }%;"></div></td>
            <td class="text-center"><div class="skeleton skeleton-text" style="width: 80px; margin: 0 auto;"></div></td>
            <td><div class="skeleton skeleton-text" style="width: 70px;"></div></td>
            <td class="text-end"><div class="skeleton skeleton-text" style="width: 90px; margin-left: auto;"></div></td>
            <td class="text-center"><div class="skeleton skeleton-text" style="width: 60px; margin: 0 auto;"></div></td>
        </tr>
    `
    )
    .join("");
}

function showSummarySkeleton() {
  const totalMasuk = document.getElementById("totalMasuk");
  const totalKeluar = document.getElementById("totalKeluar");
  const totalProfit = document.getElementById("totalProfit");

  if (totalMasuk) {
    totalMasuk.innerHTML = '<div class="skeleton skeleton-card-value"></div>';
  }
  if (totalKeluar) {
    totalKeluar.innerHTML = '<div class="skeleton skeleton-card-value"></div>';
  }
  if (totalProfit) {
    totalProfit.innerHTML = '<div class="skeleton skeleton-card-value"></div>';
  }
}

function showPatientStatsSkeleton() {
  const totalPasien = document.getElementById("totalPasien");
  const totalBPJS = document.getElementById("totalBPJS");
  const totalUMUM = document.getElementById("totalUMUM");

  if (totalPasien)
    totalPasien.innerHTML = '<div class="skeleton skeleton-stat-number"></div>';
  if (totalBPJS)
    totalBPJS.innerHTML = '<div class="skeleton skeleton-stat-number"></div>';
  if (totalUMUM)
    totalUMUM.innerHTML = '<div class="skeleton skeleton-stat-number"></div>';
}

// ===================================
// JAVASCRIPT FUNCTIONS
// ===================================

window.PEMBUKUAN_API_URL = "../API/pembukuan_api.php";
window.PEMBUKUAN_DOKTER_ID =
  localStorage.getItem("id_dokter") || sessionStorage.getItem("id_dokter");

console.log("🔧 API URL configured:", window.PEMBUKUAN_API_URL);
console.log(
  "👨‍⚕️ Doctor ID:",
  window.PEMBUKUAN_DOKTER_ID || "NOT SET - Will try from session"
);

document.addEventListener("DOMContentLoaded", function () {
  pembukuanInit();
});

async function pembukuanInit() {
  console.log("====================================");
  console.log("🚀 PEMBUKUAN INIT - START");
  console.log("====================================");

  const today = new Date().toISOString().split("T")[0];

  const startDateInput = document.getElementById("startDate");
  const endDateInput = document.getElementById("endDate");
  const tanggalInput = document.getElementById("tanggal");

  if (startDateInput) {
    startDateInput.value = today;
    console.log("✅ Start date set to (today):", today);
  } else {
    console.warn("⚠️ startDate input not found");
  }

  if (endDateInput) {
    endDateInput.value = today;
    console.log("✅ End date set to (today):", today);
  } else {
    console.warn("⚠️ endDate input not found");
  }

  if (tanggalInput) {
    tanggalInput.value = today;
    console.log("✅ Tanggal input set to:", today);
  }

  console.log("📊 Loading main pembukuan data for today...");
  await pembukuanLoadData();

  console.log("📊 Now loading patient statistics for today...");
  setTimeout(async () => {
    await loadPatientStatistics();
  }, 100);

  showInfoBannerForDateRange(today, today);

  console.log("====================================");
  console.log("✅ PEMBUKUAN INIT - COMPLETE");
  console.log("====================================");
}

function togglePatientStats() {
  const collapseElement = document.getElementById("patientStatsCollapse");
  const icon = document.getElementById("iconToggleStats");
  const text = document.getElementById("textToggleStats");

  if (collapseElement && typeof bootstrap !== "undefined") {
    const bsCollapse = new bootstrap.Collapse(collapseElement, {
      toggle: false,
    });

    if (collapseElement.classList.contains("show")) {
      bsCollapse.hide();
      if (icon) icon.className = "fas fa-chevron-down me-2";
      if (text) text.textContent = "Tampilkan Detail";
    } else {
      bsCollapse.show();
      if (icon) icon.className = "fas fa-chevron-up me-2";
      if (text) text.textContent = "Sembunyikan Detail";

      loadPatientStatistics();
    }
  }
}

async function loadPatientStatistics() {
  console.log("====================================");
  console.log("📊 LOADING PATIENT STATISTICS");
  console.log("====================================");

  // ✅ SHOW SKELETON FIRST
  showPatientStatsSkeleton();

  const startDateInput = document.getElementById("startDate");
  const endDateInput = document.getElementById("endDate");

  if (!startDateInput || !endDateInput) {
    console.error("❌ Date input elements not found!");
    return;
  }

  let startDate = startDateInput.value;
  let endDate = endDateInput.value;

  if (!startDate || !endDate) {
    const today = new Date().toISOString().split("T")[0];
    startDate = today;
    endDate = today;
    console.log("⚠️ Dates were empty, using today:", today);
  }

  console.log("📅 Initial values:", { startDate, endDate });

  const dokterId = localStorage.getItem("id_dokter");

  console.log("👨‍⚕️ Doctor ID:", dokterId);
  console.log("📅 Start Date (from input):", startDate);
  console.log("📅 End Date (from input):", endDate);

  if (!dokterId) {
    console.error("❌ Doctor ID not found");
    return;
  }

  try {
    const url =
      window.PEMBUKUAN_API_URL +
      "?action=get_patient_stats" +
      "&start_date=" +
      encodeURIComponent(startDate) +
      "&end_date=" +
      encodeURIComponent(endDate) +
      "&dokter_id=" +
      encodeURIComponent(dokterId);

    console.log("📡 Fetching from:", url);

    const response = await fetch(url, {
      method: "GET",
      credentials: "same-origin",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
    });

    console.log("📥 Response status:", response.status);
    console.log("📥 Response ok:", response.ok);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const responseText = await response.text();
    console.log("📄 Raw response:", responseText.substring(0, 500));

    const result = JSON.parse(responseText);
    console.log("📊 Parsed result:", result);

    if (result.success) {
      console.log("✅ Patient stats loaded successfully");
      console.log("   Data:", result.data);

      // ✅ Small delay to show skeleton animation
      await new Promise((resolve) => setTimeout(resolve, 300));

      updatePatientStatsDisplay(result.data);
    } else {
      throw new Error(result.message || "Gagal memuat statistik pasien");
    }
  } catch (error) {
    console.error("====================================");
    console.error("❌ ERROR LOADING PATIENT STATS");
    console.error("====================================");
    console.error("Error:", error);
    console.error("Stack:", error.stack);

    const totalPasienEl = document.getElementById("totalPasien");
    const totalBPJSEl = document.getElementById("totalBPJS");
    const totalUMUMEl = document.getElementById("totalUMUM");

    if (totalPasienEl) totalPasienEl.textContent = "0";
    if (totalBPJSEl) totalBPJSEl.textContent = "0";
    if (totalUMUMEl) totalUMUMEl.textContent = "0";
  }
}

function updateInfoBanner(startDate, endDate) {
  const banner = document.getElementById("dateInfoBanner");
  if (!banner) {
    showInfoBannerForDateRange(startDate, endDate);
    return;
  }

  const today = new Date().toISOString().split("T")[0];

  if (startDate === today && endDate === today) {
    banner.className = "alert alert-info alert-dismissible fade show mx-3 mb-3";
    banner.style.borderLeft = "4px solid #0891b2";
    banner.innerHTML = `
            <div class="d-flex align-items-center">
                <i class="fas fa-info-circle me-3" style="font-size: 1.5rem;"></i>
                <div>
                    <strong>Menampilkan data hari ini (${pembukuanFormatDate(
                      today
                    )})</strong>
                    <p class="mb-0 small">Gunakan filter tanggal di bawah untuk melihat data periode lain</p>
                </div>
            </div>
            <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
        `;
  } else {
    banner.className =
      "alert alert-success alert-dismissible fade show mx-3 mb-3";
    banner.style.borderLeft = "4px solid #10b981";
    banner.innerHTML = `
            <div class="d-flex align-items-center">
                <i class="fas fa-filter me-3" style="font-size: 1.5rem;"></i>
                <div>
                    <strong>Menampilkan data periode: ${pembukuanFormatDate(
                      startDate
                    )} - ${pembukuanFormatDate(endDate)}</strong>
                    <p class="mb-0 small">Filter aktif. Klik "Reset" untuk kembali ke data hari ini</p>
                </div>
            </div>
            <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
        `;
  }
}

function updatePatientStatsDisplay(data) {
  console.log("====================================");
  console.log("🎨 UPDATING PATIENT STATS DISPLAY");
  console.log("====================================");
  console.log("📊 Data received:", data);

  const totalPasien = parseInt(data.total_pasien || 0);
  const totalBPJS = parseInt(data.total_bpjs || 0);
  const totalUMUM = parseInt(data.total_umum || 0);

  console.log("   Parsed values:");
  console.log("   - Total Pasien:", totalPasien);
  console.log("   - Total BPJS:", totalBPJS);
  console.log("   - Total UMUM:", totalUMUM);

  const totalPasienEl = document.getElementById("totalPasien");
  const totalBPJSEl = document.getElementById("totalBPJS");
  const totalUMUMEl = document.getElementById("totalUMUM");

  if (totalPasienEl) {
    totalPasienEl.textContent = totalPasien;
    console.log("   ✅ Updated totalPasien element");
  }

  if (totalBPJSEl) {
    totalBPJSEl.textContent = totalBPJS;
    console.log("   ✅ Updated totalBPJS element");
  }

  if (totalUMUMEl) {
    totalUMUMEl.textContent = totalUMUM;
    console.log("   ✅ Updated totalUMUM element");
  }

  const percentBPJS =
    totalPasien > 0 ? ((totalBPJS / totalPasien) * 100).toFixed(1) : 0;
  const percentUMUM =
    totalPasien > 0 ? ((totalUMUM / totalPasien) * 100).toFixed(1) : 0;

  console.log("   Percentages:");
  console.log("   - BPJS:", percentBPJS + "%");
  console.log("   - UMUM:", percentUMUM + "%");

  const percentBPJSEl = document.getElementById("percentBPJS");
  const percentUMUMEl = document.getElementById("percentUMUM");

  if (percentBPJSEl) {
    percentBPJSEl.textContent = percentBPJS + "%";
  }

  if (percentUMUMEl) {
    percentUMUMEl.textContent = percentUMUM + "%";
  }

  console.log("====================================");
  console.log("✅ PATIENT STATS DISPLAY UPDATED");
  console.log("====================================");
}

async function pembukuanLoadData() {
  try {
    console.log("📡 Loading data from:", window.PEMBUKUAN_API_URL);

    // ✅ SHOW SKELETON LOADERS FIRST
    const pembukuanBody = document.getElementById("pembukuanBody");
    if (pembukuanBody) {
      pembukuanBody.innerHTML = generatePembukuanTableSkeleton(5);
    }

    // ✅ Show skeleton in summary cards
    showSummarySkeleton();

    const dokterId = localStorage.getItem("id_dokter");
    console.log("👨‍⚕️ Doctor ID from localStorage:", dokterId);

    if (!dokterId) {
      throw new Error(
        "Doctor ID not found in localStorage. Please login again."
      );
    }

    const startDate =
      document.getElementById("startDate")?.value ||
      new Date().toISOString().split("T")[0];
    const endDate =
      document.getElementById("endDate")?.value ||
      new Date().toISOString().split("T")[0];

    const url =
      window.PEMBUKUAN_API_URL +
      "?action=filter_pembukuan&start_date=" +
      startDate +
      "&end_date=" +
      endDate +
      "&dokter_id=" +
      dokterId;

    console.log("🌐 Full URL:", url);
    console.log("📅 Date range:", startDate, "to", endDate);

    const response = await fetch(url, {
      method: "GET",
      credentials: "same-origin",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
    });

    console.log("📥 Response status:", response.status);

    const responseText = await response.text();
    console.log(
      "📄 Raw response (first 500 chars):",
      responseText.substring(0, 500)
    );

    let result;
    try {
      result = JSON.parse(responseText);
      console.log("📊 Parsed result.success:", result.success);
      console.log(
        "📊 Parsed result.data length:",
        result.data ? result.data.length : "null/undefined"
      );
    } catch (parseError) {
      console.error("❌ JSON parse error:", parseError);
      console.error("Raw text was:", responseText);
      throw new Error("Invalid JSON response from server");
    }

    if (result.success) {
      console.log(
        "✅ API Success! Processing",
        result.data ? result.data.length : 0,
        "items"
      );

      // ✅ Small delay to show skeleton animation
      await new Promise((resolve) => setTimeout(resolve, 300));

      pembukuanDisplayData(result.data);

      updateInfoBanner(startDate, endDate);
    } else {
      console.error("❌ API returned success: false");
      throw new Error(result.message || "Gagal memuat data");
    }
  } catch (error) {
    console.error("❌ Error loading data:", error);
    const pembukuanBody = document.getElementById("pembukuanBody");
    if (pembukuanBody) {
      pembukuanBody.innerHTML = `<tr><td colspan="9" class="text-center text-danger py-4">
                    ❌ Gagal memuat data: ${error.message}
                    <br><small>Check browser console (F12) for details</small>
                    <br><small class="text-muted">API URL: ${
                      window.PEMBUKUAN_API_URL
                    }</small>
                    <br><small class="text-muted">Doctor ID: ${
                      localStorage.getItem("id_dokter") || "Not set"
                    }</small>
                    <br><br>
                    <button onclick="location.reload()" class="btn btn-sm btn-primary">Refresh</button>
                </td></tr>`;
    }
  }
}

function pembukuanUpdateSummaryCards(
  totalPemasukan,
  totalPengeluaran,
  totalProfit
) {
  const totalMasuk = document.getElementById("totalMasuk");
  const totalKeluar = document.getElementById("totalKeluar");
  const totalProfitEl = document.getElementById("totalProfit");

  if (totalMasuk)
    totalMasuk.textContent = pembukuanFormatRupiah(totalPemasukan);
  if (totalKeluar)
    totalKeluar.textContent = pembukuanFormatRupiah(totalPengeluaran);
  if (totalProfitEl) {
    totalProfitEl.textContent = pembukuanFormatRupiah(totalProfit);
    if (totalProfit >= 0) {
      totalProfitEl.classList.remove("text-danger");
      totalProfitEl.classList.add("text-gray-800");
    } else {
      totalProfitEl.classList.remove("text-gray-800");
      totalProfitEl.classList.add("text-danger");
    }
  }
}

function pembukuanDisplayData(data) {
  console.log("====================================");
  console.log("🎨 DISPLAY FUNCTION CALLED");
  console.log("====================================");
  console.log("📦 Input data:", data);
  console.log("   Type:", typeof data);
  console.log("   Is Array:", Array.isArray(data));
  console.log("   Length:", data ? data.length : "null");

  const tbody = document.getElementById("pembukuanBody");
  if (!tbody) {
    console.error("❌ Table body element #pembukuanBody not found!");
    return;
  }

  console.log("✅ Table body element found");

  let dailySummaries = data;
  if (data && typeof data === "object" && !Array.isArray(data)) {
    console.log("⚠️  Data is object, checking for nested data property");
    if (data.data) {
      console.log("   Found data.data property");
      dailySummaries = data.data;
    }
  }

  if (!Array.isArray(dailySummaries)) {
    console.error("❌ DATA IS NOT AN ARRAY");
    tbody.innerHTML =
      '<tr><td colspan="9" class="text-center text-danger py-4">Format data tidak valid</td></tr>';
    pembukuanUpdateSummaryCards(0, 0, 0);
    return;
  }

  console.log(
    "✅ Daily summaries is valid array with",
    dailySummaries.length,
    "items"
  );

  if (dailySummaries.length === 0) {
    console.warn("⚠️  EMPTY ARRAY - No data to display");

    const startDate = document.getElementById("startDate")?.value;
    const endDate = document.getElementById("endDate")?.value;
    const today = new Date().toISOString().split("T")[0];

    let message = "Belum ada data transaksi untuk hari ini";
    if (startDate !== today || endDate !== today) {
      message = `Tidak ada data transaksi untuk periode ${pembukuanFormatDate(
        startDate
      )} - ${pembukuanFormatDate(endDate)}`;
    }

    tbody.innerHTML = `
            <tr>
                <td colspan="9" class="text-center py-5">
                    <i class="fas fa-inbox text-muted" style="font-size: 3rem; opacity: 0.3;"></i>
                    <p class="text-muted mt-3 mb-0">${message}</p>
                    <p class="text-muted small">Tambah transaksi baru atau pilih periode lain</p>
                </td>
            </tr>
        `;

    pembukuanUpdateSummaryCards(0, 0, 0);

    const footerMasuk = document.getElementById("footerMasuk");
    const footerKeluar = document.getElementById("footerKeluar");
    const footerSaldo = document.getElementById("footerSaldo");

    if (footerMasuk) footerMasuk.textContent = "Rp 0";
    if (footerKeluar) footerKeluar.textContent = "Rp 0";
    if (footerSaldo) footerSaldo.textContent = "Rp 0";

    return;
  }

  console.log("✅ Processing", dailySummaries.length, "daily summaries");

  let html = "";
  let totalPemasukan = 0;
  let totalPengeluaran = 0;

  dailySummaries.forEach((item, index) => {
    const pemasukan = parseFloat(item.pemasukan || 0);
    const pengeluaran = parseFloat(item.pengeluaran || 0);
    const saldo = parseFloat(item.saldo || 0);

    totalPemasukan += pemasukan;
    totalPengeluaran += pengeluaran;

    const tanggal = item.tanggal || "-";

    let badgeClass = "bg-secondary";
    let badgeText = "Tidak ada";

    if (pemasukan > 0 && pengeluaran > 0) {
      badgeClass = "bg-info";
      badgeText = "Pemasukan & Pengeluaran";
    } else if (pemasukan > 0) {
      badgeClass = "bg-success";
      badgeText = "Pemasukan";
    } else if (pengeluaran > 0) {
      badgeClass = "bg-danger";
      badgeText = "Pengeluaran";
    }

    html += `
            <tr>
                <td class="text-center">${index + 1}</td>
                <td><strong>${pembukuanFormatDate(tanggal)}</strong></td>
                <td><span class="badge ${badgeClass}">${badgeText}</span></td>
                <td colspan="2" class="text-muted small">Klik "Lihat Detail" untuk melihat transaksi</td>
                <td class="text-end text-success fw-semibold">${pembukuanFormatRupiah(
                  pemasukan
                )}</td>
                <td class="text-end text-danger fw-semibold">${pembukuanFormatRupiah(
                  pengeluaran
                )}</td>
                <td class="text-end fw-bold">${pembukuanFormatRupiah(
                  saldo
                )}</td>
                <td class="text-center">
                    <button class="btn btn-sm btn-info" onclick="pembukuanShowDetail('${tanggal}')" title="Lihat Detail">
                        <i class="fas fa-eye"></i> Detail
                    </button>
                </td>
            </tr>
        `;
  });

  tbody.innerHTML = html;

  const footerMasuk = document.getElementById("footerMasuk");
  const footerKeluar = document.getElementById("footerKeluar");
  const footerSaldo = document.getElementById("footerSaldo");

  if (footerMasuk)
    footerMasuk.textContent = pembukuanFormatRupiah(totalPemasukan);
  if (footerKeluar)
    footerKeluar.textContent = pembukuanFormatRupiah(totalPengeluaran);
  if (footerSaldo)
    footerSaldo.textContent = pembukuanFormatRupiah(
      totalPemasukan - totalPengeluaran
    );

  pembukuanUpdateSummaryCards(
    totalPemasukan,
    totalPengeluaran,
    totalPemasukan - totalPengeluaran
  );

  console.log("====================================");
  console.log("✅ DISPLAY COMPLETE");
  console.log("   Days shown:", dailySummaries.length);
  console.log("   Total Pemasukan:", totalPemasukan);
  console.log("   Total Pengeluaran:", totalPengeluaran);
  console.log("   Saldo:", totalPemasukan - totalPengeluaran);
  console.log("====================================");
}

document.addEventListener("submit", async function (e) {
  if (e.target.id === "formPembukuan") {
    e.preventDefault();

    const submitBtn = document.getElementById("btnSubmitPembukuan");
    if (!submitBtn) return;

    submitBtn.disabled = true;
    submitBtn.innerHTML =
      '<i class="fas fa-spinner fa-spin me-2"></i>Menyimpan...';

    try {
      const dokterId = localStorage.getItem("id_dokter");
      if (!dokterId)
        throw new Error("Doctor ID not found. Please login again.");

      const tipe = document.querySelector(
        'input[name="tipeTransaksi"]:checked'
      )?.value;
      const tanggal = document.getElementById("tanggal")?.value;
      const judul = document.getElementById("judulTransaksi")?.value;
      const deskripsi = document.getElementById("deskripsi")?.value;
      const total = parseFloat(document.getElementById("totalAmount")?.value);

      if (!tipe || !tanggal || !judul || !total) {
        throw new Error("Mohon lengkapi semua field yang wajib diisi");
      }

      const data = {
        tipe,
        tanggal,
        judul,
        deskripsi,
        total,
        id_dokter: dokterId,
      };

      const response = await fetch(
        window.PEMBUKUAN_API_URL +
          "?action=add_transaksi&dokter_id=" +
          dokterId,
        {
          method: "POST",
          credentials: "same-origin",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        }
      );

      const result = await response.json();

      if (result.success) {
        alert("Transaksi berhasil disimpan!");
        e.target.reset();
        document.getElementById("tanggal").value = new Date()
          .toISOString()
          .split("T")[0];

        const modalElement = document.getElementById("tambahModal");
        if (modalElement && typeof bootstrap !== "undefined") {
          const modal = bootstrap.Modal.getInstance(modalElement);
          if (modal) modal.hide();
        }

        await pembukuanLoadData();
      } else {
        throw new Error(result.message || "Gagal menyimpan transaksi");
      }
    } catch (error) {
      console.error("Error saving transaction:", error);
      alert("Gagal menyimpan transaksi: " + error.message);
    } finally {
      submitBtn.disabled = false;
      submitBtn.innerHTML = '<i class="fas fa-save me-2"></i>Simpan Transaksi';
    }
  }
});

async function pembukuanFilter() {
  const startDate = document.getElementById("startDate")?.value;
  const endDate = document.getElementById("endDate")?.value;

  console.log("====================================");
  console.log("🔍 FILTER BUTTON CLICKED");
  console.log("====================================");
  console.log("📅 Start Date:", startDate);
  console.log("📅 End Date:", endDate);

  if (!startDate || !endDate) {
    alert("Silakan pilih rentang tanggal");
    return;
  }

  const dokterId = localStorage.getItem("id_dokter");

  if (!dokterId) {
    alert("Doctor ID not found. Please login again.");
    return;
  }

  try {
    const url =
      window.PEMBUKUAN_API_URL +
      "?action=filter_pembukuan&start_date=" +
      startDate +
      "&end_date=" +
      endDate +
      "&dokter_id=" +
      dokterId;

    console.log("📡 Fetching from URL:", url);

    const response = await fetch(url, {
      method: "GET",
      credentials: "same-origin",
      headers: { Accept: "application/json" },
    });

    const responseText = await response.text();
    const result = JSON.parse(responseText);

    if (result.success) {
      console.log("✅ Filter success");
      pembukuanDisplayData(result.data);

      updateInfoBanner(startDate, endDate);

      console.log("📊 Reloading patient statistics...");
      await loadPatientStatistics();

      showTemporaryMessage("Data berhasil difilter", "success");
    } else {
      throw new Error(result.message || "Gagal filter data");
    }
  } catch (error) {
    console.error("❌ Filter error:", error);
    alert("Gagal filter data: " + error.message);
  }
}

function showTemporaryMessage(message, type = "info") {
  const existingMsg = document.getElementById("tempMessage");
  if (existingMsg) existingMsg.remove();

  const alertClass =
    type === "success"
      ? "alert-success"
      : type === "error"
      ? "alert-danger"
      : "alert-info";

  const iconClass =
    type === "success"
      ? "fa-check-circle"
      : type === "error"
      ? "fa-exclamation-circle"
      : "fa-info-circle";

  const tempMsg = document.createElement("div");
  tempMsg.id = "tempMessage";
  tempMsg.className = `alert ${alertClass} alert-dismissible fade show position-fixed`;
  tempMsg.style.cssText =
    "top: 20px; right: 20px; z-index: 9999; min-width: 300px; box-shadow: 0 4px 12px rgba(0,0,0,0.15);";
  tempMsg.innerHTML = `
        <i class="fas ${iconClass} me-2"></i>
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;

  document.body.appendChild(tempMsg);

  setTimeout(() => {
    if (tempMsg && tempMsg.parentNode) {
      tempMsg.classList.remove("show");
      setTimeout(() => tempMsg.remove(), 150);
    }
  }, 3000);
}

async function pembukuanResetFilter() {
  const today = new Date().toISOString().split("T")[0];

  const startDateInput = document.getElementById("startDate");
  const endDateInput = document.getElementById("endDate");

  if (startDateInput) startDateInput.value = today;
  if (endDateInput) endDateInput.value = today;

  console.log("🔄 Reset filter to today:", today);

  await pembukuanLoadData();

  updateInfoBanner(today, today);

  console.log("📊 Reloading patient statistics...");
  await loadPatientStatistics();

  const today_formatted = pembukuanFormatDate(today);
  showTemporaryMessage(
    `Filter direset ke data hari ini (${today_formatted})`,
    "success"
  );
}

async function pembukuanShowDetail(tanggal) {
  console.log("📋 Showing detail for date:", tanggal);

  const dokterId = localStorage.getItem("id_dokter");
  if (!dokterId) {
    alert("Doctor ID not found. Please login again.");
    return;
  }

  const modalElement = document.getElementById("detailModal");
  if (modalElement && typeof bootstrap !== "undefined") {
    const modal = new bootstrap.Modal(modalElement);
    modal.show();
  }

  const detailTanggalEl = document.getElementById("detailTanggal");
  if (detailTanggalEl) {
    detailTanggalEl.textContent = pembukuanFormatDate(tanggal);
  }

  const detailBody = document.getElementById("detailBody");
  if (detailBody) {
    // ✅ SHOW SKELETON INSTEAD OF SPINNER
    detailBody.innerHTML = generateDetailTableSkeleton(5);
  }

  try {
    const url =
      window.PEMBUKUAN_API_URL +
      "?action=get_detail_transaksi&tanggal=" +
      tanggal +
      "&dokter_id=" +
      dokterId;

    console.log("📡 Fetching detail from:", url);

    const response = await fetch(url, {
      method: "GET",
      credentials: "same-origin",
      headers: { Accept: "application/json" },
    });

    const result = await response.json();
    console.log("====================================");
    console.log("📊 DETAIL API RESPONSE");
    console.log("====================================");
    console.log("Success:", result.success);
    console.log("Data length:", result.data?.length);
    console.log("Full result:", result);
    if (result.data && result.data[0]) {
      console.log("First item FULL object:", result.data[0]);
      console.log("First item keys:", Object.keys(result.data[0]));
      console.log("First item id_antrian value:", result.data[0].id_antrian);
      console.log(
        "First item id_antrian type:",
        typeof result.data[0].id_antrian
      );
    }
    console.log("====================================");

    if (result.success) {
      // ✅ Small delay to show skeleton animation
      await new Promise((resolve) => setTimeout(resolve, 300));

      pembukuanDisplayDetail(result.data);
    } else {
      throw new Error(result.message || "Gagal memuat detail");
    }
  } catch (error) {
    console.error("❌ Error loading detail:", error);
    if (detailBody) {
      detailBody.innerHTML = `
                <tr>
                    <td colspan="7" class="text-center text-danger py-4">
                        ❌ Gagal memuat detail: ${error.message}
                    </td>
                </tr>
            `;
    }
  }
}

function pembukuanDisplayDetail(data) {
  console.log("====================================");
  console.log("🎨 DISPLAYING DETAIL DATA - ENHANCED VERSION");
  console.log("====================================");

  const detailBody = document.getElementById("detailBody");
  if (!detailBody) {
    console.error("❌ Detail body element not found");
    return;
  }

  if (!Array.isArray(data) || data.length === 0) {
    detailBody.innerHTML = `
            <tr>
                <td colspan="7" class="text-center text-muted py-4">
                    Tidak ada detail transaksi untuk tanggal ini
                </td>
            </tr>
        `;

    const detailTotalFooter = document.getElementById("detailTotalFooter");
    if (detailTotalFooter) {
      detailTotalFooter.textContent = "Rp 0";
      detailTotalFooter.className = "text-end py-3 fw-bold";
    }
    return;
  }

  let html = "";
  let totalKeseluruhan = 0;

  data.forEach((item, index) => {
    const total = parseFloat(item.total || 0);

    console.log(`📋 Item ${index + 1}:`, {
      jenis: item.jenis,
      jenis_pasien: item.jenis_pasien,
      is_bpjs_free: item.is_bpjs_free,
      total: total,
      deskripsi: item.deskripsi,
    });

    // ✅ CALCULATION LOGIC:
    // - Pemasukan (UMUM): ADD to total (positive, green)
    // - Pengeluaran (Regular): SUBTRACT from total (negative, red)
    // - Pengeluaran (BPJS Medicine): SUBTRACT medicine cost (negative, red with BPJS badge)

    let displayTotal = total;
    let totalClass = "";
    let displayText = "";

    if (item.jenis === "Pemasukan") {
      // ✅ Income - ADD to total, display as positive green
      totalKeseluruhan += total;
      displayText = pembukuanFormatRupiah(total);
      totalClass = "text-success fw-bold";

      console.log(`   ➕ Adding Pemasukan: +${total}`);
    } else if (item.jenis === "Pengeluaran") {
      // ✅ Expense - SUBTRACT from total
      totalKeseluruhan -= total;

      console.log(`   ➖ Subtracting Pengeluaran: -${total}`);

      if (item.is_bpjs_free === true || item.jenis_pasien === "BPJS") {
        // ✅ BPJS expense - show medicine cost with BPJS badge
        if (total > 0) {
          displayText = `
                        <div>
                            <span class="badge bg-warning text-dark mb-1">BPJS</span>
                            <br>
                            <strong class="text-danger">-${pembukuanFormatRupiah(
                              total
                            )}</strong>
                            <br><small class="text-muted">Biaya obat dari klinik</small>
                        </div>
                    `;
        } else {
          displayText = `
                        <div>
                            <span class="badge bg-warning text-dark mb-1">BPJS</span>
                            <br>
                            <strong class="text-muted">Rp 0</strong>
                            <br><small class="text-muted">Tidak ada biaya obat</small>
                        </div>
                    `;
        }
        totalClass = "text-danger";
      } else {
        // ✅ Regular expense
        displayText = "-" + pembukuanFormatRupiah(total);
        totalClass = "text-danger fw-bold";
      }
    }

    // ✅ Determine badge color
    const badgeClass = item.jenis === "Pemasukan" ? "bg-success" : "bg-danger";

    // ✅ Action button
    let aksiButton = '<span class="text-muted">-</span>';

    if (
      item.id_antrian &&
      item.id_antrian !== null &&
      item.id_antrian !== "null"
    ) {
      aksiButton = `
                <button class="btn btn-sm btn-info" 
                        onclick="pembukuanShowPatientDetail('${item.id_antrian}')" 
                        title="Lihat Detail Pasien">
                    <i class="fas fa-eye me-1"></i>Detail
                </button>
            `;
    }

    // ✅ Display description with BPJS icon if applicable
    let displayDeskripsi = item.deskripsi || "-";
    if (item.jenis_pasien === "BPJS") {
      displayDeskripsi =
        '<i class="fas fa-shield-alt me-1 text-warning"></i>' +
        displayDeskripsi;
    }

    html += `
            <tr>
                <td class="text-center">${index + 1}</td>
                <td>${displayDeskripsi}</td>
                <td>${item.detail || "-"}</td>
                <td class="text-center">
                    <span class="badge ${badgeClass}">${item.jenis}</span>
                </td>
                <td>${item.metode_pembayaran || "-"}</td>
                <td class="text-end ${totalClass}">
                    ${displayText}
                </td>
                <td class="text-center">
                    ${aksiButton}
                </td>
            </tr>
        `;
  });

  detailBody.innerHTML = html;

  console.log("====================================");
  console.log("📊 CALCULATION SUMMARY:");
  console.log("   Final Balance:", totalKeseluruhan);
  console.log("====================================");

  // ✅ Update footer with correct total
  const detailTotalFooter = document.getElementById("detailTotalFooter");
  if (detailTotalFooter) {
    detailTotalFooter.textContent = pembukuanFormatRupiah(totalKeseluruhan);
    detailTotalFooter.className =
      "text-end py-3 fw-bold " +
      (totalKeseluruhan >= 0 ? "text-success" : "text-danger");
  }

  console.log("✅ DETAIL DISPLAY COMPLETE");
}

// Helper function (make sure this exists in your code)
function pembukuanFormatRupiah(angka) {
  const number = parseFloat(angka);
  if (isNaN(number)) return "Rp 0";

  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(number);
}

async function pembukuanShowPatientDetail(idAntrian) {
  console.log("👨‍⚕️ Showing patient detail for antrian:", idAntrian);

  const dokterId = localStorage.getItem("id_dokter");
  if (!dokterId) {
    alert("Doctor ID not found. Please login again.");
    return;
  }

  const modalElement = document.getElementById("patientDetailModal");
  if (modalElement && typeof bootstrap !== "undefined") {
    const modal = new bootstrap.Modal(modalElement);
    modal.show();
  }

  const patientDetailBody = document.getElementById("patientDetailBody");
  if (patientDetailBody) {
    patientDetailBody.innerHTML = `
            <div class="text-center py-5">
                <div class="spinner-border text-primary" role="status">
                    <span class="visually-hidden">Loading...</span>
                </div>
                <p class="mt-3 text-muted">Memuat detail pasien...</p>
            </div>
        `;
  }

  try {
    const url =
      window.PEMBUKUAN_API_URL +
      "?action=get_patient_detail&id_antrian=" +
      idAntrian +
      "&dokter_id=" +
      dokterId;

    console.log("📡 Fetching patient detail from:", url);

    const response = await fetch(url, {
      method: "GET",
      credentials: "same-origin",
      headers: { Accept: "application/json" },
    });

    const result = await response.json();
    console.log("📊 Patient detail result:", result);

    if (result.success) {
      pembukuanDisplayPatientDetail(result.data);
    } else {
      throw new Error(result.message || "Gagal memuat detail pasien");
    }
  } catch (error) {
    console.error("❌ Error loading patient detail:", error);
    if (patientDetailBody) {
      patientDetailBody.innerHTML = `
                <div class="alert alert-danger m-3">
                    <i class="fas fa-exclamation-triangle me-2"></i>
                    ${error.message}
                </div>
            `;
    }
  }
}

function pembukuanDisplayPatientDetail(data) {
  console.log("====================================");
  console.log("🐞 DEBUG PATIENT DETAIL");
  console.log("====================================");
  console.log("📦 Full data received:", data);
  console.log("🩺 Anamnesa object:", data.anamnesa);
  console.log("   Keys:", Object.keys(data.anamnesa || {}));
  console.log("   Keluhan value:", data.anamnesa?.keluhan);
  console.log("   Anamnesis value:", data.anamnesa?.anamnesis);
  console.log("====================================");
  console.log("🎨 Displaying patient detail:", data);

  const patientDetailBody = document.getElementById("patientDetailBody");
  if (!patientDetailBody) return;

  const patient = data.patient || {};
  const antrian = data.antrian || {};
  const anamnesa = data.anamnesa || {};
  const diagnosis = data.diagnosis || [];
  const medicines = data.medicines || [];
  const payment = data.payment || {};

  let totalObat = 0;
  medicines.forEach((med) => {
    totalObat += parseFloat(med.subtotal || 0);
  });

  let html = `
        <!-- Patient Info -->
        <div class="section-header">
            <i class="fas fa-user me-2"></i>Informasi Pasien
        </div>
        <div class="row">
            <div class="col-md-6">
                <div class="info-card">
                    <div class="info-label">Nama Pasien</div>
                    <div class="info-value">${patient.nama || "-"}</div>
                </div>
            </div>
            <div class="col-md-3">
                <div class="info-card">
                    <div class="info-label">NIK</div>
                    <div class="info-value">${patient.nik || "-"}</div>
                </div>
            </div>
            <div class="col-md-3">
                <div class="info-card">
                    <div class="info-label">Jenis Kelamin</div>
                    <div class="info-value">${
                      patient.jenis_kelamin || "-"
                    }</div>
                </div>
            </div>
        </div>
        <div class="row">
            <div class="col-md-4">
                <div class="info-card">
                    <div class="info-label">Tanggal Lahir</div>
                    <div class="info-value">${
                      pembukuanFormatDate(patient.tanggal_lahir) || "-"
                    }</div>
                </div>
            </div>
            <div class="col-md-4">
                <div class="info-card">
                    <div class="info-label">No. Telepon</div>
                    <div class="info-value">${patient.no_telp || "-"}</div>
                </div>
            </div>
            <div class="col-md-4">
                <div class="info-card">
                    <div class="info-label">No. Antrian</div>
                    <div class="info-value"><span class="badge bg-primary">${
                      antrian.no_antrian || "-"
                    }</span></div>
                </div>
            </div>
        </div>
        
        <!-- Anamnesa -->
        <div class="section-header">
            <i class="fas fa-notes-medical me-2"></i>Anamnesa & Pemeriksaan
        </div>
        <div class="row">
            <div class="col-md-6">
                <div class="info-card">
                    <div class="info-label">Keluhan Utama</div>
                    <div class="info-value">${anamnesa.keluhan || "-"}</div>
                </div>
            </div>
            <div class="col-md-6">
                <div class="info-card">
                    <div class="info-label">Anamnesis</div>
                    <div class="info-value">${anamnesa.anamnesis || "-"}</div>
                </div>
            </div>
        </div>
        <div class="row">
            <div class="col-md-4">
                <div class="info-card">
                    <div class="info-label">Alergi Makanan</div>
                    <div class="info-value">${
                      anamnesa.alergi_makanan || "-"
                    }</div>
                </div>
            </div>
            <div class="col-md-4">
                <div class="info-card">
                    <div class="info-label">Alergi Udara</div>
                    <div class="info-value">${
                      anamnesa.alergi_udara || "-"
                    }</div>
                </div>
            </div>
            <div class="col-md-4">
                <div class="info-card">
                    <div class="info-label">Alergi Obat</div>
                    <div class="info-value">${anamnesa.alergi_obat || "-"}</div>
                </div>
            </div>
        </div>
        
        <!-- Diagnosis -->
        <div class="section-header">
            <i class="fas fa-diagnoses me-2"></i>Diagnosis
        </div>
    `;

  if (diagnosis.length > 0) {
    html += '<div class="row">';
    diagnosis.forEach((diag, index) => {
      html += `
                <div class="col-md-6 mb-3">
                    <div class="medicine-item">
                        <div class="d-flex justify-content-between align-items-start">
                            <div>
                                <span class="badge bg-info mb-2">${diag.jenis}</span>
                                <h6 class="mb-1">${diag.kode}</h6>
                                <p class="mb-0 text-muted small">${diag.deskripsi}</p>
                            </div>
                        </div>
                    </div>
                </div>
            `;
    });
    html += "</div>";
  } else {
    html +=
      '<p class="text-muted text-center py-3">Tidak ada diagnosis yang tercatat</p>';
  }

  html += `
        <div class="section-header">
            <i class="fas fa-pills me-2"></i>Obat yang Diberikan
        </div>
    `;

  if (medicines.length > 0) {
    medicines.forEach((med, index) => {
      html += `
                <div class="medicine-item">
                    <div class="row align-items-center">
                        <div class="col-md-4">
                            <h6 class="mb-1">${med.nama_obat}</h6>
                            <span class="badge bg-secondary">${
                              med.bentuk_obat
                            }</span>
                        </div>
                        <div class="col-md-3">
                            <div class="info-label">Signa</div>
                            <div class="info-value">${med.signa}</div>
                        </div>
                        <div class="col-md-2 text-center">
                            <div class="info-label">Jumlah</div>
                            <div class="info-value"><strong>${
                              med.jumlah
                            }</strong></div>
                        </div>
                        <div class="col-md-3 text-end">
                            <div class="info-label">Harga Satuan</div>
                            <div class="info-value small text-muted">${pembukuanFormatRupiah(
                              med.harga_satuan
                            )}</div>
                            <div class="info-label mt-2">Subtotal</div>
                            <div class="info-value text-success fw-bold">${pembukuanFormatRupiah(
                              med.subtotal
                            )}</div>
                        </div>
                    </div>
                </div>
            `;
    });

    html += `
            <div class="card bg-light mt-3">
                <div class="card-body">
                    <div class="row">
                        <div class="col-md-8 text-end">
                            <strong>Total Harga Obat:</strong>
                        </div>
                        <div class="col-md-4 text-end">
                            <h5 class="text-success mb-0">${pembukuanFormatRupiah(
                              totalObat
                            )}</h5>
                        </div>
                    </div>
                </div>
            </div>
        `;
  } else {
    html +=
      '<p class="text-muted text-center py-3">Tidak ada obat yang diberikan</p>';
  }

  html += `
        <div class="section-header">
            <i class="fas fa-money-bill-wave me-2"></i>Informasi Pembayaran
        </div>
        <div class="card bg-primary text-white">
            <div class="card-body">
                <div class="row align-items-center">
                    <div class="col-md-6">
                        <h6 class="mb-1">Total Pembayaran</h6>
                        <p class="mb-0 small">Metode: ${
                          payment.metode || "-"
                        }</p>
                        <p class="mb-0 small">Tanggal: ${
                          pembukuanFormatDate(payment.tanggal) || "-"
                        }</p>
                    </div>
                    <div class="col-md-6 text-end">
                        <h3 class="mb-0">${pembukuanFormatRupiah(
                          payment.total
                        )}</h3>
                    </div>
                </div>
            </div>
        </div>
    `;

  patientDetailBody.innerHTML = html;
}

function showInfoBannerForDateRange(startDate, endDate) {
  const contentWrapper = document.getElementById("content-wrapper");
  if (!contentWrapper) return;

  const existingBanner = document.getElementById("dateInfoBanner");
  if (existingBanner) {
    existingBanner.remove();
  }

  const today = new Date().toISOString().split("T")[0];
  const isToday = startDate === today && endDate === today;

  const banner = document.createElement("div");
  banner.id = "dateInfoBanner";

  if (isToday) {
    banner.className = "alert alert-info alert-dismissible fade show mx-3 mb-3";
    banner.style.cssText = "border-left: 4px solid #0891b2;";
    banner.innerHTML = `
            <div class="d-flex align-items-center">
                <i class="fas fa-info-circle me-3" style="font-size: 1.5rem;"></i>
                <div>
                    <strong>Menampilkan data hari ini (${pembukuanFormatDate(
                      today
                    )})</strong>
                    <p class="mb-0 small">Gunakan filter tanggal di bawah untuk melihat data periode lain</p>
                </div>
            </div>
            <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
        `;
  } else {
    banner.className =
      "alert alert-success alert-dismissible fade show mx-3 mb-3";
    banner.style.cssText = "border-left: 4px solid #10b981;";
    banner.innerHTML = `
            <div class="d-flex align-items-center">
                <i class="fas fa-filter me-3" style="font-size: 1.5rem;"></i>
                <div>
                    <strong>Menampilkan data periode: ${pembukuanFormatDate(
                      startDate
                    )} - ${pembukuanFormatDate(endDate)}</strong>
                    <p class="mb-0 small">Filter aktif. Klik "Reset" untuk kembali ke data hari ini</p>
                </div>
            </div>
            <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
        `;
  }

  const content = document.getElementById("content");
  if (content && content.firstChild) {
    const containerFluid = content.firstChild;
    const titleSection = containerFluid.firstChild;

    if (titleSection && titleSection.nextSibling) {
      containerFluid.insertBefore(banner, titleSection.nextSibling);
    } else if (titleSection) {
      containerFluid.appendChild(banner);
    }
  }
}

function pembukuanFormatRupiah(angka) {
  const number = parseFloat(angka);
  if (isNaN(number)) return "Rp 0";

  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(number);
}

function pembukuanFormatDate(dateString) {
  if (!dateString || dateString === "-") return "-";

  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;

    return new Intl.DateTimeFormat("id-ID", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }).format(date);
  } catch (e) {
    console.error("Date format error:", e);
    return dateString;
  }
}

async function pembukuanCetakPDF() {
  try {
    console.log("📄 Starting PDF generation...");

    // ✅ CHECK if jsPDF is loaded, if not, wait or reload
    if (typeof window.jspdf === "undefined") {
      console.warn("⚠️ jsPDF not loaded yet, attempting to reload...");

      // Try to reload the script
      await new Promise((resolve, reject) => {
        const script = document.createElement("script");
        script.src =
          "https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js";
        script.onload = () => {
          console.log("✅ jsPDF loaded successfully");
          resolve();
        };
        script.onerror = () => {
          reject(new Error("Failed to load jsPDF library"));
        };
        document.head.appendChild(script);
      });

      // Also load autoTable if needed
      if (
        typeof window.jspdf === "undefined" ||
        !window.jspdf.jsPDF.API.autoTable
      ) {
        await new Promise((resolve, reject) => {
          const script = document.createElement("script");
          script.src =
            "https://cdnjs.cloudflare.com/ajax/libs/jspdf-autotable/3.5.31/jspdf.plugin.autotable.min.js";
          script.onload = () => {
            console.log("✅ jsPDF autoTable loaded successfully");
            resolve();
          };
          script.onerror = () => {
            reject(new Error("Failed to load jsPDF autoTable"));
          };
          document.head.appendChild(script);
        });
      }
    }

    // Show loading indicator
    showTemporaryMessage("Generating PDF...", "info");

    // Get filtered data
    const startDate = document.getElementById("startDate")?.value;
    const endDate = document.getElementById("endDate")?.value;
    const dokterId = localStorage.getItem("id_dokter");

    if (!dokterId) {
      alert("Doctor ID not found. Please login again.");
      return;
    }

    // Fetch data from API
    const url =
      window.PEMBUKUAN_API_URL +
      "?action=filter_pembukuan&start_date=" +
      startDate +
      "&end_date=" +
      endDate +
      "&dokter_id=" +
      dokterId;

    const response = await fetch(url, {
      method: "GET",
      credentials: "same-origin",
      headers: { Accept: "application/json" },
    });

    const result = await response.json();

    if (!result.success || !result.data || result.data.length === 0) {
      alert("Tidak ada data untuk dicetak pada periode yang dipilih");
      return;
    }

    // Get doctor info
    const doctorInfo = await getDoctorInfo(dokterId);

    // Generate PDF
    await generatePembukuanPDF(result.data, startDate, endDate, doctorInfo);

    showTemporaryMessage("PDF berhasil dibuat!", "success");
  } catch (error) {
    console.error("❌ Error generating PDF:", error);
    alert("Gagal membuat PDF: " + error.message);
  }
}

async function getDoctorInfo(dokterId) {
  try {
    console.log("========================================");
    console.log("🔍 GET DOCTOR INFO FUNCTION");
    console.log("========================================");
    console.log("   Doctor ID:", dokterId);

    const url = `../API/pembukuan_api.php?action=get_doctor_info&dokter_id=${dokterId}`;
    console.log("   URL:", url);

    const response = await fetch(url, {
      method: "GET",
      credentials: "same-origin",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
    });

    console.log("   Response Status:", response.status);
    console.log("   Response OK:", response.ok);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const text = await response.text();
    console.log("   Raw Response (first 500 chars):", text.substring(0, 500));

    const result = JSON.parse(text);
    console.log("   Parsed Result:", result);

    if (result.success && result.data) {
      console.log("========================================");
      console.log("✅ DOCTOR INFO LOADED FROM DATABASE:");
      console.log("========================================");
      console.log("   nama_lengkap:", result.data.nama_lengkap);
      console.log("   nama_faskes:", result.data.nama_faskes);
      console.log("   no_str:", result.data.no_str);
      console.log("   no_telp:", result.data.no_telp);
      console.log("   alamat:", result.data.alamat);
      console.log("   spesialisasi:", result.data.spesialisasi);
      console.log("   avatar_url:", result.data.avatar_url);
      console.log("========================================");

      return result.data;
    } else {
      console.warn("⚠️ API returned success: false or no data");
      console.warn("   Message:", result.message);
      throw new Error(result.message || "No data returned");
    }
  } catch (error) {
    console.error("========================================");
    console.error("❌ ERROR GETTING DOCTOR INFO");
    console.error("========================================");
    console.error("   Error:", error.message);
    console.error("   Stack:", error.stack);
    console.error("========================================");
    console.error("⚠️ USING FALLBACK DATA");
    console.error("========================================");

    // Return fallback data
    return {
      nama_lengkap: "Klinik MAPOTEK",
      nama_faskes: "Praktik Umum",
      no_str: "-",
      alamat: "Jl. Kesehatan No. 1",
      no_telp: "(0123) 456-7890",
      spesialisasi: "Praktik Umum",
      avatar_url: null,
    };
  }
}

async function generatePembukuanPDF(data, startDate, endDate, doctorInfo) {
  try {
    console.log("====================================");
    console.log("📄 GENERATING PDF WITH DOCTOR INFO:");
    console.log("====================================");
    console.log("👤 nama_lengkap:", doctorInfo.nama_lengkap);
    console.log("🏥 nama_faskes:", doctorInfo.nama_faskes);
    console.log("📞 no_telp:", doctorInfo.no_telp);
    console.log("🏠 alamat:", doctorInfo.alamat);
    console.log("🖼️ avatar_url:", doctorInfo.avatar_url);
    console.log("====================================");

    // ✅ VERIFY jsPDF is available
    if (
      typeof window.jspdf === "undefined" ||
      typeof window.jspdf.jsPDF === "undefined"
    ) {
      throw new Error("jsPDF library not loaded. Please refresh the page.");
    }

    // Initialize jsPDF
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF("landscape", "mm", "a4");

    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 15;
    let currentY = margin;

    // ===================================
    // KOP SURAT - LOGO LEFT + AVATAR RIGHT
    // ===================================

    console.log("🖼️ Building header with logo and avatar...");

    // ========================================
    // 1️⃣ LEFT SIDE: MAPOTEK LOGO
    // ========================================
    let mapotekLogoLoaded = false;

    try {
      const logoPath = "../../../logo/Logo_Mapotek.png";
      console.log("   📌 Loading MAPOTEK logo from:", logoPath);

      await new Promise((resolve, reject) => {
        const img = new Image();

        img.onload = () => {
          console.log("   ✅ MAPOTEK Logo loaded successfully");
          try {
            const canvas = document.createElement("canvas");
            canvas.width = img.width;
            canvas.height = img.height;
            const ctx = canvas.getContext("2d");
            ctx.drawImage(img, 0, 0);
            const base64 = canvas.toDataURL("image/png");

            // ✅ Place logo on LEFT (at margin position)
            doc.addImage(base64, "PNG", margin, currentY, 20, 20);
            mapotekLogoLoaded = true;
            console.log("   ✅ MAPOTEK Logo added to PDF (LEFT)");
            resolve();
          } catch (err) {
            console.error("   ❌ Canvas error:", err);
            reject(err);
          }
        };

        img.onerror = (err) => {
          console.warn("   ⚠️ Could not load MAPOTEK logo");
          reject(err);
        };

        img.src = logoPath;
      });
    } catch (logoError) {
      console.warn("   ⚠️ MAPOTEK logo failed, using fallback");

      // Fallback: Circle with 'M' initial
      doc.setFillColor(6, 95, 70);
      doc.circle(margin + 10, currentY + 10, 10, "F");
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      doc.text("M", margin + 7.5, currentY + 12.5);
      mapotekLogoLoaded = true;
    }

    // ========================================
    // 2️⃣ RIGHT SIDE: DOCTOR AVATAR
    // ========================================
    let doctorAvatarLoaded = false;
    const avatarX = pageWidth - margin - 20; // 20mm from right edge

    if (doctorInfo.avatar_url && doctorInfo.avatar_url !== "") {
      try {
        console.log("   👤 Loading Doctor avatar from:", doctorInfo.avatar_url);

        await new Promise((resolve, reject) => {
          const img = new Image();
          img.crossOrigin = "anonymous";

          img.onload = () => {
            console.log("   ✅ Doctor avatar loaded successfully");
            try {
              const canvas = document.createElement("canvas");
              canvas.width = img.width;
              canvas.height = img.height;
              const ctx = canvas.getContext("2d");
              ctx.drawImage(img, 0, 0);
              const base64 = canvas.toDataURL("image/jpeg");

              // ✅ Place avatar on RIGHT
              doc.addImage(base64, "JPEG", avatarX, currentY, 20, 20);
              doctorAvatarLoaded = true;
              console.log("   ✅ Doctor avatar added to PDF (RIGHT)");
              resolve();
            } catch (err) {
              console.error("   ❌ Canvas error:", err);
              reject(err);
            }
          };

          img.onerror = (err) => {
            console.error("   ❌ Avatar load error:", err);
            reject(err);
          };

          img.src = doctorInfo.avatar_url;
        });
      } catch (avatarError) {
        console.warn("   ⚠️ Could not load doctor avatar");
      }
    }

    // Fallback for doctor avatar: Circle with initial
    if (!doctorAvatarLoaded) {
      console.log("   ℹ️ Using fallback circle for doctor");
      doc.setFillColor(102, 126, 234);
      doc.circle(avatarX + 10, currentY + 10, 10, "F");
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      const initial = (doctorInfo.nama_lengkap || "D").charAt(0).toUpperCase();
      doc.text(initial, avatarX + 7.5, currentY + 12.5);
    }

    // ========================================
    // 3️⃣ CENTER: CLINIC/DOCTOR INFO
    // ========================================

    doc.setTextColor(0, 0, 0);
    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    // Position text BETWEEN logo and avatar
    doc.text(doctorInfo.nama_faskes || "KLINIK", margin + 25, currentY + 8);

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(100, 100, 100);
    doc.text(doctorInfo.nama_lengkap || "-", margin + 25, currentY + 14);

    // ========================================
    // 4️⃣ FAR RIGHT: CONTACT INFO (next to avatar)
    // ========================================

    doc.setFontSize(9);
    doc.setTextColor(80, 80, 80);
    const contactX = avatarX - 75; // Position contact info to the left of avatar

    doc.text(`Telp: ${doctorInfo.no_telp || "-"}`, contactX, currentY + 6);

    const alamatText = doctorInfo.alamat || "Alamat tidak tersedia";
    const alamatLines = doc.splitTextToSize(alamatText, 65);
    doc.text(alamatLines, contactX, currentY + 11);

    // Line separator
    currentY += 25;
    doc.setDrawColor(6, 95, 70);
    doc.setLineWidth(0.8);
    doc.line(margin, currentY, pageWidth - margin, currentY);

    currentY += 2;
    doc.setLineWidth(0.3);
    doc.line(margin, currentY, pageWidth - margin, currentY);

    currentY += 10;

    // ===================================
    // ✅ DOCUMENT TITLE
    // ===================================

    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(0, 0, 0);

    const title = `LAPORAN PEMBUKUAN ${(
      doctorInfo.nama_faskes ||
      doctorInfo.nama_lengkap ||
      "KLINIK"
    ).toUpperCase()}`;
    doc.text(title, pageWidth / 2, currentY, { align: "center" });

    currentY += 8;

    // Date Range
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(60, 60, 60);
    const dateRangeText = `Periode: ${pembukuanFormatDate(
      startDate
    )} s/d ${pembukuanFormatDate(endDate)}`;
    doc.text(dateRangeText, pageWidth / 2, currentY, { align: "center" });

    currentY += 10;

    // ... REST OF THE PDF CODE (summary, table, signature) stays the same ...

    // ===================================
    // SUMMARY BOX
    // ===================================

    let totalPemasukan = 0;
    let totalPengeluaran = 0;

    data.forEach((item) => {
      totalPemasukan += parseFloat(item.pemasukan || 0);
      totalPengeluaran += parseFloat(item.pengeluaran || 0);
    });

    const totalProfit = totalPemasukan - totalPengeluaran;

    doc.setFillColor(248, 249, 252);
    doc.roundedRect(margin, currentY, pageWidth - 2 * margin, 25, 2, 2, "F");

    const summaryY = currentY + 8;
    const colWidth = (pageWidth - 2 * margin) / 3;

    doc.setFontSize(9);
    doc.setTextColor(100, 100, 100);
    doc.setFont("helvetica", "bold");

    doc.text("TOTAL PEMASUKAN", margin + 10, summaryY);
    doc.setFontSize(12);
    doc.setTextColor(28, 200, 138);
    doc.text(pembukuanFormatRupiah(totalPemasukan), margin + 10, summaryY + 7);

    doc.setFontSize(9);
    doc.setTextColor(100, 100, 100);
    doc.text("TOTAL PENGELUARAN", margin + colWidth + 10, summaryY);
    doc.setFontSize(12);
    doc.setTextColor(231, 74, 59);
    doc.text(
      pembukuanFormatRupiah(totalPengeluaran),
      margin + colWidth + 10,
      summaryY + 7
    );

    doc.setFontSize(9);
    doc.setTextColor(100, 100, 100);
    doc.text("TOTAL PROFIT", margin + 2 * colWidth + 10, summaryY);
    doc.setFontSize(12);
    doc.setTextColor(
      totalProfit >= 0 ? 28 : 231,
      totalProfit >= 0 ? 200 : 74,
      totalProfit >= 0 ? 138 : 59
    );
    doc.text(
      pembukuanFormatRupiah(totalProfit),
      margin + 2 * colWidth + 10,
      summaryY + 7
    );

    currentY += 32;

    // ... (TABLE AND REST OF PDF CODE - keep as is from document 4)

    const tableData = data.map((item, index) => {
      return [
        index + 1,
        pembukuanFormatDate(item.tanggal),
        pembukuanFormatRupiah(item.pemasukan),
        pembukuanFormatRupiah(item.pengeluaran),
        pembukuanFormatRupiah(item.saldo),
      ];
    });

    tableData.push([
      {
        content: "TOTAL",
        colSpan: 2,
        styles: { fontStyle: "bold", halign: "right" },
      },
      {
        content: pembukuanFormatRupiah(totalPemasukan),
        styles: { fontStyle: "bold", textColor: [28, 200, 138] },
      },
      {
        content: pembukuanFormatRupiah(totalPengeluaran),
        styles: { fontStyle: "bold", textColor: [231, 74, 59] },
      },
      {
        content: pembukuanFormatRupiah(totalProfit),
        styles: {
          fontStyle: "bold",
          textColor: totalProfit >= 0 ? [28, 200, 138] : [231, 74, 59],
        },
      },
    ]);

    doc.autoTable({
      startY: currentY,
      head: [
        ["No", "Tanggal", "Total Pemasukan", "Total Pengeluaran", "Saldo"],
      ],
      body: tableData,
      theme: "grid",
      headStyles: {
        fillColor: [6, 95, 70],
        textColor: [255, 255, 255],
        fontSize: 10,
        fontStyle: "bold",
        halign: "center",
      },
      bodyStyles: {
        fontSize: 9,
        textColor: [50, 50, 50],
      },
      columnStyles: {
        0: { halign: "center", cellWidth: 15 },
        1: { halign: "left", cellWidth: 40 },
        2: { halign: "right" },
        3: { halign: "right" },
        4: { halign: "right" },
      },
      alternateRowStyles: {
        fillColor: [248, 249, 252],
      },
      margin: { left: margin, right: margin },
      tableWidth: "auto",
      didDrawPage: function (data) {
        const footerY = pageHeight - 15;
        doc.setFontSize(8);
        doc.setTextColor(150, 150, 150);
        doc.setFont("helvetica", "normal");

        const now = new Date();
        const generatedDate = now.toLocaleDateString("id-ID", {
          day: "2-digit",
          month: "long",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        });
        doc.text(`Dicetak: ${generatedDate}`, margin, footerY);

        const pageText = `Halaman ${
          doc.internal.getCurrentPageInfo().pageNumber
        }`;
        doc.text(pageText, pageWidth - margin, footerY, { align: "right" });

        doc.text(
          "MAPOTEK - Medical Practice Management System",
          pageWidth / 2,
          footerY,
          { align: "center" }
        );
      },
    });

    // ===================================
    // SIGNATURE SECTION
    // ===================================

    const finalY = doc.lastAutoTable.finalY + 20;

    if (finalY < pageHeight - 60) {
      const signatureY = finalY;
      const signatureX = pageWidth - margin - 60;

      doc.setFontSize(10);
      doc.setTextColor(0, 0, 0);
      doc.setFont("helvetica", "normal");

      const now = new Date();
      const currentDate = now.toLocaleDateString("id-ID", {
        day: "2-digit",
        month: "long",
        year: "numeric",
      });

      doc.text(`Jember, ${currentDate}`, signatureX, signatureY);
      doc.text("Penanggung Jawab", signatureX, signatureY + 6);

      doc.setDrawColor(200, 200, 200);
      doc.setLineWidth(0.1);
      doc.line(signatureX, signatureY + 30, signatureX + 50, signatureY + 30);

      doc.setFont("helvetica", "bold");
      doc.text(
        doctorInfo.nama_lengkap || "Nama Dokter",
        signatureX,
        signatureY + 36
      );
    }

    // ===================================
    // SAVE PDF - SIMPLE VERSION
    // ===================================

    // ✅ Clean doctor name
    const doctorName = (
      doctorInfo.nama_lengkap ||
      doctorInfo.nama_faskes ||
      "Dokter"
    )
      .replace(/[^a-zA-Z0-9\s]/g, "")
      .replace(/\s+/g, "_")
      .toUpperCase();

    // ✅ Build filename
    const fileName = `MAPOTEK_Pembukuan_${doctorName}_${startDate}_${endDate}.pdf`;

    console.log("💾 Saving PDF as:", fileName);

    // ✅ Save with jsPDF (this should work)
    doc.save(fileName);

    console.log("✅ PDF save command executed");
    console.log("📁 Check your browser Downloads folder");
  } catch (error) {
    console.error("❌ Error in generatePembukuanPDF:", error);
    throw error;
  }
}

async function pembukuanExportToExcel() {
  try {
    console.log("📊 Starting Excel export...");

    showTemporaryMessage("Generating Excel...", "info");

    const startDate = document.getElementById("startDate")?.value;
    const endDate = document.getElementById("endDate")?.value;
    const dokterId = localStorage.getItem("id_dokter");

    if (!dokterId) {
      alert("Doctor ID not found. Please login again.");
      return;
    }

    // Fetch data
    const url =
      window.PEMBUKUAN_API_URL +
      "?action=filter_pembukuan&start_date=" +
      startDate +
      "&end_date=" +
      endDate +
      "&dokter_id=" +
      dokterId;

    const response = await fetch(url, {
      method: "GET",
      credentials: "same-origin",
      headers: { Accept: "application/json" },
    });

    const result = await response.json();

    if (!result.success || !result.data || result.data.length === 0) {
      alert("Tidak ada data untuk diekspor pada periode yang dipilih");
      return;
    }

    // Get doctor info
    const doctorInfo = await getDoctorInfo(dokterId);

    // Create workbook
    const wb = XLSX.utils.book_new();

    // Prepare data
    let totalPemasukan = 0;
    let totalPengeluaran = 0;

    const excelData = result.data.map((item, index) => {
      totalPemasukan += parseFloat(item.pemasukan || 0);
      totalPengeluaran += parseFloat(item.pengeluaran || 0);

      return {
        No: index + 1,
        Tanggal: pembukuanFormatDate(item.tanggal),
        "Total Pemasukan": parseFloat(item.pemasukan || 0),
        "Total Pengeluaran": parseFloat(item.pengeluaran || 0),
        Saldo: parseFloat(item.saldo || 0),
      };
    });

    // Add totals
    excelData.push({
      No: "",
      Tanggal: "TOTAL",
      "Total Pemasukan": totalPemasukan,
      "Total Pengeluaran": totalPengeluaran,
      Saldo: totalPemasukan - totalPengeluaran,
    });

    // Create worksheet
    const ws = XLSX.utils.json_to_sheet(excelData);

    // Set column widths
    ws["!cols"] = [
      { wch: 5 }, // No
      { wch: 15 }, // Tanggal
      { wch: 20 }, // Pemasukan
      { wch: 20 }, // Pengeluaran
      { wch: 20 }, // Saldo
    ];

    // Add worksheet to workbook
    XLSX.utils.book_append_sheet(wb, ws, "Pembukuan");

    // Generate file
    const fileName = `Pembukuan_${startDate}_${endDate}_${new Date().getTime()}.xlsx`;
    XLSX.writeFile(wb, fileName);

    showTemporaryMessage("Excel berhasil dibuat!", "success");
    console.log("✅ Excel generated successfully:", fileName);
  } catch (error) {
    console.error("❌ Error generating Excel:", error);
    alert("Gagal membuat Excel: " + error.message);
  }
}

function pembukuanExportToExcel() {
  alert("Fitur export Excel akan segera tersedia");
}
