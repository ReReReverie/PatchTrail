# Cuttle release artifacts

Native binaries are published through the latest GitHub Release (https://github.com/ReReReverie/Cuttle/releases/latest). The release workflow builds Windows x64, macOS Apple Silicon, macOS Intel, and Linux x64 packages on native hosted runners.

The existing Cuttle-windows-x64.zip is retained as a legacy fallback. New submissions should link to the GitHub Release and JUDGE_TESTING.md.

## Included example fixtures

Portable releases include the canonical `examples/` source, transcripts, manifests, and tests for inspection and Cuttle context import. You can debug and review the fixtures in Cuttle immediately; executing their TypeScript/Vitest validation requires Node.js and `npm ci --prefix examples` after extraction. Fixture execution is optional and separate from launching Cuttle or using its offline demo.
