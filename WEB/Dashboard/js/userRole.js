// ========================================
// FILE: userRole.js - User Role & Access Control
// ========================================

console.log('🔐 Role helper loaded');

/**
 * Get current user's role
 */
function getUserRole() {
    return localStorage.getItem('user_role') || null;
}

/**
 * Check if current user is a doctor
 */
function isDokter() {
    return getUserRole() === 'dokter';
}

/**
 * Check if current user is an asisten dokter
 */
function isAsisten() {
    return getUserRole() === 'asisten_dokter';
}

/**
 * Get current user's doctor ID
 */
function getDokterID() {
    return localStorage.getItem('id_dokter') || null;
}

/**
 * Get user's display name
 */
function getUserDisplayName() {
    const userData = getUserData();
    if (userData) {
        return userData.nama_lengkap || userData.email || 'User';
    }
    
    const user = localStorage.getItem('user');
    if (user) {
        const userObj = JSON.parse(user);
        return userObj.email || 'User';
    }
    
    return 'User';
}

/**
 * Get user data based on role
 */
function getUserData() {
    const role = getUserRole();
    
    if (role === 'dokter') {
        const data = localStorage.getItem('dokter_data');
        return data ? JSON.parse(data) : null;
    } else if (role === 'asisten_dokter') {
        const data = localStorage.getItem('asisten_data');
        return data ? JSON.parse(data) : null;
    }
    
    return null;
}

/**
 * Define which fragments each role can access
 */
const ROLE_PERMISSIONS = {
    dokter: [
        'dashboard',
        'pasien',
        'obat',
        'antrian',
        'pemeriksaan',
        'pembukuan',
        'asistendokter',
        'profile'
    ],
    asisten_dokter: [
        'dashboard',
        'pasien',
        'obat',
        'antrian',
        'pembukuan',
        'profile'
    ]
};

/**
 * Check if user has permission to access a fragment
 */
function canAccessFragment(fragmentName) {
    const role = getUserRole();
    if (!role) return false;
    
    const permissions = ROLE_PERMISSIONS[role] || [];
    return permissions.includes(fragmentName);
}

/**
 * Get list of restricted fragments for current user
 */
function getRestrictedFragments() {
    const role = getUserRole();
    if (!role) return [];
    
    const allowedFragments = ROLE_PERMISSIONS[role] || [];
    const allFragments = ['dashboard', 'pasien', 'obat', 'antrian', 'pemeriksaan', 'pembukuan', 'asistendokter', 'profile'];
    
    return allFragments.filter(f => !allowedFragments.includes(f));
}

/**
 * Apply role-based UI restrictions - AGGRESSIVE VERSION
 */
function applyRoleBasedUI() {
    const role = getUserRole();
    console.log('🎭 Applying role-based UI for role:', role);
    
    if (!role) {
        console.error('❌ No role found!');
        return;
    }
    
    const restricted = getRestrictedFragments();
    console.log('🚫 Should hide:', restricted);
    
    let hiddenCount = 0;
    
    // ⭐ Aggressive hiding with no gaps!
    restricted.forEach(fragmentName => {
        const navItem = document.querySelector(`[data-fragment="${fragmentName}"]`);
        if (navItem) {
            console.log(`   Hiding: ${fragmentName}`);
            
            // Apply aggressive CSS to eliminate gaps
            navItem.style.cssText = `
                display: none !important;
                margin: 0 !important;
                padding: 0 !important;
                height: 0 !important;
                min-height: 0 !important;
                max-height: 0 !important;
                line-height: 0 !important;
                opacity: 0 !important;
                visibility: hidden !important;
                overflow: hidden !important;
                border: none !important;
            `;
            
            hiddenCount++;
        } else {
            console.warn(`   Not found: ${fragmentName}`);
        }
    });
    
    // ⭐ Also fix the parent container gap
    const sidebarNav = document.querySelector('.sidebar-nav');
    if (sidebarNav) {
        sidebarNav.style.gap = '0';
        console.log('✅ Fixed sidebar gap');
    }
    
    console.log(`✅ Hidden ${hiddenCount} items`);
    
    // Update role badge
    updateRoleBadge();
}

/**
 * Update role badge in top bar
 */
function updateRoleBadge() {
    const roleElement = document.querySelector('.top-bar-user-role');
    if (!roleElement) {
        console.warn('⚠️ Role badge element not found');
        return;
    }
    
    const role = getUserRole();
    
    if (role === 'dokter') {
        roleElement.textContent = 'Dokter';
    } else if (role === 'asisten_dokter') {
        roleElement.textContent = 'Asisten Dokter';
    } else {
        roleElement.textContent = 'User';
    }
    
    console.log('✅ Role badge updated to:', roleElement.textContent);
}

/**
 * Check access before loading fragment
 */
function checkFragmentAccess(fragmentName) {
    if (!canAccessFragment(fragmentName)) {
        console.warn(`🚫 Access denied to fragment: ${fragmentName}`);
        
        alert(`⚠️ Akses Ditolak!\n\nAnda tidak memiliki izin untuk mengakses halaman ini.`);
        
        return false;
    }
    
    return true;
}

// Export functions to global scope
window.getUserRole = getUserRole;
window.isDokter = isDokter;
window.isAsisten = isAsisten;
window.getDokterID = getDokterID;
window.getUserDisplayName = getUserDisplayName;
window.getUserData = getUserData;
window.canAccessFragment = canAccessFragment;
window.getRestrictedFragments = getRestrictedFragments;
window.applyRoleBasedUI = applyRoleBasedUI;
window.checkFragmentAccess = checkFragmentAccess;

console.log('✅ Role helper functions available globally');

// ========================================
// AUTO-APPLY WITH MULTIPLE ATTEMPTS
// ========================================
console.log('🎯 Setting up auto-apply with multiple attempts...');

let attemptCount = 0;
const maxAttempts = 5;

function tryApplyUI() {
    attemptCount++;
    console.log(`🔄 Attempt ${attemptCount} to apply role-based UI...`);
    
    const role = getUserRole();
    if (!role) {
        console.warn(`⚠️ No role found on attempt ${attemptCount}`);
        if (attemptCount < maxAttempts) {
            setTimeout(tryApplyUI, 500);
        }
        return;
    }
    
    // Check if navigation items exist
    const navItems = document.querySelectorAll('[data-fragment]');
    if (navItems.length === 0) {
        console.warn(`⚠️ No navigation items found on attempt ${attemptCount}`);
        if (attemptCount < maxAttempts) {
            setTimeout(tryApplyUI, 500);
        }
        return;
    }
    
    console.log(`✅ Found ${navItems.length} navigation items`);
    
    // Apply UI restrictions
    applyRoleBasedUI();
    
    // Verify it worked
    setTimeout(() => {
        const restrictedFragments = getRestrictedFragments(); // ✅ FIXED: was "restricted"
        let allHidden = true;
        
        restrictedFragments.forEach(fragmentName => { // ✅ FIXED: was "restricted"
            const navItem = document.querySelector(`[data-fragment="${fragmentName}"]`);
            if (navItem) {
                const isHidden = window.getComputedStyle(navItem).display === 'none';
                if (!isHidden) {
                    console.warn(`   ⚠️ ${fragmentName} is NOT hidden!`);
                    allHidden = false;
                }
            }
        });
        
        if (!allHidden && attemptCount < maxAttempts) {
            console.log(`⚠️ Not all items hidden, retrying...`);
            setTimeout(tryApplyUI, 500);
        } else if (allHidden) {
            console.log('✅ All restricted items successfully hidden!');
        } else {
            console.error('❌ Failed to hide all items after max attempts');
        }
    }, 100);
}

// Start trying when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        console.log('📄 DOM loaded, starting UI application...');
        setTimeout(tryApplyUI, 300);
    });
} else {
    console.log('📄 DOM already loaded, starting UI application...');
    setTimeout(tryApplyUI, 300);
}

console.log('✅ Role-based UI auto-apply configured');