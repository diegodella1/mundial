"use client";

import { useState, useMemo, useEffect, useCallback } from "react";

interface Country {
  code: string;
  name: string;
  flag: string;
}

const COUNTRIES: Country[] = [
  // World Cup 2026 + top populated countries
  { code: "AR", name: "Argentina", flag: "\ud83c\udde6\ud83c\uddf7" },
  { code: "BR", name: "Brasil", flag: "\ud83c\udde7\ud83c\uddf7" },
  { code: "MX", name: "M\u00e9xico", flag: "\ud83c\uddf2\ud83c\uddfd" },
  { code: "US", name: "USA", flag: "\ud83c\uddfa\ud83c\uddf8" },
  { code: "GB", name: "England", flag: "\ud83c\uddec\ud83c\udde7" },
  { code: "ES", name: "Espa\u00f1a", flag: "\ud83c\uddea\ud83c\uddf8" },
  { code: "FR", name: "France", flag: "\ud83c\uddeb\ud83c\uddf7" },
  { code: "DE", name: "Deutschland", flag: "\ud83c\udde9\ud83c\uddea" },
  { code: "IT", name: "Italia", flag: "\ud83c\uddee\ud83c\uddf9" },
  { code: "PT", name: "Portugal", flag: "\ud83c\uddf5\ud83c\uddf9" },
  { code: "NL", name: "Nederland", flag: "\ud83c\uddf3\ud83c\uddf1" },
  { code: "BE", name: "Belgique", flag: "\ud83c\udde7\ud83c\uddea" },
  { code: "HR", name: "Hrvatska", flag: "\ud83c\udded\ud83c\uddf7" },
  { code: "UY", name: "Uruguay", flag: "\ud83c\uddfa\ud83c\uddfe" },
  { code: "CO", name: "Colombia", flag: "\ud83c\udde8\ud83c\uddf4" },
  { code: "CL", name: "Chile", flag: "\ud83c\udde8\ud83c\uddf1" },
  { code: "PE", name: "Per\u00fa", flag: "\ud83c\uddf5\ud83c\uddea" },
  { code: "EC", name: "Ecuador", flag: "\ud83c\uddea\ud83c\udde8" },
  { code: "PY", name: "Paraguay", flag: "\ud83c\uddf5\ud83c\uddfe" },
  { code: "VE", name: "Venezuela", flag: "\ud83c\uddfb\ud83c\uddea" },
  { code: "BO", name: "Bolivia", flag: "\ud83c\udde7\ud83c\uddf4" },
  { code: "JP", name: "Japan", flag: "\ud83c\uddef\ud83c\uddf5" },
  { code: "KR", name: "Korea", flag: "\ud83c\uddf0\ud83c\uddf7" },
  { code: "AU", name: "Australia", flag: "\ud83c\udde6\ud83c\uddfa" },
  { code: "CA", name: "Canada", flag: "\ud83c\udde8\ud83c\udde6" },
  { code: "MA", name: "Morocco", flag: "\ud83c\uddf2\ud83c\udde6" },
  { code: "SN", name: "S\u00e9n\u00e9gal", flag: "\ud83c\uddf8\ud83c\uddf3" },
  { code: "GH", name: "Ghana", flag: "\ud83c\uddec\ud83c\udded" },
  { code: "CM", name: "Cameroun", flag: "\ud83c\udde8\ud83c\uddf2" },
  { code: "NG", name: "Nigeria", flag: "\ud83c\uddf3\ud83c\uddec" },
  { code: "TN", name: "Tunisia", flag: "\ud83c\uddf9\ud83c\uddf3" },
  { code: "EG", name: "Egypt", flag: "\ud83c\uddea\ud83c\uddec" },
  { code: "DZ", name: "Algeria", flag: "\ud83c\udde9\ud83c\uddff" },
  { code: "ZA", name: "South Africa", flag: "\ud83c\uddff\ud83c\udde6" },
  { code: "SA", name: "Saudi Arabia", flag: "\ud83c\uddf8\ud83c\udde6" },
  { code: "QA", name: "Qatar", flag: "\ud83c\uddf6\ud83c\udde6" },
  { code: "IR", name: "Iran", flag: "\ud83c\uddee\ud83c\uddf7" },
  { code: "PL", name: "Polska", flag: "\ud83c\uddf5\ud83c\uddf1" },
  { code: "DK", name: "Danmark", flag: "\ud83c\udde9\ud83c\uddf0" },
  { code: "RS", name: "Srbija", flag: "\ud83c\uddf7\ud83c\uddf8" },
  { code: "CH", name: "Schweiz", flag: "\ud83c\udde8\ud83c\udded" },
  { code: "AT", name: "\u00d6sterreich", flag: "\ud83c\udde6\ud83c\uddf9" },
  { code: "SE", name: "Sverige", flag: "\ud83c\uddf8\ud83c\uddea" },
  { code: "NO", name: "Norge", flag: "\ud83c\uddf3\ud83c\uddf4" },
  { code: "CR", name: "Costa Rica", flag: "\ud83c\udde8\ud83c\uddf7" },
  { code: "PA", name: "Panam\u00e1", flag: "\ud83c\uddf5\ud83c\udde6" },
  { code: "HN", name: "Honduras", flag: "\ud83c\udded\ud83c\uddf3" },
  { code: "JM", name: "Jamaica", flag: "\ud83c\uddef\ud83c\uddf2" },
  { code: "IN", name: "India", flag: "\ud83c\uddee\ud83c\uddf3" },
  { code: "CN", name: "China", flag: "\ud83c\udde8\ud83c\uddf3" },
  { code: "ID", name: "Indonesia", flag: "\ud83c\uddee\ud83c\udde9" },
  { code: "PK", name: "Pakistan", flag: "\ud83c\uddf5\ud83c\uddf0" },
  { code: "BD", name: "Bangladesh", flag: "\ud83c\udde7\ud83c\udde9" },
  { code: "PH", name: "Philippines", flag: "\ud83c\uddf5\ud83c\udded" },
  { code: "TR", name: "T\u00fcrkiye", flag: "\ud83c\uddf9\ud83c\uddf7" },
  { code: "RU", name: "Russia", flag: "\ud83c\uddf7\ud83c\uddfa" },
  { code: "UA", name: "Ukraine", flag: "\ud83c\uddfa\ud83c\udde6" },
  { code: "CZ", name: "\u010cesko", flag: "\ud83c\udde8\ud83c\uddff" },
  { code: "RO", name: "Rom\u00e2nia", flag: "\ud83c\uddf7\ud83c\uddf4" },
  { code: "GR", name: "Greece", flag: "\ud83c\uddec\ud83c\uddf7" },
  { code: "IE", name: "Ireland", flag: "\ud83c\uddee\ud83c\uddea" },
  { code: "IL", name: "Israel", flag: "\ud83c\uddee\ud83c\uddf1" },
  { code: "NZ", name: "New Zealand", flag: "\ud83c\uddf3\ud83c\uddff" },
];

const POPULAR_CODES = [
  "AR", "BR", "MX", "US", "GB", "ES", "FR", "DE", "IT", "PT", "CO", "UY",
];

interface CountryPickerProps {
  onSelect: (code: string) => void;
  onClose: () => void;
}

export default function CountryPicker({ onSelect, onClose }: CountryPickerProps) {
  const [search, setSearch] = useState("");

  // Escape key listener
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [onClose]);

  const popular = useMemo(
    () => COUNTRIES.filter((c) => POPULAR_CODES.includes(c.code)),
    []
  );

  const filtered = useMemo(() => {
    if (!search) return COUNTRIES;
    const q = search.toLowerCase();
    return COUNTRIES.filter(
      (c) =>
        c.name.toLowerCase().includes(q) || c.code.toLowerCase().includes(q)
    );
  }, [search]);

  const handleSelect = (code: string) => {
    localStorage.setItem("matchfeel_country", code);
    onSelect(code);
  };

  const handleBackdropClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      // Only close if clicking the backdrop itself, not the modal content
      if (e.target === e.currentTarget) onClose();
    },
    [onClose]
  );

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
      onClick={handleBackdropClick}
    >
      <div className="w-full max-w-sm max-h-[80vh] flex flex-col rounded-2xl bg-zinc-900/95 border border-zinc-700/50 shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="px-4 pt-5 pb-3 text-center relative">
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-3 right-3 w-8 h-8 flex items-center justify-center rounded-full bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white transition-colors"
            aria-label="Cerrar"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          <h2 className="text-lg font-semibold text-white">
            De donde sos?
          </h2>
          <p className="text-sm text-zinc-400 mt-0.5">
            Elegi tu pais para reaccionar
          </p>
        </div>

        {/* Search */}
        <div className="px-4 pb-3">
          <input
            type="text"
            placeholder="Buscar..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg bg-zinc-800 border border-zinc-700/50 px-3 py-2 text-sm text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-zinc-500"
            autoFocus
          />
        </div>

        {/* Country list */}
        <div className="flex-1 overflow-y-auto px-3 pb-4 space-y-3">
          {/* Popular section (only when not searching) */}
          {!search && (
            <div>
              <p className="text-[11px] font-medium text-zinc-500 uppercase tracking-wider px-1 mb-1.5">
                Populares
              </p>
              <div className="grid grid-cols-3 gap-1.5">
                {popular.map((c) => (
                  <button
                    key={c.code}
                    onClick={() => handleSelect(c.code)}
                    className="flex items-center gap-1.5 rounded-lg bg-zinc-800/70 border border-zinc-700/30 px-2.5 py-2 text-left hover:bg-zinc-700/70 hover:border-zinc-600/50 transition-colors"
                  >
                    <span className="text-lg leading-none">{c.flag}</span>
                    <span className="text-xs text-zinc-300 truncate">
                      {c.code}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Full list */}
          <div>
            {!search && (
              <p className="text-[11px] font-medium text-zinc-500 uppercase tracking-wider px-1 mb-1.5">
                Todos los paises
              </p>
            )}
            <div className="grid grid-cols-2 gap-1">
              {filtered.map((c) => (
                <button
                  key={c.code}
                  onClick={() => handleSelect(c.code)}
                  className="flex items-center gap-2 rounded-lg px-2.5 py-2 text-left hover:bg-zinc-800/80 transition-colors"
                >
                  <span className="text-lg leading-none">{c.flag}</span>
                  <div className="min-w-0">
                    <span className="text-sm text-zinc-200 truncate block">
                      {c.name}
                    </span>
                  </div>
                </button>
              ))}
            </div>
            {filtered.length === 0 && (
              <p className="text-sm text-zinc-500 text-center py-4">
                Sin resultados
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
