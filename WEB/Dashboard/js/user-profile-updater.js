// ============================================
// user-profile-updater.js
// Updates top bar profile card with user info
// Must load BEFORE app.js!
// ============================================

console.log('📦 Loading user-profile-updater.js...');

// ============================================
// Update User Profile Function
// Updates top bar profile card
// ============================================
window.updateUserProfile = function(name, email, avatarUrl) {
    console.log('🎨 updateUserProfile called with:', { name, email, avatarUrl });

    // Get top bar elements
    const topBarUserName = document.getElementById('topBarUserName');
    const topBarAvatarImg = document.getElementById('topBarAvatarImg');
    const topBarAvatarIcon = document.getElementById('topBarAvatarIcon');
    const topBarProfile = document.getElementById('topBarProfile');

    // Update name
    if (topBarUserName && name) {
        topBarUserName.textContent = name;
        console.log('✅ Name updated:', name);
    }

    // Update avatar and blur background
    if (topBarProfile && topBarAvatarImg && topBarAvatarIcon) {
        if (avatarUrl) {
            // Show image
            topBarAvatarImg.src = avatarUrl;
            topBarAvatarImg.classList.remove('d-none');
            topBarAvatarIcon.classList.add('d-none');
            
            // Apply blurred background
            topBarProfile.style.setProperty('--topbar-bg-image', `url('${avatarUrl}')`);
            console.log('✅ Avatar updated with photo');
        } else {
            // Show icon
            topBarAvatarImg.classList.add('d-none');
            topBarAvatarIcon.classList.remove('d-none');
            
            // Reset to gradient
            topBarProfile.style.setProperty('--topbar-bg-image', 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)');
            console.log('✅ Avatar updated with icon');
        }
    } else {
        console.warn('⚠️ Top bar elements not found');
    }
};

// ============================================
// Load User Data from Database
// ============================================
async function loadUserData() {
    console.log('🔍 Loading user data from database...');
    
    try {
        // Get user from localStorage
        const userStr = localStorage.getItem('user');
        if (!userStr) {
            console.warn('⚠️ No user found in localStorage');
            return;
        }
        
        const user = JSON.parse(userStr);
        console.log('👤 User from localStorage:', user);
        
        // Check if we have cached dokter_data
        const dokterDataStr = localStorage.getItem('dokter_data');
        if (dokterDataStr) {
            try {
                const dokterData = JSON.parse(dokterDataStr);
                console.log('📦 Using cached dokter data:', dokterData);
                
                const name = dokterData.nama_lengkap || user.email;
                const email = dokterData.email || user.email;
                const avatar = dokterData.foto_profil || dokterData.avatar_url || null;
                
                window.updateUserProfile(name, email, avatar);
                return;
            } catch (e) {
                console.warn('⚠️ Failed to parse cached dokter_data');
            }
        }
        
        // If no cache, fetch from Supabase
        if (!window.supabaseClient) {
            console.warn('⚠️ Supabase client not initialized yet, retrying...');
            setTimeout(loadUserData, 500);
            return;
        }
        
        console.log('🔄 Fetching fresh data from Supabase...');
        
        const { data, error } = await window.supabaseClient
            .from('dokter')
            .select('nama_lengkap, email, foto_profil, avatar_url')
            .eq('id_dokter', user.id)
            .single();
        
        if (error) {
            console.error('❌ Error fetching dokter data:', error);
            // Fallback to user email
            window.updateUserProfile(user.email, user.email, null);
            return;
        }
        
        if (data) {
            console.log('✅ Dokter data loaded:', data);
            
            // Cache the data
            localStorage.setItem('dokter_data', JSON.stringify(data));
            
            // Update UI
            const name = data.nama_lengkap || user.email;
            const email = data.email || user.email;
            const avatar = data.foto_profil || data.avatar_url || null;
            
            window.updateUserProfile(name, email, avatar);
        } else {
            console.warn('⚠️ No dokter data found');
            window.updateUserProfile(user.email, user.email, null);
        }
        
    } catch (error) {
        console.error('❌ Error in loadUserData:', error);
    }
}

// ============================================
// Navigate to Profile Helper
// ============================================
window.navigateToProfile = function() {
    console.log('📍 Navigating to profile...');
    const profileLink = document.querySelector('[data-fragment="profile"]');
    if (profileLink) {
        profileLink.click();
    } else {
        console.warn('⚠️ Profile link not found');
    }
};

// ============================================
// Listen for Profile Updates
// ============================================
window.addEventListener('profileUpdated', function(event) {
    console.log('🔔 Profile updated event received:', event.detail);
    
    // Reload user data from database
    loadUserData();
});

// ============================================
// Auto-load on Page Load
// ============================================
document.addEventListener('DOMContentLoaded', async function() {
    console.log('📄 DOM loaded, initializing user profile...');
    
    // Wait a bit for Supabase to initialize
    setTimeout(() => {
        loadUserData();
    }, 500);
});

console.log('✅ user-profile-updater.js loaded successfully');