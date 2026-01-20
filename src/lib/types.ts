/**
 * Simplified types for standalone proxy
 */

export interface AuthDetails {
  type: 'oauth' | 'api-key';
}

export interface OAuthAuthDetails extends AuthDetails {
  type: 'oauth';
  refresh: string;
  access: string;
  expires: number;
}

export interface RefreshParts {
  refreshToken: string;
  projectId?: string;
  managedProjectId?: string;
}
