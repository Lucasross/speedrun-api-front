<script lang="ts">
	import { searchQuery } from '$lib/stores/search';
	import { page } from '$app/stores'; // <-- c’est ça qu’il faut

	$: {
		// reset la recherche à chaque changement de route
		$page.url.pathname;
		searchQuery.set('');
	}
</script>

{#if $page.route.id !== '/api'}
	<div>
		<div class="relative z-0 mx-4">
			<input
				type="text"
				id="search_query"
				on:input={(e) => searchQuery.set((e.target as HTMLInputElement).value)}
				class="block py-2.5 px-0 w-full text-sm text-gray-900 bg-transparent border-0 border-b-2 border-gray-300 appearance-none dark:text-white dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:border-blue-600 peer"
				placeholder=" "
			/>
			<label
				for="search_query"
				class="absolute text-sm text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:start-0 peer-focus:text-blue-600 peer-focus:dark:text-blue-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6 rtl:peer-focus:translate-x-1/4 rtl:peer-focus:left-auto"
				>Search by name...</label
			>
		</div>
	</div>
{/if}

<!-- contenu des enfants -->
<slot />
