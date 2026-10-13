import { Feather } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { useCallback, useState } from 'react';
import { Alert, Image, Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';

import * as api from '../api';
import { useAuth } from '../auth';
import { Loading } from '../components/ui';
import { formatKg, monthYear } from '../format';
import { BOTTOM_BAR_SPACE, colors, fonts } from '../theme';

// Ícone e cor de cada conquista, como no Figma
const ACHIEVEMENT_STYLE = {
  star: { icon: 'star', color: colors.muted, background: '#ECEBDF' },
  heart: { icon: 'heart', color: '#E5484D', background: colors.pink },
  check: { icon: 'check', color: '#3E9B1F', background: '#E6F2DC' },
};

// Tela "Perfil" do Figma
export default function ProfileScreen({ navigation }) {
  const { signOut } = useAuth();
  const [profile, setProfile] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    try {
      setProfile(await api.getProfile());
    } catch (error) {
      Alert.alert('Erro', error.message);
    }
  }, []);

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

  function confirmSignOut() {
    Alert.alert('Sair', 'Deseja sair da sua conta?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Sair', style: 'destructive', onPress: signOut },
    ]);
  }

  if (!profile) {
    return (
      <View style={styles.screen}>
        <Loading />
      </View>
    );
  }

  const { stats } = profile;
  const name = [profile.first_name, profile.last_name].filter(Boolean).join(' ') || profile.username;
  const initials = name.slice(0, 1).toUpperCase();

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={{ paddingBottom: BOTTOM_BAR_SPACE }}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refresh} />}
    >
      {/* Faixa escura do topo + foto do perfil */}
      <View style={styles.banner}>
        <Pressable style={styles.logout} onPress={confirmSignOut} accessibilityLabel="Sair">
          <Feather name="log-out" size={18} color={colors.white} />
        </Pressable>
      </View>
      <View style={styles.avatarBox}>
        {profile.avatar ? (
          <Image source={{ uri: profile.avatar }} style={styles.avatar} />
        ) : (
          <View style={[styles.avatar, styles.avatarEmpty]}>
            <Text style={styles.initials}>{initials}</Text>
          </View>
        )}
      </View>

      <View style={styles.body}>
        <Text style={styles.name}>{name}</Text>
        <Text style={styles.since}>Reduzindo o desperdício desde {monthYear(profile.member_since)}</Text>

        {/* Card de impacto */}
        <View style={styles.statsCard}>
          <ProgressRing
            percent={stats.monthly_goal_percent}
            value={formatKg(stats.saved_kg_month)}
            goal={`de ${formatKg(stats.monthly_goal_kg).replace(',0', '')}`}
          />
          <View style={styles.statsList}>
            <StatRow label="Receitas feitas" value={stats.recipes_cooked} />
            <StatRow label="Dias seguidos" value={stats.streak_days} />
            <StatRow label="Meta mensal" value={`${stats.monthly_goal_percent}%`} />
          </View>
        </View>

        {/* Conquistas */}
        <Text style={styles.sectionTitle}>Conquistas</Text>
        <View style={styles.achievements}>
          {stats.achievements.map((achievement) => {
            const look = ACHIEVEMENT_STYLE[achievement.icon] || ACHIEVEMENT_STYLE.star;
            return (
              <View key={achievement.code} style={[styles.achievement, !achievement.unlocked && styles.locked]}>
                <View style={[styles.achievementIcon, { backgroundColor: look.background }]}>
                  <Feather name={look.icon} size={18} color={look.color} />
                </View>
                <Text style={styles.achievementText}>{achievement.title}</Text>
              </View>
            );
          })}
        </View>

        {/* Atalhos */}
        <MenuButton
          icon="file-text"
          iconColor="#3E9B1F"
          background="#E6F2DC"
          title="Receitas feitas"
          onPress={() => navigation.navigate('CookedRecipes')}
        />
        <MenuButton
          icon="camera"
          iconColor={colors.orange}
          background={colors.pink}
          title="Histórico de Fotos"
          onPress={() => navigation.navigate('PhotoHistory')}
        />
      </View>
    </ScrollView>
  );
}

// Anel verde com os kg do mês em relação à meta
function ProgressRing({ percent, value, goal }) {
  const size = 104;
  const stroke = 8;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = Math.min(Math.max(percent, 0), 100) / 100;

  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <Svg width={size} height={size} style={StyleSheet.absoluteFill}>
        <Circle cx={size / 2} cy={size / 2} r={radius} stroke="#3A362E" strokeWidth={stroke} fill="none" />
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={colors.greenLight}
          strokeWidth={stroke}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={`${circumference} ${circumference}`}
          strokeDashoffset={circumference * (1 - progress)}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </Svg>
      <Text style={styles.ringValue}>{value}</Text>
      <Text style={styles.ringGoal}>{goal}</Text>
    </View>
  );
}

function StatRow({ label, value }) {
  return (
    <View style={styles.statRow}>
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={styles.statValue}>{value}</Text>
    </View>
  );
}

function MenuButton({ icon, iconColor, background, title, onPress }) {
  return (
    <Pressable style={styles.menuButton} onPress={onPress}>
      <View style={[styles.menuIcon, { backgroundColor: background }]}>
        <Feather name={icon} size={18} color={iconColor} />
      </View>
      <Text style={styles.menuText}>{title}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  banner: {
    height: 180,
    backgroundColor: colors.dark,
    marginHorizontal: 20,
    borderBottomLeftRadius: 18,
    borderBottomRightRadius: 18,
  },
  logout: { position: 'absolute', top: 56, right: 16, padding: 8 },
  avatarBox: { marginTop: -56, marginLeft: 50 },
  avatar: { width: 108, height: 108, borderRadius: 20, borderWidth: 5, borderColor: colors.white },
  avatarEmpty: { backgroundColor: colors.greenBorder, alignItems: 'center', justifyContent: 'center' },
  initials: { fontFamily: fonts.title, fontSize: 40, color: colors.white },
  body: { paddingHorizontal: 32 },
  name: { fontFamily: fonts.title, fontSize: 26, color: colors.black, marginTop: 16, letterSpacing: 1 },
  since: { color: colors.muted, fontSize: 14, marginTop: 6, letterSpacing: 0.5 },
  statsCard: {
    marginTop: 28,
    marginHorizontal: -12,
    backgroundColor: colors.dark,
    borderRadius: 16,
    paddingVertical: 32,
    paddingHorizontal: 24,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 20,
  },
  ringValue: { fontFamily: fonts.title, color: colors.white, fontSize: 18 },
  ringGoal: { color: colors.muted, fontSize: 12 },
  statsList: { flex: 1, gap: 14 },
  statRow: { flexDirection: 'row', justifyContent: 'space-between' },
  statLabel: { color: colors.greenLabel, fontSize: 12, opacity: 0.8 },
  statValue: { color: colors.greenLight, fontFamily: fonts.title, fontSize: 14 },
  sectionTitle: { fontFamily: fonts.title, fontSize: 21, color: colors.black, marginTop: 32, marginBottom: 14 },
  achievements: { flexDirection: 'row', gap: 12 },
  achievement: { flex: 1, backgroundColor: colors.white, borderRadius: 12, padding: 14, minHeight: 100 },
  locked: { opacity: 0.4 },
  achievementIcon: { width: 36, height: 36, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  achievementText: { fontSize: 11, color: colors.black, marginTop: 12, fontFamily: fonts.medium },
  menuButton: {
    marginTop: 18,
    backgroundColor: colors.white,
    borderRadius: 16,
    height: 72,
    paddingHorizontal: 28,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 18,
  },
  menuIcon: { width: 36, height: 36, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  menuText: { fontFamily: fonts.medium, fontSize: 16, color: colors.black },
});
