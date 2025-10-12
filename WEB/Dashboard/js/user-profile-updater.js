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

console.log('✅ user-profile-updater.js loaded successfully');