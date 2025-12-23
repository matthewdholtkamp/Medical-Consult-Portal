// Global configuration
// NOTE: This file is a placeholder for local development safety.
// In production (GitHub Pages), this file is OVERWRITTEN by the .github/workflows/deploy.yml workflow
// which injects the actual API keys from GitHub Secrets.

export const GEMINI_MODEL_ID = "gemini-1.5-flash";

export const API_KEYS = {
    // Keys are injected at build time.
    // Locally, you must use a local override or environment variables if you need to test API calls.
    ADTMC: "",
    CARDIOLOGY: "",
    IM: "",
    JOURNAL_CLUB: "",
    NEUROLOGY: "",
    ORTHOPEDICS: "",
    PSYCHIATRY: "",
    RHEUMATOLOGY: "",
    START_PAGE: ""
};
