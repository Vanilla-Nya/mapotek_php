// ========================================
// FILE: fragmentmanager.js - Fragment Management System
// ========================================

console.log("🎯 Fragment Manager Loading...");

class FragmentManager {
    constructor(containerId) {
        this.containerId = containerId;
        this.container = document.getElementById(containerId);
        this.currentFragment = null;
        this.currentFragmentName = null;
        
        // ✅ Register all fragments with their classes
        this.fragments = {
            'dashboard': DashboardFragment,
            'pasien': PasienFragment,
            'obat': ObatFragment,
            'antrian': AntrianFragment,
            'pemeriksaan': PemeriksaanFragment,
            'pembukuan': PembukuanFragment,
            'profile': ProfileFragment,
            'asistendokter': AsistenDokterFragment
        };
        
        console.log('✅ Fragment Manager initialized with container:', containerId);
        console.log('📦 Registered fragments:', Object.keys(this.fragments));
    }

    async loadFragment(fragmentName) {
        console.log(`\n🔄 Loading fragment: "${fragmentName}"`);
        
        // ✅ Validate fragment name
        if (!fragmentName || typeof fragmentName !== 'string') {
            console.error('❌ Invalid fragment name:', fragmentName);
            return;
        }
        
        // ✅ Normalize fragment name (lowercase, remove spaces)
        fragmentName = fragmentName.toLowerCase().trim();
        
        // ✅ Check if fragment exists in registry
        const FragmentClass = this.fragments[fragmentName];
        
        if (!FragmentClass) {
            console.error(`❌ Fragment "${fragmentName}" not found in registry`);
            console.log('📋 Available fragments:', Object.keys(this.fragments));
            this.showError(`Fragment "${fragmentName}" tidak ditemukan`);
            return;
        }
        
        // ✅ Check permissions (if role system is available)
        if (typeof window.checkFragmentAccess === 'function') {
            if (!window.checkFragmentAccess(fragmentName)) {
                console.warn(`🚫 Access denied to fragment: ${fragmentName}`);
                // Redirect to dashboard
                setTimeout(() => {
                    this.loadFragment('dashboard');
                }, 500);
                return;
            }
        }
        
        try {
            console.log(`📦 Instantiating ${fragmentName}...`);
            
            // ✅ Destroy previous fragment first
            if (this.currentFragment) {
                console.log('🗑️ Destroying previous fragment:', this.currentFragmentName);
                if (typeof this.currentFragment.onDestroy === 'function') {
                    this.currentFragment.onDestroy();
                }
            }
            
            // ✅ Create new fragment instance
            const fragment = new FragmentClass();
            
            if (!fragment) {
                throw new Error('Failed to instantiate fragment');
            }
            
            console.log('✅ Fragment instance created');
            
            // ✅ Update page title if fragment has title and icon
            if (fragment.title && fragment.icon) {
                const pageTitle = document.getElementById('pageTitle');
                if (pageTitle) {
                    pageTitle.innerHTML = `<i class="bi ${fragment.icon} me-2"></i>${fragment.title}`;
                    console.log(`📝 Page title updated: ${fragment.title}`);
                }
            }
            
            // ✅ Check if container exists
            if (!this.container) {
                console.error('❌ Container element not found:', this.containerId);
                return;
            }
            
            // ✅ Render fragment
            console.log('🎨 Rendering fragment...');
            const html = fragment.render();
            
            if (!html) {
                throw new Error('Fragment render() returned empty content');
            }
            
            this.container.innerHTML = html;
            console.log('✅ Fragment rendered to DOM');
            
            // ✅ Initialize fragment (if it has onInit method)
            if (typeof fragment.onInit === 'function') {
                console.log('⚙️ Initializing fragment...');
                await fragment.onInit();
                console.log('✅ Fragment initialized');
            }
            
            // ✅ Store current fragment reference
            this.currentFragment = fragment;
            this.currentFragmentName = fragmentName;
            
            // ✅ Update active nav item
            this.updateActiveNav(fragmentName);
            
            console.log(`✅ Fragment "${fragmentName}" loaded successfully!\n`);
            
        } catch (error) {
            console.error(`❌ Error loading fragment "${fragmentName}":`, error);
            this.showError(`Gagal memuat halaman: ${error.message}`);
        }
    }

    updateActiveNav(fragmentName) {
        // Remove active class from all nav items
        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.remove('active');
        });
        
        // Add active class to current nav item
        const activeNav = document.querySelector(`[data-fragment="${fragmentName}"]`);
        if (activeNav) {
            activeNav.classList.add('active');
            console.log('✅ Active nav updated');
        }
    }

    showError(message) {
        if (this.container) {
            this.container.innerHTML = `
                <div class="alert alert-danger d-flex align-items-center" role="alert">
                    <i class="bi bi-exclamation-triangle-fill fs-4 me-3"></i>
                    <div class="flex-grow-1">
                        <h5 class="alert-heading">Error</h5>
                        <p class="mb-2">${message}</p>
                        <button class="btn btn-outline-danger btn-sm" onclick="location.reload()">
                            <i class="bi bi-arrow-clockwise me-1"></i>Refresh Halaman
                        </button>
                    </div>
                </div>
            `;
        }
    }

    getCurrentFragment() {
        return this.currentFragment;
    }

    getCurrentFragmentName() {
        return this.currentFragmentName;
    }

    // ✅ Helper method to check if a fragment is loaded
    isFragmentLoaded(fragmentName) {
        return this.currentFragmentName === fragmentName;
    }

    // ✅ Helper method to reload current fragment
    async reloadCurrentFragment() {
        if (this.currentFragmentName) {
            console.log('🔄 Reloading current fragment:', this.currentFragmentName);
            await this.loadFragment(this.currentFragmentName);
        }
    }
}

// ✅ Export to global scope
window.FragmentManager = FragmentManager;

console.log("✅ Fragment Manager class registered globally");