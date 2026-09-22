import type { MetadataRoute } from "next";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { absoluteUrl } from "@/lib/seo";
export const revalidate=3600;
export default async function sitemap():Promise<MetadataRoute.Sitemap>{const pages=["/","/boutique","/collections","/a-propos","/contact","/livraison-retours"].map((path,index)=>({url:absoluteUrl(path),changeFrequency:(index<3?"weekly":"monthly") as "weekly"|"monthly",priority:index===0?1:index===1?0.9:0.5}));if(!isSupabaseConfigured())return pages;const supabase=await createClient();const [{data:products},{data:collections}]=await Promise.all([supabase.from("products").select("slug,updated_at").eq("status","active"),supabase.from("collections").select("slug,updated_at").eq("is_active",true).eq("is_indexable",true)]);return [...pages,...(collections??[]).map(item=>({url:absoluteUrl(`/collections/${item.slug}`),lastModified:item.updated_at,changeFrequency:"weekly" as const,priority:.8})),...(products??[]).map(item=>({url:absoluteUrl(`/produit/${item.slug}`),lastModified:item.updated_at,changeFrequency:"weekly" as const,priority:.8}))];}
