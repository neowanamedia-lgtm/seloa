import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { AdaptiveBackground } from '../components/AdaptiveBackground';
import { AnimatedPassageText } from '../components/AnimatedPassageText';
import { PassageSourceText, buildSourceTypography, FontVariant } from '../components/PassageSourceText';
import { BottomDotButton } from '../components/BottomDotButton';
import { MenuSlideSheet, MenuSelections } from '../components/MenuSlideSheet';
import { usePassage } from '../hooks/usePassage';
import { useOrientation } from '../hooks/useOrientation';

const TEXT_DELAY_MS = 1400;
const BASE_FONT_SIZE = 20;
const SOURCE_CHARS_PER_LINE = 14;

const FONT_FAMILY_BY_VARIANT: Record<FontVariant, string> = {
  default: 'NotoSansKR-Regular',
  soft: 'NanumMyeongjo-Regular',
  handwriting: 'NanumPenScript-Regular',
};

const getFontVariant = (font: MenuSelections['font']): FontVariant => {
  if (font === 'soft') {
    return 'soft';
  }
  if (font === 'handwriting') {
    return 'handwriting';
  }
  return 'default';
};

const getBodyFontSize = (variant: FontVariant): number => {
  switch (variant) {
    case 'soft':
      return BASE_FONT_SIZE + 2;
    case 'handwriting':
      return BASE_FONT_SIZE + 8;
    default:
      return BASE_FONT_SIZE;
  }
};

const getParagraphFontStyle = (
  fontsLoaded: boolean | undefined,
  variant: FontVariant,
): { fontFamily: string } | undefined => {
  if (!fontsLoaded) {
    return undefined;
  }
  return { fontFamily: FONT_FAMILY_BY_VARIANT[variant] };
};

const estimateSourceHeight = (
  text: string | undefined,
  baseFontSize: number,
  variant: FontVariant,
): number => {
  const trimmed = text?.trim();
  if (!trimmed) {
    return 0;
  }

  const { lineHeight } = buildSourceTypography(baseFontSize, variant);
  const resolvedLineHeight = typeof lineHeight === 'number' ? lineHeight : baseFontSize * 1.45;
  const segments = trimmed.split(/\n+/).filter(Boolean);

  const approximateLines = segments.length > 0
    ? segments.reduce((total, segment) => {
        const length = segment.trim().length || SOURCE_CHARS_PER_LINE;
        return total + Math.max(1, Math.ceil(length / SOURCE_CHARS_PER_LINE));
      }, 0)
    : Math.max(1, Math.ceil(trimmed.length / SOURCE_CHARS_PER_LINE));

  return resolvedLineHeight * Math.max(1, approximateLines);
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  containerLandscape: {
    justifyContent: 'flex-start',
    paddingTop: 32,
  },
  textBlock: {
    width: '100%',
    maxWidth: 420,
    paddingHorizontal: 24,
  },
  textBlockPortrait: {
    transform: [{ translateY: -72 }],
  },
  textBlockLandscape: {
    paddingTop: 24,
    transform: [{ translateY: -12 }],
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
  const isLandscape = orientation === 'landscape';

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

  const fontVariant = useMemo(() => getFontVariant(menuSelections.font), [menuSelections.font]);

  const { lines, sourceText } = usePassage({
    language: menuSelections.language,
    emotion: menuSelections.emotion,
    philosophy: menuSelections.philosophy,
    religion: menuSelections.religion,
    refreshKey,
  });

  const combinedText = useMemo(() => lines.join(' ').trim(), [lines]);
  const readyTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const paragraphFontStyle = useMemo(
    () => getParagraphFontStyle(fontsLoaded, fontVariant),
    [fontsLoaded, fontVariant],
  );
  const bodyFontSize = useMemo(() => getBodyFontSize(fontVariant), [fontVariant]);
  const sourceReserveHeight = useMemo(
    () => estimateSourceHeight(sourceText, bodyFontSize, fontVariant),
    [sourceText, bodyFontSize, fontVariant],
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
      <View style={[styles.container, isLandscape && styles.containerLandscape]}>
        <View
          style={[
            styles.textBlock,
            isLandscape ? styles.textBlockLandscape : styles.textBlockPortrait,
          ]}
        >
          <AnimatedPassageText
            key={`passage-${orientation}-${refreshKey}`}
            line={displayedText}
            containerStyle={styles.paragraphContainer}
            style={[styles.paragraph, paragraphFontStyle, { fontSize: bodyFontSize }]}
            isReady={isTextReady}
            onComplete={() => setShowSource(true)}
            variant={fontVariant}
          />
          {sourceReserveHeight > 0 ? (
            <View style={[styles.sourceReserve, { marginTop: 18, minHeight: sourceReserveHeight }]}>
              {sourceText && showSource ? (
                <PassageSourceText
                  text={sourceText}
                  baseFontSize={bodyFontSize}
                  variant={fontVariant}
                  style={paragraphFontStyle}
                />
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
