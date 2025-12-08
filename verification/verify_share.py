from playwright.sync_api import sync_playwright, expect

def run(playwright):
    browser = playwright.chromium.launch(headless=True)
    page = browser.new_page()

    # Navigate to the page
    page.goto("http://localhost:8080/cardiology.html")

    # Check for Share button
    share_btn = page.locator("#share-btn")
    expect(share_btn).to_be_visible()

    # Click Share button
    share_btn.click()

    # Check for Modal
    modal = page.locator("#share-modal")
    expect(modal).to_be_visible()

    # Take screenshot of the modal
    page.screenshot(path="verification/share_modal.png")

    # Close browser
    browser.close()

with sync_playwright() as playwright:
    run(playwright)
