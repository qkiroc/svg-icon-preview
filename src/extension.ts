import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';

interface iconConfig {
  name: string;
  iconPath: string;
}
interface iconConfigList extends iconConfig {
  rootPath: string;
}

class ColorsViewProvider implements vscode.WebviewViewProvider {
  private iconConfigList: iconConfigList[] = [];
  private view?: vscode.WebviewView;

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
        const iconPath = path.join(currentIconConfig.rootPath, currentIconConfig.iconPath);
        const code = fs.readFileSync(path.join(iconPath), 'utf8');
        const iconList = code.match(/import .* from '.*\.svg'/g);
        const registerIconList = code.match(/registerIcon\('(.*)', (.*)\)/g);
        const iconConfig: any = [];
        if (iconList && iconList.length > 0 && registerIconList && registerIconList.length > 0) {
          const registerIconInfo: any = {};
          registerIconList.forEach(code => {
            const info = /registerIcon\('(.*)', (.*)\)/.exec(code);
            if (info) {
              registerIconInfo[info[2]] = info[1];
            }
          });
          iconList.forEach(code => {
            const info = /import (.*) from '(.*\.svg)'/.exec(code);
            if (info) {
              const aPath = path.resolve(iconPath, '../' + info[2]);
              iconConfig.push({
                class: info[1],
                name: registerIconInfo[info[1]],
                path: info[2],
                aPath: aPath
              });
            }
          });
          return iconConfig;
        } else {
          this.renderNullData();
        }
      } else {
        this.renderNullData();
      }
    } else {
      this.renderNullData();
    }
  }

  private renderNullData() {
    this.view!.webview.html = '<div style="margin: 20px;text-align: center;">暂无可用图标</div>';
  }

  /**
   * 获取项目图标配置
   */
  private getIconConfig() {
    const rootWorkspace = vscode.workspace.workspaceFolders;
    rootWorkspace?.forEach(workspaceFolder => {
      const uri = workspaceFolder.uri.path;
      const iconConfigFile = fs.readFileSync(path.join(uri, '.vscode/iconConfig.json'), 'utf-8');
      if (iconConfigFile) {
        const iconConfig = JSON.parse(iconConfigFile);
        iconConfig.forEach((info: iconConfig) => {
          this.iconConfigList.push({
            rootPath: uri,
            ...info
          });
        });
      }
    });
  }
  /**
   * 绘制html
   */
  private getWebviewContent(icon: any) {
    return `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>图标列表</title>
						<style>
						  body {
								background-color: #fff;
						  }
							img {
								width: 30px;
								height: 30px;
							}
							.icon-content {
								width: 50px;
								margin: 20px;
								display: inline-flex;
								align-items: center;
								flex-direction: column;
								cursor: pointer;
							}
							.icon-name {
								margin-top: 10px;
								color: black;
							}
							.icon-content:hover .icon-name{
								color: #2468f2;
							}
							#toast {
								position: fixed;
								top: -40px;
								left: 50%;
								background: #fff;
								color: #000;
								padding: 5px 20px;
								box-shadow: 0 3px 10px 0px #cecece;
								transform: translateX(-50%);
								border-radius: 5px;
								transition: all .5s;
								display: flex;
    						align-items: center;
							}
							#toast svg {
								width: 16px;
								height: 16px;
								margin-right: 8px;
							}
						</style>
        </head>
        <body>
					<div id="toast">
						<svg viewBox="0 0 16 16"  version="1.1" xmlns="http://www.w3.org/2000/svg" >
							<path d="M8,14.5 C11.5898509,14.5 14.5,11.5898509 14.5,8 C14.5,4.41014913 11.5898509,1.5 8,1.5 C4.41014913,1.5 1.5,4.41014913 1.5,8 C1.5,11.5898509 4.41014913,14.5 8,14.5 Z" stroke="none" fill="#30bf13"></path>
							<polyline stroke="#FFFFFF" transform="translate(8.006071, 7.006071) rotate(45.000000) translate(-8.006071, -7.006071) " points="9.75607112 3.79773779 9.75607112 10.2144045 6.25607112 10.2144045" stroke-width="1" fill="none" stroke-linecap="butt" stroke-linejoin="round"></polyline>
						</svg>
						<span>复制成功</span>
					</div>
					<div id="root">
					${icon
            .map(
              (item: any) =>
                `<div class="icon-content" icon-name="${item.name}">
									<img src="vscode-resource:${item.aPath}" icon-name="${item.name}">
									<div class="icon-name" icon-name="${item.name}">${item.name}</div>
								</div>`
            )
            .join('')}
					</div>
          <script>
							document.getElementById('root').addEventListener('click', (e) => {
								const target = e.target;
								const name = target.getAttribute("icon-name")
								if (name) {
									const text = \`<Icon icon="\${name}" className="icon" />\`
									const toast = document.getElementById('toast');
									toast.style = "top: 40px";
									setTimeout(() => {
										toast.style = "top: -40px";
									}, 2000);
									navigator.clipboard.writeText(text);
								}
							})
					</script>
        </body>
      </html>
    `;
  }
}

export function activate(context: vscode.ExtensionContext) {
  const provider = new ColorsViewProvider();
  context.subscriptions.push(vscode.window.registerWebviewViewProvider('svgIconList', provider));
  // 文件改变重新渲染图标列表
  vscode.window.onDidChangeActiveTextEditor(() => {
    provider.render();
  });
}
