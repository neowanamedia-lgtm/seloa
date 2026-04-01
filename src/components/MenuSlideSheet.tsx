import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Animated,
  ImageBackground,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';

export type MenuSlideSheetProps = {
  visible: boolean;
  onClose: () => void;
  onApply: (options: MenuSelections) => void;
};

const SLIDE_DURATION = 420;
const FADE_DURATION = 320;

const LANGUAGE_ORDER = ['ko', 'en', 'ja', 'zh', 'es', 'ar'] as const;
const EMOTION_ORDER = ['none', 'joy', 'hope', 'anxiety', 'depression', 'sadness'] as const;
const PHILOSOPHY_ORDER = ['all', 'eastern', 'western'] as const;
const RELIGION_ORDER = ['none', 'christianity', 'buddhism', 'islam'] as const;
const FONT_ORDER = ['default', 'soft', 'handwriting'] as const;
const BACKGROUND_ORDER = ['auto', 'fixed'] as const;

type LanguageValue = typeof LANGUAGE_ORDER[number];
type EmotionValue = 'joy' | 'hope' | 'anxiety' | 'depression' | 'sadness' | 'none';
type PhilosophyValue = 'eastern' | 'western';
type ReligionValue = 'christianity' | 'buddhism' | 'islam';
type FontValue = 'default' | 'soft' | 'handwriting';
type BackgroundValue = 'auto' | 'fixed';

export type MenuSelections = {
  language: LanguageValue;
  emotion: EmotionValue;
  philosophy: PhilosophyValue[];
  religion: ReligionValue[];
  font: FontValue;
  backgroundMode: BackgroundValue;
};

type LabelMap<T extends string> = Record<T, Record<LanguageValue, string>>;

const LOCALE_COPY: Record<LanguageValue, { tagline: string }> = {
  ko: { tagline: '지금, 나에게 맞는 문장을 만나는 공간' },
  en: { tagline: 'A space where you meet the right passage for you now' },
  ja: { tagline: 'いまの自分にふさわしい文章と出会う場所' },
  zh: { tagline: '此刻遇见适合自己的句子' },
  es: { tagline: 'Un espacio para encontrar la frase adecuada para ti ahora' },
  ar: { tagline: 'مساحة للقاء المقطع المناسب لك الآن' },
};

const CTA_LABELS: Record<LanguageValue, string> = {
  ko: '문장 보기',
  en: 'View Passage',
  ja: '文章を見る',
  zh: '文章查看',
  es: 'Ver texto',
  ar: 'عرض النص',
};

const SECTION_LABELS: Record<
  LanguageValue,
  Record<'emotion' | 'philosophy' | 'religion' | 'language' | 'font' | 'background', string>
> = {
  ko: { emotion: '감정', philosophy: '철학', religion: '종교', language: '언어', font: '서체', background: '배경' },
  en: { emotion: 'Emotion', philosophy: 'Philosophy', religion: 'Religion', language: 'Language', font: 'Font', background: 'Background' },
  ja: { emotion: '感情', philosophy: '哲学', religion: '宗教', language: '言語', font: 'フォント', background: '背景' },
  zh: { emotion: '情绪', philosophy: '哲学', religion: '宗教', language: '语言', font: '字体', background: '背景' },
  es: { emotion: 'Emoción', philosophy: 'Filosofía', religion: 'Religión', language: 'Idioma', font: 'Tipografía', background: 'Fondo' },
  ar: { emotion: 'الشعور', philosophy: 'الفلسفة', religion: 'الديانة', language: 'اللغة', font: 'الخط', background: 'الخلفية' },
};

const EMOTION_LABELS: LabelMap<EmotionValue> = {
  joy: { ko: '기쁨', en: 'Joy', ja: '喜び', zh: '喜悦', es: 'Alegría', ar: 'فرح' },
  hope: { ko: '희망', en: 'Hope', ja: '希望', zh: '希望', es: 'Esperanza', ar: 'أمل' },
  anxiety: { ko: '불안', en: 'Anxiety', ja: '不安', zh: '焦虑', es: 'Ansiedad', ar: 'قلق' },
  depression: { ko: '우울', en: 'Depression', ja: '抑うつ', zh: '抑郁', es: 'Depresión', ar: 'اكتئاب' },
  sadness: { ko: '슬픔', en: 'Sadness', ja: '悲しみ', zh: '悲伤', es: 'Tristeza', ar: 'حزن' },
  none: { ko: '알 수 없음', en: 'Unknown', ja: '未知', zh: '未知', es: 'Aleatorio', ar: 'غير معروف' },
};

const PHILOSOPHY_LABELS: LabelMap<'all' | PhilosophyValue> = {
  all: { ko: '전체', en: 'All', ja: 'すべて', zh: '全部', es: 'Todos', ar: 'الكل' },
  eastern: { ko: '동양', en: 'Eastern', ja: '東洋', zh: '东方', es: 'Oriental', ar: 'شرقية' },
  western: { ko: '서양', en: 'Western', ja: '西洋', zh: '西方', es: 'Occidental', ar: 'غربية' },
};

const RELIGION_LABELS: LabelMap<'none' | ReligionValue> = {
  none: { ko: '선택 안함', en: 'None', ja: '選択しない', zh: '不选择', es: 'Ninguna', ar: 'بلا اختيار' },
  christianity: { ko: '기독교', en: 'Christianity', ja: 'キリスト教', zh: '基督教', es: 'Cristianismo', ar: 'المسيحية' },
  buddhism: { ko: '불교', en: 'Buddhism', ja: '仏教', zh: '佛教', es: 'Budismo', ar: 'البوذية' },
  islam: { ko: '이슬람', en: 'Islam', ja: 'イスラム', zh: '伊斯兰', es: 'Islam', ar: 'الإسلام' },
};

const LANGUAGE_NATIVE_LABELS: Record<LanguageValue, string> = {
  ko: '한국어',
  en: 'English',
  ja: '日本語',
  zh: '中文',
  es: 'Español',
  ar: 'العربية',
};

const FONT_LABELS: LabelMap<FontValue> = {
  default: { ko: '기본', en: 'Default', ja: '標準', zh: '默认', es: 'Predeterm.', ar: 'افتراضي' },
  soft: { ko: '부드러운', en: 'Soft', ja: 'やわらかい', zh: '柔和', es: 'Suave', ar: 'ناعم' },
  handwriting: { ko: '필기체', en: 'Handwriting', ja: '手書き', zh: '手写', es: 'Manuscr.', ar: 'مخطوطة' },
};

const BACKGROUND_LABELS: LabelMap<BackgroundValue> = {
  auto: { ko: '자동', en: 'Auto', ja: '自動', zh: '自动', es: 'Automático', ar: 'تلقائي' },
  fixed: { ko: '고정', en: 'Fixed', ja: '固定', zh: '固定', es: 'Fijo', ar: 'ثابت' },
};

const MENU_BACKGROUNDS = [
  require('../../assets/backgrounds/portrait/bg01.jpg'),
  require('../../assets/backgrounds/portrait/bg02.jpg'),
  require('../../assets/backgrounds/portrait/bg03.jpg'),
  require('../../assets/backgrounds/portrait/bg04.jpg'),
  require('../../assets/backgrounds/portrait/bg05.jpg'),
  require('../../assets/backgrounds/portrait/bg06.jpg'),
  require('../../assets/backgrounds/portrait/bg07.jpg'),
  require('../../assets/backgrounds/portrait/bg08.jpg'),
  require('../../assets/backgrounds/portrait/bg09.jpg'),
  require('../../assets/backgrounds/portrait/bg10.jpg'),
  require('../../assets/backgrounds/portrait/bg11.jpg'),
  require('../../assets/backgrounds/portrait/bg12.jpg'),
  require('../../assets/backgrounds/portrait/bg13.jpg'),
  require('../../assets/backgrounds/portrait/bg14.jpg'),
  require('../../assets/backgrounds/portrait/bg15.jpg'),
  require('../../assets/backgrounds/portrait/bg16.jpg'),
  require('../../assets/backgrounds/portrait/bg17.jpg'),
  require('../../assets/backgrounds/portrait/bg18.jpg'),
  require('../../assets/backgrounds/portrait/bg19.jpg'),
  require('../../assets/backgrounds/portrait/bg20.jpg'),
  require('../../assets/backgrounds/portrait/bg21.jpg'),
  require('../../assets/backgrounds/portrait/bg22.jpg'),
  require('../../assets/backgrounds/portrait/bg23.jpg'),
  require('../../assets/backgrounds/portrait/bg24.jpg'),
  require('../../assets/backgrounds/portrait/bg25.jpg'),
  require('../../assets/backgrounds/portrait/bg26.jpg'),
  require('../../assets/backgrounds/portrait/bg27.jpg'),
  require('../../assets/backgrounds/portrait/bg28.jpg'),
  require('../../assets/backgrounds/portrait/bg29.jpg'),
  require('../../assets/backgrounds/portrait/bg30.jpg'),
];

export const MenuSlideSheet: React.FC<MenuSlideSheetProps> = ({ visible, onClose, onApply }) => {
  const { width, height } = useWindowDimensions();

  const translateY = useRef(new Animated.Value(height)).current;
  const backdropOpacity = useRef(new Animated.Value(0)).current;

  const [renderSheet, setRenderSheet] = useState(visible);
  const [backgroundIndex, setBackgroundIndex] = useState(() =>
    Math.floor(Math.random() * MENU_BACKGROUNDS.length),
  );
  const previousVisibleRef = useRef(visible);

  const isLandscape = width > height;

  const [language, setLanguage] = useState<LanguageValue>('ko');
  const [emotion, setEmotion] = useState<EmotionValue>('none');
  const [philosophy, setPhilosophy] = useState<PhilosophyValue[]>([]);
  const [religion, setReligion] = useState<ReligionValue[]>([]);
  const [font, setFont] = useState<FontValue>('default');
  const [backgroundMode, setBackgroundMode] = useState<BackgroundValue>('auto');

  useEffect(() => {
    if (visible) {
      setRenderSheet(true);

      if (!previousVisibleRef.current) {
        setBackgroundIndex(Math.floor(Math.random() * MENU_BACKGROUNDS.length));
      }

      translateY.setValue(height);
      Animated.parallel([
        Animated.timing(backdropOpacity, {
          toValue: 0.42,
          duration: FADE_DURATION,
          useNativeDriver: true,
        }),
        Animated.timing(translateY, {
          toValue: 0,
          duration: SLIDE_DURATION,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(backdropOpacity, {
          toValue: 0,
          duration: FADE_DURATION,
          useNativeDriver: true,
        }),
        Animated.timing(translateY, {
          toValue: height,
          duration: SLIDE_DURATION,
          useNativeDriver: true,
        }),
      ]).start(({ finished }) => {
        if (finished) {
          setRenderSheet(false);
        }
      });
    }

    previousVisibleRef.current = visible;
  }, [visible, height, backdropOpacity, translateY]);

  const localeCopy = useMemo(() => LOCALE_COPY[language], [language]);
  const sectionLabel = useMemo(() => SECTION_LABELS[language], [language]);
  const ctaLabel = useMemo(() => CTA_LABELS[language], [language]);

  const handleApply = useCallback(() => {
    onApply({
      language,
      emotion,
      philosophy: [...philosophy],
      religion: [...religion],
      font,
      backgroundMode,
    });
    onClose();
  }, [onApply, onClose, language, emotion, philosophy, religion, font, backgroundMode]);

  const togglePhilosophy = (value: PhilosophyValue | 'all') => {
    if (value === 'all') {
      setPhilosophy([]);
      return;
    }

    setPhilosophy((prev) =>
      prev.includes(value) ? prev.filter((item) => item !== value) : [...prev, value],
    );
  };

  const toggleReligion = (value: ReligionValue | 'none') => {
    if (value === 'none') {
      setReligion([]);
      return;
    }

    setReligion((prev) =>
      prev.includes(value) ? prev.filter((item) => item !== value) : [...prev, value],
    );
  };

  if (!renderSheet) {
    return null;
  }

  const contentTransform = isLandscape ? [{ translateX: -56 }] : [{ translateY: -32 }];

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="box-none">
      <Pressable style={styles.backdropHitbox} onPress={onClose}>
        <Animated.View style={[styles.backdrop, { opacity: backdropOpacity }]} />
      </Pressable>

      <Animated.View style={[styles.sheet, { transform: [{ translateY }] }]}>
        <ImageBackground
          source={MENU_BACKGROUNDS[backgroundIndex]}
          style={styles.background}
          resizeMode="cover"
          blurRadius={18}
        >
          <View style={[styles.menuWrapper, { transform: contentTransform }]}>
            <View style={styles.panel}>
              <Text style={styles.logo}>Seloa</Text>
              <Text style={styles.tagline}>{localeCopy.tagline}</Text>

              <MenuSection label={sectionLabel.emotion}>
                {EMOTION_ORDER.map((value) => (
                  <Chip
                    key={value}
                    label={EMOTION_LABELS[value][language]}
                    selected={emotion === value}
                    onPress={() => setEmotion(value)}
                  />
                ))}
              </MenuSection>

              <MenuSection label={sectionLabel.philosophy}>
                {PHILOSOPHY_ORDER.map((value) => (
                  <Chip
                    key={value}
                    label={PHILOSOPHY_LABELS[value][language]}
                    selected={value === 'all' ? philosophy.length === 0 : philosophy.includes(value)}
                    onPress={() => togglePhilosophy(value)}
                  />
                ))}
              </MenuSection>

              <MenuSection label={sectionLabel.religion}>
                {RELIGION_ORDER.map((value) => (
                  <Chip
                    key={value}
                    label={RELIGION_LABELS[value][language]}
                    selected={value === 'none' ? religion.length === 0 : religion.includes(value)}
                    onPress={() => toggleReligion(value)}
                  />
                ))}
              </MenuSection>

              <MenuSection label={sectionLabel.language}>
                {LANGUAGE_ORDER.map((value) => (
                  <Chip
                    key={value}
                    label={LANGUAGE_NATIVE_LABELS[value]}
                    selected={language === value}
                    onPress={() => setLanguage(value)}
                  />
                ))}
              </MenuSection>

              <MenuSection label={sectionLabel.font}>
                {FONT_ORDER.map((value) => (
                  <Chip
                    key={value}
                    label={FONT_LABELS[value][language]}
                    selected={font === value}
                    onPress={() => setFont(value)}
                  />
                ))}
              </MenuSection>

              <MenuSection label={sectionLabel.background}>
                {BACKGROUND_ORDER.map((value) => (
                  <Chip
                    key={value}
                    label={BACKGROUND_LABELS[value][language]}
                    selected={backgroundMode === value}
                    onPress={() => setBackgroundMode(value)}
                  />
                ))}
              </MenuSection>

              <View style={styles.footer}>
                <Pressable
                  style={({ pressed }) => [styles.cta, pressed && styles.ctaPressed]}
                  onPress={handleApply}
                >
                  <Text style={styles.ctaLabel}>{ctaLabel}</Text>
                </Pressable>
              </View>
            </View>
          </View>
        </ImageBackground>
      </Animated.View>
    </View>
  );
};

const MenuSection: React.FC<{ label: string; children: React.ReactNode }> = ({ label, children }) => (
  <View style={styles.sectionRow}>
    <Text style={styles.sectionLabel} numberOfLines={1}>
      {label}
    </Text>
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={styles.sectionScroll}
      contentContainerStyle={styles.chipRow}
    >
      {children}
    </ScrollView>
  </View>
);

const Chip: React.FC<{ label: string; selected: boolean; onPress: () => void }> = ({
  label,
  selected,
  onPress,
}) => (
  <Pressable
    onPress={onPress}
    style={({ pressed }) => [
      styles.chip,
      selected && styles.chipSelected,
      pressed && !selected && styles.chipPressed,
    ]}
  >
    <Text style={[styles.chipText, selected && styles.chipTextSelected]}>{label}</Text>
  </Pressable>
);

const styles = StyleSheet.create({
  backdropHitbox: {
    ...StyleSheet.absoluteFillObject,
  },
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(6, 10, 16, 0.45)',
  },
  sheet: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    overflow: 'hidden',
  },
  background: {
    flex: 1,
  },
  menuWrapper: {
    flex: 1,
    width: '100%',
    paddingHorizontal: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  panel: {
    width: '100%',
    maxWidth: 560,
    gap: 10,
  },
  logo: {
    fontSize: 26,
    fontWeight: '600',
    color: '#F7F8FF',
    letterSpacing: 0.5,
  },
  tagline: {
    fontSize: 16,
    color: 'rgba(247, 248, 255, 0.92)',
    lineHeight: 22,
    marginBottom: 6,
  },
  sectionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  sectionLabel: {
    fontSize: 15,
    fontWeight: '700',
    color: '#9DD0FF',
    minWidth: 42,
    marginRight: 0,
    flexShrink: 0,
  },
  sectionScroll: {
    flex: 1,
    marginLeft: 0,
  },
  chipRow: {
    flexDirection: 'row',
    columnGap: 4,
    paddingVertical: 0,
  },
  chip: {
    borderRadius: 999,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255,255,255,0.35)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: 'transparent',
  },
  chipSelected: {
    backgroundColor: 'rgba(100,160,255,0.18)',
    borderColor: 'rgba(255,255,255,0.62)',
  },
  chipPressed: {
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  chipText: {
    fontSize: 14,
    color: '#F4F6FB',
    letterSpacing: 0.2,
  },
  chipTextSelected: {
    color: '#FFFFFF',
  },
  footer: {
    marginTop: 16,
    alignItems: 'center',
  },
  cta: {
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.5)',
    backgroundColor: 'rgba(255,255,255,0.06)',
    paddingHorizontal: 22,
    paddingVertical: 10,
  },
  ctaPressed: {
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderColor: 'rgba(255,255,255,0.65)',
  },
  ctaLabel: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.2,
  },
});