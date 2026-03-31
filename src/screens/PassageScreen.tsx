import React, { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';

import { AdaptiveBackground } from '../components/AdaptiveBackground';
import { AnimatedPassageText } from '../components/AnimatedPassageText';
import { usePassage } from '../hooks/usePassage';
import { useOrientation } from '../hooks/useOrientation';

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
});

export const PassageScreen: React.FC = () => {
  const { lines } = usePassage();
  const orientation = useOrientation();
  const passageText = useMemo(() => lines.join(' '), [lines]);

  return (
    <AdaptiveBackground>
      <View style={styles.container}>
        <View style={styles.textBlock}>
          <AnimatedPassageText
            key={`passage-${orientation}`}
            line={passageText}
            containerStyle={styles.paragraphContainer}
            style={styles.paragraph}
          />
        </View>
      </View>
    </AdaptiveBackground>
  );
};