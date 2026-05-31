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

        // Extract DOM elements and values
        const evalRes = await send('Runtime.evaluate', {
            expression: `
                (function() {
                    const results = {};
                    const inputs = Array.from(document.querySelectorAll('input, select, textarea'));
                    results.inputs = inputs.map(i => ({
                        id: i.id,
                        name: i.name,
                        value: i.value,
                        type: i.type,
                        placeholder: i.placeholder,
                        className: i.className
                    }));
                    
                    const textElements = Array.from(document.querySelectorAll('.app-parameter, label, span, div.row'));
                    results.text = textElements.map(el => el.innerText ? el.innerText.trim() : '').filter(t => t.length > 0 && t.length < 500).slice(0, 100);
                    
                    return results;
                })()
            `,
            returnByValue: true
        });
        console.log('Form Details Result:', JSON.stringify(evalRes.result.value, null, 2));

        ws.close();
    });
}

main().catch(console.error);
