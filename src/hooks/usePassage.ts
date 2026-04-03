import { useMemo } from 'react';

import type {
  ContentCategory,
  LanguageOption,
  MenuSelectionState,
} from '../types/menu';

import easternLaoziKo from '../data/passages/eastern/ko/laozi.json';





type EmotionKey =
  | 'unknown'
  | 'joy'
  | 'hope'
  | 'anxiety'
  | 'depression'
  | 'sadness';

type PassageMeta = {
  author?: string;
  book?: string;
  chapter?: string | number;
  verse?: string | number;
  tradition?: string;
  source?: string;
  reference?: string;
};

type RawPassage = {
  id: string;
  lines?: string[];
  emotionCore?: EmotionKey;
  emotionExtended?: EmotionKey[];
  meta?: PassageMeta;
};

type PassageFile = {
  passages?: RawPassage[];
};

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
  loader: () => PassageFile | undefined;
  category: ContentCategory;
  language: LanguageOption;
};

type LibraryCache = Partial<Record<LanguageOption, PassageRecord[]>>;

const PASSAGE_SOURCES: LibraryEntry[] = [
  { loader: () => easternLaoziKo as PassageFile, category: 'eastern_philosophy', language: 'ko' },
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
    const pool = filtered.length ? filtered : library;
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
    const file = loader();

    if (!file || !Array.isArray(file.passages)) {
      return;
    }

    file.passages.forEach((raw) => {
      if (!raw || typeof raw.id !== 'string') {
        return;
      }

      const lines = normalizeLines(raw.lines);
      if (!lines.length) {
        return;
      }

      records.push({
        id: raw.id,
        lines,
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

function normalizeLines(lines: unknown): string[] {
  if (!Array.isArray(lines)) {
    return [];
  }

  return lines
    .filter((line): line is string => typeof line === 'string')
    .map((line) => line.trim())
    .filter(Boolean);
}

function buildSourceText(meta: PassageMeta | undefined): string {
  if (!meta) {
    return '';
  }

  const parts: string[] = [];

  const author = typeof meta.author === 'string' ? meta.author.trim() : '';
  const book = typeof meta.book === 'string' ? meta.book.trim() : '';
  const chapter =
    typeof meta.chapter === 'string' || typeof meta.chapter === 'number'
      ? String(meta.chapter).trim()
      : '';
  const verse =
    typeof meta.verse === 'string' || typeof meta.verse === 'number'
      ? String(meta.verse).trim()
      : '';
  const tradition = typeof meta.tradition === 'string' ? meta.tradition.trim() : '';
  const source = typeof meta.source === 'string' ? meta.source.trim() : '';
  const reference = typeof meta.reference === 'string' ? meta.reference.trim() : '';

  if (author) parts.push(author);
  if (book) parts.push(book);

  if (chapter && verse) {
    parts.push(`${chapter}:${verse}`);
  } else if (chapter) {
    parts.push(chapter);
  } else if (verse) {
    parts.push(verse);
  }

  if (!author && tradition) {
    parts.push(tradition);
  }

  if (!book && source) {
    parts.push(source);
  }

  if (reference) {
    parts.push(reference);
  }

  return parts.filter(Boolean).join(' · ');
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

