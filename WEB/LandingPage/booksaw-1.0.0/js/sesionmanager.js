// ========================================
// FILE: /Dashboard/js/sessionManager.js
// Session Management for All Pages
// ========================================

console.log('🔐 Loading SessionManager...');

window.SessionManager = {
    save(userData, token, rememberMe = true) {
        const sessionData = {
            user: userData,
            token: token,
            createdAt: Date.now(),
            expiresAt: Date.now() + (24 * 60 * 60 * 1000) // 24 hours
        };
        
        if (rememberMe) {
            localStorage.setItem('session', JSON.stringify(sessionData));
        } else {
            sessionStorage.setItem('session', JSON.stringify(sessionData));
        }
        
        sessionStorage.setItem('userEmail', userData.email);
        console.log('✅ Session saved');
    },
    
    get() {
        const session = localStorage.getItem('session') || sessionStorage.getItem('session');
        return session ? JSON.parse(session) : null;
    },
    
    isValid() {
        const session = this.get();
        if (!session) {
            console.log('❌ No session found');
            return false;
        }
        
        if (Date.now() > session.expiresAt) {
            console.log('⏰ Session expired');
            this.clear();
            return false;
        }
        
        console.log('✅ Session valid');
        return true;
    },
    
    clear() {
        localStorage.removeItem('session');
        sessionStorage.removeItem('session');
        sessionStorage.removeItem('userEmail');
        console.log('🗑️ Session cleared');
    },
    
    refresh() {
        const session = this.get();
        if (session) {
            session.expiresAt = Date.now() + (24 * 60 * 60 * 1000);
            const storage = localStorage.getItem('session') ? localStorage : sessionStorage;
            storage.setItem('session', JSON.stringify(session));
            console.log('🔄 Session refreshed');
        }
    }
};

console.log('✅ SessionManager loaded globally');