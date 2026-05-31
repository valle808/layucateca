const fs = require('fs');
const http = require('http');
const WebSocket = require('ws');

function getCpanelWebSocketDebuggerUrl() {
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
                    const page = pages.find(p => p.type === 'page' && p.url.includes('cpsess3768607345'));
                    if (page) resolve(page.webSocketDebuggerUrl);
                    else reject(new Error('cPanel Selector tab not found'));
                } catch (e) { reject(e); }
            });
        });
        req.on('error', reject);
        req.end();
    });
}

async function main() {
    const wsUrl = await getCpanelWebSocketDebuggerUrl();
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

        console.log('Creating a new tab for File Manager to check dist...');
        const fileManagerUrl = 'https://server402.web-hosting.com:2083/cpsess3768607345/frontend/jupiter/filemanager/index.html?dir=/home/layumpnx/whatsapp-microservice';
        const createRes = await send('Target.createTarget', { url: fileManagerUrl });
        const targetId = createRes.targetId;

        // Wait 10 seconds
        await new Promise(r => setTimeout(r, 10000));

        // Connect to new tab
        const newTabWs = new WebSocket(`ws://127.0.0.1:9222/devtools/page/${targetId}`);
        newTabWs.on('open', async () => {
            let newTabMessageId = 1;
            const newTabSend = (method, params = {}) => new Promise((resolve, reject) => {
                const id = newTabMessageId++;
                const listener = (data) => {
                    const res = JSON.parse(data);
                    if (res.id === id) {
                        newTabWs.off('message', listener);
                        if (res.error) reject(res.error);
                        else resolve(res.result);
                    }
                };
                newTabWs.on('message', listener);
                newTabWs.send(JSON.stringify({ id, method, params }));
            });

            await newTabSend('Page.enable');
            
            // Check files inside whatsapp-microservice
            const evalRes = await newTabSend('Runtime.evaluate', {
                expression: `
                    (function() {
                        const items = Array.from(document.querySelectorAll('a, li, span, td, div'));
                        const filenames = items.map(el => el.innerText ? el.innerText.trim() : '').filter(t => t.length > 0 && t.length < 50);
                        return Array.from(new Set(filenames)).slice(0, 100);
                    })()
                `,
                returnByValue: true
            });
            console.log('Files inside app root:', JSON.stringify(evalRes.result.value, null, 2));

            // Navigate further into dist
            const distUrl = 'https://server402.web-hosting.com:2083/cpsess3768607345/frontend/jupiter/filemanager/index.html?dir=/home/layumpnx/whatsapp-microservice/dist';
            await newTabSend('Page.navigate', { url: distUrl });
            await new Promise(r => setTimeout(r, 8000));

            // Check files inside dist
            const distEvalRes = await newTabSend('Runtime.evaluate', {
                expression: `
                    (function() {
                        const items = Array.from(document.querySelectorAll('a, li, span, td, div'));
                        const filenames = items.map(el => el.innerText ? el.innerText.trim() : '').filter(t => t.length > 0 && t.length < 50);
                        return Array.from(new Set(filenames)).slice(0, 100);
                    })()
                `,
                returnByValue: true
            });
            console.log('Files inside dist:', JSON.stringify(distEvalRes.result.value, null, 2));

            newTabWs.close();
            ws.close();
        });
    });
}

main().catch(console.error);
