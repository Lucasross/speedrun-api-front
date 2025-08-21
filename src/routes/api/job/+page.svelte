<script lang="ts">
	import { onMount } from 'svelte';
	import api from '../../../lib/api'; // ton axios configuré
	import { isAuthenticated } from '$lib/stores/auth';

	type Job = {
		id: number;
		name: string;
		[key: string]: any; // autres champs dynamiques
	};

	let jobs: Job[] = [];
	let selectedJob: Job | null = null;
	let activeTab = 0;

	// Récupérer les jobs
	onMount(async () => {
		const res = await api.get('/jobs');
		jobs = res.data;
	});

	// Sélection d’un job
	function selectJob(job: Job) {
		selectedJob = job;
	}

	async function deleteJob() {
		if (!selectedJob) return;
		await api.delete(`/jobs/${selectedJob.id}`);
		jobs = jobs.filter((j) => j.id !== selectedJob!.id);
		selectedJob = null;
	}

	async function updateJob() {
		if (!selectedJob) return;
    console.log(selectedJob._id)
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
		const newJob: Job = { id: -1, name: '' };

		const firstJob = jobs[0];

		Object.keys(firstJob)
			.slice(1, -1)
			.forEach((key) => {
				if (!(key in newJob)) {
					newJob[key] = typeof firstJob[key] === 'number' ? 0 : '';
				}
			});

		return newJob;
	}

	function getEntries(job: Job) {
		return Object.entries(job).slice(1); // skip la 1ère entrée
	}
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
		<h2 class="text-xl font-bold mb-4">Détails du Job</h2>

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
		</div>

		<!-- Onglet 1 -->
		{#if activeTab === 0}
			<div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
				{#each getEntries(selectedJob).slice(0, 12) as [key, value]}
					<div class="flex flex-col lg:flex-row gap-2">
						<span class="font-semibold lg:w-64">{key}:</span>
						<input class="border p-1 flex-1 rounded" bind:value={selectedJob[key]} />
					</div>
				{/each}
			</div>
		{/if}

		<!-- Onglet 2 -->
		{#if activeTab === 1}
			<div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
				{#each getEntries(selectedJob).slice(12, 20) as [key, value]}
					<div class="flex flex-col lg:flex-row gap-2">
						<span class="font-semibold lg:w-64">{key}:</span>
						<input class="border p-1 flex-1 rounded" bind:value={selectedJob[key]} />
					</div>
				{/each}
			</div>
		{/if}

		{#if activeTab === 2}
			<div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
				{#each getEntries(selectedJob).slice(20, 34) as [key, value]}
					<!-- enlève le dernier -->
					<div class="flex flex-col lg:flex-row gap-2">
						<span class="font-semibold lg:w-64">{key}:</span>
						<input class="border p-1 flex-1 rounded" bind:value={selectedJob[key]} />
					</div>
				{/each}
			</div>
		{/if}

		{#if activeTab === 3}
			<div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
				{#each getEntries(selectedJob).slice(34, 62) as [key, value]}
					<!-- enlève le dernier -->
					<div class="flex flex-col lg:flex-row gap-2">
						<span class="font-semibold lg:w-64">{key}:</span>
						<input class="border p-1 flex-1 rounded" bind:value={selectedJob[key]} />
					</div>
				{/each}
			</div>
		{/if}

		{#if activeTab === 4}
			<div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
				{#each getEntries(selectedJob).slice(62, -1) as [key, value]}
					<!-- enlève le dernier -->
					<div class="flex flex-col lg:flex-row gap-2">
						<span class="font-semibold lg:w-64">{key}:</span>
						<input class="border p-1 flex-1 rounded" bind:value={selectedJob[key]} />
					</div>
				{/each}
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
						class="px-4 py-2 bg-blue-500 text-white rounded cursor-pointer hover:bg-blue-600"
						on:click={updateJob}
					>
						Update
					</button>
				{:else}
					<button
						class="px-4 py-2 bg-green-500 text-white rounded cursor-pointer hover:bg-blue-600"
						on:click={createJob}
					>
						Create
					</button>
				{/if}
			</div>
		{/if}
	</div>
{/if}
