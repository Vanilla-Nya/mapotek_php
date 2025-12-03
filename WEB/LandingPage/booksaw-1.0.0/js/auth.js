// ========================================
// FILE: auth.js - Enhanced Authentication (Doctor + Asisten Dokter)
// ========================================

console.log("🔐 Auth script loaded (Enhanced for Asisten)");

// ========================================
// SUBSCRIPTION CHECKER - ADD THIS
// ========================================

async function checkSubscriptionStatus(idDokter) {
  console.log("🔍 Checking subscription for doctor:", idDokter);
  
  try {
    const { data, error } = await supabaseClient
      .from('langganan')
      .select('*')
      .eq('id_dokter', idDokter)
      .order('tanggal_berakhir', { ascending: false })
      .limit(1)
      .single();
    
    if (error && error.code !== 'PGRST116') {
      console.error("❌ Subscription check error:", error);
      return { isActive: false, subscription: null };
    }
    
    if (!data) {
      console.warn("⚠️ No subscription found");
      return { isActive: false, subscription: null };
    }
    
    // ⭐ FIX 1: Set times correctly for date comparison
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Start of today
    
    const endDate = new Date(data.tanggal_berakhir);
    endDate.setHours(23, 59, 59, 999); // End of the last day
    
    // ⭐ FIX 2: Calculate days remaining
    const daysRemaining = Math.ceil((endDate - today) / (1000 * 60 * 60 * 24));
    
    // ⭐ FIX 3: Handle different is_expired data types
    const isExpiredValue = data.is_expired;
    const isExpired = isExpiredValue === 1 || 
                      isExpiredValue === '1' || 
                      isExpiredValue === true ||
                      isExpiredValue === 'true';
    
    // ⭐ FIX 4: Accept both 'active' and 'aktif'
    const statusOk = data.status === 'active' || data.status === 'aktif';
    
    // ⭐ MAIN FIX: Check all conditions (>= 0 allows the last day)
    const isActive = statusOk && 
                     !isExpired && 
                     daysRemaining >= 0;  // Changed from endDate >= today
    
    console.log("📊 Subscription status:", {
      status: data.status,
      statusOk: statusOk,
      is_expired_raw: isExpiredValue,
      is_expired_flag: isExpired,
      endDate: data.tanggal_berakhir,
      today: today.toISOString().split('T')[0],
      daysRemaining: daysRemaining,
      isActive: isActive ? '✅ ACTIVE' : '❌ INACTIVE'
    });
    
    return { isActive, subscription: data };
    
  } catch (error) {
    console.error("❌ Error checking subscription:", error);
    return { isActive: false, subscription: null };
  }
}async function checkSubscriptionStatus(idDokter) {
  console.log("🔍 Checking subscription for doctor:", idDokter);
  
  try {
    const { data, error } = await supabaseClient
      .from('langganan')
      .select('*')
      .eq('id_dokter', idDokter)
      .order('tanggal_berakhir', { ascending: false })
      .limit(1)
      .single();
    
    if (error && error.code !== 'PGRST116') {
      console.error("❌ Subscription check error:", error);
      return { isActive: false, subscription: null };
    }
    
    if (!data) {
      console.warn("⚠️ No subscription found");
      return { isActive: false, subscription: null };
    }
    
    // ⭐ FIX 1: Set times correctly for date comparison
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Start of today
    
    const endDate = new Date(data.tanggal_berakhir);
    endDate.setHours(23, 59, 59, 999); // End of the last day
    
    // ⭐ FIX 2: Calculate days remaining
    const daysRemaining = Math.ceil((endDate - today) / (1000 * 60 * 60 * 24));
    
    // ⭐ FIX 3: Handle different is_expired data types
    const isExpiredValue = data.is_expired;
    const isExpired = isExpiredValue === 1 || 
                      isExpiredValue === '1' || 
                      isExpiredValue === true ||
                      isExpiredValue === 'true';
    
    // ⭐ FIX 4: Accept both 'active' and 'aktif'
    const statusOk = data.status === 'active' || data.status === 'aktif';
    
    // ⭐ MAIN FIX: Check all conditions (>= 0 allows the last day)
    const isActive = statusOk && 
                     !isExpired && 
                     daysRemaining >= 0;  // Changed from endDate >= today
    
    console.log("📊 Subscription status:", {
      status: data.status,
      statusOk: statusOk,
      is_expired_raw: isExpiredValue,
      is_expired_flag: isExpired,
      endDate: data.tanggal_berakhir,
      today: today.toISOString().split('T')[0],
      daysRemaining: daysRemaining,
      isActive: isActive ? '✅ ACTIVE' : '❌ INACTIVE'
    });
    
    return { isActive, subscription: data };
    
  } catch (error) {
    console.error("❌ Error checking subscription:", error);
    return { isActive: false, subscription: null };
  }
}

function applySubscriptionRestrictions(isActive) {
  localStorage.setItem('subscription_active', isActive ? 'true' : 'false');
  
  if (!isActive) {
    console.warn("🚫 Subscription inactive - applying restrictions");
    
    // Wait for DOM to be ready
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => {
        showSubscriptionWarning();
        disableNavigationExceptProfile();
      });
    } else {
      showSubscriptionWarning();
      disableNavigationExceptProfile();
    }
  } else {
    console.log("✅ Subscription active - full access granted");
  }
}

function showSubscriptionWarning() {
  const existing = document.getElementById('subscriptionWarning');
  if (existing) existing.remove();
  
  const warning = document.createElement('div');
  warning.id = 'subscriptionWarning';
  warning.className = 'alert alert-warning alert-dismissible fade show';
  warning.style.cssText = 'position: fixed; top: 80px; left: 50%; transform: translateX(-50%); z-index: 9999; max-width: 600px; box-shadow: 0 4px 12px rgba(0,0,0,0.15);';
  warning.innerHTML = `
    <div class="d-flex align-items-center">
      <i class="bi bi-exclamation-triangle-fill fs-4 me-3"></i>
      <div class="flex-grow-1">
        <strong>Langganan Anda Telah Habis!</strong>
        <p class="mb-0 mt-1 small">
          Silakan perpanjang langganan untuk mengakses semua fitur. 
          Saat ini Anda hanya dapat mengakses halaman profil.
        </p>
      </div>
      <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    </div>
  `;
  
  document.body.appendChild(warning);
}

function disableNavigationExceptProfile() {
  // Target your specific nav items
  const navItems = document.querySelectorAll('.nav-item[data-fragment]');
  
  navItems.forEach(item => {
    const fragment = item.getAttribute('data-fragment');
    
    // Allow only profile access
    if (fragment !== 'profile') {
      item.classList.add('disabled');
      item.style.opacity = '0.5';
      item.style.cursor = 'not-allowed';
      item.style.pointerEvents = 'none';
      
      // Remove any existing click handlers
      const newItem = item.cloneNode(true);
      item.parentNode.replaceChild(newItem, item);
      
      // Add new click handler that shows warning
      newItem.addEventListener('click', function(e) {
        e.preventDefault();
        e.stopPropagation();
        showToast('Fitur Terbatas', 'Perpanjang langganan untuk mengakses fitur ini', 'warning');
        return false;
      }, true);
    }
  });
  
  console.log("🔒 Navigation locked except Profile");
}

function showToast(title, message, type = 'info') {
  const toastHtml = `
    <div class="toast align-items-center text-bg-${type} border-0" role="alert">
      <div class="d-flex">
        <div class="toast-body">
          <strong>${title}</strong><br>${message}
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
  const toast = new bootstrap.Toast(toastElement);
  toast.show();
  
  toastElement.addEventListener('hidden.bs.toast', () => {
    toastElement.remove();
  });
}

// Add this to your FragmentManager access control
window.checkFragmentAccess = function(fragmentName) {
  const isSubscriptionActive = localStorage.getItem('subscription_active') === 'true';
  
  // Always allow profile access
  if (fragmentName === 'profile') {
    return true;
  }
  
  // Check subscription for other fragments
  if (!isSubscriptionActive) {
    console.warn(`🚫 Access denied to "${fragmentName}" - subscription inactive`);
    showToast('Akses Ditolak', 'Perpanjang langganan untuk mengakses fitur ini', 'warning');
    return false;
  }
  
  return true;
};

// ========================================
// DETERMINE USER ROLE (DOCTOR OR ASISTEN)
// ========================================
async function determineUserRole(user) {
  console.log("🔍 Determining user role for:", user.id);
  console.log("📧 User email:", user.email);
  
  try {
    // Check if user is a doctor
    const { data: dokterData, error: dokterError } = await supabaseClient
      .from('dokter')
      .select('*')
      .eq('id_dokter', user.id)
      .single();
    
    if (dokterData && !dokterError) {
      console.log("👨‍⚕️ User is a DOCTOR");
      localStorage.setItem("user_role", "dokter");
      localStorage.setItem("user_type", "dokter");
      localStorage.setItem("id_dokter", dokterData.id_dokter);
      localStorage.setItem("dokter_data", JSON.stringify(dokterData));
      
      // ✅ CHECK SUBSCRIPTION
      const { isActive, subscription } = await checkSubscriptionStatus(dokterData.id_dokter);
      applySubscriptionRestrictions(isActive);
      
      if (subscription) {
        localStorage.setItem('subscription_data', JSON.stringify(subscription));
      }
      
      return "dokter";
    }
    
    console.log("❌ Not a doctor, checking asisten...");
    
    // Check asisten_dokter
    const { data: asistenData, error: asistenError } = await supabaseClient
      .from('asisten_dokter')
      .select('*')
      .eq('id_asisten_dokter', user.id)
      .single();
    
    if (asistenData && !asistenError) {
      console.log("👔 User is an ASISTEN DOKTER:", asistenData);
      localStorage.setItem("user_role", "asisten_dokter");
      localStorage.setItem("user_type", "asisten_dokter");
      localStorage.setItem("id_asisten_dokter", asistenData.id_asisten_dokter);
      localStorage.setItem("id_dokter", asistenData.id_dokter);
      localStorage.setItem("asisten_data", JSON.stringify(asistenData));
      
      // ✅ CHECK SUBSCRIPTION (using doctor's ID)
      const { isActive, subscription } = await checkSubscriptionStatus(asistenData.id_dokter);
      applySubscriptionRestrictions(isActive);
      
      if (subscription) {
        localStorage.setItem('subscription_data', JSON.stringify(subscription));
      }
      
      return "asisten_dokter";
    }
    
    // No match found
    console.error("❌ User not found in dokter or asisten_dokter tables!");
    alert(
      `⚠️ Akun Tidak Terdaftar!\n\n` +
      `Email: ${user.email}\n` +
      `User ID: ${user.id}\n\n` +
      `Akun ini belum terdaftar sebagai Dokter atau Asisten.\n` +
      `Silakan hubungi administrator.`
    );
    
    return "unknown";
    
  } catch (error) {
    console.error("❌ Error determining user role:", error);
    alert(`Error: ${error.message}`);
    return "unknown";
  }
}

// Helper function to show alerts
function showAlert(alertElement, message, type) {
  if (!alertElement) return;
  
  alertElement.className = `alert alert-${type}`;
  alertElement.textContent = message;
  alertElement.style.display = "block";
  
  setTimeout(() => {
    alertElement.style.display = "none";
  }, 5000);
}

// ========================================
// WAIT FOR DOM TO BE FULLY LOADED (ONLY ONCE!)
// ========================================
document.addEventListener("DOMContentLoaded", function () {
  console.log("📄 DOM loaded, initializing auth...");

  // ========================================
  // CHECK IF USER IS ALREADY LOGGED IN
  // ========================================
  async function checkUserSession() {
    try {
      const { data: { session }, error } = await supabaseClient.auth.getSession();
      
      if (session && session.user) {
        console.log("✅ User already logged in:", session.user);
        localStorage.setItem("access_token", session.access_token);
        localStorage.setItem("user", JSON.stringify(session.user));
        localStorage.setItem("isLoggedIn", "true");
        
        // Determine if doctor or assistant
        await determineUserRole(session.user);
        
        return session.user;
      }
      
      return null;
    } catch (error) {
      console.error("❌ Error checking session:", error);
      return null;
    }
  }

  // Check session on page load
  checkUserSession();

  // ========================================
  // MODAL CONTROLS (NEW LANDING PAGE)
  // ========================================
  const modal = document.getElementById("authModalOverlay");
  const openLoginBtns = document.querySelectorAll("#openLogin");
  const openRegisterBtns = document.querySelectorAll("#openRegister");
  const closeBtn = document.querySelector(".close");
  const loginFormDiv = document.getElementById("loginForm");
  const registerFormDiv = document.getElementById("registerForm");
  const toRegisterLink = document.getElementById("toRegister");
  const toLoginLink = document.getElementById("toLogin");

  if (!modal) {
    console.warn("⚠️ Auth modal not found!");
    return;
  }

  console.log("✅ Modal found, setting up controls...");

  // OPEN LOGIN
  openLoginBtns.forEach((btn) => {
    btn.addEventListener("click", function(e) {
      e.preventDefault();
      console.log("🔓 LOGIN clicked");
      
      modal.style.display = "flex";
      setTimeout(() => modal.classList.add("show-modal"), 10);
      
      loginFormDiv.style.display = "block";
      registerFormDiv.style.display = "none";
    });
  });

  // OPEN REGISTER
  openRegisterBtns.forEach((btn) => {
    btn.addEventListener("click", function(e) {
      e.preventDefault();
      console.log("📝 REGISTER clicked");
      
      modal.style.display = "flex";
      setTimeout(() => modal.classList.add("show-modal"), 10);
      
      registerFormDiv.style.display = "block";
      loginFormDiv.style.display = "none";
    });
  });

  // SWITCH TO REGISTER
  if (toRegisterLink) {
    toRegisterLink.addEventListener("click", function(e) {
      e.preventDefault();
      loginFormDiv.style.display = "none";
      registerFormDiv.style.display = "block";
    });
  }

  // SWITCH TO LOGIN
  if (toLoginLink) {
    toLoginLink.addEventListener("click", function(e) {
      e.preventDefault();
      registerFormDiv.style.display = "none";
      loginFormDiv.style.display = "block";
    });
  }

  // CLOSE MODAL
  if (closeBtn) {
    closeBtn.addEventListener("click", () => closeModal());
  }

  modal.addEventListener("click", function(e) {
    if (e.target === modal) {
      closeModal();
    }
  });

  document.addEventListener("keydown", function(e) {
    if (e.key === "Escape" && modal.style.display === "flex") {
      closeModal();
    }
  });

  function closeModal() {
    modal.classList.remove("show-modal");
    setTimeout(() => {
      modal.style.display = "none";
    }, 300);
  }

  // ========================================
  // LOGIN HANDLER
  // ========================================
  const loginForm = document.querySelector("#loginForm form");
  
  if (loginForm) {
    console.log("✅ Login form found");
    
    loginForm.addEventListener("submit", async function(e) {
      e.preventDefault();
      console.log("🔐 Login attempt started");

      const email = document.getElementById("loginEmail").value.trim();
      const password = document.getElementById("loginPassword").value;
      const submitBtn = e.target.querySelector('button[type="submit"]');
      const loginAlert = document.getElementById("loginAlert");

      // Validate
      if (!email || !password) {
        showAlert(loginAlert, "Email dan password harus diisi!", "danger");
        return;
      }

      // Show loading
      const originalText = submitBtn.innerHTML;
      submitBtn.disabled = true;
      submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Memproses...';

      try {
        // Login via Supabase
        const { data, error } = await supabaseClient.auth.signInWithPassword({
          email: email,
          password: password
        });

        if (error) {
          console.error("❌ Login error:", error);
          showAlert(loginAlert, `Login gagal: ${error.message}`, "danger");
          submitBtn.disabled = false;
          submitBtn.innerHTML = originalText;
          return;
        }

        if (data && data.user) {
          console.log("✅ Login successful:", data.user);
          
          // Save to localStorage
          localStorage.setItem("access_token", data.session.access_token);
          localStorage.setItem("user", JSON.stringify(data.user));
          localStorage.setItem("isLoggedIn", "true");

          // Determine role
          const role = await determineUserRole(data.user);
          
          if (role === "unknown") {
            showAlert(loginAlert, "Akun tidak terdaftar sebagai dokter atau asisten!", "danger");
            submitBtn.disabled = false;
            submitBtn.innerHTML = originalText;
            return;
          }

          // Success - redirect based on role
          showAlert(loginAlert, "Login berhasil! Mengalihkan...", "success");
          
          setTimeout(() => {
            if (role === "dokter") {
              window.location.href = "../../Dashboard/index.html";
            } else if (role === "asisten_dokter") {
              window.location.href = "../../Dashboard/index.html";
            }
          }, 1000);
        }

      } catch (error) {
        console.error("❌ Login error:", error);
        showAlert(loginAlert, `Error: ${error.message}`, "danger");
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalText;
      }
    });
  } else {
    console.warn("⚠️ Login form not found!");
  }

  // ========================================
  // REGISTRATION HANDLER
  // ========================================
  const dokterRegistrationForm = document.getElementById("dokterRegistrationForm");
  
  if (dokterRegistrationForm) {
    console.log("✅ Registration form found");
    
    // Auto-generate username from name input
    const namaInput = document.getElementById("dokterNama");
    const usernameInput = document.getElementById("dokterUsername");
    
    if (namaInput && usernameInput) {
      namaInput.addEventListener("input", function() {
        const nama = this.value.trim();
        if (nama) {
          const username = nama
            .toLowerCase()
            .replace(/\s+/g, "")
            .replace(/[^a-z0-9]/g, "");
          usernameInput.value = username;
        }
      });
    }

    // Handle form submission
    dokterRegistrationForm.addEventListener("submit", async function (e) {
      e.preventDefault();

      // Validate NIK (must be 16 digits)
      const nik = document.getElementById("dokterNIK").value.trim();
      if (nik.length !== 16 || !/^\d{16}$/.test(nik)) {
        alert("NIK harus 16 digit angka!");
        return;
      }

      // Validate password match
      const password = document.getElementById("dokterPassword").value;
      const passwordConfirm = document.getElementById("dokterPasswordConfirm").value;

      if (password.length < 6) {
        alert("Password minimal 6 karakter!");
        return;
      }

      if (password !== passwordConfirm) {
        alert("Password dan Konfirmasi Password tidak sama!");
        return;
      }

      // Validate phone number
      const phone = document.getElementById("dokterPhone").value.trim();
      if (!/^[0-9+\-\s()]+$/.test(phone)) {
        alert("Nomor telepon tidak valid!");
        return;
      }

      const submitBtn = e.target.querySelector('button[type="submit"]');
      const originalText = submitBtn.innerHTML;
      submitBtn.disabled = true;
      submitBtn.innerHTML =
        '<span class="spinner-border spinner-border-sm me-2"></span>Mendaftar...';

      const registrationData = {
        action: "register_doctor_direct",
        data: {
          nik: nik,
          nama: document.getElementById("dokterNama").value.trim(),
          tanggal_lahir: document.getElementById("dokterTanggalLahir").value,
          gender: document.getElementById("dokterGender").value,
          username: document.getElementById("dokterUsername").value.trim(),
          email: document.getElementById("dokterEmail").value.trim(),
          alamat: document.getElementById("dokterAlamat").value.trim(),
          no_telp: phone,
          password: password,
        },
      };

      console.log("💾 Registering doctor with data:", registrationData);

      try {
        const response = await fetch(
          "/MAPOTEK_PHP/WEB/API/auth/auth.php",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(registrationData),
          }
        );

        const result = await response.json();
        console.log("💾 Full registration result:", result);

        if (result.success && result.data && result.data.id_dokter) {
          console.log("✅ SUCCESS: Doctor registered with ID:", result.data.id_dokter);

          alert(
            `✅ Registrasi Berhasil!\n\n` +
            `Selamat datang, ${registrationData.data.nama}!\n\n` +
            `Email: ${registrationData.data.email}\n` +
            `Username: ${registrationData.data.username}\n` +
            `ID Dokter: ${result.data.id_dokter}\n\n` +
            `Silakan login untuk melanjutkan.`
          );

          // Reset form and switch to login
          dokterRegistrationForm.reset();
          registerFormDiv.style.display = "none";
          loginFormDiv.style.display = "block";
        } else {
          console.error("❌ Registration failed:", result);
          alert(`❌ Registrasi Gagal!\n\n${result.message || "Terjadi kesalahan."}`);
        }
      } catch (error) {
        console.error("❌ Fetch error:", error);
        alert(`Terjadi kesalahan jaringan:\n\n${error.message}`);
      } finally {
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalText;
      }
    });
  } else {
    console.warn("⚠️ Registration form not found!");
  }

  console.log("✅ Auth handlers ready (Enhanced for Asisten)");
});

// ========================================
// PASSWORD TOGGLE FUNCTIONALITY
// ========================================
function initializePasswordToggles() {
  const toggleButtons = document.querySelectorAll('.toggle-password');
  
  toggleButtons.forEach(button => {
    button.addEventListener('click', function(e) {
      e.preventDefault();
      
      const targetId = this.getAttribute('data-target');
      const passwordInput = document.getElementById(targetId);
      const icon = this.querySelector('i');
      
      if (passwordInput) {
        // Toggle password visibility
        if (passwordInput.type === 'password') {
          passwordInput.type = 'text';
          icon.classList.remove('bi-eye');
          icon.classList.add('bi-eye-slash');
        } else {
          passwordInput.type = 'password';
          icon.classList.remove('bi-eye-slash');
          icon.classList.add('bi-eye');
        }
      }
    });
  });
}

// Call this function after DOM is loaded
// Add this line after line 217 in your auth.js (after the console.log)
initializePasswordToggles();
console.log("✅ Password toggle handlers ready");

// Check subscription and apply restrictions on page load
async function initializeSubscriptionControl() {
  console.log("🔐 Initializing subscription control...");
  
  const idDokter = localStorage.getItem('id_dokter');
  
  if (!idDokter) {
    console.warn("⚠️ No doctor ID found, skipping subscription check");
    return;
  }
  
  const { isActive, subscription } = await checkSubscriptionStatus(idDokter);
  
  // Store subscription status
  localStorage.setItem('subscription_active', isActive ? 'true' : 'false');
  
  if (subscription) {
    localStorage.setItem('subscription_data', JSON.stringify(subscription));
  }
  
  // Apply restrictions if inactive
  if (!isActive) {
    console.warn("🚫 Subscription inactive - restricting access");
    applyNavigationRestrictions();
    showSubscriptionBanner();
    
    // Force navigate to profile if on restricted page
    const currentFragment = window.location.hash.replace('#', '') || 'dashboard';
    if (currentFragment !== 'profile') {
      console.log("🔄 Redirecting to profile...");
      window.location.hash = '#profile';
    }
  } else {
    console.log("✅ Subscription active - full access granted");
    removeNavigationRestrictions();
  }
}

// Apply navigation restrictions
function applyNavigationRestrictions() {
  console.log("🔒 Applying navigation restrictions...");
  
  // Get all nav items
  const navItems = document.querySelectorAll('.nav-item[data-fragment]');
  
  navItems.forEach(item => {
    const fragment = item.getAttribute('data-fragment');
    
    // Only allow Profile access
    if (fragment !== 'profile') {
      // Add disabled styling
      item.classList.add('nav-disabled');
      item.style.opacity = '0.5';
      item.style.cursor = 'not-allowed';
      item.style.pointerEvents = 'none';
      
      // Add visual indicator
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
  
  // Override fragment navigation
  if (window.FragmentManager) {
    const originalLoadFragment = window.FragmentManager.loadFragment;
    window.FragmentManager.loadFragment = function(fragmentName) {
      const isSubscriptionActive = localStorage.getItem('subscription_active') === 'true';
      
      if (!isSubscriptionActive && fragmentName !== 'profile') {
        console.warn(`🚫 Access denied to "${fragmentName}" - subscription required`);
        showSubscriptionToast();
        // Force load profile instead
        return originalLoadFragment.call(this, 'profile');
      }
      
      return originalLoadFragment.call(this, fragmentName);
    };
  }
  
  console.log("✅ Navigation restrictions applied");
}

// Remove navigation restrictions
function removeNavigationRestrictions() {
  console.log("🔓 Removing navigation restrictions...");
  
  const navItems = document.querySelectorAll('.nav-item[data-fragment]');
  
  navItems.forEach(item => {
    item.classList.remove('nav-disabled');
    item.style.opacity = '1';
    item.style.cursor = 'pointer';
    item.style.pointerEvents = 'auto';
    
    // Remove lock icons
    const lockIcon = item.querySelector('.lock-icon');
    if (lockIcon) {
      lockIcon.remove();
    }
  });
  
  // Remove subscription banner
  const banner = document.getElementById('subscriptionBanner');
  if (banner) {
    banner.remove();
  }
  
  console.log("✅ Navigation restrictions removed");
}

// Show persistent subscription banner
function showSubscriptionBanner() {
  // Remove existing banner if any
  const existingBanner = document.getElementById('subscriptionBanner');
  if (existingBanner) {
    existingBanner.remove();
  }
  
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
  
  // Add animation keyframes
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

// Show toast notification
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

// Call this function after user logs in and on page load
document.addEventListener('DOMContentLoaded', () => {
  // Check if user is logged in
  const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
  const userRole = localStorage.getItem('user_role');
  
  if (isLoggedIn && (userRole === 'dokter' || userRole === 'asisten_dokter')) {
    console.log("🔐 User logged in, checking subscription...");
    
    // Small delay to ensure DOM is fully ready
    setTimeout(() => {
      initializeSubscriptionControl();
    }, 800);
  }
});

// Also run on window load as a backup
window.addEventListener('load', () => {
  const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
  const userRole = localStorage.getItem('user_role');
  
  if (isLoggedIn && (userRole === 'dokter' || userRole === 'asisten_dokter')) {
    // Run again to ensure restrictions are applied
    setTimeout(() => {
      const isSubscriptionActive = localStorage.getItem('subscription_active') === 'true';
      if (!isSubscriptionActive) {
        console.log("🔄 Re-applying subscription restrictions...");
        applyNavigationRestrictions();
        showSubscriptionBanner();
      }
    }, 1000);
  }
});

// Also check on hash change (when navigating between pages)
window.addEventListener('hashchange', () => {
  const isSubscriptionActive = localStorage.getItem('subscription_active') === 'true';
  
  if (!isSubscriptionActive) {
    const currentFragment = window.location.hash.replace('#', '') || 'dashboard';
    
    if (currentFragment !== 'profile') {
      console.warn("🚫 Subscription inactive - redirecting to profile");
      showSubscriptionToast();
      window.location.hash = '#profile';
    }
  }
});

// Export functions for use in other files
window.subscriptionControl = {
  initialize: initializeSubscriptionControl,
  checkStatus: checkSubscriptionStatus,
  applyRestrictions: applyNavigationRestrictions,
  removeRestrictions: removeNavigationRestrictions,
  showBanner: showSubscriptionBanner,
  showToast: showSubscriptionToast
};