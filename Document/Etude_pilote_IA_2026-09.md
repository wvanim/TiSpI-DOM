# Étude pilote — faisabilité de la lecture et de l’écriture Tispi par des agents IA, septembre 2026

Une étude pilote : son échelle est petite, ses conclusions sont partielles, et elle dit ce qu’il faudrait pour les confirmer. Elle mesure un **coût d’apprentissage en contexte** : combien un modèle se trompe, et sur quelles règles, quand il ne dispose que du document de référence.

> **Grammaire mesurée.** Les mesures ont été faites sur le format Tispi/IA tel qu’il était écrit en septembre 2026. Le document de référence écrit la piste de temps `&stop 0:1;` ; le format actuel écrit `&synchro 0:stop;`. Les chiffres ci-dessous valent pour la grammaire de septembre.

## 1. Versions

| Élément | Valeur |
|---|---|
| Dates | passes 1 à 5 : 6 et 7 septembre 2026 ; mesure 7 : 12 septembre ; rejouée le 23 septembre |
| Modèles | `claude-haiku-4-5-20251001`, `claude-sonnet-5`, `claude-opus-5` ; rejeu : `claude-fable-5-1` |
| Sessions | `claude -p --tools "" --no-session-persistence`, lancé depuis un dossier sans mémoire ni consigne ; prompts neutres, sans mention d’IA ni de compatibilité |
| Document de référence | `demo_structure.tsi.html`, 273 lignes, environ 3 500 tokens ; quatre modules |
| Juge | Fable, contre une vérité dérivée du document et une clé ; les cas limites tranchés par l’auteur |

## 2. Le circuit et ce qui n’est pas encore vérifiable

Un agent travaille sur un **export** au format Tispi/IA ; le résultat revient par **réimport**. Cet aller-retour doit être réversible. Il n’a pas été testé : l’export IA n’est pas encore écrit dans le moteur. Les documents de cette étude ont été écrits à la main. La réversibilité est donc une propriété attendue, pas une propriété mesurée.

## 3. Trois registres de preuve

| Registre | Affirmation | Preuve | Statut |
|---|---|---|---|
| Mécanique | l’export et le réimport sont réversibles | aucun test : l’export n’existe pas | **à faire** |
| Qualitatif | les exemples battent les règles | trois fautes récurrentes, une règle écrite pour chacune, les fautes disparues, sur trois modèles | robuste comme direction, non quantifié |
| Indicatif | taux de réussite en lecture, débogage, écriture | trois sessions par cellule | n trop petit : tout taux est compatible avec ces données |

## 4. Le registre indicatif, avec ses intervalles

Trois tâches : **lire** l’état de la scène à la frame 300 ; **écrire** un module, une instance et un bouton ; **déboguer** un fragment qui contient sept fautes plantées.

| Passe | Condition | Lire | Déboguer | Écrire, fautes par modèle |
|---|---|---|---|---|
| 1, 6 sept. | document seul | 3 exacts sur 3 | 7 sur 7, 3 fois, 0 faux positif | haiku 3, sonnet 0, opus 1 faible |
| 2, 7 sept. | document + notice | 3 sur 3 | 7 sur 7, 3 fois | haiku 1, sonnet 0, opus 0 |
| 3 | notice v3 + contrats dans le document | — | — | 0, 0, 0 |
| 4 | notice v4 | 3 sur 3 | 7 sur 7, 3 fois | haiku 1 faible, sonnet 0, opus 0 |
| 5 | notice v5 | 3 sur 3 | 7 sur 7, 3 fois | 0, 0, 0 |

Ce que ces effectifs permettent de dire, intervalle de Wilson à 95 % :

| Observation | Intervalle |
|---|---|
| 3 réussites sur 3, une tâche, une passe | [44 %, 100 %] |
| 9 réussites sur 9, trois tâches, passe 5 | [70 %, 100 %] |

Un taux de réussite de 50 % en écriture reste compatible avec « 3 sur 3 ». Le compte brut, lui, est exact : aucun échec observé en lecture ni en débogage sur les 24 sessions de ces passes.

## 5. La boucle règle / faute

Le résultat principal n’est pas un taux : c’est le coût d’apprentissage mesuré règle par règle. Chaque faute d’écriture a désigné une règle absente du document ; la règle a été écrite et incarnée dans un exemple ; la faute a disparu.

| Faute observée | Règle absente | Après la règle et son exemple |
|---|---|---|
| la durée d’une transition, `<8:…>`, prise pour le numéro de la frame d’arrivée | une durée d’effet n’est pas une frame | disparue, passe 2 |
| une variable et des dimensions écrites dans `style=` | `style=` n’est ni lu ni interpolé ; une dimension s’écrit en piste | disparue, passe 2 |
| une instance sous un autre tag que son module | le tag de l’instance est le tag du module | disparue, passe 2 |

Deux faits de méthode, observés sur les trois modèles :

- **une règle énoncée sans exemple est ignorée** : le contrat d’un module, écrit dans la notice, n’a été respecté par aucun modèle en passe 2 ; un seul exemple dans le document a suffi en passe 3, 3 sur 3 ;
- **les incertitudes déclarées par les sujets sont la table des matières de la notice** : demandées, elles sont honnêtes et précises.

Cette boucle est reproductible sur tout langage. Elle prédit aussi où viendront les prochaines fautes : sur les règles encore non écrites, par exemple le choix entre `tsi-morph` et `tsi-pilot`, ou la préséance entre transitions.

## 6. La mesure 7 : le document replié

Quatre tâches longues, neuf à quinze écritures coordonnées chacune, dont trois nœuds à créer. Deux bras sur les mêmes demandes : **L**, le document replié autour des deux branches concernées ; **E**, le document entier. Trois modèles, deux tirages : 24 sessions par bras.

| | L, replié | E, entier |
|---|---|---|
| réponses pleines | 24 sur 24 | 21 sur 24 |
| tokens d’entrée, notice exclue | 219 189 | 383 737 |
| tokens de sortie | 186 190 | 340 524 |
| dollars, notice exclue | 3,69 | 7,14 |

Rejouée le 23 septembre sur Fable, 8 sessions par bras : 8 sur 8 dans les deux bras ; entrée moins 43 %, dollars moins 46 %.

**Ce que le chiffre « moins 46 % » veut dire, et ne veut pas dire.**

- Corpus : un seul document, de 7 352 tokens entier. Replié, il tombe à 713, 1 234, 1 297 ou 2 918 tokens selon la tâche : de moins 60 % à moins 90 % sur le document envoyé, moins 43 % sur l’entrée totale, parce que la notice et les prompts ne changent pas.
- « Branche stable », la base du repli, n’a pas de définition opérationnelle : le repli a été fait à la main, autour des deux branches que la tâche nommait.
- Le gain porte sur l’entrée et la sortie, donc sur le coût. Sur la réussite, un écart a été observé, 24 sur 24 contre 21 sur 24 ; il n’est pas significatif à cet effectif : intervalles de Wilson [86 %, 100 %] contre [69 %, 96 %], qui se recouvrent. Les trois échecs du bras entier sont chez haiku ; deux d’entre eux portent sur une piste que le repli masquait.
- Le cache a joué dans 18 sessions sur 48 : 16 fois un préfixe court de 3 289 tokens, deux fois un préfixe entier de 29 797 tokens, notice comprise. Les dollars « notice exclue » le neutralisent en partie, pas entièrement.

## 7. Ce que nous ne savons pas

| Inconnu | Pourquoi | Comment on le saura |
|---|---|---|
| taux de réussite réel en écriture | trois sessions par cellule | n ≥ 30 par cellule, intervalle de Wilson |
| coût réel de la compression | corpus unique ; « branche stable » non définie | une définition du repli, puis une tâche d’édition en contexte replié sur plusieurs documents |
| supériorité du format IA sur le format moteur | aucun bras comparatif | un bras au format moteur, à budget de tokens égal |
| validité pour la grammaire actuelle | mesures faites sur `&stop 0:1;`, format actuel `&synchro 0:stop;` | rejeu daté, version de la grammaire épinglée |
| réversibilité de l’export | l’export IA n’existe pas | un test aller-retour automatisé, égalité modulo forme canonique |

## 8. Critère de sortie du statut pilote

Le format IA sera considéré comme validé quand, sur une suite publiée de tâches, avec n ≥ 30 sessions par cellule, la borne inférieure de l’intervalle de confiance à 95 % dépassera 0,90 sur chacune des trois tâches, lecture, écriture, débogage, avec un bras comparatif au format moteur à budget de tokens égal, et sur une version épinglée de la grammaire.

Ce programme représente plusieurs centaines de sessions. Il est annoncé, pas lancé.

## 9. Artefacts

Le dossier de l’étude contient le protocole, les prompts, le document de référence et ses versions, les clés de débogage, les scripts de lancement et de comptage, et les réponses des sessions, passe par passe. Il n’est pas encore publié dans ce dépôt.
