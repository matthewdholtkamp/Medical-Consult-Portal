
from playwright.sync_api import sync_playwright

def verify_audioconsult_thinking():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page(viewport={"width": 1280, "height": 720})

        # Navigate to Audioconsult.html
        page.goto("http://localhost:8080/Audioconsult.html")
        page.wait_for_load_state("networkidle")

        # Inject a script to manually trigger the "Thinking" state and indicator
        page.evaluate("""
            () => {
                // Mock the handleUserTurn to just show the indicator
                window.addThinkingIndicator();
                window.updateState('THINKING');
            }
        """)

        # Wait a moment for animation
        page.wait_for_timeout(1000)

        # Take Screenshot
        page.screenshot(path="verification/audioconsult_thinking.png")

        browser.close()

if __name__ == "__main__":
    verify_audioconsult_thinking()
