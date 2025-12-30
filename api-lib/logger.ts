type LogLevel = 'info' | 'error' | 'warn';

function log(level: LogLevel, message: string, meta?: Record<string, unknown>) {
  const payload = {
    level,
    message,
    meta,
    timestamp: new Date().toISOString(),
  };
  // In production, route to your log aggregator (Datadog, Logtail, etc.)
  if (level === 'error') {
    console.error(JSON.stringify(payload));
  } else if (level === 'warn') {
    console.warn(JSON.stringify(payload));
  } else {
    console.log(JSON.stringify(payload));
  }
}

export const logInfo = (message: string, meta?: Record<string, unknown>) => log('info', message, meta);
export const logWarn = (message: string, meta?: Record<string, unknown>) => log('warn', message, meta);
export const logError = (message: string, meta?: Record<string, unknown>) => log('error', message, meta);
