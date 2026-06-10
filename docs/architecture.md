# Project Architecture

This project is an Astro 6 static devlog/blog site based on the Tone template. The architecture should stay simple: content is file-based, routes are Astro pages, visual structure is composed from Astro components and layouts, and small browser behaviors are isolated in TypeScript modules.

## Codex Documentation Convention

Codex uses `AGENTS.md` as the repository-level instruction file. Keep `AGENTS.md` short and operational. When guidance grows beyond a few rules, move it into normal repository documentation and reference it from `AGENTS.md`.

For this project:

- `AGENTS.md` contains concise Codex-facing repository expectations.
- `docs/architecture.md` is the durable architecture record.
- `.codex/config.toml` should be reserved for repo-specific Codex runtime configuration if needed later.
- `.agents/skills/<skill>/references` should be used only for reusable Codex skills, not for ordinary project architecture notes.

## Directory Responsibilities

### Root

- `astro-theme-config.ts` owns site-level content and theme configuration.
- `astro.config.mjs` owns Astro integrations and build configuration.
- `package.json` owns scripts, package manager metadata, dependency versions, and Node engine requirements.
- `AGENTS.md` owns concise Codex-facing repo instructions.
- `docs/` owns durable project documentation.

### `src/pages`

Astro route files live here. Pages should coordinate layouts, content queries, and route-level metadata. They should avoid accumulating reusable UI or browser interaction logic.

Current route groups:

- `index.astro` for the home page.
- `about.astro` for the about page.
- `search.astro` for site search.
- `posts/` for post index and post detail routes.
- `rss.xml.js` and `robots.txt.js` for generated static endpoints.
- `404.astro` for the not-found page.

### `src/layouts`

Layouts define page shells and shared structure. Keep layout responsibilities broad but not feature-heavy:

- `BaseLayout.astro` owns the common document frame.
- `PostLayout.astro` owns post-detail presentation structure.

### `src/components`

Reusable Astro components live here. Components should own markup and local presentation decisions, while shared state or browser behavior should live elsewhere.

Use components for repeated UI such as headers, footers, post feeds, comments, search surfaces, and display helpers.

### `src/scripts`

Browser-side TypeScript modules live here. Keep DOM behavior isolated by feature and mount it explicitly. Avoid embedding large inline scripts in Astro components when the behavior is reusable or testable as a standalone module.

### `src/styles`

Styles are split by responsibility:

- `global.css`, `base.css`, `elements.css`, `utilities.css`, and `prose.css` define broad site styling.
- `tokens.css` defines design tokens.
- `layouts/` contains layout-specific CSS.
- `components/` contains component-specific CSS.
- `pages/` contains page-specific CSS.

Prefer existing tokens before introducing new colors, spacing, or typography values.

### `src/content`

Blog content lives under `src/content/posts`. Content schema lives in `src/content.config.ts`. Keep post metadata aligned with the schema and prefer content-driven rendering over hard-coded post lists.

Add content helpers here only when they are close to Astro content collections:

- `post-queries.ts` should expose type-safe content collection reads. It should not hide page-specific filtering, sorting, ranking, slicing, or grouping rules.
- `post-helpers.ts` should hold small post-specific helpers such as reading-time calculation, category comparison, related-post scoring, and home-section selection helpers.

Query functions should make raw content access safer, not less transparent. Even common rules such as excluding drafts or sorting by publish date should stay visible near the route or move to an explicitly named helper when repetition becomes noisy.

### `src/utils`

Small shared utilities live here. Utilities should be framework-light and should not own page or component policy.

### `src/lib`

Cross-cutting pure logic can live here when it is not specific to Astro content collections:

- `parse.ts` for parse-don't-validate helpers around environment values, route parameters, and external inputs.
- `result.ts` only if repeated success/error handling needs a shared return shape.
- `dates.ts` for date formatting helpers that are not already covered by `FormattedDate.astro`.
- `seo.ts` for canonical URL, Open Graph, and JSON-LD preparation logic.

Do not add this directory just to create a generic abstraction. Introduce each file when at least one route or component becomes clearer by depending on parsed, typed values instead of checking raw strings or nullable values inline.

### `public`

Static assets copied directly to the output live here. Use `src/assets` for imported assets that should go through Astro/Vite processing.

## Target File Structure

The current project is small enough that a feature-sliced architecture would be too heavy. Prefer this incremental structure as pages are refactored:

```txt
src/
  content/
    posts/
    post-queries.ts
    post-helpers.ts
  components/
    home/
      HomeHero.astro
      HomeFeaturedPost.astro
      HomePostGridSection.astro
    posts/
      PostArchiveHeader.astro
      RelatedPostsSection.astro
    about/
      AboutHero.astro
      AboutProfilePanel.astro
      AboutSection.astro
  lib/
    parse.ts
    result.ts
    dates.ts
    seo.ts
  pages/
    index.astro
    about.astro
    search.astro
    posts/
      index.astro
      [...slug].astro
  scripts/
  styles/
  utils/
```

This is a target shape, not a requirement to create empty folders or placeholder files. Add files only when a real page refactor needs them.

## Page Refactor Direction

Route files should remain the integration point for each page:

- Fetch typed content entries.
- Apply visible page-level filtering, sorting, and slicing rules.
- Build simple derived values or call clearly named post helpers.
- Pass prepared props into section components.

Section components should make large page files readable without hiding product decisions. For example, `HomeHero.astro` can render selected hero posts, but the route should still make it obvious which posts were selected and why.

Post-related helpers should be named after the behavior they perform:

- Good: `getPostEntries`, `sortPostsByNewest`, `selectHomeHeroPosts`, `selectRelatedPosts`.
- Avoid: broad helpers like `getHomePageData` that hide several unrelated decisions behind one call.

Parse-don't-validate applies at boundaries. After parsing, downstream code should receive a typed value instead of repeatedly checking raw inputs. Good candidates include environment switches, route params, optional config values, and SEO metadata inputs.

## Architectural Principles

- Preserve static output unless a concrete feature requires server behavior.
- Keep route files focused on composition and data loading.
- Keep components focused on UI boundaries.
- Keep page-level product decisions visible in routes or explicitly named helpers.
- Keep browser interaction code in `src/scripts` when it is more than trivial.
- Parse external or nullable inputs once at the boundary, then pass typed values inward.
- Prefer project-wide CSS tokens over one-off values.
- Avoid adding dependencies for problems that Astro, TypeScript, or existing utilities already solve.
- Update this document when a structural decision changes how future work should be done.

## Verification Baseline

For behavior or implementation changes, run:

```bash
pnpm check
pnpm lint
pnpm lint:css
pnpm build
```

For documentation-only changes, a full build is optional unless links, generated content, or code examples changed in a way that could affect the site.
