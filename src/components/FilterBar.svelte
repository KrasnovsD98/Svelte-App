<!-- src/FilterBar.svelte -->
<script>
  import '../main.css'
  import Select from 'svelte-select';
  import CustomItem from './CustomItem.svelte'; // Ensure you have this component
  export let games;
  export let retention;
  export let selectedGame;
  export let selectedVersion;
  export let selectedCountry;

  let searchable = true;
  let icons = 'https://upload.wikimedia.org/wikipedia/en/b/bc/Candy_Crush_logo.png';
  $: items = [{ value: 'All', label: 'All', icon: null }]
    .concat(games.map(game => ({
      value: game.app_id,
      label: game.name,
      icon: game.icon
    })))
    .sort((a, b) => a.label.localeCompare(b.label));
  
  function handleSelectChange(event) {
    selectedGame = event.detail.value;
  }

  function calculateDevicesForVersion(version) {
    return retention
      .filter(item => item.app_ver === version && (selectedGame === 'All' || item.app_id === selectedGame))
      .reduce((sum, item) => sum + (item.days[0] || 0), 0);
  }
  function calculateDevicesForCountry(country) {
    return retention
      .filter(item => 
        item.country === country && 
        (selectedGame === 'All' || item.app_id === selectedGame) &&
        (selectedVersion === 'All' || item.app_ver === selectedVersion)
      )
      .reduce((sum, item) => sum + (item.days[0] || 0), 0);
  }
  
    $: filteredVersions = (selectedGame === 'All' ? retention : retention.filter(r => r.app_id === selectedGame))
  .map(r => ({
    version: r.app_ver,
    devices: calculateDevicesForVersion(r.app_ver)
  }))
  .reduce((acc, { version, devices }) => {
    const existing = acc.find(v => v.version === version);
    if (existing) {
      existing.devices += devices;
    } else {
      acc.push({ version, devices });
    }
    return acc;
  }, [])
  .sort((a, b) => parseFloat(b.version) - parseFloat(a.version)) // Assuming version numbers are float-parseable
  .map(({ version, devices }) => ({ value: version, label: `${version} (${devices})` }));


  $: filteredCountries = (selectedGame === 'All' && selectedVersion === 'All'
    ? retention
    : retention.filter(r =>
        (selectedGame === 'All' || r.app_id === selectedGame) &&
        (selectedVersion === 'All' || r.app_ver === selectedVersion)
      )
    )
    .map(r => ({
      country: r.country,
      devices: calculateDevicesForCountry(r.country)
    }))
    .reduce((acc, { country, devices }) => {
      const existing = acc.find(c => c.country === country);
      if (existing) {
        existing.devices += devices;
      } else {
        acc.push({ country, devices });
      }
      return acc;
    }, [])
    .sort((a, b) => b.devices - a.devices) // Sort countries by number of devices descending
    .map(({ country, devices }) => ({ value: country, label: `${country} (${devices})` }));
  </script>

 <div class="filter-bar">
  <div class="filter-dropdown">
    <Select 
    class="filter-dropdown"
    {items} 
    {searchable}
    value={selectedGame} 
    on:select={handleSelectChange} 
  >
  <div class="game-item" slot="item" let:item let:index>
    <CustomItem {item} />
  </div>
  
  <div class="game-item" slot="selection" let:selection>
    <CustomItem item={selection} />
  </div>
 </Select>
  
  </div>
<!-- Dropdown for versions -->
<select bind:value={selectedVersion}>
  <option value="All">All</option>
  {#each filteredVersions as { value, label }}
    <option value={value}>{label}</option>
  {/each}
</select>

<!-- Dropdown for countries -->
<select bind:value={selectedCountry}>
  <option value="All">All</option>
  {#each filteredCountries as { value, label }}
    <option value={value} title={value}>{label}</option>
  {/each}
</select>

  </div>
  