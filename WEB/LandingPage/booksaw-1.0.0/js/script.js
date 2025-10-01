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
openLogin.addEventListener('click', (e) => {
    e.preventDefault();
    modal.style.display = 'flex'; 
    loginForm.style.display = 'block';
    registerForm.style.display = 'none';
});

// Open register modal
openRegister.addEventListener('click', (e) => {
    e.preventDefault();
    modal.style.display = 'flex'; 
    loginForm.style.display = 'none';
    registerForm.style.display = 'block';
});

// Switch to register
toRegister.addEventListener('click', (e) => {
    e.preventDefault();
    loginForm.style.display = 'none';
    registerForm.style.display = 'block';
});

// Switch to login
toLogin.addEventListener('click', (e) => {
    e.preventDefault();
    registerForm.style.display = 'none';
    loginForm.style.display = 'block';
});

// Close modal
closeModal.addEventListener('click', () => {
    modal.style.display = 'none';
});

window.addEventListener('click', (e) => {
    if (e.target === modal) {
        modal.style.display = 'none';
    }
});

// Handle Login
loginForm.querySelector('form').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const formData = {
        action: 'login',
        email: e.target.querySelector('input[type="email"]').value,
        password: e.target.querySelector('input[type="password"]').value
    };

    try {
        const response = await fetch('../../API/auth/auth.php', {  // ← Updated path
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        });

        const result = await response.json();
        
        if (result.success) {
            alert(result.message);
            localStorage.setItem('access_token', result.access_token);
            localStorage.setItem('user', JSON.stringify(result.user));
            modal.style.display = 'none';
            location.reload();
        } else {
            alert(result.message);
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Terjadi kesalahan saat login');
    }
});

// Handle Register
registerForm.querySelector('form').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const form = e.target;
    const submitBtn = form.querySelector('button[type="submit"]');
    
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

    try {
        const response = await fetch('../../API/auth/auth.php', {  // ← Updated path
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        });

        const result = await response.json();
        
        if (result.success) {
            localStorage.setItem('access_token', result.access_token);
            localStorage.setItem('user', JSON.stringify(result.user));
            
            alert('Registrasi berhasil! Selamat datang, ' + result.user.nama_lengkap);
            
            modal.style.display = 'none';
            form.reset();
            location.reload();
        } else {
            alert('Gagal registrasi: ' + result.message);
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Terjadi kesalahan saat registrasi');
    } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Register';
    }
});