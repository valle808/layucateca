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

        const result = await send('Runtime.evaluate', {
            expression: `
                (function() {
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

                    // Check Submit button status
                    const submitBtn = Array.from(document.querySelectorAll('button')).find(btn => btn.innerText && btn.innerText.trim() === 'Submit');

                    return {
                        domainVal: domainInput ? domainInput.value : null,
                        domainClass: domainInput ? domainInput.className : null,
                        checkboxChecked: checkbox ? checkbox.checked : null,
                        rootVal: rootInput ? rootInput.value : null,
                        rootClass: rootInput ? rootInput.className : null,
                        submitEnabled: submitBtn ? !submitBtn.disabled : null
                    };
                })()
            `,
            returnByValue: true
        });
        console.log(result.result.value);

        ws.close();
    });
}
main().catch(console.error);
