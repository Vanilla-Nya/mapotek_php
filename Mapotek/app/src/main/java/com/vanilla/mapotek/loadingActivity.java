package com.vanilla.mapotek;

import android.animation.AnimatorSet;
import android.animation.ObjectAnimator;
import android.animation.ValueAnimator;
import android.content.Intent;
import android.os.Bundle;
import android.view.View;
import android.os.Handler;
import android.view.WindowManager;
import android.view.animation.Animation;
import android.view.animation.AnimationUtils;
import android.widget.*;
import androidx.appcompat.app.AppCompatActivity;

public class loadingActivity extends AppCompatActivity {

    private ImageView logoLoading;
    private View dot1, dot2, dot3;
    private TextView loadingText;
    private Handler handler = new Handler();

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_loading);

        // Hide status bar for full screen effect
        getWindow().setFlags(WindowManager.LayoutParams.FLAG_FULLSCREEN,
                WindowManager.LayoutParams.FLAG_FULLSCREEN);

        initViews();
        startAnimations();

        // Simulate loading time (replace with your actual loading logic)
        handler.postDelayed(new Runnable() {
            @Override
            public void run() {
                goToNextActivity(); // Changed from goToLoginActivity()
            }
        }, 3000); // 3 seconds
    }

    private void initViews() {
        logoLoading = findViewById(R.id.logoLoading);
        dot1 = findViewById(R.id.dot1);
        dot2 = findViewById(R.id.dot2);
        dot3 = findViewById(R.id.dot3);
        loadingText = findViewById(R.id.loadingText);
    }

    private void startAnimations() {
        // Pulse animation for logo
        Animation pulseAnimation = AnimationUtils.loadAnimation(this, R.anim.pulse_animation);
        logoLoading.startAnimation(pulseAnimation);

        // Dots bouncing animation
        animateDots();

        // Text typing effect
        animateLoadingText();
    }

    private void animateDots() {
        // Create bouncing effect for dots
        animateDot(dot1, 0);
        animateDot(dot2, 200);
        animateDot(dot3, 400);
    }

    private void animateDot(View dot, int delay) {
        handler.postDelayed(new Runnable() {
            @Override
            public void run() {
                ObjectAnimator scaleY = ObjectAnimator.ofFloat(dot, "scaleY", 1.0f, 2.0f, 1.0f);
                ObjectAnimator scaleX = ObjectAnimator.ofFloat(dot, "scaleX", 1.0f, 2.0f, 1.0f);

                // Set repeat for each animator individually
                scaleY.setRepeatCount(ValueAnimator.INFINITE);
                scaleX.setRepeatCount(ValueAnimator.INFINITE);
                scaleY.setDuration(600);
                scaleX.setDuration(600);

                AnimatorSet animatorSet = new AnimatorSet();
                animatorSet.playTogether(scaleY, scaleX);
                animatorSet.start();
            }
        }, delay);
    }

    private void animateLoadingText() {
        // Create typing effect
        final String[] loadingTexts = {"Loading", "Loading.", "Loading..", "Loading..."};
        final int[] currentIndex = {0};

        Runnable textAnimator = new Runnable() {
            @Override
            public void run() {
                loadingText.setText(loadingTexts[currentIndex[0]]);
                currentIndex[0] = (currentIndex[0] + 1) % loadingTexts.length;
                handler.postDelayed(this, 500);
            }
        };
        handler.post(textAnimator);
    }

    private void goToNextActivity() {
        // Get user data passed from login
        String userName = getIntent().getStringExtra("USER_NAME");
        String nextActivity = getIntent().getStringExtra("NEXT_ACTIVITY");

        Intent intent;
        if ("MainActivity".equals(nextActivity)) {
            intent = new Intent(loadingActivity.this, MainActivity.class);
            intent.putExtra("USER_NAME", userName);
            intent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TASK);
        } else {
            // Default: go to login
            intent = new Intent(loadingActivity.this, loginActivity.class);
        }

        startActivity(intent);

        // Add fade transition
        overridePendingTransition(R.anim.fade_in, R.anim.fade_out);
        finish();
    }

    @Override
    protected void onDestroy() {
        super.onDestroy();
        // Clean up handler to prevent memory leaks
        if (handler != null) {
            handler.removeCallbacksAndMessages(null);
        }
    }
}