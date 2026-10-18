
# The day / night disc, step by step

Five pages build the same animation, one idea at a time: a disc goes right and comes back, changing from “day” to “night” along the way. Each step adds one thing to the previous one. Only the Piece’s `data-tsi` attribute changes from step to step.

## The page around the script

Every step uses the same page. The Piece `circle` has two Faces, `day` and `night`; their appearance is defined in plain CSS.

```html
<tsi-pg id="root">
  <tsi-p id="circle" data-tsi="&size; //… and the script for this step…">
    <style>@scope { .disc { width: 80px; height: 80px; border-radius: 50%;
                            text-align: center; line-height: 80px; } }</style>
    <tsi-f id="day"   class="disc" style="background-color: gold;">day</tsi-f>
    <tsi-f id="night" class="disc" style="background-color: midnightblue; color: white;">night</tsi-f>
  </tsi-p>
</tsi-pg>
<script>o_.start(null, 100/6, null, null, document.getElementById("root"));</script>
```

Rules:

- `tsi-p`: the tag for Pieces. This div activates its direct child divs one after another.
- `tsi-f`: the tag for Faces, the child divs activated in turn by the Piece.
- `data-tsi`: holds the Tispi script associated with the element.
- `&size` (with no key): the Piece does not impose its dimensions on its Faces; each Face keeps the dimensions set by its CSS.
- `o_.start(…)` starts the engine on the element passed as its last argument.
- The second argument of `o_.start(…)` sets the duration of a frame in milliseconds. Here, `100/6` ms gives 60 frames per second; a round trip of 240 frames therefore lasts four seconds.

---

## Step 1 — the round trip

[run](https://www.wvanim.fr/projets_perso/tispi/examples/learn_day_night/step1_move.html) · [code](step1_move.html)

```text
&face    0:day; 120:night;  // the timeline adjusts to the longest track: 240
&pos     0:0,0; 120:400,0; 240:0,0;
```

Two tracks, the same moments.

- `&face` shows `day`, then `night` at frame 120, then `day` again when the plate loops.
- `&pos` moves the Piece 400 pixels to the right in 120 frames, then brings it back in 120 frames.

No transition and no action yet: the movement is linear, and the Faces switch instantly.

**Rules:**

- A track name starts with `&`: for example, `&face` or `&pos`.
- Each key is a frame number followed by a value.
- Each key ends with a semicolon: `0:day; 120:night;`. Without it, the next key is rejected with the message “';' expected”.
- The frame number always ends with a colon: in `120:night`, `120:` denotes frame 120, and `night` is the name of the Face to activate.
- All the tracks of the Pieces on a plate share a common length, set by the longest track among all those Pieces. From 0 to 240 inclusive, there are 241 frames. The `&face` track therefore also lasts 241 frames.
- In Tispi, timelines loop: the plate returns to frame 0. In this example, the `&face` track then activates the Face `day` again.
- The `&face` track defines which Face is active over time. Faces are the Piece’s child divs.
- The value of an `&face` key is the ID of a child div of the Piece: `night` refers to `<tsi-f id="night">`.

---

## Step 2 — an interpolation on `&pos`

[run](https://www.wvanim.fr/projets_perso/tispi/examples/learn_day_night/step2_ease.html) · [code](step2_ease.html)

```text
&face    0:day;           120:night;
&pos     0:0,0<easeIn>;   120:400,0; 240:0,0;
```

**Added:** `<easeIn>` after the value of key 0. It shapes the way out, which now starts slowly and speeds up. The way back, after key 120, stays linear.

**Rule:**

An interpolation is written **after a value**. It shapes the interval from this key to the next. Its duration is the time between these two keys. **Important:** the angle-bracket expression therefore contains no duration.

The interpolation is part of the key’s body, written before its closing semicolon `;`.

---

## Step 3 — an effect on each `&face` key

[run](https://www.wvanim.fr/projets_perso/tispi/examples/learn_day_night/step3_key_effect.html) · [code](step3_key_effect.html)

```text
&face    0:day; <60:fade> 120:night;  <60:fade> 240:day;
&pos     0:0,0<easeIn>;   120:400,0;            240:0,0;
```

**Added:** `<60:fade>` before keys 120 and 240. The effect has its own duration, here 60 frames, and ends at its key: the fade towards `night` starts at frame 60 and ends at 120; the fade back to `day` starts at 180 and ends at 240. During a fade, both Faces are visible, one appearing while the other disappears.

**Rules:**

- An effect is written **before the key it leads to**. The effect’s angle-bracket expression starts with the transition duration.
- The duration ends with a colon, as in `<60:fade>`, because it is a time value.

---

## Step 4 — one effect for the whole `&face` track

[run](https://www.wvanim.fr/projets_perso/tispi/examples/learn_day_night/step4_track_effect.html) · [code](step4_track_effect.html)

```text
&face    !<60:fade> 0:day;         120:night; 240:day;
&pos                0:0,0<easeIn>; 120:400,0; 240:0,0;
```

**Changed:** the two key effects are replaced by one effect in the **track header**, `!<60:fade>`. The result is the same as in step 3, written once.

**Rules:**

- An effect in the track header applies to every key in the track that has no effect of its own. A key can still carry its own effect, which then takes precedence over the header effect. This simplifies the notation by factoring out the shared effect.

- The colon matters even more here. In the track header, `!<60,fade>` is not rejected: without a duration, it is read as an interpolation, and the 60-frame fade is lost.

---

## Step 5 — an action track

[run](https://www.wvanim.fr/projets_perso/tispi/examples/learn_day_night/step5_action.html) · [code](step5_action.html)

```text
&face    !<60:fade> 0:day;                 120:night;            240:day;
&pos                0:0,0<easeIn>;         120:400,0;            240:0,0;
&onClick            0:{ alert('Youpy'); }; 120:{ alert('Zzz'); };
```

**Added:** the `&onClick` track. A click before frame 120 runs the action at key 0 and displays “Youpy”; a click from frame 120 onward runs the action at key 120 and displays “Zzz”.

**Rules:**

- An action track is written like the others, with keys at specific frames. Its values are scripts.

  **Important:** `&onClick` defines which action a click triggers during the interval, until the next key or the end of the timeline. In contrast, `&onTime` triggers an action when the timeline reaches a specific key, on a single frame.

- Scripts are enclosed in braces: `{script}`. These delimiters hand control over to JavaScript.
- Any Tispi value can be evaluated by a script.

Example:

```text
&pos 0:0,0; 120:{window.innerWidth - 80},0;
```

---

## What the five steps show

| Step | Written | Where |
|---|---|---|
| 1 | A key: `frame:value;` | In a track |
| 2 | An interpolation: `<easing>` | After the value of a key, for the interval that follows |
| 3 | An effect: `<duration:process>` | Before the key it leads to, ending at that key |
| 4 | A default effect: `!<duration:process>` | In the track header, for all its keys |
| 5 | An action: `{ script }` | As the value of a key, on an action track |

The full grammar is in [GRAMMAR.md](../../GRAMMAR.md), and the vocabulary is in [GLOSSARY.md](../../GLOSSARY.md).
