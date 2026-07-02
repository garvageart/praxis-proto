<script lang="ts">
  import { page } from '$app/stores';

  const links = [
    { href: '/admin', label: 'Dashboard', icon: '◈' },
    { href: '/admin/applicants', label: 'Applicants', icon: '◉' },
    { href: '/admin/challenges', label: 'Challenges', icon: '◆' },
    { href: '/admin/upload', label: 'Upload & Generate', icon: '◎' }
  ];
</script>

<aside class="sidebar">
  <div class="brand">
    <span class="brand-mark">✦</span>
    <div>
      <div class="brand-name">Praxis</div>
      <div class="brand-sub">Admin Console</div>
    </div>
  </div>
  <nav class="nav">
    {#each links as link}
      <a
        href={link.href}
        class="nav-link"
        class:active={$page.url.pathname === link.href || ($page.url.pathname.startsWith(link.href) && link.href !== '/admin')}
      >
        <span class="icon">{link.icon}</span>
        {link.label}
      </a>
    {/each}
  </nav>
  <div class="footer">
    <a href="/" class="back-link">← Back to site</a>
  </div>
</aside>

<style lang="scss">
  @use '../../../styles/variables' as *;

  .sidebar {
    width: 240px;
    min-height: 100vh;
    background: $color-surface;
    border-right: 1px solid $color-border;
    display: flex;
    flex-direction: column;
    position: fixed;
    left: 0;
    top: 0;
  }

  .brand {
    padding: 1.25rem 1.25rem 1rem;
    border-bottom: 1px solid $color-border;
    display: flex;
    align-items: center;
    gap: 0.75rem;
  }

  .brand-mark {
    width: 32px;
    height: 32px;
    background: $gradient-brand;
    border-radius: $radius-md;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1rem;
    color: white;
    flex-shrink: 0;
    box-shadow: $shadow-glow;
  }

  .brand-name {
    font-family: $font-display;
    font-weight: 700;
    font-size: 1rem;
    color: $color-text;
    line-height: 1;
  }

  .brand-sub {
    font-size: 0.6875rem;
    color: $color-text-muted;
    margin-top: 0.125rem;
    text-transform: uppercase;
    letter-spacing: 0.06em;
  }

  .nav {
    flex: 1;
    padding: 0.75rem;
    display: flex;
    flex-direction: column;
    gap: 0.125rem;
  }

  .nav-link {
    display: flex;
    align-items: center;
    gap: 0.625rem;
    padding: 0.625rem 0.75rem;
    border-radius: $radius-md;
    color: $color-text-muted;
    text-decoration: none;
    font-size: 0.8125rem;
    font-weight: 500;
    transition: background 0.15s, color 0.15s;

    &:hover {
      background: $color-surface-3;
      color: $color-text;
    }

    &.active {
      background: $gradient-brand-subtle;
      color: $color-primary;
      border: 1px solid rgba(99, 102, 241, 0.2);
    }
  }

  .icon {
    font-size: 0.875rem;
    width: 1.125rem;
    text-align: center;
    opacity: 0.8;
  }

  .footer {
    padding: 0.75rem;
    border-top: 1px solid $color-border;
  }

  .back-link {
    display: block;
    padding: 0.5rem 0.75rem;
    color: $color-text-muted;
    text-decoration: none;
    font-size: 0.8125rem;
    border-radius: $radius-md;
    transition: all 0.15s;

    &:hover {
      color: $color-text;
      background: $color-surface-3;
    }
  }
</style>
