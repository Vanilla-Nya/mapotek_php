package com.vanilla.mapotek;

import android.os.Bundle;
import android.text.Editable;
import android.text.TextWatcher;
import android.util.Log;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.LinearLayout;
import android.widget.TextView;
import android.widget.Toast;
import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import androidx.fragment.app.Fragment;
import com.google.android.material.button.MaterialButton;
import com.google.android.material.chip.ChipGroup;
import com.google.android.material.textfield.TextInputEditText;
import com.vanilla.mapotek.auth.AuthManager;
import com.vanilla.mapotek.database.supabaseHelper;
import org.json.JSONArray;
import org.json.JSONObject;
import java.util.ArrayList;
import java.util.List;

public class FindDoctorFragment extends Fragment {
    private static final String TAG = "FindDoctorFragment";

    private TextInputEditText etSearch;
    private MaterialButton btnQueue;
    private ChipGroup chipGroup;
    private LinearLayout doctorContainer;

    private List<Doctor> doctorList;
    private List<Doctor> filteredDoctorList;
    private AuthManager authManager;

    @Nullable
    @Override
    public View onCreateView(@NonNull LayoutInflater inflater, @Nullable ViewGroup container,
                             @Nullable Bundle savedInstanceState) {
        return inflater.inflate(R.layout.fragment_find_doctor, container, false);
    }

    @Override
    public void onViewCreated(@NonNull View view, @Nullable Bundle savedInstanceState) {
        super.onViewCreated(view, savedInstanceState);

        initializeViews(view);

        // Load doctors from Supabase
        loadDoctorsFromSupabase();

        setupSearchFunctionality();
        setupFilterChips();
        setupClickListeners();
    }

    private void initializeViews(View view) {
        etSearch = view.findViewById(R.id.etSearch);
        btnQueue = view.findViewById(R.id.btnQueue);
        chipGroup = view.findViewById(R.id.chipGroup);
        doctorContainer = view.findViewById(R.id.doctorContainer);

        doctorList = new ArrayList<>();
        filteredDoctorList = new ArrayList<>();
        authManager = new AuthManager(requireContext());
    }

    // NEW METHOD: Load doctors from Supabase
    private void loadDoctorsFromSupabase() {
        Log.d(TAG, "=== START: Loading doctors from Supabase ===");

        String accessToken = authManager.getAccessToken();
        Log.d(TAG, "Access token exists: " + (accessToken != null && !accessToken.isEmpty()));

        if (accessToken == null || accessToken.isEmpty()) {
            Log.e(TAG, "No access token found!");
            requireActivity().runOnUiThread(() -> {
                Toast.makeText(requireContext(), "Token tidak ditemukan, silakan login kembali", Toast.LENGTH_SHORT).show();
            });
            return;
        }

        Log.d(TAG, "About to call supabaseHelper.select()");

        String table = "dokter";
        String params = "*";

        supabaseHelper.select(requireContext(), table, params, accessToken,
                new supabaseHelper.SupabaseCallback() {
                    @Override
                    public void onSuccess(String response) {
                        Log.d(TAG, "=== CALLBACK: onSuccess triggered ===");
                        Log.d(TAG, "Response: " + response);

                        requireActivity().runOnUiThread(() -> {
                            Log.d(TAG, "Running on UI thread now");

                            try {
                                JSONArray jsonArray = new JSONArray(response);
                                Log.d(TAG, "Number of doctors in response: " + jsonArray.length());

                                doctorList.clear();

                                for (int i = 0; i < jsonArray.length(); i++) {
                                    JSONObject doctorJson = jsonArray.getJSONObject(i);
                                    Log.d(TAG, "Doctor " + i + ": " + doctorJson.toString());

                                    // Adjust these field names to match your actual database columns
                                    Doctor doctor = new Doctor(
                                            doctorJson.optString("nama_lengkap", ""), // or "nama"
                                            "", // specialty removed
                                            doctorJson.optString("jam_kerja", "08:00 - 16:00"), // or "jadwal"
                                            doctorJson.optString("alamat", ""),
                                            "", // category removed
                                            true // always available
                                    );

                                    doctorList.add(doctor);
                                    Log.d(TAG, "Added doctor: " + doctor.getName());
                                }

                                Log.d(TAG, "Total doctors loaded: " + doctorList.size());
                                displayDoctors(doctorList);

                                Toast.makeText(requireContext(),
                                        doctorList.size() + " dokter ditemukan",
                                        Toast.LENGTH_SHORT).show();

                            } catch (Exception e) {
                                Log.e(TAG, "Error parsing doctors data: " + e.getMessage(), e);
                                e.printStackTrace();
                                Toast.makeText(requireContext(),
                                        "Gagal memproses data dokter",
                                        Toast.LENGTH_SHORT).show();
                            }
                        });
                    }

                    @Override
                    public void onError(String error) {
                        Log.e(TAG, "=== CALLBACK: onError triggered ===");
                        Log.e(TAG, "Error: " + error);

                        requireActivity().runOnUiThread(() -> {
                            Toast.makeText(requireContext(),
                                    "Gagal memuat data dokter: " + error,
                                    Toast.LENGTH_LONG).show();
                        });
                    }
                });

        Log.d(TAG, "supabaseHelper.select() called, waiting for callback...");
    }

    private void setupSearchFunctionality() {
        etSearch.addTextChangedListener(new TextWatcher() {
            @Override
            public void beforeTextChanged(CharSequence s, int start, int count, int after) {}

            @Override
            public void onTextChanged(CharSequence s, int start, int before, int count) {
                filterDoctors(s.toString().toLowerCase());
            }

            @Override
            public void afterTextChanged(Editable s) {}
        });
    }

    private void setupFilterChips() {
        // Since category is removed, you might want to disable chips or remove them
        chipGroup.setOnCheckedStateChangeListener((group, checkedIds) -> {
            // Just show all doctors since we don't have categories
            displayDoctors(doctorList);
        });
    }

    private String getSelectedFilter() {
        int checkedId = chipGroup.getCheckedChipId();
        if (checkedId == R.id.chipAll || checkedId == View.NO_ID) {
            return "Semua";
        } else if (checkedId == R.id.chipUmum) {
            return "Dokter Umum";
        } else if (checkedId == R.id.chipAnak) {
            return "Anak";
        } else if (checkedId == R.id.chipJantung) {
            return "Jantung";
        } else if (checkedId == R.id.chipMata) {
            return "Mata";
        }
        return "Semua";
    }

    private void filterDoctors(String searchQuery) {
        filteredDoctorList.clear();

        for (Doctor doctor : doctorList) {
            // Search only in name and location
            if (doctor.getName().toLowerCase().contains(searchQuery) ||
                    doctor.getLocation().toLowerCase().contains(searchQuery)) {
                filteredDoctorList.add(doctor);
            }
        }

        displayDoctors(filteredDoctorList);
    }

    private void displayDoctors(List<Doctor> doctors) {
        doctorContainer.removeAllViews();

        if (doctors.isEmpty()) {
            showNoResultsView();
            return;
        }

        LayoutInflater inflater = LayoutInflater.from(requireContext());

        for (Doctor doctor : doctors) {
            View doctorCard = inflater.inflate(R.layout.item_doctor_card, doctorContainer, false);
            bindDoctorCard(doctorCard, doctor);
            doctorContainer.addView(doctorCard);
        }
    }

    private void bindDoctorCard(View cardView, Doctor doctor) {
        TextView tvDoctorName = cardView.findViewById(R.id.tvDoctorName);
        TextView tvSpecialty = cardView.findViewById(R.id.tvSpecialty);
        TextView tvSchedule = cardView.findViewById(R.id.tvSchedule);
        TextView tvLocation = cardView.findViewById(R.id.tvLocation);
        MaterialButton btnBooking = cardView.findViewById(R.id.btnBooking);

        tvDoctorName.setText(doctor.getName());

        // Hide specialty if empty
        if (doctor.getSpecialty().isEmpty()) {
            tvSpecialty.setVisibility(View.GONE);
        } else {
            tvSpecialty.setText(doctor.getSpecialty());
            tvSpecialty.setVisibility(View.VISIBLE);
        }

        tvSchedule.setText(doctor.getSchedule());
        tvLocation.setText(doctor.getLocation());

        if (doctor.isAvailable()) {
            btnBooking.setEnabled(true);
            btnBooking.setText("Booking");
        } else {
            btnBooking.setEnabled(false);
            btnBooking.setText("Tidak Tersedia");
        }

        btnBooking.setOnClickListener(v -> bookAppointment(doctor));
        cardView.setOnClickListener(v -> showDoctorDetails(doctor));
    }

    private void showNoResultsView() {
        TextView noResults = new TextView(requireContext());
        noResults.setText("Tidak ada dokter yang ditemukan");
        noResults.setTextSize(16);
        noResults.setTextAlignment(View.TEXT_ALIGNMENT_CENTER);
        noResults.setPadding(32, 64, 32, 64);

        doctorContainer.addView(noResults);
    }

    private void setupClickListeners() {
        btnQueue.setOnClickListener(v -> openQueueManagement());
    }

    private void bookAppointment(Doctor doctor) {
        if (doctor.isAvailable()) {
            Toast.makeText(requireContext(), "Booking janji dengan " + doctor.getName(),
                    Toast.LENGTH_LONG).show();
        } else {
            Toast.makeText(requireContext(), "Dokter sedang tidak tersedia",
                    Toast.LENGTH_SHORT).show();
        }
    }

    private void showDoctorDetails(Doctor doctor) {
        Toast.makeText(requireContext(), "Detail dokter: " + doctor.getName(),
                Toast.LENGTH_SHORT).show();
    }

    private void openQueueManagement() {
        Toast.makeText(requireContext(), "Fitur manajemen antrian - Akan segera hadir",
                Toast.LENGTH_SHORT).show();
    }

    public static class Doctor {
        private String name;
        private String specialty;
        private String schedule;
        private String location;
        private String category;
        private boolean isAvailable;

        public Doctor(String name, String specialty, String schedule, String location,
                      String category, boolean isAvailable) {
            this.name = name;
            this.specialty = specialty;
            this.schedule = schedule;
            this.location = location;
            this.category = category;
            this.isAvailable = isAvailable;
        }

        public String getName() { return name; }
        public String getSpecialty() { return specialty; }
        public String getSchedule() { return schedule; }
        public String getLocation() { return location; }
        public String getCategory() { return category; }
        public boolean isAvailable() { return isAvailable; }
    }
}