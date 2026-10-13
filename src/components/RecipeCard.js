import { Image, Pressable, StyleSheet, Text, View } from 'react-native';

import { recipeMeta } from '../format';
import { colors } from '../theme';

// Card de receita: imagem, categoria, título e "20 min - Fácil"
export default function RecipeCard({ recipe, onPress, width }) {
  return (
    <Pressable onPress={onPress} style={[styles.card, width && { width }]}>
      {recipe.image ? (
        <Image source={{ uri: recipe.image }} style={styles.image} />
      ) : (
        <View style={styles.image} />
      )}
      <Text style={styles.category}>{recipe.category?.name?.toUpperCase()}</Text>
      <Text style={styles.title} numberOfLines={2}>
        {recipe.title}
      </Text>
      <Text style={styles.meta}>{recipeMeta(recipe)}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
  },
  image: {
    width: '100%',
    aspectRatio: 1.25,
    borderRadius: 14,
    backgroundColor: colors.placeholder,
  },
  category: {
    marginTop: 10,
    fontSize: 11,
    letterSpacing: 0.5,
    color: colors.greenLabel,
  },
  title: {
    marginTop: 4,
    fontSize: 13,
    color: colors.dark,
    lineHeight: 17,
  },
  meta: {
    marginTop: 6,
    fontSize: 11,
    color: colors.muted,
  },
});
