'use client';
import { createContext, useContext, useState } from 'react';

const ThemeContext = createContext<[string, (t: string) => void] | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const state = useState('light');
  return <ThemeContext.Provider value={state}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('ThemeProvider missing');
  return ctx;
}
