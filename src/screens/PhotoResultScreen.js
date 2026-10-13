import { useEffect, useState } from 'react';
import { Alert, Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import * as api from '../api';
import BottomBar from '../components/BottomBar';
import RecipeCard from '../components/RecipeCard';
import { EmptyState, Loading, PrimaryButton, ScreenTitle } from '../components/ui';
import { formatKg } from '../format';
import { BOTTOM_BAR_SPACE, colors, fonts } from '../theme';

/**
 * Resultado da análise de uma foto: o alimento identificado pela IA,
 * as receitas sugeridas e as formas de reaproveitamento.
 * Usa o mesmo visual da tela "Receita aberta" do Figma.
 */
export default function PhotoResultScreen({ navigation, route }) {
  const { photoId } = route.params;
  const [photo, setPhoto] = useState(route.params.photo || null);
  const [savingTip, setSavingTip] = useState(null);

  useEffect(() => {
    if (!photo) {
      api
        .getPhoto(photoId)
        .then(setPhoto)
        .catch((error) => Alert.alert('Erro', error.message));
    }
  }, [photoId]);

  async function followTip(tip) {
    setSavingTip(tip.id);
    try {
      const reuse = await api.registerReuse({ tip: tip.id });
      Alert.alert('Boa!', `Você reaproveitou ${formatKg(reuse.saved_kg)} de alimento.`);
    } catch (error) {
      Alert.alert('Erro', error.message);
    } finally {
      setSavingTip(null);
    }
  }

  if (!photo) {
    return (
      <View style={styles.safe}>
        <Loading />
      </View>
    );
  }

  const identified = photo.status === 'identificado';
  const food = photo.identified_ingredient?.name;

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content}>
        <ScreenTitle>{identified ? food : 'Não identificamos o alimento'}</ScreenTitle>

        <Image source={{ uri: photo.image }} style={styles.image} />

        {identified ? (
          <View style={styles.card}>
            <Info label="Certeza da IA" value={photo.confidence != null ? `${photo.confidence}%` : '—'} />
            {!!photo.food_part && <Info label="Parte" value={photo.food_part} />}
            {!!photo.condition && <Info label="Estado" value={photo.condition} />}
            {!!photo.estimated_weight_g && <Info label="Peso aproximado" value={`${photo.estimated_weight_g} g`} />}
            {!!photo.ai_message && <Text style={styles.message}>{photo.ai_message}</Text>}
          </View>
        ) : (
          <View style={styles.card}>
            <Text style={styles.message}>{photo.ai_message || 'Tente fotografar o alimento mais de perto.'}</Text>
            <PrimaryButton
              title="Tirar outra foto"
              color={colors.orange}
              onPress={() => navigation.replace('Camera')}
              style={{ marginTop: 16 }}
            />
          </View>
        )}

        {identified && (
          <>
            <Text style={styles.sectionTitle}>Receitas sugeridas</Text>
            {photo.suggested_recipes.length === 0 ? (
              <EmptyState text="Nenhuma receita para este alimento." />
            ) : (
              <View style={styles.grid}>
                {photo.suggested_recipes.map((recipe) => (
                  <View key={recipe.id} style={styles.gridItem}>
                    <RecipeCard
                      recipe={recipe}
                      onPress={() => navigation.navigate('RecipeDetail', { recipeId: recipe.id, photoId: photo.id })}
                    />
                  </View>
                ))}
              </View>
            )}

            {photo.reuse_tips.length > 0 && (
              <>
                <Text style={styles.sectionTitle}>Outras formas de reaproveitar</Text>
                {photo.reuse_tips.map((tip) => (
                  <View key={tip.id} style={styles.tip}>
                    <Text style={styles.tipTitle}>{tip.title}</Text>
                    <Text style={styles.tipText}>{tip.description}</Text>
                    <Pressable onPress={() => followTip(tip)} disabled={savingTip === tip.id}>
                      <Text style={styles.tipButton}>
                        {savingTip === tip.id ? 'Salvando...' : 'Segui essa dica ✓'}
                      </Text>
                    </Pressable>
                  </View>
                ))}
              </>
            )}
          </>
        )}
      </ScrollView>
      <BottomBar navigation={navigation} showBack />
    </SafeAreaView>
  );
}

function Info({ label, value }) {
  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  content: { paddingHorizontal: 24, paddingTop: 40, paddingBottom: BOTTOM_BAR_SPACE },
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
    gap: 10,
  },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', gap: 16 },
  infoLabel: { color: colors.muted, fontSize: 14 },
  infoValue: { color: colors.dark, fontSize: 14, fontFamily: fonts.medium, flexShrink: 1, textAlign: 'right' },
  message: { color: colors.dark, fontSize: 14, lineHeight: 20 },
  sectionTitle: { fontFamily: fonts.title, fontSize: 19, color: colors.black, marginTop: 32, marginBottom: 16 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', rowGap: 20 },
  gridItem: { width: '47%' },
  tip: { backgroundColor: colors.white, borderRadius: 16, padding: 18, marginBottom: 12 },
  tipTitle: { fontFamily: fonts.title, fontSize: 15, color: colors.dark },
  tipText: { color: colors.muted, fontSize: 14, lineHeight: 20, marginTop: 6 },
  tipButton: { color: colors.green, fontFamily: fonts.title, fontSize: 14, marginTop: 12 },
});
