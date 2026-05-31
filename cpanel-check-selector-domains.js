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

        // Let's inspect the dropdown elements, select options, and divs
        const evalRes = await send('Runtime.evaluate', {
            expression: `
                (function() {
                    const select = document.querySelector('select');
                    const options = select ? Array.from(select.querySelectorAll('option')).map(o => o.value || o.innerText) : [];
                    
                    // Let's also look for custom dropdowns (like div/span components)
                    const divs = Array.from(document.querySelectorAll('div, span, button'));
                    const dropdownItems = divs.map(d => d.innerText ? d.innerText.trim() : '').filter(t => t.includes('layucateca.com') || t.includes('wa.layucateca.com'));
                    
                    return {
                        hasSelect: !!select,
                        selectOptions: options,
                        dropdownItems: Array.from(new Set(dropdownItems))
                    };
                })()
            `,
            returnByValue: true
        });
        console.log('Dropdown elements list:', JSON.stringify(evalRes.result.value, null, 2));

        ws.close();
    });
}

main().catch(console.error);
