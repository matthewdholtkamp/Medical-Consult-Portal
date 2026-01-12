
from playwright.sync_api import sync_playwright, expect
import json

def run(playwright):
    browser = playwright.chromium.launch(headless=True)
    context = browser.new_context()
    page = context.new_page()

    # Mock the Gemini API response
    def handle_route(route):
        print(f"Intercepted: {route.request.url}")

        # Mock response for Intake Step
        mock_response = {
            "candidates": [
                {
                    "content": {
                        "parts": [
                            {
                                "text": "```json\n{ \"questions\": [\"Is the chest pain exertional?\", \"Any history of PE?\", \"Recent long travel?\"] }\n```"
                            }
                        ]
                    }
                }
            ]
        }

        route.fulfill(
            status=200,
            content_type="application/json",
            body=json.dumps(mock_response)
        )

    # Intercept the API call
    page.route("**/*generateContent*", handle_route)

    # Go to page
    page.goto("http://localhost:8000/cardiology.html")

    # Click the Example button to populate data
    page.get_by_role("button", name="Load CHF Exacerbation Case").click()

    # Click Start
    page.get_by_role("button", name="Start Cardiac Assessment").click()

    # Wait for the next section to appear
    # The section has ID 'section-questions' and starts hidden.
    # When active, it removes 'hidden'.

    # We can check for the presence of the questions generated from our mock
    expect(page.get_by_text("Is the chest pain exertional?")).to_be_visible()

    # Take screenshot
    page.screenshot(path="verification_cardiology.png")

    browser.close()

with sync_playwright() as playwright:
    run(playwright)
