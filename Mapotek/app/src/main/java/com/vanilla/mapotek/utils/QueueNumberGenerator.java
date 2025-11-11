package com.vanilla.mapotek.utils;

import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.Locale;

public class QueueNumberGenerator {

    /**
     * Generate queue number from last number
     * Format: [Counter][DDMMYY]
     * Example: 1101025 = 1st person on 10 Oct 2025
     */
    public static String generateFromLast(String lastQueueNumber) {
        String todayDate = getTodayDateCode(); // "101025"

        if (lastQueueNumber == null || lastQueueNumber.isEmpty()) {
            // First queue of the day
            return "1" + todayDate;
        }

        try {
            // Extract date from last queue number
            // Example: "3101025" → extract "101025"
            String lastDate = lastQueueNumber.substring(lastQueueNumber.length() - 6);

            // Check if it's same day
            if (lastDate.equals(todayDate)) {
                // Same day - extract counter and increment
                // Example: "3101025" → extract "3" → increment to "4"
                String counterStr = lastQueueNumber.substring(0, lastQueueNumber.length() - 6);
                int counter = Integer.parseInt(counterStr);
                return (counter + 1) + todayDate;
            } else {
                // New day - reset counter to 1
                return "1" + todayDate;
            }
        } catch (Exception e) {
            // Error parsing - start fresh
            return "1" + todayDate;
        }
    }

    /**
     * Get today's date in DDMMYY format
     * Example: 10 Oct 2025 → "101025"
     */
    private static String getTodayDateCode() {
        SimpleDateFormat sdf = new SimpleDateFormat("ddMMyy", Locale.getDefault());
        return sdf.format(new Date());
    }
}