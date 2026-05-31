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

        const clickRes = await send('Runtime.evaluate', {
            expression: `
                (function() {
                    const elements = Array.from(document.querySelectorAll('button, a, span, div, ui-button'));
                    const createBtn = elements.find(el => el.innerText && el.innerText.trim().toUpperCase() === 'CREATE APPLICATION' && el.offsetWidth > 0);
                    if (createBtn) {
                        createBtn.click();
                        
                        // Fallback click on the child button if it is a ui-button wrapper
                        const childBtn = createBtn.querySelector('button');
                        if (childBtn) childBtn.click();
                        
                        return {
                            success: true,
                            tagName: createBtn.tagName,
                            className: createBtn.className,
                            outerHTML: createBtn.outerHTML.substring(0, 300)
                        };
                    }
                    return { success: false, error: 'Visible button not found' };
                })()
            `,
            returnByValue: true
        });

        console.log('Click Result:', JSON.stringify(clickRes.result.value, null, 2));

        // Wait 6 seconds for navigation and form rendering
        console.log('Waiting 6 seconds...');
        await new Promise(r => setTimeout(r, 6000));

        // Check inner text
        const checkText = await send('Runtime.evaluate', {
            expression: 'document.body.innerText.substring(0, 1500)',
            returnByValue: true
        });
        console.log('--- Page text after click ---');
        console.log(checkText.result.value);
        console.log('--- End page text ---');

        // Take a screenshot
        const screenshot = await send('Page.captureScreenshot', { format: 'png' });
        fs.writeFileSync('/Users/sergiovalle/.gemini/antigravity-ide/brain/9e75d83a-a66c-4bae-8cc7-6d0a96f25627/cpanel_after_create_click.png', Buffer.from(screenshot.data, 'base64'));
        console.log('Screenshot saved to cpanel_after_create_click.png');

        ws.close();
    });
}

main().catch(console.error);
