"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createExecutionTrace = createExecutionTrace;
exports.logEvent = logEvent;
function createExecutionTrace(date = new Date()) {
    return {
        executionId: date.toISOString(),
        timeline: []
    };
}
function logEvent(trace, message, date = new Date()) {
    trace.timeline.push({ timestamp: date.toISOString(), message });
}
