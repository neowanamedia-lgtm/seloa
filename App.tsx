import React from 'react';
import { StatusBar, StyleSheet, View } from 'react-native';
import { PassageScreen } from './src/screens/PassageScreen';

export default function App() {
  return (
    <View style={styles.root}>
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
      <PassageScreen />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#0b1014',
  },
});