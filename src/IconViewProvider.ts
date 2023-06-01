import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';

interface iconConfigProps {
  name: string;
  iconPath: string;
  iconDir: string;
}
interface iconConfigList extends iconConfigProps {
  rootPath: string;
  icons: iconProps[];
}

interface iconProps {
  aPath: string;
  name: string;
  path?: string;
  class?: string;
  unRegister?: boolean;
}

class IconViewProvider implements vscode.WebviewViewProvider {
  private iconConfigList: iconConfigList[] = [];
  private view?: vscode.WebviewView;
  private currentIconConfig?: iconConfigList;
  private searchValue: string = '';

  constructor(private readonly _extensionUri: vscode.Uri) {}

  public resolveWebviewView(
    webviewView: vscode.WebviewView,
    context: vscode.WebviewViewResolveContext,
    _token: vscode.CancellationToken
  ) {
    webviewView.webview.options = {
      enableScripts: true
    };
    this.view = webviewView;

    this.getIconConfig();
    this.render();
    this.receiveMessage();
  }

  public render() {
    const iconConfig = this.getIconInfo();
    if (iconConfig) {
      const html = this.getWebviewContent(iconConfig);
      this.view!.webview.html = html;
    } else {
      this.renderNullData();
    }
  }

  /**
   * 刷新视图
   */
  public reload() {
    this.iconConfigList = [];
    this.searchValue = '';
    this.getIconConfig();
    this.render();
  }

  /**
   * 打开图标注册文件
   */
  public openRegisterFile() {
    if (this.currentIconConfig) {
      const iconPath = this.currentIconConfig.iconPath;
      const rootPath = this.currentIconConfig.rootPath;
      const iconAPath = path.join(rootPath, iconPath);
      // 打开svg文件
      vscode.workspace.openTextDocument(iconAPath).then(doc => {
        // 在VSCode编辑窗口展示读取到的文本
        vscode.window.showTextDocument(doc);
      });
    }
  }

  /**
   * 删除视图中的图标
   * @param aPath
   * @param projectName
   */
  public deleteIcon(aPath: string, projectName: string) {
    const iconConfig = this.iconConfigList.find(item => item.name === projectName);
    if (iconConfig) {
      const index = iconConfig?.icons.findIndex(icon => icon.aPath === aPath);
      iconConfig?.icons.splice(index!, 1);
      const html = this.getWebviewContent(iconConfig);
      this.view!.webview.html = html;
    }
  }

  /**
   * 监听 webview 的消息
   */
  private receiveMessage() {
    this.view!.webview.onDidReceiveMessage(data => {
      switch (data.type) {
        case 'view': {
          // 打开svg文件
          vscode.workspace.openTextDocument(data.iconAPath).then(doc => {
            // 在VSCode编辑窗口展示读取到的文本
            vscode.window.showTextDocument(doc);
          });
          break;
        }
        case 'delete': {
          vscode.commands.executeCommand('svgIconList.delete', data);
          break;
        }
        case 'search': {
          this.searchValue = data.value;
          this.render();
          break;
        }
      }
    });
  }

  /**
   * 获取当前文件的可使用的图标
   */
  private getIconInfo() {
    const editor = vscode.window.activeTextEditor; // 获取当前文档实例
    if (editor) {
      const currentUri = editor.document.uri.path; // 获取当前文档地址
      const currentIconConfig = this.iconConfigList.find(item => {
        if (currentUri.includes(path.join(item.rootPath, item.name) + '/')) {
          return item;
        }
      });
      if (currentIconConfig) {
        this.currentIconConfig = currentIconConfig;
        return currentIconConfig;
      } else {
        this.renderNullData();
      }
    } else {
      this.renderNullData();
    }
  }

  private renderNullData(tip?: string) {
    this.view!.webview.html = this.html(`<div class="empty">
    <svg viewBox="0 0 100 100" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
    <defs>
        <linearGradient x1="16.4979754%" y1="38.5280437%" x2="56.2620383%" y2="63.1848064%" id="linearGradient-1">
            <stop stop-color="#DCE0EF" offset="0%"></stop>
            <stop stop-color="#DCDFEA" offset="100%"></stop>
        </linearGradient>
        <linearGradient x1="28.8931882%" y1="55.7070718%" x2="93.8984841%" y2="48.875884%" id="linearGradient-2">
            <stop stop-color="#F1F3FA" offset="0%"></stop>
            <stop stop-color="#E8EAF0" offset="100%"></stop>
        </linearGradient>
    </defs>
    <g  stroke="none" stroke-width="1" fill="none" fill-rule="evenodd">
        <g  transform="translate(-78.000000, -416.000000)">
            <g  transform="translate(78.000000, 416.000000)">
                <rect  x="0" y="0" width="100" height="100"></rect>
                <ellipse  fill="url(#linearGradient-1)" fill-rule="nonzero" cx="50" cy="60.8" rx="44.4" ry="22.8"></ellipse>
                <ellipse  fill="url(#linearGradient-2)" fill-rule="nonzero" cx="50" cy="58.4" rx="44.4" ry="22.8"></ellipse>
                <path d="M69.3433052,42.0175272 C76.247385,46.0034899 79.4224575,53.2531227 79.4002852,61.1800089 C79.3886692,65.143452 77.9808226,67.9246181 75.7170053,69.2307527 C73.4419251,70.5143678 70.3108743,70.3116918 66.8644658,68.3299702 L34.8566948,50.8677155 C27.952615,46.8817529 22.3775425,37.2208603 22.399666,29.293974 C22.4225936,21.3670878 28.0427172,18.1805696 34.946797,22.1665323 C35.836556,22.6732225 36.6925268,23.2699909 37.5259719,23.9568376 C38.2918405,15.8610546 44.5764677,12.8209136 52.201365,17.2122284 C59.8149994,21.6035432 66.0658383,31.8837238 66.775393,40.8352501 C67.5975754,41.1054849 68.4648089,41.510837 69.3433052,42.0175272 Z"  fill="#E0E3EF" fill-rule="nonzero"></path>
                <path d="M42.92,29.6824613 C42.92,29.2351107 43.2826494,28.8724613 43.73,28.8724613 C43.8912677,28.8724613 44.0488647,28.9206 44.1826072,29.0107123 L49.0426072,32.2852555 C49.2660417,32.4357999 49.4,32.6875855 49.4,32.9570045 L49.4,41.12 L48.271,40.4049536 L49.4,41.1660576 L49.4,48.288706 C49.4,48.7360567 49.0373506,49.098706 48.59,49.098706 C48.4366236,49.098706 48.2863993,49.0551595 48.1568008,48.9731317 L43.2968008,45.8970518 C43.0622016,45.748565 42.92,45.4902682 42.92,45.2126262 L42.92,29.6824613 Z"  fill="#FFFFFF" fill-rule="nonzero"></path>
                <path d="M53.9026072,44.1307123 L58.7626072,47.4052555 C58.9860417,47.5557999 59.12,47.8075855 59.12,48.0770045 L59.12,54.768706 C59.12,55.2160567 58.7573506,55.578706 58.31,55.578706 C58.1566236,55.578706 58.0063993,55.5351595 57.8768008,55.4531317 L53.0168008,52.3770518 C52.7822016,52.228565 52.64,51.9702682 52.64,51.6926262 L52.64,44.8024613 C52.64,44.3551107 53.0026494,43.9924613 53.45,43.9924613 C53.6112677,43.9924613 53.7688647,44.0406 53.9026072,44.1307123 Z"  fill="#F7F8FB" fill-rule="nonzero"></path>
            </g>
        </g>
    </g>
</svg>
      <div class="empty-word">${tip || '暂无可用图标'}</div>
    </div>`);
  }

  /**
   * 获取项目中的全部图标信息
   */
  private getAllSvgIcon(uri: string) {
    const files = fs.readdirSync(uri);
    const svgList: { aPath: string; name: string }[] = [];
    files.forEach(fileName => {
      const filePath = path.join(uri, fileName);
      const stat = fs.lstatSync(filePath);
      if (stat.isFile()) {
        if (fileName.endsWith('.svg')) {
          svgList.push({ aPath: filePath, name: fileName });
        }
      } else {
        svgList.push(...this.getAllSvgIcon(filePath));
      }
    });
    return svgList;
  }

  /**
   * 获取项目图标配置
   */
  private getIconConfig() {
    const rootWorkspace = vscode.workspace.workspaceFolders;
    try {
      rootWorkspace?.forEach(workspaceFolder => {
        const uri = workspaceFolder.uri.path;
        const iconConfigFile = fs.readFileSync(path.join(uri, '.vscode/iconConfig.json'), 'utf-8');
        if (iconConfigFile) {
          const iconConfig = JSON.parse(iconConfigFile);
          iconConfig.forEach((info: iconConfigProps) => {
            // 获取已经注册的图标信息
            const iconPath = path.join(uri, info.iconPath);
            const code = fs.readFileSync(path.join(iconPath), 'utf8');
            const codeIconList = code.match(/import .* from '.*\.svg'/g);
            const codeRegisterIconList = code.match(/registerIcon\('(.*)', (.*)\)/g);
            const iconList: iconProps[] = [];
            if (codeIconList && codeIconList.length > 0 && codeRegisterIconList && codeRegisterIconList.length > 0) {
              const registerIconInfo: any = {};
              codeRegisterIconList.forEach(code => {
                const info = /registerIcon\('(.*)', (.*)\)/.exec(code);
                if (info) {
                  registerIconInfo[info[2]] = info[1];
                }
              });
              codeIconList.forEach(code => {
                const info = /import (.*) from '(.*\.svg)'/.exec(code);
                if (info) {
                  const aPath = path.resolve(iconPath, '../' + info[2]);
                  iconList.push({
                    class: info[1],
                    name: registerIconInfo[info[1]],
                    path: info[2],
                    aPath: aPath
                  });
                }
              });
            }
            // 获取全部图标信息
            const allIcon = this.getAllSvgIcon(path.join(uri, info.iconDir));

            this.iconConfigList.push({
              rootPath: uri,
              icons: allIcon.map(svg => {
                const icon = iconList.find(item => item.aPath === svg.aPath) || { unRegister: true, name: svg.name };
                return {
                  aPath: svg.aPath,
                  ...icon
                };
              }),
              ...info
            });
          });
        }
      });
    } catch (error: any) {
      console.error(error);
    }
  }
  /**
   * 绘制html
   */
  private getWebviewContent(config: iconConfigList) {
    const { icons, name: projectName, iconPath: configPath, rootPath } = config;
    let iconList: iconProps[] = JSON.parse(JSON.stringify(icons));
    const searchValue = this.searchValue;
    if (searchValue) {
      iconList = iconList.filter((item: iconProps) => ~item.name.indexOf(searchValue));
    }
    const toast = `<div id="toast">
						<svg viewBox="0 0 16 16" width="16" height="16"  version="1.1" xmlns="http://www.w3.org/2000/svg" >
							<path d="M8,14.5 C11.5898509,14.5 14.5,11.5898509 14.5,8 C14.5,4.41014913 11.5898509,1.5 8,1.5 C4.41014913,1.5 1.5,4.41014913 1.5,8 C1.5,11.5898509 4.41014913,14.5 8,14.5 Z" stroke="none" fill="#30bf13"></path>
							<polyline stroke="#FFFFFF" transform="translate(8.006071, 7.006071) rotate(45.000000) translate(-8.006071, -7.006071) " points="9.75607112 3.79773779 9.75607112 10.2144045 6.25607112 10.2144045" stroke-width="1" fill="none" stroke-linecap="butt" stroke-linejoin="round"></polyline>
						</svg>
						<span>复制成功</span>
					</div>`;
    const contextMenu = `<div id="contextMenu">
            <div data-type="view">查看文件</div>
            <div class="contextMenu-delete" data-type="delete">删除</div>
          </div>`;
    const searchBox = `<div class="search-box">
            <input type="text" id="searchBox" value="${searchValue}" />
            <svg id="searchBox-button" t="1685587888145" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="4500" width="14" height="14"><path fill="currentColor" d="M1012.367323 1013.138662c-14.857819 14.481102-38.945217 14.481102-53.805083 0l-152.191814-156.861882c-85.021449 67.221549-193.272445 107.649067-311.291479 107.649067C221.923969 963.927894 0.487798 748.148627 0.487798 481.964971S221.923969 0 495.078946 0c273.15293 0 494.589101 215.779267 494.589101 481.964971 0 124.458037-48.825861 237.532654-128.300965 323.041379l151.00024 155.698972C1027.227189 975.192565 1027.227189 998.66575 1012.367323 1013.138662zM495.078946 97.4347c-231.132552 0-395.233961 159.296214-395.233961 384.528223 0 225.227915 164.103457 384.536413 395.233961 384.536413 231.130504 0 395.231913-159.308498 395.231913-384.536413C890.31086 256.732961 726.209451 97.4347 495.078946 97.4347z" p-id="4501"></path></svg>
          </div> `;
    const body = `
					<div id="root">
					${iconList
            .map(item => {
              const iconInfo = `root-path="${rootPath}" project-name="${projectName}" config-path="${configPath}" icon-name="${item.name}" icon-path="${item.path}" icon-aPath="${item.aPath}" icon-class="${item.class}" `;
              return `<div class="icon-content ${item.unRegister ? 'icon-unregister' : ''}" ${iconInfo}>
									<img src="vscode-resource:${item.aPath}" ${iconInfo}>
									<span class="icon-name" ${iconInfo}>${item.name}</span>
								</div>`;
            })
            .join('')}
					</div>`;
    return this.html(toast + contextMenu + searchBox + body);
  }

  private html(body: string) {
    const scriptUri = this.view!.webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, 'media', 'main.js'));
    const styleMainUri = this.view!.webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, 'media', 'main.css'));
    return `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>图标列表</title>
						<link href="${styleMainUri}" rel="stylesheet">
        </head>
        <body>
          ${body}
          <script src="${scriptUri}">
        </body>
      </html>
    `;
  }
}

export default IconViewProvider;
