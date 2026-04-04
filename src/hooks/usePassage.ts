import { useMemo } from 'react';

import type {
  ContentCategory,
  LanguageOption,
  MenuSelectionState,
} from '../types/menu';
import type { NormalizedPassage } from '../types/NormalizedPassage';

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

import { adaptPassageFile } from './passageAdapter';

type UsePassageResult = {
  lines: string[];
  sourceText: string;
};

type LibraryEntry = {
  loader: () => unknown;
  category: string;
  domain?: string;
  language: LanguageOption;
};

type LibraryCache = Partial<Record<LanguageOption, NormalizedPassage[]>>;

type CategoryGroupMap = Record<string, NormalizedPassage[]>;

type RoundRobinState = {
  history: NormalizedPassage[];
  nextGroupIndex: number;
  lastPickedByGroup: Record<string, string | null>;
  groupKeys: string[];
  poolSignature: string;
};

const CATEGORY_PRIORITY = [
  'eastern_philosophy',
  'western_philosophy',
  'christianity',
  'buddhism',
  'islam',
];

const roundRobinStates = new Map<string, RoundRobinState>();

const PASSAGE_SOURCES: LibraryEntry[] = [
  {
    loader: () => easternClassicsMixKo,
    category: 'eastern_philosophy',
    domain: 'philosophy',
    language: 'ko',
  },
  {
    loader: () => easternConfuciusKo,
    category: 'eastern_philosophy',
    domain: 'philosophy',
    language: 'ko',
  },
  {
    loader: () => easternEasternMis01Ko,
    category: 'eastern_philosophy',
    domain: 'philosophy',
    language: 'ko',
  },
  {
    loader: () => easternEasternMis02Ko,
    category: 'eastern_philosophy',
    domain: 'philosophy',
    language: 'ko',
  },
  {
    loader: () => easternEasternMis03Ko,
    category: 'eastern_philosophy',
    domain: 'philosophy',
    language: 'ko',
  },
  {
    loader: () => easternLaoziKo,
    category: 'eastern_philosophy',
    domain: 'philosophy',
    language: 'ko',
  },
  {
    loader: () => easternMenciusKo,
    category: 'eastern_philosophy',
    domain: 'philosophy',
    language: 'ko',
  },
  {
    loader: () => easternZhuangziKo,
    category: 'eastern_philosophy',
    domain: 'philosophy',
    language: 'ko',
  },

  {
    loader: () => westernEpictetusKo,
    category: 'western_philosophy',
    domain: 'philosophy',
    language: 'ko',
  },
  {
    loader: () => westernErichFrommKo,
    category: 'western_philosophy',
    domain: 'philosophy',
    language: 'ko',
  },
  {
    loader: () => westernMarcusAureliusKo,
    category: 'western_philosophy',
    domain: 'philosophy',
    language: 'ko',
  },
  {
    loader: () => westernNietzsche01Ko,
    category: 'western_philosophy',
    domain: 'philosophy',
    language: 'ko',
  },
  {
    loader: () => westernNietzsche02Ko,
    category: 'western_philosophy',
    domain: 'philosophy',
    language: 'ko',
  },
  {
    loader: () => westernNietzsche03Ko,
    category: 'western_philosophy',
    domain: 'philosophy',
    language: 'ko',
  },
  {
    loader: () => westernPlatoKo,
    category: 'western_philosophy',
    domain: 'philosophy',
    language: 'ko',
  },
  {
    loader: () => westernSartreFreudKo,
    category: 'western_philosophy',
    domain: 'philosophy',
    language: 'ko',
  },
  {
    loader: () => westernSenecaKo,
    category: 'western_philosophy',
    domain: 'philosophy',
    language: 'ko',
  },
  {
    loader: () => westernWesternMisc01Ko,
    category: 'western_philosophy',
    domain: 'philosophy',
    language: 'ko',
  },

  {
    loader: () => buddhismDhammapadaKo,
    category: 'buddhism',
    domain: 'religion',
    language: 'ko',
  },
  {
    loader: () => buddhismDiamondSutraKo,
    category: 'buddhism',
    domain: 'religion',
    language: 'ko',
  },
  {
    loader: () => buddhismHeartSutraKo,
    category: 'buddhism',
    domain: 'religion',
    language: 'ko',
  },
  {
    loader: () => buddhismMixedSutrasKo,
    category: 'buddhism',
    domain: 'religion',
    language: 'ko',
  },

  {
    loader: () => christianityBibleNtPart1Ko,
    category: 'christianity',
    domain: 'religion',
    language: 'ko',
  },
  {
    loader: () => christianityBibleNtPart2Ko,
    category: 'christianity',
    domain: 'religion',
    language: 'ko',
  },
  {
    loader: () => christianityBibleOtPart1Ko,
    category: 'christianity',
    domain: 'religion',
    language: 'ko',
  },
  {
    loader: () => christianityBibleOtPart2Ko,
    category: 'christianity',
    domain: 'religion',
    language: 'ko',
  },

  {
    loader: () => islamQuranPart1Ko,
    category: 'islam',
    domain: 'religion',
    language: 'ko',
  },
  {
    loader: () => islamQuranPart2Ko,
    category: 'islam',
    domain: 'religion',
    language: 'ko',
  },
  {
    loader: () => islamQuranPart3Ko,
    category: 'islam',
    domain: 'religion',
    language: 'ko',
  },
  {
    loader: () => islamQuranPart4Ko,
    category: 'islam',
    domain: 'religion',
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

    const categoryFilters = deriveCategoryFilters(safeSelections.selectedCategories);
    const filtered = filterPassages(library, safeSelections, categoryFilters);

    if (!filtered.length) {
      return EMPTY_RESULT;
    }

    const groupMap = buildCategoryGroups(filtered);
    const activeGroupKeys = deriveActiveGroupKeys(groupMap, categoryFilters);

    if (!activeGroupKeys.length) {
      return EMPTY_RESULT;
    }

    const stateKey = buildStateKey(
      safeSelections.language,
      safeSelections.emotion,
      categoryFilters,
    );
    const poolSignature = buildPoolSignature(filtered, activeGroupKeys);
    const state = getOrCreateRoundRobinState(stateKey, poolSignature, activeGroupKeys);

    const targetIndex = normalizeRefreshKey(refreshKey);
    const picked = resolvePassageFromState(state, targetIndex, groupMap);

    if (!picked) {
      return EMPTY_RESULT;
    }

    return {
      lines: picked.lines,
      sourceText: picked.sourceText,
    };
  }, [selections, refreshKey]);
}

function getLibraryForLanguage(language: LanguageOption): NormalizedPassage[] {
  if (LIBRARY_CACHE[language]) {
    return LIBRARY_CACHE[language] as NormalizedPassage[];
  }

  const entries = PASSAGE_SOURCES.filter((entry) => entry.language === language);
  const library = buildPassageLibrary(entries);
  LIBRARY_CACHE[language] = library;
  return library;
}

function buildPassageLibrary(entries: LibraryEntry[]): NormalizedPassage[] {
  const records: NormalizedPassage[] = [];

  entries.forEach(({ loader, category, domain, language }) => {
    const rawFile = loader();
    const normalized = adaptPassageFile(rawFile, { category, domain, language });
    records.push(...normalized);
  });

  return records;
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

type EmotionKey = MenuSelectionState['emotion'];

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

function deriveCategoryFilters(selected: ContentCategory[] | undefined): string[] {
  if (!Array.isArray(selected) || !selected.length) {
    return [];
  }

  const mapped = selected
    .map(mapMenuCategoryToTag)
    .filter((value): value is string => Boolean(value));

  return Array.from(new Set(mapped));
}

function mapMenuCategoryToTag(category: ContentCategory): string | null {
  return category ?? null;
}

function filterPassages(
  passages: NormalizedPassage[],
  selections: MenuSelectionState,
  categoryFilters: string[],
): NormalizedPassage[] {
  return passages.filter((passage) => {
    const categoryMatch =
      !categoryFilters.length || categoryFilters.includes(passage.tags.category);

    if (!categoryMatch) {
      return false;
    }

    if (selections.emotion === 'unknown') {
      return true;
    }

    return (
      passage.emotionCore === selections.emotion ||
      passage.emotionExtended.includes(selections.emotion)
    );
  });
}

function buildCategoryGroups(passages: NormalizedPassage[]): CategoryGroupMap {
  return passages.reduce<CategoryGroupMap>((acc, passage) => {
    const key = passage.tags.category;
    if (!acc[key]) {
      acc[key] = [];
    }
    acc[key].push(passage);
    return acc;
  }, {});
}

function deriveActiveGroupKeys(
  groupMap: CategoryGroupMap,
  preferredOrder: string[],
): string[] {
  const availableKeys = Object.keys(groupMap).filter((key) => groupMap[key]?.length);
  if (!availableKeys.length) {
    return [];
  }

  if (preferredOrder.length) {
    const ordered = preferredOrder.filter(
      (key, index) => preferredOrder.indexOf(key) === index && groupMap[key]?.length,
    );
    const leftovers = availableKeys.filter((key) => !ordered.includes(key)).sort();
    return ordered.concat(leftovers);
  }

  const prioritized = CATEGORY_PRIORITY.filter((key) => groupMap[key]?.length);
  const leftovers = availableKeys.filter((key) => !CATEGORY_PRIORITY.includes(key)).sort();
  return prioritized.concat(leftovers);
}

function buildStateKey(
  language: LanguageOption,
  emotion: EmotionKey,
  categories: string[],
): string {
  const categoryKey = categories.length ? categories.join('|') : '*';
  return `${language}::${emotion}::${categoryKey}`;
}

function buildPoolSignature(passages: NormalizedPassage[], groupKeys: string[]): string {
  const ids = passages.map((passage) => passage.id).join('|');
  return `${groupKeys.join('|')}::${ids}`;
}

function getOrCreateRoundRobinState(
  key: string,
  poolSignature: string,
  groupKeys: string[],
): RoundRobinState {
  const existing = roundRobinStates.get(key);

  if (!existing || existing.poolSignature !== poolSignature) {
    const fresh: RoundRobinState = {
      history: [],
      nextGroupIndex: 0,
      lastPickedByGroup: {},
      groupKeys: [...groupKeys],
      poolSignature,
    };
    roundRobinStates.set(key, fresh);
    return fresh;
  }

  existing.groupKeys = [...groupKeys];
  existing.poolSignature = poolSignature;
  return existing;
}

function resolvePassageFromState(
  state: RoundRobinState,
  targetIndex: number,
  groupMap: CategoryGroupMap,
): NormalizedPassage | null {
  if (!state.groupKeys.length) {
    return null;
  }

  while (state.history.length <= targetIndex) {
    const next = generateNextPassage(state, groupMap);
    if (!next) {
      break;
    }
    state.history.push(next);
  }

  return state.history[targetIndex] ?? null;
}

function generateNextPassage(
  state: RoundRobinState,
  groupMap: CategoryGroupMap,
): NormalizedPassage | null {
  const totalGroups = state.groupKeys.length;
  if (!totalGroups) {
    return null;
  }

  for (let attempt = 0; attempt < totalGroups; attempt += 1) {
    const groupIndex = state.nextGroupIndex % totalGroups;
    const groupKey = state.groupKeys[groupIndex];
    state.nextGroupIndex = (state.nextGroupIndex + 1) % totalGroups;

    const group = groupMap[groupKey];
    if (!group || !group.length) {
      continue;
    }

    const lastPickedId = state.lastPickedByGroup[groupKey] ?? null;
    const candidate = pickFromGroup(group, lastPickedId);
    if (!candidate) {
      continue;
    }

    state.lastPickedByGroup[groupKey] = candidate.id;
    return candidate;
  }

  return null;
}

function pickFromGroup(
  group: NormalizedPassage[],
  lastPickedId: string | null,
): NormalizedPassage | null {
  if (!group.length) {
    return null;
  }

  if (group.length === 1) {
    return group[0];
  }

  const pool = group.filter((passage) => passage.id !== lastPickedId);
  const candidates = pool.length ? pool : group;
  const index = Math.floor(Math.random() * candidates.length);
  return candidates[index] ?? null;
}

function normalizeRefreshKey(value: number): number {
  if (!Number.isFinite(value)) {
    return 0;
  }

  return Math.max(0, Math.floor(value));
}
