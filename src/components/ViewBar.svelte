<!-- src/ViewBar.svelte -->
<script>
    export let setCurrentView;
  </script>
  
  <div class="view-bar">
    <button on:click={() => setCurrentView('table')}>Table View</button>
    <button on:click={() => setCurrentView('chart')}>Chart View</button>
  </div>
  
  <style>
    /* Style your buttons and view bar here */
    .view-bar {
      margin: 10px 0;
      /* Other styles */
    }
  </style>
  