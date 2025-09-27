package com.vanilla.mapotek.auth;

import android.os.AsyncTask;
import org.json.JSONArray;
import org.json.JSONObject;
import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.net.HttpURLConnection;
import java.net.URL;
import java.util.ArrayList;
import java.util.List;

public class RegionApiHelper {

    // Free Indonesian region API
    private static final String BASE_URL = "https://www.emsifa.com/api-wilayah-indonesia/api";

    public interface RegionCallback {
        void onSuccess(List<Region> regions);
        void onError(String error);
    }

    public static class Region {
        public String id;
        public String name;

        public Region(String id, String name) {
            this.id = id;
            this.name = name;
        }

        @Override
        public String toString() {
            return name;
        }
    }

    // Get all provinces
    public static void getProvinces(RegionCallback callback) {
        new ApiTask(BASE_URL + "/provinces.json", callback).execute();
    }

    // Get cities by province ID
    public static void getCities(String provinceId, RegionCallback callback) {
        new ApiTask(BASE_URL + "/regencies/" + provinceId + ".json", callback).execute();
    }

    // Get districts by city ID
    public static void getDistricts(String cityId, RegionCallback callback) {
        new ApiTask(BASE_URL + "/districts/" + cityId + ".json", callback).execute();
    }

    // Get villages by district ID
    public static void getVillages(String districtId, RegionCallback callback) {
        new ApiTask(BASE_URL + "/villages/" + districtId + ".json", callback).execute();
    }

    private static class ApiTask extends AsyncTask<Void, Void, String> {
        private String url;
        private RegionCallback callback;
        private Exception exception;

        ApiTask(String url, RegionCallback callback) {
            this.url = url;
            this.callback = callback;
        }

        @Override
        protected String doInBackground(Void... voids) {
            try {
                URL apiUrl = new URL(url);
                HttpURLConnection connection = (HttpURLConnection) apiUrl.openConnection();
                connection.setRequestMethod("GET");
                connection.setConnectTimeout(10000);
                connection.setReadTimeout(10000);

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
                JSONArray jsonArray = new JSONArray(result);
                List<Region> regions = new ArrayList<>();

                for (int i = 0; i < jsonArray.length(); i++) {
                    JSONObject obj = jsonArray.getJSONObject(i);
                    regions.add(new Region(
                            obj.getString("id"),
                            obj.getString("name")
                    ));
                }

                callback.onSuccess(regions);

            } catch (Exception e) {
                callback.onError("Failed to parse response: " + e.getMessage());
            }
        }
    }
}