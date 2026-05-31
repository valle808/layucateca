const WebSocket = require('ws');
const http = require('http');
const fs = require('fs');

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
                    const page = pages.find(p => p.type === 'page' && p.url.includes('nodejs-selector.html'));
                    if (page) resolve(page.webSocketDebuggerUrl);
                    else reject(new Error('Active cPanel session page not found'));
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
    ws.on('open', async () => {
        let messageId = 1;
        const send = (method, params = {}) => new Promise((resolve) => {
            const id = messageId++;
            const listener = (data) => {
                const res = JSON.parse(data);
                if (res.id === id) {
                    ws.off('message', listener);
                    resolve(res.result);
                }
            };
            ws.on('message', listener);
            ws.send(JSON.stringify({ id, method, params }));
        });

        await send('Page.enable');

        console.log('Opening domain dropdown and changing URL...');
        const actionResult = await send('Runtime.evaluate', {
            expression: `
                new Promise((resolve) => {
                    const toggle = document.querySelector('#domain-select button');
                    if (!toggle) {
                        resolve('ERROR: Dropdown toggle not found');
                        return;
                    }
                    toggle.click();

                    setTimeout(() => {
                        const items = Array.from(document.querySelectorAll('.dropdown-menu li, .selector_dropdown li'));
                        const targetItem = items.find(i => i.innerText && i.innerText.trim() === 'wa.layucateca.com');
                        if (!targetItem) {
                            resolve('ERROR: wa.layucateca.com not found in dropdown list');
                            return;
                        }
                        targetItem.click();

                        // Now find the subfolder input box (currently has value "wa")
                        // In cPanel it is the input element next to the domain-select
                        const subfolderInput = document.querySelector('ui-text[ngModel] input, .input-group input');
                        if (subfolderInput) {
                            subfolderInput.focus();
                            subfolderInput.value = '';
                            subfolderInput.dispatchEvent(new Event('input', { bubbles: true }));
                            subfolderInput.dispatchEvent(new Event('change', { bubbles: true }));
                            subfolderInput.blur();
                            subfolderInput.dispatchEvent(new Event('blur', { bubbles: true }));
                            
                            // Try to trigger AngularJS model if available
                            try {
                                const el = window.angular.element(subfolderInput);
                                const model = el.controller('ngModel');
                                if (model) {
                                    model.$setViewValue('');
                                    model.$render();
                                }
                            } catch (_) {}
                        }

                        // Force digest
                        try {
                            window.angular.element(document.body).scope().$apply();
                        } catch (_) {}

                        // Click SAVE
                        setTimeout(() => {
                            const btns = Array.from(document.querySelectorAll('button, a, span'));
                            const saveBtn = btns.find(btn => btn.innerText && btn.innerText.trim().toUpperCase() === 'SAVE');
                            if (saveBtn) {
                                saveBtn.click();
                                resolve('SUCCESS: Changed domain and clicked SAVE');
                            } else {
                                resolve('ERROR: SAVE button not found');
                            }
                        }, 500);

                    }, 1000);
                })
            `,
            awaitPromise: true,
            returnByValue: true
        });
        console.log('Result:', actionResult.result.value);

        // Wait 8 seconds for save to complete
        console.log('Waiting 8 seconds for cPanel to save URL change...');
        await new Promise(r => setTimeout(r, 8000));

        const textRes = await send('Runtime.evaluate', {
            expression: 'document.body.innerText',
            returnByValue: true
        });
        console.log('--- Page text after save ---');
        console.log(textRes.result?.value?.substring(0, 1000));
        console.log('--- End page text ---');

        const screenshot = await send('Page.captureScreenshot', { format: 'png' });
        fs.writeFileSync('/Users/sergiovalle/.gemini/antigravity-ide/brain/9e75d83a-a66c-4bae-8cc7-6d0a96f25627/cpanel_url_changed.png', Buffer.from(screenshot.data, 'base64'));
        console.log('URL change screenshot saved to cpanel_url_changed.png');

        ws.close();
    });
}
main().catch(console.error);
