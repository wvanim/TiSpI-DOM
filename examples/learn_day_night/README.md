# The day / night disc, step by step

Five pages build the same animation, one idea at a time: a disc goes right and comes back, and changes from "day" to "night" on the way. Each step adds one thing to the previous one. Only the `data-tsi` attribute of the Piece changes from step to step.

## The page around the script

Every step uses the same page. The Piece `circle` has two Faces, `day` and `night`; their appearance is defined in plain CSS.

```html
<tsi-pg id="root">
  <tsi-p id="circle" data-tsi="&size; //… and the script for the step…">
    <style>@scope { .disc { width: 80px; height: 80px; border-radius: 50%;
                            text-align: center; line-height: 80px; } }</style>
    <tsi-f id="day"   class="disc" style="background-color: gold;">day</tsi-f>
    <tsi-f id="night" class="disc" style="background-color: midnightblue; color: white;">night</tsi-f>
  </tsi-p>
</tsi-pg>
<script>o_.start(null, 100/6, null, null, document.getElementById("root"));</script>
```
Rules:
- tsi-p: the tag for Pieces. This div activates its direct child divs one after another.
- tsi-f: the tag for Faces, the child divs activated in turn by the Piece.
- data-tsi: holds the Tispi script of the element.
- &size (with no key): the Piece does not impose its dimensions on its Faces; each Face keeps the dimensions set by its CSS.
- o_.start(…) starts the engine on the element given as its last argument.
- The second argument of o_.start(…) sets the duration of a frame, in milliseconds. Here, 100/6 ms gives 60 frames per second; a round trip of 240 frames therefore lasts four seconds.

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
No transition and no action yet: the movement is linear, and the Faces switch at once.

Rules:
- A track name starts with &: for example, &face or &pos.
- Each key is a frame number followed by a value.
- Each key ends with a semicolon: 0:day; 120:night;. Without it, the next key is rejected, with the message "';' expected".
- The frame number always ends with a colon: in 120:night, 120: is frame 120, and night is the name of the Face to activate.
- All the tracks of the Pieces of a plate share one length, set by the longest track among all these Pieces. From 0 to 240 inclusive, there are 241 frames. The &face track therefore also lasts 241 frames.
- In Tispi, timeline loop: the plate goes back to frame 0. In this example, the &face track then activates the Face day again.
- The &face track defines which Face is active over time. The Faces are the child divs of the Piece.
- The value of a &face key is the id of a child div of the Piece: night designates &lt;tsi-f id="night"&gt;.

---

## Step 2 — an interpolation on `&pos`

[run](https://www.wvanim.fr/projets_perso/tispi/examples/learn_day_night/step2_ease.html) · [code](step2_ease.html)

```text
&face    0:day;           120:night; 
&pos     0:0,0<easeIn>;   120:400,0; 240:0,0;
```

**Added:** `<easeIn>` after the value of key 0.

An interpolation is written **after a value**. It shapes the interval that follows that key: here the way out, which now starts slowly and speeds up. The way back, after key 120, stays linear.

---

## Step 3 — an effect on each `&face` key

[run](https://www.wvanim.fr/projets_perso/tispi/examples/learn_day_night/step3_key_effect.html) · [code](step3_key_effect.html)

```text
&face    0:day; <60:fade> 120:night;  <60:fade> 240:day;
&pos     0:0,0<easeIn>;   120:400,0;            240:0,0;
```

**Added:** `<60:fade>` before keys 120 and 240.

An effect is written **before the key it leads to**. It has its own duration, here 60 frames, and it ends on its key: the fade towards `night` starts at frame 60 and ends at 120; the fade back to `day` starts at 180 and ends at 240. During a fade, both Faces are visible, one appearing, the other disappearing.

The duration ends with a colon: `<60:fade>`. Before a key, `<60,fade>` is rejected: a duration is expected.

---

## Step 4 — one effect for the whole `&face` track

[run](https://www.wvanim.fr/projets_perso/tispi/examples/learn_day_night/step4_track_effect.html) · [code](step4_track_effect.html)

```text
&face    !<60:fade> 0:day;         120:night; 240:day;
&pos                0:0,0<easeIn>; 120:400,0; 240:0,0;
```

**Changed:** the two key effects are replaced by one effect in the **the track header**, `!<60:fade>`.

An effect in the the track header applies to every key of the track that has no effect of its own. The result is the same as in step 3, written once. A key can still carry its own effect: it then takes precedence over the head.

The colon matters even more here. In the head, `!<60,fade>` is not rejected: without a duration, it is read as an interpolation, and the 60-frame fade is lost.

---

## Step 5 — an action track

[run](https://www.wvanim.fr/projets_perso/tispi/examples/learn_day_night/step5_action.html) · [code](step5_action.html)

```text
&face    !<60:fade> 0:day;                 120:night;            240:day;
&pos                0:0,0<easeIn>;         120:400,0;            240:0,0;
&onClick            0:{ alert('Youpy'); }; 120:{ alert('Zzz'); };
```

**Added:** the `&onClick` track.

An action track is written like the others: keys on moments. Its values are scripts. A click before frame 120 runs the key 0 action and shows "Youpy"; a click from frame 120 on runs the key 120 action and shows "Zzz". The action depends on the moment, as the Face does.

---

## What the five steps show

| Step | Written | Where |
|---|---|---|
| 1 | a key: `frame:value;` | in a track |
| 2 | an interpolation: `<easing>` | after the value of a key, for the interval that follows |
| 3 | an effect: `<duration:process>` | before the key it leads to, ending on that key |
| 4 | a default effect: `!<duration:process>` | in the track header, for all its keys |
| 5 | an action: `{ script }` | as the value of a key, on an action track |

The full grammar is in [GRAMMAR.md](../../GRAMMAR.md), and the vocabulary in [GLOSSARY.md](../../GLOSSARY.md).
