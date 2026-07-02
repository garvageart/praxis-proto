<script lang="ts">
  import { onMount } from 'svelte';
  import { page } from '$app/stores';
  import { challenges } from '$lib/api';

  let ch = $state<any>(null);
  let loading = $state(true);
  let acting = $state(false);
  let message = $state('');
  let configText = $state('');

  onMount(async () => {
    try {
      ch = await challenges.get($page.params.id!);
      configText = JSON.stringify(ch.configPayload, null, 2);
    } catch (e) {
      message = `Error: ${(e as Error).message}`;
    }
    loading = false;
  });

  async function saveConfig() {
    acting = true;
    try {
      const payload = JSON.parse(configText);
      ch = await challenges.update(ch.id, { configPayload: payload });
      message = 'Configuration updated.';
    } catch (e) {
      message = `Invalid JSON: ${(e as Error).message}`;
    }
    acting = false;
  }

  async function regenerate() {
    acting = true;
    try {
      ch = await challenges.regenerateNumbers(ch.id);
      configText = JSON.stringify(ch.configPayload, null, 2);
      message = 'Numbers regenerated.';
    } catch (e) {
      message = `Failed: ${(e as Error).message}`;
    }
    acting = false;
  }

  async function publish() {
    acting = true;
    try {
      ch = await challenges.publish(ch.id);
      message = 'Challenge published!';
    } catch (e) {
      message = `Failed: ${(e as Error).message}`;
    }
    acting = false;
  }
</script>

<div class="page">
  {#if loading}
    <p class="muted">Loading...</p>
  {:else if !ch}
    <p class="muted">Challenge not found.</p>
  {:else}
    <a href="/admin/challenges" class="back">&larr; Back to challenges</a>

    <div class="header">
      <h1>{ch.title}</h1>
      <span class="badge" class:badge-green={ch.status === 'published'} class:badge-yellow={ch.status === 'draft'}>
        {ch.status}
      </span>
    </div>

    <div class="info">
      <div>Type: <strong>{ch.type.replace('_', ' ')}</strong></div>
      <div>Created: {new Date(ch.createdAt).toLocaleDateString()}</div>
    </div>

    <!-- Config Editor -->
    <section class="section">
      <h2>Configuration Payload</h2>
      <textarea class="config-editor" bind:value={configText} rows="16"></textarea>
      <div class="btn-row">
        <button class="btn btn-primary" onclick={saveConfig} disabled={acting}>Save Config</button>
        <button class="btn btn-secondary" onclick={regenerate} disabled={acting}>Regenerate Numbers</button>
      </div>
    </section>

    <!-- Publish -->
    {#if ch.status === 'draft'}
      <section class="section">
        <button class="btn btn-publish" onclick={publish} disabled={acting}>
          Publish Challenge
        </button>
      </section>
    {/if}

    {#if message}
      <p class="message">{message}</p>
    {/if}
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

  .header {
    display: flex;
    align-items: center;
    gap: 1rem;
    margin-bottom: 0.75rem;
    h1 { font-size: 1.5rem; font-weight: 700; color: $color-text; }
  }

  .badge {
    display: inline-block;
    padding: 0.125rem 0.5rem;
    border-radius: $radius-full;
    font-size: 0.75rem;
    font-weight: 500;
    background: $color-surface-3;
    color: $color-text-subtle;
    &-green { background: $color-success-bg; color: $color-success; }
    &-yellow { background: $color-warning-bg; color: $color-warning; }
  }

  .info {
    display: flex;
    gap: 2rem;
    margin-bottom: 2rem;
    font-size: 0.875rem;
    color: $color-text-subtle;
  }

  .muted { color: $color-text-muted; font-size: 0.875rem; }

  .section {
    margin-bottom: 2rem;
    h2 { font-size: 1.125rem; font-weight: 600; margin-bottom: 0.75rem; color: $color-text; }
  }

  .config-editor {
    width: 100%;
    padding: 0.75rem;
    border: 1px solid $color-border-strong;
    border-radius: $radius-sm;
    font-family: $font-mono;
    font-size: 0.8125rem;
    line-height: 1.6;
    resize: vertical;
    background: $color-surface-2;
    color: $color-text;

    &:focus {
      outline: none;
      border-color: $color-primary;
    }
  }

  .btn-row {
    display: flex;
    gap: 0.75rem;
    margin-top: 0.75rem;
  }

  .btn {
    padding: 0.5rem 1rem;
    font-size: 0.8125rem;
    font-weight: 500;
    border: 1px solid $color-border;
    border-radius: $radius-sm;
    cursor: pointer;
    transition: background 0.15s;
    &:disabled { opacity: 0.4; cursor: not-allowed; }

    &-primary {
      background: $color-primary; color: white; border-color: $color-primary;
      &:hover:not(:disabled) { background: $color-primary-hover; }
    }

    &-secondary {
      background: $color-surface-2; color: $color-text; border-color: $color-border;
      &:hover:not(:disabled) { background: $color-surface-3; }
    }

    &-publish {
      background: $color-success;
      color: white;
      border-color: $color-success;
      font-size: 0.9375rem;
      padding: 0.75rem 2rem;
      &:hover:not(:disabled) { opacity: 0.9; }
    }
  }

  .message {
    margin-top: 0.75rem;
    padding: 0.75rem;
    background: $color-surface-2;
    border-radius: $radius-sm;
    font-size: 0.875rem;
    color: $color-text-subtle;
    border: 1px solid $color-border;
  }
</style>
