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
                    const page = pages.find(p => p.type === 'page' && p.url.includes('web-hosting.com'));
                    if (page) resolve(page.webSocketDebuggerUrl);
                    else reject(new Error('Page not found'));
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

        const urlRes = await send('Runtime.evaluate', {
            expression: 'window.location.href',
            returnByValue: true
        });
        const currentUrl = urlRes.result.value;
        const match = currentUrl.match(/^(https?:\/\/[^\/]+\/cpsess\d+)/);
        if (!match) {
            console.error('Session not found in URL:', currentUrl);
            ws.close();
            return;
        }

        const createDomainUrl = match[1] + '/frontend/jupiter/domains/index.html#/create';
        console.log('Navigating directly to Create Domain URL:', createDomainUrl);
        await send('Page.navigate', { url: createDomainUrl });
        await new Promise(r => setTimeout(r, 6000));

        console.log('Filling form and submitting via AngularJS...');
        const submitResult = await send('Runtime.evaluate', {
            expression: `
                new Promise((resolve) => {
                    const domainInput = document.querySelector('#newDomainName');
                    const rootInput = document.querySelector('#documentRoot');
                    const checkbox = document.querySelector('#inheritDocumentRoot');

                    if (domainInput) {
                        const el = window.angular.element(domainInput);
                        const model = el.controller('ngModel');
                        model.$setViewValue('wa.layucateca.com');
                        model.$render();
                    }

                    if (checkbox) {
                        const el = window.angular.element(checkbox);
                        const model = el.controller('ngModel');
                        model.$setViewValue(false); // Uncheck it
                        model.$render();
                    }

                    if (rootInput) {
                        const el = window.angular.element(rootInput);
                        const model = el.controller('ngModel');
                        model.$setViewValue('public_html/wa');
                        model.$render();
                    }

                    // Force scope digest
                    const scope = window.angular.element(document.body).scope();
                    if (scope) scope.$apply();

                    // Wait 500ms for DOM update, then click Submit
                    setTimeout(() => {
                        const submitBtn = Array.from(document.querySelectorAll('button')).find(btn => btn.innerText && btn.innerText.trim() === 'Submit');
                        if (submitBtn) {
                            if (submitBtn.disabled) {
                                resolve('ERROR: Submit button is still disabled after wait!');
                            } else {
                                submitBtn.click();
                                resolve('SUCCESS: Form submitted!');
                            }
                        } else {
                            resolve('ERROR: Submit button not found!');
                        }
                    }, 500);
                })
            `,
            awaitPromise: true,
            returnByValue: true
        });
        console.log('Submit Action Result:', submitResult.result.value);

        // Take a screenshot of submitting state
        let screenshot = await send('Page.captureScreenshot', { format: 'png' });
        fs.writeFileSync('/Users/sergiovalle/.gemini/antigravity-ide/brain/9e75d83a-a66c-4bae-8cc7-6d0a96f25627/cpanel_submitting.png', Buffer.from(screenshot.data, 'base64'));

        // Wait 25 seconds for cPanel subdomain creation to completely finish
        console.log('Waiting 25 seconds for domain creation to finish...');
        await new Promise(r => setTimeout(r, 25000));

        const textRes = await send('Runtime.evaluate', {
            expression: 'document.body.innerText',
            returnByValue: true
        });
        console.log('--- Result Page Text ---');
        console.log(textRes.result?.value?.substring(0, 1500));
        console.log('--- End Result Page Text ---');

        screenshot = await send('Page.captureScreenshot', { format: 'png' });
        fs.writeFileSync('/Users/sergiovalle/.gemini/antigravity-ide/brain/9e75d83a-a66c-4bae-8cc7-6d0a96f25627/cpanel_submitting_result.png', Buffer.from(screenshot.data, 'base64'));
        console.log('Result screenshot saved to cpanel_submitting_result.png');

        ws.close();
    });
}
main().catch(console.error);
