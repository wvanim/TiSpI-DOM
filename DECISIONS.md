# Decisions

Ideas that have been examined, and what was decided. Before proposing an idea, check that it is not already here.

Each decision gives its date, its layer, and the reason. A decision can be reopened, by the maintainer, explicitly.

---

## The tree

| Date | Layer | Decision | Reason |
|---|---|---|---|
| 2026-09-16 | Model | A Piece has at most one active Face; zero is legal. | A Piece being built in the editor may have no Face yet. |
| 2026-09-17 | Model | The root of the tree is a Piece. | A sketch that starts with a Face is the short form of a Piece holding that single Face. |
| 2026-10-14 | DOM | `tsi-pg` and `tsi-pf` are writings, not nodes: in the tree they remain a Piece and a Face, and can be written as two elements at any time. | They shorten the HTML without changing the tree. |
| 2026-10-14 | DOM | **Refused**: `tsi-gp` (a group and its single Piece on one element), and further fusions. | Each fusion opens the next one (`gpg`, `pgp`…); each puts two roles on one element, so every property (size, position…) needs arbitration between them. |
| 2026-10-14 | DOM | A group that composes a single Piece is written in full, not shortened. | The editor needs it: every element on the surface is a Face. It also carries the plate and the restart of time when it appears. |
| 2026-10-15 | Model | The kind of a space node is read from the presence or absence of children: with children it composes, without it is a leaf. | Like the depth rule, nothing has to be stored. |

## Time

| Date | Layer | Decision | Reason |
|---|---|---|---|
| 2026-09-17 | Model | Time is never a property: it is the position of the keys. | |
| 2026-09-17 | Model | A mark belongs to a Piece; marks are free names, with no prior declaration. | Two Pieces never compete for a mark. |
| 2026-09-17 | Model | Marks are declared in the `&mark` track. | A goto to a mark searches the `&mark` track of the targeted Piece, reads the frame number there, then moves the target to that frame. |
| 2026-10-08 | Model | A slave plate keeps its own duration. When the master goes beyond that duration, an option decides: the slave stays on its last frame (default), or starts again, at the master's frame modulo its duration. | The master drives the time; the slave reads it within its own length. In Tispi DOM: `once` (default) or `repeat`, in the `!<…>` of its time track. |
| 2026-10-14 | DOM | Any key of any track can carry an effect. | What works for one element works for all elements of the same type; a restriction is written only when the model imposes it. |

## Writing

| Date | Layer | Decision | Reason |
|---|---|---|---|
| 2026-09-23 | DOM | The engine format and the AI exchange format are independent. | Each serves its reader; neither is checked against the other. |
| 2026-10-14 | DOM | The engine accepts only `tsi-p`, `tsi-g`, `tsi-f`, `tsi-pg`, `tsi-pf`. The full names `tsi-morph`, `tsi-pilot`, `tsi-group`, `tsi-leaf` belong to the AI exchange format. | Two registers, two readers. |
| 2026-08-28 | DOM | The time track is named `&synchro`; `&clock` is its former name, still read as an alias. A saved page writes `&synchro`. | The name says what the track does: it synchronises time, it does not produce it. |
| 2026-10-14 | DOM | An option is written `$$name` in a page and `@name` in the AI format. `&&` is not a Tispi sign. | `&&` is a JavaScript operator: `a&&b` in a script block would be misread. `$` is reserved to Tispi. |
| 2026-10-02 | DOM | Decoration is written in CSS, not in tracks. | The `data-tsi` attribute carries behavior; CSS already does decoration. |
| 2026-10-14 | DOM | Where decoration goes: in the `style` of a single element; in an `@scope` sheet on the common parent for a branch; as parameters for a module. | An element shows where its style comes from. |
| 2026-10-14 | DOM | A variable may carry a default value, `<$$default = …>`. `$$openDefaultValue = 1` makes the saved document use the default values of its branch; `0` keeps the current values. | `false` is not saved, so the option uses `0` and `1`. |
| 2026-10-14 | All | Documentation uses full names, never abbreviations such as `_io_`. | Abbreviations are noise for human readers. |

## Scope

| Date | Layer | Decision | Reason |
|---|---|---|---|
| 2026-10-12 | DOM | Tispi takes charge of the user interface only. The interface calls the business layer, never the reverse; the business layer provides content, never a display rule. | Each side concentrates on its own expertise. See Law 2. |
| 2026-10-12 | All | Present only what is demonstrated; use only the words of the model. | A borrowed theory pulls the model towards it; an undemonstrated claim is a trap in a presentation. |
| 2026-10-15 | All | The theoretical model and Tispi DOM are two layers. A rule of the DOM — validation, the plate as the space of a screen, the roles of properties — is not a rule of the model. | In the model, "space" may be a sound or a stream of signals. |
