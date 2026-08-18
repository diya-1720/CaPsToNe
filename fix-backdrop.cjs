const fs = require('fs');
const path = require('path');

const componentsDir = path.join(__dirname, 'src', 'components');

function processFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let originalContent = content;

  // Replace invalid tailwind bg opacity syntax for hex variables
  content = content.replace(/bg-\[var\(--text-primary\)\]\/70/g, 'bg-[#111111]/80');

  if (content !== originalContent) {
    fs.writeFileSync(filePath, content);
    console.log(`Updated overlay in: ${path.basename(filePath)}`);
  }
}

fs.readdirSync(componentsDir).forEach(file => {
  if (file.endsWith('.jsx')) {
    processFile(path.join(componentsDir, file));
  }
});
