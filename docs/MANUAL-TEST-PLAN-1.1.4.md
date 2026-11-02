# Manual Test Plan 1.1.4

1. Open the Aquatic Ecology dashboard as a GM.
2. Select **Generate research books** in a world where all Journal operations can succeed.
3. Confirm the progress window reaches 100%, closes automatically, and the dashboard refreshes.
4. Force one Journal creation or update to fail while another book can still succeed.
5. Confirm later books continue processing.
6. Confirm the progress window remains open, is brought to the foreground, and lists the failed book and error.
7. Confirm no success-only notification appears and the dashboard does not rerender over the failure report.
8. Close the retained failure window manually after reviewing it.
