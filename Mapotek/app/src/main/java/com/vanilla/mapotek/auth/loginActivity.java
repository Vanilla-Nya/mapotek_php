package com.vanilla.mapotek.auth;

import android.content.Intent;
import android.content.SharedPreferences;
import android.os.Bundle;
import android.text.TextUtils;
import android.view.View;
import android.widget.*;
import android.view.ViewGroup;
import androidx.activity.EdgeToEdge;
import androidx.appcompat.app.AppCompatActivity;
import androidx.core.graphics.Insets;
import androidx.core.view.ViewCompat;
import androidx.core.view.WindowInsetsCompat;
import com.google.android.material.checkbox.MaterialCheckBox;
import com.google.android.material.textfield.TextInputEditText;
import com.google.android.material.textfield.TextInputLayout;
import com.google.android.material.button.MaterialButton;
import com.vanilla.mapotek.R;
import com.vanilla.mapotek.loadingActivity;

public class loginActivity extends AppCompatActivity {

    private RelativeLayout loadingOverlay;
    private TextInputEditText etEmail, etPassword;
    private TextInputLayout tilEmail, tilPassword;
    private MaterialCheckBox cbRememberMe;
    private MaterialButton btnLogin, btnRegister;
    private TextView tvForgotPassword;
    private ProgressBar progressBar;

    // SharedPreferences for Remember Me functionality
    private SharedPreferences sharedPreferences;
    private static final String PREF_NAME = "LoginPrefs";
    private static final String KEY_REMEMBER = "remember_me";
    private static final String KEY_EMAIL = "email";
    private static final String KEY_TOKEN = "token";

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        EdgeToEdge.enable(this);
        setContentView(R.layout.activity_login);

        ViewCompat.setOnApplyWindowInsetsListener(findViewById(R.id.main), (v, insets) -> {
            Insets systemBars = insets.getInsets(WindowInsetsCompat.Type.systemBars());
            v.setPadding(systemBars.left, systemBars.top, systemBars.right, systemBars.bottom);
            return insets;
        });

        initializeViews();
        setupSharedPreferences();
        loadSavedCredentials();
        setupClickListeners();
        createLoadingOverlay();
    }

    private void initializeViews() {
        // Initialize TextInputEditText and TextInputLayout
        etEmail = findViewById(R.id.etEmail);
        etPassword = findViewById(R.id.etPassword);
        tilEmail = findViewById(R.id.tilEmail);
        tilPassword = findViewById(R.id.tilPassword);

        cbRememberMe = findViewById(R.id.cbRememberMe);
        btnLogin = findViewById(R.id.btnLogin);
        btnRegister = findViewById(R.id.btnRegister);
        tvForgotPassword = findViewById(R.id.tvForgotPassword);
        progressBar = findViewById(R.id.progressBar);
    }

    private void setupSharedPreferences() {
        sharedPreferences = getSharedPreferences(PREF_NAME, MODE_PRIVATE);
    }

    private void loadSavedCredentials() {
        boolean rememberMe = sharedPreferences.getBoolean(KEY_REMEMBER, false);
        if (rememberMe) {
            String savedEmail = sharedPreferences.getString(KEY_EMAIL, "");
            etEmail.setText(savedEmail);
            cbRememberMe.setChecked(true);
        }
    }

    private void setupClickListeners() {
        // Login button click
        btnLogin.setOnClickListener(v -> {
            if (validateForm()) {
                performLogin();
            }
        });

        // Register button click
        btnRegister.setOnClickListener(v -> {
            Intent intent = new Intent(loginActivity.this, registeractivity.class);
            startActivity(intent);
        });

        tvForgotPassword.setOnClickListener(v -> {
            Intent intent = new Intent(loginActivity.this, forgotPasswordActivity.class);
            startActivity(intent);
        });
    }

    private boolean validateForm() {
        boolean isValid = true;

        // Clear previous errors
        clearErrors();

        String email = etEmail.getText().toString().trim();
        String password = etPassword.getText().toString().trim();

        // Validate Email/NIK
        if (TextUtils.isEmpty(email)) {
            tilEmail.setError("Email atau NIK harus diisi");
            isValid = false;
        } else if (email.length() < 3) {
            tilEmail.setError("Email atau NIK tidak valid");
            isValid = false;
        }

        // Validate Password
        if (TextUtils.isEmpty(password)) {
            tilPassword.setError("Password harus diisi");
            isValid = false;
        } else if (password.length() < 6) {
            tilPassword.setError("Password minimal 6 karakter");
            isValid = false;
        }

        return isValid;
    }

    private void clearErrors() {
        tilEmail.setError(null);
        tilPassword.setError(null);
    }

    private void createLoadingOverlay() {
        loadingOverlay = new RelativeLayout(this);
        RelativeLayout.LayoutParams params = new RelativeLayout.LayoutParams(
                RelativeLayout.LayoutParams.MATCH_PARENT,
                RelativeLayout.LayoutParams.MATCH_PARENT);
        loadingOverlay.setLayoutParams(params);
        loadingOverlay.setBackgroundColor(0x80000000); // Semi-transparent black
        loadingOverlay.setVisibility(View.GONE);

        // Add spinning progress bar
        ProgressBar spinner = new ProgressBar(this);
        RelativeLayout.LayoutParams spinnerParams = new RelativeLayout.LayoutParams(
                RelativeLayout.LayoutParams.WRAP_CONTENT,
                RelativeLayout.LayoutParams.WRAP_CONTENT);
        spinnerParams.addRule(RelativeLayout.CENTER_IN_PARENT);
        spinner.setLayoutParams(spinnerParams);

        // Add loading text
        TextView loadingText = new TextView(this);
        loadingText.setText("Menyiapkan akun Anda...");
        loadingText.setTextColor(0xFFFFFFFF);
        loadingText.setTextSize(16);
        RelativeLayout.LayoutParams textParams = new RelativeLayout.LayoutParams(
                RelativeLayout.LayoutParams.WRAP_CONTENT,
                RelativeLayout.LayoutParams.WRAP_CONTENT);
        textParams.addRule(RelativeLayout.CENTER_HORIZONTAL);
        textParams.addRule(RelativeLayout.BELOW, spinner.getId());
        textParams.setMargins(0, 30, 0, 0);
        loadingText.setLayoutParams(textParams);

        loadingOverlay.addView(spinner);
        loadingOverlay.addView(loadingText);

        // Add to main layout
        ((ViewGroup) findViewById(R.id.main)).addView(loadingOverlay);
    }

    private void showLoadingOverlay() {
        loadingOverlay.setVisibility(View.VISIBLE);
        loadingOverlay.setAlpha(0f);
        loadingOverlay.animate()
                .alpha(1f)
                .setDuration(300)
                .start();
    }

    private void hideLoadingOverlay() {
        loadingOverlay.animate()
                .alpha(0f)
                .setDuration(300)
                .withEndAction(() -> loadingOverlay.setVisibility(View.GONE))
                .start();
    }

    // Modify your performLogin() method
    private void performLogin() {
        // Show progress
        progressBar.setVisibility(View.VISIBLE);
        btnLogin.setEnabled(false);
        btnLogin.setText("Masuk...");

        String email = etEmail.getText().toString().trim();
        String password = etPassword.getText().toString().trim();

        // Simulate network delay for login process
        btnLogin.postDelayed(() -> {
            // Hide progress
            progressBar.setVisibility(View.GONE);
            btnLogin.setEnabled(true);
            btnLogin.setText("Masuk");

            if (isValidCredentials(email, password)) {
                // Save credentials if remember me is checked
                if (cbRememberMe.isChecked()) {
                    saveCredentials(email);
                } else {
                    clearSavedCredentials();
                }

                // Login successful - go to LoadingActivity (not overlay!)
                Toast.makeText(this, "Login berhasil!", Toast.LENGTH_SHORT).show();

                Intent intent = new Intent(loginActivity.this, loadingActivity.class);
                intent.putExtra("USER_NAME", email);
                intent.putExtra("NEXT_ACTIVITY", "MainActivity");
                startActivity(intent);
                finish();

            } else {
                // Login failed
                tilEmail.setError("Email/NIK atau password salah");
                tilPassword.setError("Email/NIK atau password salah");
                Toast.makeText(this, "Login gagal. Periksa kembali data Anda.", Toast.LENGTH_SHORT).show();
            }

        }, 2000);
    }

    private boolean isValidCredentials(String email, String password) {
        // TODO: Replace this with actual authentication logic
        // This is just for demo purposes

        // Example: Accept any email/NIK with password "123456"
        return password.equals("123456") ||
                (email.equals("admin") && password.equals("admin")) ||
                (email.equals("test@example.com") && password.equals("password"));
    }

    private void saveCredentials(String email) {
        SharedPreferences.Editor editor = sharedPreferences.edit();
        editor.putBoolean(KEY_REMEMBER, true);
        editor.putString(KEY_EMAIL, email);
        editor.apply();
    }

    private void clearSavedCredentials() {
        SharedPreferences.Editor editor = sharedPreferences.edit();
        editor.putBoolean(KEY_REMEMBER, false);
        editor.remove(KEY_EMAIL);
        editor.apply();
    }

    // Optional: Clear form method
    private void clearForm() {
        etEmail.setText("");
        etPassword.setText("");
        cbRememberMe.setChecked(false);
        clearErrors();
    }
}