# TiSpI — Time/Space Interleaved: the model in depth

This document presents the structural part of TiSpI. The model has been in use for 25 years in an editor, implemented first in Java applets, then in SWF/Flash, and now in HTML.

Deeply impressed by the logical simplicity of a processor, I sought to structure and simplify the mechanisms underlying user interface processing. At the core of this approach is a tree that strictly alternates time and space.

The data of a document follows this structure, while behavioral rules govern its evolution over time. This simple organization gives rise to capabilities that emerge without being explicitly programmed: the editor itself is built with its own tools.

<p align="center">
  <a href="https://www.wvanim.fr/p/tispi_agent_prompt.html">
  <img
    src="https://www.wvanim.fr/_demo/tsipi_pancake11.png"
    alt="Time / Space"
    width="1000"
  ><br>
    <sub>AI compatibility: agent training (click image)</sub>
  </a>
</p>

## 1. Law 1: the atomic unit, Piece / Face

TiSpI drives a tree of components in which time and space strictly alternate: time, space, time, space… It is presented here applied to user interfaces, its original domain.

The model takes its cue from real life. A real-world object changes throughout its life while keeping its identity: in TiSpI, the Piece plays the part of the object. At any given moment, this object presents an aspect: its Face. The Face is not an image attached to the Piece; it is the Piece itself, in its visible and audible form.

A Piece can change its Face while keeping its identity: the other components keep addressing the same Piece, even when its visible content changes.

Any interface component is thus decomposed along two fundamental axes: **the axis of time**, which carries its identity and its logic (the Piece), and **the axis of space**, which carries its instantaneous manifestations (the Faces).

<p align="center">
  <a href="https://www.wvanim.fr/_demo/demo_animated_html/tispi_2_pieces_faces/demo_structure_3D_1pc_tsi_module.html">
    <img
      src="https://www.wvanim.fr/_demo/tispi_piece.png"
      alt="Piece / Face diagram"
      width="40%"
    ><br>
    <sub>A Piece displays its Faces one after another (click image)</sub>
  </a>
</p>

## 2. The plate

A group is a Face. The TiSpI tree reads: Piece / Group / Pieces / Group / … / Piece / Face.

The Pieces that are direct children of a group form a plate. The plate is a notion used in the documentation; it is not a component of the engine.

The Pieces of a plate are synchronized. This animation illustrates it with the drive shaft shared by the two gears.

<p align="center">
  <a href="https://www.wvanim.fr/_demo/demo_animated_html/tispi_2_pieces_faces/demo_structure_3D_2pc_tsi_module.html">
    <img
      src="https://www.wvanim.fr/_demo/plate_motor.jpg"
      alt="A plate of two synchronized Pieces"
      width="75%"
    ><br>
    <sub>A plate of two synchronized Pieces (click image)</sub>
  </a>
</p>

This animation is itself written in TiSpI DOM: [see the script](https://www.wvanim.fr/_demo/demo_animated_html/tispi_2_pieces_faces/demo_structure_3D_2pc_tsi_module_code.html).

**Synchronization** drives all the Pieces of a plate, but each plate is independent of the others.

<p align="center">
    <img
      src="https://www.wvanim.fr/_demo/tispy_synchro002.png"
      alt="Synchronization of a plate"
      width="30%"
    ><br>
    <sub>The Pieces of a plate driven by the Piece that carries the clock</sub>
</p>

## 3. The tree

### An elementary notion of user interfaces, made visible by the editor

The combination of time and space is an elementary notion of user interfaces. Users are not aware of this alternation: it imposes itself naturally through the layout of the editor.

<p align="center"><img
  src="https://www.wvanim.fr/_demo/time_space.png"
  alt="Time / Space"
  width="50%"
></p>

### How the temporal component, the Piece, activates branches

TiSpI combines time and space by **alternating** them: the particularity of the model is the strict alternation of Pieces and Faces.

Together they form orthogonal tables, time | space. The diagram below shows it clearly: time runs from left to right, space from top to bottom.

<p align="center">
  <a href="https://www.wvanim.fr/projets_perso/tispi/demo_scripts/schema_piece_face_github.html">
    <img
      src="https://www.wvanim.fr/_demo/tispi003a.png"
      alt="Piece / Face diagram"
      width="85%"
    ><br>
    <sub>The Time/Space Interleaved tree (click image)</sub>
  </a>
</p>

## 4. The three roles of the time bar

### A states bar: listening to a discrete value

The early versions of e-anim offered a dynamic editor, with pages, buttons, roll-overs, paginated frames… These controls were driven by state tables. Mechanically, they are tools that react to events over a defined number of states: they listen to a discrete value.

<p align="center">
    <img
      src="https://www.wvanim.fr/_demo/button_user.png"
      alt="A button, as the user sees it"
      width="60%"
    >
    <img
      src="https://www.wvanim.fr/_demo/button_motor.png"
      alt="A button, as the engine builds it"
      width="60%"
    ><br>
    <sub>A button: as the user sees it, and as the engine builds it</sub>
</p>

### A time bar: animation

This is the traditional use of a time bar: a table made of keys, and of the intervals before, after and between the keys. TiSpI tracks describe keys in the classical way, and also describe the transitions and the arrival effects on those keys.

<p align="center">
  <a href="https://www.wvanim.fr/_demo/present/wvanim-2004-en.html">
    <img
      src="https://www.wvanim.fr/_demo/present/timebar_wvanim.png"
      alt="The WvAnim time bar"
      width="40%"
    ><br>
    <sub>The WvAnim time bar (click image)</sub>
  </a>
</p>

### A slave of a master value: listening to a continuous value

The time bar is driven by an external value. This is a fundamental mechanism of TiSpI.

Here, the time bar of the animation follows the timeline of a video. The synchronization listens to a source:

- `&synchro !<face> 0:;` makes the plate of the Piece follow the media element of its Face;
- `&videoSynchro` gives the Piece the playback and position of the video.

```html
<!-- The Face of "player" carries the video. Every Piece of the plate follows it, and stops when it stops. -->
<tsi-p id="player" data-tsi="&synchro !<face> 0:;  &pos 40,40;">
  <tsi-f id="screen" data-tsi='&videoSynchro "avion.mp4", controls;  &size 640,360;'></tsi-f>
</tsi-p>
```

In the same way, a Piece can follow a parent Piece, or a slider placed in its Face.

<p align="center">
  <a href="https://www.wvanim.fr/video.html">
    <img
      src="https://www.wvanim.fr/_demo/video_synchro.png"
      alt="An animation synchronized on a video"
      width="40%"
    ><br>
    <sub>An animation synchronized on a video (click image)</sub>
  </a>
</p>

## 5. The tracks

### What is a property?

A user interface component is defined by the set of its properties, and the actions applied to them.

First, its structural evolution, which we call the succession of Faces: for example, a button that goes from its normal state to its hovered state, then to its pushed state. Then its geometry: traditionally position, scale, rotation… And finally its decoration: colour, border…

### One track per property

The time bar is divided into tracks. Each track takes charge of one property.

<p align="center">
  <a href="https://www.wvanim.fr/_demo/tispi002.png">
    <img
      src="https://www.wvanim.fr/_demo/tispi002.png"
      alt="One track per property"
      width="60%"
    ><br>
    <sub>One track per property; each describes its keys and its intervals</sub>
  </a>
</p>

### The three roles of properties

Properties are classified by the reach of their influence:

- **structural role**: it modifies the active structure. For example, a change of state deactivates one branch to activate another. Such a property modifies the shape of the tree itself.
- **spatial role**: it arranges the Pieces in the display space, or in the sound space. Such a property acts at the level of the plate.
- **decorative role**: it defines the look of the rendering. Such a property acts on the Faces.

These roles follow three stages of work: organizing contents and their evolution in time; composing the screens and the room each element takes; finishing their visual appearance. A change can thus be located at the right level, by identifying the tracks and the dependencies to examine.

These roles will also be useful for AI processing: some prompts will concern a single role.

#### Structural: the `&face` track and the action tracks

The structure is driven by the Face tracks and the action tracks.

```html
<!-- The &face track: for each key, <arrival effect> frame:faceName; -->
<tsi-p id="myPiece" data-tsi="
  &synchro 0:stop;
  &face <60:ease,fade> 0:faceOut;  <20:easeIn,fade> 1:faceOver;  2:facePushed;
">
  <tsi-f id="faceOut">    <!-- the branch of the "out" state -->    </tsi-f>
  <tsi-f id="faceOver">   <!-- the branch of the "over" state -->   </tsi-f>
  <tsi-f id="facePushed"> <!-- the branch of the "pushed" state --> </tsi-f>
</tsi-p>
```

<p align="center">
  <a href="https://www.wvanim.fr/projets_perso/tispi/demo_scripts/schema_piece_face_github.html">
    <img
      src="https://www.wvanim.fr/_demo/arbre_chat001c.png"
      alt="Activation of branches"
      width="80%"
    ><br>
    <sub>See section 3: how the Piece activates branches</sub>
  </a>
</p>

#### Spatial

The Piece changes its place, its size or its orientation: `&pos`, `&size`, `&rotX`… Spatial tracks act in the interplay of the Pieces on the plate: the visual relation of a Piece with the others.

#### Decorative

The Piece changes its appearance, without moving: opacity, colour, background. Decorative properties are internal to the Face. They are written in CSS; a decorative property that changes over time is written as a track: `&opacity`, `&color`, `&bgColor`.

## 6. The modularity of the tree

The tree is structurally modular. Each branch can be isolated or copied, then placed elsewhere in the tree.

Functions can cross the boundaries of the hierarchy. They then bind two nodes together, and break the modularity. The WvAnim editor provides tools to build boundary nodes that protect a sandbox: they make modular branches safe.

### A branch can carry parameter variables and output nodes

This produces configurable modules.

For example, the Mahjong module lets you compose new boards and add your own tiles. Its author exported the group, then placed it in an online library.

<p align="center">
  <a href="https://serveur1.archive-host.com/membres/up/1773583014/index/jeu_mahjong/choix_layouts/layouts_deux_colonnes.html">
    <img
      src="https://www.wvanim.fr/_demo/mahjong001.png"
      alt="A configurable Mahjong game"
      width="65%"
    ><br>
    <sub>A few boards composed with the Mahjong module (click image)</sub>
  </a>
</p>

### The systemic coherence of the model

**This emerges naturally from the TiSpI structure: everything is made of the same material, branches of the TiSpI tree.**

## 7. The editing tools

### The Piece as a comment

The editor offers a flag to keep Pieces as comments in the editor. These Pieces are not part of the page it produces. Originally, they were used to leave messages useful during construction.

### From comment to control

The actions of a Piece in comment no longer have any purpose in the page, so they are free. We use them to place actions that act on the editor itself. Pieces in comment thus become controls that carry macros.

### From control to toolbar

A sub-group in comment can become a frame of controls. The editor shows this sub-group in a bar separate from the editing area, isolated from the animation.

<p align="center">
  <a href="https://serveur1.archive-host.com/membres/up/1773583014/index/jeu_mahjong/choix_layouts/layouts_deux_colonnes.html">
    <img
      src="https://www.wvanim.fr/_demo/module_toolbar4.png"
      alt="The user toolbar"
      width="49%"
    >
  </a>
  <a href="https://serveur1.archive-host.com/membres/up/1773583014/index/jeu_mahjong/choix_layouts/layouts_deux_colonnes.html">
    <img
      src="https://www.wvanim.fr/_demo/module_toolbar5.png"
      alt="The sub-group that models the toolbar"
      width="49%"
    >
  </a><br>
  <sub>Left: the user toolbar. Right: the sub-group that models it.</sub>
</p>
