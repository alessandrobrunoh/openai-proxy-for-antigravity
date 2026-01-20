/**
 * Simple logger for antigravity-proxy (standalone version)
 * Adapted from opencode-antigravity-auth/src/plugin/logger.ts
 */

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

export interface Logger {
  debug(message: string, meta?: Record<string, unknown>): void;
  info(message: string, meta?: Record<string, unknown>): void;
  warn(message: string, meta?: Record<string, unknown>): void;
  error(message: string, meta?: Record<string, unknown>): void;
}

const LOG_LEVEL_VALUES: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
};

let currentLogLevel: LogLevel = (process.env.LOG_LEVEL as LogLevel) || 'info';

export function setLogLevel(level: LogLevel): void {
  currentLogLevel = level;
}

function shouldLog(level: LogLevel): boolean {
  return LOG_LEVEL_VALUES[level] >= LOG_LEVEL_VALUES[currentLogLevel];
}

function formatMeta(meta?: Record<string, unknown>): string {
  if (!meta || Object.keys(meta).length === 0) return '';
  try {
    return ' ' + JSON.stringify(meta);
  } catch {
    return ' [meta serialization failed]';
  }
}

export function createLogger(namespace: string): Logger {
  const prefix = `[${namespace}]`;

  return {
    debug(message: string, meta?: Record<string, unknown>): void {
      if (shouldLog('debug')) {
        console.debug(`${prefix} ${message}${formatMeta(meta)}`);
      }
    },
    info(message: string, meta?: Record<string, unknown>): void {
      if (shouldLog('info')) {
        console.info(`${prefix} ${message}${formatMeta(meta)}`);
      }
    },
    warn(message: string, meta?: Record<string, unknown>): void {
      if (shouldLog('warn')) {
        console.warn(`${prefix} ${message}${formatMeta(meta)}`);
      }
    },
    error(message: string, meta?: Record<string, unknown>): void {
      if (shouldLog('error')) {
        console.error(`${prefix} ${message}${formatMeta(meta)}`);
      }
    },
  };
}

// Default logger
export const log = createLogger('proxy');
