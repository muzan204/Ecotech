# Push Notifications (PWA + Firebase)

## 1) Arquivos criados
- `index.html`
- `app.js`
- `service-worker.js`
- `manifest.json`

## 2) Configure no `app.js`
Preencha:
- `firebaseConfig` (apiKey, authDomain, projectId, storageBucket, messagingSenderId, appId)
- `VAPID_PUBLIC_KEY`

## 3) Assets (imagens)
Crie/coloque:
- `public/images/notification-icon.png`
- `public/images/notification-badge.png`

Neste projeto, como você está servindo a pasta raiz, coloque em:
- `images/notification-icon.png`
- `images/notification-badge.png`

## 4) Teste local
Use um servidor HTTP (ex: VSCode Live Server).

No Chrome:
- Application -> Service Workers -> verifique `service-worker.js`
- Application -> Notifications -> permissões

## 5) Teste via Firebase Console
Envie uma notificação de teste para o device token que o app imprimir no console.

