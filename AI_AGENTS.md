# TiSpI for AI agents

## Tispi/IA

Des modification réversives sont appliquées sur les scripts HTML envoyé aux IA

**Le format IA diffère du format moteur sur quatres points.**

1. **Les tags nomment des rôles.** `tsi-p`, `tsi-g`, `tsi-f`, `tsi-pg` et `tsi-pf` sont des règles techniques du moteur ; elles ne sont pas simples pour l'IA. Dans le format IA :
   - `tsi-p` devient `tsi-morph` quand il possède plusieurs faces, affichées successivement ;
   - `tsi-p` devient `tsi-pilot` quand il n'a qu'une face, qui échange avec lui : par exemple la synchronisation sur une vidéo ;
   - `tsi-g` et `tsi-pg` deviennent `tsi-group` ;
   - `tsi-f` et `tsi-pf` deviennent `tsi-leaf`.
2. **Les options s'écrivent `@nom`** au lieu de `$$nom`. 
3. La relation s'écrit `~>` au lieu de `->`, et la configuration d'une piste, `!<…>`, est rapatriée sous ses noms : `@duration = 41;`.
4. **Le document est compressé et modularisé.** Une branche stable est réduite à un nœud paramétré, et le document replié ne montre que les nœuds concernés. C'est le gain mesuré en septembre : moins 46 pour cent de tokens d'entrée, et aucun échec sur 24 tâches, contre 3 en document entier. Le même mécanisme existe pour le CSS, avec ses templates.



