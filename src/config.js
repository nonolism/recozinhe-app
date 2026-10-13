import Constants from 'expo-constants';

/**
 * Endereço do backend (Django).
 *
 * Por padrão, o app descobre sozinho o IP do computador que está rodando o
 * "npx expo start" e usa a porta 8000 desse mesmo computador. Isso funciona
 * quando o backend roda na mesma máquina com:
 *
 *     python manage.py runserver 0.0.0.0:8000
 *
 * Se não funcionar (por exemplo, usando "--tunnel" ou backend em outro PC),
 * escreva o endereço aqui, ex.: 'http://192.168.0.10:8000/api'
 *
 * Com o backend hospedado no PythonAnywhere, use o endereço de lá:
 *   'https://SEUUSUARIO.pythonanywhere.com/api'
 * (obrigatório para gerar o APK: o app instalado não tem o computador por perto)
 */
const MANUAL_API_URL = 'https://ruanvitormoreno.pythonanywhere.com/api';

function detectApiUrl() {
  // hostUri vem como "192.168.0.10:8081" (IP do computador : porta do Expo)
  const hostUri = Constants.expoConfig?.hostUri;
  if (hostUri) {
    const ip = hostUri.split(':')[0];
    return `http://${ip}:8000/api`;
  }
  return 'http://127.0.0.1:8000/api';
}

export const API_URL = MANUAL_API_URL || detectApiUrl();
