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

        // Function to add a single env variable
        const addEnvVar = async (key, value) => {
            console.log(`Adding ${key}...`);
            const runRes = await send('Runtime.evaluate', {
                expression: `
                    (async function() {
                        function setReactValue(el, val) {
                            const prototype = Object.getPrototypeOf(el);
                            const prototypeValueSetter = Object.getOwnPropertyDescriptor(prototype, 'value').set;
                            prototypeValueSetter.call(el, val);
                            el.dispatchEvent(new Event('input', { bubbles: true }));
                            el.dispatchEvent(new Event('change', { bubbles: true }));
                        }

                        // Check if add form is open by looking for key input
                        let keyInput = document.querySelector('input[aria-label="environment variable key"]') || document.querySelector('input[data-testid="env-variables/add-form/name-input"]');
                        if (!keyInput) {
                            const btns = Array.from(document.querySelectorAll('button'));
                            const addBtn = btns.find(b => b.innerText.trim() === 'Add Environment Variable');
                            if (addBtn) {
                                addBtn.click();
                                // Wait 1 second
                                await new Promise(r => setTimeout(r, 1000));
                                keyInput = document.querySelector('input[aria-label="environment variable key"]') || document.querySelector('input[data-testid="env-variables/add-form/name-input"]');
                            }
                        }

                        if (!keyInput) {
                            return 'Error: keyInput still not found';
                        }

                        const valTextarea = document.querySelector('textarea[aria-label="shared environment variable value"]') || document.querySelector('textarea');
                        const saveBtn = Array.from(document.querySelectorAll('button')).find(b => b.innerText.trim() === 'Save');

                        if (keyInput && valTextarea && saveBtn) {
                            setReactValue(keyInput, '${key}');
                            setReactValue(valTextarea, '${value}');
                            
                            // Check the environments: make sure Development, Preview, Production are all checked/selected if picker is open or by default
                            // By default Vercel checks Production, Preview, Development. Let's make sure.
                            
                            await new Promise(r => setTimeout(r, 500));
                            saveBtn.click();
                            return 'Submitted ${key}';
                        } else {
                            return 'Error: keyInput=' + !!keyInput + ', valTextarea=' + !!valTextarea + ', saveBtn=' + !!saveBtn;
                        }
                    })()
                `,
                awaitPromise: true,
                returnByValue: true
            });
            return runRes.result.value;
        };

        // Add NEXT_PUBLIC_WHATSAPP_SERVICE_URL
        const res1 = await addEnvVar('NEXT_PUBLIC_WHATSAPP_SERVICE_URL', 'https://wa.layucateca.com');
        console.log('Result 1:', res1);
        console.log('Waiting 5 seconds for save...');
        await new Promise(r => setTimeout(r, 5000));

        // Add WHATSAPP_SERVICE_URL
        const res2 = await addEnvVar('WHATSAPP_SERVICE_URL', 'https://wa.layucateca.com');
        console.log('Result 2:', res2);
        console.log('Waiting 5 seconds for save...');
        await new Promise(r => setTimeout(r, 5000));

        // Capture a screenshot
        const screenshot = await send('Page.captureScreenshot', { format: 'png' });
        fs.writeFileSync('/Users/sergiovalle/.gemini/antigravity-ide/brain/9e75d83a-a66c-4bae-8cc7-6d0a96f25627/vercel_envs_added.png', Buffer.from(screenshot.data, 'base64'));
        console.log('Screenshot saved to vercel_envs_added.png');

        // Check text to verify they are in the list now
        const checkText = await send('Runtime.evaluate', {
            expression: 'document.body.innerText.substring(0, 3000)',
            returnByValue: true
        });
        console.log('--- Page text ---');
        console.log(checkText.result?.value?.substring(0, 1500) || 'No text');
        console.log('--- End page text ---');

        ws.close();
    });
}

main().catch(console.error);
