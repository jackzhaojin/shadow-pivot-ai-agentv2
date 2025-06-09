# App Router Code Base Overview

This document summarizes the React code base built with **Next.js 15 App Router** and explains where Server‑Side Rendering (SSR) and Client‑Side Rendering (CSR) occur.

## Folder Structure

- `app/` – entry point for routes and API handlers
- `components/` – shared client components
- `features/` – feature specific components, APIs, and utilities
- `lib/` – server‑only Azure clients and utilities

## App Directory Breakdown

### `app/layout.tsx`
Sets fonts and global styles and wraps the HTML. It is a server component by default.

```tsx
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
...
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}
```

### `app/page.tsx`
Main landing page rendered on the server. It checks Azure service status during SSR and exports runtime settings:

```tsx
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export default async function Home() {
  const azureStatus = await getAzureStatus();
  return (
    <div className="grid ...">
      {/* content */}
    </div>
  );
}
```

### `app/test-azure/page.tsx`
A client component (`'use client'`) that allows testing Azure Storage and AI via API routes.

### API Routes
- `app/api/test-storage/route.ts` – Tests Blob Storage connectivity.
- `app/api/test-ai/route.ts` – Tests Azure OpenAI connectivity.

### Additional Routes
- `app/chat/page.tsx` – Placeholder chat page.
- `app/dashboard/page.tsx` – Placeholder dashboard page.

## SSR vs CSR in this Project

- **Server‑Side Rendering (SSR)**: Pages or components that run on the server and return pre-rendered HTML. `app/page.tsx` is an SSR example because it executes `getAzureStatus()` during the request.
- **Client‑Side Rendering (CSR)**: Components marked with `'use client'` run entirely in the browser. They fetch data from API routes. `app/test-azure/page.tsx` demonstrates CSR.

Files inside `app/` are server components by default unless they include `'use client'` at the top.

## Rendering Mode Table

| Path | Type | Rendering |
| --- | --- | --- |
| `app/layout.tsx` | Page layout | SSR |
| `app/page.tsx` | Page (includes `ClientSideDemo`) | SSR |
| `app/dashboard/page.tsx` | Page | SSR |
| `app/chat/page.tsx` | Page | SSR |
| `app/test-azure/page.tsx` | Page | CSR |
| `app/api/test-storage/route.ts` | API route | Server |
| `app/api/test-ai/route.ts` | API route | Server |
| `components/azure/ClientSideDemo.tsx` | Component | CSR |
| `components/chat/ChatInput.tsx` | Component | CSR |
| `components/charts/ChartPlaceholder.tsx` | Component | SSR |
| `components/ui/Button.tsx` | Component | SSR |
| `providers/ThemeProvider.tsx` | Component | CSR |
| `features/ai/components/AgentFlow.tsx` | Component | SSR |
| `features/stocks/components/StockChart.tsx` | Component | SSR |

