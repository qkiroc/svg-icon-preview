import Empty from 'antd/es/empty';

export default function EmptyComponent() {
  const projectConfig = window.projectConfig!;
  const iconConfig = projectConfig.iconConfig;

  function handleOpenProject(path: string) {
    window.vscode.postMessage({
      type: 'view',
      data: {
        path,
        rootPath: projectConfig.rootPath
      }
    });
  }

  return (
    <div className="empty">
      <Empty
        description={
          '未检查到可用图标，' +
          (iconConfig?.length
            ? '点击进入项目查看'
            : '请检查iconConfig.json配置')
        }
      />
      <div className="empty-tip-content">
        {iconConfig &&
          iconConfig.map((config, index) => (
            <div
              key={index}
              className="empty-tip-content-button"
              onClick={() => handleOpenProject(config.iconPath)}
            >
              {config.name}
            </div>
          ))}
      </div>
    </div>
  );
}
