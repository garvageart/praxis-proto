/**
 * In-memory storage for the prototype.
 * Swap for @fastify/postgres when PostgreSQL is connected.
 */

import type { University, Degree, Challenge, Applicant, Submission } from './types.js';
import { seedFromChallenges } from '../lib/rag.js';

// In-memory stores
const universities = new Map<string, University>();
const degrees = new Map<string, Degree>();
const challenges = new Map<string, Challenge>();
const applicants = new Map<string, Applicant>();
const submissions = new Map<string, Submission>();

// Seed some demo data
function seed() {
  const uni1: University = { id: 'u-001', name: 'University of Cape Town', createdAt: new Date() };
  const uni2: University = { id: 'u-002', name: 'University of the Witwatersrand', createdAt: new Date() };
  const uni3: University = { id: 'u-003', name: 'Stellenbosch University', createdAt: new Date() };
  universities.set(uni1.id, uni1);
  universities.set(uni2.id, uni2);
  universities.set(uni3.id, uni3);

  const deg1: Degree = { id: 'd-001', universityId: 'u-001', name: 'Computer Science', code: 'CS101', createdAt: new Date() };
  const deg2: Degree = { id: 'd-002', universityId: 'u-001', name: 'Visual Communication Design', code: 'VCD201', createdAt: new Date() };
  const deg3: Degree = { id: 'd-003', universityId: 'u-002', name: 'Accounting', code: 'ACC301', createdAt: new Date() };
  const deg4: Degree = { id: 'd-004', universityId: 'u-003', name: 'Computer Engineering', code: 'CE401', createdAt: new Date() };
  degrees.set(deg1.id, deg1);
  degrees.set(deg2.id, deg2);
  degrees.set(deg3.id, deg3);
  degrees.set(deg4.id, deg4);

  // Seed applicants
  const app1: Applicant = {
    id: 'a-001', name: 'Thabo Mokoena', email: 'thabo.m@example.com',
    degree: 'Computer Science', status: 'in_review',
    scores: { code_fix: 85, design_review: null, ledger_sort: null },
    createdAt: new Date('2026-06-15')
  };
  const app2: Applicant = {
    id: 'a-002', name: 'Lerato Ndlovu', email: 'lerato.n@example.com',
    degree: 'Visual Communication Design', status: 'pending',
    scores: { code_fix: null, design_review: 72, ledger_sort: null },
    createdAt: new Date('2026-06-16')
  };
  const app3: Applicant = {
    id: 'a-003', name: 'Sipho Zulu', email: 'sipho.z@example.com',
    degree: 'Accounting', status: 'in_review',
    scores: { code_fix: null, design_review: null, ledger_sort: 90 },
    createdAt: new Date('2026-06-14')
  };
  applicants.set(app1.id, app1);
  applicants.set(app2.id, app2);
  applicants.set(app3.id, app3);

  // Seed challenges
  challenges.set('c-001', {
    id: 'c-001', degreeId: 'd-001', title: 'The Buggy Leaderboard',
    type: 'code_fix', configPayload: {}, status: 'published',
    createdAt: new Date(), updatedAt: new Date()
  });
  challenges.set('c-002', {
    id: 'c-002', degreeId: 'd-002', title: 'Hierarchy Rescue',
    type: 'design_review', configPayload: {}, status: 'published',
    createdAt: new Date(), updatedAt: new Date()
  });
  challenges.set('c-003', {
    id: 'c-003', degreeId: 'd-003', title: 'The Spaza Shop Ledger',
    type: 'ledger_sort', configPayload: {}, status: 'published',
    createdAt: new Date(), updatedAt: new Date()
  });

  // Seed RAG knowledge base from challenges
  seedFromChallenges([
    { title: 'The Buggy Leaderboard', type: 'code_fix', configPayload: { initialCode: 'function sortLeaderboard(students) { return students.sort((a, b) => a.score - b.score); }' } },
    { title: 'Hierarchy Rescue', type: 'design_review', configPayload: { criteria: ['contrast', 'hierarchy', 'alignment'] } },
    { title: 'The Spaza Shop Ledger', type: 'ledger_sort', configPayload: { buckets: ['Assets', 'Liabilities', 'Income', 'Expenses', 'Equity'] } }
  ]);

  // Seed submissions
  submissions.set('s-001', {
    id: 's-001', challengeId: 'c-001', applicantId: 'a-001',
    payload: { code: 'fixed code here', testOutput: 'PASS' },
    score: 85,
    aiSummary: 'Thabo correctly identified the ascending/descending issue and swapped the comparator. Strong logical reasoning.',
    aiHintsGiven: 1, status: 'graded',
    createdAt: new Date('2026-06-18'), updatedAt: new Date('2026-06-18')
  });
  submissions.set('s-002', {
    id: 's-002', challengeId: 'c-002', applicantId: 'a-002',
    payload: { figmaUrl: 'https://figma.com/file/abc', notes: 'Increased title size' },
    score: 72,
    aiSummary: 'Lerato improved contrast but the focal point could be stronger. Good understanding of spacing.',
    aiHintsGiven: 2, status: 'graded',
    createdAt: new Date('2026-06-19'), updatedAt: new Date('2026-06-19')
  });
  submissions.set('s-003', {
    id: 's-003', challengeId: 'c-003', applicantId: 'a-003',
    payload: { buckets: { Assets: ['t3', 't7'] } },
    score: 90,
    aiSummary: 'Sipho categorised accurately and demonstrated clear understanding of the Business Entity Concept.',
    aiHintsGiven: 0, status: 'graded',
    createdAt: new Date('2026-06-17'), updatedAt: new Date('2026-06-17')
  });
}

seed();

// --- Challenge operations ---

export function listChallenges(): Challenge[] { return Array.from(challenges.values()); }
export function getChallenge(id: string): Challenge | undefined { return challenges.get(id); }

export function createChallenge(data: Omit<Challenge, 'id' | 'createdAt' | 'updatedAt'>): Challenge {
  const id = `c-${Date.now()}`;
  const challenge: Challenge = { ...data, id, createdAt: new Date(), updatedAt: new Date() };
  challenges.set(id, challenge);
  return challenge;
}

export function updateChallenge(id: string, data: Partial<Challenge>): Challenge | undefined {
  const existing = challenges.get(id);
  if (!existing) return;
  const updated = { ...existing, ...data, updatedAt: new Date() };
  challenges.set(id, updated);
  return updated;
}

// --- Applicant operations ---

export function listApplicants(): Applicant[] { return Array.from(applicants.values()); }
export function getApplicant(id: string): Applicant | undefined { return applicants.get(id); }

export function findApplicantByEmail(email: string): Applicant | undefined {
  return Array.from(applicants.values()).find(a => a.email.toLowerCase() === email.toLowerCase());
}

export function createApplicant(data: { name: string; email: string; degree: string }): Applicant {
  const id = `a-${Date.now()}`;
  const applicant: Applicant = {
    id,
    name: data.name,
    email: data.email,
    degree: data.degree,
    status: 'pending',
    scores: { code_fix: null, design_review: null, ledger_sort: null },
    createdAt: new Date()
  };
  applicants.set(id, applicant);
  return applicant;
}

export function updateApplicant(id: string, data: Partial<Applicant>): Applicant | undefined {
  const existing = applicants.get(id);
  if (!existing) return;
  const updated = { ...existing, ...data };
  applicants.set(id, updated);
  return updated;
}

// --- Submission operations ---

export function getSubmissionsByApplicant(applicantId: string): Submission[] {
  return Array.from(submissions.values()).filter(s => s.applicantId === applicantId);
}

export function getSubmissionsByChallenge(challengeId: string): Submission[] {
  return Array.from(submissions.values()).filter(s => s.challengeId === challengeId);
}

export function getAllSubmissions(): Submission[] { return Array.from(submissions.values()); }
export function getSubmission(id: string): Submission | undefined { return submissions.get(id); }

export function createSubmission(data: Omit<Submission, 'id' | 'createdAt' | 'updatedAt'>): Submission {
  const id = `s-${Date.now()}`;
  const sub: Submission = { ...data, id, createdAt: new Date(), updatedAt: new Date() };
  submissions.set(id, sub);
  return sub;
}

export function updateSubmission(id: string, data: Partial<Submission>): Submission | undefined {
  const existing = submissions.get(id);
  if (!existing) return;
  const updated = { ...existing, ...data, updatedAt: new Date() };
  submissions.set(id, updated);
  return updated;
}

// --- University operations ---

export function listUniversities(): University[] { return Array.from(universities.values()); }
export function getUniversity(id: string): University | undefined { return universities.get(id); }

export function createUniversity(data: { name: string }): University {
  const id = `u-${Date.now()}`;
  const uni: University = { id, name: data.name, createdAt: new Date() };
  universities.set(id, uni);
  return uni;
}

export function updateUniversity(id: string, data: { name: string }): University | undefined {
  const existing = universities.get(id);
  if (!existing) return;
  const updated = { ...existing, name: data.name };
  universities.set(id, updated);
  return updated;
}

export function deleteUniversity(id: string): boolean {
  for (const [did, deg] of degrees) {
    if (deg.universityId === id) degrees.delete(did);
  }
  return universities.delete(id);
}

// --- Degree operations ---

export function listDegrees(universityId: string): Degree[] {
  return Array.from(degrees.values()).filter(d => d.universityId === universityId);
}

export function getDegree(id: string): Degree | undefined { return degrees.get(id); }

export function createDegree(data: { universityId: string; name: string; code: string }): Degree {
  const id = `d-${Date.now()}`;
  const deg: Degree = { id, ...data, createdAt: new Date() };
  degrees.set(id, deg);
  return deg;
}

export function updateDegree(id: string, data: { name?: string; code?: string }): Degree | undefined {
  const existing = degrees.get(id);
  if (!existing) return;
  const updated = { ...existing, ...data };
  degrees.set(id, updated);
  return updated;
}

export function deleteDegree(id: string): boolean { return degrees.delete(id); }

// --- Dashboard stats ---

export function getDashboardStats() {
  const allApps = Array.from(applicants.values());
  const allSubs = Array.from(submissions.values());
  const gradedSubs = allSubs.filter(s => s.score !== null);

  return {
    totalApplicants: allApps.length,
    totalSubmissions: allSubs.length,
    gradedCount: allSubs.filter(s => s.status === 'graded').length,
    averageScore: gradedSubs.length
      ? gradedSubs.reduce((acc, s) => acc + (s.score ?? 0), 0) / gradedSubs.length
      : 0,
    byDegree: {
      'Computer Science': allApps.filter(a => a.degree === 'Computer Science').length,
      'Visual Communication Design': allApps.filter(a => a.degree === 'Visual Communication Design').length,
      'Accounting': allApps.filter(a => a.degree === 'Accounting').length
    },
    byStatus: {
      pending: allApps.filter(a => a.status === 'pending').length,
      in_review: allApps.filter(a => a.status === 'in_review').length,
      accepted: allApps.filter(a => a.status === 'accepted').length,
      rejected: allApps.filter(a => a.status === 'rejected').length
    }
  };
}
