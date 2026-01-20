#!/usr/bin/env node

/**
 * Generate Zed IDE configuration for Antigravity Proxy
 */

import { writeFileSync } from 'fs';
import { join } from 'path';
import { homedir } from 'os';

const MODELS = [
  {
    name: "antigravity-gemini-3-pro",
    display_name: "Gemini 3 Pro (Antigravity)",
    max_tokens: 1048576,
    max_output_tokens: 65535,
    capabilities: {
      tools: true,
      images: true,
      parallel_tool_calls: true,
      prompt_cache_key: true,
    },
  },
  {
    name: "antigravity-gemini-3-flash",
    display_name: "Gemini 3 Flash (Antigravity)",
    max_tokens: 1048576,
    max_output_tokens: 65536,
    capabilities: {
      tools: true,
      images: true,
      parallel_tool_calls: true,
      prompt_cache_key: true,
    },
  },
  {
    name: "antigravity-claude-sonnet-4-5",
    display_name: "Claude Sonnet 4.5 (Antigravity)",
    max_tokens: 200000,
    max_output_tokens: 64000,
    capabilities: {
      tools: true,
      images: true,
      parallel_tool_calls: true,
      prompt_cache_key: true,
    },
  },
  {
    name: "antigravity-claude-sonnet-4-5-thinking",
    display_name: "Claude Sonnet 4.5 Thinking (Antigravity)",
    max_tokens: 200000,
    max_output_tokens: 64000,
    capabilities: {
      tools: true,
      images: true,
      parallel_tool_calls: true,
      prompt_cache_key: true,
    },
  },
  {
    name: "antigravity-claude-opus-4-5-thinking",
    display_name: "Claude Opus 4.5 Thinking (Antigravity)",
    max_tokens: 200000,
    max_output_tokens: 64000,
    capabilities: {
      tools: true,
      images: true,
      parallel_tool_calls: true,
      prompt_cache_key: true,
    },
  },
  {
    name: "gemini-2.5-flash",
    display_name: "Gemini 2.5 Flash (CLI)",
    max_tokens: 1048576,
    max_output_tokens: 65536,
    capabilities: {
      tools: true,
      images: true,
      parallel_tool_calls: true,
      prompt_cache_key: true,
    },
  },
  {
    name: "gemini-2.5-pro",
    display_name: "Gemini 2.5 Pro (CLI)",
    max_tokens: 1048576,
    max_output_tokens: 65536,
    capabilities: {
      tools: true,
      images: true,
      parallel_tool_calls: true,
      prompt_cache_key: true,
    },
  },
];

const proxyUrl = process.env.PROXY_URL || 'http://localhost:3000';

const config = {
  language_models: {
    openai_compatible: {
      "Antigravity": {
        api_url: `${proxyUrl}/v1`,
        available_models: MODELS,
      },
    },
  },
};

console.log('');
console.log('🔧 Antigravity Proxy - Zed IDE Configuration Generator');
console.log('━'.repeat(60));
console.log('');
console.log('Generated configuration:');
console.log('');
console.log(JSON.stringify(config, null, 2));
console.log('');
console.log('━'.repeat(60));
console.log('');
console.log('To add this to Zed IDE:');
console.log('');
console.log('1. Open Zed settings:');
console.log('   - Press Cmd+, (Mac) or Ctrl+, (Windows/Linux)');
console.log('   - Or use command palette: "zed: open settings file"');
console.log('');
console.log('2. Add or merge the above JSON into your settings.json');
console.log('');
console.log('3. Save the file and restart Zed');
console.log('');
console.log('4. You can now use Antigravity models in Zed!');
console.log('   - Open Agent Panel');
console.log('   - Select model from "Antigravity" provider');
console.log('');
console.log('━'.repeat(60));
console.log('');
console.log('Zed settings location:');
console.log(`  ${join(homedir(), '.config', 'zed', 'settings.json')}`);
console.log('');

// Optionally save to file
const outputPath = join(process.cwd(), 'zed-settings.json');
writeFileSync(outputPath, JSON.stringify(config, null, 2));
console.log(`Configuration also saved to: ${outputPath}`);
console.log('');
