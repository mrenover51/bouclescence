# SEO France — Bouclescence

## Périmètre

Le site cible actuellement la France, en français et en EUR. Aucun contenu localisé ou attribut produit ne doit être ajouté sans information réelle. L’architecture centralise les URL dans `src/lib/seo.ts`, ce qui permettra plus tard d’ajouter une stratégie internationale sans la préinstaller aujourd’hui.

## URL publique

Renseigner en production :

```env
NEXT_PUBLIC_SITE_URL=https://www.votre-domaine.fr
```

Cette valeur doit correspondre exactement au domaine canonique choisi (avec ou sans `www`, mais une seule version). Elle alimente les canonical, Open Graph, JSON-LD, sitemap, robots et le flux Merchant Center. Après choix du domaine, configurer une redirection permanente de toutes les autres variantes vers cette origine.

## Architecture SEO

- `/` : présentation de la marque, de son offre et des créations mises en avant.
- `/boutique` : catalogue complet des produits actifs.
- `/collections` : index utile des collections actives et indexables.
- `/collections/[slug]` : contenu éditorial et produits d’une collection réelle.
- `/produit/[slug]` : page unique d’un produit actif.
- Les produits non actifs renvoient une 404 et ne sont jamais chargés publiquement.
- Les espaces administratifs, compte, panier, checkout et commande sont `noindex` et exclus du sitemap.
- Les pages juridiques sont accessibles et `noindex, follow` tant que leur contenu reste provisoire.

## Métadonnées et canonical

Les produits utilisent d’abord `products.seo_title` et `products.seo_description`, puis un fallback fondé sur le nom et la description réelle. Les collections suivent la même règle. Chaque page indexable déclare son URL canonique sans paramètres, ce qui neutralise les variantes de tracking, tri ou filtre.

## Sitemap et robots

`/sitemap.xml` contient les pages éditoriales utiles, les produits `active` et les collections actives dont `is_indexable = true`. `updated_at` est utilisé comme `lastModified` lorsque disponible. Le sitemap ne contient aucune route privée ou transactionnelle.

`/robots.txt` autorise les ressources publiques et exclut les chemins administratifs, compte, checkout, commande et panier. Il référence le sitemap sans bloquer CSS, JavaScript ou images.

## Données structurées

- `Organization` et `WebSite` sont présents globalement.
- `Product` et `Offer` sont produits depuis les données Supabase : nom, description, images, SKU si disponible, marque, URL, prix EUR et disponibilité réelle.
- `BreadcrumbList` accompagne les fils d’Ariane visibles.
- Aucun avis, note, matériau, origine ou caractéristique non renseignée n’est inventé.

Après mise en ligne, valider des pages réelles avec Google Rich Results Test et Schema Markup Validator.

## Flux Google Merchant Center

Le flux est disponible sur `/api/feeds/google-shopping.xml`. Il contient uniquement les produits actifs et fournit : identifiant, titre, description, URL, image principale, images supplémentaires, disponibilité, prix EUR, marque Bouclescence et état neuf.

Avant activation Merchant Center :

1. renseigner le domaine définitif et le vérifier dans Merchant Center ;
2. vérifier que les mentions légales, retours, livraison et coordonnées sont complètes ;
3. contrôler les exigences de livraison et de retours dans Merchant Center ;
4. tester le flux et corriger les diagnostics produit par produit ;
5. ajouter GTIN/MPN uniquement lorsqu’ils existent réellement.

## Administration

Les fiches produit proposent le slug, le titre SEO, la meta description, des compteurs indicatifs et un aperçu Google. Les recommandations de 60 et 155 caractères ne bloquent pas l’enregistrement.

Les collections proposent : introduction visible, contenu éditorial complémentaire, titre SEO, meta description et contrôle d’indexation. Ne créer que des collections ayant un assortiment et une utilité réels.

## Rédaction des produits

- Donner un nom distinct et une description propre à chaque création.
- Décrire d’abord ce que l’acheteuse voit et l’usage du bijou.
- Ajouter dimensions, poids, matériaux, entretien et origine uniquement lorsqu’ils sont vérifiés.
- Éviter les listes de mots-clés et les textes presque identiques.
- Réserver le titre SEO à une formulation concise et naturelle.
- Rédiger une meta description attractive ; Google peut néanmoins choisir un autre extrait.

## Photos

- Utiliser une photo principale nette, cohérente et représentative.
- Compléter `alt_text` par une description visuelle courte, sans accumulation de mots-clés.
- Conserver plusieurs angles réellement utiles.
- Éviter les fichiers inutilement lourds ; cadrage et dimensions doivent rester cohérents.
- Les miniatures secondaires sont chargées paresseusement, tandis que l’image principale de la fiche est prioritaire.

## Prochaines actions Google

1. Finaliser le domaine et `NEXT_PUBLIC_SITE_URL`.
2. Exécuter la migration SEO des collections.
3. Compléter les données réelles de marque, produits, livraison, retours et mentions légales.
4. Créer Google Search Console, valider le domaine et soumettre `/sitemap.xml`.
5. Contrôler l’indexation, les Core Web Vitals et les erreurs 404 dans Search Console.
6. Créer Merchant Center seulement lorsque les informations commerciales sont définitives.
7. Obtenir des liens et mentions éditoriales légitimes plutôt que créer des pages artificielles.
