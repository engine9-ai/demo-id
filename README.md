# demo-id

Standalone **HTML / CSS / JavaScript** Site that uses [`@engine9/id`](../id)
against **delegate** — no `@engine9/core`, no database, no server code.

This repository is [MIT licensed](./LICENSE). Use, copy, modify, and
distribute this code as-is.

It shows the **default** way to add Delegate to a site:

1. **`loginWidget()`** in the header — one Login button whose dialog logs in
   with Google, switches email, changes role, and logs out.
2. **Declared roles** — **Guest** (default) and **Admin** (Level 1+), claimed
   in that dialog.
3. Soft content gates (`data-e9-*` attributes and `visibleContent`).

## Run

1. From this directory:

   ```bash
   npm start          # builds @engine9/id, copies the IIFE, serves this folder
   ```

2. Open **http://localhost:3002/** (not the parent `engine9/` tree).
   `localhost:3002` is already allowed on the public delegate.

Optional config before `app.js`:

```html
<script>
  window.DEMO_ID = {
    delegateUrl: 'https://delegate.engine9.ai',
    domain: 'localhost:3002',
  };
</script>
```

## What it demonstrates

| Piece | Behavior |
| --- | --- |
| Login widget (header) | `engine9Id.loginWidget()` — email + role pill, or "Login" |
| Guest (default) | Declared role with no `requiredAuth`; everyone starts here |
| Admin | Declared role with `requiredAuth.minLevel: 1`; claim from the dialog |
| Soft paywall | Teaser `data-e9-max-level="0"`, body `data-e9-min-level="1"` |
| Admin briefing | Soft-shown via `visibleContent` when Admin is claimed and Level ≥ 1 |

Roles are **soft** (page-local). Hard Admin gates need
[`@engine9/core`](../core) + `person_segment` — see
[`demo-festival`](../demo-festival).

Docs in `@engine9/id`:

- [README](../id/README.md) — install, [the login widget](../id/README.md#the-login-widget)
- [deploy.md](../id/docs/deploy.md)
- [declared-roles.md](../id/docs/declared-roles.md)
- [without-core.md](../id/docs/without-core.md)

## License

[MIT](./LICENSE). Use, copy, modify, and distribute this code as-is.
