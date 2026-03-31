import React, { PropsWithChildren, useState } from 'react';
import { ImageBackground, StyleSheet, View } from 'react-native';

import { getRandomBackground, BackgroundConfig } from '../constants/backgrounds';
import { useOrientation } from '../hooks/useOrientation';

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  image: {
    ...StyleSheet.absoluteFillObject,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
});

export const AdaptiveBackground: React.FC<PropsWithChildren> = ({ children }) => {
  const orientation = useOrientation();
  const [selectedBackground] = useState<BackgroundConfig>(() => getRandomBackground());
  const source = selectedBackground[orientation];

  return (
    <View style={styles.container}>
      <ImageBackground source={source} style={styles.image} resizeMode="cover">
        <View style={styles.overlay} />
        {children}
      </ImageBackground>
    </View>
  );
};