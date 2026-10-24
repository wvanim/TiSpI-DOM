<p align="center">
  <a href="https://www.wvanim.fr/p/tispi_agent_prompt.html" >
  <img
    src="https://www.wvanim.fr/_demo/tsipi_pancake11.png"
    alt="Temps / Espace"
    width="1000"
  ><br>
    <sub>See IA compatibility -> Agentic training (clic image)</sub>
  </a>
</p>

# What is TiSpI - Time/Space Interleaved?

TiSpI is an **interactive UI and animation standard** that organizes interface data as a **Time/Space Interleaved tree**.  

Originally created in the **e-anim** editor (later **WvAnim**) in 1999, it has been used continuously for more than 25 years. Its core structure has remained unchanged.

TiSpI provides:
- WAAPI animations, declared in HTML
<p align="center">
  <a href="https://www.wvanim.fr/_demo/_script/git001_move.html" >
  <img
    src="https://www.wvanim.fr/_demo/_script/tispi_script001a.png"
    alt="Script Tispi 001"
    width="780"
  ><br>
    <sub>See animation (clic image)</sub>
  </a>
</p>

- the **Time/Space Interleaved structural standard** itself
<p align="center">
  <a href="https://www.wvanim.fr/projets_perso/tispi/demo_scripts/schema_piece_face_github.html">
    <img
      src="https://www.wvanim.fr/_demo/arbre_chat001c.png"
      alt="Activation of branches"
      width="60%"
    ><br>
    <sub>See section 3: how the Piece activates branches</sub>
  </a>
</p>

- a structure **particularly well suited to visual editors**, such as e-anim / WvAnim — [video](https://www.wvanim.fr/p/present_wvanim_philippe_destrumel.mp4)
- a **structural data model** — [documentation](Document/doc_structurel.md)

---

# What TiSpI Provides

TiSpI makes the *state node* a first-class element of the document.

As its name suggests, the Time/Space Interleaved model alternates temporal and spatial nodes. In HTML, `<tsi-p>` represents the temporal node: it defines a component's alternative Faces and selects its current Face. Its children are Face elements: `<tsi-g>` for a Group and `<tsi-f>` for rendered DOM content or a component.
<p align="center">
  <a href="https://www.wvanim.fr/_demo/demo_animated_html/tispi_2_pieces_faces/demo_structure_3D_2pc_tsi_module.html">
    <img
      src="https://www.wvanim.fr/_demo/plate_motor.jpg"
      alt="A plate of two synchronized Pieces"
      width="60%"
    ><br>
    <sub>Piece / Face-Group / Face-Leaf movement (click the image)</sub>
  </a><br>
  <a href="https://www.wvanim.fr/_demo/demo_animated_html/tispi_2_pieces_faces/demo_structure_3D_2pc_tsi_module_code.html">
    <sub>Annotated script</sub>
  </a>
</p>


Tracks that animate a CSS property provide a declarative representation of a WAAPI animation directly in HTML: their keys correspond to keyframes, and the browser executes the animation.

Each key of a track can also carry a transition effect, specified as a named process. For example, `fade` can be used for Faces and decoration:
- <60:easeOut,fade> : avec durée (60:), effet de transition avant la key,
- <easeOut,fade> : sans durée, interpolation vers la key suivante.
# **Structural Foundations**

TiSpI is a **closed structural standard** based on a strict **Time / Space alternation tree**, where **all components and behaviors** are expressed through **deterministic, declarative, and verifiable relationships**, with **no heuristics and no implicit semantics**.

### Structure — The Time/Space Interleaved Tree

1. The tree strictly alternates Time (Piece) and Space (Face), to arbitrary depth.
2. An "entity" is a Piece/Face pair. The Piece is essential and contains one or more Faces.
3. A Piece selects only one current Face at any given time.
4. FaceGroup and FaceRender are specializations of Face — they do not add a level to the alternation.
5. A FaceGroup displays all its Pieces simultaneously. Its Pieces are synchronized.

### Time

1. All tracks of all Pieces within the same Group are synchronized.
2. The entire evolution of each channel is described in its track: a sequence of values and transformations.

### Example

```text
Piece                        // root
    Face                     // FaceGroup: contains Pieces
        Piece
            Face (image)
            Face (text: Hello)
        Piece
            Face (text: word)
    Face (oval)              // FaceRender
```

---

### Semantic Reduction

Any branch written as a module conforms to the Time/Space Interleaved structure and reduces to a single node, its instance:

- no loss of meaning: the instance carries only what the module exposes
- no hidden rules: parameters and slots are declared by the module
- purely structural
- deterministic
- reversible: expanding the instance gives back the branch, and reducing it again gives back the instance

Reduction is **not an optimization**: it is a **logical consequence** of the closed structure.

### user contrôls

In 2007, a capability emerged naturally from the TiSpI model, removing the boundary between document objects and editing controls.
They share the composition space or appear in separate panels.
Important : all are built from the same material—a branch alternating between Time and Space.
<p align="center">
  <a href="https://www.wvanim.fr/projets_perso/tispi/demo_scripts/schema_piece_face_github.html">
    <img
      src="https://www.wvanim.fr/_demo/wvanim_video.png"
      alt="Activation of branches"
      width="49%"
    >
  </a>
  <a href="https://www.wvanim.fr/_demo/demo_animated_html/video_synchro/testVideoSynchro2_code.html">
    <img
      src="https://www.wvanim.fr/_demo/wvanim_video_bar_command.png"
      alt="Activation of branches"
      width="49%"
    >
  </a><br>
    <sub>Left: the user toolbar.
      &emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;
      &emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;
      &emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;
      Right: toolbar factory.</sub>
</p>

# Property Decomposition

In TiSpI, every property is classified by the environment it modifies:

- **structural** — the tree: which Face is active (`&face`, a goto to a mark);
- **spatial** — the Plate: how the element occupies it (position, size, rotation);
- **decorative** — the Face: how it looks (color, opacity, borders).

The role is read from the property affected, not from the mechanism that affects it: a mark, a click or a script is structural only when it changes the active Face.

Structural and spatial behavior is written in `data-tsi`; decoration is written in CSS. For analysis, the structural role is the signal: it carries the tree, the Faces as branches, and the choices that change the active branch. Spatial and decorative properties are noise.

---

# Concise Functional Description

### Time = Piece — `<tsi-p>`

Tracks, events, functions, scripts.
Displays its **Faces sequentially**, one at a time.

### Space = Face

What is shown at a given time.

### Face-group — `<tsi-g>`

Displays its **Pieces simultaneously**, on one Plate: they advance, stop and restart together.

### Face-render — `<tsi-f>`

Any DOM content: text, image, SVG, video, a component.

---

# Example: a button

<p align="center"><img width="415" height="292" alt="im2" src="https://www.wvanim.fr/_demo/tispi_button001.png" /></p>

A button is one `<tsi-p>` with three Faces and three tracks:

<p align="center">
  <a href="https://www.wvanim.fr/_demo/_script/git001_button.html" >
  <img
    src="https://www.wvanim.fr/_demo/_script/tispi_script001_button.png"
    alt="Script Tispi 001"
    width="780"
  ><br>
    <sub>See animation (clic image)</sub>
  </a>
</p>


### 1. Structure
The Piece holds the alternative Faces; one is active at a time.

### 2. Behavior
`&button` is the mouse machine: it moves the Piece to frame 0, 1 or 2 as the pointer leaves, hovers or presses.
`&face` says which Face is active at each frame. Each transition is declarative and deterministic.

### 3. Decoration
What each Face looks like is CSS. A transition effect sits on a key when needed: `<8:> 1:over` for an eight-frame entrance.

Tracks are neutral; the property they affect gives them their role.

---

# Using the engine

The engine is in the [engine](engine) folder: `tispi.js`, readable and commented, and `tispi.min.js`, compact. One file, no dependency, no build step.

At the end of the `body`:

```html
<script src="https://cdn.jsdelivr.net/gh/wvanim/TiSpI-DOM@v0.1.1/engine/tispi.min.js"></script>
<script>
  o_.start(null, 100/6, null, null, document.getElementById("root"));
</script>
```

`o_.start` attaches the engine to the element given last: the root of the branch TiSpI takes charge of. The rest of the page is untouched. `100/6` is the duration of a frame, in milliseconds.

---

# License

Copyright © 1999-2026 Philippe Destrumel.

The documents, diagrams and images of this repository are licensed under [CC BY-NC-ND 4.0](https://creativecommons.org/licenses/by-nc-nd/4.0/): you may read, share and quote them, crediting the author, for non-commercial purposes, without publishing modified versions. See [LICENSE](LICENSE) and [CONTRIBUTING.md](CONTRIBUTING.md).
