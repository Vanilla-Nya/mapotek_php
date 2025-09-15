package com.vanilla.mapotek;

import android.os.Bundle;
import android.text.Editable;
import android.text.TextWatcher;
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
import java.util.ArrayList;
import java.util.List;

public class FindDoctorFragment extends Fragment {

    private TextInputEditText etSearch;
    private MaterialButton btnQueue;
    private ChipGroup chipGroup;
    private LinearLayout doctorContainer;

    // Sample doctor data
    private List<Doctor> doctorList;
    private List<Doctor> filteredDoctorList;

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
        setupSampleData();
        setupSearchFunctionality();
        setupFilterChips();
        setupClickListeners();
        displayDoctors(doctorList);
    }

    private void initializeViews(View view) {
        etSearch = view.findViewById(R.id.etSearch);
        btnQueue = view.findViewById(R.id.btnQueue);
        chipGroup = view.findViewById(R.id.chipGroup);
        doctorContainer = view.findViewById(R.id.doctorContainer);

        doctorList = new ArrayList<>();
        filteredDoctorList = new ArrayList<>();
    }

    private void setupSampleData() {
        // Create sample doctor data
        doctorList.add(new Doctor(
                "Dr. Ahmad Sutrisno, Sp.PD",
                "Dokter Spesialis Penyakit Dalam",
                "08:00 - 16:00",
                "RS Umum Surabaya, Lt. 2",
                "Dokter Umum",
                true
        ));

        doctorList.add(new Doctor(
                "Dr. Sari Indrawati, Sp.A",
                "Dokter Spesialis Anak",
                "09:00 - 15:00",
                "Klinik Anak Sehat, Lt. 1",
                "Anak",
                true
        ));

        doctorList.add(new Doctor(
                "Dr. Budi Hartono, Sp.JP",
                "Dokter Spesialis Jantung",
                "10:00 - 14:00",
                "RS Jantung Sehat, Lt. 3",
                "Jantung",
                true
        ));

        doctorList.add(new Doctor(
                "Dr. Maya Kusuma, Sp.M",
                "Dokter Spesialis Mata",
                "08:30 - 17:00",
                "Klinik Mata Prima, Lt. 2",
                "Mata",
                false
        ));

        doctorList.add(new Doctor(
                "Dr. Andi Prasetyo",
                "Dokter Umum",
                "07:00 - 19:00",
                "Puskesmas Wonokromo",
                "Dokter Umum",
                true
        ));
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
        chipGroup.setOnCheckedStateChangeListener((group, checkedIds) -> {
            String selectedFilter = getSelectedFilter();
            filterBySpecialty(selectedFilter);
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
            if (doctor.getName().toLowerCase().contains(searchQuery) ||
                    doctor.getSpecialty().toLowerCase().contains(searchQuery) ||
                    doctor.getLocation().toLowerCase().contains(searchQuery)) {
                filteredDoctorList.add(doctor);
            }
        }

        displayDoctors(filteredDoctorList);
    }

    private void filterBySpecialty(String specialty) {
        if (specialty.equals("Semua")) {
            displayDoctors(doctorList);
        } else {
            filteredDoctorList.clear();
            for (Doctor doctor : doctorList) {
                if (doctor.getCategory().equals(specialty)) {
                    filteredDoctorList.add(doctor);
                }
            }
            displayDoctors(filteredDoctorList);
        }
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
        tvSpecialty.setText(doctor.getSpecialty());
        tvSchedule.setText(doctor.getSchedule());
        tvLocation.setText(doctor.getLocation());

        // Set booking button state
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
            // TODO: Implement actual booking logic
        } else {
            Toast.makeText(requireContext(), "Dokter sedang tidak tersedia",
                    Toast.LENGTH_SHORT).show();
        }
    }

    private void showDoctorDetails(Doctor doctor) {
        // TODO: Show detailed doctor information
        Toast.makeText(requireContext(), "Detail dokter: " + doctor.getName(),
                Toast.LENGTH_SHORT).show();
    }

    private void openQueueManagement() {
        Toast.makeText(requireContext(), "Fitur manajemen antrian - Akan segera hadir",
                Toast.LENGTH_SHORT).show();
        // TODO: Implement queue management
    }

    // Doctor model class
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

        // Getters
        public String getName() { return name; }
        public String getSpecialty() { return specialty; }
        public String getSchedule() { return schedule; }
        public String getLocation() { return location; }
        public String getCategory() { return category; }
        public boolean isAvailable() { return isAvailable; }
    }
}