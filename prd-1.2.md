# Product Requirements Document (PRD) - Release 1.2

Release 1.2 introduces user session management and persistent access to generated Figma files.

## Goals

- Maintain user sessions across browser reloads.
- Store generated Figma files per session.
- Provide a history view listing all past sessions and their downloadable specs.

## Features

1. **Session Persistence** – Implement server-side storage of session identifiers and associated files.
2. **Session History UI** – Display a list of previous runs with download links for their Figma archives.
3. **Cleanup Strategy** – Define how long session data is retained.
