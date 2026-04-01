import { useMemo } from 'react';
import type { MenuSelections } from '../components/MenuSlideSheet';

import classicsMix from '../data/passages/eastern/ko/classics_mix.json';
import confucius from '../data/passages/eastern/ko/confucius.json';
import easternMis01 from '../data/passages/eastern/ko/EASTERN_MIS 01.json';
import easternMis02 from '../data/passages/eastern/ko/EASTERN_MIS 02.json';
import easternMis03 from '../data/passages/eastern/ko/EASTERN_MIS 03.json';
import laozi from '../data/passages/eastern/ko/laozi.json';
import mencius from '../data/passages/eastern/ko/mencius.json';
import zhuangzi from '../data/passages/eastern/ko/zhuangzi.json';

import epictetus from '../data/passages/western/ko/epictetus.json';
import erichFromm from '../data/passages/western/ko/Erich Fromm.json';
import marcusAurelius from '../data/passages/western/ko/marcus_aurelius.json';
import nietzsche01 from '../data/passages/western/ko/nietzsche_01.json';
import nietzsche02 from '../data/passages/western/ko/nietzsche_02.json';
import nietzsche03 from '../data/passages/western/ko/nietzsche_03.json';
import plato from '../data/passages/western/ko/Plato.json';
import sartreFreud from '../data/passages/western/ko/sartre_freud.json';
import seneca from '../data/passages/western/ko/seneca.json';
import westernMisc01 from '../data/passages/western/ko/western_misc_01.json';

import buddhismDhammapada from '../data/passages/religion/buddhism/ko/dhammapada.ko.json';
import buddhismDiamond from '../data/passages/religion/buddhism/ko/diamond_sutra.ko.json';
import buddhismHeart from '../data/passages/religion/buddhism/ko/heart_sutra_ko.json';
import buddhismMixed from '../data/passages/religion/buddhism/ko/mixed_sutras.ko.json';

import christianNtPart1 from '../data/passages/religion/christianity/ko/bible_nt_part1.json';
import christianOtPart1 from '../data/passages/religion/christianity/ko/bible_ot_part1.json';
import christianOtPart2 from '../data/passages/religion/christianity/ko/bible_ot_part2.json';

import quranPart1 from '../data/passages/religion/islam/ko/quran_part1.json';
import quranPart2 from '../data/passages/religion/islam/ko/quran_part2.json';
import quranPart3 from '../data/passages/religion/islam/ko/quran_part3.json';
import quranPart4 from '../data/passages/religion/islam/ko/quran_part4.json';

const FALLBACK_PASSAGE = 'Seloa is preparing a passage for you.';
const FALLBACK_RESULT = { lines: [FALLBACK_PASSAGE], sourceText: '' };

type EmotionValue = 'joy' | 'hope' | 'anxiety' | 'depression' | 'sadness';
type PhilosophyKind = 'eastern' | 'western';
type ReligionKind = 'buddhism' | 'christianity' | 'islam';

type RawMeta = {
  tradition?: string;
  philosophy?: string;
  religion?: string;
  author?: string;
  authorDisplay?: string;
  source?: string;
  sourceDisplay?: string;
  book?: string;
  bookDisplay?: string;
  chapter?: string;
  chapterDisplay?: string;
  section?: string;
  sectionDisplay?: string;
  part?: string;
  partDisplay?: string;
  reference?: string;
  referenceDisplay?: string;
};

type RawPassage = {
  id: string;
  meta: RawMeta;
  emotionCore: EmotionValue;
  emotionExtended?: string[];
  lines: string[];
};

type NormalizedPassage = RawPassage & {
  category: 'philosophy' | 'religion';
  philosophyKind?: PhilosophyKind;
  religionKind?: ReligionKind;
};

type UsePassageOptions = Pick<MenuSelections, 'language' | 'emotion' | 'philosophy' | 'religion'> & {
  refreshKey: number;
};

export type PassageResult = {
  lines: string[];
  sourceText: string;
};

const RELIGION_DISPLAY: Record<ReligionKind, string> = {
  buddhism: '불교',
  christianity: '기독교',
  islam: '이슬람',
};

const asArray = (data: any): RawPassage[] => {
  if (!data) {
    return [];
  }
  if (Array.isArray(data)) {
    return data as RawPassage[];
  }
  if (Array.isArray((data as { passages?: RawPassage[] }).passages)) {
    return (data as { passages: RawPassage[] }).passages;
  }
  return [];
};

const collectPassages = (
  data: any,
  info: { category: 'philosophy' | 'religion'; philosophyKind?: PhilosophyKind; religionKind?: ReligionKind },
): NormalizedPassage[] => {
  return asArray(data).map((entry) => ({
    ...entry,
    emotionExtended: entry.emotionExtended ?? [],
    category: info.category,
    philosophyKind: info.philosophyKind,
    religionKind: info.religionKind,
  }));
};

const KO_PASSAGES: NormalizedPassage[] = [
  ...collectPassages(classicsMix, { category: 'philosophy', philosophyKind: 'eastern' }),
  ...collectPassages(confucius, { category: 'philosophy', philosophyKind: 'eastern' }),
  ...collectPassages(easternMis01, { category: 'philosophy', philosophyKind: 'eastern' }),
  ...collectPassages(easternMis02, { category: 'philosophy', philosophyKind: 'eastern' }),
  ...collectPassages(easternMis03, { category: 'philosophy', philosophyKind: 'eastern' }),
  ...collectPassages(laozi, { category: 'philosophy', philosophyKind: 'eastern' }),
  ...collectPassages(mencius, { category: 'philosophy', philosophyKind: 'eastern' }),
  ...collectPassages(zhuangzi, { category: 'philosophy', philosophyKind: 'eastern' }),
  ...collectPassages(epictetus, { category: 'philosophy', philosophyKind: 'western' }),
  ...collectPassages(erichFromm, { category: 'philosophy', philosophyKind: 'western' }),
  ...collectPassages(marcusAurelius, { category: 'philosophy', philosophyKind: 'western' }),
  ...collectPassages(nietzsche01, { category: 'philosophy', philosophyKind: 'western' }),
  ...collectPassages(nietzsche02, { category: 'philosophy', philosophyKind: 'western' }),
  ...collectPassages(nietzsche03, { category: 'philosophy', philosophyKind: 'western' }),
  ...collectPassages(plato, { category: 'philosophy', philosophyKind: 'western' }),
  ...collectPassages(sartreFreud, { category: 'philosophy', philosophyKind: 'western' }),
  ...collectPassages(seneca, { category: 'philosophy', philosophyKind: 'western' }),
  ...collectPassages(westernMisc01, { category: 'philosophy', philosophyKind: 'western' }),
  ...collectPassages(buddhismDhammapada, { category: 'religion', religionKind: 'buddhism' }),
  ...collectPassages(buddhismDiamond, { category: 'religion', religionKind: 'buddhism' }),
  ...collectPassages(buddhismHeart, { category: 'religion', religionKind: 'buddhism' }),
  ...collectPassages(buddhismMixed, { category: 'religion', religionKind: 'buddhism' }),
  ...collectPassages(christianNtPart1, { category: 'religion', religionKind: 'christianity' }),
  ...collectPassages(christianOtPart1, { category: 'religion', religionKind: 'christianity' }),
  ...collectPassages(christianOtPart2, { category: 'religion', religionKind: 'christianity' }),
  ...collectPassages(quranPart1, { category: 'religion', religionKind: 'islam' }),
  ...collectPassages(quranPart2, { category: 'religion', religionKind: 'islam' }),
  ...collectPassages(quranPart3, { category: 'religion', religionKind: 'islam' }),
  ...collectPassages(quranPart4, { category: 'religion', religionKind: 'islam' }),
];

const pickRandom = <T,>(list: T[]): T | undefined => {
  if (!list.length) {
    return undefined;
  }
  const index = Math.floor(Math.random() * list.length);
  return list[index];
};

const sanitizeReference = (book: string, reference: string): string => {
  if (!book || !reference) {
    return reference;
  }
  const normalizedBook = book.trim();
  const normalizedRef = reference.trim();
  if (normalizedRef.toLowerCase().startsWith(normalizedBook.toLowerCase())) {
    return normalizedRef.slice(normalizedBook.length).trimStart();
  }
  return normalizedRef;
};

const formatSource = (passage: NormalizedPassage): string => {
  const meta = passage.meta ?? {};
  if (passage.category === 'religion') {
    const religionLabel = passage.religionKind
      ? RELIGION_DISPLAY[passage.religionKind]
      : meta.sourceDisplay || meta.religion || '';
    const book = meta.bookDisplay || meta.book || meta.sourceDisplay || meta.source || '';
    const reference = meta.referenceDisplay || meta.reference || '';
    const refinedReference = sanitizeReference(book, reference);

    let text = religionLabel || '';
    if (book) {
      if (refinedReference) {
        text = text ? `${text}, ${book} ${refinedReference}` : `${book} ${refinedReference}`;
      } else {
        text = text ? `${text}, ${book}` : book;
      }
    } else if (refinedReference) {
      text = text ? `${text}, ${refinedReference}` : refinedReference;
    }

    return text.trim();
  }

  const author = meta.authorDisplay || meta.author || '';
  const book = meta.bookDisplay || meta.book || meta.sourceDisplay || meta.source || '';
  const detail =
    meta.chapterDisplay ||
    meta.sectionDisplay ||
    meta.partDisplay ||
    meta.chapter ||
    meta.section ||
    meta.part ||
    '';

  let text = '';
  if (author) {
    text = author;
    if (book && book !== author) {
      text += `, ${book}`;
    }
  } else if (book) {
    text = book;
  }
  if (detail) {
    text += text ? `〈${detail}〉` : `〈${detail}〉`;
  }
  return text.trim();
};

const filterPassages = (
  passages: NormalizedPassage[],
  options: UsePassageOptions,
): NormalizedPassage[] => {
  const { emotion, philosophy, religion } = options;
  const wantsPhilosophy = philosophy.length > 0;
  const wantsReligion = religion.length > 0;
  const philosophySet = new Set(philosophy);
  const religionSet = new Set(religion);

  return passages.filter((passage) => {
    if (emotion !== 'none' && passage.emotionCore !== emotion) {
      return false;
    }

    if (!wantsPhilosophy && !wantsReligion) {
      return true;
    }

    if (wantsPhilosophy && wantsReligion) {
      const matchesPhilosophy =
        passage.category === 'philosophy' &&
        !!passage.philosophyKind &&
        philosophySet.has(passage.philosophyKind);
      const matchesReligion =
        passage.category === 'religion' &&
        !!passage.religionKind &&
        religionSet.has(passage.religionKind);
      return matchesPhilosophy || matchesReligion;
    }

    if (wantsPhilosophy) {
      return (
        passage.category === 'philosophy' &&
        !!passage.philosophyKind &&
        philosophySet.has(passage.philosophyKind)
      );
    }

    return (
      passage.category === 'religion' &&
      !!passage.religionKind &&
      religionSet.has(passage.religionKind)
    );
  });
};

export const usePassage = ({ language, emotion, philosophy, religion, refreshKey }: UsePassageOptions): PassageResult => {
  return useMemo(() => {
    if (language !== 'ko') {
      return FALLBACK_RESULT;
    }

    const filtered = filterPassages(KO_PASSAGES, { language, emotion, philosophy, religion, refreshKey });
    const sourcePool = filtered.length > 0 ? filtered : KO_PASSAGES;
    const chosen = pickRandom(sourcePool);

    if (!chosen) {
      return FALLBACK_RESULT;
    }

    return {
      lines: chosen.lines,
      sourceText: formatSource(chosen),
    };
  }, [language, emotion, philosophy, religion, refreshKey]);
};
