<script lang="ts">
  import '../../../styles/variables.scss';
  import { submissions } from '$lib/api';

  // --- Identity gate ---
  let identityName = $state('');
  let identityEmail = $state('');
  let identity = $state<{ name: string; email: string } | null>(null);

  // --- Challenge Data ---
  const initialCode = `// Fix the sorting function so the leaderboard is in descending order
function sortLeaderboard(students) {
  return students.sort((a, b) => a.score - b.score);
}`;

  const testCode = `const students = [
  { name: "Alice", score: 85 },
  { name: "Bob", score: 92 },
  { name: "Charlie", score: 78 },
  { name: "Diana", score: 95 },
  { name: "Eve", score: 88 }
];

const sorted = sortLeaderboard(students);
sorted.forEach((s, i) => console.log(\`\${i + 1}. \${s.name} — \${s.score}\`));

const correct = sorted.every((s, i) => i === 0 || sorted[i - 1].score >= s.score);
console.log(correct ? "✓ PASS: Correctly sorted descending" : "✗ FAIL: Not in descending order");
`;

  // --- State ---
  let code = $state(initialCode);
  let output = $state<string[]>([]);
  let testPassed = $state<boolean | null>(null);
  let hintsUsed = $state(0);
  let showHint = $state(false);
  let showQuiz = $state(false);
  let quizAnswers = $state<Record<string, string>>({ q1: '', q2: '' });
  let rationale = $state('');
  let submitted = $state(false);
  let submitting = $state(false);
  let submitError = $state('');

  const hints = [
    "Look at the comparison in the sort function. What's the difference between ascending and descending order?",
    "The sort function uses `a.score - b.score` (ascending). Try swapping the subtraction order.",
    "Change `a.score - b.score` to `b.score - a.score` to reverse the sort direction."
  ];
  let hintIndex = $state(0);
  let currentHint = $derived(hints[Math.min(hintIndex, hints.length - 1)]);

  function requestHint() {
    hintsUsed++;
    showHint = true;
    hintIndex = Math.min(hintIndex + 1, hints.length - 1);
  }

  function runTests() {
    output = [];
    testPassed = null;
    showHint = false;
    showQuiz = false;

    try {
      const logs: string[] = [];
      const mockConsole = { log: (...args: unknown[]) => logs.push(args.map(String).join(' ')) };
      const fn = new Function('console', code + '\n\n' + testCode);
      fn(mockConsole);
      output = logs;
      testPassed = logs.some(l => l.includes('PASS'));
    } catch (e) {
      output = [`Error: ${(e as Error).message}`];
      testPassed = false;
    }
  }

  const quizQuestions = [
    {
      id: 'q1',
      question: 'What does Array.prototype.sort() return?',
      options: ['A new sorted array', 'The original array, sorted in place', 'undefined', 'A copy of the array'],
      correct: 1
    },
    {
      id: 'q2',
      question: 'If a sort comparator returns a negative value, what happens?',
      options: ['a is sorted after b', 'a is sorted before b', 'The array is reversed', 'Nothing changes'],
      correct: 1
    }
  ];

  async function submitAll() {
    submitting = true;
    submitError = '';
    const correctQuiz = quizQuestions.filter(q => Number(quizAnswers[q.id]) === q.correct).length;
    const score = testPassed ? Math.max(0, 80 - hintsUsed * 15 + correctQuiz * 10) : Math.min(20, correctQuiz * 10);

    try {
      await submissions.create({
        challengeId: 'c-001',
        name: identity!.name,
        email: identity!.email,
        degree: 'Computer Science',
        payload: { code, output, testPassed, quizAnswers, rationale },
        score,
        hintsUsed
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
      <div class="gate-icon"></div>
      <h1>CS: The Buggy Leaderboard</h1>
      <p>Debug a broken sorting algorithm, run tests, and explain your solution. Enter your details to begin.</p>
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
      <div class="header-tag">Computer Science</div>
      <h1>The Buggy Leaderboard</h1>
      <p class="brief">
        A broken sorting function is producing incorrect rankings. Fix the code so students are ranked
        in <strong>descending order</strong> by score. Run the tests, then answer the follow-up questions.
      </p>
    </header>

    <div class="workspace">
      <!-- Editor -->
      <section class="panel">
        <div class="panel-header">
          <h2>Editor</h2>
          <div class="actions">
            <button class="btn btn-hint" onclick={requestHint} disabled={hintIndex >= hints.length}>
              Hint ({hintsUsed})
            </button>
            <button class="btn btn-run" onclick={runTests}>▶ Run Tests</button>
          </div>
        </div>
        <textarea class="editor" bind:value={code} spellcheck="false"></textarea>
      </section>

      <!-- Output -->
      <section class="panel">
        <div class="panel-header">
          <h2>Output</h2>
          {#if testPassed !== null}
            <span class="badge" class:pass={testPassed} class:fail={!testPassed}>
              {testPassed ? '✓ PASS' : '✗ FAIL'}
            </span>
          {/if}
        </div>
        <div class="output">
          {#if output.length === 0}
            <p class="muted">Run the tests to see output…</p>
          {:else}
            {#each output as line}
              <code class:pass-line={line.includes('PASS')} class:fail-line={line.includes('FAIL')}>{line}</code>
            {/each}
          {/if}
        </div>

        {#if testPassed && !submitted}
          <div class="next-steps">
            <button class="btn btn-primary" onclick={() => { showQuiz = true; }}>
              Continue to Quiz & Rationale →
            </button>
          </div>
        {/if}

        {#if showHint}
          <div class="hint-box">
            <span class="hint-label">Hint {hintIndex}/{hints.length}</span>
            {currentHint}
          </div>
        {/if}
      </section>
    </div>

    <!-- Quiz & Rationale -->
    {#if showQuiz && !submitted}
      <section class="quiz-section">
        <h2>Technical Quiz</h2>
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
          <h2>Written Rationale</h2>
          <p class="muted">Explain the bug you found and why your solution works.</p>
          <textarea
            class="rationale"
            bind:value={rationale}
            placeholder="Describe what was wrong and how you fixed it…"
          ></textarea>
        </div>

        {#if submitError}
          <div class="error-box">{submitError}</div>
        {/if}

        <button
          class="btn btn-submit"
          onclick={submitAll}
          disabled={!rationale.trim() || submitting}
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
          <p>Your code, quiz answers, and rationale have been saved. An AI summary will be generated shortly.</p>
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
    background: radial-gradient(ellipse 80% 60% at 50% 0%, rgba(99,102,241,0.12) 0%, transparent 70%);
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
    font-family: $font-mono;
    font-size: 2.5rem;
    font-weight: 700;
    color: $color-primary;
    margin-bottom: 1.25rem;
    opacity: 0.9;
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
      &:focus { outline: none; border-color: $color-primary; }
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
    transition: opacity 0.15s, transform 0.15s;
    font-family: $font-sans;
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
    color: $color-primary;
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
    strong { color: $color-text; }
  }

  /* Workspace */
  .workspace {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1rem;
    margin-bottom: 1.5rem;
    @media (max-width: $breakpoint-md) { grid-template-columns: 1fr; }
  }

  .panel {
    background: $color-surface-2;
    border: 1px solid $color-border;
    border-radius: $radius-lg;
    overflow: hidden;
  }

  .panel-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0.625rem 1rem;
    border-bottom: 1px solid $color-border;
    background: $color-surface-3;

    h2 {
      font-size: 0.75rem;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.07em;
      color: $color-text-muted;
    }
  }

  .actions { display: flex; gap: 0.5rem; }

  .editor {
    width: 100%;
    min-height: 320px;
    padding: 1rem;
    font-family: $font-mono;
    font-size: 0.875rem;
    line-height: 1.7;
    border: none;
    resize: vertical;
    background: #0d0d14;
    color: #c8d3f5;
    tab-size: 2;
    &:focus { outline: none; }
  }

  .output {
    padding: 1rem;
    min-height: 120px;
    font-family: $font-mono;
    font-size: 0.8125rem;
    line-height: 1.7;
    background: #070710;
    code {
      display: block;
      color: #a9b1d6;
      &.pass-line { color: #9ece6a; }
      &.fail-line { color: #f7768e; }
    }
  }

  .muted { color: $color-text-muted; font-size: 0.875rem; }

  .badge {
    font-size: 0.75rem;
    font-weight: 700;
    padding: 0.25rem 0.625rem;
    border-radius: $radius-full;
    &.pass { background: $color-success-bg; color: $color-success; }
    &.fail { background: $color-error-bg; color: $color-error; }
  }

  /* Buttons */
  .btn {
    padding: 0.4rem 0.875rem;
    font-size: 0.8125rem;
    font-weight: 500;
    border-radius: $radius-md;
    border: 1px solid $color-border-strong;
    background: $color-surface-3;
    color: $color-text-subtle;
    cursor: pointer;
    font-family: $font-sans;
    transition: all 0.15s;
    &:hover:not(:disabled) { background: $color-border; color: $color-text; }
    &:disabled { opacity: 0.4; cursor: not-allowed; }

    &-run {
      background: $color-primary;
      color: white;
      border-color: $color-primary;
      &:hover:not(:disabled) { background: $color-primary-hover; border-color: $color-primary-hover; }
    }

    &-hint {
      background: rgba(245, 158, 11, 0.12);
      color: $color-warning;
      border-color: rgba(245, 158, 11, 0.2);
      &:hover:not(:disabled) { background: rgba(245, 158, 11, 0.2); }
    }

    &-primary {
      background: $gradient-brand;
      color: white;
      border: none;
      padding: 0.625rem 1.25rem;
      font-size: 0.875rem;
      &:hover { opacity: 0.9; }
    }

    &-submit {
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
  }

  .next-steps {
    padding: 1rem;
    border-top: 1px solid $color-border;
  }

  .hint-box {
    padding: 0.875rem 1rem;
    background: rgba(245, 158, 11, 0.06);
    border-top: 1px solid rgba(245, 158, 11, 0.15);
    font-size: 0.875rem;
    line-height: 1.6;
    color: $color-text-subtle;
    .hint-label {
      display: block;
      font-size: 0.6875rem;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.07em;
      color: $color-warning;
      margin-bottom: 0.25rem;
    }
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
      margin-bottom: 0.75rem;
      font-size: 0.9375rem;
    }
  }

  .options {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

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
    input[type="radio"] { accent-color: $color-primary; width: 1rem; height: 1rem; }
  }

  .rationale-section {
    border-top: 1px solid $color-border;
    padding-top: 1.5rem;
    margin-top: 1.5rem;
    h2 { margin-bottom: 0.375rem; }
    .muted { margin-bottom: 0.75rem; }
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
    &:focus { outline: none; border-color: $color-primary; }
  }

  .error-box {
    padding: 0.75rem 1rem;
    background: $color-error-bg;
    border: 1px solid rgba(239,68,68,0.2);
    border-radius: $radius-md;
    color: $color-error;
    font-size: 0.875rem;
    margin-top: 1rem;
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

    .success-icon {
      font-size: 1.25rem;
      color: $color-success;
      flex-shrink: 0;
      margin-top: 0.125rem;
    }

    strong { color: $color-success; display: block; margin-bottom: 0.25rem; }
    p { color: $color-text-subtle; font-size: 0.875rem; line-height: 1.5; }
  }
</style>
