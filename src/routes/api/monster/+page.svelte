<script lang="ts">
	import { onMount } from 'svelte';
	import api from '../../../lib/api'; // ton axios configuré
	import { isAuthenticated } from '$lib/stores/auth';
	import { Tooltip } from 'flowbite-svelte';
	import { validateMonster } from './MonsterValidator';
	import type { ValidationError } from './MonsterValidator';

	type Monster = {
		_id: string;
		name: string;
		description: string;
		stats: Record<string, number>;
	};

	type Stat = {
		name: string;
		description: string;
		type: string;
		usages: string[];
		weight: number;
		defaultValue: number;
	};

	type Job = {
		id: number;
		name: string;
		description: string;
		stats: Record<string, number>;
		[key: string]: any;
	};

	let monsters: Monster[] = [];
	let stats: Stat[] = [];
	let selectedMonster: Monster | null = null;
	let newEntry: string;
	let activeTab = 0;
	let thresholdMin = 200;
	let thresholdMax = 230;
	let level = 1;

	let errors: ValidationError[] = [];

	// Récupérer les monsters
	onMount(async () => {
		const monsterRes = await api.get('/monster');
		monsters = monsterRes.data;

		const statRes = await api.get('/stats');
		stats = statRes.data.filter((obj: { usages: string[] }) => obj.usages.includes('monster'));
	});

	// Sélection d’un monster
	function selectMonster(monster: Monster) {
		selectedMonster = monster;
	}

	async function deleteMonster() {
		if (!selectedMonster) return;
		await api.delete(`/monster/${selectedMonster._id}`);
		monsters = monsters.filter((j) => j._id !== selectedMonster!._id);
		selectedMonster = null;
	}

	async function updateMonster() {
		if (!selectedMonster) return;
		await api.put(`/monster/${selectedMonster._id}`, selectedMonster);
		alert('Monster updated!');
	}

	async function createMonster() {
		// Exemple : créer un monster vide ou avec valeurs par défaut
		const res = await api.post('/monster', selectedMonster);
		const newMonster = res.data;

		// Ajouter le nouveau monster à la liste et le sélectionner
		monsters = [newMonster, ...monsters];
		selectedMonster = newMonster;
		activeTab = 0;
	}

	function createEmptyMonster(): Monster {
		const defaultStats: Record<string, number> = { 'Base Health': 100, 'Base Damage': 20 };

		const newMonster: Monster = {
			_id: '-1',
			name: '',
			description: '',
			stats: defaultStats
		};

		return newMonster;
	}

	function statOf(key: string): Stat | undefined {
		return stats.find((s) => s.name === key);
	}

	function addEntry() {
		selectedMonster!.stats[newEntry] = statOf(newEntry)?.defaultValue || 0;
	}

	function updateKey(oldKey: string, newKey: string) {
		if (oldKey === newKey) return;

		selectedMonster!.stats = Object.fromEntries(
			Object.entries(selectedMonster!.stats).map(([k, v]) => (k === oldKey ? [newKey, v] : [k, v]))
		);
	}

	function removeKey(key: string) {
		selectedMonster!.stats = Object.fromEntries(
			Object.entries(selectedMonster!.stats).filter(([k]) => k !== key)
		);
	}

	$: totalCommon = selectedMonster
		? Object.entries(selectedMonster.stats).reduce((sum, [key, val]) => {
				const stat = stats.find((s) => s.name === key);

				if (!stat) return sum;

				const weight = stat ? stat.weight : 1;
				return sum + val * weight;
			}, 0)
		: 0;

	$: errors = validateMonster(selectedMonster);
	$: isCommonGood = totalCommon >= thresholdMin && totalCommon <= thresholdMax;
	$: isAllGood = isCommonGood && errors.length === 0;
</script>

<!-- Grid des monster -->
<div class="grid grid-cols-2 lg:grid-cols-6 gap-4 p-4">
	{#each monsters as monster}
		<button
			class="p-4 bg-blue-100 rounded cursor-pointer hover:bg-green-200 transition"
			on:click={() => selectMonster(monster)}
		>
			<p>ID: {monster._id}</p>
			<h3 class="font-bold">{monster.name}</h3>
		</button>
	{/each}

	{#if $isAuthenticated}
		<button
			class="p-4 bg-green-100 rounded cursor-pointer hover:bg-green-200 transition"
			on:click={() => selectMonster(createEmptyMonster())}
		>
			<h3 class="font-bold">Create a monster</h3>
		</button>
	{/if}
</div>

<!-- Détails -->
{#if selectedMonster}
	<div class="mt-6 p-4 border rounded bg-gray-50 w-full lg:w-5/6 xl:w-3/4 mx-auto">
		<div class="flex justify-between items-center">
			<h2 class="text-xl font-bold">
				{#if selectedMonster!._id === '-1'}[Create]{/if}
				{selectedMonster.name}
			</h2>
			<div class="flex flex-col items-start">
				<span class={`text-lg font-semibold ${!isCommonGood ? 'text-red-500' : 'text-green-500'}`}>
					Common: {totalCommon} ({thresholdMin} - {thresholdMax})
				</span>
			</div>
		</div>

		<!-- Tabs -->
		<div class="grid lg:flex border-b mb-4">
			<button
				class={`px-4 cursor-pointer py-2 ${activeTab === 0 ? 'border-b-2 border-blue-500 font-bold' : ''}`}
				on:click={() => (activeTab = 0)}
			>
				Common
			</button>
			<button
				class={`px-4 cursor-pointer py-2 ${activeTab === 1 ? 'border-b-2 border-blue-500 font-bold' : ''}`}
				on:click={() => (activeTab = 1)}
			>
				Summary
			</button>
		</div>

		<!-- Onglet 1 -->
		{#if activeTab === 0}
			<div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
				<div class="flex flex-row gap-2">
					<span class="font-semibold lg:w-64">Name:</span>
					<input class="border p-1 flex-1 rounded" bind:value={selectedMonster.name} />
				</div>
				<div class="flex flex-row gap-2">
					<span class="font-semibold lg:w-64">Description:</span>
					<input class="border p-1 flex-1 rounded" bind:value={selectedMonster.description} />
				</div>

				{#each Object.entries(selectedMonster.stats) as [key, value], i}
					<div class="flex flex-row gap-2">
						<!-- Dropdown -->
						<select
							class="border rounded-xl px-3 py-2 focus:ring focus:ring-blue-300 outline-none flex-1"
							value={key}
							on:change={(e) => updateKey(key, (e.target as HTMLSelectElement).value)}
						>
							{#each stats as stat}
								<option value={stat.name}>{stat.name}</option>
							{/each}
						</select>

						<!-- Input valeur -->
						<input
							type="number"
							class="border rounded-xl px-3 py-2 w-24 text-right focus:ring focus:ring-blue-300 outline-none"
							bind:value={selectedMonster.stats[key]}
						/>

						<!-- Bouton delete -->
						<button
							type="button"
							class="bg-red-500 hover:bg-red-600 text-white rounded-xl px-3 py-2 transition"
							on:click={() => removeKey(key)}
						>
							✕
						</button>
					</div>
				{/each}

				<!-- Bouton d'ajout -->
			</div>
			<hr class="h-px my-8 bg-gray-200 border-0 dark:bg-gray-700" />
			<div class="flex flex-row gap-3">
				<select
					class="border flex-[1] rounded-xl px-3 py-2 focus:ring focus:ring-blue-300 outline-none"
					bind:value={newEntry}
				>
					{#each stats as stat}
						<option value={stat.name}>{stat.name}</option>
					{/each}
				</select>
				<button
					class="flex-[3] bg-blue-600 text-white font-medium py-2 px-4 rounded-xl shadow hover:bg-blue-700 transition"
					on:click={addEntry}
					type="button"
				>
					+ Add a statistic
				</button>
			</div>
			<!-- End folder -->
		{/if}

		<!-- Summary -->
		{#if activeTab === 1}
			<div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
				<div class="flex flex-row gap-2">
					<span class="font-semibold lg:w-32">Level visualizer:</span>
					<input class="border p-1 rounded w-16" type="number" readonly bind:value={level} />
					<input
						class="border p-1 flex-5 rounded"
						type="range"
						step="1"
						min="1"
						max="60"
						bind:value={level}
					/>
				</div>
				<div></div>
				<div class="flex flex-col gap-2">
					<div class="flex flex-row gap-2">
						<span class="font-semibold w-48 lg:w-32">Name:</span>
						<span>{selectedMonster.name}</span>
					</div>
					<div class="flex flex-row gap-2">
						<span class="font-semibold w-48 lg:w-32">Description:</span>
						<span>{selectedMonster.description}</span>
					</div>
					<!-- Les 6 premiers éléments -->
					{#each Object.entries(selectedMonster.stats).filter( ([key]) => key.includes('Base') ) as [key, value]}
						{#if value > 0}
							<div class="flex flex-row gap-2">
								<span class="font-semibold w-48 lg:w-32">{key}:</span>
								<Tooltip type="light">{statOf(key)?.description}</Tooltip>
								{#if key.includes('%')}
									<span>{value}</span>
								{:else}
									<span>{value * level}</span>
								{/if}
							</div>
						{/if}
					{/each}
				</div>

				<div class="flex flex-col gap-2">
					<!-- Le reste des éléments filtrés -->
					{#each Object.entries(selectedMonster.stats).filter(([key]) => !key.includes('Base')) as [key, value]}
						{#if value > 0}
							<div class="flex flex-row gap-2">
								<span class="font-semibold w-48">{key}:</span>
								<Tooltip type="light">{statOf(key)?.description}</Tooltip>
								{#if key.includes('%')}
									<span>{value}</span>
								{:else}
									<span>{value * level}</span>
								{/if}
							</div>
						{/if}
					{/each}
				</div>
			</div>
		{/if}

		{#if errors.length > 0 || !isCommonGood}
			<ul class="list-disc list-inside text-red-600 text-sm space-y-1 mt-5">
				{#each errors as error}
					<li>{error.message}</li>
				{/each}
				{#if !isCommonGood}
					<li>The overall statistics fields should be between {thresholdMin} and {thresholdMax}</li>
				{/if}
			</ul>
		{/if}

		<!-- Actions -->
		{#if $isAuthenticated}
			<div class="flex justify-end gap-4 mt-6">
				<button
					class="px-4 py-2 bg-red-500 text-white rounded cursor-pointer hover:bg-red-600"
					on:click={deleteMonster}
				>
					Supprimer
				</button>
				{#if selectedMonster._id !== '-1'}
					<button
						class="px-4 py-2 bg-blue-500 text-white rounded cursor-pointer hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
						disabled={!isAllGood}
						on:click={updateMonster}
					>
						Update
					</button>
				{:else}
					<button
						class="px-4 py-2 bg-green-500 text-white rounded cursor-pointer hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
						disabled={!isAllGood}
						on:click={createMonster}
					>
						Create
					</button>
				{/if}
			</div>
		{/if}
	</div>
{/if}
