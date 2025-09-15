<script lang="ts">
	import '../app.css';
	import favicon from '$lib/assets/favicon.svg';
	import { onMount } from 'svelte';
	import { loadAuthFromStorage, isAuthenticated, clearAuth } from '$lib/stores/auth';
	import { goto } from '$app/navigation';

	onMount(() => {
		loadAuthFromStorage();
	});

	function handleLogout() {
		clearAuth();
	}

	function handleLogin() {
		goto('/'); // redirection vers la page login
	}

	function goHome() {
		goto('/api'); // redirection vers la page d'accueil
	}

	let { children } = $props();
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

<nav
	class="fixed top-0 left-0 w-full bg-blue-600 text-white p-4 z-50 flex justify-between items-center"
>
	<button class="font-bold text-lg cursor-pointer hover:text-gray-200" onclick={goHome}>
		RPG Api
	</button>

	<div>
		{#if $isAuthenticated}
			<button
				onclick={handleLogout}
				class="bg-white text-blue-600 px-3 py-1 rounded hover:bg-gray-100"
			>
				Log Out
			</button>
		{:else}
			<button
				onclick={handleLogin}
				class="bg-white text-blue-600 px-3 py-1 rounded hover:bg-gray-100"
			>
				Log In
			</button>
		{/if}
	</div>
</nav>

<div class="pt-20">
	{@render children?.()}
</div>
