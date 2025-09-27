package com.vanilla.mapotek.auth;

import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;

public class AuthManager {
    private static final String PREFS_NAME = "auth_prefs";
    private static final String KEY_ACCESS_TOKEN = "access_token";
    private static final String KEY_USER_ID = "user_id";
    private static final String KEY_IS_LOGGED_IN = "is_logged_in";

    public static final String ACTION_AUTH_STATE_CHANGED = "com.vanilla.mapotek.auth.AUTH_STATE_CHANGED";

    private Context context;
    private SharedPreferences prefs;

    public AuthManager(Context context) {
        this.context = context;
        this.prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE);
    }

    // Save Login State
    public void saveLoginState(String accessToken, String userId) {
        prefs.edit().putString(KEY_ACCESS_TOKEN, accessToken).putString(KEY_USER_ID, userId).putBoolean(KEY_IS_LOGGED_IN, true).apply();

        // Broadcast Change
        Intent intent = new Intent(ACTION_AUTH_STATE_CHANGED);
        intent.putExtra("isLoggedIn", true);
        context.sendBroadcast(intent);
    }
    // Clear login state
    public void logout() {
        prefs.edit().clear().apply();

        // Broadcast change
        Intent intent = new Intent(ACTION_AUTH_STATE_CHANGED);
        intent.putExtra("isLoggedIn", false);
        context.sendBroadcast(intent);
    }

    // Check if logged in
    public boolean isLoggedIn() {
        return prefs.getBoolean(KEY_IS_LOGGED_IN, false);
    }

    public String getAccessToken() {
        return prefs.getString(KEY_ACCESS_TOKEN, null);
    }

    public String getUserId() {
        return prefs.getString(KEY_USER_ID, null);
    }
}
