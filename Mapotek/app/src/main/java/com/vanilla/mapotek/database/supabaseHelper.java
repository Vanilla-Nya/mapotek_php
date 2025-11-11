package com.vanilla.mapotek.database;

import android.content.Context;
import android.net.Uri;
import org.json.JSONObject;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.security.MessageDigest;
import java.nio.charset.StandardCharsets;

import okhttp3.Call;
import okhttp3.Callback;
import okhttp3.MediaType;
import okhttp3.OkHttpClient;
import okhttp3.Request;
import okhttp3.RequestBody;
import okhttp3.Response;

/**
 * Supabase Helper - Handles all Supabase operations
 * - Authentication (register, login)
 * - Database CRUD (insert, select, update, delete)
 * - Storage (upload files, get public URLs)
 * - Blockchain operations (hash generation, immutable inserts)
 */
public class supabaseHelper {

    private static final String SUPABASE_URL = "https://brhaksondhloibpwtrdo.supabase.co";
    private static final String SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJyaGFrc29uZGhsb2licHd0cmRvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY1NDIxNDksImV4cCI6MjA3MjExODE0OX0.sHs9TbfPP38A5ikNFoZlOBJ67T1wtDiFMepEJn9ctfg";
    private static final OkHttpClient client = new OkHttpClient();

    public interface SupabaseCallback {
        void onSuccess(String response);
        void onError(String error);
    }

    // ==================== AUTHENTICATION ====================

    /**
     * Register a new user
     */
    public static void register(Context context, JSONObject data, Callback callback) {
        Request request = new Request.Builder()
                .url(SUPABASE_URL + "/auth/v1/signup")
                .addHeader("apikey", SUPABASE_KEY)
                .addHeader("Content-Type", "application/json")
                .post(RequestBody.create(data.toString(), MediaType.parse("application/json")))
                .build();

        client.newCall(request).enqueue(callback);
    }

    /**
     * Login user
     */
    public static void login(Context context, JSONObject data, Callback callback) {
        Request request = new Request.Builder()
                .url(SUPABASE_URL + "/auth/v1/token?grant_type=password")
                .addHeader("apikey", SUPABASE_KEY)
                .addHeader("Content-Type", "application/json")
                .post(RequestBody.create(data.toString(), MediaType.parse("application/json")))
                .build();

        client.newCall(request).enqueue(callback);
    }

    // ==================== DATABASE OPERATIONS ====================

    /**
     * POST - Insert data into table
     */
    public static void insert(Context context, String table, JSONObject data, String accessToken, SupabaseCallback callback) {
        String url = SUPABASE_URL + "/rest/v1/" + table;

        RequestBody body = RequestBody.create(
                data.toString(),
                MediaType.parse("application/json")
        );

        Request request = new Request.Builder()
                .url(url)
                .addHeader("apikey", SUPABASE_KEY)
                .addHeader("Authorization", "Bearer " + accessToken)
                .addHeader("Content-Type", "application/json")
                .addHeader("Prefer", "return=representation")
                .post(body)
                .build();

        executeRequest(request, callback);
    }

    /**
     * GET - Select data from table
     */
    public static void select(Context context, String table, String params, String accessToken, SupabaseCallback callback) {
        String url = SUPABASE_URL + "/rest/v1/" + table;
        if (params != null && !params.isEmpty()) {
            url += "?select=" + params;
        }

        Request request = new Request.Builder()
                .url(url)
                .addHeader("apikey", SUPABASE_KEY)
                .addHeader("Authorization", "Bearer " + accessToken)
                .get()
                .build();

        executeRequest(request, callback);
    }

    public static void selectRiwayat(Context context, String table, String selectColumns,
                              String filterParams, String accessToken, SupabaseCallback callback) {
        String url = SUPABASE_URL + "/rest/v1/" + table;

        // Build query parameters
        StringBuilder queryParams = new StringBuilder();

        // Add select parameter (columns to return)
        if (selectColumns != null && !selectColumns.isEmpty()) {
            queryParams.append("?select=").append(selectColumns);
        } else {
            queryParams.append("?select=*");  // Default: select all columns
        }

        // Add filter parameters
        if (filterParams != null && !filterParams.isEmpty()) {
            queryParams.append("&").append(filterParams);
        }

        url += queryParams.toString();

        android.util.Log.d("SupabaseHelper", "GET URL: " + url);

        Request request = new Request.Builder()
                .url(url)
                .addHeader("apikey", SUPABASE_KEY)
                .addHeader("Authorization", "Bearer " + accessToken)
                .get()
                .build();

        executeRequest(request, callback);
    }

    /**
     * PATCH - Update data in table
     */
    public static void update(Context context, String table, String params, String accessToken, JSONObject data, SupabaseCallback callback) {
        String url = SUPABASE_URL + "/rest/v1/" + table;
        if (params != null && !params.isEmpty()) {
            url += "?" + params;
        }

        RequestBody body = RequestBody.create(
                data.toString(),
                MediaType.parse("application/json")
        );

        Request request = new Request.Builder()
                .url(url)
                .addHeader("apikey", SUPABASE_KEY)
                .addHeader("Authorization", "Bearer " + accessToken)
                .addHeader("Content-Type", "application/json")
                .addHeader("Prefer", "return=representation")
                .patch(body)
                .build();

        executeRequest(request, callback);
    }

    /**
     * DELETE - Delete data from table
     */
    public static void delete(Context context, String table, String params, String accessToken, SupabaseCallback callback) {
        String url = SUPABASE_URL + "/rest/v1/" + table;
        if (params != null && !params.isEmpty()) {
            url += "?" + params;
        }

        Request request = new Request.Builder()
                .url(url)
                .addHeader("apikey", SUPABASE_KEY)
                .addHeader("Authorization", "Bearer " + accessToken)
                .delete()
                .build();

        executeRequest(request, callback);
    }

    // ==================== BLOCKCHAIN OPERATIONS ====================

    /**
     * Insert new blockchain record with hash validation
     * Used for immutable records (blockchain pattern with RLS)
     */
    public static void insertBlockchainRecord(Context context, String table,
                                              String currentHash, String prevHash,
                                              JSONObject data, String accessToken,
                                              SupabaseCallback callback) {
        try {
            // Add blockchain fields to data
            data.put("current_hash", currentHash);
            data.put("prev_hash", prevHash != null ? prevHash : JSONObject.NULL);
            data.put("created_at", getCurrentTimestamp());

            android.util.Log.d("BlockchainInsert", "⛓️ Inserting blockchain record");
            android.util.Log.d("BlockchainInsert", "   Table: " + table);
            android.util.Log.d("BlockchainInsert", "   Current hash: " + currentHash);
            android.util.Log.d("BlockchainInsert", "   Prev hash: " + prevHash);
            android.util.Log.d("BlockchainInsert", "   Data: " + data.toString());

            // Use regular insert
            insert(context, table, data, accessToken, callback);

        } catch (Exception e) {
            android.util.Log.e("BlockchainInsert", "❌ Error: " + e.getMessage());
            callback.onError(e.getMessage());
        }
    }

    /**
     * Helper: Generate SHA-256 hash for blockchain
     */
    public static String generateHash(String input) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(input.getBytes(StandardCharsets.UTF_8));

            StringBuilder hexString = new StringBuilder();
            for (byte b : hash) {
                String hex = Integer.toHexString(0xff & b);
                if (hex.length() == 1) hexString.append('0');
                hexString.append(hex);
            }
            return hexString.toString();
        } catch (Exception e) {
            android.util.Log.e("HashGeneration", "Error generating hash: " + e.getMessage());
            return null;
        }
    }

    /**
     * Helper: Get current timestamp in ISO format
     */
    private static String getCurrentTimestamp() {
        return new java.text.SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss.SSS'Z'",
                java.util.Locale.US).format(new java.util.Date());
    }

    // ==================== STORAGE OPERATIONS ====================

    /**
     * Upload file to Supabase Storage
     */
    public static void uploadToStorage(Context context, String bucketName, String filePath,
                                       Uri fileUri, String accessToken,
                                       SupabaseCallback callback) {
        android.util.Log.d("SupabaseStorage", "📤 Starting upload to storage");
        android.util.Log.d("SupabaseStorage", "   Bucket: " + bucketName);
        android.util.Log.d("SupabaseStorage", "   File path: " + filePath);
        android.util.Log.d("SupabaseStorage", "   File URI: " + fileUri);

        try {
            // Read file as bytes
            InputStream inputStream = context.getContentResolver().openInputStream(fileUri);
            if (inputStream == null) {
                callback.onError("Failed to open file");
                return;
            }

            byte[] fileBytes = getBytesFromInputStream(inputStream);
            inputStream.close();

            if (fileBytes == null || fileBytes.length == 0) {
                callback.onError("Failed to read file or file is empty");
                return;
            }

            android.util.Log.d("SupabaseStorage", "   File size: " + fileBytes.length + " bytes");

            // Build upload URL
            String url = SUPABASE_URL + "/storage/v1/object/" + bucketName + "/" + filePath;
            android.util.Log.d("SupabaseStorage", "   Upload URL: " + url);

            // Create request body
            RequestBody body = RequestBody.create(fileBytes, MediaType.parse("image/jpeg"));

            // Build request
            Request request = new Request.Builder()
                    .url(url)
                    .addHeader("apikey", SUPABASE_KEY)
                    .addHeader("Authorization", "Bearer " + accessToken)
                    .addHeader("Content-Type", "image/jpeg")
                    .post(body)
                    .build();

            // Execute request
            client.newCall(request).enqueue(new Callback() {
                @Override
                public void onFailure(Call call, IOException e) {
                    android.util.Log.e("SupabaseStorage", "❌ Upload failed: " + e.getMessage());
                    callback.onError("Upload failed: " + e.getMessage());
                }

                @Override
                public void onResponse(Call call, Response response) throws IOException {
                    String result = response.body().string();

                    android.util.Log.d("SupabaseStorage", "📥 Upload Response Code: " + response.code());
                    android.util.Log.d("SupabaseStorage", "📥 Upload Response: " + result);

                    if (response.isSuccessful() || response.code() == 200) {
                        // Generate public URL
                        String publicUrl = getPublicUrl(bucketName, filePath);
                        android.util.Log.d("SupabaseStorage", "✅ Upload successful!");
                        android.util.Log.d("SupabaseStorage", "   Public URL: " + publicUrl);
                        callback.onSuccess(publicUrl);
                    } else {
                        android.util.Log.e("SupabaseStorage", "❌ Upload error: " + result);
                        callback.onError("Upload error: " + result);
                    }
                }
            });

        } catch (Exception e) {
            android.util.Log.e("SupabaseStorage", "❌ Exception during upload: " + e.getMessage());
            e.printStackTrace();
            callback.onError("Upload exception: " + e.getMessage());
        }
    }

    /**
     * Get public URL for an uploaded file
     */
    public static String getPublicUrl(String bucketName, String filePath) {
        return SUPABASE_URL + "/storage/v1/object/public/" + bucketName + "/" + filePath;
    }

    /**
     * Delete file from Supabase Storage
     */
    public static void deleteFromStorage(Context context, String bucketName, String filePath,
                                         String accessToken, SupabaseCallback callback) {
        String url = SUPABASE_URL + "/storage/v1/object/" + bucketName + "/" + filePath;

        Request request = new Request.Builder()
                .url(url)
                .addHeader("apikey", SUPABASE_KEY)
                .addHeader("Authorization", "Bearer " + accessToken)
                .delete()
                .build();

        client.newCall(request).enqueue(new Callback() {
            @Override
            public void onFailure(Call call, IOException e) {
                android.util.Log.e("SupabaseStorage", "Delete failed: " + e.getMessage());
                callback.onError(e.getMessage());
            }

            @Override
            public void onResponse(Call call, Response response) throws IOException {
                String result = response.body().string();

                android.util.Log.d("SupabaseStorage", "Delete Response Code: " + response.code());
                android.util.Log.d("SupabaseStorage", "Delete Response: " + result);

                if (response.isSuccessful()) {
                    callback.onSuccess(result);
                } else {
                    callback.onError(result);
                }
            }
        });
    }

    // ==================== HELPER METHODS ====================

    /**
     * Helper method to execute database requests
     */
    private static void executeRequest(Request request, SupabaseCallback callback) {
        client.newCall(request).enqueue(new Callback() {
            @Override
            public void onFailure(Call call, IOException e) {
                android.util.Log.e("SupabaseHelper", "Request failed: " + e.getMessage());
                callback.onError(e.getMessage());
            }

            @Override
            public void onResponse(Call call, Response response) throws IOException {
                String result = response.body().string();

                android.util.Log.d("SupabaseHelper", "Response Code: " + response.code());
                android.util.Log.d("SupabaseHelper", "Response Body: " + result);

                if (response.isSuccessful()) {
                    callback.onSuccess(result);
                } else {
                    callback.onError(result);
                }
            }
        });
    }

    /**
     * Helper method to read InputStream as byte array
     */
    private static byte[] getBytesFromInputStream(InputStream inputStream) {
        try {
            ByteArrayOutputStream byteBuffer = new ByteArrayOutputStream();
            int bufferSize = 1024;
            byte[] buffer = new byte[bufferSize];

            int len;
            while ((len = inputStream.read(buffer)) != -1) {
                byteBuffer.write(buffer, 0, len);
            }

            byte[] result = byteBuffer.toByteArray();
            byteBuffer.close();
            return result;
        } catch (Exception e) {
            android.util.Log.e("SupabaseHelper", "Error reading bytes: " + e.getMessage());
            return null;
        }
    }
}