import { getOrCreateUserGuid } from '@/utils/userGuid';

export function runAgent() {
  // TODO: integrate with MCP server
}

export function withUserGuid(init: RequestInit = {}): RequestInit {
  const guid = getOrCreateUserGuid();
  const headers = new Headers(init.headers);
  headers.set('x-user-guid', guid);
  return { ...init, headers };
}
