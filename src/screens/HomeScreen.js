import { Feather } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { useCallback, useState } from 'react';
import { FlatList, Image, Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import * as api from '../api';
import Logo from '../components/Logo';
import RecipeCard from '../components/RecipeCard';
import { EmptyState } from '../components/ui';
import { BOTTOM_BAR_SPACE, colors, fonts } from '../theme';

// "Tela Inicial" do Figma
export default function HomeScreen({ navigation }) {
  const [latest, setLatest] = useState(null);
  const [recipes, setRecipes] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    try {
      const [photo, suggested] = await Promise.all([api.getLatestPhoto(), api.getSuggestedRecipes()]);
      setLatest(photo);
      setRecipes(suggested);
      setError('');
    } catch (e) {
      setError(e.message);
    }
  }, []);

  // Recarrega sempre que a tela volta a aparecer (ex.: depois de tirar uma foto)
  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  async function refresh() {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refresh} />}
      >
        {/* Cabeçalho: logo + sino */}
        <View style={styles.header}>
          <View style={styles.brand}>
            <Logo size={40} />
            <Text style={styles.brandText}>
              Re<Text style={{ color: colors.green }}>Cozinhe</Text>
            </Text>
          </View>
          <View style={styles.bell}>
            <Feather name="bell" size={20} color={colors.white} />
          </View>
        </View>

        {/* Card escuro "Zero desperdício" */}
        <View style={styles.hero}>
          <View style={styles.sticker}>
            <Text style={styles.stickerText}>foto</Text>
          </View>
          <Text style={styles.heroLabel}>ZERO DESPERDÍCIO</Text>
          <Text style={styles.heroTitle}>Antes de descartar, descubra o que ainda pode se aproveitar</Text>
          <Text style={styles.heroText}>
            Fotografe o que sobrou, o que vai vencer ou o que seria descartado. A gente te mostra o que fazer.
          </Text>
          <Pressable style={styles.heroButton} onPress={() => navigation.navigate('Camera')}>
            <Feather name="camera" size={18} color={colors.white} />
            <Text style={styles.heroButtonText}>Fotografar</Text>
          </Pressable>
        </View>

        {!!error && <Text style={styles.error}>{error}</Text>}

        {/* Último alimento identificado */}
        {latest ? (
          <Pressable
            style={styles.identified}
            onPress={() => navigation.navigate('PhotoResult', { photoId: latest.id })}
          >
            <Image source={{ uri: latest.image }} style={styles.thumb} />
            <View style={{ flex: 1 }}>
              <Text style={styles.identifiedLabel}>IDENTIFICADO AGORA</Text>
              <Text style={styles.identifiedName}>{latest.identified_ingredient?.name}</Text>
            </View>
            {latest.confidence != null && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{latest.confidence}%</Text>
              </View>
            )}
          </Pressable>
        ) : (
          <View style={styles.identified}>
            <View style={styles.thumb} />
            <View style={{ flex: 1 }}>
              <Text style={styles.identifiedLabel}>IDENTIFICADO AGORA</Text>
              <Text style={styles.identifiedName}>Nenhum alimento ainda</Text>
            </View>
          </View>
        )}

        {/* Receitas sugeridas */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Receitas sugeridas</Text>
          <Pressable onPress={() => navigation.navigate('Suggested')}>
            <Text style={styles.seeAll}>ver todas →</Text>
          </Pressable>
        </View>

        {recipes.length === 0 ? (
          <EmptyState text="Fotografe um alimento para ver receitas que reaproveitam ele." />
        ) : (
          <FlatList
            horizontal
            data={recipes}
            keyExtractor={(item) => String(item.id)}
            showsHorizontalScrollIndicator={false}
            style={styles.carousel}
            contentContainerStyle={{ gap: 16, paddingHorizontal: 24 }}
            renderItem={({ item }) => (
              <RecipeCard
                recipe={item}
                width={150}
                onPress={() => navigation.navigate('RecipeDetail', { recipeId: item.id })}
              />
            )}
          />
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  content: { paddingHorizontal: 24, paddingTop: 24, paddingBottom: BOTTOM_BAR_SPACE },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  brand: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  brandText: { fontFamily: fonts.title, fontSize: 22, color: colors.dark },
  bell: {
    width: 48,
    height: 40,
    borderRadius: 12,
    backgroundColor: colors.dark,
    alignItems: 'center',
    justifyContent: 'center',
  },
  hero: {
    marginTop: 28,
    backgroundColor: colors.dark,
    borderRadius: 20,
    padding: 24,
    paddingBottom: 44,
    marginBottom: 32,
  },
  sticker: {
    position: 'absolute',
    top: -6,
    right: 24,
    width: 62,
    height: 52,
    borderRadius: 10,
    backgroundColor: colors.sticker,
    transform: [{ rotate: '12deg' }],
    alignItems: 'center',
    justifyContent: 'center',
  },
  stickerText: { color: colors.greenLabel, fontSize: 10 },
  heroLabel: { fontFamily: fonts.medium, color: colors.greenLabel, letterSpacing: 2, fontSize: 15 },
  heroTitle: { fontFamily: fonts.medium, color: colors.white, fontSize: 24, lineHeight: 32, marginTop: 16 },
  heroText: { color: colors.white, fontSize: 14, lineHeight: 19, marginTop: 24 },
  heroButton: {
    position: 'absolute',
    left: 24,
    bottom: -22,
    backgroundColor: colors.orange,
    borderRadius: 12,
    height: 46,
    paddingHorizontal: 22,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  heroButtonText: { color: colors.white, fontFamily: fonts.title, fontSize: 15 },
  error: { color: colors.orange, marginBottom: 12 },
  identified: { flexDirection: 'row', alignItems: 'center', gap: 14, marginTop: 12 },
  thumb: { width: 44, height: 44, borderRadius: 10, backgroundColor: '#BDB49D' },
  identifiedLabel: { color: colors.muted, fontSize: 11, letterSpacing: 1 },
  identifiedName: { fontFamily: fonts.title, color: colors.dark, fontSize: 15, marginTop: 2 },
  badge: { backgroundColor: colors.dark, borderRadius: 8, paddingHorizontal: 10, paddingVertical: 5 },
  badgeText: { color: colors.greenLight, fontSize: 12, fontFamily: fonts.title },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 36,
    marginBottom: 16,
  },
  sectionTitle: { fontFamily: fonts.title, fontSize: 19, color: colors.black },
  seeAll: { color: colors.green, fontSize: 13 },
  carousel: { marginHorizontal: -24 },
});
