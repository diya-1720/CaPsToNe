const fs = require('fs');
const path = require('path');

const componentsDir = path.join(__dirname, 'src', 'components');

const replacements = [
  // Typography
  [/text-white/g, 'text-[var(--text-primary)]'],
  [/text-slate-100/g, 'text-[var(--text-primary)]'],
  [/text-slate-200/g, 'text-[var(--text-primary)] font-bold'],
  [/text-slate-300/g, 'text-[var(--text-secondary)] font-bold'],
  [/text-slate-400/g, 'text-[var(--text-secondary)] font-bold'],
  [/text-slate-500/g, 'text-[var(--text-secondary)]'],
  [/text-slate-900/g, 'text-[var(--text-primary)]'],
  [/text-cyan-[345]00/g, 'text-[var(--text-primary)]'],
  [/text-emerald-[345]00/g, 'text-[var(--accent-green-dark)]'],
  [/text-blue-[345]00/g, 'text-[var(--text-primary)]'],
  [/text-transparent bg-clip-text bg-gradient-to-[a-z]+ from-[a-z]+-\d00 via-[a-z]+-\d00 to-[a-z]+-\d00/g, 'text-[var(--text-primary)]'],
  [/text-transparent bg-clip-text bg-gradient-to-[a-z]+ from-[a-z]+-\d00 to-[a-z]+-\d00/g, 'text-[var(--text-primary)]'],
  [/text-transparent bg-clip-text bg-gradient-[^"']+/g, 'text-[var(--text-primary)]'],
  
  // Backgrounds & Surfaces
  [/bg-slate-900\/[0-9]{2}/g, 'bg-[var(--surface-primary)]'],
  [/bg-slate-800\/[0-9]{2}/g, 'bg-[var(--surface-primary)]'],
  [/bg-slate-900/g, 'bg-[var(--surface-primary)]'],
  [/bg-slate-800/g, 'bg-[var(--surface-primary)]'],
  [/bg-black\/[0-9]{2}/g, 'bg-[var(--surface-secondary)]'],
  [/bg-white\/[0-9]{1,2}/g, 'bg-[var(--surface-secondary)]'],
  [/bg-\[#060B14\]/g, 'bg-[var(--bg-base)]'],
  [/bg-gradient-to-[a-z]+ from-[^"'\s]+ to-[^"'\s]+/g, 'bg-[var(--surface-primary)] border-2 border-[var(--border-strong)] shadow-[4px_4px_0px_#111]'],
  [/bg-gradient-to-[a-z]+ from-[^"'\s]+ via-[^"'\s]+ to-[^"'\s]+/g, 'bg-[var(--surface-primary)] border-2 border-[var(--border-strong)] shadow-[4px_4px_0px_#111]'],
  
  // Borders
  [/border-white\/[0-9]{1,2}/g, 'border-2 border-[var(--border-strong)]'],
  [/border-slate-[0-9]{3}\/[0-9]{1,2}/g, 'border-2 border-[var(--border-strong)]'],
  [/border-slate-[0-9]{3}/g, 'border-2 border-[var(--border-strong)]'],
  [/border-cyan-[0-9]{3}\/[0-9]{1,2}/g, 'border-2 border-[var(--border-strong)]'],
  [/border-emerald-[0-9]{3}\/[0-9]{1,2}/g, 'border-2 border-[var(--border-strong)]'],
  [/border-blue-[0-9]{3}\/[0-9]{1,2}/g, 'border-2 border-[var(--border-strong)]'],
  
  // Shadows & Glass
  [/shadow-2xl/g, 'shadow-[6px_6px_0px_#111]'],
  [/shadow-xl/g, 'shadow-[4px_4px_0px_#111]'],
  [/shadow-lg/g, 'shadow-[2px_2px_0px_#111]'],
  [/shadow-md/g, 'shadow-[2px_2px_0px_#111]'],
  [/shadow-[a-z]+-[0-9]{3}\/[0-9]{2}/g, 'shadow-[2px_2px_0px_#111]'],
  [/shadow-\[0_0_[^\]]+\]/g, 'shadow-[2px_2px_0px_#111]'],
  [/glass-card/g, 'neo-surface'],
  [/glass-panel/g, 'neo-surface'],
  [/backdrop-blur-[a-z]+/g, ''],
  [/bg-mesh-gradient/g, ''],
  
  // Rounding
  [/rounded-3xl/g, ''],
  [/rounded-2xl/g, ''],
  [/rounded-xl/g, ''],
  [/rounded-lg/g, ''],
  [/rounded-full/g, ''],
];

// Files to skip as they are already Neo-Brutalist or core layouts handled separately
const skipFiles = [
  'LandingPage.jsx', 
  'BottomNav.jsx', 
  'App.jsx', 
  'AIChatModal.jsx', 
  'AuthModal.jsx',
  'BreathingModal.jsx',
  'DynamicIslandPopup.jsx',
  'AwenSpeechCloud.jsx',
  'AwenEntity.jsx',
  'AwenSpirit.jsx',
  'ExplainabilityModal.jsx',
  'ObservationModal.jsx',
  'IoTConfigModal.jsx'
];

function processFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let originalContent = content;

  replacements.forEach(([regex, replacement]) => {
    content = content.replace(regex, replacement);
  });

  if (content !== originalContent) {
    fs.writeFileSync(filePath, content);
    console.log(`Updated: ${path.basename(filePath)}`);
  }
}

fs.readdirSync(componentsDir).forEach(file => {
  if (file.endsWith('.jsx') && !skipFiles.includes(file)) {
    processFile(path.join(componentsDir, file));
  }
});

console.log('Transformation complete.');
