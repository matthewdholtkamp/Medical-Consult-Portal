// Safe default config checked into git.
// Deploys and local setup should overwrite this file with generate_config.sh.

export const GEMINI_MODEL_ID = "gemini-3.1-flash-lite-preview";

const SHARED_GEMINI_API_KEY = "";

function getSharedGeminiApiKey() {
    return SHARED_GEMINI_API_KEY;
}

export const API_KEYS = {
    get ADTMC() { return getSharedGeminiApiKey(); },
    get CARDIOLOGY() { return getSharedGeminiApiKey(); },
    get DEFAULT() { return getSharedGeminiApiKey(); },
    get IM() { return getSharedGeminiApiKey(); },
    get JOURNAL_CLUB() { return getSharedGeminiApiKey(); },
    get NEUROLOGY() { return getSharedGeminiApiKey(); },
    get ORTHOPEDICS() { return getSharedGeminiApiKey(); },
    get PSYCHIATRY() { return getSharedGeminiApiKey(); },
    get RHEUMATOLOGY() { return getSharedGeminiApiKey(); },
    get START_PAGE() { return getSharedGeminiApiKey(); }
};
