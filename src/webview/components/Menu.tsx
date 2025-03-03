import { useLayoutEffect, useMemo, useRef, useState } from 'react';
import View from './menuItem/View';
import Delete from './menuItem/Delete';

export default function Menu(props: { menuInfo: MenuInfo }) {
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

  return (
    <div
      className='icon-menu'
      ref={menuRef}
      style={{
        top: position.top,
        left: position.left
      }}>
      <View menuInfo={menuInfo} />
      <Delete menuInfo={menuInfo} />
    </div>
  );
}
