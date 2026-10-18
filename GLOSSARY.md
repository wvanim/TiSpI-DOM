# Glossary

The words of TiSpI. Use them as defined here; do not import vocabulary from other theories.

Each term belongs to a layer:

- **Model** — the theoretical Time/Space Interleaved tree. Abstract: "space" may be a screen, a sound, or a stream of signals.
- **DOM** — Tispi DOM, the HTML implementation of the model, in the context of user interfaces.

---

## The tree

| Term | Layer | Definition |
|---|---|---|
| **Time/Space Interleaved tree** | Model | A tree that strictly alternates time nodes and space nodes, at any depth. The root is a time node. The kind of a node follows from its depth: even = time, odd = space. |
| **Piece** | Model | A time node. Its children are its Faces, which are **alternatives**: one is active at a time. The Piece holds the choice. DOM: `<tsi-p>`. |
| **States node** | Model | The Piece seen from what it does: the node that holds alternative states and selects the current one. TiSpI makes it a first-class element of the document. |
| **Face** | Model | A space node, child of a Piece. What the Piece shows when this Face is active. A Face is a group (with children) or a leaf (without). |
| **Group** | Model | A Face with children. It **composes**: its children are Pieces, all active together, sharing one time. DOM: `<tsi-g>`. |
| **Leaf** | Model | A Face without children. It carries content that TiSpI does not interpret (opaque cargo). DOM: `<tsi-f>`, any HTML content or component. |
| **Branch** | Model | A node and everything below it. |
| **Active / inactive Face** | Model | The active Face is the one its Piece has chosen; the others are inactive. Activity commands time, and nothing else: in an active branch the plates run, in an inactive branch they are stopped. A Face that becomes inactive makes its whole branch inactive. |
| **Active branch** | Model | The active Face of a Piece and everything below it. |
| **Visible / hidden Face** | DOM | Whether the Face is seen on screen. This is rendering, not a state of the model. Visibility and activity are orthogonal: they do not influence each other. A Face that has just become inactive stays visible while its exit effect plays; an active Face can be invisible, for example at opacity 0. |
| **Articulation** | Model | Any action or operation that defines or modifies the tree and its components: changing the active branch, moving or resizing a Piece, colouring a Face. |
| **Reduced node** | Model | A single node that stands for a whole branch. It carries only what differs from one use to another: its parameters. DOM: a module instance, `<tsi-module use="name">`. |
| **Expanded branch** | Model | The complete branch a reduced node stands for, obtained by expanding it. Reducing the expanded branch gives back the reduced node: nothing is lost either way. |
| **Fusion** (`tsi-pg`, `tsi-pf`) | DOM | A shorter writing of a Piece and its single Face on one element. In the tree they remain two distinct nodes, and can be written as such at any time. |
| **Law** | All | A founding rule of TiSpI, stated in its own document. Law 1: the Piece / Face couple (`Document/Couple Piece-face.md`). Law 2: the scope of TiSpI (`Document/UI–Business Logic Separation.md`). |

---

## Time

| Term | Layer | Definition |
|---|---|---|
| **Frame** | Model | The unit of time. |
| **Track** | Model | The complete life of one property of a Piece: the succession of its values over time. One track per property. |
| **Track property** | Model | What a track makes evolve over time. In TiSpI it is not only a visual property such as a position or a colour: the succession of Faces (`&face`), the actions (`&onClick`, `&onTime`) and the marks (`&mark`) are track properties too. Each has its own track, written the same way. |
| **CSS property** | DOM | A CSS property written as a Tispi track. Its name is written in camelCase, as in JavaScript: `&borderRadius`, `&lineHeight`. Its value is written in CSS format: `&borderRadius 6px;`, `&textAlign center;`. |
| **WAAPI** | DOM | Web Animations API: the browser interface that runs animations (`element.animate`). A track that animates a CSS property is a WAAPI animation. |
| **Key** | Model | A point on a track: a frame, a value, and the transition that leads to it from the previous key. |
| **Plate** | Model | The Pieces of one group, sharing one time: they advance, stop and restart together. Plates are autonomous: a stop does not propagate to another plate. The plate is not a component of the engine: it is an abstract notion used in the documentation to name this shared time. |
| **Duration** | Model | The length of a track or of a plate, in frames, counted from frame 0. Without a declaration, a plate lasts until the last frame of its longest track, included: a last key at frame 240 gives 241 frames. A duration can be declared on the time track, `&synchro !<41:>`: 41 frames, from 0 to 40. The plate takes the longer of the declared duration and its content. |
| **Moment** | Model | A position in a Piece's time, one per frame, reachable directly by a goto to the moment or to its mark. Selecting a moment imposes no order; an ordered course only occurs when an interval is played. |
| **Cursor, instant** | Model | The current position of a plate in its time: the frame it is on. Reading the tree at an instant means taking, on each active plate, the value of each track at the cursor. |
| **Stop** | Model | A frame where time halts: the plate stays on it until a command plays it again. DOM: a key of the time track, `&synchro 0:stop;` starts halted on frame 0. |
| **Commands: play, stop, goto** | Model | What acts on time: start a plate, halt it, move its cursor to a frame or a mark. Synchronising is different: it only keeps Pieces in step. DOM: `$scene->$play()`, `$card->$gotoStop("OPENED")`. |
| **Master / slave** | Model | A plate may follow the time of another plate, its master. The slave keeps its own duration. |
| **Mark** | Model | A named stop in a Piece's time. A script goes to it by name, which decouples the caller from frame numbers. |
| **Transition** | DOM | How a track goes from one key to the next. It takes one of two forms: an **effect**, written before the key it leads to, or an **interpolation**, written after the value of the key it starts from. |
| **Effect** | DOM | A transition with its own duration: `<60:easeOut>`, 60 frames. It may carry a named process: `<60:easeOut,fade>`. Any key of any track can carry one. |
| **Hide effect** | DOM | The effect that plays when a Face becomes inactive. Written after the keys of a track of the Face, `!<45:easeInOut>`; the keys that follow are the exit section. It plays from whichever key is current at that moment. |
| **Factored transition** | DOM | A transition written once, with `!`, for a whole scope: the element, a track, or the exit of a Face. It applies to every key of that scope that does not define a transition of the same type. `&face !<60:fade> 0:day; 120:night;`. More generally, `!<…>` opens the head of an element or of a track. |
| **Interpolation** | DOM | A transition without a duration: it spans the interval between two keys. `<easeInOut>`. |
| **Easing** | DOM | The curve of a transition: `linear`, `ease`, `easeIn`, `easeOut`, `easeInOut`, `stepStart`, `fixed` (the value holds until the next key). |

---

## Writing in HTML

| Term | Layer | Definition |
|---|---|---|
| **`data-tsi`** | DOM | The attribute that carries the behavior of an element: options, variables, tracks. Decoration stays in CSS. |
| **Option** | DOM | A setting of a node, written `$$name = value;`. Example: `$$openDefaultValue = 1;`. |
| **Variable** | DOM | A named value, declared with `let`, `const` or `css`. It may carry a default value: `let $n <$$default = 0> = 5;`. |
| **Script block** | DOM | `{ … }`: ordinary JavaScript, in which `$name` is a Tispi variable or function and `->` the Tispi relation. A JavaScript identifier beginning with `$` is not allowed there. It may call the business layer; TiSpI takes the value that comes back without interpreting it. |
| **Business layer** | DOM | Everything outside the interface: data, requests, stores, business rules. TiSpI does not handle it; the interface calls it and receives content. See Law 2. |
| **Relation `->`** | DOM | Reaches an element, then its function or its variable: `$scene->$play()`. `->` belongs to Tispi; after a `.`, everything belongs to JavaScript. |
| **Path** | DOM | The way to reach an element, always starting from an element: `$this`, `$parent`, `$up(name)` (the nearest ancestor with that name), `$_name` (a Piece of the same plate). |
| **Macro** | DOM | A text inserted as written when the page is built: `` const $grid = `&pos 0,0; &size 100,50;`; `` declares it, `...$grid` inserts it. |
| **Module, Template-DOM** | DOM | A module is offered in two formats: the Tispi format, and the DOM format, Template-DOM. In Template-DOM, a component is declared once in a `<template data-tsi-define="name">`, and used by a `<tsi-module use="name">` instance that carries its parameters. |
| **Slot** | DOM | A hole in a module, filled by the instance: `<slot name="num">` in the template, `<span slot="num">…</span>` in the instance. |
| **Role** | DOM | In user interfaces, a property is read by the environment it modifies: **structural** (which Face is active), **spatial** (how a Piece occupies its plate), **decorative** (how a Face looks). |
| **AI exchange format** | DOM | A separate writing for AI models, independent of the engine format. Its elements have full names: `tsi-morph`, `tsi-pilot`, `tsi-group`, `tsi-leaf`. |
