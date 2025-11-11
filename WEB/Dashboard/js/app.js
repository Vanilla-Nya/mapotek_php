// ============================================
// app.js - Main Application Entry Point
// ============================================

console.log('🚀 Starting app.js...');

// ============ AUTH CHECK ============
const user = JSON.parse(localStorage.getItem('user') || 'null');
const isLoggedIn = localStorage.getItem('isLoggedIn');

console.log('👤 User from localStorage:', user);
console.log('🔐 isLoggedIn:', isLoggedIn);

if (!isLoggedIn || !user) {
    console.warn('❌ Not logged in, redirecting...');
    window.location.href = '../LandingPage/booksaw-1.0.0/index.html';
}

// ============================================
// 🎨 INITIALIZE USER PROFILE
// Update top bar immediately when page loads
// ============================================
console.log('🎨 Initializing user profile...');

if (user && user.nama_lengkap) {
    // User has complete data
    console.log('✅ User data found:', {
        name: user.nama_lengkap,
        email: user.email,
        avatar: user.avatar_url ? 'Yes' : 'No'
    });
    
    window.updateUserProfile(
        user.nama_lengkap,
        user.email || '',
        user.avatar_url || null
    );
} else {
    // Fallback if user data is incomplete
    console.warn('⚠️ Incomplete user data, using defaults');
    window.updateUserProfile(
        'User',
        user?.email || 'user@example.com',
        null
    );
}

// ============ INITIALIZE FRAGMENT MANAGER ============
console.log('📦 Initializing Fragment Manager...');
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
    console.log('🎛️ Sidebar toggled');
});

// Mobile menu toggle
menuToggle.addEventListener('click', () => {
    sidebar.classList.add('active');
    drawerOverlay.classList.add('active');
    console.log('📱 Mobile menu opened');
});

// Close drawer when clicking overlay
drawerOverlay.addEventListener('click', () => {
    closeMobileDrawer();
});

function closeMobileDrawer() {
    sidebar.classList.remove('active');
    drawerOverlay.classList.remove('active');
    console.log('📱 Mobile menu closed');
}

// Restore sidebar state
if (localStorage.getItem('sidebarCollapsed') === 'true') {
    sidebar.classList.add('collapsed');
    console.log('🎛️ Restored collapsed sidebar state');
}

// ============ NAVIGATION ============
console.log('🧭 Setting up navigation...');

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
        console.log('📄 Loading fragment:', fragmentName);
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
    console.log('🔄 Hash changed to:', hash);
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
console.log('📄 Loading initial fragment:', initialFragment);
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
        console.log('👋 Logging out...');
        document.body.style.animation = 'fadeOut 0.3s ease-out';
        setTimeout(() => {
            localStorage.clear();
            window.location.href = '../LandingPage/booksaw-1.0.0/index.html';
        }, 300);
    }
});

// ============================================
// 🔄 LISTEN FOR PROFILE UPDATES
// When profile changes in ProfileFragment,
// this updates the top bar automatically
// ============================================
window.addEventListener('profileUpdated', (event) => {
    console.log('🔄 Profile update event received:', event.detail);
    
    const { name, email, avatarUrl } = event.detail;
    
    // Update top bar
    window.updateUserProfile(name, email, avatarUrl);
    
    // Update localStorage
    const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
    if (name) currentUser.nama_lengkap = name;
    if (email) currentUser.email = email;
    if (avatarUrl !== undefined) currentUser.avatar_url = avatarUrl;
    localStorage.setItem('user', JSON.stringify(currentUser));
    
    console.log('✅ Profile updated and saved to localStorage');
});

console.log('✅ app.js loaded successfully');