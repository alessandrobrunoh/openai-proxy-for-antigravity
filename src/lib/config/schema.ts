/**
 * Configuration schema types - simplified for standalone proxy
 */

export type AccountSelectionStrategy = 'round-robin' | 'sticky' | 'hybrid';

export interface AntigravityConfig {
  account_selection_strategy: AccountSelectionStrategy;
  quiet_mode: boolean;
  debug: boolean;
  auto_update: boolean;
  keep_thinking: boolean;
  session_recovery: boolean;
  switch_on_first_rate_limit: boolean;
  quota_fallback: boolean;
  max_rate_limit_wait_seconds: number;
  pid_offset_enabled: boolean;
  proactive_token_refresh: boolean;
  proactive_refresh_buffer_seconds: number;
  proactive_refresh_check_interval_seconds: number;
  claude_tool_hardening: boolean;
  web_search?: {
    default_mode: 'auto' | 'off';
    grounding_threshold?: number;
  };
  health_score?: {
    initial: number;
    success_reward: number;
    rate_limit_penalty: number;
    failure_penalty: number;
    recovery_rate_per_hour: number;
    min_usable: number;
    max_score: number;
  };
  token_bucket?: {
    max_tokens: number;
    regeneration_rate_per_minute: number;
    initial_tokens: number;
  };
  signature_cache?: any;
  auto_resume: boolean;
  resume_text: string;
}
