## Final Frontend Cleanup Before Freeze

### 1. Clean up `src/routes/__root.tsx` head metadata
Remove these 5 duplicate/leftover meta entries (lines 96–100):
- `name: "description"` containing "Schedule Harmony is a React/TypeScript application..."
- `property: "og:description"` containing "Schedule Harmony is a React/TypeScript application..."
- `name: "twitter:description"` containing "Schedule Harmony is a React/TypeScript application..."
- `property: "og:image"` with Lovable preview image URL
- `name: "twitter:image"` with Lovable preview image URL

Keep the SchedlyOps entries above them (title, description, og:title, og:description, og:type, twitter:card, twitter:title).

### 2. Rename `package.json` `name`
Change `"name": "tanstack_start_ts"` to `"name": "schedlyops"`.

### 3. Verification
Run typecheck, lint, check:secrets, test, and build to confirm all checks pass.

No UI changes, no provider/route/component/config/test refactors.