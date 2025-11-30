// ========================================
// FILE: auth-handler.js (REFACTORED VERSION)
// USES PHP BACKEND - NO DIRECT SUPABASE CONNECTION
// FIXED: Role detection from user object
// ========================================

console.log("🔐 Auth handler script loaded (PHP Backend)");

// ========================================
// MODAL CONTROLS - IMMEDIATE INIT
// ========================================
initializeModalControls();

// ========================================
// DOM READY - FULL INIT
// ========================================
document.addEventListener("DOMContentLoaded", function() {
  console.log("📄 DOM loaded via DOMContentLoaded");
  initializeModalControls();
  initializeAuthHandlers();
});

// ========================================
// WINDOW LOAD - FALLBACK INIT
// ========================================
window.addEventListener("load", function() {
  console.log("🪟 Window fully loaded");
  initializeModalControls();
});

// ========================================
// MODAL CONTROLS INITIALIZATION
// ========================================
function initializeModalControls() {
  console.log("🎭 Attempting to initialize modal controls...");

  const modal = document.getElementById("authModalOverlay");
  const openLoginBtns = document.querySelectorAll("#openLogin");
  const openRegisterBtns = document.querySelectorAll("#openRegister");
  const closeBtn = document.querySelector(".close");
  const loginFormDiv = document.getElementById("loginForm");
  const registerFormDiv = document.getElementById("registerForm");
  const toRegisterLink = document.getElementById("toRegister");
  const toLoginLink = document.getElementById("toLogin");

  console.log("🔍 Modal elements found:", {
    modal: !!modal,
    openLoginBtns: openLoginBtns.length,
    openRegisterBtns: openRegisterBtns.length,
    closeBtn: !!closeBtn,
    loginForm: !!loginFormDiv,
    registerForm: !!registerFormDiv
  });

  if (!modal) {
    console.warn("⚠️ Modal not found, will retry");
    return;
  }

  // Remove duplicates by cloning
  openLoginBtns.forEach(btn => {
    const newBtn = btn.cloneNode(true);
    btn.parentNode.replaceChild(newBtn, btn);
  });

  openRegisterBtns.forEach(btn => {
    const newBtn = btn.cloneNode(true);
    btn.parentNode.replaceChild(newBtn, btn);
  });

  // Re-query after cloning
  const loginBtns = document.querySelectorAll("#openLogin");
  const registerBtns = document.querySelectorAll("#openRegister");

  // OPEN LOGIN
  loginBtns.forEach((btn, index) => {
    console.log(`🔗 Attaching login handler to button ${index + 1}`);
    
    btn.addEventListener("click", function (e) {
      e.preventDefault();
      e.stopPropagation();
      
      console.log("🔓 LOGIN BUTTON CLICKED!");
      
      if (modal) {
        modal.style.cssText = "display: flex !important; opacity: 0;";
        modal.offsetHeight; // Force reflow
        
        requestAnimationFrame(() => {
          modal.classList.add("show-modal");
          modal.style.opacity = "1";
        });
        
        console.log("✅ Modal display forced to flex");
      }

      if (loginFormDiv && registerFormDiv) {
        loginFormDiv.style.display = "block";
        registerFormDiv.style.display = "none";
        console.log("✅ Login form shown");
      }
    });
  });

  // OPEN REGISTER
  registerBtns.forEach((btn, index) => {
    console.log(`🔗 Attaching register handler to button ${index + 1}`);
    
    btn.addEventListener("click", function (e) {
      e.preventDefault();
      e.stopPropagation();
      
      console.log("📝 REGISTER BUTTON CLICKED!");
      
      if (modal) {
        modal.style.cssText = "display: flex !important; opacity: 0;";
        modal.offsetHeight;
        
        requestAnimationFrame(() => {
          modal.classList.add("show-modal");
          modal.style.opacity = "1";
        });
        
        console.log("✅ Modal display forced to flex");
      }

      if (loginFormDiv && registerFormDiv) {
        loginFormDiv.style.display = "none";
        registerFormDiv.style.display = "block";
        console.log("✅ Register form shown");
      }
    });
  });

  // SWITCH TO REGISTER
  if (toRegisterLink) {
    toRegisterLink.addEventListener("click", function (e) {
      e.preventDefault();
      console.log("➡️ Switching to register");
      
      if (loginFormDiv && registerFormDiv) {
        loginFormDiv.style.display = "none";
        registerFormDiv.style.display = "block";
      }
    });
  }

  // SWITCH TO LOGIN
  if (toLoginLink) {
    toLoginLink.addEventListener("click", function (e) {
      e.preventDefault();
      console.log("⬅️ Switching to login");
      
      if (loginFormDiv && registerFormDiv) {
        registerFormDiv.style.display = "none";
        loginFormDiv.style.display = "block";
      }
    });
  }

  // CLOSE BUTTON
  if (closeBtn) {
    closeBtn.addEventListener("click", function () {
      console.log("❌ Close button clicked");
      closeModal(modal);
    });
  }

  // CLOSE ON OUTSIDE CLICK
  if (modal) {
    modal.addEventListener("click", function (e) {
      if (e.target === modal) {
        console.log("❌ Outside click detected");
        closeModal(modal);
      }
    });
  }

  // CLOSE ON ESC KEY
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && modal && modal.style.display === "flex") {
      console.log("❌ ESC key pressed");
      closeModal(modal);
    }
  });

  console.log("✅ Modal controls initialized successfully!");
}

// ========================================
// CLOSE MODAL HELPER
// ========================================
function closeModal(modal) {
  if (!modal) return;
  
  modal.classList.remove("show-modal");
  modal.style.opacity = "0";
  
  setTimeout(() => {
    modal.style.display = "none";
  }, 300);
}

// ========================================
// INITIALIZE AUTH HANDLERS
// ========================================
function initializeAuthHandlers() {
  console.log("🔐 Initializing auth handlers...");

  setupLoginHandler();
  setupRegisterHandler();
  setupPasswordToggle();
  checkUserSession();

  console.log("✅ Auth handlers ready!");
}

// ========================================
// CHECK USER SESSION ON PAGE LOAD
// ========================================
async function checkUserSession() {
  const isLoggedIn = localStorage.getItem("isLoggedIn");
  const accessToken = localStorage.getItem("access_token");
  
  if (isLoggedIn === "true" && accessToken) {
    console.log("✅ User session found in localStorage");
    
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    const userRole = localStorage.getItem("user_role");
    
    console.log("👤 User:", user.email);
    console.log("🎭 Role:", userRole);
    
    return user;
  }
  
  console.log("ℹ️ No active session found");
  return null;
}

// ========================================
// ROLE DETECTION HELPER
// ========================================
function detectUserRole(user) {
  console.log("🔍 Detecting user role from user object...");
  console.log("📋 User data:", user);
  
  // Method 1: Check for specific ID fields
  if (user.id_dokter && !user.id_asisten_dokter) {
    console.log("✅ Detected as DOKTER (has id_dokter)");
    return 'dokter';
  }
  
  if (user.id_asisten_dokter) {
    console.log("✅ Detected as ASISTEN DOKTER (has id_asisten_dokter)");
    return 'asisten_dokter';
  }
  
  // Method 2: Check table structure (fallback)
  // Dokter table has: nama_faskes, typically
  // Asisten table might have: id_dokter (parent reference)
  if (user.nama_faskes && !user.id_dokter) {
    console.log("✅ Detected as DOKTER (has nama_faskes)");
    return 'dokter';
  }
  
  if (user.id_dokter && user.nama_lengkap) {
    console.log("✅ Detected as ASISTEN DOKTER (has id_dokter reference)");
    return 'asisten_dokter';
  }
  
  // Method 3: Check email pattern (last resort)
  if (user.email) {
    if (user.email.includes('dokter') || user.email.includes('dr.')) {
      console.log("⚠️ Assuming DOKTER from email pattern");
      return 'dokter';
    }
    if (user.email.includes('asisten') || user.email.includes('assistant')) {
      console.log("⚠️ Assuming ASISTEN from email pattern");
      return 'asisten_dokter';
    }
  }
  
  console.error("❌ Cannot determine role from user object!");
  console.log("Available fields:", Object.keys(user));
  return null;
}

// ========================================
// LOGIN HANDLER (VIA PHP BACKEND)
// ========================================
function setupLoginHandler() {
  const loginFormDiv = document.getElementById("loginForm");
  console.log("🔍 loginForm div:", loginFormDiv);
  
  const loginForm = document.querySelector("#loginForm form");
  console.log("🔍 loginForm <form>:", loginForm);
  
  if (!loginForm) {
    console.warn("⚠️ Login form not found");
    console.log("🔍 Trying alternative selector...");
    
    // Try alternative selectors
    const altForm = document.querySelector("form");
    console.log("🔍 Alternative form:", altForm);
    
    if (!altForm) {
      console.error("❌ No form found at all!");
      return;
    }
  }

  console.log("✅ Login form found, attaching submit handler");

  loginForm.addEventListener("submit", async function (e) {
    e.preventDefault();

    console.log("🔓 Form submitted");

    const submitBtn = e.target.querySelector('button[type="submit"]');
    if (!submitBtn) {
      console.error("❌ Submit button not found!");
      return;
    }

    const originalText = submitBtn.innerHTML;
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<span class="loading-spinner"></span>Logging in...';

    // TRY MULTIPLE SELECTORS (support both old & new landing page)
    let emailInput = document.getElementById("loginEmail"); // New page
    if (!emailInput) {
      emailInput = e.target.querySelector('input[type="email"]'); // Old page
    }

    let passwordInput = document.getElementById("loginPassword"); // New page
    if (!passwordInput) {
      passwordInput = e.target.querySelector('input[type="password"]'); // Old page
    }

    const loginAlert = document.getElementById("loginAlert");

    console.log("🔍 Email input found:", !!emailInput);
    console.log("🔍 Password input found:", !!passwordInput);

    if (!emailInput || !passwordInput) {
      console.error("❌ Form inputs not found!");
      console.log("📋 Form HTML:", e.target.innerHTML);
      alert("Error: Form tidak lengkap. Silakan refresh halaman.");
      submitBtn.disabled = false;
      submitBtn.innerHTML = originalText;
      return;
    }

    const email = emailInput.value.trim();
    const password = passwordInput.value.trim();

    console.log("🔓 Login attempt for:", email);

    if (!email || !password) {
      if (loginAlert) showAlert(loginAlert, "Email dan password harus diisi", "error");
      submitBtn.disabled = false;
      submitBtn.innerHTML = originalText;
      return;
    }

    try {
      // Send login request to PHP backend
      let phpPath = "/mapotek_php/WEB/API/auth/auth.php";
      
      // Auto-detect path based on current location
      const currentPath = window.location.pathname;
      if (currentPath.includes("/mapotek_php/")) {
        phpPath = "/mapotek_php/WEB/API/auth/auth.php";
      }
      
      console.log("🔗 Sending request to:", phpPath);
      
      const response = await fetch(phpPath, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "login",
          email: email,
          password: password
        })
      });

      const result = await response.json();
      console.log("📥 Login response:", result);

      if (!result.success) {
        throw new Error(result.message || "Login gagal");
      }

      // Store user data
      const user = result.user;
      const accessToken = result.access_token;
      
      // 🔥 DETECT ROLE FROM USER OBJECT (PHP doesn't return role)
      let userRole = result.role; // Try from response first
      
      if (!userRole) {
        console.warn("⚠️ Role not provided by backend, detecting from user object...");
        userRole = detectUserRole(user);
        
        if (!userRole) {
          throw new Error("Tidak dapat menentukan role pengguna. Silakan hubungi administrator.");
        }
      }

      console.log("✅ Login successful!");
      console.log("👤 User data:", user);
      console.log("🎭 User role:", userRole);

      localStorage.setItem("access_token", accessToken);
      localStorage.setItem("user", JSON.stringify(user));
      localStorage.setItem("isLoggedIn", "true");

      // Store role-specific data
      let welcomeMessage = "Login berhasil!\n\n";

      if (userRole === "dokter") {
        localStorage.setItem("user_role", "dokter");
        localStorage.setItem("user_type", "dokter");
        localStorage.setItem("id_dokter", user.id_dokter);
        localStorage.setItem("dokter_data", JSON.stringify(user));
        
        welcomeMessage += `Selamat datang, Dr. ${user.nama_lengkap || user.email}!\n`;
        welcomeMessage += `Role: Dokter`;
      } else if (userRole === "asisten_dokter") {
        localStorage.setItem("user_role", "asisten_dokter");
        localStorage.setItem("user_type", "asisten_dokter");
        localStorage.setItem("id_asisten_dokter", user.id_asisten_dokter);
        localStorage.setItem("id_dokter", user.id_dokter); // Parent dokter
        localStorage.setItem("asisten_data", JSON.stringify(user));
        
        welcomeMessage += `Selamat datang, ${user.nama_lengkap || user.email}!\n`;
        welcomeMessage += `Role: Asisten Dokter`;
      } else {
        welcomeMessage += `Selamat datang, ${user.email}!`;
      }

      if (loginAlert) showAlert(loginAlert, welcomeMessage, "success");
      alert(welcomeMessage);

      const modal = document.getElementById("authModalOverlay");
      if (modal) closeModal(modal);

      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Redirect based on role
      if (userRole === "dokter") {
        window.location.href = "/mapotek_php/WEB/Dashboard/index.html";
      } else if (userRole === "asisten_dokter") {
        window.location.href = "/mapotek_php/WEB/Dashboard/index.html";
      } else {
        alert("Role tidak dikenali. Silakan hubungi administrator.");
        localStorage.clear();
      }

    } catch (error) {
      console.error("❌ Login Error:", error);

      let errorMessage = "Login gagal: ";
      if (error.message.includes("Invalid login credentials")) {
        errorMessage += "Email atau password salah!";
      } else {
        errorMessage += error.message;
      }

      if (loginAlert) showAlert(loginAlert, errorMessage, "error");
      alert(errorMessage);

    } finally {
      submitBtn.disabled = false;
      submitBtn.innerHTML = originalText;
    }
  });

  console.log("✅ Login handler attached");
}

// ========================================
// REGISTER HANDLER (VIA PHP BACKEND)
// ========================================
function setupRegisterHandler() {
  const registerForm = document.getElementById("dokterRegistrationForm");
  if (!registerForm) {
    console.warn("⚠️ Register form not found");
    return;
  }

  console.log("✅ Register form found");

  // Auto-generate username
  const namaInput = document.getElementById("dokterNama");
  const usernameInput = document.getElementById("dokterUsername");

  if (namaInput && usernameInput) {
    namaInput.addEventListener("input", function () {
      const nama = this.value.trim();
      if (nama) {
        const username = nama.toLowerCase().replace(/\s+/g, "").replace(/[^a-z0-9]/g, "");
        usernameInput.value = username;
      }
    });
  }

  registerForm.addEventListener("submit", async function (e) {
    e.preventDefault();

    const registerAlert = document.getElementById("registerAlert");
    
    // Get form data - support both old & new structure
    const getFieldValue = (id, fallbackSelector) => {
      const byId = document.getElementById(id);
      if (byId) return byId.value.trim();
      
      const bySelector = e.target.querySelector(fallbackSelector);
      return bySelector ? bySelector.value.trim() : "";
    };

    const nik = getFieldValue("dokterNIK", 'input[name="nik"]');
    const nama = getFieldValue("dokterNama", 'input[name="nama"]');
    const tanggalLahir = getFieldValue("dokterTanggalLahir", 'input[name="tanggal_lahir"]');
    const gender = getFieldValue("dokterGender", 'select[name="gender"]');
    const email = getFieldValue("dokterEmail", 'input[name="email"]');
    const username = getFieldValue("dokterUsername", 'input[name="username"]');
    const alamat = getFieldValue("dokterAlamat", 'input[name="alamat"], textarea[name="alamat"]');
    const phone = getFieldValue("dokterPhone", 'input[name="no_telp"]');
    const password = getFieldValue("dokterPassword", 'input[name="password"]');
    const passwordConfirm = getFieldValue("dokterPasswordConfirm", 'input[name="password_confirm"]');

    console.log("📝 Register data:", { nik, nama, email, username });

    // Validation
    if (!nama || !nik || !email || !password) {
      if (registerAlert) showAlert(registerAlert, "Semua field harus diisi", "error");
      return;
    }

    if (nik.length !== 16) {
      if (registerAlert) showAlert(registerAlert, "NIK harus 16 digit", "error");
      return;
    }

    if (password.length < 6) {
      if (registerAlert) showAlert(registerAlert, "Password minimal 6 karakter", "error");
      return;
    }

    if (password !== passwordConfirm) {
      if (registerAlert) showAlert(registerAlert, "Password tidak cocok", "error");
      return;
    }

    const submitBtn = e.target.querySelector('button[type="submit"]');
    const originalText = submitBtn.innerHTML;
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<span class="loading-spinner"></span>Mendaftar...';

    const registrationData = {
      action: "register_doctor_direct",
      data: {
        nik, 
        nama, 
        tanggal_lahir: tanggalLahir, 
        gender,
        username, 
        email, 
        alamat, 
        no_telp: phone, 
        password
      },
    };

    try {
      const response = await fetch("/mapotek_php/WEB/API/auth/auth.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(registrationData),
      });

      const result = await response.json();
      console.log("📥 Registration response:", result);

      if (result.success && result.data?.id_dokter) {
        if (registerAlert) showAlert(registerAlert, `✅ Registrasi Berhasil!`, "success");
        alert(`✅ Registrasi Berhasil!\n\nSelamat datang, ${nama}!\nSilakan login.`);
        
        registerForm.reset();

        setTimeout(() => {
          document.getElementById("registerForm").style.display = "none";
          document.getElementById("loginForm").style.display = "block";
        }, 2000);
      } else {
        if (registerAlert) showAlert(registerAlert, result.message || "Registrasi gagal", "error");
        alert(result.message || "Registrasi gagal");
      }

    } catch (error) {
      if (registerAlert) showAlert(registerAlert, `Error: ${error.message}`, "error");
      alert(`Error: ${error.message}`);
    } finally {
      submitBtn.disabled = false;
      submitBtn.innerHTML = originalText;
    }
  });
}

// ========================================
// PASSWORD TOGGLE
// ========================================
function setupPasswordToggle() {
  console.log("👁️ Setting up password toggle...");
  
  document.querySelectorAll(".toggle-password").forEach((btn) => {
    btn.addEventListener("click", function (e) {
      e.preventDefault();
      
      const targetId = this.getAttribute("data-target");
      const input = document.getElementById(targetId);
      const icon = this.querySelector("i");

      console.log("👁️ Toggle clicked for:", targetId);

      if (input && icon) {
        if (input.type === "password") {
          input.type = "text";
          icon.classList.remove("bi-eye");
          icon.classList.add("bi-eye-slash");
          console.log("✅ Password shown");
        } else {
          input.type = "password";
          icon.classList.remove("bi-eye-slash");
          icon.classList.add("bi-eye");
          console.log("✅ Password hidden");
        }
      }
    });
  });

  console.log("✅ Password toggle ready");
}

// ========================================
// SHOW ALERT HELPER
// ========================================
function showAlert(alertEl, message, type) {
  if (!alertEl) return;

  alertEl.textContent = message;
  alertEl.className = `alert show alert-${type}`;

  if (type === "error") {
    setTimeout(() => alertEl.classList.remove("show"), 5000);
  }
}

console.log("✅ Auth handler fully loaded and ready (PHP Backend with Auto Role Detection)");