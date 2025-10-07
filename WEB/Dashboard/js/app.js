// ============ AUTH CHECK ============
const user = JSON.parse(localStorage.getItem('user') || 'null');
const isLoggedIn = localStorage.getItem('isLoggedIn');

if (!isLoggedIn || !user) {
    window.location.href = '../LandingPage/booksaw-1.0.0/index.html';
}

document.getElementById('userName').textContent = user.nama_lengkap;

// ============ INITIALIZE FRAGMENT MANAGER ============
const fragmentManager = new FragmentManager('fragmentContainer');

// ============ DRAWER CONTROLS ============
const sidebar = document.getElementById('sidebar');
const sidebarToggle = document.getElementById('sidebarToggle');
const menuToggle = document.getElementById('menuToggle');
const drawerOverlay = document.getElementById('drawerOverlay');

// Desktop sidebar toggle
sidebarToggle.addEventListener('click', () => {
    sidebar.classList.toggle('collapsed');
    localStorage.setItem('sidebarCollapsed', sidebar.classList.contains('collapsed'));
});

// Mobile menu toggle
menuToggle.addEventListener('click', () => {
    sidebar.classList.add('active');
    drawerOverlay.classList.add('active');
});

// Close drawer when clicking overlay
drawerOverlay.addEventListener('click', () => {
    closeMobileDrawer();
});

function closeMobileDrawer() {
    sidebar.classList.remove('active');
    drawerOverlay.classList.remove('active');
}

// Restore sidebar state
if (localStorage.getItem('sidebarCollapsed') === 'true') {
    sidebar.classList.add('collapsed');
}

// ============ NAVIGATION ============
document.querySelectorAll('[data-fragment]').forEach(link => {
    link.addEventListener('click', async (e) => {
        e.preventDefault();
        
        // Update active state
        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.remove('active');
        });
        link.classList.add('active');
        
        // Load fragment
        const fragmentName = link.dataset.fragment;
        await fragmentManager.loadFragment(fragmentName);
        
        // Update URL hash
        window.location.hash = fragmentName;
        
        // Close mobile drawer
        closeMobileDrawer();
    });
});

// Handle browser back/forward
window.addEventListener('hashchange', () => {
    const hash = window.location.hash.slice(1) || 'dashboard';
    fragmentManager.loadFragment(hash);
    
    // Update active nav item
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('active');
        if (item.dataset.fragment === hash) {
            item.classList.add('active');
        }
    });
});

// ============ LOAD INITIAL FRAGMENT ============
const initialFragment = window.location.hash.slice(1) || 'dashboard';
fragmentManager.loadFragment(initialFragment);

// Update active nav item on load
document.querySelectorAll('.nav-item').forEach(item => {
    if (item.dataset.fragment === initialFragment) {
        item.classList.add('active');
    } else {
        item.classList.remove('active');
    }
});

// ============ LOGOUT ============
document.getElementById('btnLogoutSidebar').addEventListener('click', (e) => {
    e.preventDefault();
    if (confirm('Yakin ingin logout?')) {
        document.body.style.animation = 'fadeOut 0.3s ease-out';
        setTimeout(() => {
            localStorage.clear();
            window.location.href = '../LandingPage/booksaw-1.0.0/index.html';
        }, 300);
    }
});