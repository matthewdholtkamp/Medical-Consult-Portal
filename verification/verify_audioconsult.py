from playwright.sync_api import sync_playwright

def verify_audioconsult():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(
            permissions=["microphone"]
        )
        page = context.new_page()

        # Navigate to the file
        # Since we are local, we need to serve it or just open it if no CORS issues.
        # However, modules require HTTP. I'll need to run a server.
        # For now, I'll assume the python server is running on 8000.
        page.goto("http://localhost:8000/Audioconsult.html")

        # Check title
        print(f"Title: {page.title()}")

        # Check for presence of the "Power" button (initial state)
        btn = page.locator("#main-mic-btn")
        if btn.is_visible():
            print("Power button is visible.")

        # We can't easily test the WebSocket connection in headless without a real API key and mock
        # But we can verify the UI elements are loaded.

        page.screenshot(path="verification/audioconsult_initial.png")
        browser.close()

if __name__ == "__main__":
    verify_audioconsult()
