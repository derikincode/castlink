# CastLink 🖥️→📺

Screen sharing P2P direto no navegador, sem servidor de vídeo.  
Tecnologia: **React + Vite + WebRTC (PeerJS)**

---

## Início rápido

```bash
# 1. Instalar dependências
npm install

# 2. Rodar em desenvolvimento
npm run dev

# 3. Abrir no navegador
# http://localhost:5173
```

## Como usar

### No PC transmissor
1. Abra `http://localhost:5173` (ou o domínio publicado)
2. Aba **Transmitir**
3. Clique em **compartilhar tela** e escolha a janela ou monitor
4. Anote ou copie o **código de 6 letras**

### Na TV / tablet / outro dispositivo
1. Abra o mesmo endereço no navegador
2. Aba **Receber**
3. Digite o código de 6 letras
4. Clique em **conectar**
5. O stream aparece automaticamente — use **⛶ fullscreen** para tela cheia

---

## Arquitetura

```
src/
├── components/
│   ├── Sender.jsx       — captura de tela, controles, preview local
│   ├── Receiver.jsx     — vídeo remoto, fullscreen, input do código
│   ├── RoomCode.jsx     — exibe e copia o código da sala
│   ├── VideoFrame.jsx   — wrapper de <video> reutilizável
│   ├── StatsBar.jsx     — chips de resolução / fps / bitrate / latência
│   ├── StatusDot.jsx    — indicador de status animado
│   └── LogPanel.jsx     — log em tempo real
├── hooks/
│   ├── usePeer.js       — ciclo de vida do PeerJS
│   ├── useRTCStats.js   — polling de stats WebRTC a cada 1.5s
│   └── useLog.js        — estado append-only do log
├── lib/
│   └── rtc.js           — utilitários (ICE servers, geração de código, stats)
├── App.jsx              — layout, modo tabs, animações
├── main.jsx
└── index.css            — CSS variables, keyframes globais
```

## Deploy (Vercel / Netlify)

```bash
npm run build
# pasta dist/ pronta para deploy estático
```

Basta arrastar a pasta `dist/` no painel da Vercel ou Netlify.  
Não é necessário nenhum servidor backend — a sinalização usa os servidores públicos do PeerJS.

---

## Tecnologias

| Lib | Uso |
|-----|-----|
| React 18 | UI e gerenciamento de estado |
| Vite 5 | Dev server e build |
| PeerJS 1.5 | Abstração de WebRTC + sinalização |
| WebRTC | Transmissão P2P de vídeo/áudio |
| getDisplayMedia | Captura de tela nativa do navegador |

## Notas

- Funciona em Chrome, Edge, Firefox e Safari moderno
- `getDisplayMedia` requer HTTPS em produção (funciona em localhost sem HTTPS)
- Ambos os dispositivos precisam de internet para o handshake inicial via PeerJS
- Após conectar, o vídeo vai direto P2P — zero bandwidth de servidor
