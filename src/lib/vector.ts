import type { Vec2 } from './types';

/** 零向量 */
export function zero(): Vec2 {
  return { x: 0, y: 0 };
}

/** 向量加法 */
export function add(a: Vec2, b: Vec2): Vec2 {
  return { x: a.x + b.x, y: a.y + b.y };
}

/** 向量减法 */
export function sub(a: Vec2, b: Vec2): Vec2 {
  return { x: a.x - b.x, y: a.y - b.y };
}

/** 标量乘法 */
export function scale(v: Vec2, k: number): Vec2 {
  return { x: v.x * k, y: v.y * k };
}

/** 点积 */
export function dot(a: Vec2, b: Vec2): number {
  return a.x * b.x + a.y * b.y;
}

/** 模长 */
export function magnitude(v: Vec2): number {
  return Math.sqrt(v.x * v.x + v.y * v.y);
}

/** 单位向量 */
export function normalize(v: Vec2): Vec2 {
  const m = magnitude(v);
  return m === 0 ? zero() : scale(v, 1 / m);
}

/** 向量夹角（弧度） */
export function angle(a: Vec2, b: Vec2): number {
  const m = magnitude(a) * magnitude(b);
  if (m === 0) return 0;
  return Math.acos(Math.max(-1, Math.min(1, dot(a, b) / m)));
}

/** 向量在另一个向量上的投影（标量） */
export function scalarProjection(a: Vec2, b: Vec2): number {
  const m = magnitude(b);
  return m === 0 ? 0 : dot(a, b) / m;
}

/** 向量在另一个向量上的投影（向量） */
export function vectorProjection(a: Vec2, b: Vec2): Vec2 {
  const m2 = dot(b, b);
  return m2 === 0 ? zero() : scale(b, dot(a, b) / m2);
}
