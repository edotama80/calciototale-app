import { createClient } from "@supabase/supabase-js";

// Queste chiavi sono pubbliche e sicure da avere nel codice front-end:
// la vera protezione dei dati è affidata alle regole di sicurezza (RLS)
// definite nel database, non alla segretezza di questa chiave.
const SUPABASE_URL = "https://xoigglvyrasgfkxboouz.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "sb_publishable__IX1qVzPmsny-cvhBt3qGA_ypV2qj0k";

export const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);
