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

        console.log('Clicking "Run NPM Install"...');
        const clickRes = await send('Runtime.evaluate', {
            expression: `
                (function() {
                    const btns = Array.from(document.querySelectorAll('button, ui-button, span, a, div'));
                    const npmBtn = btns.find(btn => btn.innerText && btn.innerText.trim().toUpperCase() === 'RUN NPM INSTALL' && btn.offsetWidth > 0);
                    if (npmBtn) {
                        const childBtn = npmBtn.querySelector('button') || npmBtn;
                        childBtn.click();
                        return 'SUCCESS: Clicked Run NPM Install!';
                    }
                    return 'ERROR: Run NPM Install button not found';
                })()
            `,
            returnByValue: true
        });
        console.log('NPM Click Result:', clickRes.result.value);

        // Wait 35 seconds for NPM install to complete
        console.log('Waiting 35 seconds for dependencies installation...');
        await new Promise(r => setTimeout(r, 35000));

        // Take a screenshot of NPM install result
        let screenshot = await send('Page.captureScreenshot', { format: 'png' });
        fs.writeFileSync('/Users/sergiovalle/.gemini/antigravity-ide/brain/9e75d83a-a66c-4bae-8cc7-6d0a96f25627/cpanel_npm_install_result.png', Buffer.from(screenshot.data, 'base64'));
        console.log('Screenshot of NPM Install result saved to cpanel_npm_install_result.png');

        // Check the text of the page to see if NPM install succeeded
        let textRes = await send('Runtime.evaluate', {
            expression: 'document.body.innerText.substring(0, 1500)',
            returnByValue: true
        });
        console.log('--- Page Text after NPM Install ---');
        console.log(textRes.result?.value);
        console.log('--- End Page Text ---');

        // Click RESTART!
        console.log('Clicking "RESTART" application...');
        const restartRes = await send('Runtime.evaluate', {
            expression: `
                (function() {
                    const btns = Array.from(document.querySelectorAll('button, ui-button, span, a, div'));
                    const restartBtn = btns.find(btn => btn.innerText && btn.innerText.trim().toUpperCase() === 'RESTART' && btn.offsetWidth > 0);
                    if (restartBtn) {
                        const childBtn = restartBtn.querySelector('button') || restartBtn;
                        childBtn.click();
                        return 'SUCCESS: Clicked RESTART!';
                    }
                    return 'ERROR: RESTART button not found';
                })()
            `,
            returnByValue: true
        });
        console.log('Restart Click Result:', restartRes.result.value);

        // Wait 6 seconds for restart to complete
        console.log('Waiting 6 seconds...');
        await new Promise(r => setTimeout(r, 6000));

        // Take a final screenshot of restarted state
        screenshot = await send('Page.captureScreenshot', { format: 'png' });
        fs.writeFileSync('/Users/sergiovalle/.gemini/antigravity-ide/brain/9e75d83a-a66c-4bae-8cc7-6d0a96f25627/cpanel_restart_completed.png', Buffer.from(screenshot.data, 'base64'));
        console.log('Final screenshot saved to cpanel_restart_completed.png');

        ws.close();
    });
}

main().catch(console.error);
