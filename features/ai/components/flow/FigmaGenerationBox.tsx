'use client';
import React from 'react';
import type { FigmaGenState } from '@/lib/utils/figmaGeneration';

interface Props {
  index: number;
  state: FigmaGenState;
}

export default function FigmaGenerationBox({ index, state }: Props) {
  const barColor = state.status === 'error'
    ? 'bg-red-500'
    : state.status === 'completed'
    ? 'bg-emerald-500'
    : 'bg-blue-500';
  return (
    <div className="p-4 border rounded-xl bg-white shadow flex flex-col">
      <h4 className="font-semibold mb-2">Spec {index + 1}</h4>
      <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
        <div
          className={`${barColor} h-full transition-all duration-300`} 
          style={{ width: `${state.progress}%` }}
        />
      </div>
      <p className="text-sm mt-2 text-gray-700">
        {state.status === 'waiting' && 'Waiting...'}
        {state.status === 'processing' && `Generating (${state.progress}%)...`}
        {state.status === 'completed' && 'Completed'}
        {state.status === 'error' && 'Error'}
      </p>
    </div>
  );
}
