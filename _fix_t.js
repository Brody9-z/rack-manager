const fs = require('fs');
let t = fs.readFileSync('index.html', 'utf8');

// 修复所有被删除的三元运算符 ? 
// 按唯一上下文修复，避免误伤
const fixes = [
  // LED color ternary
  ['i % 2 === 0  0x00cc66 : 0xffaa00', 'i % 2 === 0 ? 0x00cc66 : 0xffaa00'],
  
  // Rack position ternaries  
  ['!== undefined)  rd.position.x : 0;', '!== undefined) ? rd.position.x : 0;'],
  ['!== undefined)  rd.position.z : 0;', '!== undefined) ? rd.position.z : 0;'],
  
  // display style ternary  
  ["=== 'custom')  'block'", "=== 'custom') ? 'block'"],
  ["=== 'custom')  'block' : 'none'", "=== 'custom') ? 'block' : 'none'"],
  ["dev.type === 'custom", "dev.type === 'custom"],
  ["(type === 'custom')  customName : undefined;", "(type === 'custom') ? customName : undefined;"],
  
  // foundByIdx ternary
  ['data.racks.length  data.rack', 'data.racks.length ? data.rack'],
  ['foundByIdx  null : data.racks.find', 'foundByIdx ? null : data.racks.find'],
  
  // dev slot display
  ['> 1  ' + "'-'" + '+(dev.slot+dev.height', "> 1 ? '-'+(dev.slot+dev.height"],
  
  // Empty panel emoji check - actually this needs ? for ternary too
  ['${dev.name || ' + "'设备'"} 的连', '${dev.name || ' + "'设备'"} 的连接'],
  
  // filter network all checked
  ['filterNetwork[n] !== false', 'filterNetwork[n] !== false'],
  
  // Also find any other patterns missing ?
  // Check for "true :" or "false :" patterns that would indicate missing ?
];

for (const [from, to] of fixes) {
  if (t.includes(from)) {
    t = t.split(from).join(to);
    console.log('✓ fixed');
  } else {
    console.log('✗ not found:', from.substring(0, 40));
  }
}

// Also find any remaining "? :" patterns that are missing ?
// Look for patterns like: condition  value1 : value2 (without ?)
const lines = t.split('\n');
let count = 0;
for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  // Skip comments and strings
  if (line.trim().startsWith('//')) continue;
  // Look for patterns that should be ternary expressions
  // condition ? value1 : value2
  const ternaryPattern = /([=!]=+\s[^?:]*?)\s+([^:]+)\s+:\s+/;
  let m;
  while ((m = ternaryPattern.exec(line)) !== null) {
    // Check if the first part is a boolean expression
    const expr = m[1];
    if (expr.match(/===|!==|==|!=|>|<|>=|<=|&&|\|\||true|false/)) {
      // This might be a ternary missing ?
      const idx = m.index;
      const beforeQ = line.indexOf('?', idx - 10);
      // Check if there's already a ? before the colon
      const afterStart = line.substring(idx, idx + m[0].length);
      if (!afterStart.includes('?')) {
        console.log('L' + (i+1) + ' 可能缺?:', line.trim().substring(0, 70));
        count++;
      }
    }
  }
}

console.log('\n可能还需要检查的行:', count);

fs.writeFileSync('index.html', t, 'utf8');
console.log('done');
