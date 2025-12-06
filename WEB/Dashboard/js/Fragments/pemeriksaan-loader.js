// js/Fragments/pemeriksaan-loader.js
console.log("🔄 Pemeriksaan Loader initialized");

class PemeriksaanFragmentLoader {
    constructor() {
        this.title = 'Pemeriksaan';
        this.icon = 'bi-heart-pulse';
        this.isLoaded = false;
        this.actualFragment = null;
        this.isLoading = false; // ✅ Prevent multiple loads
    }

    render() {
        console.log('🎨 PemeriksaanLoader.render() called');
        
        // Return skeleton/loading state
        return `
            <div class="pemeriksaan-loading-container">
                <div class="d-flex justify-content-between align-items-center mb-4">
                    <div>
                        <div class="skeleton skeleton-text" style="width: 200px; height: 32px; margin-bottom: 8px;"></div>
                        <div class="skeleton skeleton-text" style="width: 150px; height: 20px;"></div>
                    </div>
                </div>
                
                <div class="card shadow-sm border-0">
                    <div class="card-header bg-white border-bottom">
                        <div class="d-flex justify-content-between align-items-center">
                            <div class="skeleton skeleton-text" style="width: 250px; height: 24px;"></div>
                            <div class="d-flex gap-2">
                                <div class="skeleton skeleton-text" style="width: 80px; height: 30px;"></div>
                                <div class="skeleton skeleton-text" style="width: 100px; height: 30px;"></div>
                            </div>
                        </div>
                    </div>
                    <div class="card-body p-0">
                        <div class="table-responsive">
                            <table class="table table-hover mb-0">
                                <thead class="bg-light">
                                    <tr>
                                        ${['NO ANTRIAN', 'TANGGAL', 'JAM', 'NAMA PASIEN', 'NIK', 'STATUS', 'ENCOUNTER', 'AKSI'].map(header => `
                                            <th class="text-success"><div class="skeleton skeleton-text" style="width: 80px;"></div></th>
                                        `).join('')}
                                    </tr>
                                </thead>
                                <tbody>
                                    ${Array(5).fill(0).map(() => `
                                        <tr>
                                            ${Array(8).fill(0).map(() => `
                                                <td style="padding: 12px;">
                                                    <div class="skeleton skeleton-text" style="width: ${60 + Math.random() * 40}%;"></div>
                                                </td>
                                            `).join('')}
                                        </tr>
                                    `).join('')}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>

            <style>
                .skeleton {
                    background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
                    background-size: 200% 100%;
                    animation: skeleton-loading 1.5s infinite;
                    border-radius: 4px;
                }

                @keyframes skeleton-loading {
                    0% { background-position: 200% 0; }
                    100% { background-position: -200% 0; }
                }

                .skeleton-text {
                    height: 16px;
                    margin-bottom: 8px;
                }
            </style>
        `;
    }

    async onInit() {
        // ✅ Prevent multiple initializations
        if (this.isLoading) {
            console.warn('⚠️ Pemeriksaan loader already loading, skipping...');
            return;
        }
        
        if (this.isLoaded && this.actualFragment) {
            console.log('✅ Pemeriksaan fragment already loaded, reusing...');
            
            // Re-initialize if needed
            if (this.actualFragment.onInit) {
                await this.actualFragment.onInit();
            }
            return;
        }
        
        this.isLoading = true;
        console.log('🔄 Lazy loading Pemeriksaan fragment...');
        
        try {
            // Load the actual Pemeriksaan fragment code
            await this.loadPemeriksaanScript();
            
            // Initialize the actual fragment
            if (window.PemeriksaanFragment) {
                console.log('✅ PemeriksaanFragment class found, creating instance...');
                this.actualFragment = new window.PemeriksaanFragment();
                
                // Replace the skeleton with actual content
                const container = document.getElementById('fragmentContainer');
                if (container) {
                    console.log('📝 Replacing skeleton with actual content...');
                    container.innerHTML = this.actualFragment.render();
                    
                    // Call onInit if it exists
                    if (this.actualFragment.onInit) {
                        console.log('⚙️ Calling actualFragment.onInit()...');
                        await this.actualFragment.onInit();
                    }
                }
                
                this.isLoaded = true;
                this.isLoading = false;
                console.log('✅ Pemeriksaan fragment fully loaded!');
            } else {
                throw new Error('PemeriksaanFragment class not found after loading script');
            }
        } catch (error) {
            this.isLoading = false;
            console.error('❌ Error lazy loading Pemeriksaan:', error);
            this.showError(error);
        }
    }

    async loadPemeriksaanScript() {
        return new Promise((resolve, reject) => {
            if (window.PemeriksaanFragment) {
                console.log('✅ PemeriksaanFragment already loaded');
                resolve();
                return;
            }

            console.log('📦 Loading pemeriksaanfragment.js...');
            
            const script = document.createElement('script');
            // ✅ Try absolute path from root
            script.src = '/MAPOTEK_PHP/WEB/Dashboard/js/Fragments/pemeriksaanfragment.js';
            script.async = true;
            
            script.onload = () => {
                console.log('✅ Script loaded successfully');
                setTimeout(() => {
                    if (window.PemeriksaanFragment) {
                        resolve();
                    } else {
                        reject(new Error('PemeriksaanFragment class not found after load'));
                    }
                }, 100);
            };
            
            script.onerror = (e) => {
                console.error('❌ Script load failed:', e);
                reject(new Error('Failed to load pemeriksaanfragment.js - check file path'));
            };
            
            document.head.appendChild(script);
        });
    }

    showError(error) {
        const container = document.getElementById('fragmentContainer');
        if (container) {
            container.innerHTML = `
                <div class="alert alert-danger d-flex align-items-center" role="alert">
                    <i class="bi bi-exclamation-triangle-fill fs-4 me-3"></i>
                    <div class="flex-grow-1">
                        <h5 class="alert-heading">Error Loading Pemeriksaan</h5>
                        <p class="mb-2">${error.message}</p>
                        <button class="btn btn-outline-danger btn-sm" onclick="location.reload()">
                            <i class="bi bi-arrow-clockwise me-1"></i>Refresh Page
                        </button>
                    </div>
                </div>
            `;
        }
    }

    onDestroy() {
        console.log('🗑️ Destroying Pemeriksaan loader...');
        if (this.actualFragment && typeof this.actualFragment.onDestroy === 'function') {
            this.actualFragment.onDestroy();
        }
        // Don't reset isLoaded - keep the fragment cached for next use
    }
}

// ✅ Only export the loader class, NOT PemeriksaanFragment
window.PemeriksaanFragmentLoader = PemeriksaanFragmentLoader;
console.log("✅ PemeriksaanFragmentLoader registered (loader only)");