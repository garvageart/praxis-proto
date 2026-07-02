<script lang="ts">
  import { page } from '$app/stores';

  const links = [
    { href: '/journeys/cs-buggy-leaderboard', label: 'CS' },
    { href: '/journeys/vcd-hierarchy-rescue', label: 'VCD' },
    { href: '/journeys/spaza-ledger', label: 'Accounting' }
  ];
</script>

<nav class="nav">
  <a href="/" class="logo">
    <span class="logo-mark">✦</span>
    Praxis
  </a>
  <div class="links">
    {#each links as link}
      <a
        href={link.href}
        class="link"
        class:active={$page.url.pathname === link.href}
      >
        {link.label}
      </a>
    {/each}
  </div>
  <a href="/admin" class="admin-btn">Admin →</a>
</nav>

<style lang="scss">
  @use '../../styles/variables' as *;

  .nav {
    display: flex;
    align-items: center;
    gap: 1.5rem;
    padding: 0 1.5rem;
    height: 56px;
    background: rgba(9, 9, 11, 0.8);
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
    border-bottom: 1px solid $color-border;
    position: sticky;
    top: 0;
    z-index: 100;
  }

  .logo {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-family: $font-display;
    font-weight: 700;
    font-size: 1.125rem;
    color: $color-text;
    text-decoration: none;
    letter-spacing: -0.02em;
    margin-right: 0.5rem;

    &:hover .logo-mark {
      transform: rotate(45deg);
    }
  }

  .logo-mark {
    background: $gradient-brand;
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    font-size: 1.25rem;
    transition: transform 0.3s ease;
    display: inline-block;
  }

  .links {
    display: flex;
    gap: 0.25rem;
    flex: 1;
  }

  .link {
    text-decoration: none;
    color: $color-text-muted;
    font-size: 0.8125rem;
    font-weight: 500;
    padding: 0.375rem 0.875rem;
    border-radius: $radius-full;
    transition: background 0.15s, color 0.15s;
    letter-spacing: 0.01em;

    &:hover {
      background: $color-surface-3;
      color: $color-text;
    }

    &.active {
      background: $gradient-brand;
      color: white;
    }
  }

  .admin-btn {
    font-size: 0.8125rem;
    font-weight: 500;
    color: $color-text-muted;
    text-decoration: none;
    padding: 0.375rem 0.875rem;
    border-radius: $radius-full;
    border: 1px solid $color-border;
    transition: all 0.15s;
    white-space: nowrap;
    margin-left: auto;

    &:hover {
      border-color: $color-primary;
      color: $color-primary;
      background: rgba(99, 102, 241, 0.08);
    }
  }
</style>
