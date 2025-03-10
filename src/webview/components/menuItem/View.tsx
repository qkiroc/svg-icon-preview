import {viewFile} from '../../helper';
import MenuItem from './MenuItem';

export default function View(props: {menuInfo: MenuInfo}) {
  const {menuInfo} = props;
  function handleClick() {
    viewFile(menuInfo.iconInfo);
  }

  return <MenuItem onClick={handleClick}>查看文件</MenuItem>;
}
