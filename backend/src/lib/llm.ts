/**
 * LLM integration for Praxis.
 * Uses Google Gemini 2.5 Flash when GEMINI_API_KEY is set.
 * Falls back to deterministic mock responses when the key is absent.
 */

import { GoogleGenerativeAI } from '@google/generative-ai';

function getModel() {
  const key = process.env.GEMINI_API_KEY;
  if (!key) return null;
  const genAI = new GoogleGenerativeAI(key);
  return genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
}

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

// ── Real Gemini calls ──────────────────────────────────────────────────────

/**
 * Extract structured content from uploaded text using Gemini.
 */
export async function extractFromText(text: string): Promise<ExtractedContent> {
  const model = getModel();
  if (!model) return mockExtractFromText(text);

  const prompt = `You are an educational content extractor for Praxis, a university application evaluation platform.

Analyse the following text (a past exam question, case study, or scenario) and extract structured information.

Text:
"""
${text}
"""

Respond with a raw JSON object (no markdown fences, just the JSON) with exactly these fields:
{
  "title": "<short descriptive title for the challenge>",
  "type": "<one of: code_fix | design_review | ledger_sort — choose based on content>",
  "description": "<2-3 sentence summary of the challenge>",
  "questions": [
    { "text": "<quiz question>", "answer": "<correct answer>" },
    { "text": "<quiz question>", "answer": "<correct answer>" }
  ]
}`;

  try {
    const result = await model.generateContent(prompt);
    const raw = result.response.text().trim();
    const parsed = JSON.parse(raw);
    return { ...parsed, rawText: text };
  } catch {
    return mockExtractFromText(text);
  }
}

/**
 * Generate a structured challenge config from extracted content.
 * Uses mock data — LLM-generated configs would need per-type validation.
 */
export async function generateChallengeConfig(extracted: ExtractedContent): Promise<GeneratedChallenge> {
  // Config generation stays deterministic to ensure valid interactive configs
  return mockGenerateChallengeConfig(extracted);
}

/**
 * Generate an AI evaluative summary for a submitted challenge response.
 */
export async function generateSubmissionSummary(data: {
  applicantName: string;
  challengeType: string;
  score: number;
  payload: Record<string, unknown>;
  hintsUsed: number;
}): Promise<string> {
  const model = getModel();
  if (!model) {
    return `${data.applicantName} completed the ${data.challengeType.replace('_', ' ')} challenge with a score of ${data.score}/100. ${data.hintsUsed} hint(s) were used.`;
  }

  const prompt = `You are an AI evaluator for Praxis, a university application platform in South Africa.

Write a concise (2-3 sentences) professional evaluative summary of this student's submission. Be specific, constructive, and insightful.

Student: ${data.applicantName}
Challenge type: ${data.challengeType.replace('_', ' ')}
Score: ${data.score}/100
Hints used: ${data.hintsUsed}
Submission: ${JSON.stringify(data.payload, null, 2)}

Write only the summary, no labels or headers.`;

  try {
    const result = await model.generateContent(prompt);
    return result.response.text().trim();
  } catch {
    return `${data.applicantName} completed the ${data.challengeType.replace('_', ' ')} challenge scoring ${data.score}/100.`;
  }
}

/**
 * Randomise numeric values in a challenge config payload.
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

// ── Mock fallbacks ─────────────────────────────────────────────────────────

function mockExtractFromText(text: string): ExtractedContent {
  const lower = text.toLowerCase();

  if (lower.includes('sort') || lower.includes('algorithm') || lower.includes('code') || lower.includes('function')) {
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

  if (lower.includes('poster') || lower.includes('design') || lower.includes('hierarchy') || lower.includes('figma')) {
    return {
      title: 'Visual Hierarchy Analysis',
      type: 'design_review',
      description: 'Analyse and improve the visual hierarchy of the provided design.',
      questions: [
        { text: 'What creates the strongest visual hierarchy?', answer: 'Contrast in size and weight' },
        { text: 'What is the purpose of visual hierarchy?', answer: 'To guide the viewer to the most important information first' }
      ],
      rawText: text
    };
  }

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

function mockGenerateChallengeConfig(extracted: ExtractedContent): GeneratedChallenge {
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
      hints: ['Check the sort comparator direction', 'Make sure numbers are compared correctly']
    };
  } else if (extracted.type === 'design_review') {
    base.configPayload = {
      figmaFileKey: 'yLlvHIG8koXIA2I9hADkT1',
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
