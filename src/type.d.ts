interface IconProps {
  aPath: string;
  name: string;
  path?: string;
  class?: string;
  unRegister?: boolean;
  svg?: string;
}

interface MenuInfo {
  target: HTMLElement;
  iconInfo: IconProps;
}

interface MessageIconInfo {
  iconPath: string;
  iconAPath: string;
  iconName: string;
  iconClass: string;
  projectName: string;
  configPath: string;
  rootPath: string;
}

interface iconConfigProps {
  name: string;
  iconPath: string;
  iconDir: string;
}

interface ProjectConfig {
  projectName?: string;
  configPath?: string;
  rootPath?: string;
  iconDir?: string;
  iconConfig?: iconConfigProps[];
}

type messageType = 'view' | 'delete' | 'importIcon' | 'search' | 'optimization';
