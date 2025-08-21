<script lang="ts">
	import { goto } from '$app/navigation';
</script>

<section class="min-h-screen flex items-start justify-center bg-gray-100 p-4">

  <div class="flex flex-row space-x-6 w-full max-w-5xl">

    <button on:click={() => goto('/api/job')} class="w-full">
      <div class="p-6 bg-blue-100 rounded shadow flex flex-col justify-between h-40 hover:bg-green-200 transition">
        <h2 class="text-xl font-bold mb-2">Jobs</h2>
        <p>Gestion des classes du rpg que le joueur pourra choisir au début du jeu.</p>
      </div>
    </button>

    <button class="w-full">
      <div class="p-6 bg-gray-200 rounded shadow flex flex-col justify-between h-40 hover:bg-green-200 transition">
        <h2 class="text-xl font-bold mb-2">WIP</h2>
        <p>Ce contenu arrivera plus tard.</p>
      </div>
    </button>

    <button class="w-full">
      <div class="p-6 bg-gray-200 rounded shadow flex flex-col justify-between h-40 hover:bg-green-200 transition">
        <h2 class="text-xl font-bold mb-2">WIP</h2>
        <p>Ce contenu arrivera plus tard.</p>
      </div>
    </button>

  </div>
  
</section>