const fs = require('fs');
const path = require('path');
function main() {
  // 读取文件
  const content = fs.readFileSync(
    path.resolve(__dirname, '../src/amis-icons/index.ts'),
    'utf-8'
  );
  const lines = content.split('\n');
  const importLines = [];
  const exportLines = {};
  let exportStart = false;
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (line.startsWith('import')) {
      importLines.push(line);
    }

    if (exportStart) {
      const str = line.split(': ');
      if (str.length === 2) {
        const key = str[1].trim().replace(/,/g, '');
        exportLines[key] = str[0].trim().replace(/'/g, '');
      }
    }
    if (line.startsWith('export')) {
      exportStart = true;
    }
  }
  const res = [];
  for (let line of importLines) {
    const str = line.replace('import ', '').split(' from ');
    const key = str[0].replace(/'/g, '');
    const filePath = str[1].replace(/'/g, '').replace(';', '');
    const fileContent = fs.readFileSync(
      path.resolve(__dirname, '../src/amis-icons', filePath),
      'utf-8'
    );
    res.push(`'${exportLines[key]}': \`${fileContent}\``);
  }
  const result = `export default {
    ${res.join(',\n')}
  }`;
  fs.writeFileSync(
    path.resolve(__dirname, '../src/amis-icons/index.ts'),
    result,
    'utf-8'
  );
}

main();
