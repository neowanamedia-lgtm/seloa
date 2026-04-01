import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { AdaptiveBackground } from '../components/AdaptiveBackground';
import { AnimatedPassageText } from '../components/AnimatedPassageText';
import { BottomDotButton } from '../components/BottomDotButton';
import { MenuSlideSheet, MenuSelections } from '../components/MenuSlideSheet';
import { useOrientation } from '../hooks/useOrientation';

const TEXT_DELAY_MS = 1400;
const FALLBACK_PASSAGE = 'Seloa is preparing a passage for you.';

const LANGUAGE_PASSAGES: Record<MenuSelections['language'], string[]> = {
  ko: [
    '고요한 아침, 도시는 잠시 숨을 고른다.',
    '거리의 불빛은 잔잔한 용기를 전한다.',
    '우리는 오늘도 작은 희망을 모은다.',
  ],
  en: [
    'In quiet mornings, the city feels like a held breath.',
    'Streetlamps hum soft notes of patient light.',
    'We keep walking, gathering fragments of hope.',
  ],
  ja: [
    '静かな朝、街は息を潜めている。',
    '灯りは静かに勇気を照らし出す。',
    '私たちは小さな希望を拾い集める。',
  ],
  zh: [
    '清晨的城市仿佛屏住了呼吸。',
    '路灯轻轻送来安静的勇气。',
    '我们继续拾起细碎的希望。',
  ],
  es: [
    'En la mañana callada, la ciudad contiene el aliento.',
    'Cada farola derrama un hilo suave de valor.',
    'Seguimos andando, reuniendo fragmentos de esperanza.',
  ],
  ar: [
    'في الصباح الهادئ تبدو المدينة وكأنها تحبس أنفاسها.',
    'تبعث المصابيح توهجاً خفيفاً من الشجاعة.',
    'نواصل السير نجمع شتات الأمل الصغير.',
  ],
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  textBlock: {
    width: '100%',
    maxWidth: 420,
    alignSelf: 'center',
    transform: [{ translateY: -96 }],
    paddingHorizontal: 24,
  },
  paragraphContainer: {
    width: '100%',
  },
  paragraph: {
    fontSize: 20,
    lineHeight: 32,
    color: '#ffffff',
    textAlign: 'left',
  },
  bottomButton: {
    position: 'absolute',
    right: 28,
    bottom: 24,
  },
});

type PassageScreenProps = {
  onExitService: () => void;
  initialMenuVisible?: boolean;
};

export const PassageScreen: React.FC<PassageScreenProps> = ({
  onExitService: _onExitService,
  initialMenuVisible = true,
}) => {
  const orientation = useOrientation();

  const [menuSelections, setMenuSelections] = useState<MenuSelections>({
    language: 'ko',
    emotion: 'joy',
    philosophy: [],
    religion: [],
    font: 'default',
    backgroundMode: 'auto',
  });
  const [isMenuVisible, setMenuVisible] = useState(initialMenuVisible);
  const [isBackgroundReady, setBackgroundReady] = useState(false);
  const [isTextReady, setTextReady] = useState(false);
  const [hasAppliedOnce, setHasAppliedOnce] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const passageText = useMemo(() => {
    const lines = LANGUAGE_PASSAGES[menuSelections.language] ?? LANGUAGE_PASSAGES.en;
    return lines.join(' ');
  }, [menuSelections.language]);

  const normalizedPassageText = passageText?.trim() ?? '';
  const safePassageText = normalizedPassageText.length > 0 ? normalizedPassageText : FALLBACK_PASSAGE;
  const displayedText = isTextReady ? safePassageText : '';

  const readyTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleOpenMenu = useCallback(() => {
    setMenuVisible(true);
  }, []);

  const handleCloseMenu = useCallback(() => {
    setMenuVisible(false);
  }, []);

  const handleApply = useCallback((options: MenuSelections) => {
    setMenuSelections({
      ...options,
      philosophy: [...options.philosophy],
      religion: [...options.religion],
    });
    setHasAppliedOnce(true);
    setRefreshKey((prev) => prev + 1);
    setTextReady(false);
  }, []);

  const handleBackgroundReady = useCallback(() => {
    setBackgroundReady(true);
  }, []);

  useEffect(() => {
    if (readyTimerRef.current) {
      clearTimeout(readyTimerRef.current);
      readyTimerRef.current = null;
    }

    if (!isBackgroundReady || isMenuVisible || !hasAppliedOnce) {
      setTextReady(false);
      return;
    }

    readyTimerRef.current = setTimeout(() => {
      setTextReady(true);
    }, TEXT_DELAY_MS);

    return () => {
      if (readyTimerRef.current) {
        clearTimeout(readyTimerRef.current);
        readyTimerRef.current = null;
      }
    };
  }, [isBackgroundReady, isMenuVisible, hasAppliedOnce, refreshKey, safePassageText]);

  return (
    <AdaptiveBackground onReady={handleBackgroundReady}>
      <View style={styles.container}>
        <View style={styles.textBlock}>
          <AnimatedPassageText
            key={`passage-${orientation}-${refreshKey}`}
            line={displayedText}
            containerStyle={styles.paragraphContainer}
            style={styles.paragraph}
            isReady={isTextReady}
          />
        </View>
      </View>
      <BottomDotButton
        style={styles.bottomButton}
        onPress={handleOpenMenu}
        accessibilityLabel="Open menu"
      />
      <MenuSlideSheet
        visible={isMenuVisible}
        onClose={handleCloseMenu}
        onApply={handleApply}
      />
    </AdaptiveBackground>
  );
};
