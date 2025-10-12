// SessionManager - Bridge between PHP session and JavaScript
console.log('🔐 SessionManager Loading...');

class SessionManager {
    constructor() {
        this.SESSION_KEY = 'mapotek_session';
        this.API_URL = 'MAPOTEK_PHP/WEB/API/auth'; // Sesuaikan dengan path kamu
    }

    /**
     * Check if session is valid by verifying with server
     * Returns Promise<boolean>
     */
    async isValid() {
        try {
            const response = await fetch(`${this.API_URL}/check_session.php`, {
                method: 'GET',
                credentials: 'include' // ✅ Penting! Kirim cookie session
            });
            
            const result = await response.json();
            
            if (result.success) {
                // Store user data in localStorage for quick access
                this.storeLocal(result.data);
                return true;
            }
            
            // Session tidak valid, hapus local storage
            this.clear();
            return false;
            
        } catch (error) {
            console.error('❌ Session validation error:', error);
            return false;
        }
    }

    /**
     * Get current session data (from localStorage, tapi sudah tervalidasi dari server)
     */
    get() {
        const stored = localStorage.getItem(this.SESSION_KEY);
        if (!stored) return null;
        
        try {
            return JSON.parse(stored);
        } catch (e) {
            console.error('Error parsing session:', e);
            return null;
        }
    }

    /**
     * Store session data locally (dipanggil setelah validasi server)
     */
    storeLocal(userData) {
        const sessionData = {
            user: userData,
            createdAt: new Date().toISOString(),
            expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 jam
            token: userData.access_token || ''
        };
        
        localStorage.setItem(this.SESSION_KEY, JSON.stringify(sessionData));
        console.log('✅ Session stored locally');
    }

    /**
     * Refresh session data from server
     */
    async refresh() {
        console.log('🔄 Refreshing session...');
        return await this.isValid();
    }

    /**
     * Clear local session
     */
    clear() {
        localStorage.removeItem(this.SESSION_KEY);
        console.log('🗑️ Local session cleared');
    }

    /**
     * Logout (clear both local and server session)
     */
    async logout() {
        try {
            const response = await fetch(`${this.API_URL}/auth.php`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                credentials: 'include',
                body: JSON.stringify({
                    action: 'logout'
                })
            });
            
            const result = await response.json();
            
            // Clear local regardless of server response
            this.clear();
            
            return result.success;
            
        } catch (error) {
            console.error('❌ Logout error:', error);
            this.clear(); // Clear local anyway
            return false;
        }
    }

    /**
     * Check if user is authenticated
     */
    isAuthenticated() {
        const session = this.get();
        return session && session.user && session.user.username;
    }

    /**
     * Get user info
     */
    getUser() {
        const session = this.get();
        return session ? session.user : null;
    }
}

// Create global instance
window.SessionManager = new SessionManager();
console.log('✅ SessionManager loaded');

// Export for modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SessionManager;
}