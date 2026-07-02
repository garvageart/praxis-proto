<script lang="ts">
  import { onMount } from 'svelte';
  import { page } from '$app/stores';
  import { applicants } from '$lib/api';

  let app = $state<any>(null);
  let subs = $state<any[]>([]);
  let loading = $state(true);
  let acting = $state(false);
  let message = $state('');

  onMount(async () => {
    const id = $page.params.id;
    try {
      app = await applicants.get(id);
      subs = await applicants.submissions(id);
    } catch (e) {
      message = `Error: ${(e as Error).message}`;
    }
    loading = false;
  });

  async function decide(decision: 'accepted' | 'rejected') {
    acting = true;
    try {
      app = await applicants.decision(app.id, decision);
      message = `Applicant ${decision}.`;
    } catch (e) {
      message = `Failed: ${(e as Error).message}`;
    }
    acting = false;
  }
</script>

<div class="page">
  {#if loading}
    <p class="muted">Loading...</p>
  {:else if !app}
    <p class="muted">Applicant not found.</p>
  {:else}
    <a href="/admin/applicants" class="back">&larr; Back to applicants</a>
    <h1>{app.name}</h1>

    <div class="info-grid">
      <div class="info"><span>Email</span> {app.email}</div>
      <div class="info"><span>Degree</span> {app.degree}</div>
      <div class="info">
        <span>Status</span>
        <span class="badge" class:badge-green={app.status === 'accepted'} class:badge-red={app.status === 'rejected'} class:badge-yellow={app.status === 'in_review'}>
          {app.status.replace('_', ' ')}
        </span>
      </div>
    </div>

    <!-- Scores -->
    <section class="section">
      <h2>Scores</h2>
      <div class="scores">
        <div class="score-card">
          <span class="score-label">Code Fix</span>
          <span class="score-val">{app.scores.code_fix ?? '—'}</span>
        </div>
        <div class="score-card">
          <span class="score-label">Design Review</span>
          <span class="score-val">{app.scores.design_review ?? '—'}</span>
        </div>
        <div class="score-card">
          <span class="score-label">Ledger Sort</span>
          <span class="score-val">{app.scores.ledger_sort ?? '—'}</span>
        </div>
      </div>
    </section>

    <!-- Submissions -->
    <section class="section">
      <h2>Submissions & AI Summaries</h2>
      {#if subs.length === 0}
        <p class="muted">No submissions yet.</p>
      {:else}
        {#each subs as sub}
          <div class="submission">
            <div class="sub-header">
              <span class="sub-id">{sub.id}</span>
              <span class="badge" class:badge-green={sub.status === 'graded'}>{sub.status}</span>
              <span class="sub-score">Score: {sub.score ?? '—'}</span>
            </div>
            {#if sub.aiSummary}
              <div class="ai-summary">
                <strong>AI Summary:</strong> {sub.aiSummary}
              </div>
            {/if}
            {#if sub.aiHintsGiven > 0}
              <div class="hints">Hints used: {sub.aiHintsGiven}</div>
            {/if}
          </div>
        {/each}
      {/if}
    </section>

    <!-- Decision -->
    <section class="section">
      <h2>Decision</h2>
      {#if app.status === 'accepted' || app.status === 'rejected'}
        <p class="muted">Final decision: {app.status}</p>
      {:else}
        <div class="actions">
          <button class="btn btn-accept" onclick={() => decide('accepted')} disabled={acting}>
            Accept
          </button>
          <button class="btn btn-reject" onclick={() => decide('rejected')} disabled={acting}>
            Reject
          </button>
        </div>
      {/if}
      {#if message}
        <p class="message">{message}</p>
      {/if}
    </section>
  {/if}
</div>

<style lang="scss">
  @use '../../../../styles/variables' as *;

  .page { max-width: 800px; }

  .back {
    display: inline-block;
    margin-bottom: 1rem;
    color: $color-primary;
    text-decoration: none;
    font-size: 0.875rem;
    &:hover { text-decoration: underline; }
  }

  h1 {
    font-size: 1.5rem;
    font-weight: 700;
    margin-bottom: 1.5rem;
  }

  .muted { color: $color-text-muted; font-size: 0.875rem; }

  .info-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 0.75rem;
    margin-bottom: 1.5rem;
  }

  .info {
    background: white;
    padding: 0.75rem 1rem;
    border-radius: $radius-sm;
    font-size: 0.9375rem;

    span:first-child {
      display: block;
      font-size: 0.75rem;
      color: $color-text-muted;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      margin-bottom: 0.25rem;
    }
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
    &-red { background: #fee2e2; color: #991b1b; }
    &-yellow { background: #fef9c3; color: #854d0e; }
  }

  .section {
    margin-bottom: 2rem;
    h2 {
      font-size: 1.125rem;
      font-weight: 600;
      margin-bottom: 1rem;
    }
  }

  .scores {
    display: flex;
    gap: 1rem;
  }

  .score-card {
    background: white;
    padding: 1rem 1.5rem;
    border-radius: $radius-md;
    box-shadow: $shadow-sm;
    text-align: center;
  }

  .score-label {
    display: block;
    font-size: 0.75rem;
    color: $color-text-muted;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    margin-bottom: 0.375rem;
  }

  .score-val {
    font-size: 1.5rem;
    font-weight: 700;
    color: $color-primary;
  }

  .submission {
    background: white;
    border-radius: $radius-md;
    padding: 1rem;
    margin-bottom: 0.75rem;
    box-shadow: $shadow-sm;
    font-size: 0.875rem;
  }

  .sub-header {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    margin-bottom: 0.5rem;
  }

  .sub-id { font-weight: 600; font-size: 0.8125rem; color: $color-text-muted; }
  .sub-score { margin-left: auto; font-weight: 600; }

  .ai-summary {
    background: #f0f4ff;
    padding: 0.75rem;
    border-radius: $radius-sm;
    line-height: 1.6;
    font-size: 0.875rem;
  }

  .hints {
    margin-top: 0.5rem;
    font-size: 0.8125rem;
    color: $color-text-muted;
  }

  .actions {
    display: flex;
    gap: 1rem;
  }

  .btn {
    padding: 0.625rem 1.5rem;
    font-size: 0.875rem;
    font-weight: 500;
    border: none;
    border-radius: $radius-sm;
    cursor: pointer;
    color: white;
    &:disabled { opacity: 0.5; cursor: not-allowed; }
    &-accept { background: $color-success; &:hover:not(:disabled) { background: #15803d; } }
    &-reject { background: $color-error; &:hover:not(:disabled) { background: #b91c1c; } }
  }

  .message {
    margin-top: 0.75rem;
    font-size: 0.875rem;
    color: $color-text-muted;
  }
</style>
