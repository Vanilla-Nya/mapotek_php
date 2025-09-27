package com.vanilla.mapotek.auth;

public class addressFormat {

    /**
     * Formats address according to your specification:
     * Provinsi nama(code),Kota nama(code),Kecamatan nama(code),Kelurahan nama(code),detail address
     *
     * Example output: "Jawa Timur(35),Surabaya(3578),Gubeng(357805),Airlangga(3578051001),Jl. Airlangga No. 123"
     */
    public static String formatAddress(
            String provinsiName, String provinsiCode,
            String kotaName, String kotaCode,
            String kecamatanName, String kecamatanCode,
            String kelurahanName, String kelurahanCode,
            String addressDetail) {

        StringBuilder address = new StringBuilder();

        // Provinsi nama(code)
        if (provinsiName != null && !provinsiName.isEmpty()) {
            address.append(provinsiName);
            if (provinsiCode != null && !provinsiCode.isEmpty()) {
                address.append("(").append(provinsiCode).append(")");
            }
        }

        // Kota nama(code)
        if (kotaName != null && !kotaName.isEmpty()) {
            if (address.length() > 0) address.append(",");
            address.append(kotaName);
            if (kotaCode != null && !kotaCode.isEmpty()) {
                address.append("(").append(kotaCode).append(")");
            }
        }

        // Kecamatan nama(code)
        if (kecamatanName != null && !kecamatanName.isEmpty()) {
            if (address.length() > 0) address.append(",");
            address.append(kecamatanName);
            if (kecamatanCode != null && !kecamatanCode.isEmpty()) {
                address.append("(").append(kecamatanCode).append(")");
            }
        }

        // Kelurahan nama(code)
        if (kelurahanName != null && !kelurahanName.isEmpty()) {
            if (address.length() > 0) address.append(",");
            address.append(kelurahanName);
            if (kelurahanCode != null && !kelurahanCode.isEmpty()) {
                address.append("(").append(kelurahanCode).append(")");
            }
        }

        // Detail address
        if (addressDetail != null && !addressDetail.isEmpty()) {
            if (address.length() > 0) address.append(",");
            address.append(addressDetail);
        }

        return address.toString();
    }

    /**
     * Parse formatted address back to components
     */
    public static class AddressComponents {
        public String provinsiName, provinsiCode;
        public String kotaName, kotaCode;
        public String kecamatanName, kecamatanCode;
        public String kelurahanName, kelurahanCode;
        public String addressDetail;
    }

    public static AddressComponents parseAddress(String formattedAddress) {
        AddressComponents components = new AddressComponents();

        if (formattedAddress == null || formattedAddress.isEmpty()) {
            return components;
        }

        String[] parts = formattedAddress.split(",");

        if (parts.length >= 1) {
            extractNameAndCode(parts[0], (name, code) -> {
                components.provinsiName = name;
                components.provinsiCode = code;
            });
        }

        if (parts.length >= 2) {
            extractNameAndCode(parts[1], (name, code) -> {
                components.kotaName = name;
                components.kotaCode = code;
            });
        }

        if (parts.length >= 3) {
            extractNameAndCode(parts[2], (name, code) -> {
                components.kecamatanName = name;
                components.kecamatanCode = code;
            });
        }

        if (parts.length >= 4) {
            extractNameAndCode(parts[3], (name, code) -> {
                components.kelurahanName = name;
                components.kelurahanCode = code;
            });
        }

        if (parts.length >= 5) {
            components.addressDetail = parts[4].trim();
        }

        return components;
    }

    private interface NameCodeCallback {
        void onExtract(String name, String code);
    }

    private static void extractNameAndCode(String part, NameCodeCallback callback) {
        part = part.trim();
        if (part.contains("(") && part.contains(")")) {
            int openParen = part.indexOf("(");
            int closeParen = part.indexOf(")");
            String name = part.substring(0, openParen).trim();
            String code = part.substring(openParen + 1, closeParen).trim();
            callback.onExtract(name, code);
        } else {
            callback.onExtract(part, "");
        }
    }
}