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

  // 计算优化前后的大小
  const beforeSize = code.length;
  const afterSize = result.data.length;
  const optimizationRate = Math.round(
    ((beforeSize - afterSize) / beforeSize) * 100
  );
  return {
    beforeSize,
    afterSize,
    optimizationRate
  };
}
