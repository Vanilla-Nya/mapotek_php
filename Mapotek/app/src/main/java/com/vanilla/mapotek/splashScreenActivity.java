package com.vanilla.mapotek;

import android.animation.ObjectAnimator;
import android.content.Intent;
import android.os.Bundle;
import android.os.Handler;
import android.util.Log;
import android.view.WindowManager;
import android.view.animation.DecelerateInterpolator;
import android.widget.ImageView;
import android.widget.ProgressBar;
import android.widget.TextView;
import android.widget.Toast;

import androidx.appcompat.app.AppCompatActivity;

import com.vanilla.mapotek.auth.AuthManager;
import com.vanilla.mapotek.auth.loginActivity;

public class splashScreenActivity extends AppCompatActivity {

    private ImageView splashLogo;
    private TextView appName, appSubtitle, splashLoadingText;
    private ProgressBar splashProgress;
    private Handler handler = new Handler();
    private AuthManager authManager;

    // Track if we're navigating to prevent double navigation
    private boolean isNavigating = false;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_splash_screen);

        // Hide status bar for full screen effect
        getWindow().setFlags(WindowManager.LayoutParams.FLAG_FULLSCREEN,
                WindowManager.LayoutParams.FLAG_FULLSCREEN);

        initViews();
        startAnimations();
        simulateLoading();
    }

    private void initViews() {
        splashLogo = findViewById(R.id.splashLogo);
        appName = findViewById(R.id.appName);
        appSubtitle = findViewById(R.id.appSubtitle);
        splashLoadingText = findViewById(R.id.splashLoadingText);
        splashProgress = findViewById(R.id.splashProgress);

        // Initialize AuthManager early
        authManager = new AuthManager(this);
    }

    private void startAnimations() {
        // Logo scale up animation
        ObjectAnimator logoScale = ObjectAnimator.ofFloat(splashLogo, "scaleX", 0.5f, 1.0f);
        ObjectAnimator logoScaleY = ObjectAnimator.ofFloat(splashLogo, "scaleY", 0.5f, 1.0f);
        logoScale.setDuration(1000);
        logoScaleY.setDuration(1000);
        logoScale.setInterpolator(new DecelerateInterpolator());
        logoScaleY.setInterpolator(new DecelerateInterpolator());
        logoScale.start();
        logoScaleY.start();

        // App name slide up animation
        ObjectAnimator nameSlide = ObjectAnimator.ofFloat(appName, "translationY", 100f, 0f);
        nameSlide.setDuration(800);
        nameSlide.setStartDelay(500);
        nameSlide.setInterpolator(new DecelerateInterpolator());
        nameSlide.start();

        // Subtitle fade in
        ObjectAnimator subtitleFade = ObjectAnimator.ofFloat(appSubtitle, "alpha", 0f, 1f);
        subtitleFade.setDuration(600);
        subtitleFade.setStartDelay(800);
        subtitleFade.start();

        // Loading text fade in
        ObjectAnimator loadingFade = ObjectAnimator.ofFloat(splashLoadingText, "alpha", 0f, 1f);
        loadingFade.setDuration(400);
        loadingFade.setStartDelay(1200);
        loadingFade.start();
    }

    private void simulateLoading() {
        // Animate progress bar
        ObjectAnimator progressAnim = ObjectAnimator.ofInt(splashProgress, "progress", 0, 100);
        progressAnim.setDuration(2500);
        progressAnim.setStartDelay(1000);
        progressAnim.setInterpolator(new DecelerateInterpolator());
        progressAnim.start();

        // Update loading text based on auth status
        if (authManager.isLoggedIn()) {
            handler.postDelayed(() -> splashLoadingText.setText("Memuat data pengguna..."), 1000);
            handler.postDelayed(() -> splashLoadingText.setText("Memverifikasi sesi..."), 1800);
            handler.postDelayed(() -> splashLoadingText.setText("Menyiapkan dashboard..."), 2500);
        } else {
            handler.postDelayed(() -> splashLoadingText.setText("Menyiapkan komponen..."), 1000);
            handler.postDelayed(() -> splashLoadingText.setText("Memuat data..."), 1800);
            handler.postDelayed(() -> splashLoadingText.setText("Hampir selesai..."), 2500);
        }

        // Decide where to navigate after loading
        handler.postDelayed(this::checkAuthAndNavigate, 3500);
    }

    private void checkAuthAndNavigate() {
        // Prevent multiple navigations
        if (isNavigating) {
            return;
        }
        isNavigating = true;

        // Debug logs to track what's happening
        Log.d("SplashScreen", "=== Authentication Check ===");
        Log.d("SplashScreen", "isLoggedIn: " + authManager.isLoggedIn());
        Log.d("SplashScreen", "isTokenValid: " + authManager.isTokenValid());
        Log.d("SplashScreen", "Token exists: " + (authManager.getAccessToken() != null));
        Log.d("SplashScreen", "UserId: " + authManager.getUserId());
        Log.d("SplashScreen", "UserEmail: " + authManager.getUserEmail());

        // Check authentication status
        if (authManager.isLoggedIn() && authManager.isTokenValid()) {
            // User appears to be logged in, verify with server
            Log.d("SplashScreen", "User appears logged in, verifying token with server...");
            verifyTokenWithServer();
        } else {
            // User is not logged in or token is invalid
            Log.d("SplashScreen", "User is not logged in, redirecting to login");

            // Clear any invalid auth data
            if (authManager.getAccessToken() != null && !authManager.isTokenValid()) {
                authManager.logout();
                Toast.makeText(this, "Sesi Anda telah berakhir, silakan login kembali",
                        Toast.LENGTH_SHORT).show();
            }

            goToLogin();
        }
    }

    private void verifyTokenWithServer() {
        // Update loading text to show verification
        runOnUiThread(() -> splashLoadingText.setText("Memverifikasi sesi..."));

        // Verify token with server
        authManager.verifyToken(new AuthManager.AuthCallback() {
            @Override
            public void onSuccess() {
                Log.d("SplashScreen", "Token verified successfully with server");
                runOnUiThread(() -> {
                    splashLoadingText.setText("Selamat datang kembali!");

                    // Optional: Show welcome message
                    String userEmail = authManager.getUserEmail();
                    if (userEmail != null && !userEmail.isEmpty()) {
                        Toast.makeText(splashScreenActivity.this,
                                "Selamat datang kembali!",
                                Toast.LENGTH_SHORT).show();
                    }

                    // Small delay for smooth transition
                    handler.postDelayed(() -> goToDashboard(), 500);
                });
            }

            @Override
            public void onError(String error) {
                Log.e("SplashScreen", "Token verification failed: " + error);
                runOnUiThread(() -> {
                    // Token is invalid, clear auth data
                    authManager.logout();

                    Toast.makeText(splashScreenActivity.this,
                            "Sesi tidak valid, silakan login kembali",
                            Toast.LENGTH_LONG).show();

                    goToLogin();
                });
            }
        });
    }

    private void goToLogin() {
        Intent intent = new Intent(splashScreenActivity.this, loginActivity.class);

        // Clear the back stack so user can't go back to splash screen
        intent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TASK);

        startActivity(intent);

        // Add fade transition
        overridePendingTransition(R.anim.fade_in, R.anim.fade_out);
        finish();
    }

    private void goToDashboard() {
        Intent dashboardIntent = new Intent(splashScreenActivity.this, MainActivity.class);

        // Pass user info if needed
        String userId = authManager.getUserId();
        String userEmail = authManager.getUserEmail();

        if (userId != null) {
            dashboardIntent.putExtra("USER_ID", userId);
        }
        if (userEmail != null) {
            dashboardIntent.putExtra("USER_EMAIL", userEmail);
        }

        // Clear the back stack
        dashboardIntent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TASK);

        startActivity(dashboardIntent);

        // Add fade transition
        overridePendingTransition(R.anim.fade_in, R.anim.fade_out);
        finish();
    }

    @Override
    protected void onDestroy() {
        super.onDestroy();
        if (handler != null) {
            handler.removeCallbacksAndMessages(null);
        }
    }
}