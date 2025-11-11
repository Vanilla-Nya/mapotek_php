// ========================================
// FILE: auth.js - Complete Authentication Handler (FIXED for Pembukuan)
// ========================================

console.log("🔐 Auth script loaded");

// Wait for DOM to be fully loaded
document.addEventListener("DOMContentLoaded", function () {
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
        
        // 🔑 CRITICAL FIX: Store id_dokter
        localStorage.setItem("id_dokter", session.user.id);
        console.log("🔑 Restored id_dokter from session:", session.user.id);
        
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
  // MODAL CONTROLS
  // ========================================
  const modal = document.getElementById("authModal");
  const openLogin = document.getElementById("openLogin");
  const openRegister = document.getElementById("openRegister");
  const closeModal = document.querySelector(".close");
  const loginForm = document.getElementById("loginForm");
  const registerForm = document.getElementById("registerForm");
  const toRegister = document.getElementById("toRegister");
  const toLogin = document.getElementById("toLogin");

  // Open login modal
  if (openLogin) {
    openLogin.addEventListener("click", (e) => {
      e.preventDefault();
      modal.style.display = "flex";
      loginForm.style.display = "block";
      registerForm.style.display = "none";
    });
  }

  // Open register modal
  if (openRegister) {
    openRegister.addEventListener("click", (e) => {
      e.preventDefault();
      modal.style.display = "flex";
      loginForm.style.display = "none";
      registerForm.style.display = "block";
    });
  }

  // Switch to register
  if (toRegister) {
    toRegister.addEventListener("click", (e) => {
      e.preventDefault();
      loginForm.style.display = "none";
      registerForm.style.display = "block";
    });
  }

  // Switch to login
  if (toLogin) {
    toLogin.addEventListener("click", (e) => {
      e.preventDefault();
      registerForm.style.display = "none";
      loginForm.style.display = "block";
    });
  }

  // Close modal
  if (closeModal) {
    closeModal.addEventListener("click", () => {
      modal.style.display = "none";
    });
  }

  // Close modal when clicking outside
  window.addEventListener("click", (e) => {
    if (e.target === modal) {
      modal.style.display = "none";
    }
  });

  // ========================================
  // HANDLE LOGIN (FIXED FOR PEMBUKUAN)
  // ========================================
  const loginFormElement = loginForm ? loginForm.querySelector("form") : null;
  if (loginFormElement) {
    loginFormElement.addEventListener("submit", async (e) => {
      e.preventDefault();

      const submitBtn = e.target.querySelector('button[type="submit"]');
      const originalText = submitBtn.textContent;
      submitBtn.disabled = true;
      submitBtn.textContent = "Logging in...";

      const formData = {
        email: e.target.querySelector('input[type="email"]').value,
        password: e.target.querySelector('input[type="password"]').value,
      };

      console.log("📤 Attempting login for:", formData.email);

      try {
        // Sign in with Supabase
        const { data, error } = await supabaseClient.auth.signInWithPassword({
          email: formData.email,
          password: formData.password
        });
        
        if (error) {
          throw error;
        }
        
        const user = data.user;
        const session = data.session;
        
        if (!user || !session) {
          throw new Error("Tidak ada session atau user.");
        }
        
        console.log("✅ Login successful!", user);
        console.log("📋 Session:", session);
        
        // Store user info and token
        localStorage.setItem("access_token", session.access_token);
        localStorage.setItem("refresh_token", session.refresh_token);
        localStorage.setItem("user", JSON.stringify(user));
        localStorage.setItem("isLoggedIn", "true");
        
        // 🔑 CRITICAL FIX: Store id_dokter for API calls (Pembukuan, etc.)
        localStorage.setItem("id_dokter", user.id);
        
        console.log("🔑 Stored id_dokter:", user.id);
        console.log("✅ This will be used by Pembukuan API!");
        
        // Get user metadata to determine role
        const userMetadata = user.user_metadata || {};
        const userRole = userMetadata.role || 'user';
        
        console.log("👤 User role:", userRole);
        
        // Fetch additional user data from dokter table
        try {
          const { data: dokterData, error: dokterError } = await supabaseClient
            .from('dokter')
            .select('*')
            .eq('id_dokter', user.id)
            .single();
          
          if (!dokterError && dokterData) {
            console.log("👨‍⚕️ Doctor data loaded:", dokterData);
            localStorage.setItem("dokter_data", JSON.stringify(dokterData));
            
            // Double-check id_dokter is stored (use dokter table ID if different)
            localStorage.setItem("id_dokter", dokterData.id_dokter);
            console.log("✅ Confirmed id_dokter from dokter table:", dokterData.id_dokter);
          }
        } catch (err) {
          console.warn("⚠️ Could not load doctor data:", err);
          console.warn("⚠️ Will use auth user ID as fallback");
        }
        
        // Final verification
        const storedId = localStorage.getItem("id_dokter");
        console.log("🎯 FINAL CHECK - id_dokter in localStorage:", storedId);
        
        if (!storedId) {
          console.error("❌ CRITICAL: id_dokter NOT stored!");
          alert("Warning: Doctor ID not stored. Pembukuan might not work.");
        }
        
        alert("Login berhasil! Selamat datang, " + (user.email || "User"));
        
        // Close modal
        modal.style.display = "none";
        
        // Wait a bit for session to be fully established
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Redirect to dashboard
        window.location.href = "/mapotek_php/WEB/Dashboard/index.html";
        
      } catch (error) {
        console.error("❌ Login Error:", error);
        
        let errorMessage = "Login gagal: ";
        
        if (error.message.includes("Invalid login credentials")) {
          errorMessage += "Email atau password salah!";
        } else if (error.message.includes("Email not confirmed")) {
          errorMessage += "Email belum dikonfirmasi!";
        } else {
          errorMessage += error.message;
        }
        
        alert(errorMessage);
      } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = originalText;
      }
    });
  }

  // ========================================
  // DIRECT DOCTOR REGISTRATION (NO SATUSEHAT)
  // ========================================
  const dokterRegistrationForm = document.getElementById("dokterRegistrationForm");
  
  if (dokterRegistrationForm) {
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

      // Prepare data for registration (NO SATUSEHAT - DIRECT TO DATABASE)
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

        if (result.success) {
          if (result.data && result.data.id_dokter) {
            console.log(
              "✅ SUCCESS: Doctor registered with ID:",
              result.data.id_dokter
            );

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
            registerForm.style.display = "none";
            loginForm.style.display = "block";
          } else {
            // Success but no id_dokter
            console.warn("⚠️ User created but doctor record not inserted");
            console.warn("Response:", result);

            let debugMsg = `⚠️ User Created but Doctor Record Failed!\n\n`;
            debugMsg += `✅ User ID: ${result.data?.user_id || "N/A"}\n`;
            debugMsg += `✅ Email: ${result.data?.email || "N/A"}\n`;
            debugMsg += `❌ ID Dokter: NULL\n\n`;
            debugMsg += `🔍 TROUBLESHOOTING:\n`;
            debugMsg += `1. Check browser console (F12) for details\n`;
            debugMsg += `2. Check PHP error logs\n`;
            debugMsg += `3. Check database connection\n\n`;

            if (result.debug) {
              debugMsg += `📋 Debug Info:\n${JSON.stringify(
                result.debug,
                null,
                2
              )}\n\n`;
            }

            if (result.error_details) {
              debugMsg += `❌ Error Details:\n${JSON.stringify(
                result.error_details,
                null,
                2
              )}`;
            }

            alert(debugMsg);
          }
        } else {
          // Show detailed error
          console.error("❌ Registration failed:", result);

          let errorMsg = "❌ Registrasi Gagal!\n\n";
          errorMsg += `Message: ${result.message || "Terjadi kesalahan."}\n\n`;

          if (result.error_details) {
            errorMsg += "📋 Error Details:\n";
            errorMsg += `Code: ${result.error_details.code || "N/A"}\n`;
            errorMsg += `Message: ${result.error_details.message || "N/A"}\n`;
            errorMsg += `Details: ${result.error_details.details || "N/A"}\n`;
            errorMsg += `Hint: ${result.error_details.hint || "N/A"}\n\n`;
          }

          if (result.debug) {
            errorMsg += "🔍 Debug Info:\n";
            errorMsg += JSON.stringify(result.debug, null, 2);
          }

          alert(errorMsg);
        }
      } catch (error) {
        console.error("❌ Fetch error:", error);
        alert(
          `Terjadi kesalahan jaringan:\n\n${error.message}\n\nCheck browser console for details.`
        );
      } finally {
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalText;
      }
    });
  }

  console.log("✅ Auth handlers ready");
}); // End of DOMContentLoaded