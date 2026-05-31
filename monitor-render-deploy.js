const fs = require('fs');
const http = require('http');
const WebSocket = require('ws');
const { execSync } = require('child_process');

function getWebSocketDebuggerUrl() {
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
                    const page = pages.find(p => p.type === 'page' && p.url.includes('render.com'));
                    if (page) resolve(page.webSocketDebuggerUrl);
                    else reject(new Error('Render page not found'));
                } catch (e) { reject(e); }
            });
        });
        req.on('error', reject);
        req.end();
    });
}

async function main() {
    const wsUrl = await getWebSocketDebuggerUrl();
    console.log('Monitoring Render tab via WebSocket:', wsUrl);
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
        console.log('Successfully connected. Monitoring Render URL changes...');

        let checkedCount = 0;
        const interval = setInterval(async () => {
            try {
                const evalRes = await send('Runtime.evaluate', {
                    expression: 'window.location.href',
                    returnByValue: true
                });
                const url = evalRes.result.value;
                checkedCount++;
                console.log(`[${checkedCount}] Current Render Tab URL:`, url);

                if (url.includes('/web/srv-')) {
                    console.log('Detection! URL matches Render service dashboard. Extracting public URL...');
                    
                    // Try to find the .onrender.com link
                    const extractRes = await send('Runtime.evaluate', {
                        expression: `
                            (function() {
                                const links = Array.from(document.querySelectorAll('a'));
                                const onrenderLink = links.find(a => a.href && a.href.includes('.onrender.com'));
                                return onrenderLink ? onrenderLink.href : null;
                            })()
                        `,
                        returnByValue: true
                    });

                    const publicUrl = extractRes.result.value;
                    if (publicUrl) {
                        console.log('Success! Found Render Service URL:', publicUrl);
                        clearInterval(interval);

                        // 1. Update .env.local
                        console.log('Updating .env.local...');
                        let envContent = fs.readFileSync('.env.local', 'utf8');
                        envContent = envContent.replace(/NEXT_PUBLIC_WHATSAPP_SERVICE_URL=.*/g, `NEXT_PUBLIC_WHATSAPP_SERVICE_URL=${publicUrl}`);
                        envContent = envContent.replace(/WHATSAPP_SERVICE_URL=.*/g, `WHATSAPP_SERVICE_URL=${publicUrl}`);
                        fs.writeFileSync('.env.local', envContent, 'utf8');
                        console.log('.env.local updated successfully.');

                        // 2. Add variables to Vercel
                        console.log('Adding environment variables to Vercel...');
                        try {
                            // Add NEXT_PUBLIC_WHATSAPP_SERVICE_URL
                            console.log('Adding NEXT_PUBLIC_WHATSAPP_SERVICE_URL...');
                            execSync(`npx vercel env add NEXT_PUBLIC_WHATSAPP_SERVICE_URL "${publicUrl}" production preview development --force`, { stdio: 'inherit' });
                            
                            // Add WHATSAPP_SERVICE_URL
                            console.log('Adding WHATSAPP_SERVICE_URL...');
                            execSync(`npx vercel env add WHATSAPP_SERVICE_URL "${publicUrl}" production preview development --force`, { stdio: 'inherit' });
                        } catch (vercelErr) {
                            console.error('Vercel CLI command failed. They might already exist or require confirmation. Error:', vercelErr.message);
                        }

                        // 3. Trigger Vercel deploy
                        console.log('Deploying updated Vercel project...');
                        try {
                            execSync('npx vercel deploy --prod --yes', { stdio: 'inherit' });
                            console.log('Vercel deployment completed successfully!');
                        } catch (deployErr) {
                            console.error('Vercel deployment failed:', deployErr.message);
                        }

                        // 4. Capture screenshot
                        console.log('Capturing final screenshot of Render dashboard...');
                        const screenshot = await send('Page.captureScreenshot', { format: 'png' });
                        fs.writeFileSync('/Users/sergiovalle/.gemini/antigravity-ide/brain/9e75d83a-a66c-4bae-8cc7-6d0a96f25627/render_dashboard_active.png', Buffer.from(screenshot.data, 'base64'));
                        console.log('Screenshot saved to render_dashboard_active.png');

                        console.log('All tasks finished. Monitoring complete.');
                        ws.close();
                        process.exit(0);
                    } else {
                        console.log('Render dashboard URL detected but .onrender.com link not found in DOM yet. Waiting for page to load...');
                    }
                }
            } catch (err) {
                console.error('Error during monitoring step:', err.message);
            }
        }, 3000);
    });
}
main().catch(console.error);
