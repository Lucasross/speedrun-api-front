<script lang="ts">
	import { goto } from '$app/navigation';
	import { setAuth } from '$lib/stores/auth';
	import api from '$lib/api';

	let email = '';
	let password = '';
	let error = '';

	async function handleLogin() {
		try {
			const res = await api.post('/auth/login', { email, password });
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
	<form on:submit|preventDefault={handleLogin} class="bg-white p-8 rounded-2xl shadow w-96">
		<h1 class="text-2xl font-bold mb-6">Connexion</h1>

		<input
			type="email"
			placeholder="Email"
			bind:value={email}
			class="w-full p-2 mb-4 border rounded"
		/>

		<input
			type="password"
			placeholder="Mot de passe"
			bind:value={password}
			class="w-full p-2 mb-4 border rounded"
		/>

		{#if error}
			<p class="text-red-500 mb-2">{error}</p>
		{/if}

		<div class="flex space-x-2">
			<button type="submit" class="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600">
				Se connecter
			</button>

			<button on:click={handleSkip} class="bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-500">
				Skip
			</button>
		</div>
	</form>
</div>
