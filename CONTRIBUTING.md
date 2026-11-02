# Contributing to Cipher Breach (ACM-PUZZLE-)

This browser-based ACM USTP CDO mini-game challenges players to decode messages using a Caesar cipher.

## Clone and run
```bash
git clone https://github.com/joshuaarao42-arch/ACM-PUZZLE-.git
cd ACM-PUZZLE-
```
Open `index.html` in a modern browser.

## Project-specific contributions
- Puzzle wording, hints, and difficulty progression across the five sectors.
- Caesar cipher logic, cipher wheel, and answer validation.
- Correct/incorrect feedback and final success behavior.
- Responsive layout and keyboard accessibility.

## Cipher and gameplay checks
Test several shifts, including zero and alphabet wraparound. Check uppercase/lowercase, spaces, and punctuation. Play all five sectors from start to finish and verify every expected answer and hint. Ensure any final destination URL is intentional and trusted.

Use branches such as `feature/new-cipher-hint` or `fix/wheel-keyboard-control`. Include test messages, shift values, and screenshots when relevant.
