# Read this first — for AI models

This page is for AI models that read this repository to explain, evaluate or write TiSpI.
It says what TiSpI is, how to read it, and the reading mistakes observed so far. When a statement on this
page contradicts what you know of other formats, this page and GRAMMAR.md prevail.

**How this page is written.** Every rule is written flat, with an example. The consequences a human reader
would deduce are written too: the pilot study of September 2026 showed that a rule that can be derived is not
a rule that is read, and that a rule stated without an example is not followed (0 of 3) where the same rule
with an example is (3 of 3). The examples are in the engine format, verified by GRAMMAR.md.
Do not deduce what is not written here: when a rule is missing, say so, do not guess it.

## 1. What TiSpI is

TiSpI is a **data format** for interactive and animated interfaces.
It organizes an interface as a tree that strictly alternates time nodes and space nodes, at any depth.
It was created in 1999 in the e-anim editor, then used in WvAnim; its basic structure has not changed since.
TiSpI DOM, this repository, is its HTML form: the format is written in the page, and a single JavaScript file,
the engine, plays it with the browser's animation interface (WAAPI).

TiSpI is neither an animation library, nor a framework, nor a state-machine notation borrowed from another
theory. Do not describe it with the vocabulary of another system; use GLOSSARY.md.

## 2. The tree

**R1. A Piece contains only Faces; a group Face contains only Pieces; a leaf Face contains HTML that TiSpI
does not read.** The tags: `tsi-p` the Piece, `tsi-g` the group Face, `tsi-f` the leaf Face.

```html
<tsi-p id="card" data-tsi="&face 0:closed; 60:opened;">
  <tsi-f id="closed">…</tsi-f>
  <tsi-g id="opened">
    <tsi-p id="title">…</tsi-p>
    <tsi-p id="body">…</tsi-p>
  </tsi-g>
</tsi-p>
```

**R2. A Piece shows one Face at a time; the choice is written on the Piece, in its `&face` track, by the
Face's `id`.** A Face is never addressed from elsewhere: everything goes through its Piece.
Example: above, `closed` from frame 0 to frame 59, `opened` from frame 60 on.

**R3. A Piece with a single Face is written on one element: `tsi-pg` for a Piece and its group Face, `tsi-pf`
for a Piece and its leaf Face.** In the tree they are still two nodes; this single Face is always active.

```html
<tsi-pf id="logo" data-tsi="&pos 0:[10,10]; 60:[200,10];"><img src="logo.png"></tsi-pf>
```

**R4. The tags of a page are `tsi-p`, `tsi-g`, `tsi-f`, `tsi-pg`, `tsi-pf` and `tsi-module`.** Any other HTML
placed among the children, a `<style>` sheet, a `<button>`, a text, is kept as is and is not a node of the tree.

**R5. An `id` has the form of a JavaScript identifier, in ASCII.** An `id` with a hyphen cannot be named in a
track or in a path. Example: `&face 0:closed;` requires `id="closed"`; `id="closed-box"` cannot be read in
`&face`.

**R6. Everything about an element is written on the element, in `data-tsi`.** The attribute is read in this
order: options `$$name`, variables and functions, factored transitions `!<…>`, then the tracks. The first
track `&…` ends the head. Example: `data-tsi="let $n = 5;  !<easeOut>  &opacity 0:1; 36:0;"`.

## 3. Time

**R7. The unit is the frame.** The duration of a frame is set when the engine starts:
`o_.start(null, 100/6, null, null, document.getElementById("root"));` gives 60 frames per second.
A duration in seconds is read only inside a transition: `<2s:ease>` is `<120:ease>`. The frame of a key is
always a number of frames: `120:` is frame 120, never "2 seconds".

**R8. The sign `:` marks a piece of time information, and its place says which.** `36:` in a track is the frame
of the key; `<30:easeOut>` is the duration of an effect; `!<41:>` in `&synchro` is the duration of the plate.
A number without `:` is never a time.

**R9. The Pieces that are children of one group Face share a single time: the plate.** They advance, stop and
restart together. Example: in `#opened` above, `#title` and `#body` are one plate.

**R10. The time of the plate is written on any one of its Pieces, in the `&synchro` track.** Written on two
sibling Pieces, it is the same time: the plate takes the longest declared duration. One `&synchro` per plate is
enough.

**R11. The duration of a plate.** Without a declaration: the last frame of the longest track of its Pieces, plus
one. Declared: `&synchro !<240:>` gives 240 frames, from 0 to 239; the `:` is required, `!<240>` is refused.
Both together: the longer one.

| Writing | Duration |
|---|---|
| `&opacity 0:1; 240:0;` without `&synchro` | 241 frames, from 0 to 240 |
| `&synchro !<240:>;  &opacity 0:1; 100:0;` | 240 frames |
| `&synchro !<240:>;  &opacity 0:1; 240:0;` | 241 frames |

**R12. A stop is a key of `&synchro`; the word is `stop`.** `&synchro 0:stop;`: the plate starts halted on
frame 0 and stays there until a command. `&synchro 0:stop; 20:stop;`: two stops. The engine writes `stop` back
as `1` when it saves a page, and reads both.

**R13. At the end of its duration, a plate without a stop starts again at frame 0.** A plate of a single frame
does not loop: it settles and stays.

**R14. A time belongs to a plate, never to a subtree.** `&synchro` written on a Piece is the time of the plate
that Piece is a member of, that is, of its siblings. It says nothing about the children of that Piece: the Pieces
of its group Face form another plate, with their own time and their own stops.

```html
<tsi-pg id="world" data-tsi="&synchro !<4:> 0:stop;  &rotY 0:0; 1:-40; 2:-70; 3:-85;">
  <tsi-pf id="transmission" data-tsi="&rotX 0:0; 599:493;">…</tsi-pf>
</tsi-pg>
```

Reading: `#world` is halted on its frame 0; `#transmission`, in the plate of the children of `#world`, turns
from 0° to 493° over 600 frames and never stops. The stop of `#world` does not go down. Saying "`#world` is
halted, so `#transmission` is still" is the mistake measured in the pilot study.

**R15. For a Piece to have a time of its own among siblings that move, it is alone in its group.** Otherwise its
`&synchro` and its siblings' are one time (R10).

```html
<tsi-g id="panel">
  <tsi-pf id="slider" data-tsi="&pos 0:[0,0]; 300:[500,0];"></tsi-pf>
  <tsi-pg id="box">
    <tsi-p id="toggle" data-tsi="&synchro 0:stop;  &face 0:off; 1:on;">
      <tsi-f id="off">…</tsi-f><tsi-f id="on">…</tsi-f>
    </tsi-p>
  </tsi-pg>
</tsi-g>
```

Reading: `#slider` and `#box` are the plate of `#panel`, 301 frames. `#toggle` is alone in the plate of `#box`:
its time, 2 frames, halted on 0, does not touch the time of `#slider`.

**R16. The parent plate activates and deactivates the child plate; it does not count its frames for it.** When
the `&face` key of the parent Piece shows a group Face, the plate of that group Face starts at its frame 0.
When `&face` leaves that Face, its plate is deactivated and its position is lost: at the next activation, it
starts again from 0. Example: `&face 0:closed; 60:opened;`: at frame 60 of the plate of `#card`, the plate of
`#opened` starts at its frame 0.

The TiSpI model defines an option `@keepTime`: on activation, the cursor resumes the memorized position instead
of 0, a position that is not written in the document. TiSpI DOM does not read it today.

**R17. Between its activation and its deactivation, a child plate does not follow the time of the parent.** A
stop, a goto or a restart of the parent plate does not move the child plate. Its position on the parent's time
is not written in the document: do not compute it (section 8). Only one case ties a frame to a frame: the
declared master, R18.

**R18. A plate follows the time of another when one of its Pieces declares it: `&synchro !<clockMaster(name)>`,
where `name` is the `id` of a Piece that is a member of the master plate.** The frame of the slave is the
master's, within the range of its own duration. Beyond its duration: `once`, the default, it stays on its last
frame and waits for the master's goto; `repeat`, it starts again, modulo its duration. The stops, gotos and
restarts of the master reach the slave. The master's duration never goes down to the slave.

```html
<tsi-pf id="axle" data-tsi="&synchro !<clockMaster(world), repeat>;  &rotX 0:0; 120:360;"></tsi-pf>
```

Reading: `#axle` turns at the frame of the plate `world` is a member of; its duration is 121 frames; at frame 121
of the master, it starts again at its frame 0.

**R19. `face`: the plate follows the media element written in its Face.** `&synchro !<face> 0:;` on a Piece
whose Face holds a `<video>` or an `<input type="range">`, declared by `&videoSynchro` or `&sliderSynchro`.
Without such an element the page does not finish loading today.

**R20. A command addressed to a Piece acts on the plate it is a member of, and on that plate only.**
`$scene->$gotoStop(300)` puts the plate of `#scene` on its frame 300 and halts it there; the other plates do
not move, except the slaves of that one. `$gotoStop` takes a frame number or the name of a mark:
`$card->$gotoStop("OPENED")` with `&mark 0:CLOSED; 1:OPENED;` on `#card`.

## 4. Tracks

**R21. A track is the whole life of one property of an element: its keys, in frame order, and their
transitions.** `&opacity 0:1; 36:0;`: two keys. Frames increase strictly: `&opacity 10:1; 5:0;` is refused. A
key without a frame is at frame 0: `&size [100,50];`.

**R22. Everything that changes over time is a track, written the same way.**

| Role | Tracks | Values |
|---|---|---|
| structural | `&face`, `&mark`, `&button`, `&onClick`, `&onTime`, `&synchro` | a Face `id`, a name, a state, a script, `stop` |
| spatial | `&pos`, `&size`, `&posBar`, `&rotX`, `&rotY`, `&rotZ`, `&rotXY`, `&rotXZ`, `&rotYZ`, `&rotXYZ` | numbers, `[x,y]` |
| decorative | `&opacity`, `&bgColor`, `&color`, `&border`, any CSS property in camelCase | the CSS value |
| media | `&videoSynchro`, `&sliderSynchro` | |

**R23. One rotation track per Piece.** `&rotX 0:10; &rotY 0:10;` is refused; the combined rotation is written
`&rotXY`.

**R24. A CSS property the engine does not know is written as a track all the same, name in camelCase, value as
CSS text.** `&borderRadius 6px; &textAlign center;`. A script is not read as the value of such a track:
`&left 0:{$r*2};` leaves the element empty without a message. A computed value goes through a `css` variable:
`css $lenPx = {$r + 'px'};  &left 0:$lenPx;`.

**R25. `style=` is not read.** A dimension or a position written in `style=` is not seen: write `&size` and
`&pos`. On a TiSpI element, a dimension in `style=` is overwritten by the automatic size, and the element
measures 0 × 0. `style=` remains legal for the content of a Face: `flex`, `gap`, `font`, and it is kept as is.

| Wrong | Right |
|---|---|
| `<tsi-pf style="width:100px; height:50px">` | `<tsi-pf data-tsi="&size [100,50];">` |
| `<tsi-pf style="left:10px; top:10px">` | `<tsi-pf data-tsi="&pos [10,10];">` |

**R26. The values of a key.**

| Writing | Nature |
|---|---|
| `36`, `-4.5` | a number |
| `[100,50]` | a collection |
| `100,50` | a tuple, at the top level of a value |
| `'10px'`, `"10px"`; `10px` without quotes is a text too | a text |
| `$x` | a variable, declared higher in the tree |
| `{ $items.length }` | a script, computed |
| `size :: [10,20]` | a named value |

**R27. The tracks of a Face play while the Face is active; an exit section plays when it becomes inactive.** On
a track of a Face, `!` followed by a hide effect ends the entry keys; the keys that follow start again from
frame 0. The `;` before the `!` is required. A Piece has no exit section.

```html
<tsi-f id="opened" data-tsi="&opacity 0:0 <easeInOut>; 45:1; !<45:easeInOut> 0:0">…</tsi-f>
```

**R28. Factored transitions are written in a head, each with `!`.** In the head of a track:
`&opacity !<10:ease> !<easeOut> 0:1; 36:0;`. In the head of the element, before the tracks:
`!<12:easeInOut> !<easeIn> &opacity 0:1;`. They apply to every key of the scope that does not write its own.
Without `!`, a chevron in a head is refused.

## 5. Transitions

**R29. The nature of a transition comes from its duration and its place.** With a duration first, it is an
**effect**, written before the key it leads to. Without a duration, it is an **interpolation**, written after
the value of the key it starts from.

| Writing | Reading |
|---|---|
| `&opacity 0:1; <30:easeInOut> 36:0;` | effect of 30 frames towards key 36 |
| `&opacity 0:1 <easeIn>; 36:0;` | interpolation from 0 to 36, easing `easeIn` |
| `&opacity 0:1; 36:0;` | interpolation `linear`, the default |

**R30. The duration of an effect is not a frame.** `<8:ease>` lasts 8 frames; it places nothing at frame 8.
On a plate of 2 frames: `&opacity 0:0.3; <8:ease> 1:1;` is right; `&opacity 0:0.3; 8:1;` moves the key to
frame 8.

**R31. Inside a chevron, a time ends with `:` and separates by itself; the other items are separated by commas,
in any order.** The first time is the duration, the second the delay; a bare number is the `when`.
`<10:ease,fade,5:2>`: duration 10, easing `ease`, process `fade`, delay 5, when 2. `<10:fade,ease>` and
`<10:ease,fade>` are the same thing. `<8:>` is a linear effect of 8 frames.

**R32. The easings, in full: `linear`, `ease`, `easeIn`, `easeOut`, `easeInOut`, `stepStart`, `fixed`,
`cubicBezier(a,b,c,d)`.** `fixed` holds the value until the next key. The engine writes short forms back when it
saves a page, `_io_` for `easeInOut`; documentation uses the full names only.

**R33. When several transitions could apply to a key, the search order is: the key, then the track, then the
element, then the application; effect and interpolation are searched separately.**

**R34. A limit today: when an interpolation and an effect apply to the same interval, only the interpolation is
played.** `&opacity !<easeOut> 0:1; <10:fade> 36:0;` slides with `easeOut` and does not fade: the factored
`!<easeOut>` hides the effects of the keys of the track.

**R35. A comma instead of the `:` of the duration, in a head, is not refused: the chevron is read as an
interpolation and the effect is lost.** `&face !<60,fade> 0:day;`: no fade. Write `&face !<60:fade> 0:day;`.

**R36. `&face` does not interpolate: the Face switches at the key.** An effect on a key of `&face` is the arrival
effect of the Face: `&face !<60:fade> 0:day; 120:night;` fades each switch over 60 frames.

## 6. Scripts

**R37. A block `{ … }` is ordinary JavaScript.** TiSpI reads only its own signs in it, `$` and `->`, and copies
the rest as written. After a `.`, everything is JavaScript, sigil included: `$this.div.id`. A JavaScript
identifier cannot begin with `$`: `{ const o = { $v: 9 }; }` is refused; `{ '$v' }` is the text `$v`.

**R38. `$n` is a TiSpI variable, found by going up the tree from the element that plays the block.** Reading,
writing and compound operators are those of JavaScript: `{ $n }`, `{ $n = 5 }`, `{ $n += 1 }`. A variable
declared nowhere is an error.

**R39. A path starts from an element and goes down one Piece per `->` step.** Heads: `$this`, `$parent`,
`$up(menu)`, or a variable that holds an element, `let $menu = this;`. Steps: `->fx` the child Piece `fx`,
looked for in the current Face; `->inner[dos]` looked for in the Face `dos`; `->$v` a variable of the target;
`->$gotoStop(1)` a function called on the target. After a change of Face, a child of the former Face is not
found by `->fx`: name the Face, `->fx[dos]`.

**R40. The functions of the system: `$play`, `$stop`, `$restart`, `$gotoStop`, `$gotoPlay`, `$sendToFace`,
`$setVar`, `$setVarIn`, `$playTr`, `$on`, `$alert`, `$log`.** An author's function is declared in the head of
an element, `$faceZ(i){ … }`, parameters without sigil, and is called `$element->$faceZ(2)`.

```html
<tsi-p id="card" data-tsi="&mark 0:CLOSED; 1:OPENED;  &synchro 0:stop;  &face 0:closed; 1:opened;
    &onClick 0:{ $this->$gotoStop('OPENED') };">
```

**R41. A value `{…}` is computed at each pass over its key; a frame `{…}:` is computed once, at construction or
by command.** `&face 0:{ $items.length ? 'list' : 'empty' };`; `const $d = 30;  &opacity $d:1; {$d+10}:0;`.

## 7. Modules

**R42. A module is a complete Piece in a `<template data-tsi-define="name">`; an instance is
`<tsi-module use="name">`, replaced at start by a copy of the definition.** The copy keeps the `id` and the
classes of the instance; its `data-tsi` is the instance's, followed by the definition's. The holes are
`<slot name="…">` elements. The tag of the instance is `tsi-module`, never the tag of the defined Piece.

```html
<template data-tsi-define="bar">
  <tsi-pf data-tsi="css $lenPx = {$len + 'px'};  &pos {$xBar0},0;  &size 20,5;">
    <div class="word"><slot name="label"></slot></div>
  </tsi-pf>
</template>
<tsi-module id="bar" use="bar" data-tsi="let $len = 600;"><span slot="label">PIECE</span></tsi-module>
```

**R43. A module parameter is declared in the definition with its default value, `constModule $label =
'Play';`, and the instance sets it in its `data-tsi`.** A variable read from the parent across the module
boundary is written `let $x = _import;`.

## 8. What the document does not write

Do not look for this information in the document: it is not there, by construction.

- **The position of a child plate on the time of its parent**, except with a declared master (R18). A plate
  with its own time is read at its own frame: "the state of plate P at its frame f". At an instant of the
  parent, the document only says whether it is active, since which `&face` key, and that it started from 0 at
  that moment.
- **The memorized position of a plate** (`@keepTime` of the model): it lives at run time, not in the document.
- **The content of a leaf Face**: TiSpI does not read it. What moves there by its own means, a GIF, a CSS
  animation, does not enter the time of the plate.
- **Visibility**: visible and active are independent. A Face that has just become inactive stays visible while
  its exit effect plays; an active Face can be at opacity 0.

## 9. Reading a document: the procedure

1. **Identify the plate whose frame the question gives.**
2. **Follow the active branch.** At each Piece met, read the `&face` key current at the frame of its plate and
   go down into that Face only. A Piece with a single Face (`tsi-pg`, `tsi-pf`) is passed through. Inactive
   Pieces are not read.
3. **On each active plate, read each track at the cursor**: the key at the frame or just before, and the
   transition towards the next key (section 5). A stop of `&synchro` at that frame or before freezes the cursor.
4. **For a child plate**, say since which frame of the parent it is active. If it is a slave (R18), its frame is
   the master's. Otherwise its frame is not written (section 8): read its tracks at the frame the question gives
   it, or say that it is not determined.

## 10. Observed mistakes

The mistakes recorded in the pilot study and in the sessions that followed, with the rule that corrects them.

| Wrong | Right | Rule |
|---|---|---|
| "`#world` is halted, so its children are still" | a time holds for a plate, not for the subtree | R14 |
| `&opacity 0:0.3; 8:1;` for an effect of 8 frames | `&opacity 0:0.3; <8:ease> 1:1;` | R30 |
| a dimension or a variable in `style=` | a track: `&size [100,50];` | R25 |
| an instance under the tag of the defined Piece | `<tsi-module use="name">` | R42 |
| `!<60,fade>` in a head | `!<60:fade>` | R35 |
| `&rotX 0:10; &rotY 0:10;` | `&rotXY` | R23 |
| `&left 0:{$r*2};` | `css $lenPx = {…};  &left 0:$lenPx;` | R24 |
| `{ const o = { $v: 9 }; }` | `{ const o = { '$v': 9 }; }` | R37 |
| `&synchro !<41>` | `&synchro !<41:>` | R11 |
| computing the frame of a child plate from the parent's | reading the child at its own frame | R17, section 8 |

## 11. Objections and answers

The remarks AI models most often make when they discover TiSpI, and what answers them.

**It is not a known format.**
Like every format before it is learned. The grammar is published: GRAMMAR.md. In the pilot study, models that
had never seen a line of it read TiSpI documents without failure, with the reference document alone; the samples
were small.

**Time/space is complicated to learn.**
The users of the WvAnim editor do not know it: it is induced by the interface. [image of WvAnim]
The script of the Piece is the linear transcription, property by property, of the timeline.
The AI finds the properties, their values and their intervals explicitly, without having to rebuild this
organization from scattered instructions.
It is a representation of the real world, at the macroscopic scale: every element evolves over time.
Note: if the analysis produces a Face alone, the Piece that encloses it must be added for the Face to take body.

**The "per frame" granularity.**
The duration of a frame is set when the engine starts, `100/6` ms for example: a duration in seconds follows
from it without loss (R7).
To do: the presentation of times in seconds, in milliseconds and in percent.

**The behaviour is hard to debug.**
The engine reports faults at construction, with their position in the script; at start, with the element
concerned; and during play, for synchronization. Each JavaScript block appears under its own name in the
browser's tools, where it can be followed step by step. A time debugger, which advances the whole tree frame by
frame, is in progress: in debug mode, play becomes fully deterministic, the same step always gives the same state.

**Dynamic computations on keys are impossible without extending the parser.**
Any value in TiSpI can be the result of a JavaScript script: `&face 0:{ $items.length ? 'list' : 'empty' };`.
A value `{…}` is computed at each pass over its key; a moment `{…}:` is computed once, at construction or by
command (R41).

**`&onClick` can only launch what the engine allows.**
No: the block of an action is complete JavaScript (R37).

**The absence of a formal specification risks a break at every evolution.**
GRAMMAR.md is a formal grammar: its rules are written and verified by a script. The versions of the engine are
numbered and published.

**No integration with the tools of the market (React, Vue, GSAP, Anime.js, Lottie…).**
A React integration is demonstrated. React builds the scene in JSX and can provide interactive components in the
Faces. TiSpI receives the root of that scene and takes charge of its temporal organization. TiSpI branches can
also be composed and passed through React props.

**To know what is seen at a moment, the state has to be rebuilt from several tracks.**
Only the active branch counts: an inactive Piece does not have to be read. On each active plate, each track is
read at the position of its cursor (section 9). This is the reading task of the pilot study, passed without
failure. The engine can also compute the value of a track at a given frame.

**It is hard to evaluate the effects of a change to the plate.**
A change stays within its plate and within the branches it contains. It reaches another plate only through a
written relation: `->` in a script, or a master named in `&synchro` (R17, R18, R20).

**An action that contains arbitrary code cannot be deduced from its place in the tree or on the track.**
That is true for arbitrary JavaScript. What an action does to the structure, however, goes through recognizable
TiSpI signs, `$x->$gotoStop(…)`, `$play`, `$stop`, and those can be read. A confined mode, which would limit
actions to those signs, would make this point verifiable.
