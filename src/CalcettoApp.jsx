import React, { useState, useMemo, useRef, useEffect } from "react";
import { supabase } from "./supabaseClient";

/* ---------------------------------------------------------
   TOKEN SYSTEM
   Ispirazione: campo da calcetto sotto le luci dei riflettori,
   cartellini e figurine da spogliatoio.
--------------------------------------------------------- */
const COLORS = {
  pitchDark: "#0F2E1D",
  pitchMid: "#1B4332",
  pitchLine: "#2D6A4F",
  chalk: "#F2F0E9",
  chalkDim: "#B9C4BC",
  floodlight: "#FFC857",
  navy: "#16233D",
  red: "#E5533C",
  green: "#4CAF6D",
  bianchi: "#F2F0E9",
  neri: "#111418",
};

const FONT_IMPORT = `@import url('https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@500;600;700;800&family=Inter:wght@400;500;600;700&family=IBM+Plex+Mono:wght@500;600&display=swap');
.figurine-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 14px;
}
@media (min-width: 560px) {
  .figurine-grid { grid-template-columns: repeat(3, 1fr); gap: 16px; }
}
@media (min-width: 820px) {
  .figurine-grid { grid-template-columns: repeat(4, 1fr); }
}
@media (min-width: 1100px) {
  .figurine-grid { grid-template-columns: repeat(5, 1fr); }
}

.selezione-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
}
@media (min-width: 480px) {
  .selezione-grid { grid-template-columns: repeat(4, 1fr); }
}
@media (min-width: 700px) {
  .selezione-grid { grid-template-columns: repeat(5, 1fr); }
}
@media (min-width: 980px) {
  .selezione-grid { grid-template-columns: repeat(6, 1fr); }
}

/* Feedback al tocco su tutti i bottoni */
button {
  transition: filter .15s ease, transform .08s ease, box-shadow .15s ease;
}
button:hover:not(:disabled) {
  filter: brightness(1.12);
}
button:active:not(:disabled) {
  transform: scale(0.96);
}
button:disabled {
  cursor: not-allowed;
}

/* Focus da tastiera, coerente col tema */
button:focus-visible, select:focus-visible, input:focus-visible, a:focus-visible {
  outline: 2px solid #FFC857;
  outline-offset: 2px;
  border-radius: 4px;
}

/* Scrollbar sottile e coerente col tema, dove supportata */
::-webkit-scrollbar { width: 8px; height: 8px; }
::-webkit-scrollbar-track { background: transparent; }
::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.15); border-radius: 8px; }
::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.28); }
* { scrollbar-width: thin; scrollbar-color: rgba(255,255,255,0.18) transparent; }

/* Figurine: piccolo sollevamento al passaggio del mouse */
.figurina-hover {
  transition: transform .18s ease, box-shadow .18s ease;
}
.figurina-hover:hover {
  transform: translateY(-4px);
}

/* Barra delle tab scorrevole invece che a capo */
.tabs-scroll {
  overflow-x: auto;
  overflow-y: hidden;
  flex-wrap: nowrap !important;
  scrollbar-width: none;
}
.tabs-scroll::-webkit-scrollbar { display: none; }
.tabs-scroll button { white-space: nowrap; flex-shrink: 0; }

/* Dissolvenza leggera al cambio contenuto */
@keyframes fadeInUp {
  from { opacity: 0; transform: translateY(6px); }
  to { opacity: 1; transform: translateY(0); }
}
.fade-in { animation: fadeInUp .22s ease; }

/* Spinner di caricamento */
@keyframes spin { to { transform: rotate(360deg); } }
.spinner {
  width: 26px; height: 26px; border-radius: 50%;
  border: 3px solid rgba(255,255,255,0.15);
  border-top-color: #FFC857;
  animation: spin .8s linear infinite;
}`;

function Spinner({ testo }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 12, padding: "50px 0" }}>
      <div className="spinner" />
      {testo && <div style={{ color: COLORS.chalkDim, fontFamily: "Inter, sans-serif", fontSize: 12.5 }}>{testo}</div>}
    </div>
  );
}

/* ---------------------------------------------------------
   MOCK DATA
--------------------------------------------------------- */
const DIMENSIONE_SQUADRA = 6;

const initialPlayers = [
  { id: 1, name: "Marco Bianchi", initials: "MB", role: "Portiere", overall: 78, affidabilita: 96, presenze: 44, assenze: 1, mvp: 5, colore: "#2D6A4F" },
  { id: 2, name: "Luca Ferrari", initials: "LF", role: "Difensore", overall: 82, affidabilita: 88, presenze: 40, assenze: 4, mvp: 3, colore: "#1B4332" },
  { id: 3, name: "Andrea Russo", initials: "AR", role: "Centrocampo", overall: 85, affidabilita: 74, presenze: 32, assenze: 9, mvp: 8, colore: "#16233D" },
  { id: 4, name: "Davide Colombo", initials: "DC", role: "Attaccante", overall: 88, affidabilita: 91, presenze: 42, assenze: 3, mvp: 11, colore: "#E5533C" },
  { id: 5, name: "Simone Greco", initials: "SG", role: "Difensore", overall: 74, affidabilita: 65, presenze: 23, assenze: 12, mvp: 1, colore: "#2D6A4F" },
  { id: 6, name: "Fabrizio Tardivo", initials: "FT", role: "Attaccante", overall: 80, affidabilita: 93, presenze: 38, assenze: 2, mvp: 4, colore: "#FFC857" },
  { id: 7, name: "Matteo Conti", initials: "MC", role: "Portiere", overall: 71, affidabilita: 82, presenze: 27, assenze: 6, mvp: 0, colore: "#1B4332" },
  { id: 8, name: "Filippo Rizzo", initials: "FR", role: "Difensore", overall: 76, affidabilita: 90, presenze: 35, assenze: 3, mvp: 2, colore: "#16233D" },
  { id: 9, name: "Alessio Romano", initials: "AL", role: "Centrocampo", overall: 79, affidabilita: 79, presenze: 29, assenze: 7, mvp: 3, colore: "#2D6A4F" },
  { id: 10, name: "Giacomo Marino", initials: "GM", role: "Attaccante", overall: 83, affidabilita: 85, presenze: 33, assenze: 5, mvp: 6, colore: "#E5533C" },
  { id: 11, name: "Riccardo Villa", initials: "RV", role: "Centrocampo", overall: 72, affidabilita: 70, presenze: 20, assenze: 10, mvp: 0, colore: "#1B4332" },
  { id: 12, name: "Nicola Barbieri", initials: "NB", role: "Difensore", overall: 77, affidabilita: 94, presenze: 39, assenze: 2, mvp: 2, colore: "#16233D" },
];

// Partita da convocare (prossima, giovedì)
// Partita giocata martedì, in attesa di voti e di risultato
// Due partite storiche già concluse (una di martedì, una di giovedì)
const initialMatches = [
  {
    id: 103, giorno: "Giovedì", data: "28 Ago", ora: "21:00", campo: "Centro Sportivo San Siro",
    stato: "convocazione",
    convocati: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12], confermati: [1, 4, 6], rifiutati: [5], inAttesa: [2, 3],
    squadraBianchi: [1, 2, 4, 8, 10, 12], squadraNeri: [3, 5, 6, 7, 9, 11],
    risultato: null, gol: {},
  },
  {
    id: 102, giorno: "Martedì", data: "26 Ago", ora: "21:00", campo: "Centro Sportivo San Siro",
    stato: "da_votare",
    convocati: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12], confermati: [1, 2, 3, 4, 6], rifiutati: [5], inAttesa: [],
    squadraBianchi: [1, 3, 4, 7, 9, 11], squadraNeri: [2, 6, 8, 10, 12, 5],
    risultato: null, gol: {},
  },
  {
    id: 101, giorno: "Giovedì", data: "21 Ago", ora: "21:00", campo: "Centro Sportivo San Siro",
    stato: "storico",
    convocati: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12], confermati: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12], rifiutati: [], inAttesa: [],
    squadraBianchi: [1, 2, 4, 8, 10, 12], squadraNeri: [3, 5, 6, 7, 9, 11],
    risultato: { bianchi: 7, neri: 5 },
    gol: { 4: 4, 2: 1, 1: 1, 10: 1, 6: 2, 3: 1, 5: 1, 9: 1 },
    mvp: 4,
  },
  {
    id: 100, giorno: "Martedì", data: "19 Ago", ora: "21:00", campo: "Centro Sportivo San Siro",
    stato: "storico",
    convocati: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12], confermati: [1, 2, 3, 4, 6, 7, 8, 9, 10, 12], rifiutati: [5, 11], inAttesa: [],
    squadraBianchi: [1, 4, 6, 8, 10, 12], squadraNeri: [2, 3, 7, 9],
    risultato: { bianchi: 5, neri: 4 },
    gol: { 4: 2, 6: 1, 1: 1, 10: 1, 3: 3, 2: 1 },
    mvp: 3,
  },
];

// Voti "consenso" già dati dagli altri per la partita da votare (mock, per demo controllo anomalie)
const consensoVoti = { 1: 6.8, 2: 6.2, 3: 7.4, 4: 8.1, 5: 5.0 };

/* ---------------------------------------------------------
   STYLE HELPERS
--------------------------------------------------------- */
const chip = (bg, color = COLORS.chalk) => ({
  background: bg,
  color,
  borderRadius: 999,
  padding: "3px 10px",
  fontSize: 11,
  fontWeight: 600,
  fontFamily: "Inter, sans-serif",
  letterSpacing: 0.3,
  display: "inline-flex",
  alignItems: "center",
  gap: 4,
});

function affidabilitaColor(v) {
  if (v >= 85) return COLORS.green;
  if (v >= 65) return COLORS.floodlight;
  return COLORS.red;
}

function nomeById(players, id, rimossi = []) {
  if (rimossi.includes(id) || rimossi.includes(String(id))) return "Giocatore rimosso";
  return players.find((p) => p.id === id)?.name || "—";
}

function golTotaliPerGiocatore(matches) {
  const tot = {};
  matches.forEach((m) => {
    Object.entries(m.gol || {}).forEach(([pid, n]) => {
      tot[pid] = (tot[pid] || 0) + n;
    });
  });
  return tot;
}

function bucheTotaliPerGiocatore(matches) {
  const tot = {};
  matches.forEach((m) => {
    (m.buche || []).forEach((pid) => {
      tot[pid] = (tot[pid] || 0) + 1;
    });
  });
  return tot;
}

function autogolTotaliPerGiocatore(matches) {
  const tot = {};
  matches.forEach((m) => {
    Object.entries(m.autogol || {}).forEach(([pid, n]) => {
      tot[pid] = (tot[pid] || 0) + n;
    });
  });
  return tot;
}

// Le date arrivano da Supabase in formato AAAA-MM-GG: le mostriamo all'italiana.
function formattaDataIT(iso) {
  if (!iso) return "";
  const parti = String(iso).split("-");
  if (parti.length !== 3) return iso;
  const [y, m, d] = parti;
  return `${d}-${m}-${y}`;
}

// Media troncata: con più di 2 voti esclude il più alto e il più basso.
function mediaTroncata(voti) {
  if (!voti || voti.length === 0) return null;
  if (voti.length <= 2) return voti.reduce((a, b) => a + b, 0) / voti.length;
  const ordinati = [...voti].sort((a, b) => a - b);
  const centrali = ordinati.slice(1, -1);
  return centrali.reduce((a, b) => a + b, 0) / centrali.length;
}

// Calcola l'MVP di una partita dai voti dei giocatori: chi ha più voti vince.
// In caso di parità in cima, non assegna nessuno (evita scelte arbitrarie).
function calcolaMvp(matchId, votiMvp) {
  const conteggio = {};
  votiMvp
    .filter((v) => v.match_id === matchId)
    .forEach((v) => {
      conteggio[v.votato_id] = (conteggio[v.votato_id] || 0) + 1;
    });
  const voci = Object.entries(conteggio).sort((a, b) => b[1] - a[1]);
  if (voci.length === 0) return null;
  if (voci.length > 1 && voci[0][1] === voci[1][1]) return { id: null, pari: true, voti: voci[0][1] };
  return { id: voci[0][0], voti: voci[0][1] };
}

function votiRicevutiPerGiocatore(voti) {
  const map = {};
  voti.forEach((v) => {
    (map[v.votato_id] ||= []).push(Number(v.voto));
  });
  return map;
}

// Presenze/assenze reali: per ogni partita storico a cui il giocatore era
// assegnato, conta presenza se ha giocato, assenza se ha dato buca.
function presenzeAssenzePerGiocatore(matches) {
  const stat = {};
  matches
    .filter((m) => m.stato === "storico")
    .forEach((m) => {
      [...m.squadraBianchi, ...m.squadraNeri].forEach((id) => {
        stat[id] ||= { presenze: 0, assenze: 0 };
        if ((m.buche || []).includes(id)) stat[id].assenze += 1;
        else stat[id].presenze += 1;
      });
    });
  return stat;
}

/* ---------------------------------------------------------
   SQUADRA CHIP (bianchi/neri)
--------------------------------------------------------- */
function MiniAvatar({ p, size = 30 }) {
  return (
    <div
      style={{
        width: size, height: size, borderRadius: "50%", background: p.foto_url ? "transparent" : p.colore,
        display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden", flexShrink: 0,
        fontFamily: "Barlow Condensed, sans-serif", fontWeight: 700, fontSize: size * 0.4, color: COLORS.chalk,
      }}
    >
      {p.foto_url ? <img src={p.foto_url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : p.initials}
    </div>
  );
}

function SquadraBadge({ tipo }) {
  const bianchi = tipo === "bianchi";
  return (
    <span
      style={{
        ...chip(bianchi ? COLORS.bianchi : COLORS.neri, bianchi ? COLORS.pitchDark : COLORS.chalk),
        border: bianchi ? `1px solid rgba(0,0,0,0.15)` : `1px solid rgba(255,255,255,0.15)`,
        fontWeight: bianchi ? 600 : 700,
        fontSize: bianchi ? 10.5 : 11,
      }}
    >
      {bianchi ? "⚪ BIANCHI" : "⚫ NERI"}
    </span>
  );
}

/* ---------------------------------------------------------
   PLAYER CARD (figurina)
--------------------------------------------------------- */
function PlayerCard({ p, onClick, selected, larghezzaFissa = true }) {
  return (
    <div
      onClick={onClick}
      className="figurina-hover"
      style={{
        position: "relative",
        width: larghezzaFissa ? 168 : "100%",
        borderRadius: 16,
        padding: 3,
        cursor: onClick ? "pointer" : "default",
        background: `linear-gradient(155deg, ${COLORS.floodlight} 0%, #8a6a1a 45%, ${COLORS.floodlight} 100%)`,
        boxShadow: selected
          ? `0 0 0 2px ${COLORS.floodlight}, 0 6px 18px rgba(0,0,0,0.5)`
          : "0 4px 14px rgba(0,0,0,0.4)",
      }}
    >
      <div
        style={{
          background: `
            repeating-linear-gradient(135deg, rgba(255,255,255,0.02) 0px, rgba(255,255,255,0.02) 2px, transparent 2px, transparent 6px),
            radial-gradient(circle at 30% 0%, ${COLORS.pitchLine} 0%, transparent 55%),
            linear-gradient(165deg, ${COLORS.pitchDark} 0%, #050c07 100%)
          `,
          borderRadius: 13,
          border: `1px solid rgba(255,200,87,0.35)`,
          padding: "10px 11px 11px",
          fontFamily: "Inter, sans-serif",
        }}
      >
        {/* Banner superiore */}
        <div
          style={{
            textAlign: "center",
            fontFamily: "Barlow Condensed, sans-serif",
            fontWeight: 800,
            fontSize: 9.5,
            letterSpacing: 1.2,
            color: "#0F2E1D",
            background: `linear-gradient(90deg, #8a6a1a, ${COLORS.floodlight}, #8a6a1a)`,
            borderRadius: 5,
            padding: "3px 4px",
            marginBottom: 8,
            textTransform: "uppercase",
          }}
        >
          Calcetto Totale
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", padding: "0 1px" }}>
          <div
            style={{
              fontFamily: "IBM Plex Mono, monospace",
              fontSize: 24,
              fontWeight: 700,
              color: COLORS.floodlight,
              lineHeight: 1,
              textShadow: "0 0 8px rgba(255,200,87,0.35)",
            }}
          >
            {p.overall}
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: 8.5, color: COLORS.chalkDim, textTransform: "uppercase", letterSpacing: 0.6 }}>
              {p.role}
            </div>
            {p.ospite && (
              <div style={{ fontSize: 7.5, color: COLORS.red, textTransform: "uppercase", letterSpacing: 0.5, fontWeight: 700, marginTop: 2 }}>
                Ospite
              </div>
            )}
          </div>
        </div>

        {/* Foto con anello luminoso */}
        <div
          style={{
            width: 74,
            height: 74,
            borderRadius: "50%",
            margin: "8px auto 6px",
            padding: 3,
            background: `conic-gradient(from 180deg, ${COLORS.floodlight}, #4dd0e1, ${COLORS.floodlight})`,
            boxShadow: "0 0 10px rgba(255,200,87,0.3)",
          }}
        >
          <div
            style={{
              width: "100%",
              height: "100%",
              borderRadius: "50%",
              background: p.foto_url ? "transparent" : p.colore,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontFamily: "Barlow Condensed, sans-serif",
              fontWeight: 700,
              fontSize: 24,
              color: COLORS.chalk,
              border: `2px solid ${COLORS.pitchDark}`,
              overflow: "hidden",
            }}
          >
            {p.foto_url ? (
              <img src={p.foto_url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            ) : (
              p.initials
            )}
          </div>
        </div>

        <div
          style={{
            fontFamily: "Barlow Condensed, sans-serif",
            fontWeight: 700,
            fontSize: 15,
            color: COLORS.chalk,
            textAlign: "center",
            letterSpacing: 0.3,
          }}
        >
          {p.name}
        </div>
        {p.soprannome && (
          <div style={{ fontFamily: "Georgia, serif", fontStyle: "italic", fontSize: 11, color: COLORS.floodlight, textAlign: "center", marginBottom: 4 }}>
            "{p.soprannome}"
          </div>
        )}
        <div style={{ marginBottom: p.soprannome ? 6 : 10 }} />

        {/* Affidabilita gauge */}
        <div style={{ marginBottom: 8 }}>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 8.5, color: COLORS.chalkDim, marginBottom: 2, letterSpacing: 0.4 }}>
            <span>AFFIDABILITÀ</span>
            <span style={{ color: affidabilitaColor(p.affidabilita), fontWeight: 700 }}>{p.affidabilita}%</span>
          </div>
          <div style={{ height: 5, background: "rgba(255,255,255,0.08)", borderRadius: 3, overflow: "hidden", border: "1px solid rgba(255,255,255,0.05)" }}>
            <div style={{ height: "100%", width: `${p.affidabilita}%`, background: affidabilitaColor(p.affidabilita) }} />
          </div>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4, 1fr)",
            gap: 4,
            marginTop: 8,
            borderTop: "1px solid rgba(255,200,87,0.2)",
            paddingTop: 8,
          }}
        >
          {[
            { icona: "👕", val: p.presenze, etichetta: "PRES" },
            { icona: "🚫", val: p.assenze, etichetta: "ASS" },
            { icona: "⚽", val: p.gol ?? 0, etichetta: "GOL" },
            { icona: "🏆", val: p.mvp, etichetta: "MVP" },
          ].map((s) => (
            <div
              key={s.etichetta}
              style={{
                textAlign: "center", background: "rgba(255,255,255,0.03)", borderRadius: 6,
                border: "1px solid rgba(255,200,87,0.15)", padding: "4px 0 3px",
              }}
            >
              <div style={{ fontSize: 12, lineHeight: 1 }}>{s.icona}</div>
              <div style={{ fontFamily: "IBM Plex Mono, monospace", fontWeight: 700, fontSize: 11, color: COLORS.chalk, marginTop: 2 }}>{s.val}</div>
              <div style={{ fontSize: 6.5, color: COLORS.chalkDim, letterSpacing: 0.4, marginTop: 1 }}>{s.etichetta}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ---------------------------------------------------------
   ROLE SWITCHER
--------------------------------------------------------- */
function RoleSwitcher({ role, setRole, opzioni }) {
  return (
    <div style={{ display: "flex", gap: 4, background: "rgba(0,0,0,0.25)", padding: 3, borderRadius: 9 }}>
      {opzioni.map((r) => (
        <button
          key={r.id}
          onClick={() => setRole(r.id)}
          title={r.label}
          aria-label={r.label}
          style={{
            border: "none",
            cursor: "pointer",
            width: 30,
            height: 30,
            borderRadius: 6,
            fontSize: 15,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: role === r.id ? COLORS.floodlight : "transparent",
            color: role === r.id ? COLORS.pitchDark : COLORS.chalkDim,
            transition: "all .15s ease",
          }}
        >
          {r.icon}
        </button>
      ))}
    </div>
  );
}

/* ---------------------------------------------------------
   SECTION TABS
--------------------------------------------------------- */
function Tabs({ tabs, active, setActive, badges = {} }) {
  return (
    <div className="tabs-scroll" style={{ display: "flex", gap: 22, borderBottom: `1px solid ${COLORS.pitchLine}`, marginBottom: 20, flexWrap: "wrap" }}>
      {tabs.map((t) => (
        <button
          key={t.id}
          onClick={() => setActive(t.id)}
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            paddingBottom: 10,
            fontFamily: "Barlow Condensed, sans-serif",
            fontWeight: 600,
            fontSize: 17,
            letterSpacing: 0.3,
            color: active === t.id ? COLORS.floodlight : COLORS.chalkDim,
            borderBottom: active === t.id ? `2px solid ${COLORS.floodlight}` : "2px solid transparent",
            position: "relative",
          }}
        >
          {t.label}
          {badges[t.id] > 0 && (
            <span
              style={{
                position: "absolute", top: -4, right: -14, background: COLORS.red, color: COLORS.chalk,
                borderRadius: 999, fontSize: 10, fontFamily: "Inter, sans-serif", fontWeight: 700,
                minWidth: 16, height: 16, display: "flex", alignItems: "center", justifyContent: "center", padding: "0 3px",
              }}
            >
              {badges[t.id] > 9 ? "9+" : badges[t.id]}
            </span>
          )}
        </button>
      ))}
    </div>
  );
}

/* ---------------------------------------------------------
   DASHBOARD (giocatore)
--------------------------------------------------------- */
function Dashboard({ players, matches, currentPlayerId, voti, sonoOrganizzatore, onVaiACreaPartita, rimossi = [] }) {
  const match = matches.find((m) => m.stato === "aperta");
  const me = players.find((p) => p.id === currentPlayerId);
  const [dettaglioAperto, setDettaglioAperto] = useState(false);

  const miaSquadra = match
    ? match.squadraBianchi.includes(currentPlayerId)
      ? "bianchi"
      : match.squadraNeri.includes(currentPlayerId)
      ? "neri"
      : null
    : null;

  return (
    <div>
      <div
        onClick={sonoOrganizzatore && match ? onVaiACreaPartita : undefined}
        style={{
          background: `linear-gradient(120deg, ${COLORS.pitchMid}, ${COLORS.pitchDark})`,
          borderRadius: 16,
          padding: 22,
          border: `1px solid ${COLORS.pitchLine}`,
          marginBottom: 24,
          cursor: sonoOrganizzatore && match ? "pointer" : "default",
        }}
      >
        {match ? (
          <>
            <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
              <div style={chip("rgba(255,200,87,0.15)", COLORS.floodlight)}>{match.giorno.toUpperCase()}</div>
              {miaSquadra && <SquadraBadge tipo={miaSquadra} />}
            </div>
            <div style={{ fontFamily: "Barlow Condensed, sans-serif", fontWeight: 800, fontSize: 30, color: COLORS.chalk, marginTop: 10 }}>
              {formattaDataIT(match.data)} · {match.ora}
            </div>
            <div style={{ fontFamily: "Inter, sans-serif", color: COLORS.chalkDim, fontSize: 14, marginTop: 2, marginBottom: 4 }}>
              📍 {match.campo}
            </div>
            <div style={{ fontSize: 11.5, color: COLORS.chalkDim, marginTop: 14, fontFamily: "Inter, sans-serif" }}>
              {sonoOrganizzatore
                ? "Tocca qui per modificare la formazione in Crea Partita."
                : miaSquadra
                ? "Le formazioni verranno inoltrate nel gruppo WhatsApp dall'organizzatore."
                : "L'organizzatore non ha ancora composto le squadre per questa partita."}
            </div>
          </>
        ) : (
          <div style={{ fontFamily: "Inter, sans-serif", color: COLORS.chalkDim, fontSize: 13.5 }}>
            Nessuna partita in programma al momento. {sonoOrganizzatore ? "Tocca qui per crearne una." : "L'organizzatore ne creerà una a breve."}
          </div>
        )}
      </div>

      {me && (
        <>
          <div style={{ fontFamily: "Barlow Condensed, sans-serif", fontWeight: 700, fontSize: 20, color: COLORS.chalk, marginBottom: 10 }}>
            La tua figurina
          </div>
          <PlayerCard p={me} onClick={() => setDettaglioAperto(true)} />
        </>
      )}

      {dettaglioAperto && me && (
        <DettaglioGiocatore player={me} matches={matches} voti={voti} onChiudi={() => setDettaglioAperto(false)} />
      )}
    </div>
  );
}

/* ---------------------------------------------------------
   SQUADRA (grid figurine) + dettaglio voti giocatore
--------------------------------------------------------- */
function Squadra({ players, rimossi = [], matches, voti }) {
  const attivi = players.filter((p) => !rimossi.includes(p.id));
  const [selezionato, setSelezionato] = useState(null);

  return (
    <div>
      <div style={{ fontFamily: "Barlow Condensed, sans-serif", fontWeight: 700, fontSize: 20, color: COLORS.chalk, marginBottom: 14 }}>
        Rosa · {attivi.length} giocatori
      </div>
      <div style={{ fontFamily: "Inter, sans-serif", fontSize: 12, color: COLORS.chalkDim, marginBottom: 14 }}>
        Tocca una figurina per vedere lo storico voti.
      </div>
      <div className="figurine-grid">
        {[...attivi].sort((a, b) => b.overall - a.overall).map((p) => (
          <PlayerCard key={p.id} p={p} larghezzaFissa={false} onClick={() => setSelezionato(p)} />
        ))}
      </div>

      {selezionato && (
        <DettaglioGiocatore player={selezionato} matches={matches} voti={voti} onChiudi={() => setSelezionato(null)} />
      )}
    </div>
  );
}

function DettaglioGiocatore({ player, matches, voti, onChiudi }) {
  const partite = matches
    .filter((m) => m.stato === "storico" && [...m.squadraBianchi, ...m.squadraNeri].includes(player.id))
    .sort((a, b) => new Date(b.data) - new Date(a.data));

  const righe = partite.map((m) => {
    const votiPartita = voti.filter((v) => v.match_id === m.id && v.votato_id === player.id).map((v) => Number(v.voto));
    const media = votiPartita.length > 0 ? votiPartita.reduce((a, b) => a + b, 0) / votiPartita.length : null;
    return { match: m, media, numero: votiPartita.length };
  });

  const mediaGenerale = player.mediaVoti;

  return (
    <div
      style={{
        position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", display: "flex",
        alignItems: "center", justifyContent: "center", padding: 20, zIndex: 50,
      }}
      onClick={onChiudi}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: "100%", maxWidth: 420, maxHeight: "85vh", overflowY: "auto",
          background: COLORS.navy, borderRadius: 16, padding: 22, border: `1px solid rgba(255,255,255,0.1)`,
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 10, marginBottom: 16 }}>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontFamily: "Barlow Condensed, sans-serif", fontWeight: 700, fontSize: 19, color: COLORS.chalk, wordBreak: "break-word" }}>
              {player.name}{player.soprannome ? ` "${player.soprannome}"` : ""}
            </div>
            <div style={{ fontFamily: "Inter, sans-serif", fontSize: 12, color: COLORS.chalkDim }}>Storico voti ricevuti</div>
          </div>
          <button
            onClick={onChiudi}
            style={{ background: "none", border: "none", color: COLORS.chalkDim, fontSize: 20, cursor: "pointer", lineHeight: 1, flexShrink: 0 }}
          >
            ✕
          </button>
        </div>

        <div style={{ background: "rgba(255,200,87,0.08)", border: `1px solid rgba(255,200,87,0.25)`, borderRadius: 10, padding: 14, marginBottom: 16, textAlign: "center" }}>
          <div style={{ fontFamily: "IBM Plex Mono, monospace", fontSize: 28, fontWeight: 600, color: COLORS.floodlight }}>
            {mediaGenerale != null ? mediaGenerale.toFixed(1) : "—"}
          </div>
          <div style={{ fontFamily: "Inter, sans-serif", fontSize: 11, color: COLORS.chalkDim }}>
            Media generale (troncata) su {player.numeroVoti || 0} voti ricevuti
          </div>
        </div>

        {righe.length === 0 ? (
          <div style={{ fontFamily: "Inter, sans-serif", fontSize: 13, color: COLORS.chalkDim }}>Nessuna partita votata ancora.</div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {righe.map(({ match, media, numero }) => (
              <div
                key={match.id}
                style={{
                  display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 6,
                  background: "rgba(255,255,255,0.04)", borderRadius: 8, padding: "9px 12px",
                }}
              >
                <span style={{ fontFamily: "Inter, sans-serif", fontSize: 13, color: COLORS.chalk }}>
                  {match.giorno} {formattaDataIT(match.data)}
                </span>
                <span style={{ fontFamily: "IBM Plex Mono, monospace", fontSize: 14, color: media != null ? COLORS.floodlight : COLORS.chalkDim }}>
                  {media != null ? `${media.toFixed(1)} (${numero} voti)` : "nessun voto"}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/* ---------------------------------------------------------
   STORICO PARTITE
--------------------------------------------------------- */
function Storico({ players, matches, rimossi = [], voti = [], votiMvp = [] }) {
  const passate = matches
    .filter((m) => m.stato === "storico" && m.risultato)
    .sort((a, b) => new Date(b.data) - new Date(a.data));

  const [pagellaAperta, setPagellaAperta] = useState({});

  const scaricaPagella = (m) => {
    const righe = [...m.squadraBianchi, ...m.squadraNeri]
      .filter((id) => !(m.buche || []).includes(id))
      .map((id) => {
        const votiGiocatore = voti.filter((v) => v.match_id === m.id && v.votato_id === id).map((v) => Number(v.voto));
        const media = mediaTroncata(votiGiocatore);
        return { nome: nomeById(players, id, rimossi), media };
      })
      .sort((a, b) => (b.media || 0) - (a.media || 0));

    const W = 1080;
    const H = 300 + righe.length * 72 + 110;
    const canvas = document.createElement("canvas");
    canvas.width = W;
    canvas.height = H;
    const ctx = canvas.getContext("2d");

    const bg = ctx.createLinearGradient(0, 0, W, H);
    bg.addColorStop(0, "#1B4332");
    bg.addColorStop(1, "#0F2E1D");
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, W, H);

    ctx.textAlign = "center";
    ctx.fillStyle = "#FFC857";
    ctx.font = "bold 38px sans-serif";
    ctx.fillText("📋 PAGELLA DELLA PARTITA", W / 2, 100);
    ctx.fillStyle = "#F2F0E9";
    ctx.font = "bold 50px sans-serif";
    ctx.fillText(`${m.giorno.toUpperCase()} ${formattaDataIT(m.data)}`, W / 2, 168);
    ctx.font = "30px sans-serif";
    ctx.fillStyle = "#B9C4BC";
    ctx.fillText(`Risultato finale: ${m.risultato.bianchi} — ${m.risultato.neri}`, W / 2, 214);

    let y = 300;
    righe.forEach((r, i) => {
      ctx.fillStyle = i % 2 === 0 ? "rgba(255,255,255,0.05)" : "rgba(255,255,255,0.09)";
      ctx.fillRect(70, y - 42, W - 140, 62);
      ctx.textAlign = "left";
      ctx.fillStyle = "#F2F0E9";
      ctx.font = "34px sans-serif";
      ctx.fillText(r.nome, 100, y);
      ctx.textAlign = "right";
      ctx.fillStyle = r.media != null ? "#FFC857" : "#B9C4BC";
      ctx.font = "bold 36px sans-serif";
      ctx.fillText(r.media != null ? r.media.toFixed(1) : "—", W - 100, y);
      y += 72;
    });

    ctx.textAlign = "center";
    ctx.fillStyle = "#B9C4BC";
    ctx.font = "24px sans-serif";
    ctx.fillText("Calcetto Martedì & Giovedì", W / 2, H - 30);

    const url = canvas.toDataURL("image/jpeg", 0.92);
    const a = document.createElement("a");
    a.href = url;
    a.download = `pagella-${m.giorno.toLowerCase()}-${m.data.replace(/\s/g, "-")}.jpg`;
    a.click();
  };

  return (
    <div>
      <div style={{ fontFamily: "Barlow Condensed, sans-serif", fontWeight: 700, fontSize: 20, color: COLORS.chalk, marginBottom: 4 }}>
        Storico partite
      </div>
      <div style={{ fontFamily: "Inter, sans-serif", fontSize: 13, color: COLORS.chalkDim, marginBottom: 18 }}>
        {passate.length} partite giocate · martedì e giovedì
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {passate.map((m) => {
          const marcatori = Object.entries(m.gol || {})
            .filter(([, n]) => n > 0)
            .sort((a, b) => b[1] - a[1]);
          const autogol = Object.entries(m.autogol || {}).filter(([, n]) => n > 0);
          const mvpPartita = calcolaMvp(m.id, votiMvp);
          return (
            <div key={m.id} style={{ background: COLORS.navy, borderRadius: 12, padding: "16px 18px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 10 }}>
                <div>
                  <div style={chip("rgba(255,255,255,0.08)", COLORS.chalkDim)}>{m.giorno.toUpperCase()} · {formattaDataIT(m.data)}</div>
                </div>
                {mvpPartita?.id && (
                  <span style={chip("rgba(255,200,87,0.15)", COLORS.floodlight)}>🏅 MVP: {nomeById(players, mvpPartita.id, rimossi)} ({mvpPartita.voti} voti)</span>
                )}
                {mvpPartita?.pari && (
                  <span style={chip("rgba(255,255,255,0.08)", COLORS.chalkDim)}>🏅 MVP in parità</span>
                )}
              </div>

              <div style={{ textAlign: "center", margin: "14px 0 16px" }}>
                <div
                  style={{
                    fontFamily: "IBM Plex Mono, monospace",
                    fontSize: 34,
                    fontWeight: 600,
                    color: COLORS.chalk,
                  }}
                >
                  {m.risultato.bianchi} — {m.risultato.neri}
                </div>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 4 }}>
                <div>
                  <SquadraBadge tipo="bianchi" />
                  <div style={{ fontFamily: "Inter, sans-serif", fontSize: 12, color: COLORS.chalkDim, marginTop: 6, lineHeight: 1.7 }}>
                    {m.squadraBianchi.map((id) => nomeById(players, id, rimossi)).join(" · ")}
                  </div>
                </div>
                <div>
                  <SquadraBadge tipo="neri" />
                  <div style={{ fontFamily: "Inter, sans-serif", fontSize: 12, color: COLORS.chalkDim, marginTop: 6, lineHeight: 1.7 }}>
                    {m.squadraNeri.map((id) => nomeById(players, id, rimossi)).join(" · ")}
                  </div>
                </div>
              </div>

              {marcatori.length > 0 && (
                <div style={{ borderTop: "1px solid rgba(255,255,255,0.08)", paddingTop: 10, display: "flex", gap: 8, flexWrap: "wrap" }}>
                  {marcatori.map(([id, n]) => (
                    <span key={id} style={chip("rgba(255,255,255,0.06)", COLORS.chalk)}>
                      ⚽ {nomeById(players, id, rimossi)} × {n}
                    </span>
                  ))}
                </div>
              )}

              {(m.buche || []).length > 0 && (
                <div style={{ borderTop: "1px solid rgba(255,255,255,0.08)", paddingTop: 10, marginTop: 10, display: "flex", gap: 8, flexWrap: "wrap" }}>
                  {m.buche.map((id) => (
                    <span key={id} style={chip("rgba(229,83,60,0.15)", COLORS.red)}>
                      🚫 {nomeById(players, id, rimossi)} ha dato buca
                    </span>
                  ))}
                </div>
              )}

              {autogol.length > 0 && (
                <div style={{ borderTop: "1px solid rgba(255,255,255,0.08)", paddingTop: 10, marginTop: 10, display: "flex", gap: 8, flexWrap: "wrap" }}>
                  {autogol.map(([id, n]) => (
                    <span key={id} style={chip("rgba(229,83,60,0.12)", COLORS.red)}>
                      🔴 Autogol {nomeById(players, id, rimossi)} × {n}
                    </span>
                  ))}
                </div>
              )}

              <div style={{ borderTop: "1px solid rgba(255,255,255,0.08)", paddingTop: 10, marginTop: 10 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap" }}>
                  <button
                    onClick={() => setPagellaAperta((s) => ({ ...s, [m.id]: !s[m.id] }))}
                    style={{
                      background: "none", border: "none", color: COLORS.floodlight, cursor: "pointer",
                      fontFamily: "Inter, sans-serif", fontWeight: 600, fontSize: 12, padding: 0,
                    }}
                  >
                    {pagellaAperta[m.id] ? "▲ Nascondi pagella" : "▼ Vedi pagella"}
                  </button>
                  <button
                    onClick={() => scaricaPagella(m)}
                    style={{
                      background: "none", border: `1px solid rgba(255,255,255,0.15)`, borderRadius: 6, cursor: "pointer",
                      color: COLORS.chalkDim, fontFamily: "Inter, sans-serif", fontWeight: 600, fontSize: 11.5, padding: "4px 10px",
                    }}
                  >
                    ⬇️ Scarica pagella JPG
                  </button>
                </div>

                {pagellaAperta[m.id] && (
                  <div style={{ marginTop: 10, display: "flex", flexDirection: "column", gap: 6 }}>
                    {[...m.squadraBianchi, ...m.squadraNeri]
                      .filter((id) => !(m.buche || []).includes(id))
                      .map((id) => {
                        const votiGiocatore = voti.filter((v) => v.match_id === m.id && v.votato_id === id).map((v) => Number(v.voto));
                        const media = mediaTroncata(votiGiocatore);
                        return { id, media, numero: votiGiocatore.length };
                      })
                      .sort((a, b) => (b.media || 0) - (a.media || 0))
                      .map((r) => (
                        <div key={r.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 6, background: "rgba(255,255,255,0.04)", borderRadius: 7, padding: "7px 10px" }}>
                          <span style={{ fontFamily: "Inter, sans-serif", fontSize: 12.5, color: COLORS.chalk }}>
                            {nomeById(players, r.id, rimossi)}
                          </span>
                          <span style={{ fontFamily: "IBM Plex Mono, monospace", fontSize: 13, color: r.media != null ? COLORS.floodlight : COLORS.chalkDim }}>
                            {r.media != null ? `${r.media.toFixed(1)} (${r.numero})` : "senza voti"}
                          </span>
                        </div>
                      ))}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ---------------------------------------------------------
   VOTAZIONE POST-PARTITA con controllo anomalie
--------------------------------------------------------- */
function Votazione({ players, matches, currentPlayerId, onVota, onSegnaGolPropri, votiMvp = [], onVotaMvp }) {
  const partite = matches.filter((m) => m.stato === "storico").sort((a, b) => new Date(b.data) - new Date(a.data));
  const match = partite[0];
  const partecipantiIds = match
    ? [...match.squadraBianchi, ...match.squadraNeri].filter((id) => !match.buche.includes(id) && id !== currentPlayerId)
    : [];
  const compagni = players.filter((p) => partecipantiIds.includes(p.id));

  const sonoPartecipante =
    match && [...match.squadraBianchi, ...match.squadraNeri].includes(currentPlayerId) && !match.buche.includes(currentPlayerId);

  // I voti si chiudono 2 giorni dopo la partita
  const scadenzaVoti = match ? new Date(`${match.data}T${match.ora || "00:00"}:00`) : null;
  if (scadenzaVoti) scadenzaVoti.setDate(scadenzaVoti.getDate() + 2);
  const votazioniChiuse = scadenzaVoti ? new Date() > scadenzaVoti : false;
  const scadenzaTesto = scadenzaVoti
    ? scadenzaVoti.toLocaleDateString("it-IT", { day: "2-digit", month: "long", hour: "2-digit", minute: "2-digit" })
    : "";

  const [miGol, setMiGol] = useState(0);
  const [salvataggioGolInCorso, setSalvataggioGolInCorso] = useState(false);
  const [golSalvato, setGolSalvato] = useState(false);

  const [mvpScelto, setMvpScelto] = useState("");
  const [mvpInCorso, setMvpInCorso] = useState(false);
  const mioVotoMvp = votiMvp.find((v) => v.match_id === match?.id && v.votante_id === currentPlayerId);

  useEffect(() => {
    setMiGol(match?.gol?.[currentPlayerId] || 0);
    setGolSalvato(false);
    setMvpScelto(mioVotoMvp?.votato_id || "");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [match?.id, currentPlayerId]);

  const salvaMiGol = async () => {
    setSalvataggioGolInCorso(true);
    await onSegnaGolPropri(match.id, miGol);
    setSalvataggioGolInCorso(false);
    setGolSalvato(true);
  };

  const votaMvp = async (votatoId) => {
    setMvpScelto(votatoId);
    setMvpInCorso(true);
    await onVotaMvp(match.id, votatoId);
    setMvpInCorso(false);
  };

  const [votiEsistenti, setVotiEsistenti] = useState([]);
  const [caricato, setCaricato] = useState(false);
  const [voti, setVoti] = useState({});
  const [inviati, setInviati] = useState({});
  const [inModifica, setInModifica] = useState({});
  const [invioInCorso, setInvioInCorso] = useState({});

  const SOGLIA_SCARTO = 2;

  useEffect(() => {
    let annullato = false;
    async function carica() {
      if (!match) {
        setCaricato(true);
        return;
      }
      const { data } = await supabase.from("votes").select("votante_id, votato_id, voto").eq("match_id", match.id);
      if (annullato) return;
      setVotiEsistenti(data || []);
      const gia = {};
      (data || []).forEach((v) => {
        if (v.votante_id === currentPlayerId) gia[v.votato_id] = true;
      });
      setInviati(gia);
      setCaricato(true);
    }
    carica();
    return () => {
      annullato = true;
    };
  }, [match?.id, currentPlayerId]);

  const consensoPer = (playerId) => {
    const altri = votiEsistenti.filter((v) => v.votato_id === playerId && v.votante_id !== currentPlayerId);
    if (altri.length === 0) return null;
    return altri.reduce((s, v) => s + Number(v.voto), 0) / altri.length;
  };

  const setVoto = (id, val) => setVoti((v) => ({ ...v, [id]: val }));

  const scartoAnomalo = (id, val) => {
    const consenso = consensoPer(id);
    if (consenso == null) return null;
    const diff = val - consenso;
    if (Math.abs(diff) > SOGLIA_SCARTO) return { consenso, diff };
    return null;
  };

  const invia = async (playerId, val) => {
    setInvioInCorso((s) => ({ ...s, [playerId]: true }));
    await onVota(match.id, playerId, val);
    setInvioInCorso((s) => ({ ...s, [playerId]: false }));
    setInviati((s) => ({ ...s, [playerId]: true }));
    setInModifica((s) => ({ ...s, [playerId]: false }));
  };

  const modificaVoto = (playerId) => {
    const votoPrecedente = votiEsistenti.find((v) => v.votante_id === currentPlayerId && v.votato_id === playerId);
    if (votoPrecedente) setVoto(playerId, Number(votoPrecedente.voto));
    setInModifica((s) => ({ ...s, [playerId]: true }));
  };

  if (!caricato) {
    return <Spinner testo="Caricamento…" />;
  }

  if (!match) {
    return <div style={{ color: COLORS.chalkDim, fontFamily: "Inter, sans-serif", fontSize: 13 }}>Nessuna partita ancora conclusa da votare.</div>;
  }

  return (
    <div>
      <div style={{ fontFamily: "Barlow Condensed, sans-serif", fontWeight: 700, fontSize: 20, color: COLORS.chalk, marginBottom: 4 }}>
        Vota i compagni · {match.giorno} {formattaDataIT(match.data)}
      </div>
      <div style={{ fontFamily: "Inter, sans-serif", fontSize: 13, color: COLORS.chalkDim, marginBottom: 18 }}>
        Voti anonimi da 1 a 10. La media finale esclude il voto più alto e più basso ricevuti.
        {!votazioniChiuse && scadenzaTesto && ` Puoi votare o modificare fino al ${scadenzaTesto}.`}
      </div>

      {votazioniChiuse && (
        <div style={{ background: "rgba(255,200,87,0.08)", border: `1px solid rgba(255,200,87,0.3)`, borderRadius: 10, padding: 12, marginBottom: 18 }}>
          <div style={{ fontFamily: "Inter, sans-serif", fontSize: 12.5, color: COLORS.chalk }}>
            ⏳ Le votazioni per questa partita si sono chiuse il {scadenzaTesto} (2 giorni dopo la partita). Non è più possibile votare né modificare i voti dati.
          </div>
        </div>
      )}

      {sonoPartecipante && (
        <div style={{ background: COLORS.navy, borderRadius: 12, padding: "14px 16px", marginBottom: 18, display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 10 }}>
          <div>
            <div style={{ fontFamily: "Inter, sans-serif", fontWeight: 600, fontSize: 13.5, color: COLORS.chalk }}>⚽ I tuoi gol in questa partita</div>
            <div style={{ fontFamily: "Inter, sans-serif", fontSize: 11, color: COLORS.chalkDim, marginTop: 2 }}>L'organizzatore può comunque correggerli in "Risultato".</div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <button
              onClick={() => { setMiGol((n) => Math.max(0, n - 1)); setGolSalvato(false); }}
              style={{ width: 30, height: 30, borderRadius: 7, border: `1px solid rgba(255,255,255,0.15)`, background: "transparent", color: COLORS.chalk, cursor: "pointer", fontSize: 16 }}
            >
              −
            </button>
            <span style={{ fontFamily: "IBM Plex Mono, monospace", fontSize: 20, color: COLORS.floodlight, width: 20, textAlign: "center" }}>{miGol}</span>
            <button
              onClick={() => { setMiGol((n) => n + 1); setGolSalvato(false); }}
              style={{ width: 30, height: 30, borderRadius: 7, border: `1px solid rgba(255,255,255,0.15)`, background: "transparent", color: COLORS.chalk, cursor: "pointer", fontSize: 16 }}
            >
              +
            </button>
            <button
              onClick={salvaMiGol}
              disabled={salvataggioGolInCorso}
              style={{
                padding: "8px 14px", borderRadius: 8, border: "none", cursor: salvataggioGolInCorso ? "not-allowed" : "pointer",
                fontFamily: "Inter, sans-serif", fontWeight: 700, fontSize: 12.5,
                background: golSalvato ? COLORS.green : COLORS.floodlight, color: COLORS.pitchDark,
              }}
            >
              {salvataggioGolInCorso ? "…" : golSalvato ? "✓ Salvato" : "Salva"}
            </button>
          </div>
        </div>
      )}

      {sonoPartecipante && compagni.length > 0 && (
        <div style={{ background: COLORS.navy, borderRadius: 12, padding: "14px 16px", marginBottom: 18 }}>
          <div style={{ fontFamily: "Inter, sans-serif", fontWeight: 600, fontSize: 13.5, color: COLORS.chalk, marginBottom: 2 }}>
            🏅 Chi è stato l'MVP della partita?
          </div>
          <div style={{ fontFamily: "Inter, sans-serif", fontSize: 11, color: COLORS.chalkDim, marginBottom: 12 }}>
            {votazioniChiuse
              ? "Le votazioni per l'MVP di questa partita sono chiuse."
              : "Un solo voto, non puoi votare te stesso. Vince chi riceve più voti dai compagni."}
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {compagni.map((p) => {
              const selezionato = mvpScelto === p.id;
              return (
                <button
                  key={p.id}
                  onClick={() => votaMvp(p.id)}
                  disabled={mvpInCorso || votazioniChiuse}
                  style={{
                    display: "flex", alignItems: "center", gap: 7, padding: "6px 12px 6px 6px", borderRadius: 999,
                    border: `1px solid ${selezionato ? COLORS.floodlight : "rgba(255,255,255,0.15)"}`,
                    background: selezionato ? "rgba(255,200,87,0.15)" : "transparent",
                    cursor: mvpInCorso || votazioniChiuse ? "not-allowed" : "pointer",
                    opacity: votazioniChiuse && !selezionato ? 0.5 : 1,
                  }}
                >
                  <MiniAvatar p={p} size={24} />
                  <span style={{ fontFamily: "Inter, sans-serif", fontWeight: 600, fontSize: 12.5, color: selezionato ? COLORS.floodlight : COLORS.chalk }}>
                    {p.name}
                  </span>
                  {selezionato && <span style={{ color: COLORS.floodlight, fontSize: 12 }}>✓</span>}
                </button>
              );
            })}
          </div>
        </div>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {compagni.length === 0 && (
          <div style={{ color: COLORS.chalkDim, fontFamily: "Inter, sans-serif", fontSize: 13 }}>Nessun compagno da votare per questa partita.</div>
        )}
        {compagni.map((p) => {
          const val = voti[p.id] ?? 6;
          const anomalia = scartoAnomalo(p.id, val);
          const done = inviati[p.id];
          const modificando = inModifica[p.id];
          const mostraSlider = (!done || modificando) && !votazioniChiuse;
          const inCorso = invioInCorso[p.id];
          const mioVotoDato = votiEsistenti.find((v) => v.votante_id === currentPlayerId && v.votato_id === p.id);
          return (
            <div
              key={p.id}
              style={{
                background: COLORS.navy,
                border: `1px solid ${anomalia && mostraSlider ? COLORS.red : "rgba(255,255,255,0.08)"}`,
                borderRadius: 12,
                padding: "14px 16px",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 8, marginBottom: 10 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0 }}>
                  <MiniAvatar p={p} size={34} />
                  <div style={{ fontFamily: "Inter, sans-serif", fontWeight: 600, fontSize: 14.5, color: COLORS.chalk, wordBreak: "break-word" }}>
                    {p.name}
                  </div>
                </div>
                {done && !modificando ? (
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={chip("rgba(76,175,109,0.15)", COLORS.green)}>
                      Voto inviato{mioVotoDato ? `: ${Number(mioVotoDato.voto).toFixed(1)}` : ""} ✓
                    </span>
                    {!votazioniChiuse && (
                      <button
                        onClick={() => modificaVoto(p.id)}
                        style={{
                          background: "none", border: `1px solid rgba(255,255,255,0.15)`, borderRadius: 7,
                          color: COLORS.chalkDim, fontFamily: "Inter, sans-serif", fontWeight: 600, fontSize: 11,
                          padding: "4px 9px", cursor: "pointer",
                        }}
                      >
                        ✏️ Modifica
                      </button>
                    )}
                  </div>
                ) : !done && votazioniChiuse ? (
                  <span style={chip("rgba(255,255,255,0.08)", COLORS.chalkDim)}>⏳ Tempo scaduto</span>
                ) : (
                  <span style={{ fontFamily: "IBM Plex Mono, monospace", fontSize: 20, fontWeight: 600, color: COLORS.floodlight }}>
                    {val.toFixed(1)}
                  </span>
                )}
              </div>

              {mostraSlider && (
                <>
                  <input
                    type="range"
                    min={1}
                    max={10}
                    step={0.5}
                    value={val}
                    onChange={(e) => setVoto(p.id, parseFloat(e.target.value))}
                    style={{ width: "100%", accentColor: COLORS.floodlight }}
                  />
                  {anomalia && (
                    <div
                      style={{
                        marginTop: 8,
                        background: "rgba(229,83,60,0.12)",
                        border: `1px solid ${COLORS.red}`,
                        borderRadius: 8,
                        padding: "8px 10px",
                        fontFamily: "Inter, sans-serif",
                        fontSize: 12,
                        color: "#ffb3a3",
                        display: "flex",
                        gap: 6,
                        alignItems: "flex-start",
                      }}
                    >
                      ⚠️ Questo voto si discosta di {Math.abs(anomalia.diff).toFixed(1)} punti dalla media degli altri voti ricevuti finora ({anomalia.consenso.toFixed(1)}). Conferma solo se motivato.
                    </div>
                  )}
                  <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
                    <button
                      onClick={() => invia(p.id, val)}
                      disabled={inCorso}
                      style={{
                        padding: "7px 14px",
                        borderRadius: 7,
                        border: "none",
                        cursor: inCorso ? "not-allowed" : "pointer",
                        fontFamily: "Inter, sans-serif",
                        fontWeight: 700,
                        fontSize: 12.5,
                        background: anomalia ? "rgba(255,255,255,0.1)" : COLORS.floodlight,
                        color: anomalia ? COLORS.chalk : COLORS.pitchDark,
                      }}
                    >
                      {inCorso ? "Invio…" : anomalia ? "Conferma comunque" : modificando ? "Salva modifica" : "Invia voto"}
                    </button>
                    {modificando && (
                      <button
                        onClick={() => setInModifica((s) => ({ ...s, [p.id]: false }))}
                        style={{
                          padding: "7px 14px", borderRadius: 7, border: `1px solid rgba(255,255,255,0.15)`,
                          background: "transparent", color: COLORS.chalkDim, cursor: "pointer",
                          fontFamily: "Inter, sans-serif", fontWeight: 600, fontSize: 12.5,
                        }}
                      >
                        Annulla
                      </button>
                    )}
                  </div>
                </>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ---------------------------------------------------------
   PANNELLO ORGANIZZATORE — Risultato e gol
--------------------------------------------------------- */
function Risultato({ players, matches, onSalvaRisultato, onEliminaPartita, voti = [] }) {
  const partiteGestibili = [...matches].sort((a, b) => new Date(b.data) - new Date(a.data));
  const apertaId = matches.find((m) => m.stato === "aperta")?.id;

  const [selezionataId, setSelezionataId] = useState(apertaId || partiteGestibili[0]?.id || null);
  const match = partiteGestibili.find((m) => m.id === selezionataId) || null;

  const [gol, setGol] = useState({});
  const [autogol, setAutogol] = useState({});
  const [buche, setBuche] = useState([]);
  const [salvataggioInCorso, setSalvataggioInCorso] = useState(false);
  const [salvato, setSalvato] = useState(false);
  const [confermaEliminazione, setConfermaEliminazione] = useState(false);
  const [mostraVotiDettaglio, setMostraVotiDettaglio] = useState(false);
  const [eliminazioneInCorso, setEliminazioneInCorso] = useState(false);

  useEffect(() => {
    if (!apertaId) return;
    setSelezionataId((prev) => prev || apertaId);
  }, [apertaId]);

  useEffect(() => {
    if (!match) return;
    setGol(match.gol || {});
    setAutogol(match.autogol || {});
    setBuche(match.buche || []);
    setSalvato(false);
    setConfermaEliminazione(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selezionataId]);

  const partecipantiIds = match ? [...match.squadraBianchi, ...match.squadraNeri] : [];
  const partecipanti = players.filter((p) => partecipantiIds.includes(p.id));

  const setGolGiocatore = (id, n) => setGol((g) => ({ ...g, [id]: Math.max(0, n) }));
  const setAutogolGiocatore = (id, n) => setAutogol((a) => ({ ...a, [id]: Math.max(0, n) }));

  const toggleBuca = (id) => {
    setBuche((b) => (b.includes(id) ? b.filter((x) => x !== id) : [...b, id]));
    setGol((g) => ({ ...g, [id]: 0 }));
    setAutogol((a) => ({ ...a, [id]: 0 }));
  };

  const totaleGolInseriti = Object.values(gol).reduce((a, b) => a + b, 0);
  const totaleAutogolInseriti = Object.values(autogol).reduce((a, b) => a + b, 0);

  // Il punteggio si calcola da solo: gol normali alla propria squadra,
  // autogol alla squadra avversaria.
  const bianchi = match
    ? match.squadraBianchi.reduce((s, id) => s + (gol[id] || 0), 0) + match.squadraNeri.reduce((s, id) => s + (autogol[id] || 0), 0)
    : 0;
  const neri = match
    ? match.squadraNeri.reduce((s, id) => s + (gol[id] || 0), 0) + match.squadraBianchi.reduce((s, id) => s + (autogol[id] || 0), 0)
    : 0;

  const salva = async () => {
    setSalvataggioInCorso(true);
    await onSalvaRisultato(match.id, { bianchi, neri, gol, autogol, buche });
    setSalvataggioInCorso(false);
    setSalvato(true);
  };

  const elimina = async () => {
    if (!confermaEliminazione) {
      setConfermaEliminazione(true);
      return;
    }
    setEliminazioneInCorso(true);
    await onEliminaPartita(match.id);
    setEliminazioneInCorso(false);
  };

  if (partiteGestibili.length === 0) {
    return <div style={{ color: COLORS.chalkDim, fontFamily: "Inter, sans-serif", fontSize: 13 }}>Nessuna partita creata. Vai su "Crea Partita".</div>;
  }

  return (
    <div>
      <div style={{ fontFamily: "Barlow Condensed, sans-serif", fontWeight: 700, fontSize: 20, color: COLORS.chalk, marginBottom: 4 }}>
        Registra o modifica risultato
      </div>
      <div style={{ fontFamily: "Inter, sans-serif", fontSize: 13, color: COLORS.chalkDim, marginBottom: 14 }}>
        Scegli la partita da gestire. Salvando, i gol si aggiornano automaticamente allo storico e alle figurine.
      </div>

      <select
        value={selezionataId || ""}
        onChange={(e) => setSelezionataId(e.target.value)}
        style={{
          width: "100%", maxWidth: 340, padding: "9px 12px", borderRadius: 8, marginBottom: 20,
          border: `1px solid rgba(255,255,255,0.15)`, background: COLORS.navy,
          color: COLORS.chalk, fontFamily: "Inter, sans-serif", fontSize: 16,
        }}
      >
        {partiteGestibili.map((m) => (
          <option key={m.id} value={m.id} style={{ background: COLORS.navy }}>
            {m.giorno} {formattaDataIT(m.data)} · {m.stato === "aperta" ? "aperta, senza risultato" : `storico ${m.risultato ? `(${m.risultato.bianchi}-${m.risultato.neri})` : ""}`}
          </option>
        ))}
      </select>

      {!match ? null : partecipanti.length === 0 ? (
        <div style={{ color: COLORS.chalkDim, fontFamily: "Inter, sans-serif", fontSize: 13 }}>
          Questa partita non ha ancora una formazione. Vai su "Crea Partita" per comporre le squadre prima di registrare il risultato.
        </div>
      ) : (
        <>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 18, marginBottom: 6 }}>
        <div style={{ textAlign: "center" }}>
          <SquadraBadge tipo="bianchi" />
          <div style={{ fontFamily: "IBM Plex Mono, monospace", fontSize: 34, fontWeight: 600, color: COLORS.chalk, marginTop: 8 }}>{bianchi}</div>
        </div>
        <div style={{ color: COLORS.chalkDim, fontFamily: "IBM Plex Mono, monospace", fontSize: 20 }}>—</div>
        <div style={{ textAlign: "center" }}>
          <SquadraBadge tipo="neri" />
          <div style={{ fontFamily: "IBM Plex Mono, monospace", fontSize: 34, fontWeight: 600, color: COLORS.chalk, marginTop: 8 }}>{neri}</div>
        </div>
      </div>
      <div style={{ textAlign: "center", fontSize: 11, color: COLORS.chalkDim, fontFamily: "Inter, sans-serif", marginBottom: 22 }}>
        Il punteggio si calcola da solo in base a gol e autogol inseriti sotto.
      </div>

      <div style={{ fontFamily: "Barlow Condensed, sans-serif", fontWeight: 700, fontSize: 16, color: COLORS.chalk, marginBottom: 10 }}>
        Presenze e gol <span style={{ color: COLORS.chalkDim, fontSize: 13, fontFamily: "Inter, sans-serif" }}>(gol: {totaleGolInseriti} · autogol: {totaleAutogolInseriti})</span>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 20 }}>
        {partecipanti.map((p) => {
          const haDatoBuca = buche.includes(p.id);
          return (
            <div
              key={p.id}
              style={{
                background: COLORS.navy, borderRadius: 10, padding: "9px 14px",
                border: haDatoBuca ? `1px solid ${COLORS.red}` : "1px solid transparent",
                display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 8,
                opacity: haDatoBuca ? 0.75 : 1,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <MiniAvatar p={p} size={28} />
                <span style={{ fontFamily: "Inter, sans-serif", fontWeight: 600, fontSize: 13.5, color: COLORS.chalk, textDecoration: haDatoBuca ? "line-through" : "none" }}>
                  {p.name}
                </span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <button
                  onClick={() => toggleBuca(p.id)}
                  style={{
                    padding: "5px 10px", borderRadius: 7, cursor: "pointer",
                    fontFamily: "Inter, sans-serif", fontWeight: 600, fontSize: 11.5,
                    border: `1px solid ${haDatoBuca ? COLORS.red : "rgba(255,255,255,0.15)"}`,
                    background: haDatoBuca ? COLORS.red : "transparent",
                    color: haDatoBuca ? COLORS.chalk : COLORS.chalkDim,
                  }}
                >
                  {haDatoBuca ? "🚫 Ha dato buca" : "Segnala buca"}
                </button>
                {!haDatoBuca && (
                  <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <span style={{ fontSize: 9.5, color: COLORS.chalkDim, fontFamily: "Inter, sans-serif" }}>⚽</span>
                      <button
                        onClick={() => setGolGiocatore(p.id, (gol[p.id] || 0) - 1)}
                        style={{ width: 22, height: 22, borderRadius: 6, border: `1px solid rgba(255,255,255,0.15)`, background: "transparent", color: COLORS.chalk, cursor: "pointer", fontSize: 13 }}
                      >
                        −
                      </button>
                      <span style={{ fontFamily: "IBM Plex Mono, monospace", fontSize: 14, color: COLORS.floodlight, width: 14, textAlign: "center" }}>
                        {gol[p.id] || 0}
                      </span>
                      <button
                        onClick={() => setGolGiocatore(p.id, (gol[p.id] || 0) + 1)}
                        style={{ width: 22, height: 22, borderRadius: 6, border: `1px solid rgba(255,255,255,0.15)`, background: "transparent", color: COLORS.chalk, cursor: "pointer", fontSize: 13 }}
                      >
                        +
                      </button>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <span style={{ fontSize: 9.5, color: COLORS.red, fontFamily: "Inter, sans-serif" }}>🔴 AG</span>
                      <button
                        onClick={() => setAutogolGiocatore(p.id, (autogol[p.id] || 0) - 1)}
                        style={{ width: 22, height: 22, borderRadius: 6, border: `1px solid rgba(229,83,60,0.3)`, background: "transparent", color: COLORS.chalk, cursor: "pointer", fontSize: 13 }}
                      >
                        −
                      </button>
                      <span style={{ fontFamily: "IBM Plex Mono, monospace", fontSize: 14, color: COLORS.red, width: 14, textAlign: "center" }}>
                        {autogol[p.id] || 0}
                      </span>
                      <button
                        onClick={() => setAutogolGiocatore(p.id, (autogol[p.id] || 0) + 1)}
                        style={{ width: 22, height: 22, borderRadius: 6, border: `1px solid rgba(229,83,60,0.3)`, background: "transparent", color: COLORS.chalk, cursor: "pointer", fontSize: 13 }}
                      >
                        +
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <button
        onClick={salva}
        disabled={salvataggioInCorso}
        style={{
          padding: "10px 18px", borderRadius: 9, border: "none", cursor: salvataggioInCorso ? "not-allowed" : "pointer",
          fontFamily: "Inter, sans-serif", fontWeight: 700, fontSize: 13,
          background: COLORS.floodlight, color: COLORS.pitchDark,
        }}
      >
        {salvato ? "✓ Salvato — salva di nuovo per aggiornare" : salvataggioInCorso ? "Salvataggio…" : "Salva risultato"}
      </button>

      {(() => {
        const votiPartita = voti.filter((v) => v.match_id === match.id);
        const votantiUnici = [...new Set(votiPartita.map((v) => v.votante_id))];
        const chiDeveVotare = partecipanti.filter((p) => !buche.includes(p.id));
        return (
          <div style={{ marginTop: 22, paddingTop: 16, borderTop: "1px solid rgba(255,255,255,0.08)" }}>
            <div style={{ fontFamily: "Barlow Condensed, sans-serif", fontWeight: 700, fontSize: 16, color: COLORS.chalk, marginBottom: 10 }}>
              Voti di questa partita <span style={{ color: COLORS.chalkDim, fontSize: 12.5, fontFamily: "Inter, sans-serif" }}>({votantiUnici.length}/{chiDeveVotare.length} hanno votato)</span>
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 12 }}>
              {chiDeveVotare.map((p) => {
                const haVotato = votantiUnici.includes(p.id);
                return (
                  <span key={p.id} style={chip(haVotato ? "rgba(76,175,109,0.15)" : "rgba(255,255,255,0.06)", haVotato ? COLORS.green : COLORS.chalkDim)}>
                    {haVotato ? "✓" : "…"} {p.name}
                  </span>
                );
              })}
            </div>

            <button
              onClick={() => setMostraVotiDettaglio((v) => !v)}
              style={{
                background: "none", border: `1px solid ${COLORS.red}`, borderRadius: 7, cursor: "pointer",
                color: COLORS.red, fontFamily: "Inter, sans-serif", fontWeight: 600, fontSize: 11.5, padding: "5px 10px",
              }}
            >
              {mostraVotiDettaglio ? "▲ Nascondi voti" : "⚠️ Mostra anche i voti (rompe l'anonimato)"}
            </button>

            {mostraVotiDettaglio && (
              <div style={{ marginTop: 10, display: "flex", flexDirection: "column", gap: 6 }}>
                {votiPartita.length === 0 && (
                  <div style={{ color: COLORS.chalkDim, fontFamily: "Inter, sans-serif", fontSize: 12.5 }}>Nessun voto ancora.</div>
                )}
                {votiPartita.map((v, i) => (
                  <div key={i} style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 6, background: "rgba(229,83,60,0.06)", borderRadius: 7, padding: "7px 10px" }}>
                    <span style={{ fontFamily: "Inter, sans-serif", fontSize: 12.5, color: COLORS.chalk }}>
                      {nomeById(players, v.votante_id)} → {nomeById(players, v.votato_id)}
                    </span>
                    <span style={{ fontFamily: "IBM Plex Mono, monospace", fontSize: 13, color: COLORS.floodlight }}>{Number(v.voto).toFixed(1)}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })()}
        </>
      )}

      {match && (
        <div style={{ marginTop: 28, paddingTop: 18, borderTop: "1px solid rgba(255,255,255,0.08)" }}>
          <button
            onClick={elimina}
            disabled={eliminazioneInCorso}
            style={{
              padding: "9px 16px", borderRadius: 8, cursor: eliminazioneInCorso ? "not-allowed" : "pointer",
              fontFamily: "Inter, sans-serif", fontWeight: 700, fontSize: 12.5,
              border: `1px solid ${COLORS.red}`,
              background: confermaEliminazione ? COLORS.red : "transparent",
              color: confermaEliminazione ? COLORS.chalk : COLORS.red,
            }}
          >
            {eliminazioneInCorso ? "Eliminazione…" : confermaEliminazione ? "Conferma: elimina definitivamente" : "🗑️ Elimina questa partita"}
          </button>
          {confermaEliminazione && (
            <div style={{ fontSize: 11.5, color: COLORS.chalkDim, marginTop: 8, fontFamily: "Inter, sans-serif" }}>
              Cancella anche i voti collegati a questa partita. Non si può annullare.{" "}
              <span style={{ textDecoration: "underline", cursor: "pointer" }} onClick={() => setConfermaEliminazione(false)}>
                Annulla
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/* ---------------------------------------------------------
   FORMAZIONE — scelta squadre + generazione immagine da condividere
--------------------------------------------------------- */
function Formazione({ players, matches, onSalvaFormazione, onCreaPartita, onAggiungiGiocatore }) {
  const match = matches.find((m) => m.stato === "aperta");
  const canvasRef = useRef(null);

  const [squadre, setSquadre] = useState({});
  const [salvataggioInCorso, setSalvataggioInCorso] = useState(false);
  const [salvato, setSalvato] = useState(false);
  const [ricercaGiocatore, setRicercaGiocatore] = useState("");

  const [nuovoGiorno, setNuovoGiorno] = useState("Giovedì");
  const [nuovaData, setNuovaData] = useState("");
  const [nuovaOra, setNuovaOra] = useState("21:00");
  const [nuovoCampo, setNuovoCampo] = useState("Centro Sportivo San Siro");
  const [creazioneInCorso, setCreazioneInCorso] = useState(false);

  const [mostraAggiungiGiocatore, setMostraAggiungiGiocatore] = useState(false);
  const [nomeOspite, setNomeOspite] = useState("");
  const [ruoloOspite, setRuoloOspite] = useState("Centrocampo");
  const [aggiuntaInCorso, setAggiuntaInCorso] = useState(false);
  const ruoliOspite = ["Portiere", "Difensore", "Esterno Destro", "Esterno Sinistro", "Centrocampo", "Attaccante"];

  const aggiungiOspiteRapido = async () => {
    if (!nomeOspite.trim()) return;
    setAggiuntaInCorso(true);
    await onAggiungiGiocatore({ nome: nomeOspite.trim(), ruolo: ruoloOspite });
    setAggiuntaInCorso(false);
    setNomeOspite("");
    setMostraAggiungiGiocatore(false);
  };

  useEffect(() => {
    if (!match) {
      setSquadre({});
      return;
    }
    const init = {};
    players.forEach((p) => {
      if (match.squadraBianchi.includes(p.id)) init[p.id] = "bianchi";
      else if (match.squadraNeri.includes(p.id)) init[p.id] = "neri";
      else init[p.id] = "escluso";
    });
    setSquadre(init);
    setSalvato(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [match?.id]);

  const ciclo = { escluso: "bianchi", bianchi: "neri", neri: "escluso" };
  const toggle = (id) => {
    setSquadre((s) => ({ ...s, [id]: ciclo[s[id] || "escluso"] }));
    setSalvato(false);
  };

  const listaBianchi = players.filter((p) => squadre[p.id] === "bianchi");
  const listaNeri = players.filter((p) => squadre[p.id] === "neri");

  const creaPartita = async () => {
    if (!nuovaData) return;
    setCreazioneInCorso(true);
    await onCreaPartita({ giorno: nuovoGiorno, data: nuovaData, ora: nuovaOra, campo: nuovoCampo });
    setCreazioneInCorso(false);
  };

  const salvaFormazione = async () => {
    if (!match) return;
    setSalvataggioInCorso(true);
    await onSalvaFormazione(
      match.id,
      listaBianchi.map((p) => p.id),
      listaNeri.map((p) => p.id)
    );
    setSalvataggioInCorso(false);
    setSalvato(true);
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !match) return;
    const ctx = canvas.getContext("2d");
    const W = 1080, H = 1350;
    canvas.width = W;
    canvas.height = H;

    // sfondo
    const bg = ctx.createLinearGradient(0, 0, W, H);
    bg.addColorStop(0, "#1B4332");
    bg.addColorStop(1, "#0F2E1D");
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, W, H);

    // header
    ctx.textAlign = "center";
    ctx.fillStyle = "#FFC857";
    ctx.font = "bold 40px sans-serif";
    ctx.fillText("⚽ CALCETTO", W / 2, 110);
    ctx.fillStyle = "#F2F0E9";
    ctx.font = "bold 56px sans-serif";
    ctx.fillText(`${match.giorno.toUpperCase()} ${formattaDataIT(match.data)}`, W / 2, 180);
    ctx.font = "32px sans-serif";
    ctx.fillStyle = "#B9C4BC";
    ctx.fillText(`${match.ora} · ${match.campo}`, W / 2, 226);

    // colonne
    const colY = 300;
    const colW = 460;
    const colH = 900;
    const xBianchi = 60;
    const xNeri = W - 60 - colW;

    // pannello bianchi
    ctx.fillStyle = "#F2F0E9";
    roundRect(ctx, xBianchi, colY, colW, colH, 24);
    ctx.fill();
    ctx.fillStyle = "#0F2E1D";
    ctx.font = "bold 42px sans-serif";
    ctx.fillText("⚪ BIANCHI", xBianchi + colW / 2, colY + 70);
    ctx.font = "34px sans-serif";
    listaBianchi.forEach((p, i) => {
      ctx.fillText(p.name, xBianchi + colW / 2, colY + 140 + i * 60);
    });

    // pannello neri
    ctx.fillStyle = "#111418";
    roundRect(ctx, xNeri, colY, colW, colH, 24);
    ctx.fill();
    ctx.strokeStyle = "rgba(255,255,255,0.15)";
    ctx.lineWidth = 2;
    roundRect(ctx, xNeri, colY, colW, colH, 24);
    ctx.stroke();
    ctx.fillStyle = "#F2F0E9";
    ctx.font = "bold 42px sans-serif";
    ctx.fillText("⚫ NERI", xNeri + colW / 2, colY + 70);
    ctx.font = "34px sans-serif";
    listaNeri.forEach((p, i) => {
      ctx.fillText(p.name, xNeri + colW / 2, colY + 140 + i * 60);
    });

    // footer
    ctx.fillStyle = "#B9C4BC";
    ctx.font = "26px sans-serif";
    ctx.fillText("Calcetto Martedì & Giovedì", W / 2, H - 40);
  }, [squadre, match, listaBianchi.length, listaNeri.length]);

  function roundRect(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  }

  const scarica = () => {
    if (!match) return;
    const canvas = canvasRef.current;
    const url = canvas.toDataURL("image/jpeg", 0.92);
    const a = document.createElement("a");
    a.href = url;
    a.download = `formazione-${match.giorno.toLowerCase()}-${match.data.replace(/\s/g, "-")}.jpg`;
    a.click();
  };

  if (!match) {
    return (
      <div>
        <div style={{ fontFamily: "Barlow Condensed, sans-serif", fontWeight: 700, fontSize: 20, color: COLORS.chalk, marginBottom: 4 }}>
          Nessuna partita in programma
        </div>
        <div style={{ fontFamily: "Inter, sans-serif", fontSize: 13, color: COLORS.chalkDim, marginBottom: 20 }}>
          Crea la prossima partita per iniziare a comporre le squadre.
        </div>
        <div style={{ background: COLORS.navy, borderRadius: 12, padding: 18, maxWidth: 380 }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <div>
              <div style={{ fontSize: 11, color: COLORS.chalkDim, marginBottom: 4 }}>Giorno</div>
              <select
                value={nuovoGiorno}
                onChange={(e) => setNuovoGiorno(e.target.value)}
                style={{
                  width: "100%", padding: "9px 12px", borderRadius: 8,
                  border: `1px solid rgba(255,255,255,0.15)`, background: "rgba(255,255,255,0.05)",
                  color: COLORS.chalk, fontFamily: "Inter, sans-serif", fontSize: 16,
                }}
              >
                <option style={{ background: COLORS.navy }}>Martedì</option>
                <option style={{ background: COLORS.navy }}>Giovedì</option>
              </select>
            </div>
            <div>
              <div style={{ fontSize: 11, color: COLORS.chalkDim, marginBottom: 4 }}>Data</div>
              <input
                type="date" value={nuovaData} onChange={(e) => setNuovaData(e.target.value)}
                style={{
                  width: "100%", boxSizing: "border-box", padding: "9px 12px", borderRadius: 8,
                  border: `1px solid rgba(255,255,255,0.15)`, background: "rgba(255,255,255,0.05)",
                  color: COLORS.chalk, fontFamily: "Inter, sans-serif", fontSize: 16,
                }}
              />
            </div>
            <div>
              <div style={{ fontSize: 11, color: COLORS.chalkDim, marginBottom: 4 }}>Ora</div>
              <input
                type="time" value={nuovaOra} onChange={(e) => setNuovaOra(e.target.value)}
                style={{
                  width: "100%", boxSizing: "border-box", padding: "9px 12px", borderRadius: 8,
                  border: `1px solid rgba(255,255,255,0.15)`, background: "rgba(255,255,255,0.05)",
                  color: COLORS.chalk, fontFamily: "Inter, sans-serif", fontSize: 16,
                }}
              />
            </div>
            <div>
              <div style={{ fontSize: 11, color: COLORS.chalkDim, marginBottom: 4 }}>Campo</div>
              <input
                type="text" value={nuovoCampo} onChange={(e) => setNuovoCampo(e.target.value)}
                style={{
                  width: "100%", boxSizing: "border-box", padding: "9px 12px", borderRadius: 8,
                  border: `1px solid rgba(255,255,255,0.15)`, background: "rgba(255,255,255,0.05)",
                  color: COLORS.chalk, fontFamily: "Inter, sans-serif", fontSize: 16,
                }}
              />
            </div>
            <button
              onClick={creaPartita}
              disabled={!nuovaData || creazioneInCorso}
              style={{
                padding: "11px 0", borderRadius: 9, border: "none",
                cursor: nuovaData && !creazioneInCorso ? "pointer" : "not-allowed",
                background: nuovaData && !creazioneInCorso ? COLORS.floodlight : "rgba(255,255,255,0.1)",
                color: nuovaData && !creazioneInCorso ? COLORS.pitchDark : COLORS.chalkDim,
                fontFamily: "Inter, sans-serif", fontWeight: 700, fontSize: 14,
              }}
            >
              {creazioneInCorso ? "Creazione…" : "Crea partita"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div style={{ fontFamily: "Barlow Condensed, sans-serif", fontWeight: 700, fontSize: 20, color: COLORS.chalk, marginBottom: 4 }}>
        Formazione · {match.giorno} {formattaDataIT(match.data)}
      </div>
      <div style={{ fontFamily: "Inter, sans-serif", fontSize: 13, color: COLORS.chalkDim, marginBottom: 14 }}>
        Tocca un giocatore per assegnarlo a Bianchi, Neri o escluderlo dalla partita. Salva, poi scarica l'immagine e inoltrala dal tuo WhatsApp.
      </div>

      <div style={{ marginBottom: 18 }}>
        {!mostraAggiungiGiocatore ? (
          <button
            onClick={() => setMostraAggiungiGiocatore(true)}
            style={{
              background: "none", border: `1px solid rgba(255,255,255,0.15)`, borderRadius: 8, cursor: "pointer",
              color: COLORS.chalkDim, fontFamily: "Inter, sans-serif", fontWeight: 600, fontSize: 12, padding: "6px 12px",
            }}
          >
            + Aggiungi un giocatore (es. avversario per l'amichevole)
          </button>
        ) : (
          <div style={{ background: COLORS.navy, borderRadius: 10, padding: 14, maxWidth: 420 }}>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              <input
                value={nomeOspite}
                onChange={(e) => setNomeOspite(e.target.value)}
                placeholder="Nome e cognome"
                style={{
                  flex: 1, minWidth: 150, padding: "8px 10px", borderRadius: 7,
                  border: `1px solid rgba(255,255,255,0.15)`, background: "rgba(255,255,255,0.05)",
                  color: COLORS.chalk, fontFamily: "Inter, sans-serif", fontSize: 16,
                }}
              />
              <select
                value={ruoloOspite}
                onChange={(e) => setRuoloOspite(e.target.value)}
                style={{
                  padding: "8px 10px", borderRadius: 7, border: `1px solid rgba(255,255,255,0.15)`,
                  background: "rgba(255,255,255,0.05)", color: COLORS.chalk, fontFamily: "Inter, sans-serif", fontSize: 16,
                }}
              >
                {ruoliOspite.map((r) => (
                  <option key={r} value={r} style={{ background: COLORS.navy }}>{r}</option>
                ))}
              </select>
              <button
                onClick={aggiungiOspiteRapido}
                disabled={!nomeOspite.trim() || aggiuntaInCorso}
                style={{
                  padding: "8px 14px", borderRadius: 7, border: "none",
                  cursor: nomeOspite.trim() && !aggiuntaInCorso ? "pointer" : "not-allowed",
                  background: nomeOspite.trim() && !aggiuntaInCorso ? COLORS.floodlight : "rgba(255,255,255,0.1)",
                  color: nomeOspite.trim() && !aggiuntaInCorso ? COLORS.pitchDark : COLORS.chalkDim,
                  fontFamily: "Inter, sans-serif", fontWeight: 700, fontSize: 12.5,
                }}
              >
                {aggiuntaInCorso ? "…" : "Aggiungi"}
              </button>
            </div>
            <button
              onClick={() => setMostraAggiungiGiocatore(false)}
              style={{ background: "none", border: "none", color: COLORS.chalkDim, fontSize: 11, cursor: "pointer", fontFamily: "Inter, sans-serif", marginTop: 8, padding: 0 }}
            >
              Annulla
            </button>
          </div>
        )}
      </div>

      <div style={{ position: "relative", marginBottom: 14, maxWidth: 320 }}>
        <input
          value={ricercaGiocatore}
          onChange={(e) => setRicercaGiocatore(e.target.value)}
          placeholder="🔍 Cerca giocatore…"
          style={{
            width: "100%", boxSizing: "border-box", padding: "9px 34px 9px 12px", borderRadius: 9,
            border: `1px solid rgba(255,255,255,0.15)`, background: COLORS.navy,
            color: COLORS.chalk, fontFamily: "Inter, sans-serif", fontSize: 16,
          }}
        />
        {ricercaGiocatore && (
          <button
            onClick={() => setRicercaGiocatore("")}
            style={{
              position: "absolute", right: 8, top: "50%", transform: "translateY(-50%)",
              background: "none", border: "none", color: COLORS.chalkDim, fontSize: 14, cursor: "pointer", padding: 4,
            }}
          >
            ✕
          </button>
        )}
      </div>

      <div className="selezione-grid" style={{ marginBottom: 22 }}>
        {players
          .filter((p) => p.name.toLowerCase().includes(ricercaGiocatore.trim().toLowerCase()))
          .map((p) => {
          const stato = squadre[p.id] || "escluso";
          const sfondo =
            stato === "bianchi" ? COLORS.bianchi : stato === "neri" ? "#111418" : "rgba(255,255,255,0.04)";
          const testo = stato === "bianchi" ? COLORS.pitchDark : COLORS.chalk;
          return (
            <button
              key={p.id}
              onClick={() => toggle(p.id)}
              className="figurina-hover"
              style={{
                display: "flex", flexDirection: "column", alignItems: "center", gap: 3,
                padding: "6px 3px", borderRadius: 10, cursor: "pointer",
                background: sfondo,
                border: `2px solid rgba(255,255,255,0.15)`,
                opacity: stato === "escluso" ? 0.55 : 1,
              }}
            >
              <MiniAvatar p={p} size={30} />
              <span
                style={{
                  fontFamily: "Inter, sans-serif", fontWeight: 600, fontSize: 9.5, color: testo,
                  textAlign: "center", lineHeight: 1.15, wordBreak: "break-word",
                }}
              >
                {p.name}
              </span>
            </button>
          );
        })}
      </div>
      {ricercaGiocatore && players.filter((p) => p.name.toLowerCase().includes(ricercaGiocatore.trim().toLowerCase())).length === 0 && (
        <div style={{ color: COLORS.chalkDim, fontFamily: "Inter, sans-serif", fontSize: 12.5, marginTop: -14, marginBottom: 22 }}>
          Nessun giocatore trovato per "{ricercaGiocatore}".
        </div>
      )}

      <div style={{ display: "flex", gap: 24, alignItems: "flex-start", flexWrap: "wrap" }}>
        <canvas
          ref={canvasRef}
          style={{ width: 260, borderRadius: 12, border: "1px solid rgba(255,255,255,0.1)", boxShadow: "0 8px 24px rgba(0,0,0,0.4)" }}
        />
        <div style={{ flex: 1, minWidth: 220 }}>
          <div style={{ fontFamily: "Inter, sans-serif", fontSize: 13, color: COLORS.chalkDim, marginBottom: 6, lineHeight: 1.6 }}>
            {listaBianchi.length} bianchi · {listaNeri.length} neri <span style={{ color: COLORS.chalkDim }}>(formato {DIMENSIONE_SQUADRA} contro {DIMENSIONE_SQUADRA})</span>
          </div>
          <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
            {[
              { label: "Bianchi", n: listaBianchi.length },
              { label: "Neri", n: listaNeri.length },
            ].map((sq) => {
              const completa = sq.n === DIMENSIONE_SQUADRA;
              const mancano = DIMENSIONE_SQUADRA - sq.n;
              return (
                <span
                  key={sq.label}
                  style={chip(
                    completa ? "rgba(76,175,109,0.15)" : "rgba(255,200,87,0.15)",
                    completa ? COLORS.green : COLORS.floodlight
                  )}
                >
                  {completa ? `✓ ${sq.label} al completo` : mancano > 0 ? `${sq.label}: mancano ${mancano}` : `${sq.label}: ${-mancano} in esubero`}
                </span>
              );
            })}
          </div>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <button
              onClick={salvaFormazione}
              disabled={salvataggioInCorso}
              style={{
                padding: "12px 20px", borderRadius: 10, cursor: salvataggioInCorso ? "not-allowed" : "pointer",
                fontFamily: "Inter, sans-serif", fontWeight: 700, fontSize: 14,
                background: salvato ? COLORS.green : "rgba(255,255,255,0.1)", color: salvato ? COLORS.pitchDark : COLORS.chalk,
                border: `1px solid ${salvato ? "transparent" : "rgba(255,255,255,0.2)"}`,
              }}
            >
              {salvataggioInCorso ? "Salvataggio…" : salvato ? "✓ Formazione salvata" : "💾 Salva formazione"}
            </button>
            <button
              onClick={scarica}
              style={{
                padding: "12px 20px", borderRadius: 10, border: "none", cursor: "pointer",
                fontFamily: "Inter, sans-serif", fontWeight: 700, fontSize: 14,
                background: COLORS.floodlight, color: COLORS.pitchDark,
              }}
            >
              ⬇️ Scarica immagine JPG
            </button>
          </div>
          <div style={{ fontSize: 11.5, color: COLORS.chalkDim, marginTop: 10, lineHeight: 1.6, fontFamily: "Inter, sans-serif" }}>
            Nessuna conferma richiesta ai giocatori: l'organizzatore compone le squadre e la manda nel gruppo WhatsApp com'è sempre stato fatto.
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---------------------------------------------------------
   PANNELLO ADMIN
--------------------------------------------------------- */
function Admin({ players, richieste, onCompletaRichiesta, rimossi = [], onAggiungiGiocatore, richiesteRegistrazione = [], onApprovaRegistrazione, onRifiutaRegistrazione, onPromuoviRuolo, onModificaGiocatore, onEliminaGiocatoreOspite, onUnisciGiocatori }) {
  const roleOptions = ["organizer", "allenatore", "player"];
  const roleLabel = { organizer: "Organizzatore", allenatore: "Allenatore", player: "Giocatore" };
  const roleColor = { organizer: COLORS.floodlight, allenatore: "#7EC8E3", player: COLORS.green };
  const ruoliCampo = ["Portiere", "Difensore", "Esterno Destro", "Esterno Sinistro", "Centrocampo", "Attaccante"];

  const [nomeNuovo, setNomeNuovo] = useState("");
  const [ruoloNuovo, setRuoloNuovo] = useState("Centrocampo");
  const [collegamentoScelto, setCollegamentoScelto] = useState({});
  const [modificaAttiva, setModificaAttiva] = useState(null);
  const [bozzeModifica, setBozzeModifica] = useState({});
  const [confermaEliminaOspite, setConfermaEliminaOspite] = useState(null);
  const [profiloTenere, setProfiloTenere] = useState("");
  const [profiloEliminare, setProfiloEliminare] = useState("");
  const [confermaUnione, setConfermaUnione] = useState(false);
  const [unioneInCorso, setUnioneInCorso] = useState(false);
  const [erroreUnione, setErroreUnione] = useState("");

  const ospitiDisponibili = players.filter((p) => p.ospite);

  // Preseleziona automaticamente un ospite se il nome combacia con la richiesta
  useEffect(() => {
    setCollegamentoScelto((precedente) => {
      const aggiornato = { ...precedente };
      richiesteRegistrazione.forEach((r) => {
        if (aggiornato[r.id] !== undefined) return; // scelta già fatta manualmente, non toccarla
        const match = ospitiDisponibili.find((o) => o.name.trim().toLowerCase() === (r.name || "").trim().toLowerCase());
        if (match) aggiornato[r.id] = match.id;
      });
      return aggiornato;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [richiesteRegistrazione, ospitiDisponibili.length]);

  const aggiungi = () => {
    if (!nomeNuovo.trim()) return;
    onAggiungiGiocatore({ nome: nomeNuovo.trim(), ruolo: ruoloNuovo });
    setNomeNuovo("");
  };

  return (
    <div>
      {richiesteRegistrazione.length > 0 && (
        <div style={{ marginBottom: 26 }}>
          <div style={{ fontFamily: "Barlow Condensed, sans-serif", fontWeight: 700, fontSize: 18, color: COLORS.chalk, marginBottom: 10 }}>
            Richieste di registrazione · {richiesteRegistrazione.length}
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {richiesteRegistrazione.map((r) => (
              <div
                key={r.id}
                style={{
                  background: "rgba(255,200,87,0.08)", border: `1px solid rgba(255,200,87,0.3)`, borderRadius: 10,
                  padding: "12px 14px",
                }}
              >
                <div style={{ fontFamily: "Inter, sans-serif", fontSize: 13.5, color: COLORS.chalk, marginBottom: 8 }}>
                  <strong>{r.name}</strong> · registrazione del {new Date(r.created_at).toLocaleDateString("it-IT")}
                </div>

                {collegamentoScelto[r.id] && ospitiDisponibili.some((o) => o.id === collegamentoScelto[r.id]) && (
                  <div style={{ background: "rgba(76,175,109,0.1)", border: `1px solid ${COLORS.green}`, borderRadius: 7, padding: "6px 10px", marginBottom: 10, fontFamily: "Inter, sans-serif", fontSize: 11.5, color: COLORS.green }}>
                    ✓ Trovato un ospite con lo stesso nome — preselezionato qui sotto, controlla prima di approvare.
                  </div>
                )}

                {ospitiDisponibili.length > 0 && (
                  <div style={{ marginBottom: 10 }}>
                    <div style={{ fontSize: 11, color: COLORS.chalkDim, marginBottom: 4 }}>
                      Collega a un ospite già inserito (opzionale)
                    </div>
                    <select
                      value={collegamentoScelto[r.id] || ""}
                      onChange={(e) => setCollegamentoScelto((s) => ({ ...s, [r.id]: e.target.value }))}
                      style={{
                        width: "100%", padding: "8px 10px", borderRadius: 7,
                        border: `1px solid rgba(255,255,255,0.15)`, background: "rgba(255,255,255,0.05)",
                        color: COLORS.chalk, fontFamily: "Inter, sans-serif", fontSize: 16,
                      }}
                    >
                      <option value="" style={{ background: COLORS.navy }}>— Crea come nuovo giocatore —</option>
                      {ospitiDisponibili.map((o) => (
                        <option key={o.id} value={o.id} style={{ background: COLORS.navy }}>{o.name}</option>
                      ))}
                    </select>
                  </div>
                )}

                <div style={{ display: "flex", gap: 8 }}>
                  <button
                    onClick={() => onApprovaRegistrazione(r.id, collegamentoScelto[r.id] || null)}
                    style={{
                      padding: "7px 14px", borderRadius: 7, border: "none", cursor: "pointer",
                      fontFamily: "Inter, sans-serif", fontWeight: 700, fontSize: 12,
                      background: COLORS.green, color: COLORS.pitchDark,
                    }}
                  >
                    ✓ Approva
                  </button>
                  <button
                    onClick={() => onRifiutaRegistrazione(r.id)}
                    style={{
                      padding: "7px 14px", borderRadius: 7, cursor: "pointer",
                      fontFamily: "Inter, sans-serif", fontWeight: 700, fontSize: 12,
                      border: `1px solid rgba(255,255,255,0.15)`, background: "transparent", color: COLORS.chalkDim,
                    }}
                  >
                    ✕ Rifiuta
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {richieste && richieste.length > 0 && (
        <div style={{ marginBottom: 26 }}>
          <div style={{ fontFamily: "Barlow Condensed, sans-serif", fontWeight: 700, fontSize: 18, color: COLORS.chalk, marginBottom: 10 }}>
            Richieste di cancellazione dati · {richieste.length}
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {richieste.map((r) => (
              <div
                key={r.id}
                style={{
                  background: "rgba(229,83,60,0.08)", border: `1px solid ${COLORS.red}`, borderRadius: 10,
                  padding: "10px 14px", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 8,
                }}
              >
                <span style={{ fontFamily: "Inter, sans-serif", fontSize: 13.5, color: COLORS.chalk }}>
                  {r.nome} · richiesta del {r.data}
                </span>
                <button
                  onClick={() => onCompletaRichiesta(r)}
                  style={{
                    padding: "6px 12px", borderRadius: 7, border: "none", cursor: "pointer",
                    fontFamily: "Inter, sans-serif", fontWeight: 700, fontSize: 12,
                    background: COLORS.red, color: COLORS.chalk,
                  }}
                >
                  Segna come completata
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      <div style={{ background: COLORS.navy, borderRadius: 12, padding: 18, marginBottom: 26 }}>
        <div style={{ fontFamily: "Barlow Condensed, sans-serif", fontWeight: 700, fontSize: 17, color: COLORS.chalk, marginBottom: 4 }}>
          Aggiungi giocatore
        </div>
        <div style={{ fontFamily: "Inter, sans-serif", fontSize: 12, color: COLORS.chalkDim, marginBottom: 14, lineHeight: 1.6 }}>
          Per chi non si registra da solo. Verrà creato come <strong>ospite</strong>, senza foto e senza account: comparirà in rosa e nelle formazioni, ma non potrà accedere né votare finché non si registra lui stesso.
        </div>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "flex-end" }}>
          <div style={{ flex: 1, minWidth: 160 }}>
            <div style={{ fontSize: 11, color: COLORS.chalkDim, marginBottom: 4 }}>Nome e cognome</div>
            <input
              value={nomeNuovo}
              onChange={(e) => setNomeNuovo(e.target.value)}
              placeholder="Es. Paolo Verdi"
              style={{
                width: "100%", boxSizing: "border-box", padding: "9px 12px", borderRadius: 8,
                border: `1px solid rgba(255,255,255,0.15)`, background: "rgba(255,255,255,0.05)",
                color: COLORS.chalk, fontFamily: "Inter, sans-serif", fontSize: 16,
              }}
            />
          </div>
          <div style={{ minWidth: 150 }}>
            <div style={{ fontSize: 11, color: COLORS.chalkDim, marginBottom: 4 }}>Ruolo in campo</div>
            <select
              value={ruoloNuovo}
              onChange={(e) => setRuoloNuovo(e.target.value)}
              style={{
                width: "100%", padding: "9px 12px", borderRadius: 8,
                border: `1px solid rgba(255,255,255,0.15)`, background: "rgba(255,255,255,0.05)",
                color: COLORS.chalk, fontFamily: "Inter, sans-serif", fontSize: 16,
              }}
            >
              {ruoliCampo.map((r) => (
                <option key={r} value={r} style={{ background: COLORS.navy }}>{r}</option>
              ))}
            </select>
          </div>
          <button
            onClick={aggiungi}
            disabled={!nomeNuovo.trim()}
            style={{
              padding: "9px 16px", borderRadius: 8, border: "none",
              cursor: nomeNuovo.trim() ? "pointer" : "not-allowed",
              fontFamily: "Inter, sans-serif", fontWeight: 700, fontSize: 13,
              background: nomeNuovo.trim() ? COLORS.floodlight : "rgba(255,255,255,0.1)",
              color: nomeNuovo.trim() ? COLORS.pitchDark : COLORS.chalkDim,
            }}
          >
            + Aggiungi
          </button>
        </div>
      </div>

      <div style={{ background: COLORS.navy, borderRadius: 12, padding: 18, marginBottom: 26 }}>
        <div style={{ fontFamily: "Barlow Condensed, sans-serif", fontWeight: 700, fontSize: 17, color: COLORS.chalk, marginBottom: 4 }}>
          🔗 Unisci due profili duplicati
        </div>
        <div style={{ fontFamily: "Inter, sans-serif", fontSize: 12, color: COLORS.chalkDim, marginBottom: 14, lineHeight: 1.6 }}>
          Se la stessa persona è finita in due schede diverse (es. un ospite e un account registrato), unisci qui: tutta la storia — formazioni, gol, autogol, buche, MVP, voti — passa al profilo da mantenere, e l'altro viene eliminato.
        </div>

        {erroreUnione && (
          <div style={{ background: "rgba(229,83,60,0.1)", border: `1px solid ${COLORS.red}`, borderRadius: 8, padding: "8px 10px", fontFamily: "Inter, sans-serif", fontSize: 12, color: "#ffb3a3", marginBottom: 12 }}>
            {erroreUnione}
          </div>
        )}

        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "flex-end" }}>
          <div style={{ flex: 1, minWidth: 180 }}>
            <div style={{ fontSize: 11, color: COLORS.chalkDim, marginBottom: 4 }}>Profilo da mantenere</div>
            <select
              value={profiloTenere}
              onChange={(e) => { setProfiloTenere(e.target.value); setConfermaUnione(false); }}
              style={{
                width: "100%", padding: "9px 12px", borderRadius: 8,
                border: `1px solid rgba(255,255,255,0.15)`, background: "rgba(255,255,255,0.05)",
                color: COLORS.chalk, fontFamily: "Inter, sans-serif", fontSize: 16,
              }}
            >
              <option value="" style={{ background: COLORS.navy }}>— Scegli —</option>
              {players.map((p) => (
                <option key={p.id} value={p.id} style={{ background: COLORS.navy }}>{p.name}{p.ospite ? " (ospite)" : ""}</option>
              ))}
            </select>
          </div>
          <div style={{ flex: 1, minWidth: 180 }}>
            <div style={{ fontSize: 11, color: COLORS.chalkDim, marginBottom: 4 }}>Profilo da eliminare (assorbito nel primo)</div>
            <select
              value={profiloEliminare}
              onChange={(e) => { setProfiloEliminare(e.target.value); setConfermaUnione(false); }}
              style={{
                width: "100%", padding: "9px 12px", borderRadius: 8,
                border: `1px solid rgba(255,255,255,0.15)`, background: "rgba(255,255,255,0.05)",
                color: COLORS.chalk, fontFamily: "Inter, sans-serif", fontSize: 16,
              }}
            >
              <option value="" style={{ background: COLORS.navy }}>— Scegli —</option>
              {players.filter((p) => p.id !== profiloTenere).map((p) => (
                <option key={p.id} value={p.id} style={{ background: COLORS.navy }}>{p.name}{p.ospite ? " (ospite)" : ""}</option>
              ))}
            </select>
          </div>
          <button
            onClick={async () => {
              if (!profiloTenere || !profiloEliminare) return;
              if (!confermaUnione) {
                setConfermaUnione(true);
                return;
              }
              setErroreUnione("");
              setUnioneInCorso(true);
              try {
                await onUnisciGiocatori(profiloTenere, profiloEliminare);
                setProfiloTenere("");
                setProfiloEliminare("");
                setConfermaUnione(false);
              } catch (e) {
                setErroreUnione(e.message || "Errore durante l'unione.");
              }
              setUnioneInCorso(false);
            }}
            disabled={!profiloTenere || !profiloEliminare || unioneInCorso}
            style={{
              padding: "9px 16px", borderRadius: 8, cursor: profiloTenere && profiloEliminare && !unioneInCorso ? "pointer" : "not-allowed",
              fontFamily: "Inter, sans-serif", fontWeight: 700, fontSize: 13,
              border: confermaUnione ? `1px solid ${COLORS.red}` : "none",
              background: unioneInCorso ? "rgba(255,255,255,0.1)" : confermaUnione ? COLORS.red : COLORS.floodlight,
              color: unioneInCorso ? COLORS.chalkDim : confermaUnione ? COLORS.chalk : COLORS.pitchDark,
            }}
          >
            {unioneInCorso ? "Unione…" : confermaUnione ? "Conferma: unisci definitivamente" : "Unisci"}
          </button>
        </div>
      </div>

      <div style={{ fontFamily: "Barlow Condensed, sans-serif", fontWeight: 700, fontSize: 20, color: COLORS.chalk, marginBottom: 4 }}>
        Rosa e permessi
      </div>
      <div style={{ fontFamily: "Inter, sans-serif", fontSize: 13, color: COLORS.chalkDim, marginBottom: 18 }}>
        Assegna i ruoli e modifica i dati dei giocatori. Un utente può avere più ruoli contemporaneamente.
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {players.filter((p) => !rimossi.includes(p.id)).map((p) => {
          const inModifica = modificaAttiva === p.id;
          const bozza = bozzeModifica[p.id] || { name: p.name, ruolo_campo: p.ruolo_campo, soprannome: p.soprannome || "" };
          return (
          <div
            key={p.id}
            style={{
              background: COLORS.navy,
              borderRadius: 10,
              padding: "10px 14px",
              display: "flex",
              flexDirection: "column",
              gap: 10,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 8 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <MiniAvatar p={p} size={30} />
                <span style={{ fontFamily: "Inter, sans-serif", fontWeight: 600, fontSize: 14, color: COLORS.chalk }}>
                  {p.name}{p.soprannome ? ` "${p.soprannome}"` : ""}
                </span>
                {p.ospite && <span style={chip("rgba(229,83,60,0.15)", COLORS.red)}>Ospite</span>}
              </div>
              <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                {!p.ospite && (
                  <div style={{ display: "flex", gap: 6 }}>
                    {roleOptions.map((r) => {
                      const active = p.ruolo_app === r;
                      return (
                        <button
                          key={r}
                          onClick={() => onPromuoviRuolo(p.id, r)}
                          style={{
                            padding: "5px 10px",
                            borderRadius: 6,
                            border: `1px solid ${active ? roleColor[r] : "rgba(255,255,255,0.15)"}`,
                            background: active ? roleColor[r] : "transparent",
                            color: active ? COLORS.pitchDark : COLORS.chalkDim,
                            fontFamily: "Inter, sans-serif",
                            fontWeight: 600,
                            fontSize: 11,
                            cursor: "pointer",
                          }}
                        >
                          {roleLabel[r]}
                        </button>
                      );
                    })}
                  </div>
                )}
                <button
                  onClick={() => {
                    setModificaAttiva(inModifica ? null : p.id);
                    setBozzeModifica((b) => ({ ...b, [p.id]: { name: p.name, ruolo_campo: p.ruolo_campo, soprannome: p.soprannome || "" } }));
                  }}
                  style={{
                    padding: "5px 10px", borderRadius: 6, border: `1px solid rgba(255,255,255,0.15)`,
                    background: "transparent", color: COLORS.chalkDim, fontFamily: "Inter, sans-serif", fontWeight: 600, fontSize: 11, cursor: "pointer",
                  }}
                >
                  {inModifica ? "Chiudi" : "Modifica"}
                </button>
                {p.ospite && (
                  <button
                    onClick={() => {
                      if (confermaEliminaOspite === p.id) {
                        onEliminaGiocatoreOspite(p.id);
                        setConfermaEliminaOspite(null);
                      } else {
                        setConfermaEliminaOspite(p.id);
                      }
                    }}
                    style={{
                      padding: "5px 10px", borderRadius: 6, border: `1px solid ${COLORS.red}`,
                      background: confermaEliminaOspite === p.id ? COLORS.red : "transparent",
                      color: confermaEliminaOspite === p.id ? COLORS.chalk : COLORS.red,
                      fontFamily: "Inter, sans-serif", fontWeight: 600, fontSize: 11, cursor: "pointer",
                    }}
                  >
                    {confermaEliminaOspite === p.id ? "Conferma elimina" : "🗑️ Elimina"}
                  </button>
                )}
              </div>
            </div>

            {inModifica && (
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap", paddingTop: 10, borderTop: "1px solid rgba(255,255,255,0.08)" }}>
                <input
                  value={bozza.name}
                  onChange={(e) => setBozzeModifica((b) => ({ ...b, [p.id]: { ...bozza, name: e.target.value } }))}
                  placeholder="Nome"
                  style={{
                    flex: 1, minWidth: 140, padding: "7px 10px", borderRadius: 6, border: `1px solid rgba(255,255,255,0.15)`,
                    background: "rgba(255,255,255,0.05)", color: COLORS.chalk, fontFamily: "Inter, sans-serif", fontSize: 16,
                  }}
                />
                <input
                  value={bozza.soprannome}
                  onChange={(e) => setBozzeModifica((b) => ({ ...b, [p.id]: { ...bozza, soprannome: e.target.value } }))}
                  placeholder="Soprannome"
                  style={{
                    flex: 1, minWidth: 120, padding: "7px 10px", borderRadius: 6, border: `1px solid rgba(255,255,255,0.15)`,
                    background: "rgba(255,255,255,0.05)", color: COLORS.chalk, fontFamily: "Inter, sans-serif", fontSize: 16,
                  }}
                />
                <select
                  value={bozza.ruolo_campo}
                  onChange={(e) => setBozzeModifica((b) => ({ ...b, [p.id]: { ...bozza, ruolo_campo: e.target.value } }))}
                  style={{
                    padding: "7px 10px", borderRadius: 6, border: `1px solid rgba(255,255,255,0.15)`,
                    background: "rgba(255,255,255,0.05)", color: COLORS.chalk, fontFamily: "Inter, sans-serif", fontSize: 16,
                  }}
                >
                  {ruoliCampo.map((r) => (
                    <option key={r} value={r} style={{ background: COLORS.navy }}>{r}</option>
                  ))}
                </select>
                <button
                  onClick={async () => {
                    await onModificaGiocatore(p.id, bozza);
                    setModificaAttiva(null);
                  }}
                  style={{
                    padding: "7px 14px", borderRadius: 6, border: "none", cursor: "pointer",
                    fontFamily: "Inter, sans-serif", fontWeight: 700, fontSize: 12,
                    background: COLORS.floodlight, color: COLORS.pitchDark,
                  }}
                >
                  Salva
                </button>
              </div>
            )}
          </div>
          );
        })}
      </div>
    </div>
  );
}

/* ---------------------------------------------------------
   I MIEI DATI — riepilogo consensi e cancellazione
--------------------------------------------------------- */
/* ---------------------------------------------------------
   CHAT INTERNA — bacheca condivisa del gruppo
--------------------------------------------------------- */
function ChatInterna({ messaggi, players, currentPlayerId, onInvia, onElimina }) {
  const [testo, setTesto] = useState("");
  const [invioInCorso, setInvioInCorso] = useState(false);
  const fondoRef = useRef(null);

  useEffect(() => {
    fondoRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messaggi.length]);

  const nomeAutore = (id) => players.find((p) => p.id === id)?.name || "Giocatore";
  const avatarAutore = (id) => players.find((p) => p.id === id);

  const invia = async () => {
    const testoPulito = testo.trim();
    if (!testoPulito) return;
    setInvioInCorso(true);
    await onInvia(testoPulito);
    setTesto("");
    setInvioInCorso(false);
  };

  const oraMessaggio = (iso) => new Date(iso).toLocaleTimeString("it-IT", { hour: "2-digit", minute: "2-digit" });

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "calc(100vh - 260px)", minHeight: 420 }}>
      <div style={{ fontFamily: "Barlow Condensed, sans-serif", fontWeight: 700, fontSize: 20, color: COLORS.chalk, marginBottom: 4 }}>
        Chat del gruppo
      </div>
      <div style={{ fontFamily: "Inter, sans-serif", fontSize: 12, color: COLORS.chalkDim, marginBottom: 14 }}>
        Visibile a tutti i membri del gruppo, in tempo reale.
      </div>

      <div style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", gap: 10, paddingRight: 4, marginBottom: 12 }}>
        {messaggi.length === 0 && (
          <div style={{ color: COLORS.chalkDim, fontFamily: "Inter, sans-serif", fontSize: 13, textAlign: "center", marginTop: 30 }}>
            Nessun messaggio ancora. Rompi il ghiaccio! 👋
          </div>
        )}
        {messaggi.map((msg) => {
          const mio = msg.autore_id === currentPlayerId;
          const autore = avatarAutore(msg.autore_id);
          return (
            <div key={msg.id} style={{ display: "flex", gap: 8, alignItems: "flex-end", flexDirection: mio ? "row-reverse" : "row" }}>
              {autore && <MiniAvatar p={autore} size={26} />}
              <div style={{ maxWidth: "72%" }}>
                {!mio && (
                  <div style={{ fontSize: 10.5, color: COLORS.chalkDim, fontFamily: "Inter, sans-serif", marginBottom: 2, marginLeft: 4 }}>
                    {nomeAutore(msg.autore_id)}
                  </div>
                )}
                <div
                  style={{
                    background: mio ? COLORS.floodlight : COLORS.navy,
                    color: mio ? COLORS.pitchDark : COLORS.chalk,
                    borderRadius: 14,
                    borderBottomRightRadius: mio ? 4 : 14,
                    borderBottomLeftRadius: mio ? 14 : 4,
                    padding: "8px 12px",
                    fontFamily: "Inter, sans-serif",
                    fontSize: 13.5,
                    lineHeight: 1.4,
                    wordBreak: "break-word",
                  }}
                >
                  {msg.testo}
                </div>
                <div style={{ fontSize: 9.5, color: COLORS.chalkDim, marginTop: 2, textAlign: mio ? "right" : "left", marginRight: mio ? 4 : 0, marginLeft: mio ? 0 : 4 }}>
                  {oraMessaggio(msg.creato_il)}
                  {mio && (
                    <span onClick={() => onElimina(msg.id)} style={{ cursor: "pointer", marginLeft: 6, textDecoration: "underline" }}>
                      elimina
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
        <div ref={fondoRef} />
      </div>

      <div style={{ display: "flex", gap: 8 }}>
        <input
          value={testo}
          onChange={(e) => setTesto(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && invia()}
          placeholder="Scrivi un messaggio…"
          style={{
            flex: 1, padding: "11px 14px", borderRadius: 10, border: `1px solid rgba(255,255,255,0.15)`,
            background: COLORS.navy, color: COLORS.chalk, fontFamily: "Inter, sans-serif", fontSize: 16,
          }}
        />
        <button
          onClick={invia}
          disabled={!testo.trim() || invioInCorso}
          style={{
            padding: "0 18px", borderRadius: 10, border: "none",
            cursor: testo.trim() && !invioInCorso ? "pointer" : "not-allowed",
            background: testo.trim() && !invioInCorso ? COLORS.floodlight : "rgba(255,255,255,0.1)",
            color: testo.trim() && !invioInCorso ? COLORS.pitchDark : COLORS.chalkDim,
            fontFamily: "Inter, sans-serif", fontWeight: 700, fontSize: 13.5,
          }}
        >
          Invia
        </button>
      </div>
    </div>
  );
}

function ModificaProfilo({ myProfile, session, onSalvaProfilo, onCambiaEmail }) {
  const [nome, setNome] = useState(myProfile?.name || "");
  const [soprannome, setSoprannome] = useState(myProfile?.soprannome || "");
  const [ruolo, setRuolo] = useState(myProfile?.ruolo_campo || "Centrocampo");
  const [email, setEmail] = useState(session?.user?.email || "");
  const [fotoFile, setFotoFile] = useState(null);
  const [anteprimaFoto, setAnteprimaFoto] = useState(myProfile?.foto_url || null);

  const [salvataggioInCorso, setSalvataggioInCorso] = useState(false);
  const [salvato, setSalvato] = useState(false);
  const [emailInCorso, setEmailInCorso] = useState(false);
  const [emailInviata, setEmailInviata] = useState(false);
  const [errore, setErrore] = useState("");

  const ruoliCampo = ["Portiere", "Difensore", "Esterno Destro", "Esterno Sinistro", "Centrocampo", "Attaccante"];

  const scegliFoto = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFotoFile(file);
    setAnteprimaFoto(URL.createObjectURL(file));
  };

  const salva = async () => {
    setErrore("");
    setSalvataggioInCorso(true);
    try {
      await onSalvaProfilo({ nome, soprannome, ruolo, fotoFile });
      setSalvato(true);
      setFotoFile(null);
    } catch (e) {
      setErrore(e.message || "Errore nel salvataggio.");
    }
    setSalvataggioInCorso(false);
  };

  const cambiaEmail = async () => {
    if (!email || email === session?.user?.email) return;
    setErrore("");
    setEmailInCorso(true);
    try {
      await onCambiaEmail(email);
      setEmailInviata(true);
    } catch (e) {
      setErrore(e.message || "Errore nel cambio email.");
    }
    setEmailInCorso(false);
  };

  return (
    <div style={{ background: COLORS.navy, borderRadius: 12, padding: 20, marginBottom: 22 }}>
      <div style={{ fontFamily: "Barlow Condensed, sans-serif", fontWeight: 700, fontSize: 18, color: COLORS.chalk, marginBottom: 14 }}>
        Il mio profilo
      </div>

      {errore && (
        <div style={{ background: "rgba(229,83,60,0.1)", border: `1px solid ${COLORS.red}`, borderRadius: 8, padding: "8px 10px", fontFamily: "Inter, sans-serif", fontSize: 12, color: "#ffb3a3", marginBottom: 12 }}>
          {errore}
        </div>
      )}

      <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
        <div style={{ textAlign: "center" }}>
          <div
            style={{
              width: 84, height: 84, borderRadius: "50%", overflow: "hidden",
              background: anteprimaFoto ? "transparent" : myProfile?.colore || COLORS.pitchLine,
              display: "flex", alignItems: "center", justifyContent: "center",
              border: `2px solid rgba(255,255,255,0.15)`, marginBottom: 8,
            }}
          >
            {anteprimaFoto ? (
              <img src={anteprimaFoto} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            ) : (
              <span style={{ fontFamily: "Barlow Condensed, sans-serif", fontWeight: 700, fontSize: 28, color: COLORS.chalk }}>
                {myProfile?.initials}
              </span>
            )}
          </div>
          <label
            style={{
              display: "inline-block", fontSize: 11, color: COLORS.floodlight, cursor: "pointer",
              fontFamily: "Inter, sans-serif", textDecoration: "underline",
            }}
          >
            Cambia foto
            <input type="file" accept="image/*" onChange={scegliFoto} style={{ display: "none" }} />
          </label>
        </div>

        <div style={{ flex: 1, minWidth: 200, display: "flex", flexDirection: "column", gap: 10 }}>
          <div>
            <div style={{ fontSize: 11, color: COLORS.chalkDim, marginBottom: 4 }}>Nome e cognome</div>
            <input
              value={nome} onChange={(e) => setNome(e.target.value)}
              style={{
                width: "100%", boxSizing: "border-box", padding: "8px 10px", borderRadius: 7,
                border: `1px solid rgba(255,255,255,0.15)`, background: "rgba(255,255,255,0.05)",
                color: COLORS.chalk, fontFamily: "Inter, sans-serif", fontSize: 16,
              }}
            />
          </div>
          <div>
            <div style={{ fontSize: 11, color: COLORS.chalkDim, marginBottom: 4 }}>Soprannome (facoltativo)</div>
            <input
              value={soprannome} onChange={(e) => setSoprannome(e.target.value)} placeholder="Es. Er Bomber"
              style={{
                width: "100%", boxSizing: "border-box", padding: "8px 10px", borderRadius: 7,
                border: `1px solid rgba(255,255,255,0.15)`, background: "rgba(255,255,255,0.05)",
                color: COLORS.chalk, fontFamily: "Inter, sans-serif", fontSize: 16,
              }}
            />
          </div>
          <div>
            <div style={{ fontSize: 11, color: COLORS.chalkDim, marginBottom: 4 }}>Ruolo in campo</div>
            <select
              value={ruolo} onChange={(e) => setRuolo(e.target.value)}
              style={{
                width: "100%", padding: "8px 10px", borderRadius: 7,
                border: `1px solid rgba(255,255,255,0.15)`, background: "rgba(255,255,255,0.05)",
                color: COLORS.chalk, fontFamily: "Inter, sans-serif", fontSize: 16,
              }}
            >
              {ruoliCampo.map((r) => (
                <option key={r} value={r} style={{ background: COLORS.navy }}>{r}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <button
        onClick={salva}
        disabled={salvataggioInCorso}
        style={{
          marginTop: 16, padding: "9px 16px", borderRadius: 8, border: "none",
          cursor: salvataggioInCorso ? "not-allowed" : "pointer",
          fontFamily: "Inter, sans-serif", fontWeight: 700, fontSize: 12.5,
          background: COLORS.floodlight, color: COLORS.pitchDark,
        }}
      >
        {salvataggioInCorso ? "Salvataggio…" : salvato ? "✓ Salvato — salva di nuovo per aggiornare" : "Salva profilo"}
      </button>

      <div style={{ marginTop: 20, paddingTop: 16, borderTop: "1px solid rgba(255,255,255,0.08)" }}>
        <div style={{ fontSize: 11, color: COLORS.chalkDim, marginBottom: 4 }}>Email di accesso</div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <input
            type="email" value={email} onChange={(e) => setEmail(e.target.value)}
            style={{
              flex: 1, minWidth: 180, boxSizing: "border-box", padding: "8px 10px", borderRadius: 7,
              border: `1px solid rgba(255,255,255,0.15)`, background: "rgba(255,255,255,0.05)",
              color: COLORS.chalk, fontFamily: "Inter, sans-serif", fontSize: 16,
            }}
          />
          <button
            onClick={cambiaEmail}
            disabled={emailInCorso || !email || email === session?.user?.email}
            style={{
              padding: "8px 14px", borderRadius: 7, cursor: "pointer",
              fontFamily: "Inter, sans-serif", fontWeight: 700, fontSize: 12,
              border: `1px solid rgba(255,255,255,0.2)`, background: "transparent", color: COLORS.chalk,
            }}
          >
            {emailInCorso ? "…" : "Aggiorna"}
          </button>
        </div>
        {emailInviata && (
          <div style={{ fontSize: 11, color: COLORS.chalkDim, marginTop: 6, fontFamily: "Inter, sans-serif" }}>
            Controlla la posta per confermare il cambio email (se richiesto dalle impostazioni del gruppo).
          </div>
        )}
      </div>
    </div>
  );
}

function MieiDati({ consensi, richiestaInviata, onRichiediCancellazione, myProfile, session, onSalvaProfilo, onCambiaEmail }) {
  const righe = [
    { label: "Trattamento dati (presenze, voti, statistiche)", val: consensi?.consensoDati },
    { label: "Utilizzo foto per la figurina", val: consensi?.consensoFoto },
    { label: "Conferma maggiore età", val: consensi?.maggiorenne },
  ];

  return (
    <div>
      <div style={{ fontFamily: "Barlow Condensed, sans-serif", fontWeight: 700, fontSize: 20, color: COLORS.chalk, marginBottom: 4 }}>
        I miei dati
      </div>
      <div style={{ fontFamily: "Inter, sans-serif", fontSize: 13, color: COLORS.chalkDim, marginBottom: 20 }}>
        Consensi forniti in fase di registrazione{consensi?.timestamp ? ` · ${consensi.timestamp}` : ""}
      </div>

      <ModificaProfilo myProfile={myProfile} session={session} onSalvaProfilo={onSalvaProfilo} onCambiaEmail={onCambiaEmail} />
      <div style={{ background: COLORS.navy, borderRadius: 12, padding: 6, marginBottom: 22 }}>
        {righe.map((r, i) => (
          <div
            key={r.label}
            style={{
              display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 8,
              padding: "12px 14px",
              borderBottom: i < righe.length - 1 ? "1px solid rgba(255,255,255,0.06)" : "none",
            }}
          >
            <span style={{ fontFamily: "Inter, sans-serif", fontSize: 13.5, color: COLORS.chalk }}>{r.label}</span>
            <span style={chip(r.val ? "rgba(76,175,109,0.15)" : "rgba(229,83,60,0.15)", r.val ? COLORS.green : COLORS.red)}>
              {r.val ? "✓ Concesso" : "Non concesso"}
            </span>
          </div>
        ))}
      </div>

      <div style={{ background: COLORS.navy, borderRadius: 12, padding: 18, marginBottom: 16 }}>
        <div style={{ fontFamily: "Barlow Condensed, sans-serif", fontWeight: 700, fontSize: 16, color: COLORS.chalk, marginBottom: 6 }}>
          Cosa viene conservato
        </div>
        <div style={{ fontFamily: "Inter, sans-serif", fontSize: 12.5, color: COLORS.chalkDim, lineHeight: 1.7 }}>
          Nome, foto della figurina, storico presenze/assenze, voti ricevuti (in forma aggregata e anonima), gol segnati e MVP assegnati. Visibili solo agli altri membri del gruppo, mai a terzi.
        </div>
      </div>

      <div style={{ background: "rgba(229,83,60,0.08)", border: `1px solid ${COLORS.red}`, borderRadius: 12, padding: 18 }}>
        <div style={{ fontFamily: "Barlow Condensed, sans-serif", fontWeight: 700, fontSize: 16, color: COLORS.chalk, marginBottom: 6 }}>
          Richiedi la cancellazione dei tuoi dati
        </div>
        <div style={{ fontFamily: "Inter, sans-serif", fontSize: 12.5, color: COLORS.chalkDim, lineHeight: 1.7, marginBottom: 12 }}>
          Invia una richiesta all'amministratore per eliminare il tuo account, la foto e tutte le statistiche associate. L'operazione è irreversibile e verrà eseguita dall'admin.
        </div>
        {richiestaInviata ? (
          <span style={chip("rgba(255,200,87,0.15)", COLORS.floodlight)}>⏳ Richiesta inviata, in attesa dell'admin</span>
        ) : (
          <button
            onClick={onRichiediCancellazione}
            style={{
              padding: "9px 16px", borderRadius: 8, border: "none", cursor: "pointer",
              fontFamily: "Inter, sans-serif", fontWeight: 700, fontSize: 12.5,
              background: COLORS.red, color: COLORS.chalk,
            }}
          >
            Richiedi cancellazione account
          </button>
        )}
      </div>
    </div>
  );
}

/* ---------------------------------------------------------
   ONBOARDING — scelta login + consenso privacy/foto
--------------------------------------------------------- */
function Onboarding({ onRegistrationSent }) {
  const [mode, setMode] = useState("register"); // register | login
  const [step, setStep] = useState("welcome"); // welcome -> form -> consenso -> inviata
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [resetInviato, setResetInviato] = useState(false);

  const [consensoDati, setConsensoDati] = useState(false);
  const [consensoFoto, setConsensoFoto] = useState(false);
  const [maggiorenne, setMaggiorenne] = useState(false);
  const [infoAperta, setInfoAperta] = useState(false);

  const [caricamento, setCaricamento] = useState(false);
  const [errore, setErrore] = useState("");

  const puoConfermare = consensoDati && consensoFoto && maggiorenne;

  const iniziaRegistrazione = () => {
    setErrore("");
    setStep("form");
  };

  const handleLogin = async () => {
    setErrore("");
    setCaricamento(true);
    const { error } = await supabase.auth.signInWithPassword({ email: loginEmail, password: loginPassword });
    setCaricamento(false);
    if (error) setErrore(error.message === "Invalid login credentials" ? "Email o password non corrette." : error.message);
    // se va a buon fine, il cambiamento di sessione viene gestito dal componente App
  };

  const handleResetPassword = async () => {
    if (!loginEmail) {
      setErrore("Inserisci prima la tua email qui sopra, poi premi di nuovo.");
      return;
    }
    setErrore("");
    setCaricamento(true);
    const { error } = await supabase.auth.resetPasswordForEmail(loginEmail, { redirectTo: window.location.origin });
    setCaricamento(false);
    if (error) setErrore(error.message);
    else setResetInviato(true);
  };

  const handleRegistrati = async () => {
    setErrore("");
    setCaricamento(true);
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) {
      setCaricamento(false);
      setErrore(
        error.message.includes("already registered") || error.message.includes("User already registered")
          ? "Questa email è già registrata. Prova ad accedere invece."
          : error.message
      );
      return;
    }
    const userId = data.user?.id;
    if (userId) {
      // Se questo account (stesso auth id) ha già un profilo, non ne creo un altro:
      // evita duplicati quando qualcuno riprova la registrazione con la stessa email.
      const { data: profiloEsistente } = await supabase.from("profiles").select("id").eq("auth_user_id", userId).maybeSingle();
      if (!profiloEsistente) {
        const initials = nome.trim().split(/\s+/).map((w) => w[0]).slice(0, 2).join("").toUpperCase();
        const { error: profileError } = await supabase.from("profiles").insert({
          auth_user_id: userId,
          name: nome,
          initials,
          consenso_dati: consensoDati,
          consenso_foto: consensoFoto,
          maggiorenne,
          consenso_timestamp: new Date().toISOString(),
        });
        if (profileError) {
          setCaricamento(false);
          setErrore("Registrazione creata ma il profilo non è stato salvato: " + profileError.message);
          return;
        }
      }
    }
    setCaricamento(false);
    setStep("inviata");
    if (onRegistrationSent) onRegistrationSent();
  };

  const Checkbox = ({ checked, onChange, children }) => (
    <label style={{ display: "flex", gap: 10, alignItems: "flex-start", cursor: "pointer", fontFamily: "Inter, sans-serif", fontSize: 13, color: COLORS.chalk, lineHeight: 1.5 }}>
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        style={{ marginTop: 3, width: 16, height: 16, accentColor: COLORS.floodlight, flexShrink: 0 }}
      />
      <span>{children}</span>
    </label>
  );

  const ErroreBox = () =>
    errore ? (
      <div style={{ background: "rgba(229,83,60,0.1)", border: `1px solid ${COLORS.red}`, borderRadius: 8, padding: "8px 10px", fontFamily: "Inter, sans-serif", fontSize: 12, color: "#ffb3a3" }}>
        {errore}
      </div>
    ) : null;

  return (
    <div
      style={{
        minHeight: "100%",
        background: `radial-gradient(circle at 20% 0%, ${COLORS.pitchMid}, ${COLORS.pitchDark} 60%)`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "40px 20px",
        fontFamily: "Inter, sans-serif",
      }}
    >
      <style>{FONT_IMPORT}</style>
      <div style={{ width: "100%", maxWidth: 420, background: COLORS.navy, borderRadius: 18, padding: 30, border: `1px solid rgba(255,255,255,0.08)` }}>
        <div style={{ textAlign: "center", marginBottom: 22 }}>
          <div style={{ fontFamily: "Barlow Condensed, sans-serif", fontWeight: 800, fontSize: 24, color: COLORS.chalk }}>
            ⚽ CALCETTO MARTEDÌ & GIOVEDÌ
          </div>
          <div style={{ fontSize: 12, color: COLORS.chalkDim, marginTop: 4 }}>Entra per vedere convocazioni, voti e la tua figurina</div>
        </div>

        {step === "welcome" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 18 }}>
            <div style={{ display: "flex", background: "rgba(0,0,0,0.25)", padding: 4, borderRadius: 10 }}>
              {[{ id: "login", label: "Accedi" }, { id: "register", label: "Registrati" }].map((m) => (
                <button
                  key={m.id}
                  onClick={() => { setMode(m.id); setErrore(""); }}
                  style={{
                    flex: 1, border: "none", cursor: "pointer", padding: "8px 0", borderRadius: 7,
                    fontFamily: "Inter, sans-serif", fontWeight: 600, fontSize: 13,
                    background: mode === m.id ? COLORS.floodlight : "transparent",
                    color: mode === m.id ? COLORS.pitchDark : COLORS.chalkDim,
                  }}
                >
                  {m.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {step === "welcome" && mode === "login" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <ErroreBox />
            <div>
              <div style={{ fontSize: 11.5, color: COLORS.chalkDim, marginBottom: 4 }}>Email</div>
              <input
                type="email" value={loginEmail} onChange={(e) => setLoginEmail(e.target.value)}
                style={{
                  width: "100%", boxSizing: "border-box", padding: "10px 12px", borderRadius: 8,
                  border: `1px solid rgba(255,255,255,0.15)`, background: "rgba(255,255,255,0.05)",
                  color: COLORS.chalk, fontFamily: "Inter, sans-serif", fontSize: 16,
                }}
              />
            </div>
            <div>
              <div style={{ fontSize: 11.5, color: COLORS.chalkDim, marginBottom: 4 }}>Password</div>
              <input
                type="password" value={loginPassword} onChange={(e) => setLoginPassword(e.target.value)}
                style={{
                  width: "100%", boxSizing: "border-box", padding: "10px 12px", borderRadius: 8,
                  border: `1px solid rgba(255,255,255,0.15)`, background: "rgba(255,255,255,0.05)",
                  color: COLORS.chalk, fontFamily: "Inter, sans-serif", fontSize: 16,
                }}
              />
            </div>
            <button
              onClick={handleLogin}
              disabled={!loginEmail || !loginPassword || caricamento}
              style={{
                marginTop: 4, padding: "11px 0", borderRadius: 10, border: "none",
                cursor: loginEmail && loginPassword && !caricamento ? "pointer" : "not-allowed",
                background: loginEmail && loginPassword && !caricamento ? COLORS.floodlight : "rgba(255,255,255,0.1)",
                color: loginEmail && loginPassword && !caricamento ? COLORS.pitchDark : COLORS.chalkDim,
                fontFamily: "Inter, sans-serif", fontWeight: 700, fontSize: 14,
              }}
            >
              {caricamento ? "Accesso in corso…" : "Accedi"}
            </button>

            {resetInviato ? (
              <div style={{ fontSize: 11.5, color: COLORS.green, textAlign: "center", fontFamily: "Inter, sans-serif" }}>
                ✓ Ti abbiamo mandato un'email con il link per reimpostare la password.
              </div>
            ) : (
              <button
                onClick={handleResetPassword}
                disabled={caricamento}
                style={{
                  background: "none", border: "none", color: COLORS.chalkDim, fontSize: 11.5,
                  cursor: "pointer", fontFamily: "Inter, sans-serif", textDecoration: "underline", textAlign: "center",
                }}
              >
                Password dimenticata?
              </button>
            )}
          </div>
        )}

        {step === "welcome" && mode === "register" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <ErroreBox />
            <button
              onClick={iniziaRegistrazione}
              style={{
                padding: "12px 0", borderRadius: 10, border: "1px solid rgba(255,255,255,0.2)",
                background: "rgba(255,255,255,0.06)", color: COLORS.chalk, fontFamily: "Inter, sans-serif", fontWeight: 700, fontSize: 14, cursor: "pointer",
              }}
            >
              ✉️ Registrati con email
            </button>
          </div>
        )}

        {step === "form" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {[
              { label: "Nome e cognome", val: nome, set: setNome, type: "text" },
              { label: "Email", val: email, set: setEmail, type: "email" },
              { label: "Password", val: password, set: setPassword, type: "password" },
            ].map((f) => (
              <div key={f.label}>
                <div style={{ fontSize: 11.5, color: COLORS.chalkDim, marginBottom: 4 }}>{f.label}</div>
                <input
                  type={f.type} value={f.val} onChange={(e) => f.set(e.target.value)}
                  style={{
                    width: "100%", boxSizing: "border-box", padding: "10px 12px", borderRadius: 8,
                    border: `1px solid rgba(255,255,255,0.15)`, background: "rgba(255,255,255,0.05)",
                    color: COLORS.chalk, fontFamily: "Inter, sans-serif", fontSize: 16,
                  }}
                />
              </div>
            ))}
            <button
              onClick={() => setStep("consenso")}
              disabled={!nome || !email || !password}
              style={{
                marginTop: 6, padding: "11px 0", borderRadius: 10, border: "none", cursor: nome && email && password ? "pointer" : "not-allowed",
                background: nome && email && password ? COLORS.floodlight : "rgba(255,255,255,0.1)",
                color: nome && email && password ? COLORS.pitchDark : COLORS.chalkDim,
                fontFamily: "Inter, sans-serif", fontWeight: 700, fontSize: 14,
              }}
            >
              Continua
            </button>
            <button onClick={() => setStep("welcome")} style={{ background: "none", border: "none", color: COLORS.chalkDim, fontSize: 12, cursor: "pointer", fontFamily: "Inter, sans-serif" }}>
              ← Indietro
            </button>
          </div>
        )}

        {step === "consenso" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div style={{ fontFamily: "Barlow Condensed, sans-serif", fontWeight: 700, fontSize: 17, color: COLORS.chalk }}>
              Prima di iniziare
            </div>

            <ErroreBox />

            <div style={{ background: "rgba(255,200,87,0.08)", border: `1px solid rgba(255,200,87,0.3)`, borderRadius: 10, padding: 12 }}>
              <div style={{ fontFamily: "Inter, sans-serif", fontSize: 12, color: COLORS.chalkDim, lineHeight: 1.6 }}>
                ℹ️ La tua registrazione dovrà essere approvata dall'organizzatore prima di poter accedere. Se eri già stato inserito come ospite, sarà l'organizzatore a collegare il tuo account al profilo esistente.
              </div>
            </div>

            <div style={{ background: "rgba(255,255,255,0.04)", borderRadius: 10, padding: 12 }}>
              <Checkbox checked={consensoDati} onChange={setConsensoDati}>
                Acconsento al trattamento dei miei dati (nome, presenze, voti, statistiche di rendimento) all'interno dell'app, visibili agli altri membri del gruppo.
              </Checkbox>
            </div>

            <div style={{ background: "rgba(255,255,255,0.04)", borderRadius: 10, padding: 12 }}>
              <Checkbox checked={consensoFoto} onChange={setConsensoFoto}>
                Acconsento all'utilizzo della mia foto per creare la mia figurina personale, visibile agli altri membri del gruppo.
              </Checkbox>
            </div>

            <div style={{ background: "rgba(255,255,255,0.04)", borderRadius: 10, padding: 12 }}>
              <Checkbox checked={maggiorenne} onChange={setMaggiorenne}>
                Confermo di essere maggiorenne. <span style={{ color: COLORS.chalkDim }}>(Se sei minorenne, serve il consenso di un genitore/tutore prima di registrarti.)</span>
              </Checkbox>
            </div>

            <div>
              <button
                onClick={() => setInfoAperta((v) => !v)}
                style={{ background: "none", border: "none", color: COLORS.floodlight, fontSize: 12, cursor: "pointer", fontFamily: "Inter, sans-serif", padding: 0, textDecoration: "underline" }}
              >
                {infoAperta ? "Nascondi informativa privacy" : "Leggi l'informativa privacy"}
              </button>
              {infoAperta && (
                <div style={{ marginTop: 8, fontSize: 11.5, color: COLORS.chalkDim, lineHeight: 1.6, fontFamily: "Inter, sans-serif" }}>
                  I tuoi dati (nome, foto, presenze, voti ricevuti, statistiche) sono visibili solo agli altri membri del gruppo e servono esclusivamente a organizzare le partite e calcolare le statistiche interne. Non vengono condivisi con terzi. Puoi richiedere in qualsiasi momento la modifica o la cancellazione dei tuoi dati e della tua foto contattando l'amministratore del gruppo, che potrà eliminare il tuo account su richiesta.
                </div>
              )}
            </div>

            <button
              onClick={handleRegistrati}
              disabled={!puoConfermare || caricamento}
              style={{
                padding: "12px 0", borderRadius: 10, border: "none", cursor: puoConfermare && !caricamento ? "pointer" : "not-allowed",
                background: puoConfermare && !caricamento ? COLORS.floodlight : "rgba(255,255,255,0.1)",
                color: puoConfermare && !caricamento ? COLORS.pitchDark : COLORS.chalkDim,
                fontFamily: "Inter, sans-serif", fontWeight: 700, fontSize: 14,
              }}
            >
              {caricamento ? "Invio in corso…" : "Invia richiesta di registrazione"}
            </button>
            {!puoConfermare && (
              <div style={{ fontSize: 11, color: COLORS.chalkDim, textAlign: "center", marginTop: -8 }}>
                Servono i consensi su dati, foto ed età per continuare.
              </div>
            )}
            <button onClick={() => setStep("form")} style={{ background: "none", border: "none", color: COLORS.chalkDim, fontSize: 12, cursor: "pointer", fontFamily: "Inter, sans-serif" }}>
              ← Indietro
            </button>
          </div>
        )}

        {step === "inviata" && (
          <div style={{ textAlign: "center", padding: "10px 0" }}>
            <div style={{ fontSize: 40, marginBottom: 14 }}>⏳</div>
            <div style={{ fontFamily: "Barlow Condensed, sans-serif", fontWeight: 700, fontSize: 19, color: COLORS.chalk, marginBottom: 8 }}>
              Richiesta inviata
            </div>
            <div style={{ fontFamily: "Inter, sans-serif", fontSize: 13, color: COLORS.chalkDim, lineHeight: 1.6 }}>
              L'organizzatore deve approvare la tua registrazione prima che tu possa accedere. Riceverai conferma appena verrà gestita — se eri già in rosa come ospite, i tuoi dati verranno collegati automaticamente.
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ---------------------------------------------------------
   IMPOSTA NUOVA PASSWORD — dopo il link di reset via email
--------------------------------------------------------- */
function ImpostaNuovaPassword({ onImpostata }) {
  const [password, setPassword] = useState("");
  const [conferma, setConferma] = useState("");
  const [caricamento, setCaricamento] = useState(false);
  const [errore, setErrore] = useState("");

  const salva = async () => {
    setErrore("");
    if (password.length < 6) {
      setErrore("La password deve avere almeno 6 caratteri.");
      return;
    }
    if (password !== conferma) {
      setErrore("Le due password non coincidono.");
      return;
    }
    setCaricamento(true);
    const { error } = await supabase.auth.updateUser({ password });
    setCaricamento(false);
    if (error) {
      setErrore(error.message);
      return;
    }
    onImpostata();
  };

  return (
    <div
      style={{
        minHeight: "100%", background: `radial-gradient(circle at 20% 0%, ${COLORS.pitchMid}, ${COLORS.pitchDark} 60%)`,
        display: "flex", alignItems: "center", justifyContent: "center", padding: "40px 20px", fontFamily: "Inter, sans-serif",
      }}
    >
      <style>{FONT_IMPORT}</style>
      <div style={{ width: "100%", maxWidth: 420, background: COLORS.navy, borderRadius: 18, padding: 30, border: `1px solid rgba(255,255,255,0.08)` }}>
        <div style={{ fontFamily: "Barlow Condensed, sans-serif", fontWeight: 700, fontSize: 19, color: COLORS.chalk, marginBottom: 6 }}>
          Imposta una nuova password
        </div>
        <div style={{ fontFamily: "Inter, sans-serif", fontSize: 13, color: COLORS.chalkDim, marginBottom: 18 }}>
          Scegli la password che userai per accedere da ora in poi.
        </div>

        {errore && (
          <div style={{ background: "rgba(229,83,60,0.1)", border: `1px solid ${COLORS.red}`, borderRadius: 8, padding: "8px 10px", fontFamily: "Inter, sans-serif", fontSize: 12, color: "#ffb3a3", marginBottom: 12 }}>
            {errore}
          </div>
        )}

        <div style={{ marginBottom: 12 }}>
          <div style={{ fontSize: 11.5, color: COLORS.chalkDim, marginBottom: 4 }}>Nuova password</div>
          <input
            type="password" value={password} onChange={(e) => setPassword(e.target.value)}
            style={{
              width: "100%", boxSizing: "border-box", padding: "10px 12px", borderRadius: 8,
              border: `1px solid rgba(255,255,255,0.15)`, background: "rgba(255,255,255,0.05)",
              color: COLORS.chalk, fontFamily: "Inter, sans-serif", fontSize: 16,
            }}
          />
        </div>
        <div style={{ marginBottom: 18 }}>
          <div style={{ fontSize: 11.5, color: COLORS.chalkDim, marginBottom: 4 }}>Ripeti la password</div>
          <input
            type="password" value={conferma} onChange={(e) => setConferma(e.target.value)}
            style={{
              width: "100%", boxSizing: "border-box", padding: "10px 12px", borderRadius: 8,
              border: `1px solid rgba(255,255,255,0.15)`, background: "rgba(255,255,255,0.05)",
              color: COLORS.chalk, fontFamily: "Inter, sans-serif", fontSize: 16,
            }}
          />
        </div>

        <button
          onClick={salva}
          disabled={!password || !conferma || caricamento}
          style={{
            width: "100%", padding: "12px 0", borderRadius: 10, border: "none",
            cursor: password && conferma && !caricamento ? "pointer" : "not-allowed",
            background: password && conferma && !caricamento ? COLORS.floodlight : "rgba(255,255,255,0.1)",
            color: password && conferma && !caricamento ? COLORS.pitchDark : COLORS.chalkDim,
            fontFamily: "Inter, sans-serif", fontWeight: 700, fontSize: 14,
          }}
        >
          {caricamento ? "Salvataggio…" : "Salva nuova password"}
        </button>
      </div>
    </div>
  );
}

/* ---------------------------------------------------------
   SCHERMATE DI ATTESA / STATO ACCOUNT
--------------------------------------------------------- */
function SchermataStato({ icona, titolo, testo, onEsci }) {
  return (
    <div
      style={{
        minHeight: "100%",
        background: `radial-gradient(circle at 20% 0%, ${COLORS.pitchMid}, ${COLORS.pitchDark} 60%)`,
        display: "flex", alignItems: "center", justifyContent: "center", padding: "40px 20px",
        fontFamily: "Inter, sans-serif",
      }}
    >
      <style>{FONT_IMPORT}</style>
      <div style={{ width: "100%", maxWidth: 420, background: COLORS.navy, borderRadius: 18, padding: 34, border: `1px solid rgba(255,255,255,0.08)`, textAlign: "center" }}>
        <div style={{ fontSize: 40, marginBottom: 14 }}>{icona}</div>
        <div style={{ fontFamily: "Barlow Condensed, sans-serif", fontWeight: 700, fontSize: 19, color: COLORS.chalk, marginBottom: 8 }}>
          {titolo}
        </div>
        <div style={{ fontFamily: "Inter, sans-serif", fontSize: 13, color: COLORS.chalkDim, lineHeight: 1.6, marginBottom: 20 }}>
          {testo}
        </div>
        <button
          onClick={onEsci}
          style={{
            padding: "9px 18px", borderRadius: 9, border: `1px solid rgba(255,255,255,0.15)`, cursor: "pointer",
            background: "transparent", color: COLORS.chalkDim, fontFamily: "Inter, sans-serif", fontWeight: 600, fontSize: 12.5,
          }}
        >
          Esci
        </button>
      </div>
    </div>
  );
}

/* ---------------------------------------------------------
   APP
--------------------------------------------------------- */
export default function CalcettoApp() {
  const [session, setSession] = useState(undefined); // undefined = ancora da controllare, null = nessuna sessione
  const [profileStatus, setProfileStatus] = useState(null);
  const [myProfile, setMyProfile] = useState(null);
  const [richiesteCancellazione, setRichiesteCancellazione] = useState([]);
  const [richiesteRegistrazione, setRichiesteRegistrazione] = useState([]);
  const [role, setRole] = useState("player");
  const [players, setPlayers] = useState([]);
  const [matches, setMatches] = useState([]);
  const [voti, setVoti] = useState([]);
  const [votiMvp, setVotiMvp] = useState([]);
  const [messaggi, setMessaggi] = useState([]);
  const [ultimoVistoIl, setUltimoVistoIl] = useState(null);
  const [datiCaricati, setDatiCaricati] = useState(false);
  const [modalitaRecuperoPassword, setModalitaRecuperoPassword] = useState(false);

  const currentPlayerId = myProfile?.id;
  const sonoOrganizzatore = myProfile?.ruolo_app === "organizer";
  const sonoAllenatore = myProfile?.ruolo_app === "allenatore";

  useEffect(() => {
    if (myProfile) {
      setRole(myProfile.ruolo_app === "organizer" ? "organizer" : myProfile.ruolo_app === "allenatore" ? "coach" : "player");
    }
  }, [myProfile?.ruolo_app]);

  const consensi = myProfile
    ? {
        consensoDati: myProfile.consenso_dati,
        consensoFoto: myProfile.consenso_foto,
        maggiorenne: myProfile.maggiorenne,
        timestamp: myProfile.consenso_timestamp
          ? new Date(myProfile.consenso_timestamp).toLocaleDateString("it-IT", { day: "2-digit", month: "long", year: "numeric" })
          : "",
      }
    : null;

  // Ascolta lo stato di autenticazione reale (Supabase)
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
    const { data: listener } = supabase.auth.onAuthStateChange((event, sess) => {
      setSession(sess);
      if (event === "PASSWORD_RECOVERY") setModalitaRecuperoPassword(true);
    });
    return () => listener.subscription.unsubscribe();
  }, []);

  const ricaricaMioProfilo = async () => {
    if (!session) {
      setProfileStatus(null);
      setMyProfile(null);
      return;
    }
    const { data } = await supabase.from("profiles").select("*").eq("auth_user_id", session.user.id).maybeSingle();
    setMyProfile(data || null);
    setProfileStatus(data ? data.stato_registrazione : "nessuno");
  };

  // Quando cambia la sessione, controlla se esiste un profilo e il suo stato
  useEffect(() => {
    ricaricaMioProfilo();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session]);

  // Converte una riga 'profiles' di Supabase nel formato usato dai componenti
  const mapProfileRow = (row) => ({ ...row, role: row.ruolo_campo });

  // Converte una riga 'matches' di Supabase nel formato usato dai componenti
  const mapMatchRow = (row) => ({
    ...row,
    squadraBianchi: row.squadra_bianchi || [],
    squadraNeri: row.squadra_neri || [],
    risultato: row.risultato_bianchi != null && row.risultato_neri != null ? { bianchi: row.risultato_bianchi, neri: row.risultato_neri } : null,
    gol: row.gol || {},
    autogol: row.autogol || {},
    buche: row.buche || [],
  });

  const caricaGiocatori = async () => {
    const { data } = await supabase.from("profiles").select("*").eq("stato_registrazione", "approvato").order("name");
    setPlayers((data || []).map(mapProfileRow));
  };

  const caricaPartite = async () => {
    const { data } = await supabase.from("matches").select("*").order("data", { ascending: false });
    setMatches((data || []).map(mapMatchRow));
  };

  const caricaRichiesteRegistrazione = async () => {
    const { data } = await supabase.from("profiles").select("*").eq("stato_registrazione", "in_attesa").order("created_at");
    setRichiesteRegistrazione(data || []);
  };

  const caricaRichiesteCancellazione = async () => {
    const { data } = await supabase
      .from("deletion_requests")
      .select("id, player_id, richiesto_il, profiles(name)")
      .eq("completato", false);
    setRichiesteCancellazione(
      (data || []).map((r) => ({
        id: r.id,
        playerId: r.player_id,
        nome: r.profiles?.name || "—",
        data: new Date(r.richiesto_il).toLocaleDateString("it-IT"),
      }))
    );
  };

  const caricaVoti = async () => {
    const { data } = await supabase.from("votes").select("match_id, votante_id, votato_id, voto");
    setVoti(data || []);
  };

  const caricaVotiMvp = async () => {
    const { data } = await supabase.from("voti_mvp").select("match_id, votante_id, votato_id");
    setVotiMvp(data || []);
  };

  const caricaMessaggi = async () => {
    const { data } = await supabase.from("messaggi").select("*").order("creato_il", { ascending: true }).limit(300);
    setMessaggi(data || []);
  };

  // Quando l'accesso è approvato, carica tutti i dati reali
  useEffect(() => {
    if (profileStatus !== "approvato") return;
    let annullato = false;
    (async () => {
      await Promise.all([caricaGiocatori(), caricaPartite(), caricaRichiesteRegistrazione(), caricaRichiesteCancellazione(), caricaVoti(), caricaVotiMvp(), caricaMessaggi()]);
      if (!annullato) {
        setDatiCaricati(true);
        setUltimoVistoIl(new Date().toISOString());
      }
    })();
    return () => {
      annullato = true;
    };
  }, [profileStatus]);

  // Chat in tempo reale: ascolta i nuovi messaggi appena arrivano
  useEffect(() => {
    if (profileStatus !== "approvato") return;
    const canale = supabase
      .channel("messaggi-realtime")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "messaggi" }, (payload) => {
        setMessaggi((prev) => (prev.some((m) => m.id === payload.new.id) ? prev : [...prev, payload.new]));
      })
      .on("postgres_changes", { event: "DELETE", schema: "public", table: "messaggi" }, (payload) => {
        setMessaggi((prev) => prev.filter((m) => m.id !== payload.old.id));
      })
      .subscribe();
    return () => {
      supabase.removeChannel(canale);
    };
  }, [profileStatus]);

  const inviaMessaggio = async (testo) => {
    if (!currentPlayerId) return;
    await supabase.from("messaggi").insert({ autore_id: currentPlayerId, testo });
  };

  const eliminaMessaggio = async (id) => {
    await supabase.from("messaggi").delete().eq("id", id);
  };

  const PALETTE_OSPITI = ["#2D6A4F", "#1B4332", "#16233D", "#E5533C", "#4C7A5C"];

  const aggiungiGiocatore = async ({ nome, ruolo, ospite = true }) => {
    const initials = nome.trim().split(/\s+/).map((w) => w[0]).slice(0, 2).join("").toUpperCase();
    await supabase.from("profiles").insert({
      name: nome,
      initials,
      ruolo_campo: ruolo,
      ruolo_app: "player",
      stato_registrazione: "approvato",
      overall: 65,
      affidabilita: 100,
      colore: PALETTE_OSPITI[Math.floor(Math.random() * PALETTE_OSPITI.length)],
      ospite,
    });
    await caricaGiocatori();
  };

  const collegaOspite = async (ospiteId, richiesta) => {
    // Il profilo "ospite" eredita l'account appena registrato: diventa lui
    // l'account definitivo, e la riga di registrazione in attesa viene rimossa.
    await supabase
      .from("profiles")
      .update({
        auth_user_id: richiesta.auth_user_id,
        ospite: false,
        stato_registrazione: "approvato",
        consenso_dati: richiesta.consenso_dati,
        consenso_foto: richiesta.consenso_foto,
        maggiorenne: richiesta.maggiorenne,
        consenso_timestamp: richiesta.consenso_timestamp,
      })
      .eq("id", ospiteId);
    await supabase.from("profiles").delete().eq("id", richiesta.id);
  };

  const approvaRegistrazione = async (richiestaId, comeOspiteId) => {
    const richiesta = richiesteRegistrazione.find((r) => r.id === richiestaId);
    if (!richiesta) return;
    if (comeOspiteId) {
      await collegaOspite(comeOspiteId, richiesta);
    } else {
      await supabase.from("profiles").update({ stato_registrazione: "approvato", ruolo_app: "player" }).eq("id", richiestaId);
    }
    await Promise.all([caricaGiocatori(), caricaRichiesteRegistrazione()]);
  };

  const rifiutaRegistrazione = async (richiestaId) => {
    await supabase.from("profiles").update({ stato_registrazione: "rifiutato" }).eq("id", richiestaId);
    await caricaRichiesteRegistrazione();
  };

  const completaRichiestaCancellazione = async (richiesta) => {
    await supabase.from("profiles").update({ rimosso: true }).eq("id", richiesta.playerId);
    await supabase
      .from("deletion_requests")
      .update({ completato: true, completato_il: new Date().toISOString() })
      .eq("id", richiesta.id);
    await Promise.all([caricaGiocatori(), caricaRichiesteCancellazione()]);
  };

  const richiediCancellazioneMiaAccount = async () => {
    if (!currentPlayerId) return;
    await supabase.from("deletion_requests").insert({ player_id: currentPlayerId });
    await caricaRichiesteCancellazione();
  };

  const promuoviRuolo = async (playerId, nuovoRuoloApp) => {
    await supabase.from("profiles").update({ ruolo_app: nuovoRuoloApp }).eq("id", playerId);
    await caricaGiocatori();
  };

  const modificaGiocatore = async (playerId, { name, soprannome, ruolo_campo }) => {
    const initials = name.trim().split(/\s+/).map((w) => w[0]).slice(0, 2).join("").toUpperCase();
    await supabase
      .from("profiles")
      .update({ name: name.trim(), soprannome: soprannome?.trim() || null, ruolo_campo, initials })
      .eq("id", playerId);
    await caricaGiocatori();
  };

  const eliminaGiocatoreOspite = async (playerId) => {
    await supabase.from("profiles").delete().eq("id", playerId);
    await caricaGiocatori();
  };

  const unisciGiocatori = async (idDaTenere, idDaEliminare) => {
    const { error } = await supabase.rpc("unisci_giocatori", { p_id_da_tenere: idDaTenere, p_id_da_eliminare: idDaEliminare });
    if (error) throw error;
    await Promise.all([caricaGiocatori(), caricaPartite(), caricaVoti()]);
  };

  const salvaProfilo = async ({ nome, soprannome, ruolo, fotoFile }) => {
    if (!myProfile) return;
    let foto_url = myProfile.foto_url;
    if (fotoFile) {
      const estensione = fotoFile.name.split(".").pop();
      const percorso = `${myProfile.id}-${Date.now()}.${estensione}`;
      const { error: erroreUpload } = await supabase.storage.from("foto-profilo").upload(percorso, fotoFile, { upsert: true });
      if (erroreUpload) throw erroreUpload;
      const { data } = supabase.storage.from("foto-profilo").getPublicUrl(percorso);
      foto_url = data.publicUrl;
    }
    const initials = nome.trim().split(/\s+/).map((w) => w[0]).slice(0, 2).join("").toUpperCase();
    const { error } = await supabase
      .from("profiles")
      .update({ name: nome.trim(), soprannome: soprannome.trim() || null, ruolo_campo: ruolo, initials, foto_url })
      .eq("id", myProfile.id);
    if (error) throw error;
    await Promise.all([caricaGiocatori(), ricaricaMioProfilo()]);
  };

  const cambiaEmail = async (nuovaEmail) => {
    const { error } = await supabase.auth.updateUser({ email: nuovaEmail });
    if (error) throw error;
  };

  const creaPartita = async ({ giorno, data, ora, campo }) => {
    await supabase.from("matches").insert({
      giorno,
      data,
      ora,
      campo,
      stato: "aperta",
      squadra_bianchi: [],
      squadra_neri: [],
      buche: [],
      gol: {},
    });
    await caricaPartite();
  };

  const salvaFormazione = async (matchId, squadraBianchi, squadraNeri) => {
    await supabase.from("matches").update({ squadra_bianchi: squadraBianchi, squadra_neri: squadraNeri }).eq("id", matchId);
    await caricaPartite();
  };

  const salvaRisultato = async (matchId, { bianchi, neri, gol, autogol, buche }) => {
    await supabase
      .from("matches")
      .update({
        risultato_bianchi: bianchi,
        risultato_neri: neri,
        gol,
        autogol,
        buche,
        stato: "storico",
      })
      .eq("id", matchId);
    await caricaPartite();
  };

  const eliminaPartita = async (matchId) => {
    await supabase.from("matches").delete().eq("id", matchId);
    await caricaPartite();
  };

  const inviaVoto = async (matchId, votatoId, voto) => {
    if (!currentPlayerId) return;
    await supabase
      .from("votes")
      .upsert({ match_id: matchId, votante_id: currentPlayerId, votato_id: votatoId, voto }, { onConflict: "match_id,votante_id,votato_id" });
  };

  const inviaVotoMvp = async (matchId, votatoId) => {
    if (!currentPlayerId) return;
    await supabase
      .from("voti_mvp")
      .upsert({ match_id: matchId, votante_id: currentPlayerId, votato_id: votatoId }, { onConflict: "match_id,votante_id" });
    await caricaVotiMvp();
  };

  const segnaGolPropri = async (matchId, numeroGol) => {
    const { error } = await supabase.rpc("aggiorna_gol_giocatore", { p_match_id: matchId, p_gol: numeroGol });
    if (error) throw error;
    await caricaPartite();
  };

  const golTotali = useMemo(() => golTotaliPerGiocatore(matches), [matches]);
  const autogolTotali = useMemo(() => autogolTotaliPerGiocatore(matches), [matches]);
  const bucheTotali = useMemo(() => bucheTotaliPerGiocatore(matches), [matches]);
  const votiRicevuti = useMemo(() => votiRicevutiPerGiocatore(voti), [voti]);
  const presenzeReali = useMemo(() => presenzeAssenzePerGiocatore(matches), [matches]);
  const mvpTotali = useMemo(() => {
    const tot = {};
    matches
      .filter((m) => m.stato === "storico")
      .forEach((m) => {
        const vincitore = calcolaMvp(m.id, votiMvp);
        if (vincitore?.id) tot[vincitore.id] = (tot[vincitore.id] || 0) + 1;
      });
    return tot;
  }, [matches, votiMvp]);

  const playersConGol = useMemo(
    () =>
      players.map((p) => {
        const buche = bucheTotali[p.id] || 0;
        const gol = golTotali[p.id] || 0;
        const autogol = autogolTotali[p.id] || 0;
        const votiP = votiRicevuti[p.id] || [];
        const media = mediaTroncata(votiP);
        const baseOverall = media != null ? media * 10 : p.overall;
        // Bonus/malus separato dal voto: +0.5 per gol segnato, -1 per autogol.
        const overall = Math.max(30, Math.min(99, Math.round(baseOverall + gol * 0.5 - autogol * 1)));
        const stat = presenzeReali[p.id] || { presenze: 0, assenze: 0 };
        const totalePartite = stat.presenze + stat.assenze;
        const affidabilita = totalePartite > 0 ? Math.round((stat.presenze / totalePartite) * 100) : p.affidabilita ?? 100;
        return {
          ...p,
          gol,
          buche,
          overall,
          mediaVoti: media,
          numeroVoti: votiP.length,
          presenze: stat.presenze,
          assenze: stat.assenze,
          affidabilita,
          mvp: mvpTotali[p.id] || 0,
        };
      }),
    [players, golTotali, autogolTotali, bucheTotali, votiRicevuti, presenzeReali, mvpTotali]
  );

  const giocatoriRimossi = useMemo(() => players.filter((p) => p.rimosso).map((p) => p.id), [players]);

  const tabsByRole = {
    player: [
      { id: "dashboard", label: "Dashboard" },
      { id: "squadra", label: "Squadra" },
      { id: "storico", label: "Storico" },
      { id: "voti", label: "Vota partita" },
    ],
    organizer: [
      { id: "dashboard", label: "Dashboard" },
      { id: "formazione", label: "Crea Partita" },
      { id: "risultato", label: "Risultato" },
      { id: "permessi", label: "Giocatori" },
      { id: "squadra", label: "Squadra" },
      { id: "storico", label: "Storico" },
      { id: "voti", label: "Vota partita" },
    ],
    coach: [
      { id: "dashboard", label: "Dashboard" },
      { id: "formazione", label: "Crea Partita" },
      { id: "squadra", label: "Squadra" },
      { id: "storico", label: "Storico" },
      { id: "voti", label: "Vota partita" },
    ],
  };

  const [activeTab, setActiveTab] = useState(() => localStorage.getItem("calcetto_activeTab") || "dashboard");
  const [confermaEsci, setConfermaEsci] = useState(false);

  useEffect(() => {
    localStorage.setItem("calcetto_activeTab", activeTab);
  }, [activeTab]);

  useEffect(() => {
    if (!myProfile) return;
    const tabValide = [...tabsByRole[role].map((t) => t.id), "chat", "mieidati"];
    if (!tabValide.includes(activeTab)) setActiveTab("dashboard");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [myProfile, role]);

  useEffect(() => {
    if (!confermaEsci) return;
    const t = setTimeout(() => setConfermaEsci(false), 3000);
    return () => clearTimeout(t);
  }, [confermaEsci]);
  const tabs = tabsByRole[role];

  const messaggiNonLetti = useMemo(() => {
    if (!ultimoVistoIl) return 0;
    return messaggi.filter((m) => new Date(m.creato_il) > new Date(ultimoVistoIl) && m.autore_id !== currentPlayerId).length;
  }, [messaggi, ultimoVistoIl, currentPlayerId]);

  useEffect(() => {
    if (activeTab === "chat" && messaggi.length > 0) {
      setUltimoVistoIl(messaggi[messaggi.length - 1].creato_il);
    }
  }, [activeTab, messaggi]);

  const handleRoleChange = (r) => {
    setRole(r);
    setActiveTab(tabsByRole[r][0].id);
  };

  if (session === undefined) {
    return (
      <div style={{ minHeight: "100%", background: COLORS.pitchDark, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <Spinner />
      </div>
    );
  }

  if (!session) {
    return <Onboarding onRegistrationSent={() => {}} />;
  }

  if (modalitaRecuperoPassword) {
    return <ImpostaNuovaPassword onImpostata={() => setModalitaRecuperoPassword(false)} />;
  }

  if (profileStatus === null) {
    return (
      <div style={{ minHeight: "100%", background: COLORS.pitchDark, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <Spinner />
      </div>
    );
  }

  if (profileStatus === "nessuno") {
    return (
      <SchermataStato
        icona="⚠️"
        titolo="Account senza profilo"
        testo="Il tuo accesso esiste ma non risulta collegato a nessun profilo. Contatta l'organizzatore per sistemarlo."
        onEsci={() => { localStorage.removeItem("calcetto_activeTab"); supabase.auth.signOut(); }}
      />
    );
  }

  if (profileStatus === "in_attesa") {
    return (
      <SchermataStato
        icona="⏳"
        titolo="In attesa di approvazione"
        testo="La tua registrazione è stata ricevuta. L'organizzatore deve approvarla prima che tu possa accedere all'app."
        onEsci={() => { localStorage.removeItem("calcetto_activeTab"); supabase.auth.signOut(); }}
      />
    );
  }

  if (profileStatus === "rifiutato") {
    return (
      <SchermataStato
        icona="✕"
        titolo="Richiesta non approvata"
        testo="L'organizzatore non ha approvato questa registrazione. Contattalo direttamente se pensi sia un errore."
        onEsci={() => { localStorage.removeItem("calcetto_activeTab"); supabase.auth.signOut(); }}
      />
    );
  }

  return (
    <div
      style={{
        minHeight: "100%",
        background: `radial-gradient(circle at 20% 0%, ${COLORS.pitchMid}, ${COLORS.pitchDark} 60%)`,
        padding: "22px 20px 40px",
        fontFamily: "Inter, sans-serif",
      }}
    >
      <style>{FONT_IMPORT}</style>

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 26, flexWrap: "wrap", gap: 14, position: "relative", zIndex: 60 }}>
        <div>
          <div style={{ fontFamily: "Barlow Condensed, sans-serif", fontWeight: 800, fontSize: 26, color: COLORS.chalk, letterSpacing: 0.4 }}>
            ⚽ CALCETTO MARTEDÌ & GIOVEDÌ
          </div>
          <div style={{ fontSize: 12, color: COLORS.chalkDim }}>Gestione partite, formazioni, risultati e voti</div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <button
            onClick={() => setActiveTab("chat")}
            title="Chat"
            aria-label="Chat"
            style={{
              position: "relative", background: "none", border: `1px solid rgba(255,255,255,0.15)`, borderRadius: 8,
              color: activeTab === "chat" ? COLORS.floodlight : COLORS.chalkDim, fontSize: 15, width: 32, height: 32,
              display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer",
            }}
          >
            💬
            {messaggiNonLetti > 0 && (
              <span
                style={{
                  position: "absolute", top: -4, right: -4, background: COLORS.red, color: COLORS.chalk,
                  borderRadius: 999, fontSize: 9.5, fontFamily: "Inter, sans-serif", fontWeight: 700,
                  minWidth: 15, height: 15, display: "flex", alignItems: "center", justifyContent: "center", padding: "0 3px",
                }}
              >
                {messaggiNonLetti > 9 ? "9+" : messaggiNonLetti}
              </span>
            )}
          </button>

          <div style={{ width: 1, height: 22, background: "rgba(255,255,255,0.12)", margin: "0 4px" }} />

          <button
            onClick={() => setActiveTab("mieidati")}
            title="I miei dati"
            aria-label="I miei dati"
            style={{
              background: "none", border: `1px solid rgba(255,255,255,0.15)`, borderRadius: 8,
              color: activeTab === "mieidati" ? COLORS.floodlight : COLORS.chalkDim, fontSize: 15, width: 32, height: 32,
              display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer",
            }}
          >
            🪪
          </button>

          <div style={{ width: 1, height: 22, background: "rgba(255,255,255,0.12)", margin: "0 4px" }} />

          {sonoOrganizzatore || sonoAllenatore ? (
            <RoleSwitcher
              role={role}
              setRole={handleRoleChange}
              opzioni={
                sonoOrganizzatore
                  ? [{ id: "player", label: "Vista Giocatore (demo)", icon: "👤" }, { id: "organizer", label: "Vista Organizzatore (demo)", icon: "🛠️" }]
                  : [{ id: "player", label: "Vista Giocatore (demo)", icon: "👤" }, { id: "coach", label: "Vista Allenatore (demo)", icon: "📣" }]
              }
            />
          ) : (
            <span style={chip("rgba(76,175,109,0.15)", COLORS.green)}>Giocatore</span>
          )}

          <div style={{ width: 1, height: 22, background: "rgba(255,255,255,0.12)", margin: "0 4px" }} />

          <button
            onClick={() => {
              if (confermaEsci) {
                localStorage.removeItem("calcetto_activeTab");
                supabase.auth.signOut();
              } else {
                setConfermaEsci(true);
              }
            }}
            title={confermaEsci ? "Tocca di nuovo per confermare" : "Esci"}
            aria-label="Esci"
            style={{
              background: confermaEsci ? COLORS.red : "none",
              border: `1px solid ${confermaEsci ? COLORS.red : "rgba(255,255,255,0.15)"}`,
              borderRadius: 8,
              color: confermaEsci ? COLORS.chalk : COLORS.chalkDim,
              fontSize: confermaEsci ? 10.5 : 15,
              fontFamily: "Inter, sans-serif", fontWeight: 700,
              width: confermaEsci ? 62 : 32, height: 32, display: "flex",
              alignItems: "center", justifyContent: "center", cursor: "pointer",
              transition: "width .15s ease",
            }}
          >
            {confermaEsci ? "Conferma" : "🚪"}
          </button>
        </div>
      </div>

      <Tabs tabs={tabs} active={activeTab} setActive={setActiveTab} badges={{ chat: messaggiNonLetti }} />

      <div key={activeTab} className="fade-in">
      {activeTab === "dashboard" && (
        <Dashboard
          players={playersConGol}
          matches={matches}
          currentPlayerId={currentPlayerId}
          voti={voti}
          rimossi={giocatoriRimossi}
          sonoOrganizzatore={sonoOrganizzatore || sonoAllenatore}
          onVaiACreaPartita={() => {
            setRole(sonoOrganizzatore ? "organizer" : "coach");
            setActiveTab("formazione");
          }}
        />
      )}
      {activeTab === "squadra" && <Squadra players={playersConGol} rimossi={giocatoriRimossi} matches={matches} voti={voti} />}
      {activeTab === "storico" && <Storico players={playersConGol} matches={matches} rimossi={giocatoriRimossi} voti={voti} votiMvp={votiMvp} />}
      {activeTab === "voti" && (
        <Votazione players={playersConGol} matches={matches} currentPlayerId={currentPlayerId} onVota={inviaVoto} onSegnaGolPropri={segnaGolPropri} votiMvp={votiMvp} onVotaMvp={inviaVotoMvp} />
      )}
      {(role === "organizer" || role === "coach") && activeTab === "formazione" && (
        <Formazione players={playersConGol} matches={matches} onSalvaFormazione={salvaFormazione} onCreaPartita={creaPartita} onAggiungiGiocatore={aggiungiGiocatore} />
      )}
      {role === "organizer" && activeTab === "risultato" && (
        <Risultato players={playersConGol} matches={matches} onSalvaRisultato={salvaRisultato} onEliminaPartita={eliminaPartita} voti={voti} />
      )}
      {role === "organizer" && activeTab === "permessi" && (
        <Admin
          players={playersConGol}
          richieste={richiesteCancellazione}
          rimossi={giocatoriRimossi}
          onCompletaRichiesta={(richiesta) => completaRichiestaCancellazione(richiesta)}
          onAggiungiGiocatore={aggiungiGiocatore}
          onPromuoviRuolo={promuoviRuolo}
          onModificaGiocatore={modificaGiocatore}
          onEliminaGiocatoreOspite={eliminaGiocatoreOspite}
          onUnisciGiocatori={unisciGiocatori}
          richiesteRegistrazione={richiesteRegistrazione}
          onApprovaRegistrazione={approvaRegistrazione}
          onRifiutaRegistrazione={rifiutaRegistrazione}
        />
      )}
      {activeTab === "chat" && (
        <ChatInterna
          messaggi={messaggi}
          players={playersConGol}
          currentPlayerId={currentPlayerId}
          onInvia={inviaMessaggio}
          onElimina={eliminaMessaggio}
        />
      )}
      {activeTab === "mieidati" && (
        <MieiDati
          consensi={consensi}
          richiestaInviata={richiesteCancellazione.some((r) => r.playerId === currentPlayerId)}
          onRichiediCancellazione={richiediCancellazioneMiaAccount}
          myProfile={myProfile}
          session={session}
          onSalvaProfilo={salvaProfilo}
          onCambiaEmail={cambiaEmail}
        />
      )}
      </div>
    </div>
  );
}
