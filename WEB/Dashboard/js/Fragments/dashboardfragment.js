// Modern Medical Dashboard Fragment - Professional Healthcare Design
class DashboardFragment {
    constructor() {
        this.title = 'Dashboard';
        this.icon = 'bi-house-door';
        
        // Queue data
        this.queueData = [
            { no: 1, name: 'Adelfa', time: '08:00', status: 'Selesai', statusClass: 'success', type: 'Konsultasi' },
            { no: 2, name: 'Havanah', time: '09:30', status: 'Selesai', statusClass: 'success', type: 'Check-up' },
            { no: 3, name: 'Alkon', time: '10:00', status: 'Dalam Pemeriksaan', statusClass: 'info', type: 'Konsultasi' },
            { no: 4, name: 'Aldi', time: '10:30', status: 'Menunggu', statusClass: 'warning', type: 'Resep' },
            { no: 5, name: 'Budi', time: '11:00', status: 'Menunggu', statusClass: 'warning', type: 'Konsultasi' },
            { no: 6, name: 'Citra', time: '11:30', status: 'Menunggu', statusClass: 'warning', type: 'Check-up' },
            { no: 7, name: 'Dian', time: '12:00', status: 'Menunggu', statusClass: 'warning', type: 'Konsultasi' },
            { no: 8, name: 'Eko', time: '12:30', status: 'Menunggu', statusClass: 'warning', type: 'Resep' },
            { no: 9, name: 'Fani', time: '13:00', status: 'Menunggu', statusClass: 'warning', type: 'Check-up' },
            { no: 10, name: 'Gita', time: '13:30', status: 'Menunggu', statusClass: 'warning', type: 'Konsultasi' }
        ];

        // Graphics rotation state
        this.currentGraphicIndex = 0;
        this.graphicRotationTimer = null;
        this.charts = [];
        
        // Get current date info
        this.currentDate = new Date();
    }

    render() {
        this.injectStyles();
        
        const dateOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        const formattedDate = this.currentDate.toLocaleDateString('id-ID', dateOptions);
        
        return `
            <div class="dashboard-container">
                <!-- Welcome Header -->
                <div class="welcome-section mb-4">
                    <div class="row align-items-center">
                        <div class="col-lg-8">
                            <div class="welcome-content">
                                <div class="d-flex align-items-center mb-2">
                                    <div class="doctor-avatar me-3">
                                        <i class="bi bi-person-circle"></i>
                                    </div>
                                    <div>
                                        <h2 class="mb-1 fw-bold text-dark">Selamat Datang, Dr. Vanilla</h2>
                                        <p class="text-muted mb-0">
                                            <i class="bi bi-calendar-check me-2"></i>${formattedDate}
                                        </p>
                                    </div>
                                </div>
                                <div class="alert alert-info-custom mb-0" role="alert">
                                    <i class="bi bi-info-circle me-2"></i>
                                    Anda memiliki <strong>8 pasien</strong> dalam antrian hari ini
                                </div>
                            </div>
                        </div>
                        <div class="col-lg-4">
                            <div class="quick-actions">
                                <button class="btn btn-medical-primary me-2">
                                    <i class="bi bi-plus-circle me-2"></i>Pasien Baru
                                </button>
                                <button class="btn btn-medical-outline">
                                    <i class="bi bi-file-medical me-2"></i>Rekam Medis
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Stats Cards Row -->
                <div class="row g-3 mb-4">
                    <div class="col-lg-3 col-md-6">
                        <div class="stat-card stat-patients">
                            <div class="stat-icon">
                                <i class="bi bi-people-fill"></i>
                            </div>
                            <div class="stat-content">
                                <div class="stat-value" id="totalPatients">127</div>
                                <div class="stat-label">Total Pasien Bulan Ini</div>
                                <div class="stat-trend positive">
                                    <i class="bi bi-arrow-up"></i> 12% dari bulan lalu
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <div class="col-lg-3 col-md-6">
                        <div class="stat-card stat-queue">
                            <div class="stat-icon">
                                <i class="bi bi-clock-history"></i>
                            </div>
                            <div class="stat-content">
                                <div class="stat-value" id="queueToday">10</div>
                                <div class="stat-label">Antrian Hari Ini</div>
                                <div class="stat-trend neutral">
                                    <i class="bi bi-dash"></i> 2 selesai, 8 menunggu
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <div class="col-lg-3 col-md-6">
                        <div class="stat-card stat-medicine-warning">
                            <div class="stat-icon">
                                <i class="bi bi-exclamation-triangle-fill"></i>
                            </div>
                            <div class="stat-content">
                                <div class="stat-value" id="obatExpired">10</div>
                                <div class="stat-label">Obat Mendekati Expired</div>
                                <div class="stat-trend warning">
                                    <i class="bi bi-exclamation-circle"></i> Perlu perhatian
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <div class="col-lg-3 col-md-6">
                        <div class="stat-card stat-medicine-danger">
                            <div class="stat-icon">
                                <i class="bi bi-box-seam"></i>
                            </div>
                            <div class="stat-content">
                                <div class="stat-value" id="obatHabis">4</div>
                                <div class="stat-label">Stok Obat Menipis</div>
                                <div class="stat-trend danger">
                                    <i class="bi bi-arrow-down"></i> Segera restock
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Queue and QR Code Row - Same Height -->
                <div class="row g-4 mb-4">
                    <!-- Patient Queue Card -->
                    <div class="col-lg-8">
                        <div class="card medical-card h-100">
                            <div class="card-header-custom">
                                <div class="d-flex justify-content-between align-items-center">
                                    <div>
                                        <h5 class="mb-1">
                                            <i class="bi bi-clipboard2-pulse me-2"></i>Antrian Pasien Hari Ini
                                        </h5>
                                        <small class="text-muted">Kelola dan pantau antrian pasien</small>
                                    </div>
                                    <div class="queue-status">
                                        <span class="badge badge-success-soft">2 Selesai</span>
                                        <span class="badge badge-warning-soft">8 Menunggu</span>
                                    </div>
                                </div>
                            </div>
                            <div class="card-body p-0">
                                <div class="table-responsive queue-table-container">
                                    <table class="table table-hover queue-table mb-0">
                                        <thead>
                                            <tr>
                                                <th width="60">No.</th>
                                                <th>Nama Pasien</th>
                                                <th>Waktu</th>
                                                <th>Jenis</th>
                                                <th>Status</th>
                                                <th width="120" class="text-center">Aksi</th>
                                            </tr>
                                        </thead>
                                        <tbody id="queueTableBody">
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- QR Code Card - Same Height as Queue -->
                    <div class="col-lg-4">
                        <div class="card medical-card h-100">
                            <div class="card-header-custom text-center">
                                <h5 class="mb-1">
                                    <i class="bi bi-qr-code me-2"></i>Pendaftaran Online
                                </h5>
                                <small class="text-muted">Scan untuk daftar antrian</small>
                            </div>
                            <div class="card-body text-center d-flex flex-column justify-content-center">
                                <div class="qr-code-wrapper">
                                    <div class="qr-code-container">
                                        <img src="https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=https://mapotek.com/queue" 
                                             alt="QR Code Antrian" 
                                             class="qr-code-image">
                                    </div>
                                    <div class="qr-info mt-3">
                                        <p class="mb-2 fw-semibold text-dark">Klinik Dr. Vanilla</p>
                                        <p class="text-muted small mb-0">Pasien dapat scan QR code ini untuk mendaftar antrian secara online</p>
                                    </div>
                                </div>
                                <button class="btn btn-medical-outline w-100 mt-3">
                                    <i class="bi bi-download me-2"></i>Download QR Code
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Auto-Rotating Graphics Section - Full Width -->
                <div class="row g-4 mb-4">
                    <div class="col-12">
                        <div class="card medical-card">
                            <div class="card-header-custom">
                                <div class="d-flex justify-content-between align-items-center">
                                    <div>
                                        <h5 class="mb-1">
                                            <i class="bi bi-graph-up-arrow me-2"></i>
                                            <span id="graphicTitle">Statistik Kunjungan Pasien</span>
                                        </h5>
                                        <small class="text-muted">Data 12 bulan terakhir</small>
                                    </div>
                                    <div class="graphic-controls">
                                        <div class="graphic-indicators">
                                            <button class="indicator active" data-index="0" title="Grafik Pasien"></button>
                                            <button class="indicator" data-index="1" title="Grafik Keuangan"></button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div class="card-body chart-container-wrapper">
                                <!-- Graphic 1: Bar Chart -->
                                <div id="graphic1" class="graphic-container active">
                                    <canvas id="chart1"></canvas>
                                </div>
                                
                                <!-- Graphic 2: Line Chart -->
                                <div id="graphic2" class="graphic-container">
                                    <canvas id="chart2"></canvas>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Financial Summary Section - Full Width Below Chart -->
                <div class="row g-4">
                    <div class="col-12">
                        <div class="card medical-card">
                            <div class="card-header-custom">
                                <div class="d-flex justify-content-between align-items-center">
                                    <div>
                                        <h5 class="mb-1">
                                            <i class="bi bi-wallet2 me-2"></i>Ringkasan Keuangan
                                        </h5>
                                        <small class="text-muted">Bulan ini</small>
                                    </div>
                                    <button class="btn btn-icon" title="Lihat Detail">
                                        <i class="bi bi-three-dots-vertical"></i>
                                    </button>
                                </div>
                            </div>
                            <div class="card-body">
                                <div class="row g-3">
                                    <div class="col-md-4">
                                        <div class="financial-item income">
                                            <div class="d-flex justify-content-between align-items-center mb-2">
                                                <div class="d-flex align-items-center">
                                                    <div class="financial-icon income">
                                                        <i class="bi bi-arrow-down-circle"></i>
                                                    </div>
                                                    <span class="fw-semibold">Total Pendapatan</span>
                                                </div>
                                            </div>
                                            <div class="financial-amount income">Rp 32.500.000</div>
                                            <div class="financial-trend positive">
                                                <i class="bi bi-arrow-up"></i> 15% dari bulan lalu
                                            </div>
                                        </div>
                                    </div>

                                    <div class="col-md-4">
                                        <div class="financial-item expense">
                                            <div class="d-flex justify-content-between align-items-center mb-2">
                                                <div class="d-flex align-items-center">
                                                    <div class="financial-icon expense">
                                                        <i class="bi bi-arrow-up-circle"></i>
                                                    </div>
                                                    <span class="fw-semibold">Total Pengeluaran</span>
                                                </div>
                                            </div>
                                            <div class="financial-amount expense">Rp 7.200.000</div>
                                            <div class="financial-trend negative">
                                                <i class="bi bi-arrow-up"></i> 8% dari bulan lalu
                                            </div>
                                        </div>
                                    </div>

                                    <div class="col-md-4">
                                        <div class="financial-item profit">
                                            <div class="d-flex justify-content-between align-items-center mb-2">
                                                <div class="d-flex align-items-center">
                                                    <div class="financial-icon profit">
                                                        <i class="bi bi-graph-up"></i>
                                                    </div>
                                                    <span class="fw-bold">Laba Bersih</span>
                                                </div>
                                            </div>
                                            <div class="financial-amount profit">Rp 25.300.000</div>
                                            <div class="financial-trend positive">
                                                <i class="bi bi-trophy"></i> Target tercapai
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div class="text-center mt-4">
                                    <button class="btn btn-medical-primary">
                                        <i class="bi bi-file-earmark-bar-graph me-2"></i>Lihat Laporan Lengkap
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    injectStyles() {
        if (document.getElementById('dashboard-styles')) return;

        const styleElement = document.createElement('style');
        styleElement.id = 'dashboard-styles';
        styleElement.textContent = `
            :root {
                --medical-primary: #0D6EFD;
                --medical-primary-dark: #0854C1;
                --medical-secondary: #00BFA6;
                --medical-success: #10B981;
                --medical-warning: #F59E0B;
                --medical-danger: #EF4444;
                --medical-info: #06B6D4;
                --medical-light: #F8FAFC;
                --medical-dark: #1E293B;
                --medical-gray: #64748B;
                --medical-border: #E2E8F0;
                --shadow-sm: 0 1px 3px rgba(0, 0, 0, 0.05);
                --shadow-md: 0 4px 6px rgba(0, 0, 0, 0.07);
                --shadow-lg: 0 10px 15px rgba(0, 0, 0, 0.08);
                --shadow-xl: 0 20px 25px rgba(0, 0, 0, 0.1);
            }

            .dashboard-container {
                padding: 0;
                background: var(--medical-light);
                min-height: 100vh;
            }

            /* Welcome Section */
            .welcome-section {
                background: white;
                border-radius: 16px;
                padding: 24px;
                box-shadow: var(--shadow-md);
            }

            .doctor-avatar {
                width: 60px;
                height: 60px;
                background: linear-gradient(135deg, var(--medical-primary), var(--medical-secondary));
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                color: white;
                font-size: 32px;
            }

            .welcome-content h2 {
                font-size: 24px;
                color: var(--medical-dark);
            }

            .alert-info-custom {
                background: linear-gradient(135deg, #EFF6FF, #DBEAFE);
                border: 1px solid #BFDBFE;
                border-radius: 10px;
                padding: 12px 16px;
                color: #1E40AF;
            }

            .quick-actions {
                display: flex;
                justify-content: flex-end;
                gap: 8px;
            }

            .btn-medical-primary {
                background: linear-gradient(135deg, var(--medical-primary), var(--medical-primary-dark));
                color: white;
                border: none;
                padding: 10px 20px;
                border-radius: 10px;
                font-weight: 600;
                transition: all 0.3s ease;
                box-shadow: var(--shadow-md);
            }

            .btn-medical-primary:hover {
                transform: translateY(-2px);
                box-shadow: var(--shadow-lg);
                color: white;
            }

            .btn-medical-outline {
                background: white;
                color: var(--medical-primary);
                border: 2px solid var(--medical-primary);
                padding: 10px 20px;
                border-radius: 10px;
                font-weight: 600;
                transition: all 0.3s ease;
            }

            .btn-medical-outline:hover {
                background: var(--medical-primary);
                color: white;
                transform: translateY(-2px);
            }

            /* Stats Cards */
            .stat-card {
                background: white;
                border-radius: 16px;
                padding: 24px;
                display: flex;
                gap: 20px;
                box-shadow: var(--shadow-md);
                transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
                border: 1px solid var(--medical-border);
            }

            .stat-card:hover {
                transform: translateY(-4px);
                box-shadow: var(--shadow-xl);
            }

            .stat-icon {
                width: 60px;
                height: 60px;
                border-radius: 12px;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 28px;
                flex-shrink: 0;
                transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
            }

            .stat-card:hover .stat-icon {
                transform: scale(1.1) rotate(-5deg);
                animation: iconPulse 1s ease-in-out;
            }

            /* Icon pulse animation */
            @keyframes iconPulse {
                0%, 100% {
                    transform: scale(1.1) rotate(-5deg);
                }
                50% {
                    transform: scale(1.15) rotate(-5deg);
                }
            }

            .stat-patients .stat-icon {
                background: linear-gradient(135deg, #DBEAFE, #BFDBFE);
                color: var(--medical-primary);
            }

            .stat-queue .stat-icon {
                background: linear-gradient(135deg, #D1FAE5, #A7F3D0);
                color: var(--medical-secondary);
            }

            .stat-medicine-warning .stat-icon {
                background: linear-gradient(135deg, #FEF3C7, #FDE68A);
                color: var(--medical-warning);
            }

            .stat-medicine-danger .stat-icon {
                background: linear-gradient(135deg, #FEE2E2, #FECACA);
                color: var(--medical-danger);
            }

            .stat-content {
                flex: 1;
            }

            .stat-value {
                font-size: 32px;
                font-weight: 700;
                color: var(--medical-dark);
                line-height: 1;
                margin-bottom: 8px;
            }

            .stat-label {
                font-size: 13px;
                color: var(--medical-gray);
                font-weight: 500;
                margin-bottom: 8px;
            }

            .stat-trend {
                font-size: 12px;
                font-weight: 600;
                display: flex;
                align-items: center;
                gap: 4px;
            }

            .stat-trend.positive {
                color: var(--medical-success);
            }

            .stat-trend.negative {
                color: var(--medical-danger);
            }

            .stat-trend.neutral {
                color: var(--medical-gray);
            }

            .stat-trend.warning {
                color: var(--medical-warning);
            }

            .stat-trend.danger {
                color: var(--medical-danger);
            }

            /* Medical Card */
            .medical-card {
                background: white;
                border-radius: 16px;
                border: 1px solid var(--medical-border);
                box-shadow: var(--shadow-md);
                overflow: hidden;
            }

            .card-header-custom {
                padding: 20px 24px;
                border-bottom: 1px solid var(--medical-border);
                background: linear-gradient(135deg, #F8FAFC, #F1F5F9);
            }

            .card-header-custom h5 {
                font-size: 16px;
                font-weight: 700;
                color: var(--medical-dark);
                margin: 0;
            }

            .card-header-custom small {
                font-size: 13px;
            }

            /* Queue Status Badges */
            .queue-status {
                display: flex;
                gap: 8px;
            }

            .badge-success-soft {
                background: #D1FAE5;
                color: var(--medical-success);
                padding: 6px 12px;
                border-radius: 8px;
                font-weight: 600;
                font-size: 12px;
            }

            .badge-warning-soft {
                background: #FEF3C7;
                color: var(--medical-warning);
                padding: 6px 12px;
                border-radius: 8px;
                font-weight: 600;
                font-size: 12px;
            }

            /* Queue Table */
            .queue-table-container {
                max-height: 450px;
                overflow-y: auto;
            }

            .queue-table {
                margin: 0;
            }

            .queue-table thead {
                background: var(--medical-light);
                position: sticky;
                top: 0;
                z-index: 10;
            }

            .queue-table th {
                font-size: 13px;
                font-weight: 700;
                color: var(--medical-dark);
                text-transform: uppercase;
                letter-spacing: 0.5px;
                padding: 16px;
                border-bottom: 2px solid var(--medical-border);
            }

            .queue-table td {
                padding: 16px;
                vertical-align: middle;
                color: var(--medical-dark);
                border-bottom: 1px solid var(--medical-border);
            }

            .queue-table tbody tr {
                transition: all 0.2s ease;
            }

            .queue-table tbody tr:hover {
                background: #F8FAFC;
                transform: scale(1.01);
            }

            .queue-table .badge {
                padding: 6px 12px;
                border-radius: 8px;
                font-weight: 600;
                font-size: 12px;
            }

            .queue-table .badge.bg-success {
                background: var(--medical-success) !important;
            }

            .queue-table .badge.bg-warning {
                background: var(--medical-warning) !important;
            }

            .queue-table .badge.bg-info {
                background: var(--medical-info) !important;
            }

            .btn-action {
                width: 32px;
                height: 32px;
                padding: 0;
                display: inline-flex;
                align-items: center;
                justify-content: center;
                border-radius: 8px;
                border: none;
                transition: all 0.2s ease;
            }

            .btn-outline-primary.btn-action {
                color: var(--medical-primary);
                border: 1px solid var(--medical-primary);
            }

            .btn-outline-primary.btn-action:hover {
                background: var(--medical-primary);
                color: white;
                transform: scale(1.1);
            }

            .btn-outline-danger.btn-action {
                color: var(--medical-danger);
                border: 1px solid var(--medical-danger);
            }

            .btn-outline-danger.btn-action:hover {
                background: var(--medical-danger);
                color: white;
                transform: scale(1.1);
            }

            /* Graphics Section */
            .chart-container-wrapper {
                position: relative;
                min-height: 400px;
                padding: 24px;
            }

            .graphic-container {
                position: absolute;
                top: 24px;
                left: 24px;
                right: 24px;
                bottom: 24px;
                opacity: 0;
                transform: scale(0.96) translateY(10px);
                transition: all 0.8s cubic-bezier(0.4, 0, 0.2, 1);
                pointer-events: none;
            }

            .graphic-container.active {
                opacity: 1;
                transform: scale(1) translateY(0);
                pointer-events: auto;
            }

            /* Chart entrance animation */
            @keyframes chartSlideIn {
                from {
                    opacity: 0;
                    transform: translateY(20px) scale(0.98);
                }
                to {
                    opacity: 1;
                    transform: translateY(0) scale(1);
                }
            }

            .chart-container-wrapper {
                animation: chartSlideIn 0.6s ease-out;
            }

            .graphic-controls {
                display: flex;
                align-items: center;
                gap: 12px;
            }

            .graphic-indicators {
                display: flex;
                gap: 8px;
                background: white;
                padding: 6px;
                border-radius: 20px;
                border: 1px solid var(--medical-border);
            }

            .indicator {
                width: 12px;
                height: 12px;
                border-radius: 50%;
                background: #CBD5E1;
                border: none;
                cursor: pointer;
                transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                padding: 0;
                position: relative;
            }

            .indicator:hover {
                background: #94A3B8;
                transform: scale(1.2);
            }

            .indicator.active {
                background: var(--medical-primary);
                width: 32px;
                border-radius: 10px;
                animation: indicatorPulse 2s ease-in-out infinite;
            }

            /* Indicator pulse animation */
            @keyframes indicatorPulse {
                0%, 100% {
                    box-shadow: 0 0 0 0 rgba(13, 110, 253, 0.4);
                }
                50% {
                    box-shadow: 0 0 0 4px rgba(13, 110, 253, 0);
                }
            }

            /* QR Code Card */
            .qr-code-wrapper {
                padding: 16px;
            }

            .qr-code-container {
                background: linear-gradient(135deg, #F8FAFC, #F1F5F9);
                padding: 20px;
                border-radius: 16px;
                display: inline-block;
                border: 2px dashed var(--medical-border);
            }

            .qr-code-image {
                max-width: 100%;
                height: auto;
                border-radius: 8px;
            }

            .qr-info {
                padding: 12px 0;
            }

            /* Financial Section */
            .financial-item {
                padding: 24px;
                border-radius: 12px;
                background: var(--medical-light);
                height: 100%;
                transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
                border: 2px solid transparent;
            }

            .financial-item:hover {
                transform: translateY(-4px) scale(1.02);
                box-shadow: var(--shadow-lg);
            }

            .financial-item.income {
                border-color: rgba(16, 185, 129, 0.2);
            }

            .financial-item.income:hover {
                background: linear-gradient(135deg, #D1FAE5, #F0FDF4);
                box-shadow: 0 8px 16px rgba(16, 185, 129, 0.2);
            }

            .financial-item.expense {
                border-color: rgba(239, 68, 68, 0.2);
            }

            .financial-item.expense:hover {
                background: linear-gradient(135deg, #FEE2E2, #FEF2F2);
                box-shadow: 0 8px 16px rgba(239, 68, 68, 0.2);
            }

            .financial-item.profit {
                border-color: rgba(13, 110, 253, 0.2);
            }

            .financial-item.profit:hover {
                background: linear-gradient(135deg, #DBEAFE, #EFF6FF);
                box-shadow: 0 8px 16px rgba(13, 110, 253, 0.2);
            }

            .financial-icon {
                width: 48px;
                height: 48px;
                border-radius: 12px;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 24px;
                margin-right: 12px;
                transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
            }

            .financial-item:hover .financial-icon {
                transform: rotate(8deg) scale(1.1);
            }

            .financial-icon.income {
                background: linear-gradient(135deg, #10B981, #059669);
                color: white;
            }

            .financial-icon.expense {
                background: linear-gradient(135deg, #EF4444, #DC2626);
                color: white;
            }

            .financial-icon.profit {
                background: linear-gradient(135deg, #0D6EFD, #0854C1);
                color: white;
            }

            .financial-amount {
                font-size: 28px;
                font-weight: 700;
                margin-bottom: 8px;
                line-height: 1.2;
            }

            .financial-amount.income {
                color: var(--medical-success);
            }

            .financial-amount.expense {
                color: var(--medical-danger);
            }

            .financial-amount.profit {
                color: var(--medical-primary);
            }

            .financial-trend {
                font-size: 13px;
                font-weight: 600;
                display: flex;
                align-items: center;
                gap: 4px;
            }

            .financial-trend.positive {
                color: var(--medical-success);
            }

            .financial-trend.negative {
                color: var(--medical-danger);
            }

            .btn-icon {
                width: 36px;
                height: 36px;
                padding: 0;
                display: flex;
                align-items: center;
                justify-content: center;
                border-radius: 8px;
                border: 1px solid var(--medical-border);
                background: white;
                color: var(--medical-gray);
                transition: all 0.2s ease;
            }

            .btn-icon:hover {
                background: var(--medical-light);
                color: var(--medical-primary);
            }

            /* Animations */
            @keyframes fadeInUp {
                from {
                    opacity: 0;
                    transform: translateY(30px) scale(0.95);
                }
                to {
                    opacity: 1;
                    transform: translateY(0) scale(1);
                }
            }

            .stagger-item {
                animation: fadeInUp 0.8s cubic-bezier(0.4, 0, 0.2, 1) forwards;
                opacity: 0;
            }

            /* Table row slide animation */
            @keyframes slideInFromLeft {
                from {
                    opacity: 0;
                    transform: translateX(-20px);
                }
                to {
                    opacity: 1;
                    transform: translateX(0);
                }
            }

            .queue-table tbody tr {
                animation: slideInFromLeft 0.5s ease-out forwards;
                opacity: 0;
            }

            /* Scrollbar Styling */
            .queue-table-container::-webkit-scrollbar {
                width: 6px;
            }

            .queue-table-container::-webkit-scrollbar-track {
                background: var(--medical-light);
            }

            .queue-table-container::-webkit-scrollbar-thumb {
                background: #CBD5E1;
                border-radius: 3px;
            }

            .queue-table-container::-webkit-scrollbar-thumb:hover {
                background: #94A3B8;
            }

            /* Responsive Design */
            @media (max-width: 991px) {
                .quick-actions {
                    justify-content: flex-start;
                    margin-top: 16px;
                }

                .stat-value {
                    font-size: 28px;
                }

                .financial-amount {
                    font-size: 24px;
                }

                .financial-item {
                    margin-bottom: 16px;
                }
            }

            @media (max-width: 767px) {
                .welcome-section {
                    padding: 16px;
                }

                .doctor-avatar {
                    width: 50px;
                    height: 50px;
                    font-size: 24px;
                }

                .welcome-content h2 {
                    font-size: 20px;
                }

                .stat-card {
                    padding: 16px;
                }

                .stat-icon {
                    width: 50px;
                    height: 50px;
                    font-size: 24px;
                }

                .stat-value {
                    font-size: 24px;
                }

                .card-header-custom {
                    padding: 16px;
                }

                .chart-container-wrapper {
                    min-height: 300px;
                    padding: 16px;
                }

                .financial-amount {
                    font-size: 20px;
                }

                .financial-icon {
                    width: 40px;
                    height: 40px;
                    font-size: 20px;
                }

                .queue-status {
                    flex-wrap: wrap;
                }
            }
        `;
        
        document.head.appendChild(styleElement);
    }

    async onInit() {
        // Load Chart.js library
        await this.loadChartJS();
        
        // Render queue table
        this.renderQueueTable();
        
        // Animate numbers
        this.animateNumber('totalPatients', 0, 127, 1500);
        this.animateNumber('queueToday', 0, 10, 1000);
        this.animateNumber('obatExpired', 0, 10, 1000);
        this.animateNumber('obatHabis', 0, 4, 1000);

        // Initialize charts
        this.initializeCharts();
        
        // Start auto-rotation
        this.startGraphicRotation();

        // Setup indicator click handlers
        this.setupIndicators();

        // Add stagger animation to cards
        this.addStaggerAnimation();
    }

    async loadChartJS() {
        return new Promise((resolve, reject) => {
            if (window.Chart) {
                resolve();
                return;
            }

            const script = document.createElement('script');
            script.src = 'https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.min.js';
            script.onload = resolve;
            script.onerror = reject;
            document.head.appendChild(script);
        });
    }

    initializeCharts() {
        // Chart 1: Bar Chart - Patient Statistics with Animations
        const ctx1 = document.getElementById('chart1');
        if (ctx1) {
            this.charts[0] = new Chart(ctx1, {
                type: 'bar',
                data: {
                    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Ags', 'Sep', 'Okt', 'Nov', 'Des'],
                    datasets: [{
                        label: 'Jumlah Pasien',
                        data: [65, 78, 90, 81, 96, 105, 112, 98, 87, 95, 103, 110],
                        backgroundColor: 'rgba(13, 110, 253, 0.8)',
                        borderColor: 'rgba(13, 110, 253, 1)',
                        borderWidth: 2,
                        borderRadius: 8,
                        borderSkipped: false,
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    // 🎬 ANIMATION CONFIGURATION
                    animation: {
                        duration: 2000, // 2 seconds
                        easing: 'easeInOutQuart',
                        delay: (context) => {
                            // Stagger animation for each bar
                            let delay = 0;
                            if (context.type === 'data' && context.mode === 'default') {
                                delay = context.dataIndex * 100; // 100ms delay between bars
                            }
                            return delay;
                        },
                        // Animation when chart first loads
                        onProgress: function(animation) {
                            // Optional: Add progress tracking
                        },
                        onComplete: function(animation) {
                            // Optional: Trigger something when animation completes
                        }
                    },
                    // Hover animation
                    hover: {
                        animationDuration: 400
                    },
                    // Animation when data updates
                    transitions: {
                        active: {
                            animation: {
                                duration: 400
                            }
                        }
                    },
                    plugins: {
                        legend: {
                            display: true,
                            position: 'top',
                            labels: {
                                font: {
                                    size: 13,
                                    weight: '600'
                                },
                                padding: 16,
                                usePointStyle: true,
                                pointStyle: 'circle'
                            }
                        },
                        tooltip: {
                            enabled: true,
                            backgroundColor: 'rgba(30, 41, 59, 0.95)',
                            padding: 12,
                            borderColor: 'rgba(226, 232, 240, 0.3)',
                            borderWidth: 1,
                            cornerRadius: 8,
                            titleFont: {
                                size: 14,
                                weight: '600'
                            },
                            bodyFont: {
                                size: 13
                            },
                            callbacks: {
                                label: function(context) {
                                    return context.dataset.label + ': ' + context.parsed.y + ' pasien';
                                }
                            },
                            // Tooltip animation
                            animation: {
                                duration: 300
                            }
                        }
                    },
                    scales: {
                        y: {
                            beginAtZero: true,
                            grid: {
                                color: 'rgba(0, 0, 0, 0.05)',
                                drawBorder: false
                            },
                            ticks: {
                                font: {
                                    size: 12
                                },
                                color: '#64748B'
                            }
                        },
                        x: {
                            grid: {
                                display: false
                            },
                            ticks: {
                                font: {
                                    size: 12
                                },
                                color: '#64748B'
                            }
                        }
                    }
                }
            });
        }

        // Chart 2: Line Chart - Revenue Trend with Animations
        const ctx2 = document.getElementById('chart2');
        if (ctx2) {
            this.charts[1] = new Chart(ctx2, {
                type: 'line',
                data: {
                    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Ags', 'Sep', 'Okt', 'Nov', 'Des'],
                    datasets: [
                        {
                            label: 'Pendapatan (Juta Rp)',
                            data: [25, 28, 32, 30, 35, 38, 42, 39, 36, 40, 43, 45],
                            borderColor: '#10B981',
                            backgroundColor: 'rgba(16, 185, 129, 0.1)',
                            borderWidth: 3,
                            fill: true,
                            tension: 0.4,
                            pointRadius: 5,
                            pointHoverRadius: 7,
                            pointBackgroundColor: '#10B981',
                            pointBorderColor: '#fff',
                            pointBorderWidth: 2,
                            // Point hover animation
                            pointHitRadius: 10
                        },
                        {
                            label: 'Pengeluaran (Juta Rp)',
                            data: [8, 7, 9, 8, 10, 9, 11, 10, 9, 11, 10, 12],
                            borderColor: '#EF4444',
                            backgroundColor: 'rgba(239, 68, 68, 0.1)',
                            borderWidth: 3,
                            fill: true,
                            tension: 0.4,
                            pointRadius: 5,
                            pointHoverRadius: 7,
                            pointBackgroundColor: '#EF4444',
                            pointBorderColor: '#fff',
                            pointBorderWidth: 2,
                            pointHitRadius: 10
                        }
                    ]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    // 🎬 ANIMATION CONFIGURATION
                    animation: {
                        duration: 2500, // 2.5 seconds
                        easing: 'easeInOutCubic',
                        // Progressive line drawing effect
                        x: {
                            type: 'number',
                            easing: 'linear',
                            duration: 2000,
                            from: 0
                        },
                        y: {
                            type: 'number',
                            easing: 'easeInOutQuart',
                            duration: 2000,
                            from: (ctx) => {
                                if (ctx.type === 'data') {
                                    return 0;
                                }
                            }
                        },
                        delay: (context) => {
                            // Stagger animation for points
                            let delay = 0;
                            if (context.type === 'data' && context.mode === 'default') {
                                delay = context.dataIndex * 80;
                            }
                            return delay;
                        }
                    },
                    // Hover animation
                    hover: {
                        animationDuration: 400
                    },
                    plugins: {
                        legend: {
                            display: true,
                            position: 'top',
                            labels: {
                                font: {
                                    size: 13,
                                    weight: '600'
                                },
                                padding: 16,
                                usePointStyle: true,
                                pointStyle: 'circle'
                            }
                        },
                        tooltip: {
                            enabled: true,
                            backgroundColor: 'rgba(30, 41, 59, 0.95)',
                            padding: 12,
                            borderColor: 'rgba(226, 232, 240, 0.3)',
                            borderWidth: 1,
                            cornerRadius: 8,
                            titleFont: {
                                size: 14,
                                weight: '600'
                            },
                            bodyFont: {
                                size: 13
                            },
                            callbacks: {
                                label: function(context) {
                                    return context.dataset.label + ': Rp ' + context.parsed.y + ' juta';
                                }
                            },
                            animation: {
                                duration: 300
                            }
                        }
                    },
                    scales: {
                        y: {
                            beginAtZero: true,
                            grid: {
                                color: 'rgba(0, 0, 0, 0.05)',
                                drawBorder: false
                            },
                            ticks: {
                                font: {
                                    size: 12
                                },
                                color: '#64748B',
                                callback: function(value) {
                                    return 'Rp ' + value + 'jt';
                                }
                            }
                        },
                        x: {
                            grid: {
                                display: false
                            },
                            ticks: {
                                font: {
                                    size: 12
                                },
                                color: '#64748B'
                            }
                        }
                    },
                    interaction: {
                        intersect: false,
                        mode: 'index'
                    }
                }
            });
        }
    }

    startGraphicRotation() {
        // Rotate every 8 seconds
        this.graphicRotationTimer = setInterval(() => {
            this.rotateGraphic();
        }, 8000);
    }

    rotateGraphic() {
        const graphics = document.querySelectorAll('.graphic-container');
        const indicators = document.querySelectorAll('.indicator');
        const titleElement = document.getElementById('graphicTitle');
        
        // Remove active class from current
        graphics[this.currentGraphicIndex].classList.remove('active');
        indicators[this.currentGraphicIndex].classList.remove('active');
        
        // Move to next graphic
        this.currentGraphicIndex = (this.currentGraphicIndex + 1) % 2;
        
        // Add active class to next
        graphics[this.currentGraphicIndex].classList.add('active');
        indicators[this.currentGraphicIndex].classList.add('active');
        
        // Update title
        const titles = [
            'Statistik Kunjungan Pasien',
            'Tren Keuangan Bulanan'
        ];
        titleElement.textContent = titles[this.currentGraphicIndex];
    }

    setupIndicators() {
        const indicators = document.querySelectorAll('.indicator');
        indicators.forEach((indicator, index) => {
            indicator.addEventListener('click', () => {
                // Stop auto-rotation temporarily
                clearInterval(this.graphicRotationTimer);
                
                // Switch to clicked graphic
                const graphics = document.querySelectorAll('.graphic-container');
                const allIndicators = document.querySelectorAll('.indicator');
                const titleElement = document.getElementById('graphicTitle');
                
                graphics.forEach(g => g.classList.remove('active'));
                allIndicators.forEach(i => i.classList.remove('active'));
                
                graphics[index].classList.add('active');
                indicator.classList.add('active');
                
                const titles = [
                    'Statistik Kunjungan Pasien',
                    'Tren Keuangan Bulanan'
                ];
                titleElement.textContent = titles[index];
                
                this.currentGraphicIndex = index;
                
                // Resume auto-rotation after 15 seconds
                setTimeout(() => {
                    this.startGraphicRotation();
                }, 15000);
            });
        });
    }

    renderQueueTable() {
        const tbody = document.getElementById('queueTableBody');
        if (!tbody) return;

        tbody.innerHTML = '';

        this.queueData.forEach((item, index) => {
            const row = document.createElement('tr');
            row.style.animationDelay = `${index * 0.08}s`;
            
            row.innerHTML = `
                <td class="fw-bold text-primary">#${item.no}</td>
                <td class="fw-semibold">${item.name}</td>
                <td>
                    <div class="d-flex align-items-center">
                        <i class="bi bi-clock me-2 text-muted"></i>
                        <span class="text-muted">${item.time}</span>
                    </div>
                </td>
                <td>
                    <span class="badge bg-light text-dark border">${item.type}</span>
                </td>
                <td>
                    <span class="badge bg-${item.statusClass}">${item.status}</span>
                </td>
                <td class="text-center">
                    <button class="btn btn-sm btn-outline-primary btn-action me-1" title="Lihat Detail">
                        <i class="bi bi-eye"></i>
                    </button>
                    <button class="btn btn-sm btn-outline-danger btn-action" title="Hapus">
                        <i class="bi bi-trash"></i>
                    </button>
                </td>
            `;
            tbody.appendChild(row);
        });
    }

    addStaggerAnimation() {
        const cards = document.querySelectorAll('.stat-card, .medical-card');
        cards.forEach((card, index) => {
            card.classList.add('stagger-item');
            card.style.animationDelay = `${index * 0.1}s`;
        });
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
        // Clear rotation timer
        if (this.graphicRotationTimer) {
            clearInterval(this.graphicRotationTimer);
        }

        // Destroy charts
        this.charts.forEach(chart => {
            if (chart) chart.destroy();
        });

        // Remove styles
        const styleElement = document.getElementById('dashboard-styles');
        if (styleElement) {
            styleElement.remove();
        }
    }
}