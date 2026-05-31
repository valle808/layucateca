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

        const saveRes = await send('Runtime.evaluate', {
            expression: `
                (function() {
                    const checkbox = document.getElementById('optionselect_showhidden');
                    if (!checkbox) return 'ERROR: Checkbox not found';
                    
                    if (!checkbox.checked) {
                        checkbox.click();
                    }
                    
                    // Let's find any button in the modal or dialog containing "Save" or id including "save"
                    const btns = Array.from(document.querySelectorAll('button, input, a'));
                    const saveBtn = btns.find(b => {
                        const id = b.id ? b.id.toLowerCase() : '';
                        const text = b.innerText ? b.innerText.toLowerCase() : '';
                        const val = b.value ? b.value.toLowerCase() : '';
                        return id.includes('save') || text.includes('save') || val.includes('save');
                    });
                    
                    if (saveBtn) {
                        saveBtn.click();
                        return 'SUCCESS: Enabled showhidden and clicked save button: ' + saveBtn.outerHTML;
                    }
                    
                    // Fallback: try to submit the parent form
                    let form = checkbox.form;
                    if (form) {
                        form.submit();
                        return 'SUCCESS: Submitted the prefs form directly!';
                    }
                    
                    return 'ERROR: Save button and form not found';
                })()
            `,
            returnByValue: true
        });

        console.log('Action result:', saveRes.result.value);

        // Wait 3 seconds
        await new Promise(r => setTimeout(r, 3000));

        ws.close();
    });
}

main().catch(console.error);
