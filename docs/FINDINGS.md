# M0 findings — sensor and origin spike

## Device and date
- Phone model: iPhone 15
- iOS version: 26.5
- Browser: Safari (mobile)
- Date tested: 2026-09-09
- Play origin URL tested: https://dominikhilse.github.io/flip/app/

## Measured thresholds
Values below gave clean, flicker-free FLAT/NOT FLAT behaviour across the acceptance
criteria (ten flat/pickup cycles, gentle and firm set-downs, hand-on-table-next-to-phone,
table bump). Not tightly locked in — the tester noted the game feels good and can still be
tweaked within this range.

- Flat angle threshold (degrees): 7
- Still magnitude threshold (m/s²): 0.3
- Debounce duration (ms): 300

Raw gravity x/y/z observed while genuinely flat (phone lying flat on table; small offset
from true zero is expected — attributed to the camera bump tilting the resting surface
slightly):
- gravity x (flat): -0.14
- gravity y (flat): -0.20
- gravity z (flat): -9.92

## Acceptance criteria results

1. Permission prompt appears on Start tap; numbers change as phone is moved: PASS
2. Ten lay-flat / pick-up cycles give correct reading ten times, no false flips: PASS
3. Gentle and firm set-downs both settle to FLAT within a second, no flicker in the log:
   PASS
4. Hand resting on table next to phone, and a normal table bump, do not trigger NOT FLAT:
   PASS
5. **Persistence check** (fact-finding, not pass/fail): fully close Safari, reopen the same
   URL, tap Start. Does the permission prompt reappear, or does motion flow immediately?
   Answer: the permission prompt reappears every time (per-session, not persisted across a
   full Safari relaunch). Acceptable for this prototype — M3 will request permission on
   every fresh launch behind its own "Tap to start" gesture, so no game logic needs to
   special-case this.
6. **Orientation-during-lift check** (fact-finding, not pass/fail): slowly lift the phone,
   rotate 180°, set it down. Is landscape orientation (screen.orientation.type /
   deviceorientation alpha) readable and meaningful during the lifted portion?
   Answer: yes — readable and meaningful during the lift. This keeps M4 (continuous-
   rotation handoff) viable as a later spike; not committed to yet.
7. Root Pages URL shows a white page, one centred outlined button, no project-identifying
   text; tapping it loads the harness: PASS

## Overall result
PASS — all hand-checkable acceptance criteria for M0 passed on the real play origin.
Cleared to proceed to M1 (rules engine and single-rack play).
