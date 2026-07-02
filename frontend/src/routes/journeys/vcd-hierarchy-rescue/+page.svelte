<script lang="ts">
  import '../../../styles/variables.scss';
  import { submissions } from '$lib/api';

  // --- Identity gate ---
  let identityName = $state('');
  let identityEmail = $state('');
  let identity = $state<{ name: string; email: string } | null>(null);

  // --- State ---
  let step = $state<'brief' | 'embed' | 'quiz'>('brief');
  let figmaUrl = $state('');
  let quizAnswers = $state<Record<string, string>>({ q1: '', q2: '' });
  let rationale = $state('');
  let submitted = $state(false);
  let submitting = $state(false);
  let submitError = $state('');

  const FIGMA_EMBED = 'https://www.figma.com/embed?embed_host=praxis&url=https://www.figma.com/design/yLlvHIG8koXIA2I9hADkT1/Poster---How-to-Get-Rich--Without-Getting-Lucky--by-Naval-Ravikant--Community-';

  const quizQuestions = [
    {
      id: 'q1',
      question: 'Which design principle is most important for establishing visual hierarchy?',
      options: ['Symmetry', 'Contrast in size and weight', 'Using many colors', 'Adding drop shadows'],
      correct: 1
    },
    {
      id: 'q2',
      question: 'What is the primary purpose of visual hierarchy in a poster?',
      options: ["To make it look pretty", "To guide the viewer's eye to the most important information first", "To fill empty space", "To follow current design trends"],
      correct: 1
    }
  ];

  async function submitAll() {
    submitting = true;
    submitError = '';

    const correctQuiz = quizQuestions.filter(q => Number(quizAnswers[q.id]) === q.correct).length;
    const score = Math.min(100, 70 + correctQuiz * 15);

    try {
      await submissions.create({
        challengeId: 'c-002',
        name: identity!.name,
        email: identity!.email,
        degree: 'Visual Communication Design',
        payload: { figmaUrl, quizAnswers, rationale },
        score,
        hintsUsed: 0
      });
      submitted = true;
    } catch (e) {
      submitError = (e as Error).message;
    }
    submitting = false;
  }
</script>

{#if !identity}
  <!-- Identity gate -->
  <div class="gate">
    <div class="gate-card">
      <div class="gate-icon">⬡</div>
      <h1>VCD: Hierarchy Rescue</h1>
      <p>Analyse and improve a real poster's visual hierarchy using Figma. Enter your details to begin.</p>
      <div class="gate-fields">
        <div class="gate-field">
          <label for="g-name">Full Name</label>
          <input id="g-name" type="text" bind:value={identityName} placeholder="Your full name" />
        </div>
        <div class="gate-field">
          <label for="g-email">Email Address</label>
          <input id="g-email" type="email" bind:value={identityEmail} placeholder="you@example.com" />
        </div>
      </div>
      <button
        class="btn-start"
        onclick={() => identity = { name: identityName, email: identityEmail }}
        disabled={!identityName.trim() || !identityEmail.trim()}
      >
        Begin Challenge →
      </button>
    </div>
  </div>

{:else}
  <div class="journey">
    <header class="header">
      <div class="header-tag">Visual Communication Design</div>
      <h1>Hierarchy Rescue</h1>
      <p class="brief">
        Study the poster below. Your task is to duplicate it in Figma, improve its visual hierarchy
        using contrast, scale, spacing, and typography — then submit your redesign.
      </p>
    </header>

    {#if step === 'brief'}
      <section class="panel brief-section">
        <h2>The Task</h2>
        <div class="brief-content">
          <p>You'll be working on a design poster. Your goal is to critically evaluate its visual hierarchy and produce an improved version. Look for:</p>
          <ul>
            <li>Whether the most important information dominates the layout</li>
            <li>Inconsistencies in type scale, weight, or spacing</li>
            <li>Low contrast areas that hurt readability</li>
            <li>Elements competing for attention at the same visual weight</li>
          </ul>
          <p><strong>Steps:</strong></p>
          <ol>
            <li>Click "Open in Figma" to view the poster</li>
            <li>In Figma, go to <code>File → Duplicate to your drafts</code></li>
            <li>Fix the hierarchy — apply size, weight, spacing, and contrast</li>
            <li>Share your file (set to "Anyone with the link can view") and paste the URL below</li>
          </ol>
        </div>
        <button class="btn btn-primary" onclick={() => step = 'embed'}>
          Open Poster in Figma →
        </button>
      </section>

    {:else}
      <div class="split">
        <section class="panel sidebar">
          <h2>Instructions</h2>
          <ol class="instructions">
            <li>Study the poster's current hierarchy</li>
            <li>In Figma: <strong>File → Duplicate to your drafts</strong></li>
            <li>Improve the design:
              <ul>
                <li>Make the key message dominant</li>
                <li>Create clear visual levels</li>
                <li>Improve contrast and readability</li>
              </ul>
            </li>
            <li>Share your draft (Anyone with link → can view)</li>
            <li>Paste your Figma URL below and continue</li>
          </ol>

          <div class="figma-link-input">
            <label for="figma-url">Your Figma URL</label>
            <input
              id="figma-url"
              type="url"
              bind:value={figmaUrl}
              placeholder="https://www.figma.com/file/..."
            />
            <button
              class="btn btn-primary"
              onclick={() => step = 'quiz'}
              disabled={!figmaUrl}
            >
              Continue to Quiz →
            </button>
          </div>
        </section>

        <section class="panel figma-panel">
          <div class="figma-embed">
            <iframe
              src={FIGMA_EMBED}
              allowfullscreen
              title="Figma Poster"
              loading="lazy"
            ></iframe>
          </div>
        </section>
      </div>
    {/if}

    <!-- Quiz & Rationale -->
    {#if step === 'quiz' && !submitted}
      <section class="quiz-section">
        <h2>Design Quiz</h2>
        {#each quizQuestions as q}
          <div class="quiz-item">
            <p class="question">{q.question}</p>
            <div class="options">
              {#each q.options as opt, i}
                <label class="option">
                  <input type="radio" name={q.id} value={i} bind:group={quizAnswers[q.id]} />
                  <span>{opt}</span>
                </label>
              {/each}
            </div>
          </div>
        {/each}

        <div class="rationale-section">
          <h2>Written Defense</h2>
          <p class="muted">Explain your focal point choice and how you established visual hierarchy.</p>
          <textarea
            class="rationale"
            bind:value={rationale}
            placeholder="Describe the hierarchy changes you made and why…"
          ></textarea>
        </div>

        {#if submitError}
          <div class="error-box">{submitError}</div>
        {/if}

        <button
          class="btn-submit"
          onclick={submitAll}
          disabled={!rationale.trim() || !figmaUrl || submitting}
        >
          {submitting ? 'Submitting…' : 'Submit All'}
        </button>
      </section>
    {/if}

    {#if submitted}
      <div class="success-banner">
        <span class="success-icon">✓</span>
        <div>
          <strong>Submission recorded!</strong>
          <p>Your redesign, quiz answers, and written defense have been saved. An AI summary will be generated shortly.</p>
        </div>
      </div>
    {/if}
  </div>
{/if}

<style lang="scss">
  @use '../../../styles/variables' as *;

  /* ── Gate ── */
  .gate {
    min-height: calc(100vh - 56px);
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 2rem;
    background: radial-gradient(ellipse 80% 60% at 50% 0%, rgba(168,85,247,0.1) 0%, transparent 70%);
  }

  .gate-card {
    background: $color-surface-2;
    border: 1px solid $color-border;
    border-radius: $radius-xl;
    padding: 2.5rem 2rem;
    max-width: 440px;
    width: 100%;
    box-shadow: $shadow-lg;
    text-align: center;
  }

  .gate-icon {
    font-size: 2.5rem;
    color: $color-accent;
    margin-bottom: 1.25rem;
    line-height: 1;
  }

  .gate-card h1 {
    font-family: $font-display;
    font-size: 1.375rem;
    font-weight: 700;
    color: $color-text;
    margin-bottom: 0.625rem;
  }

  .gate-card p {
    color: $color-text-subtle;
    font-size: 0.875rem;
    line-height: 1.65;
    margin-bottom: 1.75rem;
  }

  .gate-fields {
    display: flex;
    flex-direction: column;
    gap: 0.875rem;
    margin-bottom: 1.5rem;
    text-align: left;
  }

  .gate-field {
    label {
      display: block;
      font-size: 0.8125rem;
      font-weight: 500;
      color: $color-text-subtle;
      margin-bottom: 0.375rem;
    }
    input {
      width: 100%;
      padding: 0.625rem 0.875rem;
      background: $color-surface-3;
      border: 1px solid $color-border-strong;
      border-radius: $radius-md;
      color: $color-text;
      font-size: 0.9375rem;
      font-family: $font-sans;
      transition: border-color 0.15s;
      &::placeholder { color: $color-text-muted; }
      &:focus { outline: none; border-color: $color-accent; }
    }
  }

  .btn-start {
    width: 100%;
    padding: 0.75rem 1.5rem;
    background: $gradient-brand;
    color: white;
    border: none;
    border-radius: $radius-md;
    font-size: 0.9375rem;
    font-weight: 600;
    cursor: pointer;
    font-family: $font-sans;
    transition: opacity 0.15s, transform 0.15s;
    &:hover:not(:disabled) { opacity: 0.9; transform: translateY(-1px); }
    &:disabled { opacity: 0.4; cursor: not-allowed; }
  }

  /* ── Journey ── */
  .journey {
    max-width: 1100px;
    margin: 0 auto;
    padding: 2rem 1.5rem 4rem;
  }

  .header {
    margin-bottom: 2rem;
  }

  .header-tag {
    font-size: 0.6875rem;
    font-weight: 600;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: $color-accent;
    margin-bottom: 0.5rem;
  }

  .header h1 {
    font-family: $font-display;
    font-size: 1.75rem;
    font-weight: 700;
    color: $color-text;
    margin-bottom: 0.625rem;
    letter-spacing: -0.02em;
  }

  .brief {
    color: $color-text-subtle;
    line-height: 1.65;
    max-width: 680px;
  }

  .panel {
    background: $color-surface-2;
    border: 1px solid $color-border;
    border-radius: $radius-lg;
    padding: 1.5rem;
    margin-bottom: 1.5rem;

    h2 {
      font-family: $font-display;
      font-size: 1rem;
      font-weight: 700;
      color: $color-text;
      margin-bottom: 1rem;
    }
  }

  .brief-content {
    font-size: 0.9375rem;
    line-height: 1.7;
    color: $color-text-subtle;
    margin-bottom: 1.5rem;

    ul, ol { padding-left: 1.25rem; margin: 0.5rem 0;
      li { margin-bottom: 0.3rem; }
    }
    p { margin: 0.75rem 0; }
    strong { color: $color-text; }
    code {
      font-family: $font-mono;
      font-size: 0.8125rem;
      background: $color-surface-3;
      padding: 0.125rem 0.375rem;
      border-radius: 4px;
      color: $color-primary;
    }
  }

  .btn {
    padding: 0.625rem 1.25rem;
    font-size: 0.875rem;
    font-weight: 600;
    border-radius: $radius-md;
    cursor: pointer;
    font-family: $font-sans;
    transition: opacity 0.15s;
    border: none;

    &-primary {
      background: $gradient-brand;
      color: white;
      &:hover:not(:disabled) { opacity: 0.9; }
      &:disabled { opacity: 0.4; cursor: not-allowed; }
    }
  }

  .split {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1rem;
    @media (max-width: $breakpoint-md) { grid-template-columns: 1fr; }
  }

  .sidebar {
    font-size: 0.9375rem;
    .instructions {
      padding-left: 1.25rem;
      color: $color-text-subtle;
      line-height: 1.7;
      li { margin-bottom: 0.5rem; }
      ul { margin-top: 0.25rem; padding-left: 1.25rem; color: $color-text-muted; font-size: 0.875rem; }
      strong { color: $color-text; }
    }
  }

  .figma-link-input {
    margin-top: 1.5rem;
    border-top: 1px solid $color-border;
    padding-top: 1.25rem;

    label {
      display: block;
      font-size: 0.8125rem;
      font-weight: 500;
      color: $color-text-subtle;
      margin-bottom: 0.375rem;
    }
    input {
      width: 100%;
      padding: 0.625rem 0.875rem;
      background: $color-surface-3;
      border: 1px solid $color-border-strong;
      border-radius: $radius-md;
      color: $color-text;
      font-size: 0.875rem;
      font-family: $font-sans;
      margin-bottom: 0.75rem;
      &::placeholder { color: $color-text-muted; }
      &:focus { outline: none; border-color: $color-accent; }
    }
  }

  .figma-panel {
    padding: 0;
    overflow: hidden;
    min-height: 480px;
  }

  .figma-embed iframe {
    width: 100%;
    height: 560px;
    border: none;
    display: block;
  }

  /* Quiz */
  .quiz-section {
    background: $color-surface-2;
    border: 1px solid $color-border;
    border-radius: $radius-lg;
    padding: 1.75rem;
    margin-bottom: 1.5rem;

    h2 {
      font-family: $font-display;
      font-size: 1.125rem;
      font-weight: 700;
      color: $color-text;
      margin-bottom: 1.25rem;
    }
  }

  .quiz-item {
    margin-bottom: 1.75rem;
    .question {
      font-weight: 500;
      color: $color-text;
      font-size: 0.9375rem;
      margin-bottom: 0.75rem;
    }
  }

  .options { display: flex; flex-direction: column; gap: 0.5rem; }

  .option {
    display: flex;
    align-items: center;
    gap: 0.625rem;
    font-size: 0.9rem;
    color: $color-text-subtle;
    cursor: pointer;
    padding: 0.5rem 0.75rem;
    border-radius: $radius-md;
    border: 1px solid transparent;
    transition: all 0.15s;
    &:hover { background: $color-surface-3; border-color: $color-border; }
    input[type="radio"] { accent-color: $color-accent; width: 1rem; height: 1rem; }
  }

  .rationale-section {
    border-top: 1px solid $color-border;
    padding-top: 1.5rem;
    margin-top: 1.5rem;
    h2 { margin-bottom: 0.375rem; }
    .muted { color: $color-text-muted; font-size: 0.875rem; margin-bottom: 0.75rem; }
  }

  .rationale {
    width: 100%;
    min-height: 120px;
    padding: 0.75rem 1rem;
    background: $color-surface-3;
    border: 1px solid $color-border-strong;
    border-radius: $radius-md;
    color: $color-text;
    font-family: $font-sans;
    font-size: 0.9375rem;
    line-height: 1.6;
    resize: vertical;
    &::placeholder { color: $color-text-muted; }
    &:focus { outline: none; border-color: $color-accent; }
  }

  .muted { color: $color-text-muted; font-size: 0.875rem; }

  .error-box {
    padding: 0.75rem 1rem;
    background: $color-error-bg;
    border: 1px solid rgba(239,68,68,0.2);
    border-radius: $radius-md;
    color: $color-error;
    font-size: 0.875rem;
    margin-top: 1rem;
  }

  .btn-submit {
    background: $gradient-brand;
    color: white;
    border: none;
    padding: 0.75rem 2rem;
    font-size: 0.9375rem;
    font-weight: 600;
    border-radius: $radius-md;
    margin-top: 1.5rem;
    cursor: pointer;
    font-family: $font-sans;
    transition: opacity 0.15s;
    &:hover:not(:disabled) { opacity: 0.9; }
    &:disabled { opacity: 0.4; cursor: not-allowed; }
  }

  .success-banner {
    display: flex;
    align-items: flex-start;
    gap: 1rem;
    padding: 1.25rem 1.5rem;
    background: $color-success-bg;
    border: 1px solid rgba(34,197,94,0.2);
    border-radius: $radius-lg;
    margin-top: 1rem;

    .success-icon { font-size: 1.25rem; color: $color-success; flex-shrink: 0; margin-top: 0.125rem; }
    strong { color: $color-success; display: block; margin-bottom: 0.25rem; }
    p { color: $color-text-subtle; font-size: 0.875rem; line-height: 1.5; }
  }
</style>
