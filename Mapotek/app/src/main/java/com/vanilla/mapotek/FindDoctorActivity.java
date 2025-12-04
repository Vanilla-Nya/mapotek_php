package com.vanilla.mapotek;

import android.os.Bundle;
import android.text.Editable;
import android.text.TextWatcher;
import android.util.Log;
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

    private static final String TAG = "FindDoctorActivity";

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
        Log.d(TAG, "=== FIND DOCTOR ACTIVITY CREATED ===");

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

        Log.d(TAG, "Activity initialization complete");
    }

    private void initializeViews() {
        Log.d(TAG, "Initializing views...");

        toolbar = findViewById(R.id.toolbar);
        etSearch = findViewById(R.id.etSearch);
        btnQueue = findViewById(R.id.btnQueue);
        chipGroup = findViewById(R.id.chipGroup);
        doctorContainer = findViewById(R.id.doctorContainer);

        doctorList = new ArrayList<>();
        filteredDoctorList = new ArrayList<>();

        Log.d(TAG, "✅ Views initialized");
    }

    private void setupToolbar() {
        Log.d(TAG, "Setting up toolbar...");

        setSupportActionBar(toolbar);
        if (getSupportActionBar() != null) {
            getSupportActionBar().setDisplayHomeAsUpEnabled(true);
            Log.d(TAG, "Back button enabled");
        }

        toolbar.setNavigationOnClickListener(v -> {
            Log.d(TAG, "Back button clicked - Finishing activity");
            finish();
        });

        Log.d(TAG, "✅ Toolbar setup complete");
    }

    private void setupSampleData() {
        Log.d(TAG, "=== SETTING UP SAMPLE DATA ===");

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

        Log.d(TAG, "Total doctors loaded: " + doctorList.size());

        // Log each doctor
        for (int i = 0; i < doctorList.size(); i++) {
            Doctor doc = doctorList.get(i);
            Log.d(TAG, "Doctor " + (i + 1) + ":");
            Log.d(TAG, "  Name: " + doc.getName());
            Log.d(TAG, "  Specialty: " + doc.getSpecialty());
            Log.d(TAG, "  Category: " + doc.getCategory());
            Log.d(TAG, "  Schedule: " + doc.getSchedule());
            Log.d(TAG, "  Location: " + doc.getLocation());
            Log.d(TAG, "  Available: " + doc.isAvailable());
        }

        Log.d(TAG, "✅ Sample data setup complete");
    }

    private void setupSearchFunctionality() {
        Log.d(TAG, "Setting up search functionality...");

        etSearch.addTextChangedListener(new TextWatcher() {
            @Override
            public void beforeTextChanged(CharSequence s, int start, int count, int after) {}

            @Override
            public void onTextChanged(CharSequence s, int start, int before, int count) {
                String query = s.toString().toLowerCase();
                Log.d(TAG, "=== SEARCH QUERY CHANGED ===");
                Log.d(TAG, "Search query: '" + query + "'");
                Log.d(TAG, "Query length: " + query.length());

                filterDoctors(query);
            }

            @Override
            public void afterTextChanged(Editable s) {}
        });

        Log.d(TAG, "✅ Search functionality setup complete");
    }

    private void setupFilterChips() {
        Log.d(TAG, "Setting up filter chips...");

        chipGroup.setOnCheckedStateChangeListener((group, checkedIds) -> {
            String selectedFilter = getSelectedFilter();
            Log.d(TAG, "=== FILTER CHIP CHANGED ===");
            Log.d(TAG, "Selected filter: " + selectedFilter);
            Log.d(TAG, "Checked chip IDs: " + checkedIds.toString());

            filterBySpecialty(selectedFilter);
        });

        Log.d(TAG, "✅ Filter chips setup complete");
    }

    private String getSelectedFilter() {
        int checkedId = chipGroup.getCheckedChipId();
        String filter;

        Log.d(TAG, "Getting selected filter - Checked ID: " + checkedId);

        if (checkedId == R.id.chipAll || checkedId == View.NO_ID) {
            filter = "Semua";
        } else if (checkedId == R.id.chipUmum) {
            filter = "Dokter Umum";
        } else if (checkedId == R.id.chipAnak) {
            filter = "Anak";
        } else if (checkedId == R.id.chipJantung) {
            filter = "Jantung";
        } else if (checkedId == R.id.chipMata) {
            filter = "Mata";
        } else {
            filter = "Semua";
        }

        Log.d(TAG, "Selected filter resolved to: " + filter);
        return filter;
    }

    private void filterDoctors(String searchQuery) {
        Log.d(TAG, "=== FILTERING DOCTORS BY SEARCH ===");
        Log.d(TAG, "Search query: '" + searchQuery + "'");
        Log.d(TAG, "Total doctors before filter: " + doctorList.size());

        filteredDoctorList.clear();
        int matchCount = 0;

        for (Doctor doctor : doctorList) {
            boolean nameMatch = doctor.getName().toLowerCase().contains(searchQuery);
            boolean specialtyMatch = doctor.getSpecialty().toLowerCase().contains(searchQuery);
            boolean locationMatch = doctor.getLocation().toLowerCase().contains(searchQuery);

            boolean matches = nameMatch || specialtyMatch || locationMatch;

            if (matches) {
                filteredDoctorList.add(doctor);
                matchCount++;

                Log.d(TAG, "Match " + matchCount + ": " + doctor.getName());
                Log.d(TAG, "  Name match: " + nameMatch);
                Log.d(TAG, "  Specialty match: " + specialtyMatch);
                Log.d(TAG, "  Location match: " + locationMatch);
            }
        }

        Log.d(TAG, "Total matches found: " + filteredDoctorList.size());
        displayDoctors(filteredDoctorList);
    }

    private void filterBySpecialty(String specialty) {
        Log.d(TAG, "=== FILTERING DOCTORS BY SPECIALTY ===");
        Log.d(TAG, "Selected specialty: " + specialty);

        if (specialty.equals("Semua")) {
            Log.d(TAG, "Showing all doctors");
            displayDoctors(doctorList);
        } else {
            filteredDoctorList.clear();
            int matchCount = 0;

            for (Doctor doctor : doctorList) {
                if (doctor.getCategory().equals(specialty)) {
                    filteredDoctorList.add(doctor);
                    matchCount++;
                    Log.d(TAG, "Match " + matchCount + ": " + doctor.getName() +
                            " (Category: " + doctor.getCategory() + ")");
                }
            }

            Log.d(TAG, "Total matches for specialty '" + specialty + "': " + filteredDoctorList.size());
            displayDoctors(filteredDoctorList);
        }
    }

    private void displayDoctors(List<Doctor> doctors) {
        Log.d(TAG, "=== DISPLAYING DOCTORS ===");
        Log.d(TAG, "Number of doctors to display: " + doctors.size());

        doctorContainer.removeAllViews();

        if (doctors.isEmpty()) {
            Log.w(TAG, "⚠️ No doctors to display - showing empty state");
            showNoResultsView();
            return;
        }

        LayoutInflater inflater = LayoutInflater.from(this);
        int cardCount = 0;

        for (Doctor doctor : doctors) {
            cardCount++;
            Log.d(TAG, "Creating card " + cardCount + " for: " + doctor.getName());

            View doctorCard = createDoctorCard(inflater, doctor);
            doctorContainer.addView(doctorCard);
        }

        Log.d(TAG, "✅ Successfully displayed " + cardCount + " doctor cards");
    }

    private View createDoctorCard(LayoutInflater inflater, Doctor doctor) {
        Log.d(TAG, "Creating doctor card:");
        Log.d(TAG, "  Name: " + doctor.getName());
        Log.d(TAG, "  Specialty: " + doctor.getSpecialty());
        Log.d(TAG, "  Available: " + doctor.isAvailable());

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
        bookButton.setOnClickListener(v -> {
            Log.d(TAG, "Booking button clicked for: " + doctor.getName());
            bookAppointment(doctor);
        });

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

        Log.d(TAG, "✅ Doctor card created successfully");
        return cardLayout;
    }

    private void showNoResultsView() {
        Log.d(TAG, "=== SHOWING NO RESULTS VIEW ===");

        TextView noResults = new TextView(this);
        noResults.setText("Tidak ada dokter yang ditemukan");
        noResults.setTextSize(16);
        noResults.setTextAlignment(View.TEXT_ALIGNMENT_CENTER);
        noResults.setPadding(32, 64, 32, 64);

        doctorContainer.addView(noResults);

        Log.d(TAG, "Empty state displayed");
    }

    private void setupClickListeners() {
        Log.d(TAG, "Setting up click listeners...");

        btnQueue.setOnClickListener(v -> {
            Log.d(TAG, "Queue management button clicked");
            openQueueManagement();
        });

        Log.d(TAG, "✅ Click listeners setup complete");
    }

    private void setupBottomNavigation() {
        Log.d(TAG, "Setting up bottom navigation...");

        com.google.android.material.bottomnavigation.BottomNavigationView bottomNavigation =
                findViewById(R.id.bottomNavigation);
        com.google.android.material.floatingactionbutton.FloatingActionButton fabScanQR =
                findViewById(R.id.fabScanQR);

        // Set current page as selected
        bottomNavigation.setSelectedItemId(R.id.nav_find_doctor);
        Log.d(TAG, "Current page set to: Find Doctor");

        bottomNavigation.setOnItemSelectedListener(item -> {
            int id = item.getItemId();
            Log.d(TAG, "Bottom navigation item selected: " + id);

            if (id == R.id.nav_dashboard) {
                Log.d(TAG, "Navigating to Dashboard");
                finish(); // Go back to dashboard
                return true;
            } else if (id == R.id.nav_find_doctor) {
                Log.d(TAG, "Already on Find Doctor page");
                return true;
            } else if (id == R.id.nav_history) {
                Log.d(TAG, "History clicked - Feature coming soon");
                Toast.makeText(this, "Riwayat - Akan segera hadir", Toast.LENGTH_SHORT).show();
                return true;
            } else if (id == R.id.nav_profile) {
                Log.d(TAG, "Profile clicked - Feature coming soon");
                Toast.makeText(this, "Profil - Akan segera hadir", Toast.LENGTH_SHORT).show();
                return true;
            }

            return false;
        });

        // FAB click listener
        fabScanQR.setOnClickListener(v -> {
            Log.d(TAG, "FAB Scan QR clicked");
            Toast.makeText(this, "Membuka Scanner QR", Toast.LENGTH_SHORT).show();
            // TODO: Open QR Scanner
        });

        Log.d(TAG, "✅ Bottom navigation setup complete");
    }

    private void bookAppointment(Doctor doctor) {
        Log.d(TAG, "=== BOOKING APPOINTMENT ===");
        Log.d(TAG, "Doctor: " + doctor.getName());
        Log.d(TAG, "Available: " + doctor.isAvailable());

        if (doctor.isAvailable()) {
            Log.d(TAG, "✅ Doctor is available - Proceeding with booking");
            Toast.makeText(this, "Booking janji dengan " + doctor.getName(), Toast.LENGTH_LONG).show();
            // TODO: Implement actual booking logic
            Log.d(TAG, "TODO: Navigate to booking screen");
        } else {
            Log.w(TAG, "❌ Doctor is NOT available");
            Toast.makeText(this, "Dokter sedang tidak tersedia", Toast.LENGTH_SHORT).show();
        }
    }

    private void openQueueManagement() {
        Log.d(TAG, "=== OPENING QUEUE MANAGEMENT ===");
        Toast.makeText(this, "Fitur manajemen antrian - Akan segera hadir", Toast.LENGTH_SHORT).show();
        Log.d(TAG, "TODO: Implement queue management feature");
    }

    // Modern way to handle back press
    private void setupBackPressHandler() {
        Log.d(TAG, "Setting up back press handler...");

        getOnBackPressedDispatcher().addCallback(this, new androidx.activity.OnBackPressedCallback(true) {
            @Override
            public void handleOnBackPressed() {
                Log.d(TAG, "Back pressed - Finishing activity");
                finish();
            }
        });

        Log.d(TAG, "✅ Back press handler setup complete");
    }

    @Override
    protected void onResume() {
        super.onResume();
        Log.d(TAG, "=== ACTIVITY RESUMED ===");
    }

    @Override
    protected void onPause() {
        super.onPause();
        Log.d(TAG, "=== ACTIVITY PAUSED ===");
    }

    @Override
    protected void onDestroy() {
        super.onDestroy();
        Log.d(TAG, "=== ACTIVITY DESTROYED ===");
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