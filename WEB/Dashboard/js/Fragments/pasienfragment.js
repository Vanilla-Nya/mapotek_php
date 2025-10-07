// Pasien Fragment
class PasienFragment {
    constructor() {
        this.title = 'Pasien';
        this.icon = 'bi-people';
        this.pasienList = [];
    }

    render() {
        return `
            <div>
                <div class="d-flex justify-content-between align-items-center mb-4">
                    <div>
                        <h2 class="mb-1">Data Pasien</h2>
                        <p class="text-muted mb-0">Kelola data pasien</p>
                    </div>
                    <button class="btn btn-primary" id="btnTambahPasien">
                        <i class="bi bi-plus-circle me-2"></i>Tambah Pasien
                    </button>
                </div>

                <!-- Search Bar -->
                <div class="card shadow-sm border-0 mb-4">
                    <div class="card-body">
                        <div class="row g-3">
                            <div class="col-md-8">
                                <input type="text" class="form-control" id="searchPasien" placeholder="Cari nama pasien...">
                            </div>
                            <div class="col-md-4">
                                <button class="btn btn-outline-primary w-100" id="btnSearchPasien">
                                    <i class="bi bi-search me-2"></i>Cari
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
                
                <!-- Pasien List -->
                <div class="card shadow-sm border-0">
                    <div class="card-body">
                        <div id="pasienList">
                            <div class="text-center py-5">
                                <div class="spinner-border text-primary" role="status">
                                    <span class="visually-hidden">Loading...</span>
                                </div>
                                <p class="text-muted mt-3">Memuat data pasien...</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    async onInit() {
        // Load data
        await this.loadPasienData();
        
        // Setup event listeners
        this.setupEventListeners();
    }

    async loadPasienData() {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Mock data
        this.pasienList = [
            { id: 1, nama: 'Budi Santoso', umur: 35, noTelp: '081234567890', alamat: 'Jember' },
            { id: 2, nama: 'Siti Aminah', umur: 28, noTelp: '081234567891', alamat: 'Jember' },
            { id: 3, nama: 'Ahmad Dahlan', umur: 42, noTelp: '081234567892', alamat: 'Bondowoso' },
        ];

        this.renderPasienList();
    }

    renderPasienList() {
        const container = document.getElementById('pasienList');
        if (!container) return;

        if (this.pasienList.length === 0) {
            container.innerHTML = `
                <div class="text-center py-5">
                    <i class="bi bi-people fs-1 text-muted"></i>
                    <p class="text-muted mt-3">Belum ada data pasien</p>
                </div>
            `;
            return;
        }

        container.innerHTML = `
            <div class="table-responsive">
                <table class="table table-hover">
                    <thead>
                        <tr>
                            <th>No</th>
                            <th>Nama</th>
                            <th>Umur</th>
                            <th>No. Telp</th>
                            <th>Alamat</th>
                            <th>Aksi</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${this.pasienList.map((pasien, index) => `
                            <tr>
                                <td>${index + 1}</td>
                                <td>${pasien.nama}</td>
                                <td>${pasien.umur} tahun</td>
                                <td>${pasien.noTelp}</td>
                                <td>${pasien.alamat}</td>
                                <td>
                                    <button class="btn btn-sm btn-outline-primary me-1" onclick="pasienFragment.editPasien(${pasien.id})">
                                        <i class="bi bi-pencil"></i>
                                    </button>
                                    <button class="btn btn-sm btn-outline-danger" onclick="pasienFragment.deletePasien(${pasien.id})">
                                        <i class="bi bi-trash"></i>
                                    </button>
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        `;
    }

    setupEventListeners() {
        const btnTambah = document.getElementById('btnTambahPasien');
        const btnSearch = document.getElementById('btnSearchPasien');
        const searchInput = document.getElementById('searchPasien');

        if (btnTambah) {
            btnTambah.addEventListener('click', () => this.tambahPasien());
        }

        if (btnSearch) {
            btnSearch.addEventListener('click', () => this.searchPasien());
        }

        if (searchInput) {
            searchInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') this.searchPasien();
            });
        }
    }

    tambahPasien() {
        alert('Form tambah pasien akan muncul di sini');
        // You can show a modal or navigate to form
    }

    editPasien(id) {
        alert(`Edit pasien ID: ${id}`);
    }

    deletePasien(id) {
        if (confirm('Yakin ingin menghapus pasien ini?')) {
            this.pasienList = this.pasienList.filter(p => p.id !== id);
            this.renderPasienList();
        }
    }

    searchPasien() {
        const query = document.getElementById('searchPasien').value;
        alert(`Mencari: ${query}`);
    }

    onDestroy() {
        console.log('Pasien fragment destroyed');
    }
}

// Make instance available globally for onclick handlers
const pasienFragment = new PasienFragment();