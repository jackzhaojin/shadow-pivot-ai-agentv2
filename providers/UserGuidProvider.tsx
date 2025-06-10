'use client';
import { createContext, useContext, useEffect, useState } from 'react';
import { getOrCreateUserGuid } from '@/utils/userGuid';

const UserGuidContext = createContext<string | null>(null);

export function UserGuidProvider({ children }: { children: React.ReactNode }) {
  const [guid, setGuid] = useState<string | null>(null);

  useEffect(() => {
    const id = getOrCreateUserGuid();
    setGuid(id);
  }, []);

  if (!guid) {
    return null; // simple fallback while loading
  }

  return (
    <UserGuidContext.Provider value={guid}>{children}</UserGuidContext.Provider>
  );
}

export function useUserGuid() {
  const ctx = useContext(UserGuidContext);
  if (!ctx) throw new Error('UserGuidProvider missing');
  return ctx;
}
