
from playwright.sync_api import sync_playwright
import json

def verify_audioconsult_layout():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(viewport={"width": 1280, "height": 800})
        page = context.new_page()

        # Mock the Gemini API response
        def handle_route(route):
            response_body = {
                "candidates": [
                    {
                        "content": {
                            "parts": [
                                {
                                    "text": "# Verified Treatment Plan\n\n*   **Diagnosis**: Acute Otitis Media\n*   **Action**: Amoxicillin 875mg BID.\n\n> **Warning**: Verify penicillin allergy."
                                }
                            ]
                        }
                    }
                ]
            }
            route.fulfill(
                status=200,
                content_type="application/json",
                body=json.dumps(response_body)
            )

        # Intercept calls to the Gemini API
        page.route("**/models/*generateContent*", handle_route)

        # Also intercept the TTS call to avoid errors/delays, though strictly not needed for visual check if we don't wait for audio
        # The code calls speakResponseWithGemini after adding the message.
        # We can just return empty audio data or fail it, as long as the text is added first.
        # Actually, let's mock the TTS too to be clean.
        def handle_tts_route(route):
             response_body = {
                "candidates": [
                    {
                        "content": {
                            "parts": [
                                {
                                    "inlineData": {
                                        "mimeType": "audio/wav",
                                        "data": "UklGRigAAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQAAAAA=" # Empty WAV
                                    }
                                }
                            ]
                        }
                    }
                ]
            }
             route.fulfill(
                status=200,
                content_type="application/json",
                body=json.dumps(response_body)
            )

        # The TTS model ID is different, but the pattern "generateContent" catches both.
        # We can distinguish by payload if needed, but for now let's just use a generic mock that satisfies both or specific mocks.
        # The code distinguishes by URL (MODEL_ID).
        # Text model: gemini-2.5-flash
        # TTS model: gemini-2.5-flash-preview-tts

        page.route("**/*gemini-2.5-flash:generateContent*", handle_route)
        page.route("**/*gemini-2.5-flash-preview-tts:generateContent*", handle_tts_route)

        page.goto("http://localhost:8080/Audioconsult.html")

        # Type a query
        page.fill("#text-input", "Test Query")

        # Click send (arrow_upward button)
        page.click("button:has(.material-symbols-outlined:text('arrow_upward'))")

        # Wait for the response text to appear
        # The response text contains "Acute Otitis Media"
        page.wait_for_selector("text=Acute Otitis Media", timeout=5000)

        # Wait a bit for animations
        page.wait_for_timeout(1000)

        # Take a screenshot
        page.screenshot(path="verification/audioconsult_card.png", full_page=True)
        browser.close()

if __name__ == "__main__":
    verify_audioconsult_layout()
