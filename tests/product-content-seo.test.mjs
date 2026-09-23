import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const migrationUrl=new URL("../supabase/migrations/202609230002_product_content_and_national_seo.sql",import.meta.url);

test("la migration enrichit les 34 produits avec un contenu visuel unique",async()=>{const sql=await readFile(migrationUrl,"utf8");const keys=[...sql.matchAll(/'bouclescence-photo-(\d+)'/g)].map(match=>Number(match[1]));assert.deepEqual([...new Set(keys)].sort((a,b)=>a-b),Array.from({length:34},(_,index)=>index));const shorts=[...sql.matchAll(/'bouclescence-photo-\d+','[^']*(?:''[^']*)*','[^']+','[^']+','([^']+)'/g)].map(match=>match[1]);assert.equal(shorts.length,34);assert.equal(new Set(shorts).size,34);assert.match(sql,/main_material = 'Argile polymère'/);assert.match(sql,/findings_material = 'Acier inoxydable'/);});

test("les ALT distinguent toujours l’image principale de la vue portée",async()=>{const sql=await readFile(migrationUrl,"utf8");assert.match(sql,/case when i\.is_primary/);assert.match(sql,/en argile polymère/);assert.match(sql,/portées/);});

test("les titles et descriptions SEO sont générés à partir de chaque modèle",async()=>{const sql=await readFile(migrationUrl,"utf8");assert.match(sql,/seo_title = c\.model_name/);assert.match(sql,/seo_description = 'Découvrez ' \|\| c\.model_name/);assert.match(sql,/boucles-colorees/);assert.match(sql,/boucles-florales/);});
