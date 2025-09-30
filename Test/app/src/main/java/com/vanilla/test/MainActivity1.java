package com.vanilla.test;

import android.content.Intent;
import android.os.Bundle;
import android.util.Log;
import android.view.View;
import android.widget.Button;
import android.widget.LinearLayout;
import android.widget.TextView;
import android.widget.Toast;
import androidx.appcompat.app.AppCompatActivity;
import androidx.core.content.ContextCompat;

public class MainActivity1 extends AppCompatActivity {

    private static final String TAG = "LifecycleDemo";
    private Button tab1, tab2, tab3;
    private LinearLayout homeTab, profileTab, settingsTab;
    private TextView lifecycleStatus;
    private int createCount = 0;
    private int startCount = 0;
    private int resumeCount = 0;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main1);

        Log.d(TAG, "onCreate() dipanggil");
        createCount++;

        // Initialize views
        initializeViews();

        // Set initial active tab
        setActiveTab(tab1, homeTab);

        // Update lifecycle status
        updateLifecycleStatus("onCreate");

        // Restore state if available
        if (savedInstanceState != null) {
            createCount = savedInstanceState.getInt("createCount", createCount);
            startCount = savedInstanceState.getInt("startCount", startCount);
            resumeCount = savedInstanceState.getInt("resumeCount", resumeCount);
            int selectedTab = savedInstanceState.getInt("selectedTab", 0);
            selectTab(selectedTab);
        }
    }

    private void initializeViews() {
        // Initialize buttons
        tab1 = findViewById(R.id.tab1);
        tab2 = findViewById(R.id.tab2);
        tab3 = findViewById(R.id.tab3);

        // Initialize tab content areas
        homeTab = findViewById(R.id.home_tab);
        profileTab = findViewById(R.id.profile_tab);
        settingsTab = findViewById(R.id.settings_tab);

        // Initialize lifecycle status textview
        lifecycleStatus = findViewById(R.id.lifecycle_status);

        // Set click listeners for tabs
        tab1.setOnClickListener(v -> setActiveTab(tab1, homeTab));
        tab2.setOnClickListener(v -> setActiveTab(tab2, profileTab));
        tab3.setOnClickListener(v -> setActiveTab(tab3, settingsTab));
    }

    @Override
    protected void onStart() {
        super.onStart();
        Log.d(TAG, "onStart() dipanggil");
        startCount++;
        updateLifecycleStatus("onStart");
        Toast.makeText(this, "Aktivitas dimulai", Toast.LENGTH_SHORT).show();
    }

    @Override
    protected void onResume() {
        super.onResume();
        Log.d(TAG, "onResume() dipanggil");
        resumeCount++;
        updateLifecycleStatus("onResume");
        Toast.makeText(this, "Aktivitas aktif", Toast.LENGTH_SHORT).show();
    }

    @Override
    protected void onPause() {
        super.onPause();
        Log.d(TAG, "onPause() dipanggil");
        updateLifecycleStatus("onPause");
        Toast.makeText(this, "Aktivitas dijeda", Toast.LENGTH_SHORT).show();
    }

    @Override
    protected void onStop() {
        super.onStop();
        Log.d(TAG, "onStop() dipanggil");
        updateLifecycleStatus("onStop");
        Toast.makeText(this, "Aktivitas dihentikan", Toast.LENGTH_SHORT).show();
    }

    @Override
    protected void onDestroy() {
        super.onDestroy();
        Log.d(TAG, "onDestroy() dipanggil");
        updateLifecycleStatus("onDestroy");
        Toast.makeText(this, "Aktivitas dihancurkan", Toast.LENGTH_SHORT).show();
    }

    @Override
    protected void onRestart() {
        super.onRestart();
        Log.d(TAG, "onRestart() dipanggil");
        updateLifecycleStatus("onRestart");
        Toast.makeText(this, "Aktivitas dimulai ulang", Toast.LENGTH_SHORT).show();
    }

    @Override
    protected void onSaveInstanceState(Bundle outState) {
        super.onSaveInstanceState(outState);
        Log.d(TAG, "onSaveInstanceState() dipanggil");

        // Save important data
        outState.putInt("createCount", createCount);
        outState.putInt("startCount", startCount);
        outState.putInt("resumeCount", resumeCount);
        outState.putInt("selectedTab", getSelectedTabIndex());
    }

    @Override
    protected void onRestoreInstanceState(Bundle savedInstanceState) {
        super.onRestoreInstanceState(savedInstanceState);
        Log.d(TAG, "onRestoreInstanceState() dipanggil");
        updateLifecycleStatus("onRestoreInstanceState");
    }

    private void setActiveTab(Button activeButton, LinearLayout activeTab) {
        resetAllTabs();

        // Set active button style
        activeButton.setTextColor(getResources().getColor(android.R.color.white));
        activeButton.setBackgroundTintList(ContextCompat.getColorStateList(this, android.R.color.holo_blue_dark));

        // Hide all tabs and show active tab
        homeTab.setVisibility(View.GONE);
        profileTab.setVisibility(View.GONE);
        settingsTab.setVisibility(View.GONE);
        activeTab.setVisibility(View.VISIBLE);
    }

    private void resetAllTabs() {
        int defaultColor = getResources().getColor(android.R.color.black);
        int defaultBackground = android.R.color.white;

        tab1.setTextColor(defaultColor);
        tab2.setTextColor(defaultColor);
        tab3.setTextColor(defaultColor);

        tab1.setBackgroundTintList(ContextCompat.getColorStateList(this, defaultBackground));
        tab2.setBackgroundTintList(ContextCompat.getColorStateList(this, defaultBackground));
        tab3.setBackgroundTintList(ContextCompat.getColorStateList(this, defaultBackground));
    }

    private int getSelectedTabIndex() {
        if (homeTab.getVisibility() == View.VISIBLE) return 0;
        if (profileTab.getVisibility() == View.VISIBLE) return 1;
        return 2;
    }

    private void selectTab(int index) {
        switch (index) {
            case 0: setActiveTab(tab1, homeTab); break;
            case 1: setActiveTab(tab2, profileTab); break;
            case 2: setActiveTab(tab3, settingsTab); break;
        }
    }

    private void updateLifecycleStatus(String currentMethod) {
        String status = "Status Lifecycle:\n" +
                "onCreate: " + createCount + "x\n" +
                "onStart: " + startCount + "x\n" +
                "onResume: " + resumeCount + "x\n" +
                "Method terakhir: " + currentMethod;

        if (lifecycleStatus != null) {
            lifecycleStatus.setText(status);
        }
    }

    // Handle button click in home tab
    public void onHomeButtonClick(View view) {
        Toast.makeText(this, "Home button clicked!", Toast.LENGTH_SHORT).show();
    }

    // Method untuk simulate configuration change
    public void onSimulateRotationClick(View view) {
        recreate(); // This will trigger configuration change
    }

    // Method untuk membuka RelativeLayoutActivity
    public void openRelativeLayout(View view) {
        Intent intent = new Intent(this, RelativeLayoutActivity.class);
        startActivity(intent);
    }

    // Method untuk membuka ConstraintLayoutActivity
    public void openConstraintLayout(View view) {
        Intent intent = new Intent(this, ConstraintLayoutActivity.class);
        startActivity(intent);
    }
}