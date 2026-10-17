# TiSpI — adoption progressive

> Mise à jour du 14 octobre 2026. Ce document remplace une première esquisse (JSON canonique,
> paquets TypeScript `@tispi/*`, attribut `data-tispi-state`, parseur CSS → JSON) qui décrivait
> une architecture envisagée, pas réalisée. Il décrit ce qui tourne aujourd'hui, et ce qui reste à faire.
> Le modèle lui-même (arbre Temps / Espace) est présenté dans le [README](../README.md) et le dossier [Document](../Document).

---

# 1. Positionnement

TiSpI s’intègre dans une page HTML existante en prenant en charge une branche désignée du DOM. Le reste de la page conserve son fonctionnement habituel.

Cette promesse repose sur quatre choix :

* **Une surcouche HTML** : des éléments `tsi-*` dans le DOM et un attribut `data-tsi` pour décrire le temps et le mouvement.
* **Des animations exécutées par le navigateur** : chaque propriété animée passe par la Web Animations API (`element.animate`), et le CSS de l’auteur reste du CSS.
* **Un seul fichier à charger** : `tispi.js`, lisible et commenté, ou `tispi.min.js`, d’environ 65 Ko après compression gzip. Aucune étape de build n’est nécessaire côté page.
* **Un périmètre explicite** : `o_.start(…, racine)` attache le moteur à l’élément désigné et limite son action à cette branche du DOM.

TiSpI reprend le modèle d’e-anim / WvAnim de 1999 et le réécrit pour le DOM.

---

# 2. Ce qui est en place

## 2.1 Le moteur

Un moteur JavaScript, sans dépendance, concaténé en un fichier par `production/build_tispi.js` :

```text
production/tispi.js        le moteur entier, commentaires compris (référence lisible)
production/tispi.min.js    le même, compacté par terser (noms de classes conservés)
```

Il lit les `data-tsi` au démarrage, construit ses objets (pièces, pistes, keys), puis tient le temps :
changement de face, transitions d'entrée et de sortie, plateaux où plusieurs éléments avancent ensemble.

## 2.2 La surface : cinq tags, un attribut

| tag | rôle | ses enfants |
|---|---|---|
| `tsi-p` | la pièce : le temps | ses faces (`tsi-f`, `tsi-g`), affichées **successivement**, une seule à la fois |
| `tsi-f` | la face : le contenu | du HTML libre (texte, images, SVG, composant React…) |
| `tsi-g` | le groupe | des pièces affichées **simultanément** ; seul porteur d'un plateau |
| `tsi-pg` | une pièce et son groupe en **une seule div** | des pièces affichées simultanément |
| `tsi-pf` | une pièce et sa face en **une seule div** | du HTML libre |

Les écritures fusionnées `tsi-pg` et `tsi-pf` sont une seconde écriture, équivalente, d'une pièce à une seule face.
Ce sont les seuls tags que le moteur accepte ; les noms pleins (`tsi-group`, `tsi-morph`, `tsi-leaf`, `tsi-pilot`)
sont réservés au format d'échange IA (§4).

L'attribut `data-tsi` porte tout le comportement. Chaque signe est une nature, jamais échangée :

| signe | nature | exemple |
|---|---|---|
| `$$nom = valeur;` | une option : un réglage du nœud (`@nom` dans le format IA, §4) | `$$duration = 41;` |
| `$nom` | une valeur nommée (`let`, `const`, `css`) ; `<$$default = …>` lui donne une valeur par défaut | `let $scene = this;` · `css $rx = [20, deg];` · `let $n <$$default = 0> = 5;` |
| `&nom …;` | une piste : une propriété qui prend des valeurs dans le temps | `&opacity 0:1; <30:easeInOut> 36:0;` |
| `<…>` | une transition placée avant sa key d'arrivée : un effet avec sa durée et son process, ou une interpolation seule | `<60:easeOut,fade>` · `<easeInOut>` |
| `{ … }` | un script : du JavaScript ordinaire | `{ $scene->$play() }` |

```html
<tsi-p id="carte" data-tsi="&synchro 0:stop;  &mark 0:FERME; 1:OUVERT;  &face 0:ferme; 1:ouvert;">
  <tsi-f id="ferme">…</tsi-f>
  <tsi-f id="ouvert">…</tsi-f>
</tsi-p>
```

## 2.3 Le temps

* **Les pistes décrivent l'évolution des propriétés et les commandes dans le temps.** Les pistes qui animent
  des propriétés CSS s'appuient sur la Web Animations API ; `&face`, `&onClick`, `&synchro` ne sont pas du CSS.
* **Le plateau synchronise.** Un `tsi-g` (ou `tsi-pg`) qui porte `&synchroPlate` fait avancer, arrêter et repartir tous ses enfants ensemble.
  Un élément seul à bouger porte `&synchro` : il échappe alors au plateau de son parent. Le nom dit la portée.
* **Les balises** (`&mark 0:FERME; 1:OUVERT;`) nomment les arrêts ; un script y va par `$carte->$gotoStop("OUVERT")`.
* **Une durée fixe par frame** pour tout le document, donnée à `o_.start` (100/6 ms dans les démonstrations).

## 2.4 Le décor

Le décor s'écrit **en CSS pur**. Où l'écrire dépend de ce qu'il habille :

* **une seule div** : dans le `style=` de cette div ;
* **les éléments d'une branche** : une feuille `@scope { … }` dans le nœud parent commun ; elle voyage avec la branche et n'en sort pas ;
* **un module** : la liste des propriétés que le module emploie, avec le rôle de paramètre ; l'instance leur donne leurs valeurs.

Un élément montre ainsi d'où vient son style. Une dimension ou une position **animée** s'écrit en piste, jamais en `style=`.

## 2.5 Les modules

Un composant se déclare une fois et s'instancie par un nœud réduit, en DOM natif :

```html
<template data-tsi-define="face">
  <tsi-pf data-tsi="…pistes…"><style>@scope { … }</style><slot name="num"></slot></tsi-pf>
</template>

<tsi-module id="face2" use="face" data-tsi="let $i = 2;"><span slot="num">Face 2</span></tsi-module>
```

L'expansion est faite par `o_.start()` : la copie de la définition remplace le nœud, les paramètres
(`let $i = 2;`) se lisent avant le corps, les trous se remplissent par `slot=`.

## 2.6 Les médias

Une vidéo ou un curseur `<input type="range">` placé dans une face peut tenir le temps de son plateau
(`&videoSynchro`, `&sliderSynchro`) ou le suivre.

## 2.7 La sauvegarde

La sauvegarde ré-émet la branche depuis ses objets : tout ce qui n'est pas `data-tsi` est reproduit
à l'identique, le `data-tsi` est régénéré. Une variable y garde sa valeur courante et sa valeur par défaut :

```html
<tsi-p id="scene" data-tsi="$$openDefaultValue = 1;  let $n <$$default = 0> = 5;">
```

`$$openDefaultValue = 1` sur un nœud : la sauvegarde écrit les valeurs par défaut de sa branche ;
`= 0` ou absent : elle écrit les valeurs courantes, celles de la dernière sauvegarde. Un nœud plus bas
peut porter sa propre valeur ; elle vaut pour sa branche et disparaît en sortant.

---

# 3. Intégration dans une page existante

## 3.1 Page HTML ordinaire

`production/demo/demo_integration.html` : un en-tête, du texte, un pied de page, une feuille de style
dans le `head`. Une section contient la seule branche confiée à Tispi, une carte à deux faces et un bouton.

```html
<section id="integration">
  <div id="racine">
    <style>@scope { … }</style>
    <tsi-g id="demo"> … </tsi-g>
  </div>
</section>
<script>o_.start(null, 100/6, null, null, document.getElementById('racine'));</script>
```

Rien d'autre dans la page n'est réécrit.

## 3.2 React

`production/demo/demo_react.html` : une scène Tispi dans une application React 19
(import map esm.sh, Babel dans le navigateur, aucune étape de build).

* React crée les balises `tsi-*` en JSX **sans interpréter** leur `data-tsi` ;
* le composant `Scene` transmet sa racine DOM au moteur depuis un `useEffect` :

```jsx
useEffect(() => { o_.start(null, 100 / 6, null, null, root.current); }, []);
```

* Tispi anime les faces, React les remplit, et chacun peut contenir l'autre :
  la face ouverte accueille un compteur React à état, qui reste interactif pendant l'animation ;
  la face fermée reçoit, par une prop, une branche Tispi décrite en JSX.

React reste l'hôte ; Tispi ne voit que la branche qu'on lui donne. La frontière passe par la face :
au-dessus, le temps et les états sont à Tispi ; dedans, le contenu est à React ou au HTML natif.

## 3.3 Périmètre

Tispi ne se charge que de l'interface : ses faces, ses états, son temps. Un bloc `{ … }` appelle ce
qu'il veut et Tispi prend la valeur qui remonte, sans l'interpréter. Le métier (données, requêtes, store)
reste à ses outils ; la couture est mince : un `goto` sur une balise dans un sens, un bloc JavaScript dans l'autre.

---

# 4. L'échange avec l'IA

Le format d'échange IA est **indépendant** du format moteur : règles de surface seulement, aucun
mécanisme interne. Sa fiche de règles (`doc_presentation_ia.md`) n'est pas encore publiée dans le dépôt ; le dossier
[IA](../IA) contient l'expérience d'évaluation de l'été 2026 et ses prompts, dans un format texte antérieur. Trois différences visibles :

* les tags portent leur nom plein dans le format IA, là où les pages du moteur emploient la notation courte ;
  les correspondances :

  | moteur | format IA |
  |---|---|
  | `tsi-p` | `tsi-morph` s'il contient des faces successives ; `tsi-pilot` si la face réclame un traitement particulier |
  | `tsi-g`, `tsi-pg` | `tsi-group` |
  | `tsi-f`, `tsi-pf` | `tsi-leaf` |

* la relation s'écrit `~>` dans le format IA, `->` dans le moteur ;
* la zone `!<…>` des pistes (durée, pilote) est rapatriée sous ses noms (`@duration = 41;`) pour l'IA.

Le modèle élémentaire (Tispi-basic) est aussi écrit comme une ontologie OWL, vérifiée au raisonneur.

---

# 5. Vérification

* **Batterie node** : 14 batteries, 451 contrôles, tous verts au 14/10 (tokenizer, tête, valeurs, effets,
  macros, runtime, modules, réduction, rôles, filtre, repli, branches).
* **Bancs de navigateur** (Chrome sans tête, `tests_node/nav_*.js`) : chaque page de démonstration a le sien ;
  la page React passe 15/15, le pop-up 10/10, la démonstration 3D 13/13. Seules les captures font foi :
  `getComputedStyle` ne reflète pas une animation WAAPI en cours.
* Le minifié repasse le banc avant chaque livraison.

---

# 6. Feuille de route

## Fait

* moteur en un fichier, lisible et minifié ;
* démarrage sur une racine (`o_.start(…, racine)`) ;
* intégration dans une page ordinaire et dans React ;
* modules sur site (`<template data-tsi-define>` + `<tsi-module use>`) ;
* synchronisation par média (vidéo, curseur) ;
* sauvegarde : valeur courante et valeur par défaut des variables, `$$openDefaultValue` ;
* format d'échange IA, ontologie du modèle élémentaire ;
* page de code colorisé avec loupes de présentation (`demo_structure_3D_2pc_tsi_module_code.html`).

## À faire

* **bibliothèque externe de modules** : fichier de `<template>` chargé avant l'expansion, même registre ;
  les gadgets WvAnim existants (une soixantaine) sont à porter en modules Tispi ;
* **export d'une instance** sous sa forme réduite (`tsi-module` + paramètres) ;
* **`tispi.run`** et propriété réfléchie : le contrat d'entrée pour un hôte (React ou autre) ;
* **le temps en secondes et en pourcentage** : pouvoir écrire le temps d'une key et une durée en secondes ou en
  millisecondes, et en pourcentage, et non plus seulement en frames ;
* **éditeur visuel en ligne** : non livré ; l'éditeur existant reste WvAnim. Le moteur embarque déjà
  ses primitives (sélection, undo/redo), sans page publique ;
* **licence** : à poser sur le dépôt.

---

# 7. Rapport aux standards du web

TiSpI n'attend aucune nouvelle norme : il s'appuie sur les éléments personnalisés, `data-*`,
`<template>` / `<slot>`, `@scope` et les Web Animations. Il n'altère pas HTML et ne redéfinit pas le DOM :
l'arbre DOM **est** le modèle.
