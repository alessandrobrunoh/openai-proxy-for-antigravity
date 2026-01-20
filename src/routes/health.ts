/**
 * Health check route
 * GET /health
 */

import type { FastifyInstance } from 'fastify';
import { accountService } from '../services/account-manager.js';
import { metricsService } from '../services/metrics-collector.js';

export default async function healthRoutes(server: FastifyInstance) {
  server.get('/health', async () => {
    try {
      const accountCount = await accountService.getAccountCount();
      const accounts = await accountService.getAccounts();
      const rateLimitedCount = accounts.filter(acc => {
        const now = Date.now();
        return Object.values(acc.rateLimitResetTimes).some(resetTime => (resetTime ?? 0) > now);
      }).length;

      const stats = metricsService.getStats();

      return {
        status: 'healthy',
        uptime: process.uptime(),
        timestamp: new Date().toISOString(),
        accounts: {
          total: accountCount,
          rateLimited: rateLimitedCount,
          available: accountCount - rateLimitedCount,
        },
        stats: {
          totalRequests: stats.totalRequests,
          successRate: stats.successRate,
        },
      };
    } catch (error) {
      return {
        status: 'error',
        error: String(error),
      };
    }
  });
}
