# M0 findings — sensor and origin spike

Fill this in by hand while testing on the real play origin (GitHub Pages URL), on the
actual phone. Do not fill in numbers you have not observed.

## Device and date
- Phone model:
- iOS version:
- Browser: Safari (mobile)
- Date tested:
- Play origin URL tested:

## Measured thresholds
Record the slider values that gave clean, flicker-free FLAT/NOT FLAT behaviour across the
acceptance criteria (ten flat/pickup cycles, gentle and firm set-downs, hand-on-table-next-
to-phone, table bump).

- Flat angle threshold (degrees):
- Still magnitude threshold (m/s²):
- Debounce duration (ms):

Also note the raw gravity x/y/z values observed while genuinely flat, for reference:
- gravity x (flat):
- gravity y (flat):
- gravity z (flat):

## Acceptance criteria results

1. Permission prompt appears on Start tap; numbers change as phone is moved: PASS / FAIL —
   notes:
2. Ten lay-flat / pick-up cycles give correct reading ten times, no false flips: PASS / FAIL —
   notes:
3. Gentle and firm set-downs both settle to FLAT within a second, no flicker in the log:
   PASS / FAIL — notes:
4. Hand resting on table next to phone, and a normal table bump, do not trigger NOT FLAT:
   PASS / FAIL — notes:
5. **Persistence check** (fact-finding, not pass/fail): fully close Safari, reopen the same
   URL, tap Start. Does the permission prompt reappear, or does motion flow immediately?
   Answer:
6. **Orientation-during-lift check** (fact-finding, not pass/fail): slowly lift the phone,
   rotate 180°, set it down. Is landscape orientation (screen.orientation.type /
   deviceorientation alpha) readable and meaningful during the lifted portion?
   Answer:
7. Root Pages URL shows a white page, one centred outlined button, no project-identifying
   text; tapping it loads the harness: PASS / FAIL — notes:

## Overall result
PASS / STOP — if STOP, state the exact stop condition hit (see plan §M0 "Stop conditions")
and the observed behaviour, without attempting a workaround.
