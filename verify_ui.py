import asyncio
from playwright.async_api import async_playwright
import os

async def capture_screenshot():
    async with async_playwright() as p:
        # Launch browser
        browser = await p.chromium.launch()

        # Test desktop mode for search input visual hint
        desktop_context = await browser.new_context(viewport={'width': 1280, 'height': 800})
        desktop_page = await desktop_context.new_page()
        file_url = f"file://{os.path.abspath('index.html')}"
        await desktop_page.goto(file_url)
        await asyncio.sleep(2) # Give it time to load

        # Click the 'accept' button on the disclaimer modal if it exists so we can interact with the page
        try:
            ack_btn = desktop_page.locator("#ackBtn")
            if await ack_btn.is_visible():
                await desktop_page.locator("#ackCheckbox").check()
                await ack_btn.click()
                await asyncio.sleep(1)
        except Exception as e:
            pass

        await desktop_page.screenshot(path="screenshot_desktop.png")

        # Test mobile mode for sidebar focus
        mobile_context = await browser.new_context(viewport={'width': 375, 'height': 667})
        mobile_page = await mobile_context.new_page()
        await mobile_page.goto(file_url)
        await asyncio.sleep(2)

        # Click the 'accept' button on the disclaimer modal if it exists so we can interact with the page
        try:
            ack_btn = mobile_page.locator("#ackBtn")
            if await ack_btn.is_visible():
                await mobile_page.locator("#ackCheckbox").check()
                await ack_btn.click()
                await asyncio.sleep(1)
        except Exception as e:
            pass

        # Tab multiple times to reach the menu button
        # There's likely some content before it, so let's try just getting the locator and focusing it directly to verify focus style
        try:
             menu_btn = mobile_page.locator('button[aria-label="Open sidebar"]')
             await menu_btn.focus()
             await asyncio.sleep(1)
        except Exception as e:
             print("Could not find mobile menu button")
             pass

        # Ensure it is focused and take a screenshot
        await mobile_page.screenshot(path="screenshot_mobile.png")

        await browser.close()

if __name__ == "__main__":
    asyncio.run(capture_screenshot())
