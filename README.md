# Calcetto Martedì & Giovedì — prototipo

Questo è il prototipo dell'app, pronto per essere pubblicato online così
potete provarlo dal telefono. È ancora un **prototipo dimostrativo**:
i dati sono finti e si resettano ogni volta che qualcuno ricarica la pagina
(non c'è un vero database dietro).

## Come pubblicarlo (gratis, ~10 minuti)

### 1. Crea un account GitHub (se non lo hai)
Vai su https://github.com e registrati gratuitamente.

### 2. Carica questo progetto su GitHub
- Su github.com, clicca "New repository", dagli un nome (es. `calcetto-app`),
  lascialo pubblico o privato, non serve altro.
- Nella pagina del nuovo repository vuoto, clicca su
  "uploading an existing file" e trascina dentro **tutti i file e le
  cartelle di questo progetto** (compresa la cartella `src`).
- Conferma il commit.

### 3. Crea un account Vercel
Vai su https://vercel.com e registrati usando "Continue with GitHub"
(così è già collegato, gratis, nessuna carta di credito richiesta).

### 4. Pubblica il progetto
- Su Vercel clicca "Add New..." → "Project".
- Seleziona il repository `calcetto-app` che hai appena caricato.
- Vercel riconosce automaticamente che è un progetto Vite: non serve
  cambiare nessuna impostazione, clicca direttamente "Deploy".
- Dopo circa un minuto ti darà un indirizzo tipo
  `calcetto-app.vercel.app` — quello è il link da condividere con gli amici.

Ogni volta che vorrete un aggiornamento (nuove funzioni, correzioni),
basterà ricaricare i file aggiornati su GitHub: Vercel ripubblica da solo
in automatico in un minuto.

## Limiti attuali da tenere a mente

- **Nessun salvataggio reale**: se un giocatore chiude l'app o un altro la
  apre da un altro telefono, non vede gli stessi dati. Ogni sessione parte
  dai dati di esempio.
- **Login non reale**: la schermata di accesso è dimostrativa, non collega
  davvero a Google né crea account veri.
- **Un solo "utente" alla volta**: lo switch tra Giocatore/Organizzatore
  serve solo per farvi vedere le diverse viste, non sono account distinti.

Per un uso vero con il gruppo (dati condivisi, login reale, notifiche)
serve aggiungere un backend con database e autenticazione — è il passo
successivo quando sarete pronti.
