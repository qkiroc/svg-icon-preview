import type {Config} from 'svgo';
import {v4 as uuidv4} from 'uuid';

// 配置 SVGO 插件
export const defaultPlugins: Config['plugins'] = [
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
  'removeXMLProcInst', // 移除 XML 处理指令
  // 'removeXMLNS', // 移除 XML 命名空间属性
  'removeDoctype', // 移除文档类型声明
  {
    name: 'cleanupIds', // 清理 ID
    params: {
      minify: true // 尽可能地删除不必要的 id
    }
  },
  {
    name: 'prefixIds', // 专门处理 ID 前缀的插件
    params: {
      prefix: `uuid-${uuidv4()}`
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
