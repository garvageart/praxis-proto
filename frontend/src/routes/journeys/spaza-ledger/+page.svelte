<script lang="ts">
  import '../../../styles/variables.scss';

  // --- Transaction Data ---
  interface Transaction {
    id: string;
    desc: string;
    amount: number;
    type: 'income' | 'expense' | 'asset' | 'liability' | 'equity';
  }

  const rawTransactions: Transaction[] = [
    { id: 't1', desc: 'Cash sales for the day', amount: 1500, type: 'income' },
    { id: 't2', desc: 'Purchased stock (cool drinks)', amount: 600, type: 'expense' },
    { id: 't3', desc: 'Shop display fridge', amount: 3000, type: 'asset' },
    { id: 't4', desc: 'Loan from friend', amount: 2000, type: 'liability' },
    { id: 't5', desc: 'Owner initial contribution', amount: 5000, type: 'equity' },
    { id: 't6', desc: 'Electricity bill', amount: 350, type: 'expense' },
    { id: 't7', desc: 'Cash in register', amount: 800, type: 'asset' },
    { id: 't8', desc: 'Personal groceries (not business)', amount: 400, type: 'expense' },
    { id: 't9', desc: 'Bank loan repayment', amount: 500, type: 'liability' },
    { id: 't10', desc: 'Interest earned on business account', amount: 50, type: 'income' }
  ];

  const bucketLabels = ['Assets', 'Liabilities', 'Income', 'Expenses', 'Equity'] as const;
  type Bucket = (typeof bucketLabels)[number];

  // --- State ---
  let available = $state<Transaction[]>([...rawTransactions]);
  let buckets = $state<Record<Bucket, Transaction[]>>({
    Assets: [],
    Liabilities: [],
    Income: [],
    Expenses: [],
    Equity: []
  });
  let draggedItem = $state<Transaction | null>(null);
  let showResults = $state(false);
  let breakdown = $state<{ correct: number; total: number; items: { desc: string; userBucket: string; correctBucket: string; correct: boolean }[] } | null>(null);
  let showQuiz = $state(false);
  let showRationale = $state(false);
  let quizAnswers = $state<Record<string, string>>({ q1: '' });
  let rationale = $state('');
  let submitted = $state(false);

  // --- Drag & Drop ---
  function onDragStart(e: DragEvent, tx: Transaction) {
    draggedItem = tx;
    if (e.dataTransfer) {
      e.dataTransfer.effectAllowed = 'move';
    }
  }

  function onDrop(e: DragEvent, bucket: Bucket) {
    e.preventDefault();
    if (!draggedItem) return;

    const idx = available.findIndex(t => t.id === draggedItem!.id);
    if (idx !== -1) {
      available.splice(idx, 1);
    }

    buckets[bucket] = [...buckets[bucket], draggedItem];
    draggedItem = null;
    showResults = false;
  }

  function removeFromBucket(tx: Transaction, bucket: Bucket) {
    buckets[bucket] = buckets[bucket].filter(t => t.id !== tx.id);
    available = [...available, tx];
    showResults = false;
  }

  function allowDrop(e: DragEvent) {
    e.preventDefault();
  }

  // --- Evaluation ---
  const correctMapping: Record<string, Bucket> = {
    t1: 'Income',
    t2: 'Expenses',
    t3: 'Assets',
    t4: 'Liabilities',
    t5: 'Equity',
    t6: 'Expenses',
    t7: 'Assets',
    t8: 'Expenses',
    t9: 'Liabilities',
    t10: 'Income'
  };

  function evaluate() {
    const items = rawTransactions.map(tx => {
      const userBucket = Object.entries(buckets).find(([, txs]) =>
        txs.some(t => t.id === tx.id)
      )?.[0] as Bucket | undefined;
      const correct = correctMapping[tx.id];
      return {
        desc: tx.desc,
        userBucket: userBucket || 'Uncategorised',
        correctBucket: correct,
        correct: userBucket === correct
      };
    });

    const correctCount = items.filter(i => i.correct).length;
    breakdown = {
      correct: correctCount,
      total: items.length,
      items
    };
    showResults = true;
  }

  function proceedToQuiz() {
    showQuiz = true;
    showRationale = true;
  }

  function submitAll() {
    submitted = true;
  }

  const quizQuestions = [
    {
      id: 'q1',
      question: 'Which accounting concept explains why the personal groceries (R400) should NOT be recorded as a business expense?',
      options: ['Going Concern', 'Business Entity Concept', 'Matching Principle', 'Materiality'],
      correct: 1
    }
  ];

  // Simple amount format
  function fmt(n: number) {
    return `R ${n.toFixed(0)}`;
  }
</script>

<div class="journey">
  <header class="header">
    <h1>The Spaza Shop Ledger</h1>
    <p class="brief">
      Drag each transaction into the correct ledger bucket. Categorise them as Assets, Liabilities,
      Income, Expenses, or Equity. Once you're satisfied, submit for evaluation.
    </p>
  </header>

  <div class="ledger-workspace">
    <!-- Available Transactions -->
    <section class="panel">
      <h2>Transactions</h2>
      {#if available.length === 0}
        <p class="muted">All transactions categorised.</p>
      {/if}
      <div class="transaction-list">
        {#each available as tx (tx.id)}
          <div
            class="transaction-card"
            draggable="true"
            ondragstart={(e) => onDragStart(e, tx)}
            role="button"
            tabindex="0"
          >
            <span class="desc">{tx.desc}</span>
            <span class="amount">{fmt(tx.amount)}</span>
          </div>
        {/each}
      </div>
    </section>

    <!-- Ledger Buckets -->
    <div class="buckets-grid">
      {#each bucketLabels as bucket}
        <div
          class="bucket"
          class:drag-over={draggedItem !== null}
          ondrop={(e) => onDrop(e, bucket)}
          ondragover={allowDrop}
        >
          <h3 class="bucket-title">{bucket}</h3>
          <div class="bucket-items">
            {#each buckets[bucket] as tx (tx.id)}
              <div class="bucket-item">
                <span class="desc">{tx.desc}</span>
                <span class="amount">{fmt(tx.amount)}</span>
                <button
                  class="remove"
                  onclick={() => removeFromBucket(tx, bucket)}
                  title="Remove"
                >&times;</button>
              </div>
            {/each}
            {#if buckets[bucket].length === 0}
              <p class="muted-sm">Drop items here</p>
            {/if}
          </div>
        </div>
      {/each}
    </div>
  </div>

  <!-- Evaluate -->
  <div class="actions-bar">
    <button class="btn btn-primary" onclick={evaluate} disabled={available.length > 0}>
      Evaluate
    </button>
  </div>

  <!-- Results -->
  {#if showResults && breakdown}
    <section class="panel results">
      <h2>Results</h2>
      <p class="score">
        {breakdown.correct} / {breakdown.total} correctly categorised
      </p>
      <div class="breakdown">
        {#each breakdown.items as item}
          <div class="result-item" class:correct={item.correct} class:incorrect={!item.correct}>
            <span class="desc">{item.desc}</span>
            <span class="detail">
              {item.userBucket} &rarr; {item.correctBucket}
              {#if item.correct}
                <span class="check">&#10003;</span>
              {:else}
                <span class="cross">&#10007;</span>
              {/if}
            </span>
          </div>
        {/each}
      </div>

      {#if !submitted}
        <button class="btn btn-primary" onclick={proceedToQuiz}>
          Continue to Quiz & Rationale
        </button>
      {/if}
    </section>
  {/if}

  <!-- Quiz & Rationale -->
  {#if showQuiz}
    <section class="panel quiz-section">
      <h2>Concept Quiz</h2>

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
      <p class="muted">Explain the "Business Entity Concept" and how it applied to your categorisation.</p>
      <textarea
        class="rationale"
        bind:value={rationale}
        placeholder="Why is the personal grocery expense excluded from the business ledger?"
        disabled={submitted}
      ></textarea>

      {#if !submitted}
        <button class="btn btn-primary" onclick={submitAll} disabled={!rationale.trim()}>
          Submit All
        </button>
      {:else}
        <div class="success">Submitted! Your categorisation and rationale have been recorded.</div>
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

  .panel {
    background: $color-surface;
    border-radius: $radius-md;
    box-shadow: $shadow-sm;
    padding: 1.5rem;
    margin-bottom: 1.5rem;

    h2 {
      font-size: 1.125rem;
      font-weight: 600;
      margin-bottom: 1rem;
    }
  }

  .muted {
    color: $color-text-muted;
    font-size: 0.875rem;
  }

  .muted-sm {
    color: #aaa;
    font-size: 0.8125rem;
    font-style: italic;
  }

  .ledger-workspace {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1rem;
    margin-bottom: 1rem;

    @media (max-width: 900px) {
      grid-template-columns: 1fr;
    }
  }

  .transaction-list {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .transaction-card {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0.75rem 1rem;
    background: $gradient-brand-subtle;
    border: 1px solid rgba(99, 102, 241, 0.2);
    border-radius: $radius-sm;
    cursor: grab;
    user-select: none;
    transition: box-shadow 0.15s;
    color: $color-text;

    &:hover {
      box-shadow: $shadow-sm;
    }

    &:active {
      cursor: grabbing;
      opacity: 0.8;
    }

    .desc {
      font-size: 0.875rem;
      font-weight: 500;
    }

    .amount {
      font-size: 0.875rem;
      font-weight: 600;
      color: $color-text-subtle;
    }
  }

  .buckets-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 0.75rem;
    align-content: start;

    @media (max-width: 768px) {
      grid-template-columns: 1fr;
    }
  }

  .bucket {
    background: $color-surface;
    border: 2px dashed $color-border-strong;
    border-radius: $radius-md;
    padding: 0.75rem;
    min-height: 120px;
    transition: border-color 0.15s, background 0.15s;

    &.drag-over {
      border-color: $color-primary;
      background: $gradient-brand-subtle;
    }
  }

  .bucket-title {
    font-size: 0.8125rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: $color-text-muted;
    margin-bottom: 0.5rem;
    padding-bottom: 0.375rem;
    border-bottom: 1px solid $color-border;
  }

  .bucket-items {
    display: flex;
    flex-direction: column;
    gap: 0.375rem;
  }

  .bucket-item {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.5rem;
    background: $color-surface-3;
    border-radius: $radius-sm;
    font-size: 0.8125rem;
    color: $color-text;

    .desc {
      flex: 1;
    }

    .amount {
      font-weight: 600;
      color: $color-text-muted;
    }

    .remove {
      background: none;
      border: none;
      color: $color-error;
      cursor: pointer;
      font-size: 1.125rem;
      line-height: 1;
      padding: 0;
    }
  }

  .actions-bar {
    text-align: center;
    margin-bottom: 1.5rem;
  }

  .btn {
    padding: 0.5rem 1rem;
    font-size: 0.8125rem;
    font-weight: 500;
    border: 1px solid $color-border-strong;
    border-radius: $radius-sm;
    background: $color-surface-2;
    color: $color-text;
    cursor: pointer;
    transition: background 0.15s;

    &:hover:not(:disabled) {
      background: $color-surface-3;
    }

    &:disabled {
      opacity: 0.4;
      cursor: not-allowed;
    }

    &-primary {
      background: $color-primary;
      color: white;
      border-color: $color-primary;

      &:hover:not(:disabled) {
        background: $color-primary-hover;
      }
    }
  }

  .results {
    .score {
      font-size: 1.25rem;
      font-weight: 700;
      color: $color-text;
      margin-bottom: 1rem;
    }
  }

  .breakdown {
    display: flex;
    flex-direction: column;
    gap: 0.375rem;
  }

  .result-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0.5rem 0.75rem;
    border-radius: $radius-sm;
    font-size: 0.875rem;
    color: $color-text;

    &.correct {
      background: $color-success-bg;
    }

    &.incorrect {
      background: $color-error-bg;
    }

    .detail {
      font-size: 0.8125rem;
      color: $color-text-muted;
    }

    .check {
      color: $color-success;
      font-weight: 700;
      margin-left: 0.375rem;
    }

    .cross {
      color: $color-error;
      font-weight: 700;
      margin-left: 0.375rem;
    }
  }

  .quiz-section {
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
    border: 1px solid $color-border-strong;
    border-radius: $radius-sm;
    font-family: inherit;
    font-size: 0.9375rem;
    line-height: 1.6;
    resize: vertical;
    margin-top: 0.5rem;
    background: $color-surface-2;
    color: $color-text;

    &:focus {
      outline: none;
      border-color: $color-primary;
    }
  }

  .success {
    background: $color-success-bg;
    color: $color-success;
    padding: 1rem;
    border-radius: $radius-sm;
    font-weight: 500;
    text-align: center;
    margin-top: 1rem;
    border: 1px solid rgba(34, 197, 94, 0.2);
  }
</style>
