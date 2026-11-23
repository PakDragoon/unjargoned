# Production Spec: "Every Major AI Model Explained Simply" (Revised v2)

## 1. Core Promise & Repository Boundaries
- **Core Viewer Promise:** By the end of this video, someone staring at four identical chat boxes knows immediately which one to open for the task in front of them—and how to hand off work when a task spans two buckets.
- **Target Repository & Branch:** `unjargoned` on the active feature branch provided by the user. Commit all changes cleanly to that branch.
- **Approved Reference Directories (CLONE PATTERNS FROM THESE):**
  - `src/dots/` (`1920x1080`, `30 fps` long-form v2 Tactile Editorial reference, including the 5-second old-Dot/new-Dot high-five `"Subscribe!"` sting)
  - `src/shorts/dots/` (`1080x1920`, `60 fps` vertical Short v2 Tactile Editorial reference: `theme.ts`, `kit.tsx`, `common.tsx`, `durations.json`, `words.json`)
  - `tools/` (`tools/tts_short_dots.py` and `tools/sfx_short_dots.py` for ElevenLabs TTS generation, frame duration calculation, word-level timestamps, and SRT export)
  - `public/audio/sfx/` and `public/fonts/`
- **Forbidden Directories (DO NOT INSPECT OR REUSE):**
  - `src/episodes/` (`Ep02`–`Ep05` legacy dark-mode episodes)
  - `src/index.ts` and `src/Root.tsx` (keep entry points isolated at `src/models/index.ts` and `src/shorts/models/index.ts`)

---

## 2. Visual Style Lock & Audio Rules
- **Palette & Tactile System:** Warm off-white cream paper (`#F7F4EB`) with subtle grain, deep charcoal ink (`#141414`) with `3px` outlines and `8px` hard offset drop shadows, electric vermilion accents (`#FF4D2D`), and local fonts (`SpaceGrotesk-latin.woff2`, `JetBrainsMono-latin.woff2`).
- **Component Reuse:** Reuse `TheDot` rig, `CloudWindow` card components, and the 5-second high-five `"Subscribe!"` sting from `src/dots/` and `src/shorts/dots/kit.tsx`.
- **ElevenLabs TTS & Leveled SFX:**
  - Generate scene voiceovers via ElevenLabs (`eleven_v4`, voice `Mark`, matching `tools/tts_short_dots.py`) into `public/audio/models/` and `public/audio/short_models/`, outputting `durations.json`, `words.json`, and `.srt`. (If `ELEVENLABS_API_KEY` is absent, write the Python scripts and scaffold `durations.json` from word-count timings so Remotion builds immediately.)
  - Match the exact leveled SFX volumes from `src/dots/` and `src/shorts/dots/` (~10 dB below voiceover so action sounds never mask narration).

---

## 3. Deliverable 1: Long-Form Video (`src/models/` | ~5:35 Runtime)
- **Entry Point:** `src/models/index.ts` -> `src/models/Root.tsx` (`1920x1080`, `30 fps`)
- **Main Composition ID:** `Models-Full` (plus `Models-S1` through `Models-S6`)
- **Subscribe Sting Placement:** Place the existing 5-second old-Dot/new-Dot high-five `"Subscribe!"` sting immediately after **Scene 4** (right after the completed Gemini -> Claude meeting handoff).

### Long-Form Scene-by-Scene Script & Visual Direction

#### Scene 1 (`Models-S1`): Immediate Choice Hook (0:00 – 0:25)
- **Visuals:** Cream paper canvas (`#F7F4EB`). Four identical blank chat boxes (`CloudWindow` labeled `ChatGPT`, `Claude`, `Gemini`, `DeepSeek` with blinking cursors) appear immediately on frame 1 (`pop.wav`). At 0:08, `Gemini` lights up with a vermilion highlight border (`ding.wav`); at 0:15, `Claude` highlights (`click.wav`).
- **Narration:**
  > You missed an hour-long lecture. Somewhere in the recording, your professor draws the exact diagram you need. Four identical chat boxes are sitting in front of you. Which box would you open? I’d start with Gemini.
  >
  > Now you’ve found the diagram, but your rough explanation reads like a tax form. Different job. Which box now? That’s a Claude task. Every major AI looks like the exact same blank box, so most people just click whichever icon is closest. Once you see the four jobs they’re actually built for, you’ll know which box to open in seconds.

#### Scene 2 (`Models-S2`): Bucket 1 — ChatGPT & The Before-and-After Voice Note (0:25 – 1:25)
- **Visuals:** `ChatGPT` window slides forward (`whoosh.wav`). `TheDot` stamps a vermilion `ALL-ROUNDER` tag (`stamp.wav`) next to a tactile Swiss Army knife icon. Next, a voice waveform card plays Dot’s messy note with live transcript text scrolling out, followed by a clean two-sentence email card sliding out the other side (`ding.wav`).
  - *On-screen messy note card:* `"Hey uh, can we push Thursday’s sync to Friday at 2? My dentist appointment ran late and I still haven't finished the slides, sorry about that..."`
  - *On-screen clean email card:* `"Subject: Moving Thursday’s Sync to Friday at 2 PM — Hi Sarah, Could we move Thursday’s sync to Friday at 2:00 PM so I can wrap up the slides first? Let me know if that works."`
- **Narration:**
  > Bucket one is the Everyday All-Rounder—ChatGPT.
  >
  > Think of ChatGPT as the Swiss Army knife of AI. Its biggest strength is handling messy, everyday tasks in one place—especially when you’re speaking out loud. Watch what happens when Dot leaves a rambling voice note: *"Hey uh, can we push Thursday’s sync to Friday at 2? My dentist ran late and I still haven’t finished the slides..."*
  >
  > ChatGPT cleans up the filler, pulls out the new time, and hands back a crisp two-sentence email ready to send. When you want fast brainstorming, voice conversation, or quick everyday cleanup, start here.

#### Scene 3 (`Models-S3`): Bucket 2 — Claude in Action (Writing & Tracing Code) (1:25 – 2:30)
- **Visuals:** `Claude` window slides forward (`whoosh.wav`). `TheDot` puts on reading glasses and stamps `WRITING & CODE` (`stamp.wav`).
  - *Left half (Writing demo):* Shows stiff draft (`"Per our previous correspondence, failure to submit assets by Friday will delay launch."`) + prompt pill `"Make this sound like me, but keep the deadline firm"` -> transforms into revised line (`"Hey Alex — quick heads-up that we still need the final assets by Friday so we don’t push back launch."`) (`click.wav`).
  - *Right half (Non-dev code demo):* A simple checkout UI button stuck showing `$49` instead of `$29`. Claude highlights a connecting dotted vermilion line tracing from `CheckoutButton.tsx` back to `OLD_PROMO_PRICE = 49` in `config.js` (`snap.wav`).
- **Narration:**
  > Bucket two is where you reach when tone and precision matter—Claude.
  >
  > Instead of talking in theory, look at two jobs where people switch to Claude. First, rewriting without losing your voice. Take a stiff line like: *"Per our previous correspondence, failure to submit assets by Friday will delay launch."* Tell Claude: *"Make this sound like me, but keep the deadline firm."* You get back: *"Hey Alex — quick heads-up that we still need the final assets by Friday so we don’t push back launch."* Direct, natural, and still firm.
  >
  > Second, tracing bugs across files. Suppose a checkout button on your site still shows the old forty-nine-dollar price. Instead of guessing, Claude reads across your project folder and points straight to the exact config file still holding that old number.

#### Scene 4 (`Models-S4`): Bucket 3 — Gemini & The Two-Bucket Handoff (2:30 – 3:45)
- **Visuals:** `Gemini` window slides forward (`whoosh.wav`). `TheDot` drops an `MP4` meeting recording card (`42:18`) into Gemini and asks `"Where did we move the deadline?"`. Gemini jumps straight to timestamp `28:14` (`ding.wav`), highlighting the spoken quote (`"Let's push the client delivery from October 12 to October 19"`). Then `TheDot` drags that excerpt across to the `Claude` window (`whoosh.wav`), which outputs a client email showing **`Oct 12` crossed out -> `Oct 19` highlighted in vermilion** (`chime.wav`).
- **Narration:**
  > Bucket three is the Multimodal and Workspace Brain—Gemini.
  >
  > Unlike models that originally only read text, Gemini processes video, audio, images, and huge files natively inside Google’s ecosystem. And this is where the buckets connect—because real tasks rarely stay in one lane.
  >
  > Suppose Dot finishes a forty-minute meeting recording and needs to email a client what changed. First, Dot drops the video into Gemini and asks: *"Where did we move the deadline?"* Gemini jumps straight to minute twenty-eight and pulls the exact line: moving delivery from October twelfth to October nineteenth.
  >
  > Next, Dot hands that timestamped clip over to Claude to write the client update—and right there in the draft, October twelfth is swapped cleanly for October nineteenth. Gemini finds the needle in the video; Claude writes the message.

*(Immediately trigger the existing 5-second old-Dot/new-Dot high-five `"Subscribe!"` sting from `src/dots/` right here.)*

#### Scene 5 (`Models-S5`): Bucket 4 — Thinking Mode vs. Running Locally (3:50 – 5:00)
- **Visuals:** Clean vertical split-screen (`whoosh.wav`).
  - *Left panel (`THINKING MODE`):* Question card `"Can everyone work their assigned shift?"` Schedule grid shows `Maya` booked on `Front Desk (3:00 PM)` AND `Inventory (3:00 PM)`. `TheDot` opens a vermilion scratchpad, checks step by step (`tick.wav`), and circles the `3:00 PM` clash (`ding.wav`).
  - *Right panel (`RUNNING LOCALLY`):* Question card `"Can I summarize this private file while my laptop is offline?"` Shows a downloaded `DeepSeek / Llama` model badge already on the laptop, `TheDot` toggles Wi-Fi **OFF** (`vault.wav`), drops in `Private_Contract.pdf`, and generates a clean bullet summary with a green lock icon (`chime.wav`).
- **Narration:**
  > Bucket four covers two very different switches: Thinking Modes and Open-Weight Local Models. People often mix these up, so give each one its own question.
  >
  > For Thinking Mode, ask: *"Can everyone work their assigned shift?"* A fast model might skim the schedule and say yes. When you turn on Thinking Mode, the model pauses on a hidden scratchpad, checks every person hour by hour, and catches the real conflict—Maya is scheduled in two places at three p.m.
  >
  > For Open-Weight models like DeepSeek or Llama, ask: *"Can I summarize this private file while my laptop is offline?"* Note the catch: using DeepSeek on a public website still sends your file to a cloud server. But because open-weight models publish their blueprints, you can download one onto your laptop, turn Wi-Fi completely off, and summarize sensitive files locally.
  >
  > Thinking mode changes how the model tackles the problem. Running locally changes where the work happens. And on capable hardware, you can do both.

#### Scene 6 (`Models-S6`): Quick Viewer Test & Next-Video Tease (5:00 – 5:35)
- **Visuals:** All four tactile cheat-sheet cards (`ChatGPT`, `Claude`, `Gemini`, `Thinking / Local`) fan out across the upper two-thirds of the canvas. Three rapid prompt cards appear one by one with a 1.5-second pause beat before `TheDot` stamps the winning model card (`stamp.wav` x3):
  1. `"Messy voice note into an email?"` -> **CHATGPT**
  2. `"Find one diagram in a lecture?"` -> **GEMINI**
  3. `"Summarize a file that has to stay on this laptop?"` -> **LOCAL OPEN-WEIGHT**
  Leave bottom-right clear for the YouTube end-screen card.
- **Narration:**
  > Before you go, quick test—pick the box before Dot stamps it.
  >
  > Messy voice note into a clean email? ChatGPT.
  > Find one diagram buried inside a recorded lecture? Gemini.
  > Summarize a private file that has to stay on this laptop? A local open-weight model.
  >
  > Now that you know which model handles which job, what happens when these AI systems stop waiting for your prompts and start running tasks in the cloud while you sleep? Watch this breakdown next.

---

## 4. Deliverable 2: Feeder YouTube Short (`src/shorts/models/` | ~36 Seconds)
- **Entry Point:** `src/shorts/models/index.ts` -> `src/shorts/models/Root.tsx` (`1080x1920`, `60 fps`)
- **Main Composition ID:** `ModelsShort-Full` (plus `ModelsShort-S1` through `ModelsShort-S4`)
- **Captions:** Centered kinetic word-synced captions via `words.json`, keeping clear of bottom 20% and right-side Shorts UI overlays.

### Short Scene-by-Scene Script & Visual Direction

#### Short Scene 1 (`ModelsShort-S1`): Hook (0:00 – 0:06)
- **Visuals:** `TheDot` slams a vermilion `STOP` stamp (`slap.wav`) onto a generic chat box being used for everything.
- **Narration:**
  > Stop using ChatGPT for every single task. Every major AI is built for a completely different job.

#### Short Scene 2 (`ModelsShort-S2`): Concrete Job Stamps (0:06 – 0:22)
- **Visuals:** Three tactile index cards drop in vertically with concrete micro-visuals (`whoosh.wav` + `stamp.wav` per card):
  1. `CHATGPT` -> `VOICE NOTE -> CLEAN EMAIL`
  2. `CLAUDE` -> `REWRITE & TRACE CODE BUGS`
  3. `GEMINI` -> `SEARCH INSIDE LONG VIDEOS`
- **Narration:**
  > Turning a rambling voice note into a clean email? Open ChatGPT. Rewriting a stiff message in your own voice or tracing a bug across code files? Reach for Claude. Finding one specific moment inside an hour-long video? That’s Gemini.

#### Short Scene 3 (`ModelsShort-S3`): Thinking vs. Offline Split (0:22 – 0:30)
- **Visuals:** Split card: top shows `THINKING MODE` catching a `3:00 PM` schedule clash (`tick.wav` + `ding.wav`); bottom shows `LOCAL MODEL` summarizing a file with Wi-Fi **OFF** (`vault.wav`).
- **Narration:**
  > Switch on Thinking Mode when you need the AI to double-check logic, or run an open-weight model offline on your laptop for private files.

#### Short Scene 4 (`ModelsShort-S4`): Related Video CTA (0:30 – 0:36)
- **Visuals:** All four stamped cards stack into a pocket cheat sheet while a bold vermilion arrow points down toward the YouTube Shorts **Related Video** link (`pop.wav`).
- **Narration:**
  > Watch the full visual cheat sheet linked below so you never pick the wrong AI again.

---

## 5. Verification Checklist
1. Verify `npx remotion compositions src/models/index.ts` lists `Models-Full` (`1920x1080`, `30 fps`) and render one still per scene (`Models-S1` through `Models-S6`) to confirm zero text clipping or overlap.
2. Verify `npx remotion compositions src/shorts/models/index.ts` lists `ModelsShort-Full` (`1080x1920`, `60 fps`) and render preview stills to confirm mobile safe-zone alignment.
3. Confirm SFX volumes match `src/dots/` and `src/shorts/dots/` (~10 dB below narration) and commit all files to the target branch.