const fs = require('fs');
const path = require('path');

const targetFile = 'C:\\Users\\Legion5\\OneDrive\\Desktop\\AWEN\\AWEN\\src\\components\\LandingPage.jsx';
let content = fs.readFileSync(targetFile, 'utf8');

// Global replacements to transform to Neo-Brutalist
content = content.replace(/bg-mesh-gradient/g, '');
content = content.replace(/glass-card/g, 'neo-surface');
content = content.replace(/backdrop-blur-\w+/g, '');
content = content.replace(/rounded-\[2rem\]/g, 'rounded-none border-2 border-[var(--border-strong)] shadow-[4px_4px_0px_#111]');
content = content.replace(/rounded-3xl/g, '');
content = content.replace(/rounded-2xl/g, '');
content = content.replace(/shadow-2xl/g, 'shadow-[4px_4px_0px_#111]');
content = content.replace(/shadow-xl/g, 'shadow-[4px_4px_0px_#111]');
content = content.replace(/bg-slate-900\/40/g, 'bg-[var(--surface-primary)]');
content = content.replace(/bg-black\/20/g, 'bg-[var(--surface-secondary)]');
content = content.replace(/bg-black\/30/g, 'bg-[var(--surface-secondary)]');
content = content.replace(/bg-black\/40/g, 'bg-[var(--surface-secondary)]');
content = content.replace(/bg-black\/50/g, 'bg-[var(--surface-secondary)]');
content = content.replace(/bg-\[#060B14\]/g, 'bg-[var(--bg-base)]');
content = content.replace(/text-slate-200/g, 'text-[var(--text-primary)] font-bold uppercase');
content = content.replace(/text-slate-300/g, 'text-[var(--text-primary)] font-bold');
content = content.replace(/text-slate-400/g, 'text-[var(--text-secondary)] font-bold');
content = content.replace(/text-slate-500/g, 'text-[var(--text-secondary)]');
content = content.replace(/text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-emerald-300 to-cyan-400 bg-\[length:200%_auto\] animate-gradient-shift/g, 'text-[var(--accent-green-dark)]');
content = content.replace(/text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-emerald-400/g, 'text-[var(--accent-green-dark)]');
content = content.replace(/text-transparent bg-clip-text bg-gradient-to-br from-cyan-300 to-emerald-400/g, 'text-[var(--accent-green-dark)]');
content = content.replace(/text-white/g, 'text-[var(--text-primary)]');
content = content.replace(/border-white\/10/g, 'border-2 border-[var(--border-strong)]');
content = content.replace(/border-white\/5/g, 'border-2 border-[var(--border-strong)]');
content = content.replace(/border-cyan-500\/20/g, 'border-2 border-[var(--border-strong)]');
content = content.replace(/bg-cyan-500\/10/g, 'bg-[var(--accent-green-bg)]');
content = content.replace(/bg-cyan-600\/20/g, 'bg-[var(--accent-green-bg)]');
content = content.replace(/bg-indigo-600\/20/g, 'bg-[var(--surface-primary)]');
content = content.replace(/bg-white\/5/g, 'bg-[var(--surface-secondary)]');
content = content.replace(/bg-white\/10/g, 'bg-[var(--surface-tertiary)]');
content = content.replace(/hover:bg-white\/5/g, 'hover:bg-[var(--surface-tertiary)]');
content = content.replace(/hover:bg-white\/10/g, 'hover:bg-[var(--surface-tertiary)]');
content = content.replace(/bg-cyan-500 text-slate-950/g, 'bg-[var(--text-primary)] text-[var(--bg-base)] shadow-[4px_4px_0px_var(--accent-green-dark)]');
content = content.replace(/hover:bg-cyan-400 hover:shadow-\[0_0_30px_rgba\(6,182,212,0\.4\)\]/g, 'hover:bg-[var(--accent-green-dark)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none');
content = content.replace(/bg-\[var\(--glass-bg\)\]/g, 'bg-[var(--surface-primary)] border-b-2 border-[var(--border-strong)]');

// Also remove glowing orbs
content = content.replace(/<div className="absolute top-\[-10%\] left-\[-10%\].*?animate-pulse-slow".*?\/>/g, '');
content = content.replace(/<div className="absolute bottom-\[-10%\] right-\[-10%\].*?animate-pulse-slow".*?\/>/g, '');
content = content.replace(/<div className="absolute inset-0 bg-\[radial-gradient.*?\]" \/>/g, '');

fs.writeFileSync(targetFile, content);
console.log('Transformed LandingPage.jsx');
