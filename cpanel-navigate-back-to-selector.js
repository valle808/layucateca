const fs = require('fs');
const http = require('http');
const WebSocket = require('ws');

function getWebSocketDebuggerUrlForDomainsTab() {
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
                    const page = pages.find(p => p.type === 'page' && (p.url.includes('domains/index.html') || p.title.includes('Domains')));
                    if (page) resolve(page.webSocketDebuggerUrl);
                    else reject(new Error('Domains tab not found'));
                } catch (e) { reject(e); }
            });
        });
        req.on('error', reject);
        req.end();
    });
}

async function main() {
    const wsUrl = await getWebSocketDebuggerUrlForDomainsTab();
    console.log('Connecting to Domains tab:', wsUrl);
    const ws = new WebSocket(wsUrl);
    let messageId = 1;
    const send = (method, params = {}) => new Promise((resolve, reject) => {
        const id = messageId++;
        const listener = (data) => {
            const res = JSON.parse(data);
            if (res.id === id) {
                ws.off('message', listener);
                if (res.error) reject(res.error);
                else resolve(res.result);
            }
        };
        ws.on('message', listener);
        ws.send(JSON.stringify({ id, method, params }));
    });

    ws.on('open', async () => {
        await send('Page.enable');

        const selectorUrl = 'https://server402.web-hosting.com:2083/cpsess3768607345/frontend/jupiter/lveversion/nodejs-selector.html.tt#/applications/whatsapp-microservice';
        console.log('Navigating tab back to Node.js application selector...');
        await send('Page.navigate', { url: selectorUrl });

        console.log('Waiting 8 seconds for load...');
        await new Promise(r => setTimeout(r, 8000));

        // Take a screenshot to verify
        const screenshot = await send('Page.captureScreenshot', { format: 'png' });
        fs.writeFileSync('/Users/sergiovalle/.gemini/antigravity-ide/brain/9e75d83a-a66c-4bae-8cc7-6d0a96f25627/cpanel_selector_check.png', Buffer.from(screenshot.data, 'base64'));
        console.log('Screenshot of restored selector page saved to cpanel_selector_check.png');

        ws.close();
    });
}

main().catch(console.error);
