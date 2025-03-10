import * as vscode from 'vscode';

const currentPanel: {
  provider: SvgPreviewProvider | null;
  panel: vscode.WebviewPanel | null;
} = {
  provider: null,
  panel: null
};

export class SvgPreviewProvider {
  private static readonly viewType = 'svgPreview';
  private readonly _panel: vscode.WebviewPanel;
  private _disposables: vscode.Disposable[] = [];

  public static createOrShow(document: vscode.TextDocument) {
    // 保存当前活动编辑器的引用
    const activeEditor = vscode.window.activeTextEditor;

    // 如果已经有预览面板，直接更新内容
    if (currentPanel.provider && currentPanel.panel) {
      currentPanel.panel.reveal(vscode.ViewColumn.Beside, true);
      // 更新内容和当前文档URI
      currentPanel.provider.updateContent(document);

      return;
    }

    // 否则，创建新的面板
    const panel = vscode.window.createWebviewPanel(
      SvgPreviewProvider.viewType,
      'SVG预览: ' + document.fileName.split('/').pop(),
      {
        viewColumn: vscode.ViewColumn.Beside,
        preserveFocus: true // 重要：防止新面板获取焦点
      },
      {
        enableScripts: true,
        retainContextWhenHidden: true
      }
    );

    const provider = new SvgPreviewProvider(panel, document);
    currentPanel.panel = panel;
    currentPanel.provider = provider;

    // 确保焦点回到编辑器
    if (activeEditor) {
      setTimeout(() => {
        vscode.window.showTextDocument(
          activeEditor.document,
          activeEditor.viewColumn,
          false
        );
      }, 100);
    }
  }

  private constructor(
    panel: vscode.WebviewPanel,
    document: vscode.TextDocument
  ) {
    this._panel = panel;

    // 更新内容
    this.updateContent(document);

    // 监听面板关闭事件
    this._panel.onDidDispose(() => this.dispose(), null, this._disposables);

    // 监听全局文档变化 - 针对当前正在预览的文档
    vscode.workspace.onDidChangeTextDocument(
      e => {
        this.updateContent(e.document);
      },
      null,
      this._disposables
    );

    // 设置标题
    this._panel.title = 'SVG预览: ' + document.fileName.split('/').pop();
  }

  public updateContent(document: vscode.TextDocument) {
    if (!this._panel) {
      return;
    }

    const svgContent = document.getText();
    this._panel.webview.html = this.getHtmlForWebview(svgContent);

    // 更新标题以反映当前文件
    this._panel.title = 'SVG预览: ' + document.fileName.split('/').pop();
  }

  private getHtmlForWebview(svgContent: string): string {
    // 确保SVG内容安全
    const sanitizedSvg = svgContent
      .replace(/script/gi, 'scriipt') // 防止脚本注入
      .trim();

    return `<!DOCTYPE html>
      <html>
      <style>
        body {
          margin: 0;
          padding: 0;
        }
        .svg-container {
          display: flex;
          justify-content: center;
          align-items: center;
          height: 100vh;
          background-color: white;
          background-image:
            linear-gradient(45deg, #ccc 25%, transparent 25%),
            linear-gradient(-45deg, #ccc 25%, transparent 25%),
            linear-gradient(45deg, transparent 75%, #ccc 75%),
            linear-gradient(-45deg, transparent 75%, #ccc 75%);
          background-size: 20px 20px;
          background-position: 0 0, 0 10px, 10px -10px, -10px 0px;
        }
        svg {
          max-width: 200px;
          max-height: 200px;
          height: auto;
          width: auto;
          color: #000;
        }
      </style>
      <body>
        <div class="svg-container">
          ${sanitizedSvg}
        </div>
      </body>
      </html>`;
  }

  public dispose() {
    currentPanel.provider = null;
    currentPanel.panel = null;

    // 清理资源
    this._panel.dispose();
    while (this._disposables.length) {
      const disposable = this._disposables.pop();
      if (disposable) {
        disposable.dispose();
      }
    }
  }
}

// 判断文件是否为SVG
function isSvgFile(document: vscode.TextDocument): boolean {
  // 检查文件类型或扩展名
  return (
    document.languageId === 'svg' ||
    (document.languageId === 'xml' &&
      document.uri.fsPath.toLowerCase().endsWith('.svg'))
  );
}

export function showSvgPreview(document: vscode.TextDocument | undefined) {
  if (document && isSvgFile(document)) {
    SvgPreviewProvider.createOrShow(document);
  } else {
    if (currentPanel.provider) {
      currentPanel.provider.dispose();
    }
  }
}
