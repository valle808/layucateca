const http = require('http');
const WebSocket = require('ws');

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
        console.log('Connected to Render tab');
        await send('Page.enable');
        
        const evalRes = await send('Runtime.evaluate', {
            expression: `
                (function() {
                    const inputs = Array.from(document.querySelectorAll('input, select, textarea, button'));
                    return inputs.map(el => {
                        // Find label
                        let labelText = '';
                        if (el.id) {
                            const lbl = document.querySelector('label[for="' + el.id + '"]');
                            if (lbl) labelText = lbl.innerText;
                        }
                        if (!labelText) {
                            // find parent label or preceding label-like element
                            let parent = el.parentElement;
                            while (parent) {
                                const labels = parent.querySelectorAll('label, div');
                                for (let l of labels) {
                                    if (l !== el && l.innerText && l.innerText.length < 100 && (l.innerText.includes('Name') || l.innerText.includes('Command') || l.innerText.includes('Branch') || l.innerText.includes('Root') || l.innerText.includes('Language'))) {
                                        labelText = l.innerText.replace(/\\n/g, ' ');
                                        break;
                                    }
                                }
                                if (labelText) break;
                                parent = parent.parentElement;
                            }
                        }
                        return {
                            tagName: el.tagName,
                            type: el.type,
                            id: el.id,
                            name: el.name,
                            placeholder: el.placeholder,
                            value: el.value,
                            labelText: labelText.substring(0, 100),
                            text: (el.innerText || el.textContent || '').substring(0, 100).replace(/\\n/g, ' ')
                        };
                    }).filter(x => x.labelText || x.tagName === 'BUTTON' || x.placeholder || x.id || x.name);
                })()
            `,
            returnByValue: true
        });

        console.log(evalRes.result.value);
        ws.close();
    });
}
main().catch(console.error);
