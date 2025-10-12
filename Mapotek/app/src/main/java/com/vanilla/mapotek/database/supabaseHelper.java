package com.vanilla.mapotek.database;

import android.content.Context;
import org.json.JSONObject;
import java.io.IOException;

import okhttp3.Call;
import okhttp3.Callback;
import okhttp3.MediaType;
import okhttp3.OkHttpClient;
import okhttp3.Request;
import okhttp3.RequestBody;
import okhttp3.Response;

public class supabaseHelper {

    private static final String SUPABASE_URL = "https://brhaksondhloibpwtrdo.supabase.co";
    private static final String SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJyaGFrc29uZGhsb2licHd0cmRvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY1NDIxNDksImV4cCI6MjA3MjExODE0OX0.sHs9TbfPP38A5ikNFoZlOBJ67T1wtDiFMepEJn9ctfg";
    private static final OkHttpClient client = new OkHttpClient();

    public interface SupabaseCallback {
        void onSuccess(String response);
        void onError(String error);
    }

    // Register User
    public static void register(Context context, JSONObject data, Callback callback) {
        Request request = new Request.Builder()
                .url(SUPABASE_URL + "/auth/v1/signup")
                .addHeader("apikey", SUPABASE_KEY)
                .addHeader("Content-Type", "application/json")
                .post(RequestBody.create(data.toString(), MediaType.parse("application/json")))
                .build();

        client.newCall(request).enqueue(callback);
    }

    // Login User
    public static void login(Context context, JSONObject data, Callback callback) {
        Request request = new Request.Builder()
                .url(SUPABASE_URL + "/auth/v1/token?grant_type=password")
                .addHeader("apikey", SUPABASE_KEY)
                .addHeader("Content-Type", "application/json")
                .post(RequestBody.create(data.toString(), MediaType.parse("application/json")))
                .build();

        client.newCall(request).enqueue(callback);
    }

    // POST - Insert data
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

    // GET - Select data
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

    // PATCH - Update data
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

    // DELETE - Delete data
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



    // Helper method to execute requests
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
}