import * as path from 'path';
import * as fs from 'fs';

export default function deleteIcon(data: MessageIconInfo) {
  fs.unlinkSync(data.iconAPath);

  const {iconPath, iconName, iconClass, configPath, rootPath} = data;
  const configAPath = path.join(rootPath, configPath);
  let code = fs.readFileSync(configAPath, 'utf-8');
  const iconImport = `import ${iconClass} from '${iconPath}';\n`;
  const iconRegister = `registerIcon('${iconName}', ${iconClass});\n`;
  code = code.replace(iconImport, '').replace(iconRegister, '');
  fs.writeFileSync(configAPath, code);
}
