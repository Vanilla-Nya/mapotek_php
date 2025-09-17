package com.vanilla.mapotek;

import android.app.AlertDialog;
import android.content.Intent;
import android.content.SharedPreferences;
import android.os.Bundle;
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

import static android.content.Context.MODE_PRIVATE;

public class ProfileFragment extends Fragment {

    private ImageView ivProfilePhoto, ivCameraOverlay;
    private TextView tvProfileName, tvNIK, tvNamaLengkap, tvTanggalLahir, tvAlamat;
    private MaterialButton btnEditProfile, btnChangePassword, btnLogout;

    private SharedPreferences sharedPreferences;
    private static final String PREF_NAME = "UserPrefs";

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
        loadUserData();
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
    }

    private void loadUserData() {
        // Load user data from SharedPreferences or arguments
        Bundle args = getArguments();
        String userName = "";

        if (args != null) {
            userName = args.getString("USER_NAME", "");
        }

        if (userName.isEmpty()) {
            userName = sharedPreferences.getString("user_name", "Pengguna");
        }

        // Set default values or load from SharedPreferences
        tvProfileName.setText(userName);
        tvNamaLengkap.setText(sharedPreferences.getString("nama_lengkap", userName));
        tvNIK.setText(sharedPreferences.getString("nik", "1234567890123456"));
        tvTanggalLahir.setText(sharedPreferences.getString("tanggal_lahir", "01/01/1990"));
        tvAlamat.setText(sharedPreferences.getString("alamat", "Jl. Raya No. 123, Surabaya, Jawa Timur"));

        // TODO: Load profile photo from storage or URL
    }

    private void setupClickListeners() {
        // Profile photo change
        ivCameraOverlay.setOnClickListener(v -> changeProfilePhoto());
        ivProfilePhoto.setOnClickListener(v -> changeProfilePhoto());

        // Edit profile
        btnEditProfile.setOnClickListener(v -> editProfile());

        // Change password
        btnChangePassword.setOnClickListener(v -> changePassword());

        // Logout
        btnLogout.setOnClickListener(v -> showLogoutConfirmation());
    }

    private void changeProfilePhoto() {
        // TODO: Implement photo picker functionality
        Toast.makeText(requireContext(), "Fitur ganti foto akan segera hadir", Toast.LENGTH_SHORT).show();

        // For now, show options dialog
        String[] options = {"Ambil Foto", "Pilih dari Galeri", "Hapus Foto"};

        new AlertDialog.Builder(requireContext())
                .setTitle("Ganti Foto Profil")
                .setItems(options, (dialog, which) -> {
                    switch (which) {
                        case 0:
                            Toast.makeText(requireContext(), "Buka kamera", Toast.LENGTH_SHORT).show();
                            // TODO: Open camera
                            break;
                        case 1:
                            Toast.makeText(requireContext(), "Buka galeri", Toast.LENGTH_SHORT).show();
                            // TODO: Open gallery
                            break;
                        case 2:
                            // Reset to default photo
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
        // TODO: Open edit profile activity/dialog
        // Intent intent = new Intent(requireContext(), EditProfileActivity.class);
        // startActivity(intent);
    }

    private void changePassword() {
        Toast.makeText(requireContext(), "Fitur ganti password akan segera hadir", Toast.LENGTH_SHORT).show();
        // TODO: Open change password dialog/activity
        // Intent intent = new Intent(requireContext(), ChangePasswordActivity.class);
        // startActivity(intent);
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
        // Clear user session data
        SharedPreferences.Editor editor = sharedPreferences.edit();
        editor.clear();
        editor.apply();

        // Show logout message
        Toast.makeText(requireContext(), "Anda telah keluar dari aplikasi", Toast.LENGTH_SHORT).show();

        // Navigate back to login activity
        Intent intent = new Intent(requireContext(), loginActivity.class);
        intent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TASK);
        startActivity(intent);

        // Close the current activity
        requireActivity().finish();
    }

    // Method to save user data (can be called from edit profile)
    public void saveUserData(String nik, String nama, String tanggalLahir, String alamat) {
        SharedPreferences.Editor editor = sharedPreferences.edit();
        editor.putString("nik", nik);
        editor.putString("nama_lengkap", nama);
        editor.putString("user_name", nama);
        editor.putString("tanggal_lahir", tanggalLahir);
        editor.putString("alamat", alamat);
        editor.apply();

        // Refresh the display
        loadUserData();

        Toast.makeText(requireContext(), "Profil berhasil diperbarui", Toast.LENGTH_SHORT).show();
    }
}