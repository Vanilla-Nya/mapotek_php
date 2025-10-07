// Antrian Fragment
class AntrianFragment {
    constructor() {
        this.title = 'Antrian';
        this.icon = 'bi-clock-history';
    }

    render() {
        return `
            <div>
                <h2>Antrian Pasien</h2>
                <p class="text-muted">Kelola antrian pasien</p>
                
                <div class="card shadow-sm border-0 mt-4">
                    <div class="card-body">
                        <div class="text-center py-5">
                            <i class="bi bi-clock-history fs-1 text-muted"></i>
                            <p class="text-muted mt-3">Fitur antrian akan segera hadir</p>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    async onInit() {
        console.log('Antrian initialized');
    }

    onDestroy() {
        console.log('Antrian fragment destroyed');
    }
}