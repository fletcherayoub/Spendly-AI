export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

const LOG_LEVEL_SEVERITY: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
};

class Logger {
  private minLevel: LogLevel = 'debug';

  public setLogLevel(level: LogLevel) {
    this.minLevel = level;
  }

  private shouldLog(level: LogLevel): boolean {
    // Strictly ONLY log in development mode. Silent in production builds.
    if (!__DEV__) return false;
    return LOG_LEVEL_SEVERITY[level] >= LOG_LEVEL_SEVERITY[this.minLevel];
  }

  private formatMessage(level: LogLevel, tag?: string, message?: string): string {
    const timestamp = new Date().toISOString().slice(11, 19);
    const prefix = `[${timestamp}] [${level.toUpperCase()}]${tag ? ` [${tag}]` : ''}`;
    return `${prefix} ${message ?? ''}`;
  }

  public debug(tag: string, message: string, ...args: unknown[]) {
    if (!this.shouldLog('debug')) return;
    console.debug(this.formatMessage('debug', tag, message), ...args);
  }

  public info(tag: string, message: string, ...args: unknown[]) {
    if (!this.shouldLog('info')) return;
    console.info(this.formatMessage('info', tag, message), ...args);
  }

  public warn(tag: string, message: string, ...args: unknown[]) {
    if (!this.shouldLog('warn')) return;
    console.warn(this.formatMessage('warn', tag, message), ...args);
  }

  public error(tag: string, message: string, error?: unknown, ...args: unknown[]) {
    if (!this.shouldLog('error')) return;
    const formatted = this.formatMessage('error', tag, message);
    if (error) {
      console.error(formatted, error, ...args);
    } else {
      console.error(formatted, ...args);
    }
  }

  /** Create a scoped logger bound to a specific module or component tag. */
  public scope(tag: string) {
    return {
      debug: (message: string, ...args: unknown[]) => this.debug(tag, message, ...args),
      info: (message: string, ...args: unknown[]) => this.info(tag, message, ...args),
      warn: (message: string, ...args: unknown[]) => this.warn(tag, message, ...args),
      error: (message: string, error?: unknown, ...args: unknown[]) =>
        this.error(tag, message, error, ...args),
    };
  }
}

export const logger = new Logger();
