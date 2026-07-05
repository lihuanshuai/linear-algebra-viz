<script lang="ts">
  import { appState } from '../stores/app-state.svelte';

  let labelA = $state('');
  let labelB = $state('');

  $effect(() => {
    switch (appState.mode) {
      case 'vector': labelA = '向量 a'; labelB = ''; break;
      case 'add':
      case 'subtract':
      case 'dot': labelA = '向量 a'; labelB = '向量 b'; break;
      case 'scale': labelA = '向量 a'; labelB = ''; break;
      case 'matrix': labelA = '向量 v'; labelB = ''; break;
      default: labelA = ''; labelB = ''; break;
    }
  });

  function updateVecA(x: string, y: string) {
    appState.setVecA({ x: parseFloat(x) || 0, y: parseFloat(y) || 0 });
  }

  function updateVecB(x: string, y: string) {
    appState.setVecB({ x: parseFloat(x) || 0, y: parseFloat(y) || 0 });
  }
</script>

{#if labelA}
  <section class="editor">
    <h3>{labelA}</h3>
    <div class="inputs">
      <label>
        <span class="label">x</span>
        <input
          type="range" min="-8" max="8" step="0.1"
          value={appState.vecA.x}
          oninput={(e) => updateVecA((e.target as HTMLInputElement).value, String(appState.vecA.y))}
        />
        <input
          type="number" min="-8" max="8" step="0.1"
          value={appState.vecA.x}
          oninput={(e) => updateVecA((e.target as HTMLInputElement).value, String(appState.vecA.y))}
        />
      </label>
      <label>
        <span class="label">y</span>
        <input
          type="range" min="-8" max="8" step="0.1"
          value={appState.vecA.y}
          oninput={(e) => updateVecA(String(appState.vecA.x), (e.target as HTMLInputElement).value)}
        />
        <input
          type="number" min="-8" max="8" step="0.1"
          value={appState.vecA.y}
          oninput={(e) => updateVecA(String(appState.vecA.x), (e.target as HTMLInputElement).value)}
        />
      </label>
      <div class="info">
        模长: {appState.magA.toFixed(3)}
      </div>
    </div>
  </section>
{/if}

{#if labelB}
  <section class="editor">
    <h3>{labelB}</h3>
    <div class="inputs">
      <label>
        <span class="label">x</span>
        <input
          type="range" min="-8" max="8" step="0.1"
          value={appState.vecB.x}
          oninput={(e) => updateVecB((e.target as HTMLInputElement).value, String(appState.vecB.y))}
        />
        <input
          type="number" min="-8" max="8" step="0.1"
          value={appState.vecB.x}
          oninput={(e) => updateVecB((e.target as HTMLInputElement).value, String(appState.vecB.y))}
        />
      </label>
      <label>
        <span class="label">y</span>
        <input
          type="range" min="-8" max="8" step="0.1"
          value={appState.vecB.y}
          oninput={(e) => updateVecB(String(appState.vecB.x), (e.target as HTMLInputElement).value)}
        />
        <input
          type="number" min="-8" max="8" step="0.1"
          value={appState.vecB.y}
          oninput={(e) => updateVecB(String(appState.vecB.x), (e.target as HTMLInputElement).value)}
        />
      </label>
      <div class="info">
        模长: {appState.magB.toFixed(3)}
      </div>
    </div>
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

  .inputs {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  label {
    display: flex;
    align-items: center;
    gap: 6px;
  }

  .label {
    width: 16px;
    font-weight: bold;
    font-family: var(--font-mono);
    font-size: 13px;
    color: var(--color-text-muted);
  }

  input[type="range"] {
    flex: 1;
    accent-color: var(--color-accent);
    height: 4px;
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

  .info {
    font-size: 12px;
    color: var(--color-text-muted);
    font-family: var(--font-mono);
  }
</style>
