from playwright.sync_api import sync_playwright

def verify_api_key_error():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        # Navigate to Rheumatology page (using local server)
        # Note: server is on 8080
        page.goto("http://localhost:8080/rheumatology.html")

        # Capture console errors
        console_errors = []
        page.on("console", lambda msg: console_errors.append(msg.text) if msg.type == "error" else None)

        # Fill in dummy data to enable submit
        # Assuming there is a form.
        # But wait, the error "Consultation failed. Please check API Key." appears AFTER submission usually.
        # Or does it appear on load?
        # The user said "Consultation failed". This implies they clicked something.

        # Find the textarea for the patient case
        # Looking at rheumatology.html code (from memory/inference):
        # usually id="patientCase" or similar.
        # Let's try to fill the textarea and click "Generate".

        try:
            # Wait for textarea
            page.wait_for_selector("textarea", timeout=5000)
            page.fill("textarea", "Test patient case")

            # Click button
            # Button likely says "Generate Consult" or similar.
            page.click("button:has-text('Generate')")

            # Wait for error message
            # The error message is "Consultation failed. Please check API Key."
            # It appears in a div with id 'intake' or similar based on `showError`.

            # Wait a bit for the API call to fail
            page.wait_for_timeout(3000)

            # Check for the text
            content = page.content()
            if "Consultation failed. Please check API Key." in content:
                print("SUCCESS: Error message found.")
            else:
                print("FAILURE: Error message NOT found.")
                print("Page content snippet:", content[:500])

        except Exception as e:
            print(f"EXCEPTION: {e}")

        browser.close()

if __name__ == "__main__":
    verify_api_key_error()
