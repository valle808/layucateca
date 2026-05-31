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

        const selectorDashboardUrl = 'https://server402.web-hosting.com:2083/cpsess3768607345/frontend/jupiter/lveversion/nodejs-selector.html.tt#/';
        console.log('Navigating to selector dashboard...');
        await send('Page.navigate', { url: selectorDashboardUrl });

        console.log('Waiting 10 seconds for selector dashboard...');
        await new Promise(r => setTimeout(r, 10000));

        console.log('Clicking CREATE APPLICATION...');
        const clickRes = await send('Runtime.evaluate', {
            expression: `
                (function() {
                    const btns = Array.from(document.querySelectorAll('button, span, div, a'));
                    const createBtn = btns.find(btn => btn.innerText && btn.innerText.trim().toUpperCase() === 'CREATE APPLICATION');
                    if (createBtn) {
                        createBtn.click();
                        return 'SUCCESS: Clicked CREATE APPLICATION button!';
                    }
                    return 'ERROR: CREATE APPLICATION button not found';
                })()
            `,
            returnByValue: true
        });
        console.log('Click Result:', clickRes.result.value);

        // Wait 4 seconds for the form to render
        console.log('Waiting 4 seconds for form...');
        await new Promise(r => setTimeout(r, 4000));

        // Take a screenshot of the create form
        const screenshot = await send('Page.captureScreenshot', { format: 'png' });
        fs.writeFileSync('/Users/sergiovalle/.gemini/antigravity-ide/brain/9e75d83a-a66c-4bae-8cc7-6d0a96f25627/cpanel_create_app_form.png', Buffer.from(screenshot.data, 'base64'));
        console.log('Screenshot of create app form saved to cpanel_create_app_form.png');

        // Dump form inputs, labels, selects
        const formDump = await send('Runtime.evaluate', {
            expression: `
                (function() {
                    const results = {};
                    
                    const labels = Array.from(document.querySelectorAll('label, .lvemanager-title'));
                    results.labels = labels.map(l => l.innerText ? l.innerText.trim() : '');
                    
                    const inputs = Array.from(document.querySelectorAll('input, select'));
                    results.inputs = inputs.map(i => ({
                        tagName: i.tagName,
                        className: i.className,
                        id: i.id,
                        placeholder: i.placeholder,
                        value: i.value
                    }));
                    
                    // Look for domain selects or dropdown buttons
                    const selects = Array.from(document.querySelectorAll('ui-select, .selector_dropdown'));
                    results.selects = selects.map(s => ({
                        id: s.id,
                        outerHTML: s.outerHTML.substring(0, 400),
                        innerText: s.innerText ? s.innerText.trim() : ''
                    }));
                    
                    return results;
                })()
            `,
            returnByValue: true
        });
        console.log('Form Fields found:');
        console.log(JSON.stringify(formDump.result.value, null, 2));

        ws.close();
    });
}

main().catch(console.error);
