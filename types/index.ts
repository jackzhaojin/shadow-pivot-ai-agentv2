export interface Execution {
  id: string;
  status: 'pending' | 'running' | 'complete' | 'error';
}
