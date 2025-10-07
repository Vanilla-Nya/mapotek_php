// Dashboard Fragment
class DashboardFragment {
    constructor() {
        this.title = 'Dashboard';
        this.icon = 'bi-house-door';
    }

    render() {
        return `
            <div>
                <h2>Selamat Datang di Mapotek</h2>
                <p class="text-muted">Sistem informasi manajemen praktik dokter</p>
                
                <div class="row g-4 mt-3">
                    <div class="col-md-4 stagger-item">
                        <div class="card shadow-sm border-0">
                            <div class="card-body">
                                <div class="d-flex align-items-center mb-3">
                                    <div class="rounded-circle bg-primary bg-opacity-10 p-3">
                                        <i class="bi bi-people fs-3 text-primary"></i>
                                    </div>
                                </div>
                                <h5 class="card-title text-muted">Total Pasien</h5>
                                <p class="display-4 text-primary fw-bold mb-0" id="totalPasien">0</p>
                            </div>
                        </div>
                    </div>
                    
                    <div class="col-md-4 stagger-item">
                        <div class="card shadow-sm border-0">
                            <div class="card-body">
                                <div class="d-flex align-items-center mb-3">
                                    <div class="rounded-circle bg-success bg-opacity-10 p-3">
                                        <i class="bi bi-clock-history fs-3 text-success"></i>
                                    </div>
                                </div>
                                <h5 class="card-title text-muted">Antrian Hari Ini</h5>
                                <p class="display-4 text-success fw-bold mb-0" id="antrianHariIni">0</p>
                            </div>
                        </div>
                    </div>
                    
                    <div class="col-md-4 stagger-item">
                        <div class="card shadow-sm border-0">
                            <div class="card-body">
                                <div class="d-flex align-items-center mb-3">
                                    <div class="rounded-circle bg-warning bg-opacity-10 p-3">
                                        <i class="bi bi-capsule fs-3 text-warning"></i>
                                    </div>
                                </div>
                                <h5 class="card-title text-muted">Stok Obat</h5>
                                <p class="display-4 text-warning fw-bold mb-0" id="stokObat">0</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    async onInit() {
        // Animate numbers
        this.animateNumber('totalPasien', 0, 156, 1000);
        this.animateNumber('antrianHariIni', 0, 23, 1000);
        this.animateNumber('stokObat', 0, 89, 1000);
    }

    animateNumber(elementId, start, end, duration) {
        const element = document.getElementById(elementId);
        if (!element) return;

        const range = end - start;
        const increment = range / (duration / 16);
        let current = start;

        const timer = setInterval(() => {
            current += increment;
            if (current >= end) {
                element.textContent = end;
                clearInterval(timer);
            } else {
                element.textContent = Math.floor(current);
            }
        }, 16);
    }

    onDestroy() {
        console.log('Dashboard fragment destroyed');
    }
}