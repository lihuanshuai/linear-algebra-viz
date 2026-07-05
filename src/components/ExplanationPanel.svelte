<script lang="ts">
  import { appState } from '../stores/app-state.svelte';
  import { modeDescriptions } from '../lib/types';
  import * as V from '../lib/vector';

  /** 根据当前模式与状态生成具体的数值说明 */
  const detail = $derived.by(() => {
    const mode = appState.mode;
    switch (mode) {
      case 'vector': {
        const a = appState.vecA;
        const mag = appState.magA;
        return `a = (${a.x.toFixed(1)}, ${a.y.toFixed(1)})，|a| = ${mag.toFixed(3)}`;
      }
      case 'add': {
        const a = appState.vecA;
        const b = appState.vecB;
        const s = appState.sumVec;
        return `a = (${a.x.toFixed(1)}, ${a.y.toFixed(1)})，b = (${b.x.toFixed(1)}, ${b.y.toFixed(1)})，a + b = (${s.x.toFixed(1)}, ${s.y.toFixed(1)})`;
      }
      case 'subtract': {
        const a = appState.vecA;
        const b = appState.vecB;
        const n = appState.negB;
        const d = appState.diffVec;
        return `a = (${a.x.toFixed(1)}, ${a.y.toFixed(1)})，b = (${b.x.toFixed(1)}, ${b.y.toFixed(1)})，-b = (${n.x.toFixed(1)}, ${n.y.toFixed(1)})，a - b = a + (-b) = (${d.x.toFixed(1)}, ${d.y.toFixed(1)})`;
      }
      case 'scale': {
        const a = appState.vecA;
        const k = appState.scalar;
        const s = appState.scaledVec;
        return `a = (${a.x.toFixed(1)}, ${a.y.toFixed(1)})，k = ${k.toFixed(1)}，k·a = (${s.x.toFixed(1)}, ${s.y.toFixed(1)})，|k·a| = ${V.magnitude(s).toFixed(3)}`;
      }
      case 'dot': {
        const a = appState.vecA;
        const b = appState.vecB;
        const d = appState.dotAB;
        const angle = (appState.angleAB * 180 / Math.PI).toFixed(1);
        return `a = (${a.x.toFixed(1)}, ${a.y.toFixed(1)})，b = (${b.x.toFixed(1)}, ${b.y.toFixed(1)})，a·b = ${d.toFixed(3)}，夹角 = ${angle}°`;
      }
      case 'matrix': {
        const m = appState.matrix;
        const v = appState.vecA;
        const r = appState.matVec;
        return `M = [[${m.a.toFixed(1)}, ${m.b.toFixed(1)}], [${m.c.toFixed(1)}, ${m.d.toFixed(1)}]]\n` +
          `M·î = (${m.a.toFixed(1)}, ${m.c.toFixed(1)})，M·ĵ = (${m.b.toFixed(1)}, ${m.d.toFixed(1)})\n` +
          `v = ${v.x.toFixed(1)}·î + ${v.y.toFixed(1)}·ĵ = (${v.x.toFixed(1)}, ${v.y.toFixed(1)})\n` +
          `M·v = ${v.x.toFixed(1)}·(${m.a.toFixed(1)}, ${m.c.toFixed(1)}) + ${v.y.toFixed(1)}·(${m.b.toFixed(1)}, ${m.d.toFixed(1)}) = (${r.x.toFixed(1)}, ${r.y.toFixed(1)})`;
      }
      case 'basis': {
        const m = appState.matrix;
        return `M·î = (${m.a.toFixed(1)}, ${m.c.toFixed(1)})，M·ĵ = (${m.b.toFixed(1)}, ${m.d.toFixed(1)})，det(M) = ${appState.det.toFixed(3)}`;
      }
      case 'eigen': {
        const ev = appState.eigenVals;
        const m = appState.matrix;
        if (ev) {
          return `M = [[${m.a.toFixed(1)}, ${m.b.toFixed(1)}], [${m.c.toFixed(1)}, ${m.d.toFixed(1)}]]，λ₁ = ${ev[0].toFixed(3)}，λ₂ = ${ev[1].toFixed(3)}`;
        }
        return `M = [[${m.a.toFixed(1)}, ${m.b.toFixed(1)}], [${m.c.toFixed(1)}, ${m.d.toFixed(1)}]]，无实特征值`;
      }
      case 'determinant': {
        const m = appState.matrix;
        const det = appState.det;
        return `M = [[${m.a.toFixed(1)}, ${m.b.toFixed(1)}], [${m.c.toFixed(1)}, ${m.d.toFixed(1)}]]，det(M) = ${det.toFixed(3)}，面积缩放 = |det| = ${Math.abs(det).toFixed(3)}`;
      }
      default:
        return '';
    }
  });
</script>

<section class="explanation">
  <h3>说明</h3>
  <p class="desc">{modeDescriptions[appState.mode]}</p>
  <pre class="detail">{detail}</pre>
</section>

<style>
  .explanation {
    margin-top: 8px;
    flex-shrink: 0;
  }

  h3 {
    font-size: 13px;
    text-transform: uppercase;
    color: var(--color-text-muted);
    margin-bottom: 8px;
    letter-spacing: 1px;
  }

  .desc {
    font-size: 13px;
    line-height: 1.6;
    color: var(--color-text);
    margin-bottom: 8px;
  }

  .detail {
    font-size: 12px;
    color: var(--color-text-muted);
    font-family: var(--font-mono);
    background: var(--color-bg);
    padding: 10px;
    border-radius: 6px;
    white-space: pre-wrap;
    line-height: 1.5;
  }
</style>
