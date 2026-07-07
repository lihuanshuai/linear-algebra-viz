import type { Vec2, Mat2x2 } from './types';
import { apply } from './matrix';

/** 视图参数：控制坐标系到像素的映射 */
export interface Viewport {
  originX: number;
  originY: number;
  scale: number;
}

/** 绘制样式的命名颜色 */
const COLORS = {
  grid: '#2a2a4a',
  axis: '#555',
  axisLabel: '#888',
  vecA: '#4fc3f7',
  vecB: '#ffb74d',
  vecR: '#ce93d8',
  vecI: '#ef5350',
  vecJ: '#66bb6a',
  projection: 'rgba(255,255,255,0.2)',
  angle: 'rgba(255,255,255,0.3)',
  selection: 'rgba(79, 195, 247, 0.3)',
  unitSquare: 'rgba(206, 147, 216, 0.3)',
  unitSquareBorder: '#ce93d8',
};

// ── 坐标变换 ──────────────────────────────────────────

/** 世界坐标 → 像素坐标 */
export function worldToPixel(world: Vec2, vp: Viewport): Vec2 {
  return {
    x: vp.originX + world.x * vp.scale,
    y: vp.originY - world.y * vp.scale,
  };
}

/** 像素坐标 → 世界坐标 */
export function pixelToWorld(pixel: Vec2, vp: Viewport): Vec2 {
  return {
    x: (pixel.x - vp.originX) / vp.scale,
    y: (vp.originY - pixel.y) / vp.scale,
  };
}

// ── 绘制原语 ──────────────────────────────────────────

/** 清除画布 */
export function clear(ctx: CanvasRenderingContext2D, width: number, height: number): void {
  ctx.fillStyle = '#1a1a2e';
  ctx.fillRect(0, 0, width, height);
}

/** 绘制网格 */
export function drawGrid(ctx: CanvasRenderingContext2D, vp: Viewport, width: number, height: number): void {
  const gridStep = 1;
  const pixelStep = gridStep * vp.scale;
  const startX = Math.floor(-vp.originX / pixelStep) * pixelStep + vp.originX;
  const startY = Math.floor(-vp.originY / pixelStep) * pixelStep + vp.originY;

  ctx.strokeStyle = COLORS.grid;
  ctx.lineWidth = 1;

  for (let x = startX; x < width; x += pixelStep) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, height);
    ctx.stroke();
  }
  for (let y = startY; y < height; y += pixelStep) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(width, y);
    ctx.stroke();
  }
}

/** 绘制变换后的网格线 */
export function drawTransformedGrid(
  ctx: CanvasRenderingContext2D,
  m: Mat2x2,
  vp: Viewport,
  color: string,
): void {
  const range = 8;
  ctx.strokeStyle = color;
  ctx.lineWidth = 1;

  for (let x = -range; x <= range; x++) {
    const p1 = apply(m, { x, y: -range });
    const p2 = apply(m, { x, y: range });
    const px1 = worldToPixel(p1, vp);
    const px2 = worldToPixel(p2, vp);
    ctx.beginPath();
    ctx.moveTo(px1.x, px1.y);
    ctx.lineTo(px2.x, px2.y);
    ctx.stroke();
  }
  for (let y = -range; y <= range; y++) {
    const p1 = apply(m, { x: -range, y });
    const p2 = apply(m, { x: range, y });
    const px1 = worldToPixel(p1, vp);
    const px2 = worldToPixel(p2, vp);
    ctx.beginPath();
    ctx.moveTo(px1.x, px1.y);
    ctx.lineTo(px2.x, px2.y);
    ctx.stroke();
  }
}

/** 绘制坐标轴 */
export function drawAxes(ctx: CanvasRenderingContext2D, vp: Viewport, width: number, height: number): void {
  const origin = worldToPixel({ x: 0, y: 0 }, vp);

  ctx.strokeStyle = COLORS.axis;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(0, origin.y);
  ctx.lineTo(width, origin.y);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(origin.x, 0);
  ctx.lineTo(origin.x, height);
  ctx.stroke();

  // 轴标签
  ctx.fillStyle = COLORS.axisLabel;
  ctx.font = '14px sans-serif';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'top';
  ctx.fillText('x', width - 20, origin.y + 6);
  ctx.textAlign = 'right';
  ctx.textBaseline = 'bottom';
  ctx.fillText('y', origin.x - 6, 10);

  // 原点标签
  ctx.textAlign = 'right';
  ctx.textBaseline = 'top';
  ctx.fillStyle = COLORS.axisLabel;
  ctx.font = '12px sans-serif';
  ctx.fillText('O', origin.x - 6, origin.y + 4);

  // 刻度标记
  ctx.font = '10px sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'top';
  const step = 1;
  const pixelStep = step * vp.scale;
  for (let v = -8; v <= 8; v++) {
    if (v === 0) continue;
    const px = worldToPixel({ x: v, y: 0 }, vp);
    ctx.fillStyle = COLORS.axisLabel;
    ctx.fillText(String(v), px.x, origin.y + 4);
    const py = worldToPixel({ x: 0, y: v }, vp);
    ctx.textAlign = 'right';
    ctx.textBaseline = 'middle';
    ctx.fillText(String(v), origin.x - 4, py.y);
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
  }
}

/** 在指定位置绘制带暗色背景的文字标签 */
function drawLabel(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  color: string,
): void {
  if (!text) return;
  ctx.font = 'bold 14px sans-serif';
  const metrics = ctx.measureText(text);
  const pad = 4;
  const bw = metrics.width + pad * 2;
  const bh = 20;
  ctx.fillStyle = 'rgba(26, 26, 46, 0.85)';
  ctx.fillRect(x - bw / 2, y - bh / 2, bw, bh);
  ctx.strokeStyle = color;
  ctx.lineWidth = 1;
  ctx.strokeRect(x - bw / 2, y - bh / 2, bw, bh);
  ctx.fillStyle = color;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(text, x, y);
}

/** 从指定位置到该位置+v 绘制箭头 */
function drawArrow(
  ctx: CanvasRenderingContext2D,
  fromWorld: Vec2,
  toWorld: Vec2,
  vp: Viewport,
  color: string,
  label: string,
): void {
  const from = worldToPixel(fromWorld, vp);
  const to = worldToPixel(toWorld, vp);

  ctx.strokeStyle = color;
  ctx.fillStyle = color;
  ctx.lineWidth = 3;
  ctx.lineCap = 'round';

  ctx.beginPath();
  ctx.moveTo(from.x, from.y);
  ctx.lineTo(to.x, to.y);
  ctx.stroke();

  const angle = Math.atan2(from.y - to.y, from.x - to.x);
  const arrowSize = 12;
  ctx.beginPath();
  ctx.moveTo(to.x, to.y);
  ctx.lineTo(
    to.x + arrowSize * Math.cos(angle + 0.4),
    to.y + arrowSize * Math.sin(angle + 0.4),
  );
  ctx.lineTo(
    to.x + arrowSize * Math.cos(angle - 0.4),
    to.y + arrowSize * Math.sin(angle - 0.4),
  );
  ctx.closePath();
  ctx.fill();

  const midX = (from.x + to.x) / 2;
  const midY = (from.y + to.y) / 2;
  const offset = 24;
  const perpAngle = Math.atan2(to.y - from.y, to.x - from.x) + Math.PI / 2;
  drawLabel(ctx, label, midX + offset * Math.cos(perpAngle), midY + offset * Math.sin(perpAngle), color);
}

/** 从原点绘制向量 */
export function drawVector(
  ctx: CanvasRenderingContext2D,
  v: Vec2,
  vp: Viewport,
  color: string,
  label: string,
): void {
  if (Math.abs(v.x) < 1e-10 && Math.abs(v.y) < 1e-10) return;
  drawArrow(ctx, { x: 0, y: 0 }, v, vp, color, label);
}

/** 从任意起点绘制向量 */
export function drawVectorFrom(
  ctx: CanvasRenderingContext2D,
  from: Vec2,
  v: Vec2,
  vp: Viewport,
  color: string,
  label: string,
): void {
  if (Math.abs(v.x) < 1e-10 && Math.abs(v.y) < 1e-10) return;
  const to = { x: from.x + v.x, y: from.y + v.y };
  drawArrow(ctx, from, to, vp, color, label);
}

/** 绘制虚线向量（用于负向量表示） */
export function drawDashedVector(
  ctx: CanvasRenderingContext2D,
  v: Vec2,
  vp: Viewport,
  color: string,
  label: string,
): void {
  if (Math.abs(v.x) < 1e-10 && Math.abs(v.y) < 1e-10) return;

  const origin = worldToPixel({ x: 0, y: 0 }, vp);
  const tip = worldToPixel(v, vp);

  ctx.strokeStyle = color;
  ctx.fillStyle = color;
  ctx.lineWidth = 2;
  ctx.setLineDash([6, 4]);
  ctx.lineCap = 'round';

  ctx.beginPath();
  ctx.moveTo(origin.x, origin.y);
  ctx.lineTo(tip.x, tip.y);
  ctx.stroke();
  ctx.setLineDash([]);

  // 标签绘制在虚线向量中点处
  const midX = (origin.x + tip.x) / 2;
  const midY = (origin.y + tip.y) / 2;
  drawLabel(ctx, label, midX, midY, color);
}

/** 绘制向量分量辅助线 */
export function drawComponents(
  ctx: CanvasRenderingContext2D,
  v: Vec2,
  vp: Viewport,
  color: string,
): void {
  const origin = worldToPixel({ x: 0, y: 0 }, vp);
  const tip = worldToPixel(v, vp);
  const right = worldToPixel({ x: v.x, y: 0 }, vp);
  const top = worldToPixel({ x: 0, y: v.y }, vp);

  ctx.strokeStyle = color;
  ctx.lineWidth = 1;
  ctx.setLineDash([4, 4]);
  ctx.beginPath();
  ctx.moveTo(tip.x, tip.y);
  ctx.lineTo(right.x, right.y);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(tip.x, tip.y);
  ctx.lineTo(top.x, top.y);
  ctx.stroke();
  ctx.setLineDash([]);

  // 标注 x 分量
  const mx = (origin.x + right.x) / 2;
  drawLabel(ctx, `x=${v.x.toFixed(1)}`, mx, origin.y + 14, color);

  // 标注 y 分量
  const my = (origin.y + top.y) / 2;
  drawLabel(ctx, `y=${v.y.toFixed(1)}`, origin.x - 16, my, color);
}

/** 绘制点积的投影线 */
export function drawProjection(
  ctx: CanvasRenderingContext2D,
  a: Vec2,
  b: Vec2,
  vp: Viewport,
): void {
  const origin = worldToPixel({ x: 0, y: 0 }, vp);
  const tipA = worldToPixel(a, vp);
  const tipB = worldToPixel(b, vp);

  // 从 a 的终点到 b 所在直线的垂线
  const bNorm = { x: b.x, y: b.y };
  const bMag = Math.sqrt(bNorm.x * bNorm.x + bNorm.y * bNorm.y);
  if (bMag < 1e-10) return;
  bNorm.x /= bMag;
  bNorm.y /= bMag;

  const t = a.x * bNorm.x + a.y * bNorm.y;
  const proj: Vec2 = { x: bNorm.x * t, y: bNorm.y * t };
  const projPixel = worldToPixel(proj, vp);

  ctx.strokeStyle = COLORS.projection;
  ctx.lineWidth = 1;
  ctx.setLineDash([4, 4]);
  ctx.beginPath();
  ctx.moveTo(tipA.x, tipA.y);
  ctx.lineTo(projPixel.x, projPixel.y);
  ctx.stroke();
  ctx.setLineDash([]);

  // 直角标记
  const size = 6;
  ctx.beginPath();
  ctx.moveTo(tipA.x + (projPixel.x - tipA.x) * 0.1 + (tipA.x - projPixel.x) * 0.1, tipA.y + (projPixel.y - tipA.y) * 0.1 + (tipA.y - projPixel.y) * 0.1);
  // simpler: draw a small square
  const dx = projPixel.x - tipA.x;
  const dy = projPixel.y - tipA.y;
  const len = Math.sqrt(dx * dx + dy * dy);
  if (len > 2) {
    const ux = dx / len;
    const uy = dy / len;
    const px = -uy;
    const py = ux;
    ctx.beginPath();
    ctx.moveTo(tipA.x + ux * 8 + px * 8, tipA.y + uy * 8 + py * 8);
    ctx.lineTo(tipA.x + ux * 8, tipA.y + uy * 8);
    ctx.lineTo(tipA.x + ux * 8 - px * 8, tipA.y + uy * 8 - py * 8);
    ctx.stroke();
  }

  // 投影向量
  drawVector(ctx, proj, vp, 'rgba(255,255,255,0.4)', 'proj');
}

/** 绘制夹角弧 */
export function drawAngle(
  ctx: CanvasRenderingContext2D,
  a: Vec2,
  b: Vec2,
  vp: Viewport,
  color: string,
): void {
  const origin = worldToPixel({ x: 0, y: 0 }, vp);
  const angleA = Math.atan2(a.y, a.x);
  const angleB = Math.atan2(b.y, b.x);
  const radius = 30;

  ctx.strokeStyle = color;
  ctx.lineWidth = 2;
  ctx.beginPath();
  if (angleA < angleB) {
    ctx.arc(origin.x, origin.y, radius, angleA, angleB);
  } else {
    ctx.arc(origin.x, origin.y, radius, angleB, angleA);
  }
  ctx.stroke();
}

/** 绘制 1×1 单位正方形（用于行列式可视化） */
export function drawUnitSquare(
  ctx: CanvasRenderingContext2D,
  m: Mat2x2,
  vp: Viewport,
): void {
  const corners: Vec2[] = [
    { x: 0, y: 0 },
    { x: 1, y: 0 },
    { x: 1, y: 1 },
    { x: 0, y: 1 },
  ];

  // 原始正方形
  const pts = corners.map((c) => worldToPixel(c, vp));
  ctx.strokeStyle = COLORS.unitSquareBorder;
  ctx.lineWidth = 1;
  ctx.setLineDash([4, 4]);
  ctx.beginPath();
  ctx.moveTo(pts[0]!.x, pts[0]!.y);
  for (let i = 1; i < pts.length; i++) {
    ctx.lineTo(pts[i]!.x, pts[i]!.y);
  }
  ctx.closePath();
  ctx.stroke();
  ctx.setLineDash([]);

  // 变换后的正方形
  const transCorners = corners.map((c) => apply(m, c));
  const tPts = transCorners.map((c) => worldToPixel(c, vp));
  ctx.fillStyle = COLORS.unitSquare;
  ctx.strokeStyle = COLORS.unitSquareBorder;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(tPts[0]!.x, tPts[0]!.y);
  for (let i = 1; i < tPts.length; i++) {
    ctx.lineTo(tPts[i]!.x, tPts[i]!.y);
  }
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
}

/** 绘制基向量 */
export function drawBasisVectors(
  ctx: CanvasRenderingContext2D,
  m: Mat2x2,
  vp: Viewport,
): void {
  const iHat: Vec2 = { x: m.a, y: m.c };
  const jHat: Vec2 = { x: m.b, y: m.d };
  drawVector(ctx, iHat, vp, COLORS.vecI, 'î\'');
  drawVector(ctx, jHat, vp, COLORS.vecJ, 'ĵ\'');
}

/** 绘制变换后的特征方向 */
export function drawEigenLine(
  ctx: CanvasRenderingContext2D,
  v: Vec2,
  vp: Viewport,
  lambda: number,
): void {
  // 沿特征方向的正负方向画加长的线
  const len = 6;
  const dir = v;
  const mag = Math.sqrt(dir.x * dir.x + dir.y * dir.y);
  if (mag < 1e-10) return;
  const n = { x: dir.x / mag, y: dir.y / mag };
  const p1 = worldToPixel({ x: n.x * len, y: n.y * len }, vp);
  const p2 = worldToPixel({ x: -n.x * len, y: -n.y * len }, vp);

  ctx.strokeStyle = 'rgba(206, 147, 216, 0.4)';
  ctx.lineWidth = 2;
  ctx.setLineDash([6, 6]);
  ctx.beginPath();
  ctx.moveTo(p1.x, p1.y);
  ctx.lineTo(p2.x, p2.y);
  ctx.stroke();
  ctx.setLineDash([]);

  // 标注 λ
  const mid = worldToPixel({ x: n.x * len * 0.7, y: n.y * len * 0.7 }, vp);
  ctx.fillStyle = '#ce93d8';
  ctx.font = '13px sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'bottom';
  ctx.fillText(`λ=${lambda.toFixed(2)}`, mid.x, mid.y - 4);
}

/** 检测鼠标是否靠近向量（用于拖拽命中检测） */
export function hitTest(v: Vec2, mouseWorld: Vec2): boolean {
  const dx = mouseWorld.x - v.x;
  const dy = mouseWorld.y - v.y;
  return Math.sqrt(dx * dx + dy * dy) < 0.4;
}
