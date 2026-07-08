const fs = require('fs');
let t = fs.readFileSync('index.html', 'utf8');

// Find all instances of ternary patterns missing ?
const lines = t.split('\n');
let modified = false;

for (let i = 0; i < lines.length; i++) {
  let line = lines[i];
  let orig = line;
  
  // Fix 1: i % 2 === 0  0x00cc66 : 0xffaa00
  line = line.replace(/(i\s*%\s*\d+\s*===\s*\d+)\s{2,}(0x[0-9a-fA-F]+\s*:\s*0x)/g, '$1 ? $2');
  
  // Fix 2: !== undefined)  value : default
  line = line.replace(/(!==\s*undefined\s*\))\s{2,}([^:]+)\s*:\s*(0[\s;,\)])/g, '$1 ? $2 : $3');
  
  // Fix 3: === '...')  value : default
  line = line.replace(/(===?\s*'[^']*'\s*\))\s{2,}(\S+)\s*:\s+/g, '$1 ? $2 : ');
  
  // Fix 4: > 1  '-'+(dev
  line = line.replace(/(>\s*\d+)\s{2,}('-'\+)/g, '$1 ? $2');
  
  // Fix 5: .length  expr :
  line = line.replace(/(\.length)\s{2,}(\S+)\s+:\s+/g, '$1 ? $2 : ');
  
  // Fix 6: null : (pattern where null is the false branch)
  line = line.replace(/(\S+)\s{2,}null\s+:/g, '$1 ? null :');
  
  if (line !== orig) {
    console.log('L' + (i+1) + ': ' + line.trim().substring(0, 60));
    modified = true;
  }
  lines[i] = line;
}

if (modified) {
  t = lines.join('\n');
  fs.writeFileSync('index.html', t, 'utf8');
  console.log('\n已修复');
} else {
  console.log('未发现需要修复的行');
}

// Verify - check no more ternary-like patterns without ?
const remaining = [];
const checkLines = t.split('\n');
for (let i = 0; i < checkLines.length; i++) {
  if (checkLines[i].match(/\S+\s{3,}\S+\s+:\s+/)) {
    remaining.push('L' + (i+1) + ': ' + checkLines[i].trim().substring(0, 60));
  }
}
if (remaining.length) {
  console.log('仍可能有问题:', remaining.length);
  remaining.forEach(r => console.log(r));
}
