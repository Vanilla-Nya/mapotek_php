package com.vanilla.mapotek;

import android.app.DatePickerDialog;
import android.app.ProgressDialog;
import android.os.Bundle;
import android.text.TextUtils;
import android.util.Log;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.AdapterView;
import android.widget.ArrayAdapter;
import android.widget.Spinner;
import android.widget.Toast;
import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import com.google.android.material.bottomsheet.BottomSheetDialogFragment;
import com.google.android.material.button.MaterialButton;
import com.google.android.material.textfield.TextInputEditText;
import com.vanilla.mapotek.auth.AuthManager;
import com.vanilla.mapotek.auth.RegionApiHelper;
import com.vanilla.mapotek.database.supabaseHelper;
import org.json.JSONObject;
import java.text.SimpleDateFormat;
import java.util.Calendar;
import java.util.List;
import java.util.Locale;

/**
 * Bottom Sheet for editing user profile with region selection
 */
public class EditProfileBottomSheet extends BottomSheetDialogFragment {
    private static final String TAG = "EditProfileBottomSheet";

    // UI Components
    private TextInputEditText etNamaLengkap;
    private TextInputEditText etNIK;
    private TextInputEditText etTanggalLahir;
    private TextInputEditText etNoTelp;
    private TextInputEditText etAlamat;
    private Spinner spProvinsi, spKota, spKecamatan, spKelurahan;
    private MaterialButton btnSave;
    private MaterialButton btnCancel;

    // Data helpers
    private AuthManager authManager;
    private ProgressDialog progressDialog;
    private Calendar selectedDate;

    // Region data
    private List<RegionApiHelper.Region> provinsiList, kotaList, kecamatanList, kelurahanList;
    private String selectedProvinsiId = "", selectedKotaId = "", selectedKecamatanId = "";

    // Callback
    public interface OnProfileUpdatedListener {
        void onProfileUpdated();
    }

    private OnProfileUpdatedListener listener;

    public static EditProfileBottomSheet newInstance(OnProfileUpdatedListener listener) {
        EditProfileBottomSheet sheet = new EditProfileBottomSheet();
        sheet.listener = listener;
        return sheet;
    }

    @Nullable
    @Override
    public View onCreateView(@NonNull LayoutInflater inflater, @Nullable ViewGroup container,
                             @Nullable Bundle savedInstanceState) {
        return inflater.inflate(R.layout.bottom_sheet_edit_profile, container, false);
    }

    @Override
    public void onViewCreated(@NonNull View view, @Nullable Bundle savedInstanceState) {
        super.onViewCreated(view, savedInstanceState);

        initializeViews(view);
        setupAuthManager();
        loadProvinces();
        setupSpinnerListeners();
        loadCurrentData();
        setupClickListeners();
    }

    private void initializeViews(View view) {
        etNamaLengkap = view.findViewById(R.id.etNamaLengkap);
        etNIK = view.findViewById(R.id.etNIK);
        etTanggalLahir = view.findViewById(R.id.etTanggalLahir);
        etNoTelp = view.findViewById(R.id.etNoTelp);
        etAlamat = view.findViewById(R.id.etAlamat);

        spProvinsi = view.findViewById(R.id.spProvinsi);
        spKota = view.findViewById(R.id.spKota);
        spKecamatan = view.findViewById(R.id.spKecamatan);
        spKelurahan = view.findViewById(R.id.spKelurahan);

        btnSave = view.findViewById(R.id.btnSave);
        btnCancel = view.findViewById(R.id.btnCancel);

        selectedDate = Calendar.getInstance();
    }

    private void setupAuthManager() {
        authManager = new AuthManager(requireContext());
    }

    /**
     * Load provinces from API
     */
    private void loadProvinces() {
        String[] loadingData = {"Memuat provinsi..."};
        ArrayAdapter<String> loadingAdapter = new ArrayAdapter<>(requireContext(),
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

                ArrayAdapter<String> adapter = new ArrayAdapter<>(requireContext(),
                        android.R.layout.simple_spinner_dropdown_item, provinsiNames);
                spProvinsi.setAdapter(adapter);
            }

            @Override
            public void onError(String error) {
                Toast.makeText(requireContext(),
                        "Gagal memuat data provinsi: " + error, Toast.LENGTH_SHORT).show();
                resetSpinner(spProvinsi, "Pilih Provinsi");
            }
        });
    }

    /**
     * Setup spinner listeners for cascading dropdowns
     */
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
        ArrayAdapter<String> loadingAdapter = new ArrayAdapter<>(requireContext(),
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

                ArrayAdapter<String> adapter = new ArrayAdapter<>(requireContext(),
                        android.R.layout.simple_spinner_dropdown_item, kotaNames);
                spKota.setAdapter(adapter);

                resetSpinner(spKecamatan, "Pilih Kecamatan");
                resetSpinner(spKelurahan, "Pilih Kelurahan");
            }

            @Override
            public void onError(String error) {
                Toast.makeText(requireContext(),
                        "Gagal memuat data kota: " + error, Toast.LENGTH_SHORT).show();
                resetSpinner(spKota, "Pilih Kota");
            }
        });
    }

    private void loadDistricts(String cityId) {
        String[] loadingData = {"Memuat kecamatan..."};
        ArrayAdapter<String> loadingAdapter = new ArrayAdapter<>(requireContext(),
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

                ArrayAdapter<String> adapter = new ArrayAdapter<>(requireContext(),
                        android.R.layout.simple_spinner_dropdown_item, kecamatanNames);
                spKecamatan.setAdapter(adapter);

                resetSpinner(spKelurahan, "Pilih Kelurahan");
            }

            @Override
            public void onError(String error) {
                Toast.makeText(requireContext(),
                        "Gagal memuat data kecamatan: " + error, Toast.LENGTH_SHORT).show();
                resetSpinner(spKecamatan, "Pilih Kecamatan");
            }
        });
    }

    private void loadVillages(String districtId) {
        String[] loadingData = {"Memuat kelurahan..."};
        ArrayAdapter<String> loadingAdapter = new ArrayAdapter<>(requireContext(),
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

                ArrayAdapter<String> adapter = new ArrayAdapter<>(requireContext(),
                        android.R.layout.simple_spinner_dropdown_item, kelurahanNames);
                spKelurahan.setAdapter(adapter);
            }

            @Override
            public void onError(String error) {
                Toast.makeText(requireContext(),
                        "Gagal memuat data kelurahan: " + error, Toast.LENGTH_SHORT).show();
                resetSpinner(spKelurahan, "Pilih Kelurahan");
            }
        });
    }

    private void resetSpinner(Spinner spinner, String placeholder) {
        String[] emptyData = {placeholder};
        ArrayAdapter<String> emptyAdapter = new ArrayAdapter<>(requireContext(),
                android.R.layout.simple_spinner_dropdown_item, emptyData);
        spinner.setAdapter(emptyAdapter);
    }

    /**
     * Load current profile data from database
     */
    private void loadCurrentData() {
        showLoading("Memuat data...");

        String accessToken = authManager.getAccessToken();
        String userId = authManager.getUserId();

        if (accessToken == null || userId == null) {
            hideLoading();
            Toast.makeText(requireContext(), "Error: Token tidak ditemukan", Toast.LENGTH_SHORT).show();
            dismiss();
            return;
        }

        String table = "pasien";
        String params = "*&id_pasien=eq." + userId;

        supabaseHelper.select(requireContext(), table, params, accessToken,
                new supabaseHelper.SupabaseCallback() {
                    @Override
                    public void onSuccess(String response) {
                        requireActivity().runOnUiThread(() -> {
                            hideLoading();
                            try {
                                org.json.JSONArray jsonArray = new org.json.JSONArray(response);
                                if (jsonArray.length() > 0) {
                                    JSONObject userData = jsonArray.getJSONObject(0);
                                    populateFields(userData);
                                }
                            } catch (Exception e) {
                                Log.e(TAG, "Error parsing data: " + e.getMessage());
                                Toast.makeText(requireContext(),
                                        "Error loading data", Toast.LENGTH_SHORT).show();
                            }
                        });
                    }

                    @Override
                    public void onError(String error) {
                        requireActivity().runOnUiThread(() -> {
                            hideLoading();
                            Log.e(TAG, "Error loading data: " + error);
                            Toast.makeText(requireContext(),
                                    "Gagal memuat data: " + error, Toast.LENGTH_SHORT).show();
                        });
                    }
                });
    }

    /**
     * Fill the form fields with existing data and parse address
     */
    private void populateFields(JSONObject userData) {
        try {
            etNamaLengkap.setText(userData.optString("nama", ""));
            etNIK.setText(userData.optString("nik", ""));
            etTanggalLahir.setText(userData.optString("tanggal_lahir", ""));
            etNoTelp.setText(userData.optString("no_telp", ""));

            // Parse address to extract regions and detail
            String fullAddress = userData.optString("alamat", "");
            parseAndSetAddress(fullAddress);

            // Parse date for calendar
            String tanggalLahir = userData.optString("tanggal_lahir", "");
            if (!tanggalLahir.isEmpty()) {
                try {
                    SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd", Locale.getDefault());
                    selectedDate.setTime(sdf.parse(tanggalLahir));
                } catch (Exception e) {
                    Log.e(TAG, "Error parsing date: " + e.getMessage());
                }
            }
        } catch (Exception e) {
            Log.e(TAG, "Error populating fields: " + e.getMessage());
        }
    }

    /**
     * Parse stored address format and set spinners accordingly
     * Format: ProvinsiName(ID),KotaName(ID),KecamatanName(ID),KelurahanName(ID),DetailAddress
     */
    private void parseAndSetAddress(String fullAddress) {
        try {
            if (TextUtils.isEmpty(fullAddress)) return;

            String[] parts = fullAddress.split(",");
            if (parts.length < 5) {
                // Old format, just set detail
                etAlamat.setText(fullAddress);
                return;
            }

            // Extract IDs from format: Name(ID)
            String provinsiPart = parts[0].trim();
            String kotaPart = parts[1].trim();
            String kecamatanPart = parts[2].trim();
            String kelurahanPart = parts[3].trim();

            // Get detail (everything after 4th comma)
            StringBuilder detailBuilder = new StringBuilder();
            for (int i = 4; i < parts.length; i++) {
                if (i > 4) detailBuilder.append(",");
                detailBuilder.append(parts[i]);
            }
            etAlamat.setText(detailBuilder.toString().trim());

            // Extract province ID and set selection
            if (provinsiPart.contains("(") && provinsiPart.contains(")")) {
                String provinsiId = provinsiPart.substring(
                        provinsiPart.indexOf("(") + 1,
                        provinsiPart.indexOf(")")
                );
                selectedProvinsiId = provinsiId;
                selectSpinnerByValue(spProvinsi, provinsiId, provinsiList);
            }

            // Extract city ID
            if (kotaPart.contains("(") && kotaPart.contains(")")) {
                String kotaId = kotaPart.substring(
                        kotaPart.indexOf("(") + 1,
                        kotaPart.indexOf(")")
                );
                selectedKotaId = kotaId;
            }

            // Extract district ID
            if (kecamatanPart.contains("(") && kecamatanPart.contains(")")) {
                String kecamatanId = kecamatanPart.substring(
                        kecamatanPart.indexOf("(") + 1,
                        kecamatanPart.indexOf(")")
                );
                selectedKecamatanId = kecamatanId;
            }

        } catch (Exception e) {
            Log.e(TAG, "Error parsing address: " + e.getMessage());
            etAlamat.setText(fullAddress);
        }
    }

    /**
     * Helper to select spinner item by region ID
     */
    private void selectSpinnerByValue(Spinner spinner, String id,
                                      List<RegionApiHelper.Region> regionList) {
        if (regionList == null || id == null) return;

        for (int i = 0; i < regionList.size(); i++) {
            if (regionList.get(i).id.equals(id)) {
                spinner.setSelection(i + 1); // +1 because of "Pilih..." placeholder
                break;
            }
        }
    }

    private void setupClickListeners() {
        // Date picker
        etTanggalLahir.setOnClickListener(v -> showDatePicker());

        // Save button
        btnSave.setOnClickListener(v -> validateAndSave());

        // Cancel button
        btnCancel.setOnClickListener(v -> dismiss());
    }

    private void showDatePicker() {
        DatePickerDialog datePickerDialog = new DatePickerDialog(
                requireContext(),
                (view, year, month, dayOfMonth) -> {
                    selectedDate.set(Calendar.YEAR, year);
                    selectedDate.set(Calendar.MONTH, month);
                    selectedDate.set(Calendar.DAY_OF_MONTH, dayOfMonth);

                    SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd", Locale.getDefault());
                    etTanggalLahir.setText(sdf.format(selectedDate.getTime()));
                },
                selectedDate.get(Calendar.YEAR),
                selectedDate.get(Calendar.MONTH),
                selectedDate.get(Calendar.DAY_OF_MONTH)
        );

        datePickerDialog.show();
    }

    private void validateAndSave() {
        String nama = etNamaLengkap.getText().toString().trim();
        String nik = etNIK.getText().toString().trim();
        String tanggalLahir = etTanggalLahir.getText().toString().trim();
        String noTelp = etNoTelp.getText().toString().trim();
        String alamatDetail = etAlamat.getText().toString().trim();

        // Validation
        if (TextUtils.isEmpty(nama)) {
            etNamaLengkap.setError("Nama tidak boleh kosong");
            etNamaLengkap.requestFocus();
            return;
        }

        if (TextUtils.isEmpty(nik)) {
            etNIK.setError("NIK tidak boleh kosong");
            etNIK.requestFocus();
            return;
        }

        if (nik.length() != 16) {
            etNIK.setError("NIK harus 16 digit");
            etNIK.requestFocus();
            return;
        }

        if (TextUtils.isEmpty(tanggalLahir)) {
            etTanggalLahir.setError("Tanggal lahir tidak boleh kosong");
            etTanggalLahir.requestFocus();
            return;
        }

        if (TextUtils.isEmpty(alamatDetail)) {
            etAlamat.setError("Alamat detail tidak boleh kosong");
            etAlamat.requestFocus();
            return;
        }

        // Validate region selections
        if (selectedProvinsiId.isEmpty()) {
            Toast.makeText(requireContext(), "Pilih provinsi", Toast.LENGTH_SHORT).show();
            return;
        }
        if (selectedKotaId.isEmpty()) {
            Toast.makeText(requireContext(), "Pilih kota/kabupaten", Toast.LENGTH_SHORT).show();
            return;
        }
        if (selectedKecamatanId.isEmpty()) {
            Toast.makeText(requireContext(), "Pilih kecamatan", Toast.LENGTH_SHORT).show();
            return;
        }

        // Get region names
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

        // Format address like registration
        String formattedAlamat = provinsiName + "(" + selectedProvinsiId + ")," +
                kotaName + "(" + selectedKotaId + ")," +
                kecamatanName + "(" + selectedKecamatanId + ")," +
                kelurahanName + "(" + kelurahanCode + ")," +
                alamatDetail;

        saveToDatabase(nama, nik, tanggalLahir, noTelp, formattedAlamat);
    }

    private void saveToDatabase(String nama, String nik, String tanggalLahir,
                                String noTelp, String alamat) {
        showLoading("Menyimpan perubahan...");

        String accessToken = authManager.getAccessToken();
        String userId = authManager.getUserId();

        if (accessToken == null || userId == null) {
            hideLoading();
            Toast.makeText(requireContext(), "Error: Token tidak ditemukan", Toast.LENGTH_SHORT).show();
            return;
        }

        try {
            JSONObject updateData = new JSONObject();
            updateData.put("nama", nama);
            updateData.put("nik", nik);
            updateData.put("tanggal_lahir", tanggalLahir);
            updateData.put("no_telp", noTelp);
            updateData.put("alamat", alamat);

            Log.d(TAG, "Updating profile: " + updateData.toString());

            supabaseHelper.update(
                    requireContext(),
                    "pasien",
                    "id_pasien=eq." + userId,
                    accessToken,
                    updateData,
                    new supabaseHelper.SupabaseCallback() {
                        @Override
                        public void onSuccess(String response) {
                            requireActivity().runOnUiThread(() -> {
                                hideLoading();
                                Log.d(TAG, "Profile updated successfully!");

                                Toast.makeText(requireContext(),
                                        "Profil berhasil diperbarui!", Toast.LENGTH_SHORT).show();

                                if (listener != null) {
                                    listener.onProfileUpdated();
                                }

                                dismiss();
                            });
                        }

                        @Override
                        public void onError(String error) {
                            requireActivity().runOnUiThread(() -> {
                                hideLoading();
                                Log.e(TAG, "Error updating profile: " + error);
                                Toast.makeText(requireContext(),
                                        "Gagal memperbarui profil: " + error, Toast.LENGTH_LONG).show();
                            });
                        }
                    }
            );
        } catch (Exception e) {
            hideLoading();
            Log.e(TAG, "Error creating update JSON: " + e.getMessage());
            Toast.makeText(requireContext(),
                    "Error: " + e.getMessage(), Toast.LENGTH_SHORT).show();
        }
    }

    private void showLoading(String message) {
        if (progressDialog == null) {
            progressDialog = new ProgressDialog(requireContext());
            progressDialog.setCancelable(false);
        }
        progressDialog.setMessage(message);
        progressDialog.show();
    }

    private void hideLoading() {
        if (progressDialog != null && progressDialog.isShowing()) {
            progressDialog.dismiss();
        }
    }
}