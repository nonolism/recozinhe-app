import { useEffect, useState } from 'react';
import { Alert, Image, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import * as api from '../api';
import BottomBar from '../components/BottomBar';
import { Loading, PrimaryButton, ScreenTitle } from '../components/ui';
import { formatKg, recipeMeta } from '../format';
import { BOTTOM_BAR_SPACE, colors, fonts } from '../theme';

// Tela "Receita aberta" do Figma (ex.: Geleia rápida de limão siciliano)
export default function RecipeDetailScreen({ navigation, route }) {
  const { recipeId, photoId } = route.params;
  const [recipe, setRecipe] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api
      .getRecipe(recipeId)
      .then(setRecipe)
      .catch((error) => Alert.alert('Erro', error.message));
  }, [recipeId]);

  // Registra o reaproveitamento: é isso que alimenta os números do Perfil
  async function markAsCooked() {
    setSaving(true);
    try {
      const body = { recipe: recipe.id };
      if (photoId) body.photo = photoId;
      const reuse = await api.registerReuse(body);
      Alert.alert('Parabéns!', `Você reaproveitou ${formatKg(reuse.saved_kg)} de alimento.`);
    } catch (error) {
      Alert.alert('Erro', error.message);
    } finally {
      setSaving(false);
    }
  }

  if (!recipe) {
    return (
      <View style={styles.safe}>
        <Loading />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content}>
        <ScreenTitle style={styles.title}>{recipe.title}</ScreenTitle>
        <Text style={styles.meta}>
          {recipe.category?.name} · {recipeMeta(recipe)}
          {recipe.source === 'ia' ? ' · Gerada por IA' : ''}
        </Text>

        {recipe.image ? (
          <Image source={{ uri: recipe.image }} style={styles.image} />
        ) : (
          <View style={styles.image} />
        )}

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Ingredientes</Text>
          {recipe.ingredients.map((item, index) => (
            <Text key={index} style={styles.bullet}>
              •  {item}
            </Text>
          ))}

          <Text style={[styles.cardTitle, { marginTop: 20 }]}>Modo de Preparo</Text>
          {recipe.preparation_steps.map((step, index) => (
            <Text key={index} style={styles.bullet}>
              •  {step}
            </Text>
          ))}
        </View>

        <PrimaryButton title="Fiz essa receita" onPress={markAsCooked} loading={saving} style={{ marginTop: 24 }} />
      </ScrollView>
      <BottomBar navigation={navigation} showBack />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  content: { paddingHorizontal: 24, paddingTop: 40, paddingBottom: BOTTOM_BAR_SPACE },
  title: { lineHeight: 34 },
  meta: { color: colors.muted, fontSize: 13, marginTop: 6 },
  image: {
    width: '100%',
    aspectRatio: 1.8,
    borderRadius: 22,
    borderWidth: 4,
    borderColor: colors.greenBorder,
    marginTop: 16,
    backgroundColor: colors.placeholder,
  },
  card: {
    marginTop: 24,
    borderWidth: 1,
    borderColor: colors.greenBorder,
    backgroundColor: '#F1EFE2',
    padding: 20,
  },
  cardTitle: { fontFamily: fonts.title, fontSize: 15, color: colors.black, marginBottom: 12 },
  bullet: { fontSize: 15, color: colors.black, lineHeight: 21, marginBottom: 2 },
});
