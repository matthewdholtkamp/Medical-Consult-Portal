#!/bin/bash

set -euo pipefail

CONFIG_FILE="js/config.js"
ENV_FILE=".env"
GEMINI_MODEL_ID="${GEMINI_MODEL_ID:-gemini-3.1-flash-lite-preview}"

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${YELLOW}Starting configuration generation...${NC}"

if [ -z "${KEY_ADTMC:-}" ] && [ -f "$ENV_FILE" ]; then
    set -a
    . "$ENV_FILE"
    set +a
fi

if [ -z "${KEY_ADTMC:-}" ]; then
    echo -e "${RED}Error: KEY_ADTMC is not set.${NC}"
    echo "Set KEY_ADTMC in the environment or in .env before running this script."
    exit 1
fi

echo -e "${YELLOW}Generating $CONFIG_FILE from shared KEY_ADTMC...${NC}"

cat <<EOF > "$CONFIG_FILE"
// Generated file. Do not commit real secrets.
export const GEMINI_MODEL_ID = "${GEMINI_MODEL_ID}";

const SHARED_GEMINI_API_KEY = "${KEY_ADTMC}";

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
EOF

echo -e "${GREEN}Success! $CONFIG_FILE now uses a single shared Gemini API key.${NC}"
echo -e "${YELLOW}Reminder: GitHub Pages still publishes this key client-side. For true secrecy, move Gemini calls behind a server/API proxy.${NC}"
