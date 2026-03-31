import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { AdaptiveBackground } from '../components/AdaptiveBackground';
import { AnimatedPassageText } from '../components/AnimatedPassageText';
import { BottomDotButton } from '../components/BottomDotButton';
import { MenuSlideSheet } from '../components/MenuSlideSheet';
import { usePassage } from '../hooks/usePassage';
import { useOrientation } from '../hooks/useOrientation';

const TEXT_DELAY_MS = 1400;

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
  const [isMenuVisible, setMenuVisible] = useState(false);
  const [isBackgroundReady, setBackgroundReady] = useState(false);
  const [isTextReady, setTextReady] = useState(false);

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
    if (!isBackgroundReady) {
      setTextReady(false);
      return;
    }

    const timer = setTimeout(() => {
      setTextReady(true);
    }, TEXT_DELAY_MS);

    return () => {
      clearTimeout(timer);
    };
  }, [isBackgroundReady]);

  return (
    <AdaptiveBackground onReady={handleBackgroundReady}>
      <View style={styles.container}>
        <View style={styles.textBlock}>
          <AnimatedPassageText
            key={`passage-${orientation}`}
            line={passageText}
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