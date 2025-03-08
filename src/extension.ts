import * as vscode from 'vscode';
import {SvgDecorationProvider} from './SvgDecorationProvider';
import IconViewProvider from './IconViewProvider';

export function activate(context: vscode.ExtensionContext) {
  // 创建图标视图提供程序
  const iconViewProvider = new IconViewProvider(context.extensionUri);

  // 创建SVG装饰提供程序
  let decorationProvider: SvgDecorationProvider | undefined;

  // 初始化装饰
  if (vscode.window.activeTextEditor) {
    decorationProvider = new SvgDecorationProvider(
      iconViewProvider,
      vscode.window.activeTextEditor
    );
  }

  // 文档变更时更新装饰
  vscode.window.onDidChangeActiveTextEditor(
    editor => {
      if (editor) {
        if (!decorationProvider) {
          decorationProvider = new SvgDecorationProvider(
            iconViewProvider,
            editor
          );
        } else {
          decorationProvider.updateDecorations(editor);
        }
      }
      iconViewProvider.render();
    },
    null,
    context.subscriptions
  );

  // 文档内容变化时更新装饰
  vscode.workspace.onDidChangeTextDocument(
    event => {
      if (
        vscode.window.activeTextEditor &&
        event.document === vscode.window.activeTextEditor.document
      ) {
        if (decorationProvider) {
          decorationProvider.updateDecorations(vscode.window.activeTextEditor);
          iconViewProvider.reload(false);
        }
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
