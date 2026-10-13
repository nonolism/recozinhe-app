import { Feather } from '@expo/vector-icons';
import { Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors } from '../theme';

/**
 * Barra escura arredondada do Figma, com 4 ícones: início, câmera, receitas e perfil.
 * - active: qual ícone fica destacado ('home', 'recipes' ou 'profile')
 * - showBack: nas telas internas (ex.: Receita aberta) o 3º ícone vira "voltar",
 *   como no Figma.
 */
export default function BottomBar({ navigation, active, showBack = false }) {
  const insets = useSafeAreaInsets();
  const go = (screen) => navigation.navigate('Main', { screen });

  const items = [
    { key: 'home', icon: 'home', onPress: () => go('Home') },
    { key: 'camera', icon: 'camera', onPress: () => navigation.navigate('Camera') },
    showBack
      ? { key: 'back', icon: 'arrow-left-circle', onPress: () => navigation.goBack(), highlight: true }
      : { key: 'recipes', icon: 'file-text', onPress: () => go('Recipes') },
    { key: 'profile', icon: 'user', onPress: () => go('Profile') },
  ];

  return (
    <View style={[styles.wrapper, { bottom: Math.max(insets.bottom, 12) + 8 }]} pointerEvents="box-none">
      <View style={styles.bar}>
        {items.map((item) => {
          const isActive = item.highlight || item.key === active;
          return (
            <Pressable
              key={item.key}
              onPress={item.onPress}
              style={[styles.item, isActive && styles.itemActive]}
              accessibilityRole="button"
              accessibilityLabel={item.key}
            >
              <Feather name={item.icon} size={22} color={colors.white} />
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    left: 20,
    right: 20,
  },
  bar: {
    backgroundColor: colors.dark,
    borderRadius: 32,
    height: 62,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingHorizontal: 12,
  },
  item: {
    width: 50,
    height: 42,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemActive: {
    backgroundColor: colors.darkSoft,
  },
});
