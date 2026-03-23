import React from "react";
import { Document, Page, View, Text, StyleSheet } from "@react-pdf/renderer";

const styles = StyleSheet.create({
  page: {
    backgroundColor: "#ffffff",
    padding: 40,
    fontFamily: "Helvetica",
  },
  // Header
  brand: {
    fontSize: 10,
    color: "#71717a",
    letterSpacing: 2,
    textTransform: "uppercase" as const,
    marginBottom: 4,
  },
  title: {
    fontSize: 28,
    fontFamily: "Helvetica-Bold",
    color: "#09090b",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 12,
    color: "#71717a",
    marginBottom: 30,
  },
  // Score
  scoreRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 30,
    gap: 20,
  },
  teamBlock: {
    alignItems: "center",
    width: 120,
  },
  teamCode: {
    fontSize: 24,
    fontFamily: "Helvetica-Bold",
    color: "#09090b",
  },
  teamName: {
    fontSize: 10,
    color: "#52525b",
    marginTop: 4,
  },
  score: {
    fontSize: 36,
    fontFamily: "Helvetica-Bold",
    color: "#09090b",
  },
  vs: {
    fontSize: 14,
    color: "#a1a1aa",
    marginHorizontal: 8,
  },
  // Stats row
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 30,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: "#e4e4e7",
  },
  statBlock: {
    alignItems: "center",
  },
  statValue: {
    fontSize: 22,
    fontFamily: "Helvetica-Bold",
    color: "#09090b",
  },
  statLabel: {
    fontSize: 9,
    color: "#71717a",
    marginTop: 4,
    textTransform: "uppercase" as const,
    letterSpacing: 1,
  },
  // Section
  sectionTitle: {
    fontSize: 14,
    fontFamily: "Helvetica-Bold",
    color: "#09090b",
    marginBottom: 12,
    marginTop: 10,
  },
  // Reaction bar
  reactionRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  reactionLabel: {
    fontSize: 10,
    color: "#3f3f46",
    width: 120,
  },
  reactionBarBg: {
    flex: 1,
    height: 16,
    backgroundColor: "#f4f4f5",
    borderRadius: 3,
    overflow: "hidden",
  },
  reactionBarFill: {
    height: 16,
    backgroundColor: "#09090b",
    borderRadius: 3,
  },
  reactionCount: {
    fontSize: 9,
    color: "#71717a",
    width: 50,
    textAlign: "right",
  },
  // Country row
  countryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderColor: "#f4f4f5",
  },
  countryCode: {
    fontSize: 11,
    fontFamily: "Helvetica-Bold",
    color: "#09090b",
    width: 40,
  },
  countryCount: {
    fontSize: 11,
    color: "#52525b",
  },
  countryBar: {
    flex: 1,
    marginHorizontal: 12,
    justifyContent: "center",
  },
  countryBarFill: {
    height: 8,
    backgroundColor: "#e4e4e7",
    borderRadius: 2,
  },
  // Peak
  peakBox: {
    backgroundColor: "#fafafa",
    borderWidth: 1,
    borderColor: "#e4e4e7",
    borderRadius: 6,
    padding: 16,
    marginTop: 12,
  },
  peakRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  peakLabel: {
    fontSize: 10,
    color: "#71717a",
  },
  peakValue: {
    fontSize: 12,
    fontFamily: "Helvetica-Bold",
    color: "#09090b",
  },
  peakEvent: {
    fontSize: 10,
    color: "#52525b",
    marginTop: 4,
  },
  // Footer
  footer: {
    position: "absolute",
    bottom: 30,
    left: 40,
    right: 40,
    flexDirection: "row",
    justifyContent: "space-between",
    borderTopWidth: 1,
    borderColor: "#e4e4e7",
    paddingTop: 10,
  },
  footerText: {
    fontSize: 8,
    color: "#a1a1aa",
  },
});

export interface MediaKitData {
  homeTeam: string;
  awayTeam: string;
  homeCode: string;
  awayCode: string;
  homeScore: number;
  awayScore: number;
  kickoffAt: string;
  totalUsers: number;
  totalReactions: number;
  reactionBreakdown: { emoji: string; label: string; count: number }[];
  topCountries: { code: string; count: number }[];
  peakMinute: number;
  peakReactions: number;
  peakEvents: {
    kind: string;
    minute: number;
    team: string;
    player: string | null;
  }[];
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString("es-AR", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatNumber(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return n.toString();
}

function eventKindLabel(kind: string): string {
  const labels: Record<string, string> = {
    goal: "Gol",
    own_goal: "Gol en contra",
    penalty_scored: "Penal convertido",
    penalty_missed: "Penal errado",
    yellow_card: "Tarjeta amarilla",
    red_card: "Tarjeta roja",
    substitution: "Cambio",
    var: "VAR",
    kickoff: "Inicio",
    halftime: "Entretiempo",
    fulltime: "Final",
  };
  return labels[kind] || kind;
}

export function createMediaKitDocument(data: MediaKitData) {
  const maxReaction = Math.max(...data.reactionBreakdown.map((r) => r.count), 1);
  const maxCountry = Math.max(...data.topCountries.map((c) => c.count), 1);

  return (
    <Document>
      {/* Page 1: Match overview */}
      <Page size="A4" style={styles.page}>
        <Text style={styles.brand}>MATCHFEEL</Text>
        <Text style={styles.title}>Media Kit</Text>
        <Text style={styles.subtitle}>{formatDate(data.kickoffAt)}</Text>

        <View style={styles.scoreRow}>
          <View style={styles.teamBlock}>
            <Text style={styles.teamCode}>{data.homeCode}</Text>
            <Text style={styles.teamName}>{data.homeTeam}</Text>
          </View>
          <Text style={styles.score}>{data.homeScore}</Text>
          <Text style={styles.vs}>-</Text>
          <Text style={styles.score}>{data.awayScore}</Text>
          <View style={styles.teamBlock}>
            <Text style={styles.teamCode}>{data.awayCode}</Text>
            <Text style={styles.teamName}>{data.awayTeam}</Text>
          </View>
        </View>

        <View style={styles.statsRow}>
          <View style={styles.statBlock}>
            <Text style={styles.statValue}>
              {formatNumber(data.totalUsers)}
            </Text>
            <Text style={styles.statLabel}>Usuarios</Text>
          </View>
          <View style={styles.statBlock}>
            <Text style={styles.statValue}>
              {formatNumber(data.totalReactions)}
            </Text>
            <Text style={styles.statLabel}>Reacciones</Text>
          </View>
          <View style={styles.statBlock}>
            <Text style={styles.statValue}>
              {data.totalUsers > 0
                ? (data.totalReactions / data.totalUsers).toFixed(1)
                : "0"}
            </Text>
            <Text style={styles.statLabel}>Reacciones / usuario</Text>
          </View>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Matchfeel — Mundial 2026
          </Text>
          <Text style={styles.footerText}>
            matchfeel.com
          </Text>
        </View>
      </Page>

      {/* Page 2: Reaction breakdown */}
      <Page size="A4" style={styles.page}>
        <Text style={styles.brand}>MATCHFEEL</Text>
        <Text style={styles.sectionTitle}>Desglose de reacciones</Text>

        {data.reactionBreakdown.map((r, i) => (
          <View key={i} style={styles.reactionRow}>
            <Text style={styles.reactionLabel}>
              {r.emoji} {r.label}
            </Text>
            <View style={styles.reactionBarBg}>
              <View
                style={[
                  styles.reactionBarFill,
                  { width: `${Math.max((r.count / maxReaction) * 100, 2)}%` },
                ]}
              />
            </View>
            <Text style={styles.reactionCount}>
              {formatNumber(r.count)}
            </Text>
          </View>
        ))}

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Matchfeel — Mundial 2026
          </Text>
          <Text style={styles.footerText}>
            matchfeel.com
          </Text>
        </View>
      </Page>

      {/* Page 3: Countries + Peak */}
      <Page size="A4" style={styles.page}>
        <Text style={styles.brand}>MATCHFEEL</Text>
        <Text style={styles.sectionTitle}>Top 5 paises</Text>

        {data.topCountries.map((c, i) => (
          <View key={i} style={styles.countryRow}>
            <Text style={styles.countryCode}>{c.code}</Text>
            <View style={styles.countryBar}>
              <View
                style={[
                  styles.countryBarFill,
                  { width: `${Math.max((c.count / maxCountry) * 100, 3)}%` },
                ]}
              />
            </View>
            <Text style={styles.countryCount}>
              {formatNumber(c.count)}
            </Text>
          </View>
        ))}

        <Text style={[styles.sectionTitle, { marginTop: 30 }]}>
          Minuto pico
        </Text>

        <View style={styles.peakBox}>
          <View style={styles.peakRow}>
            <Text style={styles.peakLabel}>Minuto</Text>
            <Text style={styles.peakValue}>{data.peakMinute}&apos;</Text>
          </View>
          <View style={styles.peakRow}>
            <Text style={styles.peakLabel}>Reacciones</Text>
            <Text style={styles.peakValue}>
              {formatNumber(data.peakReactions)}
            </Text>
          </View>
          {data.peakEvents.length > 0 && (
            <View>
              <Text style={[styles.peakLabel, { marginBottom: 4 }]}>
                Eventos asociados
              </Text>
              {data.peakEvents.map((e, i) => (
                <Text key={i} style={styles.peakEvent}>
                  {e.minute}&apos; — {eventKindLabel(e.kind)}
                  {e.team ? ` (${e.team})` : ""}
                  {e.player ? ` — ${e.player}` : ""}
                </Text>
              ))}
            </View>
          )}
          {data.peakEvents.length === 0 && (
            <Text style={styles.peakEvent}>
              Sin eventos registrados en este minuto
            </Text>
          )}
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Matchfeel — Mundial 2026
          </Text>
          <Text style={styles.footerText}>
            matchfeel.com
          </Text>
        </View>
      </Page>
    </Document>
  );
}
