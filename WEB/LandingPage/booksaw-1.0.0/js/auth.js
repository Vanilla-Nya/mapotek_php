// ========================================
// FILE: auth.js - Complete Authentication Handler
// ========================================

console.log('🔐 Auth script loaded');

// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {

// ========================================
// MODAL CONTROLS
// ========================================
const modal = document.getElementById('authModal');
const openLogin = document.getElementById('openLogin');
const openRegister = document.getElementById('openRegister');
const closeModal = document.querySelector('.close');
const loginForm = document.getElementById('loginForm');
const registerForm = document.getElementById('registerForm');
const toRegister = document.getElementById('toRegister');
const toLogin = document.getElementById('toLogin');

// Open login modal
if (openLogin) {
    openLogin.addEventListener('click', (e) => {
        e.preventDefault();
        modal.style.display = 'flex'; 
        loginForm.style.display = 'block';
        registerForm.style.display = 'none';
    });
}

// Open register modal
if (openRegister) {
    openRegister.addEventListener('click', (e) => {
        e.preventDefault();
        modal.style.display = 'flex'; 
        loginForm.style.display = 'none';
        registerForm.style.display = 'block';
    });
}

// Switch to register
if (toRegister) {
    toRegister.addEventListener('click', (e) => {
        e.preventDefault();
        loginForm.style.display = 'none';
        registerForm.style.display = 'block';
    });
}

// Switch to login
if (toLogin) {
    toLogin.addEventListener('click', (e) => {
        e.preventDefault();
        registerForm.style.display = 'none';
        loginForm.style.display = 'block';
    });
}

// Close modal
if (closeModal) {
    closeModal.addEventListener('click', () => {
        modal.style.display = 'none';
    });
}

// Close modal when clicking outside
window.addEventListener('click', (e) => {
    if (e.target === modal) {
        modal.style.display = 'none';
    }
});

// ========================================
// HANDLE LOGIN
// ========================================
const loginFormElement = loginForm ? loginForm.querySelector('form') : null;
if (loginFormElement) {
    loginFormElement.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const submitBtn = e.target.querySelector('button[type="submit"]');
        const originalText = submitBtn.textContent;
        submitBtn.disabled = true;
        submitBtn.textContent = 'Logging in...';
        
        const formData = {
            action: 'login',
            email: e.target.querySelector('input[type="email"]').value,
            password: e.target.querySelector('input[type="password"]').value
        };

        console.log('📤 Attempting login...');

        try {
            const response = await fetch('../../API/auth/auth.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            const result = await response.json();
            console.log('📥 Login response:', result);
            
            if (result.success) {
                localStorage.setItem('access_token', result.access_token);
                localStorage.setItem('user', JSON.stringify(result.user));
                localStorage.setItem('isLoggedIn', 'true');
                
                console.log('✅ Login successful!');
                alert('Login berhasil! Selamat datang, ' + result.user.nama_lengkap);
                
                modal.style.display = 'none';
                window.location.href = '../../WEB/Dashboard/index.html';
            } else {
                alert('Login gagal: ' + (result.message || 'Email atau password salah'));
            }
        } catch (error) {
            console.error('❌ Error:', error);
            alert('Terjadi kesalahan saat login: ' + error.message);
        } finally {
            submitBtn.disabled = false;
            submitBtn.textContent = originalText;
        }
    });
}

// ========================================
// DOCTOR REGISTRATION - SEARCH & COMPLETE
// ========================================
let practitionerData = null;

const searchMethod = document.getElementById('searchMethod');
const dynamicSearchInputs = document.getElementById('dynamicSearchInputs');
const btnSearchPractitioner = document.getElementById('btnSearchPractitioner');
const searchResult = document.getElementById('searchResult');
const searchStep = document.getElementById('searchStep');
const dokterCompleteForm = document.getElementById('dokterCompleteForm');
const btnBackToSearch = document.getElementById('btnBackToSearch');

// Change search inputs based on method
if (searchMethod && dynamicSearchInputs && btnSearchPractitioner) {
    searchMethod.addEventListener('change', function() {
        const method = this.value;
        dynamicSearchInputs.innerHTML = '';
        if (searchResult) searchResult.style.display = 'none';
        practitionerData = null;

        if (method === 'nik') {
            dynamicSearchInputs.innerHTML = `
                <label class="form-label">NIK (16 digit):</label>
                <input type="text" class="form-control" id="inputNIK" placeholder="Masukkan NIK 16 digit" maxlength="16" pattern="[0-9]{16}">
                <small class="text-muted">Masukkan NIK sesuai KTP</small>
            `;
            btnSearchPractitioner.style.display = 'block';
        } else if (method === 'detail') {
            dynamicSearchInputs.innerHTML = `
                <div class="mb-2">
                    <label class="form-label">Nama Lengkap:</label>
                    <input type="text" class="form-control" id="inputNama" placeholder="Masukkan Nama Lengkap">
                </div>
                <div class="mb-2">
                    <label class="form-label">Tanggal Lahir:</label>
                    <input type="date" class="form-control" id="inputTanggalLahir">
                </div>
                <div class="mb-2">
                    <label class="form-label">Jenis Kelamin:</label>
                    <select class="form-select" id="inputGender">
                        <option value="">-- Pilih --</option>
                        <option value="male">Laki-Laki</option>
                        <option value="female">Perempuan</option>
                    </select>
                </div>
            `;
            btnSearchPractitioner.style.display = 'block';
        } else {
            btnSearchPractitioner.style.display = 'none';
        }
    });
}

// Search practitioner from SatuSehat
if (btnSearchPractitioner) {
    btnSearchPractitioner.addEventListener('click', async function() {
        const method = searchMethod ? searchMethod.value : '';
        
        btnSearchPractitioner.disabled = true;
        btnSearchPractitioner.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Mencari data...';

        try {
            let searchData = { action: 'search_practitioner', method };

            if (method === 'nik') {
                const nikInput = document.getElementById('inputNIK');
                const nik = nikInput ? nikInput.value.trim() : '';
                if (nik.length !== 16) {
                    alert('NIK harus 16 digit!');
                    return;
                }
                if (!/^\d{16}$/.test(nik)) {
                    alert('NIK harus berupa angka!');
                    return;
                }
                searchData.nik = nik;
            } else if (method === 'detail') {
                const namaInput = document.getElementById('inputNama');
                const tglLahirInput = document.getElementById('inputTanggalLahir');
                const genderInput = document.getElementById('inputGender');
                
                const nama = namaInput ? namaInput.value.trim() : '';
                const tglLahir = tglLahirInput ? tglLahirInput.value : '';
                const gender = genderInput ? genderInput.value : '';
                
                if (!nama || !tglLahir || !gender) {
                    alert('Semua field harus diisi!');
                    return;
                }
                
                searchData.nama = nama;
                searchData.tanggal_lahir = tglLahir;
                searchData.gender = gender;
            }

            console.log('🔍 Searching with data:', searchData);

            const response = await fetch('../../API/auth/register_practitioner.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(searchData)
            });

            const result = await response.json();
            console.log('🔍 Search result:', result);

            if (result.success && result.data) {
                practitionerData = result.data;
                
                // Show success message
                if (searchResult) {
                    searchResult.innerHTML = `✅ <strong>Data Dokter Ditemukan!</strong>

Nama          : ${result.data.nama}
Gender        : ${result.data.gender}
Alamat        : ${result.data.alamat || '(Belum ada)'}

Silakan tunggu, form registrasi akan muncul...`;
                    searchResult.style.display = 'block';
                }

                // Auto-fill the registration form
                if (dokterCompleteForm) {
                    document.getElementById('dokterIdSatusehat').value = result.data.id_satusehat;
                    document.getElementById('dokterNama').value = result.data.nama;
                    document.getElementById('dokterGender').value = result.data.gender;
                    document.getElementById('dokterAlamat').value = result.data.alamat || '';
                    
                    // Generate username from name
                    const usernameSuggestion = result.data.nama.toLowerCase()
                        .replace(/\s+/g, '')
                        .replace(/[^a-z0-9]/g, '');
                    document.getElementById('dokterUsername').value = usernameSuggestion;
                    
                    // Generate default email from name
                    const emailSuggestion = usernameSuggestion + '@mapotek.com';
                    document.getElementById('dokterEmail').value = emailSuggestion;
                    
                    // Show the form after 1.5 seconds
                    setTimeout(() => {
                        if (searchResult) searchResult.style.display = 'none';
                        if (searchStep) searchStep.style.display = 'none';
                        dokterCompleteForm.style.display = 'block';
                    }, 1500);
                }
            } else {
                if (searchResult) {
                    searchResult.innerHTML = '⚠️ <strong>Data tidak ditemukan</strong>\n\n' + (result.message || 'Pastikan data yang Anda masukkan benar dan terdaftar di SatuSehat.');
                    searchResult.style.display = 'block';
                }
            }
        } catch (error) {
            console.error('❌ Error:', error);
            alert('Terjadi kesalahan: ' + error.message);
        } finally {
            btnSearchPractitioner.disabled = false;
            btnSearchPractitioner.innerHTML = '<i class="bi bi-search"></i> Cari Data Dokter';
        }
    });
}

// Back to search button
if (btnBackToSearch) {
    btnBackToSearch.addEventListener('click', function() {
        // Reset form
        if (dokterCompleteForm) {
            dokterCompleteForm.reset();
            dokterCompleteForm.style.display = 'none';
        }
        if (searchStep) searchStep.style.display = 'block';
        
        // Reset search
        if (searchMethod) searchMethod.value = '';
        if (dynamicSearchInputs) dynamicSearchInputs.innerHTML = '';
        if (searchResult) searchResult.style.display = 'none';
        if (btnSearchPractitioner) btnSearchPractitioner.style.display = 'none';
        
        practitionerData = null;
    });
}

// ========================================
// ✅ UPDATED: Submit complete doctor registration with better debugging
// ========================================
if (dokterCompleteForm) {
    dokterCompleteForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        // Validate password match
        const password = document.getElementById('dokterPassword').value;
        const passwordConfirm = document.getElementById('dokterPasswordConfirm').value;
        
        if (password !== passwordConfirm) {
            alert('Password dan Konfirmasi Password tidak sama!');
            return;
        }
        
        const submitBtn = e.target.querySelector('button[type="submit"]');
        const originalText = submitBtn.innerHTML;
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Mendaftar...';

        const formData = {
            action: 'save_practitioner',
            data: {
                id_satusehat: document.getElementById('dokterIdSatusehat').value,
                nama: document.getElementById('dokterNama').value,
                gender: document.getElementById('dokterGender').value,
                username: document.getElementById('dokterUsername').value,
                alamat: document.getElementById('dokterAlamat').value,
                no_telp: document.getElementById('dokterPhone').value,
                email: document.getElementById('dokterEmail').value,
                password: password
            }
        };

        console.log('💾 Registering doctor with data:', formData);

        try {
            const response = await fetch('../../API/auth/register_practitioner.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            const result = await response.json();
            console.log('💾 Full registration result:', result);

            // ✅ ENHANCED: Better success/error handling with detailed feedback
            if (result.success) {
                // Check if id_dokter is actually set
                if (result.data && result.data.id_dokter) {
                    console.log('✅ SUCCESS: Doctor registered with ID:', result.data.id_dokter);
                    
                    alert(`✅ Registrasi Berhasil!\n\n` +
                          `Selamat datang, ${formData.data.nama}!\n\n` +
                          `Email: ${formData.data.email}\n` +
                          `Username: ${formData.data.username}\n` +
                          `ID Dokter: ${result.data.id_dokter}\n\n` +
                          `Silakan login untuk melanjutkan.`);
                    
                    // Reset and switch to login
                    dokterCompleteForm.reset();
                    dokterCompleteForm.style.display = 'none';
                    if (searchStep) searchStep.style.display = 'block';
                    
                    if (searchMethod) searchMethod.value = '';
                    if (dynamicSearchInputs) dynamicSearchInputs.innerHTML = '';
                    if (btnSearchPractitioner) btnSearchPractitioner.style.display = 'none';
                    
                    // Switch to login form
                    registerForm.style.display = 'none';
                    loginForm.style.display = 'block';
                    
                    practitionerData = null;
                } else {
                    // Success but no id_dokter - show debug info
                    console.warn('⚠️ User created but doctor record not inserted');
                    console.warn('Response:', result);
                    
                    let debugMsg = `⚠️ User Created but Doctor Record Failed!\n\n`;
                    debugMsg += `✅ User ID: ${result.data.user_id}\n`;
                    debugMsg += `✅ Email: ${result.data.email}\n`;
                    debugMsg += `❌ ID Dokter: NULL\n\n`;
                    debugMsg += `🔍 TROUBLESHOOTING:\n`;
                    debugMsg += `1. Check browser console (F12) for details\n`;
                    debugMsg += `2. Check PHP error logs\n`;
                    debugMsg += `3. Check Supabase logs for 400 errors\n\n`;
                    
                    if (result.debug) {
                        debugMsg += `📋 Debug Info:\n${JSON.stringify(result.debug, null, 2)}\n\n`;
                    }
                    
                    if (result.error_details) {
                        debugMsg += `❌ Error Details:\n${JSON.stringify(result.error_details, null, 2)}`;
                    }
                    
                    alert(debugMsg);
                }
            } else {
                // Show detailed error
                console.error('❌ Registration failed:', result);
                
                let errorMsg = '❌ Registrasi Gagal!\n\n';
                errorMsg += `Message: ${result.message || 'Terjadi kesalahan.'}\n\n`;
                
                if (result.error_details) {
                    errorMsg += '📋 Error Details:\n';
                    errorMsg += `Code: ${result.error_details.code || 'N/A'}\n`;
                    errorMsg += `Message: ${result.error_details.message || 'N/A'}\n`;
                    errorMsg += `Details: ${result.error_details.details || 'N/A'}\n`;
                    errorMsg += `Hint: ${result.error_details.hint || 'N/A'}\n\n`;
                }
                
                if (result.debug) {
                    errorMsg += '🔍 Debug Info:\n';
                    errorMsg += JSON.stringify(result.debug, null, 2);
                }
                
                alert(errorMsg);
            }
        } catch (error) {
            console.error('❌ Fetch error:', error);
            alert(`Terjadi kesalahan jaringan:\n\n${error.message}\n\nCheck browser console for details.`);
        } finally {
            submitBtn.disabled = false;
            submitBtn.innerHTML = originalText;
        }
    });
}

console.log('✅ Auth handlers ready');

}); // End of DOMContentLoaded