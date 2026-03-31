import { useMemo } from 'react';

export type Passage = {
  lines: string[];
};

const SAMPLE_PASSAGE: Passage = {
  lines: [
    'In quiet mornings, the city feels like a held breath.',
    'Every streetlamp hums a note of patient light.',
    'We walk forward, gathering fragments of hope.',
  ],
};

export const usePassage = (): Passage => {
  return useMemo(() => SAMPLE_PASSAGE, []);
};