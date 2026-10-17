# The day / night disc, step by step

Five pages build the same animation, one idea at a time: a disc goes right and comes back, and changes from "day" to "night" on the way. Each step adds one thing to the previous one. Only the `data-tsi` attribute of the Piece changes from step to step.

## The page around the script

Every step uses the same page. The Piece `circle` has two Faces, `day` and `night`; their look is plain CSS.

```html
<tsi-pg id="root">
  <tsi-p id="circle" data-tsi="…the script of the step…">
    <style>@scope { .disc { width: 80px; height: 80px; border-radius: 50%;
                            text-align: center; line-height: 80px; } }</style>
    <tsi-f id="day"   class="disc" style="background-color: gold;">day</tsi-f>
    <tsi-f id="night" class="disc" style="background-color: midnightblue; color: white;">night</tsi-f>
  </tsi-p>
</tsi-pg>
<script>o_.start(null, 100/6, null, null, document.getElementById("root"));</script>
```

`&size;` opens every script: the Piece has no size of its own, so each Face keeps the size given by its CSS class.

A frame lasts 100/6 ms: 60 frames make one second, and the round trip of 240 frames lasts four seconds.

---

## Step 1 — the round trip

[step1_move.html](step1_move.html)

```text
&size;
&face    0:day;                120:night;            240:day;
&pos     0:0,0;           120:400,0;            240:0,0;
```

Two tracks, the same moments. `&pos` moves the Piece 400 pixels to the right in 120 frames, then brings it back in 120 frames. `&face` shows `day`, then `night` at frame 120, then `day` again at 240.

No transition and no action yet: the movement is linear, and the Faces switch at once.

---

## Step 2 — an interpolation on `&pos`

[step2_ease.html](step2_ease.html)

```text
&size;
&face    0:day;                120:night;            240:day;
&pos     0:0,0<easeIn>;   120:400,0;            240:0,0;
```

**Added:** `<easeIn>` after the value of key 0.

An interpolation is written **after a value**. It shapes the interval that follows that key: here the way out, which now starts slowly and speeds up. The way back, after key 120, stays linear.

---

## Step 3 — an effect on each `&face` key

[step3_key_effect.html](step3_key_effect.html)

```text
&size;
&face    0:day;   <60:fade> 120:night;  <60:fade> 240:day;
&pos     0:0,0<easeIn>;   120:400,0;            240:0,0;
```

**Added:** `<60:fade>` before keys 120 and 240.

An effect is written **before the key it leads to**. It has its own duration, here 60 frames, and it ends on its key: the fade towards `night` starts at frame 60 and ends at 120; the fade back to `day` starts at 180 and ends at 240. During a fade, both Faces are visible, one appearing, the other disappearing.

The duration ends with a colon: `<60:fade>`. Before a key, `<60,fade>` is refused: a duration is expected.

---

## Step 4 — one effect for the whole `&face` track

[step4_track_effect.html](step4_track_effect.html)

```text
&size;
&face    !<60:fade>   0:day;   120:night;   240:day;
&pos     0:0,0<easeIn>;   120:400,0;            240:0,0;
```

**Changed:** the two key effects are replaced by one effect in the **head of the track**, `!<60:fade>`.

An effect in the head of a track applies to every key of the track that has no effect of its own. The result is the same as in step 3, written once. A key can still carry its own effect: it then takes precedence over the head.

The colon matters even more here. In the head, `!<60,fade>` is not refused: without a duration, it is read as an interpolation, and the 60-frame fade is lost.

---

## Step 5 — an action track

[step5_action.html](step5_action.html)

```text
&size;
&face    !<60:fade>   0:day;   120:night;   240:day;
&pos     0:0,0<easeIn>;   120:400,0;            240:0,0;
&onClick 0:{ alert('Youpy'); };          120:{ alert('Zzz'); };
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
| 4 | a default effect: `!<duration:process>` | in the head of a track, for all its keys |
| 5 | an action: `{ script }` | as the value of a key, on an action track |

The full grammar is in [GRAMMAR.md](../../GRAMMAR.md), and the vocabulary in [GLOSSARY.md](../../GLOSSARY.md).
