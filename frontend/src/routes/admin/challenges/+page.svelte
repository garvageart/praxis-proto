<script lang="ts">
  import { onMount } from 'svelte';
  import { challenges } from '$lib/api';
  import { goto } from '$app/navigation';

  let list = $state<any[]>([]);
  let loading = $state(true);

  onMount(async () => {
    try {
      list = await challenges.list();
    } catch { /* ignore */ }
    loading = false;
  });
</script>

<div class="page">
  <h1>Challenges</h1>

  {#if loading}
    <p class="muted">Loading...</p>
  {:else if list.length === 0}
    <p class="muted">No challenges found.</p>
  {:else}
    <div class="table-wrap">
      <table>
        <thead>
          <tr>
            <th>Title</th>
            <th>Type</th>
            <th>Status</th>
            <th>Created</th>
          </tr>
        </thead>
        <tbody>
          {#each list as ch}
            <tr class="clickable" onclick={() => goto(`/admin/challenges/${ch.id}`)}>
              <td class="name">{ch.title}</td>
              <td><span class="type-tag">{ch.type.replace('_', ' ')}</span></td>
              <td>
                <span class="badge" class:badge-green={ch.status === 'published'} class:badge-yellow={ch.status === 'draft'}>
                  {ch.status}
                </span>
              </td>
              <td class="muted">{new Date(ch.createdAt).toLocaleDateString()}</td>
            </tr>
          {/each}
        </tbody>
      </table>
    </div>
  {/if}
</div>

<style lang="scss">
  @use '../../../styles/variables' as *;

  .page { max-width: 900px; }

  h1 {
    font-size: 1.5rem;
    font-weight: 700;
    margin-bottom: 1.5rem;
  }

  .muted { color: $color-text-muted; font-size: 0.875rem; }

  .table-wrap {
    background: white;
    border-radius: $radius-md;
    box-shadow: $shadow-sm;
    overflow: hidden;
  }

  table {
    width: 100%;
    border-collapse: collapse;
    font-size: 0.875rem;
  }

  th {
    text-align: left;
    padding: 0.75rem 1rem;
    font-weight: 600;
    color: $color-text-muted;
    font-size: 0.75rem;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    background: #fafafa;
    border-bottom: 1px solid #e5e5e5;
  }

  td {
    padding: 0.75rem 1rem;
    border-bottom: 1px solid #f0f0f0;
  }

  .clickable { cursor: pointer; transition: background 0.1s;
    &:hover { background: #f5f5ff; }
  }

  .name { font-weight: 500; }

  .type-tag {
    display: inline-block;
    padding: 0.125rem 0.5rem;
    border-radius: $radius-sm;
    font-size: 0.75rem;
    background: #f0f0ff;
    color: #5b21b6;
  }

  .badge {
    display: inline-block;
    padding: 0.125rem 0.5rem;
    border-radius: 999px;
    font-size: 0.75rem;
    font-weight: 500;
    background: #e5e5e5;
    color: $color-text-muted;
    &-green { background: #dcfce7; color: #166534; }
    &-yellow { background: #fef9c3; color: #854d0e; }
  }
</style>
