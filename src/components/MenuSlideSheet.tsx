import React from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import type {
  BackgroundOption,
  ContentCategory,
  EmotionKey,
  FontOption,
  LanguageOption,
  MenuSelectionState,
  SizeOption,
} from '../types/menu';

type MenuSlideSheetProps = {
  visible: boolean;
  onClose: () => void;
  onApply: (state: MenuSelectionState) => void;
  state: MenuSelectionState;
  onChange: React.Dispatch<React.SetStateAction<MenuSelectionState>>;
};

const EMOTION_OPTIONS: Array<{ key: EmotionKey; label: string }> = [
  { key: 'unknown', label: 'Balance' },
  { key: 'joy', label: 'Joy' },
  { key: 'hope', label: 'Hope' },
  { key: 'anxiety', label: 'Anxiety' },
  { key: 'depression', label: 'Depth' },
  { key: 'sadness', label: 'Sadness' },
];

const CATEGORY_OPTIONS: Array<{ key: ContentCategory; label: string }> = [
  { key: 'eastern_philosophy', label: 'Eastern Philosophy' },
  { key: 'western_philosophy', label: 'Western Philosophy' },
  { key: 'eastern_poetry', label: 'Eastern Poetry' },
  { key: 'western_poetry', label: 'Western Poetry' },
  { key: 'eastern_novel', label: 'Eastern Novel' },
  { key: 'western_novel', label: 'Western Novel' },
  { key: 'christianity', label: 'Christianity' },
  { key: 'buddhism', label: 'Buddhism' },
  { key: 'islam', label: 'Islam' },
];

const LANGUAGE_OPTIONS: Array<{ key: LanguageOption; label: string }> = [
  { key: 'ko', label: 'KO' },
  { key: 'en', label: 'EN' },
  { key: 'ja', label: 'JA' },
  { key: 'zh', label: 'ZH' },
  { key: 'es', label: 'ES' },
  { key: 'ar', label: 'AR' },
];

const FONT_OPTIONS: Array<{ key: FontOption; label: string }> = [
  { key: 'basic', label: 'Basic' },
  { key: 'soft', label: 'Soft' },
  { key: 'script', label: 'Script' },
];

const SIZE_OPTIONS: Array<{ key: SizeOption; label: string }> = [
  { key: 'large', label: 'Large' },
  { key: 'small', label: 'Small' },
];

const BACKGROUND_OPTIONS: Array<{ key: BackgroundOption; label: string }> = [
  { key: 'auto', label: 'Auto' },
  { key: 'upload', label: 'Upload' },
];

const ENABLED_LANGUAGES: Array<MenuSelectionState['language']> = ['ko', 'en'];
const ENABLED_LANGUAGE_SET = new Set<MenuSelectionState['language']>(ENABLED_LANGUAGES);

export function MenuSlideSheet({ visible, onClose, onApply, state, onChange }: MenuSlideSheetProps) {
  const handleEmotion = (emotion: EmotionKey) => {
    onChange((prev) => ({
      ...prev,
      emotion,
    }));
  };

  const handleCategoryToggle = (category: ContentCategory) => {
    onChange((prev) => {
      const exists = prev.selectedCategories.includes(category);
      if (exists && prev.selectedCategories.length === 1) {
        return prev;
      }
      if (exists) {
        return {
          ...prev,
          selectedCategories: prev.selectedCategories.filter((item) => item !== category),
        };
      }
      return {
        ...prev,
        selectedCategories: [...prev.selectedCategories, category],
      };
    });
  };

  const handleLanguage = (language: LanguageOption) => {
    if (!ENABLED_LANGUAGE_SET.has(language)) {
      return;
    }
    onChange((prev) => ({
      ...prev,
      language,
    }));
  };

  const handleFont = (font: FontOption) => {
    onChange((prev) => ({
      ...prev,
      font,
    }));
  };

  const handleSize = (size: SizeOption) => {
    onChange((prev) => ({
      ...prev,
      size,
    }));
  };

  const handleBackground = (background: BackgroundOption) => {
    onChange((prev) => ({
      ...prev,
      background,
    }));
  };

  const handleApplyPress = () => {
    onApply(state);
    onClose();
  };

  return (
    <Modal transparent visible={visible} animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
        <View style={styles.sheet}>
          <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
            <View style={styles.section}>{renderSingleSelectChips(EMOTION_OPTIONS, state.emotion, handleEmotion)}</View>
            <View style={styles.section}>
              {renderMultiSelectChips(CATEGORY_OPTIONS, state.selectedCategories, handleCategoryToggle)}
            </View>
            <View style={styles.section}>
              {renderLanguageChips(LANGUAGE_OPTIONS, state.language, handleLanguage)}
            </View>
            <View style={styles.section}>{renderSingleSelectChips(FONT_OPTIONS, state.font, handleFont)}</View>
            <View style={styles.section}>{renderSingleSelectChips(SIZE_OPTIONS, state.size, handleSize)}</View>
            <View style={styles.section}>{renderSingleSelectChips(BACKGROUND_OPTIONS, state.background, handleBackground)}</View>
          </ScrollView>
          <Pressable style={styles.applyButton} onPress={handleApplyPress}>
            <Text style={styles.applyButtonText}>Show Passage</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

function renderSingleSelectChips<T extends string>(
  options: Array<{ key: T; label: string }>,
  selected: T,
  onPress: (value: T) => void,
) {
  return (
    <View style={styles.chipRow}>
      {options.map((option) => (
        <Pressable
          key={option.key}
          style={[styles.chip, selected === option.key && styles.chipSelected]}
          onPress={() => onPress(option.key)}
        >
          <Text style={[styles.chipText, selected === option.key && styles.chipTextSelected]}>{option.label}</Text>
        </Pressable>
      ))}
    </View>
  );
}

function renderMultiSelectChips(
  options: Array<{ key: ContentCategory; label: string }>,
  selected: ContentCategory[],
  onToggle: (value: ContentCategory) => void,
) {
  return (
    <View style={[styles.chipRow, styles.wrap]}>
      {options.map((option) => {
        const isSelected = selected.includes(option.key);
        return (
          <Pressable
            key={option.key}
            style={[styles.chip, isSelected && styles.chipSelected]}
            onPress={() => onToggle(option.key)}
          >
            <Text style={[styles.chipText, isSelected && styles.chipTextSelected]}>{option.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

function renderLanguageChips(
  options: Array<{ key: LanguageOption; label: string }>,
  selected: LanguageOption,
  onSelect: (value: LanguageOption) => void,
) {
  return (
    <View style={styles.chipRow}>
      {options.map((option) => {
        const isSelected = selected === option.key;
        const isDisabled = !ENABLED_LANGUAGE_SET.has(option.key as MenuSelectionState['language']);
        return (
          <Pressable
            key={option.key}
            style={[styles.chip, isSelected && styles.chipSelected, isDisabled && styles.chipDisabled]}
            disabled={isDisabled}
            onPress={() => onSelect(option.key)}
          >
            <Text
              style={[
                styles.chipText,
                isSelected && styles.chipTextSelected,
                isDisabled && styles.chipTextDisabled,
              ]}
            >
              {option.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(8, 10, 14, 0.66)',
  },
  sheet: {
    backgroundColor: '#05080e',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingTop: 24,
    paddingHorizontal: 20,
    paddingBottom: 34,
    gap: 18,
  },
  content: {
    paddingBottom: 24,
    gap: 18,
  },
  section: {
    gap: 8,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  wrap: {
    justifyContent: 'flex-start',
  },
  chip: {
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.28)',
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  chipSelected: {
    backgroundColor: '#4cb8ff',
    borderColor: '#4cb8ff',
  },
  chipDisabled: {
    opacity: 0.28,
  },
  chipText: {
    color: 'rgba(255,255,255,0.84)',
    fontSize: 14,
    fontWeight: '600',
  },
  chipTextSelected: {
    color: '#f7fbff',
  },
  chipTextDisabled: {
    color: 'rgba(255,255,255,0.5)',
  },
  applyButton: {
    borderRadius: 18,
    backgroundColor: '#5fc6ff',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    marginTop: 8,
  },
  applyButtonText: {
    color: '#04121c',
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
});
