import * as vscode from 'vscode';
import IconViewProvider from './IconViewProvider';

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
}
