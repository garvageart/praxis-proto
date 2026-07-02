/**
 * LLM integration for Praxis.
 * In production, this would call an external LLM API (OpenAI, Claude, etc.)
 * For the prototype, it returns mock extracted data.
 */

export interface ExtractedContent {
  title: string;
  type: 'code_fix' | 'design_review' | 'ledger_sort';
  description: string;
  questions: { text: string; answer: string }[];
  rawText: string;
}

export interface GeneratedChallenge {
  title: string;
  type: 'code_fix' | 'design_review' | 'ledger_sort';
  configPayload: Record<string, unknown>;
  description: string;
}

/**
 * Extract structured content from uploaded text (simulates LLM PDF parsing).
 */
export async function extractFromText(text: string): Promise<ExtractedContent> {
  // Simulate LLM processing delay
  await new Promise(r => setTimeout(r, 800));

  const lower = text.toLowerCase();

  if (lower.includes('sort') || lower.includes('algorithm') || lower.includes('code')) {
    return {
      title: 'Sorting Algorithm Debug',
      type: 'code_fix',
      description: 'Fix the buggy sorting implementation to correctly order results.',
      questions: [
        { text: 'What does Array.prototype.sort() return?', answer: 'The original array, sorted in place' },
        { text: 'How does the comparator function determine order?', answer: 'By returning negative, zero, or positive values' }
      ],
      rawText: text
    };
  }

  if (lower.includes('poster') || lower.includes('design') || lower.includes('hierarchy')) {
    return {
      title: 'Visual Hierarchy Analysis',
      type: 'design_review',
      description: 'Analyse and fix the visual hierarchy of the provided design.',
      questions: [
        { text: 'What creates the strongest visual hierarchy?', answer: 'Contrast in size and weight' },
        { text: 'What is the purpose of visual hierarchy?', answer: 'To guide the viewer to the most important information first' }
      ],
      rawText: text
    };
  }

  // Default to ledger
  return {
    title: 'Transaction Categorisation',
    type: 'ledger_sort',
    description: 'Categorise transactions into the correct ledger buckets.',
    questions: [
      { text: 'What concept excludes personal expenses from business records?', answer: 'Business Entity Concept' }
    ],
    rawText: text
  };
}

/**
 * Generate an interactive challenge config from extracted content.
 */
export async function generateChallengeConfig(extracted: ExtractedContent): Promise<GeneratedChallenge> {
  await new Promise(r => setTimeout(r, 600));

  const base: GeneratedChallenge = {
    title: extracted.title,
    type: extracted.type,
    description: extracted.description,
    configPayload: {}
  };

  if (extracted.type === 'code_fix') {
    base.configPayload = {
      initialCode: `function processData(items) {\n  // Fix this function\n  return items.sort((a, b) => a - b);\n}`,
      testCases: [
        { input: [3, 1, 2], expected: [1, 2, 3] },
        { input: [9, 5, 7], expected: [5, 7, 9] }
      ],
      hints: [
        'Check the sort comparator direction',
        'Make sure numbers are compared correctly'
      ]
    };
  } else if (extracted.type === 'design_review') {
    base.configPayload = {
      figmaFileKey: 'sample',
      criteria: ['contrast', 'hierarchy', 'alignment', 'spacing'],
      passingScore: 3
    };
  } else {
    base.configPayload = {
      transactions: [
        { desc: 'Cash sales', amount: 1500, correctBucket: 'Income' },
        { desc: 'Purchased stock', amount: 600, correctBucket: 'Expenses' },
        { desc: 'Display fridge', amount: 3000, correctBucket: 'Assets' },
        { desc: 'Loan from friend', amount: 2000, correctBucket: 'Liabilities' },
        { desc: 'Owner contribution', amount: 5000, correctBucket: 'Equity' }
      ],
      buckets: ['Assets', 'Liabilities', 'Income', 'Expenses', 'Equity']
    };
  }

  return base;
}

/**
 * Randomise numeric values in a challenge config (for "Regenerate Numbers").
 */
export function randomisePayload(payload: Record<string, unknown>): Record<string, unknown> {
  const result = JSON.parse(JSON.stringify(payload)) as Record<string, unknown>;

  if (result.transactions && Array.isArray(result.transactions)) {
    result.transactions = (result.transactions as { desc: string; amount: number; correctBucket: string }[]).map(tx => ({
      ...tx,
      amount: Math.round(tx.amount * (0.5 + Math.random()))
    }));
  }

  if (result.testCases && Array.isArray(result.testCases)) {
    result.testCases = (result.testCases as { input: number[]; expected: number[] }[]).map(tc => ({
      input: tc.input.map(n => n + Math.floor(Math.random() * 10) - 5),
      expected: tc.expected.map(n => n + Math.floor(Math.random() * 10) - 5)
    }));
  }

  return result;
}
