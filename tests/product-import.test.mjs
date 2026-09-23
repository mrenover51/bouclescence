import assert from "node:assert/strict";
import test from "node:test";
import path from "node:path";
import { buildImportPlan, detectPhotoPairs, PRODUCT_CATALOG } from "../scripts/import-products.mjs";
const images=path.resolve(process.cwd(),"public/images");
test("une paire de fichiers crée un produit avec le bon ordre",async()=>{const result=await detectPhotoPairs(images);const plan=buildImportPlan(result.pairs);assert.equal(result.anomalies.length,0);assert.equal(plan.length,34);for(const product of plan){assert.equal(product.primary,`photo${product.number}.png`);assert.equal(product.secondary,`photo${product.number} f.png`);}});
test("une deuxième exécution ne recrée aucun produit",async()=>{const result=await detectPhotoPairs(images);const existing=new Set(PRODUCT_CATALOG.map(product=>product.importKey));assert.equal(buildImportPlan(result.pairs,existing).length,0);});
