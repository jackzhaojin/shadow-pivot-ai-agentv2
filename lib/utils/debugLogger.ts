/**
 * Utility for creating detailed debug logs that can be easily copied for troubleshooting
 */

export interface DebugLogEntry {
  timestamp: string;
  level: 'info' | 'warn' | 'error' | 'debug';
  category: string;
  message: string;
  data?: unknown;
  requestId?: string;
}

class DebugLogger {
  private logs: DebugLogEntry[] = [];
  private maxLogs = 1000; // Keep last 1000 logs
  
  log(level: 'info' | 'warn' | 'error' | 'debug', category: string, message: string, data?: unknown, requestId?: string) {
    const entry: DebugLogEntry = {
      timestamp: new Date().toISOString(),
      level,
      category,
      message,
      data,
      requestId
    };
    
    this.logs.push(entry);
    
    // Keep only the last maxLogs entries
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(-this.maxLogs);
    }
    
    // Also log to console with detailed formatting
    const logPrefix = `🔍 [${entry.timestamp}] [${level.toUpperCase()}] [${category}]`;
    
    if (data) {
      console.log(`${logPrefix} ${message}`, data);
    } else {
      console.log(`${logPrefix} ${message}`);
    }
  }
  
  info(category: string, message: string, data?: unknown, requestId?: string) {
    this.log('info', category, message, data, requestId);
  }
  
  warn(category: string, message: string, data?: unknown, requestId?: string) {
    this.log('warn', category, message, data, requestId);
  }
  
  error(category: string, message: string, data?: unknown, requestId?: string) {
    this.log('error', category, message, data, requestId);
  }
  
  debug(category: string, message: string, data?: unknown, requestId?: string) {
    this.log('debug', category, message, data, requestId);
  }
  
  /**
   * Get logs for a specific request ID
   */
  getRequestLogs(requestId: string): DebugLogEntry[] {
    return this.logs.filter(log => log.requestId === requestId);
  }
  
  /**
   * Get logs for a specific category
   */
  getCategoryLogs(category: string): DebugLogEntry[] {
    return this.logs.filter(log => log.category === category);
  }
  
  /**
   * Get recent logs (last N entries)
   */
  getRecentLogs(count: number = 50): DebugLogEntry[] {
    return this.logs.slice(-count);
  }
  
  /**
   * Get logs within a time range
   */
  getLogsInRange(startTime: Date, endTime: Date): DebugLogEntry[] {
    return this.logs.filter(log => {
      const logTime = new Date(log.timestamp);
      return logTime >= startTime && logTime <= endTime;
    });
  }
  
  /**
   * Export logs as a formatted string for easy copying
   */
  exportLogs(filter?: {
    requestId?: string;
    category?: string;
    level?: 'info' | 'warn' | 'error' | 'debug';
    lastN?: number;
    since?: Date;
  }): string {
    let logsToExport = this.logs;
    
    if (filter) {
      if (filter.requestId) {
        logsToExport = logsToExport.filter(log => log.requestId === filter.requestId);
      }
      if (filter.category) {
        logsToExport = logsToExport.filter(log => log.category === filter.category);
      }
      if (filter.level) {
        logsToExport = logsToExport.filter(log => log.level === filter.level);
      }
      if (filter.since) {
        logsToExport = logsToExport.filter(log => new Date(log.timestamp) >= filter.since!);
      }
      if (filter.lastN) {
        logsToExport = logsToExport.slice(-filter.lastN);
      }
    }
    
    const lines = [
      '========================================',
      '🔍 DEBUG LOG EXPORT',
      `📅 Generated: ${new Date().toISOString()}`,
      `📊 Total Entries: ${logsToExport.length}`,
      '========================================',
      ''
    ];
    
    logsToExport.forEach((log, index) => {
      lines.push(`[${index + 1}] ${log.timestamp} | ${log.level.toUpperCase()} | ${log.category}`);
      lines.push(`    💬 ${log.message}`);
      
      if (log.requestId) {
        lines.push(`    🆔 Request ID: ${log.requestId}`);
      }
      
      if (log.data) {
        const dataStr = typeof log.data === 'string' ? log.data : JSON.stringify(log.data, null, 2);
        lines.push(`    📋 Data:`);
        const dataLines = dataStr.split('\n');
        dataLines.forEach(line => {
          lines.push(`       ${line}`);
        });
      }
      
      lines.push(''); // Empty line between entries
    });
    
    lines.push('========================================');
    lines.push('🏁 END OF LOG EXPORT');
    lines.push('========================================');
    
    return lines.join('\n');
  }
  
  /**
   * Clear all logs
   */
  clear() {
    this.logs = [];
    console.log('🧹 Debug logs cleared');
  }
}

// Global debug logger instance
export const debugLogger = new DebugLogger();

// Convenience functions
export function logDebug(category: string, message: string, data?: unknown, requestId?: string) {
  debugLogger.debug(category, message, data, requestId);
}

export function logInfo(category: string, message: string, data?: unknown, requestId?: string) {
  debugLogger.info(category, message, data, requestId);
}

export function logWarn(category: string, message: string, data?: unknown, requestId?: string) {
  debugLogger.warn(category, message, data, requestId);
}

export function logError(category: string, message: string, data?: unknown, requestId?: string) {
  debugLogger.error(category, message, data, requestId);
}

export function exportRecentLogs(count: number = 50): string {
  return debugLogger.exportLogs({ lastN: count });
}

export function exportRequestLogs(requestId: string): string {
  return debugLogger.exportLogs({ requestId });
}

export function exportCategoryLogs(category: string): string {
  return debugLogger.exportLogs({ category });
}
