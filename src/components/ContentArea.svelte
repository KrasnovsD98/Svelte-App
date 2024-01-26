<script>
    import ChartView from './ChartView.svelte';
    import TableView from './TableView.svelte';
    export let retention;
    export let selectedGame;
    export let selectedVersion;
    export let selectedCountry;
    export let currentView;
    export let chartData;

   

        // A derived store or reactive statement to filter retention data
    $: filteredRetention = retention.filter(item => 
    (selectedGame === 'All' || item.app_id === selectedGame) &&
    (selectedVersion === 'All' || item.app_ver === selectedVersion) &&
    (selectedCountry === 'All' || item.country === selectedCountry)
    );

  function calculateRetention(dayCount, index0Count) {
    return Math.round((dayCount / index0Count) * 100);
  }


 $: chartData = {
    labels: ['D0', 'D5', 'D10', 'D20', 'D25', 'D30', 'D60', 'D90'], // Example labels
    datasets: filteredRetention.map(item => {
      // Assuming 'days' is an array [D0, D5, D10, ..., D90]
      const data = item.days.slice(0, chartData.labels.length).map((day, index) => ({
        x: chartData.labels[index],
        y: day
      }));

      return {
        label: `${item.app_ver} - ${item.country}`,
        data: data,
        backgroundColor: 'rgba(54, 162, 235, 0.5)',
        borderColor: 'rgba(54, 162, 235, 1)',
        borderWidth: 1
      };
    })
  };

  </script>
  
  <div class="content-area">
    {#if currentView === 'table'}
      <TableView 
        {retention} 
        {selectedGame} 
        {selectedVersion} 
        {selectedCountry} 
      />
    {:else if currentView === 'chart'}
      <ChartView {chartData} />
    {/if}
  </div>

  
  