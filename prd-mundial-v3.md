# PRD — Matchfeel.com / Vibra.live
## v4 — MVP vendible, testeable, enterprise-ready

---

## Objetivo
PWA de reacciones en tiempo real para partidos del Mundial 2026. El mapa global de sentimiento es el producto central. Todo lo demás — reacciones, chat, fixture — es input para el mapa o output de él. Al finalizar cada partido, el usuario recibe un receipt personal de lo que vivió.

## Contexto
El Mundial 2026 empieza en junio. La segunda pantalla durante los partidos ya existe — el teléfono en la mano. Este producto ocupa ese espacio con fricción mínima: Google OAuth en un toque, reacción en un toque. El diferenciador real no son los botones — es el único dataset en tiempo real de sentimiento emocional humano geolocalizado por partido de fútbol. Ese dato no existe en ningún otro lugar.

## Principio de diseño central (Ive)
El mapa no es una vista. Es el fondo permanente de toda la experiencia. Cada pantalla — fixture, partido, perfil — existe sobre el mapa. El mapa nunca desaparece.

## Hook model (Eyal)
- **Trigger:** push notification antes del partido
- **Action:** reaccionar en tiempo real
- **Reward variable:** ver el mapa del mundo moverse con vos
- **Investment:** el receipt personal — lo que viviste en ese partido, guardado, tuyo

---

## Use case central

1. Usuario entra a la PWA — ve el mapa global en vivo como fondo
2. Google OAuth en un toque
3. Entra a un partido → elige equipo
4. Toca botones de reacción durante el partido
5. Participa en el chat efímero del partido
6. Al finalizar: recibe su receipt personal
7. Comparte el receipt → tráfico orgánico
8. Push notification lo trae al próximo partido

---

## Stack técnico

- **Frontend:** Next.js 14 (App Router) + Tailwind + next-pwa
- **Backend/DB:** Supabase — Postgres + Realtime + Auth
- **Auth:** Supabase Auth con Google OAuth provider
- **Deploy:** Vercel
- **Push notifications:** Web Push API + Supabase Edge Functions
- **Live match data:** API-Football
- **Geolocalización:** IP-API.com (gratis, sin registro)
- **Mapa:** react-simple-maps + GeoJSON países
- **Chat:** Supabase Realtime
- **Receipt image:** Satori (server-side image gen — más rápido que html2canvas)
- **Moderación:** lista de palabras bloqueadas configurable desde admin + auto-ban
- **Widget embed:** iframe con parámetros públicos, sin auth requerida
- **Media kit:** PDF autogenerado server-side con métricas por partido

---

## Arquitectura de datos

### Principio de datos (Brin)
Las reacciones **nunca se borran**. Son el activo del producto. El schema se diseña desde el día uno para ser consultable, filtrable y exportable. El chat se borra — las reacciones no.

### Tablas Supabase

```sql
matches
  id, home_team, away_team, home_logo, away_logo,
  kickoff_at, status, home_score, away_score,
  api_football_id, group_stage, round

reactions
  id, match_id, user_id, reaction_type, country_code,
  team_supported, match_minute, created_at
  -- NUNCA se borra. Es el dataset.

match_events
  id, match_id, event_type, event_minute,
  team, player_name, created_at
  -- Goles, tarjetas, etc. desde API-Football
  -- Permite cruzar reacciones con eventos reales del partido

chat_messages
  id, match_id, user_id, display_name, avatar_url,
  body, is_blocked, created_at
  -- TTL: se borran 24hs post partido via pg_cron
  -- is_blocked: mensajes bloqueados por moderación se ocultan pero no se borran (auditoría)

blocked_words
  id, word, language, created_at
  -- Configurable desde admin, aplica a todos los chats

user_bans
  id, user_id, match_id (nullable), reason,
  banned_until, created_at
  -- ban temporal por partido o global hasta fecha

users (Supabase Auth)
  id, email, display_name, avatar_url,
  country_code, created_at

push_subscriptions
  id, user_id, endpoint, keys, created_at
```

### Tipos de reacción (configurables desde admin)
Las reacciones no son hardcodeadas. Se cargan desde DB y el admin puede agregar, editar o desactivar reacciones en cualquier momento — incluyendo reacciones personalizadas por sponsor o por partido.

```sql
reactions_config
  id, emoji, label_es, label_en, is_active,
  match_id (nullable — si es null aplica a todos los partidos),
  sponsor_id (nullable), sort_order, created_at
```

Reacciones base por defecto:
```
⚽ GOL | 🔥 GOLAZO | 😱 ATAJADA | 🤬 ROBO
🟥 EXPULSIÓN | 🤦 LA ERRÓ | 😤 PENAL | 🎉 CLASIFICÓ
```

---

## Lo que incluye el PoC

### Layout global
- [ ] El mapa está siempre visible como fondo en todas las vistas
- [ ] El mapa muestra actividad en tiempo real aunque el usuario no haya entrado a ningún partido
- [ ] En home: el mapa ocupa 60% de la pantalla, el fixture aparece como drawer desde abajo
- [ ] En partido: el mapa se reduce a 30% arriba, los controles ocupan el 70% inferior
- [ ] El mapa nunca desaparece — es el contexto permanente

### Mapa (dos capas, toggle)
- [ ] **Capa 1 — Intensidad:** países coloreados por volumen de reacciones en los últimos 60s (escala de calor)
- [ ] **Capa 2 — Sentimiento:** países coloreados por reacción mayoritaria del momento
- [ ] Toggle entre capa 1 y capa 2
- [ ] Contador global "X personas reaccionando ahora"
- [ ] Tooltip al tocar un país: reacción más común + cantidad de usuarios activos

### Auth
- [ ] Google OAuth via Supabase — un toque, sin formulario
- [ ] Sin auth: mapa visible en read-only, no puede reaccionar ni chatear
- [ ] Avatar y nombre de Google usados directamente
- [ ] País detectado por IP al primer login, guardado en perfil

### Fixture
- [ ] Lista de partidos: EN VIVO primero, PRÓXIMOS después, FINALIZADOS al final
- [ ] Cada partido muestra: equipos, logos, hora local, estado, score si aplica
- [ ] Indicador de usuarios activos por partido en tiempo real

### Partido (en vivo)
- [ ] Selector de equipo al entrar (una vez por partido, guardado en DB)
- [ ] 8 botones de reacción — un toque, sin confirmación
- [ ] Cada reacción guarda el minuto del partido en el momento del toque
- [ ] Chatbox efímera:
  - Realtime via Supabase
  - Máximo 100 mensajes visibles
  - Avatar Google + nombre + timestamp
  - Rate limit: 1 mensaje cada 3 segundos por usuario
  - Indicador de usuarios activos en el chat
  - **Moderación activa:**
    - Filtro automático contra lista de palabras bloqueadas (ES + EN)
    - Mensajes bloqueados se reemplazan por "mensaje no permitido" — no se muestran
    - 3 reportes de distintos usuarios en el mismo partido → auto-ban temporal del partido (resto del partido)
    - 5 reportes históricos → ban global hasta próximo partido, notificación al admin por Telegram
    - El admin puede desbloquear manualmente desde el panel
  - Toggle para desactivar el chat de un partido específico desde admin (kill switch)
  - Se borra 24hs post partido via pg_cron (mensajes bloqueados se retienen 7 días para auditoría)
- [ ] Feed de eventos del partido (goles, tarjetas) desde API-Football en tiempo real

### Widget embeddable (distribución B2B)
El widget es la herramienta de ventas más poderosa del producto. Un medio lo embeda en su cobertura, trae tráfico, y valida el producto sin que el medio tenga que construir nada.

- [ ] URL pública: `matchfeel.com/embed?match_id=X&lang=es`
- [ ] Parámetros disponibles:
  - `match_id` — partido específico (requerido)
  - `lang` — es / en (default: es)
  - `view` — map / reactions / both (default: both)
  - `theme` — light / dark (default: dark)
- [ ] El widget muestra: mapa en tiempo real + contador de usuarios activos
- [ ] Sin auth requerida para ver el widget
- [ ] No muestra chat (el chat es solo en la PWA)
- [ ] Branding "Powered by Matchfeel" con link a la PWA — tráfico de retorno al producto
- [ ] El embed es responsive — funciona en mobile y desktop
- [ ] Documentación de una página en matchfeel.com/embed-docs para medios

### Media kit por partido (herramienta de ventas)
Se genera automáticamente al finalizar cada partido. Es lo que le mostrás a un sponsor o medio.

- [ ] PDF autogenerado server-side con:
  - Nombre del partido + score final + fecha
  - Total de usuarios activos durante el partido
  - Pico de usuarios simultáneos (minuto exacto)
  - Reacciones totales por tipo (gráfico de barras)
  - Top 5 países más activos
  - Curva de actividad minuto a minuto (gráfico de línea)
  - Momento de mayor actividad cruzado con evento del partido ("pico en minuto 74 — gol de [equipo]")
- [ ] Disponible en el admin: descargar PDF de cualquier partido finalizado
- [ ] Branded: logo de Matchfeel, paleta definida, listo para enviar sin editar
- [ ] También disponible como JSON via endpoint privado (para integraciones futuras)

### Receipt personal (post partido)
El receipt es el investment del hook model. Se genera al finalizar el partido.

- [ ] Card visual generada server-side con Satori
- [ ] Contenido del receipt:
  - Header: nombre del partido + score final
  - Equipo que soportaste
  - Tus 3 reacciones más usadas con los minutos exactos
  - "Vos reaccionaste en el minuto 89" (cruzado con eventos reales del partido)
  - Tu país vs el mundo: cómo reaccionó tu país comparado con el promedio global
  - Cuántas personas reaccionaron en total en ese partido
- [ ] El receipt se guarda en el perfil del usuario — historial permanente
- [ ] Botón "compartir" → Web Share API → imagen directa
- [ ] El receipt es la unidad viral del producto — diseño prioritario

### Perfil de usuario
- [ ] Avatar + nombre Google
- [ ] Historial de receipts de partidos anteriores
- [ ] Contribution score: cuántas reacciones totales aportaste al mapa
- [ ] País representado

### Push notifications
- [ ] Opt-in en cualquier momento desde el fixture
- [ ] Push 30 min antes del kickoff: "En 30 minutos: [equipo] vs [equipo]"
- [ ] Push 5 min antes: "Arranca en 5 — entrá ahora"
- [ ] Push al finalizar el partido: "Tu receipt está listo"
- [ ] Disparados via Supabase Edge Functions + pg_cron

### PWA
- [ ] Installable en iOS Safari y Android Chrome
- [ ] Manifest completo: nombre, íconos, theme color, display standalone
- [ ] Service worker: cache de assets estáticos
- [ ] Offline fallback: pantalla "conectate para ver el mapa"

### Admin panel (/admin)
- [ ] Login con Supabase Auth (rol admin)
- [ ] CRUD de partidos: fecha, hora, equipos, logos, api_football_id, ronda
- [ ] Botón "sync fixtures desde API-Football"
- [ ] Botón "sync live" por partido (score, tarjetas, estado, eventos)
- [ ] Cron automático cada 60s durante partidos en vivo
- [ ] **Gestión de reacciones:**
  - [ ] Ver lista de reacciones activas
  - [ ] Agregar reacción: emoji + label ES + label EN + orden
  - [ ] Desactivar/activar reacción global
  - [ ] Crear reacción específica para un partido (con o sin sponsor)
- [ ] **Gestión de sponsors:**
  - [ ] CRUD de sponsors: nombre + logo + website
  - [ ] Asignar sponsor a partido: placement (header / receipt / both)
  - [ ] Crear reacción patrocinada: emoji + labels + partido + sponsor
- [ ] **Moderación:**
  - [ ] Lista de palabras bloqueadas: agregar / quitar / ver (ES + EN separadas)
  - [ ] Lista de usuarios baneados: ver, desbanear, ban manual
  - [ ] Vista de mensajes reportados con contexto del chat
  - [ ] Toggle kill switch de chat por partido
  - [ ] Alertas Telegram en tiempo real: nuevo reporte, auto-ban ejecutado
- [ ] **Media kit:**
  - [ ] Descargar PDF de métricas por partido finalizado
  - [ ] Preview del PDF antes de descargar
- [ ] Vista de reacciones por partido: totales por tipo + timeline
- [ ] Exportar reacciones de un partido a CSV
- [ ] Dashboard: usuarios activos ahora, total reacciones, partidos en vivo

---

## Lo que NO incluye el PoC

- Perfil de usuario editable (nombre, país manual)
- Moderación con AI (el filtro es lista de palabras, no LLM)
- Predicciones pre-partido (V2)
- Threads o respuestas en el chat
- Animación de criatura / Tamagotchi (proyecto separado — Mood)
- Versión React Native / app stores
- Más de 1 sponsor por partido
- API pública del dataset (post Mundial)
- Admin panel en inglés
- Más de 2 idiomas (V1 es ES + EN únicamente)
- Autenticación para ver el widget embeddable
- Embed con chat incluido

---

## Monetización — durante el torneo

### Partidos auspiciados
- Un sponsor puede "auspiciar" un partido específico
- Su logo aparece en el header del partido y en el receipt de ese partido
- El admin asigna el sponsor desde el panel

```sql
sponsors
  id, name, logo_url, website_url, created_at

match_sponsors
  id, match_id, sponsor_id, placement, created_at
  -- placement: 'header' | 'receipt' | 'both'
```

### Reacciones personalizadas por sponsor
- El admin crea reacciones exclusivas ligadas a un sponsor y a un partido específico
- Ejemplo: Adidas auspincia la final → reacción "👟 ADIDAS MOMENT" disponible solo en ese partido
- Las reacciones patrocinadas se guardan en el dataset igual que las orgánicas — son dato real
- Máximo 2 reacciones patrocinadas por partido (no reemplazan las base, se agregan)
- Se etiquetan con un punto naranja discreto — no se oculta que son sponsored
- El mapa no muestra branding de sponsors — el mapa es territorio neutral

---

## i18n — Español e Inglés

- Idioma detectado automáticamente por browser (`navigator.language`)
- El usuario puede cambiar idioma manualmente desde cualquier pantalla
- Preferencia guardada en localStorage y en perfil del usuario autenticado
- Todo tiene versión ES y EN: UI, labels de reacciones, push notifications, receipts
- El mapa y los datos son universales — no se traducen
- Stack: next-intl (compatible con Next.js App Router)
- Archivos: `/messages/es.json` y `/messages/en.json`
- Admin panel es solo en español en V1

---

## Dataset — estrategia post Mundial

Las reacciones generan el único dataset de sentimiento emocional en tiempo real geolocalizado por partido de fútbol del mundo. Al terminar el Mundial:

- **Medios:** licencia de datos para análisis de audiencia por país
- **Marcas:** entender comportamiento de mercados LATAM en tiempo real
- **Investigadores:** comportamiento colectivo bajo eventos de alta tensión
- **Federaciones / FIFA:** datos de engagement para torneos futuros

El schema de `reactions` y `match_events` se diseña desde el día uno para soportar queries analíticas eficientes. Esto no tiene costo adicional de desarrollo — es una decisión de schema.

---

## Success criteria

### Producto
- [ ] Google OAuth completa en menos de 10 segundos
- [ ] Una reacción aparece en el mapa de otro dispositivo en < 3s
- [ ] Un mensaje de chat aparece en otro dispositivo en < 2s
- [ ] Un mensaje con palabra bloqueada nunca aparece en el chat de ningún usuario
- [ ] Auto-ban se ejecuta correctamente al tercer reporte del mismo usuario en el mismo partido
- [ ] El kill switch de chat desactiva el chat en < 5 segundos para todos los usuarios activos
- [ ] El mapa muestra diferencia visual clara entre países activos e inactivos
- [ ] El widget embeddable carga en < 2s y se actualiza en tiempo real
- [ ] El widget funciona en iframe sin auth y sin cookies de sesión
- [ ] El receipt se genera en menos de 5 segundos post partido
- [ ] El receipt se puede compartir como imagen desde iOS y Android
- [ ] El media kit PDF se genera en menos de 10 segundos post partido
- [ ] El PDF contiene todos los campos especificados y es visualmente presentable sin edición
- [ ] Los mensajes de chat se borran 24hs post partido, los bloqueados a los 7 días
- [ ] Las reacciones nunca se borran — dataset intacto
- [ ] PWA installable en iOS Safari y Android Chrome
- [ ] Push notification llega antes del kickoff con ±2 min de precisión
- [ ] Admin puede forzar sync de score en cualquier momento
- [ ] Carga inicial en 3G < 4s

### Distribución (criterio de éxito real)
- [ ] Mínimo 500 usuarios simultáneos en el primer partido del torneo
- [ ] Al menos 1 cuenta con 50k+ seguidores comparte el mapa antes del primer partido
- [ ] Al menos 1 medio o creador embeda el widget durante el torneo

---

## Timeline

| Semana | Foco |
|--------|------|
| 1 | Supabase schema completo + Google OAuth + admin base |
| 2 | Admin completo + sync API-Football + match events |
| 3 | Layout con mapa como fondo permanente + fixture + i18n base |
| 4 | Reacciones realtime + mapa heat + mapa sentimiento + reacciones configurables |
| 5 | Chatbox efímera + moderación (palabras bloqueadas + auto-ban + kill switch) |
| 6 | Receipt personal — generación Satori + guardado + compartir |
| 7 | Widget embeddable + media kit PDF autogenerado |
| 8 | Sponsors + reacciones patrocinadas + push notifications + PWA polish |
| 9 | Testing cross-device + 3G + distribución — outreach LATAM + primer sponsor |
| 10 | Buffer + ajustes pre-lanzamiento |

---

## Riesgos

| Riesgo | Probabilidad | Mitigación |
|--------|-------------|------------|
| Masa crítica insuficiente en primer partido | Alta | Outreach semana 9 con widget embeddable como anzuelo para medios |
| Chat tóxico que queme a un sponsor | Media | Kill switch + auto-ban + lista de palabras activa desde día 1 |
| API-Football quota en partidos en vivo | Media | Monitorear dashboard, fallback sync manual |
| Google OAuth inconsistente en iOS Safari PWA | Media | Testing en semana 1, no en semana 7 |
| Receipt con datos pobres si hay pocos usuarios | Alta | Enfatizar eventos reales del partido en el receipt, no volumen de usuarios |
| Medio embeda el widget y el mapa está vacío | Alta | Lanzar el widget solo después del primer partido con tracción probada |
