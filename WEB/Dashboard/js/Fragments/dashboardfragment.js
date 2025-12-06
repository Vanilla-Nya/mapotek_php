// Complete DashboardFragment with Skeleton Loaders
class DashboardFragment {
    constructor() {
        this.title = 'Dashboard';
        this.icon = 'bi-house-door';
        this.doctorData = null;
        this.queueData = [];
        this.currentGraphicIndex = 0;
        this.graphicRotationTimer = null;
        this.charts = [];
        this.currentDate = new Date();
        console.log('🏠 DashboardFragment constructor called')
    }

    render() {
        console.log('🎨 DashboardFragment render() called');
        this.injectStyles();
        
        const dateOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        const formattedDate = this.currentDate.toLocaleDateString('id-ID', dateOptions);
        const currentTime = new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
        
        return `
            <div class="dashboard-container">
                <!-- Enhanced Doctor Profile Card -->
                <div class="doctor-profile-card-wrapper mb-4">
                    <div class="doctor-profile-card" id="doctorProfileCard">
                        <div class="profile-blur-background" id="profileBlurBg"></div>
                        <div class="profile-content-overlay">
                            <div class="container-fluid">
                                <div class="row align-items-center g-4">
                                    <!-- Avatar Column -->
                                    <div class="col-auto text-center">
                                        <div class="profile-avatar-large" id="profileAvatarLarge">
                                            <div class="avatar-circle">
                                                <img id="doctorAvatarImg" src="" alt="Avatar" class="d-none">
                                                <i id="doctorAvatarIcon" class="bi bi-person-circle"></i>
                                            </div>
                                            <div class="online-indicator">
                                                <span class="pulse-dot"></span>
                                                <span class="status-text">Online</span>
                                            </div>
                                        </div>
                                    </div>

                                    <!-- Info Column -->
                                    <div class="col">
                                        <div class="profile-info">
                                            <h1 class="doctor-title" id="doctorNameDisplay">Loading...</h1>
                                            <p class="faskes-subtitle" id="faskesDisplay">Loading...</p>
                                            <div class="meta-info-row">
                                                <div class="meta-badge">
                                                    <i class="bi bi-calendar-event"></i>
                                                    <span>${formattedDate}</span>
                                                </div>
                                                <div class="meta-badge">
                                                    <i class="bi bi-clock-fill"></i>
                                                    <span>${currentTime}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <!-- Actions Column -->
                                    <div class="col-auto">
                                        <div class="profile-actions">
                                            <button class="action-btn" id="btnDashboardQR" title="QR Code">
                                                <i class="bi bi-qr-code"></i>
                                                <span>QR Code</span>
                                            </button>
                                            <button class="action-btn" id="btnGoToProfile" title="View Profile">
                                                <i class="bi bi-person-gear"></i>
                                                <span>Profile</span>
                                            </button>
                                        </div>
                                    </div>
                                </div>
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
                                <div class="stat-trend neutral" id="queueTrend">
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

                <!-- Queue and QR Code Row -->
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
                                        <span class="badge badge-success-soft" id="badgeSelesai">2 Selesai</span>
                                        <span class="badge badge-warning-soft" id="badgeMenunggu">8 Menunggu</span>
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
                                            <tr>
                                                <td colspan="6" class="text-center py-4 text-muted">
                                                    <i class="bi bi-hourglass-split me-2"></i>Memuat data antrian...
                                                </td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- QR Code Card -->
                    <div class="col-lg-4">
                        <div class="card medical-card h-100">
                            <div class="card-header-custom text-center">
                                <h5 class="mb-1">
                                    <i class="bi bi-qr-code me-2"></i>Pendaftaran Online
                                </h5>
                                <small class="text-muted">Scan untuk daftar antrian</small>
                            </div>
                            <div class="card-body text-center d-flex flex-column justify-content-center">
                                <div class="qr-code-wrapper" id="qrCodeWrapper">
                                    <div class="text-muted">
                                        <i class="bi bi-hourglass-split mb-2" style="font-size: 40px;"></i>
                                        <p class="small">Loading QR Code...</p>
                                    </div>
                                </div>
                                <button class="btn btn-outline-primary mt-3" id="btnQRToProfile">
                                    <i class="bi bi-gear-fill me-2"></i>Kelola QR Code
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Charts Section -->
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
                                            <button class="indicator active" data-index="0"></button>
                                            <button class="indicator" data-index="1"></button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div class="card-body chart-container-wrapper">
                                <div id="graphic1" class="graphic-container active">
                                    <canvas id="chart1"></canvas>
                                </div>
                                <div id="graphic2" class="graphic-container">
                                    <canvas id="chart2"></canvas>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Financial Summary -->
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
                                    <button class="btn btn-icon" id="btnFinancialDetail">
                                        <i class="bi bi-arrow-right"></i>
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
                                            <div class="financial-amount income" id="totalPendapatan">Rp 32.500.000</div>
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
                                            <div class="financial-amount expense" id="totalPengeluaran">Rp 7.200.000</div>
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
                                            <div class="financial-amount profit" id="labaBersih">Rp 25.300.000</div>
                                            <div class="financial-trend positive">
                                                <i class="bi bi-trophy"></i> Target tercapai
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div class="text-center mt-4">
                                    <button class="btn btn-medical-primary" id="btnLihatLaporanLengkap">
                                        <i class="bi bi-file-earmark-bar-graph me-2"></i>Lihat Laporan Lengkap
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- QR Modal -->
                <div class="modal fade" id="qrModal" tabindex="-1">
                    <div class="modal-dialog modal-dialog-centered">
                        <div class="modal-content">
                            <div class="modal-header">
                                <h5 class="modal-title">
                                    <i class="bi bi-qr-code me-2"></i>QR Code Antrian
                                </h5>
                                <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                            </div>
                            <div class="modal-body text-center">
                                <div class="qr-modal-wrapper" id="qrModalContent"></div>
                                <p class="mt-3 mb-0 text-muted">
                                    Pasien scan QR ini untuk daftar antrian
                                </p>
                            </div>
                            <div class="modal-footer">
                                <button class="btn btn-primary" id="btnDownloadQR">
                                    <i class="bi bi-download me-2"></i>Download
                                </button>
                                <button class="btn btn-secondary" data-bs-dismiss="modal">Tutup</button>
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
            }

            .dashboard-container {
                padding: 0;
                background: var(--medical-light);
                min-height: 100vh;
            }

            /* ⭐ SKELETON LOADER STYLES */
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
                margin-bottom: 8px;
                border-radius: 4px;
            }

            .skeleton-text.large {
                height: 24px;
            }

            .skeleton-chart {
                height: 350px;
                border-radius: 12px;
            }

            .skeleton-stat {
                height: 60px;
                border-radius: 12px;
                margin-bottom: 8px;
            }

            /* Enhanced Profile Card */
            .doctor-profile-card-wrapper {
                margin-bottom: 2rem;
            }

            .doctor-profile-card {
                position: relative;
                background: linear-gradient(135deg, #065f46 0%, #0891b2 100%);
                border-radius: 24px;
                overflow: hidden;
                box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
                min-height: 200px;
            }

            .profile-blur-background {
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background-size: cover;
                background-position: center;
                filter: blur(40px);
                opacity: 0.3;
                transform: scale(1.2);
                z-index: 0;
            }

            .profile-content-overlay {
                position: relative;
                z-index: 1;
                padding: 2rem;
                background: rgba(255, 255, 255, 0.1);
                backdrop-filter: blur(20px);
            }

            .profile-avatar-large {
                position: relative;
            }

            .avatar-circle {
                width: 120px;
                height: 120px;
                border-radius: 50%;
                overflow: hidden;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                display: flex;
                align-items: center;
                justify-content: center;
                border: 5px solid rgba(255, 255, 255, 0.3);
                box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
                margin: 0 auto;
            }

            .avatar-circle img {
                width: 100%;
                height: 100%;
                object-fit: cover;
            }

            .avatar-circle i {
                font-size: 60px;
                color: white;
            }

            .online-indicator {
                position: absolute;
                bottom: 5px;
                left: 50%;
                transform: translateX(-50%);
                background: var(--medical-success);
                color: white;
                padding: 6px 14px;
                border-radius: 20px;
                font-size: 12px;
                font-weight: 600;
                display: flex;
                align-items: center;
                gap: 6px;
                box-shadow: 0 4px 12px rgba(16, 185, 129, 0.4);
            }

            .pulse-dot {
                width: 8px;
                height: 8px;
                background: white;
                border-radius: 50%;
                animation: pulse 2s infinite;
            }

            @keyframes pulse {
                0%, 100% { opacity: 1; transform: scale(1); }
                50% { opacity: 0.5; transform: scale(0.8); }
            }

            .profile-info {
                color: white;
            }

            .doctor-title {
                font-size: 36px;
                font-weight: 700;
                color: white;
                margin-bottom: 0.5rem;
                text-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
            }

            .faskes-subtitle {
                font-size: 18px;
                color: rgba(255, 255, 255, 0.9);
                margin-bottom: 1rem;
                font-weight: 500;
            }

            .meta-info-row {
                display: flex;
                gap: 1rem;
                flex-wrap: wrap;
            }

            .meta-badge {
                display: inline-flex;
                align-items: center;
                gap: 8px;
                background: rgba(255, 255, 255, 0.2);
                padding: 8px 16px;
                border-radius: 12px;
                font-size: 14px;
                font-weight: 500;
                backdrop-filter: blur(10px);
                border: 1px solid rgba(255, 255, 255, 0.3);
            }

            .meta-badge i {
                font-size: 16px;
            }

            .profile-actions {
                display: flex;
                flex-direction: column;
                gap: 12px;
            }

            .action-btn {
                display: flex;
                align-items: center;
                gap: 12px;
                padding: 12px 24px;
                background: rgba(255, 255, 255, 0.2);
                backdrop-filter: blur(10px);
                border: 2px solid rgba(255, 255, 255, 0.3);
                border-radius: 14px;
                color: white;
                font-weight: 600;
                font-size: 15px;
                transition: all 0.3s ease;
                cursor: pointer;
                white-space: nowrap;
            }

            .action-btn:hover {
                background: rgba(255, 255, 255, 0.3);
                border-color: white;
                transform: translateX(-4px);
                box-shadow: 0 8px 20px rgba(0, 0, 0, 0.2);
            }

            .action-btn i {
                font-size: 20px;
            }

            /* Stats Cards */
            .stat-card {
                background: white;
                border-radius: 16px;
                padding: 24px;
                display: flex;
                gap: 20px;
                box-shadow: 0 4px 6px rgba(0, 0, 0, 0.07);
                transition: all 0.3s ease;
                border: 1px solid var(--medical-border);
            }

            .stat-card:hover {
                transform: translateY(-4px);
                box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1);
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

            .stat-content { flex: 1; }

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

            .stat-trend.positive { color: var(--medical-success); }
            .stat-trend.negative { color: var(--medical-danger); }
            .stat-trend.neutral { color: var(--medical-gray); }
            .stat-trend.warning { color: var(--medical-warning); }

            /* Medical Card */
            .medical-card {
                background: white;
                border-radius: 16px;
                border: 1px solid var(--medical-border);
                box-shadow: 0 4px 6px rgba(0, 0, 0, 0.07);
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
                padding: 16px;
                border-bottom: 2px solid var(--medical-border);
            }

            .queue-table td {
                padding: 16px;
                vertical-align: middle;
                color: var(--medical-dark);
                border-bottom: 1px solid var(--medical-border);
            }

            .queue-table tbody tr:hover {
                background: #F8FAFC;
            }

            /* Financial Items */
            .financial-item {
                padding: 24px;
                border-radius: 12px;
                background: var(--medical-light);
                height: 100%;
                transition: all 0.3s ease;
                border: 2px solid transparent;
            }

            .financial-item:hover {
                transform: translateY(-4px);
                box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1);
            }

            .financial-item.income { border-color: rgba(16, 185, 129, 0.2); }
            .financial-item.expense { border-color: rgba(239, 68, 68, 0.2); }
            .financial-item.profit { border-color: rgba(13, 110, 253, 0.2); }

            .financial-icon {
                width: 48px;
                height: 48px;
                border-radius: 12px;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 24px;
                margin-right: 12px;
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
            }

            .financial-amount.income { color: var(--medical-success); }
            .financial-amount.expense { color: var(--medical-danger); }
            .financial-amount.profit { color: var(--medical-primary); }

            .financial-trend {
                font-size: 13px;
                font-weight: 600;
                display: flex;
                align-items: center;
                gap: 4px;
            }

            .financial-trend.positive { color: var(--medical-success); }
            .financial-trend.negative { color: var(--medical-danger); }

            /* Charts */
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
                transition: opacity 0.5s ease;
                pointer-events: none;
            }

            .graphic-container.active {
                opacity: 1;
                pointer-events: auto;
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
                transition: all 0.3s ease;
                padding: 0;
            }

            .indicator.active {
                background: var(--medical-primary);
                width: 32px;
                border-radius: 10px;
            }

            .btn-medical-primary {
                background: linear-gradient(135deg, var(--medical-primary), var(--medical-primary-dark));
                color: white;
                border: none;
                padding: 12px 28px;
                border-radius: 12px;
                font-weight: 600;
                transition: all 0.3s ease;
                font-size: 15px;
            }

            .btn-medical-primary:hover {
                transform: translateY(-2px);
                box-shadow: 0 8px 20px rgba(13, 110, 253, 0.3);
                color: white;
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
                background: var(--medical-primary);
                color: white;
                border-color: var(--medical-primary);
            }

            /* Responsive */
            @media (max-width: 991px) {
                .doctor-title { font-size: 28px; }
                .faskes-subtitle { font-size: 16px; }
                .profile-actions { flex-direction: row; }
                .action-btn { padding: 10px 20px; font-size: 14px; }
            }

            @media (max-width: 767px) {
                .profile-content-overlay { padding: 1.5rem; }
                .avatar-circle { width: 100px; height: 100px; }
                .avatar-circle i { font-size: 50px; }
                .doctor-title { font-size: 24px; }
                .action-btn span { display: none; }
                .action-btn { padding: 10px; }
            }
        `;
        
        document.head.appendChild(styleElement);
    }

    async onInit() {
        console.log('⚙️ DashboardFragment.onInit() called');
        
        try {
            const user = JSON.parse(localStorage.getItem('user') || 'null');
            
            if (!user || !user.email) {
                alert('Session expired. Please login again.');
                window.location.href = '../LandingPage/booksaw-1.0.0/index.html';
                return;
            }

            // Load Chart.js FIRST
            console.log('📦 Loading Chart.js...');
            await this.loadChartJS();
            
            // Wait for Chart.js to initialize
            await new Promise(resolve => setTimeout(resolve, 500));
            
            console.log('📊 Chart.js loaded?', typeof window.Chart !== 'undefined');
            
            // Load doctor data
            await this.loadDoctorData(user.email);
            
            // Setup navigation and listeners
            this.attachNavigationListeners();
            this.startGraphicRotation();
            this.setupIndicators();
            
            console.log('✅ Dashboard initialized!');
            
        } catch (error) {
            console.error('❌ Error in onInit:', error);
        }
    }

    attachNavigationListeners() {
        console.log('🎧 Attaching navigation listeners...');
        
        // Profile navigation
        const btnGoToProfile = document.getElementById('btnGoToProfile');
        const btnQRToProfile = document.getElementById('btnQRToProfile');
        const btnDashboardQR = document.getElementById('btnDashboardQR');
        
        if (btnGoToProfile) {
            btnGoToProfile.addEventListener('click', () => {
                console.log('Navigate to Profile');
                this.navigateToFragment('profile');
            });
        }
        
        if (btnQRToProfile) {
            btnQRToProfile.addEventListener('click', () => {
                console.log('Navigate to Profile (from QR card)');
                this.navigateToFragment('profile');
            });
        }
        
        if (btnDashboardQR) {
            btnDashboardQR.addEventListener('click', () => {
                console.log('Show QR Modal');
                this.showQRModal();
            });
        }
        
        // Pembukuan navigation
        const btnLihatLaporanLengkap = document.getElementById('btnLihatLaporanLengkap');
        const btnFinancialDetail = document.getElementById('btnFinancialDetail');
        
        if (btnLihatLaporanLengkap) {
            btnLihatLaporanLengkap.addEventListener('click', () => {
                console.log('Navigate to Pembukuan');
                this.navigateToFragment('pembukuan');
            });
        }
        
        if (btnFinancialDetail) {
            btnFinancialDetail.addEventListener('click', () => {
                console.log('Navigate to Pembukuan (from icon)');
                this.navigateToFragment('pembukuan');
            });
        }
        
        // QR Modal download
        const btnDownloadQR = document.getElementById('btnDownloadQR');
        if (btnDownloadQR) {
            btnDownloadQR.addEventListener('click', () => {
                this.downloadQRCode();
            });
        }
    }

    navigateToFragment(fragmentName) {
        console.log(`🔄 Navigating to ${fragmentName}...`);
        
        if (typeof window.navigateToFragment === 'function') {
            window.navigateToFragment(fragmentName);
        } else if (typeof window.loadFragment === 'function') {
            window.loadFragment(fragmentName);
        } else if (typeof window.switchFragment === 'function') {
            window.switchFragment(fragmentName);
        } else {
            console.error('❌ Navigation function not found!');
            alert('Navigation tidak tersedia. Silakan refresh halaman.');
        }
    }

    async loadDoctorData(email) {
        try {
            console.log('👨‍⚕️ Loading doctor data for:', email);
            
            let userType = localStorage.getItem('user_role') || 'dokter';
            
            console.log('🔍 User type from localStorage:', userType);
            
            // If not cached, detect from database
            if (!localStorage.getItem('user_role')) {
                console.log('🔍 User role not cached, detecting from database...');
                
                if (window.supabaseClient) {
                    const { data: dokter, error: dokterError } = await window.supabaseClient
                        .from('dokter')
                        .select('id_dokter')
                        .ilike('email', email)
                        .maybeSingle();
                    
                    if (dokter) {
                        userType = 'dokter';
                        localStorage.setItem('user_role', 'dokter');
                        localStorage.setItem('id_dokter', dokter.id_dokter);
                        console.log('✅ Detected: DOKTER');
                    } else {
                        const { data: asisten, error: asistenError } = await window.supabaseClient
                            .from('asisten_dokter')
                            .select('id_asisten_dokter, id_dokter')
                            .ilike('email', email)
                            .maybeSingle();
                        
                        if (asisten) {
                            userType = 'asisten_dokter';
                            localStorage.setItem('user_role', 'asisten_dokter');
                            localStorage.setItem('id_asisten_dokter', asisten.id_asisten_dokter);
                            localStorage.setItem('id_dokter', asisten.id_dokter);
                            console.log('✅ Detected: ASISTEN DOKTER');
                        } else {
                            console.error('❌ User not found in either table!');
                            alert('User tidak ditemukan di sistem.');
                            return;
                        }
                    }
                }
            }
            
            // Call API with correct user_type
            const response = await fetch('../API/dashboard_api.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    action: 'get_doctor_data',
                    email: email,
                    user_type: userType
                })
            });

            const result = await response.json();
            console.log('📥 Dashboard API response:', result);

            if (result.success && result.data) {
                this.doctorData = result.data;
                
                // Display name
                const displayName = result.data.nama_lengkap || 'User';
                document.getElementById('doctorNameDisplay').textContent = displayName;
                
                // Display faskes or role badge
                const faskesDisplay = document.getElementById('faskesDisplay');
                if (result.data.user_type === 'asisten_dokter') {
                    faskesDisplay.textContent = 'Asisten Dokter';
                    faskesDisplay.classList.add('badge', 'bg-info');
                    faskesDisplay.style.cssText = 'display: inline-block; padding: 8px 16px; border-radius: 8px;';
                } else {
                    faskesDisplay.textContent = result.data.nama_faskes || 'Faskes';
                    faskesDisplay.classList.remove('badge', 'bg-info');
                }

                // Display avatar
                if (result.data.avatar_url) {
                    this.displayAvatar(result.data.avatar_url);
                }

                // ✅ FIX: Load parent doctor's QR code for asisten dokter
                if (result.data.user_type === 'asisten_dokter' && result.data.id_dokter_parent) {
                    console.log('🔍 Asisten dokter detected, loading parent doctor QR code...');
                    await this.loadParentDoctorQR(result.data.id_dokter_parent);
                } else if (result.data.user_type === 'dokter' && result.data.qr_code_data) {
                    // Regular doctor QR code
                    this.displayQRCode(result.data.qr_code_data);
                    console.log('✅ QR Code loaded');
                } else {
                    // No QR available
                    const qrWrapper = document.getElementById('qrCodeWrapper');
                    if (qrWrapper) {
                        qrWrapper.innerHTML = `
                            <div class="text-muted text-center">
                                <i class="bi bi-qr-code mb-2" style="font-size: 40px; opacity: 0.3;"></i>
                                <p class="small mb-0">QR Code belum dibuat</p>
                            </div>
                        `;
                    }
                }

                // Determine which doctor ID to use for stats
                const statsIdDokter = result.data.user_type === 'asisten_dokter' 
                    ? result.data.id_dokter_parent
                    : result.data.id_dokter;
                
                if (!statsIdDokter) {
                    console.error('❌ CRITICAL: No doctor ID available for loading stats!');
                    return;
                }
                
                // Load all stats and charts
                await this.loadAllStats(statsIdDokter);
                
                console.log('✅ Dashboard data loaded successfully!');
                
            } else {
                console.error('❌ API returned error:', result.message);
                alert(`Gagal memuat data: ${result.message}`);
            }
        } catch (error) {
            console.error('❌ Error loading doctor data:', error);
            alert(`Error: ${error.message}`);
        }
    }

    async loadParentDoctorQR(parentDoctorId) {
        try {
            console.log('📡 Loading parent doctor QR for ID:', parentDoctorId);
            
            if (window.supabaseClient) {
                const { data, error } = await window.supabaseClient
                    .from('dokter')
                    .select('qr_code_data')
                    .eq('id_dokter', parentDoctorId)
                    .maybeSingle();
                
                if (error) {
                    console.error('❌ Error fetching parent QR:', error);
                    return;
                }
                
                if (data && data.qr_code_data) {
                    console.log('✅ Parent doctor QR code found, displaying...');
                    this.displayQRCode(data.qr_code_data);
                    
                    // Store parent QR in doctorData for modal use
                    this.doctorData.qr_code_data = data.qr_code_data;
                } else {
                    console.log('⚠️ Parent doctor has no QR code');
                    const qrWrapper = document.getElementById('qrCodeWrapper');
                    if (qrWrapper) {
                        qrWrapper.innerHTML = `
                            <div class="text-muted text-center">
                                <i class="bi bi-info-circle mb-2" style="font-size: 40px;"></i>
                                <p class="small mb-0">Dokter pembimbing belum membuat QR Code</p>
                            </div>
                        `;
                    }
                }
            }
        } catch (error) {
            console.error('❌ Error in loadParentDoctorQR:', error);
        }
    }

    displayAvatar(avatarUrl) {
        const img = document.getElementById('doctorAvatarImg');
        const icon = document.getElementById('doctorAvatarIcon');
        const blurBg = document.getElementById('profileBlurBg');

        if (avatarUrl && avatarUrl !== '') {
            img.src = avatarUrl;
            img.classList.remove('d-none');
            icon.classList.add('d-none');
            
            blurBg.style.backgroundImage = `url('${avatarUrl}')`;
        }
    }

    displayQRCode(qrData) {
        const wrapper = document.getElementById('qrCodeWrapper');
        wrapper.innerHTML = '';
        
        const qrDiv = document.createElement('div');
        qrDiv.style.cssText = 'background: white; padding: 20px; border-radius: 12px; display: inline-block;';
        
        if (typeof QRCode !== 'undefined') {
            new QRCode(qrDiv, {
                text: qrData,
                width: 200,
                height: 200,
                colorDark: "#000000",
                colorLight: "#ffffff",
                correctLevel: QRCode.CorrectLevel.H
            });
            
            wrapper.appendChild(qrDiv);
        }
    }

    showQRModal() {
        if (!this.doctorData || !this.doctorData.qr_code_data) {
            alert('QR Code belum dibuat. Silakan buat di halaman Profile.');
            this.navigateToFragment('profile');
            return;
        }

        const modalContent = document.getElementById('qrModalContent');
        modalContent.innerHTML = '';
        
        const qrDiv = document.createElement('div');
        qrDiv.style.cssText = 'padding: 20px; background: white; border-radius: 12px;';
        
        if (typeof QRCode !== 'undefined') {
            new QRCode(qrDiv, {
                text: this.doctorData.qr_code_data,
                width: 300,
                height: 300,
                colorDark: "#000000",
                colorLight: "#ffffff",
                correctLevel: QRCode.CorrectLevel.H
            });
            
            modalContent.appendChild(qrDiv);

            if (typeof bootstrap !== 'undefined') {
                const modal = new bootstrap.Modal(document.getElementById('qrModal'));
                modal.show();
            }
        }
    }

    downloadQRCode() {
        const canvas = document.querySelector('#qrModalContent canvas');
        if (!canvas) {
            alert('QR Code tidak ditemukan');
            return;
        }

        const url = canvas.toDataURL('image/png');
        const link = document.createElement('a');
        link.download = `QR_${this.doctorData?.nama_lengkap || 'Doctor'}.png`;
        link.href = url;
        link.click();
    }

    // ✅ UPDATED: Show skeleton loaders first
    async loadAllStats(id_dokter) {
        try {
            console.log('📊 Loading all stats...');
            
            // ✅ Show skeleton loaders FIRST
            this.showStatsSkeleton();
            
            // Load basic stats
            await Promise.all([
                this.loadQueueStats(id_dokter),
                this.loadMedicineAlerts(id_dokter),
                this.loadFinancialSummary(id_dokter),
                this.loadPatientStats(id_dokter),
                this.loadQueueDetails(id_dokter)
            ]);
            
            console.log('✅ Basic stats loaded');
            
            // Load chart data
            console.log('📊 Chart.js available?', typeof window.Chart !== 'undefined');
            
            if (typeof window.Chart !== 'undefined') {
                console.log('✅ Chart.js is available, loading chart data...');
                await this.loadChartData(id_dokter);
            } else {
                console.error('❌ Chart.js still not loaded!');
                alert('Chart library failed to load. Please refresh the page.');
            }
            
        } catch (error) {
            console.error('❌ Error loading stats:', error);
        }
    }

    // ✅ NEW: Show skeleton loaders for stats
    showStatsSkeleton() {
        const statElements = [
            'totalPatients',
            'queueToday',
            'obatExpired',
            'obatHabis',
            'totalPendapatan',
            'totalPengeluaran',
            'labaBersih'
        ];
        
        statElements.forEach(id => {
            const element = document.getElementById(id);
            if (element) {
                element.innerHTML = '<div class="skeleton skeleton-stat" style="width: 80px;"></div>';
            }
        });
    }

    async loadQueueStats(id_dokter) {
        const response = await fetch('../API/dashboard_api.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'get_queue_stats', id_dokter: id_dokter })
        });

        const result = await response.json();
        if (result.success && result.data) {
            const stats = result.data;
            document.getElementById('queueToday').textContent = stats.total || 0;
            document.getElementById('badgeSelesai').textContent = `${stats.selesai || 0} Selesai`;
            document.getElementById('badgeMenunggu').textContent = `${stats.menunggu || 0} Menunggu`;
        }
    }

    async loadMedicineAlerts(id_dokter) {
        const response = await fetch('../API/dashboard_api.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'get_medicine_alerts', id_dokter: id_dokter })
        });

        const result = await response.json();
        if (result.success && result.data) {
            document.getElementById('obatExpired').textContent = result.data.expiring || 0;
            document.getElementById('obatHabis').textContent = result.data.low_stock || 0;
        }
    }

    async loadFinancialSummary(id_dokter) {
        const response = await fetch('../API/dashboard_api.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'get_financial_summary', id_dokter: id_dokter })
        });

        const result = await response.json();
        if (result.success && result.data) {
            const data = result.data;
            document.getElementById('totalPendapatan').textContent = 'Rp ' + this.formatNumber(data.pemasukan || 0);
            document.getElementById('totalPengeluaran').textContent = 'Rp ' + this.formatNumber(data.pengeluaran || 0);
            document.getElementById('labaBersih').textContent = 'Rp ' + this.formatNumber(data.profit || 0);
        }
    }

    async loadPatientStats(id_dokter) {
        const response = await fetch('../API/dashboard_api.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'get_patient_stats', id_dokter: id_dokter })
        });

        const result = await response.json();
        if (result.success && result.data) {
            document.getElementById('totalPatients').textContent = result.data.total_patients || 0;
        }
    }

    formatNumber(num) {
        return new Intl.NumberFormat('id-ID').format(num);
    }

    // ✅ UPDATED: Show skeleton for queue table
    async loadQueueDetails(id_dokter) {
        try {
            // ✅ Show skeleton loader FIRST
            const tbody = document.getElementById('queueTableBody');
            if (tbody) {
                tbody.innerHTML = this.generateQueueSkeleton();
            }
            
            const response = await fetch('../API/dashboard_api.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    action: 'get_queue_details', 
                    id_dokter: id_dokter 
                })
            });

            const result = await response.json();
            
            if (result.success && result.data) {
                this.displayQueueTable(result.data);
            } else {
                this.displayEmptyQueue();
            }
        } catch (error) {
            console.error('❌ Error loading queue details:', error);
            this.displayEmptyQueue();
        }
    }

    // ✅ NEW: Generate queue skeleton
    generateQueueSkeleton() {
        return Array(5).fill(0).map(() => `
            <tr>
                <td><div class="skeleton skeleton-text" style="width: 60px;"></div></td>
                <td><div class="skeleton skeleton-text" style="width: ${60 + Math.random() * 40}%;"></div></td>
                <td><div class="skeleton skeleton-text" style="width: 80px;"></div></td>
                <td><div class="skeleton skeleton-text" style="width: 70px;"></div></td>
                <td><div class="skeleton skeleton-text" style="width: 90px;"></div></td>
                <td class="text-center"><div class="skeleton skeleton-text" style="width: 40px; margin: 0 auto;"></div></td>
            </tr>
        `).join('');
    }

    displayQueueTable(queueData) {
        const tbody = document.getElementById('queueTableBody');
        
        if (!queueData || queueData.length === 0) {
            this.displayEmptyQueue();
            return;
        }
        
        tbody.innerHTML = queueData.map(item => {
            const statusClass = this.getStatusClass(item.status_antrian);
            const statusBadge = this.getStatusBadge(item.status_antrian);
            const jenisClass = item.jenis_pasien === 'BPJS' ? 'badge bg-success' : 'badge bg-primary';
            
            return `
                <tr>
                    <td><strong>${item.no_antrian}</strong></td>
                    <td>${item.nama_pasien}</td>
                    <td>${item.jam_antrian || '-'}</td>
                    <td><span class="${jenisClass}">${item.jenis_pasien}</span></td>
                    <td><span class="badge ${statusClass}">${statusBadge}</span></td>
                    <td class="text-center">
                        <button class="btn btn-sm btn-outline-primary" onclick="viewQueueDetail('${item.id_antrian}')">
                            <i class="bi bi-eye"></i>
                        </button>
                    </td>
                </tr>
            `;
        }).join('');
    }

    displayEmptyQueue() {
        const tbody = document.getElementById('queueTableBody');
        tbody.innerHTML = `
            <tr>
                <td colspan="6" class="text-center py-4 text-muted">
                    <i class="bi bi-inbox me-2"></i>Tidak ada antrian hari ini
                </td>
            </tr>
        `;
    }

    getStatusClass(status) {
        const statusMap = {
            'Belum Periksa': 'bg-warning',
            'Menunggu': 'bg-warning',
            'Dalam Pemeriksaan': 'bg-info',
            'Selesai': 'bg-success'
        };
        return statusMap[status] || 'bg-secondary';
    }

    getStatusBadge(status) {
        const statusMap = {
            'Belum Periksa': 'Menunggu',
            'Menunggu': 'Menunggu',
            'Dalam Pemeriksaan': 'Diperiksa',
            'Selesai': 'Selesai'
        };
        return statusMap[status] || status;
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

    // ✅ UPDATED: Show skeleton for charts
    async loadChartData(id_dokter) {
        try {
            console.log('📊 Loading chart data for doctor:', id_dokter);
            
            // ✅ Show skeleton loaders for charts
            const chart1Container = document.getElementById('graphic1');
            const chart2Container = document.getElementById('graphic2');
            
            if (chart1Container) {
                chart1Container.innerHTML = '<div class="skeleton skeleton-chart"></div>';
            }
            if (chart2Container) {
                chart2Container.innerHTML = '<div class="skeleton skeleton-chart"></div>';
            }
            
            // Load patient visit chart
            const visitResponse = await fetch('../API/dashboard_api.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    action: 'get_patient_visit_chart', 
                    id_dokter: id_dokter 
                })
            });
            const visitResult = await visitResponse.json();
            
            // Load financial chart
            const financialResponse = await fetch('../API/dashboard_api.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    action: 'get_financial_chart', 
                    id_dokter: id_dokter 
                })
            });
            const financialResult = await financialResponse.json();
            
            // ✅ Restore canvas elements before creating charts
            if (chart1Container) {
                chart1Container.innerHTML = '<canvas id="chart1"></canvas>';
            }
            if (chart2Container) {
                chart2Container.innerHTML = '<canvas id="chart2"></canvas>';
            }
            
            // Update charts with real data
            if (visitResult.success && financialResult.success) {
                console.log('✅ Updating charts with data...');
                this.updateChartsWithData(visitResult.data, financialResult.data);
            }
        } catch (error) {
            console.error('❌ Error loading chart data:', error);
        }
    }

    updateChartsWithData(visitData, financialData) {
        console.log('📊 updateChartsWithData called');
        console.log('📊 Visit data:', visitData);
        console.log('📊 Financial data:', financialData);
        
        // Destroy old charts
        this.charts.forEach(chart => {
            if (chart) {
                console.log('🗑️ Destroying old chart');
                chart.destroy();
            }
        });
        this.charts = [];
        
        // Patient Visit Chart
        const ctx1 = document.getElementById('chart1');
        console.log('📊 Chart1 canvas:', ctx1);
        
        if (ctx1 && window.Chart) {
            console.log('✅ Creating patient visit chart');
            const labels = visitData.map(d => d.month);
            const data = visitData.map(d => d.count);
            
            console.log('📊 Chart1 labels:', labels);
            console.log('📊 Chart1 data:', data);
            
            this.charts[0] = new Chart(ctx1, {
                type: 'bar',
                data: {
                    labels: labels,
                    datasets: [{
                        label: 'Jumlah Pasien',
                        data: data,
                        backgroundColor: 'rgba(13, 110, 253, 0.8)',
                        borderRadius: 8
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: { display: true },
                        tooltip: {
                            callbacks: {
                                label: function(context) {
                                    return context.dataset.label + ': ' + context.parsed.y + ' pasien';
                                }
                            }
                        }
                    },
                    scales: {
                        y: {
                            beginAtZero: true,
                            ticks: {
                                stepSize: 10
                            }
                        }
                    }
                }
            });
            console.log('✅ Patient chart created:', this.charts[0]);
        } else {
            console.error('❌ Cannot create chart1:', { ctx1, Chart: window.Chart });
        }
        
        // Financial Trend Chart
        const ctx2 = document.getElementById('chart2');
        console.log('📊 Chart2 canvas:', ctx2);
        
        if (ctx2 && window.Chart) {
            console.log('✅ Creating financial chart');
            const labels = financialData.map(d => d.month);
            const data = financialData.map(d => d.income);
            
            console.log('📊 Chart2 labels:', labels);
            console.log('📊 Chart2 data:', data);
            
            this.charts[1] = new Chart(ctx2, {
                type: 'line',
                data: {
                    labels: labels,
                    datasets: [{
                        label: 'Pendapatan (Juta Rp)',
                        data: data,
                        borderColor: '#10B981',
                        backgroundColor: 'rgba(16, 185, 129, 0.1)',
                        fill: true,
                        tension: 0.4,
                        borderWidth: 3
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: { display: true },
                        tooltip: {
                            callbacks: {
                                label: function(context) {
                                    return 'Rp ' + context.parsed.y + ' juta';
                                }
                            }
                        }
                    },
                    scales: {
                        y: {
                            beginAtZero: true,
                            ticks: {
                                callback: function(value) {
                                    return 'Rp ' + value + 'jt';
                                }
                            }
                        }
                    }
                }
            });
            console.log('✅ Financial chart created:', this.charts[1]);
        } else {
            console.error('❌ Cannot create chart2:', { ctx2, Chart: window.Chart });
        }
    }

    startGraphicRotation() {
        this.graphicRotationTimer = setInterval(() => {
            this.rotateGraphic();
        }, 8000);
    }

    rotateGraphic() {
        const graphics = document.querySelectorAll('.graphic-container');
        const indicators = document.querySelectorAll('.indicator');
        const titleElement = document.getElementById('graphicTitle');
        
        if (graphics.length === 0) return;
        
        graphics[this.currentGraphicIndex].classList.remove('active');
        indicators[this.currentGraphicIndex].classList.remove('active');
        
        this.currentGraphicIndex = (this.currentGraphicIndex + 1) % 2;
        
        graphics[this.currentGraphicIndex].classList.add('active');
        indicators[this.currentGraphicIndex].classList.add('active');
        
        const titles = ['Statistik Kunjungan Pasien', 'Tren Keuangan Bulanan'];
        titleElement.textContent = titles[this.currentGraphicIndex];
    }

    setupIndicators() {
        const indicators = document.querySelectorAll('.indicator');
        indicators.forEach((indicator, index) => {
            indicator.addEventListener('click', () => {
                clearInterval(this.graphicRotationTimer);
                
                const graphics = document.querySelectorAll('.graphic-container');
                const allIndicators = document.querySelectorAll('.indicator');
                const titleElement = document.getElementById('graphicTitle');
                
                graphics.forEach(g => g.classList.remove('active'));
                allIndicators.forEach(i => i.classList.remove('active'));
                
                graphics[index].classList.add('active');
                indicator.classList.add('active');
                
                const titles = ['Statistik Kunjungan Pasien', 'Tren Keuangan Bulanan'];
                titleElement.textContent = titles[index];
                
                this.currentGraphicIndex = index;
                
                setTimeout(() => this.startGraphicRotation(), 15000);
            });
        });
    }

    onDestroy() {
        if (this.graphicRotationTimer) {
            clearInterval(this.graphicRotationTimer);
        }

        this.charts.forEach(chart => {
            if (chart) chart.destroy();
        });

        const styleElement = document.getElementById('dashboard-styles');
        if (styleElement) {
            styleElement.remove();
        }
    }
}