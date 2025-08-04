/**
 * Centralized debug utility for the LinkedIn Puzzle Solver Extension
 * 
 * Usage:
 * - import { debug } from '@/utils/debug';
 * - debug.log('message', data);
 * - debug.error('error message', error);
 * - debug.warn('warning message');
 * 
 * Configuration:
 * - Set VITE_DEBUG=true in .env for development
 * - Set VITE_DEBUG=false in .env for production
 * - Defaults to false (production mode)
 */

interface DebugConfig {
  enabled: boolean;
  level: 'log' | 'warn' | 'error' | 'all';
}

// Get debug configuration from environment variables
const getDebugConfig = (): DebugConfig => {
  // Check for Vite environment variable (build time)
  const viteDebug = import.meta.env?.VITE_DEBUG;
  
  // Check for runtime environment (for different contexts)
  const runtimeDebug = typeof process !== 'undefined' 
    ? process.env?.NODE_ENV === 'development'
    : false;
  
  // Default to false (production mode) for safety
  const enabled = viteDebug === 'true' || viteDebug === true || runtimeDebug;
  
  return {
    enabled,
    level: 'all' // Can be configured later if needed
  };
};

const config = getDebugConfig();

class DebugLogger {
  private readonly config: DebugConfig;

  constructor(config: DebugConfig) {
    this.config = config;
  }

  /**
   * Log general debug information
   */
  log(message: string, ...args: any[]): void {
    if (this.config.enabled && (this.config.level === 'all' || this.config.level === 'log')) {
      console.log(`[PUZZLE-SOLVER] ${message}`, ...args);
    }
  }

  /**
   * Log warnings
   */
  warn(message: string, ...args: any[]): void {
    if (this.config.enabled && (this.config.level === 'all' || this.config.level === 'warn')) {
      console.warn(`[PUZZLE-SOLVER] ${message}`, ...args);
    }
  }

  /**
   * Log errors (always enabled for critical issues)
   */
  error(message: string, ...args: any[]): void {
    // Errors are always logged for debugging critical issues
    console.error(`[PUZZLE-SOLVER] ${message}`, ...args);
  }

  /**
   * Log detailed information (only in debug mode)
   */
  trace(message: string, ...args: any[]): void {
    if (this.config.enabled) {
      console.trace(`[PUZZLE-SOLVER] ${message}`, ...args);
    }
  }

  /**
   * Group related log messages
   */
  group(label: string): void {
    if (this.config.enabled) {
      console.group(`[PUZZLE-SOLVER] ${label}`);
    }
  }

  /**
   * End grouped log messages
   */
  groupEnd(): void {
    if (this.config.enabled) {
      console.groupEnd();
    }
  }

  /**
   * Check if debug is enabled
   */
  get isEnabled(): boolean {
    return this.config.enabled;
  }
}

// Export singleton instance
export const debug = new DebugLogger(config);

// Export for testing or advanced usage
export { DebugLogger, type DebugConfig };