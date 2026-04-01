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
  isReady?: boolean;
  onComplete?: () => void;
};

export const AnimatedPassageText: React.FC<AnimatedPassageTextProps> = ({
  line,
  style,
  containerStyle,
  isReady = true,
  onComplete,
}) => {
  const safeLine = typeof line === 'string' ? line : '';
  const normalizedLine = safeLine.trim();
  const words = useMemo(() => (normalizedLine.length > 0 ? normalizedLine.split(/\s+/) : []), [normalizedLine]);
  const animatedValues = useMemo(() => words.map(() => new Animated.Value(0)), [words]);
  const hasAnimatedRef = useRef(false);
  const animationRef = useRef<Animated.CompositeAnimation | null>(null);

  useEffect(() => {
    hasAnimatedRef.current = false;
    animatedValues.forEach((value) => value.setValue(0));
  }, [normalizedLine, animatedValues, isReady]);

  useEffect(() => {
    if (!isReady || hasAnimatedRef.current || words.length === 0) {
      if (!isReady) {
        hasAnimatedRef.current = false;
      }
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
      onComplete?.();
    });

    return () => {
      animationRef.current?.stop();
    };
  }, [animatedValues, isReady, words.length, onComplete]);

  if (words.length === 0) {
    return (
      <View style={[styles.lineContainer, containerStyle]}>
        <Animated.Text style={[styles.word, style]}>{safeLine}</Animated.Text>
      </View>
    );
  }

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
