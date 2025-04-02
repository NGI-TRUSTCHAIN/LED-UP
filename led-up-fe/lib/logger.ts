/**
 * A simple logger utility for consistent logging across the application
 */

class Logger {
  private prefix: string;

  constructor(prefix: string = 'APP') {
    this.prefix = prefix;
  }

  /**
   * Format a log message with prefix and timestamp
   */
  private formatMessage(message: string): string {
    const timestamp = new Date().toISOString();
    return `[${this.prefix}] [${timestamp}] ${message}`;
  }

  /**
   * Log an informational message
   */
  info(message: string, ...args: unknown[]): void {
    console.info(this.formatMessage(message), ...args);
  }

  /**
   * Log a warning message
   */
  warn(message: string, ...args: unknown[]): void {
    console.warn(this.formatMessage(message), ...args);
  }

  /**
   * Log an error message
   */
  error(message: string, ...args: unknown[]): void {
    console.error(this.formatMessage(message), ...args);
  }

  /**
   * Log a debug message (only in development)
   */
  debug(message: string, ...args: unknown[]): void {
    if (process.env.NODE_ENV !== 'production') {
      console.debug(this.formatMessage(message), ...args);
    }
  }

  /**
   * Create a new logger with a specific prefix
   */
  createLogger(prefix: string): Logger {
    return new Logger(prefix);
  }
}

// Create and export a default logger instance
export const logger = new Logger();

// Export the class for creating custom loggers
export default Logger;
