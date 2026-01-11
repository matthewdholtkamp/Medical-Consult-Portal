import json
from playwright.sync_api import sync_playwright, expect

def run(playwright):
    browser = playwright.chromium.launch(headless=True)
    context = browser.new_context(viewport={"width": 1280, "height": 800})
    page = context.new_page()

    # Mock the Gemini API response
    def handle_gemini(route):
        print("Intercepted Gemini API call")
        route.fulfill(
            status=200,
            content_type="application/json",
            body=json.dumps({
                "candidates": [{
                    "content": {
                        "parts": [
                            {"text": """## Clinical Synthesis
The patient presents with signs of Acute Decompensated Heart Failure (ADHF), characterized by dyspnea, orthopnea, and volume overload (JVD, edema).

## Risk Stratification & Evidence
- **Risk:** High. The patient requires inpatient management for IV diuretics.
- **Guideline:** 2022 AHA/ACC/HFSA Guidelines for Heart Failure.
- **Criteria:** Framingham criteria for HF met (2 major: JVD, Orthopnea).

## Actionable Recommendations
- **Labs:** BMP, BNP, Troponin.
- **Imaging:** CXR, Echo.
- **Meds:** Lasix 40mg IV BID.
- **Monitoring:** Daily weights, strict I/Os.

## Clinical Pearls
**Pitfall:** Do not delay IV diuretics in wet patients. Ensure K+ is replete."""},
                            {"text": "Step 1: Identify volume status. Patient is wet. Step 2: Check perfusion. Warm. Profile: Warm & Wet. Plan: Diuresis.", "thought": True}
                        ]
                    }
                }]
            })
        )

    # Intercept calls to the Gemini API
    page.route("**/models/*:generateContent*", handle_gemini)

    # Navigate to local server
    page.goto("http://localhost:8000/index.html")

    # Handle Disclaimer if present
    try:
        page.get_by_label("I confirm I will not enter PHI").check()
        page.get_by_role("button", name="I Understand — Continue").click()
    except:
        print("Disclaimer not found or already accepted.")

    # Wait for dashboard to load
    expect(page.get_by_text("What's on your mind, Doc?")).to_be_visible()

    # Type query
    page.get_by_placeholder("Clinical query").fill("Manage ADHF patient")

    # Click Ask button
    page.get_by_role("button", name="Ask Dr. H").click()

    # Wait for response area to appear and populate
    # We look for the specific header we added: "Dr. Holtkamp Analysis"
    expect(page.get_by_text("Dr. Holtkamp Analysis")).to_be_visible(timeout=10000)

    # Verify the "Copy" button exists
    expect(page.get_by_title("Copy to Clipboard")).to_be_visible()

    # Verify the "Thinking Mode" badge
    expect(page.get_by_text("AI Reasoning Enabled")).to_be_visible()

    # Verify the Thoughts section is present (collapsed by default)
    expect(page.get_by_text("View Internal Reasoning Process")).to_be_visible()

    # Take screenshot
    page.screenshot(path="verification_ui.png", full_page=True)

    browser.close()

with sync_playwright() as playwright:
    run(playwright)
