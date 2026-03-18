const puppeteer = require('puppeteer');
(async () => {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    let logs = [];
    page.on('console', msg => logs.push(msg.text()));

    await page.goto('http://localhost:8000/journalclub.html');
    await new Promise(r => setTimeout(r, 1000));

    await page.evaluate(() => {
        document.getElementById('initialQuestion').value = 'STEMI treatments';
        document.querySelector('#step1 button[type="submit"]').click();
    });

    await new Promise(r => setTimeout(r, 2000));

    const display = await page.evaluate(() => {
        const toast = document.getElementById('toast');
        return toast ? {
            class: toast.className,
            text: toast.textContent,
        } : null;
    });
    console.log("Toast after submit:", display);

    await browser.close();
})();
