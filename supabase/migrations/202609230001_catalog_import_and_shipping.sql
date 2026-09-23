-- Import idempotent du catalogue photo et paramètres de livraison.
-- Migration additive et non destructive.

alter table public.products add column if not exists import_key text;
create unique index if not exists products_import_key_unique on public.products(import_key) where import_key is not null;
comment on column public.products.import_key is 'Clé technique stable des imports de catalogue; indépendante du nom et du slug éditables.';

insert into public.site_settings(key,value,description,is_public)
values ('shipping','{"standard_shipping_cost":490,"free_shipping_amount_enabled":true,"free_shipping_amount":5000,"free_shipping_quantity_enabled":true,"free_shipping_quantity":4}'::jsonb,'Règles publiques de livraison Bouclescence',true)
on conflict (key) do nothing;

insert into public.collections(name,slug,description,is_active,sort_order)
values ('Les créations Bouclescence','creations-bouclescence','Les modèles Bouclescence aux formes florales, graphiques et colorées.',true,10)
on conflict (slug) do nothing;

with catalog(number,name,slug,description) as (values
 (0,$$Boucles Éclat Ivoire$$,$$boucles-eclat-ivoire$$,$$Des volumes ivoire ponctués de reflets dorés, pour une allure lumineuse et délicate.$$),
 (1,$$Boucles Fleur d'Ivoire$$,$$boucles-fleur-ivoire$$,$$Une silhouette florale ivoire aux détails lumineux, douce et pleine de caractère.$$),
 (2,$$Boucles Étoile Nacrée$$,$$boucles-etoile-nacree$$,$$Une forme nacrée élancée, réveillée par un motif étoilé au charme céleste.$$),
 (3,$$Boucles Halo Ivoire$$,$$boucles-halo-ivoire$$,$$De grands anneaux festonnés ivoire qui dessinent une présence élégante et solaire.$$),
 (4,$$Boucles Lagon$$,$$boucles-lagon$$,$$Un bleu lagon intense et une silhouette graphique pour illuminer chaque mouvement.$$),
 (5,$$Boucles Azur$$,$$boucles-azur$$,$$Des pétales bleu profond aux éclats lumineux, dans une ligne souple et féminine.$$),
 (6,$$Boucles Céladon$$,$$boucles-celadon$$,$$Une fleur céladon suspendue à un délicat feuillage, fraîche et raffinée.$$),
 (7,$$Boucles Fleur de Nuit$$,$$boucles-fleur-de-nuit$$,$$Une floraison bleu nuit généreuse, relevée de touches lumineuses.$$),
 (8,$$Boucles Lotus Lagon$$,$$boucles-lotus-lagon$$,$$Un lotus turquoise en relief associé à une ligne ajourée pleine de légèreté.$$),
 (9,$$Boucles Éventail Azur$$,$$boucles-eventail-azur$$,$$Un éventail bleu vif aux détails lumineux, pensé pour une allure affirmée.$$),
 (10,$$Boucles Lotus Céleste$$,$$boucles-lotus-celeste$$,$$Une fleur bleu ciel aux contours ajourés, délicate et aérienne.$$),
 (11,$$Boucles Lotus Pétrole$$,$$boucles-lotus-petrole$$,$$Un bleu pétrole profond sur une silhouette de lotus élégante et graphique.$$),
 (12,$$Boucles Minuit Fleuri$$,$$boucles-minuit-fleuri$$,$$Une fleur bleu nuit aux éclats contrastés, sophistiquée sans être sage.$$),
 (13,$$Boucles Ronde Cobalt$$,$$boucles-ronde-cobalt$$,$$Des médaillons cobalt à la texture subtile, pour une touche franche et lumineuse.$$),
 (14,$$Boucles Soleil Safran$$,$$boucles-soleil-safran$$,$$Une teinte safran chaleureuse sur une forme plissée qui capte le regard.$$),
 (15,$$Boucles Dahlia Noir$$,$$boucles-dahlia-noir$$,$$Une floraison noire généreuse, soulignée de détails lumineux et délicats.$$),
 (16,$$Boucles Feuille Nocturne$$,$$boucles-feuille-nocturne$$,$$Une feuille noire sculptée aux reflets graphiques, élégante et singulière.$$),
 (17,$$Boucles Halo Nocturne$$,$$boucles-halo-nocturne$$,$$De grands anneaux noirs texturés pour une silhouette chic et expressive.$$),
 (18,$$Boucles Flamme Corail$$,$$boucles-flamme-corail$$,$$Une fleur corail éclatante qui apporte chaleur et mouvement au visage.$$),
 (19,$$Boucles Ronde Corail$$,$$boucles-ronde-corail$$,$$Des médaillons corail au dessin organique, lumineux et faciles à porter.$$),
 (20,$$Boucles Éventail Fuchsia$$,$$boucles-eventail-fuchsia$$,$$Un éventail fuchsia vibrant, joyeux et résolument féminin.$$),
 (21,$$Boucles Lotus Fuchsia$$,$$boucles-lotus-fuchsia$$,$$Une fleur fuchsia au relief doux, suspendue à un feuillage élégant.$$),
 (22,$$Boucles Pivoine Fuchsia$$,$$boucles-pivoine-fuchsia$$,$$Une pivoine fuchsia généreuse aux détails lumineux, pleine de tempérament.$$),
 (23,$$Boucles Rosée$$,$$boucles-rosee$$,$$Une floraison rose poudré aux touches lumineuses, tendre et raffinée.$$),
 (24,$$Boucles Écarlate$$,$$boucles-ecarlate$$,$$Une fleur rouge éclatante au tombé délicat, pour une allure pleine d'assurance.$$),
 (25,$$Boucles Rubis Plissé$$,$$boucles-rubis-plisse$$,$$Une forme plissée rouge profond qui joue avec la lumière à chaque mouvement.$$),
 (26,$$Boucles Arc Émeraude$$,$$boucles-arc-emeraude$$,$$Une composition émeraude et graphique, rythmée par de fins arcs ajourés.$$),
 (27,$$Boucles Feuillage Émeraude$$,$$boucles-feuillage-emeraude$$,$$Un feuillage vert profond aux lignes lumineuses, élégant et généreux.$$),
 (28,$$Boucles Lotus Émeraude$$,$$boucles-lotus-emeraude$$,$$Une fleur émeraude structurée, délicatement ponctuée de reflets lumineux.$$),
 (29,$$Boucles Amande Céladon$$,$$boucles-amande-celadon$$,$$Une teinte céladon tendre associée à une composition ajourée et aérienne.$$),
 (30,$$Boucles Feuille Olive$$,$$boucles-feuille-olive$$,$$Une feuille vert olive aux reflets chaleureux, naturelle et sophistiquée.$$),
 (31,$$Boucles Halo Olive$$,$$boucles-halo-olive$$,$$De grands anneaux vert olive au relief généreux, pour une allure singulière.$$),
 (32,$$Boucles Amande Ivoire$$,$$boucles-amande-ivoire$$,$$Une forme amande ivoire finement striée, douce et lumineuse.$$),
 (33,$$Boucles Dahlia Olive$$,$$boucles-dahlia-olive$$,$$Une floraison vert olive aux détails contrastés, élégante et expressive.$$)
)
insert into public.products(name,slug,short_description,description,status,price,sku,stock_tracking,stock_quantity,low_stock_threshold,is_unique_piece,featured,seo_title,seo_description,import_key)
select name,slug,description,description,'active',1500,'BC-PHOTO-'||lpad(number::text,2,'0'),true,1,1,false,number<3,name||' | Bouclescence',description,'bouclescence-photo-'||number
from catalog
on conflict (import_key) where import_key is not null do nothing;

with imported as (select id,name,import_key,substring(import_key from '[0-9]+$')::integer number from public.products where import_key like 'bouclescence-photo-%'), images as (
 select id product_id,'/images/photo'||number||'.png' storage_path,$$Boucles d'oreilles $$||replace(name,'Boucles ','')||' Bouclescence' alt_text,0 sort_order,true is_primary from imported
 union all
 select id,'/images/photo'||number||' f.png',$$Boucles d'oreilles $$||replace(name,'Boucles ','')||' portées',1,false from imported
)
insert into public.product_images(product_id,storage_path,alt_text,sort_order,is_primary)
select product_id,storage_path,alt_text,sort_order,is_primary from images
on conflict (product_id,storage_path) do update set alt_text=excluded.alt_text,sort_order=excluded.sort_order,is_primary=excluded.is_primary;

insert into public.collection_products(collection_id,product_id,sort_order)
select c.id,p.id,substring(p.import_key from '[0-9]+$')::integer
from public.products p cross join public.collections c
where p.import_key like 'bouclescence-photo-%' and c.slug='creations-bouclescence'
on conflict (collection_id,product_id) do nothing;

insert into public.inventory_movements(product_id,movement_type,quantity_before,quantity_change,quantity_after,reason,reference)
select p.id,'initial',0,1,1,'Stock initial de l’import photo','bouclescence-photo-import-'||p.import_key
from public.products p where p.import_key like 'bouclescence-photo-%'
and not exists(select 1 from public.inventory_movements m where m.reference='bouclescence-photo-import-'||p.import_key);
