import { Feather } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { useCallback, useState } from 'react';
import { Alert, FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import * as api from '../api';
import BottomBar from '../components/BottomBar';
import { EmptyState, Loading, ScreenTitle } from '../components/ui';
import { formatKg, shortDate } from '../format';
import { BOTTOM_BAR_SPACE, colors, fonts } from '../theme';

// "Receitas feitas" (botão do Perfil): tudo o que o usuário já reaproveitou
export default function CookedRecipesScreen({ navigation }) {
  const [reuses, setReuses] = useState(null);

  useFocusEffect(
    useCallback(() => {
      api
        .getReuses()
        .then(setReuses)
        .catch((error) => {
          setReuses([]);
          Alert.alert('Erro', error.message);
        });
    }, [])
  );

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <FlatList
        data={reuses || []}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={styles.content}
        ListHeaderComponent={<ScreenTitle style={{ marginBottom: 24 }}>Receitas feitas</ScreenTitle>}
        ListEmptyComponent={
          reuses === null ? (
            <Loading />
          ) : (
            <EmptyState text='Quando você fizer uma receita, toque em "Fiz essa receita" para ela aparecer aqui.' />
          )
        }
        renderItem={({ item }) => (
          <Pressable
            style={styles.row}
            disabled={!item.recipe}
            onPress={() => navigation.navigate('RecipeDetail', { recipeId: item.recipe })}
          >
            <View style={styles.icon}>
              <Feather name={item.recipe ? 'file-text' : 'refresh-cw'} size={18} color="#3E9B1F" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.name}>{item.recipe_detail?.title || 'Dica de reaproveitamento'}</Text>
              <Text style={styles.date}>{shortDate(item.reused_at)}</Text>
            </View>
            <Text style={styles.kg}>{formatKg(item.saved_kg)}</Text>
          </Pressable>
        )}
      />
      <BottomBar navigation={navigation} showBack />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  content: { paddingHorizontal: 24, paddingTop: 40, paddingBottom: BOTTOM_BAR_SPACE },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },
  icon: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: '#E6F2DC',
    alignItems: 'center',
    justifyContent: 'center',
  },
  name: { fontFamily: fonts.title, fontSize: 15, color: colors.dark },
  date: { color: colors.muted, fontSize: 12, marginTop: 4 },
  kg: { fontFamily: fonts.title, color: colors.green, fontSize: 14 },
});
