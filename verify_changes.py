
from playwright.sync_api import sync_playwright, expect

def run_verification():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context()
        page = context.new_page()

        print("Verifying Imaging.html...")
        page.goto("http://localhost:8000/Imaging.html")

        # Verify Model Selector is gone and replaced by static text
        # The text "Node: Gemini 3 Flash (Advanced)" should be visible
        try:
            expect(page.get_by_text("Node: Gemini 3 Flash (Advanced)")).to_be_visible()
            print("SUCCESS: Gemini 3 Flash label found.")
        except Exception as e:
            print(f"FAILURE: Gemini 3 Flash label NOT found. {e}")

        # Verify Selector is gone
        try:
            expect(page.locator("#modelSelector")).not_to_be_visible()
            print("SUCCESS: Model selector hidden/removed.")
        except Exception as e:
            print(f"FAILURE: Model selector still visible. {e}")

        page.screenshot(path="verification_imaging.png")

        print("Verifying index.html...")
        page.goto("http://localhost:8000/index.html")

        # Verify ECG button is gone from sidebar
        try:
            expect(page.locator("#nav-ecg")).not_to_be_visible()
            print("SUCCESS: ECG Sidebar button removed.")
        except Exception as e:
            print(f"FAILURE: ECG Sidebar button still visible. {e}")

        # Verify ECG card is gone from dashboard
        # The card logic renders dynamically, so we wait a bit or check for text
        # There was a card with title "AI ECG Analysis"
        try:
            expect(page.get_by_text("AI ECG Analysis")).not_to_be_visible()
            print("SUCCESS: ECG Card removed from dashboard.")
        except Exception as e:
            print(f"FAILURE: ECG Card still visible. {e}")

        page.screenshot(path="verification_index.png")

        browser.close()

if __name__ == "__main__":
    run_verification()
