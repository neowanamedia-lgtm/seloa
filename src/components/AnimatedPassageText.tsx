import React, { useEffect, useMemo, useRef } from 'react';
import { Animated, StyleProp, StyleSheet, TextStyle, View, ViewStyle } from 'react-native';

import { FontVariant, FONT_FAMILY_BY_VARIANT } from './PassageSourceText';

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
  style?: StyleProp<TextStyle>;
  containerStyle?: StyleProp<ViewStyle>;
  isReady?: boolean;
  onComplete?: () => void;
  variant: FontVariant;
};

const getDefaultLineHeight = (variant: FontVariant, fontSize: number): number => {
  switch (variant) {
    case 'soft':
      return fontSize * 1.55;
    case 'handwriting':
      return fontSize * 1.7;
    default:
      return fontSize * 1.5;
  }
};

const getDefaultLetterSpacing = (variant: FontVariant): number => {
  switch (variant) {
    case 'soft':
      return 0.3;
    case 'handwriting':
      return 0.32;
    default:
      return 0.1;
  }
};

const createVariantTypography = (
  variant: FontVariant,
  baseSize: number,
  overrides: { lineHeight?: number; letterSpacing?: number },
): TextStyle => {
  const fontSize = variant === 'handwriting' ? baseSize + 2 : baseSize;
  return {
    fontFamily: FONT_FAMILY_BY_VARIANT[variant],
    fontSize,
    lineHeight: overrides.lineHeight ?? getDefaultLineHeight(variant, baseSize),
    letterSpacing: overrides.letterSpacing ?? getDefaultLetterSpacing(variant),
  };
};

export const AnimatedPassageText: React.FC<AnimatedPassageTextProps> = ({
  line,
  style,
  containerStyle,
  isReady = true,
  onComplete,
  variant,
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
  }, [normalizedLine, animatedValues, isReady, variant]);

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

  const variantTypography = createVariantTypography(variant, baseSize, {
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
            variantTypography,
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
