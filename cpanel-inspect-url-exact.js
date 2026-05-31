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

        const inspectRes = await send('Runtime.evaluate', {
            expression: `
                (function() {
                    const labels = Array.from(document.querySelectorAll('label, div, span'));
                    const urlLabel = labels.find(l => l.innerText && l.innerText.trim() === 'Application URL');
                    if (urlLabel) {
                        // Find the parent block containing this label
                        let parent = urlLabel.parentElement;
                        for (let i = 0; i < 4; i++) {
                            if (parent && parent.innerText && parent.innerText.includes('layucateca.com')) {
                                break;
                            }
                            if (parent) parent = parent.parentElement;
                        }
                        
                        if (parent) {
                            return {
                                labelHTML: urlLabel.outerHTML,
                                parentHTML: parent.outerHTML.substring(0, 3000),
                                innerText: parent.innerText
                            };
                        }
                    }
                    return 'Not found';
                })()
            `,
            returnByValue: true
        });

        console.log('DOM Exact urlDiv found:');
        console.log(JSON.stringify(inspectRes.result.value, null, 2));
        ws.close();
    });
}

main().catch(console.error);
