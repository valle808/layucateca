const http = require('http');
const WebSocket = require('ws');

// Function to fetch the WebSocket debugger URL
function getWebSocketDebuggerUrl() {
    return new Promise((resolve, reject) => {
        const req = http.request({
            host: '127.0.0.1',
            port: 9222,
            path: '/json/list',
        }, (res) => {
            let data = '';
            res.on('data', (chunk) => {
                data += chunk;
            });
            res.on('end', () => {
                try {
                    const pages = JSON.parse(data);
                    // Find a page with type 'page' (not an extension or background page)
                    const page = pages.find(p => p.type === 'page' && p.url.includes('web-hosting.com'));
                    if (page && page.webSocketDebuggerUrl) {
                        resolve(page.webSocketDebuggerUrl);
                    } else if (pages.length > 0) {
                        // Fallback to the first available page if none match
                        resolve(pages[0].webSocketDebuggerUrl);
                    } else {
                        reject(new Error('No open pages found'));
                    }
                } catch (e) {
                    reject(e);
                }
            });
        });

        req.on('error', reject);
        req.end();
    });
}

let messageId = 1;
const pendingMessages = new Map();

function sendCommand(ws, method, params = {}) {
    return new Promise((resolve, reject) => {
        const id = messageId++;
        pendingMessages.set(id, { resolve, reject });
        ws.send(JSON.stringify({ id, method, params }));
    });
}

async function main() {
    const wsUrl = await getWebSocketDebuggerUrl();
    const ws = new WebSocket(wsUrl);

    ws.on('message', (data) => {
        const response = JSON.parse(data);
        if (response.id && pendingMessages.has(response.id)) {
            const { resolve, reject } = pendingMessages.get(response.id);
            if (response.error) {
                reject(response.error);
            } else {
                resolve(response.result);
            }
            pendingMessages.delete(response.id);
        }
    });

    ws.on('open', async () => {
        console.log('Connected to CDP');

        const { result: urlResult } = await sendCommand(ws, 'Runtime.evaluate', {
            expression: 'window.location.href',
            returnByValue: true
        });
        
        let currentUrl = urlResult.value;
        console.log('Current URL:', currentUrl);
        
        const match = currentUrl.match(/^(https?:\/\/[^\/]+\/cpsess\d+)/);
        if (!match) {
            console.error('Could not find cPanel session URL:', currentUrl);
            process.exit(1);
        }
        
        const nodejsAppUrl = `${match[1]}/frontend/jupiter/lveversion/nodejs-selector.html.tt`;
        console.log('Navigating to:', nodejsAppUrl);
        
        await sendCommand(ws, 'Page.navigate', { url: nodejsAppUrl });
        
        console.log('Waiting for page to load...');
        await new Promise(r => setTimeout(r, 10000));
        
        // Click the restart button for the app
        const evalResult = await sendCommand(ws, 'Runtime.evaluate', {
            expression: `
                (function() {
                    const rows = Array.from(document.querySelectorAll('tr, .list-group-item, .app-row'));
                    const waAppRow = rows.find(row => row.innerText && row.innerText.includes('whatsapp-microservice'));
                    if (waAppRow) {
                        const restartBtn = waAppRow.querySelector('[id*="restart"], .lve-app-restart, button[title*="estart"], a[title*="estart"], .fa-redo, [class*="restart"]');
                        if (restartBtn) {
                            const btnToClick = restartBtn.closest('button') || restartBtn.closest('a') || restartBtn;
                            btnToClick.click();
                            return "Clicked restart button";
                        }
                        return "App row found but restart button not found: " + waAppRow.innerHTML.substring(0, 200);
                    }
                    return "App row not found. Page text: " + document.body.innerText.substring(0, 500);
                })()
            `,
            returnByValue: true
        });
        
        console.log('Restart action result:', evalResult.result.value);
        
        ws.close();
    });
}

main().catch(console.error);
