
import re
from playwright.sync_api import sync_playwright, expect

def run(playwright):
    browser = playwright.chromium.launch(headless=True)
    page = browser.new_page(viewport={"width": 1280, "height": 800})

    # Mock Step 1 Response
    page.route(re.compile(r".*generateContent.*"), lambda route: route.fulfill(
        status=200,
        content_type="application/json",
        body='{"candidates": [{"content": {"parts": [{"text": "Question 1\\nQuestion 2\\nQuestion 3\\nQuestion 4\\nQuestion 5"}]}}]}'
    ))

    page.goto("http://localhost:8080/journalclub.html")

    # Step 1
    page.fill("#initialQuestion", "Test Topic")
    page.click("#btnRefine")

    # Wait for Step 2
    expect(page.locator("#step2")).to_be_visible()

    # Mock Step 2 Response with Alerts - USING DOUBLE NEWLINES
    page.unroute_all() # Clear previous route
    page.route(re.compile(r".*generateContent.*"), lambda route: route.fulfill(
        status=200,
        content_type="application/json",
        body='{"candidates": [{"content": {"parts": [{"text": "# Journal Club Summary\\n\\n## Dr. Holtkamp\'s Clinical Pearls\\n> **🚨 CRITICAL TAKEAWAY:** This is a critical alert.\\n\\n> **⚖️ EVIDENCE CONTROVERSY:** This is a controversy.\\n\\n> **💡 CLINICAL GEM:** This is a gem.\\n\\n|||SECTION_PLAN|||\\n# Plan\\n1. Do it.\\n|||SECTION_REFS|||\\nRefs."}]}}]}'
    ))

    # Submit Step 2
    page.click("#btnGenerate")

    # Wait for Results
    expect(page.locator("#results")).to_be_visible()

    # Check for blockquotes
    blockquotes = page.locator("blockquote")
    expect(blockquotes).to_have_count(3)

    # Screenshot
    page.screenshot(path="verification/alerts_verification.png", full_page=True)

    browser.close()

with sync_playwright() as playwright:
    run(playwright)
