import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';

import { AdaptiveBackground } from '../components/AdaptiveBackground';
import { AnimatedPassageText } from '../components/AnimatedPassageText';
import { BottomDotButton } from '../components/BottomDotButton';
import { MenuSlideSheet, MenuSelections } from '../components/MenuSlideSheet';
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
  sourceWrapper: {
    marginTop: 18,
    marginLeft: 12,
  },
  sourceText: {
    fontSize: 18,
    lineHeight: 26,
    color: 'rgba(255,255,255,0.78)',
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
    emotion: 'none',
    philosophy: [],
    religion: [],
    font: 'default',
    backgroundMode: 'auto',
  });
  const [isMenuVisible, setMenuVisible] = useState(initialMenuVisible);
  const [isBackgroundReady, setBackgroundReady] = useState(false);
  const [isTextReady, setTextReady] = useState(false);
  const [isTextComplete, setTextComplete] = useState(false);
  const [hasAppliedOnce, setHasAppliedOnce] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const sourceAnim = useRef(new Animated.Value(0)).current;

  const { lines, sourceText } = usePassage({
    language: menuSelections.language,
    emotion: menuSelections.emotion,
    philosophy: menuSelections.philosophy,
    religion: menuSelections.religion,
    refreshKey,
  });

  const combinedText = useMemo(() => lines.join(' ').trim(), [lines]);
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
    setTextComplete(false);
    sourceAnim.setValue(0);
  }, [sourceAnim]);

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
      setTextComplete(false);
      sourceAnim.setValue(0);
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
  }, [isBackgroundReady, isMenuVisible, hasAppliedOnce, refreshKey, combinedText, sourceAnim]);

  useEffect(() => {
    const target = isTextComplete && sourceText ? 1 : 0;
    Animated.timing(sourceAnim, {
      toValue: target,
      duration: 320,
      useNativeDriver: true,
    }).start();
  }, [isTextComplete, sourceText, sourceAnim]);

  const displayedText = isTextReady ? combinedText : '';

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
            onComplete={() => setTextComplete(true)}
          />
          {sourceText ? (
            <Animated.View
              style={[
                styles.sourceWrapper,
                {
                  opacity: sourceAnim,
                  transform: [
                    {
                      translateY: sourceAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [8, 0],
                      }),
                    },
                  ],
                },
              ]}
              pointerEvents="none"
            >
              <Text style={styles.sourceText}>{sourceText}</Text>
            </Animated.View>
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
