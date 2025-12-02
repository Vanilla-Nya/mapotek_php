// ========================================
// FILE: auth.js - Enhanced Authentication (Doctor + Asisten Dokter)
// ========================================

console.log("🔐 Auth script loaded (Enhanced for Asisten)");

// ========================================
// DETERMINE USER ROLE (DOCTOR OR ASISTEN)
// ========================================
async function determineUserRole(user) {
  console.log("🔍 Determining user role for:", user.id);
  console.log("📧 User email:", user.email);
  
  try {
    // First, check if user is a doctor (by UUID)
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
      return "dokter";
    }
    
    console.log("❌ Not a doctor, checking asisten...");
    
    // Check asisten_dokter by UUID
    const { data: asistenData, error: asistenError } = await supabaseClient
      .from('asisten_dokter')
      .select('*')
      .eq('id_asisten_dokter', user.id)
      .single();
    
    console.log("🔍 Asisten query result:", asistenData);
    console.log("🔍 Asisten query error:", asistenError);
    
    if (asistenData && !asistenError) {
      console.log("👔 User is an ASISTEN DOKTER:", asistenData);
      localStorage.setItem("user_role", "asisten_dokter");
      localStorage.setItem("user_type", "asisten_dokter");
      localStorage.setItem("id_asisten_dokter", asistenData.id_asisten_dokter);
      localStorage.setItem("id_dokter", asistenData.id_dokter);
      localStorage.setItem("asisten_data", JSON.stringify(asistenData));
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