# demo-id

Standalone **HTML / CSS / JavaScript** Site that uses [`@engine9/id`](../id)
against **delegate** — no `@engine9/core`, no database.

This repository is [MIT licensed](./LICENSE). Use, copy, modify, and
distribute this code as-is.

Shows soft personalization for **Level 0** (Inferred) and **Level 1**
(Provided), plus a **declared role** (`activist`) with
`requiredAuth.minLevel: 1`. Content is customized, never hard-blocked.

## Run

1. Build the id IIFE (once, from sibling checkout):

   ```bash
   cd ../id && npm run build
   ```

2. Serve this folder over HTTP (file:// cannot open the identity popup reliably):

   ```bash
   npx --yes serve -p 4173 .
   ```

3. Open http://localhost:4173 and register that origin with delegate
   (`ALLOWED_RETURN_ORIGINS` or the domain table).

Optional config before `app.js`:

```html
<script>
  window.DEMO_ID = {
    delegateUrl: 'https://delegate.engine9.ai',
    domain: 'localhost:4173',
  };
</script>
```

## What it demonstrates

| Piece | Behavior |
| --- | --- |
| Level 0 | Identity request without Profile |
| Level 1 | Profile fields `given_name`, `family_name`, `email` |
| Declared role | Claim Activist locally; soft-show Content X when level ≥ 1 |
| Person form | `given_name` / `family_name` / `email` / `email_type` — local JSON echo |

Docs in `@engine9/id`:

- [deploy.md](../id/docs/deploy.md) — first-time steps
- [without-core.md](../id/docs/without-core.md)
- [declared-roles.md](../id/docs/declared-roles.md)
- [forms.md](../id/docs/forms.md)

Next step with a warehouse: the festival [`demo-festival`](../demo-festival) (segment roles +
`POST /api/people`).

## License

[MIT](./LICENSE). Use, copy, modify, and distribute this code as-is.
