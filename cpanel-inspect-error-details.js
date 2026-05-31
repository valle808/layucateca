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

        const inspectRes = await send('Runtime.evaluate', {
            expression: `
                (function() {
                    const results = {};
                    
                    // Look for invalid form elements
                    const invalids = Array.from(document.querySelectorAll('.ng-invalid'));
                    results.invalidElements = invalids.map(el => ({
                        tagName: el.tagName,
                        className: el.className,
                        id: el.id,
                        outerHTML: el.outerHTML.substring(0, 300),
                        innerText: el.innerText ? el.innerText.trim() : ''
                    }));
                    
                    // Look for error alerts or tooltips
                    const errors = Array.from(document.querySelectorAll('.error, .alert, .tooltip, div, span')).filter(el => el.innerText && el.innerText.includes('invalid characters'));
                    results.errorTexts = errors.map(el => ({
                        tagName: el.tagName,
                        className: el.className,
                        innerText: el.innerText.trim(),
                        parentHTML: el.parentElement ? el.parentElement.outerHTML.substring(0, 400) : ''
                    }));
                    
                    return results;
                })()
            `,
            returnByValue: true
        });

        console.log('Validation/Error Inspection Result:');
        console.log(JSON.stringify(inspectRes.result.value, null, 2));

        ws.close();
    });
}

main().catch(console.error);
