import React from 'react';
import { StatusBar, StyleSheet, View } from 'react-native';
import MistLakePreviewScreen from './src/preview/MistLakePreviewScreen';

export default function App() {
  return (
    <View style={styles.root}>
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
      <MistLakePreviewScreen />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#0b1014',
  },
});