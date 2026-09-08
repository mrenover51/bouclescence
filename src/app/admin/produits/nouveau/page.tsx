import { createProduct } from "@/app/admin/actions";
import { ProductForm } from "@/components/admin/product-form";
import { createClient } from "@/lib/supabase/server";
export default async function NewProductPage(){const supabase=await createClient();const {data:collections}=await supabase.from("collections").select("*").order("sort_order");return <><p className="text-xs uppercase tracking-[.15em] text-wine">Catalogue</p><h1 className="display mt-2 text-5xl">Nouveau produit</h1><ProductForm action={createProduct} collections={collections??[]}/></>}
