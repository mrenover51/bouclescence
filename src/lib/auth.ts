import "server-only";
import { cache } from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";
export const getAdmin = cache(async () => { if (!isSupabaseConfigured()) return null; const supabase = await createClient(); const { data: { user } } = await supabase.auth.getUser(); if (!user) return null; const { data: profile } = await supabase.from("profiles").select("id, role, full_name").eq("id", user.id).single(); return profile?.role === "admin" ? { user, profile } : null; });
export async function requireAdmin() { const admin = await getAdmin(); if (!admin) redirect("/admin/login"); return admin; }
