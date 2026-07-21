# Cuttle

Cuttle is a local-first desktop GUI that turns messy bug reports, transcripts, and stack traces into actionable tasks, reviewable fixes, regression tests, and safer Git recovery steps.

## Project description

Cuttle is a local-first desktop workspace for turning messy engineering context into reviewed action. A developer pastes or imports a meeting transcript, ticket, stack trace, or bug report; Cuttle extracts actionable tasks with owners, priorities, target files, and statuses. Selecting a task opens Bug Detective, which presents a deterministic root-cause explanation, a reviewable before/after diff, and regression-test stubs. Git History is an optional time-machine drawer backed by the selected repository's real local history. Recovery commands are parameterized and copy-only, with hard reset visibly marked destructive. The app works offline by default, optionally supports local open-source models, OpenAI, Gemini, and Grok for richer analysis, follows the system theme, and never changes repository files automatically.

## Table of contents

- [Project description](#project-description)
- [Judge quick start](#judge-quick-start)
- [Current capabilities](#current-capabilities)
- [Safety and product rules](#safety-and-product-rules)
- [AI providers](#ai-providers)
  - [AI provider setup](#ai-provider-setup)
- [Supported platforms](#supported-platforms)
- [Installation and development](#installation-and-development)
- [Hackathon submission](#hackathon-submission)
  - [How Codex and GPT-5.6 Luna were used](#how-codex-and-gpt-56-luna-were-used)
  - [Developer note](#developer-note)

## Judge quick start

No rebuild is required. Download the latest [Cuttle GitHub Release](https://github.com/ReReReverie/Cuttle/releases/latest) and choose the package for the judge's machine:

| Judge machine | Download | Launch |
|---|---|---|
| Windows 10/11 x64 | Cuttle-v<version>-windows-x64-portable.zip | Extract and run Cuttle.exe |
| macOS Apple Silicon | Cuttle-v<version>-macos-arm64.dmg | Drag Cuttle to Applications |
| macOS Intel | Cuttle-v<version>-macos-x64.dmg | Drag Cuttle to Applications |
| Linux x64 | Cuttle-v<version>-linux-x64-appimage.AppImage | Make executable, then run |
| Ubuntu/Debian x64 | Cuttle-v<version>-linux-x64-deb.deb | Install with the system package manager |

The offline demo requires no account, API key, network connection, Node.js, or Rust installation. The application does not modify the selected repository, and every Git recovery command is copy-only.

Use [release/JUDGE_TESTING.md](release/JUDGE_TESTING.md) for the two-minute acceptance checklist and platform launch notes.

## Current capabilities

- Deterministic, offline extraction of tasks from pasted engineering context or imported text files
- Editable priority, owner, and status
- Reviewable patch diff with plain-English root-cause guidance
- Copyable regression-test stubs
- Isolated patch verification in a temporary Git worktree, with available project tests and builds
- Native folder picker and Rust-backed Git history for a selected repository
- Safe branch, detached exploration, and single-file recovery commands
- Clearly separated hard-reset command with a destructive warning
- Persistent system/dark/light theme preference
- Collapsible workspace activity ledger

No Git recovery command runs automatically. Approving a suggested fix currently completes the task and records the review; it does not modify repository files.

## Safety and product rules

- The main flow is paste context -> identify bug -> review fix -> approve.
- Advanced features such as Git History remain optional and hidden behind focused buttons.
- Do not display a numeric confidence score.
- Review patches before applying them.
- Never execute `git reset --hard` from the application.
- Never send `.env`, credentials, or unrelated files to an AI provider.
- Keep mock/offline mode for demos and tests.

## AI providers

Cuttle works without AI credentials in **Offline demo** mode. Bug Detective can also use one of four user-controlled providers:

| Provider | Default model | Account or key | Network behavior |
| --- | --- | --- | --- |
| Local open-source | `gpt-oss:20b` | None by default | Loopback-only Ollama or LM Studio server |
| OpenAI API | `gpt-5.6-sol` | OpenAI Platform API key | Fixed `api.openai.com` endpoint |
| Gemini API | `gemini-3.5-flash` | Google AI Studio API key | Fixed Google Generative Language endpoint |
| Grok API | `grok-4.5` | xAI API key | Fixed `api.x.ai` endpoint |

Provider keys, local tokens, model names, and the local server URL are held in application memory only and are cleared when Cuttle closes. They are never written to localStorage or repository files. Cloud requests contain only the selected task title, description, and target-file path. Cuttle does not scrape consumer chat sites or reuse browser sessions.

The local provider accepts OpenAI-compatible `/v1/chat/completions` servers on `localhost`, `127.0.0.1`, or `::1`. Remote custom hosts, embedded URL credentials, query strings, fragments, and HTTP redirects are rejected by the Rust backend.

### AI provider setup

Open **AI provider** in the top-right corner and choose a mode. The popup displays the matching checklist, model field, credential field, and a copyable official setup page.

#### Local open-source model with Ollama

1. Install [Ollama](https://ollama.com/download) on Windows, macOS, or Linux.
2. Pull a model, for example `ollama pull gpt-oss:20b`.
3. Keep Ollama running. Its OpenAI-compatible URL is normally `http://127.0.0.1:11434/v1`.
4. Choose **Local open-source**, enter the exact pulled model name, and analyze a task. No token is required for Ollama's default local configuration.

LM Studio is also supported: load a model, start the local server in its Developer tab, and use `http://127.0.0.1:1234/v1`. If LM Studio authentication is enabled, paste its local server token into the optional token field.

#### OpenAI API

1. Create a key at [OpenAI Platform](https://platform.openai.com/api-keys) and configure API billing.
2. Choose **OpenAI API**, paste the key, and confirm the model available to the account.
3. ChatGPT subscriptions and API billing are separate; Cuttle does not use ChatGPT cookies or sessions.

#### Gemini API

1. Create a key in [Google AI Studio](https://aistudio.google.com/apikey) and configure the associated project/billing if required.
2. Choose **Gemini API**, paste the key, and use `gemini-3.5-flash` or another compatible model available to the project.

#### Grok API

1. Create an API key and configure credits in the [xAI Console](https://console.x.ai/).
2. Choose **Grok API**, paste the key, and use `grok-4.5` or another model available to the API team.

Select an extracted task and click **Analyze bug** after configuration. Judges can test every core workflow in **Offline demo** mode without an account, key, billing, local model installation, or network access.

## Supported platforms

| Platform | Release target | Validation |
|---|---|---|
| Windows 10/11 x64 | Portable ZIP and NSIS installer | Locally smoke-tested and CI-built |
| macOS 12+ Apple Silicon | Ad-hoc signed DMG | Native macOS CI build and package smoke check |
| macOS 12+ Intel | Ad-hoc signed DMG | Native macOS CI build and package smoke check |
| Linux x64 | AppImage and Debian package | Ubuntu 22.04 CI build and package smoke check |

The release workflow runs on native GitHub-hosted runners, so a local Mac or Linux machine is not required to produce these artifacts. The project does not claim manual hardware testing for macOS or Linux.

## Installation and development

### Windows

The portable ZIP requires Windows 10/11 x64 and Microsoft Edge WebView2. Extract it to a writable folder and run Cuttle.exe; no administrator access is required. The NSIS setup executable is also available when an installer is preferred. If Windows SmartScreen appears, choose More info, then Run anyway because the prototype is not code-signed.

### macOS

Use the DMG matching the Mac's processor: arm64 for Apple Silicon or x64 for Intel. Drag Cuttle to Applications and open it. The build is ad-hoc signed but not notarized; if macOS blocks it, open System Settings, Privacy & Security, Open Anyway, and then relaunch.

### Linux

The AppImage is the most portable option: make it executable with `chmod +x Cuttle-*.AppImage` and run it. Use the .deb package on Ubuntu or Debian. AppImage launch may require FUSE on older distributions; the .deb package is the fallback.

### Development setup

Requirements:

- Node.js 20+
- Rust stable with the MSVC toolchain on Windows
- Git
- Microsoft Edge WebView2 Runtime on Windows
- WebKitGTK 4.1 development packages on Linux

~~~powershell
npm ci
npm run desktop
~~~

Create an optimized native executable:

~~~powershell
npm run desktop:build
~~~

Use `npm run dev` only for React interface work in a browser; repository selection and real Git history require the Tauri desktop window.

## Hackathon submission

Recommended category: Dev Tools.

### Repository and judge packages

- Repository: https://github.com/ReReReverie/Cuttle
- Native downloads: https://github.com/ReReReverie/Cuttle/releases/latest
- Judge checklist: [release/JUDGE_TESTING.md](release/JUDGE_TESTING.md)
- Release targets: Windows x64, macOS Apple Silicon, macOS Intel, and Linux x64
- Validation: Windows is locally smoke-tested; macOS and Linux packages are built and smoke-checked by native CI runners, with no manual hardware-testing claim

### How Codex and GPT-5.6 Luna were used

Cuttle started as a Codex brainstorming project before becoming an implementation plan in the Patchtrail-OpenAI workspace. The early Codex conversations shaped the core idea: a developer helper that adapts to messy engineering situations by turning issue context into tasks, explaining likely bugs, generating reviewable patch/test guidance, and making Git recovery less risky.

ChatGPT/GPT-5.6 Luna was used in Max, High, and XHigh reasoning modes during development. Luna helped refine the product direction from the original web-dashboard concept into an actual native GUI application, then helped translate the plan into the Tauri + React + Rust implementation. Codex accelerated the build by implementing the desktop UI, Rust Git bridge, file-import path, AI-provider onboarding, offline demo mode, regression-test examples, judge package, and release documentation.

The main product and engineering decisions stayed deliberate throughout the Codex sessions: Cuttle works offline by default, advanced features sit behind focused buttons to keep the interface clean, suggested fixes are review-only unless the developer acts, Git recovery commands are copy-only, and credentials for optional AI providers are held in memory instead of being saved to disk.

Codex also supported the polish and submission work: resolving Windows desktop build issues, validating the frontend and Rust backend, building the native executable and portable ZIP, preparing judge testing notes, and documenting how OpenAI, local open-source, Gemini, and Grok providers can be tested.

Codex Session ID for /feedback: 019f75e1-7962-77c1-89ea-d76694d1d97d

### Developer Note

We'll be real honest, were sure the windows.exe will work, but we dont know if the others will as we do not own a macbook, or use linux