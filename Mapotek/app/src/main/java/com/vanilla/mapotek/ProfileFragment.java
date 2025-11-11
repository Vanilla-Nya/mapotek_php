package com.vanilla.mapotek;

import android.app.AlertDialog;
import android.app.ProgressDialog;
import android.content.Intent;
import android.content.SharedPreferences;
import android.net.Uri;
import android.os.Bundle;
import android.provider.MediaStore;
import android.text.InputType;
import android.util.Log;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.EditText;
import android.widget.ImageView;
import android.widget.TextView;
import android.widget.Toast;
import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import androidx.fragment.app.Fragment;
import com.bumptech.glide.Glide;
import com.bumptech.glide.load.resource.bitmap.CenterCrop;
import com.google.android.material.button.MaterialButton;
import com.vanilla.mapotek.auth.AuthManager;
import com.vanilla.mapotek.auth.loginActivity;
import com.vanilla.mapotek.database.supabaseHelper;
import com.yalantis.ucrop.UCrop;
import org.json.JSONArray;
import org.json.JSONObject;
import jp.wasabeef.glide.transformations.BlurTransformation;
import java.io.File;
import java.util.Iterator;

import static android.app.Activity.RESULT_OK;
import static android.content.Context.MODE_PRIVATE;

/**
 * ProfileFragment - Handles user profile display and photo management
 * Features:
 * - Upload photo from gallery with crop
 * - Insert photo via URL link
 * - Blurred background effect (frosted glass)
 * - Remove photo option
 * - Save to Supabase database (Simple UPDATE - no blockchain)
 */
public class ProfileFragment extends Fragment {
    private static final String TAG = "ProfileFragment";
    private static final int PICK_IMAGE_REQUEST = 1;

    // UI Components
    private ImageView ivProfilePhoto, ivCameraOverlay, ivBlurredBackground;
    private TextView tvProfileName, tvNIK, tvNamaLengkap, tvTanggalLahir, tvAlamat;
    private MaterialButton btnEditProfile, btnChangePassword, btnLogout;

    // Data & Auth
    private SharedPreferences sharedPreferences;
    private static final String PREF_NAME = "UserPrefs";
    private AuthManager authManager;
    private ProgressDialog progressDialog;
    private String currentPhotoUrl = null;

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
        fetchUserProfileFromSupabase();
        setupClickListeners();
    }

    /**
     * Initialize all UI components
     */
    private void initializeViews(View view) {
        ivProfilePhoto = view.findViewById(R.id.ivProfilePhoto);
        ivCameraOverlay = view.findViewById(R.id.ivCameraOverlay);
        ivBlurredBackground = view.findViewById(R.id.ivBlurredBackground);

        tvProfileName = view.findViewById(R.id.tvProfileName);
        tvNIK = view.findViewById(R.id.tvNIK);
        tvNamaLengkap = view.findViewById(R.id.tvNamaLengkap);
        tvTanggalLahir = view.findViewById(R.id.tvTanggalLahir);
        tvAlamat = view.findViewById(R.id.tvAlamat);

        btnEditProfile = view.findViewById(R.id.btnEditProfile);
        btnChangePassword = view.findViewById(R.id.btnChangePassword);
        btnLogout = view.findViewById(R.id.btnLogout);
    }

    /**
     * Setup SharedPreferences and AuthManager
     */
    private void setupSharedPreferences() {
        sharedPreferences = requireActivity().getSharedPreferences(PREF_NAME, MODE_PRIVATE);
        authManager = new AuthManager(requireContext());
    }

    /**
     * Setup click listeners for all interactive elements
     */
    private void setupClickListeners() {
        ivCameraOverlay.setOnClickListener(v -> changeProfilePhoto());
        ivProfilePhoto.setOnClickListener(v -> changeProfilePhoto());
        btnEditProfile.setOnClickListener(v -> editProfile());
        btnChangePassword.setOnClickListener(v -> changePassword());
        btnLogout.setOnClickListener(v -> showLogoutConfirmation());
    }

    /**
     * Shows dialog to choose photo source
     * Options: Gallery, URL Link, or Remove Photo
     */
    private void changeProfilePhoto() {
        String[] options = {"Pilih dari Galeri", "Masukkan Link Foto", "Hapus Foto"};

        new AlertDialog.Builder(requireContext())
                .setTitle("Ganti Foto Profil")
                .setItems(options, (dialog, which) -> {
                    switch (which) {
                        case 0:
                            openGallery();
                            break;
                        case 1:
                            showLinkInputDialog();
                            break;
                        case 2:
                            removeProfilePhoto();
                            break;
                    }
                })
                .setNegativeButton("Batal", null)
                .show();
    }

    /**
     * Opens device gallery to pick an image
     */
    private void openGallery() {
        Intent intent = new Intent(Intent.ACTION_PICK, MediaStore.Images.Media.EXTERNAL_CONTENT_URI);
        intent.setType("image/*");
        startActivityForResult(intent, PICK_IMAGE_REQUEST);
    }

    /**
     * Shows dialog to input image URL from internet
     */
    private void showLinkInputDialog() {
        EditText input = new EditText(requireContext());
        input.setInputType(InputType.TYPE_TEXT_VARIATION_URI);
        input.setHint("https://example.com/photo.jpg");

        new AlertDialog.Builder(requireContext())
                .setTitle("Masukkan Link Foto")
                .setMessage("Paste URL gambar dari internet")
                .setView(input)
                .setPositiveButton("OK", (dialog, which) -> {
                    String imageUrl = input.getText().toString().trim();
                    if (!imageUrl.isEmpty()) {
                        loadProfileImage(imageUrl);
                        savePhotoUrlToSupabase(imageUrl);
                    } else {
                        Toast.makeText(requireContext(), "Link tidak boleh kosong", Toast.LENGTH_SHORT).show();
                    }
                })
                .setNegativeButton("Batal", null)
                .show();
    }

    /**
     * Handles results from gallery picker and crop activity
     * Flow: Gallery → Crop → Final Result
     */
    @Override
    public void onActivityResult(int requestCode, int resultCode, @Nullable Intent data) {
        super.onActivityResult(requestCode, resultCode, data);

        Log.d(TAG, "📱 onActivityResult called");
        Log.d(TAG, "   Request code: " + requestCode);
        Log.d(TAG, "   Result code: " + resultCode);

        // Handle gallery picker
        if (requestCode == PICK_IMAGE_REQUEST && resultCode == RESULT_OK && data != null) {
            Uri imageUri = data.getData();
            if (imageUri != null) {
                Log.d(TAG, "📸 Image picked from gallery: " + imageUri);
                startCropActivity(imageUri);
            }
            return;
        }

        // Handle UCrop result (UCrop can use any request code)
        if (resultCode == RESULT_OK && data != null) {
            final Uri croppedUri = UCrop.getOutput(data);
            if (croppedUri != null) {
                Log.d(TAG, "✂️ Image cropped successfully: " + croppedUri);

                // Load image immediately
                loadProfileImage(croppedUri.toString());

                // Upload to Supabase
                uploadImageToSupabase(croppedUri);
                return;
            }
        }

        // Handle UCrop error
        if (data != null) {
            final Throwable cropError = UCrop.getError(data);
            if (cropError != null) {
                Log.e(TAG, "❌ Crop error: " + cropError.getMessage());
                Toast.makeText(requireContext(),
                        "Crop error: " + cropError.getMessage(),
                        Toast.LENGTH_SHORT).show();
            }
        }
    }

    /**
     * Opens UCrop activity for image cropping
     * Creates Instagram-like crop interface with 1:1 aspect ratio
     */
    private void startCropActivity(Uri sourceUri) {
        // Create destination file for cropped image
        String destinationFileName = "cropped_" + System.currentTimeMillis() + ".jpg";
        Uri destinationUri = Uri.fromFile(new File(requireContext().getCacheDir(), destinationFileName));

        // Configure UCrop options
        UCrop.Options options = new UCrop.Options();
        options.setCompressionQuality(90);

        // Set aspect ratio to 1:1 (square, perfect for profile photos)
        options.setAspectRatioOptions(0,
                new com.yalantis.ucrop.model.AspectRatio("Square", 1, 1)
        );

        // UI colors (match your app theme)
        options.setToolbarColor(getResources().getColor(R.color.primary_color));
        options.setStatusBarColor(getResources().getColor(R.color.primary_color));
        options.setActiveControlsWidgetColor(getResources().getColor(R.color.accent_color));

        // Show crop frame (the selection box)
        options.setShowCropFrame(true);
        options.setCropFrameColor(getResources().getColor(R.color.white));
        options.setCropFrameStrokeWidth(3);

        // Show grid lines (3x3 grid for alignment)
        options.setShowCropGrid(true);
        options.setCropGridStrokeWidth(2);
        options.setCropGridColor(getResources().getColor(R.color.white));

        // Toolbar title
        options.setToolbarTitle("Crop Foto Profil");

        // Start crop activity
        UCrop.of(sourceUri, destinationUri)
                .withAspectRatio(1, 1)  // 1:1 ratio (square)
                .withMaxResultSize(800, 800)  // Max resolution
                .withOptions(options)
                .start(requireContext(), this);
    }

    /**
     * Loads profile image with blur background effect
     * Think of this like:
     * 1. Sharp photo in circle
     * 2. Blurred version as background (frosted glass)
     */
    private void loadProfileImage(String imageUrl) {
        if (imageUrl == null || imageUrl.trim().isEmpty() || imageUrl.equals("null")) {
            Log.w(TAG, "⚠️ No valid image URL, reverting to default icon");

            // Reset to default
            ivProfilePhoto.setImageResource(R.drawable.ic_person_circle);
            ivProfilePhoto.setImageTintList(
                    android.content.res.ColorStateList.valueOf(
                            getResources().getColor(R.color.primary_color)
                    )
            );
            ivBlurredBackground.setVisibility(View.GONE);
            currentPhotoUrl = null;
            return;
        }

        currentPhotoUrl = imageUrl;
        Log.d(TAG, "📸 Loading profile image: " + imageUrl);

        // Remove tint for actual photos
        ivProfilePhoto.setImageTintList(null);

        // Load sharp circular photo
        Glide.with(this)
                .load(imageUrl)
                .circleCrop()
                .placeholder(R.drawable.ic_person_circle)
                .error(R.drawable.ic_person_circle)
                .into(ivProfilePhoto);

        // Load blurred background (frosted glass effect)
        Glide.with(this)
                .load(imageUrl)
                .transform(new CenterCrop(), new BlurTransformation(25, 3))
                .into(ivBlurredBackground);

        ivBlurredBackground.setVisibility(View.VISIBLE);
        savePhotoUrlToPreferences(imageUrl);
        Log.d(TAG, "✅ Profile image loaded successfully");
    }

    /**
     * Removes profile photo and restores default icon
     */
    private void removeProfilePhoto() {
        currentPhotoUrl = null;
        Log.d(TAG, "🗑️ Removing profile photo");

        // Reset to default icon
        ivProfilePhoto.setImageResource(R.drawable.ic_person_circle);

        // Restore tint for default icon (blue overlay)
        ivProfilePhoto.setImageTintList(
                android.content.res.ColorStateList.valueOf(
                        getResources().getColor(R.color.primary_color)
                )
        );

        // Hide blurred background
        ivBlurredBackground.setVisibility(View.GONE);

        // Update database and local storage
        savePhotoUrlToSupabase(null);
        savePhotoUrlToPreferences(null);

        Toast.makeText(requireContext(), "Foto profil dihapus", Toast.LENGTH_SHORT).show();
    }

    /**
     * Uploads image to Supabase Storage and saves public URL to database
     * Flow:
     * 1. Upload file to Supabase Storage bucket
     * 2. Get public URL
     * 3. Save URL to database
     */
    private void uploadImageToSupabase(Uri imageUri) {
        showLoading("Mengupload foto...");

        String accessToken = authManager.getAccessToken();
        String userId = authManager.getUserId();

        if (accessToken == null || userId == null) {
            hideLoading();
            Toast.makeText(requireContext(), "Error: Token hilang", Toast.LENGTH_SHORT).show();
            return;
        }

        String timestamp = String.valueOf(System.currentTimeMillis());
        String fileName = "avatar_" + userId + "_" + timestamp + ".jpg";
        String bucketName = "avatars";

        // ⭐ ADD SUBFOLDER HERE
        String filePath = "avatars/" + fileName;  // Now uploads to avatars/avatar/

        Log.d(TAG, "📤 === UPLOAD DEBUG ===");
        Log.d(TAG, "   Bucket: " + bucketName);
        Log.d(TAG, "   File path: " + filePath);  // Will be "avatar/avatar_xxx.jpg"

        supabaseHelper.uploadToStorage(
                requireContext(),
                bucketName,
                filePath,  // ⭐ Changed from fileName to filePath
                imageUri,
                accessToken,
                new supabaseHelper.SupabaseCallback() {
                    @Override
                    public void onSuccess(String publicUrl) {
                        requireActivity().runOnUiThread(() -> {
                            Log.d(TAG, "✅ Upload successful!");
                            Log.d(TAG, "   Public URL: " + publicUrl);

                            hideLoading();
                            loadProfileImage(publicUrl);
                            savePhotoUrlToSupabase(publicUrl);

                            Toast.makeText(requireContext(),
                                    "Foto berhasil diupload!",
                                    Toast.LENGTH_SHORT).show();
                        });
                    }

                    @Override
                    public void onError(String error) {
                        requireActivity().runOnUiThread(() -> {
                            Log.e(TAG, "❌ Upload failed: " + error);
                            hideLoading();
                            Toast.makeText(requireContext(),
                                    "Gagal upload: " + error,
                                    Toast.LENGTH_LONG).show();
                        });
                    }
                }
        );
    }

    /**
     * Saves photo URL to Supabase database using simple UPDATE
     * ⭐ No blockchain - just updates the avatar_url column
     */
    private void savePhotoUrlToSupabase(String photoUrl) {
        String accessToken = authManager.getAccessToken();
        String userId = authManager.getUserId();

        if (accessToken == null || userId == null) {
            Log.w(TAG, "❌ Cannot save photo: missing token or user ID");
            return;
        }

        try {
            JSONObject updateData = new JSONObject();
            updateData.put("avatar_url", photoUrl);

            Log.d(TAG, "💾 === UPDATING AVATAR ===");
            Log.d(TAG, "   Table: pasien");
            Log.d(TAG, "   User ID: " + userId);
            Log.d(TAG, "   Photo URL: " + photoUrl);
            Log.d(TAG, "   Update data: " + updateData.toString());

            supabaseHelper.update(
                    requireContext(),
                    "pasien",
                    "id_pasien=eq." + userId,
                    accessToken,
                    updateData,
                    new supabaseHelper.SupabaseCallback() {
                        @Override
                        public void onSuccess(String response) {
                            Log.d(TAG, "✅ Avatar URL updated successfully!");
                            Log.d(TAG, "   Response: " + response);

                            requireActivity().runOnUiThread(() -> {
                                Toast.makeText(requireContext(),
                                        "Foto profil berhasil disimpan!",
                                        Toast.LENGTH_SHORT).show();
                            });
                        }

                        @Override
                        public void onError(String error) {
                            Log.e(TAG, "❌ Error updating avatar URL: " + error);
                            requireActivity().runOnUiThread(() -> {
                                Toast.makeText(requireContext(),
                                        "Gagal menyimpan foto ke database: " + error,
                                        Toast.LENGTH_SHORT).show();
                            });
                        }
                    }
            );
        } catch (Exception e) {
            Log.e(TAG, "❌ Error creating update JSON: " + e.getMessage());
            e.printStackTrace();
        }
    }

    /**
     * Saves photo URL to local SharedPreferences
     * Used for offline access and caching
     */
    private void savePhotoUrlToPreferences(String photoUrl) {
        SharedPreferences.Editor editor = sharedPreferences.edit();
        editor.putString("profile_photo_url", photoUrl);
        editor.apply();
        Log.d(TAG, "💾 Saved photo URL to preferences: " + photoUrl);
    }

    /**
     * Fetches user profile data from Supabase
     */
    private void fetchUserProfileFromSupabase() {
        showLoading("Memuat profil...");

        String accessToken = authManager.getAccessToken();
        String userId = authManager.getUserId();

        Log.d(TAG, "📥 Fetching profile from Supabase");
        Log.d(TAG, "   User ID: " + userId);

        if (accessToken == null || accessToken.isEmpty()) {
            hideLoading();
            Toast.makeText(requireContext(), "Token tidak ditemukan, silakan login kembali", Toast.LENGTH_SHORT).show();
            redirectToLogin();
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
                            Log.d(TAG, "✅ Profile data received: " + response);

                            try {
                                JSONArray jsonArray = new JSONArray(response);

                                if (jsonArray.length() > 0) {
                                    JSONObject userData = jsonArray.getJSONObject(0);
                                    updateUIWithProfileData(userData);
                                    saveUserDataToPreferences(userData);
                                } else {
                                    Log.w(TAG, "⚠️ No profile data found");
                                    Toast.makeText(requireContext(),
                                            "Data profil tidak ditemukan",
                                            Toast.LENGTH_SHORT).show();
                                    loadUserDataFromPreferences();
                                }

                            } catch (Exception e) {
                                Log.e(TAG, "❌ Error parsing profile data: " + e.getMessage(), e);
                                loadUserDataFromPreferences();
                            }
                        });
                    }

                    @Override
                    public void onError(String error) {
                        requireActivity().runOnUiThread(() -> {
                            hideLoading();
                            Log.e(TAG, "❌ Error fetching profile: " + error);
                            Toast.makeText(requireContext(),
                                    "Gagal memuat profil, menggunakan data tersimpan",
                                    Toast.LENGTH_SHORT).show();
                            loadUserDataFromPreferences();
                        });
                    }
                });
    }

    /**
     * Updates UI with profile data from Supabase
     * ⭐ Includes debug logging to show all available columns
     */
    private void updateUIWithProfileData(JSONObject userData) {
        try {
            // DEBUG: Print all available columns
            Log.d(TAG, "🔍 All available columns in userData:");
            Iterator<String> keys = userData.keys();
            while (keys.hasNext()) {
                String key = keys.next();
                Object value = userData.opt(key);
                Log.d(TAG, "   - " + key + " = " + value);
            }

            // Get data from JSON
            String name = userData.optString("nama", "");
            String nik = userData.optString("nik", "-");
            String birthDate = userData.optString("tanggal_lahir", "-");
            String address = userData.optString("alamat", "-");

            // Try multiple possible column names for photo
            String photoUrl = null;
            if (userData.has("avatar_url")) {
                photoUrl = userData.optString("avatar_url", null);
                Log.d(TAG, "📸 Found photo in 'avatar_url': " + photoUrl);
            } else if (userData.has("foto_profil")) {
                photoUrl = userData.optString("foto_profil", null);
                Log.d(TAG, "📸 Found photo in 'foto_profil': " + photoUrl);
            } else if (userData.has("profile_photo")) {
                photoUrl = userData.optString("profile_photo", null);
                Log.d(TAG, "📸 Found photo in 'profile_photo': " + photoUrl);
            } else {
                Log.w(TAG, "⚠️ No photo column found in database");
            }

            // Update UI
            tvProfileName.setText(!name.isEmpty() ? name : "Pengguna");
            tvNamaLengkap.setText(!name.isEmpty() ? name : "Pengguna");
            tvNIK.setText(nik);
            tvTanggalLahir.setText(birthDate);
            tvAlamat.setText(address);

            // Load profile photo if available
            if (photoUrl != null && !photoUrl.isEmpty() && !photoUrl.equals("null")) {
                Log.d(TAG, "📸 Loading photo from database: " + photoUrl);
                loadProfileImage(photoUrl);
            } else {
                Log.d(TAG, "📸 No photo URL found, using default icon");
            }

            Log.d(TAG, "✅ UI updated successfully");

        } catch (Exception e) {
            Log.e(TAG, "❌ Error updating UI: " + e.getMessage(), e);
        }
    }

    /**
     * Saves user data to SharedPreferences for offline access
     */
    private void saveUserDataToPreferences(JSONObject userData) {
        try {
            SharedPreferences.Editor editor = sharedPreferences.edit();
            editor.putString("user_name", userData.optString("nama", ""));
            editor.putString("nik", userData.optString("nik", ""));
            editor.putString("tanggal_lahir", userData.optString("tanggal_lahir", ""));
            editor.putString("alamat", userData.optString("alamat", ""));

            // Try to get photo from any possible column name
            String photoUrl = null;
            if (userData.has("avatar_url")) {
                photoUrl = userData.optString("avatar_url", "");
            } else if (userData.has("foto_profil")) {
                photoUrl = userData.optString("foto_profil", "");
            } else if (userData.has("profile_photo")) {
                photoUrl = userData.optString("profile_photo", "");
            }

            editor.putString("profile_photo_url", photoUrl);
            editor.apply();

            Log.d(TAG, "💾 User data saved to preferences");
        } catch (Exception e) {
            Log.e(TAG, "❌ Error saving to preferences: " + e.getMessage(), e);
        }
    }

    /**
     * Loads user data from SharedPreferences (fallback/offline mode)
     */
    private void loadUserDataFromPreferences() {
        Log.d(TAG, "💾 Loading user data from preferences (offline mode)");

        String userName = sharedPreferences.getString("user_name", "Pengguna");
        String nik = sharedPreferences.getString("nik", "-");
        String tanggalLahir = sharedPreferences.getString("tanggal_lahir", "-");
        String alamat = sharedPreferences.getString("alamat", "-");
        String photoUrl = sharedPreferences.getString("profile_photo_url", null);

        tvProfileName.setText(userName);
        tvNamaLengkap.setText(userName);
        tvNIK.setText(nik);
        tvTanggalLahir.setText(tanggalLahir);
        tvAlamat.setText(alamat);

        if (photoUrl != null && !photoUrl.isEmpty()) {
            Log.d(TAG, "📸 Loading cached photo: " + photoUrl);
            loadProfileImage(photoUrl);
        }

        Log.d(TAG, "✅ Preferences loaded successfully");
    }

    /**
     * Shows loading dialog
     */
    private void showLoading(String message) {
        if (progressDialog == null) {
            progressDialog = new ProgressDialog(requireContext());
            progressDialog.setCancelable(false);
        }
        progressDialog.setMessage(message);
        progressDialog.show();
    }

    /**
     * Hides loading dialog
     */
    private void hideLoading() {
        if (progressDialog != null && progressDialog.isShowing()) {
            progressDialog.dismiss();
        }
    }

    /**
     * Redirects user to login screen
     */
    private void redirectToLogin() {
        authManager.logout();
        Intent intent = new Intent(requireContext(), loginActivity.class);
        intent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TASK);
        startActivity(intent);
        requireActivity().finish();
    }

    /**
     * Opens edit profile screen (TODO: Implement)
     */
    private void editProfile() {
        Toast.makeText(requireContext(), "Fitur edit profil akan segera hadir", Toast.LENGTH_SHORT).show();
        // TODO: Implement edit profile activity
    }

    /**
     * Opens change password screen (TODO: Implement)
     */
    private void changePassword() {
        Toast.makeText(requireContext(), "Fitur ganti password akan segera hadir", Toast.LENGTH_SHORT).show();
        // TODO: Implement change password activity
    }

    /**
     * Shows logout confirmation dialog
     */
    private void showLogoutConfirmation() {
        new AlertDialog.Builder(requireContext())
                .setTitle("Keluar")
                .setMessage("Apakah Anda yakin ingin keluar dari aplikasi?")
                .setIcon(R.drawable.ic_logout)
                .setPositiveButton("Ya, Keluar", (dialog, which) -> performLogout())
                .setNegativeButton("Batal", null)
                .show();
    }

    /**
     * Performs logout operation
     */
    private void performLogout() {
        Log.d(TAG, "🚪 Logging out");
        authManager.logout();

        // Clear all saved data
        SharedPreferences.Editor editor = sharedPreferences.edit();
        editor.clear();
        editor.apply();

        Toast.makeText(requireContext(), "Anda telah keluar dari aplikasi", Toast.LENGTH_SHORT).show();

        // Redirect to login
        Intent intent = new Intent(requireContext(), loginActivity.class);
        intent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TASK);
        startActivity(intent);
        requireActivity().finish();
    }

    /**
     * Public method to refresh profile from external call
     */
    public void refreshProfile() {
        Log.d(TAG, "🔄 Refreshing profile");
        fetchUserProfileFromSupabase();
    }
}