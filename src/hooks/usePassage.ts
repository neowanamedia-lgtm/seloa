import { useMemo } from 'react';

import type {
  ContentCategory,
  LanguageOption,
  MenuSelectionState,
} from '../types/menu';

import easternClassicsMixKo from '../data/passages/eastern/ko/classics_mix.json';
import easternConfuciusKo from '../data/passages/eastern/ko/confucius.json';
import easternEasternMis01Ko from '../data/passages/eastern/ko/EASTERN_MIS 01.json';
import easternEasternMis02Ko from '../data/passages/eastern/ko/EASTERN_MIS 02.json';
import easternEasternMis03Ko from '../data/passages/eastern/ko/EASTERN_MIS 03.json';
import easternLaoziKo from '../data/passages/eastern/ko/laozi.json';
import easternMenciusKo from '../data/passages/eastern/ko/mencius.json';
import easternZhuangziKo from '../data/passages/eastern/ko/zhuangzi.json';

import westernEpictetusKo from '../data/passages/western/ko/epictetus.json';
import westernErichFrommKo from '../data/passages/western/ko/Erich Fromm.json';
import westernMarcusAureliusKo from '../data/passages/western/ko/marcus_aurelius.json';
import westernNietzsche01Ko from '../data/passages/western/ko/nietzsche_01.json';
import westernNietzsche02Ko from '../data/passages/western/ko/nietzsche_02.json';
import westernNietzsche03Ko from '../data/passages/western/ko/nietzsche_03.json';
import westernPlatoKo from '../data/passages/western/ko/Plato.json';
import westernSartreFreudKo from '../data/passages/western/ko/sartre_freud.json';
import westernSenecaKo from '../data/passages/western/ko/seneca.json';
import westernWesternMisc01Ko from '../data/passages/western/ko/western_misc_01.json';

import buddhismDhammapadaKo from '../data/passages/religion/buddhism/ko/dhammapada.ko.json';
import buddhismDiamondSutraKo from '../data/passages/religion/buddhism/ko/diamond_sutra.ko.json';
import buddhismHeartSutraKo from '../data/passages/religion/buddhism/ko/heart_sutra_ko.json';
import buddhismMixedSutrasKo from '../data/passages/religion/buddhism/ko/mixed_sutras.ko.json';

import christianityBibleNtPart1Ko from '../data/passages/religion/christianity/ko/bible_nt_part1.json';
import christianityBibleNtPart2Ko from '../data/passages/religion/christianity/ko/bible_nt_part2.json';
import christianityBibleOtPart1Ko from '../data/passages/religion/christianity/ko/bible_ot_part1.json';
import christianityBibleOtPart2Ko from '../data/passages/religion/christianity/ko/bible_ot_part2.json';

import islamQuranPart1Ko from '../data/passages/religion/islam/ko/quran_part1.json';
import islamQuranPart2Ko from '../data/passages/religion/islam/ko/quran_part2.json';
import islamQuranPart3Ko from '../data/passages/religion/islam/ko/quran_part3.json';
import islamQuranPart4Ko from '../data/passages/religion/islam/ko/quran_part4.json';

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
    loader: () => easternClassicsMixKo as PassageFile,
    category: 'eastern_philosophy',
    language: 'ko',
  },
  {
    loader: () => easternConfuciusKo as PassageFile,
    category: 'eastern_philosophy',
    language: 'ko',
  },
  {
    loader: () => easternEasternMis01Ko as PassageFile,
    category: 'eastern_philosophy',
    language: 'ko',
  },
  {
    loader: () => easternEasternMis02Ko as PassageFile,
    category: 'eastern_philosophy',
    language: 'ko',
  },
  {
    loader: () => easternEasternMis03Ko as PassageFile,
    category: 'eastern_philosophy',
    language: 'ko',
  },
  {
    loader: () => easternLaoziKo as PassageFile,
    category: 'eastern_philosophy',
    language: 'ko',
  },
  {
    loader: () => easternMenciusKo as PassageFile,
    category: 'eastern_philosophy',
    language: 'ko',
  },
  {
    loader: () => easternZhuangziKo as PassageFile,
    category: 'eastern_philosophy',
    language: 'ko',
  },

  {
    loader: () => westernEpictetusKo as PassageFile,
    category: 'western_philosophy',
    language: 'ko',
  },
  {
    loader: () => westernErichFrommKo as PassageFile,
    category: 'western_philosophy',
    language: 'ko',
  },
  {
    loader: () => westernMarcusAureliusKo as PassageFile,
    category: 'western_philosophy',
    language: 'ko',
  },
  {
    loader: () => westernNietzsche01Ko as PassageFile,
    category: 'western_philosophy',
    language: 'ko',
  },
  {
    loader: () => westernNietzsche02Ko as PassageFile,
    category: 'western_philosophy',
    language: 'ko',
  },
  {
    loader: () => westernNietzsche03Ko as PassageFile,
    category: 'western_philosophy',
    language: 'ko',
  },
  {
    loader: () => westernPlatoKo as PassageFile,
    category: 'western_philosophy',
    language: 'ko',
  },
  {
    loader: () => westernSartreFreudKo as PassageFile,
    category: 'western_philosophy',
    language: 'ko',
  },
  {
    loader: () => westernSenecaKo as PassageFile,
    category: 'western_philosophy',
    language: 'ko',
  },
  {
    loader: () => westernWesternMisc01Ko as PassageFile,
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
  {
    loader: () => islamQuranPart2Ko as PassageFile,
    category: 'islam',
    language: 'ko',
  },
  {
    loader: () => islamQuranPart3Ko as PassageFile,
    category: 'islam',
    language: 'ko',
  },
  {
    loader: () => islamQuranPart4Ko as PassageFile,
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