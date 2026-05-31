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

        // Check if elements are rendered
        const dumpRes = await send('Runtime.evaluate', {
            expression: `
                (function() {
                    const results = {};
                    
                    results.innerText = document.body.innerText.substring(0, 1500);
                    
                    const inputs = Array.from(document.querySelectorAll('input, select, ui-select, ui-text'));
                    results.elements = inputs.map(i => ({
                        tagName: i.tagName,
                        className: i.className,
                        id: i.id,
                        placeholder: i.placeholder || '',
                        value: i.value || '',
                        innerText: i.innerText ? i.innerText.trim() : ''
                    }));
                    
                    const btns = Array.from(document.querySelectorAll('button, ui-button')).map(b => b.innerText ? b.innerText.trim() : '');
                    results.buttons = btns.filter(t => t.length > 0);
                    
                    return results;
                })()
            `,
            returnByValue: true
        });

        console.log('Form Elements Inspection:');
        console.log(JSON.stringify(dumpRes.result.value, null, 2));

        ws.close();
    });
}

main().catch(console.error);
