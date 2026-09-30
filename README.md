# demo-id

Standalone **HTML / CSS / JavaScript** Site that uses [`@engine9/id`](../id)
against **delegate** — no `@engine9/core`, no database, no server code.

This repository is [MIT licensed](./LICENSE). Use, copy, modify, and
distribute this code as-is.

It shows the three ways `@engine9/id` gates content in the browser, all soft
(the markup is still in the page; the library only hides and shows it):

1. **HTML attributes** — `data-e9-login`, `data-e9-logout`, `data-e9-min-level`,
   `data-e9-max-level`, `data-e9-field`, `data-e9-level`, handled by
   `engine9Id.mount()`. See the article with a soft paywall in
   [index.html](./index.html).
2. **JavaScript hooks** — `id.gate({ minLevel, onAllow, onBlock })` blurs the
   story while the visitor is below Level 1 ([app.js](./app.js)).
3. **Declared roles** — the `activist` role combines a page-local claim with
   `requiredAuth.minLevel: 1` via `visibleContent`.

Plus a Level 1 person form with `@engine9/interfaces` field names.

## Run

1. Build the id IIFE (once, from the sibling checkout):

   ```bash
   cd ../id && npm run build
   ```

2. Serve the **parent** folder over HTTP so `../id/dist/id.iife.js` resolves
   (`file://` cannot open the identity popup):

   ```bash
   npm start          # serves .. on http://localhost:3002
   ```

3. Open http://localhost:3002/demo-id/. `localhost:3002` is already allowed on
   the public delegate, so no registration is needed. Any other port or host
   must be registered with delegate first (see the
   [id README](../id/README.md#1-register-your-website-with-delegate)).

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
| Level 0 button | `data-e9-login="0"`: UNID only, no fields |
| Level 1 button | `data-e9-login` with `data-e9-fields`: share name and email |
| Choose fields again | `data-e9-prompt="select"` shows the field form; shown only at Level 1+ via an explicit `data-e9-min-level` |
| Soft paywall | Teaser `data-e9-max-level="0"`, body `data-e9-min-level="1" hidden` |
| Comments | `data-e9-login="2"` and a `data-e9-min-level="2"` block (confirmed email) |
| Greeting | `data-e9-field="given_name"`, `data-e9-level`, `data-e9-level="name"` |
| Blur | `id.gate()` toggles a `.locked` class on the article |
| Declared role | Claim Activist locally; soft-show Content X when level ≥ 1 |
| Person form | `given_name` / `family_name` / `email` / `email_type` — local JSON echo |
| Debug panel | `data-e9-state` (`allowed` / `blocked`) for every gated element |

Docs in `@engine9/id`:

- [README](../id/README.md) — install, attribute table, hooks, troubleshooting
- [deploy.md](../id/docs/deploy.md) — first-time steps
- [without-core.md](../id/docs/without-core.md)
- [declared-roles.md](../id/docs/declared-roles.md)
- [forms.md](../id/docs/forms.md)

Next step with a warehouse: the festival [`demo-festival`](../demo-festival) (segment roles +
`POST /api/people`).

## License

[MIT](./LICENSE). Use, copy, modify, and distribute this code as-is.
