# Grammar

Layer: **Tispi DOM** — the HTML writing of TiSpI, as the engine reads it today.

This document gives the rules of production of the language. Each rule describes what the engine accepts: when the grammar and the engine disagree, the grammar is wrong. The meaning of the words is in the glossary ([GLOSSARY.md](GLOSSARY.md)).

---

## 0. Notation

The rules use the EBNF notation of the W3C, as in the XML specification.

| Writing | Meaning |
|---|---|
| `rule ::= …` | definition of a rule |
| `'text'` | the text, written as is |
| `a b` | `a` followed by `b` |
| `a \| b` | `a` or `b` |
| `a?` | `a`, optional |
| `a*` | `a`, zero or more times |
| `a+` | `a`, one or more times |
| `( … )` | grouping |
| `[A-Za-z]` | one character from the set |
| `/* … */` | comment |

Spaces, tabs and line breaks may separate any two tokens; they are not written in the rules. A line comment starts with `//` and runs to the end of the line.

A rule may be used before its definition: `dataTsi`, `headItem` and `factoredTransitions` (sections 3 and 4), `value` (7), `track` (5), `effect`, `interpolation`, `hideEffect` (6), `javascript` (8).

---

## 1. Names

```ebnf
name       ::= [A-Za-z_] [A-Za-z0-9_]*     /* the format of a JavaScript identifier, ASCII only */
variable   ::= '$' name                     /* a named value           — $scene   */
optionName ::= '$$' name                    /* an option of a node     — $$duration */
trackName  ::= '&' name                     /* a track                 — &opacity */
integer    ::= [0-9]+
number     ::= '-'? [0-9]+ ( '.' [0-9]+ )?
```

- Letters outside ASCII are not name characters: `$é` is refused.
- The `id` of a Tispi element follows `name`: a hyphen or a space cannot be read in a track (`&face 0:closed;`) or in a path. An `id` of another form is reported as a warning.
- In the AI exchange format, an option is written `@name`. The engine also reads `@name` and gives it the same meaning as `$$name`.

---

## 2. Elements

```ebnf
piece      ::= '<tsi-p'  attributes '>' ( face | content )* '</tsi-p>'
face       ::= leafFace | groupFace
leafFace   ::= '<tsi-f'  attributes '>' content '</tsi-f>'
groupFace  ::= '<tsi-g'  attributes '>' ( pieceNode | content )* '</tsi-g>'

/* Fusions: a Piece and its single Face written on one element */
pieceGroup ::= '<tsi-pg' attributes '>' ( pieceNode | content )* '</tsi-pg>'   /* a Piece and its group */
pieceLeaf  ::= '<tsi-pf' attributes '>' content '</tsi-pf>'                     /* a Piece and its leaf */

pieceNode  ::= piece | pieceGroup | pieceLeaf | instance

attributes    ::= ( 'id="' name '"' | 'data-tsi="' dataTsi '"' | htmlAttribute )*   /* each at most once, in any order */
htmlAttribute ::= /* any other HTML attribute: class, style, title, aria-*… */
content       ::= /* any HTML: text, elements, components — TiSpI does not read it */
```

- The children of a Piece are its Faces; the children of a group are Pieces.
- Any other HTML placed among them is `content`: a `<style>` sheet, a `<button>`, a text. It is kept and written back as is, but it is not a node of the tree.
- An `htmlAttribute` is kept and written back unchanged.

### Modules: the Template-DOM format

A module is offered in two formats: the Tispi format, and the DOM format, Template-DOM. This section describes the DOM format.

```ebnf
definition  ::= '<template data-tsi-define="' name '">' pieceNode '</template>'
instance    ::= '<tsi-module' ( 'id="' name '"' )? 'use="' name '"' ( 'data-tsi="' parameters '"' )? htmlAttribute* '>'
                  slotContent* '</tsi-module>'
slotContent ::= /* an HTML element carrying slot="name" */
parameters  ::= headItem*                   /* see section 4: the values the instance gives */
```

- A `definition` contains one complete Piece. Its holes are `<slot name="…">` elements.
- At start, each `instance` is replaced by a copy of its definition. The copy keeps the `id` and the classes of the instance; its `data-tsi` is the parameters of the instance, followed by the `data-tsi` of the definition.
- A definition name is unique in the page.

### The root

```ebnf
root ::= /* any element given to o_.start(…, root) */ ( pieceNode | groupFace | content )*
```

The engine builds the Tispi elements found below the root, and nothing outside it.

---

## 3. The `data-tsi` attribute

```ebnf
dataTsi        ::= codedZone? head trackItem* '&'?
head           ::= option* headItem* factoredTransitions?
trackItem      ::= track | macroInsertion | ';'
macroInsertion ::= '...' variable           /* the text of a macro, inserted here — see section 4 */
```

The head is read in this order, each zone optional: options, then variables and functions, then the transitions of the element. The first track ends the head. After the head come the tracks; a macro of tracks may be inserted among them, written `...$grid`. A final `&` may close the attribute.

- A bare `$grid` is not an insertion. Before the first track it is a reading of the variable (section 4); after a track it is read as the value of a key, and refused with a message that says to write `...$grid`.

### The coded zone

```ebnf
codedZone ::= series+
series    ::= '-'? integer ( ',' entry )* ';'    /* negative: an option of the editor */
entry     ::= ( integer | optionName ) ( '=' value )?
```

A page saved by the engine writes its options first, in a coded form: a series number, then its entries. A non-negative series number is an option of the engine; a negative one, an option of the editor. An author does not write this zone; the engine reads it back. Example: `0, $$drag;`.

---

## 4. The head

### Options

```ebnf
option ::= optionName ( '=' value )? ';'
```

- Without a value, the option is a flag, set to true: `$$autonomous;`.
- With a value: `$$openDefaultValue = 1;`.
- A flag set to `false` is not written back when the page is saved: write `0` or `1` when the value must be kept.

### Variables and functions

```ebnf
headItem      ::= declaration | assignment | reading | localFunction

declaration   ::= kind variable variableAttrs? '=' ( value | '_import' ) ';'
kind          ::= 'let' | 'const' | 'css' | 'letModule' | 'constModule' | 'cssModule'
variableAttrs ::= '<' attrEntry ( ';' attrEntry )* '>'
attrEntry     ::= optionName ( '=' value )?

assignment    ::= variable '=' value ';'
reading       ::= variable ';'

localFunction ::= 'function'? variable '(' parameterList? ')' '{' javascript '}' ';'?
parameterList ::= name ( ',' name )*        /* JavaScript identifiers, without sigil */
javascript    ::= /* ordinary JavaScript — see section 8 */
```

| Form | Example | What it does |
|---|---|---|
| `declaration` | `let $n <$$default = 0> = 5;` | declares `$n` with the value 5 and the default value 0 |
| `declaration`, `css` | `css $rx = [20, deg];` | declares `$rx`, whose value lives in the CSS property `--rx` of the element |
| `declaration`, macro | `` const $grid = `&pos 0,0; &size 100,50;`; `` | a text between backticks, inserted as written where `...$grid` is used |
| `declaration`, module | `constModule $label = 'Play';` | a parameter of a module, with its default value |
| `declaration`, `_import` | `let $x = _import;` | reads `$x` from the parent, through a module boundary |
| `assignment` | `$carte = this;` | gives a value to a variable declared higher in the tree |
| `reading` | `$init;` | reads the variable: what it holds is run |
| `localFunction` | `$faceZ(i){ … }` | a function of the element, called by `$element->$faceZ(2)` |

- The `;` closes an item. The engine tolerates its absence at the end of the attribute, or when what follows opens a new zone: `!`, an option, a track. Between two items of the same zone it is required: `let $a = 1 let $b = 2` is refused.
- The parameters of a local function are JavaScript identifiers. A `$name` written as a parameter is not a parameter: it is read as a Tispi variable.
- A variable is found by going up the tree, from the element that uses it. A `$_name` variable is looked for first among the Pieces that share the plate of the element.
- Reading or assigning a variable that is declared nowhere is an error.
- The form `$x := value;` is still read by the engine. It is the former writing of a declaration; do not write it.

### Factored transitions

```ebnf
factoredTransitions ::= ( '!' effect )? ( '!' interpolation )?   /* written once for a scope: the element or a track; the exit of a Face: exitSection, section 5 */
```

The same writing serves the head of the element and the head of a track (section 5). The effect comes first, then the interpolation; each is optional, but each starts with `!`: without it, a chevron in the head is refused. Written in the head of the element, they apply to the tracks of the element that do not give their own. Their meaning is given in section 6; `effect` and `interpolation` are defined there.

---

## 5. Tracks and keys

```ebnf
track      ::= timeTrack | trackName trackHead keys exitSection?
trackHead  ::= trackAttrs* factoredTransitions?
trackAttrs ::= '!' '<' attrEntry ( ';' attrEntry )* '>'

keys       ::= ( key | keyInsertion | ';' )*
key        ::= keyAttrs* effect? ( frame ':' )? value? interpolation? ';'?
keyAttrs   ::= '<' attrEntry ( ';' attrEntry )* '>'
frame      ::= number | variable | '{' javascript '}'
keyInsertion ::= '...' variable             /* a macro of keys: its text starts with ':' */

exitSection ::= '!' hideEffect keys         /* on the track of a Face only */
```

**The track.** `trackName` is one of the engine's track names, or any CSS property written in camelCase (section 9). The track ends at the next `&…`, at `!` followed by a hide effect, or at the end of the attribute.

| Rule | Example | Verified |
|---|---|---|
| A key is a frame, a value, and the transitions around them. | `&opacity 0:1; 36:0;` | two keys, frames 0 and 36 |
| A key without a frame is at frame 0. | `&size [100,50];` | one key at frame 0 |
| Frames are numbers, not negative, strictly increasing along the track. Integers in practice; a decimal is read. | `&opacity 10:1; 5:0;` | refused: frame 5 ≤ frame 10 |
| A frame may be a variable or a script, known when the page is built. | `const $d = 30; &opacity $d:1; {$d+10}:0;` | frames 30 and 40 |
| A frame alone, `frame:;`, as the last key, is the duration bound of the track: the track lasts until that frame, included. | `&opacity 0:1; 60:;` | key 60 without value; 61 frames |
| A frame alone in the middle is a key without value. | `&bgColor 0:gray; 5:; 9:gray;` | key 5 without value |
| `;` closes a key. The last key may omit it before `&…` or the end, never before `!`. | `&opacity 0:1 &size 10,10;` | two tracks |
| Before a hide effect the `;` is required. | `45:1 !<45:easeInOut> 0:0` | refused |
| A `;` alone is ignored. | `&opacity 0:1; ; 36:0;` | two keys |
| A declaration has no place in a track. | `&opacity let $x = 1;` | refused: a declaration goes in the head |
| A macro of keys is inserted by `...$name`; its text starts with `:`. | `` const $k = `:0:1; 36:0;`; &opacity ...$k `` | two keys |
| The head of a track may carry attributes, `!<$$a; $$b>`, before its transitions. | `&opacity !<$$xl; $$indexed> 0:1;` | two attributes |
| One `transform` track per Piece: `&rotX`, `&rotY`… exclude each other; a combined track exists. | `&rotX 0:10; &rotY 0:10;` | refused: use `&rotXY` |

**Generic CSS tracks.** A CSS property that the engine does not model is written as a track all the same: name in camelCase, value in CSS format, read as text up to the `;`.

| Rule | Example | Verified |
|---|---|---|
| Name in camelCase, value as in CSS. | `&borderRadius 6px; &textAlign center;` | values `6px`, `center` |
| A computed value goes through a `css` variable. | `css $lenPx = {$r + 'px'}; &left 0:$lenPx;` | value `var(--lenPx)` |
| A script is not read as the value of a generic track. | `&left 0:{$r*2};` | not read; the element stays empty, and the console gets a stack-overflow error that does not name the cause |

**The time track.**

```ebnf
timeTrack  ::= ( '&synchro' | '&clock' ) ( '!' '<' timeConfig '>' )? keys
timeConfig ::= timeItem ( ',' timeItem )*
timeItem   ::= integer ':'                  /* the duration, in frames — the ':' is required */
             | 'once' | 'repeat'            /* a slave beyond the master's duration: stays (default) or starts again */
             | 'clockMaster(' name ')'       /* the Piece whose time this plate follows */
             | 'face'                         /* the plate follows the media element of its Face */
```

| Rule | Example | Verified |
|---|---|---|
| `&synchro` is the name; `&clock` is its former name, still read. | `&clock 0:stop;` | the track is `synchro` |
| A key of the time track is a stop. The word is `stop`; the engine writes it back as `1`, which it reads the same way. | `&synchro 0:stop; 20:stop;` | two stops |
| The duration is written `41:` in the configuration. | `&synchro !<41:> 0:stop;` | duration 41 |
| Without the `:` the duration is refused. | `&synchro !<41> 0:stop;` | refused |
| Words and calls follow, in any order; the engine writes the duration first. | `&synchro !<repeat, 41:> 0:stop;` | written back `!<41:, repeat>` |
| Without a declared duration, the duration is that of the content: its last frame, plus one. | `&synchro !<clockMaster(world)> 0:stop;` | last frame 0: duration 1 |
| A key placed at the declared duration extends the plate: the plate takes the longer of the declared duration and its content. | `&synchro !<240:>;  &opacity 0:1; 240:0;` | duration 241 |
| A time track may carry only its configuration, without any key. | `&synchro !<clockMaster(world)>;` | no key |
| `face`: the plate follows the media element written in its Face, `<video>` or `<input type="range">`, declared by `&videoSynchro` or `&sliderSynchro`. Without such an element the page does not finish loading today. | `&synchro !<face> 0:;` on a Piece whose Face holds a slider | written back `!<1:, face>` |
| No variable in the time track. | `&synchro 0:$x;` | refused |

The time tracks of Pieces that share a plate are one time: the plate takes the longest declared duration. One `&synchro` per plate is enough.

**The duration of a plate.** A duration counts frames from frame 0. Without a declaration, a plate lasts until the last frame of the longest track of its Pieces, included: a last key at frame 240 gives 241 frames, from 0 to 240. A declared duration `!<240:>` gives 240 frames, from 0 to 239. When both exist, the plate takes the longer one.

**Tracks of structure.** They are written like the others; their values are names.

| Track | Values | Example |
|---|---|---|
| `&face` | the `id` of a Face of the Piece | `&face 0:closed; 1:opened;` |
| `&mark` | free names; a mark may carry an action, `OPENED :: {…}`: read and found by a goto, but not fired today (section 7) | `&mark 0:CLOSED; 1:OPENED;` |
| `&button` | `OUT`, `OVER`, `PUSHED`, `RELEASED`; a state may carry its action, `RELEASED :: {…}` (section 7) | `&button 0:OUT; 1:OVER; 2:PUSHED; 3:RELEASED :: { … };` |
| `&onClick`, `&onTime` | a script block | `&onClick 0:{ $card->$gotoStop("OPENED") };` |

**The exit section of a Face.** On a track of a Face, `!` followed by a hide effect ends the entry keys; the keys that follow play when the Face becomes inactive, and their frames start again from 0. The hide effect plays from whichever key is current at that moment, from the value then displayed.

| Rule | Example | Verified |
|---|---|---|
| Entry keys, hide effect, exit keys. | `&opacity 0:0 <easeInOut>; 45:1; !<45:easeInOut> 0:0` | hide effect 45 frames, one exit key |
| An exit section alone. | `&opacity; !<30:linear> 0:1; 20:0;` | no entry key, two exit keys |
| On a Piece there is no exit section: the frames must keep increasing. | `&opacity 0:1; 45:1; !<45:easeInOut> 0:0` | refused: frame 0 ≤ frame 45 |

---

## 6. Transitions

A transition is written between `<` and `>`. Its nature comes from its place and from its first item: with a duration it is an **effect**, without it is an **interpolation**.

```ebnf
effect        ::= '<' duration ':' ','? items? '>'    /* a leading duration makes an effect */
interpolation ::= '<' ( nonTime ( ',' segment )* )? '>'   /* no leading duration */
hideEffect    ::= effect                                /* same writing; after the keys of a Face track */
items         ::= segment ( ',' segment )*
segment       ::= delay ':' nonTime? | nonTime          /* a time ends with ':' and separates by itself; elsewhere the comma is required */
nonTime       ::= easing | process | when
delay         ::= duration

duration      ::= integer                               /* frames */
easing        ::= 'linear' | 'ease' | 'easeIn' | 'easeOut' | 'easeInOut' | 'stepStart' | 'fixed'
                | 'cubicBezier(' number ',' number ',' number ',' number ')'
process       ::= name                                  /* a named process; 'fade' today */
when          ::= '0' | '1' | '2'                       /* 0: except at appearance (default), 1: at appearance only, 2: always */
```

Inside the chevron, a time ends with `:` and separates by itself; the other items are separated by commas, in any order. The first time is the duration; a later time is the delay. A bare number is the `when`. Without an easing, an effect is linear: `<8:>` and `<10:fade>` are read. An interpolation may carry a process, `<easeIn,fade>`: it is read, and not played today.

**Where a transition is written.**

| Place | Writing | Verified |
|---|---|---|
| An effect, before the key it leads to. | `&opacity 0:1; <30:easeInOut> 36:0;` | key 36, effect of 30 frames |
| An interpolation, after the value of the key it starts from. | `&opacity 0:1 <easeIn>; 36:0;` | key 0, interpolation `easeIn` (CSS `ease-in`) |
| An empty chevron after a value: no interpolation. The same in the head of a track, `!<>`. | `&opacity 0:1 <>; 36:0;` | key 0, none |
| In the head of a track: the effect, then the interpolation, each with `!`. | `&opacity !<10:ease> !<easeOut> 0:1;` | both on the track |
| In the head of the element, the same, before the tracks. | `!<12:easeInOut> !<easeIn> &opacity 0:1;` | both on the element |
| A hide effect, after the keys of a Face track. | `… 45:1; !<45:easeInOut> 0:0` | hide effect of 45 frames |

**Factored transitions.** A transition written with `!` in a head is written once for a scope: the element, a track, or the exit of a Face. It applies to every key of that scope that does not define a transition of the same type inline. The engine looks for each type, effect and interpolation, separately: first on the key, then on the track, then on the element, then in the application. The exit effect plays from whichever key is current when the Face becomes inactive.

| Rule | Example | Verified |
|---|---|---|
| A head transition starts with `!`. | `<12:easeInOut> &opacity 0:1;` | refused |
| The same chevron after the head of a track belongs to the first key. | `&opacity <10:ease> 0:1;` | effect of key 0 |
| A comma instead of the colon of the duration, in a head, is not refused today: the chevron is read as an interpolation, and the effect is lost. | `&face !<60,fade> 0:day;` | interpolation, no duration |

A limit today: when an interpolation and an effect apply to the same interval, only the interpolation is played. A factored interpolation in the head of a track, such as `!<easeOut>`, therefore hides the effects of the keys of that track.

**What is refused.** An effect written after a value, an interpolation written before a key, two effects in the head of a track, two items without a comma between them (`<10:ease 2>`). The message names the place: "a duration is expected" or "no duration — the duration belongs to the effect".

**Easings.** Each Tispi name gives a CSS easing: `linear`, `ease`, `easeIn` (CSS `ease-in`), `easeOut` (`ease-out`), `easeInOut` (`ease-in-out`), `stepStart` (`step-start`); `fixed` holds the value until the next key (`step-end`); `cubicBezier(0.1,0.2,0.3,0.4)` gives `cubic-bezier(…)`. The engine also reads short forms (`_io_` for `easeInOut`, `_c_(…)`…), and writes them back when it saves a page; documentation uses the full names (section 9).

**A full effect.** `<10:ease,fade,5:2>`: duration 10, easing ease, process fade, delay 5, when 2. `<10:ease,fade>`: the same with delay 0 and when 0.


## 7. Values

A value is written the same way everywhere: after `=` in the head, after `frame:` in a key, in an option, in a parameter. Its form says its nature; there is nothing to declare.

```ebnf
value      ::= cell ( ',' cell )*               /* a comma at the top level makes a tuple: 10,20 */
cell       ::= simple | collection | script | reader | named
collection ::= '[' ( cell ( ',' cell )* )? ']'
script     ::= '{' javascript '}'
reader     ::= variable                          /* $name: the value of the variable, read where it is used */
named      ::= name '::' cell                    /* a name given to a cell: RELEASED :: {…} */

simple     ::= number | measure | text | word | 'true' | 'false' | 'null' | 'this' | pcOffset | macroText
measure    ::= number ( name | '%' )             /* 10px, 20deg, 50% — read as a text */
text       ::= "'" characters "'" | '"' characters '"'
word       ::= name+                             /* a bare word, or several: gray, OUT, rect0 bold */
pcOffset   ::= ( number | variable | '+' ) '%' number
macroText  ::= '`' characters '`'                /* a macro: its text starts with & (tracks), : (keys) or { (an action) */
characters ::= /* any characters; inside '…', '' stands for one apostrophe */
```

| Form | Example | Read as |
|---|---|---|
| number | `-54`, `1.5` | a number; no exponent notation, `1e1` is refused |
| measure | `10px`, `20deg`, `50%` | the text `10px`; written back quoted |
| text | `'gray'`, `"rgb(0, 0, 0)"`, `'l''eau'` | the text; `''` doubles an apostrophe |
| word | `gray`, `OUT`, `rect0 bold` | the text of the words |
| `true`, `false`, `null`, `this` | `let $c = this;` | the boolean, nothing, or the current element |
| tuple | `0,0`, `$w,20`, `12, 200` | an array of cells |
| collection | `[100,50]`, `[[1,2],[3,4]]`, `[]` | an array of cells; the same value as the tuple |
| script | `{$r*2}`, `{$r + 'px'}` | the value the JavaScript returns; alone in a cell or as the whole value |
| reader | `$w` | the value of the variable |
| pcOffset | `50%10`, `$w%10`, `+%10` | a cell `[percent, offset]`; `+` is the neutral percent |
| named | `3:RELEASED :: {…};` | a cell carrying a name; see *The named value* below |
| macro | `` `&pos 0,0;` ``, `` `:0:1; 36:0;` ``, `` `{ 1 }` `` | a text inserted as written, or an action |

**Rules.**

- A formula is written between braces. Outside them, an operator or a call is refused: `$w+10`, `rgb(0,0,0)` and `max(1,2)` give "a formula is written between braces". The exception is a generic CSS track, which reads its value as text: `&borderRadius calc(1px + 2px);`.
- On a track that the engine models (`&pos`, `&size`, `&opacity`, `&bgColor`…), a text that is not a word must be quoted: `&bgColor 0:'rgba(255,0,0,0.5)';`.
- A script in the head is computed when the page is built; a script in a key is computed when the key is played.
- `${…}` inside a quoted text is kept as written when the page is built.
- A `$name` alone as the value of a key is a reader, never a macro: a macro of keys is inserted by `...$name` (section 5).

**The named value.** `name :: cell` gives a cell a name. The name is what the engine looks for; the content is what it gets once it has found the name. Its use is the track of states of a button:

```
&button 0:OUT; 1:OVER; 2:PUSHED; 3:RELEASED :: { $parent->fx->play->$playTr($this, 100, 4) };
```

The mouse machine moves the Piece to frame 3 when the button is released; the key's value is the state, `RELEASED`, which the machine finds by its name; the block behind `::` is its action, which fires at that moment and not before. Two forms, by what follows the sign:

| Writing | What it does |
|---|---|
| `name :: { … }` | a block: it acts when the key is played, and returns nothing |
| `name :: expression` | an expression: it returns its value when it is read |

- The name is a bare word, never quoted; `::` is doubled because the single `:` belongs to the frame.
- Nothing is computed when the page is built: the content stays as written until the key is played.
- On the `&mark` track the named form is read, and a goto finds the mark by its name; but the engine fires the content only on the `&button` track. On `&mark`, neither a goto to the mark nor the time crossing it fires it today. The intended use, an instant branching decided at a mark, is noted for the engine.

**What the engine writes back.** A collection at the top level of a value is written back as a tuple: `&pos 0:[10,20];` becomes `&pos 10, 20;`, the same value. An empty collection is written back as nothing; this is noted for the engine.

## 8. Scripts, paths and the relation `->`

A script block, `{ … }`, is ordinary JavaScript. Tispi reads nothing in it except its own signs, which it converts before the browser runs the code; everything else is copied as written. The signs are `$`, which is reserved to Tispi, and `->`, which does not exist in JavaScript.

**A JavaScript identifier beginning with `$` is not allowed in a block.** Every `$name` that does not follow a point is taken by Tispi as one of its variables or functions; a JavaScript variable named `$x` would be rewritten, and a `$x` that no declaration above provides is reported when the page starts. The only `$` that stays JavaScript is the one after a point, `o.$v`.

```ebnf
script     ::= '{' javascript '}'
javascript ::= ( jsText | variable | call | path | cssValue )*
jsText     ::= /* JavaScript, copied as written */

call       ::= variable '(' arguments? ')'           /* a Tispi function: of the system, or declared on the branch */
arguments  ::= javascript ( ',' javascript )*       /* JavaScript expressions; Tispi reads its signs in them too */
path       ::= head step*
head       ::= '$this' | '$parent' | '$up(' name ')' | variable      /* a variable holding an element */
step       ::= '->' name ( '[' name ']' )?            /* a child Piece: in the current Face, or in the Face named */
             | '->' wildcard                        /* the Pieces whose id matches, as an array; last step only */
             | '->' variable                          /* a variable of the target */
             | '->' variable '(' arguments? ')'       /* a function, called on the target */
wildcard   ::= name? '$_$' name?                    /* it_$_$_ */
cssValue   ::= '$thisCss.' name | '$cssOf(' path ').' name
```

**Variables.** `$n` becomes an accessor: reading, writing and the compound operators are the ones of JavaScript, decided by the position. The variable is found by going up the tree from the element that runs the block.

| Writing | Does | Verified |
|---|---|---|
| `{ $n }` | reads | 1 |
| `{ $n = 5 }` | writes | the next read gives 5 |
| `{ $n += 1 }` | compound operators, for free | 6 |

**Functions.** `$f(1, 2)` calls a Tispi function: one of the system (`$play`, `$stop`, `$gotoStop`…, section 9) or one declared with `$f(a, b){ … }` in the head of an element above. An unknown function is refused when the page is built.

**Paths.** A path starts from an element and goes down the tree, one Piece per step.

| Head | Meaning | Verified |
|---|---|---|
| `$this` | the element that runs the block | `#leaf` |
| `$parent` | its parent Piece | `#menu` |
| `$up(menu)` | the nearest ancestor with that id | `#menu` |
| `$menu` | a variable that holds an element, `let $menu = this;` | `$menu->fx` gives `#fx` |

| Step | Meaning | Verified |
|---|---|---|
| `->fx` | the child Piece `fx`, looked for in the **current Face** | `#fx`; after a goto that changes the Face, a child of the former Face is not found |
| `->inner[dos]` | the child Piece `inner`, looked for in the Face `dos`, whatever the current Face | `#inner` before and after the goto |
| `->fx->play` | the chain | `#play` |
| `->$v`, `->$v = 8` | a variable of the target, read or written | 7, then 8 |
| `->$gotoStop(1)` | a function called on the target | the Face of `play` changes |
| `->it_$_$_` | the wildcard, only as the last step: the Pieces whose id matches, as an array | two elements |

- After `->`, everything is Tispi: a child, a variable, a function, a Face in brackets. After `.`, everything is JavaScript, sigil included: `$this.div.id` reads the DOM element; `o.$v` is a property of a JavaScript object.
- `->toto( )` is refused: a method is called with `.`, `->` leads to a child. `->` never starts from a JavaScript object.
- `$up` alone is refused: its argument is required.
- A function called on a target, `->$g()`, must be visible from the branch of the element that runs the block: a function declared elsewhere is unknown.

**CSS variables.** `$thisCss.rx` reads or writes the `css` variable `$rx` of the current element, with its unit; `$cssOf($up(menu)).rx` does the same on another element.

**The border with JavaScript.**

| Rule | Example | Verified |
|---|---|---|
| A string is opaque. | `{ '$n' }` | the text `$n` |
| A comment is opaque. | `{ /* $n */ 2 }` | 2 |
| A template string is opaque: `${$n}` is not read. | `` { `a${$n}b` } `` | JavaScript error when run |
| `$` is reserved: a JavaScript identifier cannot carry it, not even as an object key. A key that must keep its `$` is written quoted, `'$v'`: a string is opaque, and `o.$v` reads it, after a point. | `{ const o = { $v: 9 }; }` · `{ const o = { '$v': 9 }; return o.$v; }` | refused · 9 |
| One instruction returns its value; several need a `return`. | `{ let a = 1; a + $n }` | undefined, with `return`: 7 |
| The comma is the one of JavaScript, not a tuple. | `{ 1, 2 }` | 2 |


## 9. Reserved words

The words and signs the engine recognizes, by family, each with the section that uses it. Names not listed here are free: an `id`, a variable, a function, a mark.

### Signs

| Sign | Nature | Section |
|---|---|---|
| `$name` | a variable, a function if followed by `(` | 4, 7, 8 |
| `$$name` | an option of a node, or an attribute of a variable, a track or a key | 4, 5 |
| `&name` | a track; `&` alone closes the attribute | 3, 5 |
| `!<…>` | the head: factored transitions of an element or a track, attributes of a track, configuration of a time track; the hide effect after the keys | 4, 5, 6 |
| `<…>` | a transition before a key or after a value; `<$$…>` the attributes of a key | 5, 6 |
| `frame:` | the frame of a key | 5 |
| `{ … }` | a script | 7, 8 |
| `[ … ]` | a collection | 7 |
| `,` | a tuple, at the top level of a value | 7 |
| `::` | a named value | 7 |
| `` `…` `` | a macro; `...$name` inserts it | 4, 5 |
| `'…'`, `"…"` | a text | 7 |
| `%` | a percent with its offset, `50%10` | 7 |
| `->` | the Tispi relation in a script | 8 |
| `;` | closes an item of the head, a key, an entry | 4, 5 |
| `//` | a line comment | 0 |
| `@name` | read as `$$name`: the writing of the AI exchange format | 1 |
| `:=` | the former writing of a declaration, still read; do not write it | 4 |

### Elements

`tsi-p`, `tsi-g`, `tsi-f`, `tsi-pg`, `tsi-pf`, `tsi-module`; the attributes `data-tsi`, `data-tsi-define`, `use`, `slot` (section 2).

### Words of the head

| Family | Words |
|---|---|
| declaration | `let`, `const`, `css`, `letModule`, `constModule`, `cssModule`, `function` |
| value | `true`, `false`, `null`, `this`, `_import` |
| options | `$$default`, `$$openDefaultValue`, `$$autonomous`, `$$keepJs`, `$$supprJs`, `$$copyNode`, `$$indexed`, `$$overToTop`, `$$dragToDrop`, `$$isDrop` |

The options `$$commentaire`, `$$filtreEditFace`, `$$filtreEditPos`, `$$compressed`, `$$rootCompressed`, `$$xl` and `$$mod` belong to the editor; the engine reads them and does nothing with them at start.

### Tracks

The engine prints its list of known tracks in the message of an unknown one.

| Role | Tracks |
|---|---|
| structural | `&face`, `&mark`, `&button`, `&onClick`, `&onTime`, `&synchro` (`&clock`: its former name, still read) |
| spatial | `&pos`, `&size`, `&posBar`, `&rotX`, `&rotY`, `&rotZ`, `&rotXY`, `&rotXZ`, `&rotYZ`, `&rotXYZ` |
| decorative | `&opacity`, `&bgColor`, `&color`, `&border`, and any CSS property written in camelCase (section 5) |
| media | `&videoSynchro`, `&sliderSynchro` |

The names `faceInner`, `cssAnchor`, `framing`, `barTop`, `rotat` and `text` are also known to the engine, for its own use or for older pages; they are not documented here.

### Words of the keys

| Where | Words |
|---|---|
| a time track | `stop` |
| the configuration of a time track | `once`, `repeat`, `face`, `clockMaster(name)`, a duration `41:` |
| `&button` | `OUT`, `OVER`, `PUSHED`, `RELEASED`; for a button that toggles, `ON`, `ON_OVER`, `ON_PUSHED` |
| a transition | the easings `linear`, `ease`, `easeIn`, `easeOut`, `easeInOut`, `stepStart`, `fixed`, `cubicBezier(a,b,c,d)`; the process `fade` |

The engine also reads, and writes back when it saves a page, the short forms of the easings: `_l_`, `_e_`, `_in_`, `_out_`, `_io_`, `_f_`, `_c_(…)`, and the lower-case `easein`, `easeout`, `easeinout`, `stepstart`. Documentation uses the full names.

### Scripts

| Family | Words |
|---|---|
| heads of path | `$this`, `$parent`, `$up(name)` |
| CSS variables | `$thisCss`, `$cssOf(path)` |
| wildcard | `$_$` inside a child name, `it_$_$_` |
| functions of the system | `$play`, `$stop`, `$restart`, `$gotoStop`, `$gotoPlay`, `$sendToFace`, `$setVar`, `$setVarIn`, `$playTr`, `$putPiecesInPlate`, `$importGroup`, `$on`, `$alert`, `$log` |

A `$_name` variable is read on the plate: the Pieces that share the plate of the element (section 4).

---

*Sections 5 to 9 are verified by the engine's benches, 2026-10-15: `nav_grammar` (tracks, keys, transitions, values) and `nav_script` (scripts and paths) in the browser, the node battery of values for the head.*
