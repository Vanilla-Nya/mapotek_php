package com.vanilla.mapotek;

import android.Manifest;
import android.content.Intent;
import android.content.SharedPreferences;
import android.os.Bundle;
import android.util.Log;
import android.view.View;
import android.view.ViewGroup;
import android.widget.ImageView;
import android.widget.Toast;
import androidx.activity.EdgeToEdge;
import androidx.appcompat.app.AlertDialog;
import androidx.appcompat.app.AppCompatActivity;
import androidx.core.graphics.Insets;
import androidx.core.view.ViewCompat;
import androidx.core.view.WindowInsetsCompat;
import androidx.fragment.app.Fragment;
import androidx.fragment.app.FragmentTransaction;
import com.google.android.material.floatingactionbutton.FloatingActionButton;
import com.vanilla.mapotek.auth.AuthManager;
import com.vanilla.mapotek.auth.loginActivity;
import com.vanilla.mapotek.database.supabaseHelper;
import org.json.JSONArray;
import org.json.JSONObject;

public class MainActivity extends AppCompatActivity {

    private static final String TAG = "MainActivity";
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

        // Enable edge-to-edge
        EdgeToEdge.enable(this);

        setContentView(R.layout.activity_main);

        // Initialize AuthManager
        authManager = new AuthManager(this);

        if (!authManager.isLoggedIn()) {
            redirectToLogin();
            return;
        }

        // Apply window insets
        ViewCompat.setOnApplyWindowInsetsListener(findViewById(R.id.main_coordinator), (v, insets) -> {
            Insets systemBars = insets.getInsets(WindowInsetsCompat.Type.systemBars());

            // Add bottom padding to fragment container
            View fragmentContainer = findViewById(R.id.nav_host_fragment);
            if (fragmentContainer != null) {
                int navBarHeightPx = (int) (88 * getResources().getDisplayMetrics().density); // 72dp + 16dp margin
                fragmentContainer.setPadding(0, systemBars.top, 0, navBarHeightPx + systemBars.bottom);
            }

            // Apply bottom margin to nav container
            View bottomNavContainer = findViewById(R.id.bottomNavContainer);
            if (bottomNavContainer != null) {
                ViewGroup.MarginLayoutParams params = (ViewGroup.MarginLayoutParams) bottomNavContainer.getLayoutParams();
                params.bottomMargin = systemBars.bottom + 16;
                bottomNavContainer.setLayoutParams(params);
            }

            return WindowInsetsCompat.CONSUMED;
        });

        initializeViews();
        setupFragments();
        setupFAB();
        setupBackPressHandler();

        if (savedInstanceState == null) {
            selectNavItemInternal("dashboard");
        }
    }

    private void selectNavItemInternal(String navItem) {
        // ✅ Clear back stack IMMEDIATELY (synchronously)
        if (getSupportFragmentManager().getBackStackEntryCount() > 0) {
            getSupportFragmentManager().popBackStackImmediate();
        }

        resetNavIcons();

        switch (navItem) {
            case "dashboard":
                loadFragment(dashboardFragment, "Dashboard");
                setNavSelected(R.id.navDashboard, R.id.iconDashboard, R.id.circleDashboard);
                break;
            case "findDoctor":
                loadFragment(findDoctorFragment, "Cari Dokter");
                setNavSelected(R.id.navFindDoctor, R.id.iconFindDoctor, R.id.circleFindDoctor);
                break;
            case "history":
                loadFragment(historyFragment, "Riwayat");
                setNavSelected(R.id.navHistory, R.id.iconHistory, R.id.circleHistory);
                break;
            case "profile":
                loadFragment(profileFragment, "Profil");
                setNavSelected(R.id.navProfile, R.id.iconProfile, R.id.circleProfile);
                break;
        }
    }

    public void navigateToSection(String section) {
        selectNavItemInternal(section);
    }

    private void initializeViews() {
        fabScanQR = findViewById(R.id.fabScanQR);

        // Custom navigation views
        findViewById(R.id.navDashboard).setOnClickListener(v -> selectNavItemInternal("dashboard"));
        findViewById(R.id.navFindDoctor).setOnClickListener(v -> selectNavItemInternal("findDoctor"));
        findViewById(R.id.navHistory).setOnClickListener(v -> selectNavItemInternal("history"));
        findViewById(R.id.navProfile).setOnClickListener(v -> selectNavItemInternal("profile"));

        sharedPreferences = getSharedPreferences(PREF_NAME, MODE_PRIVATE);
    }

    private void resetNavIcons() {
        resetNavItem(R.id.iconDashboard, R.id.circleDashboard);
        resetNavItem(R.id.iconFindDoctor, R.id.circleFindDoctor);
        resetNavItem(R.id.iconHistory, R.id.circleHistory);
        resetNavItem(R.id.iconProfile, R.id.circleProfile);
    }

    private void setNavSelected(int containerId, int iconId, int circleId) {
        ImageView icon = findViewById(iconId);
        View circle = findViewById(circleId);

        // Show circle with animation
        circle.setVisibility(View.VISIBLE);
        circle.setScaleX(0f);
        circle.setScaleY(0f);
        circle.animate()
                .scaleX(1f)
                .scaleY(1f)
                .setDuration(250)
                .start();

        // Change icon color to white
        icon.setColorFilter(getColor(R.color.white));
    }

    private void resetNavItem(int iconId, int circleId) {
        ImageView icon = findViewById(iconId);
        View circle = findViewById(circleId);

        icon.setColorFilter(getColor(R.color.text_secondary));
        circle.setVisibility(View.GONE);
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

    private void openQRScanner() {
        Intent intent = new Intent(MainActivity.this, qrScannerActivity.class);
        startActivityForResult(intent, QR_SCAN_REQUEST);
    }

    @Override
    protected void onActivityResult(int requestCode, int resultCode, Intent data) {
        super.onActivityResult(requestCode, resultCode, data);

        Log.d(TAG, "onActivityResult - requestCode: " + requestCode + ", resultCode: " + resultCode);

        if (requestCode == QR_SCAN_REQUEST && resultCode == RESULT_OK) {
            if (data != null) {
                String qrType = data.getStringExtra("QR_TYPE");

                Log.d(TAG, "QR_TYPE: [" + qrType + "]");

                if ("DOCTOR".equals(qrType)) {
                    String doctorId = data.getStringExtra("DOCTOR_ID");
                    String doctorName = data.getStringExtra("DOCTOR_NAME");

                    Log.d(TAG, "✅ Doctor QR - ID: [" + doctorId + "], Name: [" + doctorName + "]");

                    openBookingForDoctor(doctorId, doctorName);
                } else {
                    Log.e(TAG, "❌ Not a DOCTOR type, got: " + qrType);
                    String qrData = data.getStringExtra("QR_DATA");
                    Log.d(TAG, "Fallback QR_DATA: [" + qrData + "]");
                    Toast.makeText(this, "QR Code: " + qrData, Toast.LENGTH_LONG).show();
                    processQRCode(qrData);
                }
            } else {
                Log.e(TAG, "❌ Intent data is null!");
            }
        } else {
            Log.e(TAG, "❌ Request/result doesn't match");
        }
    }

    private void openBookingForDoctor(String doctorId, String doctorName) {
        // If doctor name is empty, we need to fetch it from database
        if (doctorName == null || doctorName.isEmpty()) {
            fetchDoctorAndOpenBooking(doctorId);
        } else {
            // We have all info, open booking directly
            openBookingFragment(doctorId, doctorName);
        }
    }

    private void fetchDoctorAndOpenBooking(String doctorId) {
        // Show loading
        Toast.makeText(this, "Memuat data dokter...", Toast.LENGTH_SHORT).show();

        String accessToken = authManager.getAccessToken();
        String table = "dokter";
        String params = "*&id_dokter=eq." + doctorId;

        supabaseHelper.select(this, table, params, accessToken,
                new supabaseHelper.SupabaseCallback() {
                    @Override
                    public void onSuccess(String response) {
                        try {
                            JSONArray jsonArray = new JSONArray(response);
                            if (jsonArray.length() > 0) {
                                JSONObject doctor = jsonArray.getJSONObject(0);
                                String doctorName = doctor.optString("nama_lengkap", "Dokter");

                                runOnUiThread(() -> {
                                    openBookingFragment(doctorId, doctorName);
                                });
                            } else {
                                runOnUiThread(() -> {
                                    Toast.makeText(MainActivity.this,
                                            "Dokter tidak ditemukan",
                                            Toast.LENGTH_SHORT).show();
                                });
                            }
                        } catch (Exception e) {
                            Log.e(TAG, "Error parsing doctor: " + e.getMessage());
                            runOnUiThread(() -> {
                                Toast.makeText(MainActivity.this,
                                        "Error: " + e.getMessage(),
                                        Toast.LENGTH_SHORT).show();
                            });
                        }
                    }

                    @Override
                    public void onError(String error) {
                        Log.e(TAG, "Error fetching doctor: " + error);
                        runOnUiThread(() -> {
                            Toast.makeText(MainActivity.this,
                                    "Gagal memuat data dokter",
                                    Toast.LENGTH_SHORT).show();
                        });
                    }
                });
    }

    private void openBookingFragment(String doctorId, String doctorName) {
        Log.d(TAG, "Opening booking fragment for: " + doctorName);

        BookingFragment bookingFragment = BookingFragment.newInstance(doctorId, doctorName);

        FragmentTransaction transaction = getSupportFragmentManager().beginTransaction();

        // ✅ Add animation
        transaction.setCustomAnimations(
                android.R.anim.slide_in_left,
                android.R.anim.slide_out_right,
                android.R.anim.slide_in_left,
                android.R.anim.slide_out_right
        );

        // ✅ IMPORTANT: Hide the currently active fragment
        if (activeFragment != null) {
            transaction.hide(activeFragment);
            Log.d(TAG, "Hiding active fragment: " + activeFragment.getClass().getSimpleName());
        }

        // ✅ Add booking fragment on top
        transaction.add(R.id.nav_host_fragment, bookingFragment, "Booking");
        transaction.addToBackStack("Booking");
        transaction.commit();

        Toast.makeText(this, "Booking untuk: " + doctorName, Toast.LENGTH_SHORT).show();
    }

    private void processQRCode(String qrData) {
        Log.d(TAG, "Scanned QR: " + qrData);
        // Process other types of QR data here if needed
    }

    public void showLogoutConfirmation() {
        new AlertDialog.Builder(this)
                .setTitle("Keluar")
                .setMessage("Apakah Anda yakin ingin keluar dari aplikasi?")
                .setPositiveButton("Ya", (dialog, which) -> performLogout())
                .setNegativeButton("Tidak", null)
                .show();
    }

    private void performLogout() {
        authManager.logout();

        SharedPreferences.Editor editor = sharedPreferences.edit();
        editor.clear();
        editor.apply();

        SharedPreferences loginPrefs = getSharedPreferences("LoginPrefs", MODE_PRIVATE);
        loginPrefs.edit().clear().apply();

        Log.d(TAG, "User logged out successfully");
        Toast.makeText(this, "Anda telah keluar", Toast.LENGTH_SHORT).show();

        redirectToLogin();
    }

    private void redirectToLogin() {
        Intent intent = new Intent(MainActivity.this, loginActivity.class);
        intent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TASK);
        startActivity(intent);
        finishAffinity();
    }

    public Fragment getCurrentFragment() {
        return activeFragment;
    }

    public void showToast(String message) {
        Toast.makeText(this, message, Toast.LENGTH_SHORT).show();
    }

    private void setupBackPressHandler() {
        getOnBackPressedDispatcher().addCallback(this, new androidx.activity.OnBackPressedCallback(true) {
            @Override
            public void handleOnBackPressed() {
                // Check if there's a fragment in back stack
                if (getSupportFragmentManager().getBackStackEntryCount() > 0) {
                    getSupportFragmentManager().popBackStack();
                } else if (activeFragment == dashboardFragment) {
                    new AlertDialog.Builder(MainActivity.this)
                            .setTitle("Keluar Aplikasi")
                            .setMessage("Apakah Anda yakin ingin keluar?")
                            .setPositiveButton("Ya", (dialog, which) -> finish())
                            .setNegativeButton("Tidak", null)
                            .show();
                } else {
                    selectNavItemInternal("dashboard");
                }
            }
        });
    }

    @Override
    protected void onResume() {
        super.onResume();

        if (!authManager.isLoggedIn()) {
            redirectToLogin();
        }
    }
}