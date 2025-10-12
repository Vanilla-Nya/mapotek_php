package com.vanilla.mapotek;

import android.app.AlertDialog;
import android.os.Bundle;
import android.util.Log;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.LinearLayout;
import android.widget.TextView;
import android.widget.Toast;
import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import androidx.cardview.widget.CardView;
import androidx.fragment.app.Fragment;
import com.google.android.material.button.MaterialButton;
import com.google.gson.JsonParser;
import com.vanilla.mapotek.auth.AuthManager;
import com.vanilla.mapotek.database.supabaseHelper;
import org.json.JSONArray;
import org.json.JSONObject;
import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.HashMap;
import java.util.Locale;

public class DashboardFragment extends Fragment {

    private static final String TAG = "DashboardFragment";

    private TextView tvUserName;
    private CardView cardCariDokter, cardScanQR, cardHistory, cardProfile;
    private MaterialButton btnEmergency, btnAppointment, btnRefreshBooking;
    private LinearLayout loadingBooking, emptyBooking, bookingContainer;
    private AuthManager authManager;
    private String patientId;

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
        loadBookings(); // ✅ Load bookings on start
    }

    private void initializeViews(View view) {
        tvUserName = view.findViewById(R.id.tvUserName);
        cardCariDokter = view.findViewById(R.id.cardCariDokter);
        cardScanQR = view.findViewById(R.id.cardScanQR);
        cardHistory = view.findViewById(R.id.cardHistory);
        cardProfile = view.findViewById(R.id.cardProfile);
        btnEmergency = view.findViewById(R.id.btnEmergency);
        btnAppointment = view.findViewById(R.id.btnAppointment);
        btnRefreshBooking = view.findViewById(R.id.btnRefreshBooking);

        loadingBooking = view.findViewById(R.id.loadingBooking);
        emptyBooking = view.findViewById(R.id.emptyBooking);
        bookingContainer = view.findViewById(R.id.bookingContainer);
    }

    private void loadUserData() {
        Bundle args = getArguments();
        if (args != null) {
            supabaseHelper.select(requireContext(), "pasien", "nama", authManager.getAccessToken(),
                    new supabaseHelper.SupabaseCallback() {
                        @Override
                        public void onSuccess(String response) {
                            String result = JsonParser.parseString(response).getAsJsonArray()
                                    .get(0).getAsJsonObject().get("nama").getAsString();
                            requireActivity().runOnUiThread(() -> {
                                tvUserName.setText(result);
                            });
                        }

                        @Override
                        public void onError(String error) {
                            Log.d("Data Name Error", error);
                        }
                    });
        }
    }

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
        btnRefreshBooking.setOnClickListener(v -> loadBookings()); // ✅ Refresh bookings
    }

    private void loadBookings() {
        Log.d(TAG, "Loading bookings for patient: " + patientId);

        // Show loading
        loadingBooking.setVisibility(View.VISIBLE);
        emptyBooking.setVisibility(View.GONE);
        bookingContainer.setVisibility(View.GONE);
        bookingContainer.removeAllViews();

        String table = "antrian";

        // ✅ Get all records for this patient, sorted by no_antrian then newest first
        String params = "*,dokter:id_dokter(nama_lengkap)" +
                "&id_pasien=eq." + patientId +
                "&order=no_antrian,created_at.desc" +
                "&limit=100"; // Get enough to filter

        supabaseHelper.select(requireContext(), table, params, authManager.getAccessToken(),
                new supabaseHelper.SupabaseCallback() {
                    @Override
                    public void onSuccess(String response) {
                        Log.d(TAG, "Raw bookings response: " + response);

                        requireActivity().runOnUiThread(() -> {
                            try {
                                JSONArray allBookings = new JSONArray(response);

                                // ✅ Apply blockchain + status filtering
                                JSONArray filteredBookings = filterActiveBookings(allBookings);

                                loadingBooking.setVisibility(View.GONE);

                                if (filteredBookings.length() == 0) {
                                    emptyBooking.setVisibility(View.VISIBLE);
                                    bookingContainer.setVisibility(View.GONE);
                                } else {
                                    emptyBooking.setVisibility(View.GONE);
                                    bookingContainer.setVisibility(View.VISIBLE);

                                    // Limit to 10 most recent
                                    int limit = Math.min(10, filteredBookings.length());
                                    for (int i = 0; i < limit; i++) {
                                        JSONObject booking = filteredBookings.getJSONObject(i);
                                        addBookingCard(booking);
                                    }

                                    Log.d(TAG, "✅ Displayed " + limit + " active bookings");
                                }

                            } catch (Exception e) {
                                Log.e(TAG, "Error parsing bookings: " + e.getMessage());
                                showError("Gagal memuat data booking");
                            }
                        });
                    }

                    @Override
                    public void onError(String error) {
                        Log.e(TAG, "Error loading bookings: " + error);
                        requireActivity().runOnUiThread(() -> {
                            loadingBooking.setVisibility(View.GONE);
                            showError("Gagal memuat booking: " + error);
                        });
                    }
                });
    }

    // ✅ Filter blockchain records - get only LATEST + ACTIVE bookings
    private JSONArray filterActiveBookings(JSONArray allBookings) {
        try {
            JSONArray filtered = new JSONArray();
            HashMap<String, JSONObject> latestByQueue = new HashMap<>();

            // Step 1: Get the LATEST record for each no_antrian
            for (int i = 0; i < allBookings.length(); i++) {
                JSONObject booking = allBookings.getJSONObject(i);
                String queueNumber = booking.optString("no_antrian", "");

                // If we haven't seen this queue number, or this is newer, save it
                if (!latestByQueue.containsKey(queueNumber)) {
                    latestByQueue.put(queueNumber, booking);
                    Log.d(TAG, "Latest for " + queueNumber + ": " + booking.optString("status_antrian"));
                }
            }

            // Step 2: Filter by is_deleted and status
            for (JSONObject latest : latestByQueue.values()) {
                int isDeleted = latest.optInt("is_deleted", 0);
                String status = latest.optString("status_antrian", "");

                // ✅ ONLY show if: NOT deleted AND status is acceptable
                boolean shouldShow = (isDeleted == 0) && isStatusVisible(status);

                if (shouldShow) {
                    filtered.put(latest);
                    Log.d(TAG, "✅ Showing: " + latest.optString("no_antrian") +
                            " | Status: " + status);
                } else {
                    Log.d(TAG, "❌ Hiding: " + latest.optString("no_antrian") +
                            " | Deleted: " + isDeleted + " | Status: " + status);
                }
            }

            return filtered;

        } catch (Exception e) {
            Log.e(TAG, "Error filtering bookings: " + e.getMessage());
            return new JSONArray();
        }
    }

    // ✅ Define which statuses should be visible
    private boolean isStatusVisible(String status) {
        switch (status) {
            case "Belum Periksa":
                return true;

            // ❌ HIDE these statuses (BEFORE doctor acceptance or cancelled)
            case "Di Terima":           // Accepted by doctor ❌
            case "Sedang Diperiksa":    // Currently being examined ❌
            case "Selesai":             // Completed ❌
                return false;

            default:
                // For unknown statuses, log and hide
                Log.w(TAG, "Unknown status: " + status);
                return false;
        }
    }

    private void addBookingCard(JSONObject booking) {
        try {
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

            tvDoctorName.setText(doctorName);
            tvQueueNumber.setText("No. Antrian: " + booking.optString("no_antrian", "-"));
            tvStatus.setText(booking.optString("status_antrian", "Belum Periksa"));

            // Format date
            String dateStr = booking.optString("tanggal_antrian", "");
            tvDate.setText(formatDate(dateStr));

            // Format time
            String timeStr = booking.optString("jam_antrian", "");
            tvTime.setText(timeStr);

            // Status color
            String status = booking.optString("status_antrian", "");
            int statusColor = getStatusColor(status);
            tvStatus.setBackgroundTintList(android.content.res.ColorStateList.valueOf(statusColor));

            bookingContainer.addView(bookingCard);

        } catch (Exception e) {
            Log.e(TAG, "Error adding booking card: " + e.getMessage());
        }
    }

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

    private void showError(String message) {
        Toast.makeText(requireContext(), message, Toast.LENGTH_SHORT).show();
    }

    private void openQRScanner() {
        MainActivity mainActivity = (MainActivity) getActivity();
        if (mainActivity != null) {
            mainActivity.findViewById(R.id.fabScanQR).performClick();
        }
    }

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

    private void createAppointment() {
        MainActivity mainActivity = (MainActivity) getActivity();
        if (mainActivity != null) {
            mainActivity.navigateToSection("findDoctor");
        }
    }

    @Override
    public void onResume() {
        super.onResume();
        // ✅ Refresh bookings when returning to dashboard
        loadBookings();
    }
}