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
*   **AI Integration**: Google Gemini API
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
Since this is a static site using CDN links, no build process is required. Simply host the files on a web server or open them locally.
*Note: An active internet connection is required for Tailwind CSS, Icons, and the Gemini API.*
