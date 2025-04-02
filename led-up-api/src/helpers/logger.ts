/**
 * Structured logger for the application
 *
 * This module provides a standardized logging interface with different log levels
 * and structured output format. It can be configured to output to different
 * destinations based on the environment.
 */

// Log levels in order of severity
enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
  FATAL = 4,
}

// Get the minimum log level from environment or default to INFO
const MIN_LOG_LEVEL = process.env.LOG_LEVEL
  ? (LogLevel[process.env.LOG_LEVEL as keyof typeof LogLevel] ?? LogLevel.INFO)
  : LogLevel.INFO;

// Whether to format logs for human readability (development) or JSON (production)
const IS_PRODUCTION = process.env.NODE_ENV === 'production';

/**
 * Format a log message with metadata
 */
function formatLog(level: string, message: string, meta?: Record<string, any>): string {
  const timestamp = new Date().toISOString();
  const logData = {
    timestamp,
    level,
    message,
    ...meta,
  };

  if (IS_PRODUCTION) {
    // In production, output JSON for easier parsing by log aggregation tools
    return JSON.stringify(logData);
  } else {
    // In development, format for human readability
    let formattedMeta = '';
    if (meta && Object.keys(meta).length > 0) {
      formattedMeta = '\n' + JSON.stringify(meta, null, 2);
    }
    return `[${timestamp}] ${level.toUpperCase()}: ${message}${formattedMeta}`;
  }
}

/**
 * Log a message if the level is at or above the minimum log level
 */
function log(level: LogLevel, message: string, meta?: Record<string, any>): void {
  if (level < MIN_LOG_LEVEL) {
    return;
  }

  const levelName = LogLevel[level].toLowerCase();
  const formattedLog = formatLog(levelName, message, meta);

  switch (level) {
    case LogLevel.DEBUG:
    case LogLevel.INFO:
      console.log(formattedLog);
      break;
    case LogLevel.WARN:
      console.warn(formattedLog);
      break;
    case LogLevel.ERROR:
    case LogLevel.FATAL:
      console.error(formattedLog);
      break;
  }
}

/**
 * Logger interface with methods for different log levels
 */
export const logger = {
  /**
   * Log a debug message
   * @param message - The message to log
   * @param meta - Optional metadata to include with the log
   */
  debug: (message: string, meta?: Record<string, any>): void => log(LogLevel.DEBUG, message, meta),

  /**
   * Log an info message
   * @param message - The message to log
   * @param meta - Optional metadata to include with the log
   */
  info: (message: string, meta?: Record<string, any>): void => log(LogLevel.INFO, message, meta),

  /**
   * Log a warning message
   * @param message - The message to log
   * @param meta - Optional metadata to include with the log
   */
  warn: (message: string, meta?: Record<string, any>): void => log(LogLevel.WARN, message, meta),

  /**
   * Log an error message
   * @param message - The message to log
   * @param meta - Optional metadata to include with the log
   */
  error: (message: string, meta?: Record<string, any>): void => log(LogLevel.ERROR, message, meta),

  /**
   * Log a fatal error message
   * @param message - The message to log
   * @param meta - Optional metadata to include with the log
   */
  fatal: (message: string, meta?: Record<string, any>): void => log(LogLevel.FATAL, message, meta),
};
