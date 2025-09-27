package com.vanilla.mapotek.database;

import android.content.Context;
import android.content.SharedPreferences;
import android.os.AsyncTask;
import org.json.JSONObject;
import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.io.OutputStream;
import java.net.HttpURLConnection;
import java.net.URL;

public class supabaseAuth {

    private static final String SUPABASE_URL = "https://brhaksondhloibpwtrdo.supabase.co";
    private static final String SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJyaGFrc29uZGhsb2licHd0cmRvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY1NDIxNDksImV4cCI6MjA3MjExODE0OX0.sHs9TbfPP38A5ikNFoZlOBJ67T1wtDiFMepEJn9ctfg";

    private static final String PREFS_NAME = "SupabaseAuth";
    private static final String KEY_ACCESS_TOKEN = "access_token";

    public interface AuthCallback {
        void onSuccess(String accessToken);
        void onError(String error);
    }

    // Sign up a new user
    public static void signUp(Context context, String email, String password, AuthCallback callback) {
        new AuthTask(context, "signup", email, password, callback).execute();
    }

    // Sign in existing user
    public static void signIn(Context context, String email, String password, AuthCallback callback) {
        new AuthTask(context, "signin", email, password, callback).execute();
    }

    // Get stored access token
    public static String getAccessToken(Context context) {
        SharedPreferences prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE);
        return prefs.getString(KEY_ACCESS_TOKEN, "");
    }

    // Save access token
    private static void saveAccessToken(Context context, String token) {
        SharedPreferences prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE);
        prefs.edit().putString(KEY_ACCESS_TOKEN, token).apply();
    }

    // Clear session (logout)
    public static void signOut(Context context) {
        SharedPreferences prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE);
        prefs.edit().clear().apply();
    }

    private static class AuthTask extends AsyncTask<Void, Void, String> {
        private Context context;
        private String type; // "signup" or "signin"
        private String email;
        private String password;
        private AuthCallback callback;
        private Exception exception;

        AuthTask(Context context, String type, String email, String password, AuthCallback callback) {
            this.context = context;
            this.type = type;
            this.email = email;
            this.password = password;
            this.callback = callback;
        }

        @Override
        protected String doInBackground(Void... voids) {
            try {
                String endpoint = type.equals("signup") ? "/auth/v1/signup" : "/auth/v1/token?grant_type=password";
                URL url = new URL(SUPABASE_URL + endpoint);
                HttpURLConnection connection = (HttpURLConnection) url.openConnection();

                connection.setRequestProperty("apikey", SUPABASE_KEY);
                connection.setRequestProperty("Content-Type", "application/json");
                connection.setRequestMethod("POST");
                connection.setDoOutput(true);

                JSONObject credentials = new JSONObject();
                credentials.put("email", email);
                credentials.put("password", password);

                OutputStream os = connection.getOutputStream();
                os.write(credentials.toString().getBytes("UTF-8"));
                os.close();

                BufferedReader reader = new BufferedReader(
                        new InputStreamReader(connection.getInputStream()));
                StringBuilder result = new StringBuilder();
                String line;
                while ((line = reader.readLine()) != null) {
                    result.append(line);
                }
                reader.close();

                return result.toString();

            } catch (Exception e) {
                exception = e;
                return null;
            }
        }

        @Override
        protected void onPostExecute(String result) {
            if (exception != null) {
                callback.onError(exception.getMessage());
                return;
            }

            try {
                JSONObject response = new JSONObject(result);
                String accessToken = response.getString("access_token");

                // Save token
                saveAccessToken(context, accessToken);

                callback.onSuccess(accessToken);

            } catch (Exception e) {
                callback.onError("Failed to parse response: " + e.getMessage());
            }
        }
    }
}