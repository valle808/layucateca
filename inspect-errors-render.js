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
                    const page = pages.find(p => p.type === 'page' && p.url.includes('render.com'));
                    if (page) resolve(page.webSocketDebuggerUrl);
                    else reject(new Error('Render page not found'));
                } catch (e) { reject(e); }
            });
        });
        req.on('error', reject);
        req.end();
    });
}

async function main() {
    const wsUrl = await getWebSocketDebuggerUrl();
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
        console.log('Connected to Render tab');
        await send('Page.enable');

        const evalRes = await send('Runtime.evaluate', {
            expression: `
                (function() {
                    const errors = Array.from(document.querySelectorAll('[class*="error"], [id*="error"], [class*="critical"], .text-red-500, .text-critical'))
                        .map(el => ({
                            id: el.id,
                            className: el.className,
                            text: el.innerText || el.textContent
                        }))
                        .filter(t => t.text && t.text.trim().length > 0 && t.text.length < 300);
                    
                    const modals = Array.from(document.querySelectorAll('[role="dialog"], [class*="modal"], [id*="modal"]'))
                        .map(el => ({
                            tagName: el.tagName,
                            id: el.id,
                            className: el.className,
                            text: el.innerText || el.textContent
                        }));
                    
                    return { errors, modals };
                })()
            `,
            returnByValue: true
        });

        console.log(JSON.stringify(evalRes.result.value, null, 2));
        ws.close();
    });
}
main().catch(console.error);
