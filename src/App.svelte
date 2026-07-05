<script lang="ts">
  import Canvas from './components/Canvas.svelte';
  import ControlPanel from './components/ControlPanel.svelte';
</script>

<div class="app-layout">
  <main class="canvas-area">
    <Canvas />
  </main>
  <ControlPanel />
</div>

<style>
  .app-layout {
    display: flex;
    height: 100%;
  }

  .canvas-area {
    flex: 1;
    min-width: 0;
    overflow: hidden;
  }
</style>
