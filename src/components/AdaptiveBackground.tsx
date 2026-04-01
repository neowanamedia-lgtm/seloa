import React, { PropsWithChildren, useEffect, useMemo, useRef, useState } from 'react';
import { Animated, ImageBackground, StyleSheet, View } from 'react-native';

import { getRandomBackground, BackgroundConfig } from '../constants/backgrounds';

type AdaptiveBackgroundProps = PropsWithChildren<{
  onReady?: () => void;
  overlayColor?: string;
}>;

const INITIAL_FADE_DURATION = 900;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  background: {
    ...StyleSheet.absoluteFillObject,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  content: {
    flex: 1,
  },
});

export const AdaptiveBackground: React.FC<AdaptiveBackgroundProps> = ({
  children,
  onReady,
  overlayColor,
}) => {
  const [selectedBackground] = useState<BackgroundConfig>(() => getRandomBackground());
  const source = useMemo(() => selectedBackground.portrait, [selectedBackground]);
  const opacity = useRef(new Animated.Value(0)).current;
  const hasSignaledRef = useRef(false);

  useEffect(() => {
    Animated.timing(opacity, {
      toValue: 1,
      duration: INITIAL_FADE_DURATION,
      useNativeDriver: true,
    }).start(() => {
      if (!hasSignaledRef.current) {
        hasSignaledRef.current = true;
        onReady?.();
      }
    });
  }, [opacity, onReady]);

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.background, { opacity }]}> 
        <ImageBackground source={source} style={styles.background} resizeMode="cover" />
      </Animated.View>
      <View style={[styles.overlay, { backgroundColor: overlayColor ?? 'rgba(0,0,0,0.3)' }]} />
      <View style={styles.content}>{children}</View>
    </View>
  );
};
