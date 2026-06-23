const fs = require('fs');
const path = require('path');

const walkSync = (dir, filelist = []) => {
  fs.readdirSync(dir).forEach(file => {
    const dirFile = path.join(dir, file);
    if (fs.statSync(dirFile).isDirectory()) {
      filelist = walkSync(dirFile, filelist);
    } else {
      if (file === 'page.tsx') {
        filelist.push(dirFile);
      }
    }
  });
  return filelist;
};

const pages = walkSync('./src/app');

pages.forEach(page => {
  let content = fs.readFileSync(page, 'utf8');
  if (!content.includes('export const dynamic = "force-dynamic";') && !content.includes("export const dynamic = 'force-dynamic';")) {
    // Insert after imports if possible, or at the top
    const importsMatch = content.match(/(import .*from .*;?\n)+/);
    if (importsMatch) {
      content = content.replace(importsMatch[0], importsMatch[0] + '\nexport const dynamic = "force-dynamic";\n\n');
    } else {
      content = 'export const dynamic = "force-dynamic";\n\n' + content;
    }
    fs.writeFileSync(page, content);
    console.log(`Added force-dynamic to ${page}`);
  }
});
console.log('Done fixing pages.');
