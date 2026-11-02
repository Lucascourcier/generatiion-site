# GENERATiiON

Site français **sans WordPress ni base de données**, construit avec Eleventy et publié sur GitHub Pages. Reprise du contenu et de l'identité visuelle de [generatiion.org](https://generatiion.org/) : couleurs terracotta/crème, Montserrat, photos, accueil, histoire, équipe, actualités, contact et programme Mahay.

Adresse GitHub Pages : **https://lucascourcier.github.io/generatiion-site/**. Le domaine `generatiion.org` et son DNS ne sont pas modifiés.

## Publier une actualité depuis GitHub

1. Ouvrir `src/actualites`, puis **Add file → Create new file**.
2. Nommer le fichier `mon-article.md` (minuscules, tirets, sans accents).
3. Coller ce modèle et remplacer les textes :

```markdown
---
title: "Titre de l’actualité"
description: "Résumé affiché dans le journal de bord."
published: "2026-11-03"
image: /assets/images/mon-image.jpg
imageAlt: "Description de ce que montre la photo"
---
Le texte de l’article, avec **du gras** si nécessaire.

## Un intertitre

Un autre paragraphe.

[Nous contacter]({{ '/contact/' | url }}).
```

4. Ajouter l'image dans `src/assets/images` avec **Add file → Upload files**. Utiliser uniquement des images dont l'association détient les droits et éviter les données personnelles non autorisées.
5. **Commit changes** sur `main` (ou proposer une pull request). L'onglet **Actions** montre la publication. La mise en ligne prend généralement quelques minutes.

Le titre, le résumé, l'image et son texte alternatif sont obligatoires. `published` est facultatif : ne pas inventer une date inconnue. Les articles sont triés du plus récent au plus ancien ; les deux rubriques reprises du journal original utilisent `order: 1` et `order: 2` pour rester en tête. Pour les désépingler, supprimer `order`.

Les liens internes dans le texte Markdown doivent utiliser le filtre `url` comme dans le modèle pour fonctionner sous `/generatiion-site/`. Ne pas saisir un lien vers `/contact/` directement : il ignorerait le sous-dossier GitHub Pages.

## Modifier les pages et les images

| Contenu | Fichier |
|---|---|
| Accueil | `src/index.njk` |
| Notre histoire | `src/about.njk` |
| Membres, citations et portraits | `src/_data/team.json` |
| Journal de bord | `src/actu.njk` et `src/actualites/*.md` |
| Contact et adresses email | `src/contact.njk` |
| Programme Mahay | `src/generatiion-mahay.njk` |
| Lien du dossier Mahay et métadonnées | `src/_data/site.json` |
| Navigation | `src/_data/navigation.json` |
| Couleurs et mise en page | `src/assets/site.css` |

Pour remplacer une photo sans modifier le code, téléverser une nouvelle image **avec exactement le même nom et la même extension** dans `src/assets/images`. Pour changer son nom, modifier également sa référence dans la page, le fichier Markdown, `team.json` ou le CSS. Préférer des images de 1200–1600 px, compressées, et des noms sans espaces. Les images du site original sont stockées localement ; `src/assets/images/sources.json` conserve leur provenance.

Les polices Montserrat sont locales, sous licence SIL Open Font License (`src/assets/fonts/OFL.txt`). Aucun script WordPress, outil de suivi, CMS ou service tiers n'est chargé à l'affichage.

## Contact et candidatures

**Choix retenu : liens email, pas de formulaire.** Les boutons ouvrent l'application de messagerie du visiteur vers les adresses publiques `contact@generatiion.org` et `communication@generatiion.org`. Le lien email du pied de page conserve `adm@generatiion.org`. Le site ne collecte ni ne transmet de message et n'affiche jamais une fausse confirmation d'envoi.

Le programme Mahay conserve le [dossier Google Drive existant](https://drive.google.com/file/d/1k3ob92ifNQ9b3mgX8y7GRnMgnBGilZbc/view?usp=drive_link). Aucun envoi de candidature, service de formulaire ou compte Salesforce n'a été ajouté. Le visiteur doit disposer d'une messagerie configurée pour utiliser les liens `mailto:`.

## Développement local

Node.js 22 ou plus récent :

```sh
npm ci
npm run dev
```

Ouvrir **http://localhost:4321/generatiion-site/**. `npm test` reconstruit le site puis vérifie les pages, les liens, les ressources locales, les métadonnées, les contacts et le lien Mahay. `npm run build` génère `_site`, qui n'est pas commité.

Le préfixe par défaut est `/generatiion-site/`. Pour un autre hébergement, définir `PATH_PREFIX` (par exemple `/`) avant la construction, et adapter `origin` dans `src/_data/site.json`. Aucun fichier `CNAME` n'est créé.

## GitHub Pages

Dans **Settings → Pages → Build and deployment**, sélectionner **GitHub Actions**. Le workflow `.github/workflows/pages.yml` :

- vérifie les pull requests sans les déployer ;
- construit, vérifie et déploie chaque changement de `main` ;
- permet aussi un lancement manuel depuis **Actions** ;
- utilise uniquement les permissions GitHub Pages et le jeton éphémère fourni par GitHub.

Il faut activer GitHub Actions et autoriser l'environnement `github-pages` à déployer `main`. Aucun secret applicatif n'est nécessaire.

## Périmètre de la migration

Contenus consultés sur le site source le 2 novembre 2026. Les six pages publiques, les citations de l'équipe, le programme et le dossier Mahay ont été repris. Le texte de l'article « Présentation » conserve sa date publique du 11 mars 2026 et son chemin `/presentation/`. Les rubriques « Concours mahay » et « Nous soutenir » sont maintenant des articles Markdown, sans date de publication inventée.

Les contenus de démonstration WordPress (« Hello world! » et la FAQ en faux latin) n'ont pas été migrés. Le formulaire SureForms, dépendant de WordPress, a été remplacé par les liens email à la demande de l'utilisateur. La navigation ajoute un accès direct aux actualités ; les images qui étaient chargées en HTTP sur le site source sont désormais locales.
