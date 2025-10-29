// Pembukuan Fragment
class PembukuanFragment {
    constructor() {
        this.title = 'Pembukuan';
        this.icon = 'bi-journal-text';
    }

    render() {
        return `
        <div id="content-wrapper" class="d-flex flex-column">
      <div id="content">
        <!-- Topbar -->
        <nav class="navbar navbar-expand navbar-light bg-white topbar mb-4 static-top shadow">

          <!-- Sidebar Toggle -->
          <button class="btn btn-link d-md-none rounded-circle me-3" id="sidebarToggleTop">
            <i class="fa fa-bars"></i>
          </button>

          <!-- Search -->
          <form class="d-none d-sm-inline-block form-inline ms-auto me-md-3 my-2 my-md-0 mw-100 navbar-search">
            <div class="input-group">
              <input type="text" class="form-control bg-light border-0 small" placeholder="Search for..."
                aria-label="Search">
              <button class="btn btn-primary" type="button"><i class="fas fa-search fa-sm"></i></button>
            </div>
          </form>
        </nav>
        <!-- End Topbar -->

        <!-- Begin Page Content -->
        <div class="container-fluid">
          <h1 class="h3 mb-4 text-gray-800">Pembukuan Harian</h1>

          <!-- Cards -->
          <div class="row">
            <div class="col-xl-4 col-md-6 mb-4">
              <div class="card border-start-success shadow h-100 py-2">
                <div class="card-body">
                  <div class="d-flex justify-content-between align-items-center">
                    <div>
                      <div class="text-xs fw-bold text-success text-uppercase mb-1">Total Pemasukan</div>
                      <div class="h5 mb-0 fw-bold text-gray-800" id="totalMasuk">Rp 0</div>
                    </div>
                    <i class="fas fa-arrow-up fa-2x text-success"></i>
                  </div>
                </div>
              </div>
            </div>

            <div class="col-xl-4 col-md-6 mb-4">
              <div class="card border-start-danger shadow h-100 py-2">
                <div class="card-body">
                  <div class="d-flex justify-content-between align-items-center">
                    <div>
                      <div class="text-xs fw-bold text-danger text-uppercase mb-1">Total Pengeluaran</div>
                      <div class="h5 mb-0 fw-bold text-gray-800" id="totalKeluar">Rp 0</div>
                    </div>
                    <i class="fas fa-arrow-down fa-2x text-danger"></i>
                  </div>
                </div>
              </div>
            </div>

            <div class="col-xl-4 col-md-6 mb-4">
              <div class="card border-start-primary shadow h-100 py-2">
                <div class="card-body">
                  <div class="d-flex justify-content-between align-items-center">
                    <div>
                      <div class="text-xs fw-bold text-primary text-uppercase mb-1">Saldo Akhir</div>
                      <div class="h5 mb-0 fw-bold text-gray-800" id="totalSaldo">Rp 0</div>
                    </div>
                    <i class="fas fa-wallet fa-2x text-primary"></i>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Filter -->
          <div class="card shadow mb-4">
            <div class="card-body">
              <div class="row g-3">
                <div class="col-md-3">
                  <label class="form-label">Dari Tanggal</label>
                  <input type="date" id="startDate" class="form-control">
                </div>
                <div class="col-md-3">
                  <label class="form-label">Sampai Tanggal</label>
                  <input type="date" id="endDate" class="form-control">
                </div>
                <div class="col-md-3 align-self-end">
                  <button class="btn btn-primary w-100" onclick="filterData()">Filter</button>
                </div>
                <div class="col-md-3 align-self-end">
                  <button class="btn btn-success w-100" onclick="cetakPDF()">Cetak PDF</button>
                </div>
              </div>
            </div>
          </div>

          <div class="mb-4 text-end">
            <button class="btn btn-info" data-bs-toggle="modal" data-bs-target="#tambahModal">
              + Tambah Pembukuan Manual
            </button>
          </div>

          <div class="card shadow mb-4">
            <div class="card-header py-3">
              <h6 class="m-0 fw-bold text-primary">Data Pembukuan</h6>
            </div>
            <div class="card-body">
              <div class="table-responsive">
                <table class="table table-bordered" id="tabelPembukuan" width="100%">
                  <thead class="table-dark">
                    <tr>
                      <th>Tanggal</th>
                      <th>Total Masuk</th>
                      <th>Total Keluar</th>
                      <th>Saldo Akhir</th>
                      <th>Detail</th>
                    </tr>
                  </thead>
                  <tbody id="pembukuanBody"></tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        <!-- Modal Tambah -->
        <div class="modal fade" id="tambahModal" tabindex="-1" aria-labelledby="tambahModalLabel" aria-hidden="true">
          <div class="modal-dialog">
            <div class="modal-content">
              <div class="modal-header">
                <h5 class="modal-title" id="tambahModalLabel">Tambah Pembukuan Manual</h5>
                <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
              </div>
              <div class="modal-body">
                <form id="formPembukuan">
                  <div class="mb-3">
                    <label class="form-label">Tanggal</label>
                    <input type="date" id="tanggal" class="form-control" required>
                  </div>
                  <div class="mb-3">
                    <label class="form-label">Total Masuk (Rp)</label>
                    <input type="number" id="masuk" class="form-control" placeholder="0" required>
                  </div>
                  <div class="mb-3">
                    <label class="form-label">Total Keluar (Rp)</label>
                    <input type="number" id="keluar" class="form-control" placeholder="0" required>
                  </div>
                  <button type="submit" class="btn btn-primary w-100">Simpan</button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>

      <footer class="sticky-footer bg-white py-3">
        <div class="container my-auto text-center">
          <span>Copyright &copy; Your Website 2025</span>
        </div>
      </footer>
    </div>
        `;
    }

    async onInit() {
        console.log('Pembukuan initialized');
    }

    onDestroy() {
        console.log('Pembukuan fragment destroyed');
    }
}