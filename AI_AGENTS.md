# TiSpI for AI agents

## Comptibilité IA

Les propriétés intrinsèques au modèle, pas des promesses sur l'IA.

| Propriété de Tispi | Avantage identifiable |
|---|---|
| **Alternance régulière Temps/Espace** | Les types de relations sont prévisibles ; la même règle de composition s’applique à toute profondeur. |
| **Évolution temporelle décrite par pistes** | Les états, valeurs et transitions sont directement accessibles, avec moins de comportement à reconstruire à partir d’instructions dispersées. |
| **Séparation par environnement affecté** | Une demande peut être localisée et décomposée selon les informations nécessaires à sa résolution. |
| **Modules avec paramètres et slots** | L’agent peut configurer ou composer une unité à travers son interface, sans examiner son implémentation. |
| **Réduction en nœud étiqueté et sémantique** | L’agent peut travailler à une échelle globale puis développer seulement les branches nécessaires. |
| **Rôles explicites dans Tispi/IA** | Le document fournit une qualification fonctionnelle que l’agent aurait autrement à déduire. |

## Le circuit

Un agent IA ne travaille jamais sur le format moteur. Le document lui parvient par un **export** au format Tispi/IA ; l'agent le lit, le vérifie ou le modifie ; le résultat revient dans la page par **réimport**. Les transformations de l'export sont conçues réversibles : rien ne doit se perdre dans l'aller-retour. L'export IA n'est pas encore écrit dans le moteur ; cette réversibilité sera vérifiée par un test aller-retour.

## Tispi/IA

Des modifications réversibles sont appliquées aux scripts HTML envoyés aux IA.

**Le format IA diffère du format moteur sur quatre points.**

1. **Les tags nomment des rôles.** `tsi-p`, `tsi-g`, `tsi-f`, `tsi-pg` et `tsi-pf` sont des règles techniques du moteur ; non adapté pour l'IA.  
Format IA répond à des rôles fonctionnels clairs:
   - `tsi-p` devient `tsi-morph` quand il possède plusieurs faces, affichées successivement ;
   - `tsi-p` devient `tsi-pilot` quand il n'a qu'une face, qui échange avec lui : par exemple la synchronisation sur une vidéo ;
   - `tsi-g` et `tsi-pg` deviennent `tsi-group` ;
   - `tsi-f` et `tsi-pf` deviennent `tsi-leaf`.
2. **Les options s'écrivent `@nom`** au lieu de `$$nom`.
3. **La relation s'écrit `~>`** au lieu de `->`, et la configuration d'une piste, `!<…>`, est rapatriée sous ses noms : `@duration = 41;`.
4. **Le document est compressé et modularisé.** Une branche stable est réduite à un nœud paramétré, et le document replié ne montre que les nœuds concernés. C'est le gain mesuré en septembre, sur un seul document : moins 43 pour cent de tokens d'entrée et moins 46 pour cent en coût. Le même mécanisme existe pour le CSS, avec ses templates.

## Un exemple : le bouton dans les deux formats

Le bouton du [README](README.md), au format moteur :

```html
<tsi-p id="button" data-tsi="&button 0:OUT; 1:OVER; 2:PUSHED;  &synchro 0:stop;  &face 0:out; 1:over; 2:pushed;">
  <tsi-f id="out">…</tsi-f>
  <tsi-f id="over">…</tsi-f>
  <tsi-f id="pushed">…</tsi-f>
</tsi-p>
```

Le même, au format IA : la Pièce a plusieurs faces successives, c'est un `tsi-morph` ; ses faces sont des `tsi-leaf`. Les pistes ne changent pas.

```html
<tsi-morph id="button" data-tsi="&button 0:OUT; 1:OVER; 2:PUSHED;  &synchro 0:stop;  &face 0:out; 1:over; 2:pushed;">
  <tsi-leaf id="out">…</tsi-leaf>
  <tsi-leaf id="over">…</tsi-leaf>
  <tsi-leaf id="pushed">…</tsi-leaf>
</tsi-morph>
```

## Ce que l'agent fait, et ce qui a été mesuré

Trois tâches : **lire** l'état d'une page à une frame donnée, **écrire** un ajout, **déboguer** une page qui contient des fautes. Une étude pilote de septembre 2026, sur des sessions neuves et le seul document de référence, n'a observé aucun échec en lecture ni en débogage, et des fautes d'écriture qui désignaient chacune une règle non écrite : la règle écrite et incarnée dans un exemple, la faute disparaît.

Les effectifs sont petits, trois sessions par cellule, et les mesures portent sur la grammaire de septembre. Les chiffres, leurs intervalles et ce qui reste à mesurer sont dans l'[étude pilote](Document/Etude_pilote_IA_2026-09.md).

## Les fautes à ne pas commettre

Les trois fautes récurrentes relevées pendant les mesures, avant que les règles soient écrites :

| Faux | Juste |
|---|---|
| prendre la durée d'un effet, `<8:…>`, pour un numéro de frame | la durée est dans le chevron ; la frame est devant les deux-points de la key |
| écrire une dimension ou une variable dans `style=` | une dimension s'écrit en piste, `&size`; `style=` n'est ni lu ni interpolé |
| instancier un module sous un autre tag que celui du module | le tag de l'instance est le tag du module |

## Références

- La grammaire du format moteur : [GRAMMAR.md](GRAMMAR.md) ; le vocabulaire : [GLOSSARY.md](GLOSSARY.md).
- La fiche complète du format IA, ses règles et ses exemples, sera publiée dans ce dépôt.
