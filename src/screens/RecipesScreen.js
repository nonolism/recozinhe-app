import { useFocusEffect } from '@react-navigation/native';
import { useCallback, useEffect, useRef, useState } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import * as api from '../api';
import BottomBar from '../components/BottomBar';
import CategoryChips from '../components/CategoryChips';
import RecipeCard from '../components/RecipeCard';
import SearchBar from '../components/SearchBar';
import { EmptyState, Loading, ScreenTitle } from '../components/ui';
import { BOTTOM_BAR_SPACE, colors } from '../theme';

/**
 * Telas "Receitas" e "Receitas sugeridas" do Figma.
 * As duas são iguais; muda só de onde vêm as receitas:
 *   suggested = false -> todas as receitas  (GET /api/recipes/)
 *   suggested = true  -> sugeridas pelas fotos (GET /api/recipes/suggested/)
 */
export default function RecipesScreen({ navigation, suggested = false }) {
  const [categories, setCategories] = useState([]);
  const [category, setCategory] = useState('');
  const [search, setSearch] = useState('');
  const [recipes, setRecipes] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api.getCategories().then(setCategories).catch(() => {});
  }, []);

  const load = useCallback(async () => {
    try {
      const fetcher = suggested ? api.getSuggestedRecipes : api.getRecipes;
      setRecipes(await fetcher({ category, search }));
      setError('');
    } catch (e) {
      setError(e.message);
      setRecipes([]);
    }
  }, [category, search, suggested]);

  // Espera o usuário parar de digitar (400 ms) antes de buscar
  useEffect(() => {
    const timer = setTimeout(load, 400);
    return () => clearTimeout(timer);
  }, [load]);

  // Atualiza ao voltar para a tela (sem atrapalhar a espera da busca acima)
  const loadRef = useRef(load);
  loadRef.current = load;
  const firstFocus = useRef(true);
  useFocusEffect(
    useCallback(() => {
      if (firstFocus.current) {
        firstFocus.current = false; // na primeira vez, o useEffect acima já carrega
        return;
      }
      loadRef.current();
    }, [])
  );

  const emptyText = suggested
    ? 'Nenhuma sugestão ainda. Fotografe um alimento para receber receitas.'
    : 'Nenhuma receita encontrada.';

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <FlatList
        data={recipes || []}
        keyExtractor={(item) => String(item.id)}
        numColumns={2}
        columnWrapperStyle={styles.row}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        ListHeaderComponent={
          <View style={styles.header}>
            <ScreenTitle>{suggested ? 'Receitas sugeridas' : 'Receitas'}</ScreenTitle>
            <SearchBar
              value={search}
              onChangeText={setSearch}
              placeholder={suggested ? 'Procure por receitas sugeridas' : 'Procure por receitas'}
            />
            <CategoryChips categories={categories} selected={category} onSelect={setCategory} />
            {!!error && <Text style={styles.error}>{error}</Text>}
          </View>
        }
        ListEmptyComponent={recipes === null ? <Loading /> : <EmptyState text={emptyText} />}
        renderItem={({ item }) => (
          <View style={styles.item}>
            <RecipeCard recipe={item} onPress={() => navigation.navigate('RecipeDetail', { recipeId: item.id })} />
          </View>
        )}
      />
      <BottomBar navigation={navigation} active="recipes" showBack={suggested} />
    </SafeAreaView>
  );
}

export function SuggestedRecipesScreen(props) {
  return <RecipesScreen {...props} suggested />;
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  content: { paddingHorizontal: 24, paddingTop: 40, paddingBottom: BOTTOM_BAR_SPACE },
  header: { gap: 20, marginBottom: 24 },
  row: { justifyContent: 'space-between', marginBottom: 20 },
  item: { width: '47%' },
  error: { color: colors.orange },
});
