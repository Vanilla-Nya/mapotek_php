// Fragment Manager - handles all fragment operations
class FragmentManager {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        this.currentFragment = null;
        this.isAnimating = false;
        this.fragmentInstances = {};
        
        // Initialize all fragments
        this.initFragments();
    }

    initFragments() {
        // Create instances of all fragment classes
        this.fragmentInstances = {
            dashboard: new DashboardFragment(),
            pasien: new PasienFragment(),
            obat: new ObatFragment(),
            antrian: new AntrianFragment(),
            pemeriksaan: new PemeriksaanFragment(),
            pembukuan: new PembukuanFragment(),
            profile: new ProfileFragment()
        };
    }

    // Load fragment with animation
    async loadFragment(fragmentName) {
        console.log('Loading fragment:', fragmentName); // Debug
        
        // Prevent multiple animations
        if (this.isAnimating) {
            console.log('Animation in progress, skipping');
            return;
        }
        
        const fragment = this.fragmentInstances[fragmentName];
        if (!fragment) {
            console.error(`Fragment "${fragmentName}" not found`);
            return;
        }

        // Don't reload same fragment
        if (this.currentFragment === fragmentName) {
            console.log('Same fragment, skipping');
            return;
        }

        this.isAnimating = true;

        // Fade out current content
        await this.fadeOut();

        // Cleanup previous fragment
        if (this.currentFragment && this.fragmentInstances[this.currentFragment]) {
            this.fragmentInstances[this.currentFragment].onDestroy();
        }

        // Update page title
        document.getElementById('pageTitle').innerHTML = `
            <i class="bi ${fragment.icon} me-2"></i>${fragment.title}
        `;

        // Render new fragment
        this.container.innerHTML = fragment.render();

        // Animate in
        this.animateIn();

        this.currentFragment = fragmentName;

        // Initialize fragment
        await fragment.onInit();

        this.isAnimating = false;
        
        console.log('Fragment loaded:', fragmentName); // Debug
    }

    // Fade out animation
    fadeOut() {
        return new Promise(resolve => {
            this.container.style.animation = 'fadeOut 0.15s ease-out';
            setTimeout(() => {
                this.container.style.animation = '';
                resolve();
            }, 150);
        });
    }

    // Animate in
    animateIn() {
        this.container.style.animation = 'fadeSlideIn 0.3s ease-out';
        setTimeout(() => {
            this.container.style.animation = '';
        }, 300);
    }
}