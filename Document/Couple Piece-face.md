# Law 1: The Atomic Unit — Piece / Face

TiSpI — Time/Space Interleaved — is an engine that drives a component tree in which time and space strictly alternate:

- Time / Space / Time / Space / …

Here, we present its application to user interfaces, its original domain.

The model takes its cue from real life. A real-world object changes throughout its life while retaining its identity. In TiSpI, the **Piece** plays the role of that object.

At any given moment, the object presents an aspect: its **Face**. The Face is not an image attached to the Piece; it is the Piece itself, in its visible and audible form.

Thus, we decompose every interface component along two fundamental axes: **the axis of time**, which carries its identity and logic (the Piece), and **the axis of space**, which carries its manifestations at a given moment (the Faces).

<p align="center">
  <a href="https://www.wvanim.fr/projets_perso/tipsi/doc/tispi_node_animated/html/structure.html">
    <img
      src="https://www.wvanim.fr/_demo/tispi_piece.png"
      alt="Piece / Face diagram"
      width="40%"
    ><br>
    A Piece displays its Faces one after another (click here)
  </a>
</p>

## 1. The Plateau

Groups are Faces. The TiSpI tree can therefore take the following form:

Piece / Group / Piece / Group / … / Piece / Face

The Pieces that are direct children of a Group form a **plateau**. A plateau is a theoretical concept used in the documentation.

The Pieces within a plateau are synchronized, as illustrated by the animation linked below.

<p align="center">
  <a href="https://www.wvanim.fr/projets_perso/tipsi/doc/tispi_node_animated2/structure1.html">
    <img
      src="https://www.wvanim.fr/_demo/plate_motor.jpg"
      alt="Plateau with two synchronized Pieces"
      width="75%"
    ><br>
    A plateau with two synchronized Pieces (click here)
  </a>
</p>

## 2. The Tree

Pieces and Faces expose orthogonal arrays: time | Face.

<p align="center">
  <a href="https://www.wvanim.fr/projets_perso/tipsi/schema_piece_face.html">
    <img
      src="https://www.wvanim.fr/_demo/tispi003a.png"
      alt="Piece / Face diagram"
      width="100%"
    ><br>
    Time/Space Interleaved tree (click here)
  </a>
</p>

## 3. The Roles of the Timeline

### State Bar — Discrete-Value Listener

### Timeline

### Follower of a Master Value — Continuous-Value Listener

## 4. Principle of Indivisibility

The **Piece / Face** pair is not an association of two separate objects, but the bipolar definition of a **single component**. A Piece cannot be separated from its Faces without breaking the integrity of the system.

### Constitutive Duality

Every interface element is a single entity with two complementary dimensions:

1. **The Piece (Being):** It represents the component’s existence—its logical foundation, its “life,” and its interface with the outside world. It forms the decision-making center.
2. **The Face (Appearance):** It is the material manifestation or rendering state. It exists only because it is carried by a Piece.

### Formal Structure of the Component

A component is structurally defined as a **Piece** containing a set of **Faces** (0 to n).

- **Unity through the Piece:** Each component has exactly one Piece. It guarantees a single identity, regardless of how many aspects the component may take.
- **Multiplicity through the Face:** The Face is a **rendering type**. A single component can therefore change its appearance (switch between F₀ and F₁) without changing its identity (the Piece remains the same).

### Technical Synthesis

In the **TiSpI** model, designing a component means defining this unity:

> **A single center of life (Piece) for one or more expressions of state (Faces).**

This fusion removes the complexity associated with synchronizing separate logic and display objects: they are simply two sides of the same coin.

## 5. Can a Face Exist without a Piece?

This question concerns user interfaces in general, from a theoretical and structural perspective. Let us clarify what an *entity* is, what a *representation* is, and *where identity resides* in an interface system.

We distinguish three levels: ontological, computational, and architectural.

### The Ontological Level: What Is a Face as an Entity?

A Face is not an object but a **projection**. It has no identity of its own; it is an *effect*.

- A color does not exist without a surface.
- A shadow does not exist without a body.
- A shape does not exist without a supporting medium.

In this sense, a Face without a Piece is a contradiction: it would be a **phenotype without a genotype**, a manifestation without a substrate.

What we call a *Face* in TiSpI is an **accident** in the Aristotelian sense, rather than a substance.

A *Piece* is the minimal substance that allows the accident to exist.

### The Computational Level: What Is a Face inside a Machine?

Even in the most permissive systems, a Face requires:

- A **memory container** (address, instance, structure).
- A **lifecycle** (creation, update, destruction).
- An **event channel** (interaction, focus, hitbox).
- A **rendering context** (canvas, GPU, pipeline).

Without a Piece, none of these functions has an entity to carry it.

A Face “without a Piece” would be a **floating bitmap**, without identity, persistence, or interaction.

We could call it a static visual artifact.

### TiSpI Ontology

Let us examine the **conditions of existence**.

In TiSpI:

- The Piece is the minimal unit of identity.
- The Face is the minimal unit of manifestation.
- Together, they form an **inseparable pair**, like a node and its projection.

This eliminates orphaned views, inconsistent states, dead renderings, and non-causal transitions.

### The Reverse Case: A Piece without a Face?

Can a Piece exist without a Face?

- Yes, if it is off-screen, **hidden**, **in transition**, **preloaded**, **waiting**, **in an error state**, and so on.
- Yes, if it represents a non-visible logical entity (container, layout, proxy, service).
- Yes, if it is a structural node without a direct manifestation.

In other words:

**The Face depends on the Piece, but the Piece does not depend on the Face.**

The relationship is asymmetric.

### Synthesis

A Face without a Piece is impossible in a coherent system: it would have no identity, lifecycle, or causality.

A Piece without a Face is not only possible but structurally useful.
