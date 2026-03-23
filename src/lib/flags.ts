// Convert FIFA/ISO code to flag emoji
// e.g., "AR" → "🇦🇷", "MEX" → "🇲🇽"
export function codeToFlag(code: string): string {
  if (!code || code.length < 2) return "\u{1F3F3}\u{FE0F}";

  const upper = code.toUpperCase();

  // Special cases: subdivision flags
  if (upper === "SCO") return "\u{1F3F4}\u{E0067}\u{E0062}\u{E0073}\u{E0063}\u{E0074}\u{E007F}";
  if (upper === "ENG") return "\u{1F3F4}\u{E0067}\u{E0062}\u{E0065}\u{E006E}\u{E0067}\u{E007F}";
  if (upper === "WAL") return "\u{1F3F4}\u{E0067}\u{E0062}\u{E0077}\u{E006C}\u{E0073}\u{E007F}";

  // FIFA 3-letter codes → ISO 2-letter mapping
  const isoCode = FIFA_TO_ISO[upper] || upper.substring(0, 2);
  const codePoints = [...isoCode].map(c => 0x1F1E6 + c.charCodeAt(0) - 65);
  return String.fromCodePoint(...codePoints);
}

const FIFA_TO_ISO: Record<string, string> = {
  MEX: "MX", RSA: "ZA", KOR: "KR", CAN: "CA", QAT: "QA", SUI: "CH",
  BRA: "BR", MAR: "MA", HAI: "HT", SCO: "GB", USA: "US", PAR: "PY",
  AUS: "AU", GER: "DE", CUR: "CW", CIV: "CI", ECU: "EC", NED: "NL",
  JPN: "JP", TUN: "TN", ESP: "ES", CPV: "CV", KSA: "SA", URU: "UY",
  BEL: "BE", EGY: "EG", IRN: "IR", NZL: "NZ", FRA: "FR", SEN: "SN",
  NOR: "NO", ARG: "AR", ALG: "DZ", AUT: "AT", JOR: "JO", ENG: "GB",
  CRO: "HR", GHA: "GH", PAN: "PA", POR: "PT", UZB: "UZ", COL: "CO",
  CRC: "CR", CMR: "CM", NGA: "NG", CHI: "CL", PER: "PE", BOL: "BO",
  HON: "HN", SRB: "RS", DEN: "DK", POL: "PL", SWE: "SE", ITA: "IT",
  GRE: "GR", CZE: "CZ", TUR: "TR", IRL: "IE", CHN: "CN", IND: "IN",
  PHI: "PH", IDN: "ID", THA: "TH", VIE: "VN", MYA: "MM", TPE: "TW",
  UAE: "AE", OMA: "OM", BHR: "BH", KUW: "KW", IRQ: "IQ", SYR: "SY",
  LBN: "LB", PLE: "PS", YEM: "YE", LBY: "LY", SUD: "SD", ETH: "ET",
  KEN: "KE", TAN: "TZ", UGA: "UG", RWA: "RW", MOZ: "MZ", ZAM: "ZM",
  ZIM: "ZW", ANG: "AO", CGO: "CG", COD: "CD", GAB: "GA", GUI: "GN",
  MLI: "ML", BFA: "BF", TOG: "TG", BEN: "BJ", NIG: "NE", GAM: "GM",
  MTN: "MR", SLE: "SL", LBR: "LR", GNB: "GW", EQG: "GQ", CTA: "CF",
  CHA: "TD", NAM: "NA", BOT: "BW", MAD: "MG", COM: "KM", MWI: "MW",
  SOM: "SO", DJI: "DJ", ERI: "ER", SSD: "SS", BDI: "BI", STP: "ST",
  MRI: "MU", SEY: "SC", GUA: "GT", SLV: "SV", NCA: "NI",
  JAM: "JM", TRI: "TT", SUR: "SR", GUY: "GY", BER: "BM", VEN: "VE",
  // Playoff placeholders
  UD1: "EU", UA1: "EU", UB1: "EU", UC1: "EU", IC1: "UN", IC2: "UN",
};
