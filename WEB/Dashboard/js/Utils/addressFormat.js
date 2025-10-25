/**
 * Address Formatting Utilities
 * Similar to the Java addressFormat class
 */

class AddressFormat {
    /**
     * Format address with region codes
     * @param {Object} params - Address components
     * @returns {string} Formatted address
     */
    static format({
        provinsiName = '',
        provinsiCode = '',
        kotaName = '',
        kotaCode = '',
        kecamatanName = '',
        kecamatanCode = '',
        kelurahanName = '',
        kelurahanCode = '',
        addressDetail = ''
    }) {
        const parts = [];

        // Provinsi nama(code)
        if (provinsiName) {
            let part = provinsiName;
            if (provinsiCode) {
                part += `(${provinsiCode})`;
            }
            parts.push(part);
        }

        // Kota nama(code)
        if (kotaName) {
            let part = kotaName;
            if (kotaCode) {
                part += `(${kotaCode})`;
            }
            parts.push(part);
        }

        // Kecamatan nama(code)
        if (kecamatanName) {
            let part = kecamatanName;
            if (kecamatanCode) {
                part += `(${kecamatanCode})`;
            }
            parts.push(part);
        }

        // Kelurahan nama(code)
        if (kelurahanName) {
            let part = kelurahanName;
            if (kelurahanCode) {
                part += `(${kelurahanCode})`;
            }
            parts.push(part);
        }

        // Detail address
        if (addressDetail) {
            parts.push(addressDetail);
        }

        return parts.join(',');
    }

    /**
     * Parse formatted address back to components
     * @param {string} formattedAddress - Formatted address string
     * @returns {Object} Address components
     */
    static parse(formattedAddress) {
        const components = {
            provinsiName: '',
            provinsiCode: '',
            kotaName: '',
            kotaCode: '',
            kecamatanName: '',
            kecamatanCode: '',
            kelurahanName: '',
            kelurahanCode: '',
            addressDetail: ''
        };

        if (!formattedAddress || formattedAddress.trim() === '') {
            return components;
        }

        const parts = formattedAddress.split(',').map(p => p.trim());

        if (parts.length >= 1) {
            const extracted = this.extractNameAndCode(parts[0]);
            components.provinsiName = extracted.name;
            components.provinsiCode = extracted.code;
        }

        if (parts.length >= 2) {
            const extracted = this.extractNameAndCode(parts[1]);
            components.kotaName = extracted.name;
            components.kotaCode = extracted.code;
        }

        if (parts.length >= 3) {
            const extracted = this.extractNameAndCode(parts[2]);
            components.kecamatanName = extracted.name;
            components.kecamatanCode = extracted.code;
        }

        if (parts.length >= 4) {
            const extracted = this.extractNameAndCode(parts[3]);
            components.kelurahanName = extracted.name;
            components.kelurahanCode = extracted.code;
        }

        if (parts.length >= 5) {
            components.addressDetail = parts[4];
        }

        return components;
    }

    /**
     * Extract name and code from a part like "Name(Code)"
     * @param {string} part - Part of address
     * @returns {Object} Name and code
     */
    static extractNameAndCode(part) {
        part = part.trim();
        
        if (part.includes('(') && part.includes(')')) {
            const openParen = part.indexOf('(');
            const closeParen = part.indexOf(')');
            
            const name = part.substring(0, openParen).trim();
            const code = part.substring(openParen + 1, closeParen).trim();
            
            return { name, code };
        }
        
        return { name: part, code: '' };
    }

    /**
     * Get human-readable address (without codes)
     * @param {string} formattedAddress - Formatted address with codes
     * @returns {string} Human-readable address
     */
    static toReadable(formattedAddress) {
        const components = this.parse(formattedAddress);
        const parts = [];

        if (components.kelurahanName) parts.push(components.kelurahanName);
        if (components.kecamatanName) parts.push(components.kecamatanName);
        if (components.kotaName) parts.push(components.kotaName);
        if (components.provinsiName) parts.push(components.provinsiName);
        if (components.addressDetail) parts.unshift(components.addressDetail);

        return parts.join(', ');
    }

    /**
     * Get short address (detail + kelurahan + kecamatan)
     * @param {string} formattedAddress - Formatted address with codes
     * @returns {string} Short address
     */
    static toShort(formattedAddress) {
        const components = this.parse(formattedAddress);
        const parts = [];

        if (components.addressDetail) parts.push(components.addressDetail);
        if (components.kelurahanName) parts.push(components.kelurahanName);
        if (components.kecamatanName) parts.push(components.kecamatanName);

        return parts.join(', ');
    }

    /**
     * Get region only (without detail address)
     * @param {string} formattedAddress - Formatted address with codes
     * @returns {string} Region address
     */
    static toRegionOnly(formattedAddress) {
        const components = this.parse(formattedAddress);
        const parts = [];

        if (components.kelurahanName) parts.push(components.kelurahanName);
        if (components.kecamatanName) parts.push(components.kecamatanName);
        if (components.kotaName) parts.push(components.kotaName);
        if (components.provinsiName) parts.push(components.provinsiName);

        return parts.join(', ');
    }

    /**
     * Validate address format
     * @param {string} formattedAddress - Address to validate
     * @returns {boolean} Is valid
     */
    static isValid(formattedAddress) {
        if (!formattedAddress || formattedAddress.trim() === '') {
            return false;
        }

        const components = this.parse(formattedAddress);
        
        // At minimum, should have provinsi, kota, kecamatan
        return !!(components.provinsiName && 
                  components.kotaName && 
                  components.kecamatanName);
    }
}

// Example usage:
/*
// Format address
const formatted = AddressFormat.format({
    provinsiName: 'JAWA TIMUR',
    provinsiCode: '35',
    kotaName: 'KABUPATEN JEMBER',
    kotaCode: '35.09',
    kecamatanName: 'SUMBERSARI',
    kecamatanCode: '35.09.18',
    kelurahanName: 'TEGALGEDE',
    kelurahanCode: '35.09.18.2004',
    addressDetail: 'Jl. Kalimantan No. 123, RT 02/RW 03'
});
// Output: "JAWA TIMUR(35),KABUPATEN JEMBER(35.09),SUMBERSARI(35.09.18),TEGALGEDE(35.09.18.2004),Jl. Kalimantan No. 123, RT 02/RW 03"

// Parse address
const components = AddressFormat.parse(formatted);
console.log(components.provinsiName); // "JAWA TIMUR"
console.log(components.provinsiCode); // "35"

// Get readable format
const readable = AddressFormat.toReadable(formatted);
// Output: "Jl. Kalimantan No. 123, RT 02/RW 03, TEGALGEDE, SUMBERSARI, KABUPATEN JEMBER, JAWA TIMUR"

// Get short format
const short = AddressFormat.toShort(formatted);
// Output: "Jl. Kalimantan No. 123, RT 02/RW 03, TEGALGEDE, SUMBERSARI"

// Validate
const isValid = AddressFormat.isValid(formatted);
// Output: true
*/

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AddressFormat;
}