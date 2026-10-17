# TiSpI et SyncCharts : deux chemins vers le même arbre

Une comparaison de leur structure, de leur rapport au temps et de leurs mécanismes de contrôle, accompagnée d’exemples [TiSpI](https://github.com/wvanim/TiSpI-DOM).

## Sommaire

1. [Origines et objet de la comparaison](#origines)
2. [Une structure commune : l’alternance stricte](#structure)
3. [Le temps : sélection des états et autonomie des plateaux](#temps)
4. [Les événements et les changements d’état](#evenements)
5. [Les trois usages de la barre de temps](#usages)
6. [Le contrôle : suspension, préemption et sortie animée](#controle)
7. [Ce que chaque modèle apporte](#apports)
8. [Références](#references)

---

<a id="origines"></a>

## 1. Origines et objet de la comparaison

SyncCharts, publié par Charles André en 1996, est un formalisme visuel fondé sur Esterel. [Présentation originale](https://www-sop.inria.fr/members/Charles.Andre/CA%20Publis/SYNCCHARTS/overview.html)

TiSpI est né en 1999 dans e-anim, devenu WvAnim, pour uniformiser la composition et l’édition des animations.

Développés indépendamment, ils partagent le même arbre de composition, mais diffèrent par leurs règles d’exécution et leur rapport au temps.

Les exemples HTML de cette page sont écrits pour le moteur TiSpI.

<a id="structure"></a>

## 2. Une structure commune : l’alternance stricte

### 2.1. Correspondance des nœuds

Dans l’arbre de contenance de SyncCharts, un état composé contient des graphes de transitions d’états, ou **STG**, qui contiennent eux-mêmes des états. Après omission des cellules réactives intermédiaires, les catégories **état / STG alternent strictement sur chaque chemin**. [Arbre de contenance, §4.1](https://pop-art.inrialpes.fr/~girault/Slap03/Final/andre.pdf#page=10)

TiSpI plonge les états dans la dimension temporelle. La règle devient : les états sont successifs dans le temps. Ainsi émerge la relation naturelle entre les états et l’animation.

La correspondance avec TiSpI est directe :

| SyncCharts | TiSpI | Rôle dans la composition |
|---|---|---|
| STG | **Pièce** | Porte les alternatives entre lesquelles s’effectue la sélection. |
| État composé | **Face de groupe** | Réunit les branches actives ensemble. |
| État simple | **Face de rendu** | Termine la décomposition structurelle. |

Cette correspondance concerne la place des éléments dans l’arbre. Le contenu visuel d’une Face de rendu appartient à TiSpI.

Dans TiSpI, une Pièce sélectionne une Face, ou aucune. Une Face de groupe réunit des Pièces, dont chacune possède ses propres Faces. La même composition se répète à toute profondeur :

```text
Pièce → Face de groupe → Pièces → Faces…
```
<p align="center">
  <a href="https://www.wvanim.fr/_demo/demo_animated_html/tispi_2_pieces_faces/demo_structure_3D_2pc_tsi_module.html">
    <img
      src="https://www.wvanim.fr/_demo/plate_motor.jpg"
      alt="A plate of two synchronized Pieces"
      width="75%"
    ><br>
    <sub>A plate of two synchronized Pieces (click image)</sub>
  </a>
</p>

### 2.2. Sélection exclusive et absence de Face

Le cas **sans Face active** est explicite dans TiSpI : une Pièce admet zéro ou une Face active. Dans la configuration normale d’un syncChart, chaque STG actif possède exactement un état actif. [Règles de configuration, §4.2](https://pop-art.inrialpes.fr/~girault/Slap03/Final/andre.pdf#page=10)

### 2.3. Exemple : les trois états d’un bouton

```text
SyncCharts                         TiSpI
────────────────────────           ────────────────────────
Button (STG)                       Pièce button
 ├─ Out    (état simple)             ├─ Face out    (rendu)
 ├─ Over   (état simple)             ├─ Face over   (rendu)
 └─ Pushed (état simple)             └─ Face pushed (rendu)
```

```html
<tsi-p id="button" data-tsi="&synchro 0:stop; 
                             &button 0:OUT; 1:OVER; 2:PUSHED;
                             &face   0:out; 1:over; 2:pushed;">
  <tsi-f id="out">…</tsi-f>
  <tsi-f id="over">…</tsi-f>
  <tsi-f id="pushed">…</tsi-f>
</tsi-p>
```

<a id="temps"></a>

## 3. Le temps : sélection des états et autonomie des plateaux

### 3.1. Ce qui sélectionne l’état

Dans SyncCharts, l’état actif change par des transitions, selon les signaux, les conditions et la terminaison des activités. Dans TiSpI, la position temporelle détermine la Face active au moyen de la piste `&face`. Un événement peut ainsi changer la Face en déplaçant la Pièce vers un autre moment.

### 3.2. Des moments accessibles sans ordre de parcours imposé

La barre de temps présente des **cases de moments**, accessibles directement par un `goto` vers un numéro de frame ou une balise. Leur sélection n’impose aucun ordre de parcours : on peut atteindre un moment, y rester, en choisir un autre ou revenir au précédent.

Un déroulement ordonné apparaît lorsqu’un intervalle est à parcourir. Une transition TiSpI représente également un intervalle, sous une autre forme : elle possède sa propre durée et est portée par une clé, au lieu d’occuper les moments de la barre.

Dans SyncCharts, les passages entre états sont décrits par les arcs du modèle. Dans TiSpI, un appel peut atteindre directement un moment de la barre.

### 3.3. Temps global et temps propre au plateau

**Le groupe est une unité de contrôle dans les deux modèles ; il est nativement une unité de temps dans TiSpI.**

| Aspect | SyncCharts | TiSpI |
|---|---|---|
| Référence temporelle | Les instants logiques sont communs à tout le syncChart, à tous les niveaux. | Chaque plateau possède son propre temps : durée, position et arrêts. |
| Branches d’un groupe | Les STG d’un état composé participent aux réactions du syncChart. | Les Pièces réunies sur un plateau partagent le temps de ce plateau. |
| Contrôle local | La suspension d’un état composé gèle son évolution interne. | L’arrêt d’un plateau immobilise sa progression temporelle. |
| Temps local | Il se construit, en conditionnant l’activité à un signal choisi. | Il est donné : l’autonomie temporelle appartient au plateau lui-même. |
| Temps commun | Il est donné : ce sont les instants logiques du syncChart. | Il se déclare, en nommant un maître : `&synchro !<clockMaster(world)>`. |

Les deux modèles savent donc faire les deux : ils diffèrent par ce qui est donné et par ce qui se déclare.

La suspension locale de SyncCharts s’inscrit dans ses instants logiques communs. Elle ne donne pas, à elle seule, une durée et une position propres à l’état composé. [Instants et suspension, §2.3](https://pop-art.inrialpes.fr/~girault/Slap03/Final/andre.pdf#page=5)

<a id="evenements"></a>

## 4. Les événements et les changements d’état

### 4.1. Décrire un passage d’un état à un autre

Une transition SyncCharts relie un état source à un état cible. Elle peut porter un déclencheur, une garde et un effet. Dans TiSpI, une piste d’action permet de réunir ces rôles :

| Rôle | Écriture TiSpI |
|---|---|
| Contexte de départ | Le moment auquel l’action est définie. |
| Événement déclencheur | La piste d’action, par exemple `&onClick`. |
| Condition éventuelle | Un test dans le script. |
| Destination | Un moment ou une balise visé par le `goto`. |

Un script peut également demander ce déplacement depuis un autre point de la composition.

### 4.2. Exemple : ouvrir et fermer une porte

```html
<tsi-p id="door" data-tsi="&synchro 0:stop;
                           &mark    0:CLOSED;                        1:OPEN;   
                           &face    0:closed;                        1:open;
                           &onClick 0:{ $this->$gotoStop('OPEN') };  1:{ $this->$gotoStop('CLOSED') };">
  <tsi-f id="closed">…</tsi-f>
  <tsi-f id="open">…</tsi-f>
</tsi-p>
```

Au moment `0`, nommé `CLOSED`, le clic mène à `OPEN`. Au moment `1`, nommé `OPEN`, il ramène à `CLOSED`.

La piste `&mark` nomme les moments ; la piste `&face` leur associe les Faces ; la piste `&onClick` définit les déplacements déclenchés par le clic.

<a id="usages"></a>

## 5. Les trois usages de la barre de temps

Une barre de temps TiSpI peut servir à représenter des états, à animer des propriétés ou à suivre un maître.

| Usage | Dans TiSpI | Dans SyncCharts |
|---|---|---|
| **Barre d’états** : suivre une valeur discrète | Une Pièce reste sur un moment et change de moment à la suite d’un événement. | Un graphe d’états exclusifs évolue selon ses transitions. |
| **Animation** : parcourir des intervalles | Les clés définissent les valeurs ; les interpolations et les effets produisent leur évolution. | Une évolution peut être calculée ou reçue aux instants logiques, puis transmise par des signaux valués. |
| **Synchronisation sur un maître** : suivre une valeur évolutive | Un plateau suit un maître, par exemple une vidéo, un curseur ou une Pièce parente. | Un événement récurrent peut servir de référence à une progression logique ; des signaux valués peuvent transmettre la position du maître. |

### 5.1. La barre d’états

Le bouton de la [section 2](#structure) illustre cet usage. Ses moments correspondent aux configurations `OUT`, `OVER` et `PUSHED`. La barre reste sur le moment sélectionné jusqu’au prochain changement.

Ce fonctionnement rejoint l’organisation en états exclusifs de SyncCharts.

### 5.2. L’animation déclarative

TiSpI décrit l’évolution par des clés et des intervalles. Les valeurs intermédiaires sont calculées à partir de cette description.

```html
<tsi-p id="mover" data-tsi="&pos  0:0,0;  120:400,0;  240:0,0;
                            &face 0:day;  <20:fade> 120:night;">
  <tsi-f id="day"   data-tsi="&size 80,80;">day</tsi-f>
  <tsi-f id="night" data-tsi="&size 80,80;">night</tsi-f>
</tsi-p>
```

La piste `&pos` décrit un aller-retour. La piste `&face` sélectionne `day`, puis `night`, avec un effet `fade` de durée `20` porté par la clé d’arrivée.

SyncCharts peut transporter les valeurs d’une animation au moyen de signaux valués. Le calcul des interpolations et leur application au rendu relèvent alors de l’application. Ses réactions ont lieu à des instants discrets ; cela n’interdit pas de représenter des valeurs numériques issues d’une grandeur continue. [Signaux valués, §8.6](https://webusers.i3s.unice.fr/~map/WEBSPORTS/SyncCharts/RR200324.pdf#page=57)

### 5.3. Exemple : une attente avec une barre de progression

Dans TiSpI, l’attente peut être représentée par un sous-groupe dont le temps parcourt une durée, avec une action au dernier moment. Ce sous-groupe peut afficher sa progression pendant l’attente.

```html
<tsi-p id="screen" data-tsi="&synchro 0:stop;  
                             &mark 0:WAIT;    1:NEXT;  
                             &face 0:waiting; 1:next;">
  <tsi-g id="waiting">
    <tsi-pf id="bar" data-tsi="&size 0:0,8; 60:200,8;  &onTime 60:{ $up(screen)->$gotoStop('NEXT') };"></tsi-pf>
  </tsi-g>
  <tsi-f id="next">…</tsi-f>
</tsi-p>
```

La Pièce `screen` reste sur `WAIT` pendant que le plateau du groupe `waiting` progresse. Au moment `60`, l’action demande le passage à `NEXT`. L’exemple utilise directement l’autonomie temporelle du sous-groupe.

Dans SyncCharts, une attente peut être construite en comptant les occurrences d’un signal d’horloge. Soixante occurrences représentent une seconde si ce signal est à 60 Hz. De même, une durée de 60 frames dans TiSpI représente une seconde à une cadence de 60 frames par seconde.

### 5.4. La synchronisation sur un maître

Un plateau TiSpI peut suivre la position fournie par un média ou une autre source. La valeur du maître détermine alors la position temporelle du plateau.

```html
<tsi-p id="player" data-tsi="&synchro !<face> 0:;  &pos 40,40;">
  <tsi-f id="screen" data-tsi='&videoSynchro "avion.mp4", controls;  &size 640,360;'></tsi-f>
</tsi-p>
```

L’exemple associe la synchronisation à une Face vidéo. Le média `avion.mp4` doit être disponible à l’emplacement indiqué.

Le rapprochement avec le **temps logique multiforme** porte sur le choix de la référence : un événement récurrent peut servir d’unité de progression. Une position de média peut aussi être transmise comme valeur. TiSpI intègre le suivi de cette position dans le fonctionnement du plateau ; l’échantillonnage de la valeur du maître ne suffit pas, à lui seul, à rendre les deux mécanismes identiques.

<a id="controle"></a>

## 6. Le contrôle : suspension, préemption et sortie animée

### 6.1. Suspendre une progression

Dans SyncCharts, la suspension gèle l’évolution interne d’un état composé : tant qu’elle dure, l’intérieur ne réagit plus aux signaux. Dans TiSpI, un plateau arrêté conserve sa position et peut reprendre sa lecture à partir de celle-ci. L’arrêt peut provenir d’une commande ou du maître.

Les deux mécanismes permettent un contrôle local, mais ils ne gèlent pas la même chose. La suspension SyncCharts gèle les réactions. L’arrêt TiSpI ne gèle que le temps : un plateau arrêté continue de réagir aux événements. Le bouton de la [section 2](#structure) en est l’exemple : son plateau est arrêté par `&synchro 0:stop`, et il réagit au survol.

### 6.2. Préemption forte, préemption faible et durée de sortie

Les préemptions de SyncCharts définissent l’ordre des traitements **à l’intérieur d’un même instant logique**. Une sortie animée TiSpI possède une durée. Cette distinction précise la portée de la comparaison. [Préemption, §5.4](https://webusers.i3s.unice.fr/~map/WEBSPORTS/SyncCharts/RR200324.pdf#page=27)

| Mécanisme SyncCharts | Rapprochement dans TiSpI | Portée de la correspondance |
|---|---|---|
| **Préemption forte** : la sortie empêche la réaction interne de l’état dans l’instant courant. | Changement de Face sans effet de sortie : la branche sortante devient immédiatement inactive. | La sortie est immédiate dans les deux descriptions ; les règles de priorité de réaction restent propres à chaque moteur. |
| **Préemption faible** : l’intérieur réagit dans l’instant courant, puis l’état est quitté. | La clé de la branche sortante posée sur la frame de bascule est jouée, puis la Face joue sa sortie sur sa durée. | La clé jouée à la bascule est la préemption faible au sens strict ; la sortie qui dure en est une extension. |

### 6.3. Exemple : une sortie animée définie par la Face

```html
<tsi-f id="front" data-tsi="&opacity 0:1; !<30:easeOut> 0:0">…</tsi-f>
```

Lorsque sa Pièce quitte la Face `front`, celle-ci effectue son fondu de sortie sur une durée de 30 frames. La Face porte la description de sa sortie ; la Pièce qui la sélectionne n’a pas à en connaître les détails.

Aujourd’hui, cette section de sortie traite les pistes de valeurs. Les pistes d’actions et la clé posée sur la frame de bascule ne sont pas encore jouées par le moteur.

<a id="apports"></a>

## 7. Ce que chaque modèle apporte

### 7.1. SyncCharts : une sémantique synchrone formelle

SyncCharts hérite de la sémantique synchrone d’Esterel : réactions instantanées, causalité constructive et déterminisme. L’analyse de causalité peut conduire à rejeter un modèle non constructif. Ces propriétés concernent les règles d’exécution du modèle, au-delà de la forme de son arbre. [Sémantique et compilation, §4.3](https://pop-art.inrialpes.fr/~girault/Slap03/Final/andre.pdf#page=11)

### 7.2. TiSpI : le temps et le rendu dans la composition

TiSpI associe à cette organisation de l’arbre :

- une sélection des Faces par la position temporelle ;
- un temps propre à chaque plateau ;
- des pistes déclaratives, avec leurs clés, effets et durées ;
- des sorties animées portées par les Faces ;
- une synchronisation sur la position d’un média ou d’un autre maître.

Il répartit également les propriétés selon leur cible, qui détermine leur rôle. Cette répartition repose sur une distinction technique précise, et non sur un choix sémantique abstrait.

| Rôle | Ce que les propriétés décrivent |
|---|---|
| **Structurel** | La configuration de l’arbre actif. |
| **Spatial** | La position et l’encombrement des Pièces sur un plateau. |
| **Décoratif** | L’apparence interne des Faces. |

<a id="references"></a>

## 8. Références

- Charles André, *SyncCharts: A Visual Representation of Reactive Behaviors*, rapport RR 95–52, révision RR 96–56, 1996. [Présentation](https://www-sop.inria.fr/members/Charles.Andre/CA%20Publis/SYNCCHARTS/overview.html)
- Charles André, *Computing SyncCharts Reactions*, version atelier de 2003, publiée dans ENTCS en 2004. [Version atelier](https://pop-art.inrialpes.fr/~girault/Slap03/Final/andre.pdf) · [Version ENTCS](https://webusers.i3s.unice.fr/~map/WEBSPORTS/Documents/2003a2005/entcs04-text.pdf)
- Charles André, *Semantics of SyncCharts*, rapport I3S, avril 2003. [PDF](https://webusers.i3s.unice.fr/~map/WEBSPORTS/SyncCharts/RR200324.pdf)
- Charles André et Jean-Paul Rigault, *Variations on the Semantics of Graphical Models for Reactive Systems*, 2002. [PDF](https://www.i3s.unice.fr/~map/WEBSPORTS/Documents/1999a2002/SMC02.pdf)
- Charles André, [publications sur SyncCharts](https://webusers.i3s.unice.fr/~map/WEBSPORTS/SyncCharts/publications.en.html).
- TiSpI, [dépôt et documentation](https://github.com/wvanim/TiSpI-DOM), notamment `GRAMMAR.md` et `GLOSSARY.md`.

[Retour au sommaire](#sommaire)
