# MedCon Portal - AI Medical Specialist Consult Portal

## Overview
MedCon Portal is a comprehensive, AI-powered platform designed to assist medical providers (particularly in military treatment facilities) with clinical decision support, consult note generation, and access to medical resources. It leverages the Gemini API to simulate specialist consultations and provide evidence-based guidance.

## ⚠️ Important Disclaimer
**This platform is NOT HIPAA compliant.**
*   Do **NOT** enter Protected Health Information (PHI).
*   Use only de-identified patient data.
*   This tool is for educational and decision support purposes only and does not replace clinical judgment.

## Features
*   **Dashboard**: Central hub featuring "Ask Dr. Holtkamp," an AI clinical assistant for queries based on medical guidelines.
*   **Consult Generators**: Specialized modules for various departments including:
    *   Internal Medicine
    *   ICU (Critical Care)
    *   Cardiology
    *   Neurology
    *   Pediatrics
    *   Psychiatry
    *   Orthopedics
    *   Rheumatology
    *   ADTMC / ADTMC+ (Sick call services)
*   **Journal Clubs**: Access to summaries and breakdowns of recent medical literature (General and Military Medicine).
*   **Quick References**: Direct links to essential tools like Tricare Formulary, MedCalc, OpenEvidence, PubMed AI, and military-specific resources (Genesis, MODS).

## Technologies
*   **Frontend**: HTML5, JavaScript (Vanilla)
*   **Styling**: Tailwind CSS (via CDN)
*   **AI Integration**: Google Gemini API (`gemini-3.1-flash-lite-preview` with `thinkingLevel: "high"`) (`gemini-3.1-flash-lite-preview` with `thinkingLevel: "high"`)
*   **Icons**: Google Material Symbols, Font Awesome

## File Structure
*   `index.html`: Main dashboard and navigation hub.
*   `[specialty].html`: Individual consult generator pages (e.g., `cardiology.html`, `icu.html`).
*   `journalclub.html` / `journalclub_mil.html`: Journal club pages.

## Usage
1.  Open `index.html` in a modern web browser.
2.  Acknowledge the disclaimer regarding PHI.
3.  Use the sidebar to navigate between the Dashboard, Consult Generator, and Journal Clubs.
4.  **Dashboard**: Type clinical queries to "Dr. Holtkamp".
5.  **Consult Generator**: Select a specialty, enter de-identified patient data (Chief Complaint, Vitals, Labs, etc.), answer follow-up questions from the AI, and review/edit the generated consultation note.

## Setup
Since this is a static site using CDN links, no build process is required for the code itself. However, because it is a static frontend, repository secrets cannot be securely read directly by client-side JavaScript. Instead, the application uses a build-time/deploy-time generation step to inject a single secret (`KEY_ADTMC`) into the application.

### Configuration

**Local Development:**
1. Copy `.env.example` to `.env` and set `KEY_ADTMC` to your Gemini API key.
2. Run `./generate_config.sh` to generate the `js/config.js` file from the template.
3. Open `index.html` locally or host the files on a local web server.
*(Note: Do not commit the generated `js/config.js` or `.env` files. They are included in `.gitignore`.)*

**Deployment (e.g., GitHub Pages):**
The application uses a GitHub Actions workflow (`.github/workflows/deploy.yml`) to automatically read the repository secret `KEY_ADTMC` and inject it into `js/config.template.js`, renaming it to `js/config.js` before deployment.

### ⚠️ Security Limitations
Due to the static frontend architecture, the generated `js/config.js` will contain the plaintext API key when loaded by the browser. Ensure that the deployment environment and key access are appropriately restricted for your use case, as the key is ultimately visible to the client.

*Note: An active internet connection is required for Tailwind CSS, Icons, and the Gemini API.*
