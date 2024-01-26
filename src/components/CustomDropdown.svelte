<!-- CustomDropdown.svelte -->
<script>
    export let items; // The items to display (games, versions, countries, etc.)
    export let selectedItem; // The currently selected item
    export let onSelect; // A handler function to call when an item is selected
    function handleKeydown(event) {
      if (event.key === 'Enter') {
        // Your logic to handle Enter key for the custom dropdown
      }
      // Add logic to handle up/down arrow keys if you want to navigate through items
    }
  </script>
  
  <div class="custom-dropdown" tabindex="0" on:keydown={handleKeydown}>
    {#each items as item, index}
      <div 
        class="dropdown-item {item.value === selectedItem ? 'selected' : ''}" 
        tabindex="-1"
        on:click={() => onSelect(item.value)}
        on:keydown={(event) => event.key === 'Enter' && onSelect(item.value)}
        role="option"
        aria-selected="{item.value === selectedItem}"
      >
        <img class="icon" src={item.icon} alt={item.text} />
        <span>{item.text}</span>
      </div>
    {/each}
  </div>
  
  
  <style>
    .custom-dropdown {
      /* styles for the custom dropdown */
    }
    .dropdown-item {
      display: flex;
      align-items: center;
      cursor: pointer;
      /* additional styles */
    }
    .dropdown-item img.icon {
      width: 20px; /* size as needed */
      height: 20px; /* size as needed */
      margin-right: 10px;
    }
    /* Style for the selected item */
    .dropdown-item.selected {
      background-color: #e0e0e0; /* example style */
    }
  </style>
  