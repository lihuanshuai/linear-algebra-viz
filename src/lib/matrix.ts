import type { Vec2, Mat2x2 } from './types';

/** 单位矩阵 */
export function identity(): Mat2x2 {
  return { a: 1, b: 0, c: 0, d: 1 };
}

/** 矩阵 × 向量 */
export function apply(m: Mat2x2, v: Vec2): Vec2 {
  return {
    x: m.a * v.x + m.b * v.y,
    y: m.c * v.x + m.d * v.y,
  };
}

/** 矩阵 × 矩阵 */
export function multiply(a: Mat2x2, b: Mat2x2): Mat2x2 {
  return {
    a: a.a * b.a + a.b * b.c,
    b: a.a * b.b + a.b * b.d,
    c: a.c * b.a + a.d * b.c,
    d: a.c * b.b + a.d * b.d,
  };
}

/** 行列式 */
export function determinant(m: Mat2x2): number {
  return m.a * m.d - m.b * m.c;
}

/** 逆矩阵（若不可逆返回 null） */
export function inverse(m: Mat2x2): Mat2x2 | null {
  const det = determinant(m);
  if (Math.abs(det) < 1e-10) return null;
  return {
    a: m.d / det,
    b: -m.b / det,
    c: -m.c / det,
    d: m.a / det,
  };
}

/** 特征值（仅实特征值，若不存在返回 null） */
export function eigenvalues(m: Mat2x2): [number, number] | null {
  const tr = m.a + m.d;
  const det = determinant(m);
  const d = tr * tr - 4 * det;
  if (d < 0) return null;
  const sqrtD = Math.sqrt(d);
  return [(tr + sqrtD) / 2, (tr - sqrtD) / 2];
}

/** 特征向量（对应于给定特征值，若为零向量返回 null） */
export function eigenvector(m: Mat2x2, lambda: number): Vec2 | null {
  const v: Vec2 = { x: m.b, y: lambda - m.a };
  if (Math.abs(v.x) < 1e-10 && Math.abs(v.y) < 1e-10) {
    const v2: Vec2 = { x: lambda - m.d, y: m.c };
    if (Math.abs(v2.x) < 1e-10 && Math.abs(v2.y) < 1e-10) return null;
    return v2;
  }
  return v;
}
