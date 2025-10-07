// Pembukuan Fragment
class PembukuanFragment {
    constructor() {
        this.title = 'Pembukuan';
        this.icon = 'bi-journal-text';
    }

    render() {
        return `
            <div>
                <h2>Pembukuan</h2>
                <p class="text-muted">Laporan keuangan</p>
                
                <div class="card shadow-sm border-0 mt-4">
                    <div class="card-body">
                        <div class="text-center py-5">
                            <i class="bi bi-journal-text fs-1 text-muted"></i>
                            <p class="text-muted mt-3">Fitur pembukuan akan segera hadir</p>
                        </div>
                    </div>
                </div>
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