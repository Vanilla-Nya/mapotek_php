// app.js - Main App Initialization with Role-Based Access Control & Lazy Loading
let fragmentManager;

// 🔐 SUBSCRIPTION CHECK ON APP LOAD - ADD THIS AT THE TOP!
(function initializeSubscriptionOnLoad() {
  console.log("🔐 Checking subscription status on app load...");
  
  const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
  const isSubscriptionActive = localStorage.getItem('subscription_active') === 'true';
  const userRole = localStorage.getItem('user_role');
  
  if (isLoggedIn && (userRole === 'dokter' || userRole === 'asisten_dokter')) {
    if (!isSubscriptionActive) {
      console.warn("⚠️ Subscription inactive detected on app load");
      
      // Apply restrictions after a short delay to ensure DOM is ready
      const applySubscriptionRestrictions = () => {
        const navItems = document.querySelectorAll('.nav-item[data-fragment]');
        
        if (navItems.length === 0) {
          console.log("⏳ Nav items not ready yet, retrying...");
          setTimeout(applySubscriptionRestrictions, 200);
          return;
        }
        
        console.log("🔒 Applying subscription restrictions to navigation...");
        
        navItems.forEach(item => {
          const fragment = item.getAttribute('data-fragment');
          
          if (fragment !== 'profile') {
            // Add disabled styling
            item.classList.add('nav-disabled');
            item.style.opacity = '0.5';
            item.style.cursor = 'not-allowed';
            item.style.pointerEvents = 'none';
            
            // Add lock icon if not exists
            if (!item.querySelector('.lock-icon')) {
              const lockIcon = document.createElement('i');
              lockIcon.className = 'bi bi-lock-fill lock-icon ms-2';
              lockIcon.style.fontSize = '12px';
              item.appendChild(lockIcon);
            }
          } else {
            // Ensure profile is accessible
            item.classList.remove('nav-disabled');
            item.style.opacity = '1';
            item.style.cursor = 'pointer';
            item.style.pointerEvents = 'auto';
          }
        });
        
        console.log("✅ Subscription restrictions applied");
        
        // Show subscription banner
        showSubscriptionBannerIfNeeded();
        
        // Force navigate to profile if on restricted page
        const currentFragment = window.location.hash.replace('#', '') || 'dashboard';
        if (currentFragment !== 'profile') {
          console.log("🔄 Redirecting to profile due to inactive subscription...");
          window.location.hash = '#profile';
        }
      };
      
      // Start applying restrictions
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
          setTimeout(applySubscriptionRestrictions, 500);
        });
      } else {
        setTimeout(applySubscriptionRestrictions, 500);
      }
    } else {
      console.log("✅ Subscription active - full access granted");
    }
  }
})();

// Helper function to show subscription banner
function showSubscriptionBannerIfNeeded() {
  const existingBanner = document.getElementById('subscriptionBanner');
  if (existingBanner) return; // Already showing
  
  const banner = document.createElement('div');
  banner.id = 'subscriptionBanner';
  banner.className = 'alert alert-warning alert-dismissible fade show m-0';
  banner.style.cssText = `
    position: fixed;
    top: 70px;
    left: 50%;
    transform: translateX(-50%);
    z-index: 9999;
    max-width: 800px;
    width: 90%;
    box-shadow: 0 4px 20px rgba(0,0,0,0.15);
    border-radius: 10px;
    border: 2px solid #ff9800;
    animation: slideDown 0.3s ease-out;
  `;
  
  const subscriptionData = JSON.parse(localStorage.getItem('subscription_data') || '{}');
  const endDate = subscriptionData.tanggal_berakhir 
    ? new Date(subscriptionData.tanggal_berakhir).toLocaleDateString('id-ID', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    : 'Tidak diketahui';
  
  banner.innerHTML = `
    <div class="d-flex align-items-center">
      <i class="bi bi-exclamation-triangle-fill fs-3 me-3 text-warning"></i>
      <div class="flex-grow-1">
        <h5 class="alert-heading mb-2">
          <i class="bi bi-clock-history me-2"></i>Langganan Anda Telah Habis!
        </h5>
        <p class="mb-2">
          <strong>Status:</strong> ${subscriptionData.status || 'Tidak Aktif'} | 
          <strong>Berakhir:</strong> ${endDate}
        </p>
        <p class="mb-0">
          Silakan perpanjang langganan untuk mengakses semua fitur. 
          Saat ini Anda <strong>hanya dapat mengakses halaman Profile</strong>.
        </p>
        <div class="mt-3">
          <button class="btn btn-warning btn-sm" onclick="window.location.hash='#profile'">
            <i class="bi bi-credit-card me-2"></i>Perpanjang Langganan
          </button>
        </div>
      </div>
      <button type="button" class="btn-close" onclick="this.parentElement.parentElement.remove()"></button>
    </div>
  `;
  
  // Add animation keyframes if not exists
  if (!document.getElementById('subscriptionAnimations')) {
    const style = document.createElement('style');
    style.id = 'subscriptionAnimations';
    style.textContent = `
      @keyframes slideDown {
        from {
          transform: translate(-50%, -100%);
          opacity: 0;
        }
        to {
          transform: translate(-50%, 0);
          opacity: 1;
        }
      }
    `;
    document.head.appendChild(style);
  }
  
  document.body.appendChild(banner);
}

// Helper function to show subscription toast
function showSubscriptionToast() {
  const toastHtml = `
    <div class="toast align-items-center text-bg-warning border-0" role="alert">
      <div class="d-flex">
        <div class="toast-body">
          <i class="bi bi-lock-fill me-2"></i>
          <strong>Akses Ditolak</strong><br>
          Perpanjang langganan untuk mengakses fitur ini.
        </div>
        <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button>
      </div>
    </div>
  `;
  
  let container = document.getElementById('toastContainer');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toastContainer';
    container.className = 'toast-container position-fixed top-0 end-0 p-3';
    container.style.zIndex = '10000';
    document.body.appendChild(container);
  }
  
  container.insertAdjacentHTML('beforeend', toastHtml);
  const toastElement = container.lastElementChild;
  const toast = new bootstrap.Toast(toastElement, { delay: 3000 });
  toast.show();
  
  toastElement.addEventListener('hidden.bs.toast', () => {
    toastElement.remove();
  });
}

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
            console.warn('⚠️ applyRoleBasedUI not available, skipping role-based UI');
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
    // 🔐 CHECK SUBSCRIPTION BEFORE LOADING
    const isSubscriptionActive = localStorage.getItem('subscription_active') === 'true';
    let initialFragment = window.location.hash.slice(1) || 'dashboard';
    
    if (!isSubscriptionActive && initialFragment !== 'profile') {
        console.log('🚫 Subscription inactive, forcing profile load');
        initialFragment = 'profile';
        window.location.hash = '#profile';
    }
    
    console.log(`📍 Loading initial fragment: ${initialFragment}`);
    fragmentManager.loadFragment(initialFragment);
    
    // ========================================
    // 🔧 NAVIGATION HANDLERS WITH SUBSCRIPTION CHECK
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
            
            let fragmentName = navItem.getAttribute('data-fragment');
            console.log(`📍 Navigation clicked: ${fragmentName}`);
            
            // 🔐 CHECK SUBSCRIPTION BEFORE ALLOWING NAVIGATION
            const isSubscriptionActive = localStorage.getItem('subscription_active') === 'true';
            const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
            
            if (isLoggedIn && !isSubscriptionActive && fragmentName !== 'profile') {
                console.warn(`🚫 Access denied to "${fragmentName}" - subscription inactive`);
                showSubscriptionToast();
                fragmentName = 'profile';
                window.location.hash = '#profile';
            }
            
            // 🚨 STEP 1: Emergency cleanup FIRST!
            emergencyCleanupModals();
            
            // 🚨 STEP 2: Small delay to ensure cleanup completes
            setTimeout(() => {
                // Update active state
                navItems.forEach(nav => nav.classList.remove('active'));
                navItem.classList.add('active');
                
                // Update URL hash
                window.location.hash = fragmentName;
                
                // Load fragment
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
    // HANDLE BROWSER BACK/FORWARD BUTTONS WITH SUBSCRIPTION CHECK
    // ========================================
    window.addEventListener('hashchange', function() {
        let fragmentName = window.location.hash.slice(1) || 'dashboard';
        console.log(`📍 Hash changed to: ${fragmentName}`);
        
        // 🔐 CHECK SUBSCRIPTION
        const isSubscriptionActive = localStorage.getItem('subscription_active') === 'true';
        const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
        
        if (isLoggedIn && !isSubscriptionActive && fragmentName !== 'profile') {
            console.warn(`🚫 Access denied via hashchange to "${fragmentName}" - subscription inactive`);
            showSubscriptionToast();
            fragmentName = 'profile';
            window.location.hash = '#profile';
        }
        
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
    // ⭐ GLOBAL HELPER TO NAVIGATE TO ANY FRAGMENT WITH SUBSCRIPTION CHECK
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
        
        // 🔐 CHECK SUBSCRIPTION
        const isSubscriptionActive = localStorage.getItem('subscription_active') === 'true';
        const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
        
        if (isLoggedIn && !isSubscriptionActive && fragmentName !== 'profile') {
            console.warn(`🚫 Access denied to "${fragmentName}" via navigateToFragment - subscription inactive`);
            showSubscriptionToast();
            fragmentName = 'profile';
        }
        
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
    console.log('🔐 Subscription control active');
});

// ========================================
// 🚨 EXPOSE EMERGENCY CLEANUP GLOBALLY
// ========================================
window.emergencyCleanupModals = emergencyCleanupModals;

console.log('📦 app.js loaded - Emergency cleanup available globally');