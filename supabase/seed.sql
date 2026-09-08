-- Seed optionnel, idempotent et non destructif.
-- À exécuter explicitement uniquement dans un environnement de démonstration.
insert into public.collections (name, slug, description, is_active, sort_order)
values ('Éclat nacré', 'eclat-nacre', 'Perles naturelles et lumière dorée.', true, 10), ('Les essentiels', 'les-essentiels', 'Des bijoux lumineux pour le quotidien.', true, 20)
on conflict (slug) do nothing;
insert into public.products (name, slug, short_description, description, status, price, compare_at_price, sku, stock_quantity, low_stock_threshold, is_unique_piece, featured)
values
('Boucles Céleste', 'boucles-celeste', 'Créoles dorées et perles d’eau douce.', 'Une créole délicatement texturée, ponctuée d’une perle d’eau douce naturellement irrégulière.', 'active', 4900, null, 'BC-BO-CEL-001', 1, 1, true, true),
('Boucles Aube', 'boucles-aube', 'Des boucles lumineuses pour le quotidien.', 'Des boucles lumineuses pensées pour accompagner les gestes du quotidien.', 'active', 4200, null, 'BC-BO-AUB-002', 4, 2, false, true),
('Boucles Nacrée', 'boucles-nacree', 'Une silhouette organique en petite série.', 'Une silhouette organique et une lumière douce, en édition confidentielle.', 'active', 5500, 6200, 'BC-BO-NAC-003', 2, 2, false, true)
on conflict (slug) do nothing;
insert into public.collection_products (collection_id, product_id, sort_order)
select c.id, p.id, row_number() over (order by p.created_at)::integer from public.products p join public.collections c on c.slug = case when p.slug = 'boucles-aube' then 'les-essentiels' else 'eclat-nacre' end where p.slug in ('boucles-celeste','boucles-aube','boucles-nacree') on conflict do nothing;
insert into public.inventory_movements (product_id, movement_type, quantity_before, quantity_change, quantity_after, reason, reference)
select p.id, 'initial', 0, p.stock_quantity, p.stock_quantity, 'Seed de démonstration initial', 'demo-seed-v1-' || p.slug
from public.products p
where p.slug in ('boucles-celeste','boucles-aube','boucles-nacree') and p.stock_quantity > 0
and not exists (select 1 from public.inventory_movements m where m.reference = 'demo-seed-v1-' || p.slug);
