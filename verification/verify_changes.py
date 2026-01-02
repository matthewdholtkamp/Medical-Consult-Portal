from playwright.sync_api import sync_playwright

def verify_sidebar_button():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        # Use large viewport to match memory suggestions
        context = browser.new_context(viewport={'width': 1280, 'height': 1200})
        page = context.new_page()

        # Navigate to local server
        page.goto("http://localhost:8000/index.html")

        # Handle Disclaimer Modal (based on memory)
        try:
            page.wait_for_selector("#disclaimerModal", state="visible", timeout=2000)
            page.click("#ackCheckbox")
            page.click("#ackBtn")
            page.wait_for_selector("#disclaimerModal", state="hidden")
            print("Disclaimer dismissed")
        except:
            print("Disclaimer not found or already dismissed")

        # Verify Sidebar Button
        # Locate the new "Live Ai Consults" button
        # It's a button with text "Live Ai Consults"
        live_consult_btn = page.locator("button:has-text('Live Ai Consults')")

        if live_consult_btn.count() > 0:
            print("Live Ai Consults button found.")
            live_consult_btn.hover() # Hover to show any hover effects

            # Click it to ensure it opens the frame (though we can't easily check iframe content if it's cross-origin or blocked, but we can check if view changed)
            live_consult_btn.click()

            # Check if the iframe view is visible
            is_iframe_visible = page.is_visible("#view-iframe")
            if is_iframe_visible:
                print("Iframe view became visible.")

                # Take screenshot of the sidebar and iframe area
                page.screenshot(path="verification/sidebar_verification.png")
                print("Screenshot saved to verification/sidebar_verification.png")
            else:
                print("Error: Iframe view did not become visible.")
        else:
            print("Error: Live Ai Consults button not found.")
            # Dump html to debug
            # with open("verification/debug.html", "w") as f:
            #     f.write(page.content())

        browser.close()

if __name__ == "__main__":
    verify_sidebar_button()
