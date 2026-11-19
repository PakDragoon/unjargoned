# Clock Shorts: titles, descriptions, upload notes

Related video for both: Ep 2, "How ChatGPT Actually Works (Explained Simply)".
Post A first, B two or three days later.
Cover: no custom thumbnail. When you upload in the YouTube app, pick **frame 1** as the cover. Frame 1 is already the
payoff for both Shorts (A: the 5:45 clock with "AI said: 9:30"; B: the 8 clocks and "about 1 in 8").

### Short A: the 9:30 clock (`out/Unjargoned_ClockA_v2.mp4`, 38.5 s)
- Title: AI looked at this clock and said 9:30 🕐
- Description: It's quarter to six. In a 2024 test, GPT-4o said 9:30: it took the long hand for the hour. Only one of five AIs got it right. How AI "sees" and guesses: How ChatGPT Actually Works. Source: Galatzer-Levy et al., 2024 (arXiv 2410.11756). #Unjargoned #AI #ChatGPT #Shorts
- Tags: ai read a clock, ai clock test, gpt-4o clock, can ai tell time, ai mistakes, unjargoned
- Music: Fade by Snoozy Beats (CC BY 3.0) https://soundcloud.com/snoozybeats

### Short B: 1 in 8 to almost 9 in 10 (`out/Unjargoned_ClockB_v2.mp4`, 24.6 s)
- Title: AI read 1 clock in 8. A year later? Almost 9 in 10 🕐
  (Alternative from the plan: "A year ago, AI couldn't read a clock. Now? 🕐". The numbers version follows the
  winner pattern: a weird result plus a number.)
- Description: In September 2025, the best AI read about 1 clock in 8 on ClockBench, and its misses were off by about an hour. Now the best AI reads almost 9 in 10, close to people (just over 9 in 10). The test clocks are kept secret, so it can't memorise them. How AI works: How ChatGPT Actually Works. Source: ClockBench leaderboard (checked Nov 19, 2026). #Unjargoned #AI #ChatGPT #Shorts
- Tags: ai read a clock, clockbench, can ai tell time, ai getting better, ai vs humans, unjargoned
- Music: Fade by Snoozy Beats (CC BY 3.0) https://soundcloud.com/snoozybeats

Rebuild: `npx remotion render ClockA out/clock-a-video.mp4 --muted`, then
`python3 tools/mix.py shorts/clock/a --mux out/clock-a-video.mp4 out/Unjargoned_ClockA_v2.mp4` (same for B).
