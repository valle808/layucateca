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
                    else reject(new Error('cPanel Tools tab not found'));
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

        const clickResult = await send('Runtime.evaluate', {
            expression: `
                (function() {
                    const selectEl = document.querySelector('#domain-select');
                    if (selectEl) {
                        const btn = selectEl.querySelector('button');
                        if (btn) {
                            btn.click();
                            return 'Clicked domain dropdown button!';
                        }
                        return 'Dropdown button not found';
                    }
                    return 'domain-select element not found';
                })()
            `,
            returnByValue: true
        });

        console.log('Action result:', clickResult.result.value);

        // Wait 1 second for the dropdown menu to display in DOM
        await new Promise(r => setTimeout(r, 1000));

        // Let's inspect the options that appeared in the DOM
        const optionsRes = await send('Runtime.evaluate', {
            expression: `
                (function() {
                    const items = Array.from(document.querySelectorAll('a, li, button, div, span'));
                    // Filter elements that have layucateca.com
                    const domainItems = items.filter(el => {
                        const text = el.innerText ? el.innerText.trim() : '';
                        return text.includes('layucateca.com');
                    });
                    
                    return domainItems.map(el => ({
                        tagName: el.tagName,
                        innerText: el.innerText.trim(),
                        className: el.className,
                        outerHTML: el.outerHTML.substring(0, 300)
                    }));
                })()
            `,
            returnByValue: true
        });

        console.log('Found domain-related elements in DOM after click:');
        console.log(JSON.stringify(optionsRes.result.value, null, 2));

        ws.close();
    });
}

main().catch(console.error);
