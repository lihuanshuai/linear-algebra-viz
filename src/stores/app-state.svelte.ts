import type { Vec2, Mat2x2, Mode } from '../lib/types';
import * as V from '../lib/vector';
import * as M from '../lib/matrix';

/** 应用全局状态 */
function createAppState() {
  // ── 可写状态 ──────────────────────────────────────────
  // 使用 let 声明以允许直接重新赋值
  let mode = $state<Mode>('vector');
  let scalar = $state<number>(2);

  let vecA = $state<Vec2>({ x: 3, y: 2 });
  let vecB = $state<Vec2>({ x: 1, y: 3 });

  let matrix = $state<Mat2x2>({ a: 1, b: 1, c: -1, d: 2 });

  // ── 派生状态（只读） ──────────────────────────────────
  let magA = $derived(V.magnitude(vecA));
  let magB = $derived(V.magnitude(vecB));
  let angleAB = $derived(V.angle(vecA, vecB));
  let dotAB = $derived(V.dot(vecA, vecB));
  let scaledVec = $derived(V.scale(vecA, scalar));
  let sumVec = $derived(V.add(vecA, vecB));
  let diffVec = $derived(V.sub(vecA, vecB));
  let negB = $derived(V.scale(vecB, -1));
  let matVec = $derived(M.apply(matrix, vecA));
  let det = $derived(M.determinant(matrix));
  let invMat = $derived(M.inverse(matrix));
  let eigenVals = $derived(M.eigenvalues(matrix));

  // ── 操作函数 ──────────────────────────────────────────
  function setMode(newMode: Mode) {
    mode = newMode;
  }

  function setVecA(v: Vec2) {
    vecA = { ...v };
  }

  function setVecB(v: Vec2) {
    vecB = { ...v };
  }

  function setScalar(k: number) {
    scalar = k;
  }

  function setMatrix(m: Mat2x2) {
    matrix = { ...m };
  }

  function resetVectors() {
    vecA = { x: 3, y: 2 };
    vecB = { x: 1, y: 3 };
  }

  function resetMatrix() {
    matrix = { a: 1, b: 1, c: -1, d: 2 };
    scalar = 2;
  }

  // ── 根据模式返回需要绘制的向量列表 ────────────────────

  type DrawableVector = { v: Vec2; color: string; label: string; dashed?: boolean };

  function getDrawableVectors(): DrawableVector[] {
    switch (mode) {
      case 'vector':
        return [
          { v: vecA, color: '#4fc3f7', label: 'a' },
        ];
      case 'add':
        return [
          { v: vecA, color: '#4fc3f7', label: 'a' },
          { v: vecB, color: '#ffb74d', label: 'b' },
          { v: sumVec, color: '#ce93d8', label: 'a+b' },
        ];
      case 'subtract':
        return [
          { v: vecA, color: '#4fc3f7', label: 'a' },
          { v: vecB, color: '#ffb74d', label: 'b' },
          { v: negB, color: '#ffb74d', label: '-b', dashed: true },
          { v: diffVec, color: '#ce93d8', label: 'a-b' },
        ];
      case 'scale':
        return [
          { v: vecA, color: '#4fc3f7', label: 'a' },
          { v: scaledVec, color: '#ce93d8', label: `${scalar.toFixed(1)}·a` },
        ];
      case 'dot':
        return [
          { v: vecA, color: '#4fc3f7', label: 'a' },
          { v: vecB, color: '#ffb74d', label: 'b' },
        ];
      case 'matrix':
        return [
          { v: vecA, color: '#4fc3f7', label: 'v' },
          { v: matVec, color: '#ce93d8', label: 'M·v' },
        ];
      case 'basis':
        return [
          { v: { x: matrix.a, y: matrix.c }, color: '#ef5350', label: "M·î" },
          { v: { x: matrix.b, y: matrix.d }, color: '#66bb6a', label: "M·ĵ" },
        ];
      case 'eigen':
        return [
          { v: vecA, color: '#4fc3f7', label: 'v' },
          { v: matVec, color: '#ce93d8', label: 'M·v' },
        ];
      case 'determinant':
        return [];
      default:
        return [];
    }
  }

  function getDraggableIndices(): number[] {
    switch (mode) {
      case 'vector':
      case 'scale':
      case 'dot':
      case 'matrix':
      case 'eigen':
        return [0];
      case 'add':
      case 'subtract':
        return [0, 1];
      default:
        return [];
    }
  }

  return {
    get mode() { return mode; },
    get vecA() { return vecA; },
    get vecB() { return vecB; },
    get scalar() { return scalar; },
    get matrix() { return matrix; },
    get magA() { return magA; },
    get magB() { return magB; },
    get angleAB() { return angleAB; },
    get dotAB() { return dotAB; },
    get scaledVec() { return scaledVec; },
    get sumVec() { return sumVec; },
    get diffVec() { return diffVec; },
    get negB() { return negB; },
    get matVec() { return matVec; },
    get det() { return det; },
    get invMat() { return invMat; },
    get eigenVals() { return eigenVals; },
    setMode,
    setVecA,
    setVecB,
    setScalar,
    setMatrix,
    resetVectors,
    resetMatrix,
    getDrawableVectors,
    getDraggableIndices,
  };
}

export const appState = createAppState();
