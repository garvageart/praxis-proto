<script lang="ts">
  import { page } from '$app/stores';

  const links = [
    { href: '/admin', label: 'Dashboard', icon: '📊' },
    { href: '/admin/applicants', label: 'Applicants', icon: '👤' },
    { href: '/admin/challenges', label: 'Challenges', icon: '📝' },
    { href: '/admin/upload', label: 'Upload & Generate', icon: '📤' }
  ];
</script>

<aside class="sidebar">
  <div class="brand">Praxis Admin</div>
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
    <a href="/" class="back-link">&larr; Back to site</a>
  </div>
</aside>

<style lang="scss">
  @use '../../../styles/variables' as *;

  .sidebar {
    width: 240px;
    min-height: 100vh;
    background: #1e1e2e;
    color: #cdd6f4;
    display: flex;
    flex-direction: column;
    position: fixed;
    left: 0;
    top: 0;
  }

  .brand {
    padding: 1.25rem 1.5rem;
    font-size: 1.125rem;
    font-weight: 700;
    border-bottom: 1px solid #313244;
    color: #cba6f7;
  }

  .nav {
    flex: 1;
    padding: 0.75rem;
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
  }

  .nav-link {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 0.625rem 0.75rem;
    border-radius: $radius-sm;
    color: #a6adc8;
    text-decoration: none;
    font-size: 0.875rem;
    transition: background 0.15s, color 0.15s;

    &:hover {
      background: #313244;
      color: #cdd6f4;
    }

    &.active {
      background: #45475a;
      color: #cba6f7;
      font-weight: 500;
    }
  }

  .icon {
    font-size: 1rem;
    width: 1.25rem;
    text-align: center;
  }

  .footer {
    padding: 0.75rem;
    border-top: 1px solid #313244;
  }

  .back-link {
    display: block;
    padding: 0.5rem 0.75rem;
    color: #6c7086;
    text-decoration: none;
    font-size: 0.8125rem;
    border-radius: $radius-sm;

    &:hover {
      color: #cdd6f4;
      background: #313244;
    }
  }
</style>
