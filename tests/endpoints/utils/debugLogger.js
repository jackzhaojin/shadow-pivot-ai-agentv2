"use strict";
/**
 * Utility for creating detailed debug logs that can be easily copied for troubleshooting
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.debugLogger = void 0;
exports.logDebug = logDebug;
exports.logInfo = logInfo;
exports.logWarn = logWarn;
exports.logError = logError;
exports.exportRecentLogs = exportRecentLogs;
exports.exportRequestLogs = exportRequestLogs;
exports.exportCategoryLogs = exportCategoryLogs;
class DebugLogger {
    constructor() {
        this.logs = [];
        this.maxLogs = 1000; // Keep last 1000 logs
    }
    log(level, category, message, data, requestId) {
        const entry = {
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
        }
        else {
            console.log(`${logPrefix} ${message}`);
        }
    }
    info(category, message, data, requestId) {
        this.log('info', category, message, data, requestId);
    }
    warn(category, message, data, requestId) {
        this.log('warn', category, message, data, requestId);
    }
    error(category, message, data, requestId) {
        this.log('error', category, message, data, requestId);
    }
    debug(category, message, data, requestId) {
        this.log('debug', category, message, data, requestId);
    }
    /**
     * Get logs for a specific request ID
     */
    getRequestLogs(requestId) {
        return this.logs.filter(log => log.requestId === requestId);
    }
    /**
     * Get logs for a specific category
     */
    getCategoryLogs(category) {
        return this.logs.filter(log => log.category === category);
    }
    /**
     * Get recent logs (last N entries)
     */
    getRecentLogs(count = 50) {
        return this.logs.slice(-count);
    }
    /**
     * Get logs within a time range
     */
    getLogsInRange(startTime, endTime) {
        return this.logs.filter(log => {
            const logTime = new Date(log.timestamp);
            return logTime >= startTime && logTime <= endTime;
        });
    }
    /**
     * Export logs as a formatted string for easy copying
     */
    exportLogs(filter) {
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
                logsToExport = logsToExport.filter(log => new Date(log.timestamp) >= filter.since);
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
exports.debugLogger = new DebugLogger();
// Convenience functions
function logDebug(category, message, data, requestId) {
    exports.debugLogger.debug(category, message, data, requestId);
}
function logInfo(category, message, data, requestId) {
    exports.debugLogger.info(category, message, data, requestId);
}
function logWarn(category, message, data, requestId) {
    exports.debugLogger.warn(category, message, data, requestId);
}
function logError(category, message, data, requestId) {
    exports.debugLogger.error(category, message, data, requestId);
}
function exportRecentLogs(count = 50) {
    return exports.debugLogger.exportLogs({ lastN: count });
}
function exportRequestLogs(requestId) {
    return exports.debugLogger.exportLogs({ requestId });
}
function exportCategoryLogs(category) {
    return exports.debugLogger.exportLogs({ category });
}
