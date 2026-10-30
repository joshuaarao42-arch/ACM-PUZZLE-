# Cipher Breach

A mini hacking mission for the **ACM USTP CDO** website. A message from deep space is locked behind a Caesar cipher. Decode it to unlock the next page.

## The Puzzle

Every letter in the message is shifted forward by a secret number. For example, with a shift of 3, `A` becomes `D`, so `JOIN` becomes `MRLQ`. To break the cipher, shift each letter back by the same number.

Use the **cipher wheel** to test shifts, type the decoded message, and press **DECRYPT**.

| Sector | Level     | Challenge                          |
|--------|-----------|------------------------------------|
| 1      | Cadet     | Shift is given in the hint         |
| 2      | Navigator | Shift is hinted with a riddle      |
| 3      | Pilot     | Halfway around the alphabet        |
| 4      | Commander | No shift given, find it from a clue |
| 5      | Admiral   | Solve the shift, then the message  |

Correct answer: **ACCESS GRANTED** and **PROCEED TO NEXT PAGE** appears.
Wrong answer: **ACCESS DENIED**.

## Run It

Open `index.html` in any browser. No install, backend, or login needed.

## Customize

- **Puzzles:** edit the `PUZZLES` list in `script.js`. Set a `plain` message and a `shift`, and the encrypted text is generated for you.
- **Real next page:** set `FINAL_PAGE_URL` in `script.js`.
- **Colors:** change the variables at the top of `style.css`.

Built with HTML, CSS, and vanilla JavaScript.
