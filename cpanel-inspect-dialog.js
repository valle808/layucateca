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

        console.log('Clicking DESTROY button...');
        const destroyRes = await send('Runtime.evaluate', {
            expression: `
                (function() {
                    const btns = Array.from(document.querySelectorAll('button, ui-button, a, span'));
                    const destroyBtn = btns.find(btn => btn.innerText && btn.innerText.trim().toUpperCase() === 'DESTROY');
                    if (destroyBtn) {
                        destroyBtn.click();
                        return 'SUCCESS: Clicked DESTROY button!';
                    }
                    return 'ERROR: DESTROY button not found';
                })()
            `,
            returnByValue: true
        });
        console.log('Destroy Button Click Result:', destroyRes.result.value);

        // Wait 3 seconds for the confirmation modal to appear
        console.log('Waiting 3 seconds for confirmation dialog...');
        await new Promise(r => setTimeout(r, 3000));

        // Take a screenshot of the dialog
        const screenshot = await send('Page.captureScreenshot', { format: 'png' });
        fs.writeFileSync('/Users/sergiovalle/.gemini/antigravity-ide/brain/9e75d83a-a66c-4bae-8cc7-6d0a96f25627/cpanel_inspect_dialog.png', Buffer.from(screenshot.data, 'base64'));
        console.log('Screenshot of confirmation dialog saved to cpanel_inspect_dialog.png');

        // Check the text and elements inside the dialog
        const evalRes = await send('Runtime.evaluate', {
            expression: `
                (function() {
                    const results = {};
                    const dialogs = Array.from(document.querySelectorAll('modal, dialog, .modal, .modal-dialog, .dialog, .lvemanager-dialog'));
                    results.dialogs = dialogs.map(d => ({
                        className: d.className,
                        innerText: d.innerText ? d.innerText.trim() : '',
                        buttons: Array.from(d.querySelectorAll('button')).map(b => b.innerText ? b.innerText.trim() : '')
                    }));
                    
                    // Fallback to all buttons on the page
                    const allBtns = Array.from(document.querySelectorAll('button, ui-button, a'));
                    results.allButtons = allBtns.map(b => b.innerText ? b.innerText.trim() : '').filter(t => t.length > 0);
                    
                    return results;
                })()
            `,
            returnByValue: true
        });
        console.log('Dialog Elements:', JSON.stringify(evalRes.result.value, null, 2));

        ws.close();
    });
}

main().catch(console.error);
