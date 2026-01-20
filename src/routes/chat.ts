/**
 * Chat completions route - OpenAI-compatible endpoint
 * POST /v1/chat/completions
 */

import type { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import { adapter, type OpenAIRequest } from '../adapters/openai-adapter.js';
import { accountService } from '../services/account-manager.js';
import { accessTokenExpired } from '../lib/auth/auth.js';
import { refreshAccessToken } from '../lib/auth/token.js';
import { createLogger } from '../lib/logger.js';
import { metricsService } from '../services/metrics-collector.js';
import { logService } from '../services/log-store.js';

const log = createLogger('chat-route');

interface ChatRequest extends FastifyRequest {
  body: OpenAIRequest;
}

export default async function chatRoutes(server: FastifyInstance) {
  server.post<{ Body: OpenAIRequest }>(
    '/chat/completions',
    async (request: ChatRequest, reply: FastifyReply) => {
      const startTime = Date.now();
      const openaiReq = request.body;

      log.info('⬇️ INCOMING REQUEST FROM CLIENT', {
        headers: request.headers,
        body: JSON.stringify(openaiReq, null, 2),
      });

      try {
        // Validate request
        if (!openaiReq.model) {
          return reply.status(400).send({
            error: {
              message: 'Missing required field: model',
              type: 'invalid_request_error',
            },
          });
        }

        if (!openaiReq.messages || openaiReq.messages.length === 0) {
          return reply.status(400).send({
            error: {
              message: 'Missing required field: messages',
              type: 'invalid_request_error',
            },
          });
        }

        log.info('Chat completion request', {
          model: openaiReq.model,
          messageCount: openaiReq.messages.length,
          stream: openaiReq.stream,
          hasTools: Boolean(openaiReq.tools && openaiReq.tools.length > 0),
        });

        // Get account from rotation
        const account = await accountService.getNextAccount(openaiReq.model);

        if (!account) {
          return reply.status(429).send({
            error: {
              message: 'All accounts are rate-limited. Please try again later.',
              type: 'rate_limit_error',
            },
          });
        }

        // Get auth details from account
        let authRecord = accountService.getAccountManager().then(m => m.toAuthDetails(account));
        let auth = await authRecord;

        // Refresh token if needed
        if (accessTokenExpired(auth)) {
          log.debug('Access token expired, refreshing...', {
            accountIndex: account.index,
            email: account.email,
          });

          const refreshed = await refreshAccessToken(auth);
          if (!refreshed) {
            log.error('Token refresh failed', {
              accountIndex: account.index,
            });

            return reply.status(500).send({
              error: {
                message: 'Authentication failed. Please re-authenticate.',
                type: 'authentication_error',
              },
            });
          }

          // Update account with new token
          const manager = await accountService.getAccountManager();
          manager.updateFromAuth(account, refreshed);
          await manager.saveToDisk();
          auth = refreshed;
        }

        const accessToken = auth.access;
        if (!accessToken) {
          return reply.status(500).send({
            error: {
              message: 'Missing access token',
              type: 'authentication_error',
            },
          });
        }

        // Get projectId
        const projectId = account.parts.projectId || account.parts.managedProjectId || 'rising-fact-p41fc';

        // Convert OpenAI request to Antigravity
        const { url, init, headerStyle } = await adapter.convertRequest(
          openaiReq,
          accessToken,
          projectId
        );

        log.info('Making Antigravity request', {
          url,
          projectId,
          headerStyle,
          accountIndex: account.index,
        });

        // Make request to Antigravity
        const response = await fetch(url, init);

        // Debug: Log headers to check for rate limit info
        const headerObj: Record<string, string> = {};
        response.headers.forEach((val, key) => { headerObj[key] = val; });
        log.debug('Antigravity Response Headers', { headers: headerObj, status: response.status });

        // Handle rate limits
        if (response.status === 429) {
          log.warn('Rate limited', {
            accountIndex: account.index,
            model: openaiReq.model,
          });

          // Mark account as rate-limited
          await accountService.markRateLimited(account, 60_000, openaiReq.model);

          // Record metrics
          metricsService.recordRequest(openaiReq.model, Date.now() - startTime, 'rate_limited');

          return reply.status(429).send({
            error: {
              message: 'Rate limit exceeded. Retrying with another account...',
              type: 'rate_limit_error',
            },
          });
        }

        // Handle other errors
        if (!response.ok) {
          const errorText = await response.text().catch(() => '');
          log.error('❌ ANTIGRAVITY API ERROR', {
            status: response.status,
            statusText: response.statusText,
            headers: Object.fromEntries(response.headers.entries()),
            body: errorText.slice(0, 2000), // Log more of the body
            url: url, // Log the URL that failed
          });

          metricsService.recordRequest(openaiReq.model, Date.now() - startTime, 'error');

          return reply.status(response.status).send({
            error: {
              message: `Antigravity API error: ${response.statusText}. Check server logs for details.`,
              type: 'api_error',
            },
          });
        }

        // Handle streaming response
        if (openaiReq.stream) {
          reply.raw.writeHead(200, {
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache',
            'Connection': 'keep-alive',
          });

          let streamBuffer = '';

          // Convert and stream
          for await (const chunk of adapter.convertStream(response.body!, openaiReq.model)) {
            streamBuffer += chunk;
            reply.raw.write(chunk);
          }

          reply.raw.end();

          // Record metrics
          const duration = Date.now() - startTime;
          metricsService.recordRequest(openaiReq.model, duration, 'success');
          logService.logRequest(
            openaiReq.model,
            'stream',
            duration,
            'success',
            undefined, // tokens not easily available for stream
            openaiReq,
            streamBuffer
          );

          return;
        }

        // Handle non-streaming response
        const openaiResponse = await adapter.convertResponse(response, openaiReq.model);

        // Record metrics
        const duration = Date.now() - startTime;
        metricsService.recordRequest(openaiReq.model, duration, 'success');
        logService.logRequest(
          openaiReq.model,
          'completion',
          duration,
          'success',
          openaiResponse.usage?.total_tokens,
          openaiReq,
          openaiResponse
        );

        return reply.send(openaiResponse);

      } catch (error) {
        log.error('Chat completion error', {
          error: String(error),
          stack: error instanceof Error ? error.stack : undefined,
        });

        metricsService.recordRequest(openaiReq.model, Date.now() - startTime, 'error');
        logService.logRequest(
          openaiReq.model,
          'completion',
          Date.now() - startTime,
          'error',
          undefined,
          openaiReq,
          { error: String(error) }
        );

        return reply.status(500).send({
          error: {
            message: error instanceof Error ? error.message : 'Internal server error',
            type: 'internal_error',
          },
        });
      }
    }
  );
}
