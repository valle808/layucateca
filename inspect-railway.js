const fs = require('fs');
const http = require('http');
const WebSocket = require('ws');

function getWebSocketDebuggerUrl() {
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
                    const page = pages.find(p => p.type === 'page' && p.url.includes('railway.com'));
                    if (page) resolve(page.webSocketDebuggerUrl);
                    else reject(new Error('Railway page not found'));
                } catch (e) { reject(e); }
            });
        });
        req.on('error', reject);
        req.end();
    });
}

async function main() {
    const wsUrl = await getWebSocketDebuggerUrl();
    console.log('Connecting to Railway WebSocket URL:', wsUrl);
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
        console.log('Connected to Railway tab via CDP');
        await send('Page.enable');
        
        // Wait a second for rendering
        await new Promise(r => setTimeout(r, 2000));

        const evalRes = await send('Runtime.evaluate', {
            expression: 'document.body.innerText',
            returnByValue: true
        });
        console.log('--- Page text ---');
        console.log(evalRes.result?.value?.substring(0, 2000) || 'No text found');
        console.log('--- End page text ---');

        const screenshot = await send('Page.captureScreenshot', { format: 'png' });
        const buffer = Buffer.from(screenshot.data, 'base64');
        fs.writeFileSync('/Users/sergiovalle/.gemini/antigravity-ide/brain/9e75d83a-a66c-4bae-8cc7-6d0a96f25627/railway_screenshot.png', buffer);
        console.log('Screenshot saved to railway_screenshot.png');
        ws.close();
    });
}
main().catch(console.error);
