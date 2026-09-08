-- RLS, Storage et fonction transactionnelle de stock.

alter table public.profiles enable row level security;
alter table public.products enable row level security;
alter table public.product_images enable row level security;
alter table public.product_variants enable row level security;
alter table public.collections enable row level security;
alter table public.collection_products enable row level security;
alter table public.inventory_movements enable row level security;
alter table public.customers enable row level security;
alter table public.addresses enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.discount_codes enable row level security;
alter table public.site_settings enable row level security;

create policy "profiles_select_self_or_admin" on public.profiles for select to authenticated using (id = (select auth.uid()) or public.is_admin());
create policy "profiles_admin_update" on public.profiles for update to authenticated using (public.is_admin()) with check (public.is_admin());

create policy "products_public_read_active" on public.products for select to anon, authenticated using (status = 'active' or public.is_admin());
create policy "products_admin_insert" on public.products for insert to authenticated with check (public.is_admin());
create policy "products_admin_update" on public.products for update to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "products_admin_delete" on public.products for delete to authenticated using (public.is_admin());

create policy "collections_public_read_active" on public.collections for select to anon, authenticated using (is_active or public.is_admin());
create policy "collections_admin_all" on public.collections for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "collection_products_public_read" on public.collection_products for select to anon, authenticated using (
  public.is_admin() or (exists(select 1 from public.collections c where c.id = collection_id and c.is_active) and exists(select 1 from public.products p where p.id = product_id and p.status = 'active'))
);
create policy "collection_products_admin_all" on public.collection_products for all to authenticated using (public.is_admin()) with check (public.is_admin());

create policy "product_images_public_read" on public.product_images for select to anon, authenticated using (public.is_admin() or exists(select 1 from public.products p where p.id = product_id and p.status = 'active'));
create policy "product_images_admin_all" on public.product_images for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "variants_public_read_active" on public.product_variants for select to anon, authenticated using (public.is_admin() or (is_active and exists(select 1 from public.products p where p.id = product_id and p.status = 'active')));
create policy "variants_admin_all" on public.product_variants for all to authenticated using (public.is_admin()) with check (public.is_admin());

create policy "inventory_admin_read" on public.inventory_movements for select to authenticated using (public.is_admin());
create policy "customers_read_self_or_admin" on public.customers for select to authenticated using (auth_user_id = (select auth.uid()) or public.is_admin());
create policy "customers_admin_all" on public.customers for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "addresses_read_self_or_admin" on public.addresses for select to authenticated using (public.is_admin() or exists(select 1 from public.customers c where c.id = customer_id and c.auth_user_id = (select auth.uid())));
create policy "addresses_admin_all" on public.addresses for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "orders_read_self_or_admin" on public.orders for select to authenticated using (public.is_admin() or exists(select 1 from public.customers c where c.id = customer_id and c.auth_user_id = (select auth.uid())));
create policy "orders_admin_all" on public.orders for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "order_items_read_self_or_admin" on public.order_items for select to authenticated using (public.is_admin() or exists(select 1 from public.orders o join public.customers c on c.id = o.customer_id where o.id = order_id and c.auth_user_id = (select auth.uid())));
create policy "order_items_admin_all" on public.order_items for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "discount_codes_admin_all" on public.discount_codes for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "site_settings_public_read" on public.site_settings for select to anon, authenticated using (is_public or public.is_admin());
create policy "site_settings_admin_all" on public.site_settings for all to authenticated using (public.is_admin()) with check (public.is_admin());

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('product-images', 'product-images', true, 10485760, array['image/jpeg','image/png','image/webp','image/avif'])
on conflict (id) do update set public = excluded.public, file_size_limit = excluded.file_size_limit, allowed_mime_types = excluded.allowed_mime_types;

create policy "product_images_storage_public_read" on storage.objects for select to anon, authenticated using (bucket_id = 'product-images');
create policy "product_images_storage_admin_insert" on storage.objects for insert to authenticated with check (bucket_id = 'product-images' and public.is_admin());
create policy "product_images_storage_admin_update" on storage.objects for update to authenticated using (bucket_id = 'product-images' and public.is_admin()) with check (bucket_id = 'product-images' and public.is_admin());
create policy "product_images_storage_admin_delete" on storage.objects for delete to authenticated using (bucket_id = 'product-images' and public.is_admin());

create or replace function public.adjust_inventory(
  p_product_id uuid,
  p_variant_id uuid,
  p_quantity_change integer,
  p_reason text,
  p_reference text default null,
  p_movement_type public.inventory_movement_type default 'manual_adjustment',
  p_allow_unique_override boolean default false
) returns public.inventory_movements
language plpgsql security definer set search_path = '' as $$
declare v_before integer; v_after integer; v_unique boolean; v_movement public.inventory_movements;
begin
  if not public.is_admin() then raise exception 'admin_required' using errcode = '42501'; end if;
  if p_quantity_change = 0 then raise exception 'quantity_change_must_not_be_zero'; end if;
  if nullif(trim(p_reason), '') is null then raise exception 'reason_required'; end if;
  select is_unique_piece into v_unique from public.products where id = p_product_id for update;
  if not found then raise exception 'product_not_found'; end if;
  if p_variant_id is null then
    select stock_quantity into v_before from public.products where id = p_product_id for update;
  else
    select stock_quantity into v_before from public.product_variants where id = p_variant_id and product_id = p_product_id for update;
    if not found then raise exception 'variant_not_found'; end if;
  end if;
  v_after := v_before + p_quantity_change;
  if v_after < 0 then raise exception 'insufficient_stock'; end if;
  if v_unique and v_after > 1 and not p_allow_unique_override then raise exception 'unique_piece_stock_limit'; end if;
  if p_variant_id is null then update public.products set stock_quantity = v_after where id = p_product_id;
  else update public.product_variants set stock_quantity = v_after where id = p_variant_id; end if;
  insert into public.inventory_movements(product_id, variant_id, movement_type, quantity_before, quantity_change, quantity_after, reason, reference, performed_by)
  values(p_product_id, p_variant_id, p_movement_type, v_before, p_quantity_change, v_after, trim(p_reason), p_reference, (select auth.uid())) returning * into v_movement;
  return v_movement;
end; $$;
revoke all on function public.adjust_inventory(uuid,uuid,integer,text,text,public.inventory_movement_type,boolean) from public, anon;
grant execute on function public.adjust_inventory(uuid,uuid,integer,text,text,public.inventory_movement_type,boolean) to authenticated;

comment on function public.adjust_inventory is 'Ajustement atomique du stock avec verrou de ligne, contrôle admin et journalisation obligatoire.';
