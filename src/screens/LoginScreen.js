import { useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useAuth } from '../auth';
import Logo from '../components/Logo';
import { PrimaryButton } from '../components/ui';
import { colors, fonts } from '../theme';

// Tela "Login" do Figma
export default function LoginScreen({ navigation }) {
  const { signIn } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleLogin() {
    if (!username || !password) {
      Alert.alert('Atenção', 'Preencha usuário e senha.');
      return;
    }
    setLoading(true);
    try {
      await signIn(username.trim(), password);
    } catch (error) {
      Alert.alert('Não foi possível entrar', error.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <View style={styles.header}>
            <Logo size={64} />
            <Text style={styles.title}>Bem-vindo de volta</Text>
            <Text style={styles.subtitle}>
              Entre para continuar salvando comida{'\n'}e reduzindo desperdício.
            </Text>
          </View>

          <Text style={styles.label}>USUÁRIO</Text>
          <TextInput
            style={styles.input}
            value={username}
            onChangeText={setUsername}
            autoCapitalize="none"
            autoCorrect={false}
          />

          <Text style={[styles.label, { marginTop: 24 }]}>SENHA</Text>
          <TextInput style={styles.input} value={password} onChangeText={setPassword} secureTextEntry />

          <Pressable
            onPress={() =>
              Alert.alert('Esqueci minha senha', 'Para recuperar a senha, procure o administrador do sistema.')
            }
          >
            <Text style={styles.forgot}>Esqueci minha senha</Text>
          </Pressable>

          <PrimaryButton title="Entrar" onPress={handleLogin} loading={loading} style={{ marginTop: 28 }} />

          <Pressable onPress={() => navigation.navigate('Register')} style={styles.footer}>
            <Text style={styles.footerText}>
              Não tem conta? <Text style={styles.footerLink}>Criar conta</Text>
            </Text>
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

export const authStyles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  content: { flexGrow: 1, justifyContent: 'center', paddingHorizontal: 32, paddingVertical: 40 },
  header: { alignItems: 'center', marginBottom: 40 },
  title: { fontFamily: fonts.title, fontSize: 26, color: colors.black, marginTop: 28 },
  subtitle: { color: colors.muted, fontSize: 15, textAlign: 'center', marginTop: 16, lineHeight: 22 },
  label: { fontFamily: fonts.medium, fontSize: 13, color: colors.muted, marginBottom: 8, letterSpacing: 0.5 },
  input: {
    backgroundColor: colors.white,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    height: 52,
    paddingHorizontal: 16,
    fontSize: 16,
    color: colors.dark,
  },
  forgot: { color: colors.green, fontSize: 13, textAlign: 'right', marginTop: 14 },
  footer: { marginTop: 24, alignItems: 'center' },
  footerText: { color: colors.greenLabel, fontSize: 13 },
  footerLink: { color: colors.orange },
});

const styles = authStyles;
