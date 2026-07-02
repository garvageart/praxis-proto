<script lang="ts">
  import Sidebar from '$lib/components/admin/Sidebar.svelte';
  let { children } = $props();
</script>

<div class="admin-layout">
  <Sidebar />
  <main class="content">
    {@render children()}
  </main>
</div>

<style lang="scss">
  @use '../../styles/variables' as *;

  .admin-layout {
    display: flex;
  }

  .content {
    margin-left: 240px;
    flex: 1;
    padding: 2rem;
    min-height: 100vh;
    background: $color-bg;
  }
</style>
