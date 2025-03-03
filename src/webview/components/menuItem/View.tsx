import MenuItem from './MenuItem';

export default function View(props: {menuInfo: MenuInfo}) {
  const {menuInfo} = props;
  function handleClick() {
    window.vscode.postMessage({
      type: 'view',
      data: {
        path: menuInfo.iconInfo.aPath
      }
    });
  }

  return <MenuItem onClick={handleClick}>查看文件</MenuItem>;
}
