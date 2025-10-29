package com.vanilla.mapotek;

import android.os.Bundle;
import android.text.Editable;
import android.text.TextWatcher;
import android.view.LayoutInflater;
import android.view.View;
import android.widget.ImageView;
import android.widget.LinearLayout;
import android.widget.TextView;
import android.widget.Toast;
import androidx.activity.EdgeToEdge;
import androidx.appcompat.app.AppCompatActivity;
import androidx.core.graphics.Insets;
import androidx.core.view.ViewCompat;
import androidx.core.view.WindowInsetsCompat;
import com.google.android.material.appbar.MaterialToolbar;
import com.google.android.material.button.MaterialButton;
import com.google.android.material.chip.Chip;
import com.google.android.material.chip.ChipGroup;
import com.google.android.material.textfield.TextInputEditText;
import java.util.ArrayList;
import java.util.List;

public class FindDoctorActivity extends AppCompatActivity {

    private MaterialToolbar toolbar;
    private TextInputEditText etSearch;
    private MaterialButton btnQueue;
    private ChipGroup chipGroup;
    private LinearLayout doctorContainer;

    // Sample doctor data
    private List<Doctor> doctorList;
    private List<Doctor> filteredDoctorList;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        EdgeToEdge.enable(this);
        setContentView(R.layout.activity_find_doctor);

        ViewCompat.setOnApplyWindowInsetsListener(findViewById(R.id.appBarLayout), (v, insets) -> {
            Insets systemBars = insets.getInsets(WindowInsetsCompat.Type.systemBars());
            v.setPadding(systemBars.left, systemBars.top, systemBars.right, systemBars.bottom);
            return insets;
        });

        initializeViews();
        setupToolbar();
        setupSampleData();
        setupSearchFunctionality();
        setupFilterChips();
        setupClickListeners();
        displayDoctors(doctorList);
        setupBackPressHandler();
    }

    private void initializeViews() {
        toolbar = findViewById(R.id.toolbar);
        etSearch = findViewById(R.id.etSearch);
        btnQueue = findViewById(R.id.btnQueue);
        chipGroup = findViewById(R.id.chipGroup);
        doctorContainer = findViewById(R.id.doctorContainer);

        doctorList = new ArrayList<>();
        filteredDoctorList = new ArrayList<>();
    }

    private void setupToolbar() {
        setSupportActionBar(toolbar);
        if (getSupportActionBar() != null) {
            getSupportActionBar().setDisplayHomeAsUpEnabled(true);
        }

        toolbar.setNavigationOnClickListener(v -> finish());
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

        LayoutInflater inflater = LayoutInflater.from(this);

        for (Doctor doctor : doctors) {
            View doctorCard = createDoctorCard(inflater, doctor);
            doctorContainer.addView(doctorCard);
        }
    }

    private View createDoctorCard(LayoutInflater inflater, Doctor doctor) {
        // Create doctor card programmatically
        LinearLayout cardLayout = new LinearLayout(this);
        cardLayout.setOrientation(LinearLayout.HORIZONTAL);
        cardLayout.setPadding(16, 16, 16, 16);

        // Doctor avatar
        ImageView avatar = new ImageView(this);
        avatar.setLayoutParams(new LinearLayout.LayoutParams(150, 150));
        // You can set different avatars or use a placeholder

        // Doctor info layout
        LinearLayout infoLayout = new LinearLayout(this);
        infoLayout.setOrientation(LinearLayout.VERTICAL);
        LinearLayout.LayoutParams infoParams = new LinearLayout.LayoutParams(0,
                LinearLayout.LayoutParams.WRAP_CONTENT, 1f);
        infoParams.setMargins(32, 0, 16, 0);
        infoLayout.setLayoutParams(infoParams);

        // Doctor name
        TextView nameText = new TextView(this);
        nameText.setText(doctor.getName());
        nameText.setTextSize(16);
        nameText.setTypeface(null, android.graphics.Typeface.BOLD);

        // Specialty
        TextView specialtyText = new TextView(this);
        specialtyText.setText(doctor.getSpecialty());
        specialtyText.setTextSize(14);

        // Schedule
        TextView scheduleText = new TextView(this);
        scheduleText.setText("🕒 " + doctor.getSchedule());
        scheduleText.setTextSize(12);

        // Location
        TextView locationText = new TextView(this);
        locationText.setText("📍 " + doctor.getLocation());
        locationText.setTextSize(12);

        infoLayout.addView(nameText);
        infoLayout.addView(specialtyText);
        infoLayout.addView(scheduleText);
        infoLayout.addView(locationText);

        // Booking button
        MaterialButton bookButton = new MaterialButton(this);
        bookButton.setText("Booking");
        bookButton.setOnClickListener(v -> bookAppointment(doctor));

        // Add all views to card
        cardLayout.addView(avatar);
        cardLayout.addView(infoLayout);
        cardLayout.addView(bookButton);

        // Wrap in CardView (you'll need to create this programmatically or use a different approach)
        cardLayout.setBackgroundResource(R.drawable.card_background);
        cardLayout.setClickable(true);
        cardLayout.setFocusable(true);

        LinearLayout.LayoutParams cardParams = new LinearLayout.LayoutParams(
                LinearLayout.LayoutParams.MATCH_PARENT,
                LinearLayout.LayoutParams.WRAP_CONTENT);
        cardParams.setMargins(0, 0, 0, 24);
        cardLayout.setLayoutParams(cardParams);

        return cardLayout;
    }

    private void showNoResultsView() {
        TextView noResults = new TextView(this);
        noResults.setText("Tidak ada dokter yang ditemukan");
        noResults.setTextSize(16);
        noResults.setTextAlignment(View.TEXT_ALIGNMENT_CENTER);
        noResults.setPadding(32, 64, 32, 64);

        doctorContainer.addView(noResults);
    }

    private void setupClickListeners() {
        btnQueue.setOnClickListener(v -> openQueueManagement());
    }

    private void setupBottomNavigation() {
        com.google.android.material.bottomnavigation.BottomNavigationView bottomNavigation =
                findViewById(R.id.bottomNavigation);
        com.google.android.material.floatingactionbutton.FloatingActionButton fabScanQR =
                findViewById(R.id.fabScanQR);

        // Set current page as selected
        bottomNavigation.setSelectedItemId(R.id.nav_find_doctor);

        bottomNavigation.setOnItemSelectedListener(item -> {
            int id = item.getItemId();

            if (id == R.id.nav_dashboard) {
                finish(); // Go back to dashboard
                return true;
            } else if (id == R.id.nav_find_doctor) {
                // Already on find doctor page
                return true;
            } else if (id == R.id.nav_history) {
                // TODO: Navigate to history
                Toast.makeText(this, "Riwayat - Akan segera hadir", Toast.LENGTH_SHORT).show();
                return true;
            } else if (id == R.id.nav_profile) {
                // TODO: Navigate to profile
                Toast.makeText(this, "Profil - Akan segera hadir", Toast.LENGTH_SHORT).show();
                return true;
            }

            return false;
        });

        // FAB click listener
        fabScanQR.setOnClickListener(v -> {
            Toast.makeText(this, "Membuka Scanner QR", Toast.LENGTH_SHORT).show();
            // TODO: Open QR Scanner
        });
    }

    private void bookAppointment(Doctor doctor) {
        if (doctor.isAvailable()) {
            Toast.makeText(this, "Booking janji dengan " + doctor.getName(), Toast.LENGTH_LONG).show();
            // TODO: Implement actual booking logic
        } else {
            Toast.makeText(this, "Dokter sedang tidak tersedia", Toast.LENGTH_SHORT).show();
        }
    }

    private void openQueueManagement() {
        Toast.makeText(this, "Fitur manajemen antrian - Akan segera hadir", Toast.LENGTH_SHORT).show();
        // TODO: Implement queue management
    }

    // Modern way to handle back press
    private void setupBackPressHandler() {
        getOnBackPressedDispatcher().addCallback(this, new androidx.activity.OnBackPressedCallback(true) {
            @Override
            public void handleOnBackPressed() {
                finish();
            }
        });
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