from playwright.sync_api import sync_playwright

def verify_dashboard():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page(viewport={"width": 1280, "height": 800})

        # Dashboard
        page.goto("http://localhost:8080/index.html")
        page.wait_for_selector("body")
        page.screenshot(path="dashboard_restored.png")

        # Rheumatology
        page.goto("http://localhost:8080/rheumatology.html")
        page.wait_for_selector("body")
        page.screenshot(path="rheum_restored.png")

        browser.close()

if __name__ == "__main__":
    verify_dashboard()
