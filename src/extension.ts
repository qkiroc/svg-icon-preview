import * as vscode from 'vscode';
import {decorationProvider, showSvgDecoration} from './svgDecorationProvider';
import IconViewProvider from './IconViewProvider';
import {showSvgPreview} from './showSvgPreview';

export function activate(context: vscode.ExtensionContext) {
  // 创建图标视图提供程序
  const iconViewProvider = new IconViewProvider(context.extensionUri);

  if (vscode.window.activeTextEditor) {
    showSvgDecoration(vscode.window.activeTextEditor, iconViewProvider);
    showSvgPreview(vscode.window.activeTextEditor?.document);
  }

  // 文档变更时更新装饰
  vscode.window.onDidChangeActiveTextEditor(
    editor => {
      if (editor) {
        showSvgDecoration(editor, iconViewProvider);
        showSvgPreview(editor?.document);
        iconViewProvider.render();
      }
    },
    null,
    context.subscriptions
  );

  // 文档内容变化时更新装饰和预览
  vscode.workspace.onDidChangeTextDocument(
    event => {
      if (
        vscode.window.activeTextEditor &&
        event.document === vscode.window.activeTextEditor.document
      ) {
        showSvgDecoration(vscode.window.activeTextEditor, iconViewProvider);
        // 如果是SVG文件，自动更新预览
        showSvgPreview(event.document);
        iconViewProvider.reload(false);
      }
    },
    null,
    context.subscriptions
  );

  // 注册其他命令和提供程序
  vscode.commands.registerCommand('svgPreview.reload', () => {
    iconViewProvider.reload();
  });

  vscode.commands.registerCommand('svgPreview.openRegisterFile', () => {
    iconViewProvider.openRegisterFile();
  });

  // 确保在插件停用时清理装饰
  context.subscriptions.push({
    dispose: () => decorationProvider?.disposeDecorations()
  });

  context.subscriptions.push(
    vscode.window.registerWebviewViewProvider('svgIconList', iconViewProvider)
  );
  context.subscriptions.push(
    vscode.window.registerWebviewViewProvider(
      'explorer-svgIconList',
      iconViewProvider
    )
  );
}
