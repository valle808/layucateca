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

        const clickRes = await send('Runtime.evaluate', {
            expression: `
                (function() {
                    const btns = Array.from(document.querySelectorAll('button, a, span, div, li'));
                    const newFileBtn = btns.find(b => b.innerText && b.innerText.includes('File') && b.innerText.includes('+'));
                    if (newFileBtn) {
                        newFileBtn.click();
                        return 'Clicked + File button';
                    }
                    return 'New File (+ File) button not found';
                })()
            `,
            returnByValue: true
        });
        console.log('Click result:', clickRes.result.value);

        // Wait 1.5 seconds for dialog to open
        await new Promise(r => setTimeout(r, 1500));

        // Let's print out all inputs and buttons inside dialog to be 100% sure we click the right save button
        const createRes = await send('Runtime.evaluate', {
            expression: `
                (function() {
                    const nameInput = document.getElementById('new-file-name') || document.querySelector('input[name="name"]');
                    if (!nameInput) return 'ERROR: new-file-name input not found';
                    
                    nameInput.value = '.htaccess';
                    nameInput.dispatchEvent(new Event('input', { bubbles: true }));
                    nameInput.dispatchEvent(new Event('change', { bubbles: true }));
                    
                    // Click the dialog Save/Create button
                    const btns = Array.from(document.querySelectorAll('button, input[type="button"], input[type="submit"]'));
                    const createBtn = btns.find(b => b.innerText && (b.innerText.includes('Create New') || b.innerText.includes('File')));
                    if (createBtn) {
                        createBtn.click();
                        return 'SUCCESS: Clicked Create New File button';
                    }
                    
                    // Let's find any button in dialog by class or type submit
                    const dialogBtn = document.querySelector('.modal-dialog button[type="submit"]') || document.querySelector('.modal-content button') || document.querySelector('#create-file-btn');
                    if (dialogBtn) {
                        dialogBtn.click();
                        return 'SUCCESS: Clicked dialog submit button by selector';
                    }
                    
                    // Try by looking for a button with onclick or onclick action
                    const okBtn = btns.find(b => b.outerHTML.includes('create_file') || b.outerHTML.includes('new_file') || b.onclick);
                    if (okBtn) {
                        okBtn.click();
                        return 'SUCCESS: Clicked dialog OK button';
                    }
                    
                    return 'ERROR: Create button in dialog not found';
                })()
            `,
            returnByValue: true
        });
        console.log('Create result:', createRes.result.value);

        // Wait 3 seconds for creation
        await new Promise(r => setTimeout(r, 3000));

        // Take a screenshot of the folder contents
        const screenshot = await send('Page.captureScreenshot', { format: 'png' });
        fs.writeFileSync('/Users/sergiovalle/.gemini/antigravity-ide/brain/9e75d83a-a66c-4bae-8cc7-6d0a96f25627/cpanel_htaccess_created.png', Buffer.from(screenshot.data, 'base64'));
        console.log('Screenshot saved to cpanel_htaccess_created.png');

        ws.close();
    });
}

main().catch(console.error);
