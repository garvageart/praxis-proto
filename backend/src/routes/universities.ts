import type { FastifyInstance } from 'fastify';
import {
  listUniversities,
  getUniversity,
  createUniversity,
  updateUniversity,
  deleteUniversity,
  listDegrees,
  getDegree,
  createDegree,
  updateDegree,
  deleteDegree
} from '../db/index.js';

export async function universityRoutes(app: FastifyInstance) {
  // --- Universities ---
  app.get('/api/universities', async () => {
    return listUniversities();
  });

  app.post<{ Body: { name: string } }>('/api/universities', async (req, reply) => {
    const uni = createUniversity(req.body);
    return reply.code(201).send(uni);
  });

  app.get<{ Params: { id: string } }>('/api/universities/:id', async (req, reply) => {
    const uni = getUniversity(req.params.id);
    if (!uni) return reply.code(404).send({ error: 'University not found' });
    return uni;
  });

  app.put<{ Params: { id: string }; Body: { name: string } }>('/api/universities/:id', async (req, reply) => {
    const uni = updateUniversity(req.params.id, req.body);
    if (!uni) return reply.code(404).send({ error: 'University not found' });
    return uni;
  });

  app.delete<{ Params: { id: string } }>('/api/universities/:id', async (req, reply) => {
    const deleted = deleteUniversity(req.params.id);
    if (!deleted) return reply.code(404).send({ error: 'University not found' });
    return reply.code(204).send();
  });

  // --- Degrees nested under universities ---
  app.get<{ Params: { id: string } }>('/api/universities/:id/degrees', async (req) => {
    return listDegrees(req.params.id);
  });

  app.post<{ Params: { id: string }; Body: { name: string; code: string } }>(
    '/api/universities/:id/degrees',
    async (req, reply) => {
      const deg = createDegree({ universityId: req.params.id, ...req.body });
      return reply.code(201).send(deg);
    }
  );

  // --- Degrees stand-alone ---
  app.get<{ Params: { id: string } }>('/api/degrees/:id', async (req, reply) => {
    const deg = getDegree(req.params.id);
    if (!deg) return reply.code(404).send({ error: 'Degree not found' });
    return deg;
  });

  app.put<{ Params: { id: string }; Body: { name?: string; code?: string } }>(
    '/api/degrees/:id',
    async (req, reply) => {
      const deg = updateDegree(req.params.id, req.body);
      if (!deg) return reply.code(404).send({ error: 'Degree not found' });
      return deg;
    }
  );

  app.delete<{ Params: { id: string } }>('/api/degrees/:id', async (req, reply) => {
    const deleted = deleteDegree(req.params.id);
    if (!deleted) return reply.code(404).send({ error: 'Degree not found' });
    return reply.code(204).send();
  });
}
