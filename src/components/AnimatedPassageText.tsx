import React, { useEffect, useMemo, useRef } from 'react';
import { Animated, StyleProp, StyleSheet, TextStyle, View, ViewStyle } from 'react-native';

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

type FontVariant = 'default' | 'soft' | 'handwriting';

export type AnimatedPassageTextProps = {
  line: string;
  style?: StyleProp<TextStyle>;
  containerStyle?: StyleProp<ViewStyle>;
  isReady?: boolean;
  onComplete?: () => void;
};

const detectFontVariant = (fontFamily?: string): FontVariant => {
  if (!fontFamily) {
    return 'default';
  }
  const normalized = fontFamily.toLowerCase();
  if (normalized.includes('myeongjo') || normalized.includes('serif')) {
    return 'soft';
  }
  if (normalized.includes('pen') || normalized.includes('script') || normalized.includes('hand')) {
    return 'handwriting';
  }
  return 'default';
};

const createBalancedStyle = (
  baseSize: number,
  variant: FontVariant,
  overrides: { lineHeight?: number; letterSpacing?: number },
): TextStyle => {
  let fontSize = baseSize;
  let lineHeight = overrides.lineHeight;
  let letterSpacing = overrides.letterSpacing;

  switch (variant) {
    case 'soft':
      fontSize = baseSize + 1;
      if (lineHeight === undefined) {
        lineHeight = fontSize * 1.55;
      }
      if (letterSpacing === undefined) {
        letterSpacing = 0.3;
      }
      break;
    case 'handwriting':
      fontSize = baseSize + 5;
      if (lineHeight === undefined) {
        lineHeight = fontSize * 1.7;
      }
      if (letterSpacing === undefined) {
        letterSpacing = 0.32;
      }
      break;
    default:
      fontSize = baseSize;
      if (lineHeight === undefined) {
        lineHeight = baseSize * 1.5;
      }
      if (letterSpacing === undefined) {
        letterSpacing = 0.1;
      }
      break;
  }

  return {
    fontSize,
    lineHeight,
    letterSpacing,
  };
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
      if (isReady && words.length === 0 && normalizedLine.length > 0 && !hasAnimatedRef.current) {
        hasAnimatedRef.current = true;
        onComplete?.();
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
  }, [animatedValues, isReady, words.length, normalizedLine.length, onComplete]);

  if (!normalizedLine.length) {
    return null;
  }

  const flattenedStyle = StyleSheet.flatten(style) ?? {};
  const baseSize = typeof flattenedStyle.fontSize === 'number' ? flattenedStyle.fontSize : styles.word.fontSize;
  const variant = detectFontVariant(typeof flattenedStyle.fontFamily === 'string' ? flattenedStyle.fontFamily : undefined);

  const balancedTypography = createBalancedStyle(baseSize, variant, {
    lineHeight: typeof flattenedStyle.lineHeight === 'number' ? flattenedStyle.lineHeight : undefined,
    letterSpacing: typeof flattenedStyle.letterSpacing === 'number' ? flattenedStyle.letterSpacing : undefined,
  });

  return (
    <View style={[styles.lineContainer, containerStyle]}>
      {words.map((word, index) => (
        <Animated.Text
          key={`word-${index}`}
          style={[
            styles.word,
            style,
            balancedTypography,
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
