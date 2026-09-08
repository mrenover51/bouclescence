import "server-only";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import type { Database } from "./types";
import { getSupabaseConfig } from "./config";
export async function createClient() { const { url, anonKey } = getSupabaseConfig(); const cookieStore = await cookies(); return createServerClient<Database>(url, anonKey, { cookies: { getAll: () => cookieStore.getAll(), setAll: (items) => { try { items.forEach(({name,value,options}) => cookieStore.set(name,value,options)); } catch { /* Les Server Components ne peuvent pas écrire les cookies. proxy.ts les rafraîchit. */ } } } }); }

