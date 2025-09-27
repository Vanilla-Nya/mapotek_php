package com.vanilla.mapotek.auth;

import android.os.Bundle;
import android.text.TextUtils;
import android.util.Patterns;
import android.view.View;
import android.widget.*;
import androidx.activity.EdgeToEdge;
import androidx.appcompat.app.AppCompatActivity;
import androidx.core.graphics.Insets;
import androidx.core.view.ViewCompat;
import androidx.core.view.WindowInsetsCompat;
import com.google.android.material.textfield.TextInputEditText;
import com.google.android.material.textfield.TextInputLayout;
import com.google.android.material.button.MaterialButton;
import com.vanilla.mapotek.R;

public class forgotPasswordActivity extends AppCompatActivity {

    private TextInputEditText etEmail;
    private TextInputLayout tilEmail;
    private MaterialButton btnSendReset;
    private TextView tvInfo, tvBackToLogin;
    private ImageView ivBack;
    private ProgressBar progressBar;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        EdgeToEdge.enable(this);
        setContentView(R.layout.activity_forgot_password);

        ViewCompat.setOnApplyWindowInsetsListener(findViewById(R.id.main), (v, insets) -> {
            Insets systemBars = insets.getInsets(WindowInsetsCompat.Type.systemBars());
            v.setPadding(systemBars.left, systemBars.top, systemBars.right, systemBars.bottom);
            return insets;
        });

        initializeViews();
        setupClickListeners();
        setupBackPressHandler();
    }

    private void initializeViews() {
        etEmail = findViewById(R.id.etEmail);
        tilEmail = findViewById(R.id.tilEmail);
        btnSendReset = findViewById(R.id.btnSendReset);
        tvInfo = findViewById(R.id.tvInfo);
        tvBackToLogin = findViewById(R.id.tvBackToLogin);
        ivBack = findViewById(R.id.ivBack);
        progressBar = findViewById(R.id.progressBar);
    }

    private void setupClickListeners() {
        // Send reset button click
        btnSendReset.setOnClickListener(v -> {
            if (validateEmail()) {
                sendResetLink();
            }
        });

        // Back to login click
        tvBackToLogin.setOnClickListener(v -> finish());

        // Back button click
        ivBack.setOnClickListener(v -> finish());
    }

    private boolean validateEmail() {
        String email = etEmail.getText().toString().trim();

        // Clear previous errors
        tilEmail.setError(null);

        if (TextUtils.isEmpty(email)) {
            tilEmail.setError("Email atau NIK harus diisi");
            return false;
        }

        // Check if it's an email format
        if (email.contains("@")) {
            if (!Patterns.EMAIL_ADDRESS.matcher(email).matches()) {
                tilEmail.setError("Format email tidak valid");
                return false;
            }
        } else {
            // If not email, check if it's a valid NIK (16 digits)
            if (email.length() != 16 || !email.matches("\\d+")) {
                tilEmail.setError("NIK harus 16 digit angka");
                return false;
            }
        }

        return true;
    }

    private void sendResetLink() {
        String email = etEmail.getText().toString().trim();

        // Show progress
        progressBar.setVisibility(View.VISIBLE);
        btnSendReset.setEnabled(false);
        btnSendReset.setText("Mengirim...");
        tvInfo.setVisibility(View.GONE);

        // Simulate network delay for sending reset link
        btnSendReset.postDelayed(() -> {
            // Hide progress
            progressBar.setVisibility(View.GONE);
            btnSendReset.setEnabled(true);
            btnSendReset.setText("Kirim Link Reset");

            // TODO: Implement actual password reset logic here
            // This is where you would call your API to send reset email
            if (isValidEmailOrNIK(email)) {
                // Success - show info message
                tvInfo.setText("Link reset password telah dikirim ke " +
                        (email.contains("@") ? "email Anda" : "email terdaftar"));
                tvInfo.setTextColor(getColor(R.color.success_color));
                tvInfo.setVisibility(View.VISIBLE);

                Toast.makeText(this, "Link reset password berhasil dikirim!", Toast.LENGTH_LONG).show();

                // Optional: Clear the input field
                etEmail.setText("");

            } else {
                // Error - email/NIK not found
                tilEmail.setError("Email atau NIK tidak terdaftar");
                tvInfo.setText("Email atau NIK tidak ditemukan di sistem kami");
                tvInfo.setTextColor(getColor(R.color.error_color));
                tvInfo.setVisibility(View.VISIBLE);

                Toast.makeText(this, "Email atau NIK tidak terdaftar", Toast.LENGTH_SHORT).show();
            }

        }, 2000); // 2 second delay to simulate network request
    }

    private boolean isValidEmailOrNIK(String emailOrNIK) {
        // TODO: Replace this with actual validation against your database
        // This is just for demo purposes

        // Demo: Accept these test emails/NIKs
        String[] validEmails = {
                "test@example.com",
                "admin@example.com",
                "user@gmail.com",
                "1234567890123456" // Test NIK
        };

        for (String validEmail : validEmails) {
            if (emailOrNIK.equals(validEmail)) {
                return true;
            }
        }

        // For demo, accept any email ending with common domains
        if (emailOrNIK.contains("@")) {
            return emailOrNIK.endsWith("@gmail.com") ||
                    emailOrNIK.endsWith("@example.com") ||
                    emailOrNIK.endsWith("@yahoo.com");
        }

        // For demo, accept any 16-digit NIK
        return emailOrNIK.length() == 16 && emailOrNIK.matches("\\d+");
    }

    // Modern way to handle back press using OnBackPressedDispatcher
    private void setupBackPressHandler() {
        getOnBackPressedDispatcher().addCallback(this, new androidx.activity.OnBackPressedCallback(true) {
            @Override
            public void handleOnBackPressed() {
                finish(); // Close this activity and return to login
            }
        });
    }
}