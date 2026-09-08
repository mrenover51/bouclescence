import { z } from "zod";

export const MAX_PRODUCT_PHOTOS = 10;
export const MAX_PRODUCT_PHOTO_BYTES = 8 * 1024 * 1024;
export const PRODUCT_PHOTO_TYPES = ["image/jpeg", "image/png", "image/webp"] as const;

const planItemSchema = z.discriminatedUnion("kind", [
  z.object({ kind: z.literal("existing"), id: z.string().uuid(), altText: z.string().max(180), isPrimary: z.boolean() }),
  z.object({ kind: z.literal("new"), newIndex: z.number().int().min(0), altText: z.string().max(180), isPrimary: z.boolean() }),
]);
export const photoPlanSchema = z.array(planItemSchema).max(MAX_PRODUCT_PHOTOS).superRefine((items,ctx)=>{
  if(items.length>0&&items.filter(item=>item.isPrimary).length!==1)ctx.addIssue({code:"custom",message:"Une seule photo principale est requise."});
  const existing=items.filter(item=>item.kind==="existing").map(item=>item.id); if(new Set(existing).size!==existing.length)ctx.addIssue({code:"custom",message:"Une photo existante est présente plusieurs fois."});
  const indexes=items.filter(item=>item.kind==="new").map(item=>item.newIndex).sort((a,b)=>a-b); if(indexes.some((value,index)=>value!==index))ctx.addIssue({code:"custom",message:"Le plan des nouvelles photos est invalide."});
});
export type PhotoPlan = z.infer<typeof photoPlanSchema>;

export function parsePhotoPlan(value:FormDataEntryValue|null) { if(typeof value!=="string")throw new Error("Le plan des photos est manquant."); const parsed=photoPlanSchema.safeParse(JSON.parse(value)); if(!parsed.success)throw new Error(parsed.error.issues[0]?.message??"Le plan des photos est invalide."); return parsed.data; }
export function validatePhotoFile(file:File) { if(!PRODUCT_PHOTO_TYPES.includes(file.type as typeof PRODUCT_PHOTO_TYPES[number]))throw new Error(`« ${file.name} » n’est pas une image JPG, PNG ou WEBP valide.`); if(file.size>MAX_PRODUCT_PHOTO_BYTES)throw new Error(`« ${file.name} » dépasse la limite de 8 Mo.`); if(file.size===0)throw new Error(`« ${file.name} » est vide.`); }
export function validatePhotoSelection(currentCount:number,files:File[]){if(currentCount+files.length>MAX_PRODUCT_PHOTOS)return `Vous pouvez ajouter ${Math.max(0,MAX_PRODUCT_PHOTOS-currentCount)} photo au maximum (${MAX_PRODUCT_PHOTOS} par produit).`;try{files.forEach(validatePhotoFile);return null;}catch(error){return error instanceof Error?error.message:"Fichier refusé.";}}
export async function validatePhotoSignature(file:File) { const bytes=new Uint8Array(await file.slice(0,12).arrayBuffer()); const jpeg=bytes[0]===0xff&&bytes[1]===0xd8&&bytes[2]===0xff; const png=bytes[0]===0x89&&bytes[1]===0x50&&bytes[2]===0x4e&&bytes[3]===0x47&&bytes[4]===0x0d&&bytes[5]===0x0a&&bytes[6]===0x1a&&bytes[7]===0x0a; const webp=String.fromCharCode(...bytes.slice(0,4))==="RIFF"&&String.fromCharCode(...bytes.slice(8,12))==="WEBP"; if(!(jpeg||png||webp))throw new Error(`Le contenu de « ${file.name} » ne correspond pas à une image autorisée.`); }
export function extensionForMime(type:string) { if(type==="image/jpeg")return "jpg"; if(type==="image/png")return "png"; if(type==="image/webp")return "webp"; throw new Error("Type d’image non pris en charge."); }
