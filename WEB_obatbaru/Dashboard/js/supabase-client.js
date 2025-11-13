console.log('🟢 Loading Supabase client...');

// Check if Supabase library is loaded
if (!window.supabase) {
    console.error('❌ Supabase library not loaded! Make sure CDN script is included.');
    alert('ERROR: Supabase library tidak ditemukan!');
} else {
    // Supabase configuration
    const SUPABASE_URL = 'https://brhaksondhloibpwtrdo.supabase.co';
    const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJyaGFrc29uZGhsb2licHd0cmRvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY1NDIxNDksImV4cCI6MjA3MjExODE0OX0.sHs9TbfPP38A5ikNFoZlOBJ67T1wtDiFMepEJn9ctfg';

    // Create global Supabase client
    window.supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

    console.log('✅ Supabase client initialized successfully');
    console.log('   URL:', SUPABASE_URL);
}