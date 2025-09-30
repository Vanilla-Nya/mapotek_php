package com.vanilla.mapotek.auth;

import android.content.Intent;
import android.content.SharedPreferences;
import android.os.Bundle;
import android.text.TextUtils;
import android.util.Log;
import android.view.View;
import android.widget.*;
import android.view.ViewGroup;
import androidx.activity.EdgeToEdge;
import androidx.annotation.NonNull;
import androidx.appcompat.app.AppCompatActivity;
import androidx.core.graphics.Insets;
import androidx.core.view.ViewCompat;
import androidx.core.view.WindowInsetsCompat;
import com.google.android.material.checkbox.MaterialCheckBox;
import com.google.android.material.textfield.TextInputEditText;
import com.google.android.material.textfield.TextInputLayout;
import com.google.android.material.button.MaterialButton;
import com.vanilla.mapotek.R;
import com.vanilla.mapotek.database.supabaseHelper;
import com.vanilla.mapotek.loadingActivity;

import org.json.JSONObject;

import java.io.IOException;

import okhttp3.Call;
import okhttp3.Callback;
import okhttp3.Response;

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

        // Check if user is already logged in
        checkExistingLogin();
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

    private void checkExistingLogin() {
        // Check if user has an active session
        AuthManager authManager = new AuthManager(this);
        if (authManager.isLoggedIn()) {
            // User is already logged in, go to main activity
            navigateToMain();
        }
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

        // Validate Email
        if (TextUtils.isEmpty(email)) {
            tilEmail.setError("Email harus diisi");
            isValid = false;
        } else if (!android.util.Patterns.EMAIL_ADDRESS.matcher(email).matches()) {
            tilEmail.setError("Email tidak valid");
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

    private void performLogin() {
        // Show progress
        progressBar.setVisibility(View.VISIBLE);
        btnLogin.setEnabled(false);
        btnLogin.setText("Masuk...");

        String email = etEmail.getText().toString().trim();
        String password = etPassword.getText().toString().trim();

        try {
            // Create login JSON object
            JSONObject loginData = new JSONObject();
            loginData.put("email", email);
            loginData.put("password", password);

            // Call Supabase login
            supabaseHelper.login(this, loginData, new Callback() {
                @Override
                public void onFailure(@NonNull Call call, @NonNull IOException e) {
                    runOnUiThread(() -> {
                        // Hide progress
                        progressBar.setVisibility(View.GONE);
                        btnLogin.setEnabled(true);
                        btnLogin.setText("Masuk");

                        Log.e("Login", "Network error: " + e.getMessage());
                        Toast.makeText(loginActivity.this,
                                "Koneksi gagal. Periksa internet Anda.",
                                Toast.LENGTH_SHORT).show();
                    });
                }

                @Override
                public void onResponse(@NonNull Call call, @NonNull Response response) throws IOException {
                    String responseBody = response.body().string();

                    runOnUiThread(() -> {
                        // Hide progress
                        progressBar.setVisibility(View.GONE);
                        btnLogin.setEnabled(true);
                        btnLogin.setText("Masuk");

                        if (response.isSuccessful()) {
                            handleLoginSuccess(responseBody, email);
                        } else {
                            handleLoginError(response.code(), responseBody);
                        }
                    });
                }
            });

        } catch (Exception e) {
            // Hide progress
            progressBar.setVisibility(View.GONE);
            btnLogin.setEnabled(true);
            btnLogin.setText("Masuk");

            Log.e("Login", "Error creating login request: " + e.getMessage());
            Toast.makeText(this, "Terjadi kesalahan", Toast.LENGTH_SHORT).show();
        }
    }

    private void handleLoginSuccess(String responseBody, String email) {
        try {
            // Parse the response
            JSONObject jsonResponse = new JSONObject(responseBody);

            // Get access token and user ID
            String accessToken = jsonResponse.getString("access_token");
            JSONObject user = jsonResponse.getJSONObject("user");
            String userId = user.getString("id");

            // Save auth state
            AuthManager authManager = new AuthManager(loginActivity.this);
            authManager.saveLoginState(accessToken, userId);

            // Save credentials if remember me is checked
            if (cbRememberMe.isChecked()) {
                saveCredentials(email);
            } else {
                clearSavedCredentials();
            }

            // Get user details from database (optional)
            fetchUserDetails(userId, accessToken, email);

        } catch (Exception e) {
            Log.e("Login", "Error parsing response: " + e.getMessage());
            Toast.makeText(this, "Login gagal. Coba lagi.", Toast.LENGTH_SHORT).show();
        }
    }

    private void fetchUserDetails(String userId, String accessToken, String email) {
        // Optional: Fetch additional user details from your 'pasien' table
        // For now, we'll just proceed to the main activity

        Toast.makeText(this, "Login berhasil!", Toast.LENGTH_SHORT).show();

        // Navigate to loading activity
        Intent intent = new Intent(loginActivity.this, loadingActivity.class);
        intent.putExtra("USER_NAME", email);
        intent.putExtra("USER_ID", userId);
        intent.putExtra("NEXT_ACTIVITY", "MainActivity");
        startActivity(intent);
        finish();
    }

    private void handleLoginError(int statusCode, String responseBody) {
        String errorMessage;

        try {
            JSONObject errorJson = new JSONObject(responseBody);
            String error = errorJson.optString("error", "");
            String errorDescription = errorJson.optString("error_description", "");

            if (statusCode == 400) {
                if (error.equals("invalid_grant") || errorDescription.contains("Invalid login")) {
                    errorMessage = "Email atau password salah";
                    tilEmail.setError(" ");
                    tilPassword.setError("Email atau password salah");
                } else if (errorDescription.contains("Email not confirmed")) {
                    errorMessage = "Email belum dikonfirmasi. Periksa email Anda.";
                } else {
                    errorMessage = "Data login tidak valid";
                }
            } else if (statusCode == 422) {
                errorMessage = "Format email atau password tidak valid";
            } else if (statusCode == 429) {
                errorMessage = "Terlalu banyak percobaan. Coba lagi nanti.";
            } else {
                errorMessage = "Login gagal. Silakan coba lagi.";
            }

        } catch (Exception e) {
            errorMessage = "Terjadi kesalahan. Silakan coba lagi.";
        }

        Toast.makeText(this, errorMessage, Toast.LENGTH_LONG).show();
        Log.e("Login", "Login failed - Status: " + statusCode + ", Body: " + responseBody);
    }

    private void navigateToMain() {
        Intent intent = new Intent(loginActivity.this, loadingActivity.class);
        intent.putExtra("NEXT_ACTIVITY", "MainActivity");
        startActivity(intent);
        finish();
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

    private void clearForm() {
        etEmail.setText("");
        etPassword.setText("");
        cbRememberMe.setChecked(false);
        clearErrors();
    }
}