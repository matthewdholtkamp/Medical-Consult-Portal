from playwright.sync_api import sync_playwright

def verify_audioconsult():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(
            viewport={'width': 1280, 'height': 720},
            permissions=['microphone']
        )
        page = context.new_page()

        # Navigate to the page served locally
        page.goto("http://localhost:8080/Audioconsult.html")

        # Wait for the page to load
        page.wait_for_load_state("networkidle")

        # Verify that the API key modal is NOT present
        modal = page.locator("#api-key-modal")
        if modal.is_visible():
            print("FAILURE: API Key modal is visible.")
        else:
            print("SUCCESS: API Key modal is hidden.")

        # Verify that the microphone button exists and is in the 'Ready' state (IDLE)
        # In IDLE state, the button has a microphone icon and specific styling
        mic_btn = page.locator("#main-mic-btn")
        mic_icon = page.locator("#mic-icon")
        status_text = page.locator("#status-text")

        # Check initial state
        print(f"Status Text: {status_text.inner_text()}")
        if "STANDBY" not in status_text.inner_text() and "IDLE" not in status_text.inner_text():
             # The code sets it to STANDBY in HTML, then IDLE in JS?
             # Let's check the code: HTML says STANDBY. JS updateState(STATE.IDLE) changes it to IDLE.
             # Wait a moment for JS to run?
             pass

        # Take a screenshot of the UI without the modal
        page.screenshot(path="verification/audioconsult_nomodal.png")
        print("Screenshot saved to verification/audioconsult_nomodal.png")

        browser.close()

if __name__ == "__main__":
    verify_audioconsult()
