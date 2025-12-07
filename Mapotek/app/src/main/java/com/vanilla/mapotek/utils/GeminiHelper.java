package com.vanilla.mapotek.utils;

import android.content.Context;
import android.util.Log;
import org.json.JSONArray;
import org.json.JSONObject;
import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.io.OutputStream;
import java.net.HttpURLConnection;
import java.net.URL;
import java.nio.charset.StandardCharsets;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

public class GeminiHelper {

    private static final String TAG = "GeminiHelper";

    // ✅ Your Gemini API key
    private static final String API_KEY = "AIzaSyCR7TE2IzzpjyKPd3MnHb1MWuEkLrGkFD4";
    // Using v1 API with gemini-1.5-flash-latest
    private static final String API_URL = "https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash-latest:generateContent?key=" + API_KEY;

    private final ExecutorService executorService;
    private final Context context;

    // System prompt to restrict chatbot to medical topics only
    private static final String SYSTEM_PROMPT =
            "Anda adalah asisten medis virtual yang membantu pengguna dengan informasi kesehatan umum. " +
                    "ATURAN PENTING:\n" +
                    "1. Hanya jawab pertanyaan yang berkaitan dengan kesehatan, medis, penyakit, gejala, pengobatan, dan topik kesehatan umum.\n" +
                    "2. Jika pertanyaan tidak berkaitan dengan kesehatan, dengan sopan arahkan pengguna kembali ke topik medis.\n" +
                    "3. Selalu berikan disclaimer bahwa Anda bukan pengganti dokter profesional.\n" +
                    "4. Sarankan untuk konsultasi dengan dokter jika gejala serius.\n" +
                    "5. Gunakan bahasa Indonesia yang mudah dipahami.\n" +
                    "6. Jangan memberikan diagnosa pasti, hanya informasi umum.\n" +
                    "7. Jawab dengan singkat dan jelas (maksimal 200 kata).\n\n" +
                    "Jika ada pertanyaan non-medis, balas: 'Maaf, saya hanya dapat membantu dengan pertanyaan terkait kesehatan. Ada yang bisa saya bantu mengenai kesehatan Anda?'\n\n";

    public interface ChatCallback {
        void onSuccess(String response);
        void onError(String error);
    }

    public GeminiHelper(Context context) {
        this.context = context;
        this.executorService = Executors.newSingleThreadExecutor();
    }

    public void sendMessage(String userMessage, ChatCallback callback) {
        executorService.execute(() -> {
            try {
                // Combine system prompt with user message
                String fullPrompt = SYSTEM_PROMPT + "Pertanyaan: " + userMessage;

                // Create request body for Gemini
                JSONObject requestBody = new JSONObject();

                // Create contents array
                JSONArray contents = new JSONArray();
                JSONObject content = new JSONObject();

                // Create parts array
                JSONArray parts = new JSONArray();
                JSONObject part = new JSONObject();
                part.put("text", fullPrompt);
                parts.put(part);

                content.put("parts", parts);
                contents.put(content);

                requestBody.put("contents", contents);

                // Optional: Add generation config for better control
                JSONObject generationConfig = new JSONObject();
                generationConfig.put("temperature", 0.7);
                generationConfig.put("maxOutputTokens", 500);
                requestBody.put("generationConfig", generationConfig);

                Log.d(TAG, "Sending request to Gemini API");
                Log.d(TAG, "Request body: " + requestBody.toString());

                // Setup HTTP connection
                URL url = new URL(API_URL);
                HttpURLConnection conn = (HttpURLConnection) url.openConnection();
                conn.setRequestMethod("POST");
                conn.setRequestProperty("Content-Type", "application/json");
                conn.setDoOutput(true);
                conn.setConnectTimeout(30000);
                conn.setReadTimeout(30000);

                // Send request
                try (OutputStream os = conn.getOutputStream()) {
                    byte[] input = requestBody.toString().getBytes(StandardCharsets.UTF_8);
                    os.write(input, 0, input.length);
                }

                // Read response
                int responseCode = conn.getResponseCode();
                Log.d(TAG, "Response code: " + responseCode);

                if (responseCode == HttpURLConnection.HTTP_OK) {
                    BufferedReader br = new BufferedReader(
                            new InputStreamReader(conn.getInputStream(), StandardCharsets.UTF_8)
                    );
                    StringBuilder response = new StringBuilder();
                    String line;

                    while ((line = br.readLine()) != null) {
                        response.append(line);
                    }
                    br.close();

                    Log.d(TAG, "Response: " + response.toString());

                    // Parse Gemini response
                    JSONObject jsonResponse = new JSONObject(response.toString());

                    if (jsonResponse.has("candidates")) {
                        JSONArray candidates = jsonResponse.getJSONArray("candidates");

                        if (candidates.length() > 0) {
                            JSONObject candidate = candidates.getJSONObject(0);
                            JSONObject contentObj = candidate.getJSONObject("content");
                            JSONArray partsArray = contentObj.getJSONArray("parts");

                            if (partsArray.length() > 0) {
                                JSONObject partObj = partsArray.getJSONObject(0);
                                String botResponse = partObj.getString("text").trim();

                                Log.d(TAG, "Bot response: " + botResponse);
                                callback.onSuccess(botResponse);
                            } else if (responseCode == 429) {
                                // Rate limit exceeded - show user-friendly message
                                Log.e(TAG, "Rate limit exceeded - waiting before retry");
                                callback.onError("Terlalu banyak permintaan. Silakan tunggu beberapa detik dan coba lagi.");
                            } else {
                                callback.onError("Tidak ada respons dari server");
                            }
                        } else {
                            callback.onError("Tidak ada kandidat respons");
                        }
                    } else {
                        callback.onError("Format respons tidak valid");
                    }
                } else {
                    // Read error response
                    BufferedReader br = new BufferedReader(
                            new InputStreamReader(conn.getErrorStream(), StandardCharsets.UTF_8)
                    );
                    StringBuilder errorResponse = new StringBuilder();
                    String line;

                    while ((line = br.readLine()) != null) {
                        errorResponse.append(line);
                    }
                    br.close();

                    Log.e(TAG, "Error response: " + errorResponse.toString());
                    callback.onError("Error: " + responseCode + " - Periksa API key Anda");
                }

                conn.disconnect();

            } catch (Exception e) {
                Log.e(TAG, "Error calling Gemini API: " + e.getMessage(), e);
                callback.onError("Gagal terhubung ke server: " + e.getMessage());
            }
        });
    }

    public void shutdown() {
        if (executorService != null && !executorService.isShutdown()) {
            executorService.shutdown();
        }
    }
}