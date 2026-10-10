/**
 * Default @engine9/id demo: loginWidget() with Guest (default) and Admin roles.
 *
 * Soft gates only (never hard-blocked):
 *   1. HTML attributes (`data-e9-min-level`, `data-e9-login`, …) via mount()
 *   2. id.gate() blur on the article while below Level 1
 *   3. Declared roles via visibleContent (Guest always, Admin when claimed)
 */

const cfg = window.DEMO_ID || {};
const {
  mount,
  loginWidget,
  describeLevel,
  createRoleRegistry,
  visibleContent,
} = window.engine9Id;

const ROLE_KEY = 'demo_id_role';
const DEFAULT_ROLE = 'guest';

const roles = createRoleRegistry({
  guest: {
    id: 'guest',
    name: 'Guest',
  },
  admin: {
    id: 'admin',
    name: 'Admin',
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

function readRole() {
  try {
    const raw = localStorage.getItem(ROLE_KEY);
    if (raw && roles[raw]) return raw;
  } catch {
    /* ignore */
  }
  return DEFAULT_ROLE;
}

function writeRole(roleId) {
  const next = roles[roleId] ? roleId : DEFAULT_ROLE;
  localStorage.setItem(ROLE_KEY, next);
  return next;
}

const id = mount({
  delegateUrl: cfg.delegateUrl,
  domain: cfg.domain,
  storage: 'session',
  onError: showError,
});

const widget = loginWidget({
  id,
  delegateUrl: cfg.delegateUrl,
  siteName: 'demo-id',
  fields: ['given_name', 'family_name', 'email'],
  optionalFields: ['display_name'],
  roles,
  role: readRole(),
  onRoleChange: (roleId) => {
    writeRole(roleId || DEFAULT_ROLE);
    render();
  },
  onLogout: () => writeRole(DEFAULT_ROLE),
  onError: showError,
});

id.gate({
  minLevel: 1,
  onAllow: () => el('[data-section="story"]')?.classList.remove('locked'),
  onBlock: () => el('[data-section="story"]')?.classList.add('locked'),
});

function gateLabel(node) {
  const section = node.getAttribute('data-section');
  const parts = [];
  if (node.hasAttribute('data-e9-login')) parts.push(`login≥${node.getAttribute('data-e9-login') || '1'}`);
  if (node.hasAttribute('data-e9-min-level')) parts.push(`min=${node.getAttribute('data-e9-min-level')}`);
  if (node.hasAttribute('data-e9-max-level')) parts.push(`max=${node.getAttribute('data-e9-max-level')}`);
  const rule = parts.join(',') || 'none';
  const text = (node.textContent || '').trim().replace(/\s+/g, ' ').slice(0, 24);
  return `${section || node.tagName.toLowerCase()} [${rule}] ${text ? `"${text}"` : ''}`.trim();
}

function render() {
  const identity = id.getIdentity();
  const level = identity?.level ?? 0;
  const desc = describeLevel(level);
  const roleId = readRole();

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

  setText('#out-role', roles[roleId]?.name ?? 'Guest');
  setText('#level-meaning', desc.meaning);

  // Guest is the default: always "claimed" for soft visibility. Admin only when chosen.
  const claimedIds = roleId === 'admin' ? ['admin', 'guest'] : ['guest'];
  const evaluations = visibleContent(roles, { identity, claimedIds });

  const adminSection = el('[data-section="admin"]');
  if (adminSection) {
    const show = evaluations.admin?.visible === true;
    adminSection.hidden = !show;
    adminSection.classList.toggle('hidden', !show);
  }

  const gates = {};
  for (const node of document.querySelectorAll('[data-e9-state]')) {
    gates[gateLabel(node)] = node.getAttribute('data-e9-state');
  }

  el('#debug-eval').textContent = JSON.stringify(
    {
      level,
      role: roleId,
      declaredRoles: evaluations,
      dataE9Gates: gates,
      note: 'Guest is default. Admin visible = claimed && Level ≥ 1. Soft only.',
    },
    null,
    2,
  );
}

async function boot() {
  id.onChange(render);
  await id.ready;
  // Keep widget role in sync with stored default (Guest).
  widget.update({ role: readRole() });
  render();
  window.idDemo = { id, widget, roles, render };
}

boot().catch(showError);
