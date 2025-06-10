// Centralized Test Hub Page
import Link from 'next/link';

export default function TestHubPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8">
      <h1 className="text-3xl font-bold mb-6">Test Hub</h1>
      <p className="mb-4 text-gray-600">Access all integration and validation tests for the application here.</p>
      <ul className="space-y-4">
        <li>
          <Link href="/test-azure" className="text-blue-600 hover:underline">
            Azure Integration Tests
          </Link>
        </li>
        {/* Add more test links here as needed */}
      </ul>
      <div className="mt-8 text-xs text-gray-400">
        If you are redirected to the homepage, ensure that <code>/test-azure</code> exists and is not protected by route guards or middleware.
      </div>
    </div>
  );
}
