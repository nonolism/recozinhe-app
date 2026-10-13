// Peças simples de interface usadas em várias telas
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, fonts } from '../theme';

export function PrimaryButton({ title, onPress, loading, color = colors.dark, icon, style }) {
  return (
    <Pressable
      onPress={onPress}
      disabled={loading}
      style={({ pressed }) => [
        styles.button,
        { backgroundColor: color, opacity: pressed || loading ? 0.8 : 1 },
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={colors.white} />
      ) : (
        <View style={styles.buttonContent}>
          {icon}
          <Text style={styles.buttonText}>{title}</Text>
        </View>
      )}
    </Pressable>
  );
}

export function ScreenTitle({ children, style }) {
  return <Text style={[styles.title, style]}>{children}</Text>;
}

export function Loading() {
  return (
    <View style={styles.center}>
      <ActivityIndicator size="large" color={colors.green} />
    </View>
  );
}

export function EmptyState({ text }) {
  return <Text style={styles.empty}>{text}</Text>;
}

const styles = StyleSheet.create({
  button: {
    height: 52,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  buttonText: {
    color: colors.white,
    fontFamily: fonts.title,
    fontSize: 16,
  },
  title: {
    fontFamily: fonts.title,
    fontSize: 28,
    color: colors.dark,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  empty: {
    color: colors.muted,
    fontSize: 14,
    textAlign: 'center',
    paddingVertical: 32,
    paddingHorizontal: 16,
    lineHeight: 20,
  },
});
