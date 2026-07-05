/** 2D 向量 */
export interface Vec2 {
  x: number;
  y: number;
}

/** 2x2 矩阵，按行存储 */
export interface Mat2x2 {
  a: number; // 第一行第一列
  b: number; // 第一行第二列
  c: number; // 第二行第一列
  d: number; // 第二行第二列
}

/** 应用支持的交互模式 */
export type Mode =
  | 'vector'
  | 'add'
  | 'subtract'
  | 'scale'
  | 'dot'
  | 'basis'
  | 'matrix'
  | 'eigen'
  | 'determinant';

/** 每种模式的中文名称 */
export const modeLabels: Record<Mode, string> = {
  vector: '向量探索',
  add: '向量加法',
  subtract: '向量减法',
  scale: '标量乘法',
  dot: '点积',
  basis: '基变换',
  matrix: '矩阵变换',
  eigen: '特征向量',
  determinant: '行列式',
};

/** 每种模式的详细说明 */
export const modeDescriptions: Record<Mode, string> = {
  vector:
    '向量是具有大小和方向的量。在二维空间中，向量 v = (x, y) 表示从原点出发到点 (x, y) 的有向线段。',
  add:
    '向量加法满足平行四边形法则：a + b = (a₁+b₁, a₂+b₂)。将两个向量首尾相连，从第一个起点到第二个终点的向量即为和。',
  subtract:
    '向量减法 a - b 等价于 a + (-b)。浅色箭头表示 -b（即 b 反向），从 a 终点出发的 -b 指向 a - b，构成平行四边形。',
  scale:
    '标量乘法 k·a 将向量的每个分量乘以 k。k > 1 时向量伸长，0 < k < 1 时缩短，k < 0 时反向。',
  dot:
    '点积 a·b = |a||b|cosθ，反映两个向量方向的相似程度。结果为 0 时两向量垂直。',
  basis:
    '矩阵的列向量就是变换后的基向量。观察 î = (1,0) 和 ĵ = (0,1) 如何被矩阵改变。',
  matrix:
    '矩阵 M 作用于向量 v 得到 Mv = x·(M·î) + y·(M·ĵ)。红色为 M·î = (a, c)，绿色为 M·ĵ = (b, d)，分别为矩阵的两列。紫色虚线表示沿变换后基向量的线性组合路径。',
  eigen:
    '特征向量 v 满足 Mv = λv，即经过变换后方向不变（或反向），仅缩放 λ 倍。',
  determinant:
    '行列式的绝对值表示变换后单位面积被缩放的比例。正负号表示是否改变了定向（翻转）。',
};
