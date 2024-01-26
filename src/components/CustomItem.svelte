<!-- CustomItem.svelte -->
<script>
  export let item; // item represents an option from the Select component

  $: console.log("hello");
</script>

<div class="custom-item">
  {#if item.icon}
    <img src={item.icon} alt={item.label} class="game-icon" />
  {/if}
  <span>{item.label}</span>
</div>

<style>
  .custom-item {
    display: flex;
    align-items: center;
  }
  .game-icon {
    width: 20px; /* Adjust the size as needed */
    height: 20px; /* Adjust the size as needed */
    margin-right: 8px;
  }
</style>
