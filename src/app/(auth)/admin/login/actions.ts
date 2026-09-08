"use server";
import { redirect } from "next/navigation";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";
export type LoginState={error?:string}|null;
export async function login(_:LoginState,formData:FormData):Promise<LoginState> { if(!isSupabaseConfigured()) return {error:"Supabase n’est pas encore configuré. Consultez docs/supabase-setup.md."}; const parsed=z.object({email:z.email(),password:z.string().min(8)}).safeParse({email:formData.get("email"),password:formData.get("password")}); if(!parsed.success) return {error:"Saisissez un e-mail valide et un mot de passe d’au moins 8 caractères."}; const supabase=await createClient(); const {data,error}=await supabase.auth.signInWithPassword(parsed.data); if(error||!data.user) return {error:"E-mail ou mot de passe incorrect."}; const {data:profile}=await supabase.from("profiles").select("role").eq("id",data.user.id).single(); if(profile?.role!=="admin") { await supabase.auth.signOut(); return {error:"Ce compte n’est pas autorisé à administrer la boutique."}; } redirect("/admin"); }
