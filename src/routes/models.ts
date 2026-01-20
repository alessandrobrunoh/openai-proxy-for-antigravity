/**
 * Models route - Lists available models
 * GET /v1/models
 */

import type { FastifyInstance } from 'fastify';

const AVAILABLE_MODELS = [
  {
    id: 'antigravity-gemini-3-pro',
    object: 'model',
    created: 1700000000,
    owned_by: 'google-antigravity',
  },
  {
    id: 'antigravity-gemini-3-flash',
    object: 'model',
    created: 1700000000,
    owned_by: 'google-antigravity',
  },
  {
    id: 'antigravity-claude-sonnet-4-5',
    object: 'model',
    created: 1700000000,
    owned_by: 'google-antigravity',
  },
  {
    id: 'antigravity-claude-sonnet-4-5-thinking',
    object: 'model',
    created: 1700000000,
    owned_by: 'google-antigravity',
  },
  {
    id: 'antigravity-claude-opus-4-5-thinking',
    object: 'model',
    created: 1700000000,
    owned_by: 'google-antigravity',
  },
  {
    id: 'gemini-2.5-flash',
    object: 'model',
    created: 1700000000,
    owned_by: 'google-gemini-cli',
  },
  {
    id: 'gemini-2.5-pro',
    object: 'model',
    created: 1700000000,
    owned_by: 'google-gemini-cli',
  },
];

export default async function modelsRoutes(server: FastifyInstance) {
  server.get('/models', async () => {
    return {
      object: 'list',
      data: AVAILABLE_MODELS,
    };
  });

  server.get('/models/:model', async (request: any) => {
    const model = AVAILABLE_MODELS.find(m => m.id === request.params.model);
    
    if (!model) {
      return {
        error: {
          message: 'Model not found',
          type: 'invalid_request_error',
        },
      };
    }

    return model;
  });
}
