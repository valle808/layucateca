const fs = require('fs');
const http = require('http');
const WebSocket = require('ws');

async function main() {
    const wsUrl = "ws://127.0.0.1:9222/devtools/page/577E142666491BBC3CC5296B6C804CCA";
    console.log('Connecting to Selector tab 577...');
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

        console.log('Destroying application...');
        const destroyRes = await send('Runtime.evaluate', {
            expression: `
                new Promise((resolve) => {
                    const btns = Array.from(document.querySelectorAll('button#destroyAppButton'));
                    const visibleBtn = btns.find(b => b.offsetWidth > 0);
                    if (!visibleBtn) {
                        resolve('ERROR: Visible DESTROY button not found');
                        return;
                    }
                    visibleBtn.click();
                    
                    setTimeout(() => {
                        const agreeBtn = Array.from(document.querySelectorAll('button, span, div')).find(el => el.innerText && el.innerText.trim().toUpperCase() === 'AGREE');
                        if (agreeBtn) {
                            agreeBtn.click();
                            resolve('SUCCESS: Clicked AGREE to destroy application!');
                        } else {
                            resolve('ERROR: AGREE button not found in modal');
                        }
                    }, 1000);
                })
            `,
            awaitPromise: true,
            returnByValue: true
        });
        console.log('Result:', destroyRes.result.value);

        // Wait 15 seconds for destroy to complete
        console.log('Waiting 15 seconds for destroy completion...');
        await new Promise(r => setTimeout(r, 15000));

        // Take a screenshot of the dashboard list
        const screenshot = await send('Page.captureScreenshot', { format: 'png' });
        fs.writeFileSync('/Users/sergiovalle/.gemini/antigravity-ide/brain/9e75d83a-a66c-4bae-8cc7-6d0a96f25627/cpanel_destroyed_dashboard.png', Buffer.from(screenshot.data, 'base64'));
        console.log('Screenshot of restored selector dashboard saved to cpanel_destroyed_dashboard.png');

        // Check the text of the page
        const checkText = await send('Runtime.evaluate', {
            expression: 'document.body.innerText.substring(0, 1000)',
            returnByValue: true
        });
        console.log('--- Selector dashboard text ---');
        console.log(checkText.result.value);
        console.log('--- End page text ---');

        ws.close();
    });
}

main().catch(console.error);
