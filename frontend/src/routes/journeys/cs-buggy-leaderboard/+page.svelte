<script lang="ts">
  import '../../../styles/variables.scss';

  // --- Challenge Data ---
  const initialCode = `// Fix the sorting function so the leaderboard is in descending order
function sortLeaderboard(students) {
  return students.sort((a, b) => a.score - b.score);
}`;

  const testCode = `// Student data
const students = [
  { name: "Alice", score: 85 },
  { name: "Bob", score: 92 },
  { name: "Charlie", score: 78 },
  { name: "Diana", score: 95 },
  { name: "Eve", score: 88 }
];

const sorted = sortLeaderboard(students);
console.log("Leaderboard:");
sorted.forEach((s, i) => console.log(\`\${i + 1}. \${s.name} - \${s.score}\`));

// Check: should be descending by score
const correct = sorted.every((s, i) => i === 0 || sorted[i - 1].score >= s.score);
console.log(correct ? "PASS: Correctly sorted" : "FAIL: Not in descending order");
`;

  // --- State ---
  let code = $state(initialCode);
  let output = $state<string[]>([]);
  let testPassed = $state<boolean | null>(null);
  let hintsUsed = $state(0);
  let showHint = $state(false);
  let showQuiz = $state(false);
  let showRationale = $state(false);
  let quizAnswers = $state<Record<string, string>>({ q1: '', q2: '' });
  let rationale = $state('');
  let submitted = $state(false);

  // --- Hint system ---
  const hints = [
    "Look at the comparison in the sort function. What's the difference between ascending and descending order?",
    "The sort function currently sorts by \`a.score - b.score\` (ascending). Try swapping the subtraction order.",
    "Use \`b.score - a.score\` instead of \`a.score - b.score\` to reverse the sort direction."
  ];
  let hintIndex = $state(0);
  let currentHint = $derived(hints[hintIndex]);

  function requestHint() {
    hintsUsed++;
    showHint = true;
    hintIndex = Math.min(hintIndex + 1, hints.length - 1);
  }

  // --- Runner ---
  function runTests() {
    output = [];
    testPassed = null;
    showHint = false;
    showQuiz = false;

    try {
      // Capture console.log
      const logs: string[] = [];
      const mockLog = (...args: unknown[]) => logs.push(args.map(String).join(' '));

      // Eval the user's code + test
      const fn = new Function('console', code + '\n\n' + testCode);
      fn(mockLog);

      output = logs;
      testPassed = logs.some(l => l.includes('PASS'));
    } catch (e) {
      output = [`Error: ${(e as Error).message}`];
      testPassed = false;
    }
  }

  // --- Quiz ---
  const quizQuestions = [
    {
      id: 'q1',
      question: 'What does Array.prototype.sort() return?',
      options: ['A new sorted array', 'The original array, sorted in place', 'undefined', 'A copy of the array'],
      correct: 1
    },
    {
      id: 'q2',
      question: 'If sort comparator returns a negative value, what happens?',
      options: ['a is sorted after b', 'a is sorted before b', 'The array is reversed', 'Nothing changes'],
      correct: 1
    }
  ];

  function submitAll() {
    submitted = true;
  }
</script>

<div class="journey">
  <header class="header">
    <h1>The Buggy Leaderboard</h1>
    <p class="brief">
      A broken sorting function is producing incorrect rankings. Fix the code so the leaderboard
      displays students in descending order of score. Run the tests to verify, then answer the follow-up questions.
    </p>
  </header>

  <div class="workspace">
    <!-- Editor -->
    <section class="panel">
      <div class="panel-header">
        <h2>Editor</h2>
        <div class="actions">
          <button class="btn btn-hint" onclick={requestHint} disabled={hintIndex >= hints.length - 1}>
            Hint ({hintsUsed})
          </button>
          <button class="btn btn-run" onclick={runTests}>Run Tests</button>
        </div>
      </div>
      <textarea
        class="editor"
        bind:value={code}
        spellcheck="false"
      ></textarea>
    </section>

    <!-- Output -->
    <section class="panel">
      <div class="panel-header">
        <h2>Output</h2>
        {#if testPassed !== null}
          <span class="badge" class:pass={testPassed} class:fail={!testPassed}>
            {testPassed ? 'PASS' : 'FAIL'}
          </span>
        {/if}
      </div>
      <div class="output">
        {#if output.length === 0}
          <p class="muted">Run the tests to see output...</p>
        {:else}
          {#each output as line}
            <code>{line}</code>
          {/each}
        {/if}
      </div>

      {#if testPassed && !submitted}
        <div class="next-steps">
          <button class="btn btn-primary" onclick={() => { showQuiz = true; showRationale = true; }}>
            Continue to Quiz & Rationale
          </button>
        </div>
      {/if}

      {#if showHint}
        <div class="hint-box">
          <strong>Hint:</strong> {currentHint}
        </div>
      {/if}
    </section>
  </div>

  <!-- Quiz & Rationale -->
  {#if showQuiz}
    <section class="panel quiz-section">
      <h2>Technical Quiz</h2>

      {#each quizQuestions as q}
        <div class="quiz-item">
          <p>{q.question}</p>
          <div class="options">
            {#each q.options as opt, i}
              <label class="option">
                <input
                  type="radio"
                  name={q.id}
                  value={i}
                  bind:group={quizAnswers[q.id]}
                  disabled={submitted}
                />
                {opt}
              </label>
            {/each}
          </div>
        </div>
      {/each}

      <h2>Written Rationale</h2>
      <p class="muted">Explain the bug you fixed and why your solution works.</p>
      <textarea
        class="rationale"
        bind:value={rationale}
        placeholder="Describe what was wrong and how you fixed it..."
        disabled={submitted}
      ></textarea>

      {#if !submitted}
        <button class="btn btn-primary" onclick={submitAll} disabled={!rationale.trim()}>
          Submit All
        </button>
      {:else}
        <div class="success">Submitted! Your scores have been recorded.</div>
      {/if}
    </section>
  {/if}
</div>

<style lang="scss">
  @use '../../../styles/variables' as *;

  .journey {
    max-width: 1100px;
    margin: 0 auto;
    padding: 2rem 1.5rem;
  }

  .header {
    margin-bottom: 2rem;

    h1 {
      font-size: 1.75rem;
      font-weight: 700;
    }

    .brief {
      margin-top: 0.5rem;
      color: $color-text-muted;
      line-height: 1.6;
    }
  }

  .workspace {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1rem;
    margin-bottom: 1.5rem;

    @media (max-width: 768px) {
      grid-template-columns: 1fr;
    }
  }

  .panel {
    background: $color-surface;
    border-radius: $radius-md;
    box-shadow: $shadow-sm;
    overflow: hidden;
  }

  .panel-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0.75rem 1rem;
    border-bottom: 1px solid #e5e5e5;
    background: #fafafa;

    h2 {
      font-size: 0.875rem;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: $color-text-muted;
    }
  }

  .actions {
    display: flex;
    gap: 0.5rem;
  }

  .editor {
    width: 100%;
    min-height: 300px;
    padding: 1rem;
    font-family: $font-mono;
    font-size: 0.875rem;
    line-height: 1.6;
    border: none;
    resize: vertical;
    background: #1e1e2e;
    color: #cdd6f4;
    tab-size: 2;

    &:focus {
      outline: none;
    }
  }

  .output {
    padding: 1rem;
    min-height: 120px;
    font-family: $font-mono;
    font-size: 0.8125rem;
    line-height: 1.6;
    background: #0f0f1a;
    color: #a6e3a1;

    code {
      display: block;
    }
  }

  .muted {
    color: $color-text-muted;
    font-size: 0.875rem;
  }

  .badge {
    font-size: 0.75rem;
    font-weight: 700;
    padding: 0.25rem 0.5rem;
    border-radius: $radius-sm;

    &.pass {
      background: #dcfce7;
      color: #166534;
    }

    &.fail {
      background: #fee2e2;
      color: #991b1b;
    }
  }

  .btn {
    padding: 0.5rem 1rem;
    font-size: 0.8125rem;
    font-weight: 500;
    border: 1px solid #d1d5db;
    border-radius: $radius-sm;
    background: white;
    cursor: pointer;
    transition: background 0.15s;

    &:hover:not(:disabled) {
      background: #f3f4f6;
    }

    &:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    &-run {
      background: $color-primary;
      color: white;
      border-color: $color-primary;

      &:hover:not(:disabled) {
        background: $color-primary-hover;
      }
    }

    &-hint {
      background: $color-warning;
      color: white;
      border-color: $color-warning;
    }

    &-primary {
      background: $color-primary;
      color: white;
      border-color: $color-primary;
      margin-top: 1rem;

      &:hover {
        background: $color-primary-hover;
      }
    }
  }

  .next-steps {
    padding: 1rem;
    border-top: 1px solid #e5e5e5;
  }

  .hint-box {
    padding: 1rem;
    background: #fffbeb;
    border-top: 1px solid #fde68a;
    font-size: 0.875rem;
    line-height: 1.5;
  }

  .quiz-section {
    padding: 1.5rem;

    h2 {
      font-size: 1.125rem;
      font-weight: 600;
      margin: 1.5rem 0 1rem;

      &:first-child {
        margin-top: 0;
      }
    }
  }

  .quiz-item {
    margin-bottom: 1.5rem;

    p {
      font-weight: 500;
      margin-bottom: 0.5rem;
    }
  }

  .options {
    display: flex;
    flex-direction: column;
    gap: 0.375rem;
  }

  .option {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 0.9375rem;
    cursor: pointer;

    input[type="radio"] {
      accent-color: $color-primary;
    }
  }

  .rationale {
    width: 100%;
    min-height: 120px;
    padding: 0.75rem;
    border: 1px solid #d1d5db;
    border-radius: $radius-sm;
    font-family: inherit;
    font-size: 0.9375rem;
    line-height: 1.6;
    resize: vertical;
    margin-top: 0.5rem;

    &:focus {
      outline: none;
      border-color: $color-primary;
    }
  }

  .success {
    background: #dcfce7;
    color: #166534;
    padding: 1rem;
    border-radius: $radius-sm;
    font-weight: 500;
    text-align: center;
    margin-top: 1rem;
  }
</style>
