import React from 'react';
import { StyleProp, StyleSheet, Text, TextStyle, View } from 'react-native';

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  text: {
    color: 'rgba(255,255,255,0.78)',
    paddingLeft: 18,
    textAlign: 'left',
  },
});

type PassageSourceTextProps = {
  text: string;
  baseFontSize: number;
  style?: StyleProp<TextStyle>;
};

export const PassageSourceText: React.FC<PassageSourceTextProps> = ({ text, baseFontSize, style }) => {
  const trimmed = text.trim();
  if (!trimmed) {
    return null;
  }

  const fontSize = Math.max(baseFontSize - 2, 8);
  const lineHeight = fontSize * 1.45;

  return (
    <View style={styles.container}>
      <Text style={[styles.text, { fontSize, lineHeight }, style]}>{trimmed}</Text>
    </View>
  );
};
