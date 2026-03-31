import React, { useEffect, useMemo } from 'react';
import { Animated, StyleSheet, TextStyle, View, ViewStyle } from 'react-native';

const styles = StyleSheet.create({
  lineContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginBottom: 14,
  },
  word: {
    color: '#ffffff',
    fontSize: 20,
    lineHeight: 30,
    textAlign: 'center',
  },
});

const WORD_FADE_DURATION = 400;
const WORD_STAGGER = 120;

export type AnimatedPassageTextProps = {
  line: string;
  style?: TextStyle;
  containerStyle?: ViewStyle;
};

export const AnimatedPassageText: React.FC<AnimatedPassageTextProps> = ({
  line,
  style,
  containerStyle,
}) => {
  const words = useMemo(() => line.split(' ').filter((word) => word.length > 0), [line]);
  const animatedValues = useMemo(() => words.map(() => new Animated.Value(0)), [line]);

  useEffect(() => {
    const animations = animatedValues.map((value) =>
      Animated.timing(value, {
        toValue: 1,
        duration: WORD_FADE_DURATION,
        useNativeDriver: true,
      }),
    );

    Animated.stagger(WORD_STAGGER, animations).start();
  }, [animatedValues]);

  return (
    <View style={[styles.lineContainer, containerStyle]}>
      {words.map((word, index) => (
        <Animated.Text
          key={`word-${index}`}
          style={[
            styles.word,
            style,
            {
              opacity: animatedValues[index],
              transform: [
                {
                  translateY: animatedValues[index].interpolate({
                    inputRange: [0, 1],
                    outputRange: [8, 0],
                  }),
                },
              ],
            },
          ]}
        >
          {word}
          {index < words.length - 1 ? ' ' : ''}
        </Animated.Text>
      ))}
    </View>
  );
};