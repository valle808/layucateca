const { execSync } = require('child_process');

const browsers = ["Safari", "Brave Browser", "Arc", "Microsoft Edge"];

for (const browser of browsers) {
    try {
        const res = execSync(`osascript -e 'tell application "${browser}" to get URL of tabs of windows'`, { stdio: 'pipe' }).toString();
        console.log(`[${browser}] URLs: ${res.trim()}`);
    } catch(e) {
        // App probably not running or doesn't support this
        console.log(`[${browser}] Not running or error`);
    }
}
