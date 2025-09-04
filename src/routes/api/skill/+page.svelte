<script lang="ts">
	import { onMount } from 'svelte';
	import api from '../../../lib/api'; // ton axios configuré
	import { isAuthenticated } from '$lib/stores/auth';
	import { Tooltip } from 'flowbite-svelte';

	const skillType: string[] = ['single', 'multi', 'passive', 'buff', 'active'];

	type Skill = {
		_id: string;
		name: string;
		description: string;
		type: 'single' | 'multi' | 'passive' | 'buff' | 'active';
		level: number;
		stats: Record<string, number>;
		job: string;
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

	let skills: Skill[] = [];
	let stats: Stat[] = [];
	let jobs: Job[] = [];
	let selectedSkill: Skill | null = null;
	let newEntry: string;
	let activeTab = 0;
	let thresholdMin = 30;

	// Récupérer les skills
	onMount(async () => {
		const skillRes = await api.get('/skills');
		skills = skillRes.data;

		const statRes = await api.get('/stats');
		stats = statRes.data.filter((obj: { usages: string[] }) => obj.usages.includes('skill'));

		const jobRes = await api.get('/jobs');
		jobs = jobRes.data;
	});

	// Sélection d’un skill
	function selectSkill(skill: Skill) {
		selectedSkill = skill;
	}

	async function deleteSkill() {
		if (!selectedSkill) return;
		await api.delete(`/skills/${selectedSkill._id}`);
		skills = skills.filter((j) => j._id !== selectedSkill!._id);
		selectedSkill = null;
	}

	async function updateSkill() {
		if (!selectedSkill) return;
		await api.put(`/skills/${selectedSkill._id}`, selectedSkill);
		alert('Skill updated!');
	}

	async function createSkill() {
		// Exemple : créer un skill vide ou avec valeurs par défaut
		const res = await api.post('/skills', selectedSkill);
		const newSkill = res.data;

		// Ajouter le nouveau skill à la liste et le sélectionner
		skills = [newSkill, ...skills];
		selectedSkill = newSkill;
		activeTab = 0;
	}

	function createEmptySkill(): Skill {
		const defaultStats: Record<string, number> = {};

		const newSkill: Skill = {
			_id: '-1',
			name: '',
			description: '',
			type: 'single',
			level: 0,
			stats: defaultStats,
			job: '1'
		};

		return newSkill;
	}

	function statOf(key: string): Stat | undefined {
		return stats.find((s) => s.name === key);
	}

	function jobOf(_id: string): Job | undefined {
		return jobs.find((j) => (j._id = _id));
	}

	function addEntry() {
		selectedSkill!.stats[newEntry] = statOf(newEntry)?.defaultValue || 0;
	}

	function updateKey(oldKey: string, newKey: string) {
		if (oldKey === newKey) return;

		selectedSkill!.stats = Object.fromEntries(
			Object.entries(selectedSkill!.stats).map(([k, v]) => (k === oldKey ? [newKey, v] : [k, v]))
		);
	}

	function removeKey(key: string) {
		selectedSkill!.stats = Object.fromEntries(
			Object.entries(selectedSkill!.stats).filter(([k]) => k !== key)
		);
	}

	$: totalCommon = selectedSkill
		? Object.entries(selectedSkill.stats).reduce((sum, [key, val]) => {
				const stat = stats.find((s) => s.name === key);

				if (!stat) return sum;

				const weight = stat ? stat.weight : 1;
				return sum + val * weight;
			}, 0)
		: 0;

	$: thresholdOffset = (selectedSkill?.level || 0) * 1.5;
	$: thresholdMax = 50 + thresholdOffset;
	$: isCommonGood = totalCommon >= thresholdMin && totalCommon <= thresholdMax;
	$: isAllGood = isCommonGood;
</script>

<!-- Grid des skills -->
<div class="grid grid-cols-2 lg:grid-cols-6 gap-4 p-4">
	{#each skills as skill}
		<button
			class="p-4 bg-blue-100 rounded cursor-pointer hover:bg-green-200 transition"
			on:click={() => selectSkill(skill)}
		>
			<p>ID: {skill._id}</p>
			<h3 class="font-bold">{skill.name}</h3>
		</button>
	{/each}

	{#if $isAuthenticated}
		<button
			class="p-4 bg-green-100 rounded cursor-pointer hover:bg-green-200 transition"
			on:click={() => selectSkill(createEmptySkill())}
		>
			<h3 class="font-bold">Create a skill</h3>
		</button>
	{/if}
</div>

<!-- Détails -->
{#if selectedSkill}
	<div class="mt-6 p-4 border rounded bg-gray-50 w-full lg:w-5/6 xl:w-3/4 mx-auto">
		<div class="flex justify-between items-center">
			<h2 class="text-xl font-bold">{selectedSkill.name}</h2>
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
					<input class="border p-1 flex-1 rounded" bind:value={selectedSkill.name} />
				</div>
				<div class="flex flex-row gap-2">
					<span class="font-semibold lg:w-64">Description:</span>
					<input class="border p-1 flex-1 rounded" bind:value={selectedSkill.description} />
				</div>

				<div class="flex flex-row gap-2">
					<span class="font-semibold lg:w-64">Job:</span>
					<select
						class="border p-1 flex-1 rounded focus:ring focus:ring-black-300 outline-none flex-1"
						bind:value={selectedSkill.job}
					>
						{#each jobs as job}
							<option value={job._id}>{job.name}</option>
						{/each}
					</select>
				</div>

				<div class="flex flex-row gap-2">
					<span class="font-semibold lg:w-64">Level:</span>
					<input
						class="border p-1 rounded w-16"
						type="number"
						readonly
						bind:value={selectedSkill.level}
					/>
					<input
						class="border p-1 flex-5 rounded"
						type="range"
						step="5"
						min="0"
						max="60"
						bind:value={selectedSkill.level}
					/>
				</div>

				<div class="flex flex-row gap-2">
					<span class="font-semibold lg:w-64">Skill Type:</span>
					<Tooltip type="light"
						><bold>Single</bold>: Hit one target <br /> Multi: Hit all target <br /> Passive: Always
						in use <br /> Buff: Active only during a period of time on self <br /> Active: Active only
						during a period of time on all target</Tooltip
					>
					<select
						class="border p-1 flex-1 rounded focus:ring focus:ring-black-300 outline-none flex-1"
						bind:value={selectedSkill.type}
					>
						{#each skillType as type}
							<option value={type}>{type}</option>
						{/each}
					</select>
				</div>

				<div></div>

				{#each Object.entries(selectedSkill.stats) as [key, value], i}
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
							bind:value={selectedSkill.stats[key]}
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
					class="border rounded-xl px-3 py-2 focus:ring focus:ring-blue-300 outline-none"
					bind:value={newEntry}
				>
					{#each stats as stat}
						<option value={stat.name}>{stat.name}</option>
					{/each}
				</select>
				<button
					class="w-full bg-blue-600 text-white font-medium py-2 px-4 rounded-xl shadow hover:bg-blue-700 transition"
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
				<div class="flex flex-col gap-2">
					<div class="flex flex-row gap-2">
						<span class="font-semibold w-48 lg:w-32">Name:</span>
						<span>{selectedSkill.name}</span>
					</div>
					<div class="flex flex-row gap-2">
						<span class="font-semibold w-48 lg:w-32">Description:</span>
						<span>{selectedSkill.description}</span>
					</div>
					<div class="flex flex-row gap-2">
						<span class="font-semibold w-48 lg:w-32">Job:</span>
						<span>{jobOf(selectedSkill._id)?.name || 'Not found'}</span>
					</div>
					<!-- Les 6 premiers éléments -->
					{#each Object.entries(selectedSkill.stats).slice(6, 16) as [key, value]}
						{#if value > 0}
							<div class="flex flex-row gap-2">
								<span class="font-semibold w-48 lg:w-32">{key}:</span>
								<Tooltip type="light">{statOf(key)?.description}</Tooltip>
								<span>{value}</span>
							</div>
						{/if}
					{/each}
				</div>

				<div class="flex flex-col gap-2">
					<!-- Le reste des éléments filtrés -->
					{#each Object.entries(selectedSkill.stats) as [key, value]}
						{#if value > 0}
							<div class="flex flex-row gap-2">
								<span class="font-semibold w-48">{key}:</span>
								<Tooltip type="light">{statOf(key)?.description}</Tooltip>
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
					on:click={deleteSkill}
				>
					Supprimer
				</button>
				{#if selectedSkill._id !== '-1'}
					<button
						class="px-4 py-2 bg-blue-500 text-white rounded cursor-pointer hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
						disabled={!isAllGood}
						on:click={updateSkill}
					>
						Update
					</button>
				{:else}
					<button
						class="px-4 py-2 bg-green-500 text-white rounded cursor-pointer hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
						disabled={!isAllGood}
						on:click={createSkill}
					>
						Create
					</button>
				{/if}
			</div>
		{/if}
	</div>
{/if}
