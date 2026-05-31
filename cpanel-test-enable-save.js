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

        const testRes = await send('Runtime.evaluate', {
            expression: `
                new Promise((resolve) => {
                    const toggle = document.querySelector('#domain-select button');
                    if (!toggle) {
                        resolve('ERROR: Toggle not found');
                        return;
                    }
                    
                    // Click toggle to open dropdown
                    toggle.click();
                    
                    setTimeout(() => {
                        const items = Array.from(document.querySelectorAll('.b_dropdown-menu li, .selector_dropdown li'));
                        const targetItem = items.find(i => i.innerText && i.innerText.trim() === 'wa.layucateca.com');
                        if (!targetItem) {
                            resolve('ERROR: wa.layucateca.com not found in dropdown list');
                            return;
                        }
                        
                        // Click the item
                        targetItem.click();
                        
                        setTimeout(() => {
                            // Find subfolder input
                            const input = document.querySelector('ui-text input, .input-group input');
                            if (!input) {
                                resolve('ERROR: Subfolder input not found');
                                return;
                            }
                            
                            // Set value to empty
                            input.value = '';
                            input.dispatchEvent(new Event('input', { bubbles: true }));
                            input.dispatchEvent(new Event('change', { bubbles: true }));
                            
                            setTimeout(() => {
                                // Inspect Save button
                                const btns = Array.from(document.querySelectorAll('button, ui-button'));
                                const saveBtn = btns.find(btn => btn.innerText && btn.innerText.trim().toUpperCase() === 'SAVE');
                                
                                resolve({
                                    saveBtnText: saveBtn ? saveBtn.innerText : 'Not found',
                                    saveBtnHTML: saveBtn ? saveBtn.outerHTML : 'Not found',
                                    inputValue: input.value
                                });
                            }, 500);
                        }, 500);
                    }, 500);
                })
            `,
            awaitPromise: true,
            returnByValue: true
        });

        console.log('Result:', JSON.stringify(testRes.result.value, null, 2));

        ws.close();
    });
}

main().catch(console.error);
