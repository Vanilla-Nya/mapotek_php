// SessionHelper.js - Manages user sessions across the app
// Think of this as your "security guard" that checks IDs

class SessionHelper {
    constructor() {
        this.authApiUrl = '../API/auth/auth.php';
        this.currentUser = null;
        this.accessToken = null;
    }

    /**
     * Check if user is logged in (verify session)
     * Like asking: "Do you still have a valid ticket?"
     * @returns {Promise<boolean>}
     */
    async isLoggedIn() {
        console.log('🔐 Checking if user is logged in...');
        
        try {
            const response = await fetch(this.authApiUrl, {
                method: 'POST',
                credentials: 'include',  // IMPORTANT: Send cookies
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    action: 'verify_session'
                })
            });

            const result = await response.json();
            
            if (result.success && result.user) {
                // Save user data
                this.currentUser = result.user;
                this.accessToken = result.access_token;
                
                // Backup to localStorage
                localStorage.setItem('userEmail', result.user.email);
                localStorage.setItem('access_token', result.access_token);
                localStorage.setItem('currentUser', JSON.stringify(result.user));
                
                console.log('✅ User is logged in:', result.user.nama_lengkap);
                return true;
            } else {
                console.log('❌ User is NOT logged in');
                this.clearLocalData();
                return false;
            }
        } catch (error) {
            console.error('❌ Error checking login status:', error);
            return false;
        }
    }

    /**
     * Get current logged-in user
     * @returns {Object|null} User object or null
     */
    getCurrentUser() {
        if (this.currentUser) {
            return this.currentUser;
        }
        
        // Try to get from localStorage as fallback
        const stored = localStorage.getItem('currentUser');
        if (stored) {
            try {
                this.currentUser = JSON.parse(stored);
                return this.currentUser;
            } catch (e) {
                console.error('Error parsing stored user:', e);
            }
        }
        
        return null;
    }

    /**
     * Get access token
     * @returns {string|null}
     */
    getAccessToken() {
        if (this.accessToken) {
            return this.accessToken;
        }
        
        // Fallback to localStorage
        return localStorage.getItem('access_token');
    }

    /**
     * Login user
     * @param {string} email 
     * @param {string} password 
     * @returns {Promise<Object>}
     */
    async login(email, password) {
        console.log('🔑 Logging in...');
        
        try {
            const response = await fetch(this.authApiUrl, {
                method: 'POST',
                credentials: 'include',  // IMPORTANT!
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    action: 'login',
                    email: email,
                    password: password
                })
            });

            const result = await response.json();
            
            if (result.success) {
                this.currentUser = result.user;
                this.accessToken = result.access_token;
                
                // Save to localStorage
                localStorage.setItem('userEmail', result.user.email);
                localStorage.setItem('access_token', result.access_token);
                localStorage.setItem('currentUser', JSON.stringify(result.user));
                
                console.log('✅ Login successful');
            }
            
            return result;
        } catch (error) {
            console.error('❌ Login error:', error);
            return {
                success: false,
                message: 'Login failed: ' + error.message
            };
        }
    }

    /**
     * Logout user
     * @returns {Promise<Object>}
     */
    async logout() {
        console.log('🚪 Logging out...');
        
        try {
            const response = await fetch(this.authApiUrl, {
                method: 'POST',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    action: 'logout'
                })
            });

            const result = await response.json();
            
            // Clear local data regardless of server response
            this.clearLocalData();
            
            console.log('✅ Logged out');
            return result;
        } catch (error) {
            console.error('❌ Logout error:', error);
            this.clearLocalData();
            return { success: false, message: error.message };
        }
    }

    /**
     * Clear all local user data
     */
    clearLocalData() {
        this.currentUser = null;
        this.accessToken = null;
        localStorage.removeItem('userEmail');
        localStorage.removeItem('access_token');
        localStorage.removeItem('currentUser');
    }

    /**
     * Make authenticated API call
     * Automatically includes credentials
     * @param {string} url 
     * @param {Object} options - fetch options
     * @returns {Promise<Response>}
     */
    async authenticatedFetch(url, options = {}) {
        const defaultOptions = {
            credentials: 'include',  // Always include cookies
            headers: {
                'Content-Type': 'application/json',
                ...(options.headers || {})
            }
        };

        return fetch(url, { ...defaultOptions, ...options });
    }

    /**
     * Require login - redirect to login page if not logged in
     * Use this at the start of your fragments
     * @param {string} loginPageUrl 
     * @returns {Promise<boolean>}
     */
    async requireLogin(loginPageUrl = '/login.html') {
        const isLoggedIn = await this.isLoggedIn();
        
        if (!isLoggedIn) {
            console.log('🚫 Login required - redirecting...');
            alert('Sesi Anda telah berakhir. Silakan login kembali.');
            window.location.href = loginPageUrl;
            return false;
        }
        
        return true;
    }
}

// Create a global instance
window.sessionHelper = new SessionHelper();

console.log('✅ SessionHelper loaded and ready to use');