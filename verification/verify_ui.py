from playwright.sync_api import sync_playwright

def verify_journalclub(page):
    # Go to journalclub.html
    page.goto("http://localhost:8000/journalclub.html")

    # Wait for the "Listen" button to appear (it's hidden initially, but we can check if it exists in DOM)
    # Actually, in journalclub.html, #results is hidden by default.
    # To test the UI changes in the 'Listen' button, we need to get to Step 3.
    # This might be hard to automate without mocking API calls.
    # However, we can use client-side script injection to force show the #results section.

    page.evaluate("document.getElementById('results').classList.remove('hidden')")

    # Check if Listen button exists
    listen_btn = page.get_by_text("Listen")
    listen_btn.wait_for()

    # Take screenshot of the Results UI with Listen button
    page.screenshot(path="verification/journalclub_ui.png")

    # Note: We cannot easily verify the click handler's internal logic (TTS call) without mocking fetch.
    # But we can verify syntax and UI presence.

def verify_journalclub_mil(page):
    # Go to journalclub_mil.html
    page.goto("http://localhost:8000/journalclub_mil.html")

    # Force show results
    page.evaluate("document.getElementById('results').classList.remove('hidden')")

    # Check if Listen button exists
    listen_btn = page.get_by_text("Listen to Brief")
    listen_btn.wait_for()

    # Take screenshot
    page.screenshot(path="verification/journalclub_mil_ui.png")

with sync_playwright() as p:
    browser = p.chromium.launch()
    page = browser.new_page()

    try:
        verify_journalclub(page)
        verify_journalclub_mil(page)
    except Exception as e:
        print(f"Error: {e}")
    finally:
        browser.close()
