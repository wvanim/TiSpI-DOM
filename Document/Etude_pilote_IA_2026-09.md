# Étude pilote — faisabilité de la lecture et de l’écriture Tispi par des agents IA, septembre 2026

Une étude pilote : son échelle est petite, ses conclusions sont partielles, et elle dit ce qu’il faudrait pour les confirmer. Elle mesure un **coût d’apprentissage en contexte** : combien un modèle se trompe, et sur quelles règles, quand il ne dispose que du document de référence.

> **Grammaire mesurée.** Les mesures ont été faites sur le format Tispi/IA tel qu’il était écrit en septembre 2026. Le document de référence écrit la piste de temps `&stop 0:1;` ; le format actuel écrit `&synchro 0:stop;`. Les chiffres ci-dessous valent pour la grammaire de septembre.

## 1. Versions

| Élément | Valeur |
|---|---|
| Dates | passes 1 à 5 : 6 et 7 septembre 2026 ; mesure 7 : 12 septembre ; rejouée le 23 septembre |
| Modèles | `claude-haiku-4-5-20251001`, `claude-sonnet-5`, `claude-opus-5` ; rejeu : `claude-fable-5-1` |
| Session | un modèle × une tâche × une version du document × un tirage. Passes 1 à 5 : un tirage, donc une session par modèle et par tâche ; mesure 7 : deux tirages. 24 sessions par bras = 3 modèles × 4 tâches × 2 tirages |
| Lancement | `claude -p --tools "" --no-session-persistence`, depuis un dossier sans mémoire ni consigne ; prompts neutres, sans mention d’IA ni de compatibilité |
| Document de référence | `demo_structure.tsi.html`, 273 lignes, environ 3 500 tokens ; quatre modules |
| Juge | Fable, contre une vérité dérivée du document et une clé ; les cas limites tranchés par l’auteur |

**Critères de jugement.** *Lire* : la description de la frame 300 est comparée à une vérité dérivée du document, item par item ; « exact » = tous les items justes. *Déboguer* : les fautes trouvées sont comptées contre une clé de sept fautes plantées, avec les manquées et les faux positifs. *Écrire* : chaque écart à la grammaire est une faute, rattachée à une règle ; « faute faible » = un écart que le sujet a signalé lui-même comme incertain. *Mesure 7*, « réponse pleine » : la réponse fusionne dans le document, tous les items de la clé sont présents, et la page construite dans Chrome ne produit aucune erreur ; cette dernière condition a été retirée au rejeu du 23 septembre, Tispi étant un format qui se juge sans le moteur. Le code n’a pas été exécuté au-delà de cette construction.

## 2. Le circuit et ce qui est vérifié

Un agent travaille sur un **export** au format Tispi/IA ; le résultat revient par **réimport**. L’export a trois parts.

- **La réduction de nœud** existe dans le moteur : `TsiTokenizerModule.reduce` ramène chaque instance d’un module à sa forme réduite, et `expand` la développe. Les deux sens sont testés : développer(réduire(D)) = D et réduire(développer(R)) = R, batterie `t10_reduis`, 26 contrôles.
- **La projection par rôle et par branche** existe dans le moteur : `TsiIaRoleFilter.project` rend le texte que l’agent reçoit et garde ce qu’il a masqué, nœud par nœud ; `merge` relit la réponse, refuse ce qui est écrit hors périmètre et remet le masqué à sa place. Sa réversibilité est testée : `merge(project(x)) = x` pour chaque rôle, dans la batterie `t13_filtre`, 38 contrôles. C’est cette projection qui a produit le document replié de la mesure 7.
- **La traduction de surface** du format moteur vers le format IA, les tags `tsi-morph`, `tsi-pilot`, `tsi-group`, `tsi-leaf`, l’option `@nom`, la relation `~>`, n’est pas écrite : les documents de cette étude ont été rédigés directement au format IA, par l’assistant qui a conduit les mesures. La réversibilité de cette traduction est une propriété attendue, pas mesurée.

## 3. Trois registres de preuve

| Registre | Affirmation | Preuve | Statut |
|---|---|---|---|
| Mécanique | la réduction de nœud et son développement sont inverses | développer(réduire(D)) = D, réduire(développer(R)) = R, batterie `t10_reduis`, 26 contrôles | vérifié, publiable avec les tests |
| Mécanique | la projection par rôle et son réimport sont réversibles | `merge(project(x)) = x`, batteries `t13_filtre` et `t14_fold`, 73 contrôles | vérifié, publiable avec les tests |
| Mécanique | la traduction de surface est réversible | aucun test : elle n’est pas écrite | **à faire** |
| Qualitatif | des règles accompagnées d’exemples ont corrigé les fautes récurrentes | trois fautes récurrentes, une règle et un exemple pour chacune, les fautes disparues, sur trois modèles ; la même règle sans puis avec exemple, 0 sur 3 puis 3 sur 3 | robuste comme direction ; un cas unique, non quantifié |
| Indicatif | taux de réussite en lecture, débogage, écriture | une session par modèle et par tâche, trois modèles | n trop petit : les effectifs ne permettent qu’une estimation très imprécise du taux |

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
| 3 réussites sur 3, une tâche, une passe, trois modèles différents | [44 %, 100 %] |
| 9 réussites sur 9, trois tâches et trois modèles réunis, passe 5 | [70 %, 100 %] |

Ces intervalles disent ce que les données excluent : pour « 3 sur 3 », tout taux inférieur à 44 %. Ils ne disent pas que le taux est de 100 % ; un taux de 50 % reste compatible avec « 3 sur 3 ». Le regroupement « 9 sur 9 » mélange trois tâches et trois modèles : il n’est pas le taux d’un modèle sur une tâche. Le compte brut, lui, est exact : aucun échec observé en lecture ni en débogage sur les 24 sessions de ces passes.

## 5. La boucle règle / faute

Le résultat principal n’est pas un taux : c’est le coût d’apprentissage mesuré règle par règle. Chaque faute d’écriture a désigné une règle absente du document ; la règle a été écrite et incarnée dans un exemple ; la faute a disparu.

| Faute observée | Règle absente | Après la règle et son exemple |
|---|---|---|
| la durée d’une transition, `<8:…>`, prise pour le numéro de la frame d’arrivée | une durée d’effet n’est pas une frame | disparue, passe 2 |
| une variable et des dimensions écrites dans `style=` | `style=` n’est ni lu ni interpolé ; une dimension s’écrit en piste | disparue, passe 2 |
| une instance sous un autre tag que son module | le tag de l’instance est le tag du module | disparue, passe 2 |

Deux faits de méthode, observés sur les trois modèles :

- **dans le cas testé, la règle énoncée sans exemple n’a été respectée par aucun des trois modèles** : le contrat d’un module, écrit dans la notice en passe 2, a été omis 3 fois sur 3 ; en passe 3, la même règle, inchangée, accompagnée d’un seul exemple dans le document, a été respectée 3 fois sur 3. C’est un cas unique : il soutient que les règles accompagnées d’exemples ont corrigé les erreurs récurrentes dans ces essais, pas une loi générale ;
- **les incertitudes déclarées par les sujets sont la table des matières de la notice** : demandées, elles sont honnêtes et précises.

**Amélioration et validation.** Les passes successives ont servi à améliorer le document à partir des fautes observées, sur les mêmes tâches T1 à T3. La réussite de la passe 5 montre que ces difficultés sont résolues sur ces tâches ; elle ne mesure pas le transfert à des tâches nouvelles. Les tâches T5 à T8 de la mesure 7 étaient nouvelles, mais jugées avec la notice finale. Mesurer le transfert demande des tâches gardées à part pendant l’amélioration.

Cette boucle est reproductible sur tout langage. Elle prédit aussi où viendront les prochaines fautes : sur les règles encore non écrites, par exemple le choix entre `tsi-morph` et `tsi-pilot`, ou la préséance entre transitions.

## 6. La mesure 7 : le document replié

Quatre tâches longues, neuf à quinze écritures coordonnées chacune, dont trois nœuds à créer. Deux bras sur les mêmes demandes : **L**, le document replié ; **E**, le document entier. Trois modèles, deux tirages : 24 sessions par bras.

Le repli est calculé par le filtre de rôle du moteur, `TsiIaRoleFilter.project(document, branches)`, à partir de deux données écrites dans l’énoncé de la tâche : son rôle, structurel, sémantique, spatial ou décoratif, et les deux branches qu’elle modifie, par exemple `#console` et `#monde`. Le bras E recevait le même énoncé, avec les mêmes noms de branches. La mesure évalue donc un repli dont les branches sont nommées par la demande ; elle ne mesure pas un système qui trouverait seul, dans une demande en langage courant, les branches à replier.

| | L, replié | E, entier |
|---|---|---|
| réponses pleines | 24 sur 24 | 21 sur 24 |
| tokens d’entrée, notice exclue | 219 189 | 383 737 |
| tokens de sortie | 186 190 | 340 524 |
| dollars, notice exclue | 3,69 | 7,14 |

Soit, en septembre, moins 43 % de tokens d’entrée et moins 48 % en dollars. Rejouée le 23 septembre sur Fable, 8 sessions par bras : 8 sur 8 dans les deux bras ; entrée moins 43 %, dollars moins 46 %.

**Ce que ces chiffres veulent dire, et ne veulent pas dire.**

- Corpus : un seul document, de 7 352 tokens entier. Replié, il tombe à 713, 1 234, 1 297 ou 2 918 tokens selon la tâche : de moins 60 % à moins 90 % sur le document envoyé, moins 43 % sur l’entrée totale, parce que la notice et les prompts ne changent pas.
- « Branche stable », la base de la compression par modules, n’a pas de définition opérationnelle ; le repli de la mesure 7 est celui du filtre de rôle, pas une réduction de modules.
- Le gain porte sur l’entrée et la sortie, donc sur le coût. Sur la réussite, un écart a été observé, 24 sur 24 contre 21 sur 24 ; les résultats ne permettent pas de conclure à une amélioration de la réussite : test exact de Fisher, p ≈ 0,23. Les trois échecs du bras entier sont chez haiku ; deux d’entre eux portent sur une piste que le repli masquait.
- Le cache a joué dans 18 sessions sur 48 : 16 fois un préfixe court de 3 289 tokens, deux fois un préfixe entier de 29 797 tokens, notice comprise. Les dollars « notice exclue » le neutralisent en partie, pas entièrement.

## 7. Ce que nous ne savons pas

| Inconnu | Pourquoi | Comment on le saura |
|---|---|---|
| taux de réussite réel en écriture | une session par modèle et par tâche | au moins 35 sessions par cellule sans échec, intervalle de Wilson |
| coût réel de la compression | corpus unique ; « branche stable » non définie | une définition de la branche stable, puis une tâche d’édition en contexte replié sur plusieurs documents |
| choix automatique des branches à replier | les branches étaient nommées par la demande | une demande en langage courant, sans nom de branche, et le repli à charge du système |
| transfert à des tâches nouvelles | les tâches T1 à T3 ont servi à améliorer le document | des tâches gardées à part pendant l’amélioration |
| supériorité du format IA sur le format moteur | aucun bras comparatif | un bras au format moteur, à budget de tokens égal |
| validité pour la grammaire actuelle | mesures faites sur `&stop 0:1;`, format actuel `&synchro 0:stop;` | rejeu daté, version de la grammaire épinglée |
| réversibilité de la traduction de surface | elle n’est pas écrite | un test aller-retour automatisé, égalité modulo forme canonique, comme celui de la projection |

## 8. Critère de sortie du statut pilote

Le format IA sera considéré comme validé quand, sur une suite publiée de tâches gardées à part, la borne inférieure de l’intervalle de confiance à 95 % dépassera 0,90 sur chacune des trois tâches, lecture, écriture, débogage, pour chaque modèle ; avec un bras comparatif au format moteur à budget de tokens égal ; sur une version épinglée de la grammaire ; et après un test automatisé de réversibilité de la traduction de surface, comme celui qui existe pour la projection.

Ce que cette borne demande : au moins 35 sessions par cellule sans aucun échec, 30 sur 30 ne donnant que 88,6 % ; davantage s’il y a des échecs. Ce programme représente plusieurs centaines de sessions. Il est annoncé, pas lancé.

## 9. Artefacts

Le dossier de l’étude contient le protocole, les prompts, le document de référence et ses versions, les clés de débogage, les scripts de lancement et de comptage, et les réponses des sessions, passe par passe. Il n’est pas encore publié dans ce dépôt.
