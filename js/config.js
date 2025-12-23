// Global configuration
// NOTE: These keys are exposed for development/preview purposes.
// In the production deployment (GitHub Pages), these values are replaced
// by the GitHub Secrets via the .github/workflows/deploy.yml workflow.
export const GEMINI_MODEL_ID = "gemini-2.5-flash-preview-09-2025";

export const API_KEYS = {
    // Shared key for ADTMC pages
    ADTMC: "AIzaSyDUEbCL9xRaRB5jsDj3JNY985jxBp-gdws",

    // Shared key for Cardiology and ICU
    CARDIOLOGY: "AIzaSyDuDdz2_vEtk48eHM4mnKTW5FRnUQ-P-5A",

    // Shared key for IM and Pediatrics
    IM: "AIzaSyDzAymkb0bIZ7c11rfqcw85eHMc0B-m168",

    // Shared key for Journal Club pages
    JOURNAL_CLUB: "AIzaSyAzk0ixnzWq07XrCB6laXHSu96k_X4_o",

    // Unique keys
    NEUROLOGY: "AIzaSyCzVEg5gtXcQhhx866u-5zwLFCxHw1M",
    ORTHOPEDICS: "AIzaSyDJPVQR_JC2YTROVK2W6UZruJtU2c4fU",
    PSYCHIATRY: "AIzaSyA5t-mwc_9QDR-yFcRNw3JYfljwqwgU9c",

    // Shared key for Rheumatology and 17 other consults
    RHEUMATOLOGY: "AIzaSyBJMITlbJVxqHgU2b6l5C9z-61z6s4",

    // Start Page / Dashboard key (matches ADTMC in legacy, using distinct mapping for clarity)
    START_PAGE: "AIzaSyDUEbCL9xRaRB5jsDj3JNY985jxBp-gdws"
};
