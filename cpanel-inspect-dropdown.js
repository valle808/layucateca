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

        // Click dropdown toggle
        const clickRes = await send('Runtime.evaluate', {
            expression: `
                new Promise((resolve) => {
                    const toggle = document.querySelector('#domain-select button');
                    if (!toggle) {
                        resolve('ERROR: Toggle not found');
                        return;
                    }
                    toggle.click();
                    setTimeout(() => {
                        const menu = document.querySelector('#domain-select .dropdown-menu, #domain-select .selector_dropdown, .dropdown-menu');
                        resolve({
                            menuHTML: menu ? menu.outerHTML : 'Menu container not found',
                            allItems: Array.from(document.querySelectorAll('*')).filter(el => el.innerText && el.innerText.includes('layucateca.com')).map(el => ({
                                tagName: el.tagName,
                                className: el.className,
                                text: el.innerText.trim().substring(0, 100)
                            }))
                        });
                    }, 500);
                })
            `,
            awaitPromise: true,
            returnByValue: true
        });
        console.log('Dropdown Info:');
        console.log(JSON.stringify(clickRes.result.value, null, 2));

        // Click toggle again to close it
        await send('Runtime.evaluate', {
            expression: `
                const toggle = document.querySelector('#domain-select button');
                if (toggle) toggle.click();
            `
        });

        ws.close();
    });
}

main().catch(console.error);
