// lib/logger.ts — Centralized logging utility
// Hanya log error detail di development; production log minimal

const isDev = process.env.NODE_ENV === 'development';

type LogLevel = 'info' | 'warn' | 'error';

function log(level: LogLevel, context: string, message: string, details?: unknown) {
  const timestamp = new Date().toISOString();
  const prefix = `[${timestamp}] [${level.toUpperCase()}] [${context}]`;

  if (isDev) {
    const detailStr = details instanceof Error
      ? `: ${details.message}`
      : details !== undefined
        ? `: ${JSON.stringify(details)}`
        : '';
    console[level](`${prefix} ${message}${detailStr}`);
  } else {
    // Production: log minimal tanpa detail sensitif
    if (level === 'error') {
      console.error(`${prefix} ${message}`);
    }
  }
}

export const logger = {
  info: (context: string, message: string, details?: unknown) =>
    log('info', context, message, details),
  warn: (context: string, message: string, details?: unknown) =>
    log('warn', context, message, details),
  error: (context: string, message: string, details?: unknown) =>
    log('error', context, message, details),
};
