package com.vanilla.mapotek;

import android.content.Intent;
import android.content.SharedPreferences;
import android.os.Bundle;
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
import com.google.android.material.bottomnavigation.BottomNavigationView;
import com.google.android.material.floatingactionbutton.FloatingActionButton;

public class MainActivity extends AppCompatActivity {

    private MaterialToolbar toolbar;
    private FloatingActionButton fabScanQR;

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

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        EdgeToEdge.enable(this);
        setContentView(R.layout.activity_main);

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
                updateToolbarTitle("Dahboard");
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

        // Pass user data to fragments if needed
        Bundle args = new Bundle();
        String userName = getIntent().getStringExtra("USER_NAME");
        if (userName == null || userName.isEmpty()) {
            userName = sharedPreferences.getString("user_name", "Pengguna");
        }
        args.putString("USER_NAME", userName);

        // Set arguments for fragments that need user data
        dashboardFragment.setArguments(args);
        profileFragment.setArguments(args);

        // Also save user data to SharedPreferences for profile fragment to access
        SharedPreferences.Editor editor = sharedPreferences.edit();
        editor.putString("user_name", userName);

        // User data for profile fragment
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
        Toast.makeText(this, "Membuka Scanner QR", Toast.LENGTH_SHORT).show();
        // TODO: Implement QR Scanner
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
                .setPositiveButton("Ya", (dialog, which) -> {
                    // Clear user session
                    SharedPreferences.Editor editor = sharedPreferences.edit();
                    editor.clear();
                    editor.apply();

                    // Return to login
                    Intent intent = new Intent(MainActivity.this, loginActivity.class);
                    intent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TASK);
                    startActivity(intent);
                    finish();
                })
                .setNegativeButton("Tidak", null)
                .show();
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
}