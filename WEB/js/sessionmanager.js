// ========================================
// FILE: session-check.js - Session Management for Dashboard
// ========================================

console.log("🔒 Session check loaded");

// ========================================
// INITIALIZE SESSION ON PAGE LOAD
// ========================================
async function initializeSession() {
  try {
    console.log("🔍 Checking user session...");
    
    // Get current session from Supabase
    const { data: { session }, error } = await supabaseClient.auth.getSession();
    
    if (error) {
      console.error("❌ Error getting session:", error);
      redirectToLogin();
      return null;
    }
    
    if (!session || !session.user) {
      console.warn("⚠️ No active session found");
      redirectToLogin();
      return null;
    }
    
    console.log("✅ Session found:", session.user);
    
    // Update localStorage with fresh session data
    localStorage.setItem("access_token", session.access_token);
    localStorage.setItem("refresh_token", session.refresh_token);
    localStorage.setItem("user", JSON.stringify(session.user));
    localStorage.setItem("isLoggedIn", "true");
    
    // Try to load doctor data
    await loadDoctorData(session.user.id);
    
    // Update UI with user info
    updateUserUI(session.user);
    
    return session.user;
    
  } catch (error) {
    console.error("❌ Session initialization error:", error);
    redirectToLogin();
    return null;
  }
}

// ========================================
// LOAD DOCTOR DATA FROM DATABASE
// ========================================
async function loadDoctorData(userId) {
  try {
    console.log("👨‍⚕️ Loading doctor data for user:", userId);
    
    const { data: dokterData, error } = await supabaseClient
      .from('dokter')
      .select('*')
      .eq('id_dokter', userId)
      .single();
    
    if (error) {
      console.warn("⚠️ Could not load doctor data:", error.message);
      return null;
    }
    
    if (dokterData) {
      console.log("✅ Doctor data loaded:", dokterData);
      localStorage.setItem("dokter_data", JSON.stringify(dokterData));
      return dokterData;
    }
    
    return null;
    
  } catch (error) {
    console.error("❌ Error loading doctor data:", error);
    return null;
  }
}

// ========================================
// UPDATE UI WITH USER INFO
// ========================================
function updateUserUI(user) {
  // Update user name display
  const userNameElements = document.querySelectorAll('[data-user-name]');
  const userEmailElements = document.querySelectorAll('[data-user-email]');
  
  // Get doctor data from localStorage
  const dokterDataStr = localStorage.getItem("dokter_data");
  const dokterData = dokterDataStr ? JSON.parse(dokterDataStr) : null;
  
  const displayName = dokterData?.nama_lengkap || user.user_metadata?.nama_lengkap || user.email;
  
  userNameElements.forEach(el => {
    el.textContent = displayName;
  });
  
  userEmailElements.forEach(el => {
    el.textContent = user.email;
  });
  
  console.log("✅ UI updated with user info");
}

// ========================================
// REDIRECT TO LOGIN
// ========================================
function redirectToLogin() {
  console.warn("🔄 Redirecting to login page...");
  
  // Clear all session data
  localStorage.removeItem("access_token");
  localStorage.removeItem("refresh_token");
  localStorage.removeItem("user");
  localStorage.removeItem("dokter_data");
  localStorage.removeItem("isLoggedIn");
  
  // Redirect to home page with login modal
  setTimeout(() => {
    window.location.href = "/mapotek_php/WEB/index.html";
  }, 100);
}

// ========================================
// HANDLE LOGOUT
// ========================================
async function handleLogout() {
  try {
    console.log("🚪 Logging out...");
    
    // Sign out from Supabase
    const { error } = await supabaseClient.auth.signOut();
    
    if (error) {
      console.error("❌ Logout error:", error);
    }
    
    // Clear localStorage
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("user");
    localStorage.removeItem("dokter_data");
    localStorage.removeItem("isLoggedIn");
    
    console.log("✅ Logged out successfully");
    
    // Redirect to home
    window.location.href = "/mapotek_php/WEB/index.html";
    
  } catch (error) {
    console.error("❌ Logout error:", error);
    // Force clear and redirect anyway
    redirectToLogin();
  }
}

// ========================================
// LISTEN FOR AUTH STATE CHANGES
// ========================================
supabaseClient.auth.onAuthStateChange((event, session) => {
  console.log("🔔 Auth state changed:", event, session);
  
  if (event === 'SIGNED_OUT') {
    redirectToLogin();
  } else if (event === 'SIGNED_IN' && session) {
    console.log("✅ User signed in:", session.user);
    updateUserUI(session.user);
  } else if (event === 'TOKEN_REFRESHED') {
    console.log("🔄 Token refreshed");
    localStorage.setItem("access_token", session.access_token);
    localStorage.setItem("refresh_token", session.refresh_token);
  }
});

// ========================================
// INITIALIZE ON PAGE LOAD
// ========================================
document.addEventListener("DOMContentLoaded", async function() {
  console.log("🚀 Dashboard loading...");
  
  // Initialize session
  const user = await initializeSession();
  
  if (!user) {
    console.error("❌ No user session, redirecting...");
    return;
  }
  
  console.log("✅ Dashboard ready for user:", user.email);
  
  // Setup logout buttons
  const logoutButtons = document.querySelectorAll('[data-logout]');
  logoutButtons.forEach(btn => {
    btn.addEventListener('click', async (e) => {
      e.preventDefault();
      if (confirm('Apakah Anda yakin ingin logout?')) {
        await handleLogout();
      }
    });
  });
});

// ========================================
// EXPORT FUNCTIONS FOR USE IN OTHER SCRIPTS
// ========================================
window.sessionManager = {
  initializeSession,
  loadDoctorData,
  handleLogout,
  updateUserUI
};