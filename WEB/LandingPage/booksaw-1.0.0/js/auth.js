// ========================================
// FILE: auth.js - Enhanced Authentication with Forgot Password
// ========================================

console.log("🔐 Auth script loaded (Enhanced with Forgot Password)");

// ========================================
// SUBSCRIPTION CHECKER
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
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const endDate = new Date(data.tanggal_berakhir);
    endDate.setHours(23, 59, 59, 999);
    
    const daysRemaining = Math.ceil((endDate - today) / (1000 * 60 * 60 * 24));
    
    const isExpiredValue = data.is_expired;
    const isExpired = isExpiredValue === 1 || 
                      isExpiredValue === '1' || 
                      isExpiredValue === true ||
                      isExpiredValue === 'true';
    
    const statusOk = data.status === 'active' || data.status === 'aktif';
    
    const isActive = statusOk && !isExpired && daysRemaining >= 0;
    
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
  const navItems = document.querySelectorAll('.nav-item[data-fragment]');
  
  navItems.forEach(item => {
    const fragment = item.getAttribute('data-fragment');
    
    if (fragment !== 'profile') {
      item.classList.add('disabled');
      item.style.opacity = '0.5';
      item.style.cursor = 'not-allowed';
      item.style.pointerEvents = 'none';
      
      const newItem = item.cloneNode(true);
      item.parentNode.replaceChild(newItem, item);
      
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

window.checkFragmentAccess = function(fragmentName) {
  const isSubscriptionActive = localStorage.getItem('subscription_active') === 'true';
  
  if (fragmentName === 'profile') {
    return true;
  }
  
  if (!isSubscriptionActive) {
    console.warn(`🚫 Access denied to "${fragmentName}" - subscription inactive`);
    showToast('Akses Ditolak', 'Perpanjang langganan untuk mengakses fitur ini', 'warning');
    return false;
  }
  
  return true;
};

// ========================================
// DETERMINE USER ROLE
// ========================================
async function determineUserRole(user) {
  console.log("🔍 Determining user role for:", user.id);
  console.log("📧 User email:", user.email);
  
  try {
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
      
      const { isActive, subscription } = await checkSubscriptionStatus(dokterData.id_dokter);
      applySubscriptionRestrictions(isActive);
      
      if (subscription) {
        localStorage.setItem('subscription_data', JSON.stringify(subscription));
      }
      
      return "dokter";
    }
    
    console.log("❌ Not a doctor, checking asisten...");
    
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
      
      const { isActive, subscription } = await checkSubscriptionStatus(asistenData.id_dokter);
      applySubscriptionRestrictions(isActive);
      
      if (subscription) {
        localStorage.setItem('subscription_data', JSON.stringify(subscription));
      }
      
      return "asisten_dokter";
    }
    
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

// ========================================
// HELPER: Show Alert
// ========================================
function showAlert(alertElement, message, type) {
  if (!alertElement) return;
  
  alertElement.className = `alert alert-${type}`;
  alertElement.textContent = message;
  alertElement.style.display = "block";
  
  if (type === 'success') {
    setTimeout(() => {
      alertElement.style.display = "none";
    }, 8000);
  } else {
    setTimeout(() => {
      alertElement.style.display = "none";
    }, 5000);
  }
}

// ========================================
// HELPER: Show Toast
// ========================================
function showToast(title, message, type = 'info') {
  const typeMap = {
    'success': 'success',
    'danger': 'danger',
    'warning': 'warning',
    'info': 'info'
  };
  
  const bgClass = typeMap[type] || 'info';
  
  const iconMap = {
    'success': 'bi-check-circle-fill',
    'danger': 'bi-x-circle-fill',
    'warning': 'bi-exclamation-triangle-fill',
    'info': 'bi-info-circle-fill'
  };
  
  const icon = iconMap[type] || 'bi-info-circle-fill';
  
  const toastHtml = `
    <div class="toast align-items-center text-bg-${bgClass} border-0" role="alert" style="min-width: 300px;">
      <div class="d-flex">
        <div class="toast-body">
          <div class="d-flex align-items-start">
            <i class="bi ${icon} fs-5 me-2 flex-shrink-0"></i>
            <div>
              <strong class="d-block mb-1">${title}</strong>
              <span class="small">${message}</span>
            </div>
          </div>
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
  const toast = new bootstrap.Toast(toastElement, { 
    delay: type === 'danger' ? 5000 : 3000
  });
  toast.show();
  
  toastElement.addEventListener('hidden.bs.toast', () => {
    toastElement.remove();
  });
}

// ========================================
// DOM LOADED - MAIN INITIALIZATION
// ========================================
document.addEventListener("DOMContentLoaded", function () {
  console.log("📄 DOM loaded, initializing auth...");

  // ========================================
  // CHECK USER SESSION
  // ========================================
  async function checkUserSession() {
    try {
      const { data: { session }, error } = await supabaseClient.auth.getSession();
      
      if (session && session.user) {
        console.log("✅ User already logged in:", session.user);
        localStorage.setItem("access_token", session.access_token);
        localStorage.setItem("user", JSON.stringify(session.user));
        localStorage.setItem("isLoggedIn", "true");
        
        await determineUserRole(session.user);
        
        return session.user;
      }
      
      return null;
    } catch (error) {
      console.error("❌ Error checking session:", error);
      return null;
    }
  }

  checkUserSession();

  // ========================================
  // MODAL ELEMENTS
  // ========================================
  const modal = document.getElementById("authModalOverlay");
  const openLoginBtns = document.querySelectorAll("#openLogin");
  const openRegisterBtns = document.querySelectorAll("#openRegister");
  const closeBtn = document.querySelector(".close");
  
  const loginFormDiv = document.getElementById("loginForm");
  const registerFormDiv = document.getElementById("registerForm");
  const forgotPasswordFormDiv = document.getElementById("forgotPasswordForm");
  
  const toRegisterLink = document.getElementById("toRegister");
  const toLoginLink = document.getElementById("toLogin");
  const forgotPasswordLink = document.getElementById("forgotPasswordLink");
  const backToLoginLink = document.getElementById("backToLogin");

  if (!modal) {
    console.warn("⚠️ Auth modal not found!");
    return;
  }

  console.log("✅ Modal found, setting up controls...");

  // ========================================
  // HELPER: Show Only One Form
  // ========================================
  function showOnlyForm(formToShow) {
    loginFormDiv.style.display = "none";
    registerFormDiv.style.display = "none";
    if (forgotPasswordFormDiv) forgotPasswordFormDiv.style.display = "none";
    
    formToShow.style.display = "block";
    
    document.querySelectorAll('.alert').forEach(alert => {
      alert.style.display = 'none';
    });
  }

  // ========================================
  // MODAL OPEN/CLOSE HANDLERS
  // ========================================
  openLoginBtns.forEach((btn) => {
    btn.addEventListener("click", function(e) {
      e.preventDefault();
      console.log("🔓 LOGIN clicked");
      
      modal.style.display = "flex";
      setTimeout(() => modal.classList.add("show-modal"), 10);
      
      showOnlyForm(loginFormDiv);
    });
  });

  openRegisterBtns.forEach((btn) => {
    btn.addEventListener("click", function(e) {
      e.preventDefault();
      console.log("📝 REGISTER clicked");
      
      modal.style.display = "flex";
      setTimeout(() => modal.classList.add("show-modal"), 10);
      
      showOnlyForm(registerFormDiv);
    });
  });

  // ========================================
  // FORM NAVIGATION
  // ========================================
  if (toRegisterLink) {
    toRegisterLink.addEventListener("click", function(e) {
      e.preventDefault();
      console.log("🔄 Switching to Register");
      showOnlyForm(registerFormDiv);
    });
  }

  if (toLoginLink) {
    toLoginLink.addEventListener("click", function(e) {
      e.preventDefault();
      console.log("🔄 Switching to Login");
      showOnlyForm(loginFormDiv);
    });
  }

  // ⭐ NEW: Forgot Password Navigation
  if (forgotPasswordLink) {
    forgotPasswordLink.addEventListener("click", function(e) {
      e.preventDefault();
      console.log("🔑 Switching to Forgot Password");
      showOnlyForm(forgotPasswordFormDiv);
      
      setTimeout(() => {
        document.getElementById("forgotPasswordEmail")?.focus();
      }, 100);
    });
  }

  if (backToLoginLink) {
    backToLoginLink.addEventListener("click", function(e) {
      e.preventDefault();
      console.log("🔙 Back to Login");
      showOnlyForm(loginFormDiv);
      
      const forgotForm = document.getElementById("forgotPasswordFormElement");
      if (forgotForm) forgotForm.reset();
    });
  }

  // ========================================
  // CLOSE MODAL
  // ========================================
  function closeModal() {
    modal.classList.remove("show-modal");
    setTimeout(() => {
      modal.style.display = "none";
      
      document.querySelectorAll('form').forEach(form => form.reset());
      document.querySelectorAll('.alert').forEach(alert => {
        alert.style.display = 'none';
      });
    }, 300);
  }

  if (closeBtn) {
    closeBtn.addEventListener("click", closeModal);
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

// ========================================
// FORGOT PASSWORD HANDLER (FIXED TIMEZONE)
// ========================================
const forgotPasswordForm = document.getElementById("forgotPasswordFormElement");

if (forgotPasswordForm) {
  console.log("✅ Forgot Password form found (OTP method)");
  
  forgotPasswordForm.addEventListener("submit", async function(e) {
    e.preventDefault();
    console.log("📧 Forgot Password OTP request started");

    const email = document.getElementById("forgotPasswordEmail").value.trim();
    const submitBtn = e.target.querySelector('button[type="submit"]');
    const forgotAlert = document.getElementById("forgotPasswordAlert");

    // Clear previous alerts
    forgotAlert.style.display = "none";

    // Validation
    if (!email) {
      showAlert(forgotAlert, "⚠️ Email harus diisi!", "danger");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      showAlert(forgotAlert, "⚠️ Format email tidak valid!", "danger");
      return;
    }

    // Show loading
    const originalText = submitBtn.innerHTML;
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Mengirim OTP...';

    try {
      // Generate 6-digit OTP
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      
      // ⭐ FIXED: Create expiration time properly
      const now = new Date();
      const expiresAt = new Date(now.getTime() + 10 * 60 * 1000); // 10 minutes from now
      
      console.log("⏰ OTP timing:", {
        now: now.toISOString(),
        expiresAt: expiresAt.toISOString(),
        validFor: "10 minutes"
      });

      // Store OTP in Supabase
      const { data: otpData, error: otpError } = await supabaseClient
        .from('password_reset_otp')
        .insert({
          email: email,
          otp_code: otp,
          expires_at: expiresAt.toISOString(), // ⭐ Store as ISO string
          is_used: false
        })
        .select()
        .single();

      if (otpError) {
        console.error("❌ Error storing OTP:", otpError);
        throw new Error("Gagal menyimpan OTP");
      }

      console.log("✅ OTP stored in database:", otpData);

      // Send OTP via email using your backend
      const response = await fetch('/MAPOTEK_PHP/WEB/API/auth/send-otp.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'send_otp',
          email: email,
          otp: otp
        })
      });

      const result = await response.json();
      console.log("📧 Email send result:", result);

      if (!result.success) {
        throw new Error(result.message || "Gagal mengirim OTP");
      }

      console.log("✅ OTP sent successfully");
      
      // Show success message
      showAlert(
        forgotAlert, 
        "✅ Kode OTP telah dikirim ke email Anda! Kode berlaku 10 menit.", 
        "success"
      );
      
      showToast(
        "Berhasil!", 
        "Kode OTP telah dikirim ke " + email, 
        "success"
      );

      // For development/testing: Also show OTP in console
      console.log("🔑 OTP CODE (for testing):", otp);

      // Store email temporarily for verification step
      sessionStorage.setItem('reset_email', email);

      // Check if verifyOtpForm exists before switching
      const verifyOtpFormDiv = document.getElementById('verifyOtpForm');
      
      if (verifyOtpFormDiv) {
        // Switch to OTP verification form
        setTimeout(() => {
          showOnlyForm(verifyOtpFormDiv);
          document.getElementById('otpEmail').value = email;
          
          // Focus on OTP input
          const otpInput = document.getElementById('otpCode');
          if (otpInput) {
            otpInput.focus();
          }
        }, 1500);
      } else {
        console.error("❌ verifyOtpForm not found in HTML!");
        showAlert(
          forgotAlert,
          "⚠️ Form verifikasi OTP tidak ditemukan. OTP: " + otp + " (gunakan ini untuk testing)",
          "warning"
        );
      }

      submitBtn.disabled = false;
      submitBtn.innerHTML = originalText;

    } catch (error) {
      console.error("❌ Forgot Password error:", error);
      
      showAlert(forgotAlert, `❌ ${error.message}`, "danger");
      showToast("Error", error.message, "danger");
      
      submitBtn.disabled = false;
      submitBtn.innerHTML = originalText;
    }
  });
}

// ========================================
// VERIFY OTP & RESET PASSWORD HANDLER (FIXED)
// ========================================
const verifyOtpForm = document.getElementById("verifyOtpFormElement");

if (verifyOtpForm) {
  console.log("✅ Verify OTP form found");
  
  verifyOtpForm.addEventListener("submit", async function(e) {
    e.preventDefault();
    console.log("🔐 OTP verification started");

    const email = document.getElementById('otpEmail').value.trim();
    const otpCode = document.getElementById('otpCode').value.trim();
    const newPassword = document.getElementById('newPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    
    const submitBtn = e.target.querySelector('button[type="submit"]');
    const verifyAlert = document.getElementById("verifyOtpAlert");

    // Clear previous alerts
    verifyAlert.style.display = "none";

    // Validation
    if (!otpCode || otpCode.length !== 6) {
      showAlert(verifyAlert, "⚠️ Kode OTP harus 6 digit!", "danger");
      return;
    }

    if (newPassword.length < 6) {
      showAlert(verifyAlert, "⚠️ Password minimal 6 karakter!", "danger");
      return;
    }

    if (newPassword !== confirmPassword) {
      showAlert(verifyAlert, "⚠️ Password tidak sama!", "danger");
      return;
    }

    // Show loading
    const originalText = submitBtn.innerHTML;
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Memverifikasi...';

    try {
      // Step 1: Verify OTP from database
      const { data: otpRecord, error: otpError } = await supabaseClient
        .from('password_reset_otp')
        .select('*')
        .eq('email', email)
        .eq('otp_code', otpCode)
        .eq('is_used', false)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (otpError || !otpRecord) {
        console.error("❌ OTP not found:", otpError);
        throw new Error("Kode OTP tidak valid atau sudah digunakan!");
      }

      console.log("✅ OTP record found:", otpRecord);

      // ⭐ SKIP CLIENT-SIDE EXPIRATION CHECK
      // Let the server handle it to avoid timezone issues
      console.log("⏰ Skipping client-side expiration check - server will validate");

      // Step 3: Update password using backend PHP (server validates expiration)
      console.log("📝 Updating password via backend...");
      
      const response = await fetch('/MAPOTEK_PHP/WEB/API/auth/reset-password.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'reset_password',
          email: email,
          new_password: newPassword,
          otp_id: otpRecord.id
        })
      });

      const result = await response.json();
      console.log("📝 Password reset result:", result);

      if (!result.success) {
        throw new Error(result.message || "Gagal mereset password");
      }

      // Step 4: Mark OTP as used
      await supabaseClient
        .from('password_reset_otp')
        .update({ is_used: true })
        .eq('id', otpRecord.id);

      console.log("✅ Password reset successful");
      
      showAlert(
        verifyAlert, 
        "✅ Password berhasil direset! Logging in...", 
        "success"
      );
      
      showToast(
        "Berhasil!", 
        "Password direset, logging in...", 
        "success"
      );

      // ⭐ AUTO-LOGIN AFTER PASSWORD RESET
      console.log("🔐 Auto-logging in user...");
      
      try {
        const { data: loginData, error: loginError } = await supabaseClient.auth.signInWithPassword({
          email: email,
          password: newPassword
        });

        if (loginError) {
          console.error("❌ Auto-login failed:", loginError);
          
          // Still show success message, but redirect to login
          showAlert(
            verifyAlert, 
            "✅ Password berhasil direset! Silakan login dengan password baru.", 
            "success"
          );
          
          // Clear form and go to login
          verifyOtpForm.reset();
          sessionStorage.removeItem('reset_email');
          
          setTimeout(() => {
            showOnlyForm(loginFormDiv);
            // Pre-fill email for convenience
            document.getElementById('loginEmail').value = email;
          }, 2000);
          
          return;
        }

        // ✅ LOGIN SUCCESSFUL
        console.log("✅ Auto-login successful:", loginData.user);
        
        localStorage.setItem("access_token", loginData.session.access_token);
        localStorage.setItem("user", JSON.stringify(loginData.user));
        localStorage.setItem("isLoggedIn", "true");

        showAlert(
          verifyAlert, 
          "✅ Password direset dan login berhasil! Mengalihkan ke dashboard...", 
          "success"
        );
        
        showToast(
          "Berhasil!", 
          "Login otomatis berhasil! Selamat datang.", 
          "success"
        );

        // Determine user role and redirect
        const role = await determineUserRole(loginData.user);
        
        if (role === "unknown") {
          showAlert(
            verifyAlert, 
            "⚠️ Akun tidak terdaftar sebagai dokter atau asisten!", 
            "warning"
          );
          
          await supabaseClient.auth.signOut();
          localStorage.clear();
          
          setTimeout(() => {
            showOnlyForm(loginFormDiv);
          }, 2000);
          
          return;
        }

        // Clear form
        verifyOtpForm.reset();
        sessionStorage.removeItem('reset_email');

        // Redirect to dashboard
        setTimeout(() => {
          if (role === "dokter" || role === "asisten_dokter") {
            window.location.href = "../../Dashboard/index.html";
          }
        }, 1500);

      } catch (autoLoginError) {
        console.error("❌ Auto-login error:", autoLoginError);
        
        // Fallback: redirect to login form
        showAlert(
          verifyAlert, 
          "✅ Password berhasil direset! Silakan login.", 
          "success"
        );
        
        verifyOtpForm.reset();
        sessionStorage.removeItem('reset_email');
        
        setTimeout(() => {
          showOnlyForm(loginFormDiv);
          document.getElementById('loginEmail').value = email;
        }, 2000);
      }

      submitBtn.disabled = false;
      submitBtn.innerHTML = originalText;

    } catch (error) {
      console.error("❌ OTP verification error:", error);
      
      showAlert(verifyAlert, `❌ ${error.message}`, "danger");
      showToast("Error", error.message, "danger");
      
      submitBtn.disabled = false;
      submitBtn.innerHTML = originalText;
    }
  });
}

  // ========================================
  // LOGIN FORM HANDLER
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

      loginAlert.style.display = "none";

      if (!email || !password) {
        showAlert(loginAlert, "⚠️ Email dan password harus diisi!", "danger");
        return;
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        showAlert(loginAlert, "⚠️ Format email tidak valid!", "danger");
        return;
      }

      const originalText = submitBtn.innerHTML;
      submitBtn.disabled = true;
      submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Memproses...';

      try {
        const { data, error } = await supabaseClient.auth.signInWithPassword({
          email: email,
          password: password
        });

        if (error) {
          console.error("❌ Login error:", error);
          
          let errorMessage = "Login gagal!";
          
          if (error.message.includes("Invalid login credentials")) {
            errorMessage = "❌ Email atau password salah! Silakan coba lagi.";
          } else if (error.message.includes("Email not confirmed")) {
            errorMessage = "⚠️ Email belum diverifikasi! Silakan cek inbox email Anda.";
          } else if (error.message.includes("User not found")) {
            errorMessage = "❌ Email tidak terdaftar! Silakan daftar terlebih dahulu.";
          } else if (error.message.includes("Too many requests")) {
            errorMessage = "⏳ Terlalu banyak percobaan login! Silakan tunggu beberapa menit.";
          } else if (error.message.includes("Network")) {
            errorMessage = "🌐 Koneksi internet bermasalah! Silakan cek koneksi Anda.";
          } else {
            errorMessage = `❌ ${error.message}`;
          }
          
          showAlert(loginAlert, errorMessage, "danger");
          showToast("Login Gagal", errorMessage, "danger");
          
          submitBtn.disabled = false;
          submitBtn.innerHTML = originalText;
          return;
        }

        if (data && data.user) {
          console.log("✅ Login successful:", data.user);
          
          localStorage.setItem("access_token", data.session.access_token);
          localStorage.setItem("user", JSON.stringify(data.user));
          localStorage.setItem("isLoggedIn", "true");

          showAlert(loginAlert, "✅ Login berhasil! Memeriksa akun...", "success");

          const role = await determineUserRole(data.user);
          
          if (role === "unknown") {
            showAlert(
              loginAlert, 
              "❌ Akun tidak terdaftar sebagai dokter atau asisten! Silakan hubungi administrator.", 
              "danger"
            );
            showToast(
              "Akses Ditolak", 
              "Akun Anda tidak memiliki akses ke sistem ini", 
              "danger"
            );
            submitBtn.disabled = false;
            submitBtn.innerHTML = originalText;
            
            await supabaseClient.auth.signOut();
            localStorage.clear();
            return;
          }

          showAlert(loginAlert, "✅ Login berhasil! Mengalihkan ke dashboard...", "success");
          showToast("Berhasil!", "Login berhasil! Selamat datang.", "success");
          
          setTimeout(() => {
            if (role === "dokter" || role === "asisten_dokter") {
              window.location.href = "../../Dashboard/index.html";
            }
          }, 1500);
        }

      } catch (error) {
        console.error("❌ Login error:", error);
        
        let errorMessage = "Terjadi kesalahan sistem! Silakan coba lagi.";
        
        if (error.message.includes("fetch")) {
          errorMessage = "🌐 Tidak dapat terhubung ke server! Silakan cek koneksi internet Anda.";
        }
        
        showAlert(loginAlert, `❌ ${errorMessage}`, "danger");
        showToast("Error", errorMessage, "danger");
        
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalText;
      }
    });
  } else {
    console.warn("⚠️ Login form not found!");
  }

  // ========================================
  // INPUT VALIDATION
  // ========================================
  function addInputValidation() {
    const loginEmail = document.getElementById("loginEmail");
    const loginPassword = document.getElementById("loginPassword");
    
    if (loginEmail) {
      loginEmail.addEventListener("blur", function() {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (this.value && !emailRegex.test(this.value)) {
          this.classList.add("is-invalid");
          
          if (!this.nextElementSibling || !this.nextElementSibling.classList.contains("invalid-feedback")) {
            const errorDiv = document.createElement("div");
            errorDiv.className = "invalid-feedback";
            errorDiv.textContent = "Format email tidak valid";
            this.parentElement.appendChild(errorDiv);
          }
        } else {
          this.classList.remove("is-invalid");
          const errorDiv = this.parentElement.querySelector(".invalid-feedback");
          if (errorDiv) errorDiv.remove();
        }
      });
      
      loginEmail.addEventListener("input", function() {
        this.classList.remove("is-invalid");
        const errorDiv = this.parentElement.querySelector(".invalid-feedback");
        if (errorDiv) errorDiv.remove();
      });
    }
    
    if (loginPassword) {
      loginPassword.addEventListener("input", function() {
        this.classList.remove("is-invalid");
      });
    }
  }

  addInputValidation();

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