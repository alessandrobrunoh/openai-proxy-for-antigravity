/**
 * Admin Dashboard Routes
 */

import type { FastifyInstance } from 'fastify';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { accountService } from '../../services/account-manager.js';
import { metricsService } from '../../services/metrics-collector.js';
import { logService } from '../../services/log-store.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export default async function adminRoutes(server: FastifyInstance) {
  // Serve dashboard HTML
  server.get('/', async (_request, reply) => {
    const htmlPath = join(__dirname, '../../dashboard/index.html');
    const html = readFileSync(htmlPath, 'utf-8');
    return reply.type('text/html').send(html);
  });

  // Get accounts status
  server.get('/api/accounts', async () => {
    try {
      const accounts = await accountService.getAccounts();
      const now = Date.now();

      return {
        accounts: accounts.map(acc => ({
          index: acc.index,
          email: acc.email || `Account ${acc.index + 1}`,
          addedAt: acc.addedAt,
          lastUsed: acc.lastUsed,
          rateLimitResetTimes: acc.rateLimitResetTimes,
          isRateLimited: Object.values(acc.rateLimitResetTimes).some(t => (t ?? 0) > now),
          coolingDownUntil: acc.coolingDownUntil,
          cooldownReason: acc.cooldownReason,
        })),
      };
    } catch (error) {
      return {
        error: String(error),
        accounts: [],
      };
    }
  });

  // Get metrics
  server.get('/api/metrics', async () => {
    const stats = metricsService.getStats();
    const recentRequests = metricsService.getRecentRequests(100);

    return {
      stats,
      recentRequests,
    };
  });

  // Get logs
  server.get<{ Querystring: { limit?: string } }>(
    '/api/logs',
    async (request) => {
      const limit = parseInt(request.query.limit || '100', 10);
      const logs = logService.getRecentLogs(limit);

      return {
        logs,
        total: logs.length,
      };
    }
  );

  // Clear logs
  server.post('/api/logs/clear', async () => {
    logService.clearLogs();
    return { success: true };
  });
}
