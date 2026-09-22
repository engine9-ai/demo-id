/**
 * Soft Level 0 / Level 1 demo using @engine9/id (IIFE → window.engine9Id).
 * Declared roles are page-local; content is never hard-blocked.
 */

const cfg = window.DEMO_ID || {};
const {
  createEngine9Id,
  describeLevel,
  createRoleRegistry,
  visibleContent,
  createPersonForm,
  normalizePersonPayload,
  identityFieldsFromPersonPayload,
} = window.engine9Id;

const CLAIM_KEY = 'demo_id_claimed_roles';

const roles = createRoleRegistry({
  activist: {
    id: 'activist',
    name: 'Activist',
    requiredAuth: { minLevel: 1 },
  },
});

const id = createEngine9Id({
  delegateUrl: cfg.delegateUrl,
  domain: cfg.domain,
  storage: 'session',
});

function readClaims() {
  try {
    const raw = localStorage.getItem(CLAIM_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed.map(String) : [];
  } catch {
    return [];
  }
}

function writeClaims(ids) {
  localStorage.setItem(CLAIM_KEY, JSON.stringify([...new Set(ids)]));
}

function el(sel) {
  return document.querySelector(sel);
}

function setText(sel, text) {
  const node = el(sel);
  if (node) node.textContent = text;
}

function render() {
  const identity = id.getIdentity();
  const level = identity?.level ?? 0;
  const desc = describeLevel(level);
  const claims = readClaims();

  setText('#out-level', `${level} · ${desc.name}`);
  el('#out-unid').innerHTML = identity?.unid
    ? `<code>${identity.unid}</code>`
    : '<code>—</code>';

  const profile = identity?.profile;
  if (profile) {
    const bits = [
      profile.given_name,
      profile.family_name,
      profile.email,
      profile.display_name,
    ].filter(Boolean);
    setText('#out-profile', bits.join(' · ') || profile.id);
  } else {
    setText('#out-profile', 'none');
  }

  setText('#out-claims', claims.length ? claims.join(', ') : 'none');
  setText('#level-meaning', desc.meaning);

  const claimBox = el('#claim-activist');
  if (claimBox) claimBox.checked = claims.includes('activist');

  const evaluations = visibleContent(roles, {
    identity,
    claimedIds: claims,
  });

  const activistSection = el('[data-section="activist"]');
  if (activistSection) {
    const show = evaluations.activist?.visible === true;
    activistSection.hidden = !show;
    activistSection.classList.toggle('hidden', !show);
  }

  el('#debug-eval').textContent = JSON.stringify(
    {
      level,
      claims,
      evaluations,
      note: 'visible = matches && meetsAuth — soft only',
    },
    null,
    2,
  );
}

async function boot() {
  await id.handleCallback();
  render();
  id.onChange(() => render());

  el('#btn-level0')?.addEventListener('click', async () => {
    try {
      await id.requestIdentity({ minLevel: 0, mode: 'popup' });
      render();
    } catch (err) {
      console.error(err);
      alert(err?.message || String(err));
    }
  });

  el('#btn-level1')?.addEventListener('click', async () => {
    try {
      await id.requestIdentity({
        minLevel: 1,
        mode: 'popup',
        fields: ['given_name', 'family_name', 'email', 'display_name'],
      });
      render();
    } catch (err) {
      console.error(err);
      alert(err?.message || String(err));
    }
  });

  el('#btn-logout')?.addEventListener('click', () => {
    id.logout();
    render();
  });

  el('#claim-activist')?.addEventListener('change', (event) => {
    const checked = event.target.checked;
    const next = new Set(readClaims());
    if (checked) next.add('activist');
    else next.delete('activist');
    writeClaims([...next]);
    render();
  });

  createPersonForm({
    mount: '#person-form-mount',
    fields: ['given_name', 'family_name', 'email', 'email_type'],
    source_code: 'DEMO_ID_FORM',
    onSubmit: async (payload) => {
      const echo = el('#form-echo');
      echo.hidden = false;
      echo.textContent = JSON.stringify(
        {
          people: [payload],
          identityFields: identityFieldsFromPersonPayload(payload),
          note: 'Same shape as core POST /people — echoed locally in demo-id',
        },
        null,
        2,
      );

      // Optionally step up identity using Profile fields (not email_type).
      const fields = identityFieldsFromPersonPayload(payload);
      if (fields.length && (!id.getIdentity() || id.level < 1)) {
        try {
          await id.requestIdentity({
            minLevel: 1,
            mode: 'popup',
            fields,
          });
        } catch (err) {
          console.warn('identity step-up skipped', err);
        }
      }
      render();
    },
  });

  // Helpful for console experimentation
  window.idDemo = { id, roles, normalizePersonPayload, render };
}

boot().catch((err) => {
  console.error(err);
  el('#level-meaning').textContent = err?.message || String(err);
});
