<script lang="ts">
  import { onMount } from 'svelte';
  import { token } from '$lib/stores/auth';
  import { get } from 'svelte/store';
  import { isAuthenticated } from '$lib/stores/auth';
  import api from '$lib/api';

  // Liste des jobs
  let jobs: any[] = [];

  // Champs du formulaire de création
  let name = '';
  let power: number | '' = '';

  // Champ pour récupérer un job par ID
  let searchId: number | '' = '';
  let jobFound: any = null;

  // Message d'erreur / succès
  let message = '';

  // Charger tous les jobs au chargement
  async function loadJobs() {
    try {
      const res = await api.get('/jobs');
      jobs = res.data;
    } catch (e: any) {
      message = e.response?.data?.message || 'Erreur lors du chargement des jobs';
    }
  }

  onMount(loadJobs);

  // Créer un job
  async function createJob() {
    try {
        const res = await api.post('/jobs', { name, power: Number(power) });
        const newJobs = [...jobs, res.data];
        jobs = newJobs;
        name = '';
        power = '';
        message = 'Job créé avec succès';
    } catch (e: any) {
      message = e.response?.data?.message || 'Erreur lors de la création';
    }
  }

  // Supprimer un job
  async function deleteJob(id: number) {
    if (!confirm('Supprimer ce job ?')) return;
    try {
      await api.delete(`/jobs/${id}`);
        const newJobs = jobs.filter(j => Number(j._id) !== Number(id));
        jobs = newJobs;
                console.log(jobs);
        message = 'Job supprimé';
    } catch (e: any) {
      message = e.response?.data?.message || 'Erreur lors de la suppression';
    }
  }

  // Chercher un job par ID
  async function getJob() {
    jobFound = null;
    if (!searchId) return;
    try {
      const res = await api.get(`/jobs/${searchId}`);
      jobFound = res.data;
    } catch (e: any) {
      message = e.response?.data?.message || 'Job non trouvé';
    }
  }
</script>

<div class="p-6 space-y-6">

  <h1 class="text-2xl font-bold mb-4">Gestion des Jobs</h1>

  {#if message}
    <p class="text-yellow-500">{message}</p>
  {/if}

  <!-- Rechercher job par ID -->
  <section class="p-4 bg-gray-100 rounded space-y-2">
    <h2 class="font-bold">Rechercher un job</h2>
    <input placeholder="ID du job" type="number" bind:value={searchId} class="border p-2 rounded w-full"/>
    <button on:click={getJob} class="bg-yellow-500 text-white px-4 py-2 rounded">Chercher</button>

    {#if jobFound}
      <div class="mt-2 p-2 bg-green-100 rounded">
        <p><strong>ID:</strong> {jobFound._id}</p>
        <p><strong>Nom:</strong> {jobFound.name}</p>
        <p><strong>Power:</strong> {jobFound.power}</p>
      </div>
    {/if}
  </section>

  <!-- Liste des jobs -->
  <section class="p-4 bg-gray-100 rounded space-y-2">
    <h2 class="font-bold">Liste des jobs</h2>
    {#if jobs.length === 0}
      <p>Aucun job</p>
    {:else}
      <ul class="space-y-2">
        {#each jobs as j}
          <li class="flex justify-between items-center p-2 bg-white rounded shadow">
            <div>
              <strong>{j._id}</strong>: {j.name} (Power: {j.power})
            </div>
            {#if $isAuthenticated }
            <button on:click={() => deleteJob(j._id)} class="bg-red-500 text-white px-2 py-1 rounded cursor-pointer hover:bg-red-600">
              Supprimer
            </button>
              {/if}
          </li>
        {/each}
      </ul>
    {/if}
  </section>

    {#if $isAuthenticated }
    <!-- Formulaire création -->
    <section class="p-4 bg-green-100 rounded space-y-2">
        <h2 class="font-bold">Créer un job</h2>
        <input placeholder="Nom" bind:value={name} class="border p-2 rounded w-full"/>
        <input placeholder="Power" type="number" bind:value={power} class="border p-2 rounded w-full"/>
        <button on:click={createJob} class="bg-blue-500 text-white px-4 py-2 rounded">Créer</button>
    </section>
    {/if}

</div>