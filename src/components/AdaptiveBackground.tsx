import React, { PropsWithChildren, useMemo, useState } from 'react';
import { ImageBackground, StyleSheet, View } from 'react-native';

import { getRandomBackground, BackgroundConfig } from '../constants/backgrounds';

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

export const AdaptiveBackground: React.FC<PropsWithChildren> = ({ children }) => {
  const [selectedBackground] = useState<BackgroundConfig>(() => getRandomBackground());
  const source = useMemo(() => selectedBackground.portrait, [selectedBackground]);

  return (
    <View style={styles.container}>
      <ImageBackground source={source} style={styles.background} resizeMode="cover" />
      <View style={styles.overlay} />
      <View style={styles.content}>{children}</View>
    </View>
  );
};