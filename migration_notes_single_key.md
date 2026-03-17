# Migration Notes: Single Secret Key `KEY_ADTMC`

## Overview
This codebase previously used an obfuscated key mechanism in `js/config.js` to manage multiple Gemini API keys. The app has now been refactored to use a single-secret (`KEY_ADTMC`) pattern. Because this is a static client-side web application, a direct browser read of repository secrets is not securely possible.

Therefore, the key injection must happen dynamically at deploy-time or build-time via generating the `js/config.js` script.

## Changes Made
- **Created Template**: Introduced `js/config.template.js`, mapping all `API_KEYS` accesses to `__KEY_ADTMC__`.
- **Removed Obfuscation Code**: The file `js/config.js` has been removed from source control (`git rm --cached js/config.js`). It is now dynamically generated and entirely ignored by `.gitignore`.
- **Refactored Scripts**: `generate_config.sh` now reads `KEY_ADTMC` from a `.env` file, replaces the placeholder in the template file, and outputs the result to `js/config.js`.
- **Simplified Env**: `.env.example` has been updated to remove all keys except `KEY_ADTMC`.
- **Deployment Workflow**: Modified `.github/workflows/deploy.yml` to automatically substitute `${{ secrets.KEY_ADTMC }}` into the configuration file on deploy.
- **Deleted Dead Code**: The `debug_key.html` page was removed since it pertained solely to obfuscation debugging.

## Important Note
The API key will still be exposed to end users via network requests or source inspection of `js/config.js` due to the static nature of the frontend architecture. Use API key restrictions or refer to appropriate backend proxies if greater security is required.
