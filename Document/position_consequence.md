# Tispi : conséquences structurelles et propriétés avancées

**Philippe Destrumel**
2025 — Preprint — https://github.com/wvanim/TiSpI

*Ce document suppose que le lecteur a lu le position paper : Tispi : [faire du temps le substrat structurel de l'interface.](https://github.com/wvanim/TiSpI/blob/main/Document/position_paper.md)*

---

## Abstract

Le modèle Tispi — fondé sur l'alternance stricte Piece/Face dans un arbre Temps/Espace — ne se limite pas à organiser les interfaces. Sa structure induit des propriétés qui émergent naturellement de l'invariant, sans mécanisme supplémentaire.

Ce document explore trois de ces propriétés.

* La capacité à définir des templates paramétrables, par le biais de Pieces placées en commentaire dans la structure.
* La navigation cristalline : la régularité de l'arbre permet d'accéder directement à certains sous-groupes depuis la racine, sans traverser tous les niveaux intermédiaires.
* La protection structurelle induite par la séparation stricte du temps et de l'espace : une classe entière d'interférences entre niveaux opératifs et visuels devient impossible par construction.

Ces trois propriétés sont illustrées par des cas d'usage concrets issus de Wvanim, l'implémentation de référence du modèle.

---

## 1. Templates paramétrables

Dans Tispi, une Piece peut être marquée "en commentaire" — présente dans la structure mais non rendue. Elle existe dans l'arbre, elle respecte l'invariant Piece/Face, mais elle est invisible à l'exécution.

Cette propriété permet de constituer des bibliothèques de templates paramétrables. Un template est une Piece en commentaire dont la structure est complète — ses Faces, ses tracks, ses propriétés — mais dont les valeurs sont exprimées en variables. Il est instanciable à la demande, sans modifier la structure de l'arbre actif.

**Exemple : incrustation d'animation sur une vidéo**

*Figure 1 — Template d'incrustation d'animation sur une vidéo. Les commandes de lecture pilotent la vidéo — l'animation s'ajuste automatiquement.*
<img width="949" height="742" alt="im52" src="https://github.com/user-attachments/assets/59d2599c-df47-49ca-96bb-af59f99392c4" />


Un template d'incrustation définit la structure de l'animation — positions, comportements, transitions — indépendamment de la vidéo sur laquelle elle s'applique. La vidéo est le contenu variable : elle change, le template s'adapte. Les commandes de lecture pilotent la vidéo — lecture, pause, goto — et l'animation s'ajuste automatiquement, sans intervention supplémentaire.

La séparation entre le template et son contenu est garantie par la structure Tispi : le modèle ne connaît pas la vidéo, il définit uniquement le cadre dans lequel elle s'inscrit.

---

## 2. Navigation cristalline et réduction sémantique

La régularité de l'arbre Tispi — l'alternance stricte Piece/Face à chaque niveau — confère à l'arbre une propriété topologique : sa structure est prévisible à chaque niveau, comme celle d'un cristal.

Cette régularité permet au concepteur de définir, pour chaque Piece, deux contextes de comportement distincts : celui du groupe en cours d'édition, et celui d'un sous-groupe. Ces deux contextes exposent des propriétés différentes de la même Piece.

*Figure 2 — Autorisation de modification des propriétés d'une Piece selon son contexte : groupe courant (gauche) et sous-groupe (droite).*
<img width="371" height="375" alt="im75" src="https://github.com/user-attachments/assets/23a3e47f-5c5c-4153-8913-9cb70ad98ec9" />

Dans Wvanim, ce cadre de propriétés est explicite : une Piece peut être éditable, draggable, resizable, avec rotation et couleur modifiables dans son groupe courant — et n'exposer qu'un sous-ensemble de ces propriétés lorsqu'elle est observée depuis un sous-groupe. Le concepteur définit ce qui est accessible selon le niveau d'observation.

Cette définition est fiable parce que la structure cristalline garantit que chaque niveau est exactement là où il est attendu. Dans un arbre irrégulier, cette garantie n'existe pas — le comportement d'une Piece dépendrait du chemin parcouru pour y accéder. Dans Tispi, il dépend uniquement de sa position structurelle.

**Réduction sémantique par branche paramétrable**

La navigation cristalline rend possible une opération plus puissante : la réduction sémantique.

Lorsqu'une branche de l'arbre est suffisamment stable et réutilisable, elle peut être réduite à un nœud unique — nommé, paramétré, avec une interface d'entrée et de sortie définie :

```
Nœud réduit
    Piece           // point d'entrée — s'accroche à une Face parente
        Face        // point de sortie — reçoit les Pieces-vignettes
```

Ce nœud réduit possède une étiquette — son nom sémantique — et des paramètres — ses options de décoration et de comportement. Il cache la branche complète, placée en bibliothèque, et n'expose que ce que l'utilisateur doit voir et configurer.

L'arbre Tispi est alors composé de deux entités de nature distincte : l'unité Piece/Faces, élément atomique du modèle, et l'objet branche sémantique, unité définie par le concepteur. Ces branches sémantiques constituent la matière première des bibliothèques de templates paramétrables. Déposées dans une bibliothèque en ligne, elles deviennent des objets réutilisables, instanciables à la demande, partageables entre concepteurs.

**Réduction minimale : le nœud PieceFace**

La réduction minimale de l'arbre Tispi est le cas d'une Piece ne possédant qu'une seule Face. Dans ce cas, Piece et Face peuvent être fusionnées en un nœud unique — **PieceFace** — qui conserve les deux parties séparées à l'intérieur d'un même objet. Cette réduction est réversible : la PieceFace peut être développée en Piece et Face distinctes à tout moment, suivant le besoin. Elle est naturellement déductible des réductions de branche, et constitue le cas limite de la simplification de l'arbre — en dessous, l'invariant Piece/Face ne peut plus être respecté.

Cette propriété éclaire rétrospectivement la relation entre Tispi et HTML. Une page HTML traditionnelle a exactement la même structure en Tispi et en HTML traditionnel : c'est un arbre de PieceFaces — des Pieces n'ayant chacune qu'une seule Face. Le HTML traditionnel est donc un cas dégénéré de Tispi, où la dimension temporelle n'est pas exploitée. Tispi ne rompt pas avec HTML — il révèle ce que HTML aurait pu être si le temps avait été traité comme un substrat structurel dès l'origine.

*Figure 3 — Temps/espace inscrit dans une page HTML.*
<img width="904" height="611" alt="im54" src="https://github.com/user-attachments/assets/138e45c0-743b-4363-a0e2-cef0a81c2507" />

---

## 3. Protections induites par la séparation Temps/Espace

La séparation stricte entre le temps — porté par les Pieces — et l'espace — décrit par les Faces — n'est pas seulement une élégance formelle. Elle constitue une **protection active** contre une classe entière d'interférences structurelles.

Dans les modèles habituels, le temps et l'espace sont mélangés : une animation modifie une propriété visuelle, un état visuel déclenche une logique temporelle, un composant cumule des responsabilités des deux niveaux. Ce mélange est la source de la majorité des conflits dans le développement d'interfaces complexes.

Dans Tispi, ces deux niveaux ne peuvent pas se mélanger — l'invariant l'interdit par construction. Une Piece ne peut pas devenir une Face. Une Face ne peut pas porter une timeline. Chaque élément a un rôle structurel unique et non ambigu.

**Ce que cette séparation garantit**

Un ajout dans le niveau temporel — une nouvelle track, une nouvelle key — ne peut pas créer d'effet visuel non intentionnel. Un ajout dans le niveau spatial — une nouvelle Face, une nouvelle composition visuelle — ne peut pas perturber une logique temporelle existante. Les deux niveaux évoluent indépendamment, sans couplage implicite.

**Démonstration par la pratique**

*Figure 4 — Éditeur de décoration et de mouvement développé par un non-informaticien sur six mois.*
<img width="1447" height="788" alt="im72" src="https://github.com/user-attachments/assets/d280e9cc-d2c6-494a-b240-40762645c869" />


Wvanim a été utilisé et étendu par un non-informaticien pendant six mois, au gré de son imagination, en ajoutant progressivement des fonctionnalités de décoration, de mouvement, de bordures, de gradients, d'animations et de perspectives. Aucune interférence structurelle n'est apparue au cours de ce développement. Ce résultat n'est pas le fruit d'une discipline particulière — il est la conséquence directe de la séparation Temps/Espace garantie par l'invariant Piece/Face.

Cette propriété a une implication pratique importante : elle rend le modèle **accessible à des non-informaticiens**. La complexité structurelle est réelle, mais elle est absorbée par l'invariant — pas imposée à l'auteur.

---

## 4. Compatibilité avec les systèmes de raisonnement

Stuart Russell formule ainsi l'exigence fondamentale des systèmes de raisonnement :

*"Reasoning systems require explicit representations of states, actions, and their effects."*

Tispi satisfait cette exigence structurellement :

* Les **états** sont les Faces
* Les **actions** sont les tracks et les keys
* Les **effets** sont les propriétés décrites par les tracks

Et l'arbre Tispi est une représentation **explicite** — pas implicite, pas dispersée dans du code, pas reconstruite à l'exécution. Elle est structurelle, lisible, traversable.

**Évaluation expérimentale**

Cette compatibilité a été évaluée expérimentalement. Des systèmes d'IA soumis au modèle Tispi ont produit, en moins de 30 minutes d'apprentissage, des compositions correctes et complexes : roll-overs imbriqués, groupes paginés, boutons, pop-ups.

La rapidité de cet apprentissage n'est pas seulement une performance — c'est la conséquence directe de la non-ambiguïté du modèle. Une structure régulière, explicite, sans cas particuliers, est naturellement assimilable par un système de raisonnement.

**Perspectives**

Cette propriété ouvre une direction nouvelle : Tispi comme langage d'interface lisible par les IA — une représentation que les systèmes de raisonnement peuvent non seulement apprendre, mais générer, vérifier, et manipuler.

Un système d'IA disposant du modèle Tispi pourrait :

* lire un arbre Tispi et en comprendre les états possibles
* raisonner sur les transitions entre Faces
* générer des arbres Tispi valides comme représentation d'interfaces
* vérifier la cohérence temporelle d'une interface

## 5. Perspectives

L'invariant Piece/Face génère naturellement une structure dérivée : l'arbre sémantique.

Lorsqu'une branche de l'arbre Temps/Espace est suffisamment stable et réutilisable, elle peut être réduite à un nœud unique — nommé, paramétré, avec une interface d'entrée et de sortie définie. Cette branche réduite est un objet sémantique : elle cache sa mécanique interne et n'expose que ce que le concepteur a prévu.

L'arbre Tispi est alors composé de deux entités de nature distincte : l'unité Piece/Faces, élément atomique défini par le modèle, et l'objet branche sémantique, unité définie par le concepteur. Cette distinction entre élément primitif et élément construit évoque la structure d'un langage formel à deux niveaux — lexical et syntaxique. L'unité Piece/Faces est l'alphabet. L'objet branche sémantique est le mot construit. L'arbre entier est une phrase — une composition valide selon les règles de l'invariant.

Cette analogie ouvre une direction de recherche explicite : Tispi comme grammaire d'interfaces. Une telle formalisation permettrait de définir rigoureusement ce qu'est une interface valide au sens de Tispi, de caractériser les classes d'interfaces descriptibles, et d'envisager des outils de vérification ou de génération automatique basés sur cette grammaire.

---

## 6. Références

Harel, D. (1987). Statecharts: A visual formalism for complex systems. *Science of Computer Programming*, 8(3), 231–274.

W3C (2008). Synchronized Multimedia Integration Language (SMIL 3.0). World Wide Web Consortium.

Destrumel, P. (2025). TiSpI — Time Space Interface. https://github.com/wvanim/TiSpI
