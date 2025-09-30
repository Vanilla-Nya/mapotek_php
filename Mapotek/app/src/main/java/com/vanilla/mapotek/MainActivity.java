package com.vanilla.mapotek;

import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.os.Bundle;
import android.util.Log;
import android.view.Menu;
import android.view.MenuItem;
import android.widget.Toast;
import androidx.activity.EdgeToEdge;
import androidx.appcompat.app.AlertDialog;
import androidx.appcompat.app.AppCompatActivity;
import androidx.core.graphics.Insets;
import androidx.core.view.ViewCompat;
import androidx.core.view.WindowInsetsCompat;
import androidx.fragment.app.Fragment;
import androidx.fragment.app.FragmentTransaction;
import com.google.android.material.appbar.MaterialToolbar;
import com.google.android.material.floatingactionbutton.FloatingActionButton;
import com.vanilla.mapotek.auth.AuthManager;
import com.vanilla.mapotek.auth.loginActivity;

public class MainActivity extends AppCompatActivity {

    private MaterialToolbar toolbar;
    private FloatingActionButton fabScanQR;
    private static final int QR_SCAN_REQUEST = 200;

    // Fragments
    private DashboardFragment dashboardFragment;
    private FindDoctorFragment findDoctorFragment;
    private HistoryFragment historyFragment;
    private ProfileFragment profileFragment;

    // Currently active fragment
    private Fragment activeFragment;

    // SharedPreferences for user data
    private SharedPreferences sharedPreferences;
    private static final String PREF_NAME = "UserPrefs";

    // AuthManager for authentication
    private AuthManager authManager;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        EdgeToEdge.enable(this);
        setContentView(R.layout.activity_main);

        // Initialize AuthManager
        authManager = new AuthManager(this);

        // Double check authentication
        if (!authManager.isLoggedIn()) {
            // User somehow got here without being logged in
            redirectToLogin();
            return;
        }

        ViewCompat.setOnApplyWindowInsetsListener(findViewById(R.id.appBarLayout), (v, insets) -> {
            Insets systemBars = insets.getInsets(WindowInsetsCompat.Type.systemBars());
            v.setPadding(systemBars.left, systemBars.top, systemBars.right, systemBars.bottom);
            return insets;
        });

        initializeViews();
        setupToolbar();
        setupFragments();
        setupFAB();
        setupBackPressHandler();

        if (savedInstanceState == null) {
            selectNavItemInternal("dashboard");
        }
    }

    private void selectNavItemInternal(String navItem) {
        switch (navItem) {
            case "dashboard":
                loadFragment(dashboardFragment, "Dashboard");
                updateToolbarTitle("Dashboard");
                break;
            case "findDoctor":
                loadFragment(findDoctorFragment, "Cari Dokter");
                updateToolbarTitle("Cari Dokter");
                break;
            case "history":
                loadFragment(historyFragment, "Riwayat");
                updateToolbarTitle("Riwayat");
                break;
            case "profile":
                loadFragment(profileFragment, "Profil");
                updateToolbarTitle("Profil");
                break;
        }
    }

    private void initializeViews() {
        toolbar = findViewById(R.id.toolbar);
        fabScanQR = findViewById(R.id.fabScanQR);

        // Custom navigation views
        findViewById(R.id.navDashboard).setOnClickListener(v -> selectNavItemInternal("dashboard"));
        findViewById(R.id.navFindDoctor).setOnClickListener(v -> selectNavItemInternal("findDoctor"));
        findViewById(R.id.navHistory).setOnClickListener(v -> selectNavItemInternal("history"));
        findViewById(R.id.navProfile).setOnClickListener(v -> selectNavItemInternal("profile"));

        sharedPreferences = getSharedPreferences(PREF_NAME, MODE_PRIVATE);
    }

    private void setupToolbar() {
        setSupportActionBar(toolbar);
    }

    private void setupFragments() {
        // Initialize all fragments
        dashboardFragment = new DashboardFragment();
        findDoctorFragment = new FindDoctorFragment();
        historyFragment = new HistoryFragment();
        profileFragment = new ProfileFragment();

        // Get user data from intent or AuthManager
        Bundle args = new Bundle();

        // Try to get from intent first
        String userId = getIntent().getStringExtra("USER_ID");
        String userEmail = getIntent().getStringExtra("USER_EMAIL");
        String userName = getIntent().getStringExtra("USER_NAME");

        // If not in intent, get from AuthManager
        if (userId == null) {
            userId = authManager.getUserId();
        }
        if (userEmail == null) {
            userEmail = authManager.getUserEmail();
        }
        if (userName == null || userName.isEmpty()) {
            userName = authManager.getUserName();
            if (userName == null || userName.isEmpty()) {
                userName = userEmail != null ? userEmail.split("@")[0] : "Pengguna";
            }
        }

        // Add to bundle
        args.putString("USER_ID", userId);
        args.putString("USER_EMAIL", userEmail);
        args.putString("USER_NAME", userName);

        // Set arguments for fragments that need user data
        dashboardFragment.setArguments(args);
        profileFragment.setArguments(args);

        // Also save user data to SharedPreferences for easy access
        SharedPreferences.Editor editor = sharedPreferences.edit();
        editor.putString("user_id", userId);
        editor.putString("user_email", userEmail);
        editor.putString("user_name", userName);

        // Initialize default profile data if not exists
        if (!sharedPreferences.contains("nik")) {
            editor.putString("nik", "1234567890123456");
            editor.putString("nama_lengkap", userName);
            editor.putString("tanggal_lahir", "01/01/1990");
            editor.putString("alamat", "Jl. Raya No. 123, Surabaya, Jawa Timur");
        }
        editor.apply();
    }

    private void setupFAB() {
        fabScanQR.setOnClickListener(v -> openQRScanner());
    }

    private void loadFragment(Fragment fragment, String tag) {
        if (fragment == activeFragment) {
            return;
        }

        FragmentTransaction transaction = getSupportFragmentManager().beginTransaction();

        // Add smooth transition animation
        transaction.setCustomAnimations(
                android.R.anim.fade_in,
                android.R.anim.fade_out
        );

        if (activeFragment != null) {
            transaction.hide(activeFragment);
        }

        // Add fragment if not already added
        if (!fragment.isAdded()) {
            transaction.add(R.id.nav_host_fragment, fragment, tag);
        } else {
            transaction.show(fragment);
        }

        transaction.commit();
        activeFragment = fragment;
    }

    private void updateToolbarTitle(String title) {
        if (getSupportActionBar() != null) {
            getSupportActionBar().setTitle(title);
        }
    }

    private void openQRScanner() {
        Intent intent = new Intent(MainActivity.this, qrScannerActivity.class);
        startActivityForResult(intent, QR_SCAN_REQUEST);
    }

    @Override
    protected void onActivityResult(int requestCode, int resultCode, Intent data) {
        super.onActivityResult(requestCode, resultCode, data);

        if (requestCode == QR_SCAN_REQUEST && resultCode == RESULT_OK) {
            if (data != null) {
                String qrData = data.getStringExtra("QR_DATA");

                // Process the QR data
                Toast.makeText(this, "QR Code: " + qrData, Toast.LENGTH_LONG).show();

                // Do something with the data, like:
                // - Navigate to a specific screen
                // - Verify patient information
                // - Check in for appointment
                processQRCode(qrData);
            }
        }
    }

    private void processQRCode(String qrData) {
        // Handle the scanned QR code data
        // Example: if QR contains patient ID, show their info
        Log.d("MainActivity", "Scanned QR: " + qrData);

        // You could parse JSON from QR code:
        // try {
        //     JSONObject json = new JSONObject(qrData);
        //     String patientId = json.getString("patient_id");
        //     // ... do something
        // } catch (JSONException e) {
        //     e.printStackTrace();
        // }
    }

    @Override
    public boolean onCreateOptionsMenu(Menu menu) {
        getMenuInflater().inflate(R.menu.top_menu, menu);
        return true;
    }

    @Override
    public boolean onOptionsItemSelected(MenuItem item) {
        int id = item.getItemId();

        if (id == R.id.action_notifications) {
            Toast.makeText(this, "Notifikasi", Toast.LENGTH_SHORT).show();
            return true;
        } else if (id == R.id.action_settings) {
            Toast.makeText(this, "Pengaturan", Toast.LENGTH_SHORT).show();
            return true;
        } else if (id == R.id.action_logout) {
            showLogoutConfirmation();
            return true;
        }

        return super.onOptionsItemSelected(item);
    }

    private void showLogoutConfirmation() {
        new AlertDialog.Builder(this)
                .setTitle("Keluar")
                .setMessage("Apakah Anda yakin ingin keluar dari aplikasi?")
                .setPositiveButton("Ya", (dialog, which) -> performLogout())
                .setNegativeButton("Tidak", null)
                .show();
    }

    private void performLogout() {
        // Clear ALL stored data

        // 1. Clear AuthManager (authentication data)
        authManager.logout();

        // 2. Clear UserPrefs (user preferences)
        SharedPreferences.Editor editor = sharedPreferences.edit();
        editor.clear();
        editor.apply();

        // 3. Clear any other app-specific preferences
        SharedPreferences loginPrefs = getSharedPreferences("LoginPrefs", MODE_PRIVATE);
        loginPrefs.edit().clear().apply();

        // Log the logout action
        Log.d("MainActivity", "User logged out successfully");

        // Show logout message
        Toast.makeText(this, "Anda telah keluar", Toast.LENGTH_SHORT).show();

        // Redirect to login
        redirectToLogin();
    }

    private void redirectToLogin() {
        // Go directly to login (not splash) to avoid auto-login check
        Intent intent = new Intent(MainActivity.this, loginActivity.class);

        // Clear the entire activity stack
        intent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TASK);

        startActivity(intent);

        // Use finishAffinity() to close all activities in this task
        finishAffinity();
    }

    // Method to get current fragment (useful for fragment communication)
    public Fragment getCurrentFragment() {
        return activeFragment;
    }

    // Method for fragments to communicate with main activity
    public void showToast(String message) {
        Toast.makeText(this, message, Toast.LENGTH_SHORT).show();
    }

    // Modern way to handle back press
    private void setupBackPressHandler() {
        getOnBackPressedDispatcher().addCallback(this, new androidx.activity.OnBackPressedCallback(true) {
            @Override
            public void handleOnBackPressed() {
                // Check if we're on dashboard
                if (activeFragment == dashboardFragment) {
                    // Show exit confirmation
                    new AlertDialog.Builder(MainActivity.this)
                            .setTitle("Keluar Aplikasi")
                            .setMessage("Apakah Anda yakin ingin keluar?")
                            .setPositiveButton("Ya", (dialog, which) -> finish())
                            .setNegativeButton("Tidak", null)
                            .show();
                } else {
                    // Go back to dashboard
                    selectNavItemInternal("dashboard");
                }
            }
        });
    }

    @Override
    protected void onResume() {
        super.onResume();

        // Double-check authentication when activity resumes
        if (!authManager.isLoggedIn()) {
            redirectToLogin();
        }
    }
}