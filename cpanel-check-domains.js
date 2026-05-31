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
    const wsUrl = await getWebSocketDebuggerUrlForTab('cpsess3768607345');
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

        const domainsUrl = 'https://server402.web-hosting.com:2083/cpsess3768607345/frontend/jupiter/domains/index.html';
        console.log('Navigating to domains list...');
        await send('Page.navigate', { url: domainsUrl });

        console.log('Waiting 8 seconds...');
        await new Promise(r => setTimeout(r, 8000));

        // Take a screenshot of the domains list
        const screenshot = await send('Page.captureScreenshot', { format: 'png' });
        fs.writeFileSync('/Users/sergiovalle/.gemini/antigravity-ide/brain/9e75d83a-a66c-4bae-8cc7-6d0a96f25627/cpanel_domains_list.png', Buffer.from(screenshot.data, 'base64'));
        console.log('Screenshot saved to cpanel_domains_list.png');

        // Extract DOM table text
        const evalRes = await send('Runtime.evaluate', {
            expression: `
                (function() {
                    const rows = Array.from(document.querySelectorAll('tr, div.row'));
                    return rows.map(r => r.innerText ? r.innerText.trim().replace(/\\n+/g, ' | ') : '').filter(t => t.length > 0);
                })()
            `,
            returnByValue: true
        });
        console.log('Domains List Result:');
        console.log(JSON.stringify(evalRes.result.value, null, 2));

        ws.close();
    });
}

main().catch(console.error);
