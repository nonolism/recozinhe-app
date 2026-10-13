import { useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useAuth } from '../auth';
import Logo from '../components/Logo';
import { PrimaryButton } from '../components/ui';
import { authStyles as styles } from './LoginScreen';

// Tela "Criar conta" (link da tela de Login), no mesmo visual do Login
export default function RegisterScreen({ navigation }) {
  const { signUp } = useAuth();
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleRegister() {
    if (!name || !username || !password) {
      Alert.alert('Atenção', 'Preencha nome, usuário e senha.');
      return;
    }
    const [firstName, ...rest] = name.trim().split(' ');
    setLoading(true);
    try {
      await signUp({
        first_name: firstName,
        last_name: rest.join(' '),
        username: username.trim(),
        email: email.trim(),
        password,
      });
    } catch (error) {
      Alert.alert('Não foi possível criar a conta', error.message);
    } finally {
      setLoading(false);
    }
  }

  const fields = [
    { label: 'NOME', value: name, onChange: setName, props: { autoCapitalize: 'words' } },
    { label: 'USUÁRIO', value: username, onChange: setUsername, props: { autoCapitalize: 'none', autoCorrect: false } },
    { label: 'E-MAIL', value: email, onChange: setEmail, props: { autoCapitalize: 'none', keyboardType: 'email-address' } },
    { label: 'SENHA', value: password, onChange: setPassword, props: { secureTextEntry: true } },
  ];

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <View style={[styles.header, { marginBottom: 28 }]}>
            <Logo size={56} />
            <Text style={styles.title}>Criar conta</Text>
            <Text style={styles.subtitle}>Comece a salvar comida{'\n'}e reduzir desperdício.</Text>
          </View>

          {fields.map((field, index) => (
            <View key={field.label} style={{ marginTop: index ? 18 : 0 }}>
              <Text style={styles.label}>{field.label}</Text>
              <TextInput style={styles.input} value={field.value} onChangeText={field.onChange} {...field.props} />
            </View>
          ))}

          <PrimaryButton title="Criar conta" onPress={handleRegister} loading={loading} style={{ marginTop: 28 }} />

          <Pressable onPress={() => navigation.goBack()} style={styles.footer}>
            <Text style={styles.footerText}>
              Já tem conta? <Text style={styles.footerLink}>Entrar</Text>
            </Text>
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
