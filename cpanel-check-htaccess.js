const fs = require('fs');
const http = require('http');
const WebSocket = require('ws');

function getWebSocketDebuggerUrlForTab(targetUrlSubstring) {
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
                    const page = pages.find(p => p.type === 'page' && p.url.includes(targetUrlSubstring));
                    if (page) resolve(page.webSocketDebuggerUrl);
                    else reject(new Error('Tab not found'));
                } catch (e) { reject(e); }
            });
        });
        req.on('error', reject);
        req.end();
    });
}

async function main() {
    // Connect to the active Node.js Selector tab (since it has the active session)
    const wsUrl = await getWebSocketDebuggerUrlForTab('cpsess3768607345');
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

        // Let's create a new tab in Chrome using Target.createTarget
        console.log('Creating a new tab for File Manager...');
        const fileManagerUrl = 'https://server402.web-hosting.com:2083/cpsess3768607345/frontend/jupiter/filemanager/index.html';
        const createRes = await send('Target.createTarget', { url: fileManagerUrl });
        const targetId = createRes.targetId;
        console.log('New target created successfully. ID:', targetId);

        // Wait 10 seconds for the new tab to load File Manager
        console.log('Waiting 10 seconds for File Manager page load...');
        await new Promise(r => setTimeout(r, 10000));

        // Connect to the new tab specifically to inspect or take screenshot
        const newTabWsUrl = `ws://127.0.0.1:9222/devtools/page/${targetId}`;
        console.log('Connecting to new tab:', newTabWsUrl);
        const newTabWs = new WebSocket(newTabWsUrl);
        
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

        newTabWs.on('open', async () => {
            await newTabSend('Page.enable');
            console.log('Connected to File Manager tab!');

            // Take a screenshot of the File Manager
            const screenshot = await newTabSend('Page.captureScreenshot', { format: 'png' });
            fs.writeFileSync('/Users/sergiovalle/.gemini/antigravity-ide/brain/9e75d83a-a66c-4bae-8cc7-6d0a96f25627/cpanel_file_manager.png', Buffer.from(screenshot.data, 'base64'));
            console.log('Screenshot saved to cpanel_file_manager.png');

            // Print the inner text of the File Manager
            const evalRes = await newTabSend('Runtime.evaluate', {
                expression: 'document.body.innerText.substring(0, 1500)',
                returnByValue: true
            });
            console.log('--- File Manager page text ---');
            console.log(evalRes.result?.value || 'No text');
            console.log('--- End page text ---');

            newTabWs.close();
            ws.close();
        });
    });
}

main().catch(console.error);
