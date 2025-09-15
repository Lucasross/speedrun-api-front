<script lang="ts">
	import { onMount } from 'svelte';
	import api from '../../../lib/api'; // ton axios configuré
	import { isAuthenticated } from '$lib/stores/auth';
	import { Tooltip } from 'flowbite-svelte';
	import { validateJob } from './JobValidator';
	import type { ValidationError } from './JobValidator';
	import { searchQuery } from '$lib/stores/search';

	type Job = {
		api_id: string;
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

	type Skill = {
		api_id: string;
		name: string;
		description: string;
		type: 'single' | 'multi' | 'passive' | 'buff' | 'active';
		level: number;
		stats: Record<string, number>;
		job: string;
	};

	let jobs: Job[] = [];
	let stats: Stat[] = [];
	let skills: Skill[] = [];
	let selectedJob: Job | null = null;
	let newEntry: string;
	let activeTab = 0;
	let thresholdMin = 200;
	let thresholdMax = 230;
	let level = 1;

	let errors: ValidationError[] = [];

	// Récupérer les jobs
	onMount(async () => {
		const jobRes = await api.get('/job');
		jobs = jobRes.data;

		const statRes = await api.get('/stats');
		stats = statRes.data.filter((obj: { usages: string[] }) => obj.usages.includes('job'));
	});

	// Sélection d’un job
	async function selectJob(job: Job) {
		selectedJob = job;
		const skillsRes = await api.get(`/job/${job.api_id}`);
		skills = skillsRes.data.skills;
		console.log(skillsRes.data);
	}

	async function deleteJob() {
		if (!selectedJob) return;
		await api.delete(`/job/${selectedJob.api_id}`);
		jobs = jobs.filter((j) => j.api_id !== selectedJob!.api_id);
		selectedJob = null;
	}

	async function updateJob() {
		if (!selectedJob) return;
		await api.put(`/job/${selectedJob.api_id}`, selectedJob);
		alert('Job updated!');
	}

	async function createJob() {
		// Exemple : créer un job vide ou avec valeurs par défaut
		const res = await api.post('/job', selectedJob);
		const newJob = res.data;

		// Ajouter le nouveau job à la liste et le sélectionner
		jobs = [newJob, ...jobs];
		selectedJob = newJob;
		activeTab = 0;
	}

	function createEmptyJob(): Job {
		const defaultStats: Record<string, number> = { 'Base Health': 100, 'Base Damage': 20 };

		const newJob: Job = {
			api_id: '-1',
			name: '',
			description: '',
			stats: defaultStats
		};

		return newJob;
	}

	function statOf(key: string): Stat | undefined {
		return stats.find((s) => s.name === key);
	}

	function addEntry() {
		selectedJob!.stats[newEntry] = statOf(newEntry)?.defaultValue || 0;
	}

	function updateKey(oldKey: string, newKey: string) {
		if (oldKey === newKey) return;

		selectedJob!.stats = Object.fromEntries(
			Object.entries(selectedJob!.stats).map(([k, v]) => (k === oldKey ? [newKey, v] : [k, v]))
		);
	}

	function removeKey(key: string) {
		selectedJob!.stats = Object.fromEntries(
			Object.entries(selectedJob!.stats).filter(([k]) => k !== key)
		);
	}

	$: totalCommon = selectedJob
		? Object.entries(selectedJob.stats).reduce((sum, [key, val]) => {
				const stat = stats.find((s) => s.name === key);

				if (!stat) return sum;

				const weight = stat ? stat.weight : 1;
				return sum + val * weight;
			}, 0)
		: 0;

	$: filteredItems = jobs.filter((e: Job) => e.name.toUpperCase().includes($searchQuery.toUpperCase()));
	$: errors = validateJob(selectedJob);
	$: isCommonGood = totalCommon >= thresholdMin && totalCommon <= thresholdMax;
	$: isAllGood = isCommonGood && errors.length === 0;
</script>

<!-- Grid des job -->
<div class="grid grid-cols-2 lg:grid-cols-6 gap-4 p-4">
	{#each filteredItems as job}
		<button
			class="p-4 bg-blue-100 rounded cursor-pointer hover:bg-green-200 transition"
			on:click={() => selectJob(job)}
		>
			<p>ID: {job.api_id}</p>
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
	<div class="mt-6 mb-4 p-4 border rounded bg-gray-50 w-full lg:w-5/6 xl:w-3/4 mx-auto">
		<div class="flex justify-between items-center">
			<h2 class="text-xl font-bold">
				{#if selectedJob!.api_id === '-1'}[Create]{/if}
				{selectedJob.name}
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
					<input class="border p-1 flex-1 rounded" bind:value={selectedJob.name} />
				</div>
				<div class="flex flex-row gap-2">
					<span class="font-semibold lg:w-64">Description:</span>
					<input class="border p-1 flex-1 rounded" bind:value={selectedJob.description} />
				</div>

				{#each Object.entries(selectedJob.stats) as [key, value], i}
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
							bind:value={selectedJob.stats[key]}
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
				<!-- Left part -->
				<div class="flex flex-col gap-2">
					<div class="flex flex-row gap-2">
						<span class="font-semibold w-48 lg:w-32">Name:</span>
						<span>{selectedJob.name}</span>
					</div>
					<div class="flex flex-row gap-2">
						<span class="font-semibold w-48 lg:w-32">Description:</span>
						<span>{selectedJob.description}</span>
					</div>
					{#each Object.entries(selectedJob.stats).filter( ([key]) => key.includes('Base') ) as [key, value]}
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

				<!-- Right part -->
				<div class="flex flex-col gap-2">
					{#each Object.entries(selectedJob.stats).filter(([key]) => !key.includes('Base')) as [key, value]}
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

			<!-- Skills -->
			<hr class="h-px my-8 bg-gray-200 border-0 dark:bg-gray-700" />
			<div>
				<h2 class="text-xl font-bold">Skills</h2>
				<div class="grid grid-cols-1 lg:grid-cols-3 gap-4">
					{#each skills.sort((a, b) => a.level - b.level) as skill}
						<div class="border-2 rounded p-2 bg-gray-200">
							<h3 class="font-bold">{skill.name} (Lv.{skill.level} - {skill.type})</h3>
							{#each Object.entries(skill.stats) as [key, value]}
								<p>{key}: {value}</p>
							{/each}
						</div>
						<Tooltip type="light">{skill.description}</Tooltip>
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
					on:click={deleteJob}
				>
					Supprimer
				</button>
				{#if selectedJob.api_id !== '-1'}
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
