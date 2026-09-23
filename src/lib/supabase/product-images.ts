import "server-only";
import { createClient } from "@/lib/supabase/server";
import { extensionForMime, MAX_PRODUCT_PHOTOS, parsePhotoPlan, validatePhotoFile, validatePhotoSignature } from "@/lib/product-photo-validation";

type UploadedPhoto={id:string;path:string};
export async function validateProductPhotoInput(formData:FormData) { const plan=parsePhotoPlan(formData.get("photo_plan")); const files=formData.getAll("images").filter((value):value is File=>value instanceof File&&value.size>0); if(plan.filter(item=>item.kind==="new").length!==files.length)throw new Error("La sélection de photos a changé pendant l’enregistrement."); for(const file of files){validatePhotoFile(file);await validatePhotoSignature(file);} return plan; }
export async function cleanupProductPhotos(productId:string) { const supabase=await createClient(); const {data}=await supabase.from("product_images").select("storage_path").eq("product_id",productId); const stored=(data??[]).map(image=>image.storage_path).filter(path=>!path.startsWith("/")&&!path.startsWith("http")); if(stored.length)await supabase.storage.from("product-images").remove(stored); }
export async function syncProductPhotos(productId:string,formData:FormData) {
  const supabase=await createClient();
  let plan;
  try { plan=parsePhotoPlan(formData.get("photo_plan")); } catch(error) { throw new Error(error instanceof Error?error.message:"Configuration des photos invalide."); }
  const files=formData.getAll("images").filter((value):value is File=>value instanceof File&&value.size>0);
  const newItems=plan.filter(item=>item.kind==="new");
  if(plan.length>MAX_PRODUCT_PHOTOS)throw new Error("Un produit ne peut pas contenir plus de 10 photos.");
  if(files.length!==newItems.length)throw new Error("La sélection de photos a changé pendant l’enregistrement. Sélectionnez-les à nouveau.");
  const {data:existing,error:existingError}=await supabase.from("product_images").select("*").eq("product_id",productId);
  if(existingError)throw new Error("Impossible de vérifier les photos existantes.");
  const owned=new Set((existing??[]).map(image=>image.id));
  if(plan.some(item=>item.kind==="existing"&&!owned.has(item.id)))throw new Error("Une photo n’appartient pas à ce produit. Rechargez la page.");
  for(const file of files){validatePhotoFile(file);await validatePhotoSignature(file);}
  const uploaded:UploadedPhoto[]=[];
  try {
    for(const file of files){const id=crypto.randomUUID();const path=`${productId}/${crypto.randomUUID()}.${extensionForMime(file.type)}`;const {error}=await supabase.storage.from("product-images").upload(path,file,{contentType:file.type,cacheControl:"31536000",upsert:false});if(error)throw new Error(`L’upload de « ${file.name} » a échoué : ${error.message}`);uploaded.push({id,path});}
    if(uploaded.length){const {error}=await supabase.from("product_images").insert(uploaded.map((image,index)=>({id:image.id,product_id:productId,storage_path:image.path,alt_text:null,sort_order:(existing?.length??0)+index,is_primary:false})));if(error)throw new Error(`Les photos ont été envoyées mais leur enregistrement a échoué : ${error.message}`);}
    const imageIds=plan.map(item=>item.kind==="existing"?item.id:uploaded[item.newIndex]!.id);const altTexts=plan.map(item=>item.altText);const primaryIndex=plan.findIndex(item=>item.isPrimary);const primaryId=primaryIndex>=0?imageIds[primaryIndex]:null;
    const {data:deletedPaths,error:syncError}=await supabase.rpc("sync_product_images",{p_product_id:productId,p_image_ids:imageIds,p_primary_id:primaryId,p_alt_texts:altTexts});
    if(syncError)throw new Error(`L’ordre des photos n’a pas pu être enregistré : ${syncError.message}`);
    const storedDeletedPaths=deletedPaths.filter(path=>!path.startsWith("/")&&!path.startsWith("http"));
    if(storedDeletedPaths.length){const {error:removeError}=await supabase.storage.from("product-images").remove(storedDeletedPaths);if(removeError)return {warning:"Les photos ont été retirées du produit, mais certains anciens fichiers Storage n’ont pas pu être nettoyés."};}
    return {warning:null};
  } catch(error) {
    if(uploaded.length){await supabase.from("product_images").delete().in("id",uploaded.map(image=>image.id));await supabase.storage.from("product-images").remove(uploaded.map(image=>image.path));}
    throw error;
  }
}
