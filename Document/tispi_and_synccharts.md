# TiSpI and SyncCharts: two roads to the same tree

A comparison of their structure, of their relation to time and of their control mechanisms, with [TiSpI](https://github.com/wvanim/TiSpI-DOM) examples.

The main difference lies in synchronization. In SyncCharts, the STGs of a composite state follow the logical instants shared by the whole syncChart. In TiSpI, each group of Pieces has its own time: the Pieces of a group are synchronized with one another, and each group remains independent of the others.

## Contents

1. [Origins and purpose of the comparison](#origins)
2. [A shared structure: strict alternation](#structure)
3. [Time: state selection and autonomous plates](#time)
4. [Events and changes of state](#events)
5. [The three uses of the time bar](#uses)
6. [Control: suspension, preemption and animated exit](#control)
7. [What each model brings](#contributions)
8. [References](#references)

---

<a id="origins"></a>

## 1. Origins and purpose of the comparison

SyncCharts, published by Charles André in 1996, is a visual formalism based on Esterel. [Original presentation](https://www-sop.inria.fr/members/Charles.Andre/CA%20Publis/SYNCCHARTS/overview.html)

TiSpI was born in 1999 in e-anim, later WvAnim, to unify the composition and the editing of animations.

Developed independently, they share the same composition tree, but differ in their execution rules and in their relation to time.

The HTML examples on this page are written for the TiSpI engine.

<a id="structure"></a>

## 2. A shared structure: strict alternation

### 2.1. Correspondence of nodes

In the containment tree of SyncCharts, a composite state contains state transition graphs, or **STGs**, which themselves contain states. Once the intermediate reactive cells are left out, the categories **state / STG strictly alternate on every path**. [Containment tree, §4.1](https://pop-art.inrialpes.fr/~girault/Slap03/Final/andre.pdf#page=10)

TiSpI places states in the dimension of time. The rule becomes: states follow one another in time. The natural relation between states and animation emerges from this.

The correspondence with TiSpI is direct:

| SyncCharts | TiSpI | Role in the composition |
|---|---|---|
| STG | **Piece** | Holds the alternatives among which the selection is made. |
| Composite state | **Group Face** | Gathers the branches that are active together. |
| Simple state | **Render Face** | Ends the structural decomposition. |

This correspondence concerns the place of the elements in the tree. The visual content of a render Face belongs to TiSpI.

In TiSpI, a Piece selects one Face, or none. A group Face gathers Pieces, each of which has its own Faces. The same composition repeats at any depth:

```text
Piece → group Face → Pieces → Faces…
```
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

### 2.2. Exclusive selection and the absence of a Face

The case **with no active Face** is explicit in TiSpI: a Piece has zero or one active Face. In the normal configuration of a syncChart, each active STG has exactly one active state. [Configuration rules, §4.2](https://pop-art.inrialpes.fr/~girault/Slap03/Final/andre.pdf#page=10)

### 2.3. Example: the three states of a button

```text
SyncCharts                         TiSpI
────────────────────────           ────────────────────────
Button (STG)                       Piece button
 ├─ Out    (simple state)            ├─ Face out    (render)
 ├─ Over   (simple state)            ├─ Face over   (render)
 └─ Pushed (simple state)            └─ Face pushed (render)
```

```html
<tsi-p id="button" data-tsi="&synchro 0:stop; 
                             &button 0:OUT; 1:OVER; 2:PUSHED;
                             &face   0:out; 1:over; 2:pushed;">
  <tsi-f id="out">…</tsi-f>
  <tsi-f id="over">…</tsi-f>
  <tsi-f id="pushed">…</tsi-f>
</tsi-p>
```

<a id="time"></a>

## 3. Time: state selection and autonomous plates

### 3.1. What selects the state

In SyncCharts, the active state changes through transitions, according to signals, conditions and the termination of activities. In TiSpI, the position in time determines the active Face, through the `&face` track. An event can thus change the Face by moving the Piece to another moment.

### 3.2. Moments reached without an imposed order

The time bar shows **moments**, which can be reached directly by a `goto` to a frame number or to a mark. Selecting them imposes no order: one can reach a moment, stay there, choose another, or come back to the previous one.

An ordered course appears when an interval has to be played. A TiSpI transition is an interval too, in another form: it has its own duration and is carried by a key, instead of occupying moments of the bar.

In SyncCharts, the passages between states are described by the arcs of the model. In TiSpI, a call can reach any moment of the bar directly.

### 3.3. Global time and the plate's own time

**The group is a unit of control in both models; in TiSpI, it is natively a unit of time.**

| Aspect | SyncCharts | TiSpI |
|---|---|---|
| Time reference | Logical instants are shared by the whole syncChart, at every level. | Each plate has its own time: duration, position and stops. |
| Branches of a group | The STGs of a composite state take part in the reactions of the syncChart. | The Pieces gathered on a plate share the time of that plate. |
| Local control | Suspending a composite state freezes its internal evolution. | Stopping a plate halts its progress in time. |
| Local time | It is built, by making activity depend on a chosen signal. | It is given: temporal autonomy belongs to the plate itself. |
| Shared time | It is given: the logical instants of the syncChart. | It is declared, by naming a master: `&synchro !<clockMaster(world)>`. |

Both models can therefore do both: they differ in what is given and in what is declared.

Local suspension in SyncCharts takes place within its shared logical instants. On its own, it does not give the composite state a duration and a position of its own. [Instants and suspension, §2.3](https://pop-art.inrialpes.fr/~girault/Slap03/Final/andre.pdf#page=5)

<a id="events"></a>

## 4. Events and changes of state

### 4.1. Describing a passage from one state to another

A SyncCharts transition links a source state to a target state. It can carry a trigger, a guard and an effect. In TiSpI, an action track brings these roles together:

| Role | TiSpI writing |
|---|---|
| Starting context | The moment at which the action is defined. |
| Triggering event | The action track, for example `&onClick`. |
| Optional condition | A test in the script. |
| Destination | A moment or a mark targeted by the `goto`. |

A script can also request this move from another point of the composition.

### 4.2. Example: opening and closing a door

```html
<tsi-p id="door" data-tsi="&synchro 0:stop;
                           &mark    0:CLOSED;                        1:OPEN;   
                           &face    0:closed;                        1:open;
                           &onClick 0:{ $this->$gotoStop('OPEN') };  1:{ $this->$gotoStop('CLOSED') };">
  <tsi-f id="closed">…</tsi-f>
  <tsi-f id="open">…</tsi-f>
</tsi-p>
```

At moment `0`, named `CLOSED`, a click leads to `OPEN`. At moment `1`, named `OPEN`, it leads back to `CLOSED`.

The `&mark` track names the moments; the `&face` track associates Faces with them; the `&onClick` track defines the moves triggered by a click.

<a id="uses"></a>

## 5. The three uses of the time bar

A TiSpI time bar can represent states, animate properties, or follow a master.

| Use | In TiSpI | In SyncCharts |
|---|---|---|
| **States bar**: following a discrete value | A Piece stays on a moment, and moves to another after an event. | A graph of exclusive states evolves through its transitions. |
| **Animation**: playing intervals | Keys define the values; interpolations and effects produce their evolution. | An evolution can be computed or received at the logical instants, then carried by valued signals. |
| **Synchronization on a master**: following an evolving value | A plate follows a master, for example a video, a slider or a parent Piece. | A recurring event can serve as the reference of a logical progression; valued signals can carry the master's position. |

### 5.1. The states bar

The button of [section 2](#structure) illustrates this use. Its moments correspond to the configurations `OUT`, `OVER` and `PUSHED`. The bar stays on the selected moment until the next change.

This behaviour matches the organization in exclusive states of SyncCharts.

### 5.2. Declarative animation

TiSpI describes evolution through keys and intervals. The intermediate values are computed from this description.

```html
<tsi-p id="mover" data-tsi="&pos  0:0,0;  120:400,0;  240:0,0;
                            &face 0:day;  <20:fade> 120:night;">
  <tsi-f id="day"   data-tsi="&size 80,80;">day</tsi-f>
  <tsi-f id="night" data-tsi="&size 80,80;">night</tsi-f>
</tsi-p>
```

The `&pos` track describes a round trip. The `&face` track selects `day`, then `night`, with a `fade` effect of duration `20` carried by the arrival key.

SyncCharts can carry the values of an animation through valued signals. Computing the interpolations and applying them to the rendering then belongs to the application. Its reactions happen at discrete instants; this does not prevent it from representing numerical values taken from a continuous quantity. [Valued signals, §8.6](https://webusers.i3s.unice.fr/~map/WEBSPORTS/SyncCharts/RR200324.pdf#page=57)

### 5.3. Example: a wait with a progress bar

In TiSpI, a wait can be represented by a sub-group whose time plays a duration, with an action at its last moment. This sub-group can show its progress during the wait.

```html
<tsi-p id="screen" data-tsi="&synchro 0:stop;  
                             &mark 0:WAIT;    1:NEXT;  
                             &face 0:waiting; 1:next;">
  <tsi-g id="waiting">
    <tsi-pf id="bar" data-tsi="&size 0:0,8; 60:200,8;  &onTime 60:{ $up(screen)->$gotoStop('NEXT') };"></tsi-pf>
  </tsi-g>
  <tsi-f id="next">…</tsi-f>
</tsi-p>
```

The Piece `screen` stays on `WAIT` while the plate of the group `waiting` progresses. At moment `60`, the action requests the move to `NEXT`. The example directly uses the temporal autonomy of the sub-group.

In SyncCharts, a wait can be built by counting the occurrences of a clock signal. Sixty occurrences represent one second if this signal runs at 60 Hz. In the same way, a duration of 60 frames in TiSpI represents one second at a rate of 60 frames per second.

### 5.4. Synchronization on a master

A TiSpI plate can follow the position given by a media element or another source. The master's value then determines the position of the plate in time.

```html
<tsi-p id="player" data-tsi="&synchro !<face> 0:;  &pos 40,40;">
  <tsi-f id="screen" data-tsi='&videoSynchro "avion.mp4", controls;  &size 640,360;'></tsi-f>
</tsi-p>
```

The example ties the synchronization to a video Face. The media file `avion.mp4` must be available at the given location.

The comparison with **multiform logical time** concerns the choice of the reference: a recurring event can serve as the unit of progression. A media position can also be carried as a value. TiSpI builds the tracking of this position into the working of the plate; sampling the master's value is not enough, on its own, to make the two mechanisms identical.

<a id="control"></a>

## 6. Control: suspension, preemption and animated exit

### 6.1. Suspending a progression

In SyncCharts, suspension freezes the internal evolution of a composite state: while it lasts, the inside no longer reacts to signals. In TiSpI, a stopped plate keeps its position and can resume playing from it. The stop can come from a command or from the master.

Both mechanisms give local control, but they do not freeze the same thing. SyncCharts suspension freezes reactions. A TiSpI stop freezes only time: a stopped plate keeps reacting to events. The button of [section 2](#structure) is the example: its plate is stopped by `&synchro 0:stop`, and it reacts to the pointer hovering over it.

### 6.2. Strong preemption, weak preemption and exit duration

SyncCharts preemptions define the order of processing **within one logical instant**. A TiSpI animated exit has a duration. This distinction sets the scope of the comparison. [Preemption, §5.4](https://webusers.i3s.unice.fr/~map/WEBSPORTS/SyncCharts/RR200324.pdf#page=27)

| SyncCharts mechanism | Counterpart in TiSpI | Scope of the correspondence |
|---|---|---|
| **Strong preemption**: leaving prevents the internal reaction of the state in the current instant. | A change of Face without exit effect: the outgoing branch becomes inactive at once. | Leaving is immediate in both descriptions; the priority rules of reactions remain specific to each engine. |
| **Weak preemption**: the inside reacts in the current instant, then the state is left. | The key of the outgoing branch placed on the switching frame is played, then the Face plays its exit over its duration. | The key played at the switch is weak preemption in the strict sense; the exit that lasts is an extension of it. |

### 6.3. Example: an animated exit defined by the Face

```html
<tsi-f id="front" data-tsi="&opacity 0:1; !<30:easeOut> 0:0">…</tsi-f>
```

When its Piece leaves the Face `front`, the Face fades out over 30 frames. The Face carries the description of its exit; the Piece that selects it does not need to know its details.

Today, this exit section handles value tracks. Action tracks, and the key placed on the switching frame, are not yet played by the engine.

<a id="contributions"></a>

## 7. What each model brings

### 7.1. SyncCharts: a formal synchronous semantics

SyncCharts inherits the synchronous semantics of Esterel: instantaneous reactions, constructive causality and determinism. Causality analysis can lead to rejecting a non-constructive model. These properties concern the execution rules of the model, beyond the shape of its tree. [Semantics and compilation, §4.3](https://pop-art.inrialpes.fr/~girault/Slap03/Final/andre.pdf#page=11)

### 7.2. TiSpI: time and rendering in the composition

TiSpI adds to this organization of the tree:

- the selection of Faces by position in time;
- a time of its own for each plate;
- declarative tracks, with their keys, effects and durations;
- animated exits carried by the Faces;
- synchronization on the position of a media element or another master.

It also distributes properties according to their target, which determines their role. This distribution rests on a precise technical distinction, not on an abstract semantic choice.

| Role | What the properties describe |
|---|---|
| **Structural** | The configuration of the active tree. |
| **Spatial** | The position and the room taken by the Pieces on a plate. |
| **Decorative** | The internal appearance of the Faces. |

<a id="references"></a>

## 8. References

- Charles André, *SyncCharts: A Visual Representation of Reactive Behaviors*, report RR 95–52, revised as RR 96–56, 1996. [Presentation](https://www-sop.inria.fr/members/Charles.Andre/CA%20Publis/SYNCCHARTS/overview.html)
- Charles André, *Computing SyncCharts Reactions*, 2003 workshop version, published in ENTCS in 2004. [Workshop version](https://pop-art.inrialpes.fr/~girault/Slap03/Final/andre.pdf) · [ENTCS version](https://webusers.i3s.unice.fr/~map/WEBSPORTS/Documents/2003a2005/entcs04-text.pdf)
- Charles André, *Semantics of SyncCharts*, I3S report, April 2003. [PDF](https://webusers.i3s.unice.fr/~map/WEBSPORTS/SyncCharts/RR200324.pdf)
- Charles André and Jean-Paul Rigault, *Variations on the Semantics of Graphical Models for Reactive Systems*, 2002. [PDF](https://www.i3s.unice.fr/~map/WEBSPORTS/Documents/1999a2002/SMC02.pdf)
- Charles André, [publications on SyncCharts](https://webusers.i3s.unice.fr/~map/WEBSPORTS/SyncCharts/publications.en.html).
- TiSpI, [repository and documentation](https://github.com/wvanim/TiSpI-DOM), in particular `GRAMMAR.md` and `GLOSSARY.md`.

[Back to contents](#contents)
