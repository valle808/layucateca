const fs = require('fs');
const http = require('http');
const WebSocket = require('ws');

function getWebSocketDebuggerUrlForTab(targetUrlSubstring) {
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
                    const page = pages.find(p => p.type === 'page' && p.url.includes(targetUrlSubstring));
                    if (page) resolve(page.webSocketDebuggerUrl);
                    else reject(new Error('Tab not found'));
                } catch (e) { reject(e); }
            });
        });
        req.on('error', reject);
        req.end();
    });
}

async function main() {
    // Connect to the File Manager tab specifically
    const wsUrl = await getWebSocketDebuggerUrlForTab('filemanager/index.html');
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

        const waDirUrl = 'https://server402.web-hosting.com:2083/cpsess3768607345/frontend/jupiter/filemanager/index.html?dir=/home/layumpnx/public_html/wa';
        console.log('Navigating File Manager to public_html/wa...');
        await send('Page.navigate', { url: waDirUrl });

        console.log('Waiting 6 seconds for folder loading...');
        await new Promise(r => setTimeout(r, 6000));

        // Take a screenshot of the folder contents
        const screenshot = await send('Page.captureScreenshot', { format: 'png' });
        fs.writeFileSync('/Users/sergiovalle/.gemini/antigravity-ide/brain/9e75d83a-a66c-4bae-8cc7-6d0a96f25627/cpanel_wa_folder.png', Buffer.from(screenshot.data, 'base64'));
        console.log('Screenshot saved to cpanel_wa_folder.png');

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
