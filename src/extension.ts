import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import IconViewProvider from './IconViewProvider';

interface DeleteIconInfo {
  iconPath: string;
  iconAPath: string;
  iconName: string;
  iconClass: string;
  projectName: string;
  configPath: string;
  rootPath: string;
}

function deleteIconConfigImport(data: DeleteIconInfo) {
  const { iconPath, iconName, iconClass, configPath, rootPath } = data;
  const configAPath = path.join(rootPath, configPath);
  let code = fs.readFileSync(configAPath, 'utf-8');
  const iconImport = `import ${iconClass} from '${iconPath}';\n`;
  const iconRegister = `registerIcon('${iconName}', ${iconClass});\n`;
  code = code.replace(iconImport, '').replace(iconRegister, '');
  fs.writeFileSync(configAPath, code);
}

export function activate(context: vscode.ExtensionContext) {
  const provider = new IconViewProvider(context.extensionUri);

  context.subscriptions.push(vscode.window.registerWebviewViewProvider('svgIconList', provider));
  context.subscriptions.push(vscode.window.registerWebviewViewProvider('explorer-svgIconList', provider));

  // 文件改变重新渲染图标列表
  vscode.window.onDidChangeActiveTextEditor(e => {
    provider.render();
  });

  vscode.commands.registerCommand('svgPreview.reload', () => {
    provider.reload();
  });

  vscode.commands.registerCommand('svgPreview.openRegisterFile', () => {
    provider.openRegisterFile();
  });

  vscode.commands.registerCommand('svgIconList.delete', (data: DeleteIconInfo) => {
    const { iconAPath, projectName } = data;
    vscode.window
      .showInformationMessage('删除图标会同步删除引用和本地文件，确认是否删除？', '确认', '取消')
      .then(value => {
        if (value === '确认') {
          fs.unlink(iconAPath, () => {
            provider.deleteIcon(iconAPath, projectName);
            deleteIconConfigImport(data);
          });
        }
      });
  });
}
