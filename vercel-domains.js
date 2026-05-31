const fs = require('fs');
const http = require('http');
const WebSocket = require('ws');

function getVercelWebSocketDebuggerUrl() {
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
                    const page = pages.find(p => p.type === 'page' && p.url.includes('vercel.com'));
                    if (page) resolve(page.webSocketDebuggerUrl);
                    else reject(new Error('Vercel tab not found'));
                } catch (e) { reject(e); }
            });
        });
        req.on('error', reject);
        req.end();
    });
}

async function main() {
    const wsUrl = await getVercelWebSocketDebuggerUrl();
    console.log('Connecting to Vercel tab WebSocket:', wsUrl);
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
        console.log('Connected!');
        await send('Page.enable');

        // Navigate to the layucateca.com domains page
        const domainsUrl = 'https://vercel.com/sergios-projects-1a95b381/~/domains/layucateca.com';
        console.log('Navigating to:', domainsUrl);
        await send('Page.navigate', { url: domainsUrl });

        // Wait for page to load
        console.log('Waiting 10 seconds for navigation and content rendering...');
        await new Promise(r => setTimeout(r, 10000));

        // Take a screenshot
        const screenshot = await send('Page.captureScreenshot', { format: 'png' });
        const filePath = '/Users/sergiovalle/.gemini/antigravity-ide/brain/9e75d83a-a66c-4bae-8cc7-6d0a96f25627/vercel_domains.png';
        fs.writeFileSync(filePath, Buffer.from(screenshot.data, 'base64'));
        console.log('Screenshot saved to vercel_domains.png');

        // Inspect body text to see what is rendered
        const evalRes = await send('Runtime.evaluate', {
            expression: 'document.body.innerText.substring(0, 3000)',
            returnByValue: true
        });
        console.log('--- Page text ---');
        console.log(evalRes.result?.value || 'No text found');
        console.log('--- End page text ---');

        ws.close();
    });
}

main().catch(console.error);
