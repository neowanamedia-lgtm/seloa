import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { AdaptiveBackground } from '../components/AdaptiveBackground';
import { AnimatedPassageText } from '../components/AnimatedPassageText';
import { BottomDotButton } from '../components/BottomDotButton';
import { MenuSlideSheet } from '../components/MenuSlideSheet';
import { usePassage } from '../hooks/usePassage';
import { useOrientation } from '../hooks/useOrientation';

const TEXT_DELAY_MS = 1400;
const TEXT_FALLBACK_DELAY_MS = 600;
const FALLBACK_PASSAGE = 'Seloa is preparing a passage for you.';

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
};

export const PassageScreen: React.FC<PassageScreenProps> = ({ onExitService: _onExitService }) => {
  const { lines } = usePassage();
  const orientation = useOrientation();
  const passageText = useMemo(() => lines.join(' '), [lines]);
  const normalizedPassageText = passageText?.trim() ?? '';
  const safePassageText = normalizedPassageText.length > 0 ? normalizedPassageText : FALLBACK_PASSAGE;

  const [isMenuVisible, setMenuVisible] = useState(false);
  const [isBackgroundReady, setBackgroundReady] = useState(false);
  const [isTextReady, setTextReady] = useState(false);
  const readyTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    console.log('passageText:', safePassageText);
  }, [safePassageText]);

  useEffect(() => {
    console.log('isReady:', isTextReady);
  }, [isTextReady]);

  const handleOpenMenu = useCallback(() => {
    setMenuVisible(true);
  }, []);

  const handleCloseMenu = useCallback(() => {
    setMenuVisible(false);
  }, []);

  const handleBackgroundReady = useCallback(() => {
    setBackgroundReady(true);
  }, []);

  useEffect(() => {
    if (readyTimerRef.current) {
      clearTimeout(readyTimerRef.current);
    }
    setTextReady(false);

    const delay = isBackgroundReady ? TEXT_DELAY_MS : TEXT_FALLBACK_DELAY_MS;
    readyTimerRef.current = setTimeout(() => {
      setTextReady(true);
    }, delay);

    return () => {
      if (readyTimerRef.current) {
        clearTimeout(readyTimerRef.current);
      }
    };
  }, [isBackgroundReady, safePassageText]);

  return (
    <AdaptiveBackground onReady={handleBackgroundReady}>
      <View style={styles.container}>
        <View style={styles.textBlock}>
          <AnimatedPassageText
            key={`passage-${orientation}`}
            line={safePassageText}
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
      <MenuSlideSheet visible={isMenuVisible} onClose={handleCloseMenu} />
    </AdaptiveBackground>
  );
};
