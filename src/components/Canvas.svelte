<script lang="ts">
  import { onMount } from 'svelte';
  import { appState } from '../stores/app-state.svelte';
  import * as R from '../lib/renderer';
  import * as V from '../lib/vector';
  import { apply } from '../lib/matrix';
  import type { Vec2, Mat2x2, Mode } from '../lib/types';

  let canvas: HTMLCanvasElement;
  let ctx = $state<CanvasRenderingContext2D | null>(null);
  let width = $state(0);
  let height = $state(0);

  let dragging = $state(false);
  let dragIndex = $state(-1);
  let showComponents = $state(false);

  // ── 动画系统 ──────────────────────────────────────────

  let animProgress = $state(1);
  let animId = 0;

  function easeOut(t: number): number {
    return 1 - Math.pow(1 - t, 3);
  }

  function phaseCount(mode: Mode): number {
    switch (mode) {
      case 'vector':     return 1;
      case 'add':        return 3;
      case 'subtract':   return 4;
      case 'scale':      return 2;
      case 'dot':        return 2;
      case 'basis':      return 2;
      case 'matrix':     return 5;
      case 'eigen':      return 3;
      case 'determinant':return 1;
    }
  }

  function phaseProgress(i: number): number {
    const n = phaseCount(appState.mode);
    const start = i / n;
    const dur = 1 / n;
    return Math.max(0, Math.min(1, (animProgress - start) / dur));
  }

  function phase(i: number): number {
    return easeOut(phaseProgress(i));
  }

  function grow(v: Vec2, p: number): Vec2 {
    return { x: v.x * p, y: v.y * p };
  }

  function startAnimation() {
    animProgress = 0;
    const duration = 50;
    let frame = 0;
    cancelAnimationFrame(animId);
    function tick() {
      frame++;
      animProgress = Math.min(frame / duration, 1);
      if (animProgress < 1) {
        animId = requestAnimationFrame(tick);
      }
    }
    animId = requestAnimationFrame(tick);
  }

  // ── 视口 ──────────────────────────────────────────────

  function computeViewport(w: number, h: number): R.Viewport {
    const scale = Math.min(w, h) / 16;
    return { originX: w / 2, originY: h / 2, scale };
  }

  // ── 渲染 ──────────────────────────────────────────────

  function render() {
    if (!ctx) return;
    const vp = computeViewport(width, height);
    const mode = appState.mode;

    R.clear(ctx, width, height);
    R.drawGrid(ctx, vp, width, height);
    R.drawAxes(ctx, vp, width, height);

    const p = (i: number) => phase(i);

    switch (mode) {

      case 'vector': {
        const pa = p(0);
        const va = grow(appState.vecA, pa);
        if (pa > 0) {
          R.drawComponents(ctx, va, vp, '#4fc3f7');
          R.drawVector(ctx, va, vp, '#4fc3f7', 'a');
        }
        break;
      }

      case 'add': {
        const p1 = p(0), p2 = p(1), p3 = p(2);
        const va = grow(appState.vecA, p1);
        const vb = grow(appState.vecB, p2);
        const vs = grow(appState.sumVec, p3);
        if (p1 > 0) R.drawVector(ctx, va, vp, '#4fc3f7', 'a');
        if (p2 > 0) {
          R.drawVector(ctx, vb, vp, '#ffb74d', 'b');
          R.drawVectorFrom(ctx, va, vb, vp, 'rgba(255, 183, 77, 0.25)', '');
        }
        if (p3 > 0) R.drawVector(ctx, vs, vp, '#ce93d8', 'a+b');
        break;
      }

      case 'subtract': {
        const p1 = p(0), p2 = p(1), p3 = p(2), p4 = p(3);
        const va = grow(appState.vecA, p1);
        const vb = grow(appState.vecB, p2);
        const vn = grow(appState.negB, p3);
        const vd = grow(appState.diffVec, p4);
        if (p1 > 0) R.drawVector(ctx, va, vp, '#4fc3f7', 'a');
        if (p2 > 0) R.drawVector(ctx, vb, vp, '#ffb74d', 'b');
        if (p3 > 0) {
          R.drawDashedVector(ctx, vn, vp, '#ffb74d', '-b');
          R.drawVectorFrom(ctx, va, vn, vp, 'rgba(255, 183, 77, 0.25)', '');
        }
        if (p4 > 0) R.drawVector(ctx, vd, vp, '#ce93d8', 'a-b');
        break;
      }

      case 'scale': {
        const p1 = p(0), p2 = p(1);
        const va = grow(appState.vecA, p1);
        const vs = grow(appState.scaledVec, p2);
        if (p1 > 0) R.drawVector(ctx, va, vp, '#4fc3f7', 'a');
        if (p2 > 0) R.drawVector(ctx, vs, vp, '#ce93d8', `${appState.scalar.toFixed(1)}·a`);
        break;
      }

      case 'dot': {
        const p1 = p(0), p2 = p(1);
        const va = grow(appState.vecA, p1);
        const vb = grow(appState.vecB, p2);
        if (p1 > 0) R.drawVector(ctx, va, vp, '#4fc3f7', 'a');
        if (p2 > 0) {
          R.drawVector(ctx, vb, vp, '#ffb74d', 'b');
          R.drawProjection(ctx, va, vb, vp);
          R.drawAngle(ctx, va, vb, vp, 'rgba(255,255,255,0.3)');
        }
        break;
      }

      case 'basis': {
        const p1 = p(0), p2 = p(1);
        const mi: Vec2 = { x: appState.matrix.a, y: appState.matrix.c };
        const mj: Vec2 = { x: appState.matrix.b, y: appState.matrix.d };
        // 变换后网格
        const gridT = Math.min(animProgress * 2, 1);
        if (gridT > 0 && animProgress > 0.5 / phaseCount(appState.mode)) {
          const alpha = Math.floor(gridT * 40).toString(16).padStart(2, '0');
          R.drawTransformedGrid(ctx, appState.matrix, vp, `#4a4a7a${alpha}`);
        }
        R.drawDashedVector(ctx, { x: 1, y: 0 }, vp, 'rgba(239, 83, 80, 0.2)', 'î');
        R.drawDashedVector(ctx, { x: 0, y: 1 }, vp, 'rgba(102, 187, 106, 0.2)', 'ĵ');
        if (p1 > 0) R.drawVector(ctx, grow(mi, p1), vp, '#ef5350', "M·î");
        if (p2 > 0) R.drawVector(ctx, grow(mj, p2), vp, '#66bb6a', "M·ĵ");
        break;
      }

      case 'matrix': {
        const m = appState.matrix;
        const v = appState.vecA;
        const mv = appState.matVec;
        const p0 = p(0), p1 = p(1), p2 = p(2), p3 = p(3), p4 = p(4);
        const va = grow(v, p0);

        const iHat: Vec2 = { x: 1, y: 0 };
        const jHat: Vec2 = { x: 0, y: 1 };
        const mi: Vec2 = { x: m.a, y: m.c };
        const mj: Vec2 = { x: m.b, y: m.d };
        const compI: Vec2 = { x: mi.x * v.x, y: mi.y * v.x };
        const compJ: Vec2 = { x: mj.x * v.y, y: mj.y * v.y };

        // 变换后网格（在 p1 阶段淡入，之后保持）
        const gridT = Math.min(animProgress * 2, 1);
        if (gridT > 0 && animProgress > 1 / phaseCount(appState.mode)) {
          const alpha = Math.floor(gridT * 40).toString(16).padStart(2, '0');
          R.drawTransformedGrid(ctx, m, vp, `#4a4a7a${alpha}`);
        }

        if (p0 > 0) {
          R.drawComponents(ctx, va, vp, '#4fc3f7');
          R.drawVector(ctx, va, vp, '#4fc3f7', 'v');
        }

        if (p1 > 0) {
          R.drawDashedVector(ctx, iHat, vp, 'rgba(239, 83, 80, 0.15)', 'î');
          R.drawDashedVector(ctx, jHat, vp, 'rgba(102, 187, 106, 0.15)', 'ĵ');
          R.drawVector(ctx, grow(mi, p1), vp, '#ef5350', "M·î");
          R.drawVector(ctx, grow(mj, p1), vp, '#66bb6a', "M·ĵ");
        }

        if (p2 > 0) {
          R.drawVector(ctx, grow(compI, p2), vp, '#ff7043', `x·M·î`);
        }

        if (p3 > 0) {
          R.drawVector(ctx, grow(compJ, p3), vp, '#81c784', `y·M·ĵ`);
        }

        if (p4 > 0) {
          const t = p4;
          const ci = grow(compI, t);
          const cj = grow(compJ, t);
          R.drawVectorFrom(ctx, ci, cj, vp, 'rgba(206, 147, 216, 0.25)', '');
          R.drawVectorFrom(ctx, cj, ci, vp, 'rgba(206, 147, 216, 0.25)', '');
          R.drawVector(ctx, grow(mv, t), vp, '#ce93d8', 'M·v');
        }
        break;
      }

      case 'eigen': {
        const p0 = p(0), p1 = p(1), p2 = p(2);
        const va = grow(appState.vecA, p0);
        const ev = appState.eigenVals;
        if (p0 > 0) {
          R.drawVector(ctx, va, vp, '#4fc3f7', 'v');
        }
        if (p1 > 0 && ev) {
          const e1 = V.normalize({ x: appState.matrix.b, y: ev[0] - appState.matrix.a });
          R.drawEigenLine(ctx, e1, vp, ev[0]);
          if (ev[0] !== ev[1]) {
            const e2 = V.normalize({ x: appState.matrix.b, y: ev[1] - appState.matrix.a });
            R.drawEigenLine(ctx, e2, vp, ev[1]);
          }
        }
        if (p2 > 0) R.drawVector(ctx, grow(appState.matVec, p2), vp, '#ce93d8', 'M·v');
        break;
      }

      case 'determinant': {
        const pa = p(0);
        if (pa > 0) {
          const s = pa;
          const interp: Mat2x2 = {
            a: 1 + (appState.matrix.a - 1) * s,
            b: 0 + (appState.matrix.b - 0) * s,
            c: 0 + (appState.matrix.c - 0) * s,
            d: 1 + (appState.matrix.d - 1) * s,
          };
          R.drawUnitSquare(ctx, interp, vp);
        }
        break;
      }
    }

    if (showComponents) {
      for (const d of appState.getDrawableVectors()) {
        R.drawComponents(ctx, d.v, vp, d.color);
      }
    }
  }

  // ── 响应式驱动 ───────────────────────────────────────

  let prevMode = $state(appState.mode);

  $effect(() => {
    if (prevMode !== appState.mode) {
      showComponents = false;
      prevMode = appState.mode;
      startAnimation();
    }
  });

  $effect(() => {
    if (ctx && width > 0 && height > 0) {
      // 建立所有响应式依赖
      const _mode = appState.mode;
      const _a = appState.vecA;
      const _b = appState.vecB;
      const _n = appState.negB;
      const _s = appState.scalar;
      const _m = appState.matrix;
      const _ap = animProgress;
      const _sc = showComponents;
      // 强制使用依赖（TS 抑制未使用警告）
      if (_mode && _a && _b && _m && _sc) {}
      if (_n !== undefined) {}
      if (_s !== undefined) {}
      if (_ap >= 0) {}
      render();
    }
  });

  // ── 生命周期 ─────────────────────────────────────────

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
    startAnimation();
    return () => {
      resizeObserver.disconnect();
      cancelAnimationFrame(animId);
    };
  });

  // ── 鼠标事件 ─────────────────────────────────────────

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
    for (const i of indices) {
      const d = drawables[i];
      if (d && R.hitTest(d.v, world)) {
        dragging = true;
        dragIndex = i;
        return;
      }
    }
    for (let i = 0; i < drawables.length; i++) {
      const d = drawables[i];
      if (d && !d.dashed && R.hitTest(d.v, world)) {
        showComponents = !showComponents;
        return;
      }
    }
    showComponents = false;
  }

  function onMouseMove(e: MouseEvent) {
    if (!dragging || dragIndex < 0) return;
    const world = getMouseWorld(e);
    const clamped = {
      x: Math.max(-8, Math.min(8, world.x)),
      y: Math.max(-8, Math.min(8, world.y)),
    };
    if (dragIndex === 0) appState.setVecA(clamped);
    else if (dragIndex === 1) appState.setVecB(clamped);
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
