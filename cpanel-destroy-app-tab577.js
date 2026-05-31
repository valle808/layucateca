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

        console.log('Clicking visible Destroy button...');
        const clickRes = await send('Runtime.evaluate', {
            expression: `
                (function() {
                    const btns = Array.from(document.querySelectorAll('button#destroyAppButton'));
                    const visibleBtn = btns.find(b => b.offsetWidth > 0);
                    if (visibleBtn) {
                        visibleBtn.click();
                        return 'SUCCESS: Clicked visible DESTROY button!';
                    }
                    return 'ERROR: Visible DESTROY button not found';
                })()
            `,
            returnByValue: true
        });
        console.log('Click Result:', clickRes.result.value);

        // Wait 3 seconds
        console.log('Waiting 3 seconds for modal dialog...');
        await new Promise(r => setTimeout(r, 3000));

        // Take a screenshot
        const screenshot = await send('Page.captureScreenshot', { format: 'png' });
        fs.writeFileSync('/Users/sergiovalle/.gemini/antigravity-ide/brain/9e75d83a-a66c-4bae-8cc7-6d0a96f25627/cpanel_inspect_dialog.png', Buffer.from(screenshot.data, 'base64'));
        console.log('Screenshot saved to cpanel_inspect_dialog.png');

        // Check DOM for dialog and dialog buttons
        const inspectRes = await send('Runtime.evaluate', {
            expression: `
                (function() {
                    const results = {};
                    
                    // Look for overlay or modal containers
                    const overlays = Array.from(document.querySelectorAll('.modal-container, .dialog-container, .overlay, .popup, lvemanager-modal, modal, div')).filter(el => el.offsetWidth > 0 && (el.innerText && (el.innerText.includes('Delete') || el.innerText.includes('Destroy') || el.innerText.includes('Agree') || el.innerText.includes('sure'))));
                    
                    results.overlays = overlays.map(el => ({
                        tagName: el.tagName,
                        className: el.className,
                        innerText: el.innerText.trim().substring(0, 1000),
                        buttons: Array.from(el.querySelectorAll('button, a, span')).map(b => b.innerText ? b.innerText.trim() : '').filter(t => t.length > 0)
                    }));
                    
                    return results;
                })()
            `,
            returnByValue: true
        });

        console.log('Modal Dialog info:', JSON.stringify(inspectRes.result.value, null, 2));

        ws.close();
    });
}

main().catch(console.error);
