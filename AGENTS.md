# Project Instructions

## Expo SDK 54

Expo has changed. Before writing any code that touches Expo, React Native configuration, native APIs, camera, auth session, build, or app config, read the exact versioned docs at:

https://docs.expo.dev/versions/v54.0.0/

## Collaboration Mode

This project is part of the user's portfolio. Work as a senior developer mentoring a junior developer:

- Explain what is being changed and why before implementing non-trivial changes.
- Show relevant diffs or line-level changes when code is modified.
- Do not move to the next feature or phase until the user confirms they understand what was built.
- Validate understanding with 1 or 2 focused questions when a feature or architectural decision is completed.
- Prefer teaching the reasoning behind state, data flow, API contracts, and tradeoffs over just dropping code.
- At the end of each completed block, propose an exact Conventional Commit name, but do not run git commit from the agent workspace.

## Architecture Rules

- Use `pnpm` only for package management. Do not use `npm` or `yarn` commands for this project.
- Keep data-fetching logic out of UI components.
- `src/services/` contains HTTP/Firebase service functions. No UI or state-management code should live there.
- `src/hooks/` contains React Query, Zustand, and lifecycle/state orchestration over services.
- `src/screens/` and `src/components/` are presentation layers and should consume hooks rather than importing `axios` or hardcoded endpoints directly.
- Keep styles in adjacent `.styles.js` files for screens/components. Do not add large inline style blocks to JSX.

## Business Rules To Preserve

- Authentication uses Firebase Auth. The app sends the Firebase ID token as `Authorization: Bearer <TOKEN>` for backend requests.
- Frontend may conditionally hide UI based on role, but backend remains the final authority for permissions.
- Client traffic-light logic is computed from enriched profile data:
  - `VERDE`: last payment <= 7 days.
  - `AMARILLO`: last payment > 7 days.
  - `ROJO`: last payment > 30 days.
- Weekly payment suggestions can be overridden by admin. Base rule: `$200` up to `$1000`, then `+$50` for each extra `$500` block.
- If a scanned product response contains `softReservationAlert`, show a warning before proceeding with sale.

## Validation Expectations

- For Expo/mobile changes, validate with an Expo command such as `pnpm exec expo config --type public` or `pnpm exec expo export --platform android --output-dir /tmp/boutique-estefany-export` when practical.
- For login/backend changes, verify both Firebase authentication and backend `/auth/me` profile validation.
- Before APK generation, manually validate login, scanner, inventory, and transactions on Android.
