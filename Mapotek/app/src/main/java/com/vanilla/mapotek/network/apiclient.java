package com.vanilla.mapotek.network;

import android.content.Context;
import android.util.Log;
import java.io.IOException;
import okhttp3.Call;
import okhttp3.Callback;
import okhttp3.MediaType;
import okhttp3.OkHttpClient;
import okhttp3.Request;
import okhttp3.RequestBody;
import okhttp3.Response;

public class apiclient {
    private static final String TAG = "ApiClient";

    // ✅ UPDATED PATH - matches your actual folder structure
    public static final String BASE_URL = "http://10.0.2.2/MAPOTEK_PHP/WEB/API/auth";

    private static final OkHttpClient client = new OkHttpClient();

    public interface ApiCallback {
        void onSuccess(String response);
        void onError(String error);
    }

    // GET request
    public static void get(Context context, String url, String accessToken, ApiCallback callback) {
        Log.d(TAG, "=== GET REQUEST ===");
        Log.d(TAG, "URL: " + url);

        Request.Builder requestBuilder = new Request.Builder()
                .url(url)
                .addHeader("Content-Type", "application/json");

        if (accessToken != null && !accessToken.isEmpty()) {
            requestBuilder.addHeader("Authorization", "Bearer " + accessToken);
        }

        Request request = requestBuilder.get().build();

        executeRequest(request, callback);
    }

    // POST request
    public static void post(Context context, String url, String jsonData, String accessToken, ApiCallback callback) {
        Log.d(TAG, "=== POST REQUEST ===");
        Log.d(TAG, "URL: " + url);
        Log.d(TAG, "Data: " + jsonData);

        RequestBody body = RequestBody.create(
                jsonData,
                MediaType.parse("application/json")
        );

        Request.Builder requestBuilder = new Request.Builder()
                .url(url)
                .addHeader("Content-Type", "application/json");

        if (accessToken != null && !accessToken.isEmpty()) {
            requestBuilder.addHeader("Authorization", "Bearer " + accessToken);
        }

        Request request = requestBuilder.post(body).build();

        executeRequest(request, callback);
    }

    // Helper method to execute requests
    private static void executeRequest(Request request, ApiCallback callback) {
        client.newCall(request).enqueue(new Callback() {
            @Override
            public void onFailure(Call call, IOException e) {
                Log.e(TAG, "=== REQUEST FAILED ===");
                Log.e(TAG, "Error: " + e.getMessage());
                e.printStackTrace();
                callback.onError(e.getMessage());
            }

            @Override
            public void onResponse(Call call, Response response) throws IOException {
                String result = response.body().string();

                Log.d(TAG, "=== RESPONSE RECEIVED ===");
                Log.d(TAG, "Response Code: " + response.code());
                Log.d(TAG, "Response Body: " + result);

                if (response.isSuccessful()) {
                    callback.onSuccess(result);
                } else {
                    callback.onError("HTTP " + response.code() + ": " + result);
                }
            }
        });
    }
}