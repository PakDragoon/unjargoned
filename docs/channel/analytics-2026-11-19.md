# Channel analytics review — Nov 19, 2026

Source: YouTube Studio Advanced Mode export, channel lifetime to Nov 18 (5 long-form, 14 Shorts).
Small samples: read these as direction, not proof. Re-check after the next 5 uploads.

## Numbers that matter

Long-form (Impr = thumbnail impressions; APV = average view duration ÷ length)

| Video | Ep | Views | Impr | CTR | APV | Subs |
|---|---|---|---|---|---|---|
| What Actually Happens When You Tap Your Card | 1 | 75 | 258 | **8.1%** | 27% (2:15 of 8:20) | 4 |
| How ChatGPT Actually Works (Explained Simply) | 2 | 66 | 258 | 3.5% | 33% | 5 |
| Why AI Makes Things Up (Hallucinations) | 3 | 62 | 329 | 3.0% | **41%** | 0 |
| Can You Hack an AI With One Sentence? | 5 | 32 | **782** | 2.1% | 35% | 0 |
| AI spent $31 on eggs without asking | 4 | 18 | 102 | 2.9% | 19% | 0 |

Shorts (feed views aren't counted as impressions, so "Stayed to watch" is the swipe test)

| Short | Views | Stayed to watch | APV |
|---|---|---|---|
| Why can't ChatGPT count the r's in "strawberry"? (Ep 2) | 1,315 | 55% | 69% |
| This AI spent $31 on eggs without asking (Ep 4) | 1,087 | 53% | 62% |
| People are hiding secret messages for AI in their resumes (Ep 5) | 226, still growing | 49% | **79%** |
| Chatbot vs AI agent (Ep 4) | 93 | 51% | 46% |
| Every other Short | 2–87 | 29–60% | — |

- Shorts: ~3,000 views → 1 subscriber. Long-form: ~250 views → 9 subscribers. Shorts bring views; long-form brings subscribers.
- Shorts get one test burst and stop (strawberry 592 → 86 → 0 engaged views by week). Winners sit at ~50–55% stayed to watch; everything under ~40% died.
- Payment Shorts all died (2–87 views), but the payments long-form has the best CTR. Payments works as a long-form curiosity topic, not as a scroll-stopper.
- Generic "Why does ChatGPT…?" Shorts (different answers, remember you, makes things up) all stayed under 75 views. The winners all show **a weird AI result tied to an everyday object**: a strawberry, eggs + a dollar amount, a resume.
- The Ep 4 eggs story worked as a 37 s Short and failed stretched to 3:39 long-form.
- Ep 5 long-form got the biggest impression test (782) but converted at 2.1% CTR. Retitled Nov 19 to
  "What Actually Happens When Your AI Reads a Booby-Trapped Email" (+ new "INVISIBLE TEXT." thumbnail). Check CTR against 2.1% after 3–4 days.
- Voice: the first ElevenLabs uploads (Ep 5, Nov 14) include the best-retaining Short. One data point, so not proven yet.

## Rules this adds (also in CLAUDE.md → "Packaging and Shorts")

1. Shorts open on the payoff: the weird result is on screen in the first second, and the first spoken line is a claim, not a question.
2. No logo sting, "Let's un-jargon it." or planned pause inside a Short.
3. Under 60 s, cutting anything that isn't the payoff or its "why" (winners: 37 s and 58 s); the last line should run back into the first (loop).
4. Every Short's Related video = the long-form on the same topic.
5. Long-form titles: the reveal pattern "What Actually Happens When…" (8.1% CTR) beats "… Explained Simply" (2–3.5%).
6. Thumbnail: one headline that adds to the title instead of repeating it; one clear subject; check at 168×94.
7. Pick Short topics by the winner pattern (weird AI result + everyday object + a number where there is one).

## Next 5 uploads (plan)

1. ~~Short: "Why AI can't read a clock 🕐": an analog clock at 10:10 with the AI's wrong answer stamped over it.~~
   **Re-angled (Nov 19) into two Shorts sharing one clock kit (`src/shorts/clock/`), both Related: Ep 2.**
   Reason: the claim is no longer true. ClockBench live leaderboard (checked Nov 19 2026): top model 87.8% vs 90.7%
   average humans, 95% top humans (launch, Sept 2025: best of 11 models 13.3% vs humans 89.1%; best model's median miss
   ≈ 1 hour). Never say "AI can't read a clock".
   - 1a. Short A: "AI looked at this clock and said 9:30 🕐" — built only on the 2024 clock test (arXiv 2410.11756,
     Galatzer-Levy et al.; models tested as of July 2024): clock at 5:45 → GPT-4o "9:30" (swapped hands), Gemini Pro 1.5
     and GPT-4 Turbo "9:00" (read only the long hand), Claude Opus 3 "4:50", Claude Sonnet 3.5 correct. Frame 1: the 5:45
     clock with "9:30" stamped on it. Post first.
   - 1b. Short B: "A year ago, AI couldn't read a clock. Now? 🕐" — ClockBench "about 1 in 8" (Sept 2025) → "almost 9 in
     10" now, nearly level with people; ends on Short A's 5:45 clock. Post 2–3 days after A.
2. Short: "Your AI assistant can be hijacked by a single email 📧": a plain email, then the hidden line revealed. Related: Ep 5.
3. Short: "I let an AI agent do my grocery shopping. Here's the bill 🧾": run a real test, then rebuild it with the Ep 4 agent and checkout (no real brand UI on screen), with the cart total in the hook. Related: Ep 6.
4. Long-form Ep 6: "What Actually Happens When an AI Agent Spends Your Money", building on Ep 4 and the grocery Short.
5. Long-form Ep 7: "What Actually Happens When You Pay With Your Phone", a sequel to the best-CTR video.

Targets: Shorts stayed to watch ≥ 60%, long-form CTR ≥ 5%, subscribers per 1k long-form views tracked per video.
