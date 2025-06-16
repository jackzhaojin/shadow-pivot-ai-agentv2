'use client';
import React from 'react';
import type { FigmaGenState } from '@/lib/utils/figmaGeneration';
import FigmaGenerationBox from './FigmaGenerationBox';

interface Props {
  states: FigmaGenState[];
}

export default function FigmaGenerationGrid({ states }: Props) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      {states.map((s, i) => (
        <FigmaGenerationBox key={i} index={i} state={s} />
      ))}
    </div>
  );
}
