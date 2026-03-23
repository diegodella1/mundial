export default function PitchPage() {
  return (
    <main className="min-h-screen">
      {/* ── HERO ── */}
      <section className="bg-zinc-950 py-28 px-6 text-center">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-6xl sm:text-8xl font-black tracking-tight text-white mb-6">
            MATCHFEEL
          </h1>
          <p className="text-xl sm:text-2xl text-zinc-400 font-medium mb-8">
            El mapa de emociones del Mundial 2026
          </p>
          <a
            href="https://mundial.diegodella.ar"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block text-sm font-semibold uppercase tracking-widest text-orange-400 hover:text-orange-300 transition-colors border border-orange-400/30 hover:border-orange-300/50 rounded-full px-6 py-2.5"
          >
            mundial.diegodella.ar
          </a>
        </div>
      </section>

      {/* ── EL PROBLEMA ── */}
      <section className="bg-white py-20 px-6">
        <div className="max-w-4xl mx-auto">
          <p className="text-sm font-semibold uppercase tracking-widest text-zinc-400 mb-6">
            El problema
          </p>
          <p className="text-5xl sm:text-7xl font-black bg-gradient-to-r from-orange-500 to-pink-500 bg-clip-text text-transparent mb-8">
            5 mil millones
          </p>
          <p className="text-xl sm:text-2xl font-bold text-zinc-900 mb-6">
            de personas van a mirar el Mundial 2026. Todas con el celular en la mano.
          </p>
          <p className="text-lg text-zinc-600 leading-relaxed mb-4">
            No existe ningun producto que capture que siente cada pais en cada jugada.
            Twitter muestra texto. Las encuestas llegan tarde. Las estadisticas miden clicks, no emociones.
          </p>
          <p className="text-lg font-semibold text-zinc-900">
            Nadie sabe en tiempo real como reacciona el mundo a un gol de Argentina,
            un penal errado de Brasil, o una roja en la final.
          </p>
          <p className="mt-6 text-2xl font-bold bg-gradient-to-r from-orange-500 to-pink-500 bg-clip-text text-transparent">
            Hasta ahora.
          </p>
        </div>
      </section>

      {/* ── QUE ES MATCHFEEL ── */}
      <section className="bg-zinc-50 py-20 px-6">
        <div className="max-w-4xl mx-auto">
          <p className="text-sm font-semibold uppercase tracking-widest text-zinc-400 mb-6">
            Que es Matchfeel
          </p>
          <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-6">
            Un toque. Una emocion. Un mapa global.
          </h2>
          <p className="text-lg text-zinc-600 leading-relaxed mb-4">
            Matchfeel es una PWA donde los usuarios reaccionan a cada jugada del Mundial con un toque.
            Cada reaccion se mapea en tiempo real a un mapa del mundo.
          </p>
          <div className="flex flex-wrap gap-3 text-sm text-zinc-500 mb-12">
            <span className="bg-white border border-zinc-200 rounded-full px-4 py-1.5">Sin descarga</span>
            <span className="bg-white border border-zinc-200 rounded-full px-4 py-1.5">Sin registro</span>
            <span className="bg-white border border-zinc-200 rounded-full px-4 py-1.5">Funciona en el browser</span>
            <span className="bg-white border border-zinc-200 rounded-full px-4 py-1.5">Actualiza cada 5 segundos</span>
          </div>

          {/* Reactions grid */}
          <p className="text-sm font-semibold uppercase tracking-widest text-zinc-400 mb-6 text-center">
            8 reacciones
          </p>
          <div className="grid grid-cols-4 gap-3 max-w-md mx-auto">
            {[
              { emoji: "\u26BD", label: "GOL" },
              { emoji: "\uD83D\uDD25", label: "GOLAZO" },
              { emoji: "\uD83D\uDE31", label: "ATAJADA" },
              { emoji: "\uD83E\uDD2C", label: "ROBO" },
              { emoji: "\uD83D\uDFE5", label: "EXPULSION" },
              { emoji: "\uD83E\uDD26", label: "LA ERRO" },
              { emoji: "\uD83D\uDE24", label: "PENAL" },
              { emoji: "\uD83C\uDF89", label: "CLASIFICO" },
            ].map(({ emoji, label }) => (
              <div
                key={label}
                className="flex flex-col items-center gap-1.5 bg-white border border-zinc-200 rounded-xl py-3 px-2"
              >
                <span className="text-2xl">{emoji}</span>
                <span className="text-[10px] sm:text-xs font-bold text-zinc-600 uppercase tracking-wide">
                  {label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── EL ACTIVO REAL ── */}
      <section className="bg-white py-20 px-6">
        <div className="max-w-4xl mx-auto">
          <p className="text-sm font-semibold uppercase tracking-widest text-zinc-400 mb-6">
            El activo real
          </p>
          <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-4">
            El unico dataset de sentimiento emocional geolocalizado en tiempo real del futbol mundial.
          </h2>
          <p className="text-lg text-zinc-600 leading-relaxed mb-12">
            Las reacciones no son solo interaccion. Son datos estructurados que no se pueden reconstruir despues.
            Solo se capturan en vivo.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              {
                title: "Que",
                desc: "Tipo de reaccion del usuario",
                icon: (
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
                  </svg>
                ),
              },
              {
                title: "Cuando",
                desc: "Minuto exacto del partido",
                icon: (
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                ),
              },
              {
                title: "Donde",
                desc: "Pais, geolocalizado",
                icon: (
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                  </svg>
                ),
              },
              {
                title: "Por quien",
                desc: "Equipo que apoya",
                icon: (
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 3v1.5M3 21v-6m0 0l2.77-.693a9 9 0 016.208.682l.108.054a9 9 0 006.086.71l3.114-.732a48.524 48.524 0 01-.005-10.499l-3.11.732a9 9 0 01-6.085-.711l-.108-.054a9 9 0 00-6.208-.682L3 4.5M3 15V4.5" />
                  </svg>
                ),
              },
            ].map((card) => (
              <div
                key={card.title}
                className="bg-zinc-50 border border-zinc-200 rounded-2xl p-6"
              >
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-pink-500 flex items-center justify-center text-white mb-4">
                  {card.icon}
                </div>
                <h3 className="text-lg font-bold text-zinc-900 mb-1">{card.title}</h3>
                <p className="text-sm text-zinc-600">{card.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── NUMEROS DEL MUNDIAL ── */}
      <section className="bg-zinc-950 py-20 px-6">
        <div className="max-w-4xl mx-auto">
          <p className="text-sm font-semibold uppercase tracking-widest text-zinc-500 mb-6 text-center">
            Numeros del Mundial 2026
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-8 sm:gap-12">
            {[
              { value: "48", label: "Selecciones" },
              { value: "72", label: "Partidos de grupo" },
              { value: "104", label: "Partidos totales" },
              { value: "16", label: "Sedes" },
              { value: "39", label: "Dias de datos" },
              { value: "5B+", label: "Audiencia global" },
            ].map(({ value, label }) => (
              <div key={label} className="flex flex-col items-center text-center">
                <span className="text-5xl sm:text-6xl font-black bg-gradient-to-r from-orange-500 to-pink-500 bg-clip-text text-transparent">
                  {value}
                </span>
                <span className="text-sm font-semibold text-zinc-500 uppercase tracking-wider mt-2">
                  {label}
                </span>
              </div>
            ))}
          </div>
          <p className="text-center text-lg text-zinc-400 mt-12 max-w-2xl mx-auto">
            39 dias de datos continuos. 104 partidos. Sentimiento en tiempo real de todo el planeta.
          </p>
        </div>
      </section>

      {/* ── MODELO DE NEGOCIO — DURANTE ── */}
      <section className="bg-white py-20 px-6">
        <div className="max-w-4xl mx-auto">
          <p className="text-sm font-semibold uppercase tracking-widest text-zinc-400 mb-6">
            Modelo de negocio — Durante el torneo
          </p>
          <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-12">
            3 productos para marcas
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {/* Card 1 */}
            <div className="bg-zinc-50 border border-zinc-200 rounded-2xl p-6 flex flex-col">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-pink-500 flex items-center justify-center text-white font-bold text-lg mb-4">
                1
              </div>
              <h3 className="text-lg font-bold text-zinc-900 mb-2">Partido auspiciado</h3>
              <p className="text-sm text-zinc-600 leading-relaxed flex-1">
                Logo de la marca en el header del partido y en cada receipt generado.
                Visibilidad en el match + cada receipt compartido en redes.
              </p>
              <p className="text-xs text-zinc-400 mt-4 pt-4 border-t border-zinc-200">
                Ej: Adidas auspicia Argentina vs Algeria
              </p>
            </div>

            {/* Card 2 */}
            <div className="bg-zinc-50 border border-zinc-200 rounded-2xl p-6 flex flex-col">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-pink-500 flex items-center justify-center text-white font-bold text-lg mb-4">
                2
              </div>
              <h3 className="text-lg font-bold text-zinc-900 mb-2">Reaccion patrocinada</h3>
              <p className="text-sm text-zinc-600 leading-relaxed flex-1">
                La marca crea un emoji exclusivo para un partido. Se suma a las 8 reacciones base.
                Cada toque es un touchpoint de marca medible.
              </p>
              <p className="text-xs text-zinc-400 mt-4 pt-4 border-t border-zinc-200">
                Ej: Coca-Cola en la final — reaccion exclusiva
              </p>
            </div>

            {/* Card 3 */}
            <div className="bg-zinc-50 border border-zinc-200 rounded-2xl p-6 flex flex-col">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-pink-500 flex items-center justify-center text-white font-bold text-lg mb-4">
                3
              </div>
              <h3 className="text-lg font-bold text-zinc-900 mb-2">Widget embeddable</h3>
              <p className="text-sm text-zinc-600 leading-relaxed flex-1">
                Medios deportivos embeben el mapa en vivo en su cobertura.
                &quot;Powered by Matchfeel&quot; — trafico organico de retorno. 1 minuto de setup.
              </p>
              <p className="text-xs text-zinc-400 mt-4 pt-4 border-t border-zinc-200">
                Un iframe. Sin desarrollo. Listo.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── MEDIA KIT ── */}
      <section className="bg-zinc-50 py-20 px-6">
        <div className="max-w-4xl mx-auto">
          <p className="text-sm font-semibold uppercase tracking-widest text-zinc-400 mb-6">
            Media Kit automatico
          </p>
          <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-4">
            El sponsor recibe un reporte profesional sin que nadie lo arme manualmente.
          </h2>
          <p className="text-lg text-zinc-600 leading-relaxed mb-8">
            Al finalizar cada partido, Matchfeel genera un PDF de metricas listo para enviar al sponsor.
          </p>
          <div className="bg-white border border-zinc-200 rounded-2xl p-6 sm:p-8">
            <ul className="space-y-3">
              {[
                "Total de usuarios activos durante el partido",
                "Pico de usuarios simultaneos (minuto exacto)",
                "Reacciones totales por tipo con grafico",
                "Top 5 paises mas activos",
                "Curva de actividad minuto a minuto",
                "Momento de mayor actividad cruzado con el evento real del partido",
              ].map((item) => (
                <li key={item} className="flex items-start gap-3">
                  <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-orange-500 shrink-0" />
                  <span className="text-base text-zinc-700">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* ── MODELO DE NEGOCIO — POST TORNEO ── */}
      <section className="bg-white py-20 px-6">
        <div className="max-w-4xl mx-auto">
          <p className="text-sm font-semibold uppercase tracking-widest text-zinc-400 mb-6">
            Modelo de negocio — Post torneo
          </p>
          <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-4">
            El dataset es el negocio real.
          </h2>
          <p className="text-lg text-zinc-600 leading-relaxed mb-12">
            39 dias de sentimiento emocional geolocalizado de millones de interacciones.
          </p>

          <div className="overflow-hidden rounded-2xl border border-zinc-200">
            <table className="w-full">
              <thead>
                <tr className="bg-zinc-50">
                  <th className="text-left text-xs font-semibold uppercase tracking-wider text-zinc-500 px-6 py-4">
                    Segmento
                  </th>
                  <th className="text-left text-xs font-semibold uppercase tracking-wider text-zinc-500 px-6 py-4">
                    Que compran
                  </th>
                  <th className="text-left text-xs font-semibold uppercase tracking-wider text-zinc-500 px-6 py-4 hidden sm:table-cell">
                    Por que
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {[
                  {
                    segment: "Medios",
                    product: "Licencia de datos",
                    why: "Analisis de audiencia por pais y por partido",
                  },
                  {
                    segment: "Marcas",
                    product: "Insights de mercado",
                    why: "Comportamiento emocional de mercados LATAM/global",
                  },
                  {
                    segment: "Investigadores",
                    product: "Dataset academico",
                    why: "Comportamiento colectivo bajo alta tension emocional",
                  },
                  {
                    segment: "Federaciones / FIFA",
                    product: "Datos de engagement",
                    why: "Planificacion de torneos futuros, horarios, formatos",
                  },
                ].map((row) => (
                  <tr key={row.segment} className="hover:bg-zinc-50/50 transition-colors">
                    <td className="px-6 py-4 text-sm font-semibold text-zinc-900">{row.segment}</td>
                    <td className="px-6 py-4 text-sm text-zinc-600">{row.product}</td>
                    <td className="px-6 py-4 text-sm text-zinc-500 hidden sm:table-cell">{row.why}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <p className="text-sm text-zinc-500 mt-6 italic">
            El schema de la base de datos esta disenado desde el dia uno para soportar queries analiticas. No es un pivot — es el plan.
          </p>
        </div>
      </section>

      {/* ── ESTADO ACTUAL ── */}
      <section className="bg-zinc-950 py-20 px-6">
        <div className="max-w-4xl mx-auto">
          <p className="text-sm font-semibold uppercase tracking-widest text-zinc-500 mb-6 text-center">
            Estado actual
          </p>
          <h2 className="text-3xl sm:text-4xl font-bold text-white text-center mb-4">
            El producto esta construido.
          </h2>
          <p className="text-lg text-zinc-400 text-center mb-12">
            Falta distribucion y el primer sponsor.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[
              { feature: "PWA funcionando", detail: "Live en mundial.diegodella.ar" },
              { feature: "Mapa del mundo en tiempo real", detail: "155 paises, actualizacion cada 5s" },
              { feature: "8 reacciones sin registro", detail: "Cero friccion" },
              { feature: "Chat en vivo con moderacion", detail: "Filtro de palabras + auto-ban" },
              { feature: "Receipt personal con compartir", detail: "Generacion automatica" },
              { feature: "Widget embeddable", detail: "iframe en 1 minuto" },
              { feature: "Media kit PDF automatico", detail: "Por partido" },
              { feature: "Admin panel completo", detail: "CRUD partidos, sponsors, moderacion" },
              { feature: "72 partidos de fase de grupos", detail: "Cargados con horarios reales" },
              { feature: "Push notifications", detail: "30min + 5min + post-partido" },
              { feature: "Auto-tweet por reaccion", detail: "Twitter Web Intent" },
              { feature: "i18n espanol + ingles", detail: "Completo" },
              { feature: "Google + X login", detail: "Autenticacion social" },
              { feature: "PWA instalable", detail: "iOS + Android + Desktop" },
            ].map((item) => (
              <div
                key={item.feature}
                className="bg-zinc-900 border border-zinc-800 rounded-xl px-5 py-4 flex items-start gap-3"
              >
                <span className="text-emerald-400 mt-0.5 shrink-0 font-bold">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                  </svg>
                </span>
                <div>
                  <p className="text-sm font-semibold text-white">{item.feature}</p>
                  <p className="text-xs text-zinc-500">{item.detail}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="bg-gradient-to-r from-orange-500 via-pink-500 to-purple-500 py-24 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6 leading-tight">
            El dataset no se puede comprar despues.
            <br />
            Solo se captura en vivo.
          </h2>
          <p className="text-lg text-white/80 mb-10 max-w-xl mx-auto">
            El mundo entero va a mirar el Mundial con el celular en la mano.
            Matchfeel es el unico producto que captura que siente cada pais en cada jugada.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a
              href="mailto:diego@diegodella.ar"
              className="inline-flex items-center gap-2 bg-white text-zinc-900 font-bold rounded-full px-8 py-3.5 text-base hover:bg-zinc-100 transition-colors shadow-lg"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
              </svg>
              Hablemos
            </a>
            <a
              href="https://mundial.diegodella.ar"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-white/10 backdrop-blur text-white font-semibold rounded-full px-8 py-3.5 text-base border border-white/20 hover:bg-white/20 transition-colors"
            >
              Ver la app en vivo
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12h15m0 0l-6.75-6.75M19.5 12l-6.75 6.75" />
              </svg>
            </a>
          </div>
          <p className="text-sm text-white/50 mt-10">
            Diego Della Vecchia — diegodella.ar
          </p>
        </div>
      </section>
    </main>
  );
}
