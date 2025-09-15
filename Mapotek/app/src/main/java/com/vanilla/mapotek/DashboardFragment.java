package com.vanilla.mapotek;

import android.app.AlertDialog;
import android.os.Bundle;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.TextView;
import android.widget.Toast;
import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import androidx.cardview.widget.CardView;
import androidx.fragment.app.Fragment;
import com.google.android.material.button.MaterialButton;

public class DashboardFragment extends Fragment {

    private TextView tvUserName;
    private CardView cardCariDokter, cardScanQR, cardHistory, cardProfile;
    private MaterialButton btnEmergency, btnAppointment;

    @Nullable
    @Override
    public View onCreateView(@NonNull LayoutInflater inflater, @Nullable ViewGroup container,
                             @Nullable Bundle savedInstanceState) {
        return inflater.inflate(R.layout.fragment_dashboard, container, false);
    }

    @Override
    public void onViewCreated(@NonNull View view, @Nullable Bundle savedInstanceState) {
        super.onViewCreated(view, savedInstanceState);

        initializeViews(view);
        loadUserData();
        setupClickListeners();
    }

    private void initializeViews(View view) {
        tvUserName = view.findViewById(R.id.tvUserName);
        cardCariDokter = view.findViewById(R.id.cardCariDokter);
        cardScanQR = view.findViewById(R.id.cardScanQR);
        cardHistory = view.findViewById(R.id.cardHistory);
        cardProfile = view.findViewById(R.id.cardProfile);
        btnEmergency = view.findViewById(R.id.btnEmergency);
        btnAppointment = view.findViewById(R.id.btnAppointment);
    }

    private void loadUserData() {
        Bundle args = getArguments();
        if (args != null) {
            String userName = args.getString("USER_NAME", "Pengguna");
            tvUserName.setText(userName);
        }
    }

    private void setupClickListeners() {
        MainActivity mainActivity = (MainActivity) getActivity();

        cardCariDokter.setOnClickListener(v -> {
            if (mainActivity != null) {
                mainActivity.findViewById(R.id.bottomNavigation);
                ((com.google.android.material.bottomnavigation.BottomNavigationView)
                        mainActivity.findViewById(R.id.bottomNavigation))
                        .setSelectedItemId(R.id.nav_find_doctor);
            }
        });

        cardScanQR.setOnClickListener(v -> openQRScanner());

        cardHistory.setOnClickListener(v -> {
            if (mainActivity != null) {
                ((com.google.android.material.bottomnavigation.BottomNavigationView)
                        mainActivity.findViewById(R.id.bottomNavigation))
                        .setSelectedItemId(R.id.nav_history);
            }
        });

        cardProfile.setOnClickListener(v -> {
            if (mainActivity != null) {
                ((com.google.android.material.bottomnavigation.BottomNavigationView)
                        mainActivity.findViewById(R.id.bottomNavigation))
                        .setSelectedItemId(R.id.nav_profile);
            }
        });

        btnEmergency.setOnClickListener(v -> handleEmergency());
        btnAppointment.setOnClickListener(v -> createAppointment());
    }

    private void openQRScanner() {
        MainActivity mainActivity = (MainActivity) getActivity();
        if (mainActivity != null) {
            mainActivity.showToast("Membuka Scanner QR");
        }
        // TODO: Implement QR Scanner
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
        Toast.makeText(requireContext(), "Fitur Buat Janji Temu - Akan segera hadir", Toast.LENGTH_SHORT).show();
        // TODO: Implement appointment booking
    }
}