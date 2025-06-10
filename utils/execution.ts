export interface TimelineEntry {
  timestamp: string;
  message: string;
}

export interface ExecutionTrace {
  executionId: string;
  timeline: TimelineEntry[];
}

export function createExecutionTrace(date: Date = new Date()): ExecutionTrace {
  return {
    executionId: date.toISOString(),
    timeline: []
  };
}

export function logEvent(trace: ExecutionTrace, message: string, date: Date = new Date()): void {
  trace.timeline.push({ timestamp: date.toISOString(), message });
}
