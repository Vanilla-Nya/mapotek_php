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

public class GroqHelper {

    private static final String TAG = "GroqHelper";
    private static final String API_URL = "https://api.groq.com/openai/v1/chat/completions";

    // ⚠️ Get FREE API key from https://console.groq.com/keys
    // Just sign up (free) and create a key - takes 30 seconds!
    private static final String API_KEY = "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";

    private final ExecutorService executorService;
    private final Context context;

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
                    "Jika ada pertanyaan non-medis, balas: 'Maaf, saya hanya dapat membantu dengan pertanyaan terkait kesehatan. Ada yang bisa saya bantu mengenai kesehatan Anda?'";

    public interface ChatCallback {
        void onSuccess(String response);
        void onError(String error);
    }

    public GroqHelper(Context context) {
        this.context = context;
        this.executorService = Executors.newSingleThreadExecutor();
    }

    public void sendMessage(String userMessage, ChatCallback callback) {
        executorService.execute(() -> {
            try {
                JSONObject requestBody = new JSONObject();

                // llama-3.3-70b-versatile is the best free model - very smart and fast!
                requestBody.put("model", "llama-3.3-70b-versatile");
                requestBody.put("max_tokens", 500);
                requestBody.put("temperature", 0.7);

                // Messages array
                JSONArray messages = new JSONArray();

                // System message
                JSONObject systemMessage = new JSONObject();
                systemMessage.put("role", "system");
                systemMessage.put("content", SYSTEM_PROMPT);
                messages.put(systemMessage);

                // User message
                JSONObject userMsg = new JSONObject();
                userMsg.put("role", "user");
                userMsg.put("content", userMessage);
                messages.put(userMsg);

                requestBody.put("messages", messages);

                Log.d(TAG, "Sending request to Groq API");

                // Setup HTTP connection
                URL url = new URL(API_URL);
                HttpURLConnection conn = (HttpURLConnection) url.openConnection();
                conn.setRequestMethod("POST");
                conn.setRequestProperty("Content-Type", "application/json");
                conn.setRequestProperty("Authorization", "Bearer " + API_KEY);
                conn.setDoOutput(true);
                conn.setConnectTimeout(30000);
                conn.setReadTimeout(30000);

                // Send request
                try (OutputStream os = conn.getOutputStream()) {
                    byte[] input = requestBody.toString().getBytes(StandardCharsets.UTF_8);
                    os.write(input, 0, input.length);
                }

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

                    // Parse response (same format as OpenAI)
                    JSONObject jsonResponse = new JSONObject(response.toString());
                    JSONArray choices = jsonResponse.getJSONArray("choices");

                    if (choices.length() > 0) {
                        JSONObject choice = choices.getJSONObject(0);
                        JSONObject message = choice.getJSONObject("message");
                        String botResponse = message.getString("content").trim();

                        Log.d(TAG, "Bot response: " + botResponse);
                        callback.onSuccess(botResponse);
                    } else {
                        callback.onError("Tidak ada respons dari server");
                    }
                } else if (responseCode == 429) {
                    // Rate limit exceeded
                    Log.e(TAG, "Rate limit exceeded");
                    callback.onError("Terlalu banyak permintaan. Silakan tunggu beberapa detik dan coba lagi.");
                } else if (responseCode == 401) {
                    // Invalid API key
                    Log.e(TAG, "Invalid API key");
                    callback.onError("API key tidak valid. Silakan periksa konfigurasi.");
                } else {
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
                    callback.onError("Error: " + responseCode);
                }

                conn.disconnect();

            } catch (Exception e) {
                Log.e(TAG, "Error calling Groq API: " + e.getMessage(), e);
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