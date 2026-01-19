import os
import http.server
import socketserver
import threading
import time
from playwright.sync_api import sync_playwright, expect

# --- Start a local HTTP server ---
PORT = 8000
Handler = http.server.SimpleHTTPRequestHandler

def start_server():
    # Allow address reuse
    socketserver.TCPServer.allow_reuse_address = True
    with socketserver.TCPServer(("", PORT), Handler) as httpd:
        print(f"Serving at port {PORT}")
        httpd.serve_forever()

# Start server in a background thread
thread = threading.Thread(target=start_server, daemon=True)
thread.start()
time.sleep(1) # Give it a second to start

def verify_cognitive_page():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(viewport={'width': 1280, 'height': 800})
        page = context.new_page()

        try:
            # 1. Load the page
            print("Loading page...")
            page.goto(f"http://localhost:{PORT}/Cognitive.html")

            # 2. Enter 'Full Exam' mode
            print("Entering Full Exam mode...")
            page.get_by_text("Full Comprehensive Exam").click()
            time.sleep(1) # Animation wait

            # 3. Verify MoCA Tab Instructions
            print("Navigating to MoCA tab...")
            # Note: In full mode, MoCA is index 1.
            page.evaluate("window.setActiveTab(1)")
            time.sleep(0.5)

            # Check for specific detailed instruction text we added
            print("Checking MoCA instructions...")
            expect(page.get_by_text("Instruction: Please draw a line, going from a number to a letter in ascending order")).to_be_visible()
            expect(page.get_by_text("Instruction: Draw a clock. Put in all the numbers and set the time to 10 past 11")).to_be_visible()

            # Screenshot MoCA tab
            page.screenshot(path="verification/verification_moca.png")
            print("MoCA screenshot saved.")

            # 4. Verify Localization Tab Instructions (e.g., Right Frontal)
            print("Navigating to Right Frontal tab...")
            # Right frontal is index 2
            page.evaluate("window.setActiveTab(2)")
            time.sleep(0.5)

            # Check for specific detailed instruction text
            print("Checking Localization instructions...")
            expect(page.get_by_text("Instruction: Connect the dots in this box using four straight lines")).to_be_visible()

            # Screenshot Localization tab
            page.screenshot(path="verification/verification_frontal.png")
            print("Localization screenshot saved.")

            # 5. Verify Copy Report Logic
            print("Testing copyReport logic via console...")

            # Force show the report view so innerText works correctly
            page.evaluate("window.showAnalysisView()")
            time.sleep(0.5)

            # Inject HTML to simulate marked.js output
            # <p> adds block spacing (usually \n\n in innerText)
            test_html = "<p>Paragraph 1</p><p>Paragraph 2</p><p>Paragraph 3</p>"

            page.evaluate(f"document.getElementById('reportOutput').innerHTML = `{test_html}`")

            # Check what innerText looks like natively
            actual_inner_text = page.evaluate("document.getElementById('reportOutput').innerText")
            print(f"DEBUG: innerText from HTML is: {repr(actual_inner_text)}")

            # Override navigator.clipboard.writeText to capture the output
            page.evaluate("""
                window.lastCopiedText = "";
                navigator.clipboard.writeText = (text) => { window.lastCopiedText = text; };
            """)

            # Trigger copy
            page.evaluate("window.copyReport()")

            # Check result
            copied_text = page.evaluate("window.lastCopiedText")
            print(f"Copied text result:   {repr(copied_text)}")

            # We expect single newlines: "Paragraph 1\nParagraph 2\nParagraph 3"
            expected = "Paragraph 1\nParagraph 2\nParagraph 3"

            if copied_text == expected:
                print("SUCCESS: Copy logic correctly reduced newlines.")
            else:
                print(f"FAILURE: Copy logic output mismatch.\nExpected: {repr(expected)}\nGot:      {repr(copied_text)}")

        finally:
            browser.close()

if __name__ == "__main__":
    verify_cognitive_page()
