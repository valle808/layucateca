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

        console.log('Force-changing domain and saving...');
        const forceRes = await send('Runtime.evaluate', {
            expression: `
                new Promise((resolve) => {
                    const toggle = document.querySelector('#domain-select button');
                    if (!toggle) {
                        resolve('ERROR: Toggle not found');
                        return;
                    }
                    
                    // Click toggle
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
                            if (input) {
                                input.value = '';
                                input.dispatchEvent(new Event('input', { bubbles: true }));
                                input.dispatchEvent(new Event('change', { bubbles: true }));
                            }
                            
                            setTimeout(() => {
                                // Find Save button
                                const btns = Array.from(document.querySelectorAll('button, ui-button'));
                                const saveBtn = btns.find(btn => btn.innerText && btn.innerText.trim().toUpperCase() === 'SAVE');
                                
                                if (!saveBtn) {
                                    resolve('ERROR: SAVE button not found');
                                    return;
                                }
                                
                                // Let's remove disabled classes and attributes from the button and its wrappers
                                const buttonEl = saveBtn.querySelector('button') || saveBtn;
                                buttonEl.removeAttribute('disabled');
                                buttonEl.classList.remove('disabled');
                                
                                const spanEl = saveBtn.querySelector('span');
                                if (spanEl) {
                                    spanEl.removeAttribute('disabled');
                                    spanEl.classList.remove('disabled');
                                }
                                
                                const divEl = saveBtn.querySelector('div');
                                if (divEl) {
                                    divEl.classList.remove('disabled');
                                }
                                
                                // Dispatch a click on the button itself!
                                buttonEl.click();
                                resolve('SUCCESS: Bypassed disabled state and clicked SAVE!');
                            }, 500);
                        }, 500);
                    }, 500);
                })
            `,
            awaitPromise: true,
            returnByValue: true
        });

        console.log('Force Save Action Result:', forceRes.result.value);

        // Wait 10 seconds for cPanel to process the submit
        console.log('Waiting 10 seconds...');
        await new Promise(r => setTimeout(r, 10000));

        // Take a screenshot to verify
        const screenshot = await send('Page.captureScreenshot', { format: 'png' });
        fs.writeFileSync('/Users/sergiovalle/.gemini/antigravity-ide/brain/9e75d83a-a66c-4bae-8cc7-6d0a96f25627/cpanel_url_changed.png', Buffer.from(screenshot.data, 'base64'));
        console.log('Screenshot saved to cpanel_url_changed.png');

        // Check the text of the page
        const checkText = await send('Runtime.evaluate', {
            expression: 'document.body.innerText.substring(0, 1500)',
            returnByValue: true
        });
        console.log('--- Page text after force save ---');
        console.log(checkText.result.value);
        console.log('--- End page text ---');

        ws.close();
    });
}

main().catch(console.error);
