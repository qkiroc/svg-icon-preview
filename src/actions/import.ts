import * as path from 'path';
import * as fs from 'fs';
import {optimize} from 'svgo';
import {camelCase, upperFirst} from 'lodash';
import {defaultPlugins} from './helper';

type ImportIconData = {
  name: string;
  content: string;
  needColor: boolean;
} & ProjectConfig;

export default function importIcon(data: ImportIconData[]) {
  data.forEach(item => importIconFn(item));
}

function importIconFn(data: ImportIconData) {
  const {name, content, needColor, projectName, configPath, rootPath, iconDir} =
    data;
  // 在iconDir下创建一个新的svg文件
  const iconPath = path.join(rootPath!, iconDir!, name + '.svg');
  let plugins = [...defaultPlugins!];
  if (!needColor) {
    plugins?.push({
      name: 'convertColors',
      params: {currentColor: true}
    });
  }
  // 优化svg
  const result = optimize(content, {
    plugins
  });
  fs.writeFileSync(iconPath, result.data, 'utf8');

  // 将name转成合法的js类名
  const className = upperFirst(camelCase(name));

  const configAPath = path.join(rootPath!, configPath!);
  let code = fs.readFileSync(configAPath, 'utf-8');
  let iconRelativePath = path.relative(
    path.dirname(path.join(rootPath!, configPath!)),
    iconPath
  );
  iconRelativePath = iconRelativePath.startsWith('.')
    ? iconRelativePath
    : './' + iconRelativePath;
  const iconImport = `import ${className} from '${iconRelativePath}';`;
  const iconRegister = `registerIcon('${name}', ${className});`;

  const iconList = code.split('\n').reverse();

  // 在最后一个import语句之后插入新的import语句
  let index = iconList.findIndex(
    item => item.startsWith('import') && item.endsWith(".svg';")
  );
  if (index === -1) {
    index = 0;
  }
  iconList.splice(index, 0, iconImport);

  // 在最后一个registerIcon语句之后插入新的registerIcon语句
  index = iconList.findIndex(item => item.startsWith('registerIcon'));
  if (index === -1) {
    index = 0;
  }
  iconList.splice(index, 0, iconRegister);

  code = iconList.reverse().join('\n');

  fs.writeFileSync(configAPath, code);
}
