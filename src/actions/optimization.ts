import * as fs from 'fs';
import {defaultPlugins} from './helper';
import {optimize} from 'svgo';

export default function optimizeIcon(data: MessageIconInfo) {
  const {iconAPath} = data;
  let code = fs.readFileSync(iconAPath, 'utf-8');
  const result = optimize(code, {
    plugins: defaultPlugins
  });
  fs.writeFileSync(iconAPath, result.data, 'utf8');

  // 计算优化前后的大小，单位转化为KB
  const beforeSize = (code.length / 1024).toFixed(2);
  const afterSize = (result.data.length / 1024).toFixed(2);
  const optimizationRate = (
    ((code.length - result.data.length) / code.length) *
    100
  ).toFixed(2);
  return {
    beforeSize,
    afterSize,
    optimizationRate
  };
}
