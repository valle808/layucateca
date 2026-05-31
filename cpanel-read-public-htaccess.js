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
    // Open a new tab to fetch/read public_html/.htaccess content
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

        console.log('Fetching public_html/.htaccess content via File Manager API...');
        const apiRes = await send('Runtime.evaluate', {
            expression: `
                 (async function() {
                    try {
                        const res = await fetch('/cpsess3768607345/execute/Fileman/get_file_content?dir=%2Fhome%2Flayumpnx%2Fpublic_html%2Fwa&file=.htaccess');
                        const data = await res.json();
                        return data;
                    } catch (err) {
                        return { error: err.message };
                    }
                })()
            `,
            awaitPromise: true,
            returnByValue: true
        });

        console.log('public_html/.htaccess contents apiRes:');
        console.log(JSON.stringify(apiRes, null, 2));

        ws.close();
    });
}

main().catch(console.error);
