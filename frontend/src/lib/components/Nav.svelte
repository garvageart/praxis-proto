<script lang="ts">
  import { page } from '$app/stores';

  const links = [
    { href: '/', label: 'Home' },
    { href: '/journeys/cs-buggy-leaderboard', label: 'CS: Buggy Leaderboard' },
    { href: '/journeys/vcd-hierarchy-rescue', label: 'VCD: Hierarchy Rescue' },
    { href: '/journeys/spaza-ledger', label: 'Accounting: Spaza Ledger' }
  ];
</script>

<nav class="nav">
  <a href="/" class="logo">Praxis</a>
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
</nav>

<style lang="scss">
  @use '../../styles/variables' as *;

  .nav {
    display: flex;
    align-items: center;
    gap: 1.5rem;
    padding: 0.75rem 1.5rem;
    background: $color-surface;
    border-bottom: 1px solid #e5e5e5;
    position: sticky;
    top: 0;
    z-index: 100;
  }

  .logo {
    font-weight: 700;
    font-size: 1.25rem;
    color: $color-primary;
    text-decoration: none;
  }

  .links {
    display: flex;
    gap: 1rem;
  }

  .link {
    text-decoration: none;
    color: $color-text-muted;
    font-size: 0.875rem;
    padding: 0.375rem 0.75rem;
    border-radius: $radius-sm;
    transition: background 0.15s, color 0.15s;

    &:hover {
      background: #f0f0f0;
      color: $color-text;
    }

    &.active {
      background: $color-primary;
      color: white;
    }
  }
</style>
