package com.vanilla.mapotek;

import com.vanilla.mapotek.UserProfileResponse;
import retrofit2.Call;
import retrofit2.http.GET;
import retrofit2.http.Header;

public interface UserApiService {
    @GET("user/profile")
    Call<UserProfileResponse> getUserProfile(
            @Header("Authorization") String token
    );
}