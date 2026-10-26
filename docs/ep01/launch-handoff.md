# HANDOFF — Unjargoned Ep 1 YouTube launch

**Video:** "What Actually Happens When You Tap Your Card" (Unjargoned, Episode 1, ~8:11 long)
**Session dates:** 2026-10-21 → 2026-10-25
**Session type:** advice on publishing a finished YouTube video, plus one subtitle file fix. No code, and no git repo (`/home/user` is not a repository, so this file was not committed).

---

## 1. Files

| File | Path | Status |
|---|---|---|
| Original subtitles (v5) | `/root/.claude/uploads/a8ee60cc-7eb1-55fc-867a-78364c684348/932ea512-Unjargoned_Ep1_v5.srt` | Input from the user, not modified. Has 4 overlapping cues. |
| **Fixed subtitles (v6)** | `/home/user/Unjargoned_Ep1_v6.srt` | **Created this session. Use this one.** 212 cues, no overlaps. |
| Description | `/root/.claude/uploads/a8ee60cc-7eb1-55fc-867a-78364c684348/d2926eb4-YouTube_description.txt` | Input from the user, not modified. |
| Thumbnail | Image shared in chat (1280×720, "3 COMPANIES IN 2 SECONDS?", character + purple debit card + $4.50 reader) | Not saved to disk in this session. |
| Video file | Held by the user, not in this environment | Uploaded to YouTube as Private. |
| This handoff | `/home/user/HANDOFF.md` | — |

## 2. Commands run

The only change made in this session: shorten four cue end times to remove overlaps, then verify.

```bash
cp "/root/.claude/uploads/a8ee60cc-7eb1-55fc-867a-78364c684348/932ea512-Unjargoned_Ep1_v5.srt" /home/user/Unjargoned_Ep1_v6.srt
sed -i 's/00:00:48,293 --> 00:00:51,111/00:00:48,293 --> 00:00:51,080/; s/00:01:25,720 --> 00:01:28,537/00:01:25,720 --> 00:01:28,380/; s/00:05:51,513 --> 00:05:53,950/00:05:51,513 --> 00:05:53,833/; s/00:07:38,883 --> 00:07:41,608/00:07:38,883 --> 00:07:41,433/' /home/user/Unjargoned_Ep1_v6.srt
# then a Python check (python3 -I): parsed all timestamps, confirmed 212 cues, no cue ends after the next starts, no zero/negative-length cue
```

| Cue | Old end | New end | Overlap removed |
|---|---|---|---|
| #22 | 0:51.111 | 0:51.080 | 31 ms |
| #36 | 1:28.537 | 1:28.380 | 157 ms |
| #152 | 5:53.950 | 5:53.833 | 117 ms |
| #199 | 7:41.608 | 7:41.433 | 175 ms |

Text and all other timings are unchanged.

## 3. Decisions and recommendations

**Already checked, no change needed**
- The description's chapters match the SRT timings (0:00, 0:30, 2:26, 2:59, 3:39, 4:47, 5:00, 6:10, 7:03, 7:36). Keep them as they are.
- The CC BY 3.0 music credit ("Fade" by Snoozy Beats) is complete as written.
- The thumbnail text complements the title and doesn't repeat it. Good as it is.

**Upload settings**
- Captions: upload the **v6** SRT under Subtitles → English → Upload file → With timing.
- Audience: "No, it's not made for kids." Category: Education.
- Altered/synthetic content: "No" (animated explainer, no realistic AI people or footage).
- Add 2–3 hashtags at the end of the description, e.g. `#Unjargoned #HowItWorks #Payments`.
- Tags (low priority): contactless payment, NFC, how card payments work, Visa Mastercard explained, pending transaction.
- Create an "Unjargoned" playlist and add Ep 1.
- Pinned comment: "What tech do you use every day but have no idea how it works? Most-requested topic becomes Episode 2 👇"
- Optional: use Test & Compare to try a second thumbnail, e.g. one built around "The money hasn't moved yet".

**Publish timing**
- Upload as Private, finish all settings, then schedule for **about 12:00 PM Eastern** (9 AM Pacific, roughly 9:30 PM in India). Don't publish before HD processing finishes.
- For a first video the exact hour matters little. Later, use Analytics → Audience → "When your viewers are on YouTube" to choose times.

**End screen**
- Don't use "Import from video", since there's no earlier video to copy from.
- Add one **Subscribe** element from about **8:01** (start of the subscribe call to action) to the end. Make sure it doesn't cover important visuals.
- Skip the Video element until Ep 2 exists, then add "Best for viewer". From then on, "Import from video" can copy the layout.

**Description links blocked (advanced features review)**
- YouTube won't save description links until advanced features are approved.
- Option A: wait for approval (usually about 24 hours) and then use the original description.
- Option B: publish now with a text-only credit and put the links back after approval:
  ```
  Music: "Fade" by Snoozy Beats (SoundCloud: snoozybeats)
  License: Creative Commons Attribution 3.0 (CC BY 3.0)
  Music promoted by Audio Library
  ```

**Hindi**
- Subtitles: recommended. Write a proper translation rather than relying on auto-translate. Recommended style: conversational Hindi that keeps English tech terms (NFC, token, card network, bank). Also add a Hindi title and description. **Waiting on the user** to approve and choose a style.
- Dubbed audio: not yet. It may not be available to a new channel (check Studio → Languages). Revisit if India is a large share of views in Analytics → Audience → Top geographies.

**Shorts**

| # | Short | Cut | Length | Tool |
|---|---|---|---|---|
| 1 | "Your money hasn't moved yet" | 0:00–0:24 + 5:00–5:47 | ~70s | External editor (needs two segments) |
| 2 | "Can someone steal your card by walking past?" | **7:03.7–7:35.8** | ~32s | YouTube "Edit into a Short" |
| 3 | "Payment failed but money's gone?" | **6:23.6–7:02.2** | ~39s | YouTube "Edit into a Short" |
| 4 | "Your bank is a bouncer" | 3:58–4:27 | ~29s | Either |
| 5 (optional) | Coat-check token analogy | 1:54–2:25 | ~30s | Either |

- Tools: re-export vertical from the original project if possible. Otherwise use CapCut, or **VN Editor / DaVinci Resolve in India** (CapCut is banned there). YouTube's Remix → Edit into a Short works for #2 and #3 only.
- For #2 and #3 in YouTube's editor, use the **fit** layout, since zoom-to-fill would crop off the character or the reader. Put the hook text in the top bar:
  - #2: "Can someone steal your card by walking past? 🤔"
  - #3: "Payment failed but money's gone?! 😱"
- Burned-in captions perform better, and YouTube's editor can't do them.
- Schedule: #3 first, 1–2 days after the main video, then #2 two or three days later, then the rest every 2–3 days. Each Short links back to Ep 1 via Related video.

## 4. Status as of the last message

Confirmed by the user:
- [x] Video uploaded as **Private**
- [x] HD and SD processing complete

**Not confirmed. Check these in YouTube Studio:**
- [ ] Description saved (with links, or the text-only music credit)
- [ ] v6 English SRT uploaded
- [ ] End screen saved (Subscribe from about 8:01)
- [ ] "Not made for kids" selected
- [ ] Advanced features review result
- [ ] Whether the video was scheduled or published, and when
- [ ] Pinned comment, playlist, hashtags

## 5. Open issues
1. **Advanced features review is pending**, which blocks links in the description. If the text-only credit was used, put the links back after approval.
2. **Hindi subtitles** are waiting on the user to approve them and choose a style.
3. **Original video project tool unknown.** The user hasn't said what the video was made in, which decides how to make vertical Shorts.
4. Whether the user is in the US or India is unclear (they said "10 am in US"; the script mentions rupees). This affects the CapCut choice and audience timing.
5. Nothing from this session lives in a git repo. The v6 SRT and this file are only in `/home/user` on a temporary cloud container, so **download them**.

## 6. Next steps
1. Finish the unchecked items in section 4, then schedule or publish.
2. After it goes live: pin the comment and add the video to the playlist.
3. Day +1–2: post Short #3 (Edit into a Short, 6:23.6–7:02.2).
4. Day +3–5: post Short #2 (7:03.7–7:35.8).
5. Make Shorts #1 and #4 in an external editor, vertical with burned-in captions, every 2–3 days after that.
6. If Hindi is approved: translate the v6 SRT (keeping timings) and add a Hindi title and description.
7. After a few weeks: check Analytics for top geographies (to decide on a Hindi dub) and viewer active times.
8. When Ep 2 is out: add a "Best for viewer" Video element to Ep 1's end screen, and import the end screen layout into Ep 2.
