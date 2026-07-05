# linear-algebra-viz

交互式线性代数可视化工具，帮助理解向量、矩阵等抽象概念。

## 使用方式

```bash
npm install
npm run dev     # 开发服务器
npm run build   # 构建生产版本
npm run preview # 预览生产版本
npm run check   # 类型检查
```

## 技术栈

- **构建**: Vite 6
- **框架**: Svelte 5（runes: `$state`, `$derived`, `$effect`）
- **语言**: TypeScript（严格模式）
- **绘图**: Canvas 2D API
- **样式**: 纯 CSS（暗色主题）

## 功能一览

| 模式 | 说明 |
|------|------|
| 向量探索 | 展示单个向量的几何表示、分量、模长 |
| 向量加法 | 平行四边形法则可视化 |
| 向量减法 | 向量差与几何意义 |
| 标量乘法 | 缩放向量长度与方向反转 |
| 点积 | 投影线、夹角与数值结果 |
| 矩阵变换 | 2×2 矩阵作用于向量 |
| 基变换 | 矩阵列作为变换后的基向量 |
| 特征向量 | 特征方向与特征值 |
| 行列式 | 单位面积变换后的面积变化 |

## 项目结构

```
src/
├── main.ts                  # 入口
├── App.svelte               # 根组件（左画布 + 右面板）
├── app.css                  # 全局样式与 CSS 变量
├── lib/
│   ├── types.ts             # Vec2、Mat2x2、Mode 等类型定义
│   ├── vector.ts            # 向量运算（加、减、点积、投影等）
│   ├── matrix.ts            # 矩阵运算（乘法、行列式、特征值等）
│   └── renderer.ts          # Canvas 绘制原语（网格、轴、箭头等）
├── stores/
│   └── app-state.svelte.ts  # Svelte 5 runes 全局状态
└── components/
    ├── Canvas.svelte        # 画布（绘制 + 拖拽交互）
    ├── ControlPanel.svelte  # 右侧面板容器
    ├── ModeSelector.svelte  # 模式切换按钮组
    ├── VectorEditor.svelte  # 向量分量滑块与数值输入
    ├── MatrixEditor.svelte  # 2×2 矩阵与标量输入
    └── ExplanationPanel.svelte # 数学原理解释与数值详情
```

## 交互方式

- 在画布上**拖拽**向量箭头直接修改（向量/加法/减法/点积/矩阵/特征模式）
- 右侧面板使用**滑块**或**数值输入框**精确控制
- 点击**模式按钮**在不同概念间切换
- 右下角**说明面板**展示当前模式的数学公式与实时数值

## 颜色约定

| 元素 | 颜色 |
|------|------|
| 向量 a / v | 蓝色 `#4fc3f7` |
| 向量 b | 橙色 `#ffb74d` |
| 结果/变换后 | 紫色 `#ce93d8` |
| 基向量 î | 红色 `#ef5350` |
| 基向量 ĵ | 绿色 `#66bb6a` |
