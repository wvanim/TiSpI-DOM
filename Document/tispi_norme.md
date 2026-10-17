---
WvAnim standardise la structure des données d’animation pour les éditeurs.
Les questions d’exécution (moteur, export) sont déléguées aux compilateurs.

WvAnim est une norme UI/animation basée sur un arbre alterné temps (Pièces) et espace (Faces).
Son principe : les Pièces sont interchangeables entre elles, tout comme les Faces.
Cette architecture modulaire unifie les méthodes de production visuelle.
Elle est compatible avec Animate, HTML5 et les frameworks modernes.
WvAnim, c’est 35 ans d’expertise synthétisés en une structure simple et universelle.


## Règle unique : une structure 
Les composants de la page ou de l’animation sont placés dans un arbre à double nœuds :
- nœud Pièce (temps),
- nœud FaceGroupe (espace),
- feuilles Face-simple (image, texte, son, dessin vectoriel ...)

### Pourquoi la Pièce est le temps ?
La Pièce ne traite* (affiche) qu'une face à un temps T, elle est nommée face-courante.
Important : dans le run-time, la pièce est l'unique collecteur de paramètres. 
- les données peuvent provenir d'une barre-de-temps, de calcul, d'intercation utilisateur, de fonction...
- ces mise-à-jours s'effectuent hors cycle d'affichage 

### Pourquoi le Groupe est l'espace ?
Le Groupe affiche toutes les pièces en même temps à des positions différentes.

### Pourquoi le groupe et les visuels (ou/et audio) héritent de face ?
Ils représentent l'espace, c’est-à-dire le visuel à un temps donné.
Ils prennent en charge la transformation hyéarchique.

(*) Exception pour les transitions, mais durant une transition la Pièce ne mélange** jamais les traitements.  
Pour le traitement, la Pièce doit définir un temps de séparation des 2 faces. Le reste n'est que visuel suivant l’implémentation.  
(**) Exemple : effets entre 2 groupes qui comportent des boutons. À aucun moment les boutons sont actifs pour les 2 groupes.
____________________________________________________________________


## A - La présentation en introduction découle de cette structure.
La norme ne définit pas les process de production des features : timeline, calcul par fonction, action utilisateur.  
Pour le reste, la norme pourrait donner des "conseils" avec 35 ans d’expérience.  
Mais inutile de rigidifier ce que l'état de l’art informatique ne peut garantir pour l’avenir.

## B - L'arbre est une structure, il ne détermine pas le comportement de ces composants.

## C - Pourquoi la norme WvAnim ?
- **Structure claire** : Séparation temps (Pièces) / espace (Faces) pour une organisation prévisible.
- **Édition efficace** : Moins de duplication, debugging accéléré.
- **Compatibilité** : S’intègre aux workflows existants (Animate, Lottie, etc.) tout en offrant une meilleure maintenabilité.

**Exemple** :  
Un bouton animé passe de 3 calques dupliqués (Animate) à **1 arbre réutilisable** (WvAnim).
____________________________________________________________________


## Outil d'édition :

### 1 - Sélection dans sous-groupe
L'option "sélectionnable dans un sous-groupe" donnera accès à cette pièce sans avoir besoin de descendre dans l'arbre.  
Cette pièce est éditée par un simple clic, quel que soit le groupe-parent en cours dans l'espace de travail.  
L'utilisateur peut l'éditer, la déplacer, l'agrandir, changer sa couleur, etc., en restant dans le groupe-parent.  
Un élastique mauve indique que la pièce éditée est dans un sous-groupe.  
La sélection fonctionne quel que soit la profondeur de la pièce.  
En cliquant ailleurs, la sélection se termine.

Double clic sur la poignée haut/gauche pour ouvrir le cadre de permission.  
Ce cadre indique les options modifiables : éditable, déplacement, agrandissement, couleur...  
Ce cadre comporte 2 colonnes :  
- autorisations pour la pièce dans la zone-de-travail,
- autorisations pour la pièce dans un sous-groupe.

### 2 - La pièce-éditeur
- Les pièces cochées : "invisible dans l'animation", affichent des informations uniquement présentes dans l'éditeur.  
- Les pièces d'édition sont des pièces comme les autres : image, texte, shape, groupe.  
  La construction de ces pièces est identique aux autres pièces. Aucune charge d'apprentissage.  
- Chaque pièce-éditeur peut être définie comme visible ou invisible dans un sous-groupe.  
  -> ces pièces éditeur réapparaissent :
     - quand le groupe est édité,
     - quand une pièce "sélectionnable dans un sous-groupe" est sélectionnée.	 
- Une option permet de cacher les pièces-éditeur.
- Ces pièces sont exportables, et importables, toujours sur le principe "@Légo".

### 3 - La pièce-macro
- C'est une pièce-éditeur qui comporte une action.
- Si une pièce-éditeur comporte une action, cette action agira directement dans l'éditeur.
- Notez qu'il est possible d'associer à la sélection dans les sous-groupes.

### 4 - La barre de commande
#### 4.1 - Création
- Ajouter un sous-groupe + cocher "est une barre de commande".  
  -> Une barre vierge s'ouvre sur la droite de la zone de travail.
- Ajouter les pièces et les actions qui composeront cette barre.  
  La création des pièces est toujours identique aux autres pièces.
- Maj+clic rafraîchit la barre.
- La barre est active.
- Évidemment, ce groupe est invisible dans la zone de travail (sauf quand vous l'éditez).

#### 4.2 - Modification de la barre
- Ctrl+clic sur la barre -> édite le groupe de cette barre.

#### 4.3 - Présence de la barre
- La barre s'affiche dès que le groupe parent est sélectionné.
- Elle disparaît quand il n'est plus sélectionné.
- La barre la plus profonde est prioritaire.  
  Ex : un groupe-avec-barre-de-commande comporte un bouton-avec-barre-de-commande.  
       Quand le bouton est sélectionné, la barre du bouton remplace la barre du groupe.

#### 4.4 - Sauvegarde
- Sauvegardée comme tout autre groupe dans le fichier `.phi`.

### 5 - Le gadget
Un gadget est un groupe sauvegardé.  
Il comporte souvent une barre de commande pour le paramétrer.  
Ce groupe pourra être importé comme tout autre groupe.

### 6 - Les pages
Les boutons, roll-over, pages successives sont des pièces comportant une suite de groupes dans la barre-de-temps.  

**Contrainte** :  
Ces pièces peuvent apparaître à n'importe quel temps.  
Rappel : ce qui est mémorisé dans une key de la barre-de-temps -> c'est une face.  
=> La pièce bouton doit être encapsulée dans une face.  
=> Apparition d'un niveau de nœud => Complexité de manip pour passer d'un état souris à un autre.

Ce niveau est de type "pages".  
Les pages éditent ce groupe intermédiaire sous forme de barre au-dessus de la zone de travail.  
Puis éditent directement un état de la souris dans la zone de travail.  
Elle présente des boutons pour éditer chaque état de la souris ou chaque page.
____________________________________________________________________


## Annexe A : Structure d'un bouton-animé
- Pièce (comporte un bouton à un temps) [barre de temps : ..., key bouton, key autre face,...]
    - Groupe-Bouton
        Pièce état-normal [barre de temps : état-normal, état-survolé, état-appuyé]
			Groupe état-normal
				pieces/groupe-ou-face-simple
				pieces/groupe-ou-face-simple
				...
			Groupe état-survolé
				pieces/groupe-ou-face-simple
				pieces/groupe-ou-face-simple
				...
			Groupe état-appuyé
				pieces/groupe-ou-face-simple
				pieces/groupe-ou-face-simple
				...
Notez que les types sont communs en colonne.				

## Annexe B : Historique

**1990 - Un éditeur de pages interactives** (j'ai oublié le nom)  
Les règles WvAnim étaient présentes, mais non formalisées.  
Une barre d'état pilotait la suite de pages, les boutons, les roll-over, les cadres paginés...  
Événement pour changement d'état : événement souris ou instruction programmée.  

**2000 - Inspiré de Flash**  
La barre d'état devient la barre de temps (en conservant ses propriétés d'état).  
Événement supplémentaire pour changement d'état (dorénavant 'frame') : onTimer(Nms).  

1er test : bouton animé.

**2005 - Conceptualisation**  
Un chercheur demande : un bouton est-il Pièce ou Face ?  
Là je sèche.  
C'est là qu’apparaît l'importance du temps.  
Une Pièce peut être bouton à un temps donné, et autre chose à un autre temps (pas recommandé, mais possible).  
Vérification de la structure des composants de e-anim... OK.

## Annexe C - Exemple d'implémentation
1 - Adapter HTML5 à la norme WvAnim, il suffit de créer 2 types de divs dans la hiérarchie.  
Div-Pièce : n'affichera qu'une seule de ses sous-divs.  
Div-Groupe : affichera toutes ses sous-divs.  

Cette simple contrainte adapte HTML à la norme WvAnim.

2 - Adapter Animate à la norme WvAnim.  
En backstage, unifier les calques et les Movie-Clips dans l'éditeur.  
Conserver la même présentation de l'éditeur.

## Annexe D : Question-réponse avec IA

**Q - "Un équivalent de Adobe Animate + un système de macros comme dans Blender pourrait intéresser les studios d’animation."**  
**R -** C'est exactement ça !  
En fait, Animate est très proche de la validation WvAnim, tout en conservant la présentation de son éditeur.

**Q - "Cette histoire montre que WvAnim est né d’une pratique empirique, pas d’une théorie abstraite – une force pour son adoption !"**  
**R -** C'est né de ma dyslexie. Mes difficultés d'attention me poussent à attendre le temps nécessaire pour simplifier et rendre réutilisable. La logique simple est le meilleur pilier.  
Ce qui n'est pas "fluide" reste comme un caillou dans ma chaussure.

**Q - "La comparaison avec d'autres normes (ex. : Lottie, GSAP)"**  
**R -** (de DeepSeek) WvAnim **n'exclut pas** les autres normes, mais elle **les encapsule** dans une structure plus robuste pour :  
1. **Éviter le chaos des timelines** (ex : calques qui mélangent temps et espace dans After Effects).  
2. **Permettre l'interchangeabilité** (une Pièce peut passer de Lottie à GSAP sans recoder la logique temporelle).  

C'est un **méta-standard** qui *complète* les outils existants.

**Q - "Dois-je abandonner ma timeline habituelle ?"**  
**R -** Non. WvAnim est une **norme backstage** : votre éditeur peut garder son UI actuelle (timeline + workspace), mais gagne une structure arborescente sous le capot.
