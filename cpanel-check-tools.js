const fs = require('fs');
const http = require('http');
const WebSocket = require('ws');

function getCpanelWebSocketDebuggerUrl() {
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
                    const page = pages.find(p => p.type === 'page' && p.title.includes('cPanel - Tools'));
                    if (page) resolve(page.webSocketDebuggerUrl);
                    else reject(new Error('cPanel Tools tab not found'));
                } catch (e) { reject(e); }
            });
        });
        req.on('error', reject);
        req.end();
    });
}

async function main() {
    const wsUrl = await getCpanelWebSocketDebuggerUrl();
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

        console.log('Reloading cPanel Tools page...');
        await send('Page.reload');
        await new Promise(r => setTimeout(r, 6000));

        // Get current URL
        const evalUrl = await send('Runtime.evaluate', {
            expression: 'window.location.href',
            returnByValue: true
        });
        const currentUrl = evalUrl.result.value;
        console.log('Current cPanel URL:', currentUrl);

        // Take a screenshot
        const screenshot = await send('Page.captureScreenshot', { format: 'png' });
        fs.writeFileSync('/Users/sergiovalle/.gemini/antigravity-ide/brain/9e75d83a-a66c-4bae-8cc7-6d0a96f25627/cpanel_tools_check.png', Buffer.from(screenshot.data, 'base64'));
        console.log('Screenshot saved to cpanel_tools_check.png');

        // Check text
        const evalRes = await send('Runtime.evaluate', {
            expression: 'document.body.innerText.substring(0, 1500)',
            returnByValue: true
        });
        console.log('--- Page text ---');
        console.log(evalRes.result?.value || 'No text');
        console.log('--- End page text ---');

        ws.close();
    });
}

main().catch(console.error);
