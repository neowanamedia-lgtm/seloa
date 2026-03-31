import React from 'react';
import { StyleSheet, View } from 'react-native';

import { AdaptiveBackground } from '../components/AdaptiveBackground';
import { AnimatedPassageText } from '../components/AnimatedPassageText';
import { usePassage } from '../hooks/usePassage';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  textBlock: {
    width: '100%',
    maxWidth: 360,
    alignItems: 'center',
    transform: [{ translateY: -72 }],
  },
  lineSpacing: {
    marginBottom: 14,
  },
});

export const PassageScreen: React.FC = () => {
  const { lines } = usePassage();

  return (
    <AdaptiveBackground>
      <View style={styles.container}>
        <View style={styles.textBlock}>
          {lines.map((line, index) => (
            <AnimatedPassageText
              key={`passage-line-${index}`}
              line={line}
              containerStyle={styles.lineSpacing}
            />
          ))}
        </View>
      </View>
    </AdaptiveBackground>
  );
};