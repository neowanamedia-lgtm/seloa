import React, { useCallback, useState } from 'react';
import { StatusBar, StyleSheet, Text, View } from 'react-native';
import { PassageScreen } from './src/screens/PassageScreen';

export default function App() {
  const [isServiceActive, setServiceActive] = useState(true);

  const handleExitService = useCallback(() => {
    setServiceActive(false);
  }, []);

  return (
    <View style={styles.root}>
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
      {isServiceActive ? (
        <PassageScreen onExitService={handleExitService} />
      ) : (
        <View style={styles.closedState}>
          <Text style={styles.closedText}>Seloa is resting.</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#0b1014',
  },
  closedState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closedText: {
    color: '#8f9ba8',
    fontSize: 16,
    letterSpacing: 0.5,
  },
});