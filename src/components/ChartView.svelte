<!-- src/ChartView.svelte -->
<script>
    import { onMount } from 'svelte';
    import Chart from 'chart.js/auto';
  
    export let chartData;
    export let key; // Not used directly, but causes Svelte to recreate the component

  let chart;
  let canvas;

  onMount(() => {
    const context = canvas.getContext('2d');
    chart = new Chart(context, {
      type: 'bar',
      data: chartData,
      // ... options
    });

    return () => {
      chart.destroy(); // Cleanup chart when the component is destroyed
    };
  });

  // If you need to react to changes in chartData within the same component instance
  $: if (chart && chartData) {
    chart.data = chartData;
    chart.update();
  }
  </script>
  
  <canvas bind:this={canvas}></canvas>
  