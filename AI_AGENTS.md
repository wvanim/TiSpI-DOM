# TiSpI for AI agents

## AI compatibility

Properties intrinsic to the model, not promises about AI.

| Property of Tispi | Identifiable advantage |
|---|---|
| **Regular Time/Space alternation** | The kinds of relations are predictable; the same composition rule applies at every depth. |
| **Evolution over time described by tracks** | States, values and transitions are directly accessible, with less behaviour to reconstruct from scattered instructions. |
| **Separation by affected environment** | A request can be located and broken down according to the information its resolution needs. |
| **Modules with parameters and slots** | The agent can configure or compose a unit through its interface, without examining its implementation. |
| **Reduction to a labelled, semantic node** | The agent can work at a global scale, then expand only the branches it needs. |
| **Synchronisation par plateau** | frontières net car les plateaux sont autonomes. |

## The circuit

An AI agent works on the Tispi/IA format, never on the Tispi/DOM format. The document reaches it through an **export** to the Tispi/IA format; the agent reads it, checks it or modifies it; the result comes back into the page through **re-import**. The transformations of the export are reversible: nothing is lost in the round trip. Node reduction, which brings an instance of a module back to its reduced form, and the projection by role and by branch, which folds the document around what the task modifies, are in the engine and their round trip is tested; the surface translation, the tags, `@` and `~>`, remains to be written.

## Tispi/IA

Reversible modifications are applied to the HTML scripts sent to AIs.

**The AI format differs from the engine format on four points.**

1. **Tags name roles.** `tsi-p`, `tsi-g`, `tsi-f`, `tsi-pg` and `tsi-pf` are technical rules of the engine; they are not suited to AI.  
The AI format answers to clear functional roles:
   - `tsi-p` becomes `tsi-morph` when it has several faces, shown one after another;
   - `tsi-p` becomes `tsi-pilot` when it has a single face, which exchanges with it: for example the synchronization on a video;
   - `tsi-g` and `tsi-pg` become `tsi-group`;
   - `tsi-f` and `tsi-pf` become `tsi-leaf`.
2. **Options are written `@name`** instead of `$$name`.
3. **The relation is written `~>`** instead of `->`, and the configuration of a track, `!<…>`, is brought back under its names: `@duration = 41;`.
4. **The document is compressed and modularized.** A stable branch is reduced to a parameterized node, and the folded document shows only the nodes concerned. This is the gain measured in September, on a single document: 43 percent fewer input tokens and 46 percent lower cost. The same mechanism exists for CSS, with its templates.

## An example: the button in both formats

The button of the [README](README.md), in the engine format:

```html
<tsi-p id="button" data-tsi="&button 0:OUT; 1:OVER; 2:PUSHED;  &synchro 0:stop;  &face 0:out; 1:over; 2:pushed;">
  <tsi-f id="out">…</tsi-f>
  <tsi-f id="over">…</tsi-f>
  <tsi-f id="pushed">…</tsi-f>
</tsi-p>
```

The same, in the AI format: the Piece has several successive faces, so it is a `tsi-morph`; its faces are `tsi-leaf`. The tracks do not change.

```html
<tsi-morph id="button" data-tsi="&button 0:OUT; 1:OVER; 2:PUSHED;  &synchro 0:stop;  &face 0:out; 1:over; 2:pushed;">
  <tsi-leaf id="out">…</tsi-leaf>
  <tsi-leaf id="over">…</tsi-leaf>
  <tsi-leaf id="pushed">…</tsi-leaf>
</tsi-morph>
```

## What the agent does, and what was measured

Three tasks: **read** the state of a page at a given frame, **write** an addition, **debug** a page that contains faults. A pilot study of September 2026, on fresh sessions and the reference document alone, observed no failure in reading or debugging, and writing faults that each pointed to an unwritten rule: once the rule is written and embodied in an example, the fault disappears.

The samples are small, one session per model and per task, with three models, and the measurements concern the September grammar. The figures, their intervals and what remains to be measured are in the [pilot study](Document/Etude_pilote_IA_2026-09.md).

## Mistakes not to make

The three recurring faults recorded during the measurements, before the rules were written:

| Wrong | Right |
|---|---|
| taking the duration of an effect, `<8:…>`, for a frame number | the duration is inside the chevron; the frame is before the colon of the key |
| writing a dimension or a variable in `style=` | a dimension is written as a track, `&size`; `style=` is neither read nor interpolated |
| instantiating a module under a tag other than the module's | the tag of the instance is the tag of the module |

## References

- The grammar of the engine format: [GRAMMAR.md](GRAMMAR.md); the vocabulary: [GLOSSARY.md](GLOSSARY.md).
- The complete sheet of the AI format, its rules and its examples, will be published in this repository.
