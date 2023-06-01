# SVG 图标预览管理插件

## 项目配置

在项目.vscode 目录下新增 iconConfig.json 文件\
配置内容如下:
| 字段 | 类型 | 说明 |
| --- |----| ------|
| name | string | 项目根目录 |
| iconPath | string | 注册图标的文件路径|
| iconDir | string | 图标存储的路径 |

示例：

```json
[
  {
    "name": "packages/amis-ui",
    "iconPath": "packages/amis-ui/src/components/icons.tsx",
    "iconDir": "packages/amis-ui/src/icons"
  },
  {
    "name": "packages/amis-editor",
    "iconPath": "packages/amis-editor/src/icons/index.tsx",
    "iconDir": "packages/amis-editor/src/icons"
  },
  {
    "name": "packages/amis-editor-core",
    "iconPath": "packages/amis-editor-core/src/icons/index.tsx",
    "iconDir": "packages/amis-editor-core/src/icons"
  }
]
```

## 使用说明

### 图标预览

安装完插件和配置完项目后，重启 vscode，点击侧边栏图标\
![image](https://github.com/qkiroc/svg-icon-preview/assets/30946345/b5c1b386-aaa9-4a05-ae5e-5ffbab1750f0)\
或者，在文件下点击图标列表\
![image](https://github.com/qkiroc/svg-icon-preview/assets/30946345/2fd98182-f6fb-4ca0-bf36-938204fad10a)\

编辑不同 package 的文件，图标列表会对应展示该 package 下支持的图标\
如果图标名称为红色，表明该图标存在文件夹中但是没有被项目引用

### 使用图标

点击图标，即可复制该图标相应代码

### 管理图标

右键图标呼出菜单\
![image](https://github.com/qkiroc/svg-icon-preview/assets/30946345/1ff6e86c-3907-4d0a-a03b-87679b1e97c8)


1. 查看文件：查看对应 svg 原文件
2. 删除：删除 svg 原文件和引入，需二次确认

### 其他功能
![image](https://github.com/qkiroc/svg-icon-preview/assets/30946345/b2cd7e97-3775-4140-a5cd-eb50abfe763e)

1. 点击文件图标：打开对应图标列表的图标注册文件
2. 点击刷新图标：重新加载图标列表内容
