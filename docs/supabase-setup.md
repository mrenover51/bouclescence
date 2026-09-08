# Configuration Supabase — Bouclescence

Cette procédure ne touche pas à SumUp et n'utilise aucune clé `service_role` dans l'application.

## 1. Créer le projet

1. Créer un projet depuis [Supabase](https://supabase.com/dashboard).
2. Choisir la région la plus proche des clientes et conserver le mot de passe PostgreSQL dans un gestionnaire de secrets.
3. Dans **Project Settings > API**, relever l'URL du projet et la clé publique `anon`.

## 2. Variables locales

Copier `.env.example` vers `.env.local`, puis renseigner :

```env
NEXT_PUBLIC_SUPABASE_URL=https://PROJECT_REF.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=la_cle_anon_publique
```

`.env.local` est ignoré par Git. Ne jamais y ajouter une clé `service_role`. En l'absence de ces variables, la vitrine continue d'utiliser les trois produits du Sprint 1 et `/admin` redirige vers la page de connexion non configurée.

## 3. Exécuter les migrations

Les migrations sont additives et versionnées dans `supabase/migrations` :

- `202609080001_initial_ecommerce_schema.sql` : tables, types, contraintes, séquence de commande et fonctions communes ;
- `202609080002_rls_storage_inventory.sql` : RLS, policies, bucket Storage et fonction atomique de stock.
- `202609080003_product_image_management.sql` : synchronisation atomique de l’ordre, de la photo principale et des suppressions d’images.

Avec la CLI Supabase installée et le projet lié :

```bash
supabase login
supabase link --project-ref PROJECT_REF
supabase db push
```

Ne pas utiliser `supabase db reset` sur une base contenant des données. Il est aussi possible de copier chaque migration, dans l'ordre, dans le **SQL Editor** du Dashboard.

## 4. Créer le premier administrateur

1. Dans **Authentication > Users**, créer l'utilisateur avec son e-mail et un mot de passe robuste.
2. Le trigger `on_auth_user_created` crée automatiquement son profil avec le rôle `customer`.
3. Dans le SQL Editor, promouvoir uniquement ce compte :

```sql
update public.profiles
set role = 'admin'
where id = (
  select id from auth.users where lower(email) = lower('VOTRE_EMAIL')
);
```

4. Vérifier le résultat :

```sql
select u.email, p.role
from auth.users u
join public.profiles p on p.id = u.id;
```

Posséder un compte Supabase ne suffit pas : le layout `/admin`, chaque Server Action et les policies RLS exigent explicitement `profiles.role = 'admin'`.

## 5. Storage produit

La seconde migration crée le bucket `product-images` avec :

- lecture publique des fichiers catalogue ;
- écriture, remplacement et suppression réservés aux administrateurs ;
- formats JPEG, PNG, WebP et AVIF ;
- limite de 10 Mo par fichier.

Les fichiers sont stockés sous `product-images/<product_id>/...`. PostgreSQL ne contient que le chemin, le texte alternatif, l'ordre et l'indicateur d'image principale. Le formulaire d'administration accepte plusieurs images et la page d'édition permet de les réordonner ou supprimer.

## 6. Données de démonstration optionnelles

`supabase/seed.sql` reprend les trois produits fictifs. Il est idempotent (`on conflict do nothing`) mais doit être lancé explicitement, uniquement sur un environnement de démonstration :

```bash
supabase db execute --file supabase/seed.sql
```

Les images locales du Sprint 1 restent utilisées comme repli visuel pour ces trois slugs tant qu'aucune image n'a été envoyée dans Storage.

## 7. Vérifier la RLS

Dans **Database > Tables**, vérifier que RLS est activée sur les 13 tables publiques. Dans **Authentication > Policies**, contrôler les règles suivantes :

- public : lecture des seuls produits `active`, collections actives, variantes actives et métadonnées d'images de produits actifs ;
- client connecté : lecture de son profil, de sa fiche client, de ses adresses et de ses commandes ;
- administrateur : gestion des produits, images, variantes, collections, commandes, clients, promotions et paramètres ;
- stock : aucune insertion ou mise à jour directe publique ; passage obligatoire par `adjust_inventory` pour les ajustements manuels.

Test rapide depuis le SQL Editor en simulant le rôle anonyme :

```sql
set local role anon;
select name, status from public.products;
rollback;
```

Seuls les produits actifs doivent apparaître. Une tentative anonyme d'`insert`, d'`update` ou de suppression doit échouer.

## 8. Contrôle du stock

`public.adjust_inventory` :

1. revérifie le rôle admin dans PostgreSQL ;
2. verrouille le produit ou la variante avec `for update` ;
3. interdit un résultat négatif ;
4. limite les pièces uniques à une unité, sauf override explicite non exposé par l'interface ;
5. met à jour le stock et écrit `inventory_movements` dans la même transaction.

Cette fonction servira au Sprint Stripe pour les mouvements `sale`, `refund`, `return` et `cancellation`.

## 9. Vérification finale

Après configuration :

```bash
npm run dev
npm run lint
npm run build
```

Tester un compte sans rôle admin, puis un compte admin. Le premier doit être refusé et déconnecté ; le second doit pouvoir créer un produit, envoyer plusieurs images, l'ajouter à des collections et ajuster son stock avec une raison.
