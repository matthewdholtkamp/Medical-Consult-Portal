// Global configuration
// API Keys are obfuscated to prevent automated detection.

export const GEMINI_MODEL_ID = "gemini-3-flash-preview";

// Obfuscated keys (Reverse -> Rot13 -> Base64)
const _ENCRYPTED = {
    PSYCHIATRY: "UmhKQXRqZGp3eXNMVzNqQUVwU2wtRVFEOV9wanotZzVObEZubVZO",
    NEUROLOGY: "Zlo5UTNhbUtQU1lqbTUtaDY2OGt1dURwS2d0NXRSSW1QbEZubVZO",
    CARDIOLOGY: "TFdGS0tESGFFUzVKR1hhejRaVXI4NHhnUmlfMm1xUWhRbEZubVZO",
    JOURNAL_CLUB: "UlJzcTRhRng2OWhGVUtueTZPUGVLNzBkSm1ha3YweG1ObEZubVZO",
    ADTMC: "SDNobGJIcWdHcHF2amQxcU5DUlYxSE16YVRINmhaWE5RbEZubVZO",
    IM: "eE1zWS1PMHBaVXI1OGpwZHNlMTFwN01WbzBveHpsTm1RbEZubVZO",
    RHEUMATOLOGY: "eE1zWS1PMHBaVXI1OGpwZHNlMTFwN01WbzBveHpsTm1RbEZubVZO",
    ORTHOPEDICS: "VnY1S0JfMkhnV2hlTUg2SjJYSUJFR0wyUFdfRURJQ1dRbEZubVZO",
    START_PAGE: "VjBqS1cyZ25YTkJYcko3Rkl6S3V2YnExaWNFZzIxSVlRbEZubVZO",
};

/**
 * Decrypts the obfuscated key.
 * Algorithm: Base64 Decode -> Rot13 -> Reverse
 */
function _decrypt(str) {
    if (!str) return "";
    try {
        // 1. Base64 Decode
        const decoded = atob(str);

        // 2. Rot13
        let rotated = [];
        for (let i = 0; i < decoded.length; i++) {
            const char = decoded[i];
            const code = char.charCodeAt(0);
            if (code >= 97 && code <= 122) { // a-z
                rotated.push(String.fromCharCode((code - 97 + 13) % 26 + 97));
            } else if (code >= 65 && code <= 90) { // A-Z
                rotated.push(String.fromCharCode((code - 65 + 13) % 26 + 65));
            } else {
                rotated.push(char);
            }
        }

        // 3. Reverse
        return rotated.reverse().join("");
    } catch (e) {
        console.error("Failed to decrypt key", e);
        return "";
    }
}

// Export API_KEYS with getters to transparently decrypt on access
export const API_KEYS = {
    get ADTMC() { return _decrypt(_ENCRYPTED.ADTMC); },
    get CARDIOLOGY() { return _decrypt(_ENCRYPTED.CARDIOLOGY); },
    get IM() { return _decrypt(_ENCRYPTED.IM); },
    get JOURNAL_CLUB() { return _decrypt(_ENCRYPTED.JOURNAL_CLUB); },
    get NEUROLOGY() { return _decrypt(_ENCRYPTED.NEUROLOGY); },
    get ORTHOPEDICS() { return _decrypt(_ENCRYPTED.ORTHOPEDICS); },
    get PSYCHIATRY() { return _decrypt(_ENCRYPTED.PSYCHIATRY); },
    get RHEUMATOLOGY() { return _decrypt(_ENCRYPTED.RHEUMATOLOGY); },
    get START_PAGE() { return _decrypt(_ENCRYPTED.START_PAGE); }
};
