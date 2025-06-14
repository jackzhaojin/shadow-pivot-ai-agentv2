'use client';
import React from 'react';

export default function ErrorHandler({ errors }: { errors: string[] }) {
  if (errors.length === 0) return null;
  return (
    <div className="bg-red-50 border border-red-200 rounded-2xl p-4 mb-8">
      <h3 className="text-red-900 font-semibold mb-2">Errors</h3>
      <ul className="list-disc list-inside text-red-700 text-sm">
        {errors.map((e, idx) => (
          <li key={idx}>{e}</li>
        ))}
      </ul>
    </div>
  );
}
