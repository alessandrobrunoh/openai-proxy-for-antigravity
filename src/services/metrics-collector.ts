/**
 * Metrics Collection Service
 * Tracks usage statistics and performance
 */



interface RequestMetric {
  model: string;
  duration: number;
  status: 'success' | 'error' | 'rate_limited';
  timestamp: number;
}

export class MetricsService {
  private requests: RequestMetric[] = [];
  private maxStoredRequests = 10000;

  recordRequest(model: string, duration: number, status: RequestMetric['status']): void {
    this.requests.push({
      model,
      duration,
      status,
      timestamp: Date.now(),
    });

    // Keep only recent requests
    if (this.requests.length > this.maxStoredRequests) {
      this.requests = this.requests.slice(-this.maxStoredRequests);
    }
  }

  getStats(since?: number): {
    totalRequests: number;
    successCount: number;
    errorCount: number;
    rateLimitedCount: number;
    successRate: number;
    avgDuration: number;
    requestsByModel: Record<string, number>;
  } {
    const cutoff = since || Date.now() - 24 * 60 * 60 * 1000; // Last 24 hours
    const recent = this.requests.filter(r => r.timestamp >= cutoff);

    const successCount = recent.filter(r => r.status === 'success').length;
    const errorCount = recent.filter(r => r.status === 'error').length;
    const rateLimitedCount = recent.filter(r => r.status === 'rate_limited').length;

    const totalRequests = recent.length;
    const successRate = totalRequests > 0 ? (successCount / totalRequests) * 100 : 0;

    const avgDuration = totalRequests > 0
      ? recent.reduce((sum, r) => sum + r.duration, 0) / totalRequests
      : 0;

    const requestsByModel: Record<string, number> = {};
    for (const req of recent) {
      requestsByModel[req.model] = (requestsByModel[req.model] || 0) + 1;
    }

    return {
      totalRequests,
      successCount,
      errorCount,
      rateLimitedCount,
      successRate: Math.round(successRate * 100) / 100,
      avgDuration: Math.round(avgDuration),
      requestsByModel,
    };
  }

  getRecentRequests(limit = 100): RequestMetric[] {
    return this.requests.slice(-limit).reverse();
  }
}

export const metricsService = new MetricsService();
