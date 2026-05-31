const fs = require('fs');
const http = require('http');
const WebSocket = require('ws');

function listTabs() {
    return new Promise((resolve, reject) => {
        const req = http.request({
            host: '127.0.0.1',
            port: 9222,
            path: '/json/list',
        }, (res) => {
            let data = '';
            res.on('data', (chunk) => { data += chunk; });
            res.on('end', () => {
                try {
                    const pages = JSON.parse(data);
                    resolve(pages);
                } catch (e) { reject(e); }
            });
        });
        req.on('error', reject);
        req.end();
    });
}

async function main() {
    const tabs = await listTabs();
    const selectorTabs = tabs.filter(t => t.type === 'page' && t.url.includes('nodejs-selector.html'));
    console.log(`Found ${selectorTabs.length} selector tabs.`);

    for (const t of selectorTabs) {
        console.log(`\n--- Tab ID: ${t.id} ---`);
        console.log(`URL: ${t.url}`);
        console.log(`Title: ${t.title}`);
        
        try {
            const ws = new WebSocket(t.webSocketDebuggerUrl);
            await new Promise((resolve, reject) => {
                ws.on('open', resolve);
                ws.on('error', reject);
            });

            let messageId = 1;
            const send = (method, params = {}) => new Promise((resolve) => {
                const id = messageId++;
                const listener = (data) => {
                    const res = JSON.parse(data);
                    if (res.id === id) {
                        ws.off('message', listener);
                        resolve(res.result);
                    }
                };
                ws.on('message', listener);
                ws.send(JSON.stringify({ id, method, params }));
            });

            await send('Page.enable');

            // Get innerText
            const evalRes = await send('Runtime.evaluate', {
                expression: 'document.body.innerText',
                returnByValue: true
            });
            console.log(`InnerText length: ${evalRes.result?.value ? evalRes.result.value.length : 0}`);
            if (evalRes.result?.value) {
                console.log(evalRes.result.value.substring(0, 500));
            }

            // Capture screenshot
            const screenshot = await send('Page.captureScreenshot', { format: 'png' });
            const filename = `/Users/sergiovalle/.gemini/antigravity-ide/brain/9e75d83a-a66c-4bae-8cc7-6d0a96f25627/cpanel_tab_check_${t.id}.png`;
            fs.writeFileSync(filename, Buffer.from(screenshot.data, 'base64'));
            console.log(`Screenshot saved to cpanel_tab_check_${t.id}.png`);

            ws.close();
        } catch (err) {
            console.error(`Error with tab ${t.id}:`, err.message);
        }
    }
}

main().catch(console.error);
