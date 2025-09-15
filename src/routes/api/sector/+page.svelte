<script lang="ts">
	import { onMount } from 'svelte';
	import api from '../../../lib/api'; // ton axios configuré
	import { isAuthenticated } from '$lib/stores/auth';
	import { Tooltip } from 'flowbite-svelte';
	import { validateSector } from './SectorValidator';
	import type { ValidationError } from './SectorValidator';
	import { RangeSlider } from 'svelte-range-slider-pips';
	import { searchQuery } from '$lib/stores/search';

	type Sector = {
		api_id: string;
		name: string;
		description: string;
		level_min: number;
		level_max: number;
		monster_density: number;
		respawn_rate: number;
		area: string;
		monsters: string[];
	};

	type Area = {
		_id: string;
		api_id: string;
		name: string;
		description: string;
		position_x: number;
		position_y: number;
	};

	type Monster = {
		_id: string;
		api_id: string;
		name: string;
		description: string;
		stats: Record<string, number>;
	};

	let sectors: Sector[] = [];
	let monsters: Monster[] = [];
	let areas: Area[] = [];
	let selectedSector: Sector | null = null;
	let activeTab = 0;
	let minmax = [20, 40];
	let monster_query: string = '';

	let errors: ValidationError[] = [];

	// Récupérer les sectors
	onMount(async () => {
		const sectorRes = await api.get('/sector');
		sectors = sectorRes.data;

		const monsterRes = await api.get('/monster');
		monsters = monsterRes.data;

		const areaRes = await api.get('/area');
		areas = areaRes.data;
	});

	// Sélection d’un sector
	function selectSector(sector: Sector) {
		selectedSector = sector;
		minmax = [selectedSector.level_min, selectedSector.level_max];
	}

	async function deleteSector() {
		if (!selectedSector) return;
		await api.delete(`/sector/${selectedSector.api_id}`);
		sectors = sectors.filter((j) => j.api_id !== selectedSector!.api_id);
		selectedSector = null;
	}

	async function updateSector() {
		if (!selectedSector) return;
		await api.put(`/sector/${selectedSector.api_id}`, selectedSector);
		alert('Sector updated!');
	}

	async function createSector() {
		// Exemple : créer un sector vide ou avec valeurs par défaut
		const res = await api.post('/sector', selectedSector);
		const newSector = res.data;

		// Ajouter le nouveau sector à la liste et le sélectionner
		sectors = [newSector, ...sectors];
		selectedSector = newSector;
		activeTab = 0;
	}

	function createEmptySector(): Sector {
		const newSector: Sector = {
			api_id: '-1',
			name: '',
			description: '',
			level_min: 1,
			level_max: 5,
			monster_density: 3,
			respawn_rate: 2,
			area: '',
			monsters: []
		};

		return newSector;
	}

	function isEmptyOrWhitespace(str: string): boolean {
		return str.trim().length === 0;
	}

	function queryMonsters(query: string) {
		if (isEmptyOrWhitespace(query)) return monsters;

		return monsters.filter((m) => m.name.toUpperCase().includes(query.toUpperCase()));
	}

	function isSelected(id: string) {
		return selectedSector!.monsters.includes(id);
	}

	function addMonster(monster: Monster) {
		const exists = selectedSector!.monsters.includes(monster._id);

		selectedSector = {
			...selectedSector!,
			monsters: exists
				? selectedSector!.monsters.filter((id) => id !== monster._id)
				: [...selectedSector!.monsters, monster._id]
		};
	}

	function getArea(id: string) {
		return areas.find((a) => a._id == id);
	}

	function getMonsters(ids: string[]) {
		return monsters.filter((m) => ids.includes(m._id));
	}

	function updateSectorMinMax() {
		selectedSector = {
			...selectedSector!,
			level_min: minmax[0],
			level_max: minmax[1]
		};
	}

	$: filteredItems = sectors.filter((e: Sector) => e.name.toUpperCase().includes($searchQuery.toUpperCase()));
	$: errors = validateSector(selectedSector);
	$: isAllGood = errors.length === 0;
</script>

<!-- Grid des sector -->
<div class="grid grid-cols-2 lg:grid-cols-6 gap-4 p-4">
	{#each filteredItems as sector}
		<button
			class="p-4 bg-blue-100 rounded cursor-pointer hover:bg-green-200 transition"
			on:click={() => selectSector(sector)}
		>
			<p>ID: {sector.api_id}</p>
			<h3 class="font-bold">{sector.name}</h3>
		</button>
	{/each}

	{#if $isAuthenticated}
		<button
			class="p-4 bg-green-100 rounded cursor-pointer hover:bg-green-200 transition"
			on:click={() => selectSector(createEmptySector())}
		>
			<h3 class="font-bold">Create a sector</h3>
		</button>
	{/if}
</div>

<!-- Détails -->
{#if selectedSector}
	<div class="mt-6 mb-4 p-4 border rounded bg-gray-50 w-full lg:w-5/6 xl:w-3/4 mx-auto">
		<div class="flex justify-between items-center">
			<h2 class="text-xl font-bold">
				{#if selectedSector!.api_id === '-1'}[Create]{/if}
				{selectedSector.name}
			</h2>
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
				Monsters
			</button>
			<button
				class={`px-4 cursor-pointer py-2 ${activeTab === 2 ? 'border-b-2 border-blue-500 font-bold' : ''}`}
				on:click={() => (activeTab = 2)}
			>
				Summary
			</button>
		</div>

		<!-- Onglet 1 -->
		{#if activeTab === 0}
			<div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
				<div class="flex flex-row gap-2">
					<span class="font-semibold lg:w-64">Name:</span>
					<input class="border p-1 flex-1 rounded" bind:value={selectedSector.name} />
				</div>
				<div class="flex flex-row gap-2">
					<span class="font-semibold lg:w-64">Description:</span>
					<input class="border p-1 flex-1 rounded" bind:value={selectedSector.description} />
				</div>
				<div class="flex flex-row gap-2">
					<span class="font-semibold lg:w-64">Monster density:</span>
					<Tooltip
						>The number of monster the player will fight at the same time before a respawn.</Tooltip
					>
					<input class="border p-1 flex-1 rounded" bind:value={selectedSector.monster_density} />
				</div>
				<div class="flex flex-row gap-2">
					<span class="font-semibold lg:w-64">Respawn rate:</span>
					<Tooltip
						>The time between two respawn after all the monster in fight has been cleared.</Tooltip
					>
					<input class="border p-1 flex-1 rounded" bind:value={selectedSector.respawn_rate} />
				</div>
				<div class="flex flex-row gap-2">
					<span class="font-semibold lg:w-64">Area:</span>
					<select
						class="border p-1 flex-1 rounded focus:ring focus:ring-black-300 outline-none flex-1"
						bind:value={selectedSector.area}
					>
						{#each areas as area}
							<option value={area._id}>{area.name}</option>
						{/each}
					</select>
				</div>
			</div>
			<div class="flex flex-row gap-2 mt-4">
				<span class="font-semibold lg:w-64">Level range:</span>
				<Tooltip>
					<p>If you set 0 as min level, this is considered as a starting area.</p>
				</Tooltip>
				<RangeSlider
					class="border p-1 flex-1 rounded"
					bind:values={minmax}
					on:change={updateSectorMinMax}
					rangeFloat
					pips
					step={1}
					pipstep={10}
					all={false}
					first="label"
					last="label"
					rest="label"
					range
					pushy
					rangeGapMin={3}
					min={0}
					max={60}
				/>
			</div>
			<!-- End folder -->
		{/if}

		<!-- Monsters -->
		{#if activeTab === 1}
			<div class="">
				<div class="relative z-0 mb-4">
					<input
						type="text"
						id="monster_query"
						bind:value={monster_query}
						class="block py-2.5 px-0 w-full text-sm text-gray-900 bg-transparent border-0 border-b-2 border-gray-300 appearance-none dark:text-white dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:border-blue-600 peer"
						placeholder=" "
					/>
					<label
						for="monster_query"
						class="absolute text-sm text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:start-0 peer-focus:text-blue-600 peer-focus:dark:text-blue-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6 rtl:peer-focus:translate-x-1/4 rtl:peer-focus:left-auto"
						>Search by name...</label
					>
				</div>
				{#each queryMonsters(monster_query) as monster}
					<button
						on:click={(e) => addMonster(monster)}
						class="text-gray-900 border border-gray-300 focus:outline-none focus:ring-4 focus:ring-gray-100 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 dark:bg-gray-800 dark:text-white dark:border-gray-600 dark:hover:bg-gray-700 dark:hover:border-gray-600 dark:focus:ring-gray-700"
						class:bg-blue-300={isSelected(monster._id)}
						class:hover:bg-red-300={isSelected(monster._id)}
						class:bg-white={!isSelected(monster._id)}
						class:hover:bg-green-300={!isSelected(monster._id)}
					>
						{monster.name}
					</button>
				{/each}
			</div>
		{/if}

		<!-- Summary -->
		{#if activeTab === 2}
			<div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
				<div class="flex flex-col gap-2">
					<div class="flex flex-row gap-2">
						<span class="font-semibold w-48 lg:w-32">Name:</span>
						<span>{selectedSector.name}</span>
					</div>
					<div class="flex flex-row gap-2">
						<span class="font-semibold w-48 lg:w-32">Description:</span>
						<span>{selectedSector.description}</span>
					</div>
					<div class="flex flex-row gap-2">
						<span class="font-semibold w-48 lg:w-32">Monster density :</span>
						<span>{selectedSector.monster_density}</span>
					</div>
					<div class="flex flex-row gap-2">
						<span class="font-semibold w-48 lg:w-32">Respawn rate :</span>
						<span>{selectedSector.respawn_rate}</span>
					</div>
				</div>
				<div class="flex flex-col gap-2">
					<div class="flex flex-row gap-2">
						<span class="font-semibold w-48 lg:w-32">Area :</span>
						<span>{getArea(selectedSector.area)?.name || 'Error'}</span>
					</div>
					<div class="flex flex-row gap-2">
						<span class="font-semibold w-48 lg:w-32">Level Range :</span>
						<span>{selectedSector.level_min === 0 ? "[Starting area] " : ""}[{selectedSector.level_min} - {selectedSector.level_max}]</span>
					</div>
					<div class="flex flex-row gap-2">
						<span class="font-semibold w-48 lg:w-32">Monsters :</span>
						<span
							>{getMonsters(selectedSector.monsters)
								.map((m) => m.name)
								.join(', ')}</span
						>
					</div>
				</div>
			</div>
		{/if}

		{#if errors.length > 0}
			<ul class="list-disc list-inside text-red-600 text-sm space-y-1 mt-5">
				{#each errors as error}
					<li>{error.message}</li>
				{/each}
			</ul>
		{/if}

		<!-- Actions -->
		{#if $isAuthenticated}
			<div class="flex justify-end gap-4 mt-6">
				<button
					class="px-4 py-2 bg-red-500 text-white rounded cursor-pointer hover:bg-red-600"
					on:click={deleteSector}
				>
					Supprimer
				</button>
				{#if selectedSector.api_id !== '-1'}
					<button
						class="px-4 py-2 bg-blue-500 text-white rounded cursor-pointer hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
						disabled={!isAllGood}
						on:click={updateSector}
					>
						Update
					</button>
				{:else}
					<button
						class="px-4 py-2 bg-green-500 text-white rounded cursor-pointer hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
						disabled={!isAllGood}
						on:click={createSector}
					>
						Create
					</button>
				{/if}
			</div>
		{/if}
	</div>
{/if}
