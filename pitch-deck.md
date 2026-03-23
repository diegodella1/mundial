# Matchfeel — Pitch Deck
## El mapa de emociones del Mundial 2026

---

## SLIDE 1 — Portada

**MATCHFEEL**
El mapa de emociones del Mundial 2026

mundial.diegodella.ar

---

## SLIDE 2 — El problema

**5 mil millones de personas van a mirar el Mundial 2026.**
**Todas con el celular en la mano.**

No existe ningún producto que capture qué siente cada país en cada jugada.

Twitter muestra texto. Las encuestas llegan tarde. Las estadísticas miden clicks, no emociones.

**Nadie sabe en tiempo real cómo reacciona el mundo a un gol de Argentina, un penal errado de Brasil, o una roja en la final.**

Hasta ahora.

---

## SLIDE 3 — Qué es Matchfeel

Matchfeel es una PWA donde los usuarios reaccionan a cada jugada del Mundial con un toque.

Cada reacción se mapea en tiempo real a un mapa del mundo.

**Un toque. Una emoción. Un mapa global.**

- 8 reacciones: ⚽ GOL · 🔥 GOLAZO · 😱 ATAJADA · 🤬 ROBO · 🟥 EXPULSIÓN · 🤦 LA ERRÓ · 😤 PENAL · 🎉 CLASIFICÓ
- Sin descarga. Sin registro. Funciona en el browser.
- El mapa se actualiza cada 5 segundos.

---

## SLIDE 4 — Demo en vivo

[Mostrar mundial.diegodella.ar en el teléfono]

1. Entro a un partido → elijo mi país
2. Toco ⚽ GOL → mi reacción aparece en el mapa
3. Veo cómo Argentina explota en verde, Brasil en rojo
4. Al final del partido → recibo mi "receipt" personal para compartir

**Cero fricción. La reacción más rápida del mundo.**

---

## SLIDE 5 — El activo real

Las reacciones no son solo interacción.
Son **el único dataset de sentimiento emocional geolocalizado en tiempo real del fútbol mundial.**

Cada reacción registra:
- **Qué** sintió el usuario (tipo de reacción)
- **Cuándo** lo sintió (minuto exacto del partido)
- **Desde dónde** (país, geolocalizado)
- **Por quién** (equipo que apoya)

Esto no existe en ningún otro lugar. No se puede reconstruir después. Solo se captura en vivo.

---

## SLIDE 6 — Números del Mundial 2026

| Dato | Valor |
|------|-------|
| Países participantes | 48 |
| Partidos fase de grupos | 72 |
| Partidos totales | 104 |
| Sedes | 16 ciudades en USA, México y Canadá |
| Audiencia estimada | 5+ mil millones de viewers |
| Duración | 11 junio — 19 julio 2026 |

**39 días de datos continuos. 104 partidos. Sentimiento en tiempo real de todo el planeta.**

---

## SLIDE 7 — Modelo de negocio (durante el torneo)

### Para marcas — 3 productos

**1. Partido auspiciado**
- Logo de la marca en el header del partido y en cada receipt generado
- Ejemplo: Adidas auspincia Argentina vs Algeria → su logo aparece en los receipts que comparten los
usuarios de ese partido
- **Visibilidad**: header del match + cada receipt compartido en redes sociales

**2. Reacción patrocinada**
- La marca crea un emoji exclusivo para un partido
- Ejemplo: Coca-Cola auspincia la final → reacción "🥤 COCA-COLA MOMENT"
- Se suma a las 8 reacciones base (no reemplaza, se agrega)
- **Cada toque de esa reacción es un touchpoint de marca medible**
- Se guarda en el dataset como dato real — no es publicidad, es interacción

**3. Widget embeddable para medios**
- Medios deportivos embeden el mapa en vivo en su cobertura
- "Powered by Matchfeel" → tráfico orgánico de retorno
- El medio no construye nada. Copia un `<iframe>`. 1 minuto.

---

## SLIDE 8 — Media Kit automático

Al finalizar cada partido, Matchfeel genera un **PDF de métricas** listo para enviar al sponsor:

- Total de usuarios activos durante el partido
- Pico de usuarios simultáneos (minuto exacto)
- Reacciones totales por tipo (con gráfico)
- Top 5 países más activos
- Curva de actividad minuto a minuto
- Momento de mayor actividad cruzado con el evento real del partido
  ("Pico en minuto 74 — gol de Messi")

**El sponsor recibe un reporte profesional sin que nadie lo arme manualmente.**

---

## SLIDE 9 — Modelo de negocio (post torneo)

### El dataset es el negocio real.

39 días de sentimiento emocional geolocalizado de millones de interacciones. Compradores:

| Segmento | Qué compran | Por qué |
|----------|------------|---------|
| **Medios** | Licencia de datos | Análisis de audiencia por país y por partido |
| **Marcas** | Insights de mercado | Comportamiento emocional de mercados LATAM/global en tiempo real |
| **Investigadores** | Dataset académico | Comportamiento colectivo bajo eventos de alta tensión emocional |
| **Federaciones / FIFA** | Datos de engagement | Planificación de torneos futuros, horarios, formatos |

**El schema de la base de datos está diseñado desde el día uno para soportar queries analíticas. No es un pivot — es el plan.**

---

## SLIDE 10 — Distribución

### Cómo llegamos a los usuarios

**Antes del torneo (ahora → junio 2026):**
- Widget embeddable en medios deportivos LATAM
- Outreach a cuentas de fútbol con 50k+ seguidores
- Auto-tweet: cada reacción genera un tweet pre-armado → tráfico orgánico

**Durante el torneo:**
- El receipt personal es la unidad viral — se comparte como imagen en redes
- Push notifications 30 min y 5 min antes de cada partido
- El mapa vacío no existe — cada usuario que entra ve el mundo reaccionando

**El producto se distribuye solo si tiene masa crítica en el primer partido.**
Meta: 500 usuarios simultáneos en México vs Sudáfrica (11 de junio).

---

## SLIDE 11 — Estado actual

| Componente | Estado |
|-----------|--------|
| PWA funcionando | ✅ Live en mundial.diegodella.ar |
| Mapa del mundo en tiempo real | ✅ 155 países, actualización cada 5s |
| 8 reacciones sin registro | ✅ Cero fricción |
| Chat en vivo con moderación | ✅ Filtro de palabras + auto-ban |
| Receipt personal con compartir | ✅ Generación automática |
| Widget embeddable | ✅ iframe en 1 minuto |
| Media kit PDF automático | ✅ Por partido |
| Admin panel completo | ✅ CRUD partidos, sponsors, moderación |
| 72 partidos de fase de grupos | ✅ Cargados con horarios reales |
| Push notifications | ✅ 30min + 5min + post-partido |
| Auto-tweet por reacción | ✅ Twitter Web Intent |
| i18n español + inglés | ✅ |
| Google + X login | ✅ |
| PWA instalable | ✅ iOS + Android + Desktop |

**El producto está construido. Falta distribución y el primer sponsor.**

---

## SLIDE 12 — Equipo

**Diego Della Vecchia**
Developer independiente. Buenos Aires, Argentina.

Portfolio: diegodella.ar

---

## SLIDE 13 — Qué buscamos

### De marcas:
- **Auspiciar partidos** de fase de grupos (1 marca por partido)
- **Crear reacciones patrocinadas** para partidos específicos
- Inversión mínima, visibilidad máxima en el momento exacto de mayor emoción

### De inversores:
- **Funding pre-torneo** para distribución (outreach, partnerships con medios, ads)
- El producto está listo. La oportunidad tiene fecha de vencimiento: 11 de junio de 2026.

---

## SLIDE 14 — Cierre

**El mundo entero va a mirar el Mundial con el celular en la mano.**

**Matchfeel es el único producto que captura qué siente cada país en cada jugada.**

**El dataset que se genera no se puede comprar después. Solo se captura en vivo.**

mundial.diegodella.ar

---

## APÉNDICE — Preguntas frecuentes

**¿Por qué no hay competencia?**
Porque nadie construyó un mapa de emociones geolocalizado para fútbol. Twitter mide texto. Las apps de scores miden resultados. Nadie mide sentimiento en tiempo real por país.

**¿Qué pasa si no hay suficientes usuarios?**
El receipt enfatiza eventos reales del partido (goles, tarjetas) además del volumen de usuarios. El widget solo se lanza después del primer partido con tracción. El mapa tiene modo demo que muestra actividad simulada hasta que hay datos reales.

**¿Qué pasa después del Mundial?**
El dataset se licencia. La plataforma se adapta a otros eventos: Champions League, Copa América, Eliminatorias. El modelo es replicable.

**¿Cuánto cuesta auspiciar un partido?**
A definir según el partido. No es lo mismo auspiciar México vs Sudáfrica (apertura) que un Curaçao vs Ecuador. El pricing se basa en audiencia esperada + relevancia del partido.

**¿Por qué PWA y no app nativa?**
Cero fricción. Sin descarga, sin App Store. Un link, un toque, estás reaccionando. La barrera de entrada más baja posible para maximizar usuarios en el momento del partido.

**¿Cómo se protege de contenido tóxico?**
Moderación automática desde el día uno: filtro de palabras bloqueadas (ES + EN), auto-ban por reportes (3 en un partido = ban del partido, 5 históricos = ban global), kill switch por partido, alertas al admin.
