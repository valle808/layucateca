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
        console.log('Connected to Render tab via CDP');
        await send('Page.enable');
        
        // Fill fields via Runtime.evaluate
        const fillResult = await send('Runtime.evaluate', {
            expression: `
                (function() {
                    const buildEl = document.querySelector('#buildCommand');
                    const startEl = document.querySelector('#startCommand');
                    let status = {};
                    
                    if (buildEl) {
                        buildEl.value = 'npm install && npm run build';
                        buildEl.dispatchEvent(new Event('input', { bubbles: true }));
                        buildEl.dispatchEvent(new Event('change', { bubbles: true }));
                        status.buildFilled = true;
                    } else {
                        status.buildFilled = false;
                    }
                    
                    if (startEl) {
                        startEl.value = 'node dist/index.js';
                        startEl.dispatchEvent(new Event('input', { bubbles: true }));
                        startEl.dispatchEvent(new Event('change', { bubbles: true }));
                        status.startFilled = true;
                    } else {
                        status.startFilled = false;
                    }
                    
                    return status;
                })()
            `,
            returnByValue: true
        });
        console.log('Fields filled status:', fillResult.result.value);

        // Take a screenshot of the filled fields
        let screenshot = await send('Page.captureScreenshot', { format: 'png' });
        fs.writeFileSync('/Users/sergiovalle/.gemini/antigravity-ide/brain/9e75d83a-a66c-4bae-8cc7-6d0a96f25627/render_filled.png', Buffer.from(screenshot.data, 'base64'));
        console.log('Screenshot of filled form saved to render_filled.png');

        // Click Deploy Web Service button
        const clickResult = await send('Runtime.evaluate', {
            expression: `
                (function() {
                    const btns = Array.from(document.querySelectorAll('button'));
                    const deployBtn = btns.find(btn => btn.innerText && btn.innerText.includes('Deploy Web Service'));
                    if (deployBtn) {
                        deployBtn.click();
                        return 'Clicked Deploy Web Service';
                    }
                    return 'Deploy button not found';
                })()
            `,
            returnByValue: true
        });
        console.log('Click action result:', clickResult.result.value);

        // Wait 5 seconds for navigation or processing
        console.log('Waiting 5 seconds...');
        await new Promise(r => setTimeout(r, 5000));

        // Get current URL and check state
        const stateResult = await send('Runtime.evaluate', {
            expression: '({ url: window.location.href, text: document.body.innerText.substring(0, 1000) })',
            returnByValue: true
        });
        console.log('New URL:', stateResult.result.value.url);
        console.log('Page preview text:', stateResult.result.value.text);

        // Take a final screenshot
        screenshot = await send('Page.captureScreenshot', { format: 'png' });
        fs.writeFileSync('/Users/sergiovalle/.gemini/antigravity-ide/brain/9e75d83a-a66c-4bae-8cc7-6d0a96f25627/render_after_deploy.png', Buffer.from(screenshot.data, 'base64'));
        console.log('Screenshot after deploy click saved to render_after_deploy.png');

        ws.close();
    });
}
main().catch(console.error);
