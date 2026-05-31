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

        // Click Settings button
        await send('Runtime.evaluate', {
            expression: `
                (function() {
                    const settingsBtn = Array.from(document.querySelectorAll('button, a, span')).find(b => b.innerText && b.innerText.trim().toLowerCase() === 'settings');
                    if (settingsBtn) settingsBtn.click();
                })()
            `
        });

        await new Promise(r => setTimeout(r, 1000));

        // Inspect elements
        const inspectRes = await send('Runtime.evaluate', {
            expression: `
                (function() {
                    const inputs = Array.from(document.querySelectorAll('input'));
                    const buttons = Array.from(document.querySelectorAll('button'));
                    
                    return {
                        inputs: inputs.map(i => ({
                            id: i.id,
                            name: i.name,
                            type: i.type,
                            value: i.value,
                            outerHTML: i.outerHTML.substring(0, 300)
                        })),
                        buttons: buttons.map(b => ({
                            innerText: b.innerText,
                            id: b.id,
                            outerHTML: b.outerHTML.substring(0, 300)
                        }))
                    };
                })()
            `,
            returnByValue: true
        });

        console.log('Dialog DOM elements:');
        console.log(JSON.stringify(inspectRes.result.value, null, 2));

        ws.close();
    });
}

main().catch(console.error);
