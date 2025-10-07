package com.vanilla.mapotek.auth;

import android.content.Context;
import android.content.SharedPreferences;
import android.util.Log;

import com.vanilla.mapotek.UserApiService;
import com.vanilla.mapotek.UserProfileResponse;
import com.vanilla.mapotek.api.retrofitclient;

import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;

public class AuthManager {
    private static final String PREF_NAME = "AuthPrefs";
    private static final String KEY_ACCESS_TOKEN = "access_token";
    private static final String KEY_USER_ID = "user_id";
    private static final String KEY_IS_LOGGED_IN = "is_logged_in";
    private static final String KEY_USER_EMAIL = "user_email";
    private static final String KEY_USER_NAME = "user_name";

    private SharedPreferences sharedPreferences;
    private SharedPreferences.Editor editor;
    private Context context;

    public AuthManager(Context context) {
        this.context = context;
        this.sharedPreferences = context.getSharedPreferences(PREF_NAME, Context.MODE_PRIVATE);
        this.editor = sharedPreferences.edit();
    }

    // Callback interface for async operations
    public interface AuthCallback {
        void onSuccess();
        void onError(String error);
    }

    // Save login state
    public void saveLoginState(String accessToken, String userId) {
        editor.putString(KEY_ACCESS_TOKEN, accessToken);
        editor.putString(KEY_USER_ID, userId);
        editor.putBoolean(KEY_IS_LOGGED_IN, true);
        editor.apply();
    }

    // Save additional user info
    public void saveUserInfo(String email, String name) {
        editor.putString(KEY_USER_EMAIL, email);
        editor.putString(KEY_USER_NAME, name);
        editor.apply();
    }

    // Check if user is logged in
    public boolean isLoggedIn() {
        return sharedPreferences.getBoolean(KEY_IS_LOGGED_IN, false);
    }

    // Get access token
    public String getAccessToken() {
        return sharedPreferences.getString(KEY_ACCESS_TOKEN, null);
    }

    // Get user ID
    public String getUserId() {
        return sharedPreferences.getString(KEY_USER_ID, null);
    }

    // Get user email
    public String getUserEmail() {
        return sharedPreferences.getString(KEY_USER_EMAIL, null);
    }

    // Get user name
    public String getUserName() {
        return sharedPreferences.getString(KEY_USER_NAME, null);
    }

    // Clear all auth data (logout)
    public void logout() {
        editor.clear();
        editor.apply();
    }

    // Check if token is still valid (basic check)
    public boolean isTokenValid() {
        String token = getAccessToken();
        if (token == null || token.isEmpty()) {
            return false;
        }

        // You can add more validation here like checking token expiry
        // For now, we just check if token exists
        return true;
    }

    // Verify token with server by calling getUserProfile
    public void verifyToken(AuthCallback callback) {
        String token = getAccessToken();

        if (token == null || token.isEmpty()) {
            Log.e("AuthManager", "No token available for verification");
            callback.onError("No token available");
            return;
        }

        Log.d("AuthManager", "Verifying token with server...");

        try {
            // Use your existing UserApiService
            UserApiService apiService = retrofitclient.getInstance().create(UserApiService.class);

            // Call getUserProfile to verify the token
            Call<UserProfileResponse> call = apiService.getUserProfile("Bearer " + token);

            call.enqueue(new Callback<UserProfileResponse>() {
                @Override
                public void onResponse(Call<UserProfileResponse> call, Response<UserProfileResponse> response) {
                    if (response.isSuccessful() && response.body() != null) {
                        Log.d("AuthManager", "Token verification successful");

                        // Optionally update user info from response
                        UserProfileResponse userProfile = response.body();

                        callback.onSuccess();
                    } else {
                        Log.e("AuthManager", "Token verification failed - Status: " + response.code());

                        // Handle specific error codes
                        if (response.code() == 401 || response.code() == 403) {
                            callback.onError("Token expired or invalid");
                        } else {
                            callback.onError("Verification failed: " + response.code());
                        }
                    }
                }

                @Override
                public void onFailure(Call<UserProfileResponse> call, Throwable t) {
                    Log.e("AuthManager", "Token verification network error: " + t.getMessage());
                    callback.onError("Network error: " + t.getMessage());
                }
            });

        } catch (Exception e) {
            Log.e("AuthManager", "Error during token verification: " + e.getMessage());
            callback.onError("Verification error: " + e.getMessage());
        }
    }
}