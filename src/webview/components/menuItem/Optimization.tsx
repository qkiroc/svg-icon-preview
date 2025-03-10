import {optimizeIcon} from '../../helper';
import MenuItem from './MenuItem';

export default function Optimization(props: {menuInfo: MenuInfo}) {
  const {menuInfo} = props;

  function handleClick() {
    optimizeIcon(menuInfo.iconInfo);
  }

  return (
    <>
      <MenuItem onClick={handleClick}>优化</MenuItem>
    </>
  );
}
