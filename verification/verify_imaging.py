
from playwright.sync_api import sync_playwright
import os

def run():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        # Load the local HTML file
        file_path = os.path.abspath('Imaging.html')
        page.goto(f'file://{file_path}')

        # Verify the sticky sidebar class is present
        # We look for the div with the specific classes
        sidebar = page.locator('.lg\\:sticky')

        # Take a screenshot
        page.screenshot(path='verification/sticky_sidebar.png')

        # Print confirmation
        if sidebar.count() > 0:
            print('Sticky sidebar class found!')
        else:
            print('Sticky sidebar class NOT found!')

        browser.close()

if __name__ == '__main__':
    run()
