# 离子通道数据展示网站

这是一个用于展示离子通道数据和PDB结构的网站，基于GitHub Pages构建。

## 功能特点

- 📊 **数据表格展示**: 显示离子通道的各种参数，包括MPNN分数、pLDDT、ipTM等
- 🔍 **搜索和过滤**: 支持按通道名称搜索和过滤
- 🧬 **3D结构查看**: 使用3Dmol.js交互式查看PDB文件结构
- 📱 **响应式设计**: 适配桌面和移动设备
- 🎨 **现代化界面**: 使用渐变色彩和现代设计风格

## 数据文件

- `mpnn_results.csv`: 包含离子通道的评分数据
- `all_pdb/`: 包含所有PDB结构文件

## 使用方法

1. 在本地打开 `index.html` 文件可以预览网站
2. 将所有文件推送到GitHub仓库
3. 在GitHub仓库设置中启用GitHub Pages
4. 选择主分支作为源文件

## 文件结构

```
ion_channel/
├── index.html          # 主页面
├── styles.css          # 样式文件
├── script.js           # JavaScript功能
├── mpnn_results.csv    # 数据文件
├── all_pdb/           # PDB文件目录
└── README.md          # 说明文档
```

## 技术栈

- HTML5
- CSS3 (Grid, Flexbox)
- JavaScript (ES6+)
- 3Dmol.js (3D分子可视化)
- Papa Parse (CSV解析)
- GitHub Pages (托管)

## 浏览器兼容性

- Chrome 60+
- Firefox 55+
- Safari 12+
- Edge 79+

## 许可证

本项目采用MIT许可证。