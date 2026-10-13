import { useFocusEffect } from '@react-navigation/native';
import { useCallback, useState } from 'react';
import { Alert, FlatList, Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import * as api from '../api';
import BottomBar from '../components/BottomBar';
import { EmptyState, Loading, ScreenTitle } from '../components/ui';
import { shortDate } from '../format';
import { BOTTOM_BAR_SPACE, colors, fonts } from '../theme';

const STATUS_TEXT = {
  identificado: null,
  nao_alimento: 'Não é um alimento',
  falhou: 'Falha na análise',
};

// "Histórico de Fotos" (botão do Perfil): todas as fotos já analisadas
export default function PhotoHistoryScreen({ navigation }) {
  const [photos, setPhotos] = useState(null);

  useFocusEffect(
    useCallback(() => {
      api
        .getPhotos()
        .then(setPhotos)
        .catch((error) => {
          setPhotos([]);
          Alert.alert('Erro', error.message);
        });
    }, [])
  );

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <FlatList
        data={photos || []}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={styles.content}
        ListHeaderComponent={<ScreenTitle style={{ marginBottom: 24 }}>Histórico de Fotos</ScreenTitle>}
        ListEmptyComponent={
          photos === null ? <Loading /> : <EmptyState text="Você ainda não fotografou nenhum alimento." />
        }
        renderItem={({ item }) => (
          <Pressable style={styles.row} onPress={() => navigation.navigate('PhotoResult', { photoId: item.id })}>
            <Image source={{ uri: item.image }} style={styles.thumb} />
            <View style={{ flex: 1 }}>
              <Text style={styles.name}>
                {item.identified_ingredient?.name || STATUS_TEXT[item.status] || 'Foto'}
              </Text>
              <Text style={styles.date}>{shortDate(item.timestamp_create)}</Text>
            </View>
            {item.confidence != null && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{item.confidence}%</Text>
              </View>
            )}
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
    padding: 12,
    marginBottom: 12,
  },
  thumb: { width: 56, height: 56, borderRadius: 12, backgroundColor: colors.placeholder },
  name: { fontFamily: fonts.title, fontSize: 15, color: colors.dark },
  date: { color: colors.muted, fontSize: 12, marginTop: 4 },
  badge: { backgroundColor: colors.dark, borderRadius: 8, paddingHorizontal: 10, paddingVertical: 5 },
  badgeText: { color: colors.greenLight, fontSize: 12, fontFamily: fonts.title },
});
