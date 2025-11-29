// ========================================
// FILE: fragmentmanager.js - Fragment Management System with Lazy Loading
// ========================================

console.log("🎯 Fragment Manager Loading...");

class FragmentManager {
    constructor(containerId) {
        this.containerId = containerId;
        this.container = document.getElementById(containerId);
        this.currentFragment = null;
        this.currentFragmentName = null;
        
        // ✅ Register fragment NAMES only (lazy loading - classes resolved at runtime)
        this.fragmentNames = [
            'dashboard',
            'pasien',
            'obat',
            'antrian',
            'pemeriksaan',
            'pembukuan',
            'profile',
            'asistendokter'
        ];
        
        console.log('✅ Fragment Manager initialized with container:', containerId);
        console.log('📦 Registered fragments:', this.fragmentNames);
    }

    // ✅ Get fragment class by name (lazy loading)
    getFragmentClass(fragmentName) {
        const classMap = {
            'dashboard': typeof DashboardFragment !== 'undefined' ? DashboardFragment : null,
            'pasien': typeof PasienFragment !== 'undefined' ? PasienFragment : null,
            'obat': typeof ObatFragment !== 'undefined' ? ObatFragment : null,
            'antrian': typeof AntrianFragment !== 'undefined' ? AntrianFragment : null,
            'pemeriksaan': typeof PemeriksaanFragment !== 'undefined' ? PemeriksaanFragment : null,
            'pembukuan': typeof PembukuanFragment !== 'undefined' ? PembukuanFragment : null,
            'profile': typeof ProfileFragment !== 'undefined' ? ProfileFragment : null,
            'asistendokter': typeof AsistenDokterFragment !== 'undefined' ? AsistenDokterFragment : null
        };
        
        return classMap[fragmentName] || null;
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
        if (!this.fragmentNames.includes(fragmentName)) {
            console.error(`❌ Fragment "${fragmentName}" not found in registry`);
            console.log('📋 Available fragments:', this.fragmentNames);
            this.showError(`Fragment "${fragmentName}" tidak ditemukan`);
            return;
        }
        
        // ✅ Get fragment class (lazy loading)
        const FragmentClass = this.getFragmentClass(fragmentName);
        
        if (!FragmentClass) {
            console.error(`❌ Fragment class for "${fragmentName}" is not defined`);
            console.log('💡 Make sure the fragment file is loaded and the class is defined');
            this.showError(`Fragment "${fragmentName}" tidak dapat dimuat. Class tidak ditemukan.`);
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
                    try {
                        this.currentFragment.onDestroy();
                    } catch (e) {
                        console.warn('⚠️ Error in onDestroy:', e);
                    }
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
                this.container = document.getElementById(this.containerId);
                if (!this.container) {
                    console.error('❌ Container element not found:', this.containerId);
                    return;
                }
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
                <div class="alert alert-danger d-flex align-items-center m-4" role="alert">
                    <i class="bi bi-exclamation-triangle-fill fs-1 me-3"></i>
                    <div class="flex-grow-1">
                        <h5 class="alert-heading mb-2">Error</h5>
                        <p class="mb-3">${message}</p>
                        <div class="d-flex gap-2">
                            <button class="btn btn-outline-danger btn-sm" onclick="location.reload()">
                                <i class="bi bi-arrow-clockwise me-1"></i>Refresh Halaman
                            </button>
                            <button class="btn btn-danger btn-sm" onclick="window.fragmentManager.loadFragment('dashboard')">
                                <i class="bi bi-house me-1"></i>Ke Dashboard
                            </button>
                        </div>
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
    
    // ✅ Helper method to check which fragments are available
    getAvailableFragments() {
        const available = [];
        const unavailable = [];
        
        this.fragmentNames.forEach(name => {
            if (this.getFragmentClass(name)) {
                available.push(name);
            } else {
                unavailable.push(name);
            }
        });
        
        return { available, unavailable };
    }
    
    // ✅ Debug method to check all fragments
    debugFragments() {
        console.log('\n========== FRAGMENT DEBUG ==========');
        const { available, unavailable } = this.getAvailableFragments();
        console.log('✅ Available fragments:', available);
        console.log('❌ Unavailable fragments:', unavailable);
        console.log('=====================================\n');
        return { available, unavailable };
    }
}

// ✅ Export to global scope
window.FragmentManager = FragmentManager;

console.log("✅ Fragment Manager class registered globally (with lazy loading)");