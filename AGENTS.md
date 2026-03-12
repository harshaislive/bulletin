# AGENTS.md

## Purpose
- This repository is for developing Beforest presentation slides and related visual assets.
- Agents should treat the work as editorial presentation design first, implementation second.
- The output should feel premium, spacious, brand-led, and presentation-ready rather than app-like.
- Use this file as the operating manual for coding agents until more project-specific tooling exists.

## Repository Snapshot
- Current checked-in assets:
  - `Beforest_Brand_Colors.md`
  - `fonts/ABCArizonaFlare-Regular.woff`
  - `fonts/ABCArizonaFlare-Regular.woff2`
- Current design exploration assets:
  - `templates/index.html`
  - `templates/shared.css`
  - `templates/template-01-monograph.html`
  - `templates/template-02-split-editorial.html`
  - `templates/template-03-quiet-stat.html`
  - `templates/template-04-gallery.html`
  - `templates/template-05-closing.html`
- Current content assets:
  - `team_wise_data/` contains team-by-team monthly source content in Markdown.
  - `Team Image Library/` contains image and some video assets grouped by team or function.
- The current top-level folders are:
  - `fonts/`
  - `team_wise_data/`
  - `Team Image Library/`
  - `templates/`
- No `.cursor/rules/` directory exists.
- No `.cursorrules` file exists.
- No `.github/copilot-instructions.md` file exists.
- No package manifest, test runner, build system, or CI configuration is checked in.

## Current Commands
- Build: not available.
- Lint: not available.
- Test: not available.
- Single test file: not available.
- Single test case: not available.
- Automated formatting: not available.

## Manual Preview Workflow
- Open `templates/index.html` in a browser to review all current slide directions.
- Open any file in `templates/` directly to inspect a single concept at full size.
- Use the Markdown files in `team_wise_data/` as the source material for slide copy selection and compression.
- Use the assets in `Team Image Library/` as the primary local image bank for visual storytelling.
- Because no dev server is configured, do not claim `npm`, `pnpm`, `python`, or bundler commands exist unless they are added later.

## If Tooling Is Added Later
- Update this file immediately with exact build, lint, test, and single-test commands.
- Prefer commands backed by checked-in config, not assumptions.
- Document one real single-file test example and one real single-test-case example once a test runner exists.
- If a package manager is introduced, prefer the repo-standard command style consistently.

## Source Of Truth For Design
- Brand colors come from `Beforest_Brand_Colors.md`.
- The bundled typeface in `fonts/` is the canonical display font for headings and key editorial moments.
- Existing HTML templates define the current direction for spacing, pacing, and hierarchy.
- Team narratives come from `team_wise_data/`.
- Team photography and supporting media come from `Team Image Library/`.
- If future slide code conflicts with the brand guide, prefer the brand guide unless the user asks for a redesign.

## Content Source Structure
- Each file in `team_wise_data/` generally follows this structure:
  - team title
  - `## Activity`
  - `## Output`
  - `## Outcome`
  - `## Impact`
  - optional image references or drive links
- Treat these files as raw source material, not presentation-ready copy.
- Distill the material into fewer, stronger statements before placing it on slides.
- Prefer one idea per slide even if a source file lists many actions.
- When possible, separate operational details from higher-value strategic implications.

## Current Team Data Coverage
- Current Markdown files cover at least these teams or functions:
  - Bhopal Collective
  - Human Resources
  - Community Experience
  - Hospitality
  - Mumbai Collective
  - Hammiyala Collective
  - BI / Business Intelligence
  - Poomaale 2.0 Collective
  - Bodakonda Collective / Hyderabad
  - CD&S
  - Poomaale 1.0 Collective
  - Bewild
- Some source files may contain appended content for more than one team; verify the file before assuming it maps cleanly to a single slide sequence.
- Example: `team_wise_data/07_BI.md` currently includes a BI section and an appended Bewild section.

## Image Library Notes
- `Team Image Library/` uses team-specific folders rather than a single normalized naming scheme.
- Several folder names and files include spaces, double spaces, punctuation, unicode punctuation, or trailing spaces.
- Some folders also contain `.mp4` files in addition to still images.
- Always quote full paths when using shell commands against `Team Image Library/`.
- Do not rename or normalize asset filenames unless the user explicitly asks, because slide content may depend on the current names.
- When referencing an image from a Markdown source file, verify the exact local filename in `Team Image Library/` rather than assuming a perfect match.

## Presentation Goals
- Build slides that look like a refined editorial presentation, not a corporate template deck.
- Favor breathing room, controlled pacing, and a small amount of high-value copy.
- Each slide should make one idea feel inevitable.
- Prioritize hierarchy, rhythm, and image-like composition over dense explanation.
- Use contrast through scale, spacing, and restraint before adding decoration.

## Editorial Style Rules
- Keep slides less wordy by default; reduce copy before shrinking type.
- Let one strong headline, one supporting line, and one proof point carry the slide when possible.
- Use asymmetry intentionally; avoid overly centered, generic layouts unless the concept calls for calm symmetry.
- Treat whitespace as a design element, not leftover space.
- Build layouts that feel composed enough to export into PPT without needing redesign.
- Avoid dashboard-style clutter, heavy chrome, or generic startup pitch aesthetics.

## Typography Guidance
- Use `ABC Arizona Flare` for display moments such as titles, section openers, pull quotes, or numeric emphasis.
- Pair the display font with a restrained sans-serif stack for metadata and body copy.
- Keep headline line lengths short and editorial.
- Prefer fewer text blocks with stronger scale contrast over many similarly sized text areas.
- Avoid fake bolding or stretching the bundled font.
- If additional weights are unavailable, use size, spacing, case, and color to create hierarchy.

## Color Guidance
- Base backgrounds on Off White `#FAFAF8`, Light Sand `#E5D9CD`, Cream `#F5F0E9`, and Forest Green `#0D2620`.
- Use Primary Green `#1F4B3F` for anchors, titles, and key structural accents.
- Use Terracotta `#C17F59` sparingly for emphasis or directional highlights.
- Use Sage `#A3B5AE` and Light Gray `#E8E8E6` for quiet dividers and framing devices.
- Keep color usage disciplined; one accent per slide is usually enough.
- Avoid introducing unrelated colors unless the user explicitly requests expansion.

## Slide Composition Patterns
- Prefer 16:9 slide frames unless a task specifies another format.
- Use generous outer margins so content never feels pinned to the slide edge.
- Keep alignment systems simple and visible: one grid, one dominant axis, one focal point.
- Use section labels, folios, or small metadata to create editorial polish.
- When using statistics, show one hero number instead of many competing metrics.
- When using images later, crop boldly and let typography interact with the frame.

## Content Density Rules
- One slide should usually contain one headline and at most three short supporting points.
- Bullet lists should be rare, short, and high-signal.
- Replace paragraphs with fragments, captions, labels, or callouts whenever clarity survives.
- If copy feels crowded, split it into multiple slides instead of compressing the layout.
- Prefer silence and pause over filler text.
- When working from `Activity / Output / Outcome / Impact`, do not present all four buckets on one slide by default.
- Usually convert them into a tighter narrative such as action -> result or proof -> implication.

## HTML / CSS Implementation Guidance
- Favor simple, portable HTML and CSS that can be inspected and adapted into PPT-friendly layouts.
- Keep one file focused on one slide concept or one shared styling responsibility.
- Use CSS custom properties for brand tokens, spacing, and typographic scale.
- Use local font files via `@font-face`; do not fetch external fonts unless the user asks.
- Keep styling readable and modular; avoid deeply nested selectors or fragile overrides.
- Use semantic class names tied to layout intent such as `eyebrow`, `hero`, `kicker`, `stat`, or `caption`.
- Current templates are designed as full-viewport slide canvases, not centered card layouts.
- Preserve the full-screen slide behavior unless the user explicitly asks for a framed preview mode.

## Code Style Expectations
- Prefer clear, boring code over clever code.
- Keep modules and templates focused on one responsibility.
- Match existing naming and formatting patterns inside the same folder.
- Preserve a single newline at end of file.
- Default to ASCII unless a file already requires another character set.

## Imports And Dependencies
- If JavaScript is later introduced, group imports as standard library, third-party, internal, then local.
- Avoid wildcard imports.
- Import only what is used.
- Add the minimum dependency set necessary for the task.
- Prefer no-build solutions for early design exploration when practical.

## Formatting
- Follow any formatter config once it exists.
- Until then, use 2 spaces for HTML, CSS, JSON, and YAML.
- Keep lines readable and avoid dense attribute packing.
- Prefer trailing commas only in ecosystems that clearly expect them.
- Avoid vertical alignment that creates noisy diffs.

## Types And Data Modeling
- If scriptable slide generation is added later, prefer explicit types on exported functions and schemas.
- Model slide content with small, named structures instead of loose untyped blobs.
- Encode presentation invariants where practical, such as required title fields or allowed slide variants.
- Validate external content before rendering it into templates.

## Naming Conventions
- Name files after the slide style or responsibility they contain.
- Use descriptive class names based on role, not appearance alone.
- Prefer `template-01-monograph.html` over names like `final.html` or `new-layout.html`.
- Match the surrounding ecosystem for casing if a framework is introduced later.
- Preserve existing content and asset folder names even when they are inconsistent, because they reflect user-provided source material.

## Error Handling
- Fail loudly on missing assets, broken paths, or invalid template data.
- Include actionable error context without leaking secrets.
- Do not silently swallow rendering or export failures.
- Log once at the appropriate layer if scripts are added later.

## Testing Expectations
- There is no automated test framework yet.
- If logic is added later, add tests and document the exact commands here.
- For design-only changes without automation, provide manual verification notes in task output.
- Manual checks should include desktop review, mobile review when relevant, and local font loading.

## Documentation Expectations
- Update this file when adding tooling, workflows, exported asset conventions, or new slide system rules.
- Keep README-style docs user-facing and AGENTS docs operator-facing.
- Document non-obvious layout systems or export constraints briefly near the relevant templates.

## Asset Handling
- Preserve the font files in `fonts/`; they are core design assets.
- Keep future imagery, textures, or decorative elements in clearly named subdirectories.
- Do not overwrite user-provided assets unless explicitly asked.
- Prefer lightweight assets that are easy to move into presentation software.
- Treat `team_wise_data/` and `Team Image Library/` as user-provided source material.
- Do not rewrite source Markdown for style unless the user asks; derive slide copy in templates or new presentation files instead.
- If creating mapped slide systems later, keep explicit traceability between team Markdown, chosen proof points, and selected visuals.

## File And Directory Conventions
- Keep root clutter low.
- Put presentation explorations in `templates/` unless a different structure is introduced.
- Use `assets/` for shared visual files if the repo grows beyond the current font set.
- Add `.gitignore` entries when new tooling creates generated output.
- Keep source content in `team_wise_data/` and raw visual assets in `Team Image Library/` unless the user asks for reorganization.

## Cursor And Copilot Rules
- No Cursor rules were found in `.cursor/rules/`.
- No `.cursorrules` file was found.
- No Copilot instructions were found in `.github/copilot-instructions.md`.
- If any of these files are added later, summarize their key directives in this document.

## Bottom Line
- Today this repo is a lightweight design workspace, not an application codebase.
- Agents should optimize for elegant Beforest slide design, minimal copy, and reusable editorial templates.
- Be explicit when no command or automation exists instead of guessing.
