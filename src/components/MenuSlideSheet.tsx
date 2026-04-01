import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
  ImageBackground,
  Pressable,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';

const { height } = Dimensions.get('window');

export type MenuSlideSheetProps = {
  visible: boolean;
  onClose: () => void;
};

const SLIDE_DURATION = 420;
const FADE_DURATION = 320;

const MENU_ITEMS = ['Emotion', 'Language', 'Philosophy', 'Religion', 'Background', 'Font', 'Close'];

const MENU_BACKGROUNDS = [
  require('../../assets/backgrounds/portrait/bg01.jpg'),
  require('../../assets/backgrounds/portrait/bg02.jpg'),
  require('../../assets/backgrounds/portrait/bg03.jpg'),
  require('../../assets/backgrounds/portrait/bg04.jpg'),
  require('../../assets/backgrounds/portrait/bg05.jpg'),
  require('../../assets/backgrounds/portrait/bg06.jpg'),
  require('../../assets/backgrounds/portrait/bg07.jpg'),
  require('../../assets/backgrounds/portrait/bg08.jpg'),
  require('../../assets/backgrounds/portrait/bg09.jpg'),
  require('../../assets/backgrounds/portrait/bg10.jpg'),
  require('../../assets/backgrounds/portrait/bg11.jpg'),
  require('../../assets/backgrounds/portrait/bg12.jpg'),
  require('../../assets/backgrounds/portrait/bg13.jpg'),
  require('../../assets/backgrounds/portrait/bg14.jpg'),
  require('../../assets/backgrounds/portrait/bg15.jpg'),
  require('../../assets/backgrounds/portrait/bg16.jpg'),
  require('../../assets/backgrounds/portrait/bg17.jpg'),
  require('../../assets/backgrounds/portrait/bg18.jpg'),
  require('../../assets/backgrounds/portrait/bg19.jpg'),
  require('../../assets/backgrounds/portrait/bg20.jpg'),
  require('../../assets/backgrounds/portrait/bg21.jpg'),
  require('../../assets/backgrounds/portrait/bg22.jpg'),
  require('../../assets/backgrounds/portrait/bg23.jpg'),
  require('../../assets/backgrounds/portrait/bg24.jpg'),
  require('../../assets/backgrounds/portrait/bg25.jpg'),
  require('../../assets/backgrounds/portrait/bg26.jpg'),
  require('../../assets/backgrounds/portrait/bg27.jpg'),
  require('../../assets/backgrounds/portrait/bg28.jpg'),
  require('../../assets/backgrounds/portrait/bg29.jpg'),
  require('../../assets/backgrounds/portrait/bg30.jpg'),
];

export const MenuSlideSheet: React.FC<MenuSlideSheetProps> = ({ visible, onClose }) => {
  const translateY = useRef(new Animated.Value(height)).current;
  const backdropOpacity = useRef(new Animated.Value(0)).current;
  const [renderSheet, setRenderSheet] = useState(visible);
  const { width, height: windowHeight } = useWindowDimensions();
  const isLandscape = width > windowHeight;
  const [backgroundIndex, setBackgroundIndex] = useState(() => Math.floor(Math.random() * MENU_BACKGROUNDS.length));
  const previousVisibleRef = useRef(visible);

  useEffect(() => {
    if (visible) {
      setRenderSheet(true);
      if (!previousVisibleRef.current) {
        setBackgroundIndex(Math.floor(Math.random() * MENU_BACKGROUNDS.length));
      }
      Animated.parallel([
        Animated.timing(backdropOpacity, {
          toValue: 0.4,
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
    previousVisibleRef.current = visible;
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

  const alignmentTransform = isLandscape ? [{ translateX: -60 }] : [{ translateY: -60 }];

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="box-none">
      <Pressable style={styles.backdropHitbox} onPress={onClose}>
        <Animated.View style={[styles.backdrop, { opacity: backdropOpacity }]} />
      </Pressable>
      <Animated.View style={[styles.sheet, { transform: [{ translateY }] }]}> 
        <ImageBackground
          source={MENU_BACKGROUNDS[backgroundIndex]}
          style={styles.background}
          resizeMode="cover"
          blurRadius={23}
        >
          <View style={styles.brightOverlay} />
          <View style={[styles.menuWrapper, { transform: alignmentTransform }]}>
            <View style={styles.handle} />
            <View style={styles.menuContainer}>{menuNodes}</View>
          </View>
        </ImageBackground>
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
    backgroundColor: 'rgba(6, 10, 16, 0.45)',
  },
  sheet: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    top: 0,
    overflow: 'hidden',
  },
  background: {
    flex: 1,
  },
  brightOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255, 255, 255, 0)',
  },
  menuWrapper: {
    width: '100%',
    paddingTop: 28,
    paddingHorizontal: 24,
    justifyContent: 'center',
    alignItems: 'center',
    flex: 1,
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


