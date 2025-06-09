import Image from "next/image";
import { checkAzureHealth, validateAzureEnvironment } from "@/lib/azureClient";
import { ClientSideDemo } from "@/components/azure/ClientSideDemo";

// Server-side function to test Azure connections
async function getAzureStatus() {
  try {
    // Validate environment first
    const envValidation = validateAzureEnvironment();
    if (!envValidation.isValid) {
      return {
        storage: 'Configuration Error',
        ai: 'Configuration Error',
        error: `Missing environment variables: ${envValidation.missing.join(', ')}`,
        timestamp: new Date().toISOString()
      };
    }

    // Check Azure service health
    const health = await checkAzureHealth();
    
    return {
      storage: health.storage.status === 'ok' ? 'Connected' : `Error: ${health.storage.message}`,
      ai: health.ai.status === 'ok' ? `Connected - ${health.ai.message}` : `Error: ${health.ai.message}`,
      timestamp: new Date().toISOString(),
      environment: envValidation.config
    };
  } catch (error) {
    return {
      storage: 'Error',
      ai: 'Error',
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    };
  }
}

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export default async function Home() {
  // Server-side Azure integration test
  const azureStatus = await getAzureStatus();
  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <main className="flex flex-col gap-[32px] row-start-2 items-center sm:items-start">
        <Image
          className="dark:invert"
          src="/next.svg"
          alt="Next.js logo"
          width={180}
          height={38}
          priority
        />
        
        {/* Azure SSR Integration Status */}
        <div className="w-full max-w-lg p-6 border rounded-lg bg-gray-50 dark:bg-gray-900">
          <h2 className="text-lg font-semibold mb-4">Azure SSR Integration Status</h2>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span>Storage:</span>
              <span className={azureStatus.storage.includes('Connected') ? 'text-green-600' : 'text-red-600'}>
                {azureStatus.storage}
              </span>
            </div>
            <div className="flex justify-between">
              <span>AI Service:</span>
              <span className={azureStatus.ai.includes('Connected') ? 'text-green-600' : 'text-red-600'}>
                {azureStatus.ai}
              </span>
            </div>
            {azureStatus.environment && (
              <div className="mt-3 pt-3 border-t text-xs text-gray-600 dark:text-gray-400">
                <div><strong>Storage Account:</strong> {azureStatus.environment.storageAccount}</div>
                <div><strong>AI Endpoint:</strong> {azureStatus.environment.aiEndpoint}</div>
              </div>
            )}
            <div className="text-xs text-gray-500 mt-2">
              Last checked: {new Date(azureStatus.timestamp).toLocaleString()}
            </div>
            {azureStatus.error && (
              <div className="text-xs text-red-600 mt-2">
                Error: {azureStatus.error}
              </div>
            )}
          </div>
        </div>

        {/* Client-Side Demo Component */}
        <ClientSideDemo />

        <ol className="list-inside list-decimal text-sm/6 text-center sm:text-left font-[family-name:var(--font-geist-mono)]">
          <li className="mb-2 tracking-[-.01em]">
            Get started by editing{" "}
            <code className="bg-black/[.05] dark:bg-white/[.06] px-1 py-0.5 rounded font-[family-name:var(--font-geist-mono)] font-semibold">
              app/page.tsx
            </code>
            .
          </li>
          <li className="tracking-[-.01em]">
            Save and see your changes instantly.
          </li>
        </ol>

        <div className="flex gap-4 items-center flex-col sm:flex-row">
          <a
            className="rounded-full border border-solid border-transparent transition-colors flex items-center justify-center bg-foreground text-background gap-2 hover:bg-[#383838] dark:hover:bg-[#ccc] font-medium text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5 sm:w-auto"
            href="https://vercel.com/new?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Image
              className="dark:invert"
              src="/vercel.svg"
              alt="Vercel logomark"
              width={20}
              height={20}
            />
            Deploy now
          </a>
          <a
            className="rounded-full border border-solid border-black/[.08] dark:border-white/[.145] transition-colors flex items-center justify-center hover:bg-[#f2f2f2] dark:hover:bg-[#1a1a1a] hover:border-transparent font-medium text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5 w-full sm:w-auto md:w-[158px]"
            href="https://nextjs.org/docs?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
            target="_blank"
            rel="noopener noreferrer"
          >
            Read our docs
          </a>
        </div>
      </main>
      <footer className="row-start-3 flex gap-[24px] flex-wrap items-center justify-center">
        <a
          className="flex items-center gap-2 hover:underline hover:underline-offset-4"
          href="https://nextjs.org/learn?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Image
            aria-hidden
            src="/file.svg"
            alt="File icon"
            width={16}
            height={16}
          />
          Learn
        </a>
        <a
          className="flex items-center gap-2 hover:underline hover:underline-offset-4"
          href="https://vercel.com/templates?framework=next.js&utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Image
            aria-hidden
            src="/window.svg"
            alt="Window icon"
            width={16}
            height={16}
          />
          Examples
        </a>
        <a
          className="flex items-center gap-2 hover:underline hover:underline-offset-4"
          href="https://nextjs.org?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Image
            aria-hidden
            src="/globe.svg"
            alt="Globe icon"
            width={16}
            height={16}
          />
          Go to nextjs.org →
        </a>
      </footer>
    </div>
  );
}
