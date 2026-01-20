/**
 * Simplified token refresh for standalone proxy
 */

import { ANTIGRAVITY_CLIENT_ID, ANTIGRAVITY_CLIENT_SECRET } from '../constants.js';
import { calculateTokenExpiry, formatRefreshParts, parseRefreshParts } from './auth.js';
import { createLogger } from '../logger.js';
import type { OAuthAuthDetails } from '../types.js';

const log = createLogger('token');

export class AntigravityTokenRefreshError extends Error {
  code: string;
  constructor(message: string, code: string) {
    super(message);
    this.name = 'AntigravityTokenRefreshError';
    this.code = code;
  }
}

export async function refreshAccessToken(
  auth: OAuthAuthDetails
): Promise<OAuthAuthDetails | null> {
  const parts = parseRefreshParts(auth.refresh);
  
  if (!parts.refreshToken) {
    log.error('Missing refresh token');
    return null;
  }

  try {
    const requestTime = Date.now();
    
    const response = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: ANTIGRAVITY_CLIENT_ID,
        client_secret: ANTIGRAVITY_CLIENT_SECRET,
        refresh_token: parts.refreshToken,
        grant_type: 'refresh_token',
      }),
    });

    if (!response.ok) {
      const errorText = await response.text().catch(() => '');
      
      if (response.status === 400 && errorText.includes('invalid_grant')) {
        throw new AntigravityTokenRefreshError('Refresh token revoked', 'invalid_grant');
      }
      
      log.error('Token refresh failed', { status: response.status });
      return null;
    }

    const data: any = await response.json();
    
    if (!data.access_token) {
      log.error('Token refresh response missing access_token');
      return null;
    }

    const expires = calculateTokenExpiry(requestTime, data.expires_in);

    return {
      type: 'oauth',
      access: data.access_token,
      expires,
      refresh: formatRefreshParts({
        refreshToken: data.refresh_token || parts.refreshToken,
        projectId: parts.projectId,
        managedProjectId: parts.managedProjectId,
      }),
    };
  } catch (error) {
    if (error instanceof AntigravityTokenRefreshError) {
      throw error;
    }
    
    log.error('Token refresh error', { error: String(error) });
    return null;
  }
}
