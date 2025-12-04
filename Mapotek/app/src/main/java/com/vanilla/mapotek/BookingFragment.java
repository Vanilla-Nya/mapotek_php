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

        Log.d(TAG, "=== BOOKING FRAGMENT CREATED ===");

        initializeViews(view);
        loadArguments();
        setupClickListeners();

        // Get patient ID from AuthManager
        authManager = new AuthManager(requireContext());
        patientId = authManager.getUserId();

        Log.d(TAG, "Fragment initialized:");
        Log.d(TAG, "  Doctor Name: " + doctorName);
        Log.d(TAG, "  Doctor ID: " + doctorId);
        Log.d(TAG, "  Patient ID: " + patientId);
        Log.d(TAG, "  Auth Manager: " + (authManager != null ? "Initialized" : "NULL"));
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
        Log.d(TAG, "=== DATE PICKER OPENED ===");
        Calendar calendar = Calendar.getInstance();

        Log.d(TAG, "Current date: " +
                calendar.get(Calendar.YEAR) + "-" +
                (calendar.get(Calendar.MONTH) + 1) + "-" +
                calendar.get(Calendar.DAY_OF_MONTH));

        DatePickerDialog datePickerDialog = new DatePickerDialog(
                requireContext(),
                (view, year, month, dayOfMonth) -> {
                    Log.d(TAG, "=== DATE SELECTED ===");
                    Log.d(TAG, "Raw values - Year: " + year + ", Month: " + month + ", Day: " + dayOfMonth);

                    Calendar selected = Calendar.getInstance();
                    selected.set(year, month, dayOfMonth);

                    SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd", Locale.getDefault());
                    selectedDate = sdf.format(selected.getTime());

                    Log.d(TAG, "Formatted date (yyyy-MM-dd): " + selectedDate);

                    SimpleDateFormat displayFormat = new SimpleDateFormat("dd MMM yyyy", Locale.getDefault());
                    String displayDate = displayFormat.format(selected.getTime());
                    tvSelectedDate.setText(displayDate);

                    Log.d(TAG, "Display date (dd MMM yyyy): " + displayDate);
                    Log.d(TAG, "UI updated with selected date");

                    // Generate queue number when date is selected
                    Log.d(TAG, "Triggering queue number generation...");
                    generateQueueNumber();
                },
                calendar.get(Calendar.YEAR),
                calendar.get(Calendar.MONTH),
                calendar.get(Calendar.DAY_OF_MONTH)
        );

        // Don't allow past dates
        long minDate = System.currentTimeMillis();
        datePickerDialog.getDatePicker().setMinDate(minDate);
        Log.d(TAG, "Min date set to: " + new SimpleDateFormat("yyyy-MM-dd", Locale.getDefault()).format(minDate));

        datePickerDialog.show();
        Log.d(TAG, "Date picker dialog shown");
    }

    private void showTimePicker() {
        Log.d(TAG, "=== TIME PICKER OPENED ===");
        Calendar calendar = Calendar.getInstance();

        int currentHour = calendar.get(Calendar.HOUR_OF_DAY);
        int currentMinute = calendar.get(Calendar.MINUTE);

        Log.d(TAG, "Current time: " + currentHour + ":" + currentMinute);

        TimePickerDialog timePickerDialog = new TimePickerDialog(
                requireContext(),
                (view, hourOfDay, minute) -> {
                    Log.d(TAG, "=== TIME SELECTED ===");
                    Log.d(TAG, "Raw values - Hour: " + hourOfDay + ", Minute: " + minute);

                    selectedTime = String.format(Locale.getDefault(), "%02d:%02d", hourOfDay, minute);

                    Log.d(TAG, "Formatted time (HH:mm): " + selectedTime);

                    tvSelectedTime.setText(selectedTime);
                    Log.d(TAG, "UI updated with selected time");
                },
                currentHour,
                currentMinute,
                true // 24-hour format
        );

        Log.d(TAG, "Time picker format: 24-hour");
        timePickerDialog.show();
        Log.d(TAG, "Time picker dialog shown");
    }

    private void generateQueueNumber() {
        Log.d(TAG, "=== GENERATING QUEUE NUMBER ===");
        Log.d(TAG, "Selected Date: " + selectedDate);

        // Show loading
        tvQueueNumber.setText("Generating...");

        String accessToken = authManager.getAccessToken();
        Log.d(TAG, "Access Token: " + (accessToken != null ? "Present" : "NULL"));

        // Step 1: Get last queue number for today
        String today = selectedDate; // "2025-10-10"
        String table = "antrian";
        String params = "no_antrian&tanggal_antrian=eq." + today + "&order=created_at.desc&limit=1";

        Log.d(TAG, "API Request:");
        Log.d(TAG, "  Table: " + table);
        Log.d(TAG, "  Params: " + params);
        Log.d(TAG, "  Query: Get last queue number for date: " + today);

        supabaseHelper.select(requireContext(), table, params, accessToken,
                new supabaseHelper.SupabaseCallback() {
                    @Override
                    public void onSuccess(String response) {
                        Log.d(TAG, "=== QUEUE NUMBER API SUCCESS ===");
                        Log.d(TAG, "Raw Response: " + response);
                        Log.d(TAG, "Response Length: " + response.length());

                        try {
                            String lastQueueNumber = null;

                            // Parse response
                            JSONArray jsonArray = new JSONArray(response);
                            Log.d(TAG, "Response Array Length: " + jsonArray.length());

                            if (jsonArray.length() > 0) {
                                JSONObject lastRecord = jsonArray.getJSONObject(0);
                                Log.d(TAG, "Last Record: " + lastRecord.toString(2));

                                lastQueueNumber = lastRecord.optString("no_antrian");
                                Log.d(TAG, "Last Queue Number Found: " + lastQueueNumber);
                            } else {
                                Log.d(TAG, "⚠️ No queue found for today - will be first!");
                                Log.d(TAG, "This will generate Q001");
                            }

                            // Generate new queue number
                            Log.d(TAG, "Calling QueueNumberGenerator.generateFromLast()");
                            Log.d(TAG, "  Input: " + lastQueueNumber);

                            queueNumber = QueueNumberGenerator.generateFromLast(lastQueueNumber);

                            Log.d(TAG, "✅ Generated Queue Number: " + queueNumber);
                            Log.d(TAG, "Format: Q + 3-digit counter");

                            requireActivity().runOnUiThread(() -> {
                                tvQueueNumber.setText("No. Antrian: " + queueNumber);
                                Log.d(TAG, "UI Updated - Queue number displayed");

                                Toast.makeText(requireContext(),
                                        "Queue number: " + queueNumber,
                                        Toast.LENGTH_SHORT).show();
                            });

                        } catch (Exception e) {
                            Log.e(TAG, "=== ERROR GENERATING QUEUE ===");
                            Log.e(TAG, "Exception: " + e.getMessage());
                            Log.e(TAG, "Response that caused error: " + response);
                            e.printStackTrace();

                            requireActivity().runOnUiThread(() -> {
                                Toast.makeText(requireContext(),
                                        "Error: " + e.getMessage(),
                                        Toast.LENGTH_LONG).show();
                            });
                        }
                    }

                    @Override
                    public void onError(String error) {
                        Log.e(TAG, "=== QUEUE NUMBER API ERROR ===");
                        Log.e(TAG, "Error Message: " + error);
                        Log.e(TAG, "Falling back to Q001");

                        // If error, just generate with counter 1
                        queueNumber = QueueNumberGenerator.generateFromLast(null);
                        Log.d(TAG, "Fallback Queue Number: " + queueNumber);

                        requireActivity().runOnUiThread(() -> {
                            tvQueueNumber.setText("No. Antrian: " + queueNumber);
                            Log.d(TAG, "UI Updated with fallback queue number");
                        });
                    }
                });
    }

    private void submitBooking() {
        Log.d(TAG, "=== SUBMIT BOOKING CLICKED ===");

        // Validate all fields
        Log.d(TAG, "Validating fields...");
        Log.d(TAG, "  Selected Date: " + selectedDate);
        Log.d(TAG, "  Selected Time: " + selectedTime);
        Log.d(TAG, "  Queue Number: " + queueNumber);
        Log.d(TAG, "  Doctor ID: " + doctorId);
        Log.d(TAG, "  Patient ID: " + patientId);

        if (selectedDate == null || selectedDate.isEmpty()) {
            Log.w(TAG, "❌ Validation failed: Date is empty");
            Toast.makeText(requireContext(), "Pilih tanggal terlebih dahulu", Toast.LENGTH_SHORT).show();
            return;
        }

        if (selectedTime == null || selectedTime.isEmpty()) {
            Log.w(TAG, "❌ Validation failed: Time is empty");
            Toast.makeText(requireContext(), "Pilih jam terlebih dahulu", Toast.LENGTH_SHORT).show();
            return;
        }

        if (queueNumber == null || queueNumber.isEmpty()) {
            Log.w(TAG, "❌ Validation failed: Queue number is empty");
            Toast.makeText(requireContext(), "Nomor antrian belum tersedia", Toast.LENGTH_SHORT).show();
            return;
        }

        Log.d(TAG, "✅ All validations passed");

        try {
            // Generate UUID for id_antrian
            String uniqueId = java.util.UUID.randomUUID().toString();
            Log.d(TAG, "Generated UUID: " + uniqueId);

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

            Log.d(TAG, "=== BOOKING DATA ===");
            Log.d(TAG, bookingData.toString(2)); // Pretty print
            Log.d(TAG, "Field breakdown:");
            Log.d(TAG, "  id_antrian: " + uniqueId);
            Log.d(TAG, "  no_antrian: " + queueNumber);
            Log.d(TAG, "  id_pasien: " + patientId);
            Log.d(TAG, "  id_dokter: " + doctorId);
            Log.d(TAG, "  tanggal_antrian: " + selectedDate);
            Log.d(TAG, "  jam_antrian: " + selectedTime);
            Log.d(TAG, "  jenis_pasien: UMUM");
            Log.d(TAG, "  status_antrian: Belum Periksa");

            // Insert directly to Supabase (blockchain trigger will still fire!)
            String table = "antrian";
            String accessToken = authManager.getAccessToken();

            Log.d(TAG, "=== API INSERT REQUEST ===");
            Log.d(TAG, "Table: " + table);
            Log.d(TAG, "Access Token: " + (accessToken != null ? "Present" : "NULL"));
            Log.d(TAG, "Blockchain trigger will fire automatically");

            supabaseHelper.insert(requireContext(), table, bookingData, accessToken,
                    new supabaseHelper.SupabaseCallback() {
                        @Override
                        public void onSuccess(String response) {
                            Log.d(TAG, "=== BOOKING API SUCCESS ===");
                            Log.d(TAG, "Raw Response: " + response);
                            Log.d(TAG, "Response Length: " + response.length());

                            try {
                                // Try to parse response
                                JSONArray responseArray = new JSONArray(response);
                                if (responseArray.length() > 0) {
                                    JSONObject insertedData = responseArray.getJSONObject(0);
                                    Log.d(TAG, "Inserted Data: " + insertedData.toString(2));
                                }
                            } catch (Exception e) {
                                Log.d(TAG, "Response is not JSON array (might be success message)");
                            }

                            Log.d(TAG, "✅ Booking created successfully!");
                            Log.d(TAG, "Queue Number: " + queueNumber);
                            Log.d(TAG, "Date: " + selectedDate);
                            Log.d(TAG, "Time: " + selectedTime);

                            requireActivity().runOnUiThread(() -> {
                                Toast.makeText(requireContext(),
                                        "Booking berhasil! No. Antrian: " + queueNumber,
                                        Toast.LENGTH_LONG).show();

                                Log.d(TAG, "Navigating back to previous screen");
                                // Go back to previous screen
                                requireActivity().getSupportFragmentManager().popBackStack();
                            });
                        }

                        @Override
                        public void onError(String error) {
                            Log.e(TAG, "=== BOOKING API ERROR ===");
                            Log.e(TAG, "Error Message: " + error);
                            Log.e(TAG, "Booking Data: " + bookingData.toString());
                            Log.e(TAG, "❌ Booking failed");

                            requireActivity().runOnUiThread(() -> {
                                Toast.makeText(requireContext(),
                                        "Gagal membuat booking: " + error,
                                        Toast.LENGTH_LONG).show();
                            });
                        }
                    });

        } catch (Exception e) {
            Log.e(TAG, "=== ERROR CREATING BOOKING DATA ===");
            Log.e(TAG, "Exception: " + e.getMessage());
            Log.e(TAG, "Stack Trace:");
            e.printStackTrace();

            Toast.makeText(requireContext(), "Error: " + e.getMessage(), Toast.LENGTH_SHORT).show();
        }
    }
}