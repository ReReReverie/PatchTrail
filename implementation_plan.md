# Implementation Plan - PatchTrail (TraceForge)

**PatchTrail** is an engineering workspace designed to close the gap between project discussions, bug investigation, and Git version history. It enables developers to extract tasks from unstructured transcripts, run automated bug analyses, and trace/restore previous project states with safe, guided Git terminal commands.

---

## User Review Required

> [!IMPORTANT]
> **Key Architecture Decisions**
> 1. **Vite + React + TypeScript + CSS Modules / Vanilla CSS**: We will build the app using Vite. To provide real-time repository information, we will embed a custom backend API middleware directly inside the Vite dev server (`vite.config.ts`). This allows reading the workspace's *actual* Git history without spinning up a separate backend server.
> 2. **Execution Context**: The tool will read from the current workspace's Git repository. If no commits or Git history exist (e.g., in a clean directory), it will gracefully fall back to a rich, pre-loaded simulated repository database to showcase its features seamlessly.
> 3. **Action Safety**: In line with the requirements, the Git recovery mechanism will not run destructive Git commands directly on the user's files. Instead, it will provide interactive, parameterized terminal commands (e.g., `git switch -c recovery/<short-hash> <commit-hash>`) that users can copy and run in their IDE/workspace terminal.

---

## Open Questions

> [!NOTE]
> **None at this stage**. The workflow covers:
> - User input of meeting/issue text.
> - Client-side AI-simulation or API call mock for bug analysis (allowing instant interactive feedback).
> - Copy-to-clipboard for Git commands.
> 
> If you have any specific aesthetic preferences (e.g., adding a terminal simulator within the web UI to show what *would* happen), let us know!

---

## Proposed Changes

We will initialize a new React project in the current workspace directory.

### Build and Config Setup

#### [NEW] [vite.config.ts](file:///C:/Users/LANZ%20MARTENE%20GUIAB/Documents/antigravity/charming-oppenheimer/vite.config.ts)
Contains Vite configuration, React plugin, and a custom dev server middleware to expose Git commands:
- `/api/git/log`: Executes `git log --oneline --decorate -n 20` and returns structured JSON (commit message, author, timestamp, hash, files modified).
- `/api/git/diff`: Fetches diff information for a given commit hash.
- `/api/git/status`: Exposes current working tree status.

#### [NEW] [package.json](file:///C:/Users/LANZ%20MARTENE%20GUIAB/Documents/antigravity/charming-oppenheimer/package.json)
Standard React + TypeScript + Vite project configuration. Includes `lucide-react` for premium UI icons.

---

### Core Design System & Global Styles

#### [NEW] [src/index.css](file:///C:/Users/LANZ%20MARTENE%20GUIAB/Documents/antigravity/charming-oppenheimer/src/index.css)
Declares custom CSS design tokens:
- **Colors**: Slate/Indigo/Teal/Rose dark mode theme.
  - Background: HSL `224 25% 6%`
  - Card/Glass: HSL `224 25% 10% / 0.7`
  - Border: HSL `224 20% 20%`
  - Accent Indigo (AI): HSL `250 85% 65%`
  - Accent Emerald (Git/Success): HSL `160 85% 45%`
  - Accent Coral (Alert/Destructive): HSL `350 85% 60%`
  - Text Primary: HSL `210 40% 98%`
  - Text Secondary: HSL `215 20% 65%`
- **Transitions**: Sleek `0.25s cubic-bezier(0.4, 0, 0.2, 1)` for all interactions.
- **Effects**: Backdrop filter blur, glowing borders, custom glass panels.

---

### Application Logic & UI Components

#### [NEW] [src/App.tsx](file:///C:/Users/LANZ%20MARTENE%20GUIAB/Documents/antigravity/charming-oppenheimer/src/App.tsx)
Main dashboard container. Orchestrates the state between all features and splits the layout into three panels:
- **Left Panel**: Meeting-to-Tasks & Task Board.
- **Center Panel**: Bug Detective (Code editor, analysis, suggested diffs, generated tests).
- **Right Panel**: Codebase Time Machine (Interactive vertical timeline of commits, command helper, recovery guide).

#### [NEW] [src/components/TaskBoard.tsx](file:///C:/Users/LANZ%20MARTENE%20GUIAB/Documents/antigravity/charming-oppenheimer/src/components/TaskBoard.tsx)
Handles parsing meeting transcript input using pre-set templates or user input.
- Animates task extraction step-by-step.
- Renders task cards displaying status, priority badge (editable via dropdown), and owner.
- Selecting a task passes its context to the Bug Detective.

#### [NEW] [src/components/BugDetective.tsx](file:///C:/Users/LANZ%20MARTENE%20GUIAB/Documents/antigravity/charming-oppenheimer/src/components/BugDetective.tsx)
The AI analysis sandbox.
- Standard Code-Viewer interface showing file pathways.
- "Analyze Bug" action triggering loading states, confidence metrics, and summary.
- Displays color-coded diff view (green/red line annotations).
- Lists regression tests with copy buttons.

#### [NEW] [src/components/TimeMachine.tsx](file:///C:/Users/LANZ%20MARTENE%20GUIAB/Documents/antigravity/charming-oppenheimer/src/components/TimeMachine.tsx)
Vertical Git timeline.
- Visual line connecting Git commits (real or simulated).
- On click: slide-out drawer revealing commit details, modified files list.
- **Terminal Helper Box**: Presents copyable CLI commands for safe workspace recovery:
  - **Explore Commit**: `git switch --detach <hash>` (with warnings).
  - **Branch Recovery (Recommended)**: `git switch -c recovery/<short-hash> <commit-hash>`.
  - **Single File Restore**: `git restore --source=<commit-hash> -- <file_path>`.
  - **Destructive Revert**: `git reset --hard <commit-hash>` (red highlighted warning block).

---

## Verification Plan

### Automated Tests
- Since the workspace is a brand-new project, verification will focus on compilation and build success:
  ```bash
  npm run build
  ```

### Manual Verification
- Launch the development server:
  ```bash
  npm run dev
  ```
- Open in the browser and verify:
  1. Paste a meeting transcript, verify task card generation.
  2. Modify a card's priority and owner.
  3. Run the Bug Detective on a generated task and review the mock diff output.
  4. Select commits from the Codebase Time Machine, copy commands, and confirm command formatting.
  5. Check visual layouts on multiple device viewports.
