<script lang="ts">
	import { onMount } from 'svelte';
	import api from '../../../lib/api'; // ton axios configuré
	import { isAuthenticated } from '$lib/stores/auth';

	type Job = {
		id: number;
		name: string;
		description: string;
		stats: Record<string, number>;
		[key: string]: any;
	};

	type Stat = {
		name: string;
		description: string;
		type: string;
		weight: number;
		defaultValue: number;
	};

	let jobs: Job[] = [];
	let stats: Stat[] = [];
	let selectedJob: Job | null = null;
	let activeTab = 0;

	// Total pondéré
	$: totalCommon = selectedJob
		? Object.entries(selectedJob.stats).reduce((sum, [key, val]) => {
				const stat = stats.find((s) => s.name === key);

				if (stat?.type === 'common') {
					const weight = stat ? stat.weight : 1;
					return sum + val * weight;
				}

				return sum;
			}, 0)
		: 0;

	$: totalPhyMagReg = selectedJob
		? Object.entries(selectedJob.stats).reduce((sum, [key, val]) => {
				const stat = stats.find((s) => s.name === key);

				if (['physical', 'magic', 'regeneration'].includes(stat!.type)) {
					const weight = stat ? stat.weight : 1;
					return sum + val * weight;
				}

				return sum;
			}, 0)
		: 0;

	// Récupérer les jobs
	onMount(async () => {
		const jobRes = await api.get('/jobs');
		jobs = jobRes.data;
		const statRes = await api.get('/stats');
		stats = statRes.data;
	});

	// Sélection d’un job
	function selectJob(job: Job) {
		selectedJob = job;
	}

	async function deleteJob() {
		if (!selectedJob) return;
		await api.delete(`/jobs/${selectedJob._id}`);
		jobs = jobs.filter((j) => j._id !== selectedJob!._id);
		selectedJob = null;
	}

	async function updateJob() {
		if (!selectedJob) return;
		console.log(selectedJob._id);
		await api.put(`/jobs/${selectedJob._id}`, selectedJob);
		alert('Job mis à jour !');
	}

	async function createJob() {
		// Exemple : créer un job vide ou avec valeurs par défaut
		const res = await api.post('/jobs', selectedJob);
		const newJob = res.data;

		// Ajouter le nouveau job à la liste et le sélectionner
		jobs = [newJob, ...jobs];
		selectedJob = newJob;
		activeTab = 0;
	}

	function createEmptyJob(): Job {
		const defaultStats = stats.reduce(
			(acc, stat) => {
				acc[stat.name] = stat.defaultValue ?? 0;
				return acc;
			},
			{} as Record<string, number>
		);

		const newJob: Job = { id: -1, name: '', description: '', stats: defaultStats };

		return newJob;
	}

	function getEntries(job: Job) {
		return Object.keys(job.stats);
	}

	$: isCommonGood = totalCommon >= 150 && totalCommon <= 180;
	$: isPowerGood = totalPhyMagReg >= 180 && totalPhyMagReg <= 205;
	$: isAllGood = isCommonGood && isPowerGood;
</script>

<!-- Grid des jobs -->
<div class="grid grid-cols-2 lg:grid-cols-6 gap-4 p-4">
	{#each jobs as job}
		<button
			class="p-4 bg-blue-100 rounded cursor-pointer hover:bg-green-200 transition"
			on:click={() => selectJob(job)}
		>
			<p>ID: {job._id}</p>
			<h3 class="font-bold">{job.name}</h3>
		</button>
	{/each}

	{#if $isAuthenticated}
		<button
			class="p-4 bg-green-100 rounded cursor-pointer hover:bg-green-200 transition"
			on:click={() => selectJob(createEmptyJob())}
		>
			<h3 class="font-bold">Create a job</h3>
		</button>
	{/if}
</div>

<!-- Détails -->
{#if selectedJob}
	<div class="mt-6 p-4 border rounded bg-gray-50 w-full lg:w-5/6 xl:w-3/4 mx-auto">
		<div class="flex justify-between items-center">
			<h2 class="text-xl font-bold">Détails du Job</h2>
			<div class="flex flex-col items-start">
				<span class={`text-lg font-semibold ${!isCommonGood ? 'text-red-500' : 'text-green-500'}`}>
					Common: {totalCommon}
					{#if !isCommonGood}(150 - 180){/if}
				</span>
				<span class={`text-lg font-semibold ${!isPowerGood ? 'text-red-500' : 'text-green-500'}`}>
					Power: {totalPhyMagReg}
					{#if !isPowerGood}(180 - 205){/if}
				</span>
			</div>
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
				Common
			</button>
			<button
				class={`px-4 cursor-pointer py-2 ${activeTab === 2 ? 'border-b-2 border-blue-500 font-bold' : ''}`}
				on:click={() => (activeTab = 2)}
			>
				Physical
			</button>
			<button
				class={`px-4 cursor-pointer py-2 ${activeTab === 3 ? 'border-b-2 border-blue-500 font-bold' : ''}`}
				on:click={() => (activeTab = 3)}
			>
				Magical
			</button>
			<button
				class={`px-4 cursor-pointer py-2 ${activeTab === 4 ? 'border-b-2 border-blue-500 font-bold' : ''}`}
				on:click={() => (activeTab = 4)}
			>
				Regeneration
			</button>
			<button
				class={`px-4 cursor-pointer py-2 ${activeTab === 5 ? 'border-b-2 border-blue-500 font-bold' : ''}`}
				on:click={() => (activeTab = 5)}
			>
				Summary
			</button>
		</div>

		<!-- Onglet 1 -->
		{#if activeTab === 0}
			<div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
				<div class="flex flex-col lg:flex-row gap-2">
					<span class="font-semibold lg:w-64">Name:</span>
					<input class="border p-1 flex-1 rounded" bind:value={selectedJob.name} />
				</div>
				<div class="flex flex-col lg:flex-row gap-2">
					<span class="font-semibold lg:w-64">Description:</span>
					<input class="border p-1 flex-1 rounded" bind:value={selectedJob.description} />
				</div>
			</div>
		{/if}

		<!-- Onglet 2 -->
		{#if activeTab === 1}
			<div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
				{#each getEntries(selectedJob).slice(6, 16) as key}
					<div class="flex flex-col lg:flex-row gap-2">
						<span class="font-semibold lg:w-64">{key}:</span>
						<input class="border p-1 flex-1 rounded" bind:value={selectedJob.stats[key]} />
					</div>
				{/each}
			</div>
		{/if}

		{#if activeTab === 2}
			<div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
				{#each getEntries(selectedJob).slice(16, 34) as key}
					<!-- enlève le dernier -->
					<div class="flex flex-col lg:flex-row gap-2">
						<span class="font-semibold lg:w-64">{key}:</span>
						<input class="border p-1 flex-1 rounded" bind:value={selectedJob.stats[key]} />
					</div>
				{/each}
			</div>
		{/if}

		{#if activeTab === 3}
			<div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
				{#each getEntries(selectedJob).slice(34, 60) as key}
					<!-- enlève le dernier -->
					<div class="flex flex-col lg:flex-row gap-2">
						<span class="font-semibold lg:w-64">{key}:</span>
						<input class="border p-1 flex-1 rounded" bind:value={selectedJob.stats[key]} />
					</div>
				{/each}
			</div>
		{/if}

		{#if activeTab === 4}
			<div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
				{#each getEntries(selectedJob).slice(60) as key}
					<!-- enlève le dernier -->
					<div class="flex flex-col lg:flex-row gap-2">
						<span class="font-semibold lg:w-64">{key}:</span>
						<input class="border p-1 flex-1 rounded" bind:value={selectedJob.stats[key]} />
					</div>
				{/each}
			</div>
		{/if}

		{#if activeTab === 5}
			<div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
				<div class="flex flex-col gap-2">
					<div class="flex flex-col md:flex-row gap-2 items-center">
						<span class="font-semibold w-32">Name:</span>
						<span>{selectedJob.name}</span>
					</div>
					<div class="flex flex-col md:flex-row gap-2 items-center">
						<span class="font-semibold w-32">Description:</span>
						<span>{selectedJob.description}</span>
					</div>
					<!-- Les 6 premiers éléments -->
					{#each Object.entries(selectedJob.stats).slice(6, 16) as [key, value]}
						{#if value > 0}
							<div class="flex flex-col md:flex-row gap-2 items-center">
								<span class="font-semibold w-32">{key}:</span>
								<span>{value}</span>
							</div>
						{/if}
					{/each}
				</div>

				<div class="flex flex-col gap-2">
					<!-- Le reste des éléments filtrés -->
					{#each Object.entries(selectedJob.stats).slice(16) as [key, value]}
						{#if value > 0}
							<div class="flex flex-col md:flex-row gap-2 items-center">
								<span class="font-semibold w-48">{key}:</span>
								<span>{value}</span>
							</div>
						{/if}
					{/each}
				</div>
			</div>
		{/if}

		<!-- Actions -->
		{#if $isAuthenticated}
			<div class="flex justify-end gap-4 mt-6">
				<button
					class="px-4 py-2 bg-red-500 text-white rounded cursor-pointer hover:bg-red-600"
					on:click={deleteJob}
				>
					Supprimer
				</button>
				{#if selectedJob.id !== -1}
					<button
						class="px-4 py-2 bg-blue-500 text-white rounded cursor-pointer hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
						disabled={!isAllGood}
						on:click={updateJob}
					>
						Update
					</button>
				{:else}
					<button
						class="px-4 py-2 bg-green-500 text-white rounded cursor-pointer hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
						disabled={!isAllGood}
						on:click={createJob}
					>
						Create
					</button>
				{/if}
			</div>
		{/if}
	</div>
{/if}
