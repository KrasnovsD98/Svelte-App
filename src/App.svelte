<script>
  import 'flowbite';
  import './main.css';
	import { onMount } from 'svelte';
	import FilterBar from './components/FilterBar.svelte';
 	import ViewBar from './components/ViewBar.svelte';
  import ContentArea from './components/ContentArea.svelte'; 

  let games = [];
  let retention = [];
	let selectedGame = 'All';
	let selectedVersion = 'All';
	let selectedCountry = 'All';
	let currentView = 'table'; //default view

	function setCurrentView(view) {
	currentView = view;
	}

  onMount(async () => {
    const gamesResponse = await fetch('https://storage.googleapis.com/estoty-temp/games.json');
    games = await gamesResponse.json();

    const retentionResponse = await fetch('https://storage.googleapis.com/estoty-temp/retention.json');
    retention = await retentionResponse.json();
  });

  </script>

<main>
	<FilterBar 
    {games} 
    {retention}
    bind:selectedGame 
    bind:selectedVersion 
    bind:selectedCountry 
    
  />
  <ViewBar  {setCurrentView} />
  <ContentArea 
  {currentView}
  {retention}
  {selectedGame}
  {selectedVersion}
  {selectedCountry}
  />
  </main>
  
