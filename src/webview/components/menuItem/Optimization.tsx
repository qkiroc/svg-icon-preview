import MenuItem from './MenuItem';

export default function Optimization(props: {menuInfo: MenuInfo}) {
  const projectConfig = window.projectConfig!;
  const {menuInfo} = props;

  function handleClick() {
    window.vscode.postMessage({
      type: 'optimization',
      data: {
        iconAPath: menuInfo.iconInfo.aPath
      }
    });
  }

  return (
    <>
      <MenuItem onClick={handleClick}>优化</MenuItem>
    </>
  );
}
