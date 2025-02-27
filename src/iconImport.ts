import * as path from 'path';
import * as fs from 'fs';
import { Config, optimize } from 'svgo';
import { camelCase, upperFirst } from 'lodash';

// 配置 SVGO 插件
const defaultPlugins: Config['plugins'] = [
  'removeHiddenElems', // 移除隐藏的元素
  'removeEmptyText', // 移除空的文本元素
  'removeEmptyContainers', // 移除空的容器元素
  'removeDimensions', // 移除宽度和高度属性
  'removeTitle', // 移除标题元素
  'removeDesc', // 移除描述元素
  'removeComments', // 移除注释
  'removeMetadata', // 移除元数据
  'removeHiddenElems', // 移除隐藏的元素（重复）
  'convertShapeToPath', // 将形状转换为路径
  'mergePaths', // 合并路径
  'collapseGroups', // 折叠组
  'removeUselessStrokeAndFill', // 移除无用的描边和填充
  'convertTransform', // 转换变换属性
  'removeUnknownsAndDefaults', // 移除未知元素和属性
  'removeNonInheritableGroupAttrs', // 移除不可继承的组属性
  'removeUselessDefs', // 移除无用的 defs
  'removeUnusedNS', // 移除未使用的命名空间声明
  {
    name: 'cleanupIds', // 清理 ID
    params: {
      minify: true // 尽可能地删除不必要的 id
    }
  },
  {
    name: 'convertPathData', // 转换路径数据
    params: {
      floatPrecision: 2, // 浮点精度
      transformPrecision: 2, // 变换精度
      negativeExtraSpace: true // 负数额外空间
    }
  }
];

export default function importIcon(data: { name: string; content: string; needColor: boolean } & ProjectConfig) {
  const { name, content, needColor, projectName, configPath, rootPath, iconDir } = data;
  // 在iconDir下创建一个新的svg文件
  const iconPath = path.join(rootPath!, iconDir!, name + '.svg');
  let plugins = [...defaultPlugins!];
  if (!needColor) {
    plugins?.push({
      name: 'convertColors',
      params: { currentColor: true }
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
  const iconImport = `import ${className} from './${path.relative(path.join(rootPath!, iconDir!), iconPath)}';`;
  const iconRegister = `registerIcon('${name}', ${className});`;

  const iconList = code.split('\n').reverse();

  // 在最后一个import语句之后插入新的import语句
  let index = iconList.findIndex(item => item.startsWith('import'));
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
