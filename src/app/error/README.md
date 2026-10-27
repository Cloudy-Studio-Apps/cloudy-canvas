# Error page

_How it works. The rules are in the root [CLAUDE.md](../../../CLAUDE.md)._

`RouteErrorPage` is the router's `errorElement`: every route sits under one pathless parent in
`router.tsx`, so whatever a page throws while rendering or loading ends up here instead of React
Router's default screen.

- **The page:** `AdriftSeal` (`shared/ui/brand/`), a title, and three ways out: reload the window,
  go back to Home, and copy the error.
- **Development builds** (`import.meta.env.DEV`) show `ErrorDetails`: the message and the stack,
  folded away, with the app's own frames (`isOwnFrame`: under `src/`, not `node_modules`) in bold,
  then the version and the route. "Copy error details" copies all of it.
- **Production builds** hide the stack and show `ErrorCodeBlock`: an error code like
  `CC-7F3A-91C2`, which "Copy error code" copies. `errorCode` hashes (FNV-1a) the message with the
  first frame of the app's own code (the first frame at all in a bundled build), so the same bug
  always gives the same code. The full error is still logged to the console under that code.
- `describeError` turns what was thrown (an `Error`, a route response such as a 404, anything
  else) into a message and frames, with the page's origin taken out of them.
