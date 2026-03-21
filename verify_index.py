import asyncio
from playwright.async_api import async_playwright
import os

async def verify():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        page = await browser.new_page()

        filepath = os.path.abspath('index.html')
        await page.goto(f"file://{filepath}")

        # Wait for the page to load
        await page.wait_for_selector('#chatInput')

        # Verify button is initially disabled
        btn = page.locator('#askBtn')
        btn_disabled = await btn.is_disabled()
        print(f"Button initially disabled: {btn_disabled}")

        # Type text
        await page.fill('#chatInput', 'What are the STEMI guidelines?')

        # We need to dispatch the input event explicitly if playwright fill doesn't trigger the oninput we want,
        # but playwright's fill usually triggers input events. If not, we can use evaluate
        await page.evaluate("document.getElementById('chatInput').dispatchEvent(new Event('input'))")

        # Verify button is enabled
        btn_enabled = await btn.is_enabled()
        print(f"Button enabled after input: {btn_enabled}")

        await browser.close()

if __name__ == '__main__':
    asyncio.run(verify())
