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
                    const page = pages.find(p => p.type === 'page' && p.url.includes('nodejs-selector.html'));
                    if (page) resolve(page.webSocketDebuggerUrl);
                    else reject(new Error('cPanel Selector tab not found'));
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

        // Extract scope info or table text
        const evalRes = await send('Runtime.evaluate', {
            expression: `
                (function() {
                    const scope = window.angular ? window.angular.element(document.body).scope() : null;
                    const apps = scope && scope.applications ? scope.applications : null;
                    
                    // DOM fallback
                    const rows = Array.from(document.querySelectorAll('tr, table tr'));
                    const rowTexts = rows.map(r => r.innerText ? r.innerText.trim().replace(/\\n+/g, ' | ') : '');
                    
                    return {
                        hasAngular: !!window.angular,
                        apps: apps,
                        rowTexts: rowTexts.slice(0, 50)
                    };
                })()
            `,
            returnByValue: true
        });
        console.log('Selector Data Result:', JSON.stringify(evalRes.result.value, null, 2));

        ws.close();
    });
}

main().catch(console.error);
