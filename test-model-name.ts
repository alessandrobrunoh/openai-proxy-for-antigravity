
import { OpenAIToAntigravityAdapter } from './src/adapters/openai-adapter.js';

const adapter = new OpenAIToAntigravityAdapter();
const model = "antigravity-gemini-3-pro";

console.log(`Model: ${model}`);
console.log(`Header Style: ${adapter.getHeaderStyle(model)}`);
console.log(`Extracted Name: ${adapter.extractModelName(model)}`);
