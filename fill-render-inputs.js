const fs = require('fs');
const http = require('http');
const WebSocket = require('ws');

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
                    const page = pages.find(p => p.type === 'page' && p.url.includes('render.com'));
                    if (page) resolve(page.webSocketDebuggerUrl);
                    else reject(new Error('Render page not found'));
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
        console.log('Connected to Render tab');
        await send('Page.enable');

        const result = await send('Runtime.evaluate', {
            expression: `
                (function() {
                    // Helper to set React input value
                    function setReactValue(element, value) {
                        const lastValue = element.value;
                        element.value = value;
                        const event = new Event('input', { bubbles: true });
                        event.simulated = true;
                        const tracker = element._valueTracker;
                        if (tracker) {
                            tracker.setValue(lastValue);
                        }
                        element.dispatchEvent(event);
                        
                        // Also dispatch change event
                        const changeEvent = new Event('change', { bubbles: true });
                        element.dispatchEvent(changeEvent);
                    }

                    // 1. Dismiss card modal if open
                    const buttons = Array.from(document.querySelectorAll('button'));
                    const cancelBtn = buttons.find(b => b.innerText && b.innerText.trim() === 'Cancel');
                    if (cancelBtn) {
                        cancelBtn.click();
                        console.log('Clicked Cancel to close modal');
                    }

                    // Wait a moment (we do this inside a setTimeout in the browser context)
                    setTimeout(() => {
                        const buildEl = document.querySelector('#buildCommand');
                        const startEl = document.querySelector('#startCommand');
                        
                        if (buildEl) {
                            setReactValue(buildEl, 'npm install && npm run build');
                            console.log('Set Build Command');
                        }
                        if (startEl) {
                            setReactValue(startEl, 'node dist/index.js');
                            console.log('Set Start Command');
                        }

                        // Click deploy button
                        setTimeout(() => {
                            const deployBtn = Array.from(document.querySelectorAll('button'))
                                .find(btn => btn.innerText && btn.innerText.includes('Deploy Web Service'));
                            if (deployBtn) {
                                deployBtn.click();
                                console.log('Clicked Deploy Web Service');
                            }
                        }, 500);
                    }, 500);
                    
                    return 'Sequence started';
                })()
            `,
            returnByValue: true
        });

        console.log('Evaluation result:', result.result.value);

        // Wait 2 seconds and take screenshot
        await new Promise(r => setTimeout(r, 2000));
        const screenshot = await send('Page.captureScreenshot', { format: 'png' });
        fs.writeFileSync('/Users/sergiovalle/.gemini/antigravity-ide/brain/9e75d83a-a66c-4bae-8cc7-6d0a96f25627/render_ready_for_user_card.png', Buffer.from(screenshot.data, 'base64'));
        console.log('Screenshot saved to render_ready_for_user_card.png');

        ws.close();
    });
}
main().catch(console.error);
