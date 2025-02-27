import { useLayoutEffect, useMemo, useRef, useState } from 'react';

export default function Menu(props: { menuInfo: MenuInfo }) {
  const projectConfig = window.projectConfig!;
  const { menuInfo } = props;
  const target = menuInfo.target;
  const menuRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ left: 0, top: 0 });

  useLayoutEffect(() => {
    if (target && menuRef.current) {
      const menu = menuRef.current;
      const rect = menu.getBoundingClientRect();
      const width = rect.width;
      const height = rect.height;

      const targetRect = target.getBoundingClientRect();
      let left = targetRect.left - (width - targetRect.width) / 2;
      let top = targetRect.top + targetRect.height;

      // 判断是否超出屏幕
      if (left + width > window.innerWidth) {
        left = left - width;
      }
      if (top + height > window.innerHeight) {
        top = top - height;
      }
      setPosition({ left, top });
    }
  }, [target]);

  function handleClick(type: messageType) {
    window.vscode.postMessage({
      type: type,
      data: {
        iconAPath: menuInfo.iconInfo.aPath,
        iconName: menuInfo.iconInfo.name,
        iconPath: menuInfo.iconInfo.path!,
        iconClass: menuInfo.iconInfo.class!,
        projectName: projectConfig.projectName!,
        configPath: projectConfig.configPath!,
        rootPath: projectConfig.rootPath!
      }
    });
  }

  return (
    <div
      className='icon-menu'
      ref={menuRef}
      style={{
        top: position.top,
        left: position.left
      }}>
      <div className='icon-menu-item' onClick={() => handleClick('view')}>
        查看文件
      </div>
      <div className='icon-menu-item delete' onClick={() => handleClick('delete')}>
        删除
      </div>
    </div>
  );
}
