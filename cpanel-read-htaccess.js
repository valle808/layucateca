const fs = require('fs');
const http = require('http');
const WebSocket = require('ws');

function getWebSocketDebuggerUrlForTab(targetId) {
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
                    const page = pages.find(p => p.type === 'page' && (p.id === targetId || p.url.includes('filemanager')));
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
    const wsUrl = await getWebSocketDebuggerUrlForTab('577E142666491BBC3CC5296B6C804CCA');
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

        const waUrl = 'https://server402.web-hosting.com:2083/cpsess3768607345/frontend/jupiter/filemanager/index.html?dir=/home/layumpnx/public_html/wa';
        console.log('Navigating File Manager to public_html/wa...');
        await send('Page.navigate', { url: waUrl });

        console.log('Waiting 8 seconds...');
        await new Promise(r => setTimeout(r, 8000));

        // Take a screenshot of the folder contents
        const screenshot = await send('Page.captureScreenshot', { format: 'png' });
        fs.writeFileSync('/Users/sergiovalle/.gemini/antigravity-ide/brain/9e75d83a-a66c-4bae-8cc7-6d0a96f25627/cpanel_wa_folder_files.png', Buffer.from(screenshot.data, 'base64'));
        console.log('Screenshot saved to cpanel_wa_folder_files.png');

        // Check text for all visible filenames
        const evalRes = await send('Runtime.evaluate', {
            expression: `
                (function() {
                    const items = Array.from(document.querySelectorAll('a, li, span, td, div'));
                    const filenames = items.map(el => el.innerText ? el.innerText.trim() : '').filter(t => t.length > 0 && t.length < 50);
                    const uniqueFiles = Array.from(new Set(filenames));
                    return {
                        hasHtaccess: uniqueFiles.includes('.htaccess'),
                        files: uniqueFiles.slice(0, 100)
                    };
                })()
            `,
            returnByValue: true
        });
        console.log('Result:', JSON.stringify(evalRes.result.value, null, 2));

        ws.close();
    });
}

main().catch(console.error);
