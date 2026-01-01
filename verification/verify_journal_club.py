from playwright.sync_api import sync_playwright

def verify_journal_club():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        # Verify journalclub.html
        print("Verifying journalclub.html...")
        page.goto("http://localhost:8080/journalclub.html")
        page.wait_for_selector("h1")
        title = page.locator("h1").inner_text()
        print(f"Page Title: {title}")
        page.screenshot(path="verification/journalclub.png")

        # Verify journalclub_mil.html
        print("Verifying journalclub_mil.html...")
        page.goto("http://localhost:8080/journalclub_mil.html")
        page.wait_for_selector("h1")
        title_mil = page.locator("h1").inner_text()
        print(f"Page Title: {title_mil}")
        page.screenshot(path="verification/journalclub_mil.png")

        browser.close()

if __name__ == "__main__":
    verify_journal_club()
