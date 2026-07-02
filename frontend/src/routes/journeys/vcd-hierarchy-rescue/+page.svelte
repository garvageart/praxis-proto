<script lang="ts">
  import '../../../styles/variables.scss';

  let step = $state<'brief' | 'embed' | 'quiz'>('brief');
  let showQuiz = $state(false);
  let showRationale = $state(false);
  let quizAnswers = $state<Record<string, string>>({ q1: '', q2: '' });
  let rationale = $state('');
  let figmaUrl = $state('');
  let submitted = $state(false);

  function proceedToEmbed() {
    step = 'embed';
  }

  function proceedToQuiz() {
    showQuiz = true;
    showRationale = true;
    step = 'quiz';
  }

  function submitAll() {
    submitted = true;
  }

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
      options: ['To make it look pretty', 'To guide the viewer\'s eye to the most important information first', 'To fill empty space', 'To follow current design trends'],
      correct: 1
    }
  ];
</script>

<div class="journey">
  <header class="header">
    <h1>Hierarchy Rescue</h1>
    <p class="brief">
      A poorly organised O-Week poster lacks clear visual hierarchy. Your task is to identify the issues,
      fix them in Figma, and explain your design decisions.
    </p>
  </header>

  {#if step === 'brief'}
    <section class="panel brief-section">
      <h2>The Brief</h2>
      <div class="brief-content">
        <p>The current O-Week poster has these problems:</p>
        <ul>
          <li>Event title is small and gets lost among secondary details</li>
          <li>Date, time, and location are scattered with inconsistent sizing</li>
          <li>No clear focal point — everything competes for attention</li>
          <li>Contrast ratios are too low for readable text</li>
        </ul>
        <p><strong>Your task:</strong></p>
        <ol>
          <li>Open the Figma file linked below</li>
          <li>Duplicate it to your own draft</li>
          <li>Fix the hierarchy using size, weight, spacing, and contrast</li>
          <li>Paste your public Figma link and submit</li>
        </ol>
      </div>
      <button class="btn btn-primary" onclick={proceedToEmbed}>
        Open Figma File
      </button>
    </section>
  {/if}

  {#if step === 'brief' || step === 'embed'}
    <div class="split">
      <section class="panel sidebar">
        <h2>Instructions</h2>
        <ol class="instructions">
          <li>Click "Open Figma" to view the messy poster</li>
          <li>In Figma, go to File &rarr; Duplicate to create your copy</li>
          <li>Fix the hierarchy:
            <ul>
              <li>Make the event title dominant</li>
              <li>Group related information</li>
              <li>Improve contrast and readability</li>
            </ul>
          </li>
          <li>Share your Figma file (set to "Anyone with the link can view")</li>
          <li>Paste the link below and continue</li>
        </ol>

        {#if step === 'embed'}
          <div class="figma-link-input">
            <label for="figma-url">Your Figma URL:</label>
            <input
              id="figma-url"
              type="url"
              bind:value={figmaUrl}
              placeholder="https://www.figma.com/file/..."
            />
            <button
              class="btn btn-primary"
              onclick={proceedToQuiz}
              disabled={!figmaUrl}
            >
              Continue to Quiz
            </button>
          </div>
        {/if}
      </section>

      <section class="panel figma-panel">
        {#if step === 'brief'}
          <div class="figma-placeholder">
            <p>Click "Open Figma File" to load the poster.</p>
          </div>
        {:else}
          <div class="figma-embed">
            <iframe
              src="https://www.figma.com/embed?embed_host=praxis&url=https://www.figma.com/file/sample"
              allowfullscreen
              title="Figma Poster"
            ></iframe>
          </div>
        {/if}
      </section>
    </div>
  {/if}

  <!-- Quiz & Rationale -->
  {#if showQuiz}
    <section class="panel quiz-section">
      <h2>Design Quiz</h2>

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

      <h2>Written Defense</h2>
      <p class="muted">Explain your focal point choice and how you established hierarchy.</p>
      <textarea
        class="rationale"
        bind:value={rationale}
        placeholder="Describe the hierarchy changes you made and why..."
        disabled={submitted}
      ></textarea>

      {#if !submitted}
        <button class="btn btn-primary" onclick={submitAll} disabled={!rationale.trim() || !figmaUrl}>
          Submit All
        </button>
      {:else}
        <div class="success">Submitted! Your design has been recorded.</div>
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

  .brief-content {
    font-size: 0.9375rem;
    line-height: 1.7;

    ul, ol {
      padding-left: 1.25rem;
      margin: 0.5rem 0;

      li {
        margin-bottom: 0.25rem;
      }
    }

    p {
      margin: 0.75rem 0 0.25rem;
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

    &-primary {
      background: $color-primary;
      color: white;
      border-color: $color-primary;
      margin-top: 1rem;

      &:hover:not(:disabled) {
        background: $color-primary-hover;
      }
    }
  }

  .split {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1rem;

    @media (max-width: 768px) {
      grid-template-columns: 1fr;
    }
  }

  .sidebar {
    font-size: 0.9375rem;
    line-height: 1.7;

    .instructions {
      padding-left: 1.25rem;

      li {
        margin-bottom: 0.5rem;

        ul {
          margin-top: 0.25rem;
          padding-left: 1.25rem;
          color: $color-text-muted;
          font-size: 0.875rem;
        }
      }
    }
  }

  .figma-panel {
    padding: 0;
    overflow: hidden;
    min-height: 400px;
  }

  .figma-placeholder {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 400px;
    color: $color-text-muted;
    font-size: 0.9375rem;
  }

  .figma-embed {
    iframe {
      width: 100%;
      height: 600px;
      border: none;
    }
  }

  .figma-link-input {
    margin-top: 1.5rem;

    label {
      display: block;
      font-weight: 500;
      margin-bottom: 0.375rem;
    }

    input {
      width: 100%;
      padding: 0.5rem 0.75rem;
      border: 1px solid #d1d5db;
      border-radius: $radius-sm;
      font-size: 0.9375rem;

      &:focus {
        outline: none;
        border-color: $color-primary;
      }
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

  .muted {
    color: $color-text-muted;
    font-size: 0.875rem;
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
