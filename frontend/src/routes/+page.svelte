<script lang="ts">
  import '../styles/variables.scss';

  const journeys = [
    {
      href: '/journeys/cs-buggy-leaderboard',
      title: 'CS: The Buggy Leaderboard',
      desc: 'Debug a broken sorting algorithm in a Node.js environment. Fix the code, run the tests, and explain your logic.',
      color: '#2563eb'
    },
    {
      href: '/journeys/vcd-hierarchy-rescue',
      title: 'VCD: Hierarchy Rescue',
      desc: 'Fix visual hierarchy in a messy O-Week poster. Duplicate the Figma file, apply design principles, and defend your choices.',
      color: '#7c3aed'
    },
    {
      href: '/journeys/spaza-ledger',
      title: 'Accounting: The Spaza Shop Ledger',
      desc: 'Categorize raw transactions into the correct ledger buckets. Test your understanding of accounting fundamentals.',
      color: '#16a34a'
    }
  ];
</script>

<section class="hero">
  <h1 class="title">Praxis</h1>
  <p class="subtitle">Interactive University Application Prototype</p>
  <p class="tagline">Select a journey below to begin your evaluation.</p>
</section>

<section class="cards">
  {#each journeys as journey}
    <a href={journey.href} class="card" style="border-top-color: {journey.color}">
      <h2 class="card-title">{journey.title}</h2>
      <p class="card-desc">{journey.desc}</p>
      <span class="card-cta">Begin &rarr;</span>
    </a>
  {/each}
</section>

<style lang="scss">
  @use '../styles/variables' as *;

  .hero {
    text-align: center;
    padding: 4rem 1.5rem 3rem;
  }

  .title {
    font-size: 2.5rem;
    font-weight: 700;
    color: $color-text;
  }

  .subtitle {
    margin-top: 0.5rem;
    color: $color-text-muted;
    font-size: 1.125rem;
  }

  .tagline {
    margin-top: 1rem;
    color: $color-text-muted;
    font-size: 0.9375rem;
  }

  .cards {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 1.5rem;
    padding: 0 1.5rem 4rem;
    max-width: 1000px;
    margin: 0 auto;
  }

  .card {
    display: flex;
    flex-direction: column;
    background: $color-surface;
    border-radius: $radius-lg;
    padding: 1.5rem;
    border-top: 4px solid;
    box-shadow: $shadow-sm;
    text-decoration: none;
    transition: box-shadow 0.2s, transform 0.2s;

    &:hover {
      box-shadow: $shadow-md;
      transform: translateY(-2px);
    }
  }

  .card-title {
    font-size: 1.125rem;
    font-weight: 600;
    color: $color-text;
    margin-bottom: 0.5rem;
  }

  .card-desc {
    font-size: 0.875rem;
    color: $color-text-muted;
    line-height: 1.6;
    flex: 1;
  }

  .card-cta {
    margin-top: 1rem;
    font-size: 0.875rem;
    font-weight: 500;
    color: $color-primary;
  }
</style>
