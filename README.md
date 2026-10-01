# demo-id

Standalone **HTML / CSS / JavaScript** Site that uses [`@engine9/id`](../id)
against **delegate** — no `@engine9/core`, no database, no server code.

This repository is [MIT licensed](./LICENSE). Use, copy, modify, and
distribute this code as-is.

It shows the three ways `@engine9/id` gates content in the browser, all soft
(the markup is still in the page; the library only hides and shows it):

1. **HTML attributes** — `data-e9-login`, `data-e9-logout`,
   `data-e9-change-delegate`, `data-e9-min-level`,
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
| Level 0 button | `data-e9-login="0"`: UNID only. No `fields` and no `optional_fields` |
| Level 1 button | Required `given_name`, `family_name`, `email` (`data-e9-fields`). Optional `display_name` (`data-e9-optional-fields`) |
| Change your Delegate information | `data-e9-change-delegate` with the Level 1 field lists. Shown only when signed in. Reopens the share page (`prompt=select`) to pick another email address, add one, or switch Google accounts |
| Article login | Required `given_name` and `email` |
| Confirm email | Level 2 with required `email` |
| Soft paywall | Teaser `data-e9-max-level="0"`, body `data-e9-min-level="1" hidden` |
| Comments | `data-e9-login="2"` and a `data-e9-min-level="2"` block (confirmed email) |
| Greeting | `data-e9-field="given_name"`, `data-e9-level`, `data-e9-level="name"` |
| Blur | `id.gate()` toggles a `.locked` class on the article |
| Declared role | Claim Activist locally; soft-show Content X when level ≥ 1 |
| Person form | `given_name` / `family_name` / `email` / `email_type` — local JSON echo |
| Debug panel | `data-e9-state` (`allowed` / `blocked`) for every gated element |

## Requested fields

`data-e9-fields` is the required list. Those names are locked on
delegate’s share page, and each one needs a value before the Level is
met. `data-e9-optional-fields` are checkboxes; declining one does not
bring the share page back on a later visit. A Level 0 login sends
neither list.

Shareable names are `display_name`, `given_name`, `family_name`,
`email`, `phone`, and `attributes`. When a login omits both lists,
delegate requires `display_name` and `email`. `email_type` is a site
people field on the form; it is not sent as a delegate share field.

`prompt=select` (“Change your Delegate information”) opens the share page
even when the Grant already covers the request. A signed-in visitor who
shared the wrong address uses it to pick another one; logging in again
would go straight through with the remembered choice.

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
