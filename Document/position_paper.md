

---

# Tispi : faire du temps le substrat structurel de l'interface

**Philippe Destrumel**
2025 — Preprint — https://github.com/wvanim/TiSpI

---

## Abstract

Les modèles actuels de structuration des interfaces utilisateur traitent le temps comme un effet — une animation, un événement, une transition. Tispi propose une approche différente : faire du temps le substrat structurel de toute interface.

À l'instar de la programmation orientée objet, qui s'est inspirée du monde réel pour modéliser les entités et leurs relations, Tispi prend le même monde réel comme référence — mais pour une dimension que la POO n'a pas traitée : la persistance des entités dans le temps.

Le modèle repose sur deux éléments seulement : la Piece, entité persistante porteuse du temps, et la Face, état de cette entité à un instant donné. Leur alternance stricte dans un arbre Temps/Espace constitue l'invariant structural du système.

Wvanim, un éditeur visuel d'animation, constitue l'implémentation de référence du modèle. Nous montrons que ce modèle s'applique naturellement à la structuration des interfaces utilisateur, et qu'il révèle une capacité latente du HTML restée jusqu'ici inexploitée.

---

## 1. Motivation

La programmation orientée objet a posé un geste fondateur : s'inspirer du monde réel pour structurer un modèle formel. Les entités du monde — objets, relations, comportements — sont devenues les abstractions centrales du développement logiciel.

Tispi pose le même geste, mais sur une dimension que la POO n'a pas traitée : le temps.

Dans le monde réel, toute entité — objet, processus, état ou relation — existe dans le temps, même lorsqu'elle semble inaltérée. L'immobilité n'est pas l'absence de temps, c'est un état particulier sous sa contrainte. Une interface qui affiche un bouton immobile ne suspend pas le temps — elle représente une entité dont l'état n'a pas changé.

Les modèles actuels de structuration des interfaces traitent le temps comme un effet secondaire : une animation déclenchée, un état modifié, un événement écouté. Le temps n'est pas dans la structure — il est appliqué sur elle, de l'extérieur.

Tispi inverse ce rapport : le temps est le substrat. Toute entité de l'interface est d'abord une entité temporelle. Son état visible — sa Face — est une conséquence de sa position dans le temps, pas une propriété indépendante.

---

## 2. Origine du modèle

Wvanim est un éditeur visuel d'animation dont le développement a débuté en 1999. La formalisation du modèle Tispi est venue progressivement, lorsqu'il est apparu que tout ajout à la barre de temps ou à la zone de composition engendrait des cas particuliers. L'invariant Piece/Face n'a pas été conçu *a priori* — il a émergé comme la structure minimale capable d'éliminer ces cas particuliers. Wvanim constitue aujourd'hui l'implémentation de référence de ce modèle.

---

## 3. Le modèle

Tispi repose sur deux éléments seulement.

La **Piece** est l'entité persistante. Elle existe dans le temps, elle le porte. Elle ne décrit pas ce qui est visible — elle décrit ce qui *dure*. Une Piece peut représenter un objet visuel, un processus, un état système, ou toute entité dont l'existence s'étend dans le temps.

La **Face** est l'état de la Piece à un instant donné. C'est ce qui est visible, audible, ou actif. Une Piece possède plusieurs Faces — mais une seule est active à tout instant. Le changement de Face est un changement d'état de l'entité, pas un remplacement de l'entité elle-même.

Ces deux éléments s'organisent en un arbre dont les niveaux alternent strictement :

```
Piece → Faces → Pieces → Faces → Pieces...
```

Cet invariant est absolu. Une Piece ne contient jamais directement une autre Piece — elle contient des Faces, et ce sont les Faces qui peuvent contenir des Pieces enfants. Une Face qui contient des Pieces est dite Face-Groupe : ce n'est pas un type distinct, c'est simplement une Face qui a des enfants.

Cette structure minimale suffit à décrire n'importe quelle interface — des composants visuels les plus simples aux compositions les plus complexes, synchronisées dans le temps.

<img width="1129" height="751" alt="tispi001" src="https://github.com/user-attachments/assets/b76bb231-5d49-4954-b8ed-3a375658f66e" />

**Les tracks**

Chaque Piece porte un ensemble de tracks. Une track est le script intégral d'une propriété de la Piece — sa valeur initiale, ses évolutions, ses transitions, jusqu'à son état final. Il n'y a pas de comportement dispersé dans des gestionnaires externes : tout ce que vit une propriété est décrit en un seul endroit, sur sa track.

Une track est composée de keys. Chaque key peut définir une valeur, une transition vers la key suivante, ou les deux. Les transitions ne sont pas des effets appliqués de l'extérieur — elles font partie de la structure de la track, au même titre que les valeurs.

Les propriétés décrites par les tracks couvrent toutes les dimensions de la Piece : la Face active, la position, la transformation, la couleur, les actions, les événements. Chaque dimension a sa track propre — elles sont toutes synchronisées sur la timeline de la Piece.

Les valeurs et les effets peuvent être exprimés en variables, ce qui rend le modèle paramétrique : une track ne décrit pas un comportement unique, elle peut décrire une famille de comportements.

<img width="1138" height="702" alt="tispi002" src="https://github.com/user-attachments/assets/59d0d6dc-090c-45ff-925a-126509e64fa5" />

**La Piece horloge**

Le temps n'est pas un flux global dans Tispi — il est local à chaque groupe. Dans un groupe animé, une Piece horloge porte le temps et synchronise les Pieces du groupe sur sa timeline.

Cette Piece horloge peut être autonome, asservie à une Piece horloge parente, ou asservie à la timeline d'un média externe — son ou vidéo. Cette dernière configuration permet l'incrustation automatique d'animation sur un média : les commandes de lecture pilotent le média, et l'animation s'ajuste en conséquence sans intervention supplémentaire.

La Piece horloge est une Piece comme les autres — elle respecte l'invariant Piece/Face. C'est sa position dans la structure et sa fonction de référence temporelle qui la distinguent, pas sa nature.

**La branche sémantique**
L'invariant Piece/Face génère naturellement une structure dérivée. Lorsqu'une branche de l'arbre est suffisamment stable et réutilisable, elle peut être réduite à un nœud unique — nommé, paramétré, avec une interface d'entrée et de sortie définie. Cette branche réduite est un objet sémantique : elle cache sa mécanique interne et n'expose que ce que le concepteur a prévu. L'arbre Tispi est alors composé de deux entités de nature distincte : l'unité Piece/Faces, élément atomique du modèle, et l'objet branche sémantique, unité définie par le concepteur.

Ces branches sémantiques constituent la matière première des bibliothèques de templates paramétrables. Déposées dans une bibliothèque en ligne, elles deviennent des objets réutilisables, instanciables à la demande, partageables entre concepteurs. Le modèle Tispi fournit ainsi non seulement une structure d'organisation des interfaces, mais le fondement d'un écosystème de composants.

Une page HTML traditionnelle est un cas particulier de Tispi : un arbre dont toutes les Pieces n'ont qu'une seule Face. La structure est identique — seule la richesse temporelle diffère. Tispi ne rompt pas avec HTML — il le généralise. C'est en ce sens qu'il révèle une capacité latente du HTML restée jusqu'ici inexploitée.

---

## 4. Ce que ça change

Six situations illustrent concrètement ce que le modèle Tispi rend naturel, là où les approches habituelles introduisent de la complexité accidentelle.

**Synchronisation temporelle.** Dans une interface composée de plusieurs éléments animés, synchroniser ces éléments est un problème récurrent. Les solutions actuelles reposent sur des mécanismes externes — gestionnaires d'état, orchestrateurs d'animation, événements partagés. Dans Tispi, la synchronisation est structurelle : toutes les Pieces d'une même Face-Groupe partagent le même instant temporel. Il n'y a rien à synchroniser — la structure l'impose.

**États conditionnels.** Représenter une entité dont l'apparence ou le comportement dépend d'un état — chargement, erreur, succès, inactif — nécessite dans la plupart des modèles une logique conditionnelle explicite, souvent dispersée dans le code. Dans Tispi, ces états sont les Faces de la Piece. Le modèle ne décrit pas *comment* passer d'un état à l'autre — il décrit *quels états existent*. La structure porte l'intention.

**Composition temporelle.** Imbriquer des entités dont les cycles de vie sont indépendants — un composant qui s'anime pendant qu'un autre reste figé — est difficile à exprimer sans couplage implicite. Dans Tispi, chaque Piece porte sa propre timeline. Les Pieces enfants n'héritent de l'activation que lorsque leur Face parente est active. La composition temporelle suit exactement la composition structurelle.

**Synchronisation sur un média externe.** Lorsque la Piece horloge d'un groupe est asservie à la timeline d'une vidéo ou d'un son, l'animation du groupe devient automatiquement synchrone avec ce média. Les commandes de lecture — lecture, pause, goto — pilotent le média, et l'animation s'ajuste sans code supplémentaire. Ce résultat découle directement de la structure : il n'est pas programmé, il est structurel.

**Accessibilité du modèle.** Wvanim, éditeur visuel bâti sur Tispi depuis 1999, a été utilisé et étendu par un non-informaticien sur une période de six mois. L'outil traite des collections d'entités — texte, image, média embarqué — chacune avec ses propres propriétés visuelles et temporelles. Aucun conflit structurel n'est apparu au cours de l'évolution de l'outil. Ce résultat suggère que le modèle Tispi possède une intelligibilité qui dépasse le cercle des informaticiens.

*L'outil et sa documentation sont accessibles à l'adresse : https://github.com/wvanim/TiSpI*

**Composition des états interactifs.** Un bouton illustre la récursivité naturelle du modèle. Une Face porte la Piece bouton — elle définit *quand* le bouton est visible. Cette Piece possède trois Faces : normale, hover, pushed — chacune pouvant contenir ses propres Pieces de composition visuelle :

```
Face                    // apparition du bouton dans le temps
    Piece               // entité bouton
        Face            // état normal
            Pieces...   // composition visuelle
        Face            // état hover
            Pieces...   // composition visuelle
        Face            // état pushed
            Pieces...   // composition visuelle
```

Il n'y a pas de mécanisme spécial pour l'interaction : l'invariant Piece/Face absorbe naturellement tous les niveaux de complexité. L'éditeur Wvanim illustre cette propriété concrètement : du point de vue de l'auteur, une page et son bouton représentent deux niveaux visibles. En réalité, la structure Tispi en compte trois — le niveau intermédiaire, qui porte la mécanique du bouton, est géré par l'outil et reste transparent à l'utilisateur. La complexité structurelle est réelle mais invisible : elle est absorbée par l'éditeur, pas imposée à l'auteur.

---

## 5. Discussion

Le modèle Tispi n'est pas un nouveau langage, ni un nouveau framework. C'est une structure — un invariant d'organisation que les interfaces respectent déjà implicitement, sans le formaliser.

**Rapport aux modèles existants**

Les statecharts de Harel (1987) partagent avec Tispi l'idée d'états exclusifs et de composition hiérarchique. La différence est fondamentale : les statecharts modélisent le comportement d'un système — ils répondent à la question *que fait l'entité ?* Tispi modélise la structure temporelle d'une interface — il répond à la question *comment l'entité existe dans le temps ?*

SMIL (Synchronized Multimedia Integration Language) traite la synchronisation temporelle de médias dans un arbre XML. Tispi partage cette intuition d'un arbre temporel, mais généralise : toute entité d'interface, pas seulement les médias, est soumise à la même structure.

Les composants React ou Web Components gèrent des états internes et des propriétés. Mais le temps n'est pas dans leur structure — il est appliqué via des hooks, des effets, des gestionnaires externes. Tispi propose que le temps soit premier, pas ajouté.

**Ce que Tispi n'est pas**

Tispi est en amont des outils d'édition — qu'ils soient scriptés ou visuels. Il ne produit pas directement l'affichage, l'animation, ou l'interaction. Il fournit le modèle structurel sur lequel ces outils peuvent s'appuyer. Une librairie implémentant Tispi pourrait être consommée par un framework existant comme React, ou servir de modèle de données à un éditeur visuel. Wvanim est un éditeur visuel d'animation bâti sur ce modèle depuis 1999 — il en constitue l'implémentation de référence. Le rendu, l'édition et l'exécution sont délégués à l'environnement qui implémente Tispi.

Tispi n'est pas un moteur de rendu. Il ne produit pas directement l'affichage final — il décrit la structure temporelle dans laquelle les propriétés visuelles, sonores et interactives s'organisent. Le rendu est délégué à l'environnement qui l'implémente.

**Questions ouvertes**

Plusieurs directions méritent une exploration formelle. La première est la définition d'une sémantique opérationnelle complète du modèle — suffisamment précise pour servir de base à une implémentation de référence vérifiable. La deuxième est l'étude de la complexité expressive : quelles classes d'interfaces Tispi peut-il décrire, et lesquelles lui échappent ? La troisième est la question de l'outillage : dans quelle mesure un environnement de conception peut-il s'appuyer sur l'invariant Piece/Face pour assister l'auteur — détection de conflits, visualisation de la structure temporelle, génération de code ?
Une quatrième direction mérite attention : le rapprochement avec la théorie des langages formels. La coexistence de deux entités distinctes dans l'arbre — l'unité Piece/Faces et l'objet branche sémantique — évoque la structure d'un langage formel à deux niveaux : lexical et syntaxique. L'unité Piece/Faces est l'alphabet. L'objet branche sémantique est le mot construit. L'arbre entier est une phrase valide selon les règles de l'invariant. La question de savoir si Tispi peut être formalisé comme une grammaire d'interfaces constitue une direction de recherche ouverte, explorée dans le second document

---

## 6. Références

Harel, D. (1987). Statecharts: A visual formalism for complex systems. *Science of Computer Programming*, 8(3), 231–274.

W3C (2008). Synchronized Multimedia Integration Language (SMIL 3.0). World Wide Web Consortium.

React documentation. Meta Open Source. https://react.dev

Web Components. MDN Web Docs. https://developer.mozilla.org/en-US/docs/Web/API/Web_components

Destrumel, P. (2025). TiSpI — Time Space Interface. https://github.com/wvanim/TiSpI

---

*Ce document est le premier d'une série de deux. Le second explore les conséquences 
structurelles et les propriétés avancées du modèle :*
*Tispi : conséquences structurelles et propriétés avancées*
https://github.com/wvanim/TiSpI/blob/main/Document/position_consequence.md

---

*Note — L'auteur, dyslexique, a utilisé une assistance IA pour la rédaction de ce document. 
Les idées, le modèle, les exemples et les validations sont entièrement de son fait.*
