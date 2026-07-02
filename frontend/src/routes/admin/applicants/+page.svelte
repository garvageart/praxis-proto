<script lang="ts">
  import { onMount } from 'svelte';
  import { applicants } from '$lib/api';
  import { goto } from '$app/navigation';

  let list = $state<any[]>([]);
  let loading = $state(true);

  onMount(async () => {
    try {
      list = await applicants.list();
    } catch { /* ignore */ }
    loading = false;
  });
</script>

<div class="page">
  <h1>Applicants</h1>

  {#if loading}
    <p class="muted">Loading...</p>
  {:else if list.length === 0}
    <p class="muted">No applicants found.</p>
  {:else}
    <div class="table-wrap">
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Degree</th>
            <th>Status</th>
            <th>Code</th>
            <th>Design</th>
            <th>Ledger</th>
          </tr>
        </thead>
        <tbody>
          {#each list as app}
            <tr class="clickable" onclick={() => goto(`/admin/applicants/${app.id}`)}>
              <td class="name">{app.name}</td>
              <td>{app.email}</td>
              <td>{app.degree}</td>
              <td>
                <span class="badge" class:badge-green={app.status === 'accepted'} class:badge-red={app.status === 'rejected'} class:badge-yellow={app.status === 'in_review'}>
                  {app.status.replace('_', ' ')}
                </span>
              </td>
              <td>{app.scores.code_fix ?? '—'}</td>
              <td>{app.scores.design_review ?? '—'}</td>
              <td>{app.scores.ledger_sort ?? '—'}</td>
            </tr>
          {/each}
        </tbody>
      </table>
    </div>
  {/if}
</div>

<style lang="scss">
  @use '../../../styles/variables' as *;

  .page { max-width: 1000px; }

  h1 {
    font-size: 1.5rem;
    font-weight: 700;
    margin-bottom: 1.5rem;
    color: $color-text;
  }

  .muted {
    color: $color-text-muted;
    font-size: 0.875rem;
  }

  .table-wrap {
    background: $color-surface;
    border-radius: $radius-md;
    box-shadow: $shadow-sm;
    overflow: hidden;
    border: 1px solid $color-border;
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
    color: $color-text-subtle;
    font-size: 0.75rem;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    background: $color-surface-2;
    border-bottom: 1px solid $color-border;
  }

  td {
    padding: 0.75rem 1rem;
    border-bottom: 1px solid $color-border;
    color: $color-text;
  }

  .clickable {
    cursor: pointer;
    transition: background 0.15s;
    &:hover { background: $color-surface-3; }
  }

  .name { font-weight: 500; }

  .badge {
    display: inline-block;
    padding: 0.125rem 0.5rem;
    border-radius: $radius-full;
    font-size: 0.75rem;
    font-weight: 500;
    background: $color-surface-3;
    color: $color-text-subtle;

    &-green { background: $color-success-bg; color: $color-success; }
    &-red { background: $color-error-bg; color: $color-error; }
    &-yellow { background: $color-warning-bg; color: $color-warning; }
  }
</style>
