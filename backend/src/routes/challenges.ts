import type { FastifyInstance } from 'fastify';
import {
  listChallenges,
  getChallenge,
  createChallenge,
  updateChallenge
} from '../db/index.js';
import { extractFromText, generateChallengeConfig, randomisePayload } from '../lib/llm.js';

export async function challengeRoutes(app: FastifyInstance) {
  // List all challenges
  app.get('/api/challenges', async () => {
    return listChallenges();
  });

  // Get single challenge
  app.get<{ Params: { id: string } }>('/api/challenges/:id', async (req, reply) => {
    const challenge = getChallenge(req.params.id);
    if (!challenge) return reply.code(404).send({ error: 'Challenge not found' });
    return challenge;
  });

  // Update challenge
  app.put<{ Params: { id: string }; Body: Record<string, unknown> }>(
    '/api/challenges/:id',
    async (req, reply) => {
      const updated = updateChallenge(req.params.id, req.body);
      if (!updated) return reply.code(404).send({ error: 'Challenge not found' });
      return updated;
    }
  );

  // --- AAI: Upload & Parse (simulates PDF upload) ---
  app.post<{ Body: { text: string; degreeId: string } }>(
    '/api/challenges/upload',
    async (req, reply) => {
      const { text, degreeId } = req.body;
      if (!text) return reply.code(400).send({ error: 'Text content required' });

      const extracted = await extractFromText(text);
      const draft = await generateChallengeConfig(extracted);

      const challenge = createChallenge({
        degreeId,
        title: draft.title,
        type: draft.type,
        configPayload: draft.configPayload as Record<string, unknown>,
        status: 'draft'
      });

      return reply.code(201).send({
        challenge,
        extracted: { title: extracted.title, type: extracted.type, description: extracted.description }
      });
    }
  );

  // --- AAI: Regenerate random numbers in an existing challenge ---
  app.post<{ Params: { id: string } }>(
    '/api/challenges/:id/regenerate-numbers',
    async (req, reply) => {
      const challenge = getChallenge(req.params.id);
      if (!challenge) return reply.code(404).send({ error: 'Challenge not found' });

      const newPayload = randomisePayload(challenge.configPayload);
      const updated = updateChallenge(req.params.id, { configPayload: newPayload });
      return updated;
    }
  );

  // --- Publish challenge ---
  app.post<{ Params: { id: string } }>(
    '/api/challenges/:id/publish',
    async (req, reply) => {
      const updated = updateChallenge(req.params.id, { status: 'published' });
      if (!updated) return reply.code(404).send({ error: 'Challenge not found' });
      return updated;
    }
  );
}
