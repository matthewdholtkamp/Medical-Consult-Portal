#!/bin/bash

# Check if .env file exists
if [ ! -f .env ]; then
    echo "Error: .env file not found."
    echo "Please create a .env file based on .env.example"
    exit 1
fi

# Load environment variables
set -a
source .env
set +a

# Create a temp file
cp js/config.js js/config.js.tmp

# Function to replace placeholder with value using sed
# We use | as delimiter to avoid issues with / in keys
replace_key() {
    local key_name=$1
    local key_value=${!1}

    if [ -z "$key_value" ]; then
        echo "Warning: $key_name is empty in .env"
    fi

    # Escape special characters in key_value for sed
    escaped_value=$(echo "$key_value" | sed 's/[\/&]/\\&/g')

    # We match $KEY_NAME and replace with the value
    sed -i "s|\$$key_name|$escaped_value|g" js/config.js.tmp
}

# List of keys to replace
KEYS=(
"KEY_ADTMC"
"KEY_CARDIOLOGY"
"KEY_IM"
"KEY_JOURNAL_CLUB"
"KEY_NEUROLOGY"
"KEY_ORTHOPEDICS"
"KEY_PSYCHIATRY"
"KEY_RHEUMATOLOGY"
"KEY_START_PAGE"
)

# Perform replacements
for key in "${KEYS[@]}"; do
    replace_key "$key"
done

# Move temp file to final location
mv js/config.js.tmp js/config.js

echo "---------------------------------------------------------"
echo "SUCCESS: js/config.js has been updated with keys from .env"
echo ""
echo "⚠️  IMPORTANT SECURITY WARNING ⚠️"
echo "DO NOT commit 'js/config.js' to git while it contains real keys!"
echo "Run 'git checkout js/config.js' to restore the template before committing."
echo "---------------------------------------------------------"
