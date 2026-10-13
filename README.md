# ReCozinhe — App (frontend)

App de celular do ReCozinhe, feito com **React Native + Expo** (JavaScript). Ele conversa com o backend
Django (`recozinhe-backend`) e segue as telas do Figma.

## Como rodar no seu celular

Você precisa de: **Node.js 20 ou superior** no computador e o app **Expo Go** no celular
(Play Store ou App Store). O celular e o computador precisam estar **na mesma rede Wi-Fi**.

**1. Ligue o backend** (em um terminal, na pasta `recozinhe-backend`, com o venv ativado):

```bash
python manage.py runserver 0.0.0.0:8000
```

O `0.0.0.0` é importante: sem ele o celular não consegue acessar o computador.
No Windows, se aparecer o aviso do Firewall, clique em **Permitir acesso**.

**2. Ligue o app** (em outro terminal, na pasta `recozinhe-app`):

```bash
npm install        # só na primeira vez
npx expo start
```

**3. Abra no celular:** aparece um QR code no terminal. No Android, leia com o próprio Expo Go;
no iPhone, leia com a câmera. O app abre no celular.

O app descobre sozinho o IP do computador. Se der erro de conexão, veja "Problemas comuns".

## Telas

| Tela do Figma | Arquivo |
|---|---|
| Login (+ Criar conta) | `src/screens/LoginScreen.js`, `RegisterScreen.js` |
| Tela Inicial | `src/screens/HomeScreen.js` |
| Câmera (câmera e galeria) | `src/screens/CameraScreen.js` |
| Resultado da foto (alimento identificado, receitas e dicas) | `src/screens/PhotoResultScreen.js` |
| Receitas e Receitas sugeridas | `src/screens/RecipesScreen.js` |
| Receita aberta | `src/screens/RecipeDetailScreen.js` |
| Perfil | `src/screens/ProfileScreen.js` |
| Histórico de Fotos | `src/screens/PhotoHistoryScreen.js` |
| Receitas feitas | `src/screens/CookedRecipesScreen.js` |

## Organização do código

```
App.js                  navegação entre as telas e controle de login
src/config.js           endereço do backend
src/api.js              todas as chamadas à API
src/auth.js             login, cadastro e token salvo no celular
src/theme.js            cores e fontes do Figma
src/format.js           formatação de kg, datas e tempo de preparo
src/components/         peças reutilizáveis (barra de navegação, card de receita, busca, abas, logo)
src/screens/            uma tela por arquivo
```

## Problemas comuns

- **"Não foi possível conectar ao servidor"**: confira se o backend está rodando com `0.0.0.0:8000`
  e se celular e computador estão na mesma rede. Se continuar, abra `src/config.js` e escreva o IP do
  computador em `MANUAL_API_URL`, por exemplo `'http://192.168.0.10:8000/api'`
  (no Windows, o IP aparece com o comando `ipconfig`, em "Endereço IPv4").
- **Rede da faculdade bloqueia a conexão entre aparelhos**: use o roteador do celular (hotspot)
  e conecte o computador nele.
- **Testar no navegador**: `npx expo start --web` abre o app no computador (a câmera não funciona
  no navegador, mas as outras telas sim).
