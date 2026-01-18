
from playwright.sync_api import sync_playwright, expect

def run(playwright):
    browser = playwright.chromium.launch(headless=True)
    page = browser.new_page()

    # Test index.html and navigation
    print("Navigating to index.html...")
    page.goto("http://localhost:8080/index.html")

    # Handle disclaimer if present
    try:
        if page.is_visible("#disclaimerModal"):
            print("Handling disclaimer...")
            page.click("#ackCheckbox")
            page.click("#ackBtn")
            page.wait_for_selector("#disclaimerModal", state="hidden")
    except Exception as e:
        print("Disclaimer handling skipped or failed:", e)

    # Verify Sidebar Button
    print("Verifying sidebar button...")
    imaging_btn = page.locator("#nav-imaging")
    expect(imaging_btn).to_be_visible()

    # Click button and wait for iframe
    print("Clicking imaging button...")
    imaging_btn.click()

    # Verify iframe src
    iframe = page.locator("#main-frame")
    expect(iframe).to_be_visible()
    expect(iframe).to_have_attribute("src", "Imaging.html")

    # Take screenshot of dashboard with Imaging open
    page.screenshot(path="verification/dashboard_imaging.png")
    print("Screenshot saved: verification/dashboard_imaging.png")

    # Test Imaging.html standalone
    print("Navigating to Imaging.html...")
    page.goto("http://localhost:8080/Imaging.html")

    # Verify Header
    expect(page.get_by_text("AI Imaging Vision")).to_be_visible()

    # Verify Drop Zone
    expect(page.locator("#dropZone")).to_be_visible()

    # Verify Model Selector
    expect(page.locator("#modelSelector")).to_be_visible()

    # Take screenshot of Imaging UI
    page.screenshot(path="verification/imaging_ui.png")
    print("Screenshot saved: verification/imaging_ui.png")

    browser.close()

with sync_playwright() as playwright:
    run(playwright)
