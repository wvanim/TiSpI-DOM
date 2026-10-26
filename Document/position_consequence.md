**Tispi — Modularité, navigation et séparation Temps/Espace**

Philippe Destrumel — Preprint, octobre 2026  
[Projet Tispi](https://github.com/wvanim/TiSpI-DOM)

Ce document prolonge le position paper [« Tispi : faire du temps le substrat structurel de l'interface »](https://github.com/wvanim/TiSpI-DOM/blob/main/Document/position_paper.md).

---

Tispi repose sur une structure *strictly interleaved* : un arbre dans lequel les Pieces et les Faces alternent strictement, à chaque profondeur. Cette organisation donne un cadre commun à la composition des interfaces et à leurs évolutions.

<p align="center">
  <a href="https://www.wvanim.fr/projets_perso/tipsi/schema_piece_face.html">
    <img src="https://www.wvanim.fr/_demo/tispi003a.png" alt="Arbre Temps/Espace" width="100%"><br>
    <sub>L'arbre Temps/Espace (cliquer l'image)</sub>
  </a>
</p>

Les Pieces enfants directes d'une même Face de groupe forment un **plateau** : elles sont synchronisées. Le temps n'est pas global ; chaque plateau porte le sien.

Dans Tispi, **le terme « temporel » désigne les évolutions soumises à la synchronisation du plateau dont la Piece est membre**. Ces évolutions sont portées par les pistes des Pieces. Elles peuvent concerner la structure active, la position, la rotation, les dimensions ou d'autres propriétés pilotées.

<p align="center">
  <a href="https://www.wvanim.fr/projets_perso/tispi/demo_scripts/demo_structure_3D_2pc_tsi_module.html">
    <img src="https://www.wvanim.fr/_demo/plate_motor.jpg" alt="Un plateau de deux Pieces synchronisées" width="75%"><br>
    <sub>Un plateau de deux Pieces synchronisées, écrit en TiSpI DOM (cliquer l'image)</sub>
  </a><br>
  <a href="https://www.wvanim.fr/projets_perso/tispi/demo_scripts/demo_structure_3D_2pc_tsi_module_code.html"><sub>Le script annoté</sub></a>
</p>

Le changement de Face est l'une de ces évolutions possibles ; il ne définit pas à lui seul la dimension temporelle. Une Piece peut conserver la même Face tout en participant à des évolutions synchronisées. Inversement, un effet animé interne à une Face de rendu peut rester indépendant de cette synchronisation et se situer hors du champ temporel de Tispi.

La distinction Temps/Espace porte donc sur les rôles : la Piece porte les évolutions synchronisées ; la Face décrit la présentation sélectionnée et, lorsqu'elle constitue un groupe, la composition qu'elle accueille. « Espace » désigne ici la manifestation, non la géométrie : piloter une position au cours du temps est une évolution de la Piece.

Cette structure permet d'organiser des branches réutilisables, de proposer une navigation uniforme et de séparer les responsabilités temporelles et spatiales. Les exemples présentés ici viennent de deux implémentations du modèle : WvAnim, l'éditeur visuel dans lequel le modèle s'est formé depuis 1999, et TiSpI DOM, son implémentation actuelle en HTML.

**Des branches réutilisables et paramétrables.** Une même organisation Piece/Face se retrouve à toutes les profondeurs de l'arbre. Une branche peut ainsi être considérée comme un module, avec une racine identifiée et une interface de paramètres.

La régularité structurelle fournit un cadre uniforme à cette modularité. Le filtrage des variables à la racine du module permet de distinguer les paramètres exposés de ceux qui restent internes à la branche. Ensemble, ces mécanismes permettent de constituer des templates paramétrables.

Dans WvAnim, une Piece peut être placée « en commentaire » : elle reste présente dans le document, avec sa structure, ses Faces, ses pistes et ses propriétés, mais elle n'est pas rendue. Cette possibilité permet de conserver une définition de template en vue de son instanciation.

Dans TiSpI DOM, cette définition est l'élément HTML standard `<template>` : présent dans le document, non rendu. Une instance l'appelle par son nom, lui donne ses paramètres et remplit ses points de composition. La [structure 3D, étape 3](https://www.wvanim.fr/projets_perso/tispi/demo_scripts/demo_structure_3D_1pc_tsi_module.html) en montre l'usage : un module déclaré une fois, instancié cinq fois.

Le template décrit une organisation réutilisable. Ses paramètres permettent de l'adapter à un contenu ou à un usage sans reconstruire sa mécanique interne. Sa définition reste disponible en bibliothèque, tandis que les instances sont utilisées dans les compositions.

L'incrustation d'une animation sur une vidéo illustre ce principe. Le template définit les positions, les comportements et les transitions. La vidéo constitue un contenu variable. Dans l'exemple réalisé avec WvAnim, les commandes de lecture pilotent la vidéo et l'animation suit sa progression : lecture, pause et déplacement dans le temps.

*Figure 1 — Template d'incrustation d'animation sur une vidéo. Les commandes pilotent la vidéo et l'animation suit sa progression.*
<img width="949" height="742" alt="im52" src="https://github.com/user-attachments/assets/59d2599c-df47-49ca-96bb-af59f99392c4" />

La même synchronisation existe en TiSpI DOM : [une vidéo pilotée par sa barre de commande](https://www.wvanim.fr/_demo/demo_animated_html/video_synchro/testVideoSynchro2.html), et [son script](https://www.wvanim.fr/_demo/demo_animated_html/video_synchro/testVideoSynchro2_code.html).

Deux propriétés interviennent ici : la paramétrisation permet de réutiliser la composition avec différents contenus ; le synchronisme permet de coordonner leurs évolutions. Leur association rend l'adaptation transparente pour l'auteur une fois le template défini.

**Une navigation fondée sur la régularité de l'arbre.** L'expression « navigation cristalline » désigne la possibilité d'exploiter cette organisation répétitive pour parcourir et manipuler les compositions selon des règles communes.

À chaque profondeur, les mêmes rôles se retrouvent : une Piece porte les évolutions synchronisées et sélectionne une Face ; une Face de groupe accueille des Pieces. Cette régularité permet à l'éditeur de proposer des opérations cohérentes d'un niveau à l'autre.

Elle fournit notamment un cadre pour distinguer les propriétés accessibles lorsqu'une Piece appartient au groupe en cours d'édition et celles qui restent accessibles lorsqu'elle est manipulée à travers un sous-groupe.

Dans WvAnim, le concepteur peut autoriser le déplacement, le redimensionnement, la rotation ou la modification de couleur dans un contexte, tout en n'exposant qu'un sous-ensemble de ces possibilités dans l'autre.

*Figure 2 — Propriétés modifiables d'une Piece selon son contexte : groupe courant à gauche, sous-groupe à droite.*
<img width="371" height="375" alt="im75" src="https://github.com/user-attachments/assets/23a3e47f-5c5c-4153-8913-9cb70ad98ec9" />

La position structurelle et le contexte d'édition servent ainsi à déterminer les opérations proposées. L'utilisateur peut accéder à certains sous-groupes sans devoir ouvrir successivement tous les niveaux intermédiaires, tout en conservant les limites d'édition définies par le concepteur.

La régularité de l'arbre ne constitue pas, à elle seule, un mécanisme d'adressage. Elle fournit le cadre commun dans lequel l'accès aux sous-groupes et l'exposition de leurs propriétés peuvent être organisés.

**L'encapsulation d'une branche en objet sémantique.** Lorsqu'une branche est suffisamment stable et réutilisable, elle peut être présentée comme une unité nommée et paramétrée.

Cette réduction est une encapsulation équivalente : la branche conserve son fonctionnement, tandis que son interface ne présente que les paramètres et les points de composition nécessaires à son utilisation.

Dans la forme illustrée ici, l'unité réduite conserve les rôles attendus par l'arbre :

```text
Module
    Piece           — rattachement à la Face parente
        Face        — accueil des Pieces de contenu
```

Le module possède un nom qui exprime sa fonction et des paramètres qui permettent de l'adapter. La branche complète reste conservée derrière cette interface. Ses relations avec le contexte d'utilisation, notamment les paramètres et le synchronisme, doivent être préservées par l'encapsulation.

Dans TiSpI DOM, la réversibilité de cette réduction est vérifiée par des tests automatiques : développer la forme réduite redonne la branche, et réduire la branche redonne la forme réduite ([étude pilote](https://github.com/wvanim/TiSpI-DOM/blob/main/Document/Etude_pilote_IA_2026-09.md), section 2). L'équivalence de comportement entre la branche et son usage encapsulé reste à définir formellement.

Tispi permet ainsi de travailler à deux niveaux d'abstraction :

- l'unité primitive Piece/Faces, définie par le modèle ;
- la branche sémantique, définie par le concepteur à partir de ces unités.

Une branche sémantique peut représenter un bouton, un groupe paginé, une incrustation, un panneau ou une composition plus élaborée. Elle peut être conservée en bibliothèque, partagée et instanciée dans d'autres projets.

L'arbre sémantique correspond alors à une vue de la composition dans laquelle certaines branches sont manipulées comme des unités. La structure détaillée reste disponible lorsqu'il devient nécessaire d'en modifier le fonctionnement.

**Le cas compact PieceFace.** Lorsqu'une Piece ne possède qu'une seule Face, les deux parties peuvent être représentées dans un objet unique appelé *PieceFace*. Leurs rôles restent distincts à l'intérieur de cet objet. La Face unique peut être une Face de groupe : la représentation compacte garde alors ses enfants, et un arbre entier peut s'écrire ainsi.

Cette représentation est réversible : la PieceFace peut être développée en une Piece et une Face séparées. Elle simplifie la représentation sans supprimer les deux responsabilités du modèle. TiSpI DOM écrit ces deux cas `tsi-pf` et `tsi-pg` ; ce sont des écritures : dans l'arbre, la Piece et la Face restent deux nœuds.

<p align="center">
  <a href="https://www.wvanim.fr/projets_perso/tispi/demo_scripts/demo_structure_3D_1pc_tsi.html">
    <img src="https://www.wvanim.fr/_demo/tispi_piece.png" alt="Une Piece et ses Faces" width="40%"><br>
    <sub>Une Piece présente ses Faces l'une après l'autre (cliquer l'image)</sub>
  </a>
</p>

Il faut toutefois distinguer cette compacité de l'absence de temporalité. La Face est indépendante de la temporisation synchronisée : une Piece à Face unique peut encore porter des évolutions de position, de rotation, de dimensions ou d'autres propriétés.

Le caractère statique d'une composition se détermine donc à partir de ses évolutions synchronisées, et non du nombre de Faces.

Cette distinction précise la relation avec HTML. Une arborescence HTML statique peut être représentée par des couples Piece/Face à Face unique. La représentation PieceFace permet alors de retrouver une organisation arborescente comparable, tout en conservant la séparation des rôles propre à Tispi.

*Figure 3 — Représentation Temps/Espace appliquée à une page HTML.*
<img width="904" height="611" alt="im54" src="https://github.com/user-attachments/assets/138e45c0-743b-4363-a0e2-cef0a81c2507" />

L'absence d'évolution synchronisée constitue une condition supplémentaire de ce cas statique. Les exemples de correspondance permettent d'examiner comment une composition HTML s'inscrit dans cette représentation et comment elle peut ensuite être enrichie de comportements temporels.

**Une séparation des responsabilités temporelles et spatiales.** La structure *strictly interleaved* attribue des rôles distincts aux Pieces et aux Faces. Les évolutions soumises au synchronisme appartiennent aux Pieces ; la présentation et la composition spatiale sont décrites par les Faces.

Cette séparation n'empêche pas une piste de piloter une propriété spatiale. Modifier une position ou une rotation au cours du temps relève précisément du rôle de la Piece. La Face n'acquiert pas pour autant la responsabilité de la temporisation.

De même, les effets internes d'une Face de rendu peuvent être traités à leur propre niveau. Leur réalisation n'oblige pas à modifier la structure temporelle de la composition lorsqu'ils restent indépendants du synchronisme du plateau.

La protection recherchée concerne cette répartition des responsabilités. On appelle ici *interférence structurelle* le cas où une modification d'un côté, une piste ou une clé, oblige à modifier l'autre, une Face ou son rendu, ou l'inverse. Les opérations conformes au modèle doivent préserver la distinction entre le pilotage synchronisé et la description de la présentation. Ajouter un comportement temporel ne nécessite pas de transférer cette responsabilité à une Face ; enrichir un rendu ne nécessite pas de reconstruire le pilotage temporel.

Cette propriété ne signifie pas que toute composition sera exempte d'erreurs de valeurs, de ciblage ou de conception. Elle définit une classe plus précise de garanties : les rôles restent identifiés et les relations entre eux passent par les mécanismes prévus par le modèle.

Dans l'expérience rapportée avec WvAnim, un non-informaticien, néophyte au point de n'utiliser les fonctions que par copier-coller, a construit et étendu pendant six mois un éditeur de décoration et de mouvement, en ajoutant progressivement des fonctionnalités de bordures, de gradients, d'animation et de perspective. Aucune interférence structurelle, au sens défini ci-dessus, n'a été rapportée au cours de ce travail.

*Figure 4 — Éditeur de décoration et de mouvement étendu par un non-informaticien pendant six mois.*
<img width="1447" height="788" alt="im72" src="https://github.com/user-attachments/assets/d280e9cc-d2c6-494a-b240-40762645c869" />

Ce retour d'expérience illustre l'intérêt pratique d'un cadre stable : l'auteur peut enrichir une composition en retrouvant les mêmes rôles et les mêmes règles d'organisation. Il constitue une observation de terrain sur l'accessibilité du modèle, à compléter par une description des tâches réalisées et des difficultés rencontrées.

**Une représentation explicite pour les outils et les IA.** La structure Tispi rend identifiables les éléments de composition, les alternatives de présentation et les évolutions synchronisées. Cette explicitation fournit un support pour lire, générer et vérifier des interfaces.

Les Faces décrivent des présentations possibles. Les pistes et leurs clés décrivent les évolutions pilotées. L'état complet d'une composition dépend de la configuration active de l'arbre, de sa situation temporelle et des valeurs nécessaires à son fonctionnement.

L'intérêt pour un système d'IA réside dans cette organisation explicite et répétitive. Le système peut retrouver les mêmes catégories de responsabilités à chaque profondeur et travailler à différents niveaux : unités primitives, branches détaillées ou modules sémantiques.

Deux séries d'essais ont été menées.

La première est interactive. Des systèmes d'IA ont reçu les spécifications de Tispi par étapes, selon la [séquence de prompts](https://www.wvanim.fr/p/tispi_agent_prompt.html) publiée, puis ont composé. Après une prise en main inférieure à trente minutes, ils ont produit des roll-overs imbriqués, des groupes paginés, des boutons et des pop-ups. Ces essais n'ont pas été conduits sous protocole ; ils indiquent une direction.

La seconde est une [étude pilote](https://github.com/wvanim/TiSpI-DOM/blob/main/Document/Etude_pilote_IA_2026-09.md), conduite en septembre 2026 et publiée avec son protocole, ses effectifs et ses intervalles de confiance. Elle porte sur le format d'échange destiné aux IA, qui énonce des règles de surface et n'expose pas le couple Piece/Face. Trois modèles, lancés sans mémoire ni consigne, avec pour seule référence un document Tispi de 273 lignes, ont eu trois tâches : lire l'état d'une scène à une frame donnée, écrire un module, une instance et un bouton, déboguer un fragment contenant sept fautes plantées. En lecture et en débogage, aucun échec n'a été observé sur 24 sessions. En écriture, chaque faute a désigné une règle absente du document de référence ; la règle écrite et accompagnée d'un exemple, la faute a disparu. Une mesure complémentaire a comparé, sur quatre tâches longues, le document entier et le document replié par rôle et par branche : 24 réponses pleines sur 24 contre 21 sur 24, pour 43 % de tokens d'entrée en moins ; l'écart de réussite n'est pas significatif à cet effectif.

Ces résultats suggèrent que le modèle peut servir de support à la génération d'interfaces. Ils restent ceux d'une étude pilote : le taux de réussite en écriture est imprécis faute d'effectifs, un seul document a servi de référence, et aucun bras n'a comparé le format d'échange au format moteur. L'étude fixe le critère à atteindre pour sortir de ce statut.

Plusieurs usages peuvent être étudiés :

- lire une composition et identifier ses configurations possibles ;
- analyser ses évolutions synchronisées ;
- générer des compositions valides, dans le format moteur ou dans le format d'échange ;
- vérifier les paramètres et les points de composition des modules ;
- contrôler certaines propriétés temporelles à partir des règles du modèle.

La régularité structurelle fournit une base à ces opérations. Leur portée dépend également de la description explicite des comportements et des règles de synchronisme.

**Vers une grammaire d'interfaces.** La distinction entre unités primitives et branches sémantiques ouvre une perspective de formalisation.

Les Pieces, les Faces et leurs règles de composition constituent les éléments de base. Les modules nommés et paramétrés permettent de construire des abstractions réutilisables. Une interface peut alors être décrite comme une composition de ces éléments, à plusieurs niveaux de détail.

Pour TiSpI DOM, cette grammaire est écrite : [GRAMMAR.md](https://github.com/wvanim/TiSpI-DOM/blob/main/GRAMMAR.md) décrit en EBNF les éléments et leurs assemblages admissibles, l'attribut qui porte le script, les pistes, les transitions et les valeurs ; chaque forme y est vérifiée contre l'analyseur du moteur.

Ce qui reste ouvert est la formalisation au niveau du modèle, indépendante de l'implémentation : ce qu'est une composition valide en général, les conditions d'une encapsulation équivalente, et les règles qui donnent leur sens aux pistes, aux paramètres, à la sélection des Faces et au synchronisme. Cette formalisation permettrait de développer des outils de validation ou de génération.

Le point de départ reste la définition du temporel propre à Tispi : **les évolutions soumises à la synchronisation du plateau dont la Piece est membre**. L'alternance stricte organise leur articulation avec la présentation spatiale ; la modularité permet ensuite de manipuler cette organisation sous forme de branches réutilisables.

Références :

- Destrumel, P. (2025). [*Tispi : faire du temps le substrat structurel de l'interface*](https://github.com/wvanim/TiSpI-DOM/blob/main/Document/position_paper.md). Preprint.
- Destrumel, P. (2026). [*Étude pilote — faisabilité de la lecture et de l'écriture Tispi par des agents IA*](https://github.com/wvanim/TiSpI-DOM/blob/main/Document/Etude_pilote_IA_2026-09.md).
- Destrumel, P. [*TiSpI DOM — Grammar*](https://github.com/wvanim/TiSpI-DOM/blob/main/GRAMMAR.md).
- Destrumel, P. [*Tispi — documentation et exemples*](https://github.com/wvanim/TiSpI-DOM).
