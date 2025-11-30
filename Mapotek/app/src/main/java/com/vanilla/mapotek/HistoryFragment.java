package com.vanilla.mapotek;

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
import androidx.fragment.app.Fragment;

import com.google.android.material.button.MaterialButton;
import com.vanilla.mapotek.auth.AuthManager;
import com.vanilla.mapotek.database.supabaseHelper;

import org.json.JSONArray;
import org.json.JSONObject;

import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;

public class HistoryFragment extends Fragment {

    private static final String TAG = "HistoryFragment";

    private LinearLayout historyContainer;
    private TextView tvHistoryCount;
    private MaterialButton btnShowMore;

    private String accessToken;
    private String patientId;

    private List<HistoryItem> historyList = new ArrayList<>();
    private int currentDisplayLimit = 5;

    @Nullable
    @Override
    public View onCreateView(@NonNull LayoutInflater inflater, @Nullable ViewGroup container,
                             @Nullable Bundle savedInstanceState) {
        return inflater.inflate(R.layout.fragment_history, container, false);
    }

    @Override
    public void onViewCreated(@NonNull View view, @Nullable Bundle savedInstanceState) {
        super.onViewCreated(view, savedInstanceState);

        historyContainer = view.findViewById(R.id.historyContainer);
        tvHistoryCount = view.findViewById(R.id.tvHistoryCount);
        btnShowMore = view.findViewById(R.id.btnShowMore);

        AuthManager authManager = new AuthManager(requireContext());
        accessToken = authManager.getAccessToken();
        patientId = authManager.getUserId();

        Log.d(TAG, "=== CHECKING CREDENTIALS ===");
        Log.d(TAG, "Access Token: " + (accessToken != null && !accessToken.isEmpty() ? "EXISTS (" + accessToken.length() + " chars)" : "EMPTY"));
        Log.d(TAG, "Patient ID: " + (patientId != null && !patientId.isEmpty() ? patientId : "EMPTY"));

        if (accessToken == null || accessToken.isEmpty() || patientId == null || patientId.isEmpty()) {
            Toast.makeText(getContext(), "Sesi tidak valid, silakan login kembali", Toast.LENGTH_LONG).show();
            showEmptyState();
            return;
        }

        Log.d(TAG, "✅ Credentials valid, loading history...");

        btnShowMore.setOnClickListener(v -> {
            currentDisplayLimit += 5;
            displayHistoryList();
        });

        loadPatientHistory();
    }

    private void loadPatientHistory() {
        showLoading();

        // CHANGED: Load all antrian records for this patient, not just "Selesai"
        String selectColumns = "*,dokter(nama_lengkap)";
        String filterParams = "id_pasien=eq." + patientId + "&order=created_at.desc";

        Log.d(TAG, "Loading history with filters: " + filterParams);

        supabaseHelper.selectRiwayat(getContext(), "antrian", selectColumns, filterParams, accessToken,
                new supabaseHelper.SupabaseCallback() {
                    @Override
                    public void onSuccess(String response) {
                        try {
                            JSONArray antrianArray = new JSONArray(response);
                            Log.d(TAG, "Total antrian received: " + antrianArray.length());

                            // Group by encounter ID and find completed visits
                            Map<String, List<JSONObject>> encounterGroups = new HashMap<>();

                            for (int i = 0; i < antrianArray.length(); i++) {
                                JSONObject antrian = antrianArray.getJSONObject(i);
                                String encounterId = antrian.optString("id_encounter_satusehat", "");

                                if (!encounterId.isEmpty() && !encounterId.equals("null")) {
                                    if (!encounterGroups.containsKey(encounterId)) {
                                        encounterGroups.put(encounterId, new ArrayList<>());
                                    }
                                    encounterGroups.get(encounterId).add(antrian);
                                }
                            }

                            Log.d(TAG, "Unique encounters found: " + encounterGroups.size());

                            if (encounterGroups.isEmpty()) {
                                showEmptyState();
                                return;
                            }

                            // Process each encounter group
                            List<JSONObject> completedVisits = new ArrayList<>();

                            for (Map.Entry<String, List<JSONObject>> entry : encounterGroups.entrySet()) {
                                List<JSONObject> records = entry.getValue();

                                // Check if any record has "Selesai" status
                                boolean hasSelesai = false;
                                JSONObject selesaiRecord = null;
                                JSONObject pemeriksaanRecord = null;

                                for (JSONObject record : records) {
                                    String status = record.optString("status_antrian", "");

                                    if (status.equals("Selesai")) {
                                        hasSelesai = true;
                                        selesaiRecord = record;
                                    }

                                    // Look for the record with pemeriksaan (usually "Sedang Diperiksa")
                                    if (status.equals("Sedang Diperiksa")) {
                                        pemeriksaanRecord = record;
                                    }
                                }

                                // Only include completed visits
                                if (hasSelesai) {
                                    // Use the "Sedang Diperiksa" record for pemeriksaan data
                                    // but keep "Selesai" metadata for display
                                    JSONObject visitToProcess = pemeriksaanRecord != null ? pemeriksaanRecord : selesaiRecord;

                                    // Merge: Use pemeriksaan record's ID, but Selesai record's display info
                                    if (pemeriksaanRecord != null && selesaiRecord != null) {
                                        // Copy display fields from selesai record
                                        visitToProcess.put("display_tanggal", selesaiRecord.optString("tanggal_antrian"));
                                        visitToProcess.put("display_jam", selesaiRecord.optString("jam_antrian"));
                                        visitToProcess.put("display_status", "Selesai");
                                    }

                                    completedVisits.add(visitToProcess);
                                }
                            }

                            Log.d(TAG, "Completed visits to process: " + completedVisits.size());

                            if (completedVisits.isEmpty()) {
                                showEmptyState();
                                return;
                            }

                            processEncounters(completedVisits);

                        } catch (Exception e) {
                            Log.e(TAG, "Error parsing antrian data", e);
                            showError("Gagal memuat riwayat: " + e.getMessage());
                        }
                    }

                    @Override
                    public void onError(String error) {
                        Log.e(TAG, "Error loading antrian: " + error);
                        showError("Gagal memuat riwayat: " + error);
                    }
                });
    }

    private void processEncounters(List<JSONObject> encounters) {
        historyList.clear();

        final int[] processedCount = {0};
        final int totalCount = encounters.size();

        for (JSONObject antrian : encounters) {
            try {
                String antrianId = antrian.getString("id_antrian");
                loadPemeriksaanForAntrian(antrianId, antrian, () -> {
                    processedCount[0]++;
                    Log.d(TAG, "Processed " + processedCount[0] + "/" + totalCount);

                    if (processedCount[0] == totalCount) {
                        requireActivity().runOnUiThread(() -> {
                            if (historyList.isEmpty()) {
                                showEmptyState();
                            } else {
                                displayHistoryList();
                            }
                        });
                    }
                });
            } catch (Exception e) {
                Log.e(TAG, "Error processing encounter", e);
                processedCount[0]++;
            }
        }
    }

    private void loadPemeriksaanForAntrian(String antrianId, JSONObject antrian, Runnable onComplete) {
        String selectColumns = "*,anamnesa(*)";
        String filterParams = "id_antrian=eq." + antrianId;

        Log.d(TAG, "Loading pemeriksaan for antrian: " + antrianId);

        supabaseHelper.selectRiwayat(getContext(), "pemeriksaan", selectColumns, filterParams, accessToken,
                new supabaseHelper.SupabaseCallback() {
                    @Override
                    public void onSuccess(String response) {
                        try {
                            JSONArray pemeriksaanArray = new JSONArray(response);
                            Log.d(TAG, "Found " + pemeriksaanArray.length() + " pemeriksaan records");

                            if (pemeriksaanArray.length() > 0) {
                                JSONObject pemeriksaan = pemeriksaanArray.getJSONObject(0);
                                String pemeriksaanId = pemeriksaan.getString("id_pemeriksaan");

                                Log.d(TAG, "Pemeriksaan ID: " + pemeriksaanId);

                                loadMedicationsForPemeriksaan(pemeriksaanId, antrian, pemeriksaan, onComplete);
                            } else {
                                // ADD THIS: Still create a history item without pemeriksaan
                                HistoryItem item = new HistoryItem();
                                item.antrian = antrian;
                                item.pemeriksaan = new JSONObject(); // Empty pemeriksaan
                                item.medications = new ArrayList<>();
                                historyList.add(item);
                                Log.d(TAG, "Added history item without pemeriksaan");
                                onComplete.run();
                            }
                        } catch (Exception e) {
                            Log.e(TAG, "Error parsing pemeriksaan", e);
                            onComplete.run();
                        }
                    }

                    @Override
                    public void onError(String error) {
                        Log.e(TAG, "Error loading pemeriksaan: " + error);
                        onComplete.run();
                    }
                });
    }

    private void loadMedicationsForPemeriksaan(String pemeriksaanId, JSONObject antrian,
                                               JSONObject pemeriksaan, Runnable onComplete) {
        String selectColumns = "*";
        String filterParams = "id_pemeriksaan=eq." + pemeriksaanId;

        Log.d(TAG, "Loading medications for pemeriksaan: " + pemeriksaanId);

        supabaseHelper.selectRiwayat(getContext(), "pemeriksaan_obat", selectColumns, filterParams, accessToken,
                new supabaseHelper.SupabaseCallback() {
                    @Override
                    public void onSuccess(String response) {
                        try {
                            JSONArray obatArray = new JSONArray(response);
                            Log.d(TAG, "Found " + obatArray.length() + " medications");

                            HistoryItem item = new HistoryItem();
                            item.antrian = antrian;
                            item.pemeriksaan = pemeriksaan;
                            item.medications = new ArrayList<>();

                            if (obatArray.length() == 0) {
                                // No medications, but still add the history item
                                historyList.add(item);
                                onComplete.run();
                                return;
                            }

                            loadMedicationDetails(obatArray, item, onComplete);

                        } catch (Exception e) {
                            Log.e(TAG, "Error parsing medications", e);
                            onComplete.run();
                        }
                    }

                    @Override
                    public void onError(String error) {
                        Log.e(TAG, "Error loading medications: " + error);
                        onComplete.run();
                    }
                });
    }

    private void loadMedicationDetails(JSONArray obatArray, HistoryItem item, Runnable onComplete) {
        final int[] loadedCount = {0};
        final int totalMeds = obatArray.length();

        for (int i = 0; i < obatArray.length(); i++) {
            try {
                JSONObject pemeriksaanObat = obatArray.getJSONObject(i);
                String idObat = pemeriksaanObat.optString("id_obat");
                String signa = pemeriksaanObat.optString("signa", "-");
                int jumlah = pemeriksaanObat.optInt("jumlah", 0);

                if (idObat.isEmpty() || idObat.equals("null")) {
                    loadedCount[0]++;
                    checkComplete(loadedCount[0], totalMeds, item, onComplete);
                    continue;
                }

                String filterParams = "id_obat=eq." + idObat;

                supabaseHelper.selectRiwayat(getContext(), "obat", "*,jenis_obat(nama_jenis_obat)", filterParams, accessToken,
                        new supabaseHelper.SupabaseCallback() {
                            @Override
                            public void onSuccess(String response) {
                                try {
                                    JSONArray obatDetailArray = new JSONArray(response);

                                    if (obatDetailArray.length() > 0) {
                                        JSONObject obatDetail = obatDetailArray.getJSONObject(0);

                                        Medication med = new Medication();
                                        med.namaObat = obatDetail.optString("nama_obat", "Obat");

                                        // Get jenis obat from joined data
                                        JSONObject jenisObat = obatDetail.optJSONObject("jenis_obat");
                                        if (jenisObat != null) {
                                            med.jenisObat = jenisObat.optString("nama_jenis_obat", "-");
                                        } else {
                                            med.jenisObat = "-";
                                        }

                                        med.signa = signa;
                                        med.jumlah = jumlah;

                                        item.medications.add(med);
                                        Log.d(TAG, "Added medication: " + med.namaObat + " (" + med.jenisObat + ")");
                                    }

                                } catch (Exception e) {
                                    Log.e(TAG, "Error parsing obat detail", e);
                                }

                                loadedCount[0]++;
                                checkComplete(loadedCount[0], totalMeds, item, onComplete);
                            }

                            @Override
                            public void onError(String error) {
                                Log.e(TAG, "Error loading obat detail: " + error);
                                loadedCount[0]++;
                                checkComplete(loadedCount[0], totalMeds, item, onComplete);
                            }
                        });

            } catch (Exception e) {
                Log.e(TAG, "Error processing medication", e);
                loadedCount[0]++;
                checkComplete(loadedCount[0], totalMeds, item, onComplete);
            }
        }
    }

    private void checkComplete(int loaded, int total, HistoryItem item, Runnable onComplete) {
        if (loaded == total) {
            historyList.add(item);
            Log.d(TAG, "History item complete with " + item.medications.size() + " medications");
            onComplete.run();
        }
    }

    private void displayHistoryList() {
        if (getActivity() == null) return;

        requireActivity().runOnUiThread(() -> {
            historyContainer.removeAllViews();

            if (historyList.isEmpty()) {
                showEmptyState();
                return;
            }

            Log.d(TAG, "Displaying " + historyList.size() + " history items");

            tvHistoryCount.setText(historyList.size() + " riwayat kunjungan");

            int displayCount = Math.min(currentDisplayLimit, historyList.size());
            for (int i = 0; i < displayCount; i++) {
                View historyCard = createHistoryCard(historyList.get(i));
                historyContainer.addView(historyCard);
            }

            if (historyList.size() > currentDisplayLimit) {
                btnShowMore.setVisibility(View.VISIBLE);
            } else {
                btnShowMore.setVisibility(View.GONE);
            }
        });
    }

    private View createHistoryCard(HistoryItem item) {
        LayoutInflater inflater = LayoutInflater.from(getContext());
        View card = inflater.inflate(R.layout.item_history_card, historyContainer, false);

        try {
            TextView tvDate = card.findViewById(R.id.tvHistoryDate);
            TextView tvTime = card.findViewById(R.id.tvHistoryTime);
            TextView tvDoctor = card.findViewById(R.id.tvHistoryDoctor);

            // Use display fields if available, otherwise use original
            String tanggal = item.antrian.optString("display_tanggal",
                    item.antrian.optString("tanggal_antrian", "-"));
            String jam = item.antrian.optString("display_jam",
                    item.antrian.optString("jam_antrian", "-"));

            tvDate.setText(formatDate(tanggal));
            tvTime.setText(jam);

            // Get doctor name
            JSONObject dokter = item.antrian.optJSONObject("dokter");
            if (dokter != null) {
                String doctorName = dokter.optString("nama_lengkap", "Dokter");
                tvDoctor.setText(doctorName);
            }

            // Get diagnosis from anamnesa
            JSONObject anamnesa = item.pemeriksaan.optJSONObject("anamnesa");
            if (anamnesa != null) {
                TextView tvDiagnosis = card.findViewById(R.id.tvDiagnosis);
                String keluhan = anamnesa.optString("keluhan", "");
                String diagnosisText = anamnesa.optString("anamnesis", "");

                if (!keluhan.isEmpty()) {
                    tvDiagnosis.setText("Keluhan: " + keluhan);
                } else if (!diagnosisText.isEmpty()) {
                    tvDiagnosis.setText("Diagnosis: " + diagnosisText);
                }
            }

            // Medications container
            LinearLayout medicationsContainer = card.findViewById(R.id.medicationsContainer);
            medicationsContainer.removeAllViews();

            if (item.medications.isEmpty()) {
                TextView tvEmpty = new TextView(getContext());
                tvEmpty.setText("Tidak ada obat yang diberikan");
                tvEmpty.setTextColor(getResources().getColor(R.color.text_secondary));
                tvEmpty.setTextSize(14);
                tvEmpty.setPadding(0, 8, 0, 8);
                medicationsContainer.addView(tvEmpty);
            } else {
                for (Medication med : item.medications) {
                    View medView = createMedicationView(med);
                    medicationsContainer.addView(medView);
                }
            }

        } catch (Exception e) {
            Log.e(TAG, "Error creating history card", e);
        }

        return card;
    }

    private View createMedicationView(Medication med) {
        LinearLayout medLayout = new LinearLayout(getContext());
        medLayout.setOrientation(LinearLayout.VERTICAL);
        medLayout.setPadding(0, 12, 0, 12);

        // Medicine name with type badge
        LinearLayout headerLayout = new LinearLayout(getContext());
        headerLayout.setOrientation(LinearLayout.HORIZONTAL);
        headerLayout.setGravity(android.view.Gravity.CENTER_VERTICAL);

        TextView tvName = new TextView(getContext());
        tvName.setText(med.namaObat);
        tvName.setTextSize(16);
        tvName.setTextColor(getResources().getColor(R.color.text_primary));
        tvName.setTypeface(null, android.graphics.Typeface.BOLD);
        headerLayout.addView(tvName);

        // Type badge
        if (!med.jenisObat.equals("-")) {
            TextView tvType = new TextView(getContext());
            tvType.setText(med.jenisObat);
            tvType.setTextSize(12);
            tvType.setTextColor(getResources().getColor(R.color.white));
            tvType.setBackgroundResource(R.drawable.bg_badge_info);
            tvType.setPadding(12, 4, 12, 4);
            LinearLayout.LayoutParams typeParams = new LinearLayout.LayoutParams(
                    LinearLayout.LayoutParams.WRAP_CONTENT,
                    LinearLayout.LayoutParams.WRAP_CONTENT
            );
            typeParams.leftMargin = 12;
            tvType.setLayoutParams(typeParams);
            headerLayout.addView(tvType);
        }

        medLayout.addView(headerLayout);

        // Signa
        TextView tvSigna = new TextView(getContext());
        tvSigna.setText("Aturan pakai: " + med.signa);
        tvSigna.setTextSize(14);
        tvSigna.setTextColor(getResources().getColor(R.color.text_secondary));
        tvSigna.setPadding(0, 4, 0, 0);
        medLayout.addView(tvSigna);

        // Quantity
        TextView tvJumlah = new TextView(getContext());
        tvJumlah.setText("Jumlah: " + med.jumlah);
        tvJumlah.setTextSize(14);
        tvJumlah.setTextColor(getResources().getColor(R.color.text_secondary));
        tvJumlah.setPadding(0, 2, 0, 0);
        medLayout.addView(tvJumlah);

        // Divider
        View divider = new View(getContext());
        divider.setBackgroundColor(getResources().getColor(R.color.divider_color));
        LinearLayout.LayoutParams dividerParams = new LinearLayout.LayoutParams(
                LinearLayout.LayoutParams.MATCH_PARENT, 1
        );
        dividerParams.topMargin = 12;
        divider.setLayoutParams(dividerParams);
        medLayout.addView(divider);

        return medLayout;
    }

    private String formatDate(String dateStr) {
        try {
            SimpleDateFormat inputFormat = new SimpleDateFormat("yyyy-MM-dd", Locale.getDefault());
            SimpleDateFormat outputFormat = new SimpleDateFormat("dd MMMM yyyy", new Locale("id", "ID"));
            Date date = inputFormat.parse(dateStr);
            return outputFormat.format(date);
        } catch (Exception e) {
            return dateStr;
        }
    }

    private void showLoading() {
        if (getActivity() == null) return;

        requireActivity().runOnUiThread(() -> {
            historyContainer.removeAllViews();

            TextView tvLoading = new TextView(getContext());
            tvLoading.setText("Memuat riwayat kunjungan...");
            tvLoading.setTextSize(16);
            tvLoading.setTextColor(getResources().getColor(R.color.text_secondary));
            tvLoading.setGravity(android.view.Gravity.CENTER);
            tvLoading.setPadding(0, 48, 0, 48);

            historyContainer.addView(tvLoading);
        });
    }

    private void showEmptyState() {
        if (getActivity() == null) return;

        requireActivity().runOnUiThread(() -> {
            historyContainer.removeAllViews();

            LinearLayout emptyLayout = new LinearLayout(getContext());
            emptyLayout.setOrientation(LinearLayout.VERTICAL);
            emptyLayout.setGravity(android.view.Gravity.CENTER);
            emptyLayout.setPadding(32, 48, 32, 48);

            TextView tvEmpty = new TextView(getContext());
            tvEmpty.setText("Belum ada riwayat kunjungan");
            tvEmpty.setTextSize(18);
            tvEmpty.setTextColor(getResources().getColor(R.color.text_primary));
            tvEmpty.setTypeface(null, android.graphics.Typeface.BOLD);
            tvEmpty.setGravity(android.view.Gravity.CENTER);
            emptyLayout.addView(tvEmpty);

            TextView tvEmptyDesc = new TextView(getContext());
            tvEmptyDesc.setText("Riwayat pemeriksaan Anda akan muncul di sini");
            tvEmptyDesc.setTextSize(14);
            tvEmptyDesc.setTextColor(getResources().getColor(R.color.text_secondary));
            tvEmptyDesc.setGravity(android.view.Gravity.CENTER);
            tvEmptyDesc.setPadding(0, 8, 0, 0);
            emptyLayout.addView(tvEmptyDesc);

            historyContainer.addView(emptyLayout);

            tvHistoryCount.setText("0 riwayat kunjungan");
            btnShowMore.setVisibility(View.GONE);
        });
    }

    private void showError(String message) {
        if (getActivity() == null) return;

        requireActivity().runOnUiThread(() -> {
            Toast.makeText(getContext(), message, Toast.LENGTH_SHORT).show();
            showEmptyState();
        });
    }

    private static class HistoryItem {
        JSONObject antrian;
        JSONObject pemeriksaan;
        List<Medication> medications;
    }

    private static class Medication {
        String namaObat;
        String jenisObat;
        String signa;
        int jumlah;
    }
}