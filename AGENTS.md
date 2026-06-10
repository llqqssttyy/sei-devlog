# AGENTS.md

## Repository Expectations

- Use `pnpm` for package management.
- Keep durable project architecture notes in `docs/architecture.md`.
- Keep this file concise; move detailed topic notes into `docs/` and link them here.
- Prefer small, focused changes that preserve the Astro static-site architecture.

## Project Shape

- This is an Astro 6 static devlog/blog site.
- Content entries live under `src/content/posts`.
- Page routes live under `src/pages`.
- Reusable Astro UI lives under `src/components`.
- Shared layouts live under `src/layouts`.
- Browser-side behavior lives under `src/scripts`.
- Styling is organized under `src/styles`, with tokens in `src/styles/tokens.css`.
- Site-level configuration lives in `astro-theme-config.ts`.

## Verification

Run the relevant checks after edits:

- `pnpm check`
- `pnpm lint`
- `pnpm lint:css`
- `pnpm build`

Use a narrower subset only when the change is clearly documentation-only.
