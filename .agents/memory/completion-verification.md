---
name: PRD completion verification
description: Defines the evidence required before calling the NGO frontend complete.
---

Do not call this product complete based only on route coverage or visual polish. Verify every frontend PRD requirement in an explicit matrix, run the matrix as an executable audit, and inspect both desktop and mobile previews after a clean restart.

**Why:** Earlier delivery claims missed decorative controls and a severe mobile layout regression even though the app typechecked and all routes rendered.

**How to apply:** For future feature work, update and run the PRD audit, typecheck, restart the artifact workflow, inspect clean browser logs, and capture relevant desktop and mobile screens before reporting completion.