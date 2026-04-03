import { useMemo } from 'react';

import type {
  ContentCategory,
  LanguageOption,
  MenuSelectionState,
} from '../types/menu';

import easternLaoziKo from '../data/passages/eastern/ko/laozi.json';
import westernEpictetusKo from '../data/passages/western/ko/epictetus.json';

import buddhismDhammapadaKo from '../data/passages/religion/buddhism/ko/dhammapada.ko.json';
import buddhismDiamondSutraKo from '../data/passages/religion/buddhism/ko/diamond_sutra.ko.json';
import buddhismHeartSutraKo from '../data/passages/religion/buddhism/ko/heart_sutra_ko.json';
import buddhismMixedSutrasKo from '../data/passages/religion/buddhism/ko/mixed_sutras.ko.json';

import christianityBibleNtPart1Ko from '../data/passages/religion/christianity/ko/bible_nt_part1.json';
import christianityBibleNtPart2Ko from '../data/passages/religion/christianity/ko/bible_nt_part2.json';
import christianityBibleOtPart1Ko from '../data/passages/religion/christianity/ko/bible_ot_part1.json';
import christianityBibleOtPart2Ko from '../data/passages/religion/christianity/ko/bible_ot_part2.json';

import islamQuranPart1Ko from '../data/passages/religion/islam/ko/quran_part1.json';

import {
  adaptPassageFile,
  buildSourceText,
  type PassageFile,
  type PassageMeta,
  type RawPassage,
} from './passageAdapter';

type EmotionKey =
  | 'unknown'
  | 'joy'
  | 'hope'
  | 'anxiety'
  | 'depression'
  | 'sadness';

type PassageRecord = {
  id: string;
  lines: string[];
  category: ContentCategory;
  language: LanguageOption;
  emotionCore?: EmotionKey;
  emotionExtended?: EmotionKey[];
  meta?: PassageMeta;
};

type UsePassageResult = {
  lines: string[];
  sourceText: string;
};

type LibraryEntry = {
  loader: () => unknown;
  category: ContentCategory;
  language: LanguageOption;
};

type LibraryCache = Partial<Record<LanguageOption, PassageRecord[]>>;

const PASSAGE_SOURCES: LibraryEntry[] = [
  {
    loader: () => easternLaoziKo as PassageFile,
    category: 'eastern_philosophy',
    language: 'ko',
  },
  {
    loader: () => westernEpictetusKo as PassageFile,
    category: 'western_philosophy',
    language: 'ko',
  },

  {
    loader: () => buddhismDhammapadaKo as PassageFile,
    category: 'buddhism',
    language: 'ko',
  },
  {
    loader: () => buddhismDiamondSutraKo as PassageFile,
    category: 'buddhism',
    language: 'ko',
  },
  {
    loader: () => buddhismHeartSutraKo as PassageFile,
    category: 'buddhism',
    language: 'ko',
  },
  {
    loader: () => buddhismMixedSutrasKo as PassageFile,
    category: 'buddhism',
    language: 'ko',
  },

  {
    loader: () => christianityBibleNtPart1Ko as PassageFile,
    category: 'christianity',
    language: 'ko',
  },
  {
    loader: () => christianityBibleNtPart2Ko as PassageFile,
    category: 'christianity',
    language: 'ko',
  },
  {
    loader: () => christianityBibleOtPart1Ko as PassageFile,
    category: 'christianity',
    language: 'ko',
  },
  {
    loader: () => christianityBibleOtPart2Ko as PassageFile,
    category: 'christianity',
    language: 'ko',
  },

  {
    loader: () => islamQuranPart1Ko as PassageFile,
    category: 'islam',
    language: 'ko',
  },
];

const LIBRARY_CACHE: LibraryCache = {};

const EMPTY_RESULT: UsePassageResult = {
  lines: [],
  sourceText: '',
};

export function usePassage(
  selections: MenuSelectionState,
  refreshKey: number,
): UsePassageResult {
  return useMemo(() => {
    const safeSelections = normalizeSelections(selections);
    const library = getLibraryForLanguage(safeSelections.language);

    if (!library.length) {
      return EMPTY_RESULT;
    }

    const filtered = filterPassages(library, safeSelections);
    const hasCategorySelection =
      Array.isArray(safeSelections.selectedCategories) &&
      safeSelections.selectedCategories.length > 0;

    const pool = filtered.length
      ? filtered
      : hasCategorySelection
        ? []
        : library;

    const picked = pickPassage(pool, refreshKey);

    if (!picked) {
      return EMPTY_RESULT;
    }

    return {
      lines: picked.lines,
      sourceText: buildSourceText(picked.meta),
    };
  }, [selections, refreshKey]);
}

function getLibraryForLanguage(language: LanguageOption): PassageRecord[] {
  if (LIBRARY_CACHE[language]) {
    return LIBRARY_CACHE[language] as PassageRecord[];
  }

  const entries = PASSAGE_SOURCES.filter((entry) => entry.language === language);
  const library = buildPassageLibrary(entries);
  LIBRARY_CACHE[language] = library;
  return library;
}

function buildPassageLibrary(entries: LibraryEntry[]): PassageRecord[] {
  const records: PassageRecord[] = [];

  entries.forEach(({ loader, category, language }) => {
    const rawFile = loader();
    const file = adaptPassageFile(rawFile);

    if (!file.passages.length) {
      return;
    }

    file.passages.forEach((raw: RawPassage) => {
      if (!raw || typeof raw.id !== 'string') {
        return;
      }

      if (!Array.isArray(raw.lines) || !raw.lines.length) {
        return;
      }

      records.push({
        id: raw.id,
        lines: raw.lines,
        category,
        language,
        emotionCore: isEmotionKey(raw.emotionCore) ? raw.emotionCore : undefined,
        emotionExtended: normalizeEmotionExtended(raw.emotionExtended),
        meta: raw.meta,
      });
    });
  });

  return records;
}

function isEmotionKey(value: unknown): value is EmotionKey {
  return (
    value === 'unknown' ||
    value === 'joy' ||
    value === 'hope' ||
    value === 'anxiety' ||
    value === 'depression' ||
    value === 'sadness'
  );
}

function normalizeSelections(input: MenuSelectionState | null | undefined): MenuSelectionState {
  return {
    emotion: isEmotionKey(input?.emotion) ? input.emotion : 'unknown',
    selectedCategories: Array.isArray(input?.selectedCategories)
      ? input.selectedCategories.filter(Boolean)
      : [],
    language: input?.language ?? 'ko',
    font: input?.font ?? 'basic',
    size: input?.size ?? 'large',
    background: input?.background ?? 'auto',
  };
}

function normalizeEmotionExtended(value: unknown): EmotionKey[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.filter(isEmotionKey);
}

function filterPassages(
  passages: PassageRecord[],
  selections: MenuSelectionState,
): PassageRecord[] {
  if (!passages.length) {
    return [];
  }

  const selectedCategories = Array.isArray(selections.selectedCategories)
    ? selections.selectedCategories
    : [];

  return passages.filter((passage) => {
    const categoryMatch =
      !selectedCategories.length || selectedCategories.includes(passage.category);

    const languageMatch = passage.language === selections.language;

    const emotionMatch =
      selections.emotion === 'unknown' ||
      passage.emotionCore === selections.emotion ||
      passage.emotionExtended?.includes(selections.emotion);

    return categoryMatch && languageMatch && emotionMatch;
  });
}

function pickPassage(passages: PassageRecord[], refreshKey: number): PassageRecord | null {
  if (!passages.length) {
    return null;
  }

  const index = Math.abs(refreshKey) % passages.length;
  return passages[index] ?? passages[0] ?? null;
}