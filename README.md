# 旅游地图项目

## 简介

这是一个交互式的中国旅游地图项目，展示了您曾经到访过的城市、拍摄的照片以及旅行路线。通过本项目，您可以：

- 在地图上查看已访问的城市和旅行路线。
- 点击城市标记，查看相关的照片和描述信息。
- 使用搜索功能快速查找特定城市。
- 体验动态的飞线效果，展示城市之间的旅行路线。

## 功能特性

- **交互式地图**：使用 ECharts 提供的中国地图，直观展示城市位置。
- **标记点**：在地图上标记已访问和未访问的城市，区别显示。
- **照片展示**：点击城市标记，展示该城市的照片和描述信息。
- **飞线效果**：动态展示城市之间的旅行路线，使地图更具活力。
- **搜索功能**：输入城市名称，快速定位并查看相关信息。
- **响应式设计**：适配不同尺寸的屏幕，提供良好的用户体验。

## 项目结构

```bash
your-project/
├── index.html
├── style.css
├── main.js
├── data/
│   ├── photos.json
│   └── routes.json
└── images/
    ├── nanjing/
    │   ├── photo1.jpg
    │   └── photo2.jpg
    ├── shanghai/
    │   ├── photo1.jpg
    │   └── photo2.jpg
    ├── suzhou/
    │   ├── photo1.jpg
    │   └── photo2.jpg
    └── hongkong/
        ├── photo1.jpg
        └── photo2.jpg
```


## 技术栈

- **HTML5**：构建网页结构。
- **CSS3**：样式设计，包含响应式布局。
- **JavaScript (ES6)**：实现交互功能。
- **ECharts**：用于绘制交互式地图和飞线效果。
- **Lightbox2**：用于图片展示的库。
- **jQuery**：辅助 DOM 操作和事件处理。

## 安装与运行

### 前置条件

- **Node.js 和 npm**（可选）：用于搭建本地服务器。
- **Python**（可选）：使用内置的 SimpleHTTPServer 快速启动服务器。
- **VSCode 的 Live Server 插件**（可选）：快速启动本地服务器。

### 下载项目

1. 克隆或下载本项目的源码到本地。

   ```bash
   git clone git@github.com:handcomechan-1997/TravelMap.git
   ```
2. 进入项目目录。

   ```bash
   cd TravelMap
   ```
### 启动本地服务器
由于浏览器的安全策略，需要通过本地服务器来运行项目。

#### 方法一：使用 Python 内置服务器
##### Python 3
```bash
Copy code
python3 -m http.server 8000
```
##### Python 2
```bash
Copy code
python -m SimpleHTTPServer 8000
```
#### 方法二：使用 Node.js 的 http-server
全局安装 http-server：

```bash
Copy code
npm install -g http-server
```
在项目目录下启动服务器：

```bash
Copy code
http-server -p 8000
```
#### 方法三：使用 VSCode 的 Live Server 插件
在 VSCode 中打开项目目录。
右键点击 index.html，选择 “Open with Live Server”。
访问项目
在浏览器中输入以下地址访问项目：

```bash
http://localhost:8000
```
注意：端口号根据您启动服务器时指定的端口而定。

使用说明
地图交互
缩放与拖拽：使用鼠标滚轮进行缩放，拖拽地图查看不同区域。
标记点交互：
鼠标悬停：在标记点上悬停，显示城市名称和照片预览。
点击标记点：查看该城市的照片和描述信息，照片会在页面底部展示。
飞线效果：地图上动态展示城市之间的旅行路线。
搜索功能
在顶部的搜索栏中输入城市名称，点击 “搜索” 按钮或按下回车键。
如果找到匹配的城市，地图会自动定位并显示相关信息。
自定义与扩展
添加新的城市和照片
在 geoCoordMap 中添加城市坐标：

```javascript
var geoCoordMap = {
  // 已有城市
  '新城市': [经度, 纬度],
  // ...
};
```
在 allCities 中添加城市信息：

```javascript
var allCities = [
  { name: '新城市', hasPhoto: true },
  // ...
];
```
在 data/photos.json 中添加城市的照片信息：

```json
{
  "location": "新城市",
  "altNames": ["新城市", "New City"],
  "description": "这是我在 新城市 拍摄的照片。",
  "urls": [
    "images/newcity/photo1.jpg",
    "images/newcity/photo2.jpg"
  ]
}
```
将照片添加到 images 目录：

```markdown
images/
└── newcity/
    ├── photo1.jpg
    └── photo2.jpg
```
添加新的旅行路线
在 data/routes.json 中添加新的路线：

```json
{ "from": "起点城市", "to": "终点城市", "value": 1 }
```
## 依赖库
- ECharts
- Lightbox2
- jQuery
## 许可协议
MIT License

## 致谢
感谢ChatGPT，这个项目和README都是它生成的
