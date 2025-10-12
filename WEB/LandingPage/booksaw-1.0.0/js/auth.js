// ========================================
// FILE: /LandingPage/booksaw-1.0.0/js/auth.js
// Authentication Handler
// ========================================

console.log('🔐 Auth script loaded');

// Modal functionality
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
const loginFormElement = loginForm.querySelector('form');
if (loginFormElement) {
    loginFormElement.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const submitBtn = e.target.querySelector('button[type="submit"]');
        const originalText = submitBtn.textContent;
        
        // Disable button
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
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });

            const result = await response.json();
            console.log('📥 Login response:', result);
            
            if (result.success) {
                // ✅ Save session using SessionManager
                if (window.SessionManager) {
                    SessionManager.save(result.user, result.access_token, true);
                    
                    console.log('✅ Login successful!');
                    console.log('📧 Email:', result.user.email);
                    console.log('👤 User:', result.user.nama_lengkap);
                    
                    alert('Login berhasil! Selamat datang, ' + result.user.nama_lengkap);
                    
                    // Close modal
                    modal.style.display = 'none';
                    
                    // Redirect to dashboard    
                    window.location.href = '../../WEB/Dashboard/index.html';
                } else {
                    console.error('❌ SessionManager not found!');
                    alert('Error: Session manager tidak tersedia. Silakan refresh halaman.');
                }
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
// HANDLE REGISTER
// ========================================
const registerFormElement = registerForm.querySelector('form');
if (registerFormElement) {
    registerFormElement.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const form = e.target;
        const submitBtn = form.querySelector('button[type="submit"]');
        const originalText = submitBtn.textContent;
        
        // Disable button
        submitBtn.disabled = true;
        submitBtn.textContent = 'Mendaftar...';
        
        const formData = {
            action: 'register',
            nama_faskes: form.querySelector('[name="nama_faskes"]').value,
            nama_lengkap: form.querySelector('[name="nama_lengkap"]').value,
            username: form.querySelector('[name="username"]').value,
            jenis_kelamin: form.querySelector('[name="jenis_kelamin"]').value,
            alamat: form.querySelector('[name="alamat"]').value,
            no_telp: form.querySelector('[name="no_telp"]').value,
            email: form.querySelector('[name="email"]').value,
            password: form.querySelector('[name="password"]').value
        };

        console.log('📤 Attempting registration...');

        try {
            const response = await fetch('../../API/auth/auth.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });

            const result = await response.json();
            console.log('📥 Register response:', result);
            
            if (result.success) {
                // ✅ Save session using SessionManager
                if (window.SessionManager) {
                    SessionManager.save(result.user, result.access_token, true);
                    
                    console.log('✅ Registration successful!');
                    console.log('📧 Email:', result.user.email);
                    console.log('👤 User:', result.user.nama_lengkap);
                    
                    alert('Registrasi berhasil! Selamat datang, ' + result.user.nama_lengkap);
                    
                    // Close modal
                    modal.style.display = 'none';
                    
                    // Redirect to dashboard
                    window.location.href = '../../WEB/Dashboard/index.html';
                } else {
                    console.error('❌ SessionManager not found!');
                    alert('Error: Session manager tidak tersedia. Silakan refresh halaman.');
                }
            } else {
                alert('Registrasi gagal: ' + (result.message || 'Terjadi kesalahan'));
            }
        } catch (error) {
            console.error('❌ Error:', error);
            alert('Terjadi kesalahan saat registrasi: ' + error.message);
        } finally {
            submitBtn.disabled = false;
            submitBtn.textContent = originalText;
        }
    });
}

console.log('✅ Auth handlers ready');