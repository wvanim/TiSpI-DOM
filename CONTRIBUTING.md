# Contributing to TiSpI

Thank you for your interest in TiSpI. This repository holds the **model and its documentation**, not the engine code. Contributions are about ideas, explanations, examples and corrections.

---

## What you can contribute

- **Corrections**: a sentence that is wrong, unclear, outdated, or contradicts another document.
- **Examples**: a tree, a use case, a diagram that makes the model easier to understand.
- **Questions**: anything the documents do not answer, or answer in two different ways.
- **Ideas about the model**: a new notion, a change to a rule, a case the model does not cover.

---

## Two layers — say which one you are talking about

Every document belongs to one of two layers, stated on its first line:

- **Theoretical model** — the Time/Space Interleaved tree itself: alternation of time and space nodes, Pieces, Faces, plates. It is abstract: the "space" of a node may be a screen, a sound, or a stream of signals.
- **Tispi DOM** — the HTML implementation of the model: `<tsi-p>`, `<tsi-g>`, `<tsi-f>`, the `data-tsi` attribute, tracks, the engine. It works in a defined context, the user interface.

A rule of Tispi DOM is not necessarily a rule of the model. When you propose something, say which layer it concerns.

---

## How to contribute

**A correction in a document**
Open an **Issue**: name the document, quote the sentence, propose the correction. For a small fix, you can also edit the file directly on GitHub (pencil icon) — this creates a proposal (pull request) that will be reviewed.

**A question or an idea about the model**
Open a **Discussion**, not an Issue. An idea is stated, examined, then kept or closed. To help that examination, please give:

1. what the idea brings, in the context TiSpI defines;
2. what it costs: new rules, exceptions, properties that would need arbitration;
3. an example tree showing the case.

Ideas are evaluated one by one. Many are closed — that is how the model stays small and regular.

---

## Writing rules

- **State what is demonstrated.** A claim is supported by a page that runs, a test, or a measurement. If it is not demonstrated, it is written as an open point, or not at all.
- **Use the words of the model.** Pieces, Faces, groups, plates, tracks, keys, marks, articulations — see the glossary. Do not import vocabulary from other theories; it pulls the model towards them.
- **Describe TiSpI, do not judge other tools.** Say what TiSpI defines and what it gives. Comparisons belong only where they are verifiable.
- **No abbreviations in prose.** Write `easeInOut`, not `_io_`.
- **What works for one element works for all elements of the same type.** A restriction is written only when the model imposes it, and then it is stated.

---

## Who decides

Proposals are reviewed and decided by the maintainer, Philippe Destrumel (@wvanim). A proposal may be accepted, reworded, or closed with an explanation.

---

## License

The content of this repository is licensed under **[CC BY-NC-ND 4.0](https://creativecommons.org/licenses/by-nc-nd/4.0/)** (see `LICENSE`): you may read, share and quote it, crediting Philippe Destrumel, for non-commercial purposes, without publishing modified versions.

By contributing, you grant Philippe Destrumel the right to use, modify and publish your contribution as part of this repository, under its license.
