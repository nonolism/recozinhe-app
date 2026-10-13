import { Pressable, ScrollView, StyleSheet, Text } from 'react-native';

import { colors, fonts } from '../theme';

// Abas "Todas / Sopas / Petiscos / Doces..." (rolam para o lado)
// Ordem das abas igual à do Figma; categorias novas vão para o fim
const ORDER = ['sopas', 'petiscos', 'doces', 'bebidas', 'pratos'];
const position = (slug) => (ORDER.includes(slug) ? ORDER.indexOf(slug) : ORDER.length);

export default function CategoryChips({ categories, selected, onSelect }) {
  const sorted = [...categories].sort((a, b) => position(a.slug) - position(b.slug));
  const options = [{ slug: '', name: 'Todas' }, ...sorted];
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.row}
      style={styles.scroll}
    >
      {options.map((category) => {
        const isActive = category.slug === selected;
        return (
          <Pressable
            key={category.slug || 'todas'}
            onPress={() => onSelect(category.slug)}
            style={[styles.chip, isActive && styles.chipActive]}
          >
            <Text style={[styles.text, isActive && styles.textActive]}>{category.name}</Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flexGrow: 0,
    marginHorizontal: -24,
  },
  row: {
    gap: 10,
    paddingHorizontal: 24,
  },
  chip: {
    backgroundColor: colors.white,
    borderRadius: 10,
    paddingHorizontal: 20,
    height: 34,
    justifyContent: 'center',
  },
  chipActive: {
    backgroundColor: colors.dark,
  },
  text: {
    fontFamily: fonts.title,
    fontSize: 15,
    color: colors.dark,
  },
  textActive: {
    color: colors.white,
  },
});
