<script lang="ts">
  import '../styles/variables.scss';

  const journeys = [
    {
      href: '/journeys/cs-buggy-leaderboard',
      tag: 'Computer Science',
      title: 'The Buggy Leaderboard',
      desc: 'Debug a broken sorting algorithm. Fix the code, run the tests, and explain your logic under the hood.',
      color: '#6366f1',
      glyph: '{ }'
    },
    {
      href: '/journeys/vcd-hierarchy-rescue',
      tag: 'Visual Communication Design',
      title: 'Hierarchy Rescue',
      desc: 'Rescue a chaotic O-Week poster. Apply design principles in Figma and defend your hierarchy decisions.',
      color: '#a855f7',
      glyph: '⬡'
    },
    {
      href: '/journeys/spaza-ledger',
      tag: 'Accounting',
      title: 'The Spaza Shop Ledger',
      desc: 'Sort raw transactions into the correct ledger buckets. Prove you understand the Business Entity Concept.',
      color: '#22c55e',
      glyph: '₿'
    }
  ];
</script>

<div class="page">
  <section class="hero">
    <div class="hero-badge">Interactive Evaluation Platform</div>
    <h1 class="hero-title">
      Prove your readiness.<br />
      <span class="hero-gradient">Not just your grades.</span>
    </h1>
    <p class="hero-sub">
      Select a journey below to begin your practical evaluation.
      Each challenge adapts to your discipline and tests real-world thinking.
    </p>
  </section>

  <section class="journeys">
    {#each journeys as j}
      <a href={j.href} class="card" style="--accent: {j.color}">
        <div class="card-glyph" style="color: {j.color}">{j.glyph}</div>
        <div class="card-tag">{j.tag}</div>
        <h2 class="card-title">{j.title}</h2>
        <p class="card-desc">{j.desc}</p>
        <span class="card-cta">Begin challenge →</span>
      </a>
    {/each}
  </section>
</div>

<style lang="scss">
  @use '../styles/variables' as *;

  .page {
    max-width: 1100px;
    margin: 0 auto;
    padding: 0 1.5rem 5rem;
  }

  /* Hero */
  .hero {
    padding: 5rem 0 4rem;
    text-align: center;
  }

  .hero-badge {
    display: inline-flex;
    align-items: center;
    padding: 0.375rem 1rem;
    background: $gradient-brand-subtle;
    border: 1px solid rgba(99, 102, 241, 0.25);
    border-radius: $radius-full;
    font-size: 0.75rem;
    font-weight: 600;
    color: $color-primary;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    margin-bottom: 1.75rem;
  }

  .hero-title {
    font-family: $font-display;
    font-size: clamp(2.5rem, 6vw, 4rem);
    font-weight: 700;
    color: $color-text;
    letter-spacing: -0.03em;
    line-height: 1.1;
    margin-bottom: 1.25rem;
  }

  .hero-gradient {
    background: $gradient-brand;
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  .hero-sub {
    max-width: 520px;
    margin: 0 auto;
    color: $color-text-subtle;
    font-size: 1.0625rem;
    line-height: 1.7;
  }

  /* Journey cards */
  .journeys {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 1.25rem;
  }

  .card {
    display: flex;
    flex-direction: column;
    background: $color-surface-2;
    border-radius: $radius-xl;
    padding: 1.75rem;
    border: 1px solid $color-border;
    text-decoration: none;
    transition: border-color 0.2s, transform 0.2s, box-shadow 0.2s;
    position: relative;
    overflow: hidden;

    &::before {
      content: '';
      position: absolute;
      inset: 0;
      background: linear-gradient(135deg, rgba(var(--accent-rgb), 0.06) 0%, transparent 60%);
      opacity: 0;
      transition: opacity 0.3s;
    }

    &:hover {
      border-color: rgba(99, 102, 241, 0.3);
      transform: translateY(-3px);
      box-shadow: $shadow-md;

      &::before { opacity: 1; }

      .card-cta { color: var(--accent); }
    }
  }

  .card-glyph {
    font-size: 2rem;
    font-weight: 700;
    font-family: $font-display;
    line-height: 1;
    margin-bottom: 1.25rem;
    opacity: 0.9;
  }

  .card-tag {
    font-size: 0.6875rem;
    font-weight: 600;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: $color-text-muted;
    margin-bottom: 0.5rem;
  }

  .card-title {
    font-family: $font-display;
    font-size: 1.25rem;
    font-weight: 700;
    color: $color-text;
    letter-spacing: -0.02em;
    margin-bottom: 0.75rem;
  }

  .card-desc {
    font-size: 0.875rem;
    color: $color-text-subtle;
    line-height: 1.65;
    flex: 1;
  }

  .card-cta {
    margin-top: 1.5rem;
    font-size: 0.875rem;
    font-weight: 600;
    color: $color-text-muted;
    transition: color 0.2s;
  }
</style>
