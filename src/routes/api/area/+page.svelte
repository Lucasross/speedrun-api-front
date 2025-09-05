<script lang="ts">
	import { onMount } from 'svelte';
	import api from '../../../lib/api'; // ton axios configuré
	import { isAuthenticated } from '$lib/stores/auth';

	type Area = {
		_id: string;
		name: string;
		description: string;
		position_x: number;
		position_y: number;
	};

	let areas: Area[] = [];
	let selectedArea: Area | null = null;
	let activeTab = 0;

	// Récupérer les areas
	onMount(async () => {
		const areaRes = await api.get('/area');
		areas = areaRes.data;
	});

	// Sélection d’un area
	function selectArea(area: Area) {
		selectedArea = area;
	}

	async function deleteArea() {
		if (!selectedArea) return;
		await api.delete(`/area/${selectedArea._id}`);
		areas = areas.filter((j) => j._id !== selectedArea!._id);
		selectedArea = null;
	}

	async function updateArea() {
		if (!selectedArea) return;
		await api.put(`/area/${selectedArea._id}`, selectedArea);
		alert('Area updated!');
	}

	async function createArea() {
		// Exemple : créer un area vide ou avec valeurs par défaut
		const res = await api.post('/area', selectedArea);
		const newArea = res.data;

		// Ajouter le nouveau area à la liste et le sélectionner
		areas = [newArea, ...areas];
		selectedArea = newArea;
		activeTab = 0;
	}

	function createEmptyArea(): Area {
		const defaultStats: Record<string, number> = {};

		const newArea: Area = {
			_id: '-1',
			name: '',
			description: '',
			position_x: 0.25,
			position_y: 0.25
		};

		return newArea;
	}

	// Dragging
	let container: HTMLDivElement | null = null;
	let isDragging: boolean = false;

	function startDrag(event: MouseEvent | TouchEvent) {
		isDragging = true;
		event.preventDefault();
	}

	function moveDrag(clientX: number, clientY: number) {
		if (!container || !isDragging) return;

		const rect = container.getBoundingClientRect();
		const x = (clientX - rect.left) / rect.width;
		const y = (clientY - rect.top) / rect.height;

		// clamp entre 0 et 1
		selectedArea!.position_x = Math.round(Math.min(Math.max(x, 0), 1) * 1000) / 1000;
		selectedArea!.position_y = Math.round(Math.min(Math.max(y, 0), 1) * 1000) / 1000;
	}

	function onMouseMove(e: MouseEvent) {
		moveDrag(e.clientX, e.clientY);
	}

	function onTouchMove(e: TouchEvent) {
		if (e.touches.length > 0) {
			moveDrag(e.touches[0].clientX, e.touches[0].clientY);
		}
	}

	function endDrag() {
		isDragging = false;
	}

	$: displayNames = true;
</script>

<!-- Grid des areas -->
<div class="grid grid-cols-2 lg:grid-cols-6 gap-4 p-4">
	{#each areas as area}
		<button
			class="p-4 bg-blue-100 rounded cursor-pointer hover:bg-green-200 transition"
			on:click={() => selectArea(area)}
		>
			<p>ID: {area._id}</p>
			<h3 class="font-bold">{area.name}</h3>
		</button>
	{/each}

	{#if $isAuthenticated}
		<button
			class="p-4 bg-green-100 rounded cursor-pointer hover:bg-green-200 transition"
			on:click={() => selectArea(createEmptyArea())}
		>
			<h3 class="font-bold">Create a area</h3>
		</button>
	{/if}
</div>

<!-- Détails -->
{#if selectedArea}
	<div class="mt-6 p-4 border rounded bg-gray-50 w-full lg:w-5/6 xl:w-3/4 mx-auto">
		<div class="flex justify-between items-center">
			<h2 class="text-xl font-bold">{selectedArea.name}</h2>
		</div>

		<!-- Tabs -->
		<div class="grid lg:flex border-b mb-4">
			<button
				class={`px-4 cursor-pointer py-2 ${activeTab === 0 ? 'border-b-2 border-blue-500 font-bold' : ''}`}
				on:click={() => (activeTab = 0)}
			>
				Required
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
					<input class="border p-1 flex-1 rounded" bind:value={selectedArea.name} />
				</div>
				<div class="flex flex-row gap-2">
					<span class="font-semibold lg:w-64">Description:</span>
					<input class="border p-1 flex-1 rounded" bind:value={selectedArea.description} />
				</div>
				<div class="flex flex-row gap-2">
					<span class="font-semibold lg:w-32">Position X:</span>
					<input
						class="border p-1 rounded w-16"
						type="number"
						readonly
						bind:value={selectedArea.position_x}
					/>
					<input
						class="border p-1 flex-5 rounded"
						type="range"
						step="0.001"
						min="0"
						max="1"
						bind:value={selectedArea.position_x}
					/>
				</div>
				<div class="flex flex-row gap-2">
					<span class="font-semibold lg:w-32">Position Y:</span>
					<input
						class="border p-1 rounded w-16"
						type="number"
						readonly
						bind:value={selectedArea.position_y}
					/>
					<input
						class="border p-1 flex-5 rounded"
						type="range"
						step="0.001"
						min="0"
						max="1"
						bind:value={selectedArea.position_y}
					/>
				</div>
			</div>
			<!-- End Col -->
			<!-- World map -->
			<div class="mt-5">
				<p>The blue circle represent the direct neighbour. If there is none, the closest area is selected to be the only neighbor.</p>
				<div class="">
					<span>Display names:</span>
					<input type="checkbox" class="border p-1 rounded" bind:checked={displayNames} />
				</div>
			</div>
			<div
				role="none"
				class="relative w-full h-75 bg-gray-200 border border-gray-700 mt-2 touch-none"
				bind:this={container}
				on:mousemove={onMouseMove}
				on:mouseup={endDrag}
				on:mouseleave={endDrag}
				on:touchmove={onTouchMove}
				on:touchend={endDrag}
				on:touchcancel={endDrag}
			>
				<!-- Neighbour -->
				<div
					class="absolute bg-blue-500 opacity-50"
					style="left: {selectedArea.position_x * 100}%; top: {selectedArea.position_y * 100}%;
						width: 35%; height: 35%;
						border-radius: 50%; transform: translate(-50%, -50%);"
				></div>
				<!-- Others area -->
				{#each areas.filter(area => area !== selectedArea) as area}
					<div
						class="absolute w-3 h-3 bg-yellow-500 rounded-full"
						style="left: {area.position_x * 100}%; top: {area.position_y *
							100}%; transform: translate(-50%, -50%);"
					>
						{#if displayNames}
							<p class="relative text-xs" style="left: -15px; top:-15px">{area.name}</p>
						{/if}
					</div>
				{/each}
				<!-- Current area -->
				<div
					role="none"
					class="absolute w-3 h-3 bg-red-500 rounded-full cursor-pointer"
					style="left: {selectedArea.position_x * 100}%; top: {selectedArea.position_y * 100}%; 
					transform: translate(-50%, -50%);"
					on:mousedown={(e) => startDrag(e)}
					on:touchstart={(e) => startDrag(e)}
				>
					<p class="relative text-xs" style="left: -15px; top:-15px">{selectedArea.name}</p>
				</div>
			</div>
		{/if}

		<!-- Summary -->
		{#if activeTab === 1}
			<div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
				<div class="flex flex-col gap-2">
					<div class="flex flex-row gap-2">
						<span class="font-semibold w-48 lg:w-32">Name:</span>
						<span>{selectedArea.name}</span>
					</div>
					<div class="flex flex-row gap-2">
						<span class="font-semibold w-48 lg:w-32">Description:</span>
						<span>{selectedArea.description}</span>
					</div>
					<div class="flex flex-row gap-2">
						<span class="font-semibold w-48 lg:w-32">Position:</span>
						<span>[{selectedArea.position_x};{selectedArea.position_y}]</span>
					</div>
				</div>
			</div>
		{/if}

		<!-- Actions -->
		{#if $isAuthenticated}
			<div class="flex justify-end gap-4 mt-6">
				<button
					class="px-4 py-2 bg-red-500 text-white rounded cursor-pointer hover:bg-red-600"
					on:click={deleteArea}
				>
					Delete
				</button>
				{#if selectedArea._id !== '-1'}
					<button
						class="px-4 py-2 bg-blue-500 text-white rounded cursor-pointer hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
						on:click={updateArea}
					>
						Update
					</button>
				{:else}
					<button
						class="px-4 py-2 bg-green-500 text-white rounded cursor-pointer hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
						on:click={createArea}
					>
						Create
					</button>
				{/if}
			</div>
		{/if}
	</div>
{/if}
