/**
 * Simplified rotation stubs for standalone proxy
 */

export interface AccountWithMetrics {
  index: number;
  healthScore: number;
  availableTokens: number;
}

class HealthTracker {
  _recordSuccess(_accountIndex: number): void {}
  _recordFailure(_accountIndex: number): void {}
  _recordRateLimit(_accountIndex: number): void {}
  _getScore(_accountIndex: number): number { return 100; }
  
  // Public aliases for compatibility
  recordSuccess(accountIndex: number): void { this._recordSuccess(accountIndex); }
  recordFailure(accountIndex: number): void { this._recordFailure(accountIndex); }
  recordRateLimit(accountIndex: number): void { this._recordRateLimit(accountIndex); }
  getScore(accountIndex: number): number { return this._getScore(accountIndex); }
}

class TokenTracker {
  _consume(_accountIndex: number): boolean { return true; }
  _refund(_accountIndex: number): void {}
  _getAvailableTokens(_accountIndex: number): number { return 100; }
  
  // Public aliases
  consume(accountIndex: number): boolean { return this._consume(accountIndex); }
  refund(accountIndex: number): void { this._refund(accountIndex); }
  getAvailableTokens(accountIndex: number): number { return this._getAvailableTokens(accountIndex); }
}

let healthTracker: HealthTracker | null = null;
let tokenTracker: TokenTracker | null = null;

export function initHealthTracker(_config?: any): void {
  healthTracker = new HealthTracker();
}

export function initTokenTracker(_config?: any): void {
  tokenTracker = new TokenTracker();
}

export function getHealthTracker(): HealthTracker {
  if (!healthTracker) {
    healthTracker = new HealthTracker();
  }
  return healthTracker;
}

export function getTokenTracker(): TokenTracker {
  if (!tokenTracker) {
    tokenTracker = new TokenTracker();
  }
  return tokenTracker;
}

export function selectHybridAccount(
  accounts: AccountWithMetrics[],
  _healthTracker: HealthTracker,
  _tokenTracker: TokenTracker
): AccountWithMetrics | null {
  if (accounts.length === 0) return null;
  return accounts[0] || null;
}
