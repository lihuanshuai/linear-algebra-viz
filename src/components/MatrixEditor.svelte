<script lang="ts">
  import { appState } from '../stores/app-state.svelte';

  function updateMatrix(a: string, b: string, c: string, d: string) {
    appState.setMatrix({
      a: parseFloat(a) || 0,
      b: parseFloat(b) || 0,
      c: parseFloat(c) || 0,
      d: parseFloat(d) || 0,
    });
  }

  function updateScalar(val: string) {
    appState.setScalar(parseFloat(val) || 1);
  }

  const showMatrix = $derived(
    appState.mode === 'matrix' || appState.mode === 'basis'
    || appState.mode === 'eigen' || appState.mode === 'determinant'
  );

  const showScalar = $derived(appState.mode === 'scale');
</script>

{#if showMatrix}
  <section class="editor">
    <h3>矩阵 M</h3>
    <div class="matrix-grid">
      <span class="bracket">[</span>
      <div class="matrix-inputs">
        <input
          type="number" step="0.1" min="-8" max="8"
          value={appState.matrix.a}
          oninput={(e) => updateMatrix(
            (e.target as HTMLInputElement).value,
            String(appState.matrix.b),
            String(appState.matrix.c),
            String(appState.matrix.d),
          )}
        />
        <input
          type="number" step="0.1" min="-8" max="8"
          value={appState.matrix.b}
          oninput={(e) => updateMatrix(
            String(appState.matrix.a),
            (e.target as HTMLInputElement).value,
            String(appState.matrix.c),
            String(appState.matrix.d),
          )}
        />
        <input
          type="number" step="0.1" min="-8" max="8"
          value={appState.matrix.c}
          oninput={(e) => updateMatrix(
            String(appState.matrix.a),
            String(appState.matrix.b),
            (e.target as HTMLInputElement).value,
            String(appState.matrix.d),
          )}
        />
        <input
          type="number" step="0.1" min="-8" max="8"
          value={appState.matrix.d}
          oninput={(e) => updateMatrix(
            String(appState.matrix.a),
            String(appState.matrix.b),
            String(appState.matrix.c),
            (e.target as HTMLInputElement).value,
          )}
        />
      </div>
      <span class="bracket">]</span>
    </div>

    <div class="matrix-info">
      {#if appState.mode === 'determinant'}
        <div>det(M) = {appState.det.toFixed(3)}</div>
      {:else if appState.mode === 'eigen'}
        <div>det(M) = {appState.det.toFixed(3)}</div>
        {#if appState.eigenVals}
          <div>λ₁ = {appState.eigenVals[0].toFixed(3)}, λ₂ = {appState.eigenVals[1].toFixed(3)}</div>
        {:else}
          <div>无实特征值</div>
        {/if}
      {/if}
    </div>
  </section>
{/if}

{#if showScalar}
  <section class="editor">
    <h3>标量 k</h3>
    <label>
      <input
        type="range" min="-4" max="4" step="0.1"
        value={appState.scalar}
        oninput={(e) => updateScalar((e.target as HTMLInputElement).value)}
      />
      <input
        type="number" min="-4" max="4" step="0.1"
        value={appState.scalar}
        oninput={(e) => updateScalar((e.target as HTMLInputElement).value)}
      />
    </label>
  </section>
{/if}

<style>
  .editor {
    margin-bottom: 16px;
  }

  h3 {
    font-size: 13px;
    text-transform: uppercase;
    color: var(--color-text-muted);
    margin-bottom: 8px;
    letter-spacing: 1px;
  }

  .matrix-grid {
    display: flex;
    align-items: center;
    gap: 4px;
  }

  .bracket {
    font-size: 40px;
    font-weight: 100;
    color: var(--color-text-muted);
    line-height: 1;
  }

  .matrix-inputs {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 4px;
    flex: 1;
  }

  .matrix-inputs input {
    width: 100%;
    padding: 6px;
    background: var(--color-surface);
    border: 1px solid var(--color-surface-2);
    border-radius: 4px;
    color: var(--color-text);
    font-family: var(--font-mono);
    font-size: 14px;
    text-align: center;
  }

  .matrix-inputs input:focus {
    outline: none;
    border-color: var(--color-accent);
  }

  .matrix-info {
    margin-top: 8px;
    font-size: 12px;
    color: var(--color-text-muted);
    font-family: var(--font-mono);
  }

  label {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  input[type="range"] {
    flex: 1;
    accent-color: var(--color-accent);
  }

  input[type="number"] {
    width: 64px;
    padding: 4px 6px;
    background: var(--color-surface);
    border: 1px solid var(--color-surface-2);
    border-radius: 4px;
    color: var(--color-text);
    font-family: var(--font-mono);
    font-size: 13px;
    text-align: right;
  }

  input[type="number"]:focus {
    outline: none;
    border-color: var(--color-accent);
  }
</style>
