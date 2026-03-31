import React, { useEffect, useMemo, useRef } from 'react';
import { Animated, StyleSheet, TextStyle, View, ViewStyle } from 'react-native';

const styles = StyleSheet.create({
  lineContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
  },
  word: {
    color: '#ffffff',
    fontSize: 20,
    lineHeight: 32,
    textAlign: 'left',
  },
});

const WORD_FADE_DURATION = 660;
const WORD_STAGGER = 220;
const WORD_TRANSLATE_Y = 16;

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
  const words = useMemo(() => line.split(/\s+/).filter(Boolean), [line]);
  const animatedValues = useMemo(() => words.map(() => new Animated.Value(0)), [line]);
  const hasAnimatedRef = useRef(false);
  const animationRef = useRef<Animated.CompositeAnimation | null>(null);

  useEffect(() => {
    hasAnimatedRef.current = false;
    animatedValues.forEach((value) => value.setValue(0));
  }, [line, animatedValues]);

  useEffect(() => {
    if (hasAnimatedRef.current) {
      return;
    }

    const animations = animatedValues.map((value) =>
      Animated.timing(value, {
        toValue: 1,
        duration: WORD_FADE_DURATION,
        useNativeDriver: true,
      }),
    );

    const sequence = Animated.stagger(WORD_STAGGER, animations);
    animationRef.current = sequence;
    sequence.start(() => {
      hasAnimatedRef.current = true;
      animationRef.current = null;
    });

    return () => {
      animationRef.current?.stop();
    };
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
                    outputRange: [WORD_TRANSLATE_Y, 0],
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