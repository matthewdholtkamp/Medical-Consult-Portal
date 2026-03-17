#!/bin/bash

# Configuration
TEMPLATE_FILE="js/config.template.js"
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
    echo "Please copy .env.example to .env and set KEY_ADTMC."
    exit 1
fi

# Load .env variables
export $(grep -v '^#' "$ENV_FILE" | xargs)

if [ -z "$KEY_ADTMC" ]; then
    echo -e "${RED}Error: KEY_ADTMC not found in $ENV_FILE!${NC}"
    exit 1
fi

if [ ! -f "$TEMPLATE_FILE" ]; then
    echo -e "${RED}Error: $TEMPLATE_FILE not found!${NC}"
    exit 1
fi

# Create the config file by replacing the placeholder
echo -e "${YELLOW}Generating $CONFIG_FILE...${NC}"

sed "s/__KEY_ADTMC__/$KEY_ADTMC/g" "$TEMPLATE_FILE" > "$CONFIG_FILE"

echo -e "${GREEN}Success! $CONFIG_FILE has been generated.${NC}"
echo -e "${YELLOW}WARNING: Do not commit $CONFIG_FILE with real keys!${NC}"
