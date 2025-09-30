package com.vanilla.mapotek;

import android.app.AlertDialog;
import android.app.ProgressDialog;
import android.content.Intent;
import android.content.SharedPreferences;
import android.os.Bundle;
import android.util.Log;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.ImageView;
import android.widget.TextView;
import android.widget.Toast;
import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import androidx.fragment.app.Fragment;
import com.google.android.material.button.MaterialButton;
import com.vanilla.mapotek.auth.AuthManager;
import com.vanilla.mapotek.auth.loginActivity;
import com.vanilla.mapotek.database.supabaseHelper;

import org.json.JSONArray;
import org.json.JSONObject;

import static android.content.Context.MODE_PRIVATE;

public class ProfileFragment extends Fragment {
    private static final String TAG = "ProfileFragment";

    private ImageView ivProfilePhoto, ivCameraOverlay;
    private TextView tvProfileName, tvNIK, tvNamaLengkap, tvTanggalLahir, tvAlamat;
    private MaterialButton btnEditProfile, btnChangePassword, btnLogout;

    private SharedPreferences sharedPreferences;
    private static final String PREF_NAME = "UserPrefs";

    private AuthManager authManager;
    private ProgressDialog progressDialog;

    @Nullable
    @Override
    public View onCreateView(@NonNull LayoutInflater inflater, @Nullable ViewGroup container,
                             @Nullable Bundle savedInstanceState) {
        return inflater.inflate(R.layout.fragment_profile, container, false);
    }

    @Override
    public void onViewCreated(@NonNull View view, @Nullable Bundle savedInstanceState) {
        super.onViewCreated(view, savedInstanceState);

        initializeViews(view);
        setupSharedPreferences();

        // Fetch fresh data from Supabase
        fetchUserProfileFromSupabase();

        setupClickListeners();
    }

    private void initializeViews(View view) {
        ivProfilePhoto = view.findViewById(R.id.ivProfilePhoto);
        ivCameraOverlay = view.findViewById(R.id.ivCameraOverlay);
        tvProfileName = view.findViewById(R.id.tvProfileName);
        tvNIK = view.findViewById(R.id.tvNIK);
        tvNamaLengkap = view.findViewById(R.id.tvNamaLengkap);
        tvTanggalLahir = view.findViewById(R.id.tvTanggalLahir);
        tvAlamat = view.findViewById(R.id.tvAlamat);

        btnEditProfile = view.findViewById(R.id.btnEditProfile);
        btnChangePassword = view.findViewById(R.id.btnChangePassword);
        btnLogout = view.findViewById(R.id.btnLogout);
    }

    private void setupSharedPreferences() {
        sharedPreferences = requireActivity().getSharedPreferences(PREF_NAME, MODE_PRIVATE);
        authManager = new AuthManager(requireContext());
    }

    private void fetchUserProfileFromSupabase() {
        showLoading("Memuat profil...");

        String accessToken = authManager.getAccessToken();
        String userId = authManager.getUserId();

        if (accessToken == null || accessToken.isEmpty()) {
            hideLoading();
            Toast.makeText(requireContext(), "Token tidak ditemukan, silakan login kembali", Toast.LENGTH_SHORT).show();
            redirectToLogin();
            return;
        }

        String table = "pasien";

        // ✅ FIX 1: Select ALL columns by passing just "*"
        // Remove the filter for now to see all data
        String params = "*";

        // ❌ Don't filter by id yet - we'll add it back once we know the right column name
        // if (userId != null && !userId.isEmpty()) {
        //     params = "*&id=eq." + userId;
        // }

        supabaseHelper.select(requireContext(), table, params, accessToken,
                new supabaseHelper.SupabaseCallback() {
                    @Override
                    public void onSuccess(String response) {
                        requireActivity().runOnUiThread(() -> {
                            hideLoading();
                            Log.d(TAG, "Profile data received: " + response);

                            try {
                                JSONArray jsonArray = new JSONArray(response);

                                if (jsonArray.length() > 0) {
                                    JSONObject userData = jsonArray.getJSONObject(0);

                                    // 🔍 Log ALL fields to see what columns exist
                                    Log.d(TAG, "All user data: " + userData.toString());

                                    updateUIWithProfileData(userData);
                                    saveUserDataToPreferences(userData);
                                } else {
                                    Toast.makeText(requireContext(),
                                            "Data profil tidak ditemukan",
                                            Toast.LENGTH_SHORT).show();
                                    loadUserDataFromPreferences();
                                }

                            } catch (Exception e) {
                                Log.e(TAG, "Error parsing profile data: " + e.getMessage(), e);
                                Toast.makeText(requireContext(),
                                        "Gagal memproses data profil",
                                        Toast.LENGTH_SHORT).show();
                                loadUserDataFromPreferences();
                            }
                        });
                    }

                    @Override
                    public void onError(String error) {
                        requireActivity().runOnUiThread(() -> {
                            hideLoading();
                            Log.e(TAG, "Error fetching profile: " + error);

                            Toast.makeText(requireContext(),
                                    "Gagal memuat profil. Menampilkan data tersimpan.",
                                    Toast.LENGTH_SHORT).show();

                            loadUserDataFromPreferences();
                        });
                    }
                });
    }

    private void updateUIWithProfileData(JSONObject userData) {
        try {
            // ✅ Adjust these field names to match your actual Supabase columns
            // Based on your screenshot, you might have: nama, nik, tanggal_lahir, alamat

            String name = userData.optString("nama", "");  // ✅ This works!
            String nik = userData.optString("nik", "-");
            String birthDate = userData.optString("tanggal_lahir", "-");
            String address = userData.optString("alamat", "-");
            String email = userData.optString("email", "-");

            // If you have more columns, add them here
            // String profilePhotoUrl = userData.optString("foto_profil", "");

            // Update UI
            tvProfileName.setText(!name.isEmpty() ? name : "Pengguna");
            tvNamaLengkap.setText(!name.isEmpty() ? name : "Pengguna");
            tvNIK.setText(nik);
            tvTanggalLahir.setText(birthDate);
            tvAlamat.setText(address);

            Log.d(TAG, "UI updated with: " + name + ", " + nik + ", " + birthDate);

        } catch (Exception e) {
            Log.e(TAG, "Error updating UI: " + e.getMessage(), e);
            Toast.makeText(requireContext(), "Gagal menampilkan data", Toast.LENGTH_SHORT).show();
        }
    }

    private void saveUserDataToPreferences(JSONObject userData) {
        try {
            SharedPreferences.Editor editor = sharedPreferences.edit();
            editor.putString("user_name", userData.optString("name", ""));
            editor.putString("nama_lengkap", userData.optString("full_name", ""));
            editor.putString("nik", userData.optString("nik", ""));
            editor.putString("tanggal_lahir", userData.optString("birth_date", ""));
            editor.putString("alamat", userData.optString("address", ""));
            editor.putString("profile_photo_url", userData.optString("profile_photo_url", ""));
            editor.apply();
        } catch (Exception e) {
            Log.e(TAG, "Error saving to preferences: " + e.getMessage(), e);
        }
    }

    private void loadUserDataFromPreferences() {
        // Fallback: Load cached data from SharedPreferences
        String userName = sharedPreferences.getString("user_name", "Pengguna");
        String namaLengkap = sharedPreferences.getString("nama_lengkap", userName);
        String nik = sharedPreferences.getString("nik", "-");
        String tanggalLahir = sharedPreferences.getString("tanggal_lahir", "-");
        String alamat = sharedPreferences.getString("alamat", "-");

        tvProfileName.setText(userName);
        tvNamaLengkap.setText(namaLengkap);
        tvNIK.setText(nik);
        tvTanggalLahir.setText(tanggalLahir);
        tvAlamat.setText(alamat);
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

    private void redirectToLogin() {
        authManager.logout();
        Intent intent = new Intent(requireContext(), loginActivity.class);
        intent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TASK);
        startActivity(intent);
        requireActivity().finish();
    }

    private void setupClickListeners() {
        ivCameraOverlay.setOnClickListener(v -> changeProfilePhoto());
        ivProfilePhoto.setOnClickListener(v -> changeProfilePhoto());
        btnEditProfile.setOnClickListener(v -> editProfile());
        btnChangePassword.setOnClickListener(v -> changePassword());
        btnLogout.setOnClickListener(v -> showLogoutConfirmation());
    }

    private void changeProfilePhoto() {
        String[] options = {"Ambil Foto", "Pilih dari Galeri", "Hapus Foto"};

        new AlertDialog.Builder(requireContext())
                .setTitle("Ganti Foto Profil")
                .setItems(options, (dialog, which) -> {
                    switch (which) {
                        case 0:
                            Toast.makeText(requireContext(), "Buka kamera", Toast.LENGTH_SHORT).show();
                            // TODO: Implement camera
                            break;
                        case 1:
                            Toast.makeText(requireContext(), "Buka galeri", Toast.LENGTH_SHORT).show();
                            // TODO: Implement gallery picker
                            break;
                        case 2:
                            ivProfilePhoto.setImageResource(R.drawable.ic_person_circle);
                            Toast.makeText(requireContext(), "Foto profil dihapus", Toast.LENGTH_SHORT).show();
                            break;
                    }
                })
                .setNegativeButton("Batal", null)
                .show();
    }

    private void editProfile() {
        Toast.makeText(requireContext(), "Fitur edit profil akan segera hadir", Toast.LENGTH_SHORT).show();
        // TODO: Open edit profile activity
    }

    private void changePassword() {
        Toast.makeText(requireContext(), "Fitur ganti password akan segera hadir", Toast.LENGTH_SHORT).show();
        // TODO: Open change password activity
    }

    private void showLogoutConfirmation() {
        new AlertDialog.Builder(requireContext())
                .setTitle("Keluar")
                .setMessage("Apakah Anda yakin ingin keluar dari aplikasi?")
                .setIcon(R.drawable.ic_logout)
                .setPositiveButton("Ya, Keluar", (dialog, which) -> performLogout())
                .setNegativeButton("Batal", null)
                .show();
    }

    private void performLogout() {
        authManager.logout();

        SharedPreferences.Editor editor = sharedPreferences.edit();
        editor.clear();
        editor.apply();

        Toast.makeText(requireContext(), "Anda telah keluar dari aplikasi", Toast.LENGTH_SHORT).show();

        Intent intent = new Intent(requireContext(), loginActivity.class);
        intent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TASK);
        startActivity(intent);
        requireActivity().finish();
    }

    // Public method to refresh profile (can be called after editing)
    public void refreshProfile() {
        fetchUserProfileFromSupabase();
    }
}