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
  @use '../styles/variables' as *;

  .main {
    min-height: calc(100vh - 56px);
  }
</style>
