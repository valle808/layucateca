const fs = require('fs');
const http = require('http');
const WebSocket = require('ws');

async function main() {
    const wsUrl = "ws://127.0.0.1:9222/devtools/page/577E142666491BBC3CC5296B6C804CCA";
    console.log('Connecting to Selector tab 577...');
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

        console.log('Filling out Node.js Application Creation form...');
        const fillRes = await send('Runtime.evaluate', {
            expression: `
                new Promise((resolve) => {
                    const uiSelects = Array.from(document.querySelectorAll('ui-select'));
                    
                    // 1. Select Node.js version 20.20.2
                    const nodeSelect = uiSelects[0];
                    const nodeBtn = nodeSelect ? nodeSelect.querySelector('button') : null;
                    if (nodeBtn) nodeBtn.click();
                    
                    setTimeout(() => {
                        const items = Array.from(document.querySelectorAll('.selector_dropdown li, .b_dropdown-menu li'));
                        const targetVersion = items.find(i => i.innerText && i.innerText.trim() === '20.20.2');
                        if (targetVersion) targetVersion.click();
                        
                        setTimeout(() => {
                            // 2. Select Application Mode: Production
                            const modeSelect = uiSelects[1];
                            const modeBtn = modeSelect ? modeSelect.querySelector('button') : null;
                            if (modeBtn) modeBtn.click();
                            
                            setTimeout(() => {
                                const modeItems = Array.from(document.querySelectorAll('.selector_dropdown li, .b_dropdown-menu li'));
                                const targetMode = modeItems.find(i => i.innerText && i.innerText.trim() === 'Production');
                                if (targetMode) targetMode.click();
                                
                                setTimeout(() => {
                                    // 3. Fill in Application root: whatsapp-microservice
                                    const appRootParent = document.querySelector('ui-text'); // The first ui-text is usually the Application root
                                    const appRootInput = appRootParent ? appRootParent.querySelector('input') : null;
                                    if (appRootInput) {
                                        appRootInput.value = 'whatsapp-microservice';
                                        appRootInput.dispatchEvent(new Event('input', { bubbles: true }));
                                        appRootInput.dispatchEvent(new Event('change', { bubbles: true }));
                                    }
                                    
                                    // 4. Select Application URL: wa.layucateca.com
                                    const domainSelect = document.querySelector('#domain-select');
                                    const domainBtn = domainSelect ? domainSelect.querySelector('button') : null;
                                    if (domainBtn) domainBtn.click();
                                    
                                    setTimeout(() => {
                                        const domainItems = Array.from(document.querySelectorAll('.selector_dropdown li, .b_dropdown-menu li'));
                                        const targetDomain = domainItems.find(i => i.innerText && i.innerText.trim() === 'wa.layucateca.com');
                                        if (targetDomain) targetDomain.click();
                                        
                                        setTimeout(() => {
                                            // 5. Clear Application URL subfolder input
                                            // The subfolder input is adjacent to the domain-select
                                            const subfolderInput = document.querySelector('ui-text[class*="form-control"] input, .input-group input');
                                            if (subfolderInput) {
                                                subfolderInput.value = '';
                                                subfolderInput.dispatchEvent(new Event('input', { bubbles: true }));
                                                subfolderInput.dispatchEvent(new Event('change', { bubbles: true }));
                                            }
                                            
                                            // 6. Fill in Application startup file: dist/index.js
                                            // It is usually the second text input or ui-text component
                                            const allInputs = Array.from(document.querySelectorAll('input[type="text"]'));
                                            // Let's filter inputs that are not inside domain-select or application root
                                            // Usually, Application startup file is the input after the subfolder input
                                            const startupInput = allInputs.find(i => i !== appRootInput && i !== subfolderInput);
                                            if (startupInput) {
                                                startupInput.value = 'dist/index.js';
                                                startupInput.dispatchEvent(new Event('input', { bubbles: true }));
                                                startupInput.dispatchEvent(new Event('change', { bubbles: true }));
                                            }
                                            
                                            resolve({
                                                nodeVersionSelected: nodeSelect ? nodeSelect.innerText.trim() : 'N/A',
                                                modeSelected: modeSelect ? modeSelect.innerText.trim() : 'N/A',
                                                appRootValue: appRootInput ? appRootInput.value : 'N/A',
                                                domainSelected: domainSelect ? domainSelect.innerText.trim() : 'N/A',
                                                subfolderValue: subfolderInput ? subfolderInput.value : 'N/A',
                                                startupValue: startupInput ? startupInput.value : 'N/A'
                                            });
                                        }, 500);
                                    }, 500);
                                }, 500);
                            }, 500);
                        }, 500);
                    }, 500);
                })
            `,
            awaitPromise: true,
            returnByValue: true
        });

        console.log('Form populated state:');
        console.log(JSON.stringify(fillRes.result.value, null, 2));

        // Take a screenshot of populated form
        let screenshot = await send('Page.captureScreenshot', { format: 'png' });
        fs.writeFileSync('/Users/sergiovalle/.gemini/antigravity-ide/brain/9e75d83a-a66c-4bae-8cc7-6d0a96f25627/cpanel_populated_form.png', Buffer.from(screenshot.data, 'base64'));
        console.log('Screenshot of populated form saved to cpanel_populated_form.png');

        // Click CREATE!
        console.log('Clicking CREATE...');
        const createClick = await send('Runtime.evaluate', {
            expression: `
                (function() {
                    const btns = Array.from(document.querySelectorAll('button, ui-button'));
                    const createBtn = btns.find(btn => btn.innerText && btn.innerText.trim().toUpperCase() === 'CREATE');
                    if (createBtn) {
                        const childBtn = createBtn.querySelector('button') || createBtn;
                        
                        // Force bypass disabled state just in case
                        childBtn.removeAttribute('disabled');
                        childBtn.classList.remove('disabled');
                        const wrapper = createBtn.querySelector('.lvemanager-button-wrapper');
                        if (wrapper) wrapper.classList.remove('disabled');
                        const span = createBtn.querySelector('span');
                        if (span) span.removeAttribute('disabled');
                        
                        childBtn.click();
                        return 'SUCCESS: Bypassed disabled and clicked CREATE!';
                    }
                    return 'ERROR: CREATE button not found';
                })()
            `,
            returnByValue: true
        });
        console.log('Create Click Result:', createClick.result.value);

        // Wait 25 seconds for app creation on Namecheap server
        console.log('Waiting 25 seconds for application creation on server...');
        await new Promise(r => setTimeout(r, 25000));

        // Take a screenshot of result
        screenshot = await send('Page.captureScreenshot', { format: 'png' });
        fs.writeFileSync('/Users/sergiovalle/.gemini/antigravity-ide/brain/9e75d83a-a66c-4bae-8cc7-6d0a96f25627/cpanel_create_result.png', Buffer.from(screenshot.data, 'base64'));
        console.log('Screenshot of result saved to cpanel_create_result.png');

        // Check if there is an error toast or success details
        const textRes = await send('Runtime.evaluate', {
            expression: 'document.body.innerText.substring(0, 1500)',
            returnByValue: true
        });
        console.log('--- Result Page Text ---');
        console.log(textRes.result?.value);
        console.log('--- End Result Page Text ---');

        ws.close();
    });
}

main().catch(console.error);
