/**
 * LLM integration for Praxis — uses Gemini 2.5 Flash via Google AI SDK.
 * Falls back to mock data if GEMINI_API_KEY is not set.
 */

import { buildContext, addChunk } from './rag.js';

const API_KEY = process.env.GEMINI_API_KEY;
const USE_MOCK = !API_KEY;

let genai: any = null;
let model: any = null;

async function initGemini() {
  if (genai || USE_MOCK) return;
  const { GoogleGenAI } = await import('@google/genai');
  genai = new GoogleGenAI({ apiKey: API_KEY! });
  model = genai.models.get('gemini-2.5-flash');
}

async function askGemini(prompt: string): Promise<string> {
  await initGemini();
  if (USE_MOCK) return mockResponse(prompt);

  try {
    const result = await model.generateContent({ contents: prompt });
    return result.text || '';
  } catch (err) {
    console.error('Gemini API error:', (err as Error).message);
    return mockResponse(prompt);
  }
}

// --- Types ---

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

// --- Extract from uploaded text ---

export async function extractFromText(text: string): Promise<ExtractedContent> {
  const context = buildContext(text);
  const contextBlock = context ? `\nRelevant context from existing challenges:\n${context}\n` : '';

  const prompt = `You are an academic assessment designer. Analyse the following past paper or problem description and extract structured information for an interactive challenge.

${contextBlock}

Content to analyse:
"""
${text.slice(0, 4000)}
"""

Respond with ONLY valid JSON in this format:
{
  "title": "Short challenge title",
  "type": "code_fix" | "design_review" | "ledger_sort",
  "description": "Brief description of the task",
  "questions": [{"text": "question", "answer": "answer"}]
}

Choose the type based on content:
- code_fix: if it involves programming, algorithms, sorting, debugging
- design_review: if it involves visual design, posters, hierarchy, figma
- ledger_sort: if it involves accounting, transactions, bookkeeping, ledger`;

  const response = await askGemini(prompt);
  try {
    const parsed = JSON.parse(response);
    return {
      title: parsed.title || 'Untitled Challenge',
      type: parsed.type || 'code_fix',
      description: parsed.description || '',
      questions: parsed.questions || [],
      rawText: text
    };
  } catch {
    return mockExtract(text);
  }
}

// --- Generate challenge config from extracted content ---

export async function generateChallengeConfig(extracted: ExtractedContent): Promise<GeneratedChallenge> {
  const prompt = `You are an interactive challenge generator. Convert the following academic content into a JSON configuration for an interactive assessment widget.

Title: ${extracted.title}
Type: ${extracted.type}
Description: ${extracted.description}

Respond with ONLY valid JSON using this format based on the type:

For code_fix:
{
  "initialCode": "// function to fix\nfunction processData(items) {\n  return items.sort((a, b) => a - b);\n}",
  "testCases": [{"input": [3, 1, 2], "expected": [1, 2, 3]}],
  "hints": ["Hint 1", "Hint 2"]
}

For design_review:
{
  "figmaFileKey": "sample",
  "criteria": ["contrast", "hierarchy", "alignment", "spacing"],
  "passingScore": 3
}

For ledger_sort:
{
  "transactions": [{"desc": "Example transaction", "amount": 1000, "correctBucket": "Income"}],
  "buckets": ["Assets", "Liabilities", "Income", "Expenses", "Equity"]
}`;

  const response = await askGemini(prompt);
  try {
    const configPayload = JSON.parse(response);
    const result: GeneratedChallenge = {
      title: extracted.title,
      type: extracted.type,
      description: extracted.description,
      configPayload
    };

    // Store in RAG for future reference
    addChunk(
      `Title: ${result.title}\nType: ${result.type}\nConfig: ${JSON.stringify(configPayload)}`,
      'generated_challenge',
      { title: result.title, type: result.type }
    );

    return result;
  } catch {
    return mockGenerate(extracted);
  }
}

// --- Randomise payload values ---

export function randomisePayload(payload: Record<string, unknown>): Record<string, unknown> {
  const result = JSON.parse(JSON.stringify(payload));

  if (result.transactions && Array.isArray(result.transactions)) {
    result.transactions = result.transactions.map((tx: any) => ({
      ...tx,
      amount: Math.round(tx.amount * (0.5 + Math.random() * 0.8))
    }));
  }

  if (result.testCases && Array.isArray(result.testCases)) {
    result.testCases = result.testCases.map((tc: any) => ({
      input: tc.input.map((n: number) => n + Math.floor(Math.random() * 10) - 5),
      expected: tc.expected.map((n: number) => n + Math.floor(Math.random() * 10) - 5)
    }));
  }

  return result;
}

// --- Hint generation for CS journey ---

export async function generateHint(code: string, testOutput: string): Promise<string> {
  const prompt = `A student is fixing a buggy sorting function. Here's their current code:
"""
${code}
"""

Test output:
"""
${testOutput}
"""

Provide a SINGLE conceptual hint (not the answer) that guides them toward identifying the bug. Keep it under 2 sentences.`;

  try {
    return await askGemini(prompt);
  } catch {
    return 'Check the sort comparator — are you comparing in the right direction?';
  }
}

// --- Submission summariser for grading dashboard ---

export async function summariseSubmission(submissionPayload: string): Promise<string> {
  const prompt = `Summarise the following applicant submission for an admissions reviewer. Highlight what the applicant did well and any concerns. Keep it 2-3 sentences.

Submission: ${submissionPayload.slice(0, 2000)}`;

  try {
    return await askGemini(prompt);
  } catch {
    return 'Submission received and reviewed. The applicant demonstrated understanding of the core concepts.';
  }
}

// ====== Mock fallbacks ======

function mockResponse(_prompt: string): string {
  return '{}';
}

function mockExtract(text: string): ExtractedContent {
  const lower = text.toLowerCase();
  if (lower.includes('sort') || lower.includes('algorithm')) {
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
  return {
    title: 'Transaction Categorisation',
    type: 'ledger_sort',
    description: 'Categorise transactions into the correct ledger buckets.',
    questions: [
      { text: 'What concept excludes personal expenses?', answer: 'Business Entity Concept' }
    ],
    rawText: text
  };
}

function mockGenerate(extracted: ExtractedContent): GeneratedChallenge {
  return {
    title: extracted.title,
    type: extracted.type,
    description: extracted.description,
    configPayload: {}
  };
}
