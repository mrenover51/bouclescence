-- Champs éditoriaux SEO des collections. Migration additive et sans suppression.
alter table public.collections
  add column if not exists introduction text,
  add column if not exists seo_content text,
  add column if not exists seo_title text,
  add column if not exists seo_description text,
  add column if not exists is_indexable boolean not null default true;

comment on column public.collections.introduction is 'Introduction visible sous le H1 de la collection.';
comment on column public.collections.seo_content is 'Contenu éditorial complémentaire visible après les produits.';
comment on column public.collections.is_indexable is 'Autorise l’indexation et l’inclusion dans le sitemap lorsque la collection est active.';
