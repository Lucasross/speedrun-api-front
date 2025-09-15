<script lang="ts">
	import { goto } from '$app/navigation';
</script>

<div class="min-h-screen flex items-start justify-center p-4">
  <div class="grid grid-cols-1 lg:grid-cols-3 space-x-6 w-full max-w-5xl gap-3">

    <button on:click={() => goto('/api/job')} class="w-full cursor-pointer">
      <div class="p-6 bg-blue-100 rounded shadow flex flex-col justify-between h-40 hover:bg-green-200 transition">
        <h2 class="text-xl font-bold mb-2">Jobs</h2>
        <p>Define the playable classes that shape each player’s journey.</p>
      </div>
    </button>

    <button on:click={() => goto('/api/skill')} class="w-full cursor-pointer">
      <div class="p-6 bg-blue-100 rounded shadow flex flex-col justify-between h-40 hover:bg-green-200 transition">
        <h2 class="text-xl font-bold mb-2">Skills</h2>
        <p>Create abilities and link them to specific jobs for progression.</p>
      </div>
    </button>

    <button on:click={() => goto('/api/area')} class="w-full cursor-pointer">
      <div class="p-6 bg-blue-100 rounded shadow flex flex-col justify-between h-40 hover:bg-green-200 transition">
        <h2 class="text-xl font-bold mb-2">Areas</h2>
        <p>Design the world’s regions and factions that set the stage for adventure.</p>
      </div>
    </button>

    <button on:click={() => goto('/api/monster')} class="w-full cursor-pointer">
      <div class="p-6 bg-blue-100 rounded shadow flex flex-col justify-between h-40 hover:bg-green-200 transition">
        <h2 class="text-xl font-bold mb-2">Monsters</h2>
        <p>Catalog every creature with its core level-one stats and traits.</p>
      </div>
    </button>

    <button on:click={() => goto('/api/sector')} class="w-full cursor-pointer">
      <div class="p-6 bg-blue-100 rounded shadow flex flex-col justify-between h-40 hover:bg-green-200 transition">
        <h2 class="text-xl font-bold mb-2">Sectors</h2>
        <p>Configure sub-zones within areas where players face challenges and battles.</p>
      </div>
    </button>

    <button on:click={() => goto('/api/equipment')} class="w-full cursor-pointer">
      <div class="p-6 bg-blue-100 rounded shadow flex flex-col justify-between h-40 hover:bg-green-200 transition">
        <h2 class="text-xl font-bold mb-2">Equipments</h2>
        <p>Build weapons and armors that enhance player strategy and style.</p>
      </div>
    </button>
  </div>
</div>