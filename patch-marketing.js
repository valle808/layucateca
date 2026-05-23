const fs = require('fs');
const file = 'src/app/admin/marketing/page.tsx';
let content = fs.readFileSync(file, 'utf8');

// 1. Fix the main container to inherit admin layout theme but add a subtle premium texture
content = content.replace(
  /<div className="min-h-screen bg-\[#0a0a0f\] text-white relative overflow-x-hidden">/g,
  `<div className="min-h-screen w-full relative overflow-x-hidden" style={{ color: 'var(--text-primary)' }}>
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, var(--text-primary) 1px, transparent 0)', backgroundSize: '32px 32px' }} />`
);

// 2. Animate the ambient background blurs
content = content.replace(
  /<div className="fixed inset-0 pointer-events-none">([\s\S]*?)<\/div>/,
  `<div className="fixed inset-0 pointer-events-none overflow-hidden">
        <motion.div animate={{ rotate: 360 }} transition={{ duration: 150, repeat: Infinity, ease: "linear" }} className="absolute top-[-10%] left-[-10%] w-[800px] h-[800px] bg-orange-500/10 blur-[120px] rounded-full mix-blend-screen" />
        <motion.div animate={{ rotate: -360 }} transition={{ duration: 180, repeat: Infinity, ease: "linear" }} className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-indigo-500/10 blur-[100px] rounded-full mix-blend-screen" />
        <motion.div animate={{ scale: [1, 1.1, 1] }} transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[1000px] bg-pink-500/5 blur-[150px] rounded-full mix-blend-screen" />
      </div>`
);

// 3. Improve Agent Card Glassmorphism
content = content.replace(
  /className="relative group rounded-2xl border border-white\/10 bg-white\/5 backdrop-blur-sm overflow-hidden cursor-pointer hover:border-white\/20 transition-all duration-300"/g,
  `className="relative group rounded-3xl border border-[var(--border-subtle)] bg-[var(--bg-card)] backdrop-blur-2xl overflow-hidden cursor-pointer hover:border-[var(--border-accent)] hover:bg-[var(--bg-card-hover)] transition-all duration-500 hover:-translate-y-1 shadow-lg"`
);

// 4. Update the quick actions buttons
content = content.replace(
  /className=\{\`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold transition-all \$\{action\.bg\}\`\}/g,
  `className={\`flex items-center gap-2 px-5 py-2.5 rounded-2xl text-[11px] font-bold tracking-wide backdrop-blur-md transition-all duration-300 \$\{action.bg\}\`} style={{ boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}`
);

// 5. Update the Tab Nav to look like premium iOS segmented controls
content = content.replace(
  /className="flex gap-1 mb-8 bg-white\/5 p-1 rounded-xl border border-white\/10 overflow-x-auto"/g,
  `className="flex gap-2 mb-10 bg-[var(--bg-card)] backdrop-blur-xl p-1.5 rounded-2xl border border-[var(--border-subtle)] overflow-x-auto shadow-sm w-fit"`
);

content = content.replace(
  /className=\{\`flex items-center gap-2 px-4 py-2\.5 rounded-lg text-xs font-bold uppercase tracking-wider whitespace-nowrap transition-all \$\{\n                  isActive\n                    \? 'bg-white text-black shadow-lg'\n                    : 'text-white\/50 hover:text-white hover:bg-white\/5'\n                \}\`\}/g,
  `className={\`flex items-center gap-2 px-6 py-3 rounded-[12px] text-[11px] font-bold uppercase tracking-widest whitespace-nowrap transition-all duration-300 \$\{
                  isActive
                    ? 'bg-[var(--accent-gold)] text-white shadow-[0_0_20px_rgba(255,85,0,0.3)]'
                    : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--border-subtle)]'
                }\`}`
);

// 6. Fix hardcoded text colors like text-white/40 to use CSS variables
content = content.replace(/text-white\/40/g, 'text-[var(--text-secondary)]');
content = content.replace(/text-white\/50/g, 'text-[var(--text-secondary)]');
content = content.replace(/text-white\/60/g, 'text-[var(--text-secondary)]');
content = content.replace(/text-white\/70/g, 'text-[var(--text-primary)] opacity-80');
content = content.replace(/text-white/g, 'text-[var(--text-primary)]');
content = content.replace(/bg-white\/5/g, 'bg-[var(--bg-card)]');
content = content.replace(/bg-white\/10/g, 'bg-[var(--border-subtle)]');
content = content.replace(/border-white\/10/g, 'border-[var(--border-subtle)]');
content = content.replace(/border-white\/8/g, 'border-[var(--border-subtle)]');
content = content.replace(/border-white\/5/g, 'border-[var(--border-subtle)]');

fs.writeFileSync(file, content);
console.log('Marketing page design improved.');
