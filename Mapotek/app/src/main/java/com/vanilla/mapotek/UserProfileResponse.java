package com.vanilla.mapotek;

import com.google.gson.annotations.SerializedName;

public class UserProfileResponse {
    @SerializedName("success")
    private boolean success;

    @SerializedName("data")
    private UserData data;

    @SerializedName("message")
    private String message;

    public boolean isSuccess() {
        return success;
    }

    public UserData getData() {
        return data;
    }

    public String getMessage() {
        return message;
    }

    public static class UserData {
        @SerializedName("id")
        private String id;

        @SerializedName("email")
        private String email;

        @SerializedName("name")
        private String name;

        @SerializedName("nik")
        private String nik;

        @SerializedName("full_name")
        private String fullName;

        @SerializedName("birth_date")
        private String birthDate;

        @SerializedName("address")
        private String address;

        @SerializedName("profile_photo_url")
        private String profilePhotoUrl;

        // Getters
        public String getId() { return id; }
        public String getEmail() { return email; }
        public String getName() { return name; }
        public String getNik() { return nik; }
        public String getFullName() { return fullName; }
        public String getBirthDate() { return birthDate; }
        public String getAddress() { return address; }
        public String getProfilePhotoUrl() { return profilePhotoUrl; }
    }
}