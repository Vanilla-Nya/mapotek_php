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
    private String doctorWorkingHours; // e.g., "16:00-21:00"

    private int startHour = -1;
    private int startMinute = -1;
    private int endHour = -1;
    private int endMinute = -1;

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

        // Fetch doctor's working hours
        fetchDoctorWorkingHours();
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

    private void fetchDoctorWorkingHours() {
        Log.d(TAG, "=== FETCHING DOCTOR WORKING HOURS ===");

        String accessToken = authManager.getAccessToken();
        String table = "dokter";
        String params = "jam_kerja&id_dokter=eq." + doctorId;

        Log.d(TAG, "Query: " + params);

        supabaseHelper.select(requireContext(), table, params, accessToken,
                new supabaseHelper.SupabaseCallback() {
                    @Override
                    public void onSuccess(String response) {
                        Log.d(TAG, "=== DOCTOR WORKING HOURS SUCCESS ===");
                        Log.d(TAG, "Response: " + response);

                        try {
                            JSONArray jsonArray = new JSONArray(response);
                            if (jsonArray.length() > 0) {
                                JSONObject doctor = jsonArray.getJSONObject(0);
                                doctorWorkingHours = doctor.optString("jam_kerja", "");

                                Log.d(TAG, "Doctor working hours: " + doctorWorkingHours);

                                if (!doctorWorkingHours.isEmpty()) {
                                    parseWorkingHours(doctorWorkingHours);
                                } else {
                                    Log.w(TAG, "No working hours set - allowing any time");
                                    requireActivity().runOnUiThread(() -> {
                                        Toast.makeText(requireContext(),
                                                "Dokter belum mengatur jam kerja, Anda bisa pilih jam kapan saja",
                                                Toast.LENGTH_SHORT).show();
                                    });
                                }
                            }
                        } catch (Exception e) {
                            Log.e(TAG, "Error parsing working hours: " + e.getMessage());
                            e.printStackTrace();
                        }
                    }

                    @Override
                    public void onError(String error) {
                        Log.e(TAG, "=== ERROR FETCHING WORKING HOURS ===");
                        Log.e(TAG, "Error: " + error);

                        requireActivity().runOnUiThread(() -> {
                            Toast.makeText(requireContext(),
                                    "Gagal memuat jam kerja dokter",
                                    Toast.LENGTH_SHORT).show();
                        });
                    }
                });
    }

    private void parseWorkingHours(String workingHours) {
        Log.d(TAG, "=== PARSING WORKING HOURS ===");
        Log.d(TAG, "Input: " + workingHours);

        try {
            // Expected format: "16:00-21:00" or "16.00-21.00"
            String[] parts = workingHours.split("-");

            if (parts.length == 2) {
                // Parse start time
                String[] startParts = parts[0].trim().split("[.:]");
                startHour = Integer.parseInt(startParts[0]);
                startMinute = startParts.length > 1 ? Integer.parseInt(startParts[1]) : 0;

                // Parse end time
                String[] endParts = parts[1].trim().split("[.:]");
                endHour = Integer.parseInt(endParts[0]);
                endMinute = endParts.length > 1 ? Integer.parseInt(endParts[1]) : 0;

                Log.d(TAG, "Parsed working hours:");
                Log.d(TAG, "  Start: " + startHour + ":" + startMinute);
                Log.d(TAG, "  End: " + endHour + ":" + endMinute);

                requireActivity().runOnUiThread(() -> {
                    Toast.makeText(requireContext(),
                            "Jam praktek: " + workingHours,
                            Toast.LENGTH_SHORT).show();
                });
            } else {
                Log.w(TAG, "Invalid working hours format: " + workingHours);
            }
        } catch (Exception e) {
            Log.e(TAG, "Error parsing working hours: " + e.getMessage());
            e.printStackTrace();
        }
    }

    private void showDatePicker() {
        Log.d(TAG, "=== DATE PICKER OPENED ===");
        Calendar calendar = Calendar.getInstance();

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
        Log.d(TAG, "=== TIME PICKER OPENED ===");

        Calendar calendar = Calendar.getInstance();
        int initialHour = calendar.get(Calendar.HOUR_OF_DAY);
        int initialMinute = calendar.get(Calendar.MINUTE);

        // If doctor has set working hours, use those
        if (startHour != -1 && endHour != -1) {
            Log.d(TAG, "Using doctor's working hours: " + startHour + ":" + startMinute + " - " + endHour + ":" + endMinute);
            initialHour = startHour;
            initialMinute = startMinute;
        } else {
            Log.d(TAG, "No working hours set - allowing any time");
        }

        TimePickerDialog timePickerDialog = new TimePickerDialog(
                requireContext(),
                (view, hourOfDay, minute) -> {
                    Log.d(TAG, "=== TIME SELECTED ===");
                    Log.d(TAG, "Selected: " + hourOfDay + ":" + minute);

                    // Only validate if working hours are set
                    if (startHour != -1 && endHour != -1) {
                        if (isTimeWithinWorkingHours(hourOfDay, minute)) {
                            selectedTime = String.format(Locale.getDefault(), "%02d:%02d", hourOfDay, minute);
                            tvSelectedTime.setText(selectedTime);
                            Log.d(TAG, "✅ Time accepted: " + selectedTime);
                        } else {
                            Log.w(TAG, "❌ Time outside working hours");
                            Toast.makeText(requireContext(),
                                    "Waktu harus dalam jam praktek: " + doctorWorkingHours,
                                    Toast.LENGTH_LONG).show();
                            tvSelectedTime.setText("-");
                            selectedTime = null;
                        }
                    } else {
                        // No working hours restriction - accept any time
                        selectedTime = String.format(Locale.getDefault(), "%02d:%02d", hourOfDay, minute);
                        tvSelectedTime.setText(selectedTime);
                        Log.d(TAG, "✅ Time accepted (no restrictions): " + selectedTime);
                    }
                },
                initialHour,
                initialMinute,
                true // 24-hour format
        );

        // Set title based on whether working hours exist
        if (startHour != -1 && endHour != -1) {
            timePickerDialog.setTitle("Pilih jam (Praktek: " + doctorWorkingHours + ")");
        } else {
            timePickerDialog.setTitle("Pilih jam");
        }

        timePickerDialog.show();
    }

    private boolean isTimeWithinWorkingHours(int hour, int minute) {
        // Convert to minutes for easier comparison
        int selectedTimeInMinutes = hour * 60 + minute;
        int startTimeInMinutes = startHour * 60 + startMinute;
        int endTimeInMinutes = endHour * 60 + endMinute;

        boolean isValid = selectedTimeInMinutes >= startTimeInMinutes &&
                selectedTimeInMinutes <= endTimeInMinutes;

        Log.d(TAG, "Time validation:");
        Log.d(TAG, "  Selected: " + selectedTimeInMinutes + " min (" + hour + ":" + minute + ")");
        Log.d(TAG, "  Start: " + startTimeInMinutes + " min");
        Log.d(TAG, "  End: " + endTimeInMinutes + " min");
        Log.d(TAG, "  Valid: " + isValid);

        return isValid;
    }

    private void generateQueueNumber() {
        Log.d(TAG, "=== GENERATING QUEUE NUMBER ===");
        Log.d(TAG, "Selected Date: " + selectedDate);

        tvQueueNumber.setText("Generating...");

        String accessToken = authManager.getAccessToken();
        String today = selectedDate;
        String table = "antrian";
        String params = "no_antrian&tanggal_antrian=eq." + today + "&order=created_at.desc&limit=1";

        Log.d(TAG, "Query: " + params);

        supabaseHelper.select(requireContext(), table, params, accessToken,
                new supabaseHelper.SupabaseCallback() {
                    @Override
                    public void onSuccess(String response) {
                        Log.d(TAG, "=== QUEUE NUMBER API SUCCESS ===");
                        Log.d(TAG, "Response: " + response);

                        try {
                            String lastQueueNumber = null;
                            JSONArray jsonArray = new JSONArray(response);

                            if (jsonArray.length() > 0) {
                                JSONObject lastRecord = jsonArray.getJSONObject(0);
                                lastQueueNumber = lastRecord.optString("no_antrian");
                                Log.d(TAG, "Last queue: " + lastQueueNumber);
                            }

                            queueNumber = QueueNumberGenerator.generateFromLast(lastQueueNumber);
                            Log.d(TAG, "✅ Generated: " + queueNumber);

                            requireActivity().runOnUiThread(() -> {
                                tvQueueNumber.setText("No. Antrian: " + queueNumber);
                                Toast.makeText(requireContext(),
                                        "Queue number: " + queueNumber,
                                        Toast.LENGTH_SHORT).show();
                            });

                        } catch (Exception e) {
                            Log.e(TAG, "Error: " + e.getMessage());
                            e.printStackTrace();
                        }
                    }

                    @Override
                    public void onError(String error) {
                        Log.e(TAG, "=== QUEUE NUMBER API ERROR ===");
                        Log.e(TAG, "Error: " + error);

                        queueNumber = QueueNumberGenerator.generateFromLast(null);

                        requireActivity().runOnUiThread(() -> {
                            tvQueueNumber.setText("No. Antrian: " + queueNumber);
                        });
                    }
                });
    }

    private void submitBooking() {
        Log.d(TAG, "=== SUBMIT BOOKING CLICKED ===");

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

        // Additional validation for working hours (only if set)
        if (startHour != -1 && endHour != -1) {
            String[] timeParts = selectedTime.split(":");
            int hour = Integer.parseInt(timeParts[0]);
            int minute = Integer.parseInt(timeParts[1]);

            if (!isTimeWithinWorkingHours(hour, minute)) {
                Toast.makeText(requireContext(),
                        "Waktu harus dalam jam praktek: " + doctorWorkingHours,
                        Toast.LENGTH_LONG).show();
                return;
            }
        } else {
            Log.d(TAG, "No working hours restriction - accepting any time");
        }

        Log.d(TAG, "✅ All validations passed");

        try {
            String uniqueId = java.util.UUID.randomUUID().toString();

            JSONObject bookingData = new JSONObject();
            bookingData.put("id_antrian", uniqueId);
            bookingData.put("no_antrian", queueNumber);
            bookingData.put("id_pasien", patientId);
            bookingData.put("id_dokter", doctorId);
            bookingData.put("tanggal_antrian", selectedDate);
            bookingData.put("jam_antrian", selectedTime);
            bookingData.put("jenis_pasien", "UMUM");
            bookingData.put("status_antrian", "Belum Periksa");

            Log.d(TAG, "Booking data: " + bookingData.toString(2));

            String table = "antrian";
            String accessToken = authManager.getAccessToken();

            supabaseHelper.insert(requireContext(), table, bookingData, accessToken,
                    new supabaseHelper.SupabaseCallback() {
                        @Override
                        public void onSuccess(String response) {
                            Log.d(TAG, "✅ Booking successful!");

                            requireActivity().runOnUiThread(() -> {
                                Toast.makeText(requireContext(),
                                        "Booking berhasil! No. Antrian: " + queueNumber,
                                        Toast.LENGTH_LONG).show();
                                requireActivity().getSupportFragmentManager().popBackStack();
                            });
                        }

                        @Override
                        public void onError(String error) {
                            Log.e(TAG, "❌ Booking failed: " + error);

                            requireActivity().runOnUiThread(() -> {
                                Toast.makeText(requireContext(),
                                        "Gagal membuat booking: " + error,
                                        Toast.LENGTH_LONG).show();
                            });
                        }
                    });

        } catch (Exception e) {
            Log.e(TAG, "Error: " + e.getMessage());
            e.printStackTrace();
            Toast.makeText(requireContext(), "Error: " + e.getMessage(), Toast.LENGTH_SHORT).show();
        }
    }
}