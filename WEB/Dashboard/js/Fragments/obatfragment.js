// Obat Fragment
class ObatFragment {
    constructor() {
        this.title = 'Obat';
        this.icon = 'bi-capsule';
    }

    render() {
        return `
            <div>
                <div class="d-flex justify-content-between align-items-center mb-4">
                    <div>
                        <h2 class="mb-1">Data Obat</h2>
                        <p class="text-muted mb-0">Kelola stok obat</p>
                    </div>
                    <button class="btn btn-primary" id="btnTambahObat">
                        <i class="bi bi-plus-circle me-2"></i>Tambah Obat
                    </button>
                </div>
                
                <div class="card shadow-sm border-0">
                    <div class="card-body">
                        <div class="text-center py-5">
                            <i class="bi bi-capsule fs-1 text-muted"></i>
                            <p class="text-muted mt-3">Fitur obat akan segera hadir</p>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    async onInit() {
        const btnTambah = document.getElementById('btnTambahObat');
        if (btnTambah) {
            btnTambah.addEventListener('click', () => {
                alert('Tambah obat');
            });
        }
    }

    onDestroy() {
        console.log('Obat fragment destroyed');
    }
}