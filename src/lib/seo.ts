import type { Metadata } from "next";

export const SITE_NAME = "Bouclescence";
export const SITE_LOCALE = "fr_FR";

export function getSiteUrl() {
  return new URL(process.env.NEXT_PUBLIC_SITE_URL?.trim() || "http://localhost:3000");
}

export function absoluteUrl(path = "/") { return new URL(path, getSiteUrl()).toString(); }

export function pageMetadata({ title, description, path, image, noIndex = false }: { title:string; description:string; path:string; image?:string; noIndex?:boolean }):Metadata {
  const url=absoluteUrl(path); const images=image?[{url:absoluteUrl(image)}]:undefined;
  return {title:{absolute:title},description,alternates:{canonical:url},robots:noIndex?{index:false,follow:false}:{index:true,follow:true},openGraph:{title,description,url,siteName:SITE_NAME,locale:SITE_LOCALE,type:"website",images},twitter:{card:image?"summary_large_image":"summary",title,description,images:images?.map(item=>item.url)}};
}

export function jsonLd(value:unknown){return JSON.stringify(value).replace(/</g,"\\u003c");}
export function plainText(value:string|null|undefined){return (value??"").replace(/<[^>]*>/g," ").replace(/\s+/g," ").trim();}
export function truncate(value:string,length:number){const text=plainText(value);return text.length<=length?text:`${text.slice(0,length-1).trimEnd()}…`;}
