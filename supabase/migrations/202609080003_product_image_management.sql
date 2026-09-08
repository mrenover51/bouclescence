-- Synchronisation atomique de l'ordre, de la photo principale et des suppressions.
-- Migration additive : aucune table ni colonne existante n'est modifiée.

create or replace function public.sync_product_images(
  p_product_id uuid,
  p_image_ids uuid[],
  p_primary_id uuid default null,
  p_alt_texts text[] default array[]::text[]
) returns text[]
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_deleted_paths text[] := array[]::text[];
  v_expected integer := coalesce(cardinality(p_image_ids), 0);
  v_owned integer;
begin
  if not public.is_admin() then
    raise exception 'admin_required' using errcode = '42501';
  end if;
  if v_expected > 10 then raise exception 'maximum_10_images'; end if;
  if cardinality(p_alt_texts) <> v_expected then raise exception 'invalid_alt_texts'; end if;
  if v_expected = 0 and p_primary_id is not null then raise exception 'invalid_primary_image'; end if;
  if v_expected > 0 and (p_primary_id is null or not p_primary_id = any(p_image_ids)) then raise exception 'primary_image_required'; end if;
  if (select count(distinct image_id) from unnest(p_image_ids) image_id) <> v_expected then raise exception 'duplicate_image_id'; end if;

  select count(*) into v_owned from public.product_images where product_id = p_product_id and id = any(p_image_ids);
  if v_owned <> v_expected then raise exception 'image_does_not_belong_to_product'; end if;

  select coalesce(array_agg(storage_path), array[]::text[]) into v_deleted_paths
  from public.product_images
  where product_id = p_product_id and not (id = any(p_image_ids));

  delete from public.product_images where product_id = p_product_id and not (id = any(p_image_ids));
  update public.product_images set is_primary = false where product_id = p_product_id and is_primary;

  update public.product_images image
  set sort_order = ordered.ordinality - 1,
      alt_text = nullif(trim(ordered.alt_text), '')
  from unnest(p_image_ids, p_alt_texts) with ordinality as ordered(image_id, alt_text, ordinality)
  where image.id = ordered.image_id and image.product_id = p_product_id;

  if p_primary_id is not null then
    update public.product_images set is_primary = true where id = p_primary_id and product_id = p_product_id;
  end if;
  return v_deleted_paths;
end;
$$;

revoke all on function public.sync_product_images(uuid, uuid[], uuid, text[]) from public, anon;
grant execute on function public.sync_product_images(uuid, uuid[], uuid, text[]) to authenticated;
comment on function public.sync_product_images is 'Synchronise atomiquement un maximum de 10 images appartenant à un produit, leur ordre, leur alt et leur image principale.';
