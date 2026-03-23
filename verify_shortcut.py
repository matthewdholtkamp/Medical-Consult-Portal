import asyncio
from playwright.async_api import async_playwright
import os

async def test_shortcut():
    async with async_playwright() as p:
        browser = await p.chromium.launch()
        context = await browser.new_context(viewport={'width': 1280, 'height': 800})
        page = await context.new_page()
        file_url = f"file://{os.path.abspath('index.html')}"
        await page.goto(file_url)
        await asyncio.sleep(2)

        # Bypass disclaimer modal if it's there
        try:
            ack_btn = page.locator("#ackBtn")
            if await ack_btn.is_visible():
                await page.locator("#ackCheckbox").check()
                await ack_btn.click()
                await asyncio.sleep(1)
        except Exception as e:
            pass

        # Press '/' anywhere on the page
        await page.keyboard.press("/")

        # Give it a moment to process the focus
        await asyncio.sleep(0.5)

        # Check if the search input is focused
        is_focused = await page.evaluate("document.activeElement.id === 'top-search-input'")

        if is_focused:
            print("SUCCESS: Search input successfully focused upon pressing '/'")
        else:
            print("FAILURE: Search input was not focused upon pressing '/'")

        await browser.close()

if __name__ == "__main__":
    asyncio.run(test_shortcut())
