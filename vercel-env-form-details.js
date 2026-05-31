const fs = require('fs');
const http = require('http');
const WebSocket = require('ws');

function getVercelWebSocketDebuggerUrl() {
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
                    const page = pages.find(p => p.type === 'page' && p.url.includes('vercel.com'));
                    if (page) resolve(page.webSocketDebuggerUrl);
                    else reject(new Error('Vercel tab not found'));
                } catch (e) { reject(e); }
            });
        });
        req.on('error', reject);
        req.end();
    });
}

async function main() {
    const wsUrl = await getVercelWebSocketDebuggerUrl();
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

        const inspectRes = await send('Runtime.evaluate', {
            expression: `
                (function() {
                    const inputs = Array.from(document.querySelectorAll('input'));
                    const textareas = Array.from(document.querySelectorAll('textarea'));
                    
                    const openedFormInputs = inputs.filter(i => {
                        const html = i.outerHTML.toLowerCase();
                        return html.includes('key') || html.includes('value') || html.includes('placeholder') || i.placeholder || i.name;
                    });
                    
                    return {
                        inputs: openedFormInputs.map(i => ({
                            id: i.id,
                            name: i.name,
                            placeholder: i.placeholder,
                            value: i.value,
                            type: i.type,
                            ariaLabel: i.getAttribute('aria-label'),
                            outerHTML: i.outerHTML.substring(0, 300)
                        })),
                        textareas: textareas.map(t => ({
                            id: t.id,
                            name: t.name,
                            placeholder: t.placeholder,
                            value: t.value,
                            ariaLabel: t.getAttribute('aria-label'),
                            outerHTML: t.outerHTML.substring(0, 300)
                        }))
                    };
                })()
            `,
            returnByValue: true
        });

        console.log('Opened Form Details:');
        console.log(JSON.stringify(inspectRes.result.value, null, 2));
        ws.close();
    });
}

main().catch(console.error);
