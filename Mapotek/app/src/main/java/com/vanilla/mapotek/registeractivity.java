package com.vanilla.mapotek;

import android.app.DatePickerDialog;
import android.content.Intent;
import android.os.Bundle;
import android.text.TextUtils;
import android.view.View;
import android.widget.*;
import androidx.activity.EdgeToEdge;
import androidx.appcompat.app.AppCompatActivity;
import androidx.core.graphics.Insets;
import androidx.core.view.ViewCompat;
import androidx.core.view.WindowInsetsCompat;
import com.google.android.material.textfield.TextInputEditText;
import com.google.android.material.textfield.TextInputLayout;
import java.util.Calendar;

public class registeractivity extends AppCompatActivity {

    private TextInputEditText etNIK, etNamaLengkap, etTanggalLahir, etNoTelp, etAlamat;
    private TextInputLayout tilNIK, tilNamaLengkap, tilTanggalLahir, tilNoTelp, tilAlamat;
    private Spinner spJenisKelamin;
    private Button btnRegister, btnLogin;
    private ProgressBar progressBar;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        EdgeToEdge.enable(this);
        setContentView(R.layout.activity_registeractivity);

        ViewCompat.setOnApplyWindowInsetsListener(findViewById(R.id.main), (v, insets) -> {
            Insets systemBars = insets.getInsets(WindowInsetsCompat.Type.systemBars());
            v.setPadding(systemBars.left, systemBars.top, systemBars.right, systemBars.bottom);
            return insets;
        });

        initializeViews();
        setupSpinner();
        setupDatePicker();
        setupClickListeners();
    }

    private void initializeViews() {
        // Initialize TextInputEditText and TextInputLayout
        etNIK = findViewById(R.id.etNIK);
        etNamaLengkap = findViewById(R.id.etNamaLengkap);
        etTanggalLahir = findViewById(R.id.etTanggalLahir);
        etNoTelp = findViewById(R.id.etNoTelp);
        etAlamat = findViewById(R.id.etAlamat);

        tilNIK = findViewById(R.id.tilNIK);
        tilNamaLengkap = findViewById(R.id.tilNamaLengkap);
        tilTanggalLahir = findViewById(R.id.tilTanggalLahir);
        tilNoTelp = findViewById(R.id.tilNoTelp);
        tilAlamat = findViewById(R.id.tilAlamat);

        spJenisKelamin = findViewById(R.id.spJenisKelamin);
        btnRegister = findViewById(R.id.btnRegister);
        btnLogin = findViewById(R.id.btnLogin);
        progressBar = findViewById(R.id.progressBar);
    }

    private void setupSpinner() {
        String[] jenisKelamin = {"Pilih Jenis Kelamin", "Laki-laki", "Perempuan"};
        ArrayAdapter<String> adapter = new ArrayAdapter<>(this,
                android.R.layout.simple_spinner_dropdown_item, jenisKelamin);
        adapter.setDropDownViewResource(android.R.layout.simple_spinner_dropdown_item);
        spJenisKelamin.setAdapter(adapter);
    }

    private void setupDatePicker() {
        etTanggalLahir.setOnClickListener(v -> {
            final Calendar calendar = Calendar.getInstance();
            int year = calendar.get(Calendar.YEAR);
            int month = calendar.get(Calendar.MONTH);
            int day = calendar.get(Calendar.DAY_OF_MONTH);

            DatePickerDialog datePicker = new DatePickerDialog(this,
                    (view, selectedYear, selectedMonth, selectedDay) -> {
                        String formattedDate = String.format("%02d/%02d/%d",
                                selectedDay, selectedMonth + 1, selectedYear);
                        etTanggalLahir.setText(formattedDate);
                    },
                    year, month, day);

            // Set maximum date to today (can't select future dates)
            datePicker.getDatePicker().setMaxDate(System.currentTimeMillis());
            datePicker.show();
        });
    }

    private void setupClickListeners() {
        btnRegister.setOnClickListener(v -> {
            if (validateForm()) {
                performRegistration();
            }
        });

        btnLogin.setOnClickListener(v -> {
            Intent intent = new Intent(registeractivity.this, loginActivity.class);
            startActivity(intent);
        });
    }

    private boolean validateForm() {
        boolean isValid = true;

        // Clear previous errors
        clearErrors();

        String nik = etNIK.getText().toString().trim();
        String nama = etNamaLengkap.getText().toString().trim();
        String jk = spJenisKelamin.getSelectedItem().toString();
        String tgl = etTanggalLahir.getText().toString().trim();
        String telp = etNoTelp.getText().toString().trim();
        String alamat = etAlamat.getText().toString().trim();

        // Validate NIK
        if (TextUtils.isEmpty(nik)) {
            tilNIK.setError("NIK harus diisi");
            isValid = false;
        } else if (nik.length() != 16) {
            tilNIK.setError("NIK harus 16 digit");
            isValid = false;
        }

        // Validate Nama Lengkap
        if (TextUtils.isEmpty(nama)) {
            tilNamaLengkap.setError("Nama lengkap harus diisi");
            isValid = false;
        } else if (nama.length() < 3) {
            tilNamaLengkap.setError("Nama minimal 3 karakter");
            isValid = false;
        }

        // Validate Jenis Kelamin
        if (jk.equals("Pilih Jenis Kelamin")) {
            Toast.makeText(this, "Pilih jenis kelamin", Toast.LENGTH_SHORT).show();
            isValid = false;
        }

        // Validate Tanggal Lahir
        if (TextUtils.isEmpty(tgl)) {
            tilTanggalLahir.setError("Tanggal lahir harus diisi");
            isValid = false;
        }

        // Validate No Telepon
        if (TextUtils.isEmpty(telp)) {
            tilNoTelp.setError("No. telepon harus diisi");
            isValid = false;
        } else if (telp.length() < 10 || telp.length() > 13) {
            tilNoTelp.setError("No. telepon tidak valid");
            isValid = false;
        }

        // Validate Alamat
        if (TextUtils.isEmpty(alamat)) {
            tilAlamat.setError("Alamat harus diisi");
            isValid = false;
        } else if (alamat.length() < 10) {
            tilAlamat.setError("Alamat minimal 10 karakter");
            isValid = false;
        }

        return isValid;
    }

    private void clearErrors() {
        tilNIK.setError(null);
        tilNamaLengkap.setError(null);
        tilTanggalLahir.setError(null);
        tilNoTelp.setError(null);
        tilAlamat.setError(null);
    }

    private void performRegistration() {
        // Show progress
        progressBar.setVisibility(View.VISIBLE);
        btnRegister.setEnabled(false);
        btnRegister.setText("Mendaftar...");

        // Simulate network delay
        btnRegister.postDelayed(() -> {
            // Hide progress
            progressBar.setVisibility(View.GONE);
            btnRegister.setEnabled(true);
            btnRegister.setText("Daftar");

            // Get form data
            String nik = etNIK.getText().toString().trim();
            String nama = etNamaLengkap.getText().toString().trim();
            String jk = spJenisKelamin.getSelectedItem().toString();
            String tgl = etTanggalLahir.getText().toString().trim();
            String telp = etNoTelp.getText().toString().trim();
            String alamat = etAlamat.getText().toString().trim();

            // TODO: Implement actual registration logic here
            // For now, just show success message
            Toast.makeText(this, "Registrasi berhasil!\nSelamat datang, " + nama,
                    Toast.LENGTH_LONG).show();

            // Optional: Clear form after successful registration
            clearForm();

        }, 2000); // 2 second delay to simulate network request
    }

    private void clearForm() {
        etNIK.setText("");
        etNamaLengkap.setText("");
        etTanggalLahir.setText("");
        etNoTelp.setText("");
        etAlamat.setText("");
        spJenisKelamin.setSelection(0);
        clearErrors();
    }
}