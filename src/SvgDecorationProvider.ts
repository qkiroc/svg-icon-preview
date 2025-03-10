import * as vscode from 'vscode';
import IconViewProvider from './IconViewProvider';
import {amisIcons} from './amis-icons';

export let decorationProvider: SvgDecorationProvider | undefined;

export class SvgDecorationProvider {
  private activeDecorations: vscode.TextEditorDecorationType[] = [];
  private iconProvider: IconViewProvider;

  public static create(
    iconProvider: IconViewProvider,
    editor: vscode.TextEditor
  ) {
    if (!decorationProvider) {
      decorationProvider = new SvgDecorationProvider(iconProvider, editor);
    }
    decorationProvider.updateDecorations(editor);
  }

  constructor(iconProvider: IconViewProvider, editor?: vscode.TextEditor) {
    this.iconProvider = iconProvider;
    this.updateDecorations(editor);
  }

  /**
   * 为当前编辑器更新SVG装饰
   */
  public updateDecorations(editor?: vscode.TextEditor) {
    if (!editor) return;

    // 清除所有现有装饰
    this.disposeDecorations();

    const text = editor.document.getText();
    const regex = /icon="([^"]*)"/g; // 匹配 icon="xxx" 的字符串
    let match;

    // 为每个匹配创建单独的装饰类型
    while ((match = regex.exec(text))) {
      const iconName = match[1]; // 提取图标名称
      const icon = this.getIconSvg(iconName);
      if (!icon) continue;

      const range = this.getRangeForMatch(editor, match);
      const iconPath = this.getIconPath(icon);

      const hoverMessage = new vscode.MarkdownString();

      hoverMessage.appendMarkdown(`**${iconName}**`);
      hoverMessage.appendMarkdown('\n\n');
      hoverMessage.appendMarkdown(`![${iconName}](${iconPath})`);

      const decorationType = vscode.window.createTextEditorDecorationType({
        gutterIconPath: vscode.Uri.parse(iconPath),
        gutterIconSize: 'contain',
        rangeBehavior: vscode.DecorationRangeBehavior.ClosedClosed
      });

      editor.setDecorations(decorationType, [{range, hoverMessage}]);
      this.activeDecorations.push(decorationType);
    }
  }

  private getIconSvg(iconName: string): string | undefined {
    const iconList = this.iconProvider.getIconInfo();
    return (
      iconList?.icons.find(icon => icon.name === iconName)?.svg ||
      (amisIcons as any)[iconName]
    );
  }

  private getRangeForMatch(
    editor: vscode.TextEditor,
    match: RegExpExecArray
  ): vscode.Range {
    const startPos = editor.document.positionAt(match.index);
    const endPos = editor.document.positionAt(match.index + match[0].length);
    return new vscode.Range(startPos, endPos);
  }

  private getIconPath(icon: string): string {
    return `data:image/svg+xml;base64,${Buffer.from(
      this.sanitizeSvg(icon)
    ).toString('base64')}`;
  }

  /**
   * 清除所有装饰
   */
  public disposeDecorations() {
    this.activeDecorations.forEach(decoration => decoration.dispose());
    this.activeDecorations = [];
  }

  /**
   * 为SVG添加颜色和垂直居中样式
   */
  private addColorToSvg(svg: string, color: string = '#fff') {
    // 添加居中和垂直对齐的内联样式
    return svg.replace(/<svg /, `<svg style="color: ${color};" `);
  }

  /**
   * 清理和修复SVG以确保正常渲染
   */
  private sanitizeSvg(svg: string): string {
    try {
      // 确保SVG有正确的XML声明
      if (!svg.includes('<?xml')) {
        svg = '<?xml version="1.0" encoding="UTF-8"?>' + svg;
      }

      // 确保SVG有命名空间
      if (!svg.includes('xmlns=')) {
        svg = svg.replace(/<svg/, '<svg xmlns="http://www.w3.org/2000/svg"');
      }

      // 添加颜色样式
      svg = this.addColorToSvg(svg);

      // 确保viewBox属性存在
      if (!svg.includes('viewBox=')) {
        // 尝试从width和height属性创建viewBox
        const widthMatch = svg.match(/width="([^"]*)"/);
        const heightMatch = svg.match(/height="([^"]*)"/);

        if (widthMatch && heightMatch) {
          const width = widthMatch[1];
          const height = heightMatch[1];
          svg = svg.replace(/<svg/, `<svg viewBox="0 0 ${width} ${height}"`);
        } else {
          // 默认viewBox
          svg = svg.replace(/<svg/, '<svg viewBox="0 0 24 24"');
        }
      }

      return svg;
    } catch (error) {
      console.error('Error sanitizing SVG:', error);
      // 返回一个简单的占位SVG
      return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><rect width="24" height="24" fill="#ff0000" opacity="0.3"/><text x="50%" y="50%" text-anchor="middle" dy=".3em" font-size="8">错误</text></svg>';
    }
  }
}

// 判断是否是tsx文件
function isTsxFile(document: vscode.TextDocument): boolean {
  return document.languageId === 'typescriptreact';
}

export function showSvgDecoration(
  editor: vscode.TextEditor | undefined,
  iconProvider: IconViewProvider
) {
  if (editor?.document && isTsxFile(editor.document)) {
    SvgDecorationProvider.create(iconProvider, editor);
  }
}
