# CSS has in Time/Space Interleaved (Tispi)

## 1. Function `source:has(condition)`

In the TiSpI engine, `has()` is a **system script function** that observes a condition in the DOM or in a source structure.

```
source:has(condition)
```

This function acts as a **logical sensor**: it monitors whether the condition becomes true or false.

---

## 2. `has` Track

A **`has` track** contains *keys* that activate the observation of this condition.

Each key corresponds to:

```
[condition, PieceTarget, numFrameTrue, numFrameFalse]
```

Meaning:

| field           | role                                                           |
| --------------- | -------------------------------------------------------------- |
| `condition`     | condition to observe (e.g. `:invalid`, `img`, `input:checked`) |
| `PieceTarget`   | piece whose state may change                                   |
| `numFrameTrue`  | frame used if the condition is true                            |
| `numFrameFalse` | frame used if the condition is false                           |

---

## 3. Track Position

The **`has` track is placed in the container** (e.g. form, component, card).

This means the condition is evaluated **within the context of that container**.

---

## 4. Activation in Time

### a) Time cursor arrival

When the time cursor reaches the key:

```
t = keyTime
```

the engine activates:

```
source:has(condition)
```

The observation of the condition begins.

---

### b) Reaction to changes

If the condition changes:

```
false → true
```

the engine moves the target piece to:

```
numFrameTrue
```

If the condition becomes false again:

```
true → false
```

the target piece switches to:

```
numFrameFalse
```

---

## 5. Mechanism Diagram

```
time cursor → has track key
        ↓
activation of source:has(condition)
        ↓
DOM observation
        ↓
condition change
        ↓
frame change of PieceTarget
```

---

## 6. Conceptual Example

Key:

```
[:invalid, Psubmit, 2, 1]
```

Meaning:

* observe `:invalid`
* target piece: `Psubmit`
* if true → frame 2 (button disabled)
* if false → frame 1 (button enabled)

---

## 7. Summary

In TiSpI:

* `has()` is a **conditional sensor**
* the *keys* of the `has` track **activate this observation over time**
* condition changes **directly drive the frames of a target piece**

This turns a CSS selector like `:has()` into an **event-driven mechanism controlling component states**.
