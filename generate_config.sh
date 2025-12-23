#!/bin/bash

# Configuration
CONFIG_FILE="js/config.js"
ENV_FILE=".env"

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${YELLOW}Starting configuration generation...${NC}"

if [ ! -f "$ENV_FILE" ]; then
    echo -e "${RED}Error: .env file not found!${NC}"
    echo "Please copy .env.example to .env and fill in your keys."
    exit 1
fi

# Load .env variables
export $(grep -v '^#' $ENV_FILE | xargs)

# Create the config file
echo -e "${YELLOW}Generating $CONFIG_FILE...${NC}"

cat <<EOF > $CONFIG_FILE
// Global configuration (Local Generated)
export const GEMINI_MODEL_ID = "gemini-2.5-flash-preview-09-2025";

export const API_KEYS = {
    ADTMC: "$KEY_ADTMC",
    CARDIOLOGY: "$KEY_CARDIOLOGY",
    IM: "$KEY_IM",
    JOURNAL_CLUB: "$KEY_JOURNAL_CLUB",
    NEUROLOGY: "$KEY_NEUROLOGY",
    ORTHOPEDICS: "$KEY_ORTHOPEDICS",
    PSYCHIATRY: "$KEY_PSYCHIATRY",
    RHEUMATOLOGY: "$KEY_RHEUMATOLOGY",
    START_PAGE: "$KEY_START_PAGE"
};
EOF

echo -e "${GREEN}Success! $CONFIG_FILE has been updated with local keys.${NC}"
echo -e "${YELLOW}WARNING: Do not commit $CONFIG_FILE with real keys!${NC}"
