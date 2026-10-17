
# Law 2 — The Scope of Tispi

Tispi takes charge of the **user interface** only: its Faces, its states, its time. Business logic — data, requests, stores, rules — stays with its own tools. Tispi does not separate the two and has nothing in its code to recognize business logic: it defines a scope, not a boundary.

The reason is simple: each side concentrates on its own expertise. Tools for business logic exist (stores, query libraries, plain `fetch`); Tispi takes the place left empty, the interface and its time.

---

## Who calls whom

**The interface calls the business layer, never the reverse.**

The interface holds its own services: waiting, displaying, entering data. It chooses its Faces itself, and it calls the business layer when it needs content. The business layer provides **content**, never a display rule.

Example: a list that may be empty. The business layer knows the list is empty and sends what there is to show. The interface knows what to do with an empty list: that rule — *empty list → Face "empty"* — is written in a Tispi module, on its `&face` track. The choice is made inside the module.

The seam between the two is thin, and it runs in both directions:

### Interface → business

A script block calls what it wants, and Tispi takes the value that comes back, without interpreting it:

```
{ $items = loadItems() }
```

### Business → interface

A **mark** is a named stop in a Piece's time; a script goes to it by name:

```
&mark 0:CLOSED; 1:OPENED;
…
$card->$gotoStop("OPENED")
```

Marks are the common vocabulary: declared on the Tispi side, used by scripts. A **variable** written from a script (`$n = 5`) is read by the tracks that use it. A written value is state: it is saved with the document (see the default values and `$$openDefaultValue`).

---

## Comparison with the backend

The relationship is close to the one between a database table and backend code:

```
Backend table           Tispi
──────────────────      ──────────────────
columns                 variables
incoming triggers       marks (goto by name)
UPDATE / INSERT         variable writes from scripts
outgoing calls          script blocks calling the business layer
SQL rendering           UI rendering
```

Tables do not compute — they store and notify. Likewise, Tispi structures, renders and keeps its time; what the values mean is the business layer's affair.

---

## What this gives

**Independent testability.** A Tispi branch is verified without business logic: Faces, states, tracks, marks. Business logic is tested without Tispi: it receives calls and returns values.

**Replaceability.** The rendering engine can change without touching the business logic; the business logic can evolve without changing the Tispi structure.

**Readability.** A business developer needs to know the marks, the variables and the functions a branch calls — not the structure of the branch. A Tispi author needs to know which functions exist and what they return.

**Reusability.** The same Tispi branch connects to different business logics without modification: the same table, with different scripts.
