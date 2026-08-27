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

const FONT_IMPORT = `@import url('https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@500;600;700;800&family=Inter:wght@400;500;600;700&family=IBM+Plex+Mono:wght@500;600&display=swap');`;

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

/* ---------------------------------------------------------
   SQUADRA CHIP (bianchi/neri)
--------------------------------------------------------- */
function SquadraBadge({ tipo }) {
  const bianchi = tipo === "bianchi";
  return (
    <span
      style={{
        ...chip(bianchi ? COLORS.bianchi : COLORS.neri, bianchi ? COLORS.pitchDark : COLORS.chalk),
        border: bianchi ? `1px solid rgba(0,0,0,0.15)` : `1px solid rgba(255,255,255,0.15)`,
        fontWeight: 700,
      }}
    >
      {bianchi ? "⚪ BIANCHI" : "⚫ NERI"}
    </span>
  );
}

/* ---------------------------------------------------------
   PLAYER CARD (figurina)
--------------------------------------------------------- */
function PlayerCard({ p, onClick, selected }) {
  return (
    <div
      onClick={onClick}
      style={{
        position: "relative",
        width: 168,
        borderRadius: 16,
        padding: 2,
        cursor: onClick ? "pointer" : "default",
        background: selected
          ? `linear-gradient(160deg, ${COLORS.floodlight}, #7a5b12)`
          : `linear-gradient(160deg, #3a4a5c, #16233D)`,
        boxShadow: selected ? `0 0 0 2px ${COLORS.floodlight}` : "0 4px 14px rgba(0,0,0,0.35)",
        transition: "transform .15s ease",
      }}
    >
      <div
        style={{
          background: `linear-gradient(165deg, ${COLORS.navy} 0%, #0c1424 100%)`,
          borderRadius: 14,
          padding: "14px 12px 12px",
          fontFamily: "Inter, sans-serif",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div
            style={{
              fontFamily: "IBM Plex Mono, monospace",
              fontSize: 26,
              fontWeight: 600,
              color: COLORS.floodlight,
              lineHeight: 1,
            }}
          >
            {p.overall}
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: 9, color: COLORS.chalkDim, textTransform: "uppercase", letterSpacing: 0.6 }}>
              {p.role}
            </div>
            {p.ospite && (
              <div style={{ fontSize: 8, color: COLORS.red, textTransform: "uppercase", letterSpacing: 0.5, fontWeight: 700, marginTop: 2 }}>
                Ospite
              </div>
            )}
          </div>
        </div>

        <div
          style={{
            width: 72,
            height: 72,
            borderRadius: "50%",
            background: p.colore,
            margin: "10px auto 8px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontFamily: "Barlow Condensed, sans-serif",
            fontWeight: 700,
            fontSize: 26,
            color: COLORS.chalk,
            border: `2px solid rgba(255,255,255,0.15)`,
          }}
        >
          {p.initials}
        </div>

        <div
          style={{
            fontFamily: "Barlow Condensed, sans-serif",
            fontWeight: 600,
            fontSize: 16,
            color: COLORS.chalk,
            textAlign: "center",
            marginBottom: 10,
            letterSpacing: 0.3,
          }}
        >
          {p.name}
        </div>

        {/* Affidabilita gauge */}
        <div style={{ marginBottom: 8 }}>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 9, color: COLORS.chalkDim, marginBottom: 2 }}>
            <span>AFFIDABILITÀ</span>
            <span style={{ color: affidabilitaColor(p.affidabilita), fontWeight: 700 }}>{p.affidabilita}%</span>
          </div>
          <div style={{ height: 5, background: "rgba(255,255,255,0.08)", borderRadius: 3, overflow: "hidden" }}>
            <div style={{ height: "100%", width: `${p.affidabilita}%`, background: affidabilitaColor(p.affidabilita) }} />
          </div>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4, 1fr)",
            gap: 4,
            fontSize: 9.5,
            color: COLORS.chalkDim,
            fontFamily: "IBM Plex Mono, monospace",
            marginTop: 8,
            textAlign: "center",
            borderTop: "1px solid rgba(255,255,255,0.08)",
            paddingTop: 8,
          }}
        >
          <div><div style={{ color: COLORS.chalk, fontWeight: 600 }}>{p.presenze}</div>PRES</div>
          <div><div style={{ color: COLORS.chalk, fontWeight: 600 }}>{p.assenze}</div>ASS</div>
          <div><div style={{ color: COLORS.floodlight, fontWeight: 600 }}>{p.gol ?? 0}</div>GOL</div>
          <div><div style={{ color: COLORS.chalk, fontWeight: 600 }}>{p.mvp}</div>MVP</div>
        </div>
      </div>
    </div>
  );
}

/* ---------------------------------------------------------
   ROLE SWITCHER
--------------------------------------------------------- */
function RoleSwitcher({ role, setRole }) {
  const roles = [
    { id: "player", label: "Giocatore" },
    { id: "organizer", label: "Organizzatore" },
  ];
  return (
    <div style={{ display: "flex", gap: 6, background: "rgba(0,0,0,0.25)", padding: 4, borderRadius: 10 }}>
      {roles.map((r) => (
        <button
          key={r.id}
          onClick={() => setRole(r.id)}
          style={{
            border: "none",
            cursor: "pointer",
            padding: "7px 14px",
            borderRadius: 7,
            fontFamily: "Inter, sans-serif",
            fontWeight: 600,
            fontSize: 12.5,
            letterSpacing: 0.2,
            background: role === r.id ? COLORS.floodlight : "transparent",
            color: role === r.id ? COLORS.pitchDark : COLORS.chalkDim,
            transition: "all .15s ease",
          }}
        >
          {r.label}
        </button>
      ))}
    </div>
  );
}

/* ---------------------------------------------------------
   SECTION TABS
--------------------------------------------------------- */
function Tabs({ tabs, active, setActive }) {
  return (
    <div style={{ display: "flex", gap: 22, borderBottom: `1px solid ${COLORS.pitchLine}`, marginBottom: 20, flexWrap: "wrap" }}>
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
          }}
        >
          {t.label}
        </button>
      ))}
    </div>
  );
}

/* ---------------------------------------------------------
   DASHBOARD (giocatore)
--------------------------------------------------------- */
function Dashboard({ players, matches, currentPlayerId }) {
  const match = matches.find((m) => m.stato === "aperta");
  const me = players.find((p) => p.id === currentPlayerId);

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
        style={{
          background: `linear-gradient(120deg, ${COLORS.pitchMid}, ${COLORS.pitchDark})`,
          borderRadius: 16,
          padding: 22,
          border: `1px solid ${COLORS.pitchLine}`,
          marginBottom: 24,
        }}
      >
        {match ? (
          <>
            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <div style={chip("rgba(255,200,87,0.15)", COLORS.floodlight)}>{match.giorno.toUpperCase()}</div>
              {miaSquadra && <SquadraBadge tipo={miaSquadra} />}
            </div>
            <div style={{ fontFamily: "Barlow Condensed, sans-serif", fontWeight: 800, fontSize: 30, color: COLORS.chalk, marginTop: 10 }}>
              {match.data} · {match.ora}
            </div>
            <div style={{ fontFamily: "Inter, sans-serif", color: COLORS.chalkDim, fontSize: 14, marginTop: 2, marginBottom: 4 }}>
              📍 {match.campo}
            </div>
            <div style={{ fontSize: 11.5, color: COLORS.chalkDim, marginTop: 14, fontFamily: "Inter, sans-serif" }}>
              {miaSquadra
                ? "Le formazioni verranno inoltrate nel gruppo WhatsApp dall'organizzatore."
                : "L'organizzatore non ha ancora composto le squadre per questa partita."}
            </div>
          </>
        ) : (
          <div style={{ fontFamily: "Inter, sans-serif", color: COLORS.chalkDim, fontSize: 13.5 }}>
            Nessuna partita in programma al momento. L'organizzatore ne creerà una a breve.
          </div>
        )}
      </div>

      {me && (
        <>
          <div style={{ fontFamily: "Barlow Condensed, sans-serif", fontWeight: 700, fontSize: 20, color: COLORS.chalk, marginBottom: 10 }}>
            La tua figurina
          </div>
          <PlayerCard p={me} />
        </>
      )}
    </div>
  );
}

/* ---------------------------------------------------------
   SQUADRA (grid figurine)
--------------------------------------------------------- */
function Squadra({ players, rimossi = [] }) {
  const attivi = players.filter((p) => !rimossi.includes(p.id));
  return (
    <div>
      <div style={{ fontFamily: "Barlow Condensed, sans-serif", fontWeight: 700, fontSize: 20, color: COLORS.chalk, marginBottom: 14 }}>
        Rosa · {attivi.length} giocatori
      </div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 16 }}>
        {[...attivi].sort((a, b) => b.overall - a.overall).map((p) => (
          <PlayerCard key={p.id} p={p} />
        ))}
      </div>
    </div>
  );
}

/* ---------------------------------------------------------
   STORICO PARTITE
--------------------------------------------------------- */
function Storico({ players, matches, rimossi = [] }) {
  const passate = matches
    .filter((m) => m.stato === "storico" && m.risultato)
    .sort((a, b) => b.id - a.id);

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
          return (
            <div key={m.id} style={{ background: COLORS.navy, borderRadius: 12, padding: "16px 18px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 10 }}>
                <div>
                  <div style={chip("rgba(255,255,255,0.08)", COLORS.chalkDim)}>{m.giorno.toUpperCase()} · {m.data}</div>
                </div>
                {m.mvp && (
                  <span style={chip("rgba(255,200,87,0.15)", COLORS.floodlight)}>🏅 MVP: {nomeById(players, m.mvp, rimossi)}</span>
                )}
              </div>

              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 18, margin: "16px 0" }}>
                <div style={{ textAlign: "right", flex: 1 }}>
                  <SquadraBadge tipo="bianchi" />
                  <div style={{ fontFamily: "Inter, sans-serif", fontSize: 11.5, color: COLORS.chalkDim, marginTop: 6, lineHeight: 1.6 }}>
                    {m.squadraBianchi.map((id) => nomeById(players, id, rimossi)).join(" · ")}
                  </div>
                </div>
                <div
                  style={{
                    fontFamily: "IBM Plex Mono, monospace",
                    fontSize: 30,
                    fontWeight: 600,
                    color: COLORS.chalk,
                    whiteSpace: "nowrap",
                    padding: "0 6px",
                  }}
                >
                  {m.risultato.bianchi} — {m.risultato.neri}
                </div>
                <div style={{ textAlign: "left", flex: 1 }}>
                  <SquadraBadge tipo="neri" />
                  <div style={{ fontFamily: "Inter, sans-serif", fontSize: 11.5, color: COLORS.chalkDim, marginTop: 6, lineHeight: 1.6 }}>
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
function Votazione({ players, matches, currentPlayerId, onVota }) {
  const partite = matches.filter((m) => m.stato === "storico").sort((a, b) => new Date(b.data) - new Date(a.data));
  const match = partite[0];
  const partecipantiIds = match
    ? [...match.squadraBianchi, ...match.squadraNeri].filter((id) => !match.buche.includes(id) && id !== currentPlayerId)
    : [];
  const compagni = players.filter((p) => partecipantiIds.includes(p.id));

  const [votiEsistenti, setVotiEsistenti] = useState([]);
  const [caricato, setCaricato] = useState(false);
  const [voti, setVoti] = useState({});
  const [inviati, setInviati] = useState({});
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
  };

  if (!caricato) {
    return <div style={{ color: COLORS.chalkDim, fontFamily: "Inter, sans-serif", fontSize: 13 }}>Caricamento…</div>;
  }

  if (!match) {
    return <div style={{ color: COLORS.chalkDim, fontFamily: "Inter, sans-serif", fontSize: 13 }}>Nessuna partita ancora conclusa da votare.</div>;
  }

  return (
    <div>
      <div style={{ fontFamily: "Barlow Condensed, sans-serif", fontWeight: 700, fontSize: 20, color: COLORS.chalk, marginBottom: 4 }}>
        Vota i compagni · {match.giorno} {match.data}
      </div>
      <div style={{ fontFamily: "Inter, sans-serif", fontSize: 13, color: COLORS.chalkDim, marginBottom: 18 }}>
        Voti anonimi da 1 a 10. La media finale esclude il voto più alto e più basso ricevuti.
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {compagni.length === 0 && (
          <div style={{ color: COLORS.chalkDim, fontFamily: "Inter, sans-serif", fontSize: 13 }}>Nessun compagno da votare per questa partita.</div>
        )}
        {compagni.map((p) => {
          const val = voti[p.id] ?? 6;
          const anomalia = scartoAnomalo(p.id, val);
          const done = inviati[p.id];
          const inCorso = invioInCorso[p.id];
          return (
            <div
              key={p.id}
              style={{
                background: COLORS.navy,
                border: `1px solid ${anomalia && !done ? COLORS.red : "rgba(255,255,255,0.08)"}`,
                borderRadius: 12,
                padding: "14px 16px",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div
                    style={{
                      width: 34, height: 34, borderRadius: "50%", background: p.colore,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontFamily: "Barlow Condensed, sans-serif", fontWeight: 700, fontSize: 13, color: COLORS.chalk,
                    }}
                  >
                    {p.initials}
                  </div>
                  <div style={{ fontFamily: "Inter, sans-serif", fontWeight: 600, fontSize: 14.5, color: COLORS.chalk }}>
                    {p.name}
                  </div>
                </div>
                {done ? (
                  <span style={chip("rgba(76,175,109,0.15)", COLORS.green)}>Voto inviato ✓</span>
                ) : (
                  <span style={{ fontFamily: "IBM Plex Mono, monospace", fontSize: 20, fontWeight: 600, color: COLORS.floodlight }}>
                    {val.toFixed(1)}
                  </span>
                )}
              </div>

              {!done && (
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
                  <button
                    onClick={() => invia(p.id, val)}
                    disabled={inCorso}
                    style={{
                      marginTop: 10,
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
                    {inCorso ? "Invio…" : anomalia ? "Conferma comunque" : "Invia voto"}
                  </button>
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
function Risultato({ players, matches, onSalvaRisultato }) {
  const match = matches.find((m) => m.stato === "aperta");
  const [bianchi, setBianchi] = useState(0);
  const [neri, setNeri] = useState(0);
  const [gol, setGol] = useState({});
  const [mvp, setMvp] = useState(null);
  const [buche, setBuche] = useState([]);
  const [salvataggioInCorso, setSalvataggioInCorso] = useState(false);
  const [salvato, setSalvato] = useState(false);

  const partecipantiIds = match ? [...match.squadraBianchi, ...match.squadraNeri] : [];
  const partecipanti = players.filter((p) => partecipantiIds.includes(p.id));

  const setGolGiocatore = (id, n) => setGol((g) => ({ ...g, [id]: Math.max(0, n) }));

  const toggleBuca = (id) => {
    setBuche((b) => (b.includes(id) ? b.filter((x) => x !== id) : [...b, id]));
    setGol((g) => ({ ...g, [id]: 0 }));
    if (mvp === id) setMvp(null);
  };

  const totaleGolInseriti = Object.values(gol).reduce((a, b) => a + b, 0);

  const salva = async () => {
    setSalvataggioInCorso(true);
    await onSalvaRisultato(match.id, { bianchi, neri, gol, mvp, buche });
    setSalvataggioInCorso(false);
    setSalvato(true);
  };

  if (!match) return <div style={{ color: COLORS.chalkDim, fontFamily: "Inter, sans-serif", fontSize: 13 }}>Nessuna partita aperta al momento. Crea prima una partita nella tab Formazione.</div>;

  if (partecipanti.length === 0) {
    return (
      <div style={{ color: COLORS.chalkDim, fontFamily: "Inter, sans-serif", fontSize: 13 }}>
        Prima componi le squadre nella tab Formazione, poi torna qui per registrare il risultato.
      </div>
    );
  }

  return (
    <div>
      <div style={{ fontFamily: "Barlow Condensed, sans-serif", fontWeight: 700, fontSize: 20, color: COLORS.chalk, marginBottom: 4 }}>
        Registra risultato · {match.giorno} {match.data}
      </div>
      <div style={{ fontFamily: "Inter, sans-serif", fontSize: 13, color: COLORS.chalkDim, marginBottom: 18 }}>
        I gol assegnati si sommano automaticamente allo storico e alla figurina di ogni giocatore. Segnala chi ha dato buca: pesa sulla sua affidabilità più di una semplice assenza. Salvando, la partita passa allo storico e si apre per le votazioni.
      </div>

      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 18, marginBottom: 22 }}>
        <div style={{ textAlign: "center" }}>
          <SquadraBadge tipo="bianchi" />
          <input
            type="number" min={0} value={bianchi}
            onChange={(e) => setBianchi(parseInt(e.target.value) || 0)}
            style={{
              display: "block", width: 64, marginTop: 8, textAlign: "center",
              background: COLORS.navy, border: `1px solid rgba(255,255,255,0.15)`, borderRadius: 8,
              color: COLORS.chalk, fontFamily: "IBM Plex Mono, monospace", fontSize: 22, padding: "6px 0",
            }}
          />
        </div>
        <div style={{ color: COLORS.chalkDim, fontFamily: "IBM Plex Mono, monospace", fontSize: 20 }}>—</div>
        <div style={{ textAlign: "center" }}>
          <SquadraBadge tipo="neri" />
          <input
            type="number" min={0} value={neri}
            onChange={(e) => setNeri(parseInt(e.target.value) || 0)}
            style={{
              display: "block", width: 64, marginTop: 8, textAlign: "center",
              background: COLORS.navy, border: `1px solid rgba(255,255,255,0.15)`, borderRadius: 8,
              color: COLORS.chalk, fontFamily: "IBM Plex Mono, monospace", fontSize: 22, padding: "6px 0",
            }}
          />
        </div>
      </div>

      <div style={{ fontFamily: "Barlow Condensed, sans-serif", fontWeight: 700, fontSize: 16, color: COLORS.chalk, marginBottom: 10 }}>
        Presenze e gol <span style={{ color: COLORS.chalkDim, fontSize: 13, fontFamily: "Inter, sans-serif" }}>(totale gol inserito: {totaleGolInseriti})</span>
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
                <div
                  style={{
                    width: 28, height: 28, borderRadius: "50%", background: p.colore,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontFamily: "Barlow Condensed, sans-serif", fontWeight: 700, fontSize: 10.5, color: COLORS.chalk,
                  }}
                >
                  {p.initials}
                </div>
                <span style={{ fontFamily: "Inter, sans-serif", fontWeight: 600, fontSize: 13.5, color: COLORS.chalk, textDecoration: haDatoBuca ? "line-through" : "none" }}>
                  {p.name}
                </span>
                {!haDatoBuca && (
                  <button
                    onClick={() => setMvp(p.id)}
                    title="Segna come MVP"
                    style={{
                      border: "none", background: "none", cursor: "pointer", fontSize: 14,
                      filter: mvp === p.id ? "none" : "grayscale(1) opacity(0.4)",
                    }}
                  >
                    🏅
                  </button>
                )}
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
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <button
                      onClick={() => setGolGiocatore(p.id, (gol[p.id] || 0) - 1)}
                      style={{ width: 24, height: 24, borderRadius: 6, border: `1px solid rgba(255,255,255,0.15)`, background: "transparent", color: COLORS.chalk, cursor: "pointer" }}
                    >
                      −
                    </button>
                    <span style={{ fontFamily: "IBM Plex Mono, monospace", fontSize: 15, color: COLORS.floodlight, width: 16, textAlign: "center" }}>
                      {gol[p.id] || 0}
                    </span>
                    <button
                      onClick={() => setGolGiocatore(p.id, (gol[p.id] || 0) + 1)}
                      style={{ width: 24, height: 24, borderRadius: 6, border: `1px solid rgba(255,255,255,0.15)`, background: "transparent", color: COLORS.chalk, cursor: "pointer" }}
                    >
                      +
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <button
        onClick={salva}
        disabled={salvataggioInCorso || salvato}
        style={{
          padding: "10px 18px", borderRadius: 9, border: "none", cursor: salvataggioInCorso || salvato ? "not-allowed" : "pointer",
          fontFamily: "Inter, sans-serif", fontWeight: 700, fontSize: 13,
          background: COLORS.floodlight, color: COLORS.pitchDark,
        }}
      >
        {salvato ? "✓ Risultato salvato" : salvataggioInCorso ? "Salvataggio…" : "Salva risultato"}
      </button>
    </div>
  );
}

/* ---------------------------------------------------------
   FORMAZIONE — scelta squadre + generazione immagine da condividere
--------------------------------------------------------- */
function Formazione({ players, matches, onSalvaFormazione, onCreaPartita }) {
  const match = matches.find((m) => m.stato === "aperta");
  const canvasRef = useRef(null);

  const [squadre, setSquadre] = useState({});
  const [salvataggioInCorso, setSalvataggioInCorso] = useState(false);
  const [salvato, setSalvato] = useState(false);

  const [nuovoGiorno, setNuovoGiorno] = useState("Giovedì");
  const [nuovaData, setNuovaData] = useState("");
  const [nuovaOra, setNuovaOra] = useState("21:00");
  const [nuovoCampo, setNuovoCampo] = useState("Centro Sportivo San Siro");
  const [creazioneInCorso, setCreazioneInCorso] = useState(false);

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
    ctx.fillText(`${match.giorno.toUpperCase()} ${match.data}`, W / 2, 180);
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
                  color: COLORS.chalk, fontFamily: "Inter, sans-serif", fontSize: 13.5,
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
                  color: COLORS.chalk, fontFamily: "Inter, sans-serif", fontSize: 13.5,
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
                  color: COLORS.chalk, fontFamily: "Inter, sans-serif", fontSize: 13.5,
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
                  color: COLORS.chalk, fontFamily: "Inter, sans-serif", fontSize: 13.5,
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
        Formazione · {match.giorno} {match.data}
      </div>
      <div style={{ fontFamily: "Inter, sans-serif", fontSize: 13, color: COLORS.chalkDim, marginBottom: 18 }}>
        Tocca un giocatore per assegnarlo a Bianchi, Neri o escluderlo dalla partita. Salva, poi scarica l'immagine e inoltrala dal tuo WhatsApp.
      </div>

      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 22 }}>
        {players.map((p) => {
          const stato = squadre[p.id] || "escluso";
          const bg = stato === "bianchi" ? COLORS.bianchi : stato === "neri" ? COLORS.neri : "rgba(255,255,255,0.06)";
          const color = stato === "bianchi" ? COLORS.pitchDark : stato === "neri" ? COLORS.chalk : COLORS.chalkDim;
          const border = stato === "neri" ? "1px solid rgba(255,255,255,0.2)" : "1px solid transparent";
          return (
            <button
              key={p.id}
              onClick={() => toggle(p.id)}
              style={{
                padding: "8px 14px", borderRadius: 999, border, cursor: "pointer",
                fontFamily: "Inter, sans-serif", fontWeight: 600, fontSize: 13, background: bg, color,
              }}
            >
              {stato === "bianchi" ? "⚪" : stato === "neri" ? "⚫" : "—"} {p.name}
            </button>
          );
        })}
      </div>

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
function Admin({ players, richieste, onCompletaRichiesta, rimossi = [], onAggiungiGiocatore, richiesteRegistrazione = [], onApprovaRegistrazione, onRifiutaRegistrazione, onPromuoviRuolo }) {
  const roleOptions = ["organizer", "player"];
  const roleLabel = { organizer: "Organizzatore", player: "Giocatore" };
  const roleColor = { organizer: COLORS.floodlight, player: COLORS.green };
  const ruoliCampo = ["Portiere", "Difensore", "Centrocampo", "Attaccante"];

  const [nomeNuovo, setNomeNuovo] = useState("");
  const [ruoloNuovo, setRuoloNuovo] = useState("Centrocampo");
  const [collegamentoScelto, setCollegamentoScelto] = useState({});

  const ospitiDisponibili = players.filter((p) => p.ospite);

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
                        color: COLORS.chalk, fontFamily: "Inter, sans-serif", fontSize: 12.5,
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
                color: COLORS.chalk, fontFamily: "Inter, sans-serif", fontSize: 13.5,
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
                color: COLORS.chalk, fontFamily: "Inter, sans-serif", fontSize: 13.5,
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

      <div style={{ fontFamily: "Barlow Condensed, sans-serif", fontWeight: 700, fontSize: 20, color: COLORS.chalk, marginBottom: 4 }}>
        Gestione permessi
      </div>
      <div style={{ fontFamily: "Inter, sans-serif", fontSize: 13, color: COLORS.chalkDim, marginBottom: 18 }}>
        Assegna i ruoli. Un utente può avere più ruoli contemporaneamente.
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {players.filter((p) => !rimossi.includes(p.id)).map((p) => (
          <div
            key={p.id}
            style={{
              background: COLORS.navy,
              borderRadius: 10,
              padding: "10px 14px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              flexWrap: "wrap",
              gap: 8,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div
                style={{
                  width: 30, height: 30, borderRadius: "50%", background: p.colore,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontFamily: "Barlow Condensed, sans-serif", fontWeight: 700, fontSize: 11.5, color: COLORS.chalk,
                }}
              >
                {p.initials}
              </div>
              <span style={{ fontFamily: "Inter, sans-serif", fontWeight: 600, fontSize: 14, color: COLORS.chalk }}>
                {p.name}
              </span>
              {p.ospite && <span style={chip("rgba(229,83,60,0.15)", COLORS.red)}>Ospite</span>}
            </div>
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
          </div>
        ))}
      </div>
    </div>
  );
}

/* ---------------------------------------------------------
   I MIEI DATI — riepilogo consensi e cancellazione
--------------------------------------------------------- */
function MieiDati({ consensi, richiestaInviata, onRichiediCancellazione }) {
  const righe = [
    { label: "Trattamento dati (presenze, voti, statistiche)", val: consensi?.consensoDati },
    { label: "Utilizzo foto per la figurina", val: consensi?.consensoFoto },
    { label: "Conferma maggiore età", val: consensi?.maggiorenne },
    ...(consensi?.metodo === "google"
      ? [{ label: "Importazione foto profilo Google", val: consensi?.importaFotoGoogle }]
      : []),
  ];

  return (
    <div>
      <div style={{ fontFamily: "Barlow Condensed, sans-serif", fontWeight: 700, fontSize: 20, color: COLORS.chalk, marginBottom: 4 }}>
        I miei dati
      </div>
      <div style={{ fontFamily: "Inter, sans-serif", fontSize: 13, color: COLORS.chalkDim, marginBottom: 20 }}>
        Consensi forniti in fase di registrazione{consensi?.timestamp ? ` · ${consensi.timestamp}` : ""} · accesso con {consensi?.metodo === "google" ? "Google" : "email e password"}
      </div>

      <div style={{ background: COLORS.navy, borderRadius: 12, padding: 6, marginBottom: 22 }}>
        {righe.map((r, i) => (
          <div
            key={r.label}
            style={{
              display: "flex", alignItems: "center", justifyContent: "space-between",
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
  const [metodo, setMetodo] = useState(null); // "google" | "email"
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  const [consensoDati, setConsensoDati] = useState(false);
  const [consensoFoto, setConsensoFoto] = useState(false);
  const [maggiorenne, setMaggiorenne] = useState(false);
  const [importaFotoGoogle, setImportaFotoGoogle] = useState(false);
  const [infoAperta, setInfoAperta] = useState(false);

  const [caricamento, setCaricamento] = useState(false);
  const [errore, setErrore] = useState("");

  const puoConfermare = consensoDati && consensoFoto && maggiorenne;

  const scegliMetodo = (m) => {
    if (m === "google") {
      setErrore("Il login con Google non è ancora attivo per questo gruppo. Usa l'email per ora.");
      return;
    }
    setErrore("");
    setMetodo(m);
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
                  color: COLORS.chalk, fontFamily: "Inter, sans-serif", fontSize: 13.5,
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
                  color: COLORS.chalk, fontFamily: "Inter, sans-serif", fontSize: 13.5,
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
          </div>
        )}

        {step === "welcome" && mode === "register" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <ErroreBox />
            <button
              onClick={() => scegliMetodo("google")}
              style={{
                display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
                padding: "12px 0", borderRadius: 10, border: "1px solid rgba(255,255,255,0.15)",
                background: COLORS.chalk, color: "#1a1a1a", fontFamily: "Inter, sans-serif", fontWeight: 700, fontSize: 14, cursor: "pointer",
              }}
            >
              <span style={{ fontSize: 16 }}>G</span> Continua con Google
            </button>
            <div style={{ textAlign: "center", fontSize: 11, color: COLORS.chalkDim, margin: "2px 0" }}>oppure</div>
            <button
              onClick={() => scegliMetodo("email")}
              style={{
                padding: "12px 0", borderRadius: 10, border: "1px solid rgba(255,255,255,0.2)",
                background: "rgba(255,255,255,0.06)", color: COLORS.chalk, fontFamily: "Inter, sans-serif", fontWeight: 700, fontSize: 14, cursor: "pointer",
              }}
            >
              ✉️ Registrati con email
            </button>
          </div>
        )}

        {step === "form" && metodo === "email" && (
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
                    color: COLORS.chalk, fontFamily: "Inter, sans-serif", fontSize: 13.5,
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
  const [datiCaricati, setDatiCaricati] = useState(false);

  const currentPlayerId = myProfile?.id;
  const sonoOrganizzatore = myProfile?.ruolo_app === "organizer";

  useEffect(() => {
    if (myProfile) setRole(myProfile.ruolo_app === "organizer" ? "organizer" : "player");
  }, [myProfile?.ruolo_app]);

  const consensi = myProfile
    ? {
        consensoDati: myProfile.consenso_dati,
        consensoFoto: myProfile.consenso_foto,
        maggiorenne: myProfile.maggiorenne,
        metodo: "email",
        timestamp: myProfile.consenso_timestamp
          ? new Date(myProfile.consenso_timestamp).toLocaleDateString("it-IT", { day: "2-digit", month: "long", year: "numeric" })
          : "",
      }
    : null;

  // Ascolta lo stato di autenticazione reale (Supabase)
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
    const { data: listener } = supabase.auth.onAuthStateChange((_event, sess) => setSession(sess));
    return () => listener.subscription.unsubscribe();
  }, []);

  // Quando cambia la sessione, controlla se esiste un profilo e il suo stato
  useEffect(() => {
    let annullato = false;
    async function caricaProfilo() {
      if (!session) {
        setProfileStatus(null);
        setMyProfile(null);
        return;
      }
      const { data } = await supabase.from("profiles").select("*").eq("auth_user_id", session.user.id).maybeSingle();
      if (annullato) return;
      setMyProfile(data || null);
      setProfileStatus(data ? data.stato_registrazione : "nessuno");
    }
    caricaProfilo();
    return () => {
      annullato = true;
    };
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

  // Quando l'accesso è approvato, carica tutti i dati reali
  useEffect(() => {
    if (profileStatus !== "approvato") return;
    let annullato = false;
    (async () => {
      await Promise.all([caricaGiocatori(), caricaPartite(), caricaRichiesteRegistrazione(), caricaRichiesteCancellazione()]);
      if (!annullato) setDatiCaricati(true);
    })();
    return () => {
      annullato = true;
    };
  }, [profileStatus]);

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

  const salvaRisultato = async (matchId, { bianchi, neri, gol, mvp, buche }) => {
    await supabase
      .from("matches")
      .update({
        risultato_bianchi: bianchi,
        risultato_neri: neri,
        gol,
        mvp: mvp || null,
        buche,
        stato: "storico",
      })
      .eq("id", matchId);
    await caricaPartite();
  };

  const inviaVoto = async (matchId, votatoId, voto) => {
    if (!currentPlayerId) return;
    await supabase
      .from("votes")
      .upsert({ match_id: matchId, votante_id: currentPlayerId, votato_id: votatoId, voto }, { onConflict: "match_id,votante_id,votato_id" });
  };

  const golTotali = useMemo(() => golTotaliPerGiocatore(matches), [matches]);
  const bucheTotali = useMemo(() => bucheTotaliPerGiocatore(matches), [matches]);
  const playersConGol = useMemo(
    () =>
      players.map((p) => {
        const buche = bucheTotali[p.id] || 0;
        return {
          ...p,
          gol: golTotali[p.id] || 0,
          buche,
          assenze: (p.assenze || 0) + buche,
          affidabilita: Math.max(15, (p.affidabilita || 100) - buche * 5),
        };
      }),
    [players, golTotali, bucheTotali]
  );

  const giocatoriRimossi = useMemo(() => players.filter((p) => p.rimosso).map((p) => p.id), [players]);

  const tabsByRole = {
    player: [
      { id: "dashboard", label: "Dashboard" },
      { id: "squadra", label: "Squadra" },
      { id: "storico", label: "Storico" },
      { id: "voti", label: "Vota partita" },
      { id: "mieidati", label: "I miei dati" },
    ],
    organizer: [
      { id: "dashboard", label: "Dashboard" },
      { id: "formazione", label: "Formazione" },
      { id: "risultato", label: "Risultato" },
      { id: "permessi", label: "Permessi" },
      { id: "squadra", label: "Squadra" },
      { id: "storico", label: "Storico" },
      { id: "voti", label: "Vota partita" },
      { id: "mieidati", label: "I miei dati" },
    ],
  };

  const [activeTab, setActiveTab] = useState("dashboard");
  const tabs = tabsByRole[role];

  const handleRoleChange = (r) => {
    setRole(r);
    setActiveTab(tabsByRole[r][0].id);
  };

  if (session === undefined) {
    return (
      <div style={{ minHeight: "100%", background: COLORS.pitchDark, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ color: COLORS.chalkDim, fontFamily: "Inter, sans-serif", fontSize: 13 }}>Caricamento…</div>
      </div>
    );
  }

  if (!session) {
    return <Onboarding onRegistrationSent={() => {}} />;
  }

  if (profileStatus === null) {
    return (
      <div style={{ minHeight: "100%", background: COLORS.pitchDark, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ color: COLORS.chalkDim, fontFamily: "Inter, sans-serif", fontSize: 13 }}>Caricamento…</div>
      </div>
    );
  }

  if (profileStatus === "in_attesa" || profileStatus === "nessuno") {
    return (
      <SchermataStato
        icona="⏳"
        titolo="In attesa di approvazione"
        testo="La tua registrazione è stata ricevuta. L'organizzatore deve approvarla prima che tu possa accedere all'app."
        onEsci={() => supabase.auth.signOut()}
      />
    );
  }

  if (profileStatus === "rifiutato") {
    return (
      <SchermataStato
        icona="✕"
        titolo="Richiesta non approvata"
        testo="L'organizzatore non ha approvato questa registrazione. Contattalo direttamente se pensi sia un errore."
        onEsci={() => supabase.auth.signOut()}
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

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 26, flexWrap: "wrap", gap: 14 }}>
        <div>
          <div style={{ fontFamily: "Barlow Condensed, sans-serif", fontWeight: 800, fontSize: 26, color: COLORS.chalk, letterSpacing: 0.4 }}>
            ⚽ CALCETTO MARTEDÌ & GIOVEDÌ
          </div>
          <div style={{ fontSize: 12, color: COLORS.chalkDim }}>Gestione partite, formazioni, risultati e voti</div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          {sonoOrganizzatore ? (
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: 9, color: COLORS.chalkDim, marginBottom: 3, textTransform: "uppercase", letterSpacing: 0.4 }}>
                Demo: vista account
              </div>
              <RoleSwitcher role={role} setRole={handleRoleChange} />
            </div>
          ) : (
            <span style={chip("rgba(76,175,109,0.15)", COLORS.green)}>Giocatore</span>
          )}
          <button
            onClick={() => supabase.auth.signOut()}
            style={{
              background: "none", border: `1px solid rgba(255,255,255,0.15)`, borderRadius: 8,
              color: COLORS.chalkDim, fontFamily: "Inter, sans-serif", fontSize: 12, padding: "7px 10px", cursor: "pointer",
            }}
          >
            Esci
          </button>
        </div>
      </div>

      <Tabs tabs={tabs} active={activeTab} setActive={setActiveTab} />

      {activeTab === "dashboard" && (
        <Dashboard players={playersConGol} matches={matches} currentPlayerId={currentPlayerId} />
      )}
      {activeTab === "squadra" && <Squadra players={playersConGol} rimossi={giocatoriRimossi} />}
      {activeTab === "storico" && <Storico players={playersConGol} matches={matches} rimossi={giocatoriRimossi} />}
      {activeTab === "voti" && (
        <Votazione players={playersConGol} matches={matches} currentPlayerId={currentPlayerId} onVota={inviaVoto} />
      )}
      {role === "organizer" && activeTab === "formazione" && (
        <Formazione players={playersConGol} matches={matches} onSalvaFormazione={salvaFormazione} onCreaPartita={creaPartita} />
      )}
      {role === "organizer" && activeTab === "risultato" && (
        <Risultato players={playersConGol} matches={matches} onSalvaRisultato={salvaRisultato} />
      )}
      {role === "organizer" && activeTab === "permessi" && (
        <Admin
          players={playersConGol}
          richieste={richiesteCancellazione}
          rimossi={giocatoriRimossi}
          onCompletaRichiesta={(richiesta) => completaRichiestaCancellazione(richiesta)}
          onAggiungiGiocatore={aggiungiGiocatore}
          onPromuoviRuolo={promuoviRuolo}
          richiesteRegistrazione={richiesteRegistrazione}
          onApprovaRegistrazione={approvaRegistrazione}
          onRifiutaRegistrazione={rifiutaRegistrazione}
        />
      )}
      {activeTab === "mieidati" && (
        <MieiDati
          consensi={consensi}
          richiestaInviata={richiesteCancellazione.some((r) => r.playerId === currentPlayerId)}
          onRichiediCancellazione={richiediCancellazioneMiaAccount}
        />
      )}
    </div>
  );
}
