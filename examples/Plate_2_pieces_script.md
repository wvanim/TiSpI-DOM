

# Exploring the Tispi structure in 3D

[Annotated code](https://www.wvanim.fr/projets_perso/tispi/demo_scripts/demo_structure_3D_2pc_tsi_module_code.html) · [Interactive demo](https://www.wvanim.fr/projets_perso/tispi/demo_scripts/demo_structure_3D_2pc_tsi_module.html)

This interactive example makes the Tispi structure visible: a Piece activates its Faces one after another as time advances. A Group is itself a Face and contains other Pieces, forming the next level of the tree.

The 3D view separates the Faces along the time axis. The current-time plane shows which Face is active. Two Pieces illustrate how the same structure can be reused.

## Synchronization

Notice that the “Time” slider drives the animation. The bars stop when the slider stops and follow its movements as the visitor drags it.

This is a fundamental behavior of Tispi: a plate’s clock can be declared subordinate to another time source. Here, that source is a slider.

## Explore the structure

- Move the time slider to inspect the active Faces, or use Play and Stop.
- Rotate the view and adjust its depth to examine the hierarchy.
- Change the opacity of inactive Faces to keep the surrounding structure visible.
- Use the face and profile views to inspect the structure from different angles.

The 3D arrangement visualizes the time structure; it does not mean that Tispi interfaces must be three-dimensional.

## Read the implementation

The annotated code connects the running example to its HTML and Tispi declarations. Its explanatory panels cover:

- Pieces, rendered Faces and Group Faces;
- tracks, keys, effects and interpolations;
- clocks: sibling Pieces share the clock of their plate, while different plates have independent clocks and can be synchronized explicitly;
- variables, JavaScript actions and communication between Pieces;
- reusable modules, with parameters and content slots;
- CSS scoped to the branches it decorates.

The animation is played through the Web Animations API (WAAPI). The example uses no author-written animation loop or timer: JavaScript handles the view controls, while Tispi describes the animation and synchronization.
