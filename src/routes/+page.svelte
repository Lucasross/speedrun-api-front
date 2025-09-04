<script lang="ts">
	import { goto } from '$app/navigation';
	import { setAuth } from '$lib/stores/auth';
	import { EyeOutline, EyeSlashOutline } from 'flowbite-svelte-icons';
	import api from '$lib/api';

	let showPassword = $state(false);
	let password = $state('');
	let error = $state('');

	async function handleLogin() {
		try {
			const res = await api.post('/auth/login', { password });
			setAuth(res.data?.access_token);
			goto('/api');
		} catch (e: any) {
			error = e.response?.data?.message || 'Erreur de connexion';
		}
	}

	function handleSkip() {
		goto('/api');
	}
</script>

<div class="flex items-center justify-center h-screen bg-gray-100">
	<form onsubmit={handleLogin} class="bg-white p-8 rounded-2xl shadow w-96">
		<h1 class="text-2xl font-bold mb-6">Connexion</h1>

		<div class="relative w-full">
			<input
				id="password"
				type={showPassword ? 'text' : 'password'}
				placeholder="Admin password"
				bind:value={password}
				class="w-full p-2 mb-4 border rounded pr-10"
			/>
			<!-- Icône à droite -->
			<button
				type="button"
				class="absolute inset-y-0 mb-4 right-2 items-center flex cursor-pointer"
				onclick={() => (showPassword = !showPassword)}
			>
				{#if showPassword}
					<EyeOutline class="h-6 w-6 text-gray-500" />
				{:else}
					<EyeSlashOutline class="h-6 w-6 text-gray-500" />
				{/if}
			</button>
		</div>

		{#if error}
			<p class="text-red-500 mb-2">{error}</p>
		{/if}

		<div class="flex space-x-2">
			<button type="submit" class="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600">
				Log in
			</button>

			<button
				type="button"
				onclick={handleSkip}
				class="bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-500"
			>
				Skip
			</button>
		</div>
	</form>
</div>
