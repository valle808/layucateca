const fs = require('fs');
const http = require('http');
const WebSocket = require('ws');

function getVercelWebSocketDebuggerUrl() {
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
                    const page = pages.find(p => p.type === 'page' && p.url.includes('vercel.com'));
                    if (page) resolve(page.webSocketDebuggerUrl);
                    else reject(new Error('Vercel tab not found'));
                } catch (e) { reject(e); }
            });
        });
        req.on('error', reject);
        req.end();
    });
}

async function main() {
    const wsUrl = await getVercelWebSocketDebuggerUrl();
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

        const clickResult = await send('Runtime.evaluate', {
            expression: `
                (function() {
                    const btns = Array.from(document.querySelectorAll('button'));
                    const addBtn = btns.find(b => b.innerText.trim() === 'Add Environment Variable');
                    if (addBtn) {
                        addBtn.click();
                        return 'Clicked Add Environment Variable button';
                    }
                    return 'Add Environment Variable button not found';
                })()
            `,
            returnByValue: true
        });

        console.log('Click result:', clickResult.result.value);

        // Wait 2 seconds for the modal/form to open
        console.log('Waiting 2 seconds...');
        await new Promise(r => setTimeout(r, 2000));

        // Take a screenshot
        const screenshot = await send('Page.captureScreenshot', { format: 'png' });
        fs.writeFileSync('/Users/sergiovalle/.gemini/antigravity-ide/brain/9e75d83a-a66c-4bae-8cc7-6d0a96f25627/vercel_env_opened.png', Buffer.from(screenshot.data, 'base64'));
        console.log('Screenshot saved to vercel_env_opened.png');

        // Inspect elements now
        const inspectRes = await send('Runtime.evaluate', {
            expression: `
                (function() {
                    const inputs = Array.from(document.querySelectorAll('input'));
                    const textareas = Array.from(document.querySelectorAll('textarea'));
                    const buttons = Array.from(document.querySelectorAll('button'));
                    
                    return {
                        inputs: inputs.map(i => ({
                            id: i.id,
                            name: i.name,
                            placeholder: i.placeholder,
                            value: i.value,
                            type: i.type,
                            outerHTML: i.outerHTML.substring(0, 300)
                        })),
                        textareas: textareas.map(t => ({
                            id: t.id,
                            placeholder: t.placeholder,
                            value: t.value,
                            outerHTML: t.outerHTML.substring(0, 300)
                        })),
                        buttons: buttons.map(b => ({
                            innerText: b.innerText,
                            className: b.className,
                            outerHTML: b.outerHTML.substring(0, 300)
                        }))
                    };
                })()
            `,
            returnByValue: true
        });

        console.log('DOM Elements after click:');
        console.log(JSON.stringify(inspectRes.result.value, null, 2));

        ws.close();
    });
}

main().catch(console.error);
