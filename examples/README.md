# Cuttle example fixtures

The `examples/` directory contains deterministic, runnable TypeScript/Vitest mini-repositories for exercising Cuttle's context extraction, Bug Detective review, and patch-verification workflow. The fixtures are isolated from the production application: the root TypeScript build includes only `src/`, and fixture dependencies live in this directory.

There are two separate workflows:

- Cuttle can import the transcripts, inspect the source, and run Bug Detective without Node.js or fixture dependencies.
- Fixture execution (`typecheck`, reproduction tests, and fixed-reference tests) requires Node.js and `npm ci --prefix examples` first.

## Debugging vs. executing

Cuttle can import the transcripts, inspect the fixture files, and run Bug Detective without installing the fixture dependencies. Running the fixture code itself - TypeScript checks, reproduction tests, fixed-reference tests, or learner regression tests - requires Node.js and the isolated dependencies first:

```powershell
npm ci --prefix examples
npm run validate --prefix examples
```

The dependency installation affects fixture execution only; it does not affect Cuttle's production build or offline app usage.

## Fixture layout

Each fixture keeps its existing transcript and buggy learner entrypoint, then adds a fixed reference, supporting modules, tests, and a manifest:

```text
examples/<fixture>/
- package.json
- tsconfig.json
- fixture.json
- <ticket>.txt
- <buggy-entrypoint>.ts       # intentionally buggy learner target
- src/                          # surrounding adapters and domain modules
- fixed/                        # known-good behavioral reference
- tests/
  - reproduction.test.ts       # proves the checked-in bug exists
  - solution.test.ts           # passes against the fixed reference
  - regression.test.ts         # intended to pass after the learner patch
```

The fixtures are small production slices rather than single-function puzzles. They use in-memory adapters, deterministic responses, seeded data, and no network, database, credentials, wall-clock, or random-ID dependency.

## Buggy/fixed contract

The checked-in top-level source remains intentionally buggy. `test:baseline` proves the documented failure is present. `test:solution` runs the same behavioral expectations against `fixed/` and must pass. `regression` targets the buggy entrypoint and is expected to fail before the learner applies a fix and pass afterward.

`fixture.json` records the affected files, bug categories, behavioral invariants, and regression cases. It is an outcome oracle, not an exact-diff oracle; valid alternative fixes are allowed.

## Run fixture validation

From the repository root:

```powershell
npm ci --prefix examples
npm run validate --prefix examples
```

To inspect one fixture:

```powershell
npm run typecheck --prefix examples/checkout-reliability
npm run test:baseline --prefix examples/checkout-reliability
npm run test:solution --prefix examples/checkout-reliability
npm run regression --prefix examples/checkout-reliability
```

The final command is intentionally red on the unpatched baseline. Run it again after applying the reviewed fix.

## Use fixtures with Cuttle

1. Open the **Meeting & issue context** panel.
2. Import the fixture's transcript file.
3. Click **Extract tasks**; paths beginning with `examples/` resolve to the actual learner files.
4. Select a task and click **Analyze bug**.
5. Review the suggested patch and regression coverage.
6. Use a temporary copy of the fixture when applying and verifying a learner patch.

Cuttle itself still runs without Node.js, Rust, fixture dependencies, network access, API keys, or automatic fixture discovery. Installing dependencies is required only when executing the fixture validation commands; it is not required to debug or review the fixtures in Cuttle.

## Included scenarios

| Fixture | Production slice | Primary risks |
|---|---|---|
| Checkout reliability | HTTP checkout, coupons, payment adapter, retry state | Empty responses, numeric safety, duplicate submits |
| Todo list | Local task store and sync event replay | Stale actions, immutability, event ordering |
| Profile API | HTTP client, response mapper, session cache | 404/500 handling, malformed payloads, invalidation |
| Regional cart cache | Tenant-aware storefront cache | Region isolation, concurrency, failed loads |
| Payment idempotency | Account-scoped payment worker and ledger | Tenant isolation, retries, concurrent charges |

The release workflow copies the canonical `examples/` source into portable packages but excludes generated dependency directories. The legacy packaged snapshot is not the source of truth.