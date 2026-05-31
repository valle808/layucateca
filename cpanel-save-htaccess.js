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
    const wsUrl = await getWebSocketDebuggerUrlForTab('filemanager/index.html');
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

        const htaccessContent = [
            '# DO NOT REMOVE OR MODIFY.',
            '# cPanel Passenger Node.js configuration rules.',
            'PassengerAppRoot "/home/layumpnx/whatsapp-microservice"',
            'PassengerBaseURI "/"',
            'PassengerAppType node',
            'PassengerStartupFile "dist/index.js"',
            'PassengerAppEnv production'
        ].join('\\n');

        console.log('Invoking cPanel savefile API directly via fetch inside File Manager console...');
        const apiRes = await send('Runtime.evaluate', {
            expression: `
                (async function() {
                    try {
                        const res = await fetch('/cpsess3768607345/json-api/cpanel', {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/x-www-form-urlencoded'
                            },
                            body: new URLSearchParams({
                                'cpanel_jsonapi_apiversion': '2',
                                'cpanel_jsonapi_module': 'Fileman',
                                'cpanel_jsonapi_func': 'savefile',
                                'dir': '/home/layumpnx/public_html/wa',
                                'filename': '.htaccess',
                                'content': '${htaccessContent}'
                            })
                        });
                        const data = await res.json();
                        return data;
                    } catch (err) {
                        return { error: err.message };
                    }
                })()
            `,
            awaitPromise: true,
            returnByValue: true
        });

        console.log('cPanel API Response:', JSON.stringify(apiRes.result.value, null, 2));

        // Reload File Manager to show .htaccess
        console.log('Refreshing File Manager...');
        await send('Page.reload');
        await new Promise(r => setTimeout(r, 6000));

        // Take a final screenshot of the files
        const screenshot = await send('Page.captureScreenshot', { format: 'png' });
        fs.writeFileSync('/Users/sergiovalle/.gemini/antigravity-ide/brain/9e75d83a-a66c-4bae-8cc7-6d0a96f25627/cpanel_wa_folder_with_htaccess.png', Buffer.from(screenshot.data, 'base64'));
        console.log('Screenshot of wa folder with htaccess saved to cpanel_wa_folder_with_htaccess.png');

        ws.close();
    });
}

main().catch(console.error);
