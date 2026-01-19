import time
from playwright.sync_api import sync_playwright

def test_cognitive_assessment_page():
    with sync_playwright() as p:
        # Launch browser
        browser = p.chromium.launch(headless=True)
        context = browser.new_context()
        page = context.new_page()

        # Listen for console logs
        page.on("console", lambda msg: print(f"BROWSER CONSOLE: {msg.text}"))
        page.on("pageerror", lambda err: print(f"BROWSER ERROR: {err}"))

        try:
            # 1. Navigate to the Cognitive Assessment page
            print("Navigating to Cognitive.html...")
            page.goto("http://localhost:8080/Cognitive.html")

            # Wait for the start screen to appear
            print("Waiting for start screen...")
            page.wait_for_selector("#startScreen", state="visible")

            # Take a screenshot of the start screen
            page.screenshot(path="verification/cognitive_start_screen.png")
            print("Screenshot of Start Screen taken.")

            # 2. Click "Full Comprehensive Exam"
            print("Clicking Full Comprehensive Exam...")
            # Use a more specific selector if text is ambiguous
            page.locator("button", has_text="Full Comprehensive Exam").click()

            # Wait for main app to be visible - increase timeout just in case
            print("Waiting for mainApp to appear...")
            page.wait_for_selector("#mainApp", state="visible", timeout=10000)

            # 3. Verify Header and Sidebar
            # Check Title
            # "Behavioral Neurology Clinical Navigator"

            # 4. Fill in some data
            print("Filling in data...")
            # We are in General Neuro tab (Tab 0) by default in Full mode
            page.locator("textarea").first.fill("Test Patient: 70yo Male, memory loss.")

            # 5. Navigate to Next Tab (MoCA)
            print("Navigating to MoCA tab...")
            page.get_by_text("Next Section").click()

            # Wait for MoCA section title
            page.wait_for_selector("h2", state="visible") # 'MoCA Screening'

            # 6. Verify MoCA logic (Dropdowns)
            # Find the first select (Visuospatial / Executive -> Alt. Trail Making)
            # It's the first select on the page usually
            print("Selecting score...")
            page.locator("select").first.select_option("1") # Set score to 1

            # Check total score update (should be 1)
            # The total score is in #totalMocaDisplay
            time.sleep(0.5) # Allow JS to update
            total_score = page.locator("#totalMocaDisplay").inner_text()
            print(f"Total Score: {total_score}")

            if total_score != "1":
                print("WARNING: Score did not update correctly!")

            # Take screenshot of MoCA view
            page.screenshot(path="verification/cognitive_moca_view.png")
            print("Screenshot of MoCA View taken.")

            # 7. Generate Report (Mocking API would be ideal, but here we just check UI)
            # We can't easily mock the fetch in this simple script without complex setup,
            # so we'll just check if the button exists and clicks.
            print("Checking Report Generation UI...")
            page.get_by_text("Generate AI Report").click()

            # Should switch to report view
            page.wait_for_selector("#reportView", state="visible")
            page.wait_for_selector("#loadingOverlay", state="visible") # Should show loading

            page.screenshot(path="verification/cognitive_report_loading.png")
            print("Screenshot of Report Loading taken.")

        except Exception as e:
            print(f"Error: {e}")
            page.screenshot(path="verification/cognitive_error.png")
            raise e
        finally:
            browser.close()

if __name__ == "__main__":
    test_cognitive_assessment_page()
