<script lang="ts">
  import '../app.scss';
  import Nav from '$lib/components/Nav.svelte';
  let { children } = $props();
</script>

<Nav />
<main class="main">
  {@render children()}
</main>

<style lang="scss">
  .main {
    min-height: calc(100vh - 3.5rem);
  }
</style>
