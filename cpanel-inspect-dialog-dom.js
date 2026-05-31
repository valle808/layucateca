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

        console.log('Clicking DESTROY...');
        await send('Runtime.evaluate', {
            expression: `
                (function() {
                    const btns = Array.from(document.querySelectorAll('button, ui-button, a, span'));
                    const destroyBtn = btns.find(btn => btn.innerText && btn.innerText.trim().toUpperCase() === 'DESTROY');
                    if (destroyBtn) destroyBtn.click();
                })()
            `
        });

        await new Promise(r => setTimeout(r, 2000));

        // Find all visible text elements that appeared
        const dumpRes = await send('Runtime.evaluate', {
            expression: `
                (function() {
                    const elements = Array.from(document.querySelectorAll('div, span, button, p, h1, h2, h3, ui-button'));
                    const dialogText = elements.map(el => el.innerText ? el.innerText.trim() : '').filter(t => t.includes('sure') || t.includes('Agree') || t.includes('Delete') || t.includes('Confirm') || t.includes('permanently'));
                    
                    // Let's get outerHTML of elements that look like dialogs
                    const dialogContainer = document.querySelector('.modal-container, .dialog-container, .overlay, .popup, lvemanager-modal, modal');
                    
                    return {
                        dialogText: Array.from(new Set(dialogText)),
                        dialogContainerHTML: dialogContainer ? dialogContainer.outerHTML : 'No specific dialog container found'
                    };
                })()
            `,
            returnByValue: true
        });

        console.log('DOM Dump:');
        console.log(JSON.stringify(dumpRes.result.value, null, 2));

        ws.close();
    });
}

main().catch(console.error);
