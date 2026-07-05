<script lang="ts">
  import { appState } from '../stores/app-state.svelte';
  import { modeLabels } from '../lib/types';
  import type { Mode } from '../lib/types';

  const modes: Mode[] = [
    'vector', 'add', 'subtract', 'scale', 'dot',
    'basis', 'matrix', 'eigen', 'determinant',
  ];
</script>

<section class="mode-selector">
  <h3>模式</h3>
  <div class="mode-grid">
    {#each modes as m}
      <button
        class="mode-btn"
        class:active={appState.mode === m}
        onclick={() => appState.setMode(m)}
      >
        {modeLabels[m]}
      </button>
    {/each}
  </div>
</section>

<style>
  .mode-selector {
    margin-bottom: 16px;
  }

  h3 {
    font-size: 13px;
    text-transform: uppercase;
    color: var(--color-text-muted);
    margin-bottom: 8px;
    letter-spacing: 1px;
  }

  .mode-grid {
    display: grid;
    grid-template-columns: 1fr 1fr 1fr;
    gap: 4px;
  }

  .mode-btn {
    padding: 6px 4px;
    font-size: 12px;
    background: var(--color-surface);
    color: var(--color-text);
    border: 1px solid transparent;
    border-radius: 4px;
    cursor: pointer;
    transition: all 0.15s;
    font-family: var(--font-sans);
  }

  .mode-btn:hover {
    background: var(--color-surface-2);
  }

  .mode-btn.active {
    background: var(--color-surface-2);
    border-color: var(--color-accent);
    color: #fff;
  }
</style>
