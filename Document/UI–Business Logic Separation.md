# Law 2 — The Scope of Tispi

Tispi takes charge of the **user interface** only: its Faces, its states, its time. Business logic — data, requests, stores, rules — stays with its own tools. Tispi separates the two by its scope, not by a mechanism: nothing in its code recognizes or forbids business logic. It simply does not handle it.

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

### What comes back

The business layer returns content, never a display rule. The interface reads it and chooses. The choice can be a key whose value is a script:

```
let $items = { loadItems() };
&face 0:{ $items.length ? 'list' : 'empty' };
```

or a script that goes to a **mark**, a named stop in a Piece's time:

```
&mark 0:CLOSED; 1:OPENED;
…
{ $card->$gotoStop($opened ? 'OPENED' : 'CLOSED') }
```

In both cases the rule lives on the Tispi side. Marks and variables are the common vocabulary: declared on the Tispi side, read and written by scripts. A **variable** written from a script (`$n = 5`) is read by the tracks that use it. A written value is state: when the document is exported by the editor, it is saved with it (see the default values and `$$openDefaultValue`).

### When the answer comes later

A call to the business layer is usually asynchronous. Writing a variable does not re-evaluate anything: the value of a key is computed when the key is played. The script that receives the answer therefore writes the variable, then goes to the moment that reads it. Two moments keep the request and its result apart:

```
&synchro 0:stop;
&face    0:loading;  1:{ $items.length ? 'list' : 'empty' };
&onTime  0:{ loadItems().then(items => { $items = items; $gotoStop(1); }) };
```

`&synchro 0:stop;` starts the plate halted on 0: time does not advance by itself, and the Piece waits. A goto to a moment re-evaluates the state keys of that moment, so `&face` reads `$items` on arrival at 1. The result goes to a moment where no request is defined: the request is not restarted.

The direction of the calls is kept: the business layer never calls the interface. The script of the interface receives the answer and acts.

This seam is also where a script leaves Tispi: `loadItems` is a plain JavaScript identifier. Tispi does not analyze or guarantee what `loadItems` does; the interface script is responsible for using its result.

---

## Comparison with the backend

Like a table exposing named columns, a Tispi branch exposes named variables that scripts read and write, and named marks they target, or move by changing their frame:

```
Backend table           Tispi
──────────────────      ──────────────────
columns                 variables, marks
rows returned           values read by scripts
UPDATE / INSERT         variable writes from scripts
```

The analogy concerns data access, not execution: Tispi also renders and controls time, and a value it reads has a meaning of presentation, the Face it selects.

---

## What this gives

**Independent testability.** A Tispi branch is verified without business logic: Faces, states, tracks, marks. Business logic is tested without Tispi: it receives calls and returns values.

**Replaceability.** The business implementation can evolve without changing the Tispi structure, provided the functions called by the interface scripts preserve their expected inputs, results and behavior. Marks and variables are another contract: the one between the interface scripts and the branch. Conversely, the rendering engine could change without touching the business logic: this is an expected property, as there is only one engine today.

**Readability.** The author of the interface scripts needs to know the marks, the variables and the business functions they call — not the internal structure of the branch. The business implementation needs no knowledge of Tispi. One person may hold both roles; their responsibilities remain distinct.

**Reusability.** The same Tispi branch can connect to different business implementations through adapted scripts, without changing its Faces or tracks.
