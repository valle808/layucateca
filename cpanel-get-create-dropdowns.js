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

        // Let's click the Node.js version toggle, print the list, then close it.
        const inspectRes = await send('Runtime.evaluate', {
            expression: `
                new Promise((resolve) => {
                    const results = {};
                    
                    // Let's find all ui-select elements on the page
                    const selects = Array.from(document.querySelectorAll('ui-select'));
                    results.selects = selects.map(s => ({
                        id: s.id,
                        outerHTML: s.outerHTML.substring(0, 400),
                        innerText: s.innerText ? s.innerText.trim() : ''
                    }));
                    
                    // Click the first select (Node.js version dropdown)
                    if (selects[0]) {
                        const btn = selects[0].querySelector('button');
                        if (btn) btn.click();
                        
                        setTimeout(() => {
                            const listItems = Array.from(document.querySelectorAll('.b_dropdown-menu li, .selector_dropdown li'));
                            results.nodeVersions = listItems.map(li => li.innerText ? li.innerText.trim() : '');
                            
                            // Click toggle again to close
                            if (btn) btn.click();
                            resolve(results);
                        }, 500);
                    } else {
                        resolve(results);
                    }
                })
            `,
            awaitPromise: true,
            returnByValue: true
        });

        console.log('Dropdown choices:');
        console.log(JSON.stringify(inspectRes.result.value, null, 2));

        ws.close();
    });
}

main().catch(console.error);
