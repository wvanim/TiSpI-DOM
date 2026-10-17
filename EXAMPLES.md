# Examples

Each example is an HTML page using Tispi DOM. **Run** opens the page in your browser. **Code** opens the same page's source with Tispi syntax colouring and explanations on hover.

| Example | What it shows | Run | Code |
|---|---|---|---|
| 3D structure | Two Pieces, their Faces and their tracks, shown as a 3D mechanism; Faces built from modules | [run](https://www.wvanim.fr/projets_perso/tispi/demo_scripts/demo_structure_3D_2pc_tsi_module.html) | [code](https://www.wvanim.fr/projets_perso/tispi/demo_scripts/demo_structure_3D_2pc_tsi_module_code.html) |
| Integration | An ordinary HTML page; Tispi takes charge of one branch only, the rest of the page is untouched | [run](https://www.wvanim.fr/projets_perso/tispi/demo_scripts/demo_integration.html) | |
| Pop-up | A button with two states and a pop-up; decoration written in a CSS `@scope` sheet inside the branch | [run](https://www.wvanim.fr/projets_perso/tispi/demo_scripts/demo_moteur_popup_scope2.html) | |
| React | A Tispi scene inside a React 19 application: Tispi animates the Faces, React fills them, and each can contain the other | [run](https://www.wvanim.fr/projets_perso/tispi/demo_scripts/demo_react.html) | [code](https://www.wvanim.fr/projets_perso/tispi/demo_scripts/demo_react_code.html) |


---

## The 3D structure, step by step

The same scene written in successive forms. Steps 1 to 3 give the same result on screen.

| Step | What changes | Run |
|---|---|---|
| 1. One Piece, written in full | Every Face and every track written out | [run](https://www.wvanim.fr/projets_perso/tispi/demo_scripts/demo_structure_3D_1pc_tsi.html) |
| 2. Shorter | Shared values moved into variables | [run](https://www.wvanim.fr/projets_perso/tispi/demo_scripts/demo_structure_3D_1pc_tsi_short.html) |
| 3. With modules | Each Face declared once as a module, then used five times | [run](https://www.wvanim.fr/projets_perso/tispi/demo_scripts/demo_structure_3D_1pc_tsi_module.html) |

