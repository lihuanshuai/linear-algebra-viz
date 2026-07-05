<script lang="ts">
  import ModeSelector from './ModeSelector.svelte';
  import VectorEditor from './VectorEditor.svelte';
  import MatrixEditor from './MatrixEditor.svelte';
  import ExplanationPanel from './ExplanationPanel.svelte';
  import { appState } from '../stores/app-state.svelte';
</script>

<aside class="panel">
  <header class="panel-header">
    <h2>线性代数可视化</h2>
    <button class="reset-btn" onclick={() => { appState.resetVectors(); appState.resetMatrix(); }}>
      重置
    </button>
  </header>

  <ModeSelector />
  <VectorEditor />
  <MatrixEditor />
  <ExplanationPanel />
</aside>

<style>
  .panel {
    width: 340px;
    min-width: 340px;
    height: 100%;
    overflow-y: auto;
    background: var(--color-surface);
    padding: 20px;
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .panel-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 12px;
  }

  h2 {
    font-size: 18px;
    font-weight: 700;
    letter-spacing: -0.5px;
  }

  .reset-btn {
    padding: 6px 14px;
    font-size: 12px;
    background: var(--color-surface-2);
    color: var(--color-text);
    border: 1px solid transparent;
    border-radius: 4px;
    cursor: pointer;
    transition: all 0.15s;
    font-family: var(--font-sans);
  }

  .reset-btn:hover {
    background: var(--color-accent);
    color: #fff;
  }
</style>
