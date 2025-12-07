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

public class OpenAIHelper {

    private static final String TAG = "OpenAIHelper";
    private static final String API_URL = "https://api.openai.com/v1/chat/completions";

    // ⚠️ IMPORTANT: Replace with your OpenAI API key
    // For production, store this securely (e.g., in BuildConfig or remote config)
    private static final String API_KEY = "AIzaSyCR7TE2IzzpjyKPd3MnHb1MWuEkLrGkFD4";

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
                    "Jika ada pertanyaan non-medis, balas: 'Maaf, saya hanya dapat membantu dengan pertanyaan terkait kesehatan. Ada yang bisa saya bantu mengenai kesehatan Anda?'";

    public interface ChatCallback {
        void onSuccess(String response);
        void onError(String error);
    }

    public OpenAIHelper(Context context) {
        this.context = context;
        this.executorService = Executors.newSingleThreadExecutor();
    }

    public void sendMessage(String userMessage, ChatCallback callback) {
        executorService.execute(() -> {
            try {
                // Create request body
                JSONObject requestBody = new JSONObject();
                requestBody.put("model", "gpt-3.5-turbo");
                requestBody.put("max_tokens", 500);
                requestBody.put("temperature", 0.7);

                // Add messages array with system prompt
                JSONArray messages = new JSONArray();

                // System message to set behavior
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

                // Read response
                int responseCode = conn.getResponseCode();

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

                    // Parse response
                    JSONObject jsonResponse = new JSONObject(response.toString());
                    JSONArray choices = jsonResponse.getJSONArray("choices");

                    if (choices.length() > 0) {
                        JSONObject choice = choices.getJSONObject(0);
                        JSONObject message = choice.getJSONObject("message");
                        String botResponse = message.getString("content").trim();

                        callback.onSuccess(botResponse);
                    } else {
                        callback.onError("Tidak ada respons dari server");
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
                    callback.onError("Error: " + responseCode + " - " + errorResponse.toString());
                }

                conn.disconnect();

            } catch (Exception e) {
                Log.e(TAG, "Error calling OpenAI API: " + e.getMessage(), e);
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