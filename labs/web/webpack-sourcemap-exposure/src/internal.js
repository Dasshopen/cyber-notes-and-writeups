// DEMO DATA ONLY — no real secret is stored here.
//
// Imagine that a developer left internal information like this
// inside a frontend application:
//
// Internal route used during development:
// /internal-preview
//
// Internal API path:
// /api/internal/status
//
// Fake development token:
// DEMO_TOKEN_NOT_A_REAL_SECRET
//
// If source maps are publicly exposed, comments and source code
// like this can be reconstructed by an end user.

export function getInternalMessage() {
  return "Internal demo module loaded";
}
