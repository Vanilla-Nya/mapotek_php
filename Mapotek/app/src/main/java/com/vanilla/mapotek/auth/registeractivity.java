package com.vanilla.mapotek.auth;

import android.app.DatePickerDialog;
import android.content.Intent;
import android.content.SharedPreferences;
import android.os.Bundle;
import android.text.TextUtils;
import android.util.Log;
import android.view.View;
import android.widget.*;
import androidx.activity.EdgeToEdge;
import androidx.annotation.NonNull;
import androidx.appcompat.app.AppCompatActivity;
import androidx.core.graphics.Insets;
import androidx.core.view.ViewCompat;
import androidx.core.view.WindowInsetsCompat;
import com.google.android.material.textfield.TextInputEditText;
import com.google.android.material.textfield.TextInputLayout;
import com.google.gson.JsonObject;
import com.google.gson.JsonParser;
import com.vanilla.mapotek.R;
import com.vanilla.mapotek.database.supabaseHelper;
import com.vanilla.mapotek.splashScreenActivity;

import org.json.JSONObject;

import java.io.IOException;
import java.util.Calendar;
import java.util.List;

import okhttp3.Call;
import okhttp3.Callback;
import okhttp3.Response;

public class registeractivity extends AppCompatActivity {

    private TextInputEditText etNIK, etNamaLengkap, etEmail, etTanggalLahir, etNoTelp, etAlamat;
    private TextInputEditText etPassword, etConfirmPassword;
    private TextInputLayout tilNIK, tilNamaLengkap, tilEmail, tilTanggalLahir, tilNoTelp, tilAlamat;
    private TextInputLayout tilPassword, tilConfirmPassword;
    private Spinner spJenisKelamin, spProvinsi, spKota, spKecamatan, spKelurahan;
    private Button btnRegister, btnLogin;
    private ProgressBar progressBar;

    // Store region data and IDs
    private List<RegionApiHelper.Region> provinsiList, kotaList, kecamatanList, kelurahanList;
    private String selectedProvinsiId = "", selectedKotaId = "", selectedKecamatanId = "";

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
        setupGenderSpinner();
        loadProvinces();
        setupSpinnerListeners();
        setupDatePicker();
        setupClickListeners();
    }

    private void initializeViews() {
        etNIK = findViewById(R.id.etNIK);
        etNamaLengkap = findViewById(R.id.etNamaLengkap);
        etEmail = findViewById(R.id.etEmail);
        etTanggalLahir = findViewById(R.id.etTanggalLahir);
        etNoTelp = findViewById(R.id.etNoTelp);
        etAlamat = findViewById(R.id.etAlamat);
        etPassword = findViewById(R.id.etPassword);
        etConfirmPassword = findViewById(R.id.etConfirmPassword);

        tilNIK = findViewById(R.id.tilNIK);
        tilNamaLengkap = findViewById(R.id.tilNamaLengkap);
        tilEmail = findViewById(R.id.tilEmail);
        tilTanggalLahir = findViewById(R.id.tilTanggalLahir);
        tilNoTelp = findViewById(R.id.tilNoTelp);
        tilAlamat = findViewById(R.id.tilAlamat);
        tilPassword = findViewById(R.id.tilPassword);
        tilConfirmPassword = findViewById(R.id.tilConfirmPassword);

        spJenisKelamin = findViewById(R.id.spJenisKelamin);
        spProvinsi = findViewById(R.id.spProvinsi);
        spKota = findViewById(R.id.spKota);
        spKecamatan = findViewById(R.id.spKecamatan);
        spKelurahan = findViewById(R.id.spKelurahan);

        btnRegister = findViewById(R.id.btnRegister);
        btnLogin = findViewById(R.id.btnLogin);
        progressBar = findViewById(R.id.progressBar);
    }

    private void setupGenderSpinner() {
        String[] jenisKelamin = {"Pilih Jenis Kelamin", "Laki-laki", "Perempuan", "Tidak Bisa Dijelaskan"};
        ArrayAdapter<String> genderAdapter = new ArrayAdapter<>(this,
                android.R.layout.simple_spinner_dropdown_item, jenisKelamin);
        spJenisKelamin.setAdapter(genderAdapter);
    }

    private void loadProvinces() {
        String[] loadingData = {"Memuat provinsi..."};
        ArrayAdapter<String> loadingAdapter = new ArrayAdapter<>(this,
                android.R.layout.simple_spinner_dropdown_item, loadingData);
        spProvinsi.setAdapter(loadingAdapter);

        RegionApiHelper.getProvinces(new RegionApiHelper.RegionCallback() {
            @Override
            public void onSuccess(List<RegionApiHelper.Region> regions) {
                provinsiList = regions;

                String[] provinsiNames = new String[regions.size() + 1];
                provinsiNames[0] = "Pilih Provinsi";
                for (int i = 0; i < regions.size(); i++) {
                    provinsiNames[i + 1] = regions.get(i).name;
                }

                ArrayAdapter<String> adapter = new ArrayAdapter<>(registeractivity.this,
                        android.R.layout.simple_spinner_dropdown_item, provinsiNames);
                spProvinsi.setAdapter(adapter);
            }

            @Override
            public void onError(String error) {
                Toast.makeText(registeractivity.this,
                        "Gagal memuat data provinsi: " + error, Toast.LENGTH_SHORT).show();
                resetSpinner(spProvinsi, "Pilih Provinsi");
            }
        });
    }

    private void setupSpinnerListeners() {
        spProvinsi.setOnItemSelectedListener(new AdapterView.OnItemSelectedListener() {
            @Override
            public void onItemSelected(AdapterView<?> parent, View view, int position, long id) {
                if (position == 0) {
                    selectedProvinsiId = "";
                    resetSpinner(spKota, "Pilih Kota");
                    resetSpinner(spKecamatan, "Pilih Kecamatan");
                    resetSpinner(spKelurahan, "Pilih Kelurahan");
                    return;
                }

                if (provinsiList != null && position - 1 < provinsiList.size()) {
                    selectedProvinsiId = provinsiList.get(position - 1).id;
                    loadCities(selectedProvinsiId);
                }
            }

            @Override
            public void onNothingSelected(AdapterView<?> parent) {}
        });

        spKota.setOnItemSelectedListener(new AdapterView.OnItemSelectedListener() {
            @Override
            public void onItemSelected(AdapterView<?> parent, View view, int position, long id) {
                if (position == 0 || kotaList == null) {
                    selectedKotaId = "";
                    resetSpinner(spKecamatan, "Pilih Kecamatan");
                    resetSpinner(spKelurahan, "Pilih Kelurahan");
                    return;
                }

                if (position - 1 < kotaList.size()) {
                    selectedKotaId = kotaList.get(position - 1).id;
                    loadDistricts(selectedKotaId);
                }
            }

            @Override
            public void onNothingSelected(AdapterView<?> parent) {}
        });

        spKecamatan.setOnItemSelectedListener(new AdapterView.OnItemSelectedListener() {
            @Override
            public void onItemSelected(AdapterView<?> parent, View view, int position, long id) {
                if (position == 0 || kecamatanList == null) {
                    selectedKecamatanId = "";
                    resetSpinner(spKelurahan, "Pilih Kelurahan");
                    return;
                }

                if (position - 1 < kecamatanList.size()) {
                    selectedKecamatanId = kecamatanList.get(position - 1).id;
                    loadVillages(selectedKecamatanId);
                }
            }

            @Override
            public void onNothingSelected(AdapterView<?> parent) {}
        });
    }

    private void loadCities(String provinceId) {
        String[] loadingData = {"Memuat kota..."};
        ArrayAdapter<String> loadingAdapter = new ArrayAdapter<>(this,
                android.R.layout.simple_spinner_dropdown_item, loadingData);
        spKota.setAdapter(loadingAdapter);

        RegionApiHelper.getCities(provinceId, new RegionApiHelper.RegionCallback() {
            @Override
            public void onSuccess(List<RegionApiHelper.Region> regions) {
                kotaList = regions;

                String[] kotaNames = new String[regions.size() + 1];
                kotaNames[0] = "Pilih Kota";
                for (int i = 0; i < regions.size(); i++) {
                    kotaNames[i + 1] = regions.get(i).name;
                }

                ArrayAdapter<String> adapter = new ArrayAdapter<>(registeractivity.this,
                        android.R.layout.simple_spinner_dropdown_item, kotaNames);
                spKota.setAdapter(adapter);

                resetSpinner(spKecamatan, "Pilih Kecamatan");
                resetSpinner(spKelurahan, "Pilih Kelurahan");
            }

            @Override
            public void onError(String error) {
                Toast.makeText(registeractivity.this,
                        "Gagal memuat data kota: " + error, Toast.LENGTH_SHORT).show();
                resetSpinner(spKota, "Pilih Kota");
            }
        });
    }

    private void loadDistricts(String cityId) {
        String[] loadingData = {"Memuat kecamatan..."};
        ArrayAdapter<String> loadingAdapter = new ArrayAdapter<>(this,
                android.R.layout.simple_spinner_dropdown_item, loadingData);
        spKecamatan.setAdapter(loadingAdapter);

        RegionApiHelper.getDistricts(cityId, new RegionApiHelper.RegionCallback() {
            @Override
            public void onSuccess(List<RegionApiHelper.Region> regions) {
                kecamatanList = regions;

                String[] kecamatanNames = new String[regions.size() + 1];
                kecamatanNames[0] = "Pilih Kecamatan";
                for (int i = 0; i < regions.size(); i++) {
                    kecamatanNames[i + 1] = regions.get(i).name;
                }

                ArrayAdapter<String> adapter = new ArrayAdapter<>(registeractivity.this,
                        android.R.layout.simple_spinner_dropdown_item, kecamatanNames);
                spKecamatan.setAdapter(adapter);

                resetSpinner(spKelurahan, "Pilih Kelurahan");
            }

            @Override
            public void onError(String error) {
                Toast.makeText(registeractivity.this,
                        "Gagal memuat data kecamatan: " + error, Toast.LENGTH_SHORT).show();
                resetSpinner(spKecamatan, "Pilih Kecamatan");
            }
        });
    }

    private void loadVillages(String districtId) {
        String[] loadingData = {"Memuat kelurahan..."};
        ArrayAdapter<String> loadingAdapter = new ArrayAdapter<>(this,
                android.R.layout.simple_spinner_dropdown_item, loadingData);
        spKelurahan.setAdapter(loadingAdapter);

        RegionApiHelper.getVillages(districtId, new RegionApiHelper.RegionCallback() {
            @Override
            public void onSuccess(List<RegionApiHelper.Region> regions) {
                kelurahanList = regions;

                String[] kelurahanNames = new String[regions.size() + 1];
                kelurahanNames[0] = "Pilih Kelurahan";
                for (int i = 0; i < regions.size(); i++) {
                    kelurahanNames[i + 1] = regions.get(i).name;
                }

                ArrayAdapter<String> adapter = new ArrayAdapter<>(registeractivity.this,
                        android.R.layout.simple_spinner_dropdown_item, kelurahanNames);
                spKelurahan.setAdapter(adapter);
            }

            @Override
            public void onError(String error) {
                Toast.makeText(registeractivity.this,
                        "Gagal memuat data kelurahan: " + error, Toast.LENGTH_SHORT).show();
                resetSpinner(spKelurahan, "Pilih Kelurahan");
            }
        });
    }

    private void resetSpinner(Spinner spinner, String placeholder) {
        String[] emptyData = {placeholder};
        ArrayAdapter<String> emptyAdapter = new ArrayAdapter<>(this,
                android.R.layout.simple_spinner_dropdown_item, emptyData);
        spinner.setAdapter(emptyAdapter);
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
        clearErrors();

        String nik = etNIK.getText().toString().trim();
        String nama = etNamaLengkap.getText().toString().trim();
        String email = etEmail.getText().toString().trim();
        String jk = spJenisKelamin.getSelectedItem().toString();
        String tgl = etTanggalLahir.getText().toString().trim();
        String telp = etNoTelp.getText().toString().trim();
        String alamat = etAlamat.getText().toString().trim();
        String password = etPassword.getText().toString().trim();
        String confirmPassword = etConfirmPassword.getText().toString().trim();

        // Validate NIK
        if (TextUtils.isEmpty(nik)) {
            tilNIK.setError("NIK harus diisi");
            isValid = false;
        } else if (nik.length() != 16) {
            tilNIK.setError("NIK harus 16 digit");
            isValid = false;
        }

        // Validate Nama
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

        // Validate No Telp
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
        }

        // Validate Password
        if (TextUtils.isEmpty(password)) {
            tilPassword.setError("Password harus diisi");
            isValid = false;
        } else if (password.length() < 6) {
            tilPassword.setError("Password minimal 6 karakter");
            isValid = false;
        }

        // Validate Confirm Password
        if (TextUtils.isEmpty(confirmPassword)) {
            tilConfirmPassword.setError("Konfirmasi password harus diisi");
            isValid = false;
        } else if (!password.equals(confirmPassword)) {
            tilConfirmPassword.setError("Password tidak cocok");
            isValid = false;
        }

        // Validate region selections
        if (selectedProvinsiId.isEmpty()) {
            Toast.makeText(this, "Pilih provinsi", Toast.LENGTH_SHORT).show();
            isValid = false;
        }
        if (selectedKotaId.isEmpty()) {
            Toast.makeText(this, "Pilih kota/kabupaten", Toast.LENGTH_SHORT).show();
            isValid = false;
        }
        if (selectedKecamatanId.isEmpty()) {
            Toast.makeText(this, "Pilih kecamatan", Toast.LENGTH_SHORT).show();
            isValid = false;
        }

        return isValid;
    }

    private void clearErrors() {
        tilNIK.setError(null);
        tilNamaLengkap.setError(null);
        tilEmail.setError(null);
        tilTanggalLahir.setError(null);
        tilNoTelp.setError(null);
        tilAlamat.setError(null);
        tilPassword.setError(null);
        tilConfirmPassword.setError(null);
    }

    private void performRegistration() {
        progressBar.setVisibility(View.VISIBLE);
        btnRegister.setEnabled(false);
        btnRegister.setText("Mendaftar...");

        // Get all form data
        String nik = etNIK.getText().toString().trim();
        String nama = etNamaLengkap.getText().toString().trim();
        String email = etEmail.getText().toString().trim();
        String jk = spJenisKelamin.getSelectedItem().toString();
        String tgl = etTanggalLahir.getText().toString().trim();
        String telp = etNoTelp.getText().toString().trim();
        String alamatDetail = etAlamat.getText().toString().trim();
        String password = etPassword.getText().toString().trim();

        // Get region names and codes
        String provinsiName = spProvinsi.getSelectedItem().toString();
        String kotaName = spKota.getSelectedItem().toString();
        String kecamatanName = spKecamatan.getSelectedItem().toString();
        String kelurahanName = spKelurahan.getSelectedItem() != null ?
                spKelurahan.getSelectedItem().toString() : "";

        // Get kelurahan code
        String kelurahanCode = "";
        if (spKelurahan.getSelectedItemPosition() > 0 && kelurahanList != null) {
            kelurahanCode = kelurahanList.get(spKelurahan.getSelectedItemPosition() - 1).id;
        }

        // Format address
        String formattedAlamat = provinsiName + "(" + selectedProvinsiId + ")," +
                kotaName + "(" + selectedKotaId + ")," +
                kecamatanName + "(" + selectedKecamatanId + ")," +
                kelurahanName + "(" + kelurahanCode + ")," +
                alamatDetail;

        // Convert date format
        String tglFormatted;
        if (tgl.contains("/")) {
            String[] parts = tgl.split("/");
            tglFormatted = parts[2] + "-" + parts[1] + "-" + parts[0];
        } else {
            tglFormatted = tgl;
        }

        String genderDB = jk.equals("Laki-Laki") ? "Laki-laki" :
                jk.equals("Perempuan") ? "Perempuan" :
                        "Tidak Bisa Dijelaskan";

        try {
            JSONObject user = new JSONObject();
            JSONObject pasienData = new JSONObject();
            pasienData.put("nik", nik);
            pasienData.put("nama", nama);
            pasienData.put("jenis_kelamin", genderDB);
            pasienData.put("tanggal_lahir", tglFormatted);
            pasienData.put("no_telp", telp);
            pasienData.put("alamat", formattedAlamat);
            pasienData.put("password", password);
            user.put("email", email);
            user.put("password", password);
            supabaseHelper.register(registeractivity.this, user, new Callback() {
                @Override
                public void onFailure(@NonNull Call call, @NonNull IOException e) {
                    android.util.Log.d("Register", "Response Body: " + e.getMessage());
                }

                @Override
                public void onResponse(@NonNull Call call, @NonNull Response response) throws IOException {
                    String result = response.body().string();
                    Log.d("Register", "Response Body: " + result.toString());
                    login(user, pasienData);
                }
            });
        } catch (Exception e){}
    }

    private void login(JSONObject data, JSONObject userData) {
        supabaseHelper.login(this, data, new Callback() {
            @Override
            public void onFailure(@NonNull Call call, @NonNull IOException e) {
                android.util.Log.e("Login", "Failed: " + e.getMessage());
            }

            @Override
            public void onResponse(@NonNull Call call, @NonNull Response response) throws IOException {
                if (response.isSuccessful()) {
                    String result = response.body().string();

                    try {
                        // Parse using JSONObject (not Gson)
                        JSONObject jsonResponse = new JSONObject(result);

                        // Get access token and user ID
                        String accessToken = jsonResponse.getString("access_token");

                        // Insert into Supabase
                        supabaseHelper.insert(registeractivity.this, "pasien", userData, accessToken,
                                new supabaseHelper.SupabaseCallback() {
                                    @Override
                                    public void onSuccess(String response) {
                                        runOnUiThread(() -> {
                                            progressBar.setVisibility(View.GONE);
                                            btnRegister.setEnabled(true);
                                            btnRegister.setText("Daftar");
                                            try {
                                                // Save auth state
                                                String userId = jsonResponse.getJSONObject("user").getString("id");
                                                AuthManager authManager = new AuthManager(registeractivity.this);
                                                authManager.saveLoginState(accessToken, userId);

                                                JSONObject userJson = new JSONObject(userData.toString());
                                                Toast.makeText(registeractivity.this,
                                                        "Registrasi berhasil!\nSelamat datang, " +
                                                                userJson.getString("nama"),
                                                        Toast.LENGTH_LONG).show();

                                                Intent intent = new Intent(registeractivity.this, splashScreenActivity.class);
                                                intent.putExtra("registered_nik", userJson.getString("nik"));
                                                startActivity(intent);
                                                finish();
                                            } catch (Exception e) {
                                                Log.e("Register", "Parse error: " + e.getMessage());
                                            }
                                        });
                                    }

                                    @Override
                                    public void onError(String error) {
                                        runOnUiThread(() -> {
                                            progressBar.setVisibility(View.GONE);
                                            btnRegister.setEnabled(true);
                                            btnRegister.setText("Daftar");

                                            Log.e("Register", "Insert error: " + error);
                                            Toast.makeText(registeractivity.this,
                                                    "Gagal mendaftar: " + error,
                                                    Toast.LENGTH_LONG).show();
                                        });
                                    }
                                });

                    } catch (Exception e) {
                        runOnUiThread(() -> {
                            progressBar.setVisibility(View.GONE);
                            btnRegister.setEnabled(true);
                            btnRegister.setText("Daftar");
                            Toast.makeText(registeractivity.this,
                                    "Error: " + e.getMessage(), Toast.LENGTH_SHORT).show();
                        });
                    }
                }
            }
        });
    }

    private void clearForm() {
        etNIK.setText("");
        etNamaLengkap.setText("");
        etTanggalLahir.setText("");
        etNoTelp.setText("");
        etAlamat.setText("");
        etPassword.setText("");
        etConfirmPassword.setText("");
        spJenisKelamin.setSelection(0);
        spProvinsi.setSelection(0);
        selectedProvinsiId = selectedKotaId = selectedKecamatanId = "";
        resetSpinner(spKota, "Pilih Kota");
        resetSpinner(spKecamatan, "Pilih Kecamatan");
        resetSpinner(spKelurahan, "Pilih Kelurahan");
        clearErrors();
    }
}