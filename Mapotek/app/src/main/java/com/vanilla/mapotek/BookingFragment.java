package com.vanilla.mapotek;

import android.app.DatePickerDialog;
import android.app.TimePickerDialog;
import android.os.Bundle;
import android.util.Log;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.TextView;
import android.widget.Toast;
import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import androidx.fragment.app.Fragment;
import com.google.android.material.button.MaterialButton;
import com.vanilla.mapotek.auth.AuthManager;
import com.vanilla.mapotek.database.supabaseHelper;
import com.vanilla.mapotek.network.apiclient;
import com.vanilla.mapotek.utils.QueueNumberGenerator;

import org.json.JSONArray;
import org.json.JSONObject;
import java.text.SimpleDateFormat;
import java.util.Calendar;
import java.util.Locale;

public class BookingFragment extends Fragment {
    private static final String TAG = "BookingFragment";

    private TextView tvDoctorName;
    private TextView tvSelectedDate;
    private TextView tvSelectedTime;
    private TextView tvQueueNumber;
    private MaterialButton btnSelectDate;
    private MaterialButton btnSelectTime;
    private MaterialButton btnSubmit;

    private String doctorId;
    private String doctorName;
    private String patientId;
    private String selectedDate;
    private String selectedTime;
    private String queueNumber;

    private AuthManager authManager;

    public static BookingFragment newInstance(String doctorId, String doctorName) {
        BookingFragment fragment = new BookingFragment();
        Bundle args = new Bundle();
        args.putString("doctor_id", doctorId);
        args.putString("doctor_name", doctorName);
        fragment.setArguments(args);
        return fragment;
    }

    @Nullable
    @Override
    public View onCreateView(@NonNull LayoutInflater inflater, @Nullable ViewGroup container,
                             @Nullable Bundle savedInstanceState) {
        return inflater.inflate(R.layout.fragment_booking, container, false);
    }

    @Override
    public void onViewCreated(@NonNull View view, @Nullable Bundle savedInstanceState) {
        super.onViewCreated(view, savedInstanceState);

        initializeViews(view);
        loadArguments();
        setupClickListeners();

        // Get patient ID from AuthManager
        authManager = new AuthManager(requireContext());
        patientId = authManager.getUserId();

        Log.d(TAG, "Booking for doctor: " + doctorName + " (" + doctorId + ")");
        Log.d(TAG, "Patient ID: " + patientId);
    }

    private void initializeViews(View view) {
        tvDoctorName = view.findViewById(R.id.tvDoctorName);
        tvSelectedDate = view.findViewById(R.id.tvSelectedDate);
        tvSelectedTime = view.findViewById(R.id.tvSelectedTime);
        tvQueueNumber = view.findViewById(R.id.tvQueueNumber);
        btnSelectDate = view.findViewById(R.id.btnSelectDate);
        btnSelectTime = view.findViewById(R.id.btnSelectTime);
        btnSubmit = view.findViewById(R.id.btnSubmit);
    }

    private void loadArguments() {
        if (getArguments() != null) {
            doctorId = getArguments().getString("doctor_id");
            doctorName = getArguments().getString("doctor_name");
            tvDoctorName.setText("Booking dengan: " + doctorName);
        }
    }

    private void setupClickListeners() {
        btnSelectDate.setOnClickListener(v -> showDatePicker());
        btnSelectTime.setOnClickListener(v -> showTimePicker());
        btnSubmit.setOnClickListener(v -> submitBooking());
    }

    private void showDatePicker() {
        Calendar calendar = Calendar.getInstance();

        DatePickerDialog datePickerDialog = new DatePickerDialog(
                requireContext(),
                (view, year, month, dayOfMonth) -> {
                    Calendar selected = Calendar.getInstance();
                    selected.set(year, month, dayOfMonth);

                    SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd", Locale.getDefault());
                    selectedDate = sdf.format(selected.getTime());

                    SimpleDateFormat displayFormat = new SimpleDateFormat("dd MMM yyyy", Locale.getDefault());
                    tvSelectedDate.setText(displayFormat.format(selected.getTime()));

                    // Generate queue number when date is selected
                    generateQueueNumber();
                },
                calendar.get(Calendar.YEAR),
                calendar.get(Calendar.MONTH),
                calendar.get(Calendar.DAY_OF_MONTH)
        );

        // Don't allow past dates
        datePickerDialog.getDatePicker().setMinDate(System.currentTimeMillis());
        datePickerDialog.show();
    }

    private void showTimePicker() {
        Calendar calendar = Calendar.getInstance();

        TimePickerDialog timePickerDialog = new TimePickerDialog(
                requireContext(),
                (view, hourOfDay, minute) -> {
                    selectedTime = String.format(Locale.getDefault(), "%02d:%02d", hourOfDay, minute);
                    tvSelectedTime.setText(selectedTime);
                },
                calendar.get(Calendar.HOUR_OF_DAY),
                calendar.get(Calendar.MINUTE),
                true // 24-hour format
        );

        timePickerDialog.show();
    }

    private void generateQueueNumber() {
        // Show loading
        tvQueueNumber.setText("Generating...");

        String accessToken = authManager.getAccessToken();

        // Step 1: Get last queue number for today
        String today = selectedDate; // "2025-10-10"
        String table = "antrian";
        String params = "no_antrian&tanggal_antrian=eq." + today + "&order=created_at.desc&limit=1";

        Log.d(TAG, "Getting last queue number for: " + today);

        supabaseHelper.select(requireContext(), table, params, accessToken,
                new supabaseHelper.SupabaseCallback() {
                    @Override
                    public void onSuccess(String response) {
                        Log.d(TAG, "Last queue response: " + response);

                        try {
                            String lastQueueNumber = null;

                            // Parse response
                            JSONArray jsonArray = new JSONArray(response);
                            if (jsonArray.length() > 0) {
                                JSONObject lastRecord = jsonArray.getJSONObject(0);
                                lastQueueNumber = lastRecord.optString("no_antrian");
                                Log.d(TAG, "Last queue number: " + lastQueueNumber);
                            } else {
                                Log.d(TAG, "No queue found for today - will be first!");
                            }

                            // Generate new queue number
                            queueNumber = QueueNumberGenerator.generateFromLast(lastQueueNumber);

                            Log.d(TAG, "✅ Generated queue number: " + queueNumber);

                            requireActivity().runOnUiThread(() -> {
                                tvQueueNumber.setText("No. Antrian: " + queueNumber);
                                Toast.makeText(requireContext(),
                                        "Queue number: " + queueNumber,
                                        Toast.LENGTH_SHORT).show();
                            });

                        } catch (Exception e) {
                            Log.e(TAG, "Error generating queue: " + e.getMessage());
                            requireActivity().runOnUiThread(() -> {
                                Toast.makeText(requireContext(),
                                        "Error: " + e.getMessage(),
                                        Toast.LENGTH_LONG).show();
                            });
                        }
                    }

                    @Override
                    public void onError(String error) {
                        Log.e(TAG, "Error getting last queue: " + error);

                        // If error, just generate with counter 1
                        queueNumber = QueueNumberGenerator.generateFromLast(null);

                        requireActivity().runOnUiThread(() -> {
                            tvQueueNumber.setText("No. Antrian: " + queueNumber);
                        });
                    }
                });
    }

    private void submitBooking() {
        // Validate all fields
        if (selectedDate == null || selectedDate.isEmpty()) {
            Toast.makeText(requireContext(), "Pilih tanggal terlebih dahulu", Toast.LENGTH_SHORT).show();
            return;
        }

        if (selectedTime == null || selectedTime.isEmpty()) {
            Toast.makeText(requireContext(), "Pilih jam terlebih dahulu", Toast.LENGTH_SHORT).show();
            return;
        }

        if (queueNumber == null || queueNumber.isEmpty()) {
            Toast.makeText(requireContext(), "Nomor antrian belum tersedia", Toast.LENGTH_SHORT).show();
            return;
        }

        try {
            // Generate UUID for id_antrian
            String uniqueId = java.util.UUID.randomUUID().toString();

            // Create booking data
            JSONObject bookingData = new JSONObject();
            bookingData.put("id_antrian", uniqueId);              // ← UUID for database ID
            bookingData.put("no_antrian", queueNumber);           // ← Queue number for display
            bookingData.put("id_pasien", patientId);
            bookingData.put("id_dokter", doctorId);
            bookingData.put("tanggal_antrian", selectedDate);
            bookingData.put("jam_antrian", selectedTime);
            bookingData.put("jenis_pasien", "UMUM");
            bookingData.put("status_antrian", "Belum Periksa");

            Log.d(TAG, "Submitting booking: " + bookingData.toString());

            // Insert directly to Supabase (blockchain trigger will still fire!)
            String table = "antrian";
            String accessToken = authManager.getAccessToken();

            supabaseHelper.insert(requireContext(), table, bookingData, accessToken,
                    new supabaseHelper.SupabaseCallback() {
                        @Override
                        public void onSuccess(String response) {
                            Log.d(TAG, "✅ Booking success: " + response);

                            requireActivity().runOnUiThread(() -> {
                                Toast.makeText(requireContext(),
                                        "Booking berhasil! No. Antrian: " + queueNumber,
                                        Toast.LENGTH_LONG).show();

                                // Go back to previous screen
                                requireActivity().getSupportFragmentManager().popBackStack();
                            });
                        }

                        @Override
                        public void onError(String error) {
                            Log.e(TAG, "❌ Booking error: " + error);

                            requireActivity().runOnUiThread(() -> {
                                Toast.makeText(requireContext(),
                                        "Gagal membuat booking: " + error,
                                        Toast.LENGTH_LONG).show();
                            });
                        }
                    });

        } catch (Exception e) {
            Log.e(TAG, "Error creating booking data: " + e.getMessage());
            Toast.makeText(requireContext(), "Error: " + e.getMessage(), Toast.LENGTH_SHORT).show();
        }
    }
}