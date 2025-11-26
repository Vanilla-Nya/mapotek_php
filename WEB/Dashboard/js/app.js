// app.js - Main App Initialization with Role-Based Access Control & Lazy Loading
let fragmentManager;

// 🔧 EMERGENCY MODAL CLEANUP FUNCTION - Global!
function emergencyCleanupModals() {
    console.log('🚨 EMERGENCY MODAL CLEANUP!');
    
    // STEP 1: Force remove ALL modal backdrops
    const backdrops = document.querySelectorAll('.modal-backdrop');
    console.log(`   Found ${backdrops.length} backdrops to remove`);
    backdrops.forEach(backdrop => {
        backdrop.classList.remove('show', 'fade');
        backdrop.remove();
    });
    
    // STEP 2: Force close ALL modals
    const modals = document.querySelectorAll('.modal');
    console.log(`   Found ${modals.length} modals to close`);
    modals.forEach(modal => {
        // Use Bootstrap API
        if (typeof bootstrap !== 'undefined') {
            const instance = bootstrap.Modal.getInstance(modal);
            if (instance) {
                try {
                    instance.hide();
                    instance.dispose();
                } catch (e) {
                    console.warn('Could not dispose modal:', e);
                }
            }
        }
        
        // Force CSS cleanup
        modal.classList.remove('show', 'fade');
        modal.style.display = 'none';
        modal.setAttribute('aria-hidden', 'true');
        modal.removeAttribute('aria-modal');
        modal.removeAttribute('role');
    });
    
    // STEP 3: Force reset body - AGGRESSIVE
    document.body.classList.remove('modal-open');
    document.body.style.cssText = '';
    document.body.removeAttribute('data-bs-overflow');
    document.body.removeAttribute('data-bs-padding-right');
    
    // STEP 4: Remove any high z-index overlays
    document.querySelectorAll('div[style*="z-index"]').forEach(el => {
        const zIndex = parseInt(window.getComputedStyle(el).zIndex);
        if (zIndex >= 1040 && zIndex <= 1060) {
            el.remove();
        }
    });
    
    // STEP 5: Force re-enable pointer events on everything
    document.body.style.pointerEvents = '';
    document.documentElement.style.pointerEvents = '';
    
    console.log('✅ Emergency cleanup complete!');
}

// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 App initializing...');
    
    // Check if user is authenticated
    const user = JSON.parse(localStorage.getItem('user') || 'null');
    const token = localStorage.getItem('access_token');

    if (!user || !token) {
        console.log('❌ No user session found, redirecting to login...');
        window.location.href = '../LandingPage/booksaw-1.0.0/index.html';
        return;
    }

    console.log('✅ User authenticated:', user.email);

    // ⭐ STEP 1: Wait a bit for navigation to render, THEN apply role-based UI
    setTimeout(() => {
        console.log('🎯 Applying role-based UI with delay...');
        if (typeof window.applyRoleBasedUI === 'function') {
            window.applyRoleBasedUI();
            console.log('✅ Role-based UI applied successfully');
        } else {
            console.error('❌ applyRoleBasedUI not available!');
        }
    }, 500);
    
    // STEP 2: Initialize Fragment Manager
    if (typeof FragmentManager === 'function') {
        fragmentManager = new FragmentManager('fragmentContainer');
        console.log('✅ Fragment Manager initialized');
    } else {
        console.error('❌ FragmentManager not found!');
        return;
    }
    
    // STEP 3: Update Top Bar Profile
    if (typeof window.updateTopBarProfile === 'function') {
        window.updateTopBarProfile();
    }
    
    // STEP 4: Load initial fragment (Dashboard or from hash)
    const initialFragment = window.location.hash.slice(1) || 'dashboard';
    console.log(`📍 Loading initial fragment: ${initialFragment}`);
    fragmentManager.loadFragment(initialFragment);
    
    // ========================================
    // 🔧 NAVIGATION HANDLERS WITH PERMISSION CHECK
    // ========================================
    const navItems = document.querySelectorAll('[data-fragment]');
    console.log(`📱 Found ${navItems.length} navigation items`);
    
    // ⭐ Use event delegation to prevent multiple listeners
    document.addEventListener('click', function(e) {
        // Check if clicked element or its parent has data-fragment
        const navItem = e.target.closest('[data-fragment]');
        
        if (navItem) {
            e.preventDefault();
            e.stopPropagation();
            
            const fragmentName = navItem.getAttribute('data-fragment');
            console.log(`📍 Navigation clicked: ${fragmentName}`);
            
            // 🚨 STEP 1: Emergency cleanup FIRST!
            emergencyCleanupModals();
            
            // 🚨 STEP 2: Small delay to ensure cleanup completes
            setTimeout(() => {
                // Update active state
                navItems.forEach(nav => nav.classList.remove('active'));
                navItem.classList.add('active');
                
                // Update URL hash
                window.location.hash = fragmentName;
                
                // Load fragment (permission check happens inside loadFragment)
                fragmentManager.loadFragment(fragmentName);
                
                // Close mobile menu if open
                const sidebar = document.getElementById('sidebar');
                const drawerOverlay = document.getElementById('drawerOverlay');
                if (sidebar && sidebar.classList.contains('open')) {
                    sidebar.classList.remove('open');
                    if (drawerOverlay) {
                        drawerOverlay.classList.remove('active');
                    }
                }
            }, 50);
        }
    }, true);
    
    // ========================================
    // HANDLE BROWSER BACK/FORWARD BUTTONS
    // ========================================
    window.addEventListener('hashchange', function() {
        const fragmentName = window.location.hash.slice(1) || 'dashboard';
        console.log(`📍 Hash changed to: ${fragmentName}`);
        
        // Emergency cleanup
        emergencyCleanupModals();
        
        setTimeout(() => {
            // Update active nav
            navItems.forEach(nav => nav.classList.remove('active'));
            const activeNav = document.querySelector(`[data-fragment="${fragmentName}"]`);
            if (activeNav) {
                activeNav.classList.add('active');
            }
            
            // Load fragment
            fragmentManager.loadFragment(fragmentName);
        }, 50);
    });
    
    // ========================================
    // SIDEBAR TOGGLE (Desktop)
    // ========================================
    const sidebarToggle = document.getElementById('sidebarToggle');
    const sidebar = document.getElementById('sidebar');
    
    if (sidebarToggle && sidebar) {
        sidebarToggle.addEventListener('click', function() {
            sidebar.classList.toggle('collapsed');
            const icon = this.querySelector('i');
            
            if (sidebar.classList.contains('collapsed')) {
                icon.classList.remove('bi-chevron-left');
                icon.classList.add('bi-chevron-right');
            } else {
                icon.classList.remove('bi-chevron-right');
                icon.classList.add('bi-chevron-left');
            }
        });
    }
    
    // ========================================
    // MOBILE MENU TOGGLE
    // ========================================
    const menuToggle = document.getElementById('menuToggle');
    const drawerOverlay = document.getElementById('drawerOverlay');
    
    if (menuToggle && sidebar && drawerOverlay) {
        menuToggle.addEventListener('click', function() {
            sidebar.classList.add('open');
            drawerOverlay.classList.add('active');
            document.body.style.overflow = 'hidden';
        });
        
        // Close menu when clicking overlay
        drawerOverlay.addEventListener('click', function() {
            sidebar.classList.remove('open');
            drawerOverlay.classList.remove('active');
            document.body.style.overflow = '';
        });
    }
    
    // ========================================
    // LOGOUT HANDLER
    // ========================================
    const btnLogout = document.getElementById('btnLogoutSidebar');
    if (btnLogout) {
        btnLogout.addEventListener('click', async function(e) {
            e.preventDefault();
            
            if (confirm('Apakah Anda yakin ingin keluar?')) {
                try {
                    // Sign out from Supabase
                    if (window.supabaseClient) {
                        await supabaseClient.auth.signOut();
                    }
                    
                    // Clear all data
                    localStorage.clear();
                    sessionStorage.clear();
                    
                    // Redirect to login
                    window.location.href = '../LandingPage/booksaw-1.0.0/index.html';
                } catch (error) {
                    console.error('Logout error:', error);
                    alert('Gagal logout. Silakan coba lagi.');
                }
            }
        });
    }
    
    // ========================================
    // TOP BAR PROFILE - Navigate to Profile
    // ========================================
    window.navigateToProfile = function() {
        console.log('📍 Navigating to profile from top bar');
        
        // Emergency cleanup first
        emergencyCleanupModals();
        
        setTimeout(() => {
            // Update URL hash
            window.location.hash = 'profile';
            
            // Update active nav
            navItems.forEach(nav => nav.classList.remove('active'));
            const profileNav = document.querySelector('[data-fragment="profile"]');
            if (profileNav) {
                profileNav.classList.add('active');
            }
            
            // Load profile fragment
            fragmentManager.loadFragment('profile');
        }, 50);
    };
    
    // ========================================
    // ⭐ GLOBAL HELPER TO NAVIGATE TO ANY FRAGMENT
    // (Used by Dashboard navigation buttons)
    // ========================================
    window.navigateToFragment = function(fragmentNameOrClass) {
        console.log(`📍 Global navigate called with: ${fragmentNameOrClass}`);
        
        // Convert class name to fragment name if needed
        let fragmentName = fragmentNameOrClass;
        if (typeof fragmentNameOrClass === 'string') {
            // Remove 'Fragment' suffix if present
            fragmentName = fragmentNameOrClass.replace(/Fragment$/i, '').toLowerCase();
        }
        
        console.log(`📍 Navigating to: ${fragmentName}`);
        
        // Emergency cleanup first
        emergencyCleanupModals();
        
        setTimeout(() => {
            // Update URL hash
            window.location.hash = fragmentName;
            
            // Update active nav
            navItems.forEach(nav => nav.classList.remove('active'));
            const targetNav = document.querySelector(`[data-fragment="${fragmentName}"]`);
            if (targetNav) {
                targetNav.classList.add('active');
            }
            
            // Load fragment
            fragmentManager.loadFragment(fragmentName);
        }, 50);
    };
    
    // ========================================
    // 🚨 GLOBAL EMERGENCY CLEANUP ON ESC KEY
    // ========================================
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            console.log('🚨 ESC pressed - emergency cleanup!');
            emergencyCleanupModals();
        }
    });
    
    // ========================================
    // 🚨 EMERGENCY CLEANUP ON WINDOW BLUR
    // ========================================
    window.addEventListener('blur', function() {
        console.log('🚨 Window blur - cleanup check');
        setTimeout(() => {
            const hasOpenModal = document.querySelector('.modal.show');
            if (!hasOpenModal) {
                emergencyCleanupModals();
            }
        }, 100);
    });
    
    console.log('✅ App initialized successfully with role-based access control!');
    console.log('🎭 Current role:', window.getUserRole ? window.getUserRole() : 'unknown');
    console.log('🔄 Lazy loading enabled for Pemeriksaan fragment');
});

// ========================================
// 🚨 EXPOSE EMERGENCY CLEANUP GLOBALLY
// ========================================
window.emergencyCleanupModals = emergencyCleanupModals;

console.log('📦 app.js loaded - Emergency cleanup available globally');