import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { AdaptiveBackground } from '../components/AdaptiveBackground';
import { AnimatedPassageText } from '../components/AnimatedPassageText';
import { PassageSourceText } from '../components/PassageSourceText';
import { BottomDotButton } from '../components/BottomDotButton';
import { MenuSlideSheet, MenuSelections } from '../components/MenuSlideSheet';
import { usePassage } from '../hooks/usePassage';
import { useOrientation } from '../hooks/useOrientation';

const TEXT_DELAY_MS = 1400;
const BASE_FONT_SIZE = 20;
const SOURCE_CHARS_PER_LINE = 14;

const FONT_FAMILY_MAP: Partial<Record<MenuSelections['language'], Record<MenuSelections['font'], string>>> = {
  ko: {
    default: 'NotoSansKR-Regular',
    soft: 'NanumMyeongjo-Regular',
    handwriting: 'NanumPenScript-Regular',
  },
};

const getFontFamily = (
  language: MenuSelections['language'],
  font: MenuSelections['font'],
  fontsLoaded?: boolean,
): string | undefined => {
  if (!fontsLoaded) {
    return undefined;
  }
  const langFonts = FONT_FAMILY_MAP[language];
  if (!langFonts) {
    return undefined;
  }
  return langFonts[font] || langFonts.default;
};

const getBodyFontSize = (font: MenuSelections['font']): number => {
  switch (font) {
    case 'soft':
      return BASE_FONT_SIZE + 1;
    case 'handwriting':
      return BASE_FONT_SIZE + 5;
    default:
      return BASE_FONT_SIZE;
  }
};

const estimateSourceHeight = (text: string | undefined, baseFontSize: number): number => {
  const trimmed = text?.trim();
  if (!trimmed) {
    return 0;
  }

  const fontSize = Math.max(baseFontSize - 2, 8);
  const lineHeight = fontSize * 1.45;
  const segments = trimmed.split(/\n+/).filter(Boolean);

  const approximateLines = segments.length > 0
    ? segments.reduce((total, segment) => {
        const length = segment.trim().length || SOURCE_CHARS_PER_LINE;
        return total + Math.max(1, Math.ceil(length / SOURCE_CHARS_PER_LINE));
      }, 0)
    : Math.max(1, Math.ceil(trimmed.length / SOURCE_CHARS_PER_LINE));

  return lineHeight * Math.max(1, approximateLines);
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
    transform: [{ translateY: -72 }],
    paddingHorizontal: 24,
  },
  paragraphContainer: {
    width: '100%',
  },
  paragraph: {
    fontSize: BASE_FONT_SIZE,
    lineHeight: 32,
    color: '#ffffff',
    textAlign: 'left',
  },
  sourceReserve: {
    width: '100%',
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
  fontsLoaded?: boolean;
};

export const PassageScreen: React.FC<PassageScreenProps> = ({
  onExitService: _onExitService,
  initialMenuVisible = true,
  fontsLoaded,
}) => {
  const orientation = useOrientation();

  const [menuSelections, setMenuSelections] = useState<MenuSelections>({
    language: 'ko',
    emotion: 'none',
    philosophy: [],
    religion: [],
    font: 'default',
    backgroundMode: 'auto',
  });
  const [isMenuVisible, setMenuVisible] = useState(initialMenuVisible);
  const [isBackgroundReady, setBackgroundReady] = useState(false);
  const [isTextReady, setTextReady] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [showSource, setShowSource] = useState(false);

  const { lines, sourceText } = usePassage({
    language: menuSelections.language,
    emotion: menuSelections.emotion,
    philosophy: menuSelections.philosophy,
    religion: menuSelections.religion,
    refreshKey,
  });

  const combinedText = useMemo(() => lines.join(' ').trim(), [lines]);
  const readyTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const paragraphFontFamily = useMemo(
    () => getFontFamily(menuSelections.language, menuSelections.font, fontsLoaded),
    [menuSelections.language, menuSelections.font, fontsLoaded],
  );
  const paragraphFontStyle = paragraphFontFamily ? { fontFamily: paragraphFontFamily } : undefined;
  const bodyFontSize = useMemo(() => getBodyFontSize(menuSelections.font), [menuSelections.font]);
  const sourceReserveHeight = useMemo(
    () => estimateSourceHeight(sourceText, bodyFontSize),
    [sourceText, bodyFontSize],
  );

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
    setRefreshKey((prev) => prev + 1);
    setTextReady(false);
    setShowSource(false);
  }, []);

  const handleBackgroundReady = useCallback(() => {
    setBackgroundReady(true);
  }, []);

  useEffect(() => {
    if (readyTimerRef.current) {
      clearTimeout(readyTimerRef.current);
      readyTimerRef.current = null;
    }

    if (!isBackgroundReady || isMenuVisible) {
      setTextReady(false);
      setShowSource(false);
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
  }, [isBackgroundReady, isMenuVisible, refreshKey, combinedText]);

  useEffect(() => {
    setShowSource(false);
  }, [orientation]);

  const displayedText = isTextReady ? combinedText : '';

  return (
    <AdaptiveBackground onReady={handleBackgroundReady}>
      <View style={styles.container}>
        <View style={styles.textBlock}>
          <AnimatedPassageText
            key={`passage-${orientation}-${refreshKey}`}
            line={displayedText}
            containerStyle={styles.paragraphContainer}
            style={[styles.paragraph, paragraphFontStyle, { fontSize: bodyFontSize }]}
            isReady={isTextReady}
            onComplete={() => setShowSource(true)}
          />
          {sourceReserveHeight > 0 ? (
            <View style={[styles.sourceReserve, { marginTop: 18, minHeight: sourceReserveHeight }]}>
              {sourceText && showSource ? (
                <PassageSourceText text={sourceText} baseFontSize={bodyFontSize} style={paragraphFontStyle} />
              ) : null}
            </View>
          ) : null}
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
