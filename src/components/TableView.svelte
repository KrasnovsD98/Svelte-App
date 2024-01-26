<!-- TableView.svelte -->
<script>
  export let retention;
  export let selectedGame;
  export let selectedVersion;
  export let selectedCountry;

  // A derived store or reactive statement to filter retention data
  $: filteredRetention = retention.filter(item => 
    (selectedGame === 'All' || item.app_id === selectedGame) &&
    (selectedVersion === 'All' || item.app_ver === selectedVersion) &&
    (selectedCountry === 'All' || item.country === selectedCountry)
  );

  function calculateRetention(dayCount, index0Count) {
    return Math.round((dayCount / index0Count) * 100);
  }
</script>

<div class="table-container">
  <table>
    <thead>
      <tr>
        <th class="sticky-col">Version</th>
        <th class="sticky-col">Country</th>
        {#each Array(91) as _, i (i)}
          {#if i % 5 === 0}
            <th class="dynamic-col">D{i}</th>
          {/if}
        {/each}
      </tr>
    </thead>
    <tbody>
      {#each filteredRetention as data, i (data.app_id + '-' + data.app_ver + '-' + data.country)}
        <tr>
          <td class="sticky-col first-col">{data.app_ver}</td>
          <td class="sticky-col second-col">{data.country}</td>
          {#each data.days as day, index (`${data.app_id}-${data.app_ver}-${data.country}-${index}`)}
            {#if index % 5 === 0}
              <td class="dynamic-col">{calculateRetention(day, data.days[0])}%</td>
            {/if}
          {/each}
        </tr>
      {/each}
    </tbody>
  </table>
</div>

<style>
  .table-container {
    overflow: auto;
    max-height: 500px;
  }
  table {
    border-collapse: collapse;
    width: 100%;
  }
  th, td {
    border: 1px solid #ddd;
    padding: 8px;
    background: white;
  }
  thead th {
    position: sticky;
    top: 0;
    background: #eee;
    z-index: 10;
  }
  th.sticky-col {
    left: 0;
    z-index: 10;
  }
</style>
