<script lang="ts">
  import { onMount } from 'svelte';
  import { challenges } from '$lib/api';
  import { goto } from '$app/navigation';

  let text = $state('');
  let degreeId = $state('d-001');
  let degrees = $state<{ id: string; name: string }[]>([]);
  let uploading = $state(false);
  let result = $state<any>(null);
  let error = $state('');

  onMount(async () => {
    // Simplified — use the seeded degrees directly
    degrees = [
      { id: 'd-001', name: 'Computer Science' },
      { id: 'd-002', name: 'Visual Communication Design' },
      { id: 'd-003', name: 'Accounting' },
      { id: 'd-004', name: 'Computer Engineering' }
    ];
  });

  async function handleUpload() {
    if (!text.trim()) return;
    uploading = true;
    error = '';
    result = null;

    try {
      result = await challenges.upload(text, degreeId);
    } catch (e) {
      error = (e as Error).message;
    } finally {
      uploading = false;
    }
  }
</script>

<div class="page">
  <h1>Upload & Generate</h1>
  <p class="subtitle">Paste a past paper or problem description below to generate a challenge draft.</p>

  <div class="form">
    <div class="field">
      <label for="degree">Degree</label>
      <select id="degree" bind:value={degreeId}>
        {#each degrees as d}
          <option value={d.id}>{d.name}</option>
        {/each}
      </select>
    </div>

    <div class="field">
      <label for="text">Content</label>
      <textarea
        id="text"
        bind:value={text}
        rows="12"
        placeholder="Paste a past paper question, problem description, or scenario here..."
      ></textarea>
    </div>

    <button class="btn" onclick={handleUpload} disabled={!text.trim() || uploading}>
      {uploading ? 'Generating...' : 'Generate Challenge'}
    </button>
  </div>

  {#if error}
    <div class="error-box">{error}</div>
  {/if}

  {#if result}
    <div class="result">
      <h2>Challenge Generated</h2>
      <div class="result-card">
        <div class="result-field">
          <span>Title</span> {result.challenge.title}
        </div>
        <div class="result-field">
          <span>Type</span> {result.challenge.type.replace('_', ' ')}
        </div>
        <div class="result-field">
          <span>Status</span> {result.challenge.status}
        </div>
        <div class="result-field">
          <span>Extracted</span> {result.extracted.description}
        </div>
      </div>
      <button class="btn btn-secondary" onclick={() => goto(`/admin/challenges/${result.challenge.id}`)}>
        Edit Challenge
      </button>
    </div>
  {/if}
</div>

<style lang="scss">
  @use '../../../styles/variables' as *;

  .page { max-width: 700px; }

  h1 {
    font-size: 1.5rem;
    font-weight: 700;
    margin-bottom: 0.5rem;
  }

  .subtitle {
    color: $color-text-muted;
    font-size: 0.9375rem;
    margin-bottom: 2rem;
  }

  .form {
    background: white;
    padding: 1.5rem;
    border-radius: $radius-md;
    box-shadow: $shadow-sm;
  }

  .field {
    margin-bottom: 1.25rem;

    label {
      display: block;
      font-weight: 500;
      font-size: 0.875rem;
      margin-bottom: 0.375rem;
      color: $color-text;
    }

    select, textarea {
      width: 100%;
      padding: 0.5rem 0.75rem;
      border: 1px solid #d1d5db;
      border-radius: $radius-sm;
      font-family: inherit;
      font-size: 0.9375rem;

      &:focus {
        outline: none;
        border-color: $color-primary;
      }
    }

    textarea {
      font-family: $font-mono;
      font-size: 0.875rem;
      line-height: 1.6;
      resize: vertical;
    }
  }

  .btn {
    padding: 0.625rem 1.5rem;
    font-size: 0.875rem;
    font-weight: 500;
    border: none;
    border-radius: $radius-sm;
    cursor: pointer;
    transition: background 0.15s;
    color: white;
    background: $color-primary;

    &:hover:not(:disabled) { background: $color-primary-hover; }
    &:disabled { opacity: 0.5; cursor: not-allowed; }

    &-secondary {
      background: white;
      color: $color-primary;
      border: 1px solid $color-primary;
      margin-top: 1rem;
      &:hover { background: #f0f4ff; }
    }
  }

  .error-box {
    margin-top: 1rem;
    padding: 0.75rem;
    background: #fee2e2;
    color: #991b1b;
    border-radius: $radius-sm;
    font-size: 0.875rem;
  }

  .result {
    margin-top: 1.5rem;
    padding: 1.5rem;
    background: #f0fdf4;
    border-radius: $radius-md;
    border: 1px solid #bbf7d0;

    h2 {
      font-size: 1.125rem;
      font-weight: 600;
      margin-bottom: 1rem;
      color: #166534;
    }
  }

  .result-card {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .result-field {
    font-size: 0.875rem;

    span:first-child {
      display: inline-block;
      width: 100px;
      font-weight: 500;
      color: $color-text-muted;
    }
  }
</style>
