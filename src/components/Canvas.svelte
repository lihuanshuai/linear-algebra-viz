<script lang="ts">
  import { onMount } from 'svelte';
  import { appState } from '../stores/app-state.svelte';
  import * as R from '../lib/renderer';
  import * as V from '../lib/vector';
  import { apply } from '../lib/matrix';
  import type { Vec2 } from '../lib/types';

  let canvas: HTMLCanvasElement;
  let ctx = $state<CanvasRenderingContext2D | null>(null);

  let width = $state(0);
  let height = $state(0);

  let dragging = $state(false);
  let dragIndex = $state(-1);

  /** 是否显示向量分量辅助线（点击向量切换） */
  let showComponents = $state(false);

  function computeViewport(w: number, h: number): R.Viewport {
    const scale = Math.min(w, h) / 16;
    return { originX: w / 2, originY: h / 2, scale };
  }

  function render() {
    if (!ctx) return;
    const vp = computeViewport(width, height);

    R.clear(ctx, width, height);
    R.drawGrid(ctx, vp, width, height);
    R.drawAxes(ctx, vp, width, height);

    const mode = appState.mode;

    switch (mode) {
      case 'dot': {
        R.drawProjection(ctx, appState.vecA, appState.vecB, vp);
        R.drawAngle(ctx, appState.vecA, appState.vecB, vp, 'rgba(255,255,255,0.3)');
        break;
      }
      case 'matrix': {
        const m = appState.matrix;
        const v = appState.vecA;
        // 原始基向量（淡色虚线）
        R.drawDashedVector(ctx, { x: 1, y: 0 }, vp, 'rgba(239, 83, 80, 0.25)', 'î');
        R.drawDashedVector(ctx, { x: 0, y: 1 }, vp, 'rgba(102, 187, 106, 0.25)', 'ĵ');
        // 变换后基向量 M·î、M·ĵ = 矩阵列
        R.drawVector(ctx, { x: m.a, y: m.c }, vp, '#ef5350', "M·î");
        R.drawVector(ctx, { x: m.b, y: m.d }, vp, '#66bb6a', "M·ĵ");
        // 线性组合路径：沿 M·î 方向走 x 步 → 沿 M·ĵ 方向走 y 步
        const step1: Vec2 = { x: m.a * v.x, y: m.c * v.x };
        const step2: Vec2 = { x: m.b * v.y, y: m.d * v.y };
        R.drawVectorFrom(ctx, step1, step2, vp, 'rgba(206, 147, 216, 0.3)', '');
        R.drawVectorFrom(ctx, step2, step1, vp, 'rgba(206, 147, 216, 0.3)', '');
        break;
      }
      case 'basis': {
        R.drawBasisVectors(ctx, appState.matrix, vp);
        break;
      }
      case 'eigen': {
        const ev = appState.eigenVals;
        if (ev) {
          const ev1 = V.normalize({ x: appState.matrix.b, y: ev[0] - appState.matrix.a });
          const ev2 = V.normalize({ x: appState.matrix.b, y: ev[1] - appState.matrix.a });
          R.drawEigenLine(ctx, ev1, vp, ev[0]);
          if (ev[0] !== ev[1]) {
            R.drawEigenLine(ctx, ev2, vp, ev[1]);
          }
        }
        break;
      }
      case 'determinant': {
        R.drawUnitSquare(ctx, appState.matrix, vp);
        break;
      }
    }

    // 点击向量后显示分量辅助线
    if (showComponents) {
      for (const d of appState.getDrawableVectors()) {
        R.drawComponents(ctx, d.v, vp, d.color);
      }
    }

    // 减法模式：绘制从 a 终点出发的 -b（平行四边形法则）
    if (mode === 'subtract') {
      const neg = appState.negB;
      R.drawVectorFrom(ctx, appState.vecA, neg, vp, 'rgba(255, 183, 77, 0.35)', '');
    }

    const drawables = appState.getDrawableVectors();
    for (const d of drawables) {
      if (d.dashed) {
        R.drawDashedVector(ctx, d.v, vp, d.color, d.label);
      } else {
        R.drawVector(ctx, d.v, vp, d.color, d.label);
      }
    }
  }

  let prevMode = $state(appState.mode);

  $effect(() => {
    // 模式切换时重置分量显示
    if (prevMode !== appState.mode) {
      showComponents = false;
      prevMode = appState.mode;
    }
  });

  $effect(() => {
    if (ctx && width > 0 && height > 0) {
      const mode = appState.mode;
      const a = appState.vecA;
      const b = appState.vecB;
      const n = appState.negB;
      const s = appState.scalar;
      const m = appState.matrix;
      if (mode && a && b && m) { /* 建立追踪 */ }
      if (n !== undefined) { /* 建立追踪 */ }
      if (s !== undefined) { /* 建立追踪 */ }
      if (showComponents) { /* 建立追踪 */ }
      render();
    }
  });

  onMount(() => {
    ctx = canvas.getContext('2d')!;

    const parent = canvas.parentElement!;
    const rect = parent.getBoundingClientRect();
    width = Math.floor(rect.width);
    height = Math.floor(rect.height);

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        width = Math.floor(entry.contentRect.width);
        height = Math.floor(entry.contentRect.height);
      }
    });
    resizeObserver.observe(parent);
    return () => resizeObserver.disconnect();
  });

  function getMouseWorld(e: MouseEvent) {
    const rect = canvas.getBoundingClientRect();
    const px = e.clientX - rect.left;
    const py = e.clientY - rect.top;
    const vp = computeViewport(width, height);
    return R.pixelToWorld({ x: px, y: py }, vp);
  }

  function onMouseDown(e: MouseEvent) {
    const world = getMouseWorld(e);
    const drawables = appState.getDrawableVectors();
    const indices = appState.getDraggableIndices();

    // 先检测是否点击到可拖拽向量 → 开始拖拽
    for (const i of indices) {
      const d = drawables[i];
      if (d && R.hitTest(d.v, world)) {
        dragging = true;
        dragIndex = i;
        return;
      }
    }

    // 检测是否点击到任意向量 → 切换分量显示
    for (let i = 0; i < drawables.length; i++) {
      const d = drawables[i];
      if (d && !d.dashed && R.hitTest(d.v, world)) {
        showComponents = !showComponents;
        return;
      }
    }

    // 点击空白区域 → 隐藏分量
    showComponents = false;
  }

  function onMouseMove(e: MouseEvent) {
    if (!dragging || dragIndex < 0) return;
    const world = getMouseWorld(e);
    const clamped = {
      x: Math.max(-8, Math.min(8, world.x)),
      y: Math.max(-8, Math.min(8, world.y)),
    };
    if (dragIndex === 0) {
      appState.setVecA(clamped);
    } else if (dragIndex === 1) {
      appState.setVecB(clamped);
    }
  }

  function onMouseUp() {
    dragging = false;
    dragIndex = -1;
  }
</script>

<canvas
  bind:this={canvas}
  width={width}
  height={height}
  aria-label="2D 坐标平面，展示线性代数概念"
  style="display: block; width: 100%; height: 100%; cursor: {dragging ? 'grabbing' : 'grab'};"
  onmousedown={onMouseDown}
  onmousemove={onMouseMove}
  onmouseup={onMouseUp}
  onmouseleave={onMouseUp}
></canvas>
