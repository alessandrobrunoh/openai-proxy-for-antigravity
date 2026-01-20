
import { OpenAIToAntigravityAdapter } from './src/adapters/openai-adapter.js';

const adapter = new OpenAIToAntigravityAdapter();

const tool = {
  type: 'function',
  function: {
    name: 'now',
    description: 'Returns the current datetime...',
    parameters: {
      required: ['timezone'],
      type: 'object',
      properties: {
        timezone: {
          description: 'The timezone to use for the datetime.',
          anyOf: [
            {
              description: 'Use UTC for the datetime.',
              type: 'string',
              enum: ['utc']
            },
            {
              description: 'Use local time for the datetime.',
              type: 'string',
              enum: ['local']
            }
          ]
        }
      }
    }
  }
};

// @ts-ignore
const result = adapter.convertTools([tool]);
console.log(JSON.stringify(result, null, 2));
