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

        // Let's reload or navigate to clean the error state first
        console.log('Refreshing the page to clear error...');
        await send('Page.navigate', { url: 'https://vercel.com/sergios-projects-1a95b381/~/domains/layucateca.com' });
        await new Promise(r => setTimeout(r, 8000));

        const result = await send('Runtime.evaluate', {
            expression: `
                (function() {
                    function setReactInputValue(inputEl, value) {
                        const prototype = Object.getPrototypeOf(inputEl);
                        const prototypeValueSetter = Object.getOwnPropertyDescriptor(prototype, 'value').set;
                        prototypeValueSetter.call(inputEl, value);
                        inputEl.dispatchEvent(new Event('input', { bubbles: true }));
                        inputEl.dispatchEvent(new Event('change', { bubbles: true }));
                    }

                    const nameInput = document.querySelector('input[aria-label="Name"]') || document.querySelector('input[placeholder="subdomain"]');
                    const valueInput = document.querySelector('input[aria-label="Value"]') || document.querySelector('input[placeholder="76.76.21.21"]');
                    const addBtn = Array.from(document.querySelectorAll('button')).find(b => b.innerText.trim() === 'Add');

                    if (nameInput && valueInput && addBtn) {
                        setReactInputValue(nameInput, 'wa');
                        setReactInputValue(valueInput, '162.213.253.112');
                        
                        // Wait a tiny bit and click
                        setTimeout(() => {
                            addBtn.click();
                        }, 500);
                        return 'Triggered React inputs and scheduled click!';
                    } else {
                        return 'Error: nameInput=' + !!nameInput + ', valueInput=' + !!valueInput + ', addBtn=' + !!addBtn;
                    }
                })()
            `,
            returnByValue: true
        });

        console.log('Action result:', result.result.value);

        // Wait 8 seconds for the action to complete
        console.log('Waiting 8 seconds...');
        await new Promise(r => setTimeout(r, 8000));

        // Take a screenshot
        const screenshot = await send('Page.captureScreenshot', { format: 'png' });
        const filePath = '/Users/sergiovalle/.gemini/antigravity-ide/brain/9e75d83a-a66c-4bae-8cc7-6d0a96f25627/vercel_dns_added.png';
        fs.writeFileSync(filePath, Buffer.from(screenshot.data, 'base64'));
        console.log('Screenshot saved to vercel_dns_added.png');

        // Check page text to see if there is any message
        const checkText = await send('Runtime.evaluate', {
            expression: 'document.body.innerText.substring(0, 3000)',
            returnByValue: true
        });
        console.log('--- Page text after action ---');
        console.log(checkText.result?.value?.substring(0, 1500) || 'No text');
        console.log('--- End page text ---');

        ws.close();
    });
}

main().catch(console.error);
