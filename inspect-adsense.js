const http = require('http');
const WebSocket = require('ws');

function listTabs() {
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
                    resolve(JSON.parse(data));
                } catch (e) { reject(e); }
            });
        });
        req.on('error', reject);
        req.end();
    });
}

async function main() {
    const tabs = await listTabs();
    const adsenseTab = tabs.find(t => t.url.includes('adsense.google.com') && t.type === 'page');
    if (!adsenseTab) {
        console.log("AdSense tab not found");
        return;
    }

    console.log("Found AdSense tab:", adsenseTab.title);

    const ws = new WebSocket(adsenseTab.webSocketDebuggerUrl);
    await new Promise((resolve, reject) => {
        ws.on('open', resolve);
        ws.on('error', reject);
    });

    let messageId = 1;
    const send = (method, params = {}) => new Promise((resolve) => {
        const id = messageId++;
        const listener = (data) => {
            const res = JSON.parse(data);
            if (res.id === id) {
                ws.off('message', listener);
                resolve(res.result);
            }
        };
        ws.on('message', listener);
        ws.send(JSON.stringify({ id, method, params }));
    });

    await send('Page.enable');

    const script = `
        (function() {
            function findTextNodes(text) {
                const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, null, false);
                const nodes = [];
                while (walker.nextNode()) {
                    if (walker.currentNode.nodeValue.includes(text)) {
                        nodes.push(walker.currentNode.parentElement.outerHTML);
                    }
                }
                return nodes;
            }
            
            return {
                confirm: findTextNodes("I confirm I have fixed the issues"),
                review: findTextNodes("Request review")
            };
        })();
    `;

    const evalRes = await send('Runtime.evaluate', {
        expression: script,
        returnByValue: true
    });

    console.log("Evaluate result:", JSON.stringify(evalRes.result, null, 2));
    ws.close();
}
main().catch(console.error);
