import React, {useEffect} from 'react';
import Menu from './components/Menu';
import ImportIcon from './components/ImpotIcon';
import cx from 'classnames';
import message from 'antd/es/message';
import Input from 'antd/es/input';
import Empty from './components/Empty';
import {optimizeIcon, viewFile} from './helper';

const {Search} = Input;

export default function App() {
  const icons = window.icons || [];
  const [search, setSearch] = React.useState(window.search);
  const [menuInfo, setMenuInfo] = React.useState<MenuInfo>();

  function handleSearch(e: any) {
    const value = e.target.value;
    setSearch(value);
    window.vscode.postMessage({
      type: 'search',
      data: value
    });
  }

  function handleCopy(icon: IconProps) {
    if (icon.unRegister) {
      message.error('该图标未注册');
      return;
    }
    const value = `<Icon icon="${icon.name}" className="icon" />`;
    if (typeof navigator.clipboard.writeText === 'function') {
      navigator.clipboard.writeText(value).then(() => {
        message.success('复制成功');
      });
      return;
    }
    const input = document.createElement('input');
    input.value = value;
    document.body.appendChild(input);
    input.select();
    document.execCommand('copy');
    document.body.removeChild(input);
    message.success('复制成功');
  }

  function handleClick(e: React.MouseEvent, icon: IconProps) {
    if (e.shiftKey) {
      viewFile(icon);
      return;
    } else if (e.metaKey) {
      optimizeIcon(icon);
      return;
    } else {
      handleCopy(icon);
    }
  }

  // 右键唤起菜单
  function handleContextMenu(icon: MenuInfo) {
    setMenuInfo(icon);
  }

  function closeMenu() {
    setMenuInfo(undefined);
  }

  function messageHandler(event: MessageEvent) {
    const type = event.data.type;
    if (type === 'toast') {
      const data = event.data.data;
      if (data.status === 'success') {
        message.success(data.message);
      } else {
        message.error(data.message);
      }
    }
  }

  useEffect(() => {
    document.addEventListener('click', closeMenu);
    window.addEventListener('message', messageHandler);
    return () => {
      document.removeEventListener('click', closeMenu);
      window.removeEventListener('message', messageHandler);
    };
  }, []);

  return (
    <>
      <div className="icon-header">
        <div className="icon-header-title">图标列表</div>
        {icons.length > 0 && <ImportIcon />}
      </div>
      {icons.length > 0 && (
        <div className="icon-search">
          <Search
            value={search}
            className="icon-search-wrapper"
            placeholder="输入图标key搜索"
            allowClear
            onChange={handleSearch}
          />
        </div>
      )}
      {icons.length > 0 ? (
        <div className="icon-list">
          {icons
            .filter((icon: any) => {
              const searchList = search?.split(',');

              if (!searchList || searchList.length === 0) {
                return true;
              }
              if (searchList.some((item: string) => icon.name.includes(item))) {
                return true;
              }
              return false;
            })
            .map(icon => {
              return (
                <div
                  data-role="icon-list-item"
                  key={icon.aPath}
                  className={cx(
                    'icon-list-item',
                    icon.unRegister && 'icon-list-item--unregister'
                  )}
                  onClick={e => handleClick(e, icon)}
                  onContextMenu={e => {
                    e.preventDefault();
                    handleContextMenu({
                      iconInfo: icon,
                      target: e.currentTarget
                    });
                  }}
                >
                  <div
                    dangerouslySetInnerHTML={{__html: icon.svg || ''}}
                    className="icon-list-item-svg"
                  ></div>
                  <div className="icon-list-item-name">{icon.name}</div>
                </div>
              );
            })}
        </div>
      ) : (
        <Empty />
      )}
      {menuInfo && <Menu menuInfo={menuInfo} />}
    </>
  );
}
