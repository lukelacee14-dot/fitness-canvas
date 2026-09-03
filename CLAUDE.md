# Project Rules — Fitness Canvas App

## Scope restriction
- ONLY read, create, or modify files inside this "fitness-canvas" folder.
- NEVER access, reference, or modify any file or folder outside "fitness-canvas" in this workspace, even if asked to indirectly.
- If a task seems to require going outside this folder, stop and ask first.

## Project concept
A modular, fully customizable fitness tracker. The app starts blank with a "+" button that lets the user add self-contained modules (workout logger, meal tracker, program builder/digital PT, etc.). Navigation is tab-based: the bottom bar holds one tab icon per added tool, in the order added, with the "+" button pinned at the far right end (never scrolls off-screen). Only one tool is shown at a time, full-screen — tapping a tab switches the main screen to that tool. Adding a tool from the picker appends a new tab and switches to it immediately. Press-and-hold a tab to remove it (with a lightweight confirm step); if the removed tab was active, the screen falls back to the blank grey canvas. It should work as a single-purpose tool or a full all-in-one system depending on what the user adds.

## Tech stack
- Plain HTML, CSS, and JavaScript — no framework, no build step.
- Data persistence via localStorage for now.
- Structured for future PWA support (manifest.json + service worker already scaffolded).
- Must remain deployable to Vercel as a static site with zero config.

## Workflow
- After completing a change, commit it with a clear, concise commit message.
- Push to this project's own GitHub repo (origin) after committing, unless told not to.
- Do not install new dependencies or introduce a build step without asking first.
- Keep each module's code cleanly separated so new modules are easy to add later.
