/**
 * Log Storage Service
 * Stores recent request logs for the admin dashboard
 */

import { createLogger } from '../lib/logger.js';

const log = createLogger('log-store');

export interface RequestLog {
  id: string;
  timestamp: number;
  model: string;
  type: 'completion' | 'stream';
  duration: number;
  status: 'success' | 'error';
  tokens?: number;
}

export class LogService {
  private logs: RequestLog[] = [];
  private maxLogs = 1000;

  logRequest(
    model: string,
    type: RequestLog['type'],
    duration: number,
    status: RequestLog['status'],
    tokens?: number
  ): void {
    const logEntry: RequestLog = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
      timestamp: Date.now(),
      model,
      type,
      duration,
      status,
      tokens,
    };

    this.logs.push(logEntry);

    // Keep only recent logs
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(-this.maxLogs);
    }
  }

  getRecentLogs(limit = 100): RequestLog[] {
    return this.logs.slice(-limit).reverse();
  }

  clearLogs(): void {
    this.logs = [];
    log.info('Logs cleared');
  }
}

export const logService = new LogService();
