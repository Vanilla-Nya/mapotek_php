package com.vanilla.mapotek;

import android.Manifest;
import android.content.Intent;
import android.content.pm.PackageManager;
import android.os.Bundle;
import android.util.Log;
import android.widget.Toast;
import androidx.annotation.NonNull;
import androidx.appcompat.app.AppCompatActivity;
import androidx.core.app.ActivityCompat;
import androidx.core.content.ContextCompat;
import com.journeyapps.barcodescanner.BarcodeCallback;
import com.journeyapps.barcodescanner.BarcodeResult;
import com.journeyapps.barcodescanner.DecoratedBarcodeView;
import com.google.zxing.ResultPoint;
import org.json.JSONObject;
import java.util.List;

public class qrScannerActivity extends AppCompatActivity {

    private static final int CAMERA_PERMISSION_REQUEST = 100;
    private static final String TAG = "QRScanner";
    private DecoratedBarcodeView barcodeScannerView;
    private boolean isScanned = false; // Prevent multiple scans

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_qr_scanner);

        Log.d(TAG, "🟢 QR Scanner Activity Created");

        barcodeScannerView = findViewById(R.id.zxing_barcode_scanner);

        // Check camera permission
        if (checkCameraPermission()) {
            initializeScanner();
        } else {
            requestCameraPermission();
        }
    }

    private boolean checkCameraPermission() {
        return ContextCompat.checkSelfPermission(this, Manifest.permission.CAMERA)
                == PackageManager.PERMISSION_GRANTED;
    }

    private void requestCameraPermission() {
        ActivityCompat.requestPermissions(this,
                new String[]{Manifest.permission.CAMERA},
                CAMERA_PERMISSION_REQUEST);
    }

    private void initializeScanner() {
        Log.d(TAG, "🟢 Initializing scanner...");

        // Set the callback for barcode detection
        barcodeScannerView.decodeContinuous(new BarcodeCallback() {
            @Override
            public void barcodeResult(BarcodeResult result) {
                // Prevent multiple scans
                if (isScanned) {
                    Log.d(TAG, "⚠️ Already scanned, ignoring...");
                    return;
                }

                if (result == null || result.getText() == null || result.getText().isEmpty()) {
                    Log.e(TAG, "❌ Scan result is null or empty");
                    return;
                }

                // Mark as scanned
                isScanned = true;
                barcodeScannerView.pause();

                String qrData = result.getText();
                Log.d(TAG, "========================================");
                Log.d(TAG, "🎯 QR SCANNED SUCCESSFULLY!");
                Log.d(TAG, "RAW Data: [" + qrData + "]");
                Log.d(TAG, "Length: " + qrData.length());
                Log.d(TAG, "========================================");

                // Process the QR data
                parseQRData(qrData);
            }

            @Override
            public void possibleResultPoints(List<ResultPoint> resultPoints) {
                // Optional: show scanning points
            }
        });

        Log.d(TAG, "✅ Scanner callback set, starting camera...");
    }

    private void parseQRData(String qrData) {
        Log.d(TAG, "🔍 Parsing QR data...");

        try {
            // Try to parse as JSON
            JSONObject json = new JSONObject(qrData);
            Log.d(TAG, "✅ Parsed as JSON successfully");

            String doctorId = json.optString("doctor_id", null);
            String doctorName = json.optString("doctor_name", null);

            Log.d(TAG, "Doctor ID: [" + doctorId + "]");
            Log.d(TAG, "Doctor Name: [" + doctorName + "]");

            if (doctorId != null && !doctorId.isEmpty()) {
                Log.d(TAG, "✅ Valid doctor ID found, returning to MainActivity...");

                Intent resultIntent = new Intent();
                resultIntent.putExtra("QR_TYPE", "DOCTOR");
                resultIntent.putExtra("DOCTOR_ID", doctorId);
                resultIntent.putExtra("DOCTOR_NAME", doctorName);
                setResult(RESULT_OK, resultIntent);

                runOnUiThread(() -> {
                    Toast.makeText(this, "Dokter: " + doctorName, Toast.LENGTH_SHORT).show();
                });

                // Finish after short delay
                barcodeScannerView.postDelayed(() -> {
                    Log.d(TAG, "🏁 Finishing activity...");
                    finish();
                }, 800);
            } else {
                Log.e(TAG, "❌ Doctor ID is empty");
                showErrorAndRescan("QR Code tidak valid");
            }

        } catch (Exception e) {
            Log.e(TAG, "❌ JSON parsing failed: " + e.getMessage());
            Log.d(TAG, "Trying plain ID format...");

            // Try as plain ID
            if (qrData.startsWith("DOC") || qrData.length() == 36) {
                Log.d(TAG, "✅ Matches plain ID pattern");

                Intent resultIntent = new Intent();
                resultIntent.putExtra("QR_TYPE", "DOCTOR");
                resultIntent.putExtra("DOCTOR_ID", qrData);
                resultIntent.putExtra("DOCTOR_NAME", "");
                setResult(RESULT_OK, resultIntent);

                runOnUiThread(() -> {
                    Toast.makeText(this, "ID Dokter: " + qrData, Toast.LENGTH_SHORT).show();
                });

                barcodeScannerView.postDelayed(() -> {
                    Log.d(TAG, "🏁 Finishing activity...");
                    finish();
                }, 800);
            } else {
                Log.e(TAG, "❌ Doesn't match any valid format");
                showErrorAndRescan("QR Code bukan untuk dokter");
            }
        }
    }

    private void showErrorAndRescan(String message) {
        runOnUiThread(() -> {
            Toast.makeText(this, message + ". Scan ulang!", Toast.LENGTH_SHORT).show();

            // Reset and allow scanning again
            barcodeScannerView.postDelayed(() -> {
                isScanned = false;
                barcodeScannerView.resume();
            }, 1500);
        });
    }

    @Override
    public void onRequestPermissionsResult(int requestCode, @NonNull String[] permissions,
                                           @NonNull int[] grantResults) {
        super.onRequestPermissionsResult(requestCode, permissions, grantResults);

        if (requestCode == CAMERA_PERMISSION_REQUEST) {
            if (grantResults.length > 0 && grantResults[0] == PackageManager.PERMISSION_GRANTED) {
                Log.d(TAG, "✅ Camera permission granted");
                initializeScanner();
            } else {
                Log.e(TAG, "❌ Camera permission denied");
                Toast.makeText(this, "Izin kamera diperlukan untuk scan QR",
                        Toast.LENGTH_SHORT).show();
                finish();
            }
        }
    }

    @Override
    protected void onResume() {
        super.onResume();
        Log.d(TAG, "onResume");
        barcodeScannerView.resume();
    }

    @Override
    protected void onPause() {
        super.onPause();
        Log.d(TAG, "onPause");
        barcodeScannerView.pause();
    }

    @Override
    protected void onDestroy() {
        super.onDestroy();
        Log.d(TAG, "onDestroy");
    }
}