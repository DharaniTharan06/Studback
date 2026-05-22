# Studback frontend

Next.js 16 App Router, React 19, strict TypeScript, Tailwind 4, shadcn-style Radix primitives, TanStack Query 5, Zustand, React Hook Form, Zod, Axios, and Lucide.

## Run locally

From this directory:

```powershell
npm install
Copy-Item .env.example .env.local
npm run dev
```

Open http://localhost:3000. Start the existing Express backend from the repository root with `npm run dev` at http://localhost:5000. Set the server-only `BACKEND_API_URL` in `.env.local` if your backend uses another address. MongoDB and Cloudinary remain configured in the backend’s environment. Never copy those secrets into frontend environment variables.

The browser uses the same-origin `/api/backend` proxy. For direct credentialed backend requests, set `CORS_ORIGIN=http://localhost:3000`; a missing or wildcard value defaults to this explicit local origin because browsers reject wildcard origins with credentials. Restart the backend after changing its environment. Set an explicit deployed frontend origin in production.

The frontend can render its shell and authentication pages without the backend. Authenticated content needs a working backend and MongoDB connection. During implementation, the configured MongoDB SRV hostname failed DNS resolution, so live account and upload verification could not be completed.

## Architecture

- `src/app`: Server Component route entries, layouts, metadata, loading and error boundaries, and the API proxy.
- `src/features`: Feature-specific components, schemas, types, and query keys.
- `src/components/ui`: Accessible, styled Radix dialog, dropdown, tooltip, button, and keyboard-operated tab primitives.
- `src/components/layout`: Responsive shell, desktop sidebar, mobile navigation, account and appearance controls.
- `src/lib/api`: Axios transport, normalized errors, and shared-promise session refresh.
- `src/stores/player.ts`: Client-only player preferences. Server state belongs to TanStack Query.

The browser calls `/api/backend/*`. The Next.js Route Handler forwards only supported backend routes, validates the origin of writes, streams request bodies, preserves HTTP-only cookies, and strips token fields from login and refresh JSON. Production cookies retain `Secure`; local development removes only that attribute to support HTTP loopback. Production must run behind HTTPS. No authentication tokens or profile data are persisted in browser storage.

## Two intentional themes

Semantic variables in `src/app/globals.css` define independent light and dark palettes. Warm off-white surfaces and darker indigo accents define light mode; layered charcoal surfaces and softer lavender accents define dark mode. Components use semantic colors, including overlays and media controls.

`next-themes` applies the preference before rendering. The shell offers Light, Dark, and System options; `studback-theme-v1` is the only stored browser preference. System changes and cross-tab theme synchronization are supported. Hydration-sensitive controls render a stable server state. Short color transitions occur on manual changes and respect reduced-motion preferences.

The sidebar uses shadcn ScrollArea with a bounded navigation region and a separate, always-visible collapse control. Mobile navigation uses a shadcn Sheet with focus restoration and its own scroll area. Slim rounded scrollbars use semantic tokens in both themes; native page and dialog scrollbars are also styled. Short-screen browser tests verify that lower navigation links stay reachable.

## Implemented routes

| Route                                            | Experience                                                                                                      |
| ------------------------------------------------ | --------------------------------------------------------------------------------------------------------------- |
| `/`, `/search?q=…`                               | Published feed, backend-supported sorting, search, pagination                                                   |
| `/login`, `/register`                            | Validated authentication and image previews                                                                     |
| `/watch/:id`                                     | Playback, volume, seeking, speed, fullscreen, theater, comments, likes, subscriptions, sharing, playlist saving |
| `/c/:username`                                   | Channel identity, videos, playlists, community                                                                  |
| `/subscriptions`, `/tweets`                      | Followed channels and community posts from your circle                                                          |
| `/history`, `/liked-videos`                      | Backend watch-history and liked-video library                                                                   |
| `/playlists`, `/playlist/:id`                    | Create, update, delete, save/remove, playback queue                                                             |
| `/studio`, `/studio/content`, `/studio/audience` | Actual creator totals, video editing, visibility, deletion, subscribers                                         |
| `/studio/upload`                                 | Video/thumbnail validation, previews, upload progress, publishing                                               |
| `/settings`                                      | Profile, branding, and password management                                                                      |

Upload progress describes the browser’s file transfer. Once transfer finishes, a separate processing state is shown; the backend does not expose Cloudinary processing percentages. Videos are published on creation and can be made private in Studio.

## Existing backend limits

- The published feed returns creator IDs without populated names or avatars. Cards show a neutral creator fallback and link to the watch page, which supplies the creator username. No identity or verification status is invented.
- There is no owner-filtered public video endpoint. Channel videos filter the actual paginated published feed; the user can scan additional pages. A backend owner filter would make this more efficient.
- There is no global tweet feed, recommendation algorithm, notifications API, playlist reordering, comment threading, captions, or adaptive playback-quality API. Community combines actual user/channel post endpoints; related videos come from the published feed. Unsupported controls are omitted.
- Watch history is read from the existing endpoint. The backend currently does not append watched videos or provide watch timestamps, so the frontend does not fabricate history or group it by watch date.
- Existing video retrieval increments views. Its query does not automatically refetch on focus or retry, preventing incidental extra increments.

## Verification

```powershell
npm run typecheck
npm run lint
npm test
npm run build
# With the frontend running:
npm run test:e2e
```

Playwright uses installed Chrome by default. For another environment, configure `channel` in `playwright.config.ts`, or install Playwright Chromium and remove that option.

Unit/integration tests cover refresh-cookie rotation, concurrent 401 handling, refresh failures and loop prevention, route allowlisting, write-origin validation, token redaction, failure normalization, and WCAG AA text contrast in both themes.

Browser tests use isolated, clearly named fixtures in `tests/e2e`, never application data. They exercise major routes in both themes, desktop/tablet/320px/390px layouts, theme persistence and system changes, first-paint theme selection, keyboard navigation, component states, authentication forms, comments, likes, subscriptions, playlists, uploads, content actions, session recovery, and playback using an offline WebM fixture. Screenshots and traces are saved under ignored `test-results/`.

The small `tests/fixtures/playback.webm` is committed so tests have no remote-media dependency. Its optional regeneration script requires Pillow and Playwright’s FFmpeg helper; neither is required to run the application or tests.

## Backend correction

The refresh controller now aliases the actual `refreshtoken` returned by `generateTokens`, fixing the previously undefined refresh cookie. Utility import casing also matches the filenames for case-sensitive hosts. An integration regression test covers rotation.
