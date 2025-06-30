import { config } from '../config/env';

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

export interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: Date;
  data?: any;
  context?: string;
}

class Logger {
  private logLevel: LogLevel;
  private isDebugMode: boolean;

  constructor() {
    this.logLevel = config.logLevel;
    this.isDebugMode = config.debugMode;
  }

  private shouldLog(level: LogLevel): boolean {
    if (!this.isDebugMode && level === 'debug') {
      return false;
    }

    const levels: Record<LogLevel, number> = {
      debug: 0,
      info: 1,
      warn: 2,
      error: 3,
    };

    return levels[level] >= levels[this.logLevel];
  }

  private formatMessage(
    level: LogLevel,
    message: string,
    context?: string
  ): string {
    const timestamp = new Date().toLocaleTimeString();
    const prefix = this.getLogPrefix(level);
    const contextStr = context ? `[${context}] ` : '';
    return `${timestamp} ${prefix} ${contextStr}${message}`;
  }

  private getLogPrefix(level: LogLevel): string {
    const prefixes: Record<LogLevel, string> = {
      debug: '🔍',
      info: 'ℹ️',
      warn: '⚠️',
      error: '❌',
    };
    return prefixes[level];
  }

  private log(
    level: LogLevel,
    message: string,
    data?: any,
    context?: string
  ): void {
    if (!this.shouldLog(level)) return;

    const formattedMessage = this.formatMessage(level, message, context);
    const consoleMethod = level === 'debug' ? 'log' : level;

    if (data !== undefined) {
      console[consoleMethod](formattedMessage, data);
    } else {
      console[consoleMethod](formattedMessage);
    }

    // Store log entry for potential remote logging
    if (config.enableAnalytics && level === 'error') {
      this.sendToAnalytics({
        level,
        message,
        timestamp: new Date(),
        data,
        context,
      });
    }
  }

  private sendToAnalytics(entry: LogEntry): void {
    // TODO: Implement analytics logging
    // This could send to services like Sentry, LogRocket, etc.
    console.log('📊 Analytics Log:', entry);
  }

  debug(message: string, data?: any, context?: string): void {
    this.log('debug', message, data, context);
  }

  info(message: string, data?: any, context?: string): void {
    this.log('info', message, data, context);
  }

  warn(message: string, data?: any, context?: string): void {
    this.log('warn', message, data, context);
  }

  error(message: string, data?: any, context?: string): void {
    this.log('error', message, data, context);
  }

  // API specific logging methods
  apiRequest(method: string, url: string, data?: any): void {
    this.debug(`API Request: ${method.toUpperCase()} ${url}`, data, 'API');
  }

  apiResponse(
    method: string,
    url: string,
    status: number,
    duration?: number
  ): void {
    const message = `API Response: ${method.toUpperCase()} ${url} (${status})`;
    const durationStr = duration ? ` in ${duration}ms` : '';
    this.debug(message + durationStr, undefined, 'API');
  }

  apiError(method: string, url: string, error: any): void {
    this.error(`API Error: ${method.toUpperCase()} ${url}`, error, 'API');
  }

  // Game specific logging methods
  gameAction(action: string, data?: any): void {
    this.info(`Game Action: ${action}`, data, 'GAME');
  }

  battleEvent(event: string, data?: any): void {
    this.debug(`Battle Event: ${event}`, data, 'BATTLE');
  }

  userAction(action: string, data?: any): void {
    this.info(`User Action: ${action}`, data, 'USER');
  }
}

// Create singleton instance
export const logger = new Logger();

// Export as default
export default logger;
