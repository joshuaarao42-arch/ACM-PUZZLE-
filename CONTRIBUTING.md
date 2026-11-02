# Contributing to Cipher Breach (ACM-PUZZLE-)

Thanks for improving this browser-based Caesar cipher challenge created for the ACM USTP CDO website.

## Set up the project
```bash
git clone https://github.com/joshuaarao42-arch/ACM-PUZZLE-.git
cd ACM-PUZZLE-
```
Open `index.html` in a modern browser. No backend installation is required for the documented game flow.

## Contribution areas
- Caesar cipher puzzle wording, hints, and difficulty progression.
- Cipher wheel behavior and answer validation.
- Feedback for correct and incorrect answers.
- Responsive layout and keyboard accessibility.
- Clear separation between puzzle content and game logic in `script.js`.

## Puzzle correctness checks
- Verify encryption and decryption with several shift values, including zero and shifts that wrap around the alphabet.
- Check uppercase and lowercase handling and the treatment of spaces and punctuation.
- Confirm that every hint supports the intended puzzle without accidentally revealing unrelated answers.
- Test all five sectors from the first level through the final success state.
- Ensure the final destination setting is intentional and does not redirect users to an untrusted page.

## Pull requests
Use branches such as `feature/new-cipher-hint` or `fix/wheel-keyboard-control`. Include the test messages and shift values used, plus screenshots for visual changes.
