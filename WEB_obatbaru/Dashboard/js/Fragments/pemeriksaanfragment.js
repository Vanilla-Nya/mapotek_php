// Pemeriksaan Fragment
class PemeriksaanFragment {
    constructor() {
        this.title = 'Pemeriksaan';
        this.icon = 'bi-heart-pulse';
    }

    render() {
        return `
            <div>
                <h2>Pemeriksaan</h2>
                <p class="text-muted">Data pemeriksaan pasien</p>
                
                <div class="card shadow-sm border-0 mt-4">
                    <div class="card-body">
                        <div class="text-center py-5">
                            <i class="bi bi-heart-pulse fs-1 text-muted"></i>
                            <p class="text-muted mt-3">Fitur pemeriksaan akan segera hadir</p>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    async onInit() {
        console.log('Pemeriksaan initialized');
    }

    onDestroy() {
        console.log('Pemeriksaan fragment destroyed');
    }
}