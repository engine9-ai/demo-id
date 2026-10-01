/**
 * Soft content-gate demo using @engine9/id (IIFE → window.engine9Id).
 *
 * Three ways to gate content, all soft (never hard-blocked):
 *   1. HTML attributes (`data-e9-min-level`, `data-e9-max-level`, `data-e9-login`,
 *      `data-e9-field`, …) handled by `engine9Id.mount()` — see index.html.
 *   2. `id.gate({ minLevel, onAllow, onBlock })` hooks — the article blur below.
 *   3. Declared roles (`visibleContent`) when a page-local claim is involved.
 */

const cfg = window.DEMO_ID || {};
const {
  mount,
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

function el(sel) {
  return document.querySelector(sel);
}

function setText(sel, text) {
  const node = el(sel);
  if (node) node.textContent = text;
}

function showError(err) {
  console.error(err);
  const code = err?.code || err?.message || String(err);
  setText('#level-meaning', `Login did not finish: ${code}`);
}

// 1. One call: create the client, finish a returning login, bind data-e9-* markup.
const id = mount({
  delegateUrl: cfg.delegateUrl,
  domain: cfg.domain,
  storage: 'session',
  onError: showError,
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

// 2. JavaScript hook: blur the story container while blocked, in addition to
//    the hidden/shown paragraphs the attributes manage.
id.gate({
  minLevel: 1,
  onAllow: () => el('[data-section="story"]')?.classList.remove('locked'),
  onBlock: () => el('[data-section="story"]')?.classList.add('locked'),
});

/** Short label for the debug panel: which data-e9-* rule an element carries. */
function gateLabel(node) {
  const section = node.getAttribute('data-section');
  const parts = [];
  if (node.hasAttribute('data-e9-login')) parts.push(`login≥${node.getAttribute('data-e9-login') || '1'}`);
  if (node.hasAttribute('data-e9-logout')) parts.push('logout');
  if (node.hasAttribute('data-e9-change-delegate')) parts.push('change-delegate');
  if (node.hasAttribute('data-e9-min-level')) parts.push(`min=${node.getAttribute('data-e9-min-level')}`);
  if (node.hasAttribute('data-e9-max-level')) parts.push(`max=${node.getAttribute('data-e9-max-level')}`);
  if (node.hasAttribute('data-e9-two-factor')) parts.push('2fa');
  const rule = parts.join(',') || 'none';
  const text = (node.textContent || '').trim().replace(/\s+/g, ' ').slice(0, 24);
  return `${section || node.tagName.toLowerCase()} [${rule}] ${text ? `"${text}"` : ''}`.trim();
}

// 3. Declared role + status panel + debug: anything the attributes cannot express.
function render() {
  const identity = id.getIdentity();
  const level = identity?.level ?? 0;
  const desc = describeLevel(level);
  const claims = readClaims();

  el('#out-unid').innerHTML = identity?.sub
    ? `<code>${identity.sub}</code>`
    : '<code>—</code>';

  const shared = identity?.fields;
  if (shared) {
    const bits = [
      shared.given_name,
      shared.family_name,
      shared.email,
      shared.display_name,
    ].filter(Boolean);
    setText('#out-fields', bits.join(' · ') || '(no fields shared)');
  } else {
    setText('#out-fields', 'none');
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

  const gates = {};
  for (const node of document.querySelectorAll('[data-e9-state]')) {
    gates[gateLabel(node)] = node.getAttribute('data-e9-state');
  }

  el('#debug-eval').textContent = JSON.stringify(
    {
      level,
      claims,
      declaredRoles: evaluations,
      dataE9Gates: gates,
      note: 'All gates are soft. visible = matches && meetsAuth for declared roles.',
    },
    null,
    2,
  );
}

async function boot() {
  id.onChange(render);
  await id.ready;
  render();

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

      // Optionally step up identity using shared fields (not email_type).
      const fields = identityFieldsFromPersonPayload(payload);
      if (fields.length && id.level < 1) {
        try {
          await id.requestIdentity({ minLevel: 1, mode: 'popup', fields });
        } catch (err) {
          showError(err);
        }
      }
      render();
    },
  });

  // Helpful for console experimentation
  window.idDemo = { id, roles, normalizePersonPayload, render };
}

boot().catch(showError);
