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
    private BottomNavigationView bottomNavigation;
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
        setupBottomNavigation();
        setupFAB();
        setupBackPressHandler();

        // Load dashboard fragment by default
        if (savedInstanceState == null) {
            loadFragment(dashboardFragment, "Dashboard");
            bottomNavigation.setSelectedItemId(R.id.nav_dashboard);
        }
    }

    private void initializeViews() {
        toolbar = findViewById(R.id.toolbar);
        bottomNavigation = findViewById(R.id.bottomNavigation);
        fabScanQR = findViewById(R.id.fabScanQR);
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

        dashboardFragment.setArguments(args);
        profileFragment.setArguments(args);
    }

    private void setupBottomNavigation() {
        bottomNavigation.setOnItemSelectedListener(item -> {
            int id = item.getItemId();

            if (id == R.id.nav_dashboard) {
                loadFragment(dashboardFragment, "Dashboard");
                updateToolbarTitle("MapoTek");
                return true;
            } else if (id == R.id.nav_find_doctor) {
                loadFragment(findDoctorFragment, "Cari Dokter");
                updateToolbarTitle("Cari Dokter");
                return true;
            } else if (id == R.id.nav_history) {
                loadFragment(historyFragment, "Riwayat");
                updateToolbarTitle("Riwayat");
                return true;
            } else if (id == R.id.nav_profile) {
                loadFragment(profileFragment, "Profil");
                updateToolbarTitle("Profil");
                return true;
            }

            return false;
        });
    }

    private void setupFAB() {
        fabScanQR.setOnClickListener(v -> openQRScanner());
    }

    private void loadFragment(Fragment fragment, String tag) {
        if (fragment == activeFragment) {
            return; // Don't reload the same fragment
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
        // You can use libraries like ZXing or ML Kit for QR scanning
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
                    bottomNavigation.setSelectedItemId(R.id.nav_dashboard);
                }
            }
        });
    }
}