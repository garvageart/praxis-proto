import Fastify from 'fastify';
import cors from '@fastify/cors';
import 'dotenv/config';
import { universityRoutes } from './routes/universities.js';
import { challengeRoutes } from './routes/challenges.js';
import { applicantRoutes } from './routes/applicants.js';

const app = Fastify({ logger: true });

await app.register(cors, {
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  credentials: true
});

// Health check
app.get('/health', async () => ({ status: 'ok', timestamp: new Date().toISOString() }));

// Register route modules
await app.register(universityRoutes);
await app.register(challengeRoutes);
await app.register(applicantRoutes);

// Start
const port = parseInt(process.env.PORT || '8080');
try {
  await app.listen({ port, host: '0.0.0.0' });
  console.log(`Server listening on port ${port}`);
} catch (err) {
  app.log.error(err);
  process.exit(1);
}
