import { Feather } from '@expo/vector-icons';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import { StatusBar } from 'expo-status-bar';
import { useRef, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import * as api from '../api';
import { PrimaryButton } from '../components/ui';
import { colors, fonts } from '../theme';

// Tela "Camera" do Figma: tira a foto (ou escolhe da galeria) e envia para a IA
export default function CameraScreen({ navigation }) {
  const cameraRef = useRef(null);
  const [permission, requestPermission] = useCameraPermissions();
  const [facing, setFacing] = useState('back');
  const [torch, setTorch] = useState(false);
  const [sending, setSending] = useState(false);

  async function send(uri, source) {
    setSending(true);
    try {
      const photo = await api.uploadPhoto(uri, source);
      // replace: ao voltar da tela de resultado, o usuário não cai de novo na câmera
      navigation.replace('PhotoResult', { photoId: photo.id, photo });
    } catch (error) {
      setSending(false);
      Alert.alert('Não foi possível analisar a foto', error.message);
    }
  }

  async function takePicture() {
    if (!cameraRef.current || sending) return;
    const picture = await cameraRef.current.takePictureAsync({ quality: 0.7 });
    send(picture.uri, 'camera');
  }

  async function pickFromGallery() {
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], quality: 0.7 });
    if (!result.canceled) send(result.assets[0].uri, 'galeria');
  }

  // Enquanto a IA analisa
  if (sending) {
    return (
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator size="large" color={colors.greenLight} />
        <Text style={styles.sendingTitle}>Analisando com IA...</Text>
        <Text style={styles.sendingText}>Estamos identificando o alimento e buscando receitas.</Text>
      </View>
    );
  }

  const hasPermission = permission?.granted;

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      {hasPermission && (
        <CameraView ref={cameraRef} style={StyleSheet.absoluteFill} facing={facing} enableTorch={torch} />
      )}

      <SafeAreaView style={styles.overlay}>
        {/* Topo: fechar, título e lanterna */}
        <View style={styles.top}>
          <Pressable style={styles.circle} onPress={() => navigation.goBack()}>
            <Text style={styles.close}>x</Text>
          </Pressable>
          <Text style={styles.title}>Fotografar</Text>
          <Pressable style={styles.circle} onPress={() => setTorch((value) => !value)}>
            <Feather name={torch ? 'zap' : 'zap-off'} size={18} color={colors.white} />
          </Pressable>
        </View>

        {/* Moldura verde */}
        {hasPermission ? (
          <View style={styles.frame} pointerEvents="none">
            <View style={[styles.corner, styles.topLeft]} />
            <View style={[styles.corner, styles.topRight]} />
            <View style={[styles.corner, styles.bottomLeft]} />
            <View style={[styles.corner, styles.bottomRight]} />
          </View>
        ) : (
          <View style={styles.permission}>
            <Text style={styles.permissionText}>
              Precisamos da sua permissão para usar a câmera. Você também pode escolher uma foto da galeria.
            </Text>
            <PrimaryButton title="Permitir câmera" color={colors.green} onPress={requestPermission} />
          </View>
        )}

        {/* Base: galeria, disparo, virar câmera */}
        <View style={styles.bottom}>
          <Pressable style={styles.gallery} onPress={pickFromGallery}>
            <Feather name="image" size={22} color={colors.dark} />
          </Pressable>
          <Pressable style={styles.shutter} onPress={takePicture} disabled={!hasPermission}>
            <View style={styles.shutterInner} />
          </Pressable>
          <Pressable
            style={[styles.circle, styles.bigCircle]}
            onPress={() => setFacing((value) => (value === 'back' ? 'front' : 'back'))}
          >
            <Feather name="refresh-cw" size={20} color={colors.white} />
          </Pressable>
        </View>
      </SafeAreaView>
    </View>
  );
}

const CORNER = 72;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.black },
  center: { alignItems: 'center', justifyContent: 'center', padding: 32 },
  overlay: { flex: 1, justifyContent: 'space-between' },
  top: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingTop: 16,
  },
  circle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(60,60,60,0.85)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bigCircle: { width: 52, height: 52, borderRadius: 26 },
  close: { color: colors.white, fontSize: 18, fontFamily: fonts.title },
  title: { color: colors.white, fontFamily: fonts.title, fontSize: 18 },
  frame: { alignSelf: 'center', width: '82%', aspectRatio: 1.05 },
  corner: { position: 'absolute', width: CORNER, height: CORNER, borderColor: colors.green },
  topLeft: { top: 0, left: 0, borderTopWidth: 4, borderLeftWidth: 4, borderTopLeftRadius: 4 },
  topRight: { top: 0, right: 0, borderTopWidth: 4, borderRightWidth: 4, borderTopRightRadius: 4 },
  bottomLeft: { bottom: 0, left: 0, borderBottomWidth: 4, borderLeftWidth: 4, borderBottomLeftRadius: 4 },
  bottomRight: { bottom: 0, right: 0, borderBottomWidth: 4, borderRightWidth: 4, borderBottomRightRadius: 4 },
  permission: { paddingHorizontal: 32, gap: 20 },
  permissionText: { color: colors.white, textAlign: 'center', fontSize: 15, lineHeight: 22 },
  bottom: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 40,
    paddingBottom: 32,
  },
  gallery: {
    width: 52,
    height: 52,
    borderRadius: 12,
    backgroundColor: colors.placeholder,
    alignItems: 'center',
    justifyContent: 'center',
  },
  shutter: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  shutterInner: { width: 76, height: 76, borderRadius: 38, backgroundColor: colors.red },
  sendingTitle: { color: colors.white, fontFamily: fonts.title, fontSize: 20, marginTop: 24 },
  sendingText: { color: colors.placeholder, textAlign: 'center', marginTop: 10, fontSize: 14 },
});
