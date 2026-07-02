<script lang="ts">
  import { onMount } from 'svelte';
  import { admin } from '$lib/api';

  let stats = $state<any>(null);
  let loading = $state(true);
  let error = $state('');

  onMount(async () => {
    try {
      stats = await admin.dashboard();
    } catch (e) {
      error = (e as Error).message;
    } finally {
      loading = false;
    }
  });
</script>

<div class="page">
  <h1>Dashboard</h1>

  {#if loading}
    <p class="muted">Loading dashboard...</p>
  {:else if error}
    <p class="error">Failed to load: {error}</p>
    <p class="muted">Make sure the backend is running on port 8080.</p>
  {:else if stats}
    <div class="cards">
      <div class="card">
        <span class="card-value">{stats.totalApplicants}</span>
        <span class="card-label">Total Applicants</span>
      </div>
      <div class="card">
        <span class="card-value">{stats.totalSubmissions}</span>
        <span class="card-label">Submissions</span>
      </div>
      <div class="card">
        <span class="card-value">{stats.gradedCount}</span>
        <span class="card-label">Graded</span>
      </div>
      <div class="card">
        <span class="card-value">{stats.averageScore.toFixed(1)}%</span>
        <span class="card-label">Average Score</span>
      </div>
    </div>

    <div class="grid">
      <div class="panel">
        <h2>By Status</h2>
        <div class="stat-list">
          {#each Object.entries(stats.byStatus) as [key, value]}
            <div class="stat-row">
              <span class="stat-key">{key.replace('_', ' ')}</span>
              <span class="stat-value">{value}</span>
            </div>
          {/each}
        </div>
      </div>

      <div class="panel">
        <h2>By Degree</h2>
        <div class="stat-list">
          {#each Object.entries(stats.byDegree) as [key, value]}
            <div class="stat-row">
              <span class="stat-key">{key}</span>
              <span class="stat-value">{value}</span>
            </div>
          {/each}
        </div>
      </div>
    </div>
  {/if}
</div>

<style lang="scss">
  @use '../../styles/variables' as *;

  .page {
    max-width: 1000px;
  }

  h1 {
    font-size: 1.5rem;
    font-weight: 700;
    margin-bottom: 1.5rem;
  }

  .muted {
    color: $color-text-muted;
    font-size: 0.875rem;
  }

  .error {
    color: $color-error;
    font-weight: 500;
  }

  .cards {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
    gap: 1rem;
    margin-bottom: 1.5rem;
  }

  .card {
    background: white;
    border-radius: $radius-md;
    padding: 1.25rem;
    box-shadow: $shadow-sm;
    display: flex;
    flex-direction: column;
  }

  .card-value {
    font-size: 2rem;
    font-weight: 700;
    color: $color-primary;
  }

  .card-label {
    font-size: 0.8125rem;
    color: $color-text-muted;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    margin-top: 0.25rem;
  }

  .grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1rem;

    @media (max-width: 768px) {
      grid-template-columns: 1fr;
    }
  }

  .panel {
    background: white;
    border-radius: $radius-md;
    padding: 1.25rem;
    box-shadow: $shadow-sm;

    h2 {
      font-size: 1rem;
      font-weight: 600;
      margin-bottom: 1rem;
      padding-bottom: 0.5rem;
      border-bottom: 1px solid #eee;
    }
  }

  .stat-list {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .stat-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0.375rem 0;
    font-size: 0.875rem;
  }

  .stat-key {
    color: $color-text;
    text-transform: capitalize;
  }

  .stat-value {
    font-weight: 600;
    color: $color-primary;
  }
</style>
