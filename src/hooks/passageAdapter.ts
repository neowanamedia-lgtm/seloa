type EmotionKey =
  | 'unknown'
  | 'joy'
  | 'hope'
  | 'anxiety'
  | 'depression'
  | 'sadness';

export type PassageMeta = {
  author?: string;
  book?: string;
  chapter?: string | number;
  verse?: string | number;
  tradition?: string;
  source?: string;
  reference?: string;
  sourceDisplay?: string;
  referenceDisplay?: string;
  bookDisplay?: string;
  chapterDisplay?: string;
};

export type RawPassage = {
  id: string;
  lines?: string[];
  emotionCore?: EmotionKey;
  emotionExtended?: EmotionKey[];
  meta?: PassageMeta;
};

export type PassageFile = {
  passages: RawPassage[];
};

type UnknownRecord = Record<string, unknown>;

const isRecord = (value: unknown): value is UnknownRecord =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const toTrimmedString = (value: unknown): string => {
  if (typeof value === 'string') {
    return value.trim();
  }

  if (typeof value === 'number') {
    return String(value).trim();
  }

  return '';
};

const normalizeLines = (lines: unknown): string[] => {
  if (!Array.isArray(lines)) {
    return [];
  }

  return lines
    .filter((line): line is string => typeof line === 'string')
    .map((line) => line.trim())
    .filter(Boolean);
};

const isEmotionKey = (value: unknown): value is EmotionKey =>
  value === 'unknown' ||
  value === 'joy' ||
  value === 'hope' ||
  value === 'anxiety' ||
  value === 'depression' ||
  value === 'sadness';

const normalizeEmotionExtended = (value: unknown): EmotionKey[] => {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.filter(isEmotionKey);
};

const normalizeMeta = (meta: unknown): PassageMeta | undefined => {
  if (!isRecord(meta)) {
    return undefined;
  }

  const author = toTrimmedString(meta.author);
  const book = toTrimmedString(meta.book) || toTrimmedString(meta.source);
  const chapter = toTrimmedString(meta.chapter) || toTrimmedString(meta.reference);
  const source = toTrimmedString(meta.source) || book;
  const reference = toTrimmedString(meta.reference) || chapter;

  const bookDisplay =
    toTrimmedString(meta.bookDisplay) ||
    toTrimmedString(meta.sourceDisplay) ||
    book;

  const chapterDisplay =
    toTrimmedString(meta.chapterDisplay) ||
    toTrimmedString(meta.referenceDisplay) ||
    chapter;

  const sourceDisplay =
    toTrimmedString(meta.sourceDisplay) ||
    toTrimmedString(meta.bookDisplay) ||
    source;

  const referenceDisplay =
    toTrimmedString(meta.referenceDisplay) ||
    toTrimmedString(meta.chapterDisplay) ||
    reference;

  const verseRaw = meta.verse;
  const verse =
    typeof verseRaw === 'string' || typeof verseRaw === 'number'
      ? String(verseRaw).trim()
      : '';

  const tradition = toTrimmedString(meta.tradition);

  const normalized: PassageMeta = {};

  if (author) normalized.author = author;
  if (book) normalized.book = book;
  if (chapter) normalized.chapter = chapter;
  if (verse) normalized.verse = verse;
  if (tradition) normalized.tradition = tradition;
  if (source) normalized.source = source;
  if (reference) normalized.reference = reference;
  if (sourceDisplay) normalized.sourceDisplay = sourceDisplay;
  if (referenceDisplay) normalized.referenceDisplay = referenceDisplay;
  if (bookDisplay) normalized.bookDisplay = bookDisplay;
  if (chapterDisplay) normalized.chapterDisplay = chapterDisplay;

  return Object.keys(normalized).length ? normalized : undefined;
};

const normalizePassage = (raw: unknown): RawPassage | null => {
  if (!isRecord(raw)) {
    return null;
  }

  const id = toTrimmedString(raw.id);
  if (!id) {
    return null;
  }

  const lines = normalizeLines(raw.lines);
  if (!lines.length) {
    return null;
  }

  const emotionCore = isEmotionKey(raw.emotionCore) ? raw.emotionCore : undefined;

  return {
    id,
    lines,
    emotionCore,
    emotionExtended: normalizeEmotionExtended(raw.emotionExtended),
    meta: normalizeMeta(raw.meta),
  };
};

export function adaptPassageFile(input: unknown): PassageFile {
  const rawPassages = Array.isArray(input)
    ? input
    : isRecord(input) && Array.isArray(input.passages)
      ? input.passages
      : [];

  const passages = rawPassages
    .map(normalizePassage)
    .filter((item): item is RawPassage => item !== null);

  return { passages };
}

export function buildSourceText(meta: PassageMeta | undefined): string {
  if (!meta) {
    return '';
  }

  const displayBook =
    typeof meta.bookDisplay === 'string' ? meta.bookDisplay.trim() : '';
  const displayChapter =
    typeof meta.chapterDisplay === 'string' ? meta.chapterDisplay.trim() : '';
  const displaySource =
    typeof meta.sourceDisplay === 'string' ? meta.sourceDisplay.trim() : '';
  const displayReference =
    typeof meta.referenceDisplay === 'string' ? meta.referenceDisplay.trim() : '';

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

  const parts: string[] = [];

  if (displaySource) {
    parts.push(displaySource);
  } else if (tradition) {
    parts.push(tradition);
  }

  if (displayBook) {
    parts.push(displayBook);
  } else if (book) {
    parts.push(book);
  } else if (source) {
    parts.push(source);
  }

  if (displayChapter) {
    parts.push(displayChapter);
  } else if (displayReference) {
    parts.push(displayReference);
  } else if (chapter && verse) {
    parts.push(`${chapter}:${verse}`);
  } else if (chapter) {
    parts.push(chapter);
  } else if (verse) {
    parts.push(verse);
  } else if (reference) {
    parts.push(reference);
  }

  if (!displayBook && !book && !source && author) {
    parts.unshift(author);
  }

  return parts.filter(Boolean).join(' · ');
}