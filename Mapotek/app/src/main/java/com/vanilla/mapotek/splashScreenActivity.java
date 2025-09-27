package com.vanilla.mapotek;

import android.animation.ObjectAnimator;
import android.content.Intent;
import android.os.Bundle;
import android.os.Handler;
import android.view.WindowManager;
import android.view.animation.DecelerateInterpolator;
import android.widget.ImageView;
import android.widget.ProgressBar;
import android.widget.TextView;
import androidx.appcompat.app.AppCompatActivity;

import com.vanilla.mapotek.auth.loginActivity;

public class splashScreenActivity extends AppCompatActivity {

    private ImageView splashLogo;
    private TextView appName, appSubtitle, splashLoadingText;
    private ProgressBar splashProgress;
    private Handler handler = new Handler();

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

        // Update loading text
        handler.postDelayed(() -> splashLoadingText.setText("Menyiapkan komponen..."), 1000);
        handler.postDelayed(() -> splashLoadingText.setText("Memuat data..."), 1800);
        handler.postDelayed(() -> splashLoadingText.setText("Hampir selesai..."), 2500);

        // Navigate to login after loading complete
        handler.postDelayed(this::goToLogin, 3500);
    }

    private void goToLogin() {
        Intent intent = new Intent(splashScreenActivity.this, loginActivity.class);
        startActivity(intent);

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