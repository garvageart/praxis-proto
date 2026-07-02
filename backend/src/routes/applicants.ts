import type { FastifyInstance } from 'fastify';
import {
  listApplicants,
  getApplicant,
  updateApplicant,
  getSubmissionsByApplicant,
  getSubmission,
  getAllSubmissions,
  getDashboardStats,
  createSubmission
} from '../db/index.js';
import { summariseSubmission } from '../lib/llm.js';

export async function applicantRoutes(app: FastifyInstance) {
  // --- Dashboard ---
  app.get('/api/admin/dashboard', async () => {
    return getDashboardStats();
  });

  // --- Applicants list ---
  app.get('/api/applicants', async () => {
    return listApplicants();
  });

  // --- Single applicant profile + scores ---
  app.get<{ Params: { id: string } }>('/api/applicants/:id', async (req, reply) => {
    const applicant = getApplicant(req.params.id);
    if (!applicant) return reply.code(404).send({ error: 'Applicant not found' });

    const submissions = getSubmissionsByApplicant(req.params.id);

    return {
      ...applicant,
      submissionCount: submissions.length,
      averageScore: submissions.filter(s => s.score !== null)
        .reduce((acc, s) => acc + (s.score ?? 0), 0) / Math.max(1, submissions.filter(s => s.score !== null).length)
    };
  });

  // --- Applicant submissions (artifacts) ---
  app.get<{ Params: { id: string } }>('/api/applicants/:id/submissions', async (req, reply) => {
    const applicant = getApplicant(req.params.id);
    if (!applicant) return reply.code(404).send({ error: 'Applicant not found' });

    return getSubmissionsByApplicant(req.params.id);
  });

  // --- Log admission decision ---
  app.post<{ Params: { id: string }; Body: { decision: 'accepted' | 'rejected'; notes?: string } }>(
    '/api/applicants/:id/decision',
    async (req, reply) => {
      const { decision } = req.body;
      const updated = updateApplicant(req.params.id, { status: decision });
      if (!updated) return reply.code(404).send({ error: 'Applicant not found' });
      return updated;
    }
  );

  // --- All submissions (for admin review) ---
  app.get('/api/submissions', async () => {
    return getAllSubmissions();
  });

  // --- Generate AI summary for a submission ---
  app.post<{ Params: { id: string } }>(
    '/api/submissions/:id/summarise',
    async (req, reply) => {
      const sub = getSubmission(req.params.id);
      if (!sub) return reply.code(404).send({ error: 'Submission not found' });

      const summary = await summariseSubmission(JSON.stringify(sub.payload));
      return { summary };
    }
  );

  // --- Submit payload (for journey submissions, triggers AI summary) ---
  app.post<{ Body: { challengeId: string; applicantId: string; payload: Record<string, unknown> } }>(
    '/api/submissions',
    async (req, reply) => {
      const { challengeId, applicantId, payload } = req.body;
      const sub = createSubmission({
        challengeId,
        applicantId,
        payload,
        score: null,
        aiSummary: null,
        aiHintsGiven: 0,
        status: 'submitted'
      });
      return reply.code(201).send(sub);
    }
  );
}
