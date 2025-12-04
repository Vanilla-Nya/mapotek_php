package com.vanilla.mapotek;

import android.app.AlertDialog;
import android.os.Bundle;
import android.util.Log;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.ImageView;
import android.widget.LinearLayout;
import android.widget.TextView;
import android.widget.Toast;
import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import androidx.cardview.widget.CardView;
import androidx.fragment.app.Fragment;
import com.bumptech.glide.Glide;
import com.bumptech.glide.load.resource.bitmap.CenterCrop;
import com.google.android.material.button.MaterialButton;
import com.google.gson.JsonParser;
import com.vanilla.mapotek.auth.AuthManager;
import com.vanilla.mapotek.database.supabaseHelper;
import jp.wasabeef.glide.transformations.BlurTransformation;
import org.json.JSONArray;
import org.json.JSONObject;
import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.HashMap;
import java.util.Locale;

/**
 * DashboardFragment - Main dashboard with welcome card and bookings
 * Features:
 * - Profile avatar with blur background effect
 * - Active bookings display
 * - Quick navigation to other sections
 */
public class DashboardFragment extends Fragment {

    private static final String TAG = "DashboardFragment";

    // UI Components
    private ImageView ivWelcomeProfilePhoto, ivWelcomeBackground;
    private TextView tvUserName;
    private CardView cardCariDokter, cardScanQR, cardHistory, cardProfile;
    private MaterialButton btnEmergency, btnAppointment, btnRefreshBooking;
    private LinearLayout loadingBooking, emptyBooking, bookingContainer;

    // Data & Auth
    private AuthManager authManager;
    private String patientId;

    // ✅ Prevent duplicate loading (like a traffic light!)
    private boolean isLoadingBookings = false;
    private boolean isFirstResume = true;

    @Nullable
    @Override
    public View onCreateView(@NonNull LayoutInflater inflater, @Nullable ViewGroup container,
                             @Nullable Bundle savedInstanceState) {
        return inflater.inflate(R.layout.fragment_dashboard, container, false);
    }

    @Override
    public void onViewCreated(@NonNull View view, @Nullable Bundle savedInstanceState) {
        super.onViewCreated(view, savedInstanceState);

        authManager = new AuthManager(requireContext());
        patientId = authManager.getUserId();

        initializeViews(view);
        loadUserData();
        setupClickListeners();

        // ✅ Only load bookings on initial creation
        loadBookings();
    }

    /**
     * Initialize all UI components
     */
    private void initializeViews(View view) {
        // Welcome card components
        ivWelcomeProfilePhoto = view.findViewById(R.id.ivWelcomeProfilePhoto);
        ivWelcomeBackground = view.findViewById(R.id.ivWelcomeBackground);
        tvUserName = view.findViewById(R.id.tvUserName);

        // Navigation cards
        cardCariDokter = view.findViewById(R.id.cardCariDokter);
        cardScanQR = view.findViewById(R.id.cardScanQR);
        cardHistory = view.findViewById(R.id.cardHistory);
        cardProfile = view.findViewById(R.id.cardProfile);

        // Action buttons
        btnEmergency = view.findViewById(R.id.btnEmergency);
        btnAppointment = view.findViewById(R.id.btnAppointment);
        btnRefreshBooking = view.findViewById(R.id.btnRefreshBooking);

        // Booking section
        loadingBooking = view.findViewById(R.id.loadingBooking);
        emptyBooking = view.findViewById(R.id.emptyBooking);
        bookingContainer = view.findViewById(R.id.bookingContainer);
    }

    /**
     * Load user profile data from Supabase
     * Fetches name and avatar URL
     */
    private void loadUserData() {
        Log.d(TAG, "=== LOADING USER DATA ===");
        Log.d(TAG, "Patient ID: " + patientId);

        // ✅ Get both name AND avatar_url
        String params = "nama,avatar_url&id_pasien=eq." + patientId;
        Log.d(TAG, "Query params: " + params);

        supabaseHelper.select(requireContext(), "pasien", params,
                authManager.getAccessToken(),
                new supabaseHelper.SupabaseCallback() {
                    @Override
                    public void onSuccess(String response) {
                        Log.d(TAG, "=== USER DATA API SUCCESS ===");
                        Log.d(TAG, "Raw Response: " + response);

                        try {
                            JSONArray jsonArray = new JSONArray(response);
                            Log.d(TAG, "Response Array Length: " + jsonArray.length());

                            if (jsonArray.length() > 0) {
                                JSONObject userData = jsonArray.getJSONObject(0);
                                Log.d(TAG, "User Data Object: " + userData.toString(2)); // Pretty print

                                String name = userData.optString("nama", "Pengguna");
                                String avatarUrl = userData.optString("avatar_url", null);

                                Log.d(TAG, "Parsed - Name: " + name);
                                Log.d(TAG, "Parsed - Avatar URL: " + avatarUrl);
                                Log.d(TAG, "Avatar URL is null: " + (avatarUrl == null));
                                Log.d(TAG, "Avatar URL is empty: " + (avatarUrl != null && avatarUrl.trim().isEmpty()));

                                requireActivity().runOnUiThread(() -> {
                                    tvUserName.setText(name);
                                    Log.d(TAG, "✅ User name set to TextView: " + name);

                                    loadWelcomeAvatar(avatarUrl);
                                });
                            } else {
                                Log.w(TAG, "⚠️ No user data found in response");
                                Log.w(TAG, "Empty array returned");
                            }

                        } catch (Exception e) {
                            Log.e(TAG, "=== ERROR PARSING USER DATA ===");
                            Log.e(TAG, "Exception: " + e.getMessage());
                            Log.e(TAG, "Response that caused error: " + response);
                            e.printStackTrace();
                        }
                    }

                    @Override
                    public void onError(String error) {
                        Log.e(TAG, "=== USER DATA API ERROR ===");
                        Log.e(TAG, "Error message: " + error);
                    }
                });
    }

    /**
     * Loads welcome card avatar with blur background effect
     * Think of it like: Photo booth with blurred backdrop! 📸
     * - Sharp circular photo in front
     * - Blurred version as background (frosted glass)
     */
    private void loadWelcomeAvatar(String avatarUrl) {
        if (avatarUrl == null || avatarUrl.trim().isEmpty() || avatarUrl.equals("null")) {
            Log.d(TAG, "⚠️ No avatar URL, using default icon");

            // Set default icon
            ivWelcomeProfilePhoto.setImageResource(R.drawable.ic_person_circle);
            ivWelcomeProfilePhoto.setImageTintList(
                    android.content.res.ColorStateList.valueOf(
                            getResources().getColor(R.color.primary_color)
                    )
            );

            // Hide blurred background
            ivWelcomeBackground.setVisibility(View.GONE);
            return;
        }

        Log.d(TAG, "📸 Loading welcome avatar: " + avatarUrl);

        // Remove tint for actual photos
        ivWelcomeProfilePhoto.setImageTintList(null);

        // ✅ Load SHARP circular photo
        Glide.with(this)
                .load(avatarUrl)
                .circleCrop()
                .placeholder(R.drawable.ic_person_circle)
                .error(R.drawable.ic_person_circle)
                .into(ivWelcomeProfilePhoto);

        // ✅ Load BLURRED background (frosted glass effect!)
        Glide.with(this)
                .load(avatarUrl)
                .transform(
                        new CenterCrop(),
                        new BlurTransformation(25, 3)  // blur radius: 25, sampling: 3
                )
                .into(ivWelcomeBackground);

        // Show the blurred background
        ivWelcomeBackground.setVisibility(View.VISIBLE);

        Log.d(TAG, "✅ Welcome avatar loaded with blur effect");
    }

    /**
     * Setup click listeners for all interactive elements
     */
    private void setupClickListeners() {
        MainActivity mainActivity = (MainActivity) getActivity();

        cardCariDokter.setOnClickListener(v -> {
            if (mainActivity != null) {
                mainActivity.navigateToSection("findDoctor");
            }
        });

        cardHistory.setOnClickListener(v -> {
            if (mainActivity != null) {
                mainActivity.navigateToSection("history");
            }
        });

        cardProfile.setOnClickListener(v -> {
            if (mainActivity != null) {
                mainActivity.navigateToSection("profile");
            }
        });

        cardScanQR.setOnClickListener(v -> openQRScanner());
        btnEmergency.setOnClickListener(v -> handleEmergency());
        btnAppointment.setOnClickListener(v -> createAppointment());
        btnRefreshBooking.setOnClickListener(v -> loadBookings());
    }

    /**
     * Load bookings from Supabase with blockchain filtering
     */
    private void loadBookings() {
        // ✅ Prevent duplicate loading - like a traffic light!
        if (isLoadingBookings) {
            Log.d(TAG, "⚠️ Already loading bookings, skipping duplicate call");
            return;
        }

        isLoadingBookings = true;
        Log.d(TAG, "=== LOADING BOOKINGS ===");
        Log.d(TAG, "Patient ID: " + patientId);
        Log.d(TAG, "Access Token: " + (authManager.getAccessToken() != null ? "Present" : "NULL"));

        // Show loading state
        loadingBooking.setVisibility(View.VISIBLE);
        emptyBooking.setVisibility(View.GONE);
        bookingContainer.setVisibility(View.GONE);
        bookingContainer.removeAllViews();

        String table = "antrian";

        // Get all records for this patient, sorted by queue number then newest first
        String params = "*,dokter:id_dokter(nama_lengkap)" +
                "&id_pasien=eq." + patientId +
                "&order=no_antrian,created_at.desc" +
                "&limit=100";

        Log.d(TAG, "Table: " + table);
        Log.d(TAG, "Query params: " + params);

        supabaseHelper.select(requireContext(), table, params, authManager.getAccessToken(),
                new supabaseHelper.SupabaseCallback() {
                    @Override
                    public void onSuccess(String response) {
                        Log.d(TAG, "=== BOOKINGS API SUCCESS ===");
                        Log.d(TAG, "Raw bookings response: " + response);
                        Log.d(TAG, "Response length: " + response.length());

                        requireActivity().runOnUiThread(() -> {
                            try {
                                JSONArray allBookings = new JSONArray(response);
                                Log.d(TAG, "Total bookings in response: " + allBookings.length());

                                // Log each booking before filtering
                                for (int i = 0; i < allBookings.length(); i++) {
                                    JSONObject booking = allBookings.getJSONObject(i);
                                    Log.d(TAG, "Booking " + i + ": " + booking.toString(2));
                                    Log.d(TAG, "  - Queue: " + booking.optString("no_antrian"));
                                    Log.d(TAG, "  - Status: " + booking.optString("status_antrian"));
                                    Log.d(TAG, "  - Deleted: " + booking.optInt("is_deleted"));
                                    Log.d(TAG, "  - Created: " + booking.optString("created_at"));
                                }

                                // Apply blockchain + status filtering
                                JSONArray filteredBookings = filterActiveBookings(allBookings);
                                Log.d(TAG, "After filtering: " + filteredBookings.length() + " active bookings");

                                loadingBooking.setVisibility(View.GONE);

                                if (filteredBookings.length() == 0) {
                                    Log.d(TAG, "No active bookings to display");
                                    emptyBooking.setVisibility(View.VISIBLE);
                                    bookingContainer.setVisibility(View.GONE);
                                } else {
                                    Log.d(TAG, "Displaying bookings...");
                                    emptyBooking.setVisibility(View.GONE);
                                    bookingContainer.setVisibility(View.VISIBLE);

                                    // Limit to 10 most recent
                                    int limit = Math.min(10, filteredBookings.length());
                                    Log.d(TAG, "Will display " + limit + " bookings (limit: 10)");

                                    for (int i = 0; i < limit; i++) {
                                        JSONObject booking = filteredBookings.getJSONObject(i);
                                        Log.d(TAG, "Adding booking card " + (i + 1) + "/" + limit);
                                        addBookingCard(booking);
                                    }

                                    Log.d(TAG, "✅ Successfully displayed " + limit + " active bookings");
                                }

                            } catch (Exception e) {
                                Log.e(TAG, "=== ERROR PARSING BOOKINGS ===");
                                Log.e(TAG, "Exception: " + e.getMessage());
                                Log.e(TAG, "Response that caused error: " + response);
                                e.printStackTrace();
                                showError("Gagal memuat data booking");
                            } finally {
                                // ✅ Allow loading again
                                isLoadingBookings = false;
                                Log.d(TAG, "Loading flag reset");
                            }
                        });
                    }

                    @Override
                    public void onError(String error) {
                        Log.e(TAG, "=== BOOKINGS API ERROR ===");
                        Log.e(TAG, "Error message: " + error);

                        requireActivity().runOnUiThread(() -> {
                            loadingBooking.setVisibility(View.GONE);
                            showError("Gagal memuat booking: " + error);

                            // ✅ Allow loading again even on error
                            isLoadingBookings = false;
                            Log.d(TAG, "Loading flag reset (error case)");
                        });
                    }
                });
    }

    /**
     * Filter blockchain records - get only LATEST + ACTIVE bookings
     * Think of it like: Git history - only show the latest commit for each branch
     */
    private JSONArray filterActiveBookings(JSONArray allBookings) {
        Log.d(TAG, "=== FILTERING BOOKINGS ===");
        Log.d(TAG, "Input bookings count: " + allBookings.length());

        try {
            JSONArray filtered = new JSONArray();
            HashMap<String, JSONObject> latestByQueue = new HashMap<>();

            // Step 1: Get the LATEST record for each no_antrian
            Log.d(TAG, "Step 1: Finding latest record for each queue number");

            for (int i = 0; i < allBookings.length(); i++) {
                JSONObject booking = allBookings.getJSONObject(i);
                String queueNumber = booking.optString("no_antrian", "");

                if (queueNumber.isEmpty()) {
                    Log.w(TAG, "Skipping booking with empty queue number at index " + i);
                    continue; // Skip invalid queue numbers
                }

                // ✅ Always keep the newest record (compare created_at)
                if (!latestByQueue.containsKey(queueNumber)) {
                    latestByQueue.put(queueNumber, booking);
                    Log.d(TAG, "  First entry for " + queueNumber +
                            " | Status: " + booking.optString("status_antrian") +
                            " | Created: " + booking.optString("created_at"));
                } else {
                    // Compare dates to ensure we have the latest
                    String currentDate = latestByQueue.get(queueNumber).optString("created_at", "");
                    String newDate = booking.optString("created_at", "");

                    Log.d(TAG, "  Comparing " + queueNumber +
                            " | Current: " + currentDate +
                            " | New: " + newDate);

                    if (newDate.compareTo(currentDate) > 0) {
                        latestByQueue.put(queueNumber, booking);
                        Log.d(TAG, "  ✅ Updated to newer record for " + queueNumber +
                                " | Status: " + booking.optString("status_antrian"));
                    } else {
                        Log.d(TAG, "  ⏭️ Keeping older record (newer already exists)");
                    }
                }
            }

            Log.d(TAG, "Latest records found: " + latestByQueue.size());

            // Step 2: Filter by is_deleted and status
            Log.d(TAG, "Step 2: Filtering by is_deleted and status");

            int shownCount = 0;
            int hiddenCount = 0;

            for (JSONObject latest : latestByQueue.values()) {
                int isDeleted = latest.optInt("is_deleted", 0);
                String status = latest.optString("status_antrian", "");
                String queueNum = latest.optString("no_antrian", "");

                // Only show if: NOT deleted AND status is acceptable
                boolean shouldShow = (isDeleted == 0) && isStatusVisible(status);

                if (shouldShow) {
                    filtered.put(latest);
                    shownCount++;
                    Log.d(TAG, "  ✅ SHOWING: " + queueNum +
                            " | Status: " + status +
                            " | Deleted: " + isDeleted);
                } else {
                    hiddenCount++;
                    Log.d(TAG, "  ❌ HIDING: " + queueNum +
                            " | Status: " + status +
                            " | Deleted: " + isDeleted +
                            " | Reason: " + (isDeleted == 1 ? "Deleted" : "Status not visible"));
                }
            }

            Log.d(TAG, "=== FILTERING COMPLETE ===");
            Log.d(TAG, "Total processed: " + latestByQueue.size());
            Log.d(TAG, "Shown: " + shownCount);
            Log.d(TAG, "Hidden: " + hiddenCount);
            Log.d(TAG, "Final filtered count: " + filtered.length());

            return filtered;

        } catch (Exception e) {
            Log.e(TAG, "=== ERROR FILTERING BOOKINGS ===");
            Log.e(TAG, "Exception: " + e.getMessage());
            e.printStackTrace();
            return new JSONArray();
        }
    }

    /**
     * Define which statuses should be visible
     */
    private boolean isStatusVisible(String status) {
        boolean visible;

        switch (status) {
            case "Belum Periksa":
                visible = true;
                Log.d(TAG, "Status '" + status + "' is VISIBLE");
                break;

            // Hide these statuses
            case "Di Terima":
            case "Sedang Diperiksa":
            case "Selesai":
                visible = false;
                Log.d(TAG, "Status '" + status + "' is HIDDEN");
                break;

            default:
                visible = false;
                Log.w(TAG, "⚠️ Unknown status: '" + status + "' - treating as HIDDEN");
                break;
        }

        return visible;
    }

    /**
     * Add a booking card to the container
     */
    private void addBookingCard(JSONObject booking) {
        try {
            Log.d(TAG, "=== ADDING BOOKING CARD ===");
            Log.d(TAG, "Booking data: " + booking.toString(2));

            View bookingCard = LayoutInflater.from(requireContext())
                    .inflate(R.layout.item_booking_card, bookingContainer, false);

            TextView tvDoctorName = bookingCard.findViewById(R.id.tvDoctorNameBooking);
            TextView tvQueueNumber = bookingCard.findViewById(R.id.tvQueueNumber);
            TextView tvStatus = bookingCard.findViewById(R.id.tvStatusBooking);
            TextView tvDate = bookingCard.findViewById(R.id.tvDateBooking);
            TextView tvTime = bookingCard.findViewById(R.id.tvTimeBooking);

            // Get doctor name from nested object
            JSONObject dokter = booking.optJSONObject("dokter");
            String doctorName = dokter != null ? dokter.optString("nama_lengkap", "Dokter") : "Dokter";
            Log.d(TAG, "Doctor object: " + (dokter != null ? dokter.toString() : "null"));
            Log.d(TAG, "Doctor name: " + doctorName);

            String queueNumber = booking.optString("no_antrian", "-");
            String status = booking.optString("status_antrian", "Belum Periksa");
            String dateStr = booking.optString("tanggal_antrian", "");
            String timeStr = booking.optString("jam_antrian", "");

            Log.d(TAG, "Card data:");
            Log.d(TAG, "  - Queue: " + queueNumber);
            Log.d(TAG, "  - Status: " + status);
            Log.d(TAG, "  - Date: " + dateStr);
            Log.d(TAG, "  - Time: " + timeStr);

            tvDoctorName.setText(doctorName);
            tvQueueNumber.setText("No. Antrian: " + queueNumber);
            tvStatus.setText(status);

            // Format date
            String formattedDate = formatDate(dateStr);
            tvDate.setText(formattedDate);
            Log.d(TAG, "  - Formatted date: " + formattedDate);

            // Format time
            tvTime.setText(timeStr);

            // Status color
            int statusColor = getStatusColor(status);
            tvStatus.setBackgroundTintList(android.content.res.ColorStateList.valueOf(statusColor));
            Log.d(TAG, "  - Status color: " + String.format("#%08X", statusColor));

            bookingContainer.addView(bookingCard);
            Log.d(TAG, "✅ Booking card added successfully");

        } catch (Exception e) {
            Log.e(TAG, "=== ERROR ADDING BOOKING CARD ===");
            Log.e(TAG, "Exception: " + e.getMessage());
            Log.e(TAG, "Booking data: " + booking.toString());
            e.printStackTrace();
        }
    }

    /**
     * Format date from yyyy-MM-dd to dd MMM yyyy
     */
    private String formatDate(String dateStr) {
        try {
            SimpleDateFormat inputFormat = new SimpleDateFormat("yyyy-MM-dd", Locale.getDefault());
            SimpleDateFormat outputFormat = new SimpleDateFormat("dd MMM yyyy", Locale.getDefault());
            Date date = inputFormat.parse(dateStr);
            return outputFormat.format(date);
        } catch (Exception e) {
            return dateStr;
        }
    }

    /**
     * Get color for booking status
     */
    private int getStatusColor(String status) {
        switch (status) {
            case "Belum Periksa":
                return 0xFFFF9800; // Orange
            case "Sedang Diperiksa":
                return 0xFF2196F3; // Blue
            case "Selesai":
                return 0xFF4CAF50; // Green
            case "Dibatalkan":
                return 0xFFF44336; // Red
            default:
                return 0xFF9E9E9E; // Gray
        }
    }

    /**
     * Show error toast
     */
    private void showError(String message) {
        Toast.makeText(requireContext(), message, Toast.LENGTH_SHORT).show();
    }

    /**
     * Open QR scanner
     */
    private void openQRScanner() {
        MainActivity mainActivity = (MainActivity) getActivity();
        if (mainActivity != null) {
            mainActivity.findViewById(R.id.fabScanQR).performClick();
        }
    }

    /**
     * Handle emergency call
     */
    private void handleEmergency() {
        new AlertDialog.Builder(requireContext())
                .setTitle("Panggilan Darurat")
                .setMessage("Apakah Anda memerlukan bantuan darurat medis?")
                .setIcon(android.R.drawable.ic_dialog_alert)
                .setPositiveButton("Ya, Hubungi 119", (dialog, which) -> {
                    Toast.makeText(requireContext(), "Menghubungi layanan darurat...", Toast.LENGTH_LONG).show();
                })
                .setNegativeButton("Batal", null)
                .show();
    }

    /**
     * Navigate to appointment creation
     */
    private void createAppointment() {
        MainActivity mainActivity = (MainActivity) getActivity();
        if (mainActivity != null) {
            mainActivity.navigateToSection("findDoctor");
        }
    }

    @Override
    public void onResume() {
        super.onResume();

        // ✅ Skip first resume (happens right after onViewCreated)
        if (isFirstResume) {
            isFirstResume = false;
            Log.d(TAG, "First resume, skipping reload (already loaded in onViewCreated)");
            return;
        }

        // ✅ Refresh data when ACTUALLY returning to dashboard from another screen
        Log.d(TAG, "Returning to dashboard, refreshing data");
        loadUserData();
        loadBookings();
    }
}