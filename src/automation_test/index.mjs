import fetch from "node-fetch";
import puppeteer from 'puppeteer';
import { PRODUCTION_API, LOCAL_API } from "./test-environment.mjs";

(async () => {
    const request = {
        method: 'POST',
        headers: { "Content-Type": "application/json" },
        'Accept': 'application/json',
        body: JSON.stringify({ login: 'Admin1', password: 'start123' })
    }
    let url = '';
    if (process.argv.includes('production')) {
        url = PRODUCTION_API;
    } else {
        url = LOCAL_API;
    }
    const response = await fetch(`${url}/users/login_admin`, request)
        .then(response => response.json());
    const token = response.token.mapToken;
    const type = 'courier';
    const id = 'ACC113213';
    const isLocal = process.argv.includes('firebase') ? true : false;

    const browser = await puppeteer.launch({ headless: process.argv.includes('headless') ? true : false });

    const page = await browser.newPage();
    await page.goto(`http://localhost:3001/?type=${type}&id=${id}&token=${token}&isLocal=${isLocal.toString()}`);
    page.on('console', (msg) => msg.text() === 'WebSocket Client Connected'
        ? console.log(`%cPAGE LOG: ${msg.text()}`, 'color: green')
        : null);

    await page.setViewport({
        width: 1920,
        height: 1080
    })

    await page.waitForTimeout(4000);

    await page.screenshot({ path: `src/automation_test/screenshots/${(Math.random() * 100).toString()}.png` });

    await browser.close();
})();