const WebSocket = require('ws');

async function uploadFile() {
    const ws = new WebSocket('ws://localhost:9222/devtools/page/5724975961109D9E019DC004F95C0833');
    let messageId = 1;

    const sendCommand = (method, params = {}) => {
        return new Promise((resolve) => {
            const id = messageId++;
            const listener = (data) => {
                const response = JSON.parse(data);
                if (response.id === id) {
                    ws.removeListener('message', listener);
                    resolve(response.result);
                }
            };
            ws.on('message', listener);
            ws.send(JSON.stringify({ id, method, params }));
        });
    };

    ws.on('open', async () => {
        console.log('Connected to CDP');

        // Check the current DOM structure
        const root = await sendCommand('DOM.getDocument', { depth: -1 });
        
        // Find iframe for upload if it exists
        // Wait, what if we just open the upload page in this tab?
        // Let's first evaluate script to get the URL of the page.
        
        const runtime = await sendCommand('Runtime.evaluate', {
            expression: 'window.location.href',
            returnByValue: true
        });
        console.log('Current URL:', runtime.result.value);

        // Find file inputs
        const evalFileInputs = await sendCommand('Runtime.evaluate', {
            expression: `Array.from(document.querySelectorAll('input[type="file"]')).length`,
            returnByValue: true
        });
        console.log('File inputs found:', evalFileInputs.result.value);
        
        // Wait for page to load
        await new Promise(r => setTimeout(r, 2000));
        
        // Wait for page to load
        await new Promise(r => setTimeout(r, 4000));
        
        // Select the file and click extract
        // Wait a few seconds for extraction to finish
        await new Promise(r => setTimeout(r, 4000));
        
        // Let's get the list of files shown
        const evalFileNames = await sendCommand('Runtime.evaluate', {
            expression: `
                (function() {
                    if (window.reloadList) window.reloadList();
                    return Array.from(document.querySelectorAll('.dt-name, .fname, td, div')).map(el => el.innerText);
                })()
            `,
            returnByValue: true
        });
        
        const files = evalFileNames.result.value || [];
        console.log('Package.json found?', files.some(f => f.includes('package.json')));
        console.log('src folder found?', files.some(f => f.includes('src')));
        console.log('dist folder found?', files.some(f => f.includes('dist')));
        
        ws.close();
    });
}

uploadFile();
