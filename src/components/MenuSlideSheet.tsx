import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Animated, Dimensions, Pressable, StyleSheet, Text, View } from 'react-native';

const { height } = Dimensions.get('window');

export type MenuSlideSheetProps = {
  visible: boolean;
  onClose: () => void;
};

const SLIDE_DURATION = 420;
const FADE_DURATION = 320;

const MENU_ITEMS = ['Emotion', 'Language', 'Philosophy', 'Religion', 'Background', 'Font', 'Close'];

export const MenuSlideSheet: React.FC<MenuSlideSheetProps> = ({ visible, onClose }) => {
  const translateY = useRef(new Animated.Value(height)).current;
  const backdropOpacity = useRef(new Animated.Value(0)).current;
  const [renderSheet, setRenderSheet] = useState(visible);

  useEffect(() => {
    if (visible) {
      setRenderSheet(true);
      Animated.parallel([
        Animated.timing(backdropOpacity, {
          toValue: 0.55,
          duration: FADE_DURATION,
          useNativeDriver: true,
        }),
        Animated.timing(translateY, {
          toValue: 0,
          duration: SLIDE_DURATION,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(backdropOpacity, {
          toValue: 0,
          duration: FADE_DURATION,
          useNativeDriver: true,
        }),
        Animated.timing(translateY, {
          toValue: height,
          duration: SLIDE_DURATION,
          useNativeDriver: true,
        }),
      ]).start(() => setRenderSheet(false));
    }
  }, [visible, backdropOpacity, translateY]);

  const handleItemPress = (item: string) => {
    if (item === 'Close') {
      onClose();
    }
  };

  const menuNodes = useMemo(
    () =>
      MENU_ITEMS.map((label) => (
        <Pressable key={label} onPress={() => handleItemPress(label)} style={styles.menuItem}>
          <Text style={styles.menuText}>{label}</Text>
        </Pressable>
      )),
    [],
  );

  if (!renderSheet) {
    return null;
  }

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="box-none">
      <Pressable style={styles.backdropHitbox} onPress={onClose}>
        <Animated.View style={[styles.backdrop, { opacity: backdropOpacity }]} />
      </Pressable>
      <Animated.View style={[styles.sheet, { transform: [{ translateY }] }]}> 
        <View style={styles.handle} />
        <View style={styles.menuContainer}>{menuNodes}</View>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  backdropHitbox: {
    ...StyleSheet.absoluteFillObject,
  },
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(6, 10, 16, 0.7)',
  },
  sheet: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    top: 0,
    backgroundColor: 'rgba(16, 22, 30, 0.92)',
    paddingTop: 28,
    paddingHorizontal: 24,
  },
  handle: {
    width: 48,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(255,255,255,0.3)',
    alignSelf: 'center',
    marginBottom: 32,
  },
  menuContainer: {
    gap: 18,
  },
  menuItem: {
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(255,255,255,0.15)',
  },
  menuText: {
    fontSize: 18,
    color: '#f2f5f9',
    letterSpacing: 0.5,
  },
});