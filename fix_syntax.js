const fs = require('fs');
const path = './src/app/opinion-room/page.tsx';
let content = fs.readFileSync(path, 'utf8');

// Replace \` with `
content = content.replace(/\\`/g, '`');

// Replace \${ with ${
content = content.replace(/\\\$\{/g, '${');

fs.writeFileSync(path, content);
console.log('Fixed syntax errors in ' + path);
