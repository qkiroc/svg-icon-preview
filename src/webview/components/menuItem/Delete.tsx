import React from 'react';
import MenuItem from './MenuItem';
import Modal from 'antd/es/modal';

export default function Delete(props: {menuInfo: MenuInfo}) {
  const projectConfig = window.projectConfig!;
  const {menuInfo} = props;
  const modalRef = React.useRef<any>();

  function handleShow() {
    Modal.confirm({
      title: '确定要删除吗？',
      content: (
        <div>
          同步删除<span className="important">引用</span>和
          <span className="important">本地文件</span>
          ，确定要删除吗？
        </div>
      ),
      okText: '删除',
      cancelText: '取消',
      okType: 'danger',
      autoFocusButton: null,
      onOk: handleClick
    });
  }

  function handleClick() {
    modalRef.current?.destroy();

    window.vscode.postMessage({
      type: 'delete',
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
    <>
      <MenuItem className="delete" onClick={handleShow}>
        删除
      </MenuItem>
    </>
  );
}
